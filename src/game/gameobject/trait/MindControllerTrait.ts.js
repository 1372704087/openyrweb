// === Reconstructed SystemJS module: game/gameobject/trait/MindControllerTrait ===
// deps: ["game/gameobject/trait/interface/NotifyUnspawn","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Mind controller (Yuri Clone / Yuri X / Mastermind). Holds `maxCapacity` as the
// "safe" cap. Vanilla YR Mastermind: no hard cap — it can exceed `maxCapacity` but takes
// escalating self-damage ("brain overload") when over cap. Normal cap-1 controllers
// (Yuri Clone / Yuri X) release the oldest controlled target and take the new one when
// ordered to switch.
//
// Overload self-damage aligns with the cookgreen OpenRA mod:
//   `SelfHealing@Overload: PercentageStep: -5` => the controller loses 5% of its MAX HP
//   every tick while over capacity. When HP reaches 0 it is destroyed via
//   game.destroyObject, whose NotifyUnspawn path (below) restores every controlled target
//   to its original owner.
//
// Release conditions (vanilla YR): the controller unspawns (dies/sold/captured), OR is
// chrono'd (Temporal/warped-out), OR is iron-curtained (invulnerable). All three release
// the controlled targets back to their previous owner.
//
// `overloadEnabled` gates the self-damage loop and blocks target switching so Mastermind
// overloads instead of replacing controlled units.

System.register(
  "game/gameobject/trait/MindControllerTrait",
  [
    "game/gameobject/trait/interface/NotifyUnspawn",
    "game/gameobject/trait/interface/NotifyTick",
    "game/GameSpeed",
  ],
  function (e, t) {
    "use strict";
    var i, k, GS;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          GS = e;
        },
      ],
      execute: function () {
        var r;
        e(
          "MindControllerTrait",
          (r = class {
            constructor(e, t = 1, overloadEnabled = !1) {
              ((this.gameObject = e),
                (this.maxCapacity = t),
                (this.overloadEnabled = !!overloadEnabled),
                (this.targets = []),
                // overload accumulator (frames since last self-damage tick)
                (this._overloadTicks = 0));
            }
            isActive() {
              return 0 < this.targets.length;
            }
            isAtCapacity() {
              // OpenYRWeb: overload-enabled controllers (Mastermind) have no hard cap;
              // they can always acquire more targets beyond maxCapacity (but take self-damage).
              if (this.overloadEnabled) return !1;
              return this.targets.length >= this.maxCapacity;
            }
            getTargets() {
              return this.targets;
            }
            control(e, t) {
              if (!this.gameObject) throw new Error("Trait already disposed");
              if (!e.mindControllableTrait) throw new Error(`Target "${e.name}" cannot be mind controlled`);
              if (e.isDisposed) throw new Error(`Target "${e.name}" is disposed`);
              // OpenYRWeb: overload-enabled controllers (Mastermind) have no hard cap;
              // they can exceed maxCapacity but take self-damage via onTick.
              if (!this.overloadEnabled && this.targets.length >= this.maxCapacity) {
                // OpenYRWeb: vanilla YR cap-1 controllers (Yuri Clone / Yuri X) release the
                // oldest controlled target and take the new one when ordered to switch.
                var i = this.targets.shift();
                i && i.mindControllableTrait && i.mindControllableTrait.restore(t);
              }
              ((e.mindControllableTrait.controlBy(this.gameObject, t), this.targets.push(e)));
              // OpenYRWeb: draw the mind-control attack line for MindControlAttackLineFrames
              // regardless of selection state (vanilla YR [CombatDamage]).
              var frames = t.rules.combatDamage.mindControlAttackLineFrames;
              frames > 0 &&
                (e._mindControlAttackLineEnd = performance.now() + (frames * 1000) / GS.GameSpeed.BASE_TICKS_PER_SECOND);
            }
            cleanTarget(e) {
              var t = this.targets.indexOf(e);
              -1 !== t && this.targets.splice(t, 1);
            }
            // OpenYRWeb: brain overload + chrono/iron-curtain release. The self-damage only runs
            // when `overloadEnabled` is set (INI `MindControlOverload=yes`), so vanilla cap-1
            // Yuri units never take this damage. Aligns with cookgreen OpenRA mod's
            // `SelfHealing@Overload: PercentageStep: -5` (lose 5% MAX HP per tick over cap).
            // Additionally, if the controller is chrono'd (Temporal/warped-out) or
            // iron-curtained (invulnerable), ALL links release immediately (vanilla YR).
            [k.NotifyTick.onTick](e, t) {
              if (!this.gameObject || this.gameObject.isDisposed || this.gameObject.isDestroyed) return;
              // Release links if the controller is chrono'd or iron-curtained.
              if (this.targets.length) {
                try {
                  if (
                    (this.gameObject.warpedOutTrait && this.gameObject.warpedOutTrait.isActive()) ||
                    (this.gameObject.invulnerableTrait && this.gameObject.invulnerableTrait.isActive())
                  ) {
                    for (var rel of this.targets) rel.mindControllableTrait.restore(t);
                    this.targets.length = 0;
                    return;
                  }
                } catch (err) {}
              }
              if (!this.overloadEnabled) return;
              var n = this.targets.length,
                o = t.rules.combatDamage,
                l = o.overloadCount,
                c = 0;
              for (; c < l.length && !(n <= l[c]); c++);
              c >= l.length && (c = l.length - 1);
              var d = o.overloadDamage[c] || 0,
                f = o.overloadFrames[c] || 1;
              if (d <= 0) {
                this._overloadTicks = 0;
                return;
              }
              this._overloadTicks = (this._overloadTicks || 0) + 1;
              if (this._overloadTicks < f) return;
              this._overloadTicks = 0;
              var h = this.gameObject.healthTrait;
              if (h) {
                // OpenYRWeb: inflictDamage dispatches InflictDamageEvent which triggers parasite
                // white sparks (via ParasiteSparkFxHandler) and other damage visuals.
                h.inflictDamage(d, { obj: this.gameObject }, t);
                // OpenYRWeb: parasite-style rocking (Terror Drone shaking effect).
                typeof this.gameObject.applyRocking === "function" &&
                  this.gameObject.applyRocking(90 * (t.generateRandom() < 0.5 ? 1 : -1), 1);
                if (h.getHitPoints() <= 0 && !this.gameObject.isDestroyed) {
                  // destroyObject(undefined attacker) skips score bookkeeping (!i branch).
                  // OpenYRWeb: flag so SoundHandler can play MasterMindOverloadDeathSound.
                  this.gameObject._mindOverloadDeath = !0;
                  t.destroyObject(this.gameObject, void 0);
                }
              }
            }
            [i.NotifyUnspawn.onUnspawn](e, t) {
              for (var i of this.targets) i.mindControllableTrait.restore(t);
              this.targets.length = 0;
            }
            dispose() {
              this.gameObject = void 0;
            }
          }),
        );
      },
    };
  },
);
