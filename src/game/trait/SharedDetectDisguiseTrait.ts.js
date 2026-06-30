// === Reconstructed SystemJS module: game/trait/SharedDetectDisguiseTrait ===
// deps: ["game/trait/interface/NotifyOwnerChange","game/trait/interface/NotifySpawn","game/trait/interface/NotifyTileChange","game/trait/interface/NotifyUnspawn","game/gameobject/unit/RangeHelper","game/trait/interface/NotifyPower","game/math/Vector2","game/math/Box2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/SharedDetectDisguiseTrait",
  [
    "game/trait/interface/NotifyOwnerChange",
    "game/trait/interface/NotifySpawn",
    "game/trait/interface/NotifyTileChange",
    "game/trait/interface/NotifyUnspawn",
    "game/gameobject/unit/RangeHelper",
    "game/trait/interface/NotifyPower",
    "game/math/Vector2",
    "game/math/Box2",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, c, n, o, l, h;
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
          c = e;
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
      ],
      execute: function () {
        ((h = class {
          constructor() {
            this.detectors = new Set();
          }
          [r.NotifySpawn.onSpawn](e, t) {
            (this.isGlobalDetector(e) && (this.detectors.add(e), this.updateAroundDetector(e, t)),
              this.isDisguisable(e) && this.detect(e, t));
          }
          [a.NotifyUnspawn.onUnspawn](e, t) {
            e.isTechno() &&
              (this.isGlobalDetector(e) && (this.detectors.delete(e), this.updateAroundDetector(e, t)),
              this.isDisguisable(e) && this.undetect(e, t));
          }
          [i.NotifyOwnerChange.onChange](e, t, i) {
            (this.isGlobalDetector(e) && this.updateAroundDetector(e, i),
              this.isDisguisable(e) && (this.undetect(e, i), this.detect(e, i)));
          }
          [s.NotifyTileChange.onTileChange](e, t, i) {
            (this.isGlobalDetector(e) && (this.updateAroundDetector(e, t, i), this.updateAroundDetector(e, t)),
              this.isDisguisable(e) && (this.undetect(e, t), this.detect(e, t)));
          }
          [n.NotifyPower.onPowerLow](t, e) {
            var i = [...this.detectors].filter(
              (e) => e.owner === t && e.isBuilding() && e.poweredTrait && !e.poweredTrait.isPoweredOn(),
            );
            this.updateAroundDetectors(i, e);
          }
          [n.NotifyPower.onPowerRestore](t, e) {
            var i = [...this.detectors].filter((e) => e.owner === t && e.isBuilding() && e.poweredTrait);
            this.updateAroundDetectors(i, e);
          }
          [n.NotifyPower.onPowerChange](e, t) {}
          updateAroundDetectors(e, t) {
            let i = new Set();
            for (var r of e) for (var s of this.findTechnosAroundDetector(r, t, r.tile)) i.add(s);
            for (var a of i) this.isDisguisable(a) && (this.undetect(a, t), this.detect(a, t));
          }
          updateAroundDetector(e, t, i = e.tile) {
            var r;
            for (r of this.findTechnosAroundDetector(e, t, i))
              this.isDisguisable(r) && (this.undetect(r, t), this.detect(r, t));
          }
          findTechnosAroundDetector(e, t, i) {
            var r = e.getFoundation(),
              s = Math.max(r.width, r.height),
              r = e.rules.detectDisguiseRange + s,
              s = new o.Vector2(i.rx, i.ry).addScalar(-r),
              r = new o.Vector2(i.rx, i.ry).addScalar(r);
            return t.map.technosByTile.queryRange(new l.Box2(s, r));
          }
          detect(e, t) {
            let i = new Set(),
              r = new c.RangeHelper(t.map.tileOccupation);
            for (var s of this.detectors)
              if (!t.areFriendly(s, e)) {
                var a = s.owner,
                  n = s.rules.detectDisguiseRange;
                if (!i.has(a))
                  if (
                    !(s.isBuilding() && s.poweredTrait && !s.poweredTrait.isPoweredOn()) &&
                    r.tileDistance(e, s.tile) <= n
                  )
                    for (var o of [a, ...t.alliances.getAllies(a)]) i.add(o);
              }
            for (var l of i) l.sharedDetectDisguiseTrait?.add(e);
          }
          undetect(e, t) {
            for (var i of t.getCombatants()) i.sharedDetectDisguiseTrait?.delete(e);
          }
          isGlobalDetector(e) {
            return !(!e.isTechno() || !e.rules.detectDisguiseRange);
          }
          isDisguisable(e) {
            return !((!e.isInfantry() && !e.isVehicle()) || !e.disguiseTrait);
          }
        }),
          e("SharedDetectDisguiseTrait", h));
      },
    };
  },
);
