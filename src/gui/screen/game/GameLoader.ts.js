// === Reconstructed SystemJS module: gui/screen/game/GameLoader ===
// deps: ["data/DataStream","@puzzl/core/lib/async/cancellation","engine/ResourceLoader","engine/resourceConfigs","engine/Engine","engine/EngineType","engine/TheaterType","util/time","game/SideType","game/Coords","engine/IsoCoords","engine/type/ObjectType","engine/ImageFinder","engine/renderable/builder/ShpBuilder","engine/renderable/entity/PipOverlay","engine/renderable/builder/CanvasSpriteBuilder","game/theater/TileSets","game/GameFactory","engine/renderable/fx/TrailerSmokeFx","engine/renderable/builder/ShpAggregator","engine/renderable/entity/building/BuildingShpHelper","engine/renderable/entity/building/BuildingAnimArtProps","util/math","data/MixFile","util/userAgent","game/gameopts/GameOptRandomGen","engine/renderable/DebugRenderable","game/ini/MixinRules","util/typeGuard"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/GameLoader",
  [
    "data/DataStream",
    "@puzzl/core/lib/async/cancellation",
    "engine/ResourceLoader",
    "engine/resourceConfigs",
    "engine/Engine",
    "engine/EngineType",
    "engine/TheaterType",
    "util/time",
    "game/SideType",
    "game/Coords",
    "engine/IsoCoords",
    "engine/type/ObjectType",
    "engine/ImageFinder",
    "engine/renderable/builder/ShpBuilder",
    "engine/renderable/entity/PipOverlay",
    "engine/renderable/builder/CanvasSpriteBuilder",
    "game/theater/TileSets",
    "game/GameFactory",
    "engine/renderable/fx/TrailerSmokeFx",
    "engine/renderable/builder/ShpAggregator",
    "engine/renderable/entity/building/BuildingShpHelper",
    "engine/renderable/entity/building/BuildingAnimArtProps",
    "util/math",
    "data/MixFile",
    "util/userAgent",
    "game/gameopts/GameOptRandomGen",
    "engine/renderable/DebugRenderable",
    "game/ini/MixinRules",
    "util/typeGuard",
  ],
  function (e, t) {
    "use strict";
    var f, b, y, T, v, s, n, M, S, w, E, R, P, I, i, r, d, g, a, k, B, N, o, C, x, l, c, p, m, h;
    t && t.id;
    return {
      setters: [
        function (e) {
          f = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          P = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        e(
          "GameLoader",
          (h = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p) {
              ((this.appVersion = e),
                (this.workerHostApi = t),
                (this.cdnResourceLoader = i),
                (this.appResourceLoader = r),
                (this.rules = s),
                (this.gameModes = a),
                (this.sound = n),
                (this.iniLogger = o),
                (this.actionLogger = l),
                (this.speedCheat = c),
                (this.gameResConfig = h),
                (this.vxlGeometryPool = u),
                (this.buildingImageDataCache = d),
                (this.debugBotIndex = g),
                (this.devMode = p));
            }
            async load(e, t, i, r, s, a, n, o) {
              var l = this.resolveLoadingPlayerInfos(e, t, i);
              n.start(l, i.mapTitle, s);
              try {
                return (this.workerHostApi.warmUpPool(), await this.doLoad(e, t, i, r, s, a, n, o));
              } finally {
                this.workerHostApi.dispose();
              }
            }
            resolveLoadingPlayerInfos(e, t, i) {
              let r = l.GameOptRandomGen.factory(e, t),
                s = r.generateColors(i),
                a = r.generateCountries(i, this.rules);
              return i.humanPlayers.map((e) => ({
                ...e,
                colorId: s.get(e) ?? e.colorId,
                countryId: a.get(e) ?? e.countryId,
              }));
            }
            async doLoad(e, t, i, r, s, a, n, o) {
              if (!v.Engine.vfs) throw new Error("Virtual File System not initialized");
              (this.clearStaticCaches(), this.buildingImageDataCache.clear());
              try {
                v.Engine.getActiveMod() || (await this.loadFestiveAssets(o));
              } catch (e) {
                if (e instanceof b.OperationCanceledError) throw e;
                console.error("Couldn't load festive assets", e);
              }
              (await this.loadTheater(r.theaterType, o, (e) => n.onLoadProgress((e / 100) * 30)), await M.sleep(1));
              var l = await this.loadBotsLib();
              if (!this.devMode && l.version !== this.appVersion)
                throw new y.DownloadError(
                  "Bot library version mismatch. " + `Expected ${this.appVersion}, but got ` + l.version,
                );
              let { game: c, theater: h } = await this.createGame(e, t, i, r, a, l),
                u = S.SideType.GDI,
                d;
              s && ((d = c.getPlayerByName(s)), d.isObserver || (u = d.country.side));
              let g = this.gameResConfig.isCdn()
                ? await this.cdnResourceLoader.loadResources(
                    [
                      T.ResourceType.Sounds,
                      ...(u === S.SideType.GDI
                        ? [T.ResourceType.EvaAlly, T.ResourceType.UiAlly]
                        : [T.ResourceType.EvaSov, T.ResourceType.UiSov]),
                      T.ResourceType.Cameo,
                    ],
                    o,
                    (e) => n.onLoadProgress(30 + (e / 100) * 15),
                  )
                : void 0;
              (g &&
                v.Engine.vfs.addArchive(
                  new C.MixFile(new f.DataStream(g.pop(T.ResourceType.Cameo))),
                  this.cdnResourceLoader.getResourceFileName(T.ResourceType.Cameo),
                ),
                // OpenYRWeb: cameocd.mix is the upstream product's custom unit-cameo override
                // pack (a CD-specific asset, like ra2cd.mix). We do NOT ship it (AGENTS.md §4.2).
                // The base cameo.mix (from game data / CDN) is already loaded above, so this
                // override is optional. Make its absence non-fatal instead of throwing
                // FileNotFoundError and aborting game load.
                await (async () => {
                  try {
                    await v.Engine.vfs.addMixFile("cameocd.mix");
                  } catch (e) {
                    console.warn('Optional asset "cameocd.mix" not found — skipping (upstream custom cameo override intentionally not shipped).');
                  }
                })());
              var p,
                m = this.collectCameoFileNames(c);
              if ((await this.loadHudSideImages(g, u), n.onLoadProgress(40), await M.sleep(1), g)) {
                for (p of [
                  T.ResourceType.Sounds,
                  u === S.SideType.GDI ? T.ResourceType.EvaAlly : T.ResourceType.EvaSov,
                ])
                  v.Engine.vfs.addArchive(
                    new C.MixFile(new f.DataStream(g.pop(p))),
                    this.cdnResourceLoader.getResourceFileName(p),
                  );
                await v.Engine.vfs.addBagFile("audio.bag");
              }
              (n.onLoadProgress(45), await M.sleep(1));
              l = /iPhone|Android|CrOS|Windows Phone|webOS/i.test(navigator.userAgent) || x.isIpad();
              return (
                l ||
                  (console.time("Load sounds"),
                  await this.prepareSounds(o, (e) => n.onLoadProgress(45 + (e / 100) * 15)),
                  console.timeEnd("Load sounds")),
                n.onLoadProgress(60),
                await M.sleep(1),
                l ||
                  ((l = v.Engine.getImages()),
                  (l = new P.ImageFinder(l, h)),
                  console.time("Load textures"),
                  await this.prepareTextures(c.rules, c.art, r, l, o, (e) => n.onLoadProgress(60 + (e / 100) * 10)),
                  console.timeEnd("Load textures")),
                n.onLoadProgress(70),
                await M.sleep(1),
                console.time("Load voxels"),
                await this.prepareVxlGeometries(c.rules, c.art, c.map, v.Engine.getVoxels(), o, (e) =>
                  n.onLoadProgress(70 + (e / 100) * 20),
                ),
                console.timeEnd("Load voxels"),
                await M.sleep(1),
                o?.throwIfCancelled(),
                E.IsoCoords.init({ x: 0, y: (c.map.mapBounds.getFullSize().width * w.Coords.getWorldTileSize()) / 2 }),
                c.init(d),
                o?.throwIfCancelled(),
                n.onLoadProgress(95),
                await M.sleep(1),
                { game: c, theater: h, hudSide: u, cameoFilenames: m }
              );
            }
            collectCameoFileNames(e) {
              let t = [],
                i = [
                  ...e.rules.buildingRules.values(),
                  ...e.rules.infantryRules.values(),
                  ...e.rules.vehicleRules.values(),
                  ...e.rules.aircraftRules.values(),
                ];
              for (var r of i.values())
                e.art.hasObject(r.name, r.type) &&
                  ((r = e.art.getObject(r.name, r.type)), t.push(r.cameo + ".shp"), t.push(r.altCameo + ".shp"));
              for (var s of e.rules.superWeaponRules.values()) s.sidebarImage.length && t.push(s.sidebarImage + ".shp");
              return ((t = t.filter((e) => v.Engine.getImages().has(e))), [...new Set(t)]);
            }
            async prepareSounds(s, a) {
              let e = new Set();
              for (var t of this.sound.soundSpecs.getAll())
                for (var i of t.sounds) {
                  const r = this.sound.getWavFile(i);
                  r && r.isRawImaAdpcm() && e.add(r);
                }
              let n = 0,
                o = e.size;
              if (o) {
                let r = [...e].sort((e, t) => e.getRawData().length - t.getRawData().length);
                var l = this.workerHostApi.concurrency;
                try {
                  for (let e = 0; e < l; e++)
                    (this.workerHostApi.queueTask(async (t) => {
                      for (; r.length && !s?.isCancelled();) {
                        let e = r.pop();
                        var i = e.getRawData(),
                          i = await t.decodeWav(i);
                        (e.setData(i), n++);
                        i = (n / o) * 100;
                        Math.floor(i) % 10 == 0 && a((n / o) * 100);
                      }
                    }),
                      await Promise.resolve());
                  (await this.workerHostApi.waitForTasks(), s?.throwIfCancelled());
                } catch (e) {
                  if (e instanceof b.OperationCanceledError) throw e;
                  console.error(e);
                }
              }
            }
            async loadTheater(t, i, r) {
              if (this.gameResConfig.isCdn()) {
                var s = T.theaterSpecificResources.get(t);
                if (!s) throw new Error("Unhandled theater type " + n.TheaterType[t]);
                var a,
                  s = [T.ResourceType.BuildGen, T.ResourceType.Anims, T.ResourceType.Vxl, ...s];
                let e = await this.cdnResourceLoader.loadResources(s, i, (e) => r((e / 100) * 60));
                for (a of s)
                  v.Engine.vfs.addArchive(
                    new C.MixFile(new f.DataStream(e.pop(a))),
                    this.cdnResourceLoader.getResourceFileName(a),
                  );
              } else r(100);
            }
            async createGame(e, t, i, r, s, a) {
              var n = v.Engine.getIni(this.gameModes.getById(i.gameMode).rulesOverride),
                o = p.MixinRules.getTypes(i)
                  .map((e) => v.Engine.mixinRulesFileNames.get(e))
                  .filter(m.isNotNullOrUndefined)
                  .map((e) => v.Engine.getIni(e)),
                l = await v.Engine.loadTheater(r.theaterType),
                c = v.Engine.getActiveEngine(),
                h = v.Engine.getTheaterSettings(c, r.theaterType),
                c = v.Engine.getTheaterIni(c, r.theaterType);
              let u = new d.TileSets(c);
              return (
                u.loadTileData(v.Engine.getTileData(), h.extension),
                {
                  game: g.GameFactory.create(
                    r,
                    u,
                    v.Engine.getRules(),
                    v.Engine.getArt(),
                    v.Engine.getAi(),
                    n,
                    o,
                    e,
                    t,
                    i,
                    this.gameModes,
                    s,
                    a,
                    this.iniLogger,
                    this.speedCheat,
                    this.debugBotIndex,
                    this.actionLogger,
                  ),
                  theater: l,
                }
              );
            }
            async loadBotsLib() {
              // OpenYRWeb: AI ships in the main bundle now (game/bot/BotsLib exports
              // IraqBot). No external sp-bots bundle dependency.
              let e;
              try {
                e = await SystemJS.import("game/bot/BotsLib");
              } catch (e) {
                throw new y.DownloadError("Failed to load bot lib", { cause: e });
              }
              return e;
            }
            async loadHudSideImages(e, t) {
              if (!v.Engine.vfs) throw new Error("VFS is not initialized");
              if (
                (v.Engine.vfs.removeArchive("sidec01.mix"),
                v.Engine.vfs.removeArchive("sidec02.mix"),
                v.Engine.vfs.removeArchive("sidec02md.mix"),
                v.Engine.vfs.removeArchive("sidec01cd.mix"),
                v.Engine.vfs.removeArchive("sidec02cd.mix"),
                v.Engine.unloadSideMixData(),
                e)
              ) {
                var i = t === S.SideType.GDI ? T.ResourceType.UiAlly : T.ResourceType.UiSov,
                  r = this.cdnResourceLoader.getResourceFileName(i);
                if (!["sidec01.mix", "sidec02.mix"].includes(r)) throw new Error(`Side mix file name "${r}" mismatch`);
                v.Engine.vfs.addArchive(new C.MixFile(new f.DataStream(e.pop(i))), r);
              } else
                (await v.Engine.vfs.addMixFile(t === S.SideType.GDI ? "sidec01.mix" : "sidec02.mix"),
                  v.Engine.getActiveEngine() === s.EngineType.YurisRevenge &&
                    t === S.SideType.ThirdSide &&
                    (await v.Engine.vfs.addMixFile("sidec02md.mix")));
              // OpenYRWeb: sidec01cd.mix / sidec02cd.mix are the upstream product's custom
              // side-UI override packs (CD-specific, like cameocd.mix). Not shipped (AGENTS.md
              // §4.2); the base sidec0X.mix above already provides the UI. Optional load.
              await (async () => {
                try {
                  await v.Engine.vfs.addMixFile(t === S.SideType.GDI ? "sidec01cd.mix" : "sidec02cd.mix");
                } catch (e) {
                  console.warn('Optional side-cd mix not found — skipping (upstream custom side-UI override intentionally not shipped).');
                }
              })();
            }
            async loadFestiveAssets(t) {
              let e = new Date();
              var i = e.getMonth() + 1,
                r = e.getDate();
              let s;
              if (
                ((10 === i && o.isBetween(r, 24, 31)) || (11 === i && o.isBetween(r, 1, 6))
                  ? (s = T.ResourceType.HalloweenMix)
                  : 12 === i && o.isBetween(r, 16, 31) && (s = T.ResourceType.XmasMix),
                void 0 !== s)
              ) {
                i = this.appResourceLoader.getResourceFileName(s);
                if (!v.Engine.vfs.hasArchive(i)) {
                  let e = await this.appResourceLoader.loadResources([s], t);
                  ((r = e.pop(s)), (r = new C.MixFile(new f.DataStream(r))));
                  v.Engine.vfs.addArchive(r, i);
                }
              }
            }
            async prepareTextures(e, i, t, r, s, a) {
              let n = new B.BuildingShpHelper(r),
                o = new k.ShpAggregator(),
                l = new Set(),
                c = performance.now(),
                h = new Set();
              for (var u of t.structures) h.add(u.name);
              let d = [];
              for (var [g, p] of e.buildingRules) (!h.has(g) && -1 === p.techLevel) || d.push(g);
              let m = 0;
              var f,
                y,
                T = d.length + e.animationNames.size;
              for (f of d) {
                s?.throwIfCancelled();
                var v = performance.now();
                if (
                  (1e3 < v - c && ((c = v), a((m / T) * 100), await M.sleep(0)),
                  m++,
                  !this.buildingImageDataCache.has(f) && i.hasObject(f, R.ObjectType.Building))
                ) {
                  v = i.getObject(f, R.ObjectType.Building);
                  if (!v.demandLoad) {
                    let t = new N.BuildingAnimArtProps();
                    t.read(v.art, i);
                    for (var b of t.getAll().values()) for (var S of b) l.add(S.name);
                    try {
                      var w = r.findByObjectArt(v),
                        E = v.bibShape ? r.find(v.bibShape, v.useTheaterExtension) : void 0,
                        C = n.collectAnimShpFiles(t, v);
                      let e = n.getShpFrameInfos(v, w, E, C, t);
                      var x = o.aggregate(e.values(), `agg_${f}.shp`);
                      (this.buildingImageDataCache.set(f, x), I.ShpBuilder.prepareTexture(x.file));
                    } catch (e) {
                      if (e instanceof P.ImageFinder.MissingImageError) continue;
                      throw e;
                    }
                  }
                }
              }
              for (y of e.animationNames) {
                s?.throwIfCancelled();
                var O = performance.now();
                if (
                  (1e3 < O - c && ((c = O), a((m / T) * 100), await M.sleep(0)),
                  m++,
                  !l.has(y) && i.hasObject(y, R.ObjectType.Animation))
                ) {
                  O = i.getAnimation(y);
                  try {
                    var A = r.findByObjectArt(O);
                    I.ShpBuilder.prepareTexture(A);
                  } catch (e) {
                    if (e instanceof P.ImageFinder.MissingImageError) continue;
                    throw e;
                  }
                }
              }
            }
            async prepareVxlGeometries(i, t, e, r, n, o) {
              let s = new Set(
                [...i.vehicleRules.values(), ...i.aircraftRules.values(), ...i.buildingRules.values()].filter(
                  (e) => (-1 !== e.techLevel || e.spawned) && t.hasObject(e.name, e.type),
                ),
              );
              for (var a of i.buildingRules.values()) {
                if (a.freeUnit) {
                  let e;
                  (i.hasObject(a.freeUnit, R.ObjectType.Vehicle) && (e = i.getObject(a.freeUnit, R.ObjectType.Vehicle)),
                    e && s.add(e));
                }
                a.undeploysInto &&
                  i.hasObject(a.undeploysInto, R.ObjectType.Vehicle) &&
                  s.add(i.getObject(a.undeploysInto, R.ObjectType.Vehicle));
              }
              for (var l of e.getInitialMapObjects().technos)
                (l.isVehicle() || l.isAircraft()) && i.hasObject(l.name, l.type) && s.add(i.getObject(l.name, l.type));
              let c = new Map();
              for (var h of s) {
                let e = t.getObject(h.name, h.type);
                if (e.isVoxel || (h.type === R.ObjectType.Building && h.turretAnimIsVoxel)) {
                  var u,
                    d = e.imageName.toLowerCase();
                  let t = [];
                  if (h.type !== R.ObjectType.Building) {
                    if (
                      (t.push(d + ".vxl"),
                      h.spawns && h.noSpawnAlt && t.push(d + "wo.vxl"),
                      h.harvester &&
                        h.unloadingClass &&
                        i.hasObject(h.unloadingClass, R.ObjectType.Vehicle) &&
                        t.push(i.getObject(h.unloadingClass, R.ObjectType.Vehicle).imageName.toLowerCase() + ".vxl"),
                      h.turret)
                    ) {
                      for (let e = 0; e < h.turretCount; ++e) t.push(d + `tur${e || ""}.vxl`);
                      var g = d + "barl.vxl";
                      r.has(g) && t.push(g);
                    }
                  } else if (h.turretAnimIsVoxel) {
                    let e = h.turretAnim.toLowerCase() + ".vxl";
                    t.push(e);
                    g = e.replace("tur", "barl");
                    r.has(g) && t.push(g);
                  }
                  for (u of t) {
                    var p = r.get(u);
                    p && c.set(u, p);
                  }
                }
              }
              let m = 0,
                f = [];
              for (var [y, T] of c)
                (n?.throwIfCancelled(),
                  (await this.vxlGeometryPool.loadFromStorage(T, y)) ? (m++, o((m / c.size) * 100)) : f.push([y, T]));
              if (f.length) {
                f.sort((e, t) => t[1].voxelCount - e[1].voxelCount);
                var v = this.workerHostApi.concurrency;
                let s = this.vxlGeometryPool.getModelQuality(),
                  a = [() => this.vxlGeometryPool.clearOtherModStorage()];
                try {
                  for (let e = 0; e < v; e++)
                    this.workerHostApi.queueTask(async (r) => {
                      for (; f.length && !n?.isCancelled();) {
                        let [e, t] = f.pop(),
                          i = await r.generateVxlGeometry(t, s);
                        (a.push(() => this.vxlGeometryPool.persistToStorage(t, e, i)), m++, o((m / c.size) * 100));
                      }
                    });
                  (await this.workerHostApi.waitForTasks(), n?.throwIfCancelled());
                } catch (e) {
                  if (e instanceof b.OperationCanceledError) throw e;
                  (console.error(e), console.warn("Failed to pre-load VXL geometries. Skipping."));
                }
                await Promise.all(a.map((e) => e())).catch((e) =>
                  console.warn("Failed to persist VXL geometry cache", [e]),
                );
              }
            }
            clearStaticCaches() {
              (i.PipOverlay.clearCaches(),
                I.ShpBuilder.clearCaches(),
                c.DebugRenderable.clearCaches(),
                r.CanvasSpriteBuilder.clearCaches(),
                a.TrailerSmokeFx.clearTextureCache());
            }
          }),
        );
      },
    };
  },
);
