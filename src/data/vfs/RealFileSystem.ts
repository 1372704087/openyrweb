/**
 * RealFileSystem — 浏览器真实文件系统（File System Access API）门面。
 *
 * 维护多个已挂载目录；openFile 按注册顺序尝试，仅吞掉
 * FileNotFoundError 并最终抛出统一的 not found；getEntries 串联
 * 全部目录条目。
 *
 * 由 data/vfs/RealFileSystem.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
import { FileNotFoundError } from "data/vfs/FileNotFoundError"; // 本组已写
import * as RealFileSystemDirModule from "data/vfs/RealFileSystemDir"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 目录包装类（any-shim：孪生仅 .ts.js）。 */
const RealFileSystemDir: any = RealFileSystemDirModule.RealFileSystemDir;
export class RealFileSystem {
  /** 全部已注册目录。 */
  directories: any[];
  /** 根目录（addRootDirectoryHandle 设置）。 */
  rootDirectory?: any;
  /** 根目录句柄（原样保留）。 */
  rootDirectoryHandle?: any;

  constructor() {
    this.directories = [];
  }

  /** 注册根目录句柄并同步 rootDirectory / rootDirectoryHandle。 */
  addRootDirectoryHandle(handle: any): void {
    this.rootDirectory = this.addDirectoryHandle(handle);
    this.rootDirectoryHandle = handle;
  }

  /** 取根目录句柄。 */
  getRootDirectoryHandle(): any {
    return this.rootDirectoryHandle;
  }

  /** 由句柄新建目录包装并加入列表。 */
  addDirectoryHandle(handle: any): any {
    const dir = new RealFileSystemDir(handle);
    this.directories.push(dir);
    return dir;
  }

  /** 直接挂入已包装目录。 */
  addDirectory(dir: any): void {
    this.directories.push(dir);
  }

  /** 按名取目录；找不到抛普通 Error。 */
  async getDirectory(name: string): Promise<any> {
    const dir = await this.findDirectory(name);
    if (!dir) throw new Error(`Directory "${name}" not found in real file system`);
    return dir;
  }

  /** 在各根下查找同名子目录，返回首个命中。 */
  async findDirectory(name: string): Promise<any | undefined> {
    for (const t of this.directories) {
      if (await t.containsEntry(name)) return await t.getDirectory(name);
    }
    return undefined;
  }

  /** 取根目录包装（可能未初始化）。 */
  getRootDirectory(): any | undefined {
    return this.rootDirectory;
  }

  /** 任一目录包含该条目则为 true。 */
  async containsEntry(name: string): Promise<boolean> {
    for (const t of this.directories) {
      if (await t.containsEntry(name)) return true;
    }
    return false;
  }

  /** 按顺序打开文件；仅吞 FileNotFoundError，全部落空则抛。 */
  async openFile(name: string, create = false): Promise<any> {
    for (const dir of this.directories) {
      try {
        return await dir.openFile(name, create);
      } catch (e) {
        if (!(e instanceof FileNotFoundError)) throw e;
      }
    }
    throw new FileNotFoundError(`File "${name}" not found in real file system`);
  }

  /** 取原始 File；任一目录包含即返回，否则抛普通 Error。 */
  async getRawFile(name: string): Promise<any> {
    for (const t of this.directories) {
      if (await t.containsEntry(name)) return await t.getRawFile(name);
    }
    throw new Error(`File "${name}" not found in real file system`);
  }

  /** 串联遍历全部目录条目（异步生成器）。 */
  async *getEntries(): AsyncGenerator<any> {
    for (const dir of this.directories) {
      for await (const entry of dir.getEntries()) yield entry;
    }
  }
}
