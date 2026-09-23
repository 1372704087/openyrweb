/**
 * Zip — 流式 ZIP 写入器（可选 Zip64），输出到 ReadableStream。
 *
 * 用法：startFile → appendData* → endFile（可多文件）→ finish。
 * 字节计数用 BigInt；zip64 模式在 local/central 头写 0xFFFFFFFF 占位
 * 并追加 Zip64 Extended 字段与 EOCD64。状态机：正在写文件或已 finished
 * 时再次 startFile/finish 会抛错。
 *
 * 由 data/zip/Zip.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
import { Crc32 } from '../Crc32';
import { ZipUtils } from './ZipUtils';

/** 单个正在写入/已写入文件的记录。 */
interface FileRecord {
  name: string;
  sizeBig: bigint;
  crc: Crc32;
  done: boolean;
  date: Date;
  headerOffsetBig: bigint;
}

export class Zip {
  zip64: boolean;
  fileRecord: FileRecord[] = [];
  finished = false;
  byteCounterBig = BigInt(0);
  outputStream!: ReadableStream<Uint8Array>;
  private outputController!: ReadableStreamDefaultController<Uint8Array>;

  constructor(zip64 = false) {
    this.zip64 = zip64;
    console.info('Started zip with zip64: ' + this.zip64);
    this.fileRecord = [];
    this.finished = false;
    this.byteCounterBig = BigInt(0);
    this.outputStream = new ReadableStream({
      start: (controller) => {
        console.info('OutputStream has started!');
        this.outputController = controller;
      },
      cancel: () => {
        console.info('OutputStream has been canceled!');
      },
    });
  }

  /** 向底层流推入一段字节。 */
  enqueue(chunk: Uint8Array): void {
    this.outputController.enqueue(chunk);
  }

  /** 关闭底层流。 */
  close(): void {
    this.outputController.close();
  }

  /** Zip64 Extended Information 字段（uncomp/comp/offset 各 8 字节）。 */
  private getZip64ExtraField(uncomp: bigint, offset: bigint): Uint8Array {
    return ZipUtils.createByteArray([
      { data: 1, size: 2 },
      { data: 28, size: 2 },
      { data: uncomp, size: 8 },
      { data: uncomp, size: 8 },
      { data: offset, size: 8 },
      { data: 0, size: 4 },
    ]);
  }

  /** 当前是否仍有未 endFile 的文件。 */
  isWritingFile(): boolean {
    return this.fileRecord.length > 0 && this.fileRecord[this.fileRecord.length - 1].done === false;
  }

  /** 开始一个新文件：写 local file header。 */
  startFile(name: string, mtime: number | string | Date): void {
    if (this.isWritingFile() || this.finished)
      throw new Error('Tried adding file while adding other file or while zip has finished');
    console.info('Start file: ' + name);
    const date = new Date(mtime);
    this.fileRecord = [
      ...this.fileRecord,
      {
        name,
        sizeBig: BigInt(0),
        crc: new Crc32(),
        done: false,
        date,
        headerOffsetBig: this.byteCounterBig,
      },
    ];
    const nameBytes = new TextEncoder().encode(name);
    const header = ZipUtils.createByteArray([
      { data: 67324752, size: 4 }, // PK\x03\x04
      { data: 45, size: 2 },
      { data: 2056, size: 2 },
      { data: 0, size: 2 },
      { data: ZipUtils.getTimeStruct(date), size: 2 },
      { data: ZipUtils.getDateStruct(date), size: 2 },
      { data: 0, size: 4 }, // local 头 crc 占位
      { data: this.zip64 ? 4294967295 : 0, size: 4 },
      { data: this.zip64 ? 4294967295 : 0, size: 4 },
      { data: nameBytes.length, size: 2 },
      { data: this.zip64 ? 32 : 0, size: 2 },
      { data: nameBytes },
      { data: this.zip64 ? this.getZip64ExtraField(BigInt(0), this.byteCounterBig) : [] },
    ]);
    this.enqueue(header);
    this.byteCounterBig += BigInt(header.length);
  }

  /** 追加文件数据块（store 未压缩）。 */
  appendData(chunk: Uint8Array): void {
    if (!this.isWritingFile() || this.finished)
      throw new Error('Tried to append file data, but there is no open file!');
    this.enqueue(chunk);
    this.byteCounterBig += BigInt(chunk.length);
    const rec = this.fileRecord[this.fileRecord.length - 1];
    rec.crc.append(chunk);
    rec.sizeBig += BigInt(chunk.length);
  }

