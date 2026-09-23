/**
 * ResourceLoader — 资源 URL 拼装、预取与批量加载（含进度回调）。
 *
 * 由 engine/ResourceLoader.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as CancellationModule from "@puzzl/core/lib/async/cancellation"; // 孪生
import { HttpRequest, DownloadError } from "network/HttpRequest"; // 已转换
import * as resourceConfigsModule from "engine/resourceConfigs"; // 已转换

const OperationCanceledError = (CancellationModule as any).OperationCanceledError as any;
const { resourceConfigs, ResourceType } = resourceConfigsModule as any;

// 孪生 re-export：SystemJS 曾把 DownloadError 再导出到本模块
export { DownloadError };

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 取消令牌最小形状（register 注册清理回调）。 */
export interface CancelTokenLike {
  register(fn: () => void): void;
}

/** 进度回调：0-100 整数百分比。 */
export type ProgressCallback = (percent: number) => void;

/** 进度/取消选项（fetch 细节）。 */
export interface LoadOptions {
  onProgress?: (delta: number) => void;
}

/** 资源描述（对象形态，buildResourceManifest 直接透传）。 */
export interface ResourceDescriptor {
  id?: string;
  src: string;
  type: "text" | "binary" | "json";
  sizeHint?: number;
}

/** 资源类型枚举或完整描述对象。 */
export type ResourceInput = number | ResourceDescriptor | object;

/**
 * 资源加载器。
 */
export class ResourceLoader {
  /** 资源基础 URL（前缀） */
  resourceBaseUrl: string;
  /** HTTP 请求客户端 */
  httpRequest: any;

  constructor(resourceBaseUrl: string) {
    this.resourceBaseUrl = resourceBaseUrl;
    this.httpRequest = new (HttpRequest as any)();
  }

  /**
   * 用 <link rel="prefetch"> 预取资源。
   * @param e - 资源类型或描述
   * @param i - 可选取消令牌
   */
  async prefetchResource(e: ResourceInput, i?: CancelTokenLike): Promise<void> {
    const r = this.getResourceUrl(e);
    const s = document.createElement("link");
    s.rel = "prefetch";
    s.as = "fetch";
    s.href = r;
    s.crossOrigin = "anonymous";
    await new Promise<void>((e2, t) => {
      i?.register(() => {
        if (s.parentNode) {
          document.head.removeChild(s);
          t(new OperationCanceledError(i));
        }
      });
      if ("onload" in s) {
        s.onload = () => {
          document.head.removeChild(s);
          e2();
        };
      }
      if ("onerror" in s) {
        s.onerror = () => {
          document.head.removeChild(s);
          t(new Error(`Couldn't prefetch URL "${r}"`));
        };
      }
      document.head.appendChild(s);
      // 无 onload 能力的旧环境：入队后立即 resolve（与孪生一致）
      if (!("onload" in s)) {
        document.head.removeChild(s);
        e2();
      }
    });
  }

  /**
   * 资源 → 完整 URL。
   * @param e - 类型编号或描述对象
   */
  getResourceUrl(e: ResourceInput): string {
    const t = typeof e === "object" ? e : resourceConfigs.get(e);
    if (!t) {
      throw new Error("Missing resourceConfig for resType " + ResourceType[e as number]);
    }
    return this.resourceBaseUrl + (t as ResourceDescriptor).src;
  }

  /**
   * 资源文件名（去掉 query 与路径）。
   * @param e - 类型编号或描述
   */
  getResourceFileName(e: ResourceInput): string {
    const t = this.getResourceUrl(e);
    return t.split("?")[0].split("/").pop() as string;
  }

