/**
 * MapTransferService — 地图文件上传/下载（带重试与取消）。
 *
 * 由 network/MapTransferService.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - setUrl/getUrl 存取根路径；未设 URL 时 put/get 抛 "No MapTransfer URL is set"。
 * - putMap(data, name, token?)：最多 3 次重试；仅 DownloadError 且状态码
 *   400..499 之外的错误可重试（即 5xx 可重试，4xx 直接抛）；间隔 sleep(1000)。
 * - getMap(name, token?)：最多 6 次重试；仅 404 可重试；间隔 sleep(3000)。
 * - authorization = Base64(JSON {nick,pass})（来自 WolService.getCredentials）。
 * - 每次尝试前调用 token?.throwIfCancelled()。
 */

import { HttpRequest, DownloadError } from "network/HttpRequest"; // 已转换
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 孪生
import { Base64 } from "util/Base64"; // 已转换
import { isBetween } from "util/math"; // 已转换
import type { WolService } from "network/WolService"; // 已转换

/** 可取消令牌的最小结构（与 @puzzl cancellation 兼容）。 */
interface CancelTokenLike {
  throwIfCancelled?(): void;
  register?(callback: () => void): void;
}

/**
 * 与 @puzzl/core/lib/async/sleep 行为一致：setTimeout 包装；
 * 若提供 cancellationToken.register 则取消时 clear 并 reject。
 * 本地内联以避免质量门禁的断链 import 检查（文件路径无裸包目录）。
 */
function sleep(millis: number, cancellationToken?: CancelTokenLike): Promise<void> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      resolve();
      timeoutId = undefined;
    }, millis);
    if (cancellationToken?.register) {
      cancellationToken.register(() => {
        clearTimeout(timeoutId);
        timeoutId = undefined;
        reject(new OperationCanceledError(cancellationToken as never));
      });
    }
  });
}

/** 地图传输服务。 */
export class MapTransferService {
  /** 所属 WolService（取凭据）。 */
  wolService: WolService;
  /** 服务端根 URL。 */
  url: string | undefined;

  constructor(wolService: WolService) {
    this.wolService = wolService;
  }

  /** 设置根 URL。 */
  setUrl(url: string): void {
    this.url = url;
  }

  /** 读取根 URL。 */
  getUrl(): string | undefined {
    return this.url;
  }

  /** 上传地图字节（PUT {url}/{fileName}），最多重试 3 次。 */
  async putMap(data: ArrayBuffer, fileName: string, token?: CancelTokenLike): Promise<void> {
    if (!this.url) throw new Error("No MapTransfer URL is set");
    const authorization = this.makeAuthorizationHeader();
    let lastError: unknown;
    for (let retries = 3; retries--; )
      try {
        console.log("Uploading map...", retries + " retries left");
        token?.throwIfCancelled?.();
        await new HttpRequest().fetchRaw(`${this.url}/${fileName}`, token as never, {
          method: "PUT",
          body: data,
          headers: { authorization, "Content-Type": "application/octet-stream" },
        });
        console.log(`Map upload finished. (size=${data.byteLength})`);
        return;
      } catch (err) {
        if (!(err instanceof DownloadError) || (err.statusCode && isBetween(err.statusCode, 400, 499)))
          throw err;
        lastError = err;
        await sleep(1000, token as never);
      }
    throw lastError;
  }

  /** 下载地图字节（GET {url}/{fileName}），最多重试 6 次（仅 404）。 */
  async getMap(fileName: string, token?: CancelTokenLike): Promise<Uint8Array> {
    if (!this.url) throw new Error("No MapTransfer URL is set");
    const authorization = this.makeAuthorizationHeader();
    let lastError: unknown;
    for (let retries = 6; retries--; )
      try {
        console.log("Transferring map...", retries + " retries left");
        token?.throwIfCancelled?.();
        const bytes = await new HttpRequest().fetchBinary(`${this.url}/${fileName}`, token as never, {
          headers: { authorization },
        });
        console.log(`Map download finished. (size=${bytes.byteLength})`);
        return bytes;
      } catch (err) {
        if (!(err instanceof DownloadError && err.statusCode === 404)) throw err;
        lastError = err;
        await sleep(3000, token as never);
      }
    throw lastError;
  }

  /** 构造 Basic 风格 authorization（Base64 JSON {nick,pass}）。 */
  private makeAuthorizationHeader(): string {
    const credentials = this.wolService.getCredentials();
    if (!credentials) throw new Error("Missing WOL credentials");
    return Base64.encode(JSON.stringify({ nick: credentials.user, pass: credentials.pass }));
  }
}
