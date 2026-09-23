/**
 * 几何/角度换算工具（弧度↔度、Vec2/Vec3 方向角、朝向四元数插值）。
 *
 * 由 game/math/geometry.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 三角与 acos 走 GameMath 查表（锁步确定性）；度换算用全局 THREE.Math。
 * three-global.d.ts 未声明 THREE.Math，此处经局部取值规避 ambient 缺口。
 * 模块级暂存对象（lookAt 矩阵、零/上向量、双 Quaternion、原点 Vec2）
 * 在导出之后初始化——与孪生 setters/execute 时序一致。
 */
import { clamp } from "util/math"; // 孪生
import { GameMath } from "game/math/GameMath"; // 孪生
import { Matrix4 } from "game/math/Matrix4"; // 孪生
import { Quaternion } from "game/math/Quaternion"; // 孪生
import { Vector2 } from "game/math/Vector2"; // 孪生
import { Vector3 } from "game/math/Vector3"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 运行时全局 THREE.Math（RAD2DEG/DEG2RAD）。 */
const THREEMath: any = (THREE as any).Math;

/** 弧度 → 度。 */
export function radToDeg(radians: number): number {
  return radians * THREEMath.RAD2DEG;
}

/** 度 → 弧度。 */
export function degToRad(degrees: number): number {
  return degrees * THREEMath.DEG2RAD;
}

/** Vec2 方向角（弧度）四舍五入为整度。 */
export function angleDegFromVec2(v: Vector2): number {
  return Math.round(radToDeg(v.angle()));
}

/** 两 Vec2 方向的最小夹角（0..180 整度）。 */
export function angleDegBetweenVec2(a: Vector2, b: Vector2): number {
  const degA = angleDegFromVec2(a);
  const degB = angleDegFromVec2(b);
  return Math.min((degA - degB + 360) % 360, (degB - degA + 360) % 360);
}

/**
 * Vec2/Vec3 绕原点（模块级 (0,0) 暂存）逆时针旋转 floor(degrees) 度。
 * 运行时只依赖 rotateAround（Vector2/Vector3 同有）；ambient Vector3 未声明
 * rotateAround/setLength，故入参与返回均收窄为 any 以保持 TargetUtil 等调用方
 * 仍按 Vector3 使用（与孪生 any-shim 一致）。
 */
export function rotateVec2(v: any, degrees: number): any {
  const radians = degToRad(Math.floor(degrees));
  return v.rotateAround(ORIGIN_2D as any, radians);
}

/**
 * 两「带点积的对象」的夹角度数（弧度经 radToDeg 后 round）。
 * 孪生 y(e,t) 同时服务 Quaternion 路径与内部 slerp 限幅；
 * Quaternion 运行时未必有 .dot，故对参数按 any 调用，与压缩产物一致。
 */
function angleDegBetweenDirections(from: any, to: any): number {
  const degrees = radToDeg(2 * GameMath.acos(Math.abs(clamp(from.dot(to), -1, 1))));
  return Math.round(degrees);
}

/**
 * 单位朝向 from 就地 slerp 至 to，最大转过 maxRadians。
 * 角差为 0 时跳过；否则 t = min(1, maxRadians / 当前角差)。
 * 注意：角差已是 round 后的度数，再与 maxRadians 做 min——
 * 与孪生把「度」当作归一化因子混用一致。
 */
function slerpDirectionTowards(from: Quaternion, to: Quaternion, maxRadians: number): void {
  let angleDeg = angleDegBetweenDirections(from, to);
  if (0 !== angleDeg) {
    const t = Math.min(1, maxRadians / angleDeg);
    from.slerp(to, t);
  }
}

/**
 * 由 from 指向 to 的 lookAt 四元数写入 target（缺省新 Quaternion）。
 * 复用模块级 lookAt 矩阵与零点/上向量暂存。
 */
export function quaternionFromVec3(from: Vector3, target: Quaternion = new Quaternion()): Quaternion {
  return target.setFromRotationMatrix(LOOK_AT_MATRIX.lookAt(from as any, ZERO_3D as any, UP_3D as any) as any);
}

/** 两 Vec3 方向的最小夹角（整度）。经 lookAt 提取四元数后量角。 */
export function angleDegBetweenVec3(a: Vector3, b: Vector3): number {
  return angleDegBetweenDirections(quaternionFromVec3(a, QUAT_A), quaternionFromVec3(b, QUAT_B));
}

/**
 * 就地将 v 的方向朝 toward 旋转至多 maxRadians 弧度，保持原模长。
 * 流程：记长度 → 两侧转四元数 → slerp 限幅 → 重置为 (0,0,1) 再应用 → 还原长度。
 */
export function rotateVec3Towards(v: Vector3, toward: Vector3, maxRadians: number): void {
  const length = v.length();
  const targetQ = quaternionFromVec3(toward, QUAT_A);
  const currentQ = quaternionFromVec3(v, QUAT_B);
  slerpDirectionTowards(currentQ, targetQ, maxRadians);
  // Vector3.setLength 不在 three-global 最小声明中，经 any 调用与孪生一致
  (v.set(0, 0, 1) as any).applyQuaternion(currentQ as any).setLength(length);
}

// —— 模块级暂存（孪生 execute 阶段初始化；导出绑定在 setters 之后）——
const ORIGIN_2D = new Vector2();
const LOOK_AT_MATRIX = new Matrix4();
const ZERO_3D = new Vector3(0, 0, 0);
const UP_3D = new Vector3(0, 1, 0);
const QUAT_A = new Quaternion();
const QUAT_B = new Quaternion();
