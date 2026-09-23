/**
 * Euler — 锁步确定性欧拉角。
 *
 * 继承 THREE.Euler，覆盖 setFromRotationMatrix（六种旋转序 + GameMath
 * 查表三角）、reorder、toVector3。模块级暂存 Quaternion 供 reorder 复用。
 *
 * 由 game/math/Euler.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { clamp } from "util/math"; // 已转换
import { GameMath } from "game/math/GameMath"; // 已转换
import { Quaternion } from "game/math/Quaternion"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
/** THREE.Euler 的 _x/_y/_z/_order 与回调在 ambient 中可能未声明，统一经此访问。 */
type EulerInternals = {
  _x: number;
  _y: number;
  _z: number;
  _order: string;
  onChangeCallback(): void;
  setFromQuaternion(q: THREE.Quaternion, order?: string, update?: boolean): Euler;
};

export class Euler extends THREE.Euler {
  constructor(...args: any[]) {
    super(...args);
    this.isEuler = true;
  }

  /**
   * 从旋转矩阵提取欧拉角（XYZ/YXZ/ZXY/ZYX/YZX/XZY）。
   * update 为 false 时不触发 onChangeCallback。
   */
  setFromRotationMatrix(matrix: THREE.Matrix4, order?: string, update?: boolean): this {
    const te = matrix.elements;
    const m11 = te[0],
      m12 = te[4],
      m13 = te[8];
    const m21 = te[1],
      m22 = te[5],
      m23 = te[9];
    const m31 = te[2],
      m32 = te[6],
      m33 = te[10];
    const self = this as unknown as EulerInternals;
    order = order || self._order;
    if (order === "XYZ") {
      self._y = GameMath.asin(clamp(m13, -1, 1));
      if (Math.abs(m13) < 0.99999) {
        self._x = GameMath.atan2(-m23, m33);
        self._z = GameMath.atan2(-m12, m11);
      } else {
        self._x = GameMath.atan2(m32, m22);
        self._z = 0;
      }
    } else if (order === "YXZ") {
      self._x = GameMath.asin(-clamp(m23, -1, 1));
      if (Math.abs(m23) < 0.99999) {
        self._y = GameMath.atan2(m13, m33);
        self._z = GameMath.atan2(m21, m22);
      } else {
        self._y = GameMath.atan2(-m31, m11);
        self._z = 0;
      }
    } else if (order === "ZXY") {
      self._x = GameMath.asin(clamp(m32, -1, 1));
      if (Math.abs(m32) < 0.99999) {
        self._y = GameMath.atan2(-m31, m33);
        self._z = GameMath.atan2(-m12, m22);
      } else {
        self._y = 0;
        self._z = GameMath.atan2(m21, m11);
      }
    } else if (order === "ZYX") {
      self._y = GameMath.asin(-clamp(m31, -1, 1));
      if (Math.abs(m31) < 0.99999) {
        self._x = GameMath.atan2(m32, m33);
        self._z = GameMath.atan2(m21, m11);
      } else {
        self._x = 0;
        self._z = GameMath.atan2(-m12, m22);
      }
    } else if (order === "YZX") {
      self._z = GameMath.asin(clamp(m21, -1, 1));
      if (Math.abs(m21) < 0.99999) {
        self._x = GameMath.atan2(-m23, m22);
        self._y = GameMath.atan2(-m31, m11);
      } else {
        self._x = 0;
        self._y = GameMath.atan2(m13, m33);
      }
    } else if (order === "XZY") {
      self._z = GameMath.asin(-clamp(m12, -1, 1));
      if (Math.abs(m12) < 0.99999) {
        self._x = GameMath.atan2(m32, m22);
        self._y = GameMath.atan2(m13, m11);
      } else {
        self._x = GameMath.atan2(-m23, m33);
        self._y = 0;
      }
    } else {
      console.warn("THREE.Euler: .setFromRotationMatrix() given unsupported order: " + order);
    }
    self._order = order;
    if (update !== false) self.onChangeCallback();
    return this;
  }

  /** 换旋转序（经四元数中转，与孪生共用模块级临时 Quaternion）。 */
  reorder(order: string): this {
    scratchQuat.setFromEuler(this);
    return (this as unknown as EulerInternals).setFromQuaternion(scratchQuat as never, order) as this;
  }

  /** 转 Vector3；target 给定则写入并返回，否则新建。 */
  toVector3(target?: Vector3): Vector3 {
    const { _x, _y, _z } = this as unknown as EulerInternals;
    return target ? target.set(_x, _y, _z) : new Vector3(_x, _y, _z);
  }
}

/** 模块级暂存四元数：reorder 复用，避免每次分配。 */
const scratchQuat = new Quaternion();
