/**
 * PlayerResignedEvent — 玩家投降（Resign）事件。
 *
 * 由 game/event/PlayerResignedEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class PlayerResignedEvent {
  /** 投降的玩家目标。 */
  readonly target: any;
  /** 资产是否已重新分配给盟友（孪生单参调用时为 undefined）。 */
  readonly assetsRedistributed: boolean | undefined;
  readonly type: number;

  constructor(target: any, assetsRedistributed?: boolean) {
    this.target = target;
    this.assetsRedistributed = assetsRedistributed;
    this.type = EventType.PlayerResigned;
  }
}
