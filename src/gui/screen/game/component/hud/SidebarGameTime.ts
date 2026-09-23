/**
 * SidebarGameTime — 侧栏对局时间显示（可对齐回放总时长）。
 *
 * 由 gui/screen/game/component/hud/SidebarGameTime.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import * as UiTextModule from "gui/component/UiText"; // 孪生
import { formatTimeDuration } from "util/format"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiObject: any = (UiObjectModule as any).UiObject;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const UiText: any = (UiTextModule as any).UiText;

/** 侧栏对局时间。 */
export class SidebarGameTime extends UiComponent {
  /** 文本子组件。 */
  text: any;
  /** 上次刷新。 */
  lastUpdate: number | undefined;
  /** 上次显示时间。 */
  lastGameTime: any;
  /** 上次左对齐。 */
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
   * 50ms 节流刷新时间与对齐。
   * @param now 帧时间
   */
  onFrame(now: number): void {
    const {
      sidebarModel: { currentGameTime, replayTime, topTextLeftAlign },
    } = this.props;
    if (this.lastUpdate && now - this.lastUpdate < 50) return;
    this.lastUpdate = now;
    if (this.lastGameTime !== currentGameTime) {
      this.text.setValue(
        formatTimeDuration(currentGameTime) +
          (replayTime ? " / " + formatTimeDuration(replayTime) : ""),
      );
      this.lastGameTime = currentGameTime;
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
