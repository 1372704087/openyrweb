/**
 * gameBrowser — 游戏浏览器视图模型（type-only 空执行模块）。
 *
 * 孪生 execute 为空，运行时不导出任何值；原 TS 应为
 * Game / GameRow props 等接口定义。
 *
 * 由 gui/screen/mainMenu/customGame/component/viewmodel/gameBrowser.ts.js
 * 重写为 TS（行为完全一致：空导出）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 房间视图条目（由调用方/WOL 列表映射）。 */
export interface GameBrowserGame {
  /** 房间名。 */
  name: string;
  /** 房主。 */
  hostName: string;
  /** 描述。 */
  description?: string;
  /** 地图名。 */
  mapName: string;
  /** 是否密码。 */
  passLocked?: boolean;
  /** 是否可观战。 */
  observable?: boolean;
  /** 观战者数。 */
  observers?: number;
  /** 人类玩家数。 */
  humanPlayers: number;
  /** AI 玩家数。 */
  aiPlayers: number;
  /** 最大玩家。 */
  maxPlayers?: number;
  /** 房主 ping。 */
  hostPing?: number;
  /** 模组名。 */
  modName?: string;
  /** 模组哈希。 */
  modHash?: string;
  /** 锦标赛。 */
  tournament?: boolean;
  /** 主机禁言（隐藏描述）。 */
  hostMuted?: boolean;
}
