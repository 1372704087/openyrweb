/**
 * OreSpread — 按世界坐标推算矿石 overlay 变体 ID。
 *
 * calculateOverlayId 用 dx/dy 的模 12 伪随机公式（原版确定性图案，
 * 非真随机）在各矿石类型区间起点上加偏移 0..11，得到具体 overlay id。
 * 公式先抬 +120000 再 %12，避免负数取模陷阱。
 *
 * 由 game/map/OreSpread.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { OreOverlayTypes } from "game/map/OreOverlayTypes"; // 已转换
import { TiberiumType } from "engine/type/TiberiumType"; // 已转换

/** 矿石 overlay ID 计算器（仅静态方法）。 */
export class OreSpread {
  /**
   * 根据矿石类型与位置 (dx,dy) 计算 overlay id。
   * @returns 不在已知四类矿石之一时返回 undefined。
   */
  static calculateOverlayId(tiberiumType: TiberiumType, pos: { dx: number; dy: number }): number | undefined {
    const dx = pos.dx;
    const dy = pos.dy;
    // 确定性图案偏移：嵌套 %12 乘积差，+120000 抬升后再取模
    let offset = Math.floor(
      (((((dy - 9) / 2) % 12) * (((dy - 8) / 2) % 12)) % 12) -
        (((((dx - 13) / 2) % 12) * (((dx - 12) / 2) % 12)) % 12) +
        12e4,
    );
    offset %= 12;
    return tiberiumType === TiberiumType.Riparius
      ? OreOverlayTypes.minIdRiparius + offset
      : tiberiumType === TiberiumType.Cruentus
        ? OreOverlayTypes.minIdCruentus + offset
        : tiberiumType === TiberiumType.Vinifera
          ? OreOverlayTypes.minIdVinifera + offset
          : tiberiumType === TiberiumType.Aboreus
            ? OreOverlayTypes.minIdAboreus + offset
            : undefined;
  }
}
