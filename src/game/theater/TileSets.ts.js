// === Reconstructed SystemJS module: game/theater/TileSets ===
// deps: ["util/string","game/theater/TileSetEntry","game/theater/TileSet","game/theater/TileSetAnim"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/theater/TileSets",
  ["util/string", "game/theater/TileSetEntry", "game/theater/TileSet", "game/theater/TileSetAnim"],
  function (t, e) {
    "use strict";
    var c, h, u, o, i, s, r;
    e && e.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        var e;
        (((e = i || t("HighBridgeHeadType", (i = {})))[(e.TopLeft = 0)] = "TopLeft"),
          (e[(e.BottomRight = 1)] = "BottomRight"),
          (e[(e.TopRight = 2)] = "TopRight"),
          (e[(e.BottomLeft = 3)] = "BottomLeft"),
          (e[(e.MiddleTlBr = 4)] = "MiddleTlBr"),
          (e[(e.MiddleTrBl = 5)] = "MiddleTrBl"),
          (s = new Map([
            [i.TopLeft, ["BridgeTopLeft1", "BridgeTopLeft2"]],
            [i.BottomRight, ["BridgeBottomRight1", "BridgeBottomRight2"]],
            [i.TopRight, ["BridgeTopRight1", "BridgeTopRight2"]],
            [i.BottomLeft, ["BridgeBottomLeft1", "BridgeBottomLeft2"]],
            [i.MiddleTlBr, ["BridgeMiddle1"]],
            [i.MiddleTrBl, ["BridgeMiddle2"]],
          ])),
          t(
            "TileSets",
            (r = class {
              constructor(e) {
                ((this.theaterIni = e),
                  (this.tileSets = []),
                  (this.orderedEntries = []),
                  (this.highBridgeSetNums = [this.getGeneralValue("BridgeSet"), this.getGeneralValue("WoodBridgeSet")]),
                  (this.cliffSetNums = [
                    this.getGeneralValue("CliffSet"),
                    this.getGeneralValue("WaterCliffs"),
                    this.getGeneralValue("DestroyableCliffs"),
                  ]));
              }
              getTile(e) {
                return this.orderedEntries[e];
              }
              getTileImage(e, t, i) {
                let r = this.getTile(e);
                if (!r) throw new Error(`TileNum ${e} not found`);
                var s = r.getTmpFile(t, i);
                if (!s || t >= s.images.length) throw new Error(`SubTile ${t} not found`);
                return s.images[t];
              }
              getSetNum(e) {
                var t = this.orderedEntries[e];
                if (!t) throw new Error("Invalid tileNum " + e);
                return this.tileSets.indexOf(t.owner);
              }
              getTileNumFromSet(i, r = 0) {
                let s = 0;
                return (this.tileSets.some((e, t) => (t === i ? ((s += r), !0) : ((s += e.entries.length), !1))), s);
              }
              getGeneralValue(e) {
                let t = this.theaterIni.getSection("General");
                if (!t) throw new Error("Missing [General] section in theather ini");
                return t.getNumber(e);
              }
              loadTileData(e, t) {
                ((this.tileSets.length = 0),
                  (this.orderedEntries.length = 0),
                  this.initTileSets(e, t),
                  this.initAnimations());
              }
              readMaxTileNum() {
                let t = 0,
                  i = 0;
                for (;;) {
                  var r = "TileSet" + c.pad(t, "0000");
                  let e = this.theaterIni.getSection(r);
                  if (!e) break;
                  (t++, (i += e.getNumber("TilesInSet")));
                }
                return i;
              }
              initTileSets(a, n) {
                let e = 0,
                  t;
                for (var i; ;) {
                  if (((i = "TileSet" + c.pad(e, "0000")), (t = this.theaterIni.getSection(i)), !t)) break;
                  e++;
                  let r = new u.TileSet(t.getString("FileName"), t.getString("SetName"), t.getNumber("TilesInSet"));
                  this.tileSets.push(r);
                  for (let s = 1; s <= r.tilesInSet; s++) {
                    let t = new h.TileSetEntry(r, s - 1);
                    var o = "a".charCodeAt(0);
                    for (let i = o - 1; i <= "z".charCodeAt(0); i++)
                      if (!(i >= o && "Bridges" === r.setName)) {
                        let e = r.fileName + c.pad(s, "00");
                        (i >= o && (e += String.fromCharCode(i)), (e += n));
                        var l = a.get(e);
                        if (!l) break;
                        t.addFile(l);
                      }
                    (r.entries.push(t), this.orderedEntries.push(t));
                  }
                }
              }
              initAnimations() {
                var e = this.theaterIni.getOrderedSections();
                for (let n = this.tileSets.length; n < e.length; ++n) {
                  let t = e[n],
                    i = this.tileSets.find((e) => e.setName === t.name);
                  if (i)
                    for (let e = 1; e <= i.tilesInSet; ++e) {
                      var r = "Tile" + c.pad(e, "00"),
                        s = r + "Anim",
                        a = t.getString(s);
                      a
                        ? ((r = new o.TileSetAnim(
                            a,
                            t.getNumber(r + "AttachesTo"),
                            t.getNumber(r + "XOffset"),
                            t.getNumber(r + "YOffset"),
                          )),
                          i.entries[e - 1].setAnimation(r))
                        : console.warn(`Missing anim "${s}" for tileset ` + i.setName);
                    }
                }
              }
              isLAT(e) {
                return (
                  e === this.getGeneralValue("RoughTile") ||
                  e === this.getGeneralValue("SandTile") ||
                  e === this.getGeneralValue("GreenTile") ||
                  e === this.getGeneralValue("PaveTile")
                );
              }
              isCLAT(e) {
                return (
                  e === this.getGeneralValue("ClearToRoughLat") ||
                  e === this.getGeneralValue("ClearToSandLat") ||
                  e === this.getGeneralValue("ClearToGreenLat") ||
                  e === this.getGeneralValue("ClearToPaveLat")
                );
              }
              getLAT(e) {
                return e === this.getGeneralValue("ClearToRoughLat")
                  ? this.getGeneralValue("RoughTile")
                  : e === this.getGeneralValue("ClearToSandLat")
                    ? this.getGeneralValue("SandTile")
                    : e === this.getGeneralValue("ClearToGreenLat")
                      ? this.getGeneralValue("GreenTile")
                      : e === this.getGeneralValue("ClearToPaveLat")
                        ? this.getGeneralValue("PaveTile")
                        : -1;
              }
              getCLATSet(e) {
                return e === this.getGeneralValue("RoughTile")
                  ? this.getGeneralValue("ClearToRoughLat")
                  : e === this.getGeneralValue("SandTile")
                    ? this.getGeneralValue("ClearToSandLat")
                    : e === this.getGeneralValue("GreenTile")
                      ? this.getGeneralValue("ClearToGreenLat")
                      : e === this.getGeneralValue("PaveTile")
                        ? this.getGeneralValue("ClearToPaveLat")
                        : -1;
              }
              canConnectTiles(e, t) {
                if (e === t) return !1;
                var i = this.getGeneralValue("GreenTile"),
                  r = this.getGeneralValue("PaveTile"),
                  s = this.getGeneralValue("MiscPaveTile"),
                  a = this.getGeneralValue("ShorePieces"),
                  n = this.getGeneralValue("WaterBridge"),
                  o = this.getGeneralValue("PavedRoads"),
                  l = this.getGeneralValue("Medians");
                return (
                  !((e === i && t === a) || (t === i && e === a)) &&
                  !((e === i && t === n) || (t === i && e === n)) &&
                  !((e === r && t === o) || (t === r && e === o)) &&
                  !((e === r && t === s) || (t === r && e === s)) &&
                  !((e === r && t === l) || (t === r && e === l))
                );
              }
              getHighBridgeHeadType(e) {
                for (var [t, i] of s) for (var r of i) if (this.getGeneralValue(r) === e + 1) return t;
              }
              getOppositeHighBridgeHeadType(e) {
                switch (e) {
                  case i.TopLeft:
                    return i.BottomRight;
                  case i.TopRight:
                    return i.BottomLeft;
                  case i.BottomLeft:
                    return i.TopRight;
                  case i.BottomRight:
                    return i.TopLeft;
                  case i.MiddleTlBr:
                  case i.MiddleTrBl:
                    throw new Error("Middle bridge heads can't have opposites");
                  default:
                    throw new Error("Unhandled headType " + e);
                }
              }
              isCliffTile(e) {
                return this.cliffSetNums.includes(this.getSetNum(e));
              }
              isHighBridgeBoundaryTile(e) {
                if (this.highBridgeSetNums.includes(this.getSetNum(e))) {
                  var t = this.getTile(e),
                    t = this.getHighBridgeHeadType(t.index);
                  return void 0 !== t && ![i.MiddleTlBr, i.MiddleTrBl].includes(t);
                }
                return !1;
              }
              isHighBridgeMiddleTile(e) {
                if (this.highBridgeSetNums.includes(this.getSetNum(e))) {
                  var t = this.getTile(e),
                    t = this.getHighBridgeHeadType(t.index);
                  return void 0 !== t && [i.MiddleTlBr, i.MiddleTrBl].includes(t);
                }
                return !1;
              }
            }),
          ));
      },
    };
  },
);
