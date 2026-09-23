/**
 * Matrix4 — 锁步确定性 4×4 矩阵。
 *
 * 继承 THREE.Matrix4，将三角/开方替换为 GameMath 查表版本，保证各客户端
 * 模拟结果逐位一致。由 game/math/Matrix4.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * ambient THREE 声明较窄（仅 elements 等），运行时类还有 set/copy/
 * setFromMatrixColumn 等；本文件在调用点经 any 断言，不改动组外 d.ts。
 */
import { GameMath } from "game/math/GameMath"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Matrix4 extends THREE.Matrix4 {
  /** 从 m 提取纯旋转分量（各列归一化后写入 this）。 */
  extractRotation(m: THREE.Matrix4): this {
    const te = this.elements;
    const me = m.elements;
    const scaleX = 1 / (_v1 as any).setFromMatrixColumn(m, 0).length();
    const scaleY = 1 / (_v1 as any).setFromMatrixColumn(m, 1).length();
    const scaleZ = 1 / (_v1 as any).setFromMatrixColumn(m, 2).length();
    te[0] = me[0] * scaleX;
    te[1] = me[1] * scaleX;
    te[2] = me[2] * scaleX;
    te[3] = 0;
    te[4] = me[4] * scaleY;
    te[5] = me[5] * scaleY;
    te[6] = me[6] * scaleY;
    te[7] = 0;
    te[8] = me[8] * scaleZ;
    te[9] = me[9] * scaleZ;
    te[10] = me[10] * scaleZ;
    te[11] = 0;
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;
    return this;
  }

  /** 由欧拉角构造旋转矩阵（支持 XYZ/YXZ/ZXY/ZYX/YZX/XZY 六种顺序）。 */
  makeRotationFromEuler(euler: THREE.Euler): this {
    if (!euler || !euler.isEuler)
      console.error(
        "THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.",
      );
    const te = this.elements;
    let a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number;
    let x: number, y: number, z: number;
    let cosX: number, sinX: number, cosY: number, sinY: number, cosZ: number, sinZ: number;
    x = euler.x;
    y = euler.y;
    z = euler.z;
    cosX = GameMath.cos(x);
    sinX = GameMath.sin(x);
    cosY = GameMath.cos(y);
    sinY = GameMath.sin(y);
    cosZ = GameMath.cos(z);
    sinZ = GameMath.sin(z);
    if (euler.order === "XYZ") {
      const ae = cosX * cosZ;
      const af = cosX * sinZ;
      const be = sinX * cosZ;
      const bf = sinX * sinZ;
      te[0] = cosY * cosZ;
      te[4] = -cosY * sinZ;
      te[8] = sinY;
      te[1] = af + be * sinY;
      te[5] = ae - bf * sinY;
      te[9] = -sinX * cosY;
      te[2] = bf - ae * sinY;
      te[6] = be + af * sinY;
      te[10] = cosX * cosY;
    } else if (euler.order === "YXZ") {
      const ce = cosY * cosZ;
      const cf = cosY * sinZ;
      const de = sinY * cosZ;
      const df = sinY * sinZ;
      te[0] = ce + df * sinX;
      te[4] = de * sinX - cf;
      te[8] = cosX * sinY;
      te[1] = cosX * sinZ;
      te[5] = cosX * cosZ;
      te[9] = -sinX;
      te[2] = cf * sinX - de;
      te[6] = df + ce * sinX;
      te[10] = cosX * cosY;
    } else if (euler.order === "ZXY") {
      const ce = cosY * cosZ;
      const cf = cosY * sinZ;
      const de = sinY * cosZ;
      const df = sinY * sinZ;
      te[0] = ce - df * sinX;
      te[4] = -cosX * sinZ;
      te[8] = de + cf * sinX;
      te[1] = cf + de * sinX;
      te[5] = cosX * cosZ;
      te[9] = df - ce * sinX;
      te[2] = -cosX * sinY;
      te[6] = sinX;
      te[10] = cosX * cosY;
    } else if (euler.order === "ZYX") {
      const ae = cosX * cosZ;
      const af = cosX * sinZ;
      const be = sinX * cosZ;
      const bf = sinX * sinZ;
      te[0] = cosY * cosZ;
      te[4] = be * sinY - af;
      te[8] = ae * sinY + bf;
      te[1] = cosY * sinZ;
      te[5] = bf * sinY + ae;
      te[9] = af * sinY - be;
      te[2] = -sinY;
      te[6] = sinX * cosY;
      te[10] = cosX * cosY;
    } else if (euler.order === "YZX") {
      const ac = cosX * cosY;
      const ad = cosX * sinY;
      const bc = sinX * cosY;
      const bd = sinX * sinY;
      te[0] = cosY * cosZ;
      te[4] = bd - ac * sinZ;
      te[8] = bc * sinZ + ad;
      te[1] = sinZ;
      te[5] = cosX * cosZ;
      te[9] = -sinX * cosZ;
      te[2] = -sinY * cosZ;
      te[6] = ad * sinZ + bc;
      te[10] = ac - bd * sinZ;
    } else if (euler.order === "XZY") {
      const ac = cosX * cosY;
      const ad = cosX * sinY;
      const bc = sinX * cosY;
      const bd = sinX * sinY;
      te[0] = cosY * cosZ;
      te[4] = -sinZ;
      te[8] = sinY * cosZ;
      te[1] = ac * sinZ + bd;
      te[5] = cosX * cosZ;
      te[9] = ad * sinZ - bc;
      te[2] = bc * sinZ - ad;
      te[6] = sinX * sinZ;
      te[10] = bd * sinZ + ac;
    }
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;
    return this;
  }

  /** 由 eye/target/up 构造视图矩阵（lookAt 约定）。 */
  lookAt(eye: THREE.Vector3, target: THREE.Vector3, up: THREE.Vector3): this {
    const zx = _x as any;
    const yy = _y as any;
    const zz = _z as any;
    zx.set(0, 0, 0);
    yy.set(0, 0, 0);
    zz.set(0, 0, 0);
    const te = this.elements;
    zz.subVectors(eye, target);
    if (zz.lengthSq() === 0) zz.z = 1;
    zz.normalize();
    zx.crossVectors(up, zz);
    if (zx.lengthSq() === 0) {
      if (Math.abs(up.z) === 1) zz.x += 1e-4;
      else zz.z += 1e-4;
      zz.normalize();
      zx.crossVectors(up, zz);
    }
    zx.normalize();
    yy.crossVectors(zz, zx);
    te[0] = zx.x;
    te[4] = yy.x;
    te[8] = zz.x;
    te[1] = zx.y;
    te[5] = yy.y;
    te[9] = zz.y;
    te[2] = zx.z;
    te[6] = yy.z;
    te[10] = zz.z;
    return this;
  }

  /** 三条轴向缩放分量的最大值（用于 mipmap/LOD）。 */
  getMaxScaleOnAxis(): number {
    const te = this.elements;
    const x = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    const y = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    const z = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
    return GameMath.sqrt(Math.max(x, y, z));
  }

  /** 绕 X 轴旋转 angle 弧度的旋转矩阵。 */
  makeRotationX(angle: number): this {
    const cos = GameMath.cos(angle);
    const sin = GameMath.sin(angle);
    return (this as any).set(1, 0, 0, 0, 0, cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1);
  }

  /** 绕 Y 轴旋转 angle 弧度的旋转矩阵。 */
  makeRotationY(angle: number): this {
    const cos = GameMath.cos(angle);
    const sin = GameMath.sin(angle);
    return (this as any).set(cos, 0, sin, 0, 0, 1, 0, 0, -sin, 0, cos, 0, 0, 0, 0, 1);
  }

  /** 绕 Z 轴旋转 angle 弧度的旋转矩阵。 */
  makeRotationZ(angle: number): this {
    const cos = GameMath.cos(angle);
    const sin = GameMath.sin(angle);
    return (this as any).set(cos, -sin, 0, 0, sin, cos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  /** 绕任意单位轴 axis 旋转 angle 弧度的旋转矩阵。 */
  makeRotationAxis(axis: THREE.Vector3, angle: number): this {
    const c = GameMath.cos(angle);
    const s = GameMath.sin(angle);
    const t = 1 - c;
    const x = axis.x;
    const y = axis.y;
    const z = axis.z;
    const tx = t * x;
    const ty = t * y;
    return (this as any).set(
      tx * x + c,
      tx * y - s * z,
      tx * z + s * y,
      0,
      tx * y + s * z,
      ty * y + c,
      ty * z - s * x,
      0,
      tx * z - s * y,
      ty * z + s * x,
      t * z * z + c,
      0,
      0,
      0,
      0,
      1,
    );
  }

  /** 分解为 position/quaternion/scale（行列式为负时 scaleX 取反）。 */
  decompose(position: THREE.Vector3, quaternion: THREE.Quaternion, scale: THREE.Vector3): this {
    const te = this.elements;
    const v1 = _v1 as any;
    let sx = v1.set(te[0], te[1], te[2]).length();
    const sy = v1.set(te[4], te[5], te[6]).length();
    const sz = v1.set(te[8], te[9], te[10]).length();
    if ((this as any).determinant() < 0) sx = -sx;
    position.x = te[12];
    position.y = te[13];
    position.z = te[14];
    (_m1 as any).copy(this);
    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;
    _m1.elements[0] *= invSX;
    _m1.elements[1] *= invSX;
    _m1.elements[2] *= invSX;
    _m1.elements[4] *= invSY;
    _m1.elements[5] *= invSY;
    _m1.elements[6] *= invSY;
    _m1.elements[8] *= invSZ;
    _m1.elements[9] *= invSZ;
    _m1.elements[10] *= invSZ;
    (quaternion as any).setFromRotationMatrix(_m1);
    scale.x = sx;
    scale.y = sy;
    scale.z = sz;
    return this;
  }
}

/** 模块级暂存：列归一化/lookAt/轴分解复用，避免每帧分配。 */
const _v1 = new Vector3();
const _x = new Vector3();
const _y = new Vector3();
const _z = new Vector3();
const _m1 = new Matrix4();
