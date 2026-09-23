/**
 * SidebarPreview — 主菜单侧栏地图预览与标题组件。
 *
 * 折叠/展开带动画；动画停止后在 handleFrame 恢复可见性与帧号。
 *
 * 由 gui/screen/mainMenu/component/SidebarPreview.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { UiComponent } from "gui/jsx/UiComponent"; // 孪生
import { UiObject } from "gui/UiObject"; // 孪生
import { HtmlContainer } from "gui/HtmlContainer"; // 孪生
import {
  MenuSdTopAnimRunner,
} from "gui/screen/mainMenu/component/MenuSdTopAnimRunner"; // 孪生（本组内一并转换）
import { IniSection } from "data/IniSection"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { Animation } from "engine/Animation"; // 已转换
import { SimpleRunner } from "engine/animation/SimpleRunner"; // 已转换
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { SidebarTitle } from "gui/screen/mainMenu/component/SidebarTitle"; // 孪生（本组内一并转换）
import { Engine } from "engine/Engine"; // 已转换
import { BoxedVar } from "util/BoxedVar"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SidebarPreview extends UiComponent {
  /** 动画结束后需刷新可见性。 */
  sidebarPreviewNeedsRefresh = false;
  /** 是否折叠。 */
  closed: any;
  /** 当前预览对象。 */
  preview: any;
  /** 标题。 */
  title: any;
  /** 顶图 sprite。 */
  sidebarTop?: any;
  /** 标题视图。 */
  titleView?: any;
  /** 预览滑入动画 sprite。 */
  sidebarTopPreviewAnim?: any;
  /** 折叠态顶图 sprite。 */
  sidebarTopClosedAnim?: any;
  /** 预览容器。 */
  previewContainer?: any;

  constructor(props?: any) {
    super(props);
    this.sidebarPreviewNeedsRefresh = false;
    this.closed = this.props.closed;
    this.preview = this.props.preview;
    this.title = this.props.title;
  }

  createUiObject(): any {
    let obj = new UiObject(new THREE.Object3D(), new HtmlContainer());
    obj.onFrame.subscribe((frame: any) => this.handleFrame(frame));
    return obj;
  }

  defineChildren() {
    var { sdtpImg, sdtpAnimImg } = this.props;
    var closed = this.closed;
    let preview = this.preview;
    var titleText = this.title || "";
    var ini = new IniSection("");
    let props = new AnimProps(ini, sdtpAnimImg);
    props.loopCount = -1;
    const anim = new Animation(
      props,
      new BoxedVar(Engine.UI_ANIM_SPEED),
    );
    let runner = new SimpleRunner();
    runner.animation = anim;
    const size = this.getPreviewSize();
    return jsx(
      "fragment" as any,
      null,
      jsx("sprite" as any, {
        image: sdtpImg,
        palette: "shell.pal",
        frame: closed ? 0 : 1,
        ref: (e: any) => (this.sidebarTop = e),
      }),
      jsx(HtmlView as any, {
        component: SidebarTitle,
        props: { title: titleText },
        innerRef: (e: any) => (this.titleView = e),
        x: 25,
        y: 3,
        width: 118,
        height: this.closed ? 32 : 18,
      }),
      jsx("sprite" as any, {
        image: "sdwrntmp.shp",
        palette: "shell.pal",
        hidden: true,
        ref: (e: any) => (this.sidebarTopPreviewAnim = e),
        animationRunner: new MenuSdTopAnimRunner(),
      }),
      jsx("sprite" as any, {
        image: sdtpAnimImg,
        palette: "shell2.pal",
        x: 38,
        y: 48,
        hidden: !closed,
        ref: (e: any) => (this.sidebarTopClosedAnim = e),
        animationRunner: runner,
      }),
      jsx("container" as any, {
        hidden: !preview || closed,
        ref: (e: any) => {
          this.previewContainer = e;
          if (preview) this.previewContainer.add(preview);
        },
        x: 12,
        y: 40,
        width: size.width,
        height: size.height,
      }),
    );
  }

  /** 预览区固定尺寸。 */
  getPreviewSize() {
    return { width: 146, height: 112 };
  }

  /** 展开/折叠预览（open=true 展开）。 */
  toggleSidebarPreview(open: boolean): void {
    if (this.closed !== !open) {
      let runner = this.sidebarTopPreviewAnim.getAnimationRunner();
      if (open) runner.slideIn();
      else runner.slideOut();
      this.closed = !open;
      this.sidebarPreviewNeedsRefresh = true;
      this.sidebarTopPreviewAnim.setVisible(true);
      (open ? this.sidebarTopClosedAnim : this.previewContainer).setVisible(
        false,
      );
      this.titleView.setVisible(false);
      this.updateTitleSize();
    }
  }

  /** 替换预览对象。 */
  setPreview(view?: any): void {
    if (this.preview) this.previewContainer.remove(this.preview);
    if (view) this.previewContainer.add(view);
    this.preview = view;
  }

  /** 更新标题并调整高度。 */
  setTitle(title: any): void {
    this.title = title;
    this.titleView.applyOptions((opts: any) => (opts.title = title));
    this.updateTitleSize();
  }

  /** 折叠 32 / 展开 18。 */
  updateTitleSize(): void {
    this.titleView.setSize(
      this.titleView.getSize().width,
      this.closed ? 32 : 18,
    );
  }

  /** 动画停止后恢复可见性与顶图帧。 */
  handleFrame(_frame: any): void {
    if (!this.sidebarPreviewNeedsRefresh) return;
    let runner = this.sidebarTopPreviewAnim.getAnimationRunner();
    if (runner.isStopped()) {
      (this.closed ? this.sidebarTopClosedAnim : this.previewContainer).setVisible(
        true,
      );
      this.sidebarTopPreviewAnim.setVisible(false);
      this.sidebarTop.setFrame(this.closed ? 0 : 1);
      this.titleView.setVisible(true);
      this.sidebarPreviewNeedsRefresh = false;
    }
  }
}
