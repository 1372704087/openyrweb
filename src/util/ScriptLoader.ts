/**
 * ScriptLoader — 向指定 Document 动态注入 <script> 标签加载脚本。
 *
 * 构造时传入目标 document；load 返回 Promise，onload 成功、onerror 以
 * 固定文案 Error 拒绝。由 util/ScriptLoader.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */

/** load 可选项：type/charset/async 默认值与孪生一致。 */
interface LoadOptions {
  /** script.type，默认 "text/javascript"。 */
  type?: string;
  /** script.charset，默认 "utf8"。 */
  charset?: string;
  /** 是否异步（默认 true；仅显式传 false 才为 false）。 */
  async?: boolean;
  /** 额外要设置的 attribute 键值对。 */
  attrs?: Record<string, string>;
  /** 内联脚本文本（写入 script.text）。 */
  text?: string;
}

export class ScriptLoader {
  /** 注入 script 的目标文档。 */
  readonly document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  /** 创建并插入 script；成功 resolve，失败 reject 加载失败 Error。 */
  load(src: string, options: LoadOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const head = this.document.head;
      const script = this.document.createElement("script");
      script.type = options.type || "text/javascript";
      script.charset = options.charset || "utf8";
      script.async = options.async === undefined || options.async;
      script.src = src;
      const attrs = options.attrs;
      if (attrs) Object.keys(attrs).forEach((k) => script.setAttribute(k, attrs[k]));
      if (options.text) script.text = options.text;
      script.onload = () => {
        resolve();
      };
      const error = new Error(`Failed to load script "${src}"`);
      script.onerror = () => {
        reject(error);
      };
      head.appendChild(script);
    });
  }
}
