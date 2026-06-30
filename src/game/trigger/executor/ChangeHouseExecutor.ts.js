// === Reconstructed SystemJS module: game/trigger/executor/ChangeHouseExecutor ===
// deps: ["game/gameobject/GameObject","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/ChangeHouseExecutor",
  ["game/gameobject/GameObject", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var s, i, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((a = class a extends i.TriggerExecutor {
          constructor(e, t) {
            (super(e, t), (this.houseId = Number(e.params[1])));
          }
          execute(e, t) {
            let i;
            if (
              this.houseId >= a.locationHouseIdBegin &&
              this.houseId < a.locationHouseIdBegin + e.map.startingLocations.length
            ) {
              let t = this.houseId - a.locationHouseIdBegin;
              i = e.getAllPlayers().find((e) => e.startLocation === t);
            } else i = e.getAllPlayers().find((e) => e.country?.id === this.houseId);
            if ((i?.defeated && (i = e.isAssetRedistributionEnabled() ? e.alliances.getAllies(i)[0] : void 0), i))
              for (var r of t) r instanceof s.GameObject && r.isSpawned && e.changeObjectOwner(r, i);
          }
        }),
          e("ChangeHouseExecutor", a),
          (a.locationHouseIdBegin = 4475));
      },
    };
  },
);
