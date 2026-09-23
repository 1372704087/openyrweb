/**
 * SplashScreen — 启动闪屏（黑底背景 + 加载/版权/免责声明文本）。
 *
 * 由 gui/component/SplashScreen.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 启动闪屏。 */
export class SplashScreen {
  /** 宽。 */
  width: number;
  /** 高。 */
  height: number;
  /** 是否已挂 DOM。 */
  rendered = false;
  /** 根 div。 */
  el?: any;
  /** 加载文本节点。 */
  loadingEl?: any;
  /** 版权文本节点。 */
  copyrightEl?: any;
  /** 免责声明节点。 */
  disclaimerEl?: any;

  /**
   * @param width - 宽
   * @param height - 高
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.rendered = false;
  }

  /**
   * 挂到父节点（仅一次）。
   * @param parent - 父 DOM
   */
  render(parent: any): void {
    if (!this.rendered) {
      const el = (this.el = document.createElement("div"));
      el.style.backgroundColor = "black";
      el.style.color = "white";
      el.style.padding = "10px";
      el.style.boxSizing = "border-box";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPosition = "50% 50%";
      el.style.textShadow = "1px 1px black";
      this.updateSize();

      const loading = (this.loadingEl = document.createElement("div"));
      el.appendChild(loading);

      const copyright = (this.copyrightEl = document.createElement("div"));
      copyright.style.position = "absolute";
      copyright.style.bottom = "10px";
      copyright.style.right = "10px";
      copyright.style.textAlign = "right";
      el.appendChild(copyright);

      const disclaimer = (this.disclaimerEl = document.createElement("div"));
      disclaimer.style.position = "absolute";
      disclaimer.style.bottom = "10px";
      disclaimer.style.left = "10px";
      el.appendChild(disclaimer);

      parent.appendChild(el);
      this.rendered = true;
    }
  }

  /**
   * 设置背景图。
   * @param url - 背景 URL
   */
  setBackgroundImage(url: string): void {
    this.el.style.backgroundImage = `url(${url})`;
  }

  /**
   * 设置加载文案（innerHTML）。
   * @param html - HTML 文本
   */
  setLoadingText(html: string): void {
    this.loadingEl.innerHTML = html;
  }

  /**
   * 设置版权（\n → br）。
   * @param text - 多行文本
   */
  setCopyrightText(text: string): void {
    this.copyrightEl.innerHTML = text.replace(/\n/g, "<br />");
  }

  /**
   * 设置免责声明（\n → br）。
   * @param text - 多行文本
   */
  setDisclaimerText(text: string): void {
    this.disclaimerEl.innerHTML = text.replace(/\n/g, "<br />");
  }

  /**
   * 改尺寸。
   * @param width - 宽
   * @param height - 高
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.updateSize();
  }

  /** 写根元素宽高。 */
  updateSize(): void {
    if (this.el) {
      this.el.style.width = this.width + "px";
      this.el.style.height = this.height + "px";
    }
  }

  /** 摘除根元素。 */
  destroy(): void {
    if (this.rendered) {
      this.el.remove();
      this.rendered = false;
    }
  }
}
