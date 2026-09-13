/**
 * Vector3 — 锁步确定性三维向量。
 *
 * 继承 THREE.Vector3，将三角/开方运算替换为 GameMath 查表版本，保证各客户端
 * 模拟结果逐位一致。由 game/math/Vector3.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { clamp } from "util/math";
import { GameMath } from "game/math/GameMath";
import { Quaternion } from "game/math/Quaternion";

export class Vector3 extends THREE.Vector3 {
  /** 模长（GameMath 查表开方）。 */
  length(): number {
    return GameMath.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /** 欧拉角旋转（旧版 Vector3 兼容入口，内部转四元数）。 */
  applyEuler(euler: THREE.Euler): this {
    if (!euler || !euler.isEuler)
      console.error(
        "THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.",
      );
    return this.applyQuaternion(scratchQuaternion.setFromEuler(euler));
  }

  /** 绕单位轴 axis 旋转 angle 弧度。 */
  applyAxisAngle(axis: THREE.Vector3, angle: number): this {
    return this.applyQuaternion(scratchQuaternion.setFromAxisAngle(axis, angle));
  }

  /** 到 v 的距离（GameMath 查表开方）。 */
  distanceTo(v: THREE.Vector3): number {
    return GameMath.sqrt(this.distanceToSquared(v));
  }

  /** 将自身投影到与法线 normal 垂直的平面上（原地修改）。 */
  projectOnPlane(normal: THREE.Vector3): this {
    scratchVector.copy(this).projectOnVector(normal);
    return this.sub(scratchVector);
  }

  /** 沿法线 normal 镜面反射（原地修改）。 */
  reflect(normal: THREE.Vector3): this {
    return this.sub(scratchVector.copy(normal).multiplyScalar(2 * this.dot(normal)));
  }

  /** 与 v 的夹角 [0, π]（GameMath 查表 acos）。 */
  angleTo(v: THREE.Vector3): number {
    const theta = this.dot(v) / GameMath.sqrt(this.lengthSq() * v.lengthSq());
    return GameMath.acos(clamp(theta, -1, 1));
  }

  /** 球坐标（半径 radius、极角 phi、方位角 theta）→ 笛卡尔坐标。 */
  setFromSpherical(spherical: { radius: number; phi: number; theta: number }): this {
    const sinPhiRadius = GameMath.sin(spherical.phi) * spherical.radius;
    this.x = sinPhiRadius * GameMath.sin(spherical.theta);
    this.y = GameMath.cos(spherical.phi) * spherical.radius;
    this.z = sinPhiRadius * GameMath.cos(spherical.theta);
    return this;
  }

  /** 柱坐标（半径 radius、高度 y、方位角 theta）→ 笛卡尔坐标。 */
  setFromCylindrical(cylindrical: { radius: number; y: number; theta: number }): this {
    this.x = cylindrical.radius * GameMath.sin(cylindrical.theta);
    this.y = cylindrical.y;
    this.z = cylindrical.radius * GameMath.cos(cylindrical.theta);
    return this;
  }
}

/** 模块级暂存对象：applyEuler/applyAxisAngle/projectOnPlane/reflect 复用，避免每帧分配。 */
const scratchQuaternion = new Quaternion();
const scratchVector = new Vector3();
