// === Reconstructed SystemJS module: game/trait/SharedDetectCloakTrait ===
// deps: ["game/trait/interface/NotifyOwnerChange","game/trait/interface/NotifySpawn","game/trait/interface/NotifyTileChange","game/trait/interface/NotifyUnspawn","game/gameobject/unit/RangeHelper","game/trait/interface/NotifyPower","game/trait/interface/NotifyTick","game/trait/RadarTrait","game/rules/general/RadarRules","game/trait/interface/NotifyObjectTraitAdd","game/gameobject/trait/CloakableTrait","game/gameobject/trait/SensorsTrait","game/math/Vector2","game/math/Box2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/SharedDetectCloakTrait",
  [
    "game/trait/interface/NotifyOwnerChange",
    "game/trait/interface/NotifySpawn",
    "game/trait/interface/NotifyTileChange",
    "game/trait/interface/NotifyUnspawn",
    "game/gameobject/unit/RangeHelper",
    "game/trait/interface/NotifyPower",
    "game/trait/interface/NotifyTick",
    "game/trait/RadarTrait",
    "game/rules/general/RadarRules",
    "game/trait/interface/NotifyObjectTraitAdd",
    "game/gameobject/trait/CloakableTrait",
    "game/gameobject/trait/SensorsTrait",
    "game/math/Vector2",
    "game/math/Box2",
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
            this.detectors = new Set();
          }
          [r.NotifySpawn.onSpawn](e, t) {
            (this.isGlobalDetector(e) && (this.detectors.add(e), this.updateAroundDetector(e, t)),
              this.isCloakable(e) && this.detect(e, t));
          }
          [a.NotifyUnspawn.onUnspawn](e, t) {
            e.isTechno() && this.isGlobalDetector(e) && this.detectors.delete(e);
          }
          [i.NotifyOwnerChange.onChange](e, t, i) {
            (this.isGlobalDetector(e) && this.updateAroundDetector(e, i), this.isCloakable(e) && this.detect(e, i));
          }
          [s.NotifyTileChange.onTileChange](e, t, i) {
            (this.isGlobalDetector(e) && this.updateAroundDetector(e, t), this.isCloakable(e) && this.detect(e, t));
          }
          [u.NotifyObjectTraitAdd.onAdd](e, t, i) {
            e.isTechno() &&
              (t instanceof d.CloakableTrait
                ? this.isCloakable(e) && this.detect(e, i)
                : t instanceof g.SensorsTrait && this.isGlobalDetector(e) && this.updateAroundDetector(e, i));
          }
          [o.NotifyPower.onPowerLow](e, t) {}
          [o.NotifyPower.onPowerRestore](t, e) {
            var i = [...this.detectors].filter((e) => e.owner === t && e.isBuilding() && e.poweredTrait);
            this.updateAroundDetectors(i, e);
          }
          [o.NotifyPower.onPowerChange](e, t) {}
          [l.NotifyTick.onTick](e) {
            for (var t of e.getCombatants()) {
              var i;
              for (i of t.getOwnedObjects()) i.cloakableTrait && !i.cloakableTrait.isCloaked() && this.detect(i, e);
            }
          }
          updateAroundDetectors(e, t) {
            let i = new Set();
            for (var r of e) for (var s of this.findTechnosAroundDetector(r, t)) i.add(s);
            for (var a of i) this.isCloakable(a) && this.detect(a, t);
          }
          updateAroundDetector(e, t) {
            var i;
            for (i of this.findTechnosAroundDetector(e, t)) this.isCloakable(i) && this.detect(i, t);
          }
          findTechnosAroundDetector(e, t) {
            var i = e.getFoundation(),
              r = Math.max(i.width, i.height),
              i = e.rules.sensorsSight + r,
              r = new p.Vector2(e.tile.rx, e.tile.ry).addScalar(-i),
              i = new p.Vector2(e.tile.rx, e.tile.ry).addScalar(i);
            return t.map.technosByTile.queryRange(new m.Box2(r, i));
          }
          detect(e, t) {
            let i = new n.RangeHelper(t.map.tileOccupation);
            for (var r of this.detectors)
              if (!t.areFriendly(r, e)) {
                var s = r.rules.sensorsSight;
                if (
                  !(r.isBuilding() && r.poweredTrait && !r.poweredTrait.isPoweredOn()) &&
                  i.tileDistance(e, r.tile) <= s
                ) {
                  s = e.cloakableTrait?.isCloaked();
                  if ((e.cloakableTrait.uncloak(t), s))
                    for (var a of [r.owner, ...t.alliances.getAllies(r.owner)])
                      t.traits.get(c.RadarTrait).addEventForPlayer(h.RadarEventType.GenericNonCombat, a, e.tile, t);
                  break;
                }
              }
          }
          isGlobalDetector(e) {
            return !(!e.isTechno() || (!e.sensorsTrait && !e.rules.sensorArray) || !e.rules.sensorsSight);
          }
          isCloakable(e) {
            return e.isTechno() && !!e.cloakableTrait;
          }
        }),
          e("SharedDetectCloakTrait", f));
      },
    };
  },
);
