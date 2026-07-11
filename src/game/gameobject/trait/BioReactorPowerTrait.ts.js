// === Reconstructed SystemJS module: game/gameobject/trait/BioReactorPowerTrait ===
// deps: ["game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifyUnspawn","game/event/PowerChangeEvent","game/trait/interface/NotifyPower","game/gameobject/trait/interface/NotifyOwnerChange"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Bio Reactor (YAPOWR, Yuri faction) power scaling. A building with ExtraPower= and
// InfantryAbsorb=yes gains ExtraPower output per garrisoned infantry (vanilla YR: Bio Reactor =
// 150 base + 100/infantry, up to Passengers=5 → 650 max). The base Power scales with building
// health exactly like every other power plant.
//
// OWNERSHIP MODEL (single source of truth):
// This trait OWNS the Bio Reactor's ENTIRE power entry in the player's PowerTrait (both the base
// Power scaled by health AND the occupants*ExtraPower bonus). The game-level PowerTrait is patched
// to SKIP any techno carrying this trait (see PowerTrait._ownedByBioReactor), so there is exactly
// one owner — no desync, no double-count, no leak. We recompute the true total each tick and on
// health change, push the delta into powerTrait.power + powerByObject, and fire the same
// notifications updateFrom does (NotifyPower traits + PowerChangeEvent) so the HUD/sidebar refresh.
//
// Invariant: powerTrait.power always includes exactly
//   ceil(Power * health%) + occupants * ExtraPower
// for this building. First garrison → +ExtraPower. Evac → −ExtraPower. Damage → re-scales base.
// Sell/destroy → entire entry removed.

System.register(
  "game/gameobject/trait/BioReactorPowerTrait",
  [
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifyUnspawn",
    "game/event/PowerChangeEvent",
    "game/trait/interface/NotifyPower",
    "game/gameobject/trait/interface/NotifyOwnerChange",
  ],
  function (e, t) {
    "use strict";
    var n, i, d, r, c, p, oc;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          oc = e;
        },
      ],
      execute: function () {
        var o;
        e(
          "BioReactorPowerTrait",
          (o = class {
            constructor() {
              // total power currently registered for this building in the player's pool
              this.registered = 0;
              this.added = !1;
            }
            // true output: base Power scaled by health + occupants*ExtraPower (mirrors vanilla YR).
            _currentTotal(e) {
              var t = Math.ceil(((e.rules.power || 0) * (e.healthTrait ? e.healthTrait.health : 100)) / 100),
                i = e.garrisonTrait ? e.garrisonTrait.units.length : 0;
              return t + Math.round(i * (e.rules.extraPower || 0));
            }
            // push (newTotal - registered) into the player's pool + bookkeeping, then notify.
            _reconcile(e, t) {
              var i = this._currentTotal(e);
              if (i === this.registered && this.added) return;
              var r = e.owner.powerTrait;
              if (!r) return;
              if (!this.added) {
                // first registration (spawn): install the entry
                r.powerByObject.set(e, i), (r.power += i), (this.added = !0);
              } else {
                var a = r.powerByObject.get(e);
                void 0 !== a ? r.powerByObject.set(e, i) : r.powerByObject.set(e, i),
                  (r.power += i - this.registered);
              }
              this.registered = i;
              r.updateLevel(t);
              t.traits.filter(p.NotifyPower).forEach(function (e) {
                e[p.NotifyPower.onPowerChange](r.player, t);
              });
              t.events.dispatch(new c.PowerChangeEvent(r.player, r.power, r.drain));
            }
            _remove(e, t) {
              if (!this.added) return;
              var i = e.owner.powerTrait;
              if (i) {
                var r = i.powerByObject.get(e);
                (i.power -= this.registered), i.powerByObject.delete(e);
                (this.registered = 0), (this.added = !1);
                i.updateLevel(t);
                t.traits.filter(p.NotifyPower).forEach(function (e) {
                  e[p.NotifyPower.onPowerChange](i.player, t);
                });
                t.events.dispatch(new c.PowerChangeEvent(i.player, i.power, i.drain));
              }
            }
            [n.NotifySpawn.onSpawn](e, t) {
              ((this.registered = 0), (this.added = !1), t.afterTick(() => this._reconcile(e, t)));
            }
            [i.NotifyTick.onTick](e, t) {
              this._reconcile(e, t);
            }
            // re-scale the base on damage (health changed)
            [d.NotifyDamage.onDamage](e, t) {
              t.afterTick(() => this._reconcile(e, t));
            }
            [r.NotifyUnspawn.onUnspawn](e, t) {
              this._remove(e, t);
            }
            [oc.NotifyOwnerChange.onChange](e, t, i) {
              // e = building, t = oldOwner, i = game
              // When Bio Reactor changes owner (e.g. engineer capture), remove power from old owner
              // and reset so _reconcile re-registers under the new owner on next tick.
              if (!this.added) return;
              var r = t.powerTrait;
              if (r) {
                r.power -= this.registered;
                r.powerByObject.delete(e);
                r.updateLevel(i);
                i.traits.filter(p.NotifyPower).forEach(function (e) {
                  e[p.NotifyPower.onPowerChange](r.player, i);
                });
                i.events.dispatch(new c.PowerChangeEvent(r.player, r.power, r.drain));
              }
              this.registered = 0;
              this.added = !1;
            }
          }),
        );
      },
    };
  },
);
