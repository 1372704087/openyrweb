// === Reconstructed SystemJS module: game/gameobject/Aircraft ===
// deps: ["engine/type/ObjectType","game/gameobject/trait/MoveTrait","game/gameobject/unit/ZoneType","game/gameobject/trait/DockableTrait","game/gameobject/Techno","game/gameobject/trait/ParasiteableTrait","game/gameobject/trait/CrashableTrait","game/gameobject/trait/AirportBoundTrait","game/gameobject/trait/SpawnLinkTrait","game/gameobject/trait/MissileSpawnTrait","game/gameobject/unit/CrateBonuses","game/gameobject/trait/UnlandableTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/Aircraft",
  [
    "engine/type/ObjectType",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/trait/DockableTrait",
    "game/gameobject/Techno",
    "game/gameobject/trait/ParasiteableTrait",
    "game/gameobject/trait/CrashableTrait",
    "game/gameobject/trait/AirportBoundTrait",
    "game/gameobject/trait/SpawnLinkTrait",
    "game/gameobject/trait/MissileSpawnTrait",
    "game/gameobject/unit/CrateBonuses",
    "game/gameobject/trait/UnlandableTrait",
  ],
  function (e, t) {
    "use strict";
    var r, n, s, o, i, l, c, h, u, d, a, g, p;
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
          s = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          i = e;
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
          a = e;
        },
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        ((p = class extends i.Techno {
          get direction() {
            return this.yaw;
          }
          set direction(e) {
            this.yaw = e;
          }
          get isMoving() {
            return this.moveTrait.isMoving();
          }
          static factory(e, t, i, r, s) {
            let a = new this(e, t, i);
            return (
              a.rules.airportBound &&
                a.rules.dock.length &&
                ((a.airportBoundTrait = new h.AirportBoundTrait(a.rules.dock)), a.traits.add(a.airportBoundTrait)),
              a.rules.missileSpawn || ((a.crashableTrait = new c.CrashableTrait(a)), a.traits.add(a.crashableTrait)),
              a.rules.spawned &&
                (a.rules.missileSpawn
                  ? ((a.missileSpawnTrait = new d.MissileSpawnTrait()), a.traits.add(a.missileSpawnTrait))
                  : ((a.spawnLinkTrait = new u.SpawnLinkTrait()), a.traits.add(a.spawnLinkTrait))),
              (a.moveTrait = new n.MoveTrait(a, s)),
              a.traits.add(a.moveTrait),
              t.dock.length && a.traits.add(new o.DockableTrait()),
              (t.landable && e !== r.general.paradrop.paradropPlane) || a.traits.add(new g.UnlandableTrait()),
              t.parasiteable && ((a.parasiteableTrait = new l.ParasiteableTrait(a)), a.traits.add(a.parasiteableTrait)),
              a
            );
          }
          constructor(e, t, i) {
            (super(r.ObjectType.Aircraft, e, t, i),
              (this.pitch = 0),
              (this.yaw = 0),
              (this.roll = 0),
              (this.onBridge = !1),
              (this.zone = s.ZoneType.Ground),
              (this.crateBonuses = new a.CrateBonuses()));
          }
          isUnit() {
            return !0;
          }
          isAircraft() {
            return !0;
          }
        }),
          e("Aircraft", p));
      },
    };
  },
);
