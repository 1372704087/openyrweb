/**
 * DestroyedBridgeCondition — 指定桥梁被摧毁。
 *
 * 事件 DestroyedBridge：ObjectDestroy 的目标是桥梁 Overlay 时，收集该
 * bridgeSpec 覆盖的桥面 tile 中与 targets 相交的事件目标 tile。
 *
 * 由 game/trigger/condition/DestroyedBridgeCondition.ts.js 重写为 TS。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class DestroyedBridgeCondition extends TriggerCondition {
  check(game: any, events: any[]): any[] {
    return events
      .filter((ev) => {
        if (ev.type !== EventType.ObjectDestroy) return false;
        const target = ev.target;
        if (!target.isOverlay() || !target.isBridge()) return false;
        const spec = target.bridgeTrait?.bridgeSpec;
        if (!spec) return false;
        const bridgeTiles = game.map.bridges.findAllBridgeTiles(spec);
        // 桥面 tile 与 Tag 绑定目标有交集才算命中本触发器
        return !!bridgeTiles.find((tile) => this.targets.includes(tile));
      })
      .map((ev) => ev.target.tile);
  }
}
