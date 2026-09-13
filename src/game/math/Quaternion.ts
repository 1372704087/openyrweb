/**
 * Quaternion — 锁步确定性四元数。
 *
 * 继承 THREE.Quaternion，将三角运算替换为 GameMath 查表版本，保证各客户端
 * 模拟结果逐位一致。由 game/math/Quaternion.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { GameMath } from "game/math/GameMath";

export class Quaternion extends THREE.Quaternion {
  /** 欧拉角（XYZ/YXZ/ZXY/ZYX/YZX/XZY 旋转序）→ 四元数；update 为 false 时跳过回调。 */
  setFromEuler(euler: THREE.Euler, update?: boolean): this {
    if (!euler || !euler.isEuler)
      throw new Error(
        "THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.",
      );
    const sinX = GameMath.sin(euler.x / 2);
    const sinY = GameMath.sin(euler.y / 2);
    const sinZ = GameMath.sin(euler.z / 2);
    const cosX = GameMath.cos(euler.x / 2);
    const cosY = GameMath.cos(euler.y / 2);
    const cosZ = GameMath.cos(euler.z / 2);
    switch (euler.order) {
      case "XYZ":
        this._x = sinX * cosY * cosZ + cosX * sinY * sinZ;
        this._y = cosX * sinY * cosZ - sinX * cosY * sinZ;
        this._z = cosX * cosY * sinZ + sinX * sinY * cosZ;
        this._w = cosX * cosY * cosZ - sinX * sinY * sinZ;
        break;
      case "YXZ":
        this._x = sinX * cosY * cosZ + cosX * sinY * sinZ;
        this._y = cosX * sinY * cosZ - sinX * cosY * sinZ;
        this._z = cosX * cosY * sinZ - sinX * sinY * cosZ;
        this._w = cosX * cosY * cosZ + sinX * sinY * sinZ;
        break;
      case "ZXY":
        this._x = sinX * cosY * cosZ - cosX * sinY * sinZ;
        this._y = cosX * sinY * cosZ + sinX * cosY * sinZ;
        this._z = cosX * cosY * sinZ + sinX * sinY * cosZ;
        this._w = cosX * cosY * cosZ - sinX * sinY * sinZ;
        break;
      case "ZYX":
        this._x = sinX * cosY * cosZ - cosX * sinY * sinZ;
        this._y = cosX * sinY * cosZ + sinX * cosY * sinZ;
        this._z = cosX * cosY * sinZ - sinX * sinY * cosZ;
        this._w = cosX * cosY * cosZ + sinX * sinY * sinZ;
        break;
      case "YZX":
        this._x = sinX * cosY * cosZ + cosX * sinY * sinZ;
        this._y = cosX * sinY * cosZ + sinX * cosY * sinZ;
        this._z = cosX * cosY * sinZ - sinX * sinY * cosZ;
        this._w = cosX * cosY * cosZ - sinX * sinY * sinZ;
        break;
      case "XZY":
        this._x = sinX * cosY * cosZ - cosX * sinY * sinZ;
        this._y = cosX * sinY * cosZ - sinX * cosY * sinZ;
        this._z = cosX * cosY * sinZ + sinX * sinY * cosZ;
        this._w = cosX * cosY * cosZ + sinX * sinY * sinZ;
        break;
    }
    if (update !== false) this.onChangeCallback();
    return this;
  }

  /** 绕单位轴 axis 旋转 angle 弧度 → 四元数。 */
  setFromAxisAngle(axis: THREE.Vector3, angle: number): this {
    const halfAngle = angle / 2;
    const sinHalf = GameMath.sin(halfAngle);
    this._x = axis.x * sinHalf;
    this._y = axis.y * sinHalf;
    this._z = axis.z * sinHalf;
    this._w = GameMath.cos(halfAngle);
    this.onChangeCallback();
    return this;
  }

  /** 从旋转矩阵（仅读取旋转部分）提取四元数。 */
  setFromRotationMatrix(matrix: THREE.Matrix4): this {
    const elements = matrix.elements;
    const m11 = elements[0],
      m12 = elements[4],
      m13 = elements[8],
      m21 = elements[1],
      m22 = elements[5],
      m23 = elements[9],
      m31 = elements[2],
      m32 = elements[6],
      m33 = elements[10];
    const trace = m11 + m22 + m33;
    let scale: number;
    if (trace > 0) {
      scale = 0.5 / GameMath.sqrt(trace + 1);
      this._w = 0.25 / scale;
      this._x = (m32 - m23) * scale;
      this._y = (m13 - m31) * scale;
      this._z = (m21 - m12) * scale;
    } else if (m22 < m11 && m33 < m11) {
      scale = 2 * GameMath.sqrt(1 + m11 - m22 - m33);
      this._w = (m32 - m23) / scale;
      this._x = 0.25 * scale;
      this._y = (m12 + m21) / scale;
      this._z = (m13 + m31) / scale;
    } else if (m33 < m22) {
      scale = 2 * GameMath.sqrt(1 + m22 - m11 - m33);
      this._w = (m13 - m31) / scale;
      this._x = (m12 + m21) / scale;
      this._y = 0.25 * scale;
      this._z = (m23 + m32) / scale;
    } else {
      scale = 2 * GameMath.sqrt(1 + m33 - m11 - m22);
      this._w = (m21 - m12) / scale;
      this._x = (m13 + m31) / scale;
      this._y = (m23 + m32) / scale;
      this._z = 0.25 * scale;
    }
    this.onChangeCallback();
    return this;
  }

  /** 四元数模长（GameMath 查表开方）。 */
  length(): number {
    return GameMath.sqrt(
      this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w,
    );
  }

  /** 球面插值：t=0 返回自身，t=1 返回 qb；自动处理反向四元数与小角退化。 */
  slerp(qb: THREE.Quaternion, t: number): this {
    if (t === 0) return this;
    if (t === 1) return this.copy(qb);
    const x = this._x,
      y = this._y,
      z = this._z,
      w = this._w;
    let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;
    if (cosHalfTheta < 0) {
      this._w = -qb._w;
      this._x = -qb._x;
      this._y = -qb._y;
      this._z = -qb._z;
      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(qb);
    }
    if (cosHalfTheta >= 1) {
      this._w = w;
      this._x = x;
      this._y = y;
      this._z = z;
      return this;
    }
    const sinHalfTheta = 1 - cosHalfTheta * cosHalfTheta;
    if (sinHalfTheta <= Number.EPSILON) {
      const s = 1 - t;
      this._w = s * w + t * this._w;
      this._x = s * x + t * this._x;
      this._y = s * y + t * this._y;
      this._z = s * z + t * this._z;
      return this.normalize();
    }
    const halfTheta = GameMath.sqrt(sinHalfTheta);
    const theta = GameMath.atan2(halfTheta, cosHalfTheta);
    const scale0 = GameMath.sin((1 - t) * theta) / halfTheta;
    const scale1 = GameMath.sin(t * theta) / halfTheta;
    this._w = w * scale0 + this._w * scale1;
    this._x = x * scale0 + this._x * scale1;
    this._y = y * scale0 + this._y * scale1;
    this._z = z * scale0 + this._z * scale1;
    this.onChangeCallback();
    return this;
  }
}
