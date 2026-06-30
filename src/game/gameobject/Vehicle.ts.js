// === Reconstructed SystemJS module: game/gameobject/Vehicle ===
// deps: ["engine/type/ObjectType","game/gameobject/trait/HarvesterTrait","game/gameobject/trait/TransportTrait","game/gameobject/trait/MoveTrait","game/gameobject/trait/TurretTrait","game/gameobject/unit/ZoneType","game/gameobject/trait/DockableTrait","game/gameobject/Techno","game/gameobject/trait/CrewedTrait","game/gameobject/trait/GunnerTrait","game/gameobject/trait/ParasiteableTrait","game/gameobject/trait/CrashableTrait","game/gameobject/trait/SubmergibleTrait","game/type/LocomotorType","game/gameobject/trait/HoverBobTrait","game/gameobject/unit/CrateBonuses","game/gameobject/trait/TilterTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/Vehicle",
  [
    "engine/type/ObjectType",
    "game/gameobject/trait/HarvesterTrait",
    "game/gameobject/trait/TransportTrait",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/trait/TurretTrait",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/trait/DockableTrait",
    "game/gameobject/Techno",
    "game/gameobject/trait/CrewedTrait",
    "game/gameobject/trait/GunnerTrait",
    "game/gameobject/trait/ParasiteableTrait",
    "game/gameobject/trait/CrashableTrait",
    "game/gameobject/trait/SubmergibleTrait",
    "game/type/LocomotorType",
    "game/gameobject/trait/HoverBobTrait",
    "game/gameobject/unit/CrateBonuses",
    "game/gameobject/trait/TilterTrait",
  ],
  function (e, t) {
    "use strict";
    var r, n, o, l, c, s, h, i, u, d, g, p, m, f, y, a, T, v;
    t && t.id;
    return {
      setters: [
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
        function (e) {
          s = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          i = e;
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
          a = e;
        },
        function (e) {
          T = e;
        },
      ],
      execute: function () {
        (e("ROCKING_TICKS", 34),
          (v = class extends i.Techno {
            get isMoving() {
              return this.moveTrait.isMoving();
            }
            static factory(e, t, i, r, s) {
              let a = new this(e, t, i);
              return (
                (a.isSinker = !t.underwater && (t.weight >= r.general.shipSinkingWeight || !t.naval)),
                (a.moveTrait = new l.MoveTrait(a, s)),
                a.traits.add(a.moveTrait),
                t.crashable && ((a.crashableTrait = new p.CrashableTrait(a)), a.traits.add(a.crashableTrait)),
                t.crewed && ((a.crewedTrait = new u.CrewedTrait()), a.traits.add(a.crewedTrait)),
                t.harvester && ((a.harvesterTrait = new n.HarvesterTrait(t.storage)), a.traits.add(a.harvesterTrait)),
                t.passengers &&
                  ((a.transportTrait = new o.TransportTrait(a)),
                  a.traits.add(a.transportTrait),
                  t.gunner && ((a.gunnerTrait = new d.GunnerTrait()), a.traits.add(a.gunnerTrait))),
                t.turret && ((a.turretTrait = new c.TurretTrait()), a.traits.add(a.turretTrait)),
                (t.consideredAircraft && !t.landable) || a.traits.add(new h.DockableTrait()),
                t.parasiteable &&
                  ((a.parasiteableTrait = new g.ParasiteableTrait(a)), a.traits.add(a.parasiteableTrait)),
                t.naval &&
                  t.underwater &&
                  ((a.submergibleTrait = new m.SubmergibleTrait()), a.traits.add(a.submergibleTrait)),
                t.locomotor === f.LocomotorType.Hover && a.traits.add(new y.HoverBobTrait()),
                [f.LocomotorType.Vehicle, f.LocomotorType.Chrono].includes(t.locomotor) &&
                  i.isVoxel &&
                  ((a.tilterTrait = new T.TilterTrait()), a.traits.add(a.tilterTrait)),
                a
              );
            }
            constructor(e, t, i) {
              (super(r.ObjectType.Vehicle, e, t, i),
                (this.direction = 0),
                (this.spinVelocity = 0),
                (this.crateBonuses = new a.CrateBonuses()),
                (this.turretNo = 0),
                (this.onBridge = !1),
                (this.isSinker = !1),
                (this.isFiring = !1),
                (this.zone = t.naval ? s.ZoneType.Water : s.ZoneType.Ground));
            }
            isUnit() {
              return !0;
            }
            isVehicle() {
              return !0;
            }
            getUiName() {
              if (this.gunnerTrait) {
                var e = this.armedTrait.getSpecialWeaponIndex(),
                  t = this.gunnerTrait.getUiNameForIfvMode(e, this.transportTrait?.units[0]?.name),
                  e = "name:" + this.name;
                return t ? `{${t}} {${e}}` : e;
              }
              return super.getUiName();
            }
            update(e) {
              (this.rocking && (this.rocking.ticksLeft--, this.rocking.ticksLeft || (this.rocking = void 0)),
                super.update(e));
            }
            applyRocking(e, t) {
              this.rules.consideredAircraft ||
                (this.rocking = { ticksLeft: this.rocking?.ticksLeft ?? 34, facing: e, factor: t });
            }
          }),
          e("Vehicle", v));
      },
    };
  },
);
