/**
 * HtmlView — JSX intrinsic `container` 之外的 React 视口包装。
 *
 * createUiObject 用 HtmlReactElement.factory 挂组件，套 UiObject；
 * getElement 返回其 HtmlContainer；支持 innerRef 回调。
 *
 * 由 gui/jsx/HtmlView.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { UiComponent } from "gui/jsx/UiComponent"; // 孪生（本批内一并转换）
import { UiObject } from "gui/UiObject"; // 孪生（本批内一并转换）
import { HtmlReactElement } from "gui/HtmlReactElement"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** HtmlView 组件。 */
export class HtmlView extends UiComponent {
  /**
   * 由 props 建 UiObject（x/y/width/height/hidden 可选）。
   * @param props - {component,props,x,y,width,height,hidden,innerRef}
   */
  createUiObject(props: any): any {
    const htmlEl = HtmlReactElement.factory(props.component, props.props);
    htmlEl.setSize(props.width || 0, props.height || 0);
    const obj = new UiObject(new THREE.Object3D(), htmlEl);
    obj.setPosition(props.x || 0, props.y || 0);
    if (props.hidden) obj.setVisible(false);
    props.innerRef?.(htmlEl);
    return obj;
  }

  /** 返回 HTML 容器。 */
  getElement(): any {
    return this.getUiObject().getHtmlContainer();
  }
}
