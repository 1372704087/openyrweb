/**
 * main — 应用入口副作用模块。
 *
 * 实例化 Application 并在 DOM 就绪后调用 main()：
 * document.body 已存在则立即启动，否则挂 DOMContentLoaded。
 * 模块无导出（与孪生 execute 副作用一致）。
 *
 * 由 main.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块 的编译产物。
 */
import { Application } from "Application"; // 孪生

const app = new Application();
if (document.body) {
  app.main();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    app.main();
  });
}