  /**
   * 把类型/描述列表展开为带绝对（或相对 base）src 的清单。
   * @param e - 资源列表
   */
  buildResourceManifest(e: ResourceInput[]): Required<ResourceDescriptor>[] {
    return e
      .map((e2) => {
        if (typeof e2 === "object") {
          return e2 as ResourceDescriptor;
        }
        if (!resourceConfigs.has(e2)) {
          throw new Error("Missing resourceConfig for resType " + ResourceType[e2]);
        }
        return resourceConfigs.get(e2);
      })
      .map((e2) => ({
        id: e2.id as string,
        src: e2.src.match(/^https?:\/\//) ? e2.src : this.resourceBaseUrl + e2.src,
        type: e2.type,
        sizeHint: e2.sizeHint as number,
      }));
  }

  /**
   * 加载文本资源。
   * @param e - 相对 src
   * @param t - 取消令牌
   * @param i - 进度回调（收到 fetch 的增量）
   */
  async loadText(e: string, t?: CancelTokenLike, i?: LoadOptions["onProgress"]): Promise<any> {
    return await this.loadResource({ src: e, type: "text" }, t, i);
  }

  /** 加载二进制资源。 */
  async loadBinary(e: string, t?: CancelTokenLike, i?: LoadOptions["onProgress"]): Promise<any> {
    return await this.loadResource({ src: e, type: "binary" }, t, i);
  }

  /** 加载 JSON 资源。 */
  async loadJson(e: string, t?: CancelTokenLike, i?: LoadOptions["onProgress"]): Promise<any> {
    return await this.loadResource({ src: e, type: "json" }, t, i);
  }

  /**
   * 按描述加载并 parseResult。
   * @param e - 资源描述
   * @param t - 取消令牌
   * @param i - 进度回调（增量字节）
   */
  async loadResource(e: ResourceDescriptor, t?: CancelTokenLike, i?: LoadOptions["onProgress"]): Promise<any> {
    const r = await this.fetchResource(this.resourceBaseUrl + e.src, t, { onProgress: i });
    return this.httpRequest.parseResult(e.type, r);
  }

  /**
   * 串行加载多资源并收集为 LoaderResult。
   * @param e - 资源列表
   * @param t - 取消令牌
   * @param i - 百分比进度回调（按 sizeHint 加权或均分）
   */
  async loadResources(e: ResourceInput[], t?: CancelTokenLike, i?: ProgressCallback): Promise<LoaderResult> {
    const r = this.buildResourceManifest(e);
    const s = new Map<string, any>();
    let a: any;
    const n = r.length;
    let o = 0;
    let l = r.reduce((e2, { sizeHint: t2 }) => e2 + (t2 ?? 0), 0);
    let c = 0;
    for (a of r) {
      const h = await this.fetchResource(a.src, t, {
        onProgress: (e2: number) => {
          c += e2;
          if (l) {
            i?.(Math.floor(100 * Math.min(1, c / l)));
          }
        },
      });
      s.set(a.id, h);
      o++;
      if (!l) {
        i?.(Math.floor((o / n) * 100));
      }
    }
    return new LoaderResult(s);
  }

  /**
   * 底层抓取（转发 HttpRequest.fetchRaw）。
   * @param e - URL
   * @param t - 取消令牌
   * @param i - 选项
   */
  async fetchResource(e: string, t?: CancelTokenLike, i?: LoadOptions): Promise<any> {
    return await this.httpRequest.fetchRaw(e, t, i);
  }
}

/**
 * 批量加载结果：id → 响应；pop 后删除键。
 */
export class LoaderResult {
  /** 已加载项 */
  items: Map<string, any>;

  constructor(items: Map<string, any>) {
    this.items = items;
  }

  /**
   * 取出并移除一项。
   * @param e - 字符串 id 或 ResourceType
   */
  pop(e: string | number): any {
    let t: string;
    if (typeof e === "string") {
      t = e;
    } else {
      if (!resourceConfigs.has(e)) {
        throw new Error(`Missing resourceConfig for resource type "${ResourceType[e]}"`);
      }
      t = resourceConfigs.get(e).id;
      if (!t) {
        throw new Error("Undefined resourceId for resourceType " + e);
      }
    }
    const i = this.items.get(t);
    if (!i) {
      throw new Error(`Resource type "${e}" not found in result.`);
    }
    this.items.delete(t);
    return i;
  }
}
