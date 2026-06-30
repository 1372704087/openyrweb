// === Reconstructed SystemJS module: game/trait/RadarTrait ===
// deps: ["game/trait/interface/NotifySpawn","game/trait/interface/NotifyUnspawn","game/trait/interface/NotifyPower","game/player/trait/PowerTrait","game/event/RadarOnOffEvent","game/trait/interface/NotifyOwnerChange","game/gameobject/unit/RangeHelper","game/rules/general/RadarRules","game/event/RadarEvent","game/trait/interface/NotifyAttack","game/trait/interface/NotifyWarpChange","game/trait/interface/NotifySuperWeaponActivate","game/type/SuperWeaponType","game/trait/interface/NotifySuperWeaponDeactivate"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/RadarTrait",
  [
    "game/trait/interface/NotifySpawn",
    "game/trait/interface/NotifyUnspawn",
    "game/trait/interface/NotifyPower",
    "game/player/trait/PowerTrait",
    "game/event/RadarOnOffEvent",
    "game/trait/interface/NotifyOwnerChange",
    "game/gameobject/unit/RangeHelper",
    "game/rules/general/RadarRules",
    "game/event/RadarEvent",
    "game/trait/interface/NotifyAttack",
    "game/trait/interface/NotifyWarpChange",
    "game/trait/interface/NotifySuperWeaponActivate",
    "game/type/SuperWeaponType",
    "game/trait/interface/NotifySuperWeaponDeactivate",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d, g, p, m, f;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        ((f = class {
          constructor() {
            this.activeLightningStrikes = new Map();
          }
          [i.NotifySpawn.onSpawn](e, t) {
            e.isBuilding() && e.rules.radar && this.updateRadarForPlayer(e.owner, t);
          }
          [r.NotifyUnspawn.onUnspawn](e, t) {
            e.isBuilding() && e.rules.radar && this.updateRadarForPlayer(e.owner, t);
          }
          [s.NotifyPower.onPowerLow](e, t) {
            this.updateRadarForPlayer(e, t);
          }
          [s.NotifyPower.onPowerRestore](e, t) {
            this.updateRadarForPlayer(e, t);
          }
          [s.NotifyPower.onPowerChange]() {}
          [o.NotifyOwnerChange.onChange](e, t, i) {
            e.rules.radar && (this.updateRadarForPlayer(t, i), this.updateRadarForPlayer(e.owner, i));
          }
          [d.NotifyWarpChange.onChange](e, t) {
            e.rules.radar && this.updateRadarForPlayer(e.owner, t);
          }
          [g.NotifySuperWeaponActivate.onActivate](e, t, i) {
            if (e === p.SuperWeaponType.LightningStorm) {
              this.activeLightningStrikes.set(t, (this.activeLightningStrikes.get(t) ?? 0) + 1);
              for (var r of i.getCombatants())
                r === t || i.alliances.areAllied(r, t) || this.updateRadarForPlayer(r, i);
            }
          }
          [m.NotifySuperWeaponDeactivate.onDeactivate](e, t, i) {
            if (e === p.SuperWeaponType.LightningStorm) {
              var r = (this.activeLightningStrikes.get(t) ?? 0) - 1;
              if ((0 < r ? this.activeLightningStrikes.set(t, r) : this.activeLightningStrikes.delete(t), r <= 0))
                for (var s of i.getCombatants()) this.updateRadarForPlayer(s, i);
            }
          }
          updateRadarForPlayer(i, r) {
            var e, t;
            i.radarTrait &&
              ((e = i.radarTrait?.isDisabled()),
              (t =
                ![...i.buildings].find((e) => e.rules.radar && !e.warpedOutTrait.isActive()) ||
                i.powerTrait.level === a.PowerLevel.Low ||
                [...this.activeLightningStrikes.entries()].some(
                  ([e, t]) => t && e !== i && !r.alliances.areAllied(e, i),
                )),
              i.radarTrait.setDisabled(t),
              e !== t && r.events.dispatch(new n.RadarOnOffEvent(i, !t)));
          }
          [u.NotifyAttack.onAttack](e, t, i) {
            e.isTechno() &&
              (!e.isBuilding() || e.rules.canBeOccupied || e.rules.needsEngineer
                ? e.isVehicle() &&
                  e.harvesterTrait &&
                  this.addEventForPlayer(c.RadarEventType.HarvesterUnderAttack, e.owner, e.tile, i)
                : this.addEventForPlayer(c.RadarEventType.BaseUnderAttack, e.owner, e.tile, i));
          }
          addEventForPlayer(r, e, s, a) {
            let n = e.radarTrait;
            if (n) {
              let t = a.rules.general.radar;
              n.activeEvents = n.activeEvents.filter((e) => a.currentTick - e.startTick < t.getEventDuration(e.type));
              let i = new l.RangeHelper(a.map.tileOccupation);
              !!n.activeEvents.find(
                (e) => e.type === r && i.isInTileRange(s, e.tile, 0, t.getEventSuppresionDistance(e.type)),
              ) ||
                (n.activeEvents.push({ startTick: a.currentTick, tile: s, type: r }),
                a.events.dispatch(new h.RadarEvent(e, r, s)));
            }
          }
        }),
          e("RadarTrait", f));
      },
    };
  },
);
