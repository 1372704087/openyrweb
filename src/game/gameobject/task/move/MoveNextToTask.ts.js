// === Reconstructed SystemJS module: game/gameobject/task/move/MoveNextToTask ===
// deps: ["game/gameobject/task/move/MoveTask","game/gameobject/unit/RangeHelper"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/move/MoveNextToTask",
  ["game/gameobject/task/move/MoveTask", "game/gameobject/unit/RangeHelper"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class s extends i.MoveTask {
          static chooseTargetFoundationTile(t, i) {
            if (t.isBuilding()) {
              let e = t.centerTile;
              return (
                i.map.mapBounds.isWithinBounds(e) ||
                  (e =
                    i.map.tileOccupation
                      .calculateTilesForGameObject(t.tile, t)
                      .find((e) => i.map.mapBounds.isWithinBounds(e)) ?? t.tile),
                e
              );
            }
            return t.tile;
          }
          constructor(e, t) {
            (super(e, s.chooseTargetFoundationTile(t, e), !1, {
              ignoredBlockers: [t],
              closeEnoughTiles: Math.SQRT2,
              strictCloseEnough: !0,
            }),
              (this.target = t),
              (this.rangeHelper = new r.RangeHelper(e.map.tileOccupation)));
          }
          hasReachedDestination(e) {
            return super.hasReachedDestination(e) || this.canStopAtTile(e, e.tile, e.onBridge);
          }
          canStopAtTile(e, t, i) {
            return !this.game.map.tileOccupation.isTileOccupiedBy(t, this.target) && super.canStopAtTile(e, t, i);
          }
          isCloseEnoughToDest(e, t, i) {
            return (
              void 0 === i ||
              (this.rangeHelper.isInTileRange(t, this.target, 0, i) &&
                !this.game.map.tileOccupation.isTileOccupiedBy(t, this.target))
            );
          }
        }),
          e("MoveNextToTask", s));
      },
    };
  },
);
