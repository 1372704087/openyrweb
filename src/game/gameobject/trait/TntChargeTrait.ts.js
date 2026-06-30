// === Reconstructed SystemJS module: game/gameobject/trait/TntChargeTrait ===
// deps: ["game/Coords","game/Warhead","game/gameobject/common/DeathType","game/gameobject/unit/CollisionType","game/gameobject/unit/Timer","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyTick","game/SpecialWarheadType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/TntChargeTrait",
  [
    "game/Coords",
    "game/Warhead",
    "game/gameobject/common/DeathType",
    "game/gameobject/unit/CollisionType",
    "game/gameobject/unit/Timer",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyTick",
    "game/SpecialWarheadType",
  ],
  function (e, t) {
    "use strict";
    var l, c, r, h, i, s, a, u, n;
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
          r = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        ((n = class {
          constructor() {
            this.timer = new i.Timer();
          }
          hasCharge() {
            return this.timer.isActive();
          }
          setCharge(e, t, i) {
            this.hasCharge() || (this.timer.setActiveFor(e, t), (this.attackerInfo = i));
          }
          getChargeOwner() {
            return this.attackerInfo?.player;
          }
          removeCharge() {
            this.timer.reset();
          }
          getTicksLeft() {
            return this.timer.getTicksLeft();
          }
          getInitialTicks() {
            return this.timer.getInitialTicks();
          }
          [a.NotifyTick.onTick](e, t) {
            this.timer.isActive() &&
              !0 === this.timer.tick(t.currentTick) &&
              (e.isBuilding() && e.cabHutTrait && e.cabHutTrait.demolishBridge(t, this.attackerInfo),
              this.detonateIvanWarhead(t, e));
          }
          [s.NotifyDestroy.onDestroy](e, t, i) {
            !this.timer.isActive() ||
              i?.weapon?.warhead.rules.ivanBomb ||
              [r.DeathType.None, r.DeathType.Temporal, r.DeathType.Sink].includes(e.deathType) ||
              (this.timer.reset(), this.detonateIvanWarhead(t, e));
          }
          detonateIvanWarhead(e, t) {
            var i = e.rules.combatDamage.ivanDamage;
            let r = new c.Warhead(e.rules.getWarhead(e.rules.combatDamage.ivanWarhead));
            var s = t.tile,
              a = t.tileElevation,
              n = t.isUnit() ? t.zone : e.map.getTileZone(s),
              o = !!t.isUnit() && t.onBridge;
            r.detonate(
              e,
              i,
              s,
              a,
              t.isBuilding() ? l.Coords.tile3dToWorld(s.rx + 0.5, s.ry + 0.5, s.z + a) : t.position.worldPosition,
              n,
              o ? h.CollisionType.OnBridge : h.CollisionType.None,
              e.createTarget(t, s),
              { ...this.attackerInfo, weapon: void 0 },
              u.SpecialWarheadType.TntCharge,
            );
          }
        }),
          e("TntChargeTrait", n));
      },
    };
  },
);
