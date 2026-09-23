/**
 * TmpImage — 单帧 TMP 图块：瓦片索引 + 雷达色 + 可选 extra/z 数据。
 *
 * 数据标志位：ExtraData=1、ZData=2、DamagedData=4（枚举与位掩码同值，
 * 沿用孪生中 e[e.X=n]="X" 的双向映射形态）。
 * 瓦片数据为 (blockW*blockH)/2 字节的 4bpp 索引；可选 z / extra 视图
 * 直接映射到底层 buffer，不拷贝。
 *
 * 由 data/TmpImage.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import type { DataStream } from './DataStream';

declare const THREE: any;

/** TMP 帧可选数据段标志（值同时用作位掩码）。 */
export enum TmpImageFlags {
  ExtraData = 1,
  ZData = 2,
  DamagedData = 4,
}

/** 有符号字节 → 0..255（雷达色分量）。 */
const toByte = (v: number): number => (v < 0 ? v + 256 : v);

export class TmpImage {
  x!: number;
  y!: number;
  extraX!: number;
  extraY!: number;
  extraWidth!: number;
  extraHeight!: number;
  height!: number;
  terrainType!: number;
  rampType!: number;
  radarLeft!: any;
  radarRight!: any;
  tileData!: Uint8Array;
  hasZData = false;
  hasExtraData = false;
  extraData?: Uint8Array;

  constructor(stream: DataStream, blockWidth: number, blockHeight: number) {
    this.fromStream(stream, blockWidth, blockHeight);
  }

  /** 从当前 stream 位置解析一帧（构造器入口）。 */
  fromStream(stream: DataStream, blockWidth: number, blockHeight: number): this {
    this.x = stream.readInt32();
    this.y = stream.readInt32();
    stream.readInt32();
    stream.readInt32();
    const extraOffset = stream.readInt32(); // 旧 extra 偏移，现改为内联追加
    this.extraX = stream.readInt32();
    this.extraY = stream.readInt32();
    this.extraWidth = stream.readInt32();
    this.extraHeight = stream.readInt32();
    const flags = stream.readUint32();

    this.height = stream.readUint8();
    this.terrainType = stream.readUint8();
    this.rampType = stream.readUint8();
    this.radarLeft = this.readRadarRgb(stream.readInt8(), stream.readInt8(), stream.readInt8());
    this.radarRight = this.readRadarRgb(stream.readInt8(), stream.readInt8(), stream.readInt8());
    stream.seek(stream.position + 3); // 保留 3 字节

    const tileBytes = (blockWidth * blockHeight) / 2;
    this.tileData = new Uint8Array(stream.buffer, stream.byteOffset + stream.position, tileBytes);
    stream.position += tileBytes;

    this.hasZData = (flags & TmpImageFlags.ZData) === TmpImageFlags.ZData;
    if (this.hasZData) stream.position += tileBytes;

    this.hasExtraData = (flags & TmpImageFlags.ExtraData) === TmpImageFlags.ExtraData;
    if (this.hasExtraData) {
      const n = Math.abs(this.extraWidth * this.extraHeight);
      this.extraData = new Uint8Array(stream.buffer, stream.byteOffset + stream.position, n);
      stream.position += n;
    }

    // z+extra 且旧 extraOffset 有效时，再跳过一份 extra 大小的填充
    if (
      this.hasZData &&
      this.hasExtraData &&
      extraOffset > 0 &&
      extraOffset < stream.byteLength
    ) {
      stream.position += Math.abs(this.extraWidth * this.extraHeight);
    }
    return this;
  }

  /** 三个有符号分量映射为 0..1 的 Color。 */
  private readRadarRgb(r: number, g: number, b: number): any {
    return new THREE.Color(toByte(r) / 255, toByte(g) / 255, toByte(b) / 255);
  }
}
