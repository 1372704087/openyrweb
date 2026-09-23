/**
 * RealFileSystemDir — File System Access API 目录句柄包装。
 *
 * 由 data/vfs/RealFileSystemDir.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 要点：
 * - DOMException/TypeError 按 name/message 映射到 FileNotFoundError /
 *   StorageQuotaError / NameNotAllowedError / IOError。
 * - openFile：最多重试 3 次 NotReadableError（500ms 递增延时）；
 *   最终失败时删除损坏文件再抛出，促使下次重新导入。
 * - 大小写不敏感目录通过 equalsIgnoreCase 扫描解析真实条目名。
 */

import { StorageQuotaError } from "data/vfs/StorageQuotaError"; // 未转换（any-shim）
import { equalsIgnoreCase } from "util/string"; // 未转换（any-shim）
import { FileNotFoundError } from "data/vfs/FileNotFoundError"; // 未转换（any-shim）
import { IOError } from "data/vfs/IOError"; // 本组已写
import { NameNotAllowedError } from "data/vfs/NameNotAllowedError"; // 未转换（any-shim）
import { VirtualFile } from "data/vfs/VirtualFile"; // 本组已写

/** FileSystemDirectoryHandle 最小结构（避免 lib.dom 版本差异）。 */
type DirHandle = {
  name: string;
  keys(): AsyncIterableIterator<string>;
  values(): AsyncIterableIterator<{ kind: string; name: string }>;
  getFileHandle(name: string, opts?: { create?: boolean }): Promise<any>;
  getDirectoryHandle(name: string, opts?: { create?: boolean }): Promise<any>;
  removeEntry(name: string, opts?: { recursive?: boolean }): Promise<void>;
};

/** 真实磁盘/OPFS 目录。 */
export class RealFileSystemDir {
  handle: DirHandle;
  caseSensitive: boolean;

  constructor(handle: DirHandle, caseSensitive = false) {
    this.handle = handle;
    this.caseSensitive = caseSensitive;
  }

  get name(): string {
    return this.handle.name;
  }

