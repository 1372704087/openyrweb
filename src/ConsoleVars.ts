/**
 * ConsoleVars — 调试/作弊控制台开关集合。
 *
 * 每个字段为可订阅的 BoxedVar，供 sidebar 调试面板与运行时逻辑读写。
 * 由 ConsoleVars.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { BoxedVar } from "util/BoxedVar"; // 已转换

export class ConsoleVars {
  /** 是否绘制线框调试叠加层。 */
  debugWireframes = new BoxedVar(false);
  /** 是否绘制路径调试线。 */
  debugPaths = new BoxedVar(false);
  /** 是否绘制调试文本。 */
  debugText = new BoxedVar(false);
  /** 当前调试 Bot 索引（0 起）。 */
  debugBotIndex = new BoxedVar(0);
  /** 是否启用调试日志。 */
  debugLogging = new BoxedVar(false);
  /** 是否显示游戏状态调试面板。 */
  debugGameState = new BoxedVar(false);
  /** 强制渲染分辨率（未设置时为 undefined）。 */
  forceResolution = new BoxedVar<number | undefined>(undefined);
  /** 是否启用自由相机。 */
  freeCamera = new BoxedVar(false);
  /** 是否显示 FPS 计数。 */
  fps = new BoxedVar(false);
  /** 是否允许作弊指令。 */
  cheatsEnabled = new BoxedVar(false);
}