  /** 结束当前文件：写 CRC + 双尺寸（Zip64 时 8 字节）。 */
  endFile(): void {
    if (!this.isWritingFile() || this.finished)
      throw new Error('Tried to end file, but there is no open file!');
    const rec = this.fileRecord[this.fileRecord.length - 1];
    console.info('End file: ' + rec.name);
    const trailer = ZipUtils.createByteArray([
      { data: rec.crc.get(), size: 4 },
      { data: rec.sizeBig, size: this.zip64 ? 8 : 4 },
      { data: rec.sizeBig, size: this.zip64 ? 8 : 4 },
    ]);
    this.enqueue(trailer);
    this.byteCounterBig += BigInt(trailer.length);
    this.fileRecord[this.fileRecord.length - 1].done = true;
  }

  /** 写全部 central directory（+ 可选 Zip64 EOCD）并关闭流。 */
  finish(): void {
    if (this.isWritingFile() || this.finished) throw new Error('Empty zip, or there is still a file open');
    console.info('Finishing zip');
    let cdSize = BigInt(0);
    const cdStart = this.byteCounterBig;

    this.fileRecord.forEach((rec) => {
      const { date, crc, sizeBig, name, headerOffsetBig } = rec;
      const nameBytes = new TextEncoder().encode(name);
      const entry = ZipUtils.createByteArray([
        { data: 33639248, size: 4 }, // PK\x01\x02
        { data: 45, size: 2 },
        { data: 45, size: 2 },
        { data: 2056, size: 2 },
        { data: 0, size: 2 },
        { data: ZipUtils.getTimeStruct(date), size: 2 },
        { data: ZipUtils.getDateStruct(date), size: 2 },
        { data: crc.get(), size: 4 },
        { data: this.zip64 ? 4294967295 : sizeBig, size: 4 },
        { data: this.zip64 ? 4294967295 : sizeBig, size: 4 },
        { data: nameBytes.length, size: 2 },
        { data: this.zip64 ? 32 : 0, size: 2 },
        { data: 0, size: 2 },
        { data: 0, size: 2 },
        { data: 0, size: 2 },
        { data: 0, size: 4 },
        { data: this.zip64 ? 4294967295 : headerOffsetBig, size: 4 },
        { data: nameBytes },
        { data: this.zip64 ? this.getZip64ExtraField(sizeBig, headerOffsetBig) : [] },
      ]);
      this.enqueue(entry);
      this.byteCounterBig += BigInt(entry.length);
      cdSize += BigInt(entry.length);
    });

    if (this.zip64) {
      const afterCd = this.byteCounterBig;
      const eocd64 = ZipUtils.createByteArray([
        { data: 101075792, size: 4 }, // PK\x06\x06
        { data: 44, size: 8 },
        { data: 45, size: 2 },
        { data: 45, size: 2 },
        { data: 0, size: 4 },
        { data: 0, size: 4 },
        { data: this.fileRecord.length, size: 8 },
        { data: this.fileRecord.length, size: 8 },
        { data: cdSize, size: 8 },
        { data: cdStart, size: 8 },
      ]);
      this.enqueue(eocd64);
      this.byteCounterBig += BigInt(eocd64.length);
      const locator = ZipUtils.createByteArray([
        { data: 117853008, size: 4 }, // PK\x06\x07
        { data: 0, size: 4 },
        { data: afterCd, size: 8 },
        { data: 1, size: 4 },
      ]);
      this.enqueue(locator);
      this.byteCounterBig += BigInt(locator.length);
    }

    const eocd = ZipUtils.createByteArray([
      { data: 101010256, size: 4 }, // PK\x05\x06
      { data: 0, size: 2 },
      { data: 0, size: 2 },
      { data: this.zip64 ? 65535 : this.fileRecord.length, size: 2 },
      { data: this.zip64 ? 65535 : this.fileRecord.length, size: 2 },
      { data: this.zip64 ? 4294967295 : cdSize, size: 4 },
      { data: this.zip64 ? 4294967295 : cdStart, size: 4 },
      { data: 0, size: 2 },
    ]);
    this.enqueue(eocd);
    this.close();
    this.byteCounterBig += BigInt(eocd.length);
    this.finished = true;
    console.info(
      'Done writing zip file. ' +
        `Wrote ${this.fileRecord.length} files and a total of ${this.byteCounterBig} bytes.`,
    );
  }
}
