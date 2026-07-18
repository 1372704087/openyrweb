// === Reconstructed SystemJS module: game/gameobject/trait/GattlingTrait ===
// deps: ["game/gameobject/unit/VeteranLevel","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyAttack","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/AttackTrait","game/gameobject/task/AttackTask"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Gattling weapon escalation (YR). Attached to technos with IsGattling=yes.
//
// Vanilla YR behaviour:
//   - Weapons are arranged in (Stage*2) AG / (Stage*2+1) AA pairs.
//   - A firing timer increments by RateUp each tick while the unit is attacking and
//     decrements by RateDown each tick when idle.
//   - Stage X is active while the timer is between StageX-1 and StageX (or
//     EliteStageX for elite units). The last StageX value caps the timer.
//   - Stage changes swap the current AG + AA weapon pair via ArmedTrait.selectGattlingStage.

System.register(
  "game/gameobject/trait/GattlingTrait",
  [
    "game/gameobject/unit/VeteranLevel",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyAttack",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/AttackTrait",
  "game/gameobject/task/AttackTask",
  ],
  function (e, t) {
    "use strict";
    var r, i, n, a, o, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        var s;
        e(
          "GattlingTrait",
          (s = class {
            constructor(e) {
              (this.gameObject = e),
                (this.stage = 0),
                (this.timer = 0),
                (this.rateUp = e.rules.rateUp || 1),
                (this.rateDown = e.rules.rateDown || 1),
                (this.stageThresholds = e.rules.stageThresholds || []),
                (this.eliteStageThresholds = e.rules.eliteStageThresholds || []);
            }
            _isElite() {
              return this.gameObject.veteranLevel === r.VeteranLevel.Elite;
            }
            _getThresholds() {
              return this._isElite() ? this.eliteStageThresholds : this.stageThresholds;
            }
            _maxTimer() {
              var e = this._getThresholds();
              return 0 < e.length ? e[e.length - 1] : 0;
            }
            _computeStage() {
              var e = this._getThresholds(),
                t = 0;
              for (var i = 0; i < e.length; i++) {
                if (this.timer < e[i]) break;
                t = i;
              }
              return Math.min(t, Math.max(0, e.length - 1));
            }
            _updateWeapon(e, t) {
              var i = this.gameObject;
              i.armedTrait?.selectGattlingStage(this.stage, this._isElite());
              // OpenYRWeb: AttackTask captures its weapon at creation time. When the Gattling
              // stage advances we swap the ArmedTrait primary/secondary pair, but the running
              // AttackTask keeps firing the old Weapon instance, so stage 1/2 still play the
              // stage 0 sound and damage. Re-select the weapon for any active AttackTask so
              // the next shot uses the correct stage weapon.
              var r = i.unitOrderTrait?.getCurrentTask?.(),
                a;
              r instanceof l.AttackTask &&
                (a = i.attackTrait?.selectWeaponVersus(i, r.target, t, !!r.options.force, !!r.options.passive)) &&
                r.setWeapon(a);
              var s = i.attackTrait?.opportunityFireTask;
              s instanceof l.AttackTask &&
                s !== r &&
                (a = i.attackTrait?.selectWeaponVersus(i, s.target, t, !!s.options.force, !!s.options.passive)) &&
                s.setWeapon(a);
            }
            _stopAllWeaponFireSounds(e) {
              var t = e.__weaponFireSounds;
              if (t && t.length) {
                for (var i = 0; i < t.length; i++) try { t[i].isPlaying() && t[i].stop(); } catch (e) {}
                t.length = 0;
              }
              e.__weaponFireSound && e.__weaponFireSound.isPlaying() && (e.__weaponFireSound.stop(), (e.__weaponFireSound = void 0));
            }
            [n.NotifyAttack.onAttack](e, t, i) {
              // Warhead.inflictDamage notifies both the victim's and the attacker's
              // NotifyAttack traits. The third argument is the attacker, so only
              // advance the gattling timer when this unit is the one that fired.
              i === this.gameObject && (this.firedThisTick = !0);
            }
            [i.NotifyTick.onTick](e, t) {
              var i = this._getThresholds();
              if (!(0 < i.length)) return;
              var n = e.attackTrait && !e.attackTrait.isIdle();
              n || this.firedThisTick
                ? ((this.timer = Math.min(this._maxTimer(), this.timer + this.rateUp)),
                  (this.firedThisTick = !1))
                : (this.timer = Math.max(0, this.timer - this.rateDown));
              var r = this._computeStage();
              r !== this.stage &&
                ((this.stage = r),
                // Stop every active Report instance from the previous stage. Gattling weapons
                // can accumulate multiple overlapping handles during a fast burst; only stopping
                // __weaponFireSound leaves the older loops running, so stage 1/2/3 sounds overlap.
                this._stopAllWeaponFireSounds(e),
                this._updateWeapon(e, t));
              // Ensure the per-tick firing flag is always cleared, even if this tick did not
              // enter the timer-increase branch (e.g. unit went idle or the trait stops ticking).
              this.firedThisTick = !1;
            }
            [a.NotifyDestroy.onDestroy](e, t, i, r) {
              // If the unit is destroyed while firing, AttackTask.onEnd may not run in time.
              // Stop every tracked weapon sound immediately so the gattling loop doesn't
              // keep playing after the tank is gone.
              this._stopAllWeaponFireSounds(e);
            }
          }),
        );
      },
    };
  },
);
