/**
 * SidebarCredits — 侧栏资金滚动显示（按差值调速的动画补间）。
 *
 * 由 gui/screen/game/component/hud/SidebarCredits.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import * as UiTextModule from "gui/component/UiText"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiObject: any = (UiObjectModule as any).UiObject;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const UiText: any = (UiTextModule as any).UiText;

/** 侧栏资金显示。 */
export class SidebarCredits extends UiComponent {
  /** 文本子组件。 */
  text: any;
  /** 目标资金。 */
  targetCredits: number | undefined;
  /** 当前渲染资金。 */
  renderedCredits: number | undefined;
  /** 每 ms 补间速度。 */
  tickSpeed = 0;
  /** 上次刷新。 */
  lastUpdate: number | undefined;
  /** 上次对齐。 */
  lastLeftAligned: any;

  /** 根对象。 */
  createUiObject(): any {
    return new UiObject(new THREE.Object3D(), new HtmlContainer());
  }

  /** 挂 UiText。 */
  defineChildren(): any {
    const { textColor, width, height, zIndex } = this.props;
    return jsx(UiText, {
      ref: (e: any) => (this.text = e),
      value: "",
      textColor,
      width,
      height,
      zIndex,
    });
  }

  /**
   * 50ms 节流；按差值动态调整补间速度。
   * @param now 帧时间
   */
  onFrame(now: number): void {
    const {
      sidebarModel: { credits, topTextLeftAlign },
    } = this.props;
    if (this.targetCredits !== credits) {
      this.targetCredits = credits;
      const delta = Math.abs(credits - (this.renderedCredits ?? 0));
      const duration = THREE.Math.lerp(300, 2e3, Math.min(1, delta / 5e3));
      this.tickSpeed = delta / duration;
    }
    const speed = this.tickSpeed;
    if (this.lastUpdate && now - this.lastUpdate < 50) return;
    const elapsed = this.lastUpdate ? now - this.lastUpdate : 0;
    this.lastUpdate = now;
    if (this.renderedCredits !== credits) {
      if (this.renderedCredits === void 0) {
        this.renderedCredits = 0;
      } else {
        const diff = credits - this.renderedCredits;
        const step = speed * elapsed;
        this.renderedCredits +=
          Math.abs(diff) >= step ? Math.sign(diff) * step : diff;
        this.props.onTick(Math.sign(diff) === 1 ? "up" : "down");
      }
      this.text.setValue("" + Math.floor(this.renderedCredits));
    }
    if (topTextLeftAlign !== this.lastLeftAligned) {
      if (topTextLeftAlign) {
        this.text.setTextAlign("left");
        this.text.getUiObject().setPosition(15, 0);
      } else {
        this.text.setTextAlign("center");
        this.text.getUiObject().setPosition(0, 0);
      }
      this.lastLeftAligned = topTextLeftAlign;
    }
  }
}
