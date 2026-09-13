/**
 * Vector2 — 锁步确定性二维向量。
 *
 * 继承 THREE.Vector2，将三角/开方运算替换为 GameMath 查表版本，保证各客户端
 * 模拟结果逐位一致。由 game/math/Vector2.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { GameMath } from "game/math/GameMath";

export class Vector2 extends THREE.Vector2 {
  /** 模长（GameMath 查表开方）。 */
  length(): number {
    return GameMath.sqrt(this.x * this.x + this.y * this.y);
  }

  /** 方向角 [0, 2π)（GameMath 查表 atan2）。 */
  angle(): number {
    let angle = GameMath.atan2(this.y, this.x);
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
  }

  /** 到 v 的距离（GameMath 查表开方）。 */
  distanceTo(v: THREE.Vector2): number {
    return GameMath.sqrt(this.distanceToSquared(v));
  }

  /** 绕锚点 anchor 逆时针旋转 theta 弧度（原地修改并返回自身）。 */
  rotateAround(anchor: THREE.Vector2, theta: number): this {
    const cos = GameMath.cos(theta);
    const sin = GameMath.sin(theta);
    const dx = this.x - anchor.x;
    const dy = this.y - anchor.y;
    this.x = dx * cos - dy * sin + anchor.x;
    this.y = dx * sin + dy * cos + anchor.y;
    return this;
  }
}
