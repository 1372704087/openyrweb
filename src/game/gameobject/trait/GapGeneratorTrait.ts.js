// === Reconstructed SystemJS module: game/gameobject/trait/GapGeneratorTrait ===
// deps: ["game/GameSpeed","game/map/MapShroud","game/math/Box2","game/math/Vector2","game/rules/TechnoRules","game/gameobject/unit/RangeHelper","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyUnspawn","game/gameobject/trait/interface/NotifyWarpChange"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/GapGeneratorTrait",
  [
    "game/GameSpeed",
    "game/map/MapShroud",
    "game/math/Box2",
    "game/math/Vector2",
    "game/rules/TechnoRules",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyUnspawn",
    "game/gameobject/trait/interface/NotifyWarpChange",
  ],
  function (e, t) {
    "use strict";
    var c, l, h, u, d, g, i, r, s, a, n, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          l = e;
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
      ],
      execute: function () {
        ((o = class {
          constructor(e) {
            ((this.radiusTiles = e), (this.refreshTicks = 0));
          }
          [s.NotifyTick.onTick](e, t) {
            (0 < this.refreshTicks && this.refreshTicks--, this.refreshTicks <= 0 && this.update(e, t));
          }
          [r.NotifySpawn.onSpawn](e, t) {
            this.markGapTilesForFriendlies(e, e.owner, t, !0);
          }
          [a.NotifyUnspawn.onUnspawn](e, t) {
            (this.markGapTilesForFriendlies(e, e.owner, t, !1), this.update(e, t));
          }
          [i.NotifyOwnerChange.onChange](e, t, i) {
            (this.markGapTilesForFriendlies(e, t, i, !1),
              this.markGapTilesForFriendlies(e, e.owner, i, !0),
              this.update(e, i));
          }
          [n.NotifyWarpChange.onChange](e, t, i) {
            (this.markGapTilesForFriendlies(e, e.owner, t, !i), i && this.update(e, t));
          }
          markGapTilesForFriendlies(i, e, r, t) {
            let s = [e, ...r.alliances.getAllies(e)],
              a;
            for (var n of s) {
              let e = r.mapShroudTrait.getPlayerShroud(n);
              if (e && (e.toggleFlagsAround(i.tile, this.radiusTiles, l.ShroudFlag.Darken, t), !t)) {
                if (!a) {
                  let t = new g.RangeHelper(r.map.tileOccupation);
                  a = s
                    .map((e) => [...e.buildings])
                    .flat()
                    .filter(
                      (e) =>
                        e.gapGeneratorTrait &&
                        e !== i &&
                        t.tileDistance(e, i) <= e.gapGeneratorTrait.radiusTiles + this.radiusTiles,
                    );
                }
                for (var o of a) e.toggleFlagsAround(o.tile, o.gapGeneratorTrait.radiusTiles, l.ShroudFlag.Darken, !0);
              }
            }
          }
          update(t, i) {
            this.refreshTicks = 5 * c.GameSpeed.BASE_TICKS_PER_SECOND;
            let r;
            var s,
              a,
              n,
              o,
              l = t.owner.buildings.has(t) && t.poweredTrait?.isPoweredOn();
            for (s of i.getCombatants())
              if (s !== t.owner && !i.alliances.areAllied(t.owner, s)) {
                let e = i.mapShroudTrait.getPlayerShroud(s);
                if (e)
                  if (l) {
                    (e.unrevealAround(t.tile, this.radiusTiles),
                      r ||
                        ((n = this.radiusTiles + d.TechnoRules.MAX_SIGHT),
                        (a = new u.Vector2(t.tile.rx, t.tile.ry).addScalar(-n)),
                        (n = new u.Vector2(t.tile.rx, t.tile.ry).addScalar(n)),
                        (r = i.map.technosByTile.queryRange(new h.Box2(a, n)))));
                    for (o of r)
                      o.owner === s || i.alliances.areAllied(o.owner, s)
                        ? e.revealFrom(o)
                        : o.rules.revealToAll && e.revealObject(o);
                  } else [...s.buildings].some((e) => e.rules.spySat) && e.revealAround(t.tile, this.radiusTiles);
              }
          }
        }),
          e("GapGeneratorTrait", o));
      },
    };
  },
);
