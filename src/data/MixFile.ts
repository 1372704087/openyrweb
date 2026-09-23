/**
 * MixFile — Westwood MIX 包（TD 明文头 / RA Blowfish 加密头）解析。
 *
 * 由 data/MixFile.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 读序：首 uint32 标志分流；TD 直接读目录；RA 经 Blowfish 解密两段头。
 */

import { DataStream } from "data/DataStream"; // 本组已写
import { Blowfish } from "data/encoding/Blowfish"; // 未转换（any-shim）
import { BlowfishKey } from "data/encoding/BlowfishKey"; // 未转换（any-shim）
import { MixEntry } from "data/MixEntry"; // 本组已写
import { VirtualFile } from "data/vfs/VirtualFile"; // 本组已写

/** MIX 头标志位。 */
export enum MixFlags {
  Checksum = 0x10000,
  Encrypted = 0x20000,
}

/** MIX 归档。 */
export class MixFile {
  stream: any;
  /** RA 加密头索引起点（固定 84）。 */
  headerStart = 84;
  index: Map<number, MixEntry> = new Map();
  dataStart: number = 0;

  constructor(stream: any) {
    this.stream = stream;
    this.headerStart = 84;
    this.index = new Map();
    this.parseHeader();
  }

  parseHeader(): void {
    const flags = this.stream.readUint32();
    const isRaShape = (flags & ~(MixFlags.Checksum | MixFlags.Encrypted)) === 0;
    if (isRaShape) {
      if ((flags & MixFlags.Encrypted) !== 0) {
        this.dataStart = this.parseRaHeader();
        return;
      }
    } else {
      this.stream.seek(0);
    }
    this.dataStart = this.parseTdHeader(this.stream);
  }

  /** RA 加密头：80B 密钥密文 → 解密 count 段 → 对齐读索引密文。 */
  parseRaHeader(): number {
    const stream = this.stream;
    const keyCipher = stream.readUint8Array(80);
    const key = new BlowfishKey().decryptKey(keyCipher);
    let words = stream.readUint32Array(2);
    const bf = new Blowfish(key);

    let head = new DataStream(bf.decrypt(words) as any);
    const count = head.readUint16();
    head.readUint32();
    stream.position = this.headerStart;

    let indexBytes = 6 + count * MixEntry.size;
    const wordCount = ((3 + indexBytes) / 4) | 0;
    words = stream.readUint32Array(wordCount + (wordCount % 2));
    head = new DataStream(bf.decrypt(words) as any);

    indexBytes = this.headerStart + indexBytes + ((1 + (~indexBytes >>> 0)) & 7);
    this.parseTdHeader(head);
    return indexBytes;
  }

  /** TD 明文目录；返回流位置。 */
  parseTdHeader(stream: any): number {
    const count = stream.readUint16();
    stream.readUint32();
    for (let i = 0; i < count; i++) {
      const entry = new MixEntry(stream.readUint32(), stream.readUint32(), stream.readUint32());
      this.index.set(entry.hash, entry);
    }
    return stream.position;
  }

  containsFile(filename: string): boolean {
    return this.index.has(MixEntry.hashFilename(filename));
  }

  openFile(filename: string): any {
    const entry = this.index.get(MixEntry.hashFilename(filename));
    if (!entry) throw new Error(`File "${filename}" not found`);
    return VirtualFile.factory(this.stream, filename, this.dataStart + entry.offset, entry.length);
  }
}
