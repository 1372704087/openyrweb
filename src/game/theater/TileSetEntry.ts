/**
 * TileSetEntry — TileSet 内的单个 tile 条目（下标 index + 各变体 TMP 文件）。
 *
 * getTmpFile 选择 damaged 分支时返回 files[0|1]（取决于 third 参数）；
 * getRelativeTilePositions 把第一帧图像的像素坐标换算为相对 tile 坐标。
 *
 * 由 game/theater/TileSetEntry.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 单 tile 条目。 */
export class TileSetEntry {
  /** 所属 TileSet。 */
  owner: any;
  /** 集合内下标（0-based）。 */
  index: any;
  /** 各变体文件（normal/damaged 等，按加载顺序 push）。 */
  files: any[];
  /** 可选附加动画。 */
  animation: any;

  constructor(owner: any, index: any) {
    this.owner = owner;
    this.index = index;
    this.files = [];
  }

  /** 追加一个 TMP 变体文件。 */
  addFile(file: any): void {
    this.files.push(file);
  }

  /** 挂接附加动画。 */
  setAnimation(anim: any): void {
    this.animation = anim;
  }

  /** 取附加动画（可能 undefined）。 */
  getAnimation(): any {
    return this.animation;
  }

  /**
   * 取变体文件。
   * @param subTile - 子图序号（用于 hasDamagedData 探测）
   * @param pick - 孪生以 (0, files.length-1) 为参调用的选择函数/值
   * @param preferDamaged - 为 true 时 damaged 格索引取 1，否则 0
   */
  getTmpFile(subTile: any, pick: any, preferDamaged = false): any {
    if (this.files.length) {
      // 孪生：r = this.files[pick(0, len-1)]，pick 返回下标
      const file = this.files[pick(0, this.files.length - 1)];
      return file.images[Math.min(subTile, file.images.length - 1)].hasDamagedData
        ? this.files[Math.min(preferDamaged ? 1 : 0, this.files.length - 1)]
        : file;
    }
  }

  /** 第一帧图像 → 相对 tile 坐标列表（isometric 反变换 / ISO_TILE_SIZE）。 */
  getRelativeTilePositions(): any[] {
    return this.files[0].images.map(({ x, y, height }: any, subTile: any) => ({
      subTile: subTile,
      rx: (x + 2 * y) / 2 / Coords.ISO_TILE_SIZE,
      ry: (2 * y - x) / 2 / Coords.ISO_TILE_SIZE,
      z: height,
    }));
  }
}
