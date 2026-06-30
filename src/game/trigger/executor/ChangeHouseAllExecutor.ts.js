// === Reconstructed SystemJS module: game/trigger/executor/ChangeHouseAllExecutor ===
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/ChangeHouseAllExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
  "use strict";
  var i, a;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((a = class a extends i.TriggerExecutor {
        execute(r) {
          let t = r.getAllPlayers().find((e) => e.country?.name === this.trigger.houseName);
          if (t) {
            let i = Number(this.action.params[1]),
              e;
            if (i >= a.locationHouseIdBegin && i < a.locationHouseIdBegin + r.map.startingLocations.length) {
              let t = i - a.locationHouseIdBegin;
              e = r.getAllPlayers().find((e) => e.startLocation === t);
            } else e = r.getAllPlayers().find((e) => e.country?.id === i);
            if ((e?.defeated && (e = r.isAssetRedistributionEnabled() ? r.alliances.getAllies(t)[0] : void 0), e))
              for (var s of t.getOwnedObjects(!0)) r.changeObjectOwner(s, e);
          }
        }
      }),
        e("ChangeHouseAllExecutor", a),
        (a.locationHouseIdBegin = 4475));
    },
  };
});
