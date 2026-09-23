/**
 * Cylindrical — 柱坐标（在 THREE.Cylindrical 上补充从向量赋值）。
 *
 * setFromVector3 用 GameMath 查表三角/开方，保证锁步确定性与 Vector3 一致。
 * 由 game/math/Cylindrical.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameMath } from "game/math/GameMath"; // 已转换

// ambient THREE 中未声明 Cylindrical，经 any 继承运行时类（行为与孪生一致）。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Cylindrical extends (THREE as any).Cylindrical {
  /** 径向距离。 */
  radius: number;
  /** 方位角（弧度）。 */
  theta: number;
  /** 高度。 */
  y: number;

  /** 由笛卡尔向量设置 radius/theta/y（GameMath 查表），返回自身。 */
  setFromVector3(v: THREE.Vector3): this {
    this.radius = GameMath.sqrt(v.x * v.x + v.z * v.z);
    this.theta = GameMath.atan2(v.x, v.z);
    this.y = v.y;
    return this;
  }
}
