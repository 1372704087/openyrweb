// === 摧毁全部动作 (DestroyAllExecutor) ===
// 动作 119 DestroyAll / 120 DestroyAllBuildings / 121 DestroyAllLandUnits / 122 DestroyAllNavalUnits。
// 按触发器所属阵营（houseName）销毁其所有存活单位/建筑。
// 参考临时源码 kx：all / buildings / land-units / naval-units 四种范围。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/DestroyAllExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
      ((r = class extends i.TriggerExecutor {
        constructor(e, t, s) {
          super(e, t);
          this.scope = s || "all";
        }
        resolveOwner(e) {
          var hid = Number(this.action.params[1]);
          if (hid !== -1 && e.campaignHouses && e.campaignHouses[hid]) {
            let h = e.campaignHouses[hid];
            let p = e.housePlayers.get(h.name);
            if (p) return p;
          }
          var houseName = String(this.trigger.houseName || "").trim(),
            lowerHouse = houseName.toLowerCase();
          return (
            e.housePlayers.get(houseName) ||
            e.getAllPlayers().find(
              (p) =>
                !p.defeated &&
                (p.country?.name === houseName ||
                  p.name === houseName ||
                  (p.scenarioAliases || []).some((a) => String(a).toLowerCase() === lowerHouse)),
            ) ||
            void 0
          );
        }
        isTarget(e, obj, owner) {
          if (obj.isDestroyed || !obj.isSpawned) return !1;
          var o = obj.mindControllableTrait?.getOriginalOwner ? obj.mindControllableTrait.getOriginalOwner() : obj.owner;
          if (o !== owner) return !1;
          switch (this.scope) {
            case "buildings":
              return obj.isBuilding();
            case "land-units":
              return obj.isUnit() && !obj.rules.naval;
            case "naval-units":
              return obj.isUnit() && !!obj.rules.naval;
            default:
              return !0;
          }
        }
        execute(e) {
          var owner = this.resolveOwner(e);
          if (!owner) {
            console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
            return;
          }
          var count = 0;
          for (var player of e.getAllPlayers())
            for (var obj of player.getOwnedObjects())
              if (this.isTarget(e, obj, owner)) {
                try {
                  e.destroyObject(obj, void 0, !0);
                  count++;
                } catch (_) {}
              }
          console.warn(`[OpenYRWeb] DestroyAll(${this.scope}): ${owner.name}, destroyed ${count}`);
        }
      }),
        e("DestroyAllExecutor", r));
    },
  };
});
