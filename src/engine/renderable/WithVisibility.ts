/**
 * WithVisibility — 可见性混入：维护 visible 标志并同步到目标 3D 对象。
 *
 * 由 engine/renderable/WithVisibility.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/** 持有可见性目标的最小形状（可拿到 Object3D）。 */
export interface VisibilityTargetLike {
  get3DObject(): any;
}

/**
 * 可见性混入类。
 * applyTo 绑定目标后，setVisible / updateVisibility 会把 visible 写到 Object3D。
 */
export class WithVisibility {
  /** 当前是否可见（默认 true）。 */
  visible = true;

  /** 绑定的渲染目标（可选）。 */
  private target?: VisibilityTargetLike;

  /**
   * 设置可见性并立刻同步到目标。
   * @param e - 新的可见性
   */
  setVisible(e: boolean): void {
    (this.visible = e), this.updateVisibility();
  }

  /** 读取当前可见性。 */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * 把 this.visible 同步到目标 Object3D。
   * 无目标或无 Object3D 时静默跳过。
   */
  updateVisibility(): void {
    if (this.target) {
      const e = this.target.get3DObject();
      if (e) e.visible = this.visible;
    }
  }

  /**
   * 绑定可见性目标并立即同步一次。
   * @param e - 目标对象
   */
  applyTo(e: VisibilityTargetLike): void {
    (this.target = e), this.updateVisibility();
  }
}
