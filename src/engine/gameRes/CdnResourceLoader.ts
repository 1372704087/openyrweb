/**
 * CdnResourceLoader — 带本地磁盘缓存与 CRC 校验的 CDN 资源加载器。
 *
 * 继承 ResourceLoader：
 * - 优先读 cacheDir 下 `cdncache_*` 缓存条目，CRC 匹配则直接命中；
 * - 未命中则回源（可选追加 `h=<checksum>` 查询参数），CRC 校验失败抛 DownloadError；
 * - 成功后写入缓存（失败仅 console.error，不阻断）。
 *
 * 由 engine/gameRes/CdnResourceLoader.ts.js 逆向翻译为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { DataStream } from "data/DataStream"; // 已转换
import { Crc32 } from "data/Crc32"; // 已转换
import { VirtualFile } from "data/vfs/VirtualFile"; // 已转换
import * as ResourceLoaderNs from "engine/ResourceLoader"; // 孪生（any-shim，未转换）

/** ResourceLoader 基类（孪生命名空间导出）。 */
const ResourceLoaderBase: any = (ResourceLoaderNs as any).ResourceLoader;
/** ResourceLoader 模块内的 DownloadError（孪生命名空间导出）。 */
const DownloadError: any = (ResourceLoaderNs as any).DownloadError;

/** CDN 清单：version/format/checksums 映射（结构与 manifest.json 一致）。 */
export interface CdnManifestData {
  /** 清单版本（须为 2）。 */
  version: number;
  /** 资源格式（须为 "mix"）。 */
  format: string;
  /** 文件名 → 十六进制 CRC 校验和。 */
  checksums: Record<string, string>;
}

/** 缓存目录的最小接口（条目枚举/读写删）。 */
export interface CacheDirLike {
  /** 异步枚举全部条目键。 */
  getEntries(): AsyncIterable<string>;
  /** 是否存在指定条目。 */
  containsEntry(name: string): Promise<boolean>;
  /** 读取原始文件 Response。 */
  getRawFile(name: string): Promise<Response>;
  /** 删除文件。 */
  deleteFile(name: string): Promise<void>;
  /** 写入 VirtualFile。 */
  writeFile(file: any): Promise<void>;
}

export class CdnResourceLoader extends ResourceLoaderBase {
  /** 本地 CDN 缓存条目前缀。 */
  static cachePrefix = "cdncache_";

  /** CDN 清单（含 checksums）。 */
  cdnManifest: CdnManifestData;
  /** 本地缓存目录句柄（可选）。 */
  cacheDir?: CacheDirLike;

  /**
   * @param baseUrl CDN 基地址。
   * @param cdnManifest 清单数据。
   * @param cacheDir 本地缓存目录（可选）。
   */
  constructor(baseUrl: string, cdnManifest: CdnManifestData, cacheDir?: CacheDirLike) {
    super(baseUrl);
    this.cdnManifest = cdnManifest;
    this.cacheDir = cacheDir;
  }

  /**
   * 清空本地 CDN 缓存：删除所有 `cdncache_` 前缀条目。
   *
   * @param cacheDir 缓存目录。
   */
  static async clearCache(cacheDir: CacheDirLike): Promise<void> {
    for await (const entry of cacheDir.getEntries()) {
      if (entry.startsWith(CdnResourceLoader.cachePrefix)) {
        await cacheDir.deleteFile(entry);
      }
    }
  }

  /**
   * 从 URL 提取文件名（去 query、取最后一段路径）。
   *
   * @param url 完整资源 URL。
   */
  getFileNameFromUrl(url: string): string {
    return url.split("?")[0].split("/").pop() as string;
  }

  /**
   * 拉取资源并做 CRC 校验 + 本地缓存。
   *
   * @param url 资源 URL。
   * @param a 转发基类的第二参。
   * @param i 进度回调等选项。
   * @returns 校验通过的字节数组。
   * @throws DownloadError CRC 与清单不一致时抛出。
   */
  async fetchResource(url: string, a?: any, i?: any): Promise<Uint8Array> {
    const fileName = this.getFileNameFromUrl(url);
    const cacheKey = CdnResourceLoader.cachePrefix + fileName;
    const expected = this.cdnManifest.checksums[fileName];
    try {
      // .mix 且有期望校验和、且缓存命中：读缓存并验 CRC
      if (fileName.endsWith(".mix") && void 0 !== expected && this.cacheDir && (await this.cacheDir.containsEntry(cacheKey))) {
        const resp = await this.cacheDir.getRawFile(cacheKey);
        const cached = new Uint8Array(await resp.arrayBuffer());
        // 孪生原样 ===（number vs checksum 原类型；String() 强转会在十进制串清单下分叉）
        if ((Crc32.calculateCrc(cached) as any) === expected) {
          i?.onProgress?.(cached.length);
          return cached;
        }
        try {
          await this.cacheDir.deleteFile(cacheKey);
        } catch (e) {
          console.error("Couldn't delete file from local CDN cache", e);
        }
      }
    } catch (e) {
      console.error(`Couldn't read file "${cacheKey}" from local CDN cache`, e);
    }
    // 追加 h=<checksum> 缓存破坏参数（有期望校验和时）
    if (void 0 !== expected) {
      url += (url.includes("?") ? "&" : "?") + "h=" + expected;
    }
    const network = await super.fetchResource(url, a, i);
    if ((Crc32.calculateCrc(network) as any) !== expected) {
      throw new DownloadError(`Checksum mismatch for URL "${url}"`);
    }
    try {
      await this.cacheDir?.writeFile(VirtualFile.factory(new DataStream(network), cacheKey));
    } catch (e) {
      console.error("Couldn't write file to local CDN cache", e);
    }
    return network;
  }
}
