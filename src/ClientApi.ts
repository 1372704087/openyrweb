/**
 * ClientApi — 浏览器全局 `window.CdApi` 的对外门面。
 *
 * 构造时创建唯一的 BattleControlApi；Gui 初始化完成后挂到
 * window 并派发 "CdApiReady" CustomEvent。
 *
 * 由 ClientApi.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { BattleControlApi } from "BattleControlApi"; // 孪生

export class ClientApi {
  /** 世界交互控制（平移/键盘/开关）。 */
  readonly battleControl: BattleControlApi;

  constructor() {
    this.battleControl = new BattleControlApi();
  }
}
