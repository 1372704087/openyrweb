// === Reconstructed SystemJS module: game/gameobject/trait/PsychicDetectorTrait ===
// deps: ["game/Coords","game/GameSpeed","game/gameobject/unit/RangeHelper","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyWarpChange"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/PsychicDetectorTrait",
  [
    "game/Coords",
    "game/GameSpeed",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyWarpChange",
  ],
  function (e, t) {
    "use strict";
    var h, i, u, r, s, a, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          h = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = i.GameSpeed.BASE_TICKS_PER_SECOND),
          (n = class {
            constructor(e) {
              ((this.radiusTiles = e), (this.detectionLines = []), (this.nextScan = a));
            }
            [r.NotifyTick.onTick](e, t) {
              e.owner.powerTrait?.isLowPower()
                ? this.disable()
                : (0 < this.nextScan && this.nextScan--,
                  this.nextScan <= 0 && ((this.nextScan = a), (this.detectionLines = this.scan(e, t))));
            }
            [s.NotifyWarpChange.onChange](e, t, i) {
              i && this.disable();
            }
            disable() {
              this.detectionLines.length && ((this.detectionLines = []), (this.nextScan = 0));
            }
            scan(t, i) {
              var e = i.getCombatants().filter((e) => e !== t.owner && !i.alliances.areAllied(e, t.owner));
              let r = [],
                s = new u.RangeHelper(i.map.tileOccupation);
              var a,
                n,
                o,
                l = (e) => s.distance2(e, t) / h.Coords.LEPTONS_PER_TILE <= this.radiusTiles;
              for (a of e)
                for (var c of a.getOwnedObjects())
                  c.attackTrait?.currentTarget
                    ? l((n = c.attackTrait.currentTarget).obj ?? n.tile) && r.push({ source: c, target: n })
                    : c.isUnit() &&
                      c.unitOrderTrait.targetLinesConfig &&
                      ((o = c.unitOrderTrait.targetLinesConfig).target
                        ? l(o.target) &&
                          ((n = i.createTarget(o.target, o.target.tile)), r.push({ source: c, target: n }))
                        : (o = o.pathNodes[0]) &&
                          l(o.tile) &&
                          ((o = i.createTarget(o.onBridge, o.tile)), r.push({ source: c, target: o })));
              return r;
            }
          }),
          e("PsychicDetectorTrait", n));
      },
    };
  },
);
