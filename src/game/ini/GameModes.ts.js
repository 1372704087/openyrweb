// === Reconstructed SystemJS module: game/ini/GameModes ===
// deps: ["game/rules/MpDialogSettings","game/ini/GameModeType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/ini/GameModes", ["game/rules/MpDialogSettings", "game/ini/GameModeType"], function (e, t) {
  "use strict";
  var n, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        n = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "GameModes",
        (r = class {
          constructor(e, t) {
            ((this.modeIniLoader = t), (this.entries = new Map()), this.loadIni(e));
          }
          loadIni(e) {
            e.getOrderedSections().forEach((s) => {
              let a = i.GameModeType[s.name] ?? i.GameModeType.Battle;
              [...s.entries.keys()].forEach((e) => {
                let t = s.getArray(e);
                if (t.length < 5) throw new Error(`Invalid format for mp mode entry "${e}".`);
                var i = Number(e),
                  r = t[2].toLowerCase(),
                  r = {
                    id: i,
                    type: a,
                    label: t[0],
                    description: t[1],
                    rulesOverride: r,
                    mapFilter: t[3],
                    randomMapsAllowed: t[4],
                    aiAllowed: i < 3,
                    mpDialogSettings: new n.MpDialogSettings().readIni(
                      this.modeIniLoader(r).getOrCreateSection("MultiplayerDialogSettings"),
                    ),
                  };
                this.entries.set(i, r);
              });
            });
          }
          getById(e) {
            if (!this.entries.has(e)) throw new Error("No game mode found with id " + e);
            return this.entries.get(e);
          }
          hasId(e) {
            return this.entries.has(e);
          }
          getAll() {
            return [...this.entries.values()];
          }
        }),
      );
    },
  };
});
