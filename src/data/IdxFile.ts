/**
 * IdxFile — GABA 格式 WAVE 索引文件解析。
 *
 * 由 data/IdxFile.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 读序（勿改）：magic"GABA"→int32(必须为 2)→int32(count)→count×条目：
 * 16 字节名（indexOf("\\0")≠0 时 substr 截断）后补 ".wav"
 * + 5×uint32（offset/length/sampleRate/flags/chunkSize）。
 */

import { IdxEntry } from "data/IdxEntry"; // 本组已写

/** GABA 索引文件。 */
export class IdxFile {
  /** 文件名 → 条目。 */
  entries: Map<string, IdxEntry> = new Map();

  constructor(stream: any) {
    this.entries = new Map();
    this.parse(stream);
  }

  /** 从 DataStream 解析索引；magic/版本不符时抛 Error。 */
  parse(stream: any): void {
    const magic = stream.readCString(4);
    if (magic !== "GABA") {
      throw new Error(`Unable to load Idx file, did not find magic id, found ${magic} instead`);
    }
    const version = stream.readInt32();
    if (version !== 2) {
      throw new Error(`Unable to load Idx file, did not find magic number 2, found ${version} instead`);
    }
    const count = stream.readInt32();
    for (let i = 0; i < count; i++) {
      const entry: any = new IdxEntry();
      let name = stream.readString(16);
      const nul = name.indexOf("\0");
      // 孪生：仅当 nul !== 0 时截断
      if (nul !== 0) name = name.substr(0, nul);
      entry.filename = name + ".wav";
      entry.offset = stream.readUint32();
      entry.length = stream.readUint32();
      entry.sampleRate = stream.readUint32();
      entry.flags = stream.readUint32();
      entry.chunkSize = stream.readUint32();
      this.entries.set(entry.filename, entry);
    }
  }
}
