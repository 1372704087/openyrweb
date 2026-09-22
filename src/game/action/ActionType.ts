/**
 * ActionType — 游戏动作类型（网络消息/回放中的动作序号）。
 *
 * 由 game/action/ActionType.ts.js 重写为 TS（行为完全一致，枚举值脚本
 * 提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum ActionType {
  /** 空动作 */
  NoAction = 0,
  /** 断开/踢出玩家 */
  DropPlayer = 1,
  /** 旁观对局 */
  ObserveGame = 2,
  /** 投降/退出对局 */
  ResignGame = 3,
  /** 调试指令 */
  DebugCommand = 4,
  /** 放置建筑 */
  PlaceBuilding = 5,
  /** 出售对象 */
  SellObject = 6,
  /** 切换修理 */
  ToggleRepair = 7,
  /** 选择单位 */
  SelectUnits = 8,
  /** 对单位下达指令 */
  OrderUnits = 9,
  /** 更新生产队列 */
  UpdateQueue = 10,
  /** 切换同盟 */
  ToggleAlliance = 11,
  /** 激活超级武器 */
  ActivateSuperWeapon = 12,
  /** 地图标记/闪烁 */
  PingLocation = 13,
}
