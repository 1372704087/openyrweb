/**
 * AmmoTrait — 弹药管理（ammo 钳制在 [0, maxAmmo]，isFull 查询）。
 *
 * 挂在有弹药的单位上：setter 写入时经 util/math.clamp 钳制上下界，
 * 避免负弹药或超上限；isFull 供武器/装填逻辑判断是否满弹。
 *
 * 由 game/gameobject/trait/AmmoTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import * as math from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AmmoTrait {
  /** 弹药上限。 */
  maxAmmo: any;
  /** 当前弹药（经 setter 钳制到 [0, maxAmmo]）。 */
  private _ammo: any;

  /**
   * @param maxAmmo 弹药上限
   * @param ammo 初始弹药，默认与上限相同（满弹）
   */
  constructor(maxAmmo: any, ammo: any = maxAmmo) {
    this.maxAmmo = maxAmmo;
    this.ammo = ammo;
  }

  /** 当前弹药读取。 */
  get ammo() {
    return this._ammo;
  }

  /** 写入弹药：钳制到 [0, maxAmmo]。 */
  set ammo(v: number) {
    this._ammo = math.clamp(v, 0, this.maxAmmo);
  }

  /** 是否满弹。 */
  isFull() {
    return this.ammo === this.maxAmmo;
  }
}
