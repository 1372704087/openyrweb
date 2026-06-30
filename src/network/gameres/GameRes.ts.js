// === Reconstructed SystemJS module: network/gameres/GameRes ===
// deps: ["data/DataStream","engine/type/ObjectType","game/gameopts/constants","util/typeGuard","network/gameres/GameResType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gameres/GameRes",
  [
    "data/DataStream",
    "engine/type/ObjectType",
    "game/gameopts/constants",
    "util/typeGuard",
    "network/gameres/GameResType",
  ],
  function (t, e) {
    "use strict";
    var o, n, l, c, h, u, i;
    e && e.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        var e;
        (((e = u = u || {})[(e.Byte = 1)] = "Byte"),
          (e[(e.Boolean = 2)] = "Boolean"),
          (e[(e.Time = 5)] = "Time"),
          (e[(e.Int = 6)] = "Int"),
          (e[(e.String = 7)] = "String"),
          t(
            "GameRes",
            (i = class {
              fromGame(i, e, r) {
                let t = i.gameOpts,
                  s = i.gameOpts.humanPlayers
                    .filter((e) => e.countryId !== l.OBS_COUNTRY_ID)
                    .map((e) => i.getPlayerByName(e.name));
                ((this.game = {
                  id: i.id,
                  startTime: i.startTimestamp,
                  duration: Math.floor(i.currentTime / 1e3),
                  speed: 6 - t.gameSpeed,
                  players: s.length,
                  mapName: t.mapName,
                  mapDigest: t.mapDigest,
                  unitCount: t.unitCount,
                  cratesAppear: t.cratesAppear,
                  credits: t.credits,
                  tournament: e,
                  shortGame: t.shortGame,
                  superWeapons: t.superWeapons,
                  aiPlayers: t.aiPlayers.filter(c.isNotNullOrUndefined).length,
                  gameMode: t.gameMode,
                  buildOffAlly: t.buildOffAlly,
                  mcvRepacks: t.mcvRepacks,
                  destroyableBridges: t.destroyableBridges,
                  multiEngineer: t.multiEngineer,
                  noDogEngiKills: t.noDogEngiKills,
                  instantCapture: t.instantCapture,
                  delayedOils: t.delayedOils,
                }),
                  (this.client = r));
                let a = this.computePlayerTeams(i, s);
                return (
                  (this.players = s.map((t) => ({
                    buildingsBuilt: t.getUnitsBuilt(n.ObjectType.Building),
                    buildingsCaptured: t.buildingsCaptured,
                    buildingsKilled: t.getUnitsKilled(n.ObjectType.Building),
                    buildingsLeft: t.buildings.size,
                    color: 2 * [...i.rules.colors.values()].findIndex((e) => e.asHex() === t.color.asHex()) + 1,
                    cratesFound: t.cratesPickedUp,
                    endCredits: t.credits,
                    creditsGained: t.creditsGained,
                    infantryBuilt: t.getUnitsBuilt(n.ObjectType.Infantry),
                    infantryKilled: t.getUnitsKilled(n.ObjectType.Infantry),
                    infantryLeft: t.getOwnedObjectsByType(n.ObjectType.Infantry).length,
                    lostConnection: t.name === r.accountName && r.suddenDisconnect,
                    name: t.name,
                    planesBuilt: t.getUnitsBuilt(n.ObjectType.Aircraft),
                    planesKilled: t.getUnitsKilled(n.ObjectType.Aircraft),
                    planesLeft: t.getOwnedObjectsByType(n.ObjectType.Aircraft).length,
                    unitsBuilt: t.getUnitsBuilt(n.ObjectType.Vehicle),
                    unitsKilled: t.getUnitsKilled(n.ObjectType.Vehicle),
                    unitsLeft: t.getOwnedObjectsByType(n.ObjectType.Vehicle).length,
                    completionStatus: this.getCompletionStatus(t, i, this.client, s.length),
                    country: t.country.id,
                    side: t.country.side,
                    team: a.get(t),
                    startPos: t.startLocation,
                  }))),
                  this
                );
              }
              computePlayerTeams(e, t) {
                let i = new Map(),
                  r = 0;
                for (var s of t)
                  if (!i.has(s)) {
                    var a;
                    i.set(s, r);
                    for (a of e.alliances.getAllies(s)) i.has(a) || i.set(a, r);
                    r++;
                  }
                return i;
              }
              getCompletionStatus(e, t, i, r) {
                return i.finished
                  ? t.stalemateDetectTrait?.isStale() && 0 === t.stalemateDetectTrait.getCountdownTicks()
                    ? h.GameResType.Draw
                    : !e.defeated || t.alliances.getAllies(e).some((e) => !e.defeated)
                      ? h.GameResType.Win
                      : e.resigned
                        ? h.GameResType.Resign
                        : e.dropped
                          ? h.GameResType.Disconnect
                          : h.GameResType.Loss
                  : i.outOfSync
                    ? h.GameResType.Disconnect
                    : 2 < r
                      ? i.accountName !== e.name
                        ? h.GameResType.Playing
                        : i.quit
                          ? h.GameResType.Resign
                          : h.GameResType.Disconnect
                      : i.accountName !== e.name
                        ? h.GameResType.Win
                        : i.quit
                          ? h.GameResType.Resign
                          : e.defeated
                            ? h.GameResType.Loss
                            : h.GameResType.Disconnect;
              }
              toFlat() {
                return {
                  AFPS: [u.Int, this.client.avgFps],
                  APNG: [u.Int, this.client.avgRtt],
                  AIPL: [u.Int, this.game.aiPlayers],
                  CRAT: [u.Boolean, this.game.cratesAppear],
                  DURA: [u.Int, this.game.duration],
                  FINI: [u.Boolean, this.client.finished],
                  GSKU: [u.Int, this.client.gameSku],
                  CRED: [u.Int, this.game.credits],
                  OOSY: [u.Boolean, this.client.outOfSync],
                  PLRS: [u.Int, this.game.players],
                  PNGR: [u.Int, this.client.pingsRecv],
                  PNGS: [u.Int, this.client.pingsSent],
                  SCEN: [u.String, this.game.mapName],
                  SHRT: [u.Boolean, this.game.shortGame],
                  SPED: [u.Int, this.game.speed],
                  SUPR: [u.Boolean, this.game.superWeapons],
                  TIME: [u.Time, this.game.startTime],
                  TRNY: [u.Boolean, this.game.tournament],
                  UNIT: [u.Int, this.game.unitCount],
                  VERS: [u.String, this.client.clientVers],
                  MODE: [u.Int, this.game.gameMode],
                  BAMR: [u.Int, Number(this.game.mcvRepacks) + 2 * Number(this.game.buildOffAlly)],
                  MAPC: [u.String, this.game.mapDigest],
                  GMID: [u.String, this.game.id],
                  SNAM: [u.String, this.client.accountName],
                  DSTB: [u.Boolean, this.game.destroyableBridges],
                  MENG: [u.Boolean, this.game.multiEngineer],
                  DOGK: [u.Boolean, this.game.noDogEngiKills],
                  ICAP: [u.Boolean, this.game.instantCapture],
                  DOIL: [u.Boolean, this.game.delayedOils],
                  ...this.players
                    .map((e, t) => ({
                      ["BLB" + t]: [u.Time, e.buildingsBuilt],
                      ["BLC" + t]: [u.Int, e.buildingsCaptured],
                      ["BLK" + t]: [u.Time, e.buildingsKilled],
                      ["BLL" + t]: [u.Time, e.buildingsLeft],
                      ["COL" + t]: [u.Int, e.color],
                      ["CRA" + t]: [u.Int, e.cratesFound],
                      ["CRD" + t]: [u.Time, e.endCredits],
                      ["HRV" + t]: [u.Int, e.creditsGained],
                      ["INB" + t]: [u.Time, e.infantryBuilt],
                      ["INK" + t]: [u.Time, e.infantryKilled],
                      ["INL" + t]: [u.Time, e.infantryLeft],
                      ["LCN" + t]: [u.Boolean, e.lostConnection],
                      ["NAM" + t]: [u.String, e.name],
                      ["PLB" + t]: [u.Time, e.planesBuilt],
                      ["PLK" + t]: [u.Time, e.planesKilled],
                      ["PLL" + t]: [u.Time, e.planesLeft],
                      ["UNB" + t]: [u.Time, e.unitsBuilt],
                      ["UNK" + t]: [u.Time, e.unitsKilled],
                      ["UNL" + t]: [u.Time, e.unitsLeft],
                      ["CMP" + t]: [u.Int, e.completionStatus],
                      ["CTY" + t]: [u.Int, e.country],
                      ["SID" + t]: [u.Int, e.side],
                      ["TID" + t]: [u.Int, e.team],
                      ["STP" + t]: [u.Int, e.startPos],
                    }))
                    .reduce((e, t) => (e = { ...e, ...t }), {}),
                };
              }
              fromFlat(i) {
                function r(e) {
                  return e[0] === u.Int || e[0] === u.Time ? e[1] : 0;
                }
                function s(e) {
                  return e[0] === u.Boolean && e[1];
                }
                function a(e) {
                  return e[0] === u.String ? e[1] : "";
                }
                var e = r(i.PLRS),
                  t = r(i.BAMR),
                  n = Boolean(1 & t),
                  t = Boolean(2 & t);
                ((this.game = {
                  aiPlayers: r(i.AIPL),
                  cratesAppear: s(i.CRAT),
                  duration: r(i.DURA),
                  credits: r(i.CRED),
                  id: a(i.GMID),
                  players: e,
                  mapName: a(i.SCEN),
                  shortGame: s(i.SHRT),
                  speed: r(i.SPED),
                  superWeapons: s(i.SUPR),
                  startTime: r(i.TIME),
                  tournament: s(i.TRNY),
                  unitCount: r(i.UNIT),
                  gameMode: r(i.MODE),
                  buildOffAlly: t,
                  mcvRepacks: n,
                  mapDigest: a(i.MAPC),
                  destroyableBridges: void 0 === i.DSTB || s(i.DSTB),
                  multiEngineer: void 0 !== i.MENG && s(i.MENG),
                  noDogEngiKills: void 0 !== i.DOGK && s(i.DOGK),
                  instantCapture: void 0 === i.ICAP || s(i.ICAP),
                  delayedOils: void 0 !== i.DOIL && s(i.DOIL),
                }),
                  (this.players = new Array(e)
                    .fill(0)
                    .map((e, t) => ({
                      buildingsBuilt: r(i["BLB" + t]),
                      buildingsCaptured: r(i["BLC" + t]),
                      buildingsKilled: r(i["BLK" + t]),
                      buildingsLeft: r(i["BLL" + t]),
                      color: r(i["COL" + t]),
                      cratesFound: r(i["CRA" + t]),
                      endCredits: r(i["CRD" + t]),
                      creditsGained: void 0 !== i["HRV" + t] ? r(i["HRV" + t]) : -1,
                      infantryBuilt: r(i["INB" + t]),
                      infantryKilled: r(i["INK" + t]),
                      infantryLeft: r(i["INL" + t]),
                      lostConnection: s(i["LCN" + t]),
                      name: a(i["NAM" + t]),
                      planesBuilt: r(i["PLB" + t]),
                      planesKilled: r(i["PLK" + t]),
                      planesLeft: r(i["PLL" + t]),
                      unitsBuilt: r(i["UNB" + t]),
                      unitsKilled: r(i["UNK" + t]),
                      unitsLeft: r(i["UNL" + t]),
                      completionStatus: r(i["CMP" + t]),
                      country: r(i["CTY" + t]),
                      side: r(i["SID" + t]),
                      team: r(i["TID" + t]),
                      startPos: void 0 !== i["STP" + t] ? r(i["STP" + t]) : -1,
                    }))));
                let o = a(i.SNAM);
                e = this.players.find((e) => e.name === o);
                this.client = {
                  avgFps: r(i.AFPS),
                  avgRtt: r(i.APNG ?? 0),
                  finished: s(i.FINI),
                  gameSku: r(i.GSKU),
                  outOfSync: s(i.OOSY),
                  pingsRecv: r(i.PNGR),
                  pingsSent: r(i.PNGS),
                  clientVers: a(i.VERS),
                  quit: e?.completionStatus === h.GameResType.Resign,
                  accountName: o,
                  suddenDisconnect: e?.lostConnection ?? !1,
                };
              }
              toBinary() {
                var e,
                  t = new o.DataStream(),
                  i = this.toFlat();
                for (e of Object.keys(i)) {
                  var [r, s] = i[e];
                  this.writeType(r, e, s, t);
                }
                let a = new o.DataStream();
                return (
                  a.writeUint16(t.byteLength + 4, o.DataStream.BIG_ENDIAN),
                  a.writeUint16(0),
                  a.writeUint8Array(new Uint8Array(t.buffer, t.byteOffset, t.byteLength)),
                  new Uint8Array(a.buffer, a.byteOffset, a.byteLength)
                );
              }
              fromBinary(e) {
                let t = new o.DataStream(e);
                var i = t.readUint16(o.DataStream.BIG_ENDIAN) - 4;
                if (0 !== t.readUint16()) throw new Error("Invalid game res packet. Second byte should be 0.");
                let r = {};
                for (; i && t.position <= i - 4;) {
                  var { fieldName: s, type: a, data: n } = this.readType(t);
                  void 0 !== n && (r[s] = [a, n]);
                }
                return (this.fromFlat(r), this);
              }
              writeType(e, t, i, r) {
                if (4 < t.length) throw new Error(`Field "${t}" must not exceed 4 characters`);
                switch ((r.writeString(t, "ASCII", 4), r.writeUint16(e, o.DataStream.BIG_ENDIAN), e)) {
                  case u.Byte:
                    return (r.writeUint16(1, o.DataStream.BIG_ENDIAN), r.writeUint32(i, o.DataStream.BIG_ENDIAN));
                  case u.Boolean:
                    return (r.writeUint16(1, o.DataStream.BIG_ENDIAN), r.writeUint8Array([i ? 1 : 0, 0, 0, 0]));
                  case u.Time:
                  case u.Int:
                    return (r.writeUint16(4, o.DataStream.BIG_ENDIAN), r.writeUint32(i, o.DataStream.BIG_ENDIAN));
                  case u.String:
                    var s = i.length + 1;
                    return (r.writeUint16(s, o.DataStream.BIG_ENDIAN), r.writeCString(i, 4 * Math.ceil(s / 4)));
                  default:
                    throw new Error(`Unhandled type "${e}"`);
                }
              }
              readType(e) {
                var t = e.readString(4, "ASCII"),
                  i = e.readUint16(o.DataStream.BIG_ENDIAN),
                  r = e.readUint16(o.DataStream.BIG_ENDIAN);
                let s;
                switch (i) {
                  case u.Byte:
                    s = e.readUint32(o.DataStream.BIG_ENDIAN);
                    break;
                  case u.Boolean:
                    s = Boolean(e.readUint8Array(4)[0]);
                    break;
                  case u.Time:
                  case u.Int:
                    s = e.readUint32(o.DataStream.BIG_ENDIAN);
                    break;
                  case u.String:
                    s = e.readCString(4 * Math.ceil(r / 4));
                    break;
                  default:
                    (console.warn(`Unknown game res field type "${i}"`), (e.position += r), (s = void 0));
                }
                return { fieldName: t, type: i, data: s };
              }
            }),
          ));
      },
    };
  },
);
