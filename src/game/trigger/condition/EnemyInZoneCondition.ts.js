// === OpenYRWeb: 敌人在区域内条件 (EnemyInZoneCondition) ===
// 事件 35: EnemyInZone — 当触发阵营的敌对单位进入 [Zone] 定义的区域时触发。
// 参数: params[1] = 区域索引（对应地图 [Zone] 节，0 基），
//       params[2] = 阵营 ID（0 表示触发触发器自身所属阵营）。
// 实现: 每帧扫描所有敌对阵营单位，其所在格 (tile.rx/ry) 落入区域矩形即视为进入。
// 区域数据来自 MapFile.readZones 解析的 [Zone] 节，经 GameMap.getZones() 暴露。
// deps: ["game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/condition/EnemyInZoneCondition", ["game/trigger/TriggerCondition"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends i.TriggerCondition {
        constructor(e, t) {
          (super(e, t),
            (this.zoneIndex = Number(this.event.params[1] || 0)),
            (this.houseId = Number(this.event.params[2] || 0)));
        }
        check(e) {
          if (!this.player) return !1;
          var t = e.map.getZones?.() || [];
          var zone = t[this.zoneIndex];
          if (!zone) return !1;
          var house = this.houseId ? e.getAllPlayers().find((p) => p.country?.id === this.houseId) : this.player;
          if (!house || house.defeated) return !1;
          for (var p of e.getCombatants()) {
            if (p.defeated || p === house || e.alliances.areAllied(p, house)) continue;
            for (var o of p.getOwnedObjects()) {
              if (!o.isTechno() || o.isDestroyed) continue;
              var tile = o.isBuilding() ? o.centerTile : o.tile;
              if (
                tile &&
                tile.rx >= zone.minX &&
                tile.rx <= zone.maxX &&
                tile.ry >= zone.minY &&
                tile.ry <= zone.maxY
              )
                return !0;
            }
          }
          return !1;
        }
      }),
        e("EnemyInZoneCondition", r));
    },
  };
});
