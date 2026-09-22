/**
 * ComesNearWaypointCondition — 单位接近路径点触发条件。
 *
 * init 时把 event.params[1] 解析为路径点格子（无效则 warn 并跳过）；
 * check 遍历 EnterTile 事件：本方单位进入的格与路径点 tile 距离
 * <2 即命中（RangeHelper.tileDistance）。无有效路径点或无 player
 * 时恒 false。
 *
 * 由 game/trigger/condition/ComesNearWaypointCondition.ts.js 重写为
 * TS（行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ComesNearWaypointCondition extends TriggerCondition {
  /** 路径点对应格子（init 解析，无效时 undefined）。 */
  waypointTile: any;

  constructor(event: any, trigger: any) {
    super(event, trigger);
  }

  /** 解析路径点格子；无有效位置时 console.warn 并跳过。 */
  init(world: any): void {
    super.init(world);
    const waypoint = Number(this.event.params[1]);
    this.waypointTile = world.map.getTileAtWaypoint(waypoint);
    this.waypointTile ||
      console.warn(`No valid location found for waypoint ${waypoint}. ` + `Skipping event ${this.getDebugName()}.`);
  }

  /** 本方 EnterTile 目标格与路径点距离 <2 即命中。 */
  check(world: any, events: any[]): boolean {
    if (!this.waypointTile || !this.player) return false;
    for (const event of events)
      if (event.type === EventType.EnterTile && event.source.owner === this.player) {
        const helper = new (RangeHelperModule as any).RangeHelper(world.map.tileOccupation);
        if (helper.tileDistance(event.target, this.waypointTile) < 2) return true;
      }
    return false;
  }
}
