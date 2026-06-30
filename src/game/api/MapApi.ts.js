// === Reconstructed SystemJS module: game/api/MapApi ===
// deps: ["game/type/SpeedType","game/gameobject/trait/TiberiumTrait","engine/type/TiberiumType","game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/api/MapApi",
  ["game/type/SpeedType", "game/gameobject/trait/TiberiumTrait", "engine/type/TiberiumType", "game/math/Vector2"],
  function (e, t) {
    "use strict";
    var r, n, s, a, o, l, c, i, h;
    t && t.id;
    return {
      setters: [
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
          i = e;
        },
      ],
      execute: function () {
        (e(
          "MapApi",
          (h = class {
            constructor(e) {
              (r.add(this),
                n.set(this, void 0),
                s.set(this, void 0),
                __classPrivateFieldSet(this, n, e, "f"),
                __classPrivateFieldSet(this, s, e.map, "f"));
            }
            getRealMapSize() {
              return __classPrivateFieldGet(this, s, "f").tiles.getMapSize();
            }
            getStartingLocations() {
              return __classPrivateFieldGet(this, s, "f").startingLocations.map((e) => new i.Vector2(e.x, e.y));
            }
            getTheaterType() {
              return __classPrivateFieldGet(this, s, "f").getTheaterType();
            }
            getTile(e, t) {
              var i = __classPrivateFieldGet(this, s, "f").tiles.getByMapCoords(e, t);
              if (i && __classPrivateFieldGet(this, s, "f").mapBounds.isWithinBounds(i)) return i;
            }
            getTilesInRect(e, t) {
              let i = t
                ? __classPrivateFieldGet(this, s, "f").tiles.getInRectangle(e, t)
                : __classPrivateFieldGet(this, s, "f").tiles.getInRectangle(e);
              return i.filter((e) => __classPrivateFieldGet(this, s, "f").mapBounds.isWithinBounds(e));
            }
            getObjectsOnTile(e) {
              return __classPrivateFieldGet(this, s, "f")
                .getObjectsOnTile(e)
                .map((e) => e.id);
            }
            hasBridgeOnTile(e) {
              return !!e.onBridgeLandType;
            }
            hasHighBridgeOnTile(e) {
              return !!__classPrivateFieldGet(this, s, "f").tileOccupation.getBridgeOnTile(e)?.isHighBridge();
            }
            isPassableTile(e, t, i, r) {
              return (
                (r = r ?? t === o.SpeedType.Foot),
                0 < __classPrivateFieldGet(this, s, "f").terrain.getPassableSpeed(e, t, r, i)
              );
            }
            findPath(e, t, i, r, s) {
              let a = __classPrivateFieldGet(this, n, "f").map.terrain.computePath(
                e,
                t,
                i.tile,
                i.onBridge,
                r.tile,
                r.onBridge,
                {
                  bestEffort: s?.bestEffort,
                  excludeTiles: s?.excludeNodes
                    ? (e) => s.excludeNodes({ tile: e.tile, onBridge: !!e.onBridge })
                    : void 0,
                  maxExpandedNodes: s?.maxExpandedNodes,
                },
              );
              return a.map((e) => ({ tile: e.tile, onBridge: !!e.onBridge }));
            }
            getReachabilityMap(e, t) {
              let i = __classPrivateFieldGet(this, n, "f").map.terrain.getIslandIdMap(e, t);
              return {
                isReachable(e, t) {
                  var i = this.getRegionId(e),
                    r = this.getRegionId(t);
                  return void 0 !== i && i === r;
                },
                getRegionId(e) {
                  return i.get(e.tile, e.onBridge);
                },
              };
            }
            isVisibleTile(e, t, i = 0) {
              var r = __classPrivateFieldGet(this, n, "f").getPlayerByName(t);
              if (!r) throw new Error(`Player "${t}" doesn't exist`);
              return !__classPrivateFieldGet(this, n, "f").mapShroudTrait.getPlayerShroud(r)?.isShrouded(e, i);
            }
            getTileResourceData(e) {
              var t = __classPrivateFieldGet(this, s, "f")
                .getObjectsOnTile(e)
                .find((e) => (e.isOverlay() && e.isTiberium()) || (e.isTerrain() && e.rules.spawnsTiberium));
              return t ? __classPrivateFieldGet(this, r, "m", a).call(this, t) : void 0;
            }
            getAllTilesResourceData() {
              var e;
              let t = [];
              for (e of __classPrivateFieldGet(this, n, "f").getWorld().getAllObjects()) {
                var i = __classPrivateFieldGet(this, r, "m", a).call(this, e);
                i && t.push(i);
              }
              return t;
            }
          }),
        ),
          (n = new WeakMap()),
          (s = new WeakMap()),
          (r = new WeakSet()),
          (a = function (t) {
            let i;
            if (t.isOverlay() && t.isTiberium()) {
              let e = t.traits.get(l.TiberiumTrait);
              var r = e.getTiberiumType(),
                s = e.getBailCount();
              i = {
                tile: t.tile,
                ore: r !== c.TiberiumType.Gems ? s : 0,
                gems: r === c.TiberiumType.Gems ? s : 0,
                spawnsOre: !1,
              };
            } else t.isTerrain() && t.rules.spawnsTiberium && (i = { tile: t.tile, ore: 0, gems: 0, spawnsOre: !0 });
            return i;
          }));
      },
    };
  },
);
