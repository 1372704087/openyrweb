/**
 * BuildingPlaceEvent — 建筑成功放置事件。
 *
 * 建筑成功落地生成时派发（与 BuildingFailedPlaceEvent 相对），
 * 构建序列、音效与 HUD 据此更新。
 *
 * 由 game/event/BuildingPlaceEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class BuildingPlaceEvent {
  /** 刚放置成功的建筑对象。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.BuildingPlace;
  }
}
