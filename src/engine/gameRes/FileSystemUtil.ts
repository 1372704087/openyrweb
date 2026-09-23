/**
 * FileSystemUtil — File System Access API 目录枚举/文件选择器工具。
 *
 * 提供目录内容/键名枚举（错误映射到 vfs FileNotFoundError / IOError）、
 * 归档文件选择器，以及 getFile() 返回 File 子类的 polyfill。
 *
 * 由 engine/gameRes/FileSystemUtil.ts.js 逆向翻译为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as FilePicker from "file-system-access"; // 孪生（any-shim，未转换）
import { FileNotFoundError } from "data/vfs/FileNotFoundError"; // 已转换
import { IOError } from "data/vfs/IOError"; // 已转换

/** 目录句柄的最小结构类型（values/keys 异步迭代 + name）。 */
export interface DirHandleLike {
  /** 目录名。 */
  name: string;
  /** 异步枚举子条目（FileSystemDirectoryHandle.values）。 */
  values(): AsyncIterableIterator<any>;
  /** 异步枚举子键名（FileSystemDirectoryHandle.keys）。 */
  keys(): AsyncIterableIterator<string>;
}

export class FileSystemUtil {
  /**
   * 枚举目录下全部子条目（FileSystemDirectoryHandle.values）。
   *
   * @param dir 目录句柄。
   * @returns 条目数组。
   * @throws FileNotFoundError name === "NotFoundError" 时包装抛出。
   * @throws IOError 其它 DOMException 时包装抛出。
   */
  static async getDirContents(dir: DirHandleLike): Promise<any[]> {
    let out: any[] = [];
    try {
      for await (const entry of dir.values()) out.push(entry);
    } catch (e: any) {
      if ("NotFoundError" === e.name) throw new FileNotFoundError(`Directory "${dir.name}" not found`, { cause: e });
      if (e instanceof DOMException) throw new IOError(`Directory "${dir.name}" could not be read (${e.name})`, { cause: e });
      throw e;
    }
    return out;
  }

  /**
   * 枚举目录下全部子键名（FileSystemDirectoryHandle.keys）。
   *
   * @param dir 目录句柄。
   * @returns 键名数组。
   * @throws FileNotFoundError name === "NotFoundError" 时包装抛出。
   * @throws IOError 其它 DOMException 时包装抛出。
   */
  static async listDir(dir: DirHandleLike): Promise<string[]> {
    let out: string[] = [];
    try {
      for await (const key of dir.keys()) out.push(key);
    } catch (e: any) {
      if ("NotFoundError" === e.name) throw new FileNotFoundError(`Directory "${dir.name}" not found`, { cause: e });
      if (e instanceof DOMException) throw new IOError(`Directory "${dir.name}" could not be read (${e.name})`, { cause: e });
      throw e;
    }
    return out;
  }

  /**
   * 弹出归档文件选择器（支持 rar/zip/tar/gz/bz/xz/7z/exe 扩展名）。
   *
   * @returns 选中的第一个 FileSystemFileHandle。
   */
  static async showArchivePicker(): Promise<any> {
    const handles = await (FilePicker as any).showOpenFilePicker({
      types: [
        {
          description: "Archive",
          accept: {
            "application/vnd.rar": [".rar"],
            "application/zip": [".zip"],
            "application/x-tar": [".tar"],
            "application/gzip": [".gz"],
            "application/x-bzip": [".bz"],
            "application/x-bzip2": [".bz2"],
            "application/x-xz": [".xz"],
            "application/x-7z-compressed": [".7z"],
            "application/octet-stream": [".exe"],
          },
        },
      ],
    });
    // 某些实现返回数组，某些返回单句柄 —— 与孪生一致取首项
    return Array.isArray(handles) ? handles[0] : handles;
  }

  /**
   * polyfill FileSystemFileHandle.getFile()：
   * 包装原实现返回的 Blob 为 File（保留 type/lastModified + this.name）。
   */
  static polyfillGetFile(): void {
    const original = (FileSystemFileHandle.prototype as any).getFile;
    (FileSystemFileHandle.prototype as any).getFile = function (this: any) {
      return original.call(this).then((blob: Blob) => {
        const maybeFile = blob as File;
        return new File([blob], this.name, { type: blob.type, lastModified: maybeFile.lastModified || Date.now() });
      });
    };
  }
}
