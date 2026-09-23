/**
 * AudioBagFile — AUDIO.BAG/IDX 音频包读取器。
 *
 * 将 BAG 索引条目按需合成为标准 WAV（PCM16 或 IMA ADPCM 压缩），
 * 再包装为 VirtualFile 供上层播放。flags 位 0 表示立体声、位 1 表示
 * 未压缩 PCM、位 3 表示 IMA ADPCM；两种编码分支写出的 RIFF 头布局
 * 不同，见 buildWavData。
 *
 * 由 data/AudioBagFile.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { DataStream } from "data/DataStream";
import { VirtualFile } from "data/vfs/VirtualFile";

/** BAG 索引中的单条音频条目（字段来自 IDX 记录，此处沿用运行时形态）。 */
export interface AudioBagEntry {
  /** 样本率（Hz）。 */
  sampleRate: number;
  /** 数据块字节长度。 */
  length: number;
  /** 源流中的字节偏移。 */
  offset: number;
  /** 标志位：bit0=立体声，bit1=PCM，bit3=IMA ADPCM。 */
  flags: number;
  /** ADPCM 块大小（PCM 分支不用）。 */
  chunkSize: number;
}

export class AudioBagFile {
  /** 文件名 → 合成后的 WAV 数据流。 */
  private fileData: Map<string, DataStream> = new Map();

  /** 从已解析的 BAG 索引 VirtualFile 逐条合成 WAV 并缓存（与孪生一致：解包 file.stream 后逐条读）。 */
  fromVirtualFile(file: VirtualFile, bag: { entries: Array<[string, AudioBagEntry]> }): this {
    for (const [name, entry] of bag.entries) {
      const wav = this.buildWavData(file.stream, entry);
      this.fileData.set(name, wav);
    }
    return this;
  }

  /** 返回已缓存的全部音频文件名。 */
  getFileList(): string[] {
    return [...this.fileData.keys()];
  }

  /** 判断是否包含指定文件名。 */
  containsFile(name: string): boolean {
    return this.fileData.has(name);
  }

  /** 按名称打开音频；不存在时抛错。 */
  openFile(name: string): VirtualFile {
    if (!this.containsFile(name)) throw new Error(`File "${name}" not found`);
    return new VirtualFile(this.fileData.get(name)!, name);
  }

  /**
   * 将 BAG 条目字节合成为完整 WAV 流。
   * PCM 分支：标准 44 字节 RIFF/WAVE 头 + 原始采样；
   * ADPCM 分支：IMA 头 + fact 声明样本数 + 数据块按 chunkSize 对齐补齐。
   */
  private buildWavData(stream: DataStream, entry: AudioBagEntry): DataStream {
    const out = new DataStream();
    const channels = entry.flags & 1 ? 2 : 1;
    let padBytes = 0;

    if (entry.flags & 2) {
      // 未压缩 PCM16
      out.writeString('RIFF');
      out.writeUint32(entry.length + 36);
      out.writeString('WAVE');
      out.writeString('fmt ');
      out.writeInt32(16);
      out.writeInt16(1); // PCM
      out.writeInt16(channels);
      out.writeUint32(entry.sampleRate);
      out.writeUint32(2 * channels * entry.sampleRate); // 字节率
      out.writeInt16(2 * channels); // 块对齐
      out.writeInt16(16); // 位深
      out.writeString('data');
      out.writeUint32(entry.length);
    } else if (entry.flags & 8) {
      // IMA ADPCM
      const byteRate = 11100 * channels * ((entry.sampleRate / 22050) | 0);
      const blockAlign = entry.chunkSize;
      const factSamples = 1017 * Math.max(2, Math.ceil(entry.length / blockAlign));
      const alignedLen = Math.ceil(entry.length / blockAlign) * blockAlign;
      // 修正：原码先算 n = max(2, ceil(len/s))，再 n = n*s；
      const n = Math.max(2, Math.ceil(entry.length / blockAlign));
      const dataLen = n * blockAlign;
      padBytes = dataLen - entry.length;
      out.writeString('RIFF');
      out.writeUint32(52 + dataLen);
      out.writeString('WAVE');
      out.writeString('fmt ');
      out.writeUint32(20);
      out.writeInt16(17); // IMA ADPCM
      out.writeInt16(channels);
      out.writeUint32(entry.sampleRate);
      out.writeInt32(byteRate);
      out.writeInt16(blockAlign);
      out.writeInt16(4); // bits per sample
      out.writeInt16(2); // cbSize
      out.writeInt16(1017); // samples per block
      out.writeString('fact');
      out.writeUint32(4);
      out.writeInt32(factSamples);
      out.writeString('data');
      out.writeUint32(dataLen);
      // alignedLen 仅用于对齐语义，padBytes 已由 dataLen 表达
      void alignedLen;
    }

    stream.seek(entry.offset);
    out.writeUint8Array(stream.readUint8Array(entry.length));
    for (let i = 0; i < padBytes; i++) out.writeUint8(0);
    out.seek(0);
    // 缓存流不参与 VirtualFile 生命周期裁剪
    out._trimAlloc = () => {};
    return out;
  }
}