  /** 遍历全部条目名；NotFound → FileNotFoundError，其它 DOMException → IOError。 */
  async *getEntries(): AsyncGenerator<string> {
    try {
      for await (const entry of this.handle.keys()) yield entry;
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        throw new FileNotFoundError(`Directory "${this.handle.name}" not found`, { cause: err });
      }
      if (err instanceof DOMException) {
        throw new IOError(`Directory "${this.handle.name}" could not be read (${err.name})`, { cause: err });
      }
      throw err;
    }
  }

  async listEntries(): Promise<string[]> {
    const out: string[] = [];
    for await (const entry of this.getEntries()) out.push(entry);
    return out;
  }

  /** 仅产出 kind==="file" 的句柄。 */
  async *getFileHandles(): AsyncGenerator<any> {
    try {
      for await (const value of this.handle.values()) {
        if (value.kind === "file") yield value;
      }
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        throw new FileNotFoundError(`Directory "${this.handle.name}" not found`, { cause: err });
      }
      if (err instanceof DOMException) {
        throw new IOError(`Directory "${this.handle.name}" could not be read (${err.name})`, { cause: err });
      }
      throw err;
    }
  }

  async *getRawFiles(): AsyncGenerator<File> {
    for await (const handle of this.getFileHandles()) yield await handle.getFile();
  }

  async containsEntry(name: string): Promise<boolean> {
    return (await this.resolveEntryName(name)) !== undefined;
  }

  /** 解析真实条目名：大小写敏感直接查，否则扫描。 */
  async resolveEntryName(name: string): Promise<string | undefined> {
    if (this.caseSensitive) {
      const handle = await this.handle
        .getFileHandle(name)
        .catch(() => this.handle.getDirectoryHandle(name))
        .catch(() => undefined);
      return handle?.name;
    }
    for await (const entry of this.getEntries()) {
      if (equalsIgnoreCase(entry, name)) return entry;
    }
    return undefined;
  }

  /** 大小写不敏感时把 name 纠正为磁盘上的实际大小写。 */
  async fixEntryCase(name: string): Promise<string> {
    if (!this.caseSensitive) {
      for await (const entry of this.getEntries()) {
        if (equalsIgnoreCase(entry, name)) {
          name = entry;
          break;
        }
      }
    }
    return name;
  }

  async getRawFile(filename: string, exactCase = false, overrideType?: string): Promise<File> {
    let handle: any;
    try {
      const key = exactCase ? filename : await this.fixEntryCase(filename);
      handle = await this.handle.getFileHandle(key);
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        throw new FileNotFoundError(`File "${filename}" not found in directory "${this.handle.name}"`, {
          cause: err,
        });
      }
      if (err instanceof TypeError && err.message.includes("not allowed")) {
        throw new NameNotAllowedError(`File name "${filename}" is not allowed`, { cause: err });
      }
      if (err instanceof DOMException) {
        throw new IOError(`File "${filename}" could not be read (${err.name})`, { cause: err });
      }
      throw err;
    }
    const file = await handle.getFile();
    return overrideType ? new File([file], file.name, { type: overrideType }) : file;
  }

  /**
   * 打开文件为 VirtualFile：最多 3 次重试 NotReadableError；
   * 重试耗尽则删除损坏文件并原样抛出。
   */
  async openFile(filename: string, exactCase = false): Promise<VirtualFile> {
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const file = await this.getRawFile(filename, exactCase);
        return await VirtualFile.fromRealFile(file as any);
      } catch (err: any) {
        if (attempt === maxRetries - 1) {
          // All retries exhausted — file is corrupted/unreadable in storage.
          // Delete it so the next page load detects the absence and triggers
          // a clean re-import instead of failing again.
          try {
            const key = exactCase ? filename : await this.fixEntryCase(filename);
            await this.handle.removeEntry(key);
            console.warn('RealFileSystemDir: deleted corrupted file "' + filename + '"');
          } catch {
            // ignore delete errors
          }
          throw err;
        }
        if (
          err instanceof IOError &&
          err.cause instanceof DOMException &&
          (err.cause as DOMException).name === "NotReadableError"
        ) {
          console.warn(
            'RealFileSystemDir: NotReadableError reading "' +
              filename +
              '", retrying (' +
              (attempt + 1) +
              "/" +
              maxRetries +
              ")...",
          );
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
    throw new Error("unreachable");
  }

  /** 写入文件：先删同名再 createWritable；QuotaExceeded → StorageQuotaError。 */
  async writeFile(data: File | { filename?: string; stream: any }, name?: string): Promise<void> {
    const filename = name ?? ((data as any).name ?? (data as any).filename);
    try {
      const key = await this.fixEntryCase(filename);
      await this.deleteFile(key, true);
      const handle = await this.handle.getFileHandle(key, { create: true });
      const writable = await handle.createWritable();
      try {
        const payload =
          data instanceof File
            ? data
            : new Uint8Array(
                (data as any).stream.buffer,
                (data as any).stream.byteOffset,
                (data as any).stream.byteLength,
              );
        await writable.write(payload);
        await writable.close();
      } catch (err) {
        await writable.abort();
        throw err;
      }
    } catch (err: any) {
      if (err.name === "QuotaExceededError") throw new StorageQuotaError({ cause: err });
      if (err.name === "NotFoundError") {
        throw new FileNotFoundError(`Directory "${this.handle.name}" not found`, { cause: err });
      }
      if (err instanceof TypeError && err.message.includes("not allowed")) {
        throw new NameNotAllowedError(`File name "${filename}" is not allowed`, { cause: err });
      }
      if (err instanceof DOMException) {
        throw new IOError(`File "${filename}" could not be written (${err.name})`, { cause: err });
      }
      throw err;
    }
  }

  /** 删除文件；alreadyExact 时跳过 resolve。NotFound+alreadyExact 静默返回。 */
  async deleteFile(name: string, alreadyExact = false): Promise<void> {
    const key = alreadyExact ? name : await this.resolveEntryName(name);
    if (!key) return;
    try {
      await this.handle.removeEntry(key);
    } catch (err: any) {
      if (alreadyExact && err.name === "NotFoundError") return;
      if (err.name === "QuotaExceededError") throw new StorageQuotaError({ cause: err });
      if (err instanceof TypeError && err.message.includes("not allowed")) {
        throw new NameNotAllowedError(`File name "${key}" is not allowed`, { cause: err });
      }
      if (err instanceof DOMException) {
        throw new IOError(`File "${key}" could not be deleted (${err.name})`, { cause: err });
      }
      throw err;
    }
  }

  async getDirectory(name: string, caseSensitive = this.caseSensitive): Promise<RealFileSystemDir> {
    const key = caseSensitive ? name : await this.fixEntryCase(name);
    let handle: any;
    try {
      handle = await this.handle.getDirectoryHandle(key);
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        throw new FileNotFoundError(
          `Directory "${name}" not found or parent directory "${this.handle.name}" is gone`,
          { cause: err },
        );
      }
      if (err instanceof TypeError && err.message.includes("not allowed")) {
        throw new NameNotAllowedError(`Directory name "${name}" is not allowed`, { cause: err });
      }
      if (err instanceof DOMException) {
        throw new IOError(`Directory "${name}" could not be read (${err.name})`, { cause: err });
      }
      throw err;
    }
    return new RealFileSystemDir(handle, caseSensitive);
  }

  async getOrCreateDirectory(name: string, caseSensitive = this.caseSensitive): Promise<RealFileSystemDir> {
    const key = caseSensitive ? name : await this.fixEntryCase(name);
    try {
      return new RealFileSystemDir(await this.handle.getDirectoryHandle(key, { create: true }), caseSensitive);
    } catch (err: any) {
      if (err.name === "QuotaExceededError") throw new StorageQuotaError({ cause: err });
      if (err.name === "NotFoundError") {
        throw new FileNotFoundError(`Directory "${this.handle.name}" not found"`, { cause: err });
      }
      if (err instanceof TypeError && err.message.includes("not allowed")) {
        throw new NameNotAllowedError(`Directory name "${name}" is not allowed`, { cause: err });
      }
      if (err instanceof DOMException) {
        throw new IOError(`Directory "${name}" could not be created (${err.name})`, { cause: err });
      }
      throw err;
    }
  }

  async deleteDirectory(name: string, recursive = false): Promise<void> {
    const key = await this.resolveEntryName(name);
    if (!key) return;
    try {
      await this.handle.removeEntry(key, { recursive });
    } catch (err: any) {
      if (err.name === "QuotaExceededError") throw new StorageQuotaError({ cause: err });
      if (err.name === "InvalidModificationError") {
        throw new IOError("Can't delete non-empty directory when recursive = false");
      }
      if (err instanceof TypeError && err.message.includes("not allowed")) {
        throw new NameNotAllowedError(`Directory name "${key}" is not allowed`, { cause: err });
      }
      if (err instanceof DOMException) {
        throw new IOError(`Directory "${key}" could not be deleted (${err.name})`, { cause: err });
      }
      throw err;
    }
  }
}
