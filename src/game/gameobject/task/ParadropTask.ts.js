// === Reconstructed SystemJS module: game/gameobject/task/ParadropTask ===
// deps: ["game/Coords","game/math/Vector3","game/gameobject/infantry/InfDeathType","game/gameobject/infantry/StanceType","game/gameobject/task/system/Task"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/ParadropTask",
  [
    "game/Coords",
    "game/math/Vector3",
    "game/gameobject/infantry/InfDeathType",
    "game/gameobject/infantry/StanceType",
    "game/gameobject/task/system/Task",
  ],
  function (e, t) {
    "use strict";
    var n, o, l, c, i, r;
    t && t.id;
    return {
      setters: [
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
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.Task {
          constructor(e) {
            (super(), (this.game = e));
          }
          onTick(e) {
            var t = Math.abs(this.game.rules.general.parachuteMaxFallRate),
              i = e.tile.onBridgeLandType ? this.game.map.tileOccupation.getBridgeOnTile(e.tile).tileElevation : 0,
              r = n.Coords.tileHeightToWorld(i),
              s = e.tileElevation,
              a = n.Coords.tileHeightToWorld(s);
            return r < Math.max(r, a - t)
              ? (e.position.moveByLeptons3(new o.Vector3(0, -t, 0)),
                e.moveTrait.handleElevationChange(s, this.game),
                !1)
              : ((e.position.tileElevation = i),
                (e.stance = c.StanceType.None),
                this.game.map.terrain.getPassableSpeed(e.tile, e.rules.speedType, e.isInfantry(), e.onBridge) ||
                  ((e.infDeathType = l.InfDeathType.None), this.game.destroyObject(e, void 0, !0)),
                !0);
          }
        }),
          e("ParadropTask", r));
      },
    };
  },
);
