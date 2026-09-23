/**
 * ShpAggregator — 多 SHP 合并（主帧 + 可选阴影半区 → 单一 ShpFile）。
 *
 * 由 engine/renderable/builder/ShpAggregator.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as ShpFileModule from "data/ShpFile"; // 孪生
import * as ShpImageModule from "data/ShpImage"; // 孪生

const ShpFile = (ShpFileModule as any).ShpFile as any;
const ShpImage = (ShpImageModule as any).ShpImage as any;

/** SHP 源最小形状。 */
export interface SourceShp {
  numImages: number;
  getImage(index: number): any;
}

/** 聚合项。 */
export interface AggregateEntry {
  file: SourceShp;
  hasShadow: boolean;
  frameCount?: number;
}

/** 帧信息。 */
export interface ShpFrameInfo {
  file: SourceShp;
  hasShadow: boolean;
  frameCount: number;
}

/** 聚合结果。 */
export interface AggregateResult {
  file: any;
  /** 源 file → 新 file 内起始帧号。 */
  imageIndexes: Map<SourceShp, number>;
}

/**
 * SHP 聚合器：把多个（可含阴影半区的）SHP 拼成一张，
 * 阴影帧放在每个源的 frameCount 之后；无阴影时补空 ShpImage 占位。
 */
export class ShpAggregator {
  /**
   * 计算单源有效帧数（有阴影时为 numImages/2）。
   * @param e - SHP 源
   * @param t - 是否含阴影
   */
  static getShpFrameInfo(e: SourceShp, t: boolean): ShpFrameInfo {
    return {
      file: e,
      hasShadow: t,
      frameCount: Math.floor(e.numImages * (t ? 0.5 : 1)),
    };
  }

  /**
   * 聚合多个源。
   * @param e - 聚合项列表（可含 frameCount 覆盖）
   * @param t - 输出文件名
   */
  aggregate(e: AggregateEntry[], t: string): AggregateResult {
    const i = new ShpFile();
    i.filename = t;
    const r: any[] = [];
    const s = new Map<SourceShp, number>();
    let a = 0;
    for (const { file: n, hasShadow: o, frameCount } of e) {
      if (!s.has(n)) {
        s.set(n, a);
        const l =
          frameCount ?? Math.floor(n.numImages * (o ? 0.5 : 1));
        for (let e2 = 0; e2 < l; e2++) {
          (i.addImage(n.getImage(e2)),
            r.push(o ? n.getImage(l + e2) : new ShpImage()),
            a++);
        }
      }
    }
    r.forEach((img) => i.addImage(img));
    return { file: i, imageIndexes: s };
  }
}
