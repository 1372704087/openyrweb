// === Reconstructed SystemJS module: game/trait/MapShroudTrait ===
// deps: ["game/map/MapShroud","game/trait/interface/NotifyTick","game/trait/interface/NotifyOwnerChange","game/trait/interface/NotifyAllianceChange","util/typeGuard","game/trait/interface/NotifySpawn","game/trait/interface/NotifyUnspawn","game/trait/RadarTrait","game/rules/general/RadarRules","engine/type/ObjectType","game/trait/interface/NotifyPower","game/trait/interface/NotifyElevationChange"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/MapShroudTrait",
  [
    "game/map/MapShroud",
    "game/trait/interface/NotifyTick",
    "game/trait/interface/NotifyOwnerChange",
    "game/trait/interface/NotifyAllianceChange",
    "util/typeGuard",
    "game/trait/interface/NotifySpawn",
    "game/trait/interface/NotifyUnspawn",
    "game/trait/RadarTrait",
    "game/rules/general/RadarRules",
    "engine/type/ObjectType",
    "game/trait/interface/NotifyPower",
    "game/trait/interface/NotifyElevationChange",
  ],
  function (e, t) {
    "use strict";
    var s, i, r, a, n, o, l, c, h, u, d, g, p;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
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
      ],
      execute: function () {
        ((p = class {
          constructor(e, t) {
            ((this.map = e),
              (this.alliances = t),
              (this.shroudByPlayer = new Map()),
              (this.revealedToAll = new Set()),
              (this.gapGenerators = new Set()),
              (this.handleTileOccupationUpdate = ({ object: e, type: t }) => {
                if ("removed" !== t && e.isTechno()) {
                  var i,
                    r = e.owner;
                  for (i of [r, ...this.alliances.getAllies(r)]) this.shroudByPlayer.get(i)?.revealFrom(e);
                }
              }));
          }
          getPlayerShroud(e) {
            return this.shroudByPlayer.get(e);
          }
          init(t) {
            t.map.tileOccupation.onChange.subscribe(this.handleTileOccupationUpdate);
            let i = new s.MapShroud().fromTiles(this.map.tiles);
            for (var r of t.getCombatants()) {
              let e = i.clone();
              (this.shroudByPlayer.set(r, e), this.revealObjects(e, r, t), e.update());
            }
          }
          [g.NotifyElevationChange.onElevationChange](e, t, i) {
            if (Math.floor(e.tileElevation) !== Math.floor(i)) {
              var r,
                s = e.owner;
              for (r of [s, ...this.alliances.getAllies(s)]) this.shroudByPlayer.get(r)?.revealFrom(e);
            }
          }
          [i.NotifyTick.onTick](e) {
            for (var [t, i] of this.shroudByPlayer)
              t.defeated && !t.isObserver ? this.shroudByPlayer.delete(t) : i.update();
          }
          [r.NotifyOwnerChange.onChange](e, t, i) {
            if (
              (e.isBuilding() &&
                e.rules.spySat &&
                (this.revealMap(e.owner, i),
                t.getOwnedObjectsByType(u.ObjectType.Building).find((e) => e.rules.spySat) || this.resetShroud(t, i)),
              e.isSpawned)
            )
              for (var r of [e.owner, ...i.alliances.getAllies(e.owner)]) this.shroudByPlayer.get(r)?.revealFrom(e);
          }
          [a.NotifyAllianceChange.onChange](t, e, i) {
            if (e) {
              let e = this.getPlayerShroud(t.players.first);
              var r,
                s,
                a = i.alliances
                  .getAllies(t.players.first)
                  .map((e) => this.getPlayerShroud(e))
                  .filter(n.isNotNullOrUndefined);
              for (r of a) e.merge(r);
              e.invalidateFull();
              for (s of a) (s.copy(e), s.invalidateFull());
            }
          }
          [o.NotifySpawn.onSpawn](e, t) {
            if (e.isBuilding()) {
              if ((e.rules.spySat && this.revealMap(e.owner, t), e.rules.revealToAll)) {
                this.revealedToAll.add(e);
                for (var i of t.getCombatants())
                  i === e.owner ||
                    t.alliances.areAllied(e.owner, i) ||
                    (this.shroudByPlayer.get(i)?.revealObject(e),
                    t.traits
                      .get(c.RadarTrait)
                      .addEventForPlayer(h.RadarEventType.EnemyObjectSensed, i, e.centerTile, t));
              }
              e.gapGeneratorTrait && this.gapGenerators.add(e);
            }
          }
          [l.NotifyUnspawn.onUnspawn](e, t) {
            e.isBuilding() &&
              (e.rules.spySat &&
                (e.owner.getOwnedObjectsByType(u.ObjectType.Building).find((e) => e.rules.spySat) ||
                  this.resetShroud(e.owner, t)),
              e.rules.revealToAll && this.revealedToAll.delete(e),
              e.gapGeneratorTrait && this.gapGenerators.delete(e));
          }
          [d.NotifyPower.onPowerLow](e, t) {
            this.updateGaps(t, e);
          }
          [d.NotifyPower.onPowerRestore](e, t) {
            this.updateGaps(t, e);
          }
          [d.NotifyPower.onPowerChange](e, t) {}
          revealMap(e, t) {
            (this.shroudByPlayer.get(e)?.revealAll(), this.markOwnGapTiles(t, e), this.updateGaps(t));
          }
          resetShroud(e, t) {
            let i = this.shroudByPlayer.get(e);
            i && (i.reset(), this.markOwnGapTiles(t, e), this.revealObjects(i, e, t));
          }
          revealObjects(t, e, i) {
            var r;
            for (r of [
              ...e.getOwnedObjects(),
              ...i.alliances
                .getAllies(e)
                .map((e) => e.getOwnedObjects())
                .flat(),
            ])
              t.revealFrom(r);
            this.revealedToAll.forEach((e) => t.revealObject(e));
          }
          updateGaps(e, t) {
            for (var i of this.gapGenerators) (t && i.owner !== t) || i.gapGeneratorTrait.update(i, e);
          }
          markOwnGapTiles(e, t) {
            for (var i of this.gapGenerators)
              (i.owner !== t && !e.alliances.areAllied(i.owner, t)) ||
                this.getPlayerShroud(t)?.toggleFlagsAround(
                  i.tile,
                  i.gapGeneratorTrait.radiusTiles,
                  s.ShroudFlag.Darken,
                  !0,
                );
          }
          dispose() {
            this.map.tileOccupation.onChange.unsubscribe(this.handleTileOccupationUpdate);
          }
        }),
          e("MapShroudTrait", p));
      },
    };
  },
);
