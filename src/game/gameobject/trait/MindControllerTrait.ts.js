// === Reconstructed SystemJS module: game/gameobject/trait/MindControllerTrait ===
// deps: ["game/gameobject/trait/interface/NotifyUnspawn","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Mind controller (Yuri Mastermind / Yuri X). Holds up to `maxCapacity`
// controlled targets. Vanilla YR Mastermind: capacity 3 (hardcoded; we expose via
// MindControlCap=, default 3 here to match the cookgreen OpenRA mod `mind: Capacity: 3`),
// and does NOT evict on overflow — instead the controller takes escalating self-damage
// ("brain overload") when controlling more than its safe cap.
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
// `overloadEnabled` gates the self-damage loop so normal Yuri infantry (cap 1, no
// MindControlOverload=yes) are unaffected even if their cap were exceeded.

System.register(
  "game/gameobject/trait/MindControllerTrait",
  ["game/gameobject/trait/interface/NotifyUnspawn", "game/gameobject/trait/interface/NotifyTick"],
  function (e, t) {
    "use strict";
    var i, k;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          k = e;
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
              // OpenYRWeb: `>=` (not `===`). Once over cap, the AI must STILL stop acquiring so
              // overload damage can ramp; with `===` an over-cap controller resumed firing and
              // stacked targets indefinitely. Vanilla blocks acquisition while count >= cap.
              return this.targets.length >= this.maxCapacity;
            }
            getTargets() {
              return this.targets;
            }
            // OpenYRWeb: do NOT evict on overflow. Beyond-capacity is handled by the
            // brain-overload self-damage in NotifyTick below (vanilla YR behaviour).
            control(e, t) {
              if (!this.gameObject) throw new Error("Trait already disposed");
              if (!e.mindControllableTrait) throw new Error(`Target "${e.name}" cannot be mind controlled`);
              if (e.isDisposed) throw new Error(`Target "${e.name}" is disposed`);
              ((e.mindControllableTrait.controlBy(this.gameObject, t), this.targets.push(e)));
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
              var n = this.targets.length;
              if (n <= this.maxCapacity) {
                this._overloadTicks = 0;
                return;
              }
              // OpenYRWeb: cookgreen alignment — -5% of MAX HP every tick while over cap.
              var h = this.gameObject.healthTrait;
              if (h) {
                var dmg = Math.max(1, Math.round(h.maxHitPoints * 0.05));
                // attackerInfo = { obj: void 0 } => no enemy credited (self-overload).
                h.inflictDamage(dmg, { obj: void 0 }, t);
                if (h.getHitPoints() <= 0 && !this.gameObject.isDestroyed) {
                  // destroyObject(undefined attacker) skips score bookkeeping (!i branch).
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
