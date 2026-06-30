// === Reconstructed SystemJS module: game/gameopts/GameOptRandomGen ===
// deps: ["game/math/Vector2","game/Prng","game/rules/mpAllowedColors","util/typeGuard","game/gameopts/constants"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameopts/GameOptRandomGen",
  ["game/math/Vector2", "game/Prng", "game/rules/mpAllowedColors", "util/typeGuard", "game/gameopts/constants"],
  function (e, t) {
    "use strict";
    var l, i, n, d, g, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        e(
          "GameOptRandomGen",
          (r = class {
            static factory(e, t) {
              return new this(i.Prng.factory(e, t));
            }
            constructor(e) {
              this.prng = e;
            }
            generateColors(e) {
              let t = [...e.humanPlayers, ...e.aiPlayers].filter(d.isNotNullOrUndefined),
                i = t.map((e) => e.colorId).filter((e) => e !== g.RANDOM_COLOR_ID);
              var r = n.mpAllowedColors.length;
              let s = new Array(r)
                  .fill(0)
                  .map((e, t) => t)
                  .filter((e) => !i.includes(e)),
                a = new Map();
              return (
                t.forEach((e) => {
                  if (e.countryId !== g.OBS_COUNTRY_ID && e.colorId === g.RANDOM_COLOR_ID) {
                    if (s.length < 1) throw new Error("Out of available colors to choose from");
                    var t = this.prng.generateRandomInt(0, s.length - 1);
                    (a.set(e, s[t]), s.splice(t, 1));
                  }
                }),
                a
              );
            }
            generateCountries(e, t) {
              let i = t.getMultiplayerCountries().length,
                r = [...e.humanPlayers, ...e.aiPlayers].filter(d.isNotNullOrUndefined),
                s = new Map();
              return (
                r.forEach((e) => {
                  e.countryId === g.RANDOM_COUNTRY_ID && s.set(e, this.prng.generateRandomInt(0, i - 1));
                }),
                s
              );
            }
            generateStartLocations(e, i) {
              let t = [...e.humanPlayers, ...e.aiPlayers].filter(d.isNotNullOrUndefined),
                r = t.filter((e) => e.startPos !== g.RANDOM_START_POS).map((e) => e.startPos),
                s = [...i.keys()].filter((e) => !r.includes(e)),
                a = [];
              for (; s.length;) {
                var n = s.length ? this.prng.generateRandomInt(0, s.length - 1) : 0;
                a.push(...s.splice(n, 1));
              }
              if ((a.unshift(...r), 3 <= a.length))
                for (var o of [1, 2])
                  if (!(r.length - 1 >= o)) {
                    let e = a.map((e) => i[e]),
                      t = this.findFarthestPointFrom(e.slice(0, o), e.slice(o));
                    var l = e.findIndex((e) => e.x === t.x && e.y === t.y);
                    a.splice(o, 0, ...a.splice(l, 1));
                  }
              if (4 <= a.length)
                if (r.length - 1 < 3) {
                  let e = a.map((e) => i[e]),
                    t = this.findFarthestPointFrom(e.slice(2, 3), e.slice(3));
                  var c = e.findIndex((e) => e.x === t.x && e.y === t.y);
                  a.splice(3, 0, ...a.splice(c, 1));
                }
              a.splice(0, r.length);
              let h = new Map(),
                u = -1;
              return (
                t.forEach((e) => {
                  if (e.countryId !== g.OBS_COUNTRY_ID && e.startPos === g.RANDOM_START_POS) {
                    if (u >= a.length - 1) throw new RangeError("Map has fewer starting locations than players");
                    h.set(e, a[++u]);
                  }
                }),
                h
              );
            }
            findFarthestPointFrom(e, t) {
              let r = e.map((e) => new l.Vector2(e.x, e.y)),
                s,
                a = 0;
              if (!t.length) throw new Error("Search array must have at least one element");
              for (var n of t) {
                let i = new l.Vector2(n.x, n.y);
                var o = r.reduce((e, t) => e + i.distanceTo(t), 0);
                o >= a && ((s = n), (a = o));
              }
              return s;
            }
          }),
        );
      },
    };
  },
);
