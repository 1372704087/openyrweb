/**
 * Spherical — 锁步确定性球坐标。
 *
 * 继承 THREE.Spherical，setFromVector3 使用 GameMath.atan2/acos 查表
 * 与 util/math.clamp，保证各客户端结果逐位一致；半径为 0 时 θ=φ=0。
 *
 * 由 game/math/Spherical.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { clamp } from "util/math"; // 已转换
import { GameMath } from "game/math/GameMath"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
const BaseSpherical: any = (THREE as any).Spherical;

export class Spherical extends BaseSpherical {
  /** 笛卡尔向量 → 球坐标（radius / theta / phi），返回 this。 */
  setFromVector3(e: { x: number; y: number; z: number; length(): number }): this {
    this.radius = e.length();
    if (this.radius === 0) {
      this.theta = 0;
      this.phi = 0;
    } else {
      this.theta = GameMath.atan2(e.x, e.z);
      this.phi = GameMath.acos(clamp(e.y / this.radius, -1, 1));
    }
    return this;
  }
}
