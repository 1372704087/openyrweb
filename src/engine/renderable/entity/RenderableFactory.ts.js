// === Reconstructed SystemJS module: engine/renderable/entity/RenderableFactory ===
// deps: ["engine/renderable/entity/Building","engine/renderable/entity/Vehicle","engine/renderable/entity/Terrain","engine/renderable/entity/Overlay","engine/renderable/entity/Smudge","engine/renderable/entity/building/AnimationType","engine/renderable/entity/Infantry","engine/renderable/entity/PipOverlay","engine/renderable/entity/Aircraft","engine/renderable/entity/TransientAnim","engine/renderable/entity/Projectile","engine/type/ObjectType","engine/renderable/entity/plugin/HarvesterPlugin","engine/renderable/entity/Anim","engine/renderable/entity/plugin/MoveSoundFxPlugin","engine/renderable/entity/plugin/VehicleDisguisePlugin","engine/renderable/entity/plugin/ChronoSparkleFxPlugin","engine/renderable/entity/plugin/TntFxPlugin","engine/renderable/entity/plugin/MindControlLinkPlugin","engine/renderable/entity/plugin/InfantryDisguisePlugin","engine/renderable/entity/building/PsychicDetectPlugin","engine/renderable/entity/plugin/TrailerSmokePlugin","engine/renderable/entity/plugin/DamageSmokePlugin","game/type/LocomotorType","engine/renderable/entity/plugin/ShipWakeTrailPlugin","engine/renderable/entity/plugin/ObjectCloakPlugin","engine/renderable/entity/Debris","engine/renderable/builder/ShpAggregator","game/type/MovementZone","engine/renderable/entity/plugin/ForcedDisguisePlugin"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/RenderableFactory",
  [
    "engine/renderable/entity/Building",
    "engine/renderable/entity/Vehicle",
    "engine/renderable/entity/Terrain",
    "engine/renderable/entity/Overlay",
    "engine/renderable/entity/Smudge",
    "engine/renderable/entity/building/AnimationType",
    "engine/renderable/entity/Infantry",
    "engine/renderable/entity/PipOverlay",
    "engine/renderable/entity/Aircraft",
    "engine/renderable/entity/TransientAnim",
    "engine/renderable/entity/Projectile",
    "engine/type/ObjectType",
    "engine/renderable/entity/plugin/HarvesterPlugin",
    "engine/renderable/entity/Anim",
    "engine/renderable/entity/plugin/MoveSoundFxPlugin",
    "engine/renderable/entity/plugin/VehicleDisguisePlugin",
    "engine/renderable/entity/plugin/ChronoSparkleFxPlugin",
    "engine/renderable/entity/plugin/TntFxPlugin",
    "engine/renderable/entity/plugin/MindControlLinkPlugin",
    "engine/renderable/entity/plugin/MagnetronBeamPlugin",
    "engine/renderable/entity/plugin/InfantryDisguisePlugin",
    "engine/renderable/entity/building/PsychicDetectPlugin",
    "engine/renderable/entity/plugin/TrailerSmokePlugin",
    "engine/renderable/entity/plugin/DamageSmokePlugin",
    "game/type/LocomotorType",
    "engine/renderable/entity/plugin/ShipWakeTrailPlugin",
    "engine/renderable/entity/plugin/ObjectCloakPlugin",
    "engine/renderable/entity/Debris",
    "engine/renderable/builder/ShpAggregator",
    "game/type/MovementZone",
    "engine/renderable/entity/plugin/ForcedDisguisePlugin",
  ],
  function (e, t) {
    "use strict";
    var l, c, h, u, d, g, p, m, f, r, y, T, v, i, b, S, w, E, C, x, O, A, M, R, P, I, k, B, N, j, s, Mb;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
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
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          r = e;
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
          i = e;
        },
        function (e) {
          b = e;
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
          C = e;
        },
        function (e) {
          Mb = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          M = e;
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
          k = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          j = e;
        },
      ],
      execute: function () {
        e(
          "RenderableFactory",
          (s = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f, y, T, v, b, S, w, E = !1, C = !1, x = !1) {
              ((this.localPlayer = e),
                (this.unitSelection = t),
                (this.alliances = i),
                (this.rules = r),
                (this.art = s),
                (this.mapRenderable = a),
                (this.imageFinder = n),
                (this.palettes = o),
                (this.voxels = l),
                (this.voxelAnims = c),
                (this.theater = h),
                (this.camera = u),
                (this.lighting = d),
                (this.lightingDirector = g),
                (this.debugWireframes = p),
                (this.debugText = m),
                (this.gameSpeed = f),
                (this.worldSound = y),
                (this.strings = T),
                (this.flyerHelperOpt = v),
                (this.hiddenObjectsOpt = b),
                (this.vxlBuilderFactory = S),
                (this.buildingImageDataCache = w),
                (this.useSpriteBatching = E),
                (this.useMeshInstancing = C),
                (this.forcedYuriDisguise = x),
                (this.bridgeImageCache = new Map()));
            }
            createTransientAnim(e, t) {
              var i = this.art.getObject(e, T.ObjectType.Animation);
              return new r.TransientAnim(
                e,
                i,
                { x: 0, y: 0 },
                this.imageFinder,
                this.theater,
                this.camera,
                this.debugWireframes,
                this.gameSpeed,
                this.useSpriteBatching,
                t,
                this.worldSound,
              );
            }
            createAnim(e) {
              var t = this.art.getObject(e, T.ObjectType.Animation);
              return new i.Anim(
                e,
                t,
                { x: 0, y: 0 },
                this.imageFinder,
                this.theater,
                this.camera,
                this.debugWireframes,
                this.gameSpeed,
                this.useSpriteBatching,
                void 0,
                this.worldSound,
              );
            }
            create(e) {
              let i = this.theater.getPalette(e.art.paletteType, e.art.customPaletteName),
                r = [];
              if (
                ((e.isAircraft() || e.isProjectile() || e.isDebris()) &&
                  r.push(new A.TrailerSmokePlugin(e, this.art, this.theater, this.imageFinder, this.gameSpeed)),
                e.isTechno())
              ) {
                i = i.clone();
                var s = this.unitSelection.getOrCreateSelectionModel(e),
                  a = new m.PipOverlay(
                    this.rules.general.paradrop,
                    this.rules.audioVisual,
                    e,
                    this.localPlayer,
                    this.alliances,
                    s,
                    this.imageFinder,
                    this.palettes.get("palette.pal"),
                    this.camera,
                    this.strings,
                    this.flyerHelperOpt,
                    this.hiddenObjectsOpt,
                    this.debugText,
                    (e) => this.createAnim(e),
                    this.useSpriteBatching,
                    this.useMeshInstancing,
                  );
                (!e.isUnit() ||
                  ((n = e.rules.moveSound) &&
                    this.worldSound &&
                    r.push(new b.MoveSoundFxPlugin(e, n, this.worldSound))),
                  r.push(new w.ChronoSparkleFxPlugin(e, this.rules.audioVisual.chronoSparkle1)),
                  e.mindControllerTrait && r.push(new C.MindControlLinkPlugin(e, s, this.alliances, this.localPlayer)),
                  // OpenYRWeb: continuous Magnetron tractor beam while dragging a target.
                  e.isUnit() && r.push(new Mb.MagnetronBeamPlugin(e)));
                let t;
                if (e.isBuilding()) {
                  var n = this.theater.animPalette,
                    o = this.theater.isoPalette;
                  ((t = new l.Building(
                    e,
                    s,
                    this.rules,
                    this.art,
                    this.imageFinder,
                    this.theater,
                    this.voxels,
                    this.voxelAnims,
                    i,
                    n,
                    o,
                    this.camera,
                    this.lighting,
                    this.debugWireframes,
                    this.gameSpeed,
                    this.vxlBuilderFactory,
                    this.useSpriteBatching,
                    new B.ShpAggregator(),
                    this.buildingImageDataCache,
                    a,
                    this.worldSound,
                    g.AnimationType.BUILDUP,
                  )),
                    e.psychicDetectorTrait &&
                      r.push(new O.PsychicDetectPlugin(e, e.psychicDetectorTrait, this.localPlayer, this.camera)));
                } else if (e.isVehicle())
                  ((t = new c.Vehicle(
                    e,
                    this.rules,
                    this.art,
                    this.imageFinder,
                    this.theater,
                    this.voxels,
                    this.voxelAnims,
                    i,
                    this.camera,
                    this.lighting,
                    this.debugWireframes,
                    this.gameSpeed,
                    s,
                    this.vxlBuilderFactory,
                    this.useSpriteBatching,
                    a,
                    this.worldSound,
                  )),
                    e.rules.damageParticleSystems.length &&
                      r.push(new M.DamageSmokePlugin(e, this.art, this.theater, this.imageFinder, this.gameSpeed)),
                    (e.rules.locomotor !== R.LocomotorType.Ship && e.rules.locomotor !== R.LocomotorType.Hover) ||
                      r.push(
                        new P.ShipWakeTrailPlugin(
                          e,
                          this.rules,
                          this.art,
                          this.theater,
                          this.imageFinder,
                          this.gameSpeed,
                        ),
                      ),
                    e.harvesterTrait && this.mapRenderable && r.push(new v.HarvesterPlugin(e, e.harvesterTrait)),
                    e.disguiseTrait &&
                      r.push(
                        new S.VehicleDisguisePlugin(
                          e,
                          e.disguiseTrait,
                          this.localPlayer,
                          this.alliances,
                          t,
                          this.art,
                          this.imageFinder,
                          this.theater,
                          this.camera,
                          this.lighting,
                          this.gameSpeed,
                          this.useSpriteBatching,
                        ),
                      ));
                else if (e.isInfantry())
                  ((t = new p.Infantry(
                    e,
                    this.rules,
                    this.art,
                    this.imageFinder,
                    this.theater,
                    i,
                    this.camera,
                    this.lighting,
                    this.debugWireframes,
                    this.gameSpeed,
                    s,
                    this.useSpriteBatching,
                    this.useMeshInstancing,
                    a,
                    this.worldSound,
                  )),
                    // OpenYRWeb: HarvesterPlugin (OREGATH spark) is NOT attached to enslaved
                    // infantry — vanilla YR slaves do NOT show the OREGATH ground sparkle while
                    // mining; only the body Shovel digging sequence plays. The spark is exclusive
                    // to vehicle harvesters (HARV). harvesterTrait.status is still set by
                    // SlaveGatherTask for tracking but has no visual effect without HarvesterPlugin.
                    this.forcedYuriDisguise &&
                    this.rules.audioVisual.benderOfSpoons &&
                    e.rules.isHuman &&
                    e.rules.movementZone !== N.MovementZone.Fly &&
                    this.art.hasObject(this.rules.audioVisual.benderOfSpoons, T.ObjectType.Infantry)
                      ? ((o = this.art.getObject(this.rules.audioVisual.benderOfSpoons, T.ObjectType.Infantry)),
                        r.push(new j.ForcedDisguisePlugin(e, o, this.localPlayer, t)))
                      : e.disguiseTrait &&
                        r.push(
                          new x.InfantryDisguisePlugin(
                            e,
                            e.disguiseTrait,
                            this.localPlayer,
                            this.alliances,
                            t,
                            this.art,
                            this.gameSpeed,
                          ),
                        ));
                else {
                  if (!e.isAircraft()) throw new Error("Unhandled game object type " + e.type);
                  t = new f.Aircraft(
                    e,
                    this.rules,
                    this.voxels,
                    this.voxelAnims,
                    i,
                    this.camera,
                    this.lighting,
                    this.debugWireframes,
                    this.gameSpeed,
                    s,
                    this.vxlBuilderFactory,
                    this.useSpriteBatching,
                    a,
                  );
                }
                return (
                  e.tntChargeTrait &&
                    r.push(
                      new E.TntFxPlugin(
                        e,
                        e.tntChargeTrait,
                        this.rules.combatDamage.ivanIconFlickerRate,
                        t,
                        this.imageFinder,
                        this.art,
                        this.alliances,
                        this.localPlayer,
                        this.worldSound,
                        (e) => this.createAnim(e),
                      ),
                    ),
                  r.push(new I.ObjectCloakPlugin(e, this.localPlayer, this.alliances, t)),
                  r.forEach((e) => t.registerPlugin(e)),
                  t
                );
              }
              if (e.isTerrain())
                return new h.Terrain(
                  e,
                  this.mapRenderable?.terrainLayer,
                  this.imageFinder,
                  i,
                  this.camera,
                  this.lighting,
                  this.debugWireframes,
                  this.gameSpeed,
                  this.useSpriteBatching,
                );
              if (e.isOverlay())
                return new u.Overlay(
                  e,
                  this.rules,
                  this.art,
                  this.imageFinder,
                  i,
                  this.camera,
                  this.lighting,
                  this.debugWireframes,
                  this.bridgeImageCache,
                  this.mapRenderable?.overlayLayer,
                  this.useSpriteBatching,
                );
              if (e.isProjectile()) {
                let t = new y.Projectile(
                  e,
                  this.rules,
                  this.imageFinder,
                  this.voxels,
                  this.voxelAnims,
                  this.theater,
                  i,
                  this.palettes.get("palette.pal"),
                  this.camera,
                  this.gameSpeed,
                  this.lighting,
                  this.lightingDirector,
                  this.vxlBuilderFactory,
                  this.useSpriteBatching,
                  this.useMeshInstancing,
                  this.worldSound,
                );
                return (r.forEach((e) => t.registerPlugin(e)), t);
              }
              if (e.isSmudge())
                return new d.Smudge(
                  e,
                  this.imageFinder,
                  i,
                  this.camera,
                  this.lighting,
                  this.debugWireframes,
                  this.mapRenderable?.smudgeLayer,
                );
              if (e.isDebris()) {
                let t = new k.Debris(
                  e,
                  this.rules,
                  this.imageFinder,
                  this.voxels,
                  this.voxelAnims,
                  i,
                  this.camera,
                  this.lighting,
                  this.gameSpeed,
                  this.vxlBuilderFactory,
                  this.useSpriteBatching,
                );
                return (r.forEach((e) => t.registerPlugin(e)), t);
              }
              throw new Error("Not implemented");
            }
          }),
        );
      },
    };
  },
);
