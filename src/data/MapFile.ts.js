// === Reconstructed SystemJS module: data/MapFile ===
// deps: ["data/mapObjects","data/IniFile","engine/TheaterType","util/string","data/encoding/Format5","data/Bitmap","data/map/tag/TagsReader","data/map/trigger/TriggerReader","data/DataStream","data/map/MapLighting","data/map/tag/CellTagsReader","data/map/Variable","data/map/SpecialFlags"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "data/MapFile",
  [
    "data/mapObjects",
    "data/IniFile",
    "engine/TheaterType",
    "util/string",
    "data/encoding/Format5",
    "data/Bitmap",
    "data/map/tag/TagsReader",
    "data/map/trigger/TriggerReader",
    "data/DataStream",
    "data/map/MapLighting",
    "data/map/tag/CellTagsReader",
    "data/map/Variable",
    "data/map/SpecialFlags",
  ],
  function (e, t) {
    "use strict";
    var c, r, s, b, S, a, n, o, w, i, l, h, u, d;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
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
        function (e) {
          w = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        ((d = class d extends r.IniFile {
          fromString(e) {
            super.fromString(e);
            let t = this.getSection("Map");
            if (!t) throw new Error("[Map] section not found");
            var i = t.getNumberArray("Size");
            if (
              ((this.fullSize = { x: i[0], y: i[1], width: i[2], height: i[3] }),
              (i = t.getNumberArray("LocalSize")),
              (this.localSize = { x: i[0], y: i[1], width: i[2], height: i[3] }),
              (this.theaterType = t.getEnum("Theater", s.TheaterType, s.TheaterType.None, !0)),
              this.theaterType === s.TheaterType.None)
            )
              throw new Error(`Unsupported theater type "${t.getString("Theater")}"`);
            let r = this.getSection("Basic");
            i = this.iniFormat = r?.getNumber("NewINIFormat") ?? 0;
            return (
              this.readTiles(),
              this.readWaypoints(this.getOrCreateSection("Waypoints")),
              this.readStructures(this.getOrCreateSection("Structures")),
              this.readVehicles(),
              this.readInfantries(),
              this.readAircrafts(),
              this.readTerrains(this.getOrCreateSection("Terrain")),
              this.readOverlays(),
              this.readSmudges(),
              this.readLighting(),
              this.readTagsAndTriggers(),
              this.readCellTags(i),
              this.readVariableNames(),
              (this.startingLocations = this.readStartingLocations(this.waypoints)),
              (this.specialFlags = new u.SpecialFlags().read(this.getOrCreateSection("SpecialFlags"))),
              this
            );
          }
          fromJson(i) {
            if (i[d.artSectionPrefix]) {
              let { [d.artSectionPrefix]: e, ...t } = i;
              ((this.artOverrides = new r.IniFile(e)), (i = t));
            }
            return super.fromJson(i);
          }
          readStartingLocations(e) {
            let t = [];
            var i;
            for (i of e.filter((e) => e.number < 8).sort((e, t) => (e.number < t.number ? -1 : 1)))
              t.push({ x: i.rx, y: i.ry });
            return t;
          }
          readLighting() {
            var e = this.getOrCreateSection("Lighting");
            ((this.lighting = new i.MapLighting().read(e)),
              (this.ionLighting = new i.MapLighting().read(e, "Ion")),
              (this.ionLighting.forceTint = !0));
          }
          readTagsAndTriggers() {
            this.tags = new n.TagsReader().read(this.getOrCreateSection("Tags"));
            var e = this.getOrCreateSection("Triggers"),
              t = this.getOrCreateSection("Events"),
              i = this.getOrCreateSection("Actions"),
              {
                triggers: e,
                unknownEventTypes: t,
                unknownActionTypes: i,
              } = new o.TriggerReader().read(e, t, i, this.tags);
            ((this.triggers = e), (this.unknownEventTypes = t), (this.unknownActionTypes = i));
          }
          readCellTags(e) {
            this.cellTags = new l.CellTagsReader().read(this.getOrCreateSection("CellTags"), e);
          }
          readVariableNames() {
            var e,
              t,
              i = this.getOrCreateSection("VariableNames");
            let r = new Map();
            for ([e, t] of i.entries) {
              var s,
                a,
                n = Number(e);
              Number.isNaN(n)
                ? console.warn(`Map [VariableNames] contains non-numeric index "${e}". Skipping.`)
                : (([s, a] = t.split(",")), (a = new h.Variable(s, Boolean(Number(a)))), r.set(n, a));
            }
            this.variables = r;
          }
          readTiles() {
            let e = this.getSection("IsoMapPack5");
            if (!e) throw new Error("[IsoMapPack5] section not found");
            var t = b.base64StringToUint8Array(e.getConcatenatedValues()),
              i = (2 * this.fullSize.width - 1) * this.fullSize.height,
              r = new Uint8Array(11 * i + 4);
            S.Format5.decodeInto(t, r);
            let s = new w.DataStream(r.buffer),
              a = 2 * this.fullSize.width - 1;
            var n,
              o,
              l,
              c,
              r = this.fullSize.height,
              h = (e, t) => t * a + e;
            this.tiles = new Array(a * r);
            for (let T = (this.maxTileNum = 0); T < i; T++) {
              var u = s.readUint16(),
                d = s.readUint16(),
                g = Math.max(0, s.readInt16());
              ((this.maxTileNum = Math.max(this.maxTileNum, g)), s.readInt16());
              var p = s.readUint8(),
                m = s.readUint8();
              s.readUint8();
              var f = u - d + this.fullSize.width - 1,
                y = u + d - this.fullSize.width - 1;
              0 <= f &&
                f < 2 * this.fullSize.width &&
                0 <= y &&
                y < 2 * this.fullSize.height &&
                ((p = { dx: f, dy: y, rx: u, ry: d, z: m, tileNum: g, subTile: p }),
                (this.tiles[h(f, Math.floor(y / 2))] = p));
            }
            for (let v = 0; v < this.fullSize.height; v++)
              for (let e = 0; e <= 2 * this.fullSize.width - 2; e++)
                this.tiles[h(e, v)] ||
                  ((n = e),
                  (c = (o = 2 * v + (e % 2)) - (l = (n + o) / 2 + 1) + this.fullSize.width + 1),
                  (this.tiles[h(e, v)] = { dx: n, dy: o, rx: l, ry: c, z: 0, tileNum: 0, subTile: 0 }));
          }
          readWaypoints(e) {
            this.waypoints = [];
            for (var [t, i] of e.entries) {
              var r;
              let e;
              isNaN((r = parseInt(t, 10))) ||
                isNaN((e = parseInt(i, 10))) ||
                ((t = Math.floor(e / 1e3)), (i = e - 1e3 * t), this.waypoints.push({ number: r, rx: i, ry: t }));
            }
          }
          readStructures(e) {
            this.structures = [];
            for (var [, t] of e.entries) {
              t = t.split(",");
              if (!(t.length <= 15)) {
                let e = new c.Structure();
                ((e.owner = t[0]),
                  (e.name = t[1]),
                  (e.health = Number(t[2])),
                  (e.rx = Number(t[3])),
                  (e.ry = Number(t[4])),
                  (e.tag = this.readTagId(t[6])),
                  (e.poweredOn = Boolean(Number(t[9]))),
                  this.structures.push(e));
              }
            }
          }
          readTagId(e) {
            return "none" !== e.toLowerCase() ? e : void 0;
          }
          readVehicles() {
            this.vehicles = [];
            let e = this.getSection("Units");
            if (e)
              for (var t of e.entries.values()) {
                var i = t.split(",");
                if (i.length <= 11) console.warn(`Invalid Vehicle entry: "${t}"`);
                else {
                  let e = new c.Vehicle();
                  ((e.owner = i[0]),
                    (e.name = i[1]),
                    (e.health = Number(i[2])),
                    (e.rx = Number(i[3])),
                    (e.ry = Number(i[4])),
                    (e.direction = Number(i[5])),
                    (e.tag = this.readTagId(i[7])),
                    (e.veterancy = Number(i[8])),
                    (e.onBridge = "1" === i[10]),
                    this.vehicles.push(e));
                }
              }
          }
          readInfantries() {
            this.infantries = [];
            let e = this.getSection("Infantry");
            if (e)
              for (var t of e.entries.values()) {
                var i = t.split(",");
                let e = new c.Infantry();
                i.length <= 8
                  ? console.warn(`Invalid Infantry entry: "${t}"`)
                  : ((e.owner = i[0]),
                    (e.name = i[1]),
                    (e.health = Number(i[2])),
                    (e.rx = Number(i[3])),
                    (e.ry = Number(i[4])),
                    (e.subCell = Number(i[5])),
                    (e.direction = Number(i[7])),
                    (e.tag = this.readTagId(i[8])),
                    (e.veterancy = Number(i[9])),
                    (e.onBridge = "1" === i[11]),
                    this.infantries.push(e));
              }
          }
          readAircrafts() {
            this.aircrafts = [];
            let e = this.getSection("Aircraft");
            if (e)
              for (var t of e.entries.values()) {
                t = t.split(",");
                let e = new c.Aircraft();
                ((e.owner = t[0]),
                  (e.name = t[1]),
                  (e.health = Number(t[2])),
                  (e.rx = Number(t[3])),
                  (e.ry = Number(t[4])),
                  (e.direction = Number(t[5])),
                  (e.tag = this.readTagId(t[7])),
                  (e.veterancy = Number(t[8])),
                  (e.onBridge = "1" === t[t.length - 4]),
                  this.aircrafts.push(e));
              }
          }
          readTerrains(e) {
            this.terrains = [];
            for (var [t, i] of e.entries) {
              t = Number(t);
              if (!isNaN(t)) {
                let e = new c.Terrain();
                ((e.name = i), (e.rx = t % 1e3), (e.ry = Math.floor(t / 1e3)), this.terrains.push(e));
              }
            }
          }
          readOverlays() {
            ((this.overlays = []), (this.maxOverlayId = 0));
            let t = this.getSection("OverlayPack");
            if (t) {
              var i = b.base64StringToUint8Array(t.getConcatenatedValues()),
                r = new Uint8Array(1 << 18);
              S.Format5.decodeInto(i, r, 80);
              let e = this.getSection("OverlayDataPack");
              if (e) {
                var i = b.base64StringToUint8Array(e.getConcatenatedValues()),
                  s = new Uint8Array(1 << 18);
                S.Format5.decodeInto(i, s, 80);
                for (let t = 0; t < this.fullSize.height; t++)
                  for (let e = 2 * this.fullSize.width - 2; 0 <= e; e--) {
                    var a = e,
                      n = 2 * t + (e % 2),
                      o = (a + n) / 2 + 1,
                      l = n - o + this.fullSize.width + 1,
                      a = o + 512 * l,
                      n = r[a];
                    if (255 !== n) {
                      a = s[a];
                      let e = new c.Overlay();
                      ((e.id = n),
                        (e.value = a),
                        (e.rx = o),
                        (e.ry = l),
                        this.overlays.push(e),
                        (this.maxOverlayId = Math.max(this.maxOverlayId, n)));
                    }
                  }
              } else console.warn("[OverlayDataPack] section not found. Skipping.");
            } else console.warn("[Overlay] section not found. Skipping.");
          }
          readSmudges() {
            this.smudges = [];
            let e = this.getSection("Smudge");
            if (e)
              for (var t of e.entries.values()) {
                var i = t.split(",");
                if (i.length <= 2) console.warn(`Invalid Smudge entry: "${t}"`);
                else {
                  let e = new c.Smudge();
                  ((e.name = i[0]), (e.rx = Number(i[1])), (e.ry = Number(i[2])), this.smudges.push(e));
                }
              }
          }
          decodePreviewImage() {
            let e = this.getSection("Preview"),
              t = this.getSection("PreviewPack");
            if (e && t) {
              var [, , i, r] = e.getArray("Size").map((e) => Number(e)),
                s = b.base64StringToUint8Array(t.getConcatenatedValues()),
                r = new a.RgbBitmap(i, r);
              return (S.Format5.decodeInto(s, r.data), r);
            }
          }
        }),
          e("MapFile", d),
          (d.artSectionPrefix = "ART"));
      },
    };
  },
);
