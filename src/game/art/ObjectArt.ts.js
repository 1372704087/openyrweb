// === Reconstructed SystemJS module: game/art/ObjectArt ===
// deps: ["engine/type/PaletteType","engine/type/ObjectType","game/Coords","game/art/SequenceReader","engine/type/LightingType","game/type/LandType","game/rules/OverlayRules","game/rules/TechnoRules","game/rules/TerrainRules","game/rules/ProjectileRules","game/art/FlhCoords","game/math/Vector2","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/art/ObjectArt",
  [
    "engine/type/PaletteType",
    "engine/type/ObjectType",
    "game/Coords",
    "game/art/SequenceReader",
    "engine/type/LightingType",
    "game/type/LandType",
    "game/rules/OverlayRules",
    "game/rules/TechnoRules",
    "game/rules/TerrainRules",
    "game/rules/ProjectileRules",
    "game/art/FlhCoords",
    "game/math/Vector2",
    "game/math/Vector3",
  ],
  function (e, t) {
    "use strict";
    var i, n, r, o, s, a, l, c, h, u, d, g, p, m;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
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
      ],
      execute: function () {
        (e(
          "ObjectArt",
          (m = class m {
            static getDefaultPalette(e) {
              switch (e) {
                case n.ObjectType.Building:
                case n.ObjectType.Aircraft:
                case n.ObjectType.Infantry:
                case n.ObjectType.Vehicle:
                case n.ObjectType.Projectile:
                case n.ObjectType.VoxelAnim:
                  return i.PaletteType.Unit;
                case n.ObjectType.Overlay:
                  return i.PaletteType.Overlay;
                case n.ObjectType.Smudge:
                case n.ObjectType.Terrain:
                  return i.PaletteType.Iso;
                default:
                  n.ObjectType.Animation;
                  return i.PaletteType.Anim;
              }
            }
            static getDefaultLighting(e) {
              switch (e) {
                case n.ObjectType.Animation:
                  return s.LightingType.None;
                case n.ObjectType.Aircraft:
                case n.ObjectType.Building:
                case n.ObjectType.Infantry:
                case n.ObjectType.Vehicle:
                  return s.LightingType.Ambient;
                case n.ObjectType.Projectile:
                case n.ObjectType.VoxelAnim:
                  return s.LightingType.Global;
                case n.ObjectType.Overlay:
                case n.ObjectType.Smudge:
                case n.ObjectType.Terrain:
                default:
                  return s.LightingType.Full;
              }
            }
            static getDefaultRemapability(e) {
              switch (e) {
                case n.ObjectType.Aircraft:
                case n.ObjectType.Building:
                case n.ObjectType.Infantry:
                case n.ObjectType.Vehicle:
                  return !0;
                case n.ObjectType.Overlay:
                case n.ObjectType.Smudge:
                case n.ObjectType.Terrain:
                case n.ObjectType.Animation:
                case n.ObjectType.Projectile:
                case n.ObjectType.VoxelAnim:
                  return !1;
                default:
                  throw new Error("Unknown object type " + e);
              }
            }
            static getDefaultDrawOffset(e) {
              switch (e) {
                case n.ObjectType.Animation:
                case n.ObjectType.Building:
                case n.ObjectType.Vehicle:
                case n.ObjectType.Infantry:
                case n.ObjectType.Overlay:
                case n.ObjectType.Smudge:
                case n.ObjectType.Projectile:
                case n.ObjectType.VoxelAnim:
                  return new g.Vector2(0, 0);
                case n.ObjectType.Terrain:
                case n.ObjectType.Aircraft:
                  return new g.Vector2(0, (r.Coords.ISO_TILE_SIZE + 1) / 2);
                default:
                  throw new Error("Unknown object type " + e);
              }
            }
            static getDefaultShadow(e) {
              switch (e) {
                case n.ObjectType.Overlay:
                case n.ObjectType.Building:
                case n.ObjectType.Infantry:
                case n.ObjectType.Terrain:
                case n.ObjectType.Vehicle:
                case n.ObjectType.Aircraft:
                  return !0;
                default:
                case n.ObjectType.Smudge:
                case n.ObjectType.Animation:
                case n.ObjectType.Projectile:
                case n.ObjectType.VoxelAnim:
                  return !1;
              }
            }
            static getDefaultHeight(e) {
              switch (e) {
                case n.ObjectType.Building:
                  return 2;
                case n.ObjectType.Infantry:
                case n.ObjectType.Vehicle:
                case n.ObjectType.Aircraft:
                  return 1;
                default:
                  return 0;
              }
            }
            static factory(e, t, i, r) {
              let s = new this(e, t, r);
              var a;
              return (
                e === n.ObjectType.Infantry &&
                  (!(a = r.getString("Sequence")) ||
                    ((a = i.getSection(a)) && (s.sequences = new o.SequenceReader().readIni(a)))),
                s
              );
            }
            constructor(e, t, i) {
              ((this.sequences = new Map()),
                (this.dockingOffsets = []),
                (this.type = e),
                (this.rules = t),
                (this.art = i),
                this.init());
            }
            init() {
              ((this.image = [n.ObjectType.Infantry, n.ObjectType.Vehicle, n.ObjectType.Aircraft].includes(this.type)
                ? ""
                : this.art.getString("Image")),
                (this.report = this.art.getString("Report") || void 0),
                this.readRotors(),
                (this.noHva = this.art.getBool("NoHVA")),
                (this.startSound = this.art.getString("StartSound") || void 0),
                this.readMuzzleFlash(),
                this.readPaletteAndLightingTypes(),
                this.readRemapability(),
                this.readFlatness(),
                this.readDockingOffsets());
              var e = this.art.getNumberArray("QueueingCell");
              ((this.queueingCell = e.length ? new g.Vector2(e[0], e[1]) : void 0),
                (this.demandLoad = this.art.getBool("DemandLoad")));
              var t = this.art.getBool("UseLineTrail"),
                i = this.art.getNumberArray("LineTrailColor"),
                e = this.art.getNumber("LineTrailColorDecrement", m.DEFAULT_LINE_TRAIL_DEC);
              (t && i.length
                ? ((this.useLineTrail = !0), (this.lineTrailColor = i), (this.lineTrailColorDecrement = e))
                : (this.useLineTrail = !1),
                (this.crater = this.art.getBool("Crater")),
                (this.forceBigCraters = this.art.getBool("ForceBigCraters")),
                (this.scorch = this.art.getBool("Scorch")),
                (this.height = this.art.getNumber("Height", m.getDefaultHeight(this.type))),
                (this.isVoxel = this.art.getBool("Voxel")),
                (this.occupyHeight = this.art.getNumber("OccupyHeight", this.height)),
                this.type === n.ObjectType.Building
                  ? (this.canHideThings = this.art.getBool("CanHideThings", !0))
                  : (this.canHideThings = !1),
                (this.canBeHidden = this.art.getBool("CanBeHidden", !0)),
                (this.addOccupy = this.readAddRemoveOccupy("AddOccupy")),
                (this.removeOccupy = this.readAddRemoveOccupy("RemoveOccupy")),
                (this.rotates = this.art.getBool("Rotates")),
                (this.toOverlay = this.art.getString("ToOverlay") || void 0));
            }
            get imageName() {
              return (this.image || this.rules.imageName) + (this.rules.alternateArcticArt ? "A" : "");
            }
            get cameo() {
              let e = this.art.getString("Cameo") || m.MISSING_CAMEO;
              return e.toLowerCase();
            }
            get altCameo() {
              let e = this.art.getString("AltCameo") || this.cameo;
              return e.toLowerCase();
            }
            get useTheaterExtension() {
              return this.art.getBool("Theater");
            }
            readPaletteAndLightingTypes() {
              ((this.paletteType = i.PaletteType.Default),
                (this.lightingType = s.LightingType.Default),
                (this.rules instanceof l.OverlayRules ? this.rules.noUseTileLandType : void 0) &&
                  ((this.paletteType = i.PaletteType.Iso), (this.lightingType = s.LightingType.Full)),
                this.art.getBool("TerrainPalette") || this.art.getBool("ShouldUseCellDrawer")
                  ? (this.paletteType = i.PaletteType.Iso)
                  : this.art.getBool("AnimPalette")
                    ? ((this.paletteType = i.PaletteType.Anim), (this.lightingType = s.LightingType.None))
                    : this.art.getString("Palette") &&
                      ((this.paletteType = i.PaletteType.Custom),
                      (this.customPaletteName = this.art.getString("Palette"))),
                this.art.getBool("AltPalette") && (this.paletteType = i.PaletteType.Unit),
                (this.rules instanceof l.OverlayRules || this.rules instanceof c.TechnoRules) &&
                  this.rules.wall &&
                  ((this.paletteType = i.PaletteType.Unit), (this.lightingType = s.LightingType.Ambient)),
                (this.rules instanceof h.TerrainRules || this.rules instanceof c.TechnoRules) &&
                  this.rules.gate &&
                  (this.paletteType = i.PaletteType.Unit),
                this.rules instanceof h.TerrainRules &&
                  this.rules.spawnsTiberium &&
                  ((this.paletteType = i.PaletteType.Unit), (this.lightingType = s.LightingType.None)),
                this.rules instanceof l.OverlayRules &&
                  (this.rules.isVeins &&
                    ((this.paletteType = i.PaletteType.Unit), (this.lightingType = s.LightingType.None)),
                  this.rules.isVeinholeMonster &&
                    ((this.paletteType = i.PaletteType.Unit), (this.lightingType = s.LightingType.None)),
                  this.rules.tiberium && (this.lightingType = s.LightingType.None),
                  this.rules.land === a.LandType.Railroad &&
                    ((this.paletteType = i.PaletteType.Iso), (this.lightingType = s.LightingType.Full)),
                  this.rules.crate &&
                    ((this.paletteType = i.PaletteType.Iso), (this.lightingType = s.LightingType.Full))),
                this.paletteType === i.PaletteType.Default && (this.paletteType = m.getDefaultPalette(this.type)),
                this.lightingType === s.LightingType.Default && (this.lightingType = m.getDefaultLighting(this.type)));
            }
            readRemapability() {
              ((this.remapable = m.getDefaultRemapability(this.type)),
                this.art.getBool("TerrainPalette") || this.art.getBool("AnimPalette")
                  ? (this.remapable = !1)
                  : this.rules instanceof u.ProjectileRules && this.rules.firersPalette && (this.remapable = !0));
            }
            readFlatness() {
              let e = !1;
              (this.type === n.ObjectType.Building || this.type === n.ObjectType.Animation
                ? (e = this.art.getBool("Flat"))
                : this.type === n.ObjectType.Smudge && (e = !0),
                this.rules instanceof l.OverlayRules &&
                  (this.rules.wall || this.rules.crate || this.rules.isARock || (e = !0)),
                (this.flat = e));
            }
            readRotors() {
              var i = this.art.getArray("Rotors");
              if (i.length) {
                let e = [];
                for (let t = 0; t < i.length; ++t) {
                  var r = this.art.getNumberArray(`Rotor${t + 1}Axis`, void 0, [0, 1, 0]),
                    r = new p.Vector3(-r[2], -r[0], r[1]).normalize();
                  e.push({
                    name: i[t],
                    axis: r,
                    speed: this.art.getNumber(`Rotor${t + 1}Rate`) || void 0,
                    idleSpeed: this.art.getNumber(`Rotor${t + 1}IdleRate`) || void 0,
                  });
                }
                e.length && (this.rotors = e);
              }
            }
            readMuzzleFlash() {
              let e = 0,
                t = "MuzzleFlash" + e,
                i = [];
              for (; this.art.has(t);) {
                var [r, s] = this.art.getNumberArray(t);
                (i.push({ x: r, y: s }), e++, (t = "MuzzleFlash" + e));
              }
              this.muzzleFlash = i.length ? i : void 0;
            }
            readDockingOffsets() {
              if (this.type === n.ObjectType.Building) {
                var t = this.rules.numberOfDocks;
                for (let e = 0; e < t; e++) {
                  var [i, r, s] = this.art.getNumberArray("DockingOffset" + e, /,\s*/, [0, 0, 0]);
                  this.dockingOffsets.push(new p.Vector3(i, s, r));
                }
              }
            }
            readAddRemoveOccupy(e) {
              let t = 0,
                i = [];
              for (;;) {
                var r = this.art.getNumberArray(e + ++t);
                if (!r.length) break;
                i.push(new g.Vector2(r[0], r[1]));
              }
              return i;
            }
            get bibShape() {
              return this.art.getString("BibShape");
            }
            get foundation() {
              let e = this.art.getString("Foundation", "1x1");
              var [t, i] = e.split(/x/i);
              return { width: parseInt(t, 10), height: parseInt(i, 10) };
            }
            get foundationCenter() {
              return new g.Vector2(
                Math.floor(this.foundation.width / 2 - 0.5),
                Math.floor(this.foundation.height / 2 - 0.5),
              );
            }
            getDrawOffset() {
              if (this.rules instanceof h.TerrainRules && this.rules.spawnsTiberium) return new g.Vector2(0, 0);
              let e = m.getDefaultDrawOffset(this.type);
              return (
                this.rules instanceof l.OverlayRules && this.rules.isARock && (e.y += (r.Coords.ISO_TILE_SIZE + 1) / 2),
                e
              );
            }
            get hasShadow() {
              return this.art.getBool("Shadow", m.getDefaultShadow(this.type)) && !this.rules.noShadow;
            }
            get turretOffset() {
              return this.art.getNumber("TurretOffset");
            }
            get facings() {
              return this.art.getNumber("Facings", 8);
            }
            get walkFrames() {
              return this.art.getNumber("WalkFrames");
            }
            get firingFrames() {
              return this.art.getNumber("FiringFrames");
            }
            get standingFrames() {
              return this.art.getNumber("StandingFrames", 1);
            }
            get startWalkFrame() {
              return this.art.getNumber("StartWalkFrame", 0);
            }
            get startStandFrame() {
              return this.art.getNumber("StartStandFrame", this.walkFrames * this.facings);
            }
            get startFiringFrame() {
              return this.art.getNumber("StartFiringFrame", (this.walkFrames + this.standingFrames) * this.facings);
            }
            get isFlamingGuy() {
              return this.art.getBool("IsFlamingGuy");
            }
            get runningFrames() {
              return this.art.getNumber("RunningFrames");
            }
            get crawls() {
              return this.art.getBool("Crawls", !0);
            }
            get primaryFireFlh() {
              return new d.FlhCoords(this.art.getNumberArray("PrimaryFireFLH"));
            }
            get elitePrimaryFireFlh() {
              var e = this.art.getNumberArray("ElitePrimaryFireFLH");
              return e.length ? new d.FlhCoords(e) : this.primaryFireFlh;
            }
            get primaryFirePixelOffset() {
              return this.art.getNumberArray("PrimaryFirePixelOffset");
            }
            get secondaryFirePixelOffset() {
              return this.art.getNumberArray("SecondaryFirePixelOffset");
            }
            get secondaryFireFlh() {
              return new d.FlhCoords(this.art.getNumberArray("SecondaryFireFLH"));
            }
            get eliteSecondaryFireFlh() {
              var e = this.art.getNumberArray("EliteSecondaryFireFLH");
              return e.length ? new d.FlhCoords(e) : this.secondaryFireFlh;
            }
            getSpecialWeaponFlh(e) {
              return new d.FlhCoords(this.art.getNumberArray(`Weapon${e + 1}FLH`));
            }
            get fireUp() {
              return this.art.getNumber("FireUp") || this.art.getNumber("DelayedFireDelay");
            }
            get isAnimDelayedFire() {
              return this.art.getBool("IsAnimDelayedFire");
            }
            get zShapePointMove() {
              return this.art.getNumberArray("ZShapePointMove");
            }
            get zAdjust() {
              return this.art.getNumber("ZAdjust");
            }
            get trailer() {
              return this.art.getString("Trailer");
            }
            get spawnDelay() {
              return this.art.getNumber("SpawnDelay", 1);
            }
            get translucent() {
              return this.art.getBool("Translucent");
            }
            get translucency() {
              var e = ((e = this.art.getNumber("Translucency", 0)) / 25) * 25;
              return (e /= 100);
            }
          }),
        ),
          (m.DEFAULT_LINE_TRAIL_DEC = 16),
          (m.MISSING_CAMEO = "xxicon"));
      },
    };
  },
);
