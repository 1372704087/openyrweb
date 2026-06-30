// === Reconstructed SystemJS module: network/gameopt/Parser ===
// deps: ["data/DataStream","network/gameopt/MapNameLegacyEncoder","network/gameopt/SlotInfo","game/gameopts/GameOpts","network/gameopt/FileNameEncoder","util/Base64","util/string"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gameopt/Parser",
  [
    "data/DataStream",
    "network/gameopt/MapNameLegacyEncoder",
    "network/gameopt/SlotInfo",
    "game/gameopts/GameOpts",
    "network/gameopt/FileNameEncoder",
    "util/Base64",
    "util/string",
  ],
  function (e, t) {
    "use strict";
    var o, l, s, a, c, h, u, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        e(
          "Parser",
          (i = class {
            parseOptions(e) {
              let t = {},
                [i, r, , s] = e.split(":"),
                a = i.split(",");
              (a.shift(),
                a.shift(),
                (t.gameSpeed = 6 - Number(a.shift())),
                (t.credits = Number(a.shift())),
                (t.unitCount = Number(a.shift())),
                (t.shortGame = Boolean(Number(a.shift()))),
                (t.superWeapons = Boolean(Number(a.shift()))),
                (t.buildOffAlly = Boolean(Number(a.shift()))),
                (t.mcvRepacks = Boolean(Number(a.shift()))),
                (t.cratesAppear = Boolean(Number(a.shift()))),
                (t.gameMode = Number(a.shift())),
                (t.hostTeams = Boolean(Number(a.shift()))));
              var n = a.shift();
              return (
                (t.mapTitle = h.Base64.isBase64(n)
                  ? u.binaryStringToUtf16(h.Base64.decode(n))
                  : new l.MapNameLegacyEncoder().decode(n)),
                (t.maxSlots = Number(a.shift())),
                (t.mapOfficial = Boolean(Number(a.shift()))),
                (t.mapSizeBytes = Number(a.shift())),
                (t.mapName = new c.FileNameEncoder().decode(a.shift())),
                (t.mapDigest = a.shift()),
                (t.destroyableBridges = Boolean(Number(a.shift() ?? "1"))),
                (t.multiEngineer = Boolean(Number(a.shift() ?? "0"))),
                (t.noDogEngiKills = Boolean(Number(a.shift() ?? "0"))),
                (t.instantCapture = Boolean(Number(a.shift() ?? "1"))),
                (t.delayedOils = Boolean(Number(a.shift() ?? "0"))),
                (t.unknown = a.length ? a.join(",") : void 0),
                (t.humanPlayers = this.parsePlayerOpts(r)),
                (t.aiPlayers = this.parseAiOpts(s?.slice(0, -1))),
                t
              );
            }
            parsePlayerOpts(e) {
              var t = e.split(",");
              if (t.length % 8 != 0)
                throw new Error("Couldn't parse gameopt: unexpected players data length " + t.length);
              let i = [];
              for (let s = 0, a = Math.floor(t.length / 8); s < a; ++s) {
                var r = {
                  name: t[8 * s],
                  countryId: Number(t[8 * s + 1]),
                  colorId: Number(t[8 * s + 2]),
                  startPos: Number(t[8 * s + 3]),
                  teamId: Number(t[8 * s + 4]),
                };
                i.push(r);
              }
              return i;
            }
            parseAiOpts(i) {
              let r = [];
              if (i) {
                var s = i.split(",");
                if (s.length % 5 != 0) throw new Error("Couldn't parse gameopt: unexpected ai data length " + s.length);
                for (let e = 0, t = Math.floor(s.length / 5); e < t; ++e) {
                  var a = {
                    difficulty: Number(s[5 * e]),
                    countryId: Number(s[5 * e + 1]),
                    colorId: Number(s[5 * e + 2]),
                    startPos: Number(s[5 * e + 3]),
                    teamId: Number(s[5 * e + 4]),
                  };
                  r.push(-1 !== a.countryId ? a : void 0);
                }
              }
              return r;
            }
            parseTopic(e) {
              var t = e.split(",");
              if (!(t.length < 6)) {
                var i = t[0],
                  r = Number(t[1]),
                  s = i[2],
                  a = t[2],
                  n = t[3],
                  o = t[4],
                  i = new c.FileNameEncoder().decode(t[5]);
                return {
                  description: t[6] ? u.binaryStringToUtf16(h.Base64.decode(t[6])) : "",
                  modHash: r,
                  modName: t[7] ? u.binaryStringToUtf16(h.Base64.decode(t[7])) : void 0,
                  aiPlayers: Number(a),
                  maxPlayers: Number(s),
                  observers: Number(n),
                  observable: Boolean(Number(o)),
                  mapName: i,
                };
              }
            }
            parsePingData(e) {
              var t = e.split(",").slice(1);
              if (t.length % 2) throw new Error("Couldn't parse gameopt: unexpected ping data length " + t.length);
              let i = [];
              for (let r = 0, s = Math.floor(t.length / 2); r < s; ++r)
                i.push({ playerName: t[2 * r], ping: Number(t[2 * r + 1]) });
              return i;
            }
            parseSlotData(e) {
              var i;
              let r = [];
              for (i of e.slice(1, -1).split(",")) {
                let t = {};
                if ("@Closed@" === i) t.type = s.SlotType.Closed;
                else if ("@Open@" === i) t.type = s.SlotType.Open;
                else if ("@OpenObserver@" === i) t.type = s.SlotType.OpenObserver;
                else if (-1 !== ["@EasyAI@", "@MediumAI@", "@HardAI@"].indexOf(i)) {
                  t.type = s.SlotType.Ai;
                  let e;
                  if ("@EasyAI@" === i) e = a.AiDifficulty.Easy;
                  else if ("@MediumAI@" === i) e = a.AiDifficulty.Medium;
                  else {
                    if ("@HardAI@" !== i) throw new Error("Couldn't parse gameopt: unknown slot type " + i);
                    e = a.AiDifficulty.Brutal;
                  }
                  t.difficulty = e;
                } else ((t.type = s.SlotType.Player), (t.name = i));
                r.push(t);
              }
              return r;
            }
            parsePlayerActions(e) {
              let t = new o.DataStream(e);
              var i = t.readUint8();
              let r = [];
              for (let n = 0; n < i; ++n) {
                var s = t.readUint8(),
                  a = t.readUint16(),
                  a = 0 < a ? t.readUint8Array(a) : new Uint8Array();
                r.push({ id: s, params: a });
              }
              return r;
            }
            parseAllPlayerActions(e) {
              var t = e.readUint8();
              let i = new Map();
              for (let a = 0; a < t; ++a) {
                var r = e.readUint8(),
                  s = e.readUint16(),
                  s = 0 < s ? e.readUint8Array(s) : new Uint8Array(),
                  s = this.parsePlayerActions(s);
                i.set(r, s);
              }
              return i;
            }
            parseMapData(e) {
              return u.uint8ArrayToBinaryString(e);
            }
          }),
        );
      },
    };
  },
);
