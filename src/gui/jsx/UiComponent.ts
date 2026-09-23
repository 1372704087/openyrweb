/**
 * UiComponent — JSX 组件基类：构造时 createUiObject，暴露 getUiObject。
 *
 * 由 gui/jsx/UiComponent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** UiComponent。 */
export class UiComponent {
  /** 组件 props。 */
  props: any;
  /** 对应 UiObject（ctor 创建）。 */
  uiObject: any;

  /**
   * @param props - JSX props
   */
  constructor(props: any) {
    this.props = props;
    this.uiObject = this.createUiObject(props);
  }

  /** 对应 UiObject。 */
  getUiObject(): any {
    return this.uiObject;
  }

  /**
   * 子类实现：由 props 建 UiObject。
   * @param props - JSX props
   */
  createUiObject(props: any): any {
    throw new Error("createUiObject not implemented");
  }
}
