// === Reconstructed SystemJS module: game/gameobject/task/move/MoveInsideTask ===
// deps: ["game/gameobject/task/move/MoveTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/task/move/MoveInsideTask", ["game/gameobject/task/move/MoveTask"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class r extends i.MoveTask {
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
          (super(e, r.chooseTargetFoundationTile(t, e), !1, { ignoredBlockers: [t], closeEnoughTiles: 0 }),
            (this.target = t));
        }
        hasReachedDestination(e) {
          return super.hasReachedDestination(e) || this.canStopAtTile(e, e.tile, e.onBridge);
        }
        canStopAtTile(e, t, i) {
          var r = this.game.map.tileOccupation.isTileOccupiedBy(t, this.target);
          return (!this.isCancelling() || !r) && !(!this.isCancelling() && !r);
        }
        isCloseEnoughToDest(e, t, i) {
          return this.game.map.tileOccupation.isTileOccupiedBy(t, this.target);
        }
      }),
        e("MoveInsideTask", r));
    },
  };
});
