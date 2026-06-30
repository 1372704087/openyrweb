// === Reconstructed SystemJS module: game/gameobject/trait/BridgeTrait ===
// deps: ["game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/infantry/InfDeathType","game/type/LandType","game/gameobject/unit/ZoneType","game/gameobject/infantry/StanceType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/BridgeTrait",
  [
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/infantry/InfDeathType",
    "game/type/LandType",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/infantry/StanceType",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, o, l, c, h, u;
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
      ],
      execute: function () {
        ((u = class u {
          constructor(e) {
            ((this.bridges = e), (this.needsImageUpdate = !1), (this.dominoHandled = !1));
          }
          [i.NotifyDamage.onDamage]() {
            this.needsImageUpdate = !0;
          }
          [r.NotifyTick.onTick](e) {
            this.needsImageUpdate &&
              ((this.needsImageUpdate = !1), this.bridges.handlePieceHealthChange(this.bridges.getPieceAtTile(e.tile)));
          }
          [s.NotifyDestroy.onDestroy](s, a, n) {
            var e = this.bridges.getPieceAtTile(s.tile);
            this.dominoHandled ||
              this.bridges
                .findDominoPieces(e)
                .filter((e) => !e.obj.isDestroyed)
                .forEach((e) => {
                  ((e.obj.traits.get(u).dominoHandled = !0), a.destroyObject(e.obj, n));
                });
            let t = a.map.tileOccupation.calculateTilesForGameObject(s.tile, s);
            t.forEach((e) => {
              let i = l.getLandType(e.terrainType),
                r = a.rules.getLandRules(i);
              a.map.getGroundObjectsOnTile(e).forEach((e) => {
                if (
                  e.isUnit() &&
                  (e.onBridge || e.moveTrait.reservedPathNodes.some((e) => e.onBridge === s)) &&
                  !e.isDestroyed
                )
                  if (
                    (s.isLowBridge() && 0 < r.getSpeedModifier(e.rules.speedType)) ||
                    (e.isInfantry() && e.stance === h.StanceType.Paradrop)
                  ) {
                    e.onBridge && ((e.onBridge = !1), (e.zone = c.getZoneType(i)));
                    for (var t of e.moveTrait.reservedPathNodes) t.onBridge === s && (t.onBridge = void 0);
                    e.moveTrait.currentWaypoint?.onBridge === s && (e.moveTrait.currentWaypoint.onBridge = void 0);
                  } else (e.isInfantry() && (e.infDeathType = o.InfDeathType.None), a.destroyObject(e, n, !0));
              });
            });
          }
        }),
          e("BridgeTrait", u));
      },
    };
  },
);
