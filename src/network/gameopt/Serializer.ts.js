// === Reconstructed SystemJS module: network/gameopt/Serializer ===
// deps: ["data/DataStream","network/gameopt/SlotInfo","game/gameopts/GameOpts","network/gameopt/MapNameLegacyEncoder","network/gameopt/FileNameEncoder","util/Base64","util/string"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gameopt/Serializer",
  [
    "data/DataStream",
    "network/gameopt/SlotInfo",
    "game/gameopts/GameOpts",
    "network/gameopt/MapNameLegacyEncoder",
    "network/gameopt/FileNameEncoder",
    "util/Base64",
    "util/string",
  ],
  function (e, t) {
    "use strict";
    var s, i, r, n, o, l, c, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
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
      ],
      execute: function () {
        (e(
          "Serializer",
          (a = class a {
            serializeOptions(e, t = !1) {
              let i = e.gameMode,
                r = t
                  ? new n.MapNameLegacyEncoder().encode(e.mapTitle)
                  : l.Base64.encode(c.utf16ToBinaryString(e.mapTitle)),
                s = new o.FileNameEncoder().encode(e.mapName);
              var a = [
                "0",
                "0",
                6 - e.gameSpeed,
                e.credits,
                e.unitCount,
                Number(e.shortGame),
                Number(e.superWeapons),
                Number(e.buildOffAlly),
                Number(e.mcvRepacks),
                Number(e.cratesAppear),
                i,
                Number(e.hostTeams ?? !1),
                r,
                e.maxSlots,
                Number(e.mapOfficial),
                e.mapSizeBytes,
                s,
                e.mapDigest,
                Number(e.destroyableBridges),
                Number(e.multiEngineer),
                Number(e.noDogEngiKills),
                Number(e.instantCapture),
                Number(e.delayedOils),
                ...(e.unknown ? [e.unknown] : []),
              ].join(",");
              return (
                a +
                `:${e.humanPlayers.map((e) => "" + e.name + `,${e.countryId},${e.colorId},${e.startPos},${e.teamId},0,0,0`).join(",")}:@:${this.serializeAiOpts(e.aiPlayers)},`
              );
            }
            serializeAiOpts(e) {
              return e
                .map((e) =>
                  e ? `${e.difficulty},${e.countryId},${e.colorId},${e.startPos},` + e.teamId : "0,-1,-1,-1,-1",
                )
                .join(",");
            }
            serializePingData(e) {
              return e.length + "," + e.map((e) => e.playerName + "," + e.ping).join(",");
            }
            serializeSlotData(e) {
              return (
                e
                  .map((e) => {
                    if (e.type === i.SlotType.Closed) return "@Closed@";
                    if (e.type === i.SlotType.Open) return "@Open@";
                    if (e.type === i.SlotType.OpenObserver) return "@OpenObserver@";
                    if (e.type === i.SlotType.Ai) {
                      if (e.difficulty === r.AiDifficulty.Easy) return "@EasyAI@";
                      if (e.difficulty === r.AiDifficulty.Medium) return "@MediumAI@";
                      if (e.difficulty === r.AiDifficulty.Brutal) return "@HardAI@";
                    } else if (e.type === i.SlotType.Player) return e.name;
                    throw new Error("Unexpected slot info with type " + i.SlotType[e.type]);
                  })
                  .join(",") + ","
              );
            }
            serializeLoadInfo(e) {
              return e.map((e) => [e.name, e.status, e.loadPercent, e.ping, e.lagAllowanceMillis].join(",")).join(",");
            }
            serializePlayerActions(e) {
              let t = new s.DataStream();
              t.writeUint8(e.length);
              for (var { id: i, params: r } of e)
                if ((t.writeUint8(i), t.writeUint16(r.byteLength), 0 < r.byteLength)) {
                  if (r.byteLength > a.MAX_ACTION_PAYLOAD_SIZE - t.position)
                    throw (
                      console.error(`Action #${i} payload exceeds max data size`, r),
                      new RangeError("Maximum payload data size exceeded")
                    );
                  t.writeUint8Array(r);
                }
              return t.toUint8Array();
            }
            serializeAllPlayerActions(e, t) {
              e.writeUint8(t.size);
              for (var [i, r] of t) {
                e.writeUint8(i);
                var s = this.serializePlayerActions(r);
                if ((e.writeUint16(s.byteLength), 0 < s.byteLength)) {
                  if (s.byteLength > a.MAX_ACTION_PAYLOAD_SIZE)
                    throw (
                      console.error(`Player #${i} actions payload exceeds max data size`, r),
                      new RangeError("Maximum payload data size exceeded")
                    );
                  e.writeUint8Array(s);
                }
              }
            }
            serializeMapData(e) {
              return c.binaryStringToUint8Array(e);
            }
          }),
        ),
          (a.MAX_ACTION_PAYLOAD_SIZE = 65536));
      },
    };
  },
);
