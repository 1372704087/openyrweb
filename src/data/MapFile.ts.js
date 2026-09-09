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
              ((this.scenarioScripts = new Map()),
                (this.scenarioTaskForces = new Map()),
                (this.scenarioTeams = new Map()),
                (this.scenarioAiTriggers = new Map())),
              this.readTiles(),
              this.readWaypoints(this.getOrCreateSection("Waypoints")),
              this.readZones(this.getOrCreateSection("Zone")),
              this.readStructures(this.getOrCreateSection("Structures")),
              this.readVehicles(),
              this.readInfantries(),
              this.readAircrafts(),
              this.readTerrains(this.getOrCreateSection("Terrain")),
              this.readOverlays(),
              this.readSmudges(),
              this.readLighting(),
              this.readTagsAndTriggers(),
              this.readScenarioTeams(),
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
                unimplementedEventTypes: s,
                unimplementedActionTypes: a,
              } = new o.TriggerReader().read(e, t, i, this.tags);
            ((this.triggers = e),
              (this.unknownEventTypes = t),
              (this.unknownActionTypes = i),
              (this.unimplementedEventTypes = s ?? new Set()),
              (this.unimplementedActionTypes = a ?? new Set()));
          }
          readScenarioTeams() {
            // 参考临时源码 readScenarioTeams：把地图内嵌的 ScriptTypes/TaskForces/TeamTypes/
            // AITriggerTypes 解析成场景运行时可直接使用的结构。
            this.scenarioScripts.clear();
            this.scenarioTaskForces.clear();
            this.scenarioTeams.clear();
            this.scenarioAiTriggers.clear();
            for (var [s, r] of this.readListedSectionIds("ScriptTypes").entries()) {
              var sc = this.getSection(r);
              if (!sc) continue;
              var actions = [];
              for (var o of this.readNumericEntries(sc)) {
                var [l, c] = o.split(",").map(Number);
                if (!Number.isFinite(l)) continue;
                actions.push({ type: l, parameter: Number.isFinite(c) ? c : 0 });
              }
              this.scenarioScripts.set(r, { id: r, index: s, actions: actions });
            }
            for (var [s, r] of this.readListedSectionIds("TaskForces").entries()) {
              var tf = this.getSection(r);
              if (!tf) continue;
              var entries = [];
              for (var o of this.readNumericEntries(tf)) {
                var [l, c] = o.split(",");
                var cnt = Number(l);
                if (Number.isFinite(cnt) && c) entries.push({ count: cnt, objectName: String(c).trim() });
              }
              this.scenarioTaskForces.set(r, { id: r, index: s, entries: entries });
            }
            for (var [s, r] of this.readListedSectionIds("TeamTypes").entries()) {
              var tm = this.getSection(r);
              if (!tm) continue;
              var wp = tm.getString("Waypoint", "").trim(),
                twp = tm.getString("TransportWaypoint", "").trim();
              this.scenarioTeams.set(r, {
                id: r,
                index: s,
                houseName: tm.getString("House", "").trim(),
                scriptId: tm.getString("Script", "").trim(),
                taskForceId: tm.getString("TaskForce", "").trim(),
                tagId: this.readTagId(tm.getString("Tag", "None")),
                waypoint: wp ? this.readAlphabeticIndex(wp) : void 0,
                transportWaypoint: twp ? this.readAlphabeticIndex(twp) : void 0,
                veteranLevel: Math.max(0, tm.getNumber("VeteranLevel", 0) - 1),
                aggressive: tm.getBool("Aggressive", !1),
                annoyance: tm.getBool("Annoyance", !1),
                autocreate: tm.getBool("Autocreate", !1),
                droppod: tm.getBool("Droppod", !1),
                full: tm.getBool("Full", !1),
                group: tm.getNumber("Group", -1),
                guardSlower: tm.getBool("GuardSlower", !1),
                loadable: tm.getBool("Loadable", !1),
                looseRecruit: tm.getBool("LooseRecruit", !1),
                max: tm.getNumber("Max", 0),
                onTransOnly: tm.getBool("OnTransOnly", !1),
                prebuild: tm.getBool("Prebuild", !1),
                priority: tm.getNumber("Priority", 5),
                recruiter: tm.getBool("Recruiter", !1),
                reinforce: tm.getBool("Reinforce", !1),
                suicide: tm.getBool("Suicide", !1),
                techLevel: tm.getNumber("TechLevel", -1),
                transportsReturnOnUnload: tm.getBool("TransportsReturnOnUnload", !1),
                useTransportOrigin: tm.getBool("UseTransportOrigin", !1),
                areTeamMembersRecruitable: tm.getBool("AreTeamMembersRecruitable", !0),
                onlyTargetHouseEnemy: tm.getBool("OnlyTargetHouseEnemy", !1),
              });
            }
            var at = this.getSection("AITriggerTypes"),
              en = this.getSection("AITriggerTypesEnable");
            for (var [s, r] of at?.entries ?? []) {
              if (typeof r !== "string") continue;
              var e = en?.entries.get(s),
                enabled = typeof e === "string" && /^(?:yes|true|1)$/i.test(e);
              this.scenarioAiTriggers.set(s, { id: s, raw: r, enabled: enabled });
            }
          }
          readListedSectionIds(e) {
            var t = this.getSection(e);
            return t ? this.readNumericEntries(t) : [];
          }
          readNumericEntries(e) {
            return [...e.entries]
              .filter(([t, s]) => Number.isFinite(Number(t)) && typeof s === "string")
              .sort(([t], [s]) => Number(t) - Number(s))
              .map(([, t]) => t);
          }
          readAlphabeticIndex(e) {
            return e.toUpperCase().split("").reduce((t, s) => t * 26 + s.charCodeAt(0) - 65 + 1, 0) - 1;
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
          readZones(e) {
            // [Zone] 节：触发器区域，每项格式 "N=X1,Y1,X2,Y2"（单元格坐标）。
            // 引擎按矩形 (minX,minY)-(maxX,maxY) 归一化，供 EnemyInZone 等事件判定。
            this.zones = [];
            for (var [t, i] of e.entries) {
              let r = i.split(",");
              if (r.length < 4) {
                console.warn(`Map [Zone] contains invalid entry "${t}=${i}". Skipping.`);
                continue;
              }
              var n = [Number(r[0]), Number(r[1]), Number(r[2]), Number(r[3])];
              if (n.some((e) => Number.isNaN(e))) {
                console.warn(`Map [Zone] contains invalid entry "${t}=${i}". Skipping.`);
                continue;
              }
              let s = Number(t);
              this.zones.push({
                index: Number.isNaN(s) ? this.zones.length : s,
                minX: Math.min(n[0], n[2]),
                minY: Math.min(n[1], n[3]),
                maxX: Math.max(n[0], n[2]),
                maxY: Math.max(n[1], n[3]),
              });
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
                    (e.mission = i[6] || ""),
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
                    (e.mission = i[6] || ""),
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
                  (e.mission = t[6] || ""),
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
          getHouses() {
            // RA2/YR 单人任务地图 [Houses] 阵营表。国家/颜色/结盟等属性来自每个阵营的
            // 独立 section（[Player House] 内的 Country=/Color=/IQ=/Credits=/TechLevel=/Allies=），
            // [Houses] 行本身通常是纯阵营名（0=Player House）。
            let t = [];
            let sec = this.getSection("Houses");
            if (!sec) {
              console.warn("[OpenYRWeb] Map has no [Houses] section.");
              return t;
            }
            // [Basic] Player= 标识人类阵营（无匹配时取第一个阵营）
            let humanName = (this.getSection("Basic")?.getString("Player", "") ?? "").trim().toLowerCase();
            // [Countries] 段: CountryName=HouseName → house -> country（部分地图用此格式）
            let houseCountry = new Map();
            let csec = this.getSection("Countries");
            if (csec) {
              console.info(
                "[OpenYRWeb] [Countries] section:",
                [...csec.entries].map(([c, h]) => `${c}=${h}`).join(", ") || "(empty)",
              );
              for (var [c, h] of csec.entries) {
                let hn = h.trim();
                if (hn && !houseCountry.has(hn.toLowerCase())) houseCountry.set(hn.toLowerCase(), c.trim());
              }
            } else console.warn("[OpenYRWeb] Map has no [Countries] section.");
            // 大小写不敏感取 section
            let findSection = (name) => {
              let s = this.getSection(name);
              if (s) return s;
              let lower = name.toLowerCase();
              return this.getOrderedSections().find((e) => e.name.toLowerCase() === lower);
            };
            console.info(
              "[OpenYRWeb] Raw [Houses]:",
              [...sec.entries].map(([k, v]) => `${k}=${v}`).join(", ") || "(empty)",
            );
            let idx = 0;
            let humanAssigned = !1;
            for (var [i, r] of sec.entries) {
              if (!/^\d+$/.test(i)) continue;
              var s = r.split(",");
              var name = (s[0] || "").trim();
              if (!name) continue;
              let psec = findSection(name);
              let country = psec ? psec.getString("Country", "").trim() : "";
              let baseName = name.replace(/\s+House$/i, "").trim().toLowerCase();
              if (!country) {
                // [Countries] 是显式映射（Country=House），优先使用；
                // [Houses] 第二列常见是阵营别名（如 Player/BadGuy1），不是国家代码，不能直接当 Country 用。
                let second = (s[1] || "").trim();
                country =
                  houseCountry.get(name.toLowerCase()) ||
                  (second && second.toLowerCase() !== baseName ? second : "") ||
                  "";
              }
              let countryLower = country.toLowerCase();
              let color = psec ? psec.getString("Color", "LightGrey").trim() : "";
              let iq = psec ? psec.getNumber("IQ", 0) : 0;
              let edge = psec ? psec.getString("Edge", "").trim() : "";
              let credits = psec ? psec.getNumber("Credits", 0) : 0;
              let techLevel = psec ? psec.getNumber("TechLevel", 0) : 0;
              let playerControl = psec ? psec.getBool("PlayerControl", !1) : !1;
              let allies = psec ? psec.getArray("Allies", /,\s*/, []) : [];
              let base = name.replace(/\s+House$/i, "").toLowerCase();
              let isHuman =
                !humanAssigned &&
                (0 === idx || (humanName && (humanName === name.toLowerCase() || humanName === base)));
              if (isHuman) humanAssigned = !0;
              let control;
              if (s[7]) control = (s[7] || "").trim().toLowerCase();
              else if (isHuman) control = "human";
              else if (/civie|civilian|dummy|neutral/i.test(name) || "civilian" === countryLower || "neutral" === countryLower)
                control = "civilian";
              else control = "computer";
              t.push({
                name,
                country,
                color,
                iq,
                edge,
                credits,
                techLevel,
                playerControl,
                allies,
                control,
              });
              idx++;
            }
            console.info(
              `[OpenYRWeb] Parsed [Houses]:`,
              t
                .map((h) => `${h.name}(country=${h.country},color=${h.color},control=${h.control},allies=${h.allies.join("|")})`)
                .join(", ") || "(none)",
            );
            return t;
          }
          getAiIni() {
            // 提取地图定义的 AI 数据（TaskForces/ScriptTypes/TeamTypes/AITriggerTypes 等），
            // 供战役敌方 AI 使用。格式与 aimd.ini 一致（AiData 可直接解析）。
            // 地图无 AI 段时返回 undefined（回退到 aimd.ini）。
            let out = new r.IniFile();
            let aiSections = [
              "TaskForces",
              "ScriptTypes",
              "TeamTypes",
              "AITriggerTypes",
              "AIDefenseTypes",
              "BuildQueue",
              "BuildQueueGroup",
            ];
            let added = !1;
            for (let secName of aiSections) {
              let src = this.getSection(secName);
              if (!src) continue;
              let dst = out.getOrCreateSection(secName);
              for (let [k, v] of src.entries) dst.set(k, v);
              // 复制引用的子段（如 [TeamType名]、[TaskForce名]、[Script名] 的定义段）
              for (let v of src.entries.values()) {
                let childName = String(v).trim();
                if (!childName) continue;
                let child = this.getSection(childName);
                if (child) {
                  let cd = out.getOrCreateSection(childName);
                  for (let [k2, v2] of child.entries) cd.set(k2, v2);
                }
              }
              added = !0;
            }
            return added ? out : void 0;
          }
        }),
          e("MapFile", d),
          (d.artSectionPrefix = "ART"));
      },
    };
  },
);
