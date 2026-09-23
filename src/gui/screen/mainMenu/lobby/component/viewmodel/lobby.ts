/**
 * lobby — 大厅视图模型枚举集。
 *
 * LobbyType / SlotType / SlotOccupation / PlayerStatus 四个数值枚举，
 * 数值与孪生一致（Slot* 从 1 起）。
 *
 * 由 gui/screen/mainMenu/lobby/component/viewmodel/lobby.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */

/** 大厅类型。 */
export enum LobbyType {
  /** 单机。 */
  Singleplayer = 0,
  /** 多人房主。 */
  MultiplayerHost = 1,
  /** 多人访客。 */
  MultiplayerGuest = 2,
}

/** 槽位角色。 */
export enum SlotType {
  /** 玩家。 */
  Player = 1,
  /** AI。 */
  Ai = 2,
  /** 观战。 */
  Observer = 3,
}

/** 槽位占用状态。 */
export enum SlotOccupation {
  /** 开放。 */
  Open = 1,
  /** 关闭。 */
  Closed = 2,
  /** 已占用。 */
  Occupied = 3,
  /** 观战位。 */
  Observer = 4,
}

/** 玩家准备状态。 */
export enum PlayerStatus {
  /** 未就绪。 */
  NotReady = 1,
  /** 已就绪。 */
  Ready = 2,
  /** 房主。 */
  Host = 3,
}
