/**
 * SidebarIconButton — 侧栏图标按钮（toggle/disabled 三态帧）。
 *
 * 由 gui/screen/game/component/hud/SidebarIconButton.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const UiObject: any = (UiObjectModule as any).UiObject;

/** 侧栏图标按钮。 */
export class SidebarIconButton extends UiComponent {
  /** 切换态。 */
  toggle: any;
  /** 禁用态。 */
  disabled: boolean;
  /** sprite 子组件。 */
  sprite: any;
  /** 按下回调。 */
  handleMouseDown: () => void;
  /** 抬起清理。 */
  onDocumentMouseUp: () => void;

  /** 使用父构造并初始化字段。 */
  constructor(...args: any[]) {
    super(...args);
    this.toggle = this.props.toggle;
    this.disabled = !!this.props.disabled;
    this.handleMouseDown = () => {
      if (this.disabled) return;
      if (this.toggle === void 0) {
        this.sprite.setFrame((this.props.imageFrameOffset ?? 0) + 1);
      }
      document.addEventListener("mouseup", this.onDocumentMouseUp);
      document.addEventListener("touchend", this.onDocumentMouseUp);
      document.addEventListener("touchcancel", this.onDocumentMouseUp);
    };
    this.onDocumentMouseUp = () => {
      if (this.toggle === void 0) {
        this.sprite.setFrame((this.props.imageFrameOffset ?? 0) + 0);
      }
      document.removeEventListener("mouseup", this.onDocumentMouseUp);
      document.removeEventListener("touchend", this.onDocumentMouseUp);
      document.removeEventListener("touchcancel", this.onDocumentMouseUp);
    };
  }

  /** 根对象（无 HtmlContainer）。 */
  createUiObject(): any {
    return new UiObject(new THREE.Object3D());
  }

  /** 挂 sprite。 */
  defineChildren(): any {
    const { image, imageFrameOffset, palette, x, y, onClick, tooltip } = this.props;
    return jsx("sprite", {
      image,
      palette,
      x,
      y,
      frame: this.getBaseFrameNo(imageFrameOffset ?? 0),
      onClick: (e: any) => e.button === 0 && !this.disabled && onClick?.(),
      onMouseDown: this.handleMouseDown,
      tooltip,
      ref: (e: any) => (this.sprite = e),
    });
  }

  /**
   * 基础帧：disabled=+2 / toggle=+1 / 否则 0。
   * @param offset 起始帧偏移
   */
  getBaseFrameNo(offset: number): number {
    return offset + (this.disabled ? 2 : this.toggle ? 1 : 0);
  }

  /**
   * 更新 toggle 并刷帧。
   * @param on 新态
   */
  setToggleState(on: boolean): void {
    if (this.toggle !== on) {
      this.toggle = on;
      this.sprite.setFrame(this.getBaseFrameNo(this.props.imageFrameOffset ?? 0));
    }
  }

  /**
   * 更新 disabled 并刷帧。
   * @param off 新态
   */
  setDisabled(off: boolean): void {
    if (off !== this.disabled) {
      this.disabled = off;
      this.sprite.setFrame(this.getBaseFrameNo(this.props.imageFrameOffset ?? 0));
    }
  }

  /** 释放 document 监听。 */
  onDispose(): void {
    document.removeEventListener("mouseup", this.onDocumentMouseUp);
    document.removeEventListener("touchend", this.onDocumentMouseUp);
    document.removeEventListener("touchcancel", this.onDocumentMouseUp);
  }
}
