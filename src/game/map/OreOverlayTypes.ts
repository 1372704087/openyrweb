/**
 * OreOverlayTypes — 矿石 overlay ID 区间与 Tiberium 类型映射。
 *
 * 四种矿石各占一段 overlay id 区间（含端点），静态方法在区间上判定
 * isXxx / getOverlayTibType，供 OreSpread 与 Harvest 逻辑使用。
 * 注意 Vinifera 上界 146 与 Riparius 上界 127 相邻重叠 127，
 * isRiparius 优先判定（与孪生一致）。
 *
 * 由 game/map/OreOverlayTypes.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { TiberiumType } from "engine/type/TiberiumType"; // 已转换

/** 矿石 overlay 静态查询表（仅静态成员，无实例状态）。 */
export class OreOverlayTypes {
  /** Riparius（主矿）overlay id 下界。 */
  static minIdRiparius = 102;
  /** Riparius overlay id 上界。 */
  static maxIdRiparius = 127;
  /** Cruentus overlay id 下界。 */
  static minIdCruentus = 27;
  /** Cruentus overlay id 上界。 */
  static maxIdCruentus = 38;
  /** Vinifera overlay id 下界。 */
  static minIdVinifera = 127;
  /** Vinifera overlay id 上界。 */
  static maxIdVinifera = 146;
  /** Aboreus overlay id 下界。 */
  static minIdAboreus = 147;
  /** Aboreus overlay id 上界。 */
  static maxIdAboreus = 166;

  /** overlay id → Tiberium 类型；不在任何区间时返回 undefined。 */
  static getOverlayTibType(overlayId: number): TiberiumType | undefined {
    return this.isRiparius(overlayId)
      ? TiberiumType.Riparius
      : this.isCruentus(overlayId)
        ? TiberiumType.Cruentus
        : this.isVinifera(overlayId)
          ? TiberiumType.Vinifera
          : this.isAboreus(overlayId)
            ? TiberiumType.Aboreus
            : undefined;
  }

  static isRiparius(overlayId: number): boolean {
    return overlayId >= this.minIdRiparius && overlayId <= this.maxIdRiparius;
  }

  static isCruentus(overlayId: number): boolean {
    return overlayId >= this.minIdCruentus && overlayId <= this.maxIdCruentus;
  }

  static isVinifera(overlayId: number): boolean {
    return overlayId >= this.minIdVinifera && overlayId <= this.maxIdVinifera;
  }

  static isAboreus(overlayId: number): boolean {
    return overlayId >= this.minIdAboreus && overlayId <= this.maxIdAboreus;
  }
}
