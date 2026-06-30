// === Reconstructed SystemJS module: game/rules/Rules ===
// deps: ["util/Color","engine/type/ObjectType","game/rules/CountryRules","game/rules/WeaponRules","game/rules/AudioVisualRules","game/rules/GeneralRules","game/rules/MpDialogSettings","game/type/LandType","game/rules/LandRules","game/rules/WarheadRules","game/rules/ProjectileRules","game/rules/ObjectRulesFactory","game/rules/CombatDamageRules","game/rules/TiberiumRules","game/rules/AiRules","game/rules/ElevationModelRules","game/rules/RadiationRules","game/rules/SuperWeaponRules","game/rules/CrateRules","game/rules/PowerupsRules","game/rules/mpAllowedColors","util/typeGuard","game/Weapon"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/rules/Rules",
  [
    "util/Color",
    "engine/type/ObjectType",
    "game/rules/CountryRules",
    "game/rules/WeaponRules",
    "game/rules/AudioVisualRules",
    "game/rules/GeneralRules",
    "game/rules/MpDialogSettings",
    "game/type/LandType",
    "game/rules/LandRules",
    "game/rules/WarheadRules",
    "game/rules/ProjectileRules",
    "game/rules/ObjectRulesFactory",
    "game/rules/CombatDamageRules",
    "game/rules/TiberiumRules",
    "game/rules/AiRules",
    "game/rules/ElevationModelRules",
    "game/rules/RadiationRules",
    "game/rules/SuperWeaponRules",
    "game/rules/CrateRules",
    "game/rules/PowerupsRules",
    "game/rules/mpAllowedColors",
    "util/typeGuard",
    "game/Weapon",
  ],
  function (e, t) {
    "use strict";
    var a, n, s, r, i, o, l, c, h, u, d, g, p, m, f, y, T, v, b, S, w, E, C, x;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
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
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
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
      ],
      execute: function () {
        e(
          "Rules",
          (x = class {
            constructor(e, t) {
              ((this.ini = e),
                (this.logger = t),
                (this.buildingTypes = new Map()),
                (this.vehicleTypes = new Map()),
                (this.infantryTypes = new Map()),
                (this.aircraftTypes = new Map()),
                (this.terrainTypes = new Map()),
                (this.overlayTypes = new Map()),
                (this.overlayIdsByType = new Map()),
                (this.animationTypes = new Map()),
                (this.animationNames = new Set()),
                (this.voxelAnimTypes = new Map()),
                (this.smudgeTypes = new Map()),
                (this.warheadTypes = new Map()),
                (this.tiberiumTypes = new Map()),
                (this.superWeaponTypes = new Map()),
                (this.countryTypes = new Map()),
                (this.weaponTypes = new Map()),
                (this.allObjectRules = new Map()),
                (this.buildingRules = new Map()),
                (this.infantryRules = new Map()),
                (this.vehicleRules = new Map()),
                (this.aircraftRules = new Map()),
                (this.terrainRules = new Map()),
                (this.overlayRules = new Map()),
                (this.smudgeRules = new Map()),
                (this.voxelAnimRules = new Map()),
                (this.countryRules = new Map()),
                (this.warheadRules = new Map()),
                (this.powerups = new S.PowerupsRules()),
                (this.colors = new Map()),
                (this.general = new o.GeneralRules()),
                (this.ai = new f.AiRules()),
                (this.crateRules = new b.CrateRules()),
                (this.elevationModel = new y.ElevationModelRules()),
                (this.mpDialogSettings = new l.MpDialogSettings()),
                (this.audioVisual = new i.AudioVisualRules()),
                (this.combatDamage = new p.CombatDamageRules()),
                (this.radiation = new T.RadiationRules()),
                (this.landRules = new Map()),
                (this.tiberiumRules = new Map()),
                (this.superWeaponRules = new Map()),
                (this.cachedWeaponRules = new Map()),
                (this.cachedProjectileRules = new Map()),
                this.init());
            }
            hasObject(e, t) {
              return this.allObjectRules.get(t)?.has(e);
            }
            getObject(e, t) {
              var i = this.allObjectRules.get(t)?.get(e);
              if (!i) throw new Error(`Missing rules for object "${e}"`);
              return i;
            }
            getTechnoByInternalId(e, t) {
              let i;
              if (t === n.ObjectType.Building) i = this.buildingTypes.get(e);
              else if (t === n.ObjectType.Infantry) i = this.infantryTypes.get(e);
              else if (t === n.ObjectType.Vehicle) i = this.vehicleTypes.get(e);
              else {
                if (t !== n.ObjectType.Aircraft) throw new Error(`Type ${n.ObjectType[t]} is not a techno type`);
                i = this.aircraftTypes.get(e);
              }
              if (void 0 === i) throw new Error(`Object type "${n.ObjectType[t]}" with ID "${e}" not found`);
              return this.getObject(i, t);
            }
            getBuilding(e) {
              var t = this.buildingRules.get(e);
              if (!t) throw new Error(`Missing rules for building "${e}"`);
              return t;
            }
            getWeapon(e) {
              let t = this.cachedWeaponRules.get(e);
              if (!t) {
                var i = this.ini.getSection(e);
                if (!i) throw new Error(`Weapon ${e} is missing ini section`);
                ((t = new r.WeaponRules(i)), this.cachedWeaponRules.set(e, t));
              }
              return t;
            }
            getWeaponByInternalId(e) {
              var t = this.weaponTypes.get(e);
              if (!t) throw new RangeError(`Weapon with internal ID "${e}" not found`);
              return this.getWeapon(t);
            }
            getWarhead(t) {
              let i = t.toLowerCase(),
                r = this.warheadRules.get(i);
              if (!r) {
                let e = this.ini.getSection(t);
                if (!e && ((e = this.ini.getOrderedSections().find((e) => e.name.toLowerCase() === i)), !e))
                  throw new Error("Unknown warhead " + t);
                ((r = new u.WarheadRules(e)), this.warheadRules.set(i, r));
              }
              return r;
            }
            getProjectile(t) {
              let i = t.toLowerCase(),
                r = this.cachedProjectileRules.get(i);
              if (!r) {
                let e = this.ini.getSection(t);
                if (!e && ((e = this.ini.getOrderedSections().find((e) => e.name.toLowerCase() === i)), !e))
                  throw new Error(`Projectile ${t} is missing ini section`);
                ((r = new d.ProjectileRules(n.ObjectType.Projectile, e)), this.cachedProjectileRules.set(i, r));
              }
              return r;
            }
            getOverlayName(e) {
              var t = this.overlayTypes.get(e);
              if (!t) throw new Error("Invalid overlay id " + e);
              return t;
            }
            hasOverlayId(e) {
              return this.overlayTypes.has(e);
            }
            getOverlayId(e) {
              var t = this.overlayIdsByType.get(e);
              if (void 0 === t) throw new Error("Invalid overlay name " + e);
              return t;
            }
            getOverlay(e) {
              var t = this.overlayRules.get(e);
              if (!t) throw new Error(`Missing rules for overlay "${e}"`);
              return t;
            }
            getAnimationName(e) {
              return this.animationTypes.get(e);
            }
            getCountry(e) {
              if (!this.countryRules.has(e)) throw new Error("Unknown country " + e);
              return this.countryRules.get(e);
            }
            getMultiplayerCountries() {
              return [...this.countryRules.values()].filter((e) => e.multiplay);
            }
            getMultiplayerColors() {
              let t = new Map();
              return (
                w.mpAllowedColors.forEach((e) => {
                  if (!this.colors.has(e))
                    throw new Error(`Multiplayer color "${e}" does not exist in the rules [Colors] section.`);
                  t.set(e, this.colors.get(e));
                }),
                t
              );
            }
            getLandRules(e) {
              let t = this.landRules.get(e);
              var i;
              return (
                t ||
                  ((i = e === c.LandType.Cliff ? "Rock" : c.LandType[e]),
                  (t = new h.LandRules().readIni(this.ini.getOrCreateSection(i))),
                  this.landRules.set(e, t)),
                t
              );
            }
            getTiberium(e) {
              var t = this.tiberiumTypes.get(e);
              if (!t) throw new Error("Unknown tiberium type " + e);
              return this.tiberiumRules.get(t);
            }
            getSuperWeapon(e) {
              if (!this.superWeaponRules.has(e)) throw new Error(`Unknown superweapon type "${e}"`);
              return this.superWeaponRules.get(e);
            }
            getIni() {
              return this.ini;
            }
            applySpecialFlags(e) {
              e.initialVeteran && (this.general.veteran.initialVeteran = !0);
            }
            init() {
              (this.readAudioVisual(),
                this.readCombatDamage(),
                this.readRadiation(),
                this.readGeneral(),
                this.readAi(),
                this.readCrateRules(),
                this.readElevationModel(),
                this.readMpDialogSettings(),
                this.readObjectTypes("BuildingTypes", this.buildingTypes),
                this.readObjectTypes("InfantryTypes", this.infantryTypes),
                this.readObjectTypes("VehicleTypes", this.vehicleTypes),
                this.readObjectTypes("AircraftTypes", this.aircraftTypes),
                this.readObjectTypes("TerrainTypes", this.terrainTypes),
                this.readObjectTypes("SmudgeTypes", this.smudgeTypes),
                this.readObjectTypes("Animations", this.animationTypes),
                (this.animationNames = new Set(this.animationTypes.values())),
                this.readObjectTypes("VoxelAnims", this.voxelAnimTypes),
                this.readObjectTypes("OverlayTypes", this.overlayTypes),
                this.overlayTypes.forEach((e, t) => this.overlayIdsByType.set(e, t)),
                this.readColors(),
                this.readObjectTypes("Countries", this.countryTypes),
                this.readObjectTypes("Warheads", this.warheadTypes),
                this.readObjectTypes("Tiberiums", this.tiberiumTypes),
                this.readObjectTypes("SuperWeaponTypes", this.superWeaponTypes),
                this.allObjectRules
                  .set(n.ObjectType.Building, this.buildingRules)
                  .set(n.ObjectType.Infantry, this.infantryRules)
                  .set(n.ObjectType.Vehicle, this.vehicleRules)
                  .set(n.ObjectType.Aircraft, this.aircraftRules)
                  .set(n.ObjectType.Terrain, this.terrainRules)
                  .set(n.ObjectType.Overlay, this.overlayRules)
                  .set(n.ObjectType.Smudge, this.smudgeRules)
                  .set(n.ObjectType.VoxelAnim, this.voxelAnimRules),
                this.readObjects(n.ObjectType.Building, this.buildingTypes, this.buildingRules),
                this.readObjects(n.ObjectType.Infantry, this.infantryTypes, this.infantryRules),
                this.readObjects(n.ObjectType.Vehicle, this.vehicleTypes, this.vehicleRules),
                this.readObjects(n.ObjectType.Aircraft, this.aircraftTypes, this.aircraftRules),
                this.readObjects(n.ObjectType.Terrain, this.terrainTypes, this.terrainRules),
                this.readObjects(n.ObjectType.Overlay, this.overlayTypes, this.overlayRules),
                this.readObjects(n.ObjectType.Smudge, this.smudgeTypes, this.smudgeRules),
                this.readObjects(n.ObjectType.VoxelAnim, this.voxelAnimTypes, this.voxelAnimRules),
                this.readCountries(),
                this.readWarheads(),
                this.readPowerups(),
                this.readTiberiums(),
                this.readSuperWeapons(),
                this.buildWeaponsList());
            }
            readAudioVisual() {
              var e = this.ini.getSection("AudioVisual");
              if (!e) throw new Error("Missing [AudioVisual] section");
              this.audioVisual.readIni(e);
            }
            readCombatDamage() {
              var e = this.ini.getSection("CombatDamage");
              if (!e) throw new Error("Missing [CombatDamage] section");
              this.combatDamage.readIni(e);
            }
            readRadiation() {
              var e = this.ini.getSection("Radiation");
              if (!e) throw new Error("Missing [Radiation] section");
              this.radiation.readIni(e);
            }
            readGeneral() {
              var e = this.ini.getSection("General");
              if (!e) throw new Error("Missing [General] section");
              this.general.readIni(e);
            }
            readAi() {
              var e = this.ini.getSection("AI");
              if (!e) throw new Error("Missing [AI] section");
              this.ai.readIni(e);
            }
            readCrateRules() {
              var e = this.ini.getSection("CrateRules");
              if (!e) throw new Error("Missing [CrateRules] section");
              this.crateRules.readIni(e);
            }
            readElevationModel() {
              var e = this.ini.getSection("ElevationModel");
              if (!e) throw new Error("Missing [ElevationModel] section");
              this.elevationModel.readIni(e);
            }
            readMpDialogSettings() {
              var e = this.ini.getSection("MultiplayerDialogSettings");
              if (!e) throw new Error("Missing [MultiplayerDialogSettings] section");
              this.mpDialogSettings.readIni(e);
            }
            readObjectTypes(i, r) {
              let e = this.ini.getSection(i);
              if (!e) throw new Error(`Missing [${i}] section`);
              let s = 0,
                a = new Set();
              e.entries.forEach((e, t) => {
                "string" == typeof e
                  ? Number.isNaN(Number(t))
                    ? this.logger?.debug(`Non-numeric id "${t}" found in rules section [${i}]. Skipping.`)
                    : a.has(e)
                      ? this.logger?.debug(`Duplicate type "${e}" in rules section [${i}]. Skipping.`)
                      : (r.set(s++, e), a.add(e))
                  : this.logger?.debug(`Non-string type found in rules section [${i}]. Skipping.`);
              });
            }
            readColors() {
              let e = this.ini.getSection("Colors");
              if (!e) throw new Error("Missing [Colors] section");
              e.entries.forEach((e, t) => {
                var [i, r, s] = e.split(","),
                  s = a.Color.fromHsv(parseInt(i, 10), parseInt(r, 10), parseInt(s, 10));
                this.colors.set(t, s);
              });
            }
            readObjects(r, e, s) {
              e.forEach((e, t) => {
                var i = this.ini.getSection(e);
                i
                  ? ((i = new g.ObjectRulesFactory().create(r, i, this.general, t)), s.set(e, i))
                  : this.logger?.debug(n.ObjectType[r] + ` type "${e}" has no rules section`);
              });
            }
            readCountries() {
              this.countryTypes.forEach((e, t) => {
                var i = this.ini.getSection(e);
                if (!i) throw new Error("Missing ini section for country " + e);
                let r = new s.CountryRules(t);
                (r.readIni(i), this.countryRules.set(e, r));
              });
            }
            readWarheads() {
              this.warheadTypes.forEach((e) => {
                var t = this.ini.getSection(e);
                t
                  ? ((t = new u.WarheadRules(t)), this.warheadRules.set(e.toLowerCase(), t))
                  : this.logger?.debug(`Warhead "${e}" has no rules section`);
              });
            }
            readPowerups() {
              var e = this.ini.getSection("Powerups");
              if (!e) throw new Error("Missing [Powerups] section");
              this.powerups.readIni(e);
            }
            readTiberiums() {
              this.tiberiumTypes.forEach((e, t) => {
                var i = this.ini.getSection(e);
                if (!i) throw new Error("Missing rules section for tiberium type " + e);
                this.tiberiumRules.set(e, new m.TiberiumRules(t).readIni(i));
              });
            }
            readSuperWeapons() {
              this.superWeaponTypes.forEach((e, t) => {
                var i = this.ini.getSection(e);
                if (!i) throw new Error("Missing rules section for superweapon type " + e);
                this.superWeaponRules.set(e, new v.SuperWeaponRules(t).readIni(i));
              });
            }
            buildWeaponsList() {
              let e = new Set();
              e.add(this.general.dropPodWeapon);
              for (var t of this.superWeaponRules.values()) t.weaponType && e.add(t.weaponType);
              var i, r;
              e.add(C.Weapon.NUKE_PAYLOAD_NAME);
              for (let a of [
                ...this.buildingRules.values(),
                ...this.aircraftRules.values(),
                ...this.vehicleRules.values(),
                ...this.infantryRules.values(),
              ])
                for (i of [
                  a.deathWeapon,
                  a.primary,
                  a.secondary,
                  a.elitePrimary,
                  a.eliteSecondary,
                  a.occupyWeapon,
                  a.eliteOccupyWeapon,
                  ...(a.weaponCount
                    ? new Array(a.weaponCount)
                        .fill(0)
                        .map((e, t) => [a.getWeaponAtIndex(t), a.getEliteWeaponAtIndex(t)])
                        .flat()
                    : []),
                ]
                  .filter(E.isNotNullOrUndefined)
                  .filter((e) => "" !== e))
                  e.add(i);
              let s = 0;
              for (r of e) this.weaponTypes.set(s++, r);
            }
          }),
        );
      },
    };
  },
);
