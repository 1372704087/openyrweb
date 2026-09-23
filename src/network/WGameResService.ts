/**
 * WGameResService — 向 GameRes HTTP 端点 POST 战报数据包。
 *
 * 由 network/WGameResService.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - setUrl/getUrl 存取服务端根路径。
 * - sendGameResPacket(packet, cancelToken?)：
 *   未设 URL 抛 "No WGameRes URL is set"；无凭据抛 "Missing WOL credentials"；
 *   POST {url}/{sku}，body 为 uint8ArrayToBase64String(packet)，
 *   headers.authorization = Base64(JSON {nick,pass})。
 * - 依赖 WolService.getCredentials / WolConfig.getClientSku。
 */

import { HttpRequest } from "network/HttpRequest"; // 已转换
import { Base64 } from "util/Base64"; // 已转换
import { uint8ArrayToBase64String } from "util/string"; // 已转换
import type { WolService } from "network/WolService"; // 已转换
import type { WolConfig } from "network/WolConfig"; // 已转换

/** GameRes 战报上传服务。 */
export class WGameResService {
  /** 所属 WolService（取凭据）。 */
  wolService: WolService;
  /** 所属 WolConfig（取 SKU）。 */
  wolConfig: WolConfig;
  /** 服务端根 URL（未设时 send 抛错）。 */
  url: string | undefined;

  constructor(wolService: WolService, wolConfig: WolConfig) {
    this.wolService = wolService;
    this.wolConfig = wolConfig;
  }

  /** 设置上传根 URL。 */
  setUrl(url: string): void {
    this.url = url;
  }

  /** 读取当前上传根 URL。 */
  getUrl(): string | undefined {
    return this.url;
  }

  /** POST 一包 Base64 编码的战报数据。 */
  async sendGameResPacket(packet: Uint8Array, cancelToken?: unknown): Promise<void> {
    if (!this.url) throw new Error("No WGameRes URL is set");
    const sku = this.wolConfig.getClientSku();
    const credentials = this.wolService.getCredentials();
    if (!credentials) throw new Error("Missing WOL credentials");
    await new HttpRequest().fetchRaw(`${this.url}/${sku}`, cancelToken as never, {
      method: "POST",
      body: uint8ArrayToBase64String(packet),
      headers: {
        authorization: Base64.encode(JSON.stringify({ nick: credentials.user, pass: credentials.pass })),
      },
    });
  }
}
