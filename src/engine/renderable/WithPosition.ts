/**
 * WithPosition — 位置混入：维护 Vector3 位置并同步到目标 3D 对象。
 *
 * 由 engine/renderable/WithPosition.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

declare const THREE: any;

/** 持有位置目标的最小形状。 */
export interface PositionTargetLike {
  get3DObject(): any;
}

/**
 * 位置混入类。
 * applyTo 绑定后 setPosition / updatePosition 写入 Object3D.position；
 * matrixUpdate 为 true 时额外同步 matrix 并标记 matrixWorldNeedsUpdate。
 */
export class WithPosition {
  /** 是否需要额外同步 local matrix（默认 false）。 */
  matrixUpdate = false;

  /** 逻辑位置（THREE.Vector3）。 */
  position: any;

  /** 绑定的渲染目标（可选）。 */
  private target?: PositionTargetLike;

  constructor() {
    (this.matrixUpdate = false), (this.position = new THREE.Vector3());
  }

  /**
   * 设置位置并立刻同步。
   * @param e - x
   * @param t - y
   * @param i - z
   */
  setPosition(e: number, t: number, i: number): void {
    (this.position.x = e),
      (this.position.y = t),
      (this.position.z = i),
      this.updatePosition();
  }

  /** 读取当前逻辑位置向量。 */
  getPosition(): any {
    return this.position;
  }

  /**
   * 把 this.position 写入目标 Object3D。
   * matrixUpdate 为真时同步 matrix.setPosition 并置 matrixWorldNeedsUpdate。
   */
  updatePosition(): void {
    if (this.target) {
      const e = this.target.get3DObject();
      if (e) {
        e.position.set(this.position.x, this.position.y, this.position.z);
        if (this.matrixUpdate) {
          e.matrix.setPosition(e.position);
          e.matrixWorldNeedsUpdate = true;
        }
      }
    }
  }

  /**
   * 绑定位置目标并立即同步一次。
   * @param e - 目标对象
   */
  applyTo(e: PositionTargetLike): void {
    (this.target = e), this.updatePosition();
  }
}
