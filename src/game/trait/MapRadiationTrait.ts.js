// === Reconstructed SystemJS module: game/trait/MapRadiationTrait ===
// deps: ["game/gameobject/infantry/StanceType","game/gameobject/unit/RangeHelper","game/map/tileFinder/RadialTileFinder","game/Warhead","util/event","util/math","game/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/MapRadiationTrait",
  [
    "game/gameobject/infantry/StanceType",
    "game/gameobject/unit/RangeHelper",
    "game/map/tileFinder/RadialTileFinder",
    "game/Warhead",
    "util/event",
    "util/math",
    "game/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var l, c, h, i, r, u, s, a;
    t && t.id;
    return {
      setters: [
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
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = class {
          get onChange() {
            return this._onChange.asEvent();
          }
          constructor(e) {
            ((this.map = e),
              (this.radSites = new Map()),
              (this.radLevelByTile = new Map()),
              (this._onChange = new r.EventDispatcher()));
          }
          getRadLevel(e) {
            return this.radLevelByTile.get(e);
          }
          [s.NotifyTick.onTick](e) {
            var t;
            this.radLevelByTile.size &&
              ((t = e.rules.radiation),
              void 0 === this.nextDamage
                ? (this.nextDamage = Math.max(0, t.radApplicationDelay - 1))
                : this.nextDamage <= 0
                  ? (this.applyDamage(e), (this.nextDamage = Math.max(0, t.radApplicationDelay)))
                  : this.nextDamage--,
              void 0 === this.nextDecay
                ? (this.nextDecay = Math.max(0, t.radLevelDelay - 1))
                : this.nextDecay <= 0
                  ? (this.applyDecay(Math.ceil(t.radLevelDelay / t.radDurationMultiple)),
                    this.radLevelByTile.size
                      ? (this.nextDecay = Math.max(0, t.radLevelDelay))
                      : (this.nextDecay = void 0))
                  : this.nextDecay--);
          }
          applyDamage(a) {
            let n = a.rules.radiation,
              o = new i.Warhead(a.rules.getWarhead(n.radSiteWarhead));
            this.radLevelByTile.forEach((e, t) => {
              var i,
                r,
                s = Math.min(n.radLevelMax, e) * n.radLevelFactor;
              for (i of a.map
                .getGroundObjectsOnTile(t)
                .filter(
                  (e) => e.isUnit() && !(e.isInfantry() && e.stance === l.StanceType.Paradrop && 1 < e.tileElevation),
                ))
                o.canDamage(i, t, i.zone) && 0 < (r = o.computeDamage(s, i, a)) && o.inflictDamage(r, i, void 0, a, !0);
            });
          }
          applyDecay(s) {
            var e = new Set(this.radLevelByTile.keys());
            (this.radLevelByTile.clear(),
              this.radSites.forEach(({ radLevel: e, radius: t }, i) => {
                var r = e - s;
                r <= 0
                  ? this.radSites.delete(i)
                  : (this.radSites.set(i, { radLevel: r, radius: t }), this.setRadLevelAround(i, t, r));
              }),
              this._onChange.dispatch(this, e));
          }
          createRadSite(e, t, i) {
            var r;
            (t -= this.radSites.get(e)?.radLevel ?? 0) <= 0 ||
              (this.radSites.set(e, { radLevel: (this.radSites.get(e)?.radLevel ?? 0) + t, radius: i }),
              (r = this.setRadLevelAround(e, i, t)).size && this._onChange.dispatch(this, r));
          }
          setRadLevelAround(e, t, i) {
            let r = new c.RangeHelper(this.map.tileOccupation),
              s = new h.RadialTileFinder(
                this.map.tiles,
                this.map.mapBounds,
                e,
                { width: 1, height: 1 },
                0,
                t,
                (e) => !!e,
                !1,
              );
            var a;
            let n = new Set();
            for (; (a = s.getNextTile());) {
              var o = r.tileDistance(e, a);
              o <= t &&
                ((o = Math.ceil(u.lerp(i, 0 * i, o / t))),
                this.radLevelByTile.set(a, Math.min(1e3, (this.radLevelByTile.get(a) ?? 0) + o)),
                n.add(a));
            }
            return n;
          }
          getRadSiteLevel(e) {
            return this.radSites.get(e)?.radLevel;
          }
        }),
          e("MapRadiationTrait", a));
      },
    };
  },
);
