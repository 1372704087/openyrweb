/**
 * EnemyInZoneCondition — 敌人在区域内触发条件（事件 35）。
 *
 * params[1] = 区域索引（[Zone] 节 0 基），params[2] = 阵营 ID
 * （0 表示触发器自身所属阵营）。check 每帧扫描：所有敌对（非同盟、
 * 非己方、未失败）战斗方的存活 Techno，其所在格 (tile.rx/ry) 落入
 * 区域矩形即 true。区域数据来自 GameMap.getZones()。
 *
 * 由 game/trigger/condition/EnemyInZoneCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EnemyInZoneCondition extends TriggerCondition {
  /** [Zone] 节区域索引（params[1]，缺省 0）。 */
  zoneIndex: number;
  /** 判定阵营 country.id（params[2]，0=触发器自身）。 */
  houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.zoneIndex = Number(this.event.params[1] || 0);
    this.houseId = Number(this.event.params[2] || 0);
  }

  /** 敌对存活 Techno 落入区域矩形则 true。 */
  check(world: any): boolean {
    if (!this.player) return false;
    const zones = world.map.getZones?.() || [];
    const zone = zones[this.zoneIndex];
    if (!zone) return false;
    const house = this.houseId
      ? world.getAllPlayers().find((p: any) => p.country?.id === this.houseId)
      : this.player;
    if (!house || house.defeated) return false;
    for (const p of world.getCombatants()) {
      if (p.defeated || p === house || world.alliances.areAllied(p, house)) continue;
      for (const o of p.getOwnedObjects()) {
        if (!o.isTechno() || o.isDestroyed) continue;
        const tile = o.isBuilding() ? o.centerTile : o.tile;
        if (
          tile &&
          tile.rx >= zone.minX &&
          tile.rx <= zone.maxX &&
          tile.ry >= zone.minY &&
          tile.ry <= zone.maxY
        )
          return true;
      }
    }
    return false;
  }
}
