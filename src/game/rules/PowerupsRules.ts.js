// === Reconstructed SystemJS module: game/rules/PowerupsRules ===
// deps: ["game/trait/CrateGeneratorTrait","game/type/PowerupType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/rules/PowerupsRules",
  ["game/trait/CrateGeneratorTrait", "game/type/PowerupType"],
  function (e, t) {
    "use strict";
    var o, l, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        e(
          "PowerupsRules",
          (i = class {
            constructor() {
              this.powerups = [];
            }
            readIni(e) {
              for (var [s, a] of e.entries) {
                let [e, t, i, r] = a.split(",");
                var n = Number(e),
                  a = l.PowerupType[s];
                void 0 !== a
                  ? o.UNSUPPORTED_POWERUP_TYPES.includes(a) ||
                    this.powerups.push({
                      type: a,
                      probShares: n,
                      animName: "<none>" !== t.toLowerCase() ? t : void 0,
                      waterAllowed: "yes" === i,
                      data: r,
                    })
                  : console.warn(`Unknown powerup "${s}". Skipping.`);
              }
              return this;
            }
          }),
        );
      },
    };
  },
);
