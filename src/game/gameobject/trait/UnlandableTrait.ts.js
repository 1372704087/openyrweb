// === Reconstructed SystemJS module: game/gameobject/trait/UnlandableTrait ===
// deps: ["game/math/Vector2","util/bresenham","util/typeGuard","game/gameobject/task/move/MoveTask","game/gameobject/task/system/CallbackTask","game/gameobject/task/system/TaskGroup","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/UnlandableTrait",
  [
    "game/math/Vector2",
    "util/bresenham",
    "util/typeGuard",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/system/TaskGroup",
    "game/gameobject/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var s, a, n, r, o, l, i, c;
    t && t.id;
    return {
      setters: [
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
          r = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((c = class {
          constructor() {
            this.enabled = !0;
          }
          setEnabled(e) {
            this.enabled = e;
          }
          [i.NotifyTick.onTick](e, t) {
            var i;
            this.enabled &&
              (e.owner.isNeutral || e.name === t.rules.general.paradrop.paradropPlane) &&
              e.unitOrderTrait.isIdle() &&
              ((i = this.chooseExitTile(e.tile, t)),
              e.unitOrderTrait.addTask(
                new l.TaskGroup(
                  new r.MoveTask(t, i, !1, { allowOutOfBoundsTarget: !0 }),
                  new o.CallbackTask((e) => t.unspawnObject(e)),
                ).setCancellable(!1),
              ));
          }
          chooseExitTile(e, t) {
            var i = t.map.tiles.getMapSize(),
              r =
                0.5 < t.generateRandom()
                  ? new s.Vector2(Math.floor(i.width / 2), 0)
                  : new s.Vector2(0, Math.floor(i.height / 2)),
              i = new s.Vector2(e.rx, e.ry),
              r = a
                .bresenham(i.x, i.y, r.x, r.y)
                .map((e) => t.map.tiles.getByMapCoords(e.x, e.y))
                .filter(n.isNotNullOrUndefined);
            if (!r.length) throw new Error("No valid exit tile found");
            return r[r.length - 1];
          }
        }),
          e("UnlandableTrait", c));
      },
    };
  },
);
