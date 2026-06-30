// === Reconstructed SystemJS module: game/gameobject/trait/HoverBobTrait ===
// deps: ["game/GameSpeed","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifySpawn","game/Coords","game/gameobject/trait/interface/NotifyTileChange","game/math/GameMath"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/HoverBobTrait",
  [
    "game/GameSpeed",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifySpawn",
    "game/Coords",
    "game/gameobject/trait/interface/NotifyTileChange",
    "game/math/GameMath",
  ],
  function (e, t) {
    "use strict";
    var r, i, s, a, n, o, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
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
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        ((l = class {
          constructor() {
            ((this.prevHoverBobLeptons = 0), (this.spawnTick = 0));
          }
          [s.NotifySpawn.onSpawn](e, t) {
            (this.setBaseElevation(e, t), (this.spawnTick = t.currentTick));
          }
          [n.NotifyTileChange.onTileChange](e, t, i, r) {
            r && ((this.prevHoverBobLeptons = 0), this.setBaseElevation(e, t));
          }
          setBaseElevation(e, t) {
            e.position.tileElevation =
              (e.onBridge ? (t.map.tileOccupation.getBridgeOnTile(e.tile)?.tileElevation ?? 0) : 0) +
              a.Coords.worldToTileHeight(t.rules.general.hover.height);
          }
          [i.NotifyTick.onTick](e, t) {
            var i = this.computeHoverBobLeptons(t.currentTick, t.rules.general.hover),
              r = i - this.prevHoverBobLeptons;
            this.prevHoverBobLeptons = i;
            i = a.Coords.tileHeightToWorld(e.position.tileElevation);
            e.position.tileElevation = a.Coords.worldToTileHeight(i + r);
          }
          computeHoverBobLeptons(e, t) {
            var i = (e - this.spawnTick) / r.GameSpeed.BASE_TICKS_PER_SECOND / (60 * t.bob);
            return 0.1 * t.height * o.GameMath.sin(2 * i * Math.PI);
          }
        }),
          e("HoverBobTrait", l));
      },
    };
  },
);
