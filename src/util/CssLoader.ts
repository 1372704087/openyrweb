/**
 * CssLoader — 动态注入 `<link rel="stylesheet">` 并等待加载完成。
 *
 * 由 util/CssLoader.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 样式表加载器：构造时注入目标 document，便于 iframe/测试环境。 */
export class CssLoader {
  private document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  /**
   * 创建 link 节点挂到 head 并等待 onload/onerror。
   *
   * - 环境支持 onload/onerror 属性时：onload resolve，onerror 以
   *   `Couldn't load CSS at "${href}"` 的 Error reject。
   * - 不支持 onload 的旧环境：挂入 DOM 后立即 resolve（无法观测失败，
   *   与孪生短路一致）。注意 createElement 用全局 document（与孪生一致），
   *   仅 appendChild 走 this.document。
   */
  async load(href: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = href;
      if ("onload" in link) link.onload = () => resolve();
      if ("onerror" in link) link.onerror = () => reject(new Error(`Couldn't load CSS at "${href}"`));
      this.document.head.appendChild(link);
      if (!("onload" in link)) resolve();
    });
  }
}
