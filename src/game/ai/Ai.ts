/**
 * Ai — 极简 AI 配置持有者：包装一份 AIMD.INI（或等价）对象并原样返回。
 *
 * 由 game/ai/Ai.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** AI 配置包装器。 */
export class Ai {
  /** 构造时注入的 INI 对象（getSection / get 等）。 */
  ini: any;

  /**
   * @param ini - AI 配置 INI 实例
   */
  constructor(ini: any) {
    this.ini = ini;
  }

  /** 取出构造时注入的 INI 对象。 */
  getIni(): any {
    return this.ini;
  }
}
