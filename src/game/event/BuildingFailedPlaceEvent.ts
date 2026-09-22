/**
 * BuildingFailedPlaceEvent — 建筑放置失败事件。
 *
 * 玩家尝试放下建筑但因地形/占用/规则校验未通过而失败时派发，
 * 用于 UI 提示与失败反馈。
 *
 * 由 game/event/BuildingFailedPlaceEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class BuildingFailedPlaceEvent {
  /** 尝试放置的建筑类型名（rules 中的注册名）。 */
  readonly name: string;
  /** 尝试放置的玩家。 */
  readonly player: any;
  /** 失败目标格。 */
  readonly tile: any;
  readonly type: number;

  constructor(name: string, player: any, tile: any) {
    this.name = name;
    this.player = player;
    this.tile = tile;
    this.type = EventType.BuildingFailedPlace;
  }
}
