/**
 * VxlGeometryCache — VXL 几何体磁盘缓存（serialize 到 cacheDir，按 mod 前缀隔离）。
 *
 * 由 engine/gfx/geometry/VxlGeometryCache.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { DataStream } from "data/DataStream"; // 孪生
import { VirtualFile } from "data/vfs/VirtualFile"; // 孪生
import { BufferGeometrySerializer } from "engine/gfx/geometry/BufferGeometrySerializer"; // 孪生（本批内一并转换）
import { FileNotFoundError } from "data/vfs/FileNotFoundError"; // 已转换
import { BufferGeometryUtils } from "engine/gfx/BufferGeometryUtils"; // 孪生（本批内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 缓存目录最小形状。 */
export interface CacheDirLike {
  openFile(name: string): Promise<{ stream: DataStream }>;
  writeFile(file: VirtualFile): Promise<void>;
  deleteFile(name: string): Promise<void>;
  getEntries(): AsyncIterable<string> | Iterable<string>;
}

/** VXL 文件最小形状。 */
export interface VxlLike {
  name: string;
}

/** VxlGeometryCache。 */
export class VxlGeometryCache {
  static cacheFilePrefix = "geocache_";

  geometries: Map<VxlLike, any> = new Map();

  constructor(
    public readonly cacheDir: CacheDirLike | undefined | null,
    public readonly activeMod: string | undefined | null,
  ) {}

  /** mergeVertices（若有 normal）+ computeBoundingBox。 */
  static _postProcessGeometry(geometry: any): any {
    const merged = BufferGeometryUtils.mergeVertices(geometry);
    if (!merged.getAttribute("normal")) merged.computeVertexNormals();
    merged.computeBoundingBox();
    return merged;
  }

  /** 从 cacheDir 读已序列化几何体；FileNotFoundError 静默，其它错误打日志。 */
  async loadFromStorage(vxl: VxlLike, mod: string): Promise<any | undefined> {
    let geometry = this.geometries.get(vxl);
    if (!geometry) {
      const dir = this.cacheDir;
      if (dir) {
        const fileName = this.getCacheFileName(mod, vxl.name);
        try {
          const file = await dir.openFile(fileName);
          geometry = VxlGeometryCache._postProcessGeometry(new BufferGeometrySerializer().unserialize(file.stream));
          this.set(vxl, geometry);
        } catch (e) {
          if (!(e instanceof FileNotFoundError)) {
            console.error(`Failed to load buffer geometry from cache file "${fileName}"`, e);
          }
        }
      }
    }
    return geometry;
  }

  /** 确保内存有条目后写入 cacheDir。 */
  async persistToStorage(vxl: VxlLike, mod: string, buffer: ArrayBuffer): Promise<void> {
    if (!this.geometries.has(vxl)) {
      this.set(vxl, VxlGeometryCache._postProcessGeometry(new BufferGeometrySerializer().unserialize(new DataStream(buffer))));
    }
    await this.cacheDir?.writeFile(new VirtualFile(new DataStream(buffer), this.getCacheFileName(mod, vxl.name)));
  }

  /** 清空本 mod 前缀下的全部缓存文件。 */
  async clearStorage(): Promise<void> {
    await this.clearStorageFiles();
  }

  /** 删除其它 mod 前缀（保留当前 activeMod）的缓存文件。 */
  async clearOtherModStorage(): Promise<void> {
    const keepPrefix = VxlGeometryCache.cacheFilePrefix + this.getModPrefix();
    await this.clearStorageFiles((name) => !name.startsWith(keepPrefix));
  }

  /** 遍历 cacheDir，删除匹配 geocache_ 前缀且 filter 通过的文件。 */
  async clearStorageFiles(filter: (name: string) => boolean = () => true): Promise<void> {
    const dir = this.cacheDir;
    if (dir) {
      for await (const name of dir.getEntries() as AsyncIterable<string>) {
        if (name.startsWith(VxlGeometryCache.cacheFilePrefix) && filter(name)) {
          await dir.deleteFile(name);
        }
      }
    }
  }

  /** geocache_{mod#}{vxl 去 .vxl}_{geometry.name} */
  getCacheFileName(mod: string, geometryName: string): string {
    return "" + VxlGeometryCache.cacheFilePrefix + this.getModPrefix() + mod.replace(".vxl", "") + "_" + geometryName;
  }

  /** activeMod 存在 → "{mod}#"，否则 "#"。 */
  getModPrefix(): string {
    return this.activeMod ? this.activeMod + "#" : "#";
  }

  /** dispose 并剥离全部属性后清空内存 Map。 */
  clear(): void {
    this.geometries.forEach((geometry) => {
      geometry.dispose();
      for (const name of Object.keys(geometry.attributes)) geometry.removeAttribute(name);
    });
    this.geometries.clear();
  }

  get(vxl: VxlLike): any | undefined {
    return this.geometries.get(vxl);
  }

  set(vxl: VxlLike, geometry: any): void {
    this.geometries.set(vxl, geometry);
  }
}
