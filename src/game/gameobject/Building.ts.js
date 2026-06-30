// === Reconstructed SystemJS module: game/gameobject/Building ===
// deps: ["engine/type/ObjectType","game/gameobject/trait/GarrisonTrait","game/gameobject/trait/TurretTrait","game/rules/TechnoRules","game/event/BuildStatusChangeEvent","game/gameobject/trait/PoweredTrait","game/gameobject/trait/FactoryTrait","game/gameobject/trait/DockTrait","game/gameobject/trait/FreeUnitTrait","game/gameobject/Techno","game/gameobject/trait/CrewedTrait","game/gameobject/trait/CabHutTrait","game/gameobject/trait/OilDerrickTrait","game/gameobject/trait/WallTrait","game/Coords","game/gameobject/trait/OverpoweredTrait","game/gameobject/trait/UnitRepairTrait","game/gameobject/trait/RallyTrait","game/gameobject/trait/C4ChargeTrait","game/gameobject/trait/HelipadTrait","game/gameobject/trait/UnitReloadTrait","game/gameobject/task/WaitForBuildUpTask","game/gameobject/trait/SuperWeaponTrait","game/gameobject/trait/GapGeneratorTrait","game/gameobject/trait/PsychicDetectorTrait","game/gameobject/trait/HospitalTrait","game/math/Vector2","game/gameobject/trait/DelayedKillTrait","game/gameobject/trait/interface/NotifyBuildStatus","game/gameobject/trait/SecureProgressTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/Building",
  [
    "engine/type/ObjectType",
    "game/gameobject/trait/GarrisonTrait",
    "game/gameobject/trait/TurretTrait",
    "game/rules/TechnoRules",
    "game/event/BuildStatusChangeEvent",
    "game/gameobject/trait/PoweredTrait",
    "game/gameobject/trait/FactoryTrait",
    "game/gameobject/trait/DockTrait",
    "game/gameobject/trait/FreeUnitTrait",
    "game/gameobject/Techno",
    "game/gameobject/trait/CrewedTrait",
    "game/gameobject/trait/CabHutTrait",
    "game/gameobject/trait/OilDerrickTrait",
    "game/gameobject/trait/WallTrait",
    "game/Coords",
    "game/gameobject/trait/OverpoweredTrait",
    "game/gameobject/trait/UnitRepairTrait",
    "game/gameobject/trait/RallyTrait",
    "game/gameobject/trait/C4ChargeTrait",
    "game/gameobject/trait/HelipadTrait",
    "game/gameobject/trait/UnitReloadTrait",
    "game/gameobject/task/WaitForBuildUpTask",
    "game/gameobject/trait/SuperWeaponTrait",
    "game/gameobject/trait/GapGeneratorTrait",
    "game/gameobject/trait/PsychicDetectorTrait",
    "game/gameobject/trait/HospitalTrait",
    "game/math/Vector2",
    "game/gameobject/trait/DelayedKillTrait",
    "game/gameobject/trait/interface/NotifyBuildStatus",
    "game/gameobject/trait/SecureProgressTrait",
  ],
  function (t, e) {
    "use strict";
    var r, o, l, c, s, h, u, d, g, i, p, m, f, y, a, T, v, b, S, w, E, n, C, x, O, A, M, R, P, I, k, B;
    e && e.id;
    return {
      setters: [
        function (e) {
          r = e;
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
          s = e;
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
          i = e;
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
          a = e;
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
          n = e;
        },
        function (e) {
          C = e;
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
      ],
      execute: function () {
        var e;
        (((e = k || t("BuildStatus", (k = {})))[(e.BuildUp = 0)] = "BuildUp"),
          (e[(e.Ready = 1)] = "Ready"),
          (e[(e.BuildDown = 2)] = "BuildDown"),
          (B = class extends i.Techno {
            get buildStatus() {
              return this._buildStatus;
            }
            static factory(e, t, i, r, s, a) {
              let n = new this(e, t, r);
              return (
                t.canBeOccupied &&
                  ((n.garrisonTrait = new o.GarrisonTrait(n, i.audioVisual.conditionRed, t.maxNumberOccupants)),
                  n.traits.add(n.garrisonTrait)),
                t.capturable &&
                  t.needsEngineer &&
                  (0 < t.produceCashStartup || 0 < t.produceCashAmount) &&
                  ((n.secureProgressTrait = new I.SecureProgressTrait(i.general.engineerTechSecureTime)),
                  n.traits.add(n.secureProgressTrait)),
                t.canC4 && !t.wall && ((n.c4ChargeTrait = new S.C4ChargeTrait()), n.traits.add(n.c4ChargeTrait)),
                t.eligibleForDelayKill &&
                  ((n.delayedKillTrait = new R.DelayedKillTrait()), n.traits.add(n.delayedKillTrait)),
                t.bridgeRepairHut && ((n.cabHutTrait = new m.CabHutTrait(n, a)), n.traits.add(n.cabHutTrait)),
                t.crewed && ((n.crewedTrait = new p.CrewedTrait()), n.traits.add(n.crewedTrait)),
                t.turret && ((n.turretTrait = new l.TurretTrait()), n.traits.add(n.turretTrait)),
                t.overpowerable && ((n.overpoweredTrait = new T.OverpoweredTrait(n)), n.traits.add(n.overpoweredTrait)),
                ((t.powered && 0 !== t.power) || t.needsEngineer) &&
                  ((n.poweredTrait = new h.PoweredTrait(n)), n.traits.add(n.poweredTrait)),
                (t.factory || t.cloning) &&
                  ((n.factoryTrait = new u.FactoryTrait(t.cloning ? c.FactoryType.InfantryType : t.factory, t.cloning)),
                  n.traits.add(n.factoryTrait)),
                t.superWeapon &&
                  ((n.superWeaponTrait = new C.SuperWeaponTrait(t.superWeapon)), n.traits.add(n.superWeaponTrait)),
                t.numberOfDocks &&
                  ((n.dockTrait = new d.DockTrait(n, s, t.numberOfDocks, r.dockingOffsets)),
                  n.traits.add(n.dockTrait),
                  t.helipad && ((n.helipadTrait = new w.HelipadTrait()), n.traits.add(n.helipadTrait)),
                  (t.unitRepair || t.unitReload) &&
                    ((n.unitRepairTrait = new v.UnitRepairTrait()), n.traits.add(n.unitRepairTrait)),
                  t.unitReload && ((n.unitReloadTrait = new E.UnitReloadTrait()), n.traits.add(n.unitReloadTrait))),
                t.hospital && ((n.hospitalTrait = new A.HospitalTrait()), n.traits.add(n.hospitalTrait)),
                (t.factory || t.cloning || t.numberOfDocks) &&
                  ((n.rallyTrait = new b.RallyTrait()), n.traits.add(n.rallyTrait)),
                t.freeUnit && n.traits.add(new g.FreeUnitTrait()),
                t.produceCashStartup && n.traits.add(new f.OilDerrickTrait()),
                t.wall && ((n.wallTrait = new y.WallTrait()), n.traits.add(n.wallTrait)),
                t.gapGenerator &&
                  ((n.gapGeneratorTrait = new x.GapGeneratorTrait(t.gapRadiusInCells)),
                  n.traits.add(n.gapGeneratorTrait)),
                t.psychicDetectionRadius &&
                  ((n.psychicDetectorTrait = new O.PsychicDetectorTrait(t.psychicDetectionRadius)),
                  n.traits.add(n.psychicDetectorTrait)),
                n
              );
            }
            constructor(e, t, i) {
              (super(r.ObjectType.Building, e, t, i),
                (this.showWeaponRange = !1),
                (this.direction = 0),
                (this._buildStatus = k.BuildUp),
                (this.lastBuildStatus = this.buildStatus));
            }
            isBuilding() {
              return !0;
            }
            getFoundation() {
              return this.art.foundation;
            }
            getFoundationCenterOffset() {
              var e = this.getFoundation();
              return new M.Vector2(
                (e.width / 2) * a.Coords.LEPTONS_PER_TILE,
                (e.height / 2) * a.Coords.LEPTONS_PER_TILE,
              );
            }
            update(e) {
              (this.buildStatus !== k.BuildUp ||
                this.unitOrderTrait.hasTasks() ||
                this.unitOrderTrait.addTask(new n.WaitForBuildUpTask(e.rules.general.buildupTime, e)),
                this.attackTrait?.setDisabled(
                  this.buildStatus !== k.Ready || (!!this.poweredTrait && !this.poweredTrait.isPoweredOn()),
                ),
                super.update(e));
            }
            setBuildStatus(e, t) {
              this._buildStatus = e;
              let i = this.lastBuildStatus;
              this.buildStatus !== i &&
                ((this.lastBuildStatus = this.buildStatus),
                this.traits.filter(P.NotifyBuildStatus).forEach((e) => {
                  e[P.NotifyBuildStatus.onStatusChange](i, this, t);
                }),
                t.events.dispatch(new s.BuildStatusChangeEvent(this, this.buildStatus)));
            }
          }),
          t("Building", B));
      },
    };
  },
);
