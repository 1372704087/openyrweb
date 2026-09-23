/**
 * HtmlContainer — 带定位/尺寸/可见性的 DOM 容器（LazyHtmlElement 子类）。
 *
 * render 时惰性创建 div；支持 relative/absolute、left/top 或 translate、
 * width/height（number 自动加 px）、visible 的 display 切换。
 *
 * 由 gui/HtmlContainer.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { LazyHtmlElement } from "gui/LazyHtmlElement"; // 孪生（本批内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** HTML 容器。 */
export class HtmlContainer extends LazyHtmlElement {
  /** 是否可见。 */
  visible = true;
  /** 左偏移。 */
  left: any = 0;
  /** 上偏移。 */
  top: any = 0;
  /** 宽（number 或 CSS 长度串）。 */
  width: any = 0;
  /** 高（number 或 CSS 长度串）。 */
  height: any = 0;
  /** 是否 relative 定位。 */
  relativeMode = false;
  /** 是否用 transform 平移。 */
  translateMode = false;

  /** 惰性建 div 后走父类 render。 */
  render(): void {
    if (!this.isRendered()) {
      let el = this.getElement();
      if (!el) {
        el = document.createElement("div");
        this.setElement(el);
      }
      this.updateMode();
      this.updatePosition();
      this.updateVisibility();
      this.updateSize();
    }
    super.render();
  }

  /**
   * 切换 relative/absolute。
   * @param on - true → relative
   */
  setRelativeMode(on: boolean): void {
    this.relativeMode = on;
    this.updateMode();
  }

  /**
   * 切换 transform 平移。
   * @param on - true → translate
   */
  setTranslateMode(on: boolean): void {
    this.translateMode = on;
    this.updatePosition();
  }

  /**
   * 设置位置。
   * @param left - 左
   * @param top - 上
   */
  setPosition(left: any, top: any): void {
    this.left = left;
    this.top = top;
    this.updatePosition();
  }

  /**
   * 设置尺寸。
   * @param width - 宽
   * @param height - 高
   */
  setSize(width: any, height: any): void {
    this.width = width;
    this.height = height;
    this.updateSize();
  }

  /** 当前宽高。 */
  getSize(): { width: any; height: any } {
    return { width: this.width, height: this.height };
  }

  /**
   * 显隐（值变化才写 DOM）。
   * @param visible - 可见
   */
  setVisible(visible: boolean): void {
    if (visible !== this.visible) {
      this.visible = visible;
      this.updateVisibility();
    }
  }

  /** 写 position 样式。 */
  updateMode(): void {
    const el = this.getElement();
    if (el) {
      if (this.relativeMode) {
        el.style.position = "relative";
      } else {
        el.style.overflow = "visible";
        el.style.position = "absolute";
      }
    }
  }

  /** 写 left/top 或 transform。 */
  updatePosition(): void {
    const el = this.getElement();
    if (el) {
      if (this.translateMode) {
        el.style.top = el.style.left = "0";
        el.style.transform = `translate(${this.left}px, ${this.top}px)`;
      } else {
        el.style.left = this.left + "px";
        el.style.top = this.top + "px";
        el.style.transform = "";
      }
    }
  }

  /** 写宽高（number → px）。 */
  updateSize(): void {
    const el = this.getElement();
    if (el) {
      el.style.width = typeof this.width === "number" ? this.width + "px" : this.width;
      el.style.height = typeof this.height === "number" ? this.height + "px" : this.height;
    }
  }

  /** 隐藏。 */
  hide(): void {
    this.setVisible(false);
  }

  /** 显示。 */
  show(): void {
    this.setVisible(true);
  }

  /** 写 display。 */
  updateVisibility(): void {
    const el = this.getElement();
    if (el) el.style.display = this.visible ? "block" : "none";
  }
}
