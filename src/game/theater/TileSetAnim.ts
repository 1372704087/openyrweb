/**
 * TileSetAnim — 地块附加动画定义（TileNAnim / AttachesTo / XOffset / YOffset）。
 *
 * 由 game/theater/TileSetAnim.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 地块附加动画。 */
export class TileSetAnim {
  /** 动画名（TileNAnim=）。 */
  name: any;
  /** 挂接的子 tile 序号（TileNAttachesTo=）。 */
  subTile: any;
  /** X 偏移。 */
  offsetX: any;
  /** Y 偏移。 */
  offsetY: any;

  constructor(name: any, subTile: any, offsetX: any, offsetY: any) {
    this.name = name;
    this.subTile = subTile;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }
}
