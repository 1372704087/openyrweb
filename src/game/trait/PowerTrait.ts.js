// === Reconstructed SystemJS module: game/trait/PowerTrait ===
// deps: ["game/trait/interface/NotifySpawn","game/trait/interface/NotifyHealthChange","game/trait/interface/NotifyUnspawn","game/trait/interface/NotifyOwnerChange","game/trait/interface/NotifyWarpChange","game/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/PowerTrait",
  [
    "game/trait/interface/NotifySpawn",
    "game/trait/interface/NotifyHealthChange",
    "game/trait/interface/NotifyUnspawn",
    "game/trait/interface/NotifyOwnerChange",
    "game/trait/interface/NotifyWarpChange",
    "game/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
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
      ],
      execute: function () {
        ((l = class {
          // OpenYRWeb: a building with a BioReactorPowerTrait (ExtraPower= + InfantryAbsorb=yes,
          // e.g. Yuri Bio Reactor) has its FULL power output — base Power scaled by health PLUS the
          // per-garrison ExtraPower bonus — owned and reconciled by that trait. The base-game logic
          // below must NOT also add/update/remove the base slice, or the two owners desync (the
          // health-change "update" would recompute from rules.power alone, wiping the garrison bonus
          // and leaving a stale bookkeeping entry — which is what caused the infinite-power-on-evac
          // bug). So we skip any techno that carries bioReactorPowerTrait.
          _ownedByBioReactor(e) {
            return !!e.bioReactorPowerTrait;
          }
          [i.NotifySpawn.onSpawn](e, t) {
            e.isTechno() &&
              e.rules.power &&
              !this._ownedByBioReactor(e) &&
              !this.isCapturablePower(e, e.owner) &&
              e.owner.powerTrait?.updateFrom(e, "add", t);
          }
          [s.NotifyUnspawn.onUnspawn](e, t) {
            e.isTechno() &&
              e.rules.power &&
              !e.warpedOutTrait.isActive() &&
              !this._ownedByBioReactor(e) &&
              !this.isCapturablePower(e, e.owner) &&
              e.owner.powerTrait?.updateFrom(e, "remove", t);
          }
          [r.NotifyHealthChange.onChange](e, t) {
            e.isTechno() &&
              e.rules.power &&
              !e.warpedOutTrait.isActive() &&
              !this._ownedByBioReactor(e) &&
              !this.isCapturablePower(e, e.owner) &&
              e.owner.powerTrait?.updateFrom(e, "update", t);
          }
          [a.NotifyOwnerChange.onChange](e, t, i) {
            if (this._ownedByBioReactor(e)) {
              // Bio reactor ownership transfer: defer to the trait (it re-reconciles on tick).
              return;
            }
            e.rules.power &&
              !e.warpedOutTrait.isActive() &&
              (this.isCapturablePower(e, t) || t.powerTrait?.updateFrom(e, "remove", i),
              this.isCapturablePower(e, e.owner) || e.owner.powerTrait?.updateFrom(e, "add", i));
          }
          [n.NotifyWarpChange.onChange](e, t, i) {
            if (this._ownedByBioReactor(e)) return;
            e.rules.power &&
              !this.isCapturablePower(e, e.owner) &&
              e.owner.powerTrait?.updateFrom(e, i ? "remove" : "add", t);
          }
          [o.NotifyTick.onTick](e) {
            for (var t of e.getCombatants()) t.powerTrait.updateBlackout(e);
          }
          isCapturablePower(e, t) {
            return 0 < e.rules.power && t.isNeutral && e.rules.needsEngineer;
          }
        }),
          e("PowerTrait", l));
      },
    };
  },
);
