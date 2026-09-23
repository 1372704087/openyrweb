/**
 * MapFileLoader — 从虚拟文件系统加载地图文件（无远程回退）。
 *
 * 由 gui/screen/game/MapFileLoader.ts.js 重写为 TS（行为完全一致）。
 */
import { FileNotFoundError } from "data/vfs/FileNotFoundError"; // 已转换
import * as VirtualFileModule from "data/vfs/VirtualFile"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：VirtualFile 类型/类取命名空间
const VirtualFile: any = (VirtualFileModule as any).VirtualFile ?? VirtualFileModule;

/** 地图文件加载器。 */
export class MapFileLoader {
  /** 资源加载器（构造注入，load 中未用）。 */
  resourceLoader: any;
  /** 虚拟文件系统。 */
  vfs: any;

  /**
   * @param resourceLoader 资源加载器
   * @param vfs 虚拟文件系统
   */
  constructor(resourceLoader: any, vfs: any) {
    this.resourceLoader = resourceLoader;
    this.vfs = vfs;
  }

  /**
   * 打开地图文件。
   * offline：仅从导入的游戏文件读取；缺失时抛 FileNotFoundError。
   * @param path 相对路径
   * @param _extra 第二参数与孪生对齐但未使用
   */
  async load(path: string, _extra?: any): Promise<any> {
    // (offline): maps are read from the imported game files only.
    // No remote download fallback — a missing map surfaces as FileNotFoundError.
    if (this.vfs) return await this.vfs.openFileWithRfs(path);
    throw new FileNotFoundError(`File "${path}" not found in virtual file system`);
  }
}
