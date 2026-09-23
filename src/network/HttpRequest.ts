/**
 * HttpRequest — 基于 fetch 的 HTTP 请求封装（文本/二进制/JSON），支持取消与进度。
 *
 * 由 network/HttpRequest.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 取消（Abort）统一包装为 OperationCanceledError（@puzzl/core）。
 * - 非 2xx、text/html MIME（未显式允许）抛 DownloadError。
 * - fetchHtml 等价于 fetchText + allowHtmlMimeType。
 */

import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 孪生

/** 请求载荷类型。 */
export type HttpPayloadType = "text" | "binary" | "json";

/** fetchAndParse 的选项。 */
export interface FetchRequestOptions {
  /** 请求 URL。 */
  url: string;
  /** 期望载荷类型。 */
  type: HttpPayloadType;
}

/** 可选的取消令牌最小接口（对应 @puzzl/core CancellationToken）。 */
export interface CancelTokenLike {
  /** 注册取消回调。 */
  register(callback: () => void): void;
  /** 是否已取消。 */
  isCancelled?(): boolean;
}

/** 单次请求的附加配置。 */
export interface FetchInit {
  /** 请求体。 */
  body?: BodyInit;
  /** HTTP 方法。 */
  method?: string;
  /** 请求头。 */
  headers?: HeadersInit;
  /** 是否允许 text/html MIME（fetchHtml 会置 true）。 */
  allowHtmlMimeType?: boolean;
  /** 下载进度回调（已读字节数, 预期总字节数）。 */
  onProgress?: (loaded: number, total: number) => void;
}

/** HTTP 下载失败错误（含可选状态码）。 */
export class DownloadError extends Error {
  /** HTTP 状态码（网络层失败时为 undefined）。 */
  statusCode?: number;

  constructor(message: string, options?: { cause?: unknown }, statusCode?: number) {
    super(message);
    if (options && "cause" in options) {
      (this as { cause?: unknown }).cause = options.cause;
    }
    this.statusCode = statusCode;
  }
}

/** HTTP 请求封装。 */
export class HttpRequest {
  /**
   * 拉取文本。
   * @param url URL。
   * @param cancelToken 可选取消令牌。
   * @param init 可选请求配置。
   */
  async fetchText(url: string, cancelToken?: CancelTokenLike, init?: FetchInit): Promise<string> {
    return (await this.fetchAndParse({ url, type: "text" }, cancelToken, init)) as string;
  }

  /**
   * 拉取二进制。
   * @param url URL。
   * @param cancelToken 可选取消令牌。
   * @param init 可选请求配置。
   */
  async fetchBinary(url: string, cancelToken?: CancelTokenLike, init?: FetchInit): Promise<Uint8Array> {
    return (await this.fetchAndParse({ url, type: "binary" }, cancelToken, init)) as Uint8Array;
  }

  /**
   * 拉取并解析 JSON。
   * @param url URL。
   * @param cancelToken 可选取消令牌。
   * @param init 可选请求配置。
   */
  async fetchJson<T = unknown>(url: string, cancelToken?: CancelTokenLike, init?: FetchInit): Promise<T> {
    return await this.fetchAndParse({ url, type: "json" }, cancelToken, init) as T;
  }

  /**
   * 拉取 HTML 文本（显式允许 text/html MIME）。
   * @param url URL。
   * @param cancelToken 可选取消令牌。
   * @param init 可选请求配置。
   */
  async fetchHtml(url: string, cancelToken?: CancelTokenLike, init?: FetchInit): Promise<string> {
    return (await this.fetchAndParse({ url, type: "text" }, cancelToken, {
      ...init,
      allowHtmlMimeType: true,
    })) as string;
  }

  /**
   * 拉取原始字节后按 type 解析。
   * @param request URL + 载荷类型。
   * @param cancelToken 可选取消令牌。
   * @param init 可选请求配置。
   */
  private async fetchAndParse(
    request: FetchRequestOptions,
    cancelToken?: CancelTokenLike,
    init?: FetchInit,
  ): Promise<unknown> {
    const raw = await this.fetchRaw(request.url, cancelToken, init);
    return this.parseResult(request.type, raw);
  }

  /**
   * 执行 fetch 并读完整响应体为 Uint8Array。
   * @param url URL。
   * @param cancelToken 可选取消令牌。
   * @param init 可选请求配置。
   */
  async fetchRaw(url: string, cancelToken?: CancelTokenLike, init?: FetchInit): Promise<Uint8Array> {
    const controller = new AbortController();
    cancelToken?.register(() => {
      try {
        controller.abort();
      } catch {
        /* ignore */
      }
    });

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        body: init?.body,
        method: init?.method,
        headers: init?.headers,
      });
    } catch (err) {
      const e = err as Error;
      if (
        controller.signal.aborted ||
        e.name === "AbortError" ||
        (e instanceof DOMException && e.code === DOMException.ABORT_ERR)
      ) {
        throw new OperationCanceledError(cancelToken as never);
      }
      console.error(e);
      throw new DownloadError(`Fetch failed with error: ${e.name}:` + e.message);
    }

    if (!response.ok) {
      throw new DownloadError(`Fetch failed with status ${response.status}: ${response.statusText}`, undefined, response.status);
    }

    if (response.headers.get("Content-Type") === "text/html" && !init?.allowHtmlMimeType) {
      throw new DownloadError(
        `Fetch failed with invalid mime type "text/html" (HTTP status ${response.status})`,
      );
    }

    const reader = response.body!.getReader();
    let loaded = 0;
    const chunks: Uint8Array[] = [];
    const total = response.headers.get("Content-Encoding")
      ? undefined
      : Number(response.headers.get("Content-Length") || 0);

    for (;;) {
      try {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        init?.onProgress?.(value.length, total);
      } catch (err) {
        const e = err as Error;
        if (e.name === "AbortError") {
          throw new OperationCanceledError(cancelToken as never);
        }
        console.error(e);
        throw new DownloadError(e.message);
      }
    }

    const bytes = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes;
  }

  /**
   * 按载荷类型解析原始字节。
   * @param type 载荷类型。
   * @param raw 原始字节。
   */
  private parseResult(type: HttpPayloadType, raw: Uint8Array): unknown {
    if (type === "binary") return raw;
    const text = new TextDecoder("utf-8").decode(raw);
    if (type === "json") return JSON.parse(text);
    return text;
  }
}
