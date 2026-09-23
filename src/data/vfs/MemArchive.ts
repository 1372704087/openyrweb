/**
 * MemArchive — 纯内存归档：filename → VirtualFile 容器。
 *
 * 由 data/vfs/MemArchive.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 内存归档。 */
export class MemArchive {
  entries: Map<string, any> = new Map();

  constructor() {
    this.entries = new Map();
  }

  addFile(file: { filename: string }): void {
    this.entries.set(file.filename, file);
  }

  containsFile(filename: string): boolean {
    return this.entries.has(filename);
  }

  openFile(filename: string): any {
    if (!this.containsFile(filename)) {
      throw new Error(`File "${filename}" not found`);
    }
    return this.entries.get(filename);
  }
}
