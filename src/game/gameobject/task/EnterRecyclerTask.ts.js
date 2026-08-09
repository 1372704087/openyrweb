// === Reconstructed SystemJS module: game/gameobject/task/EnterRecyclerTask ===
// deps: ["game/gameobject/Building","game/type/LocomotorType","game/type/MovementZone","game/event/UnitRecycleEvent","game/gameobject/task/EnterBuildingTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/EnterRecyclerTask",
  [
    "game/gameobject/Building",
    "game/type/LocomotorType",
    "game/type/MovementZone",
    "game/event/UnitRecycleEvent",
    "game/gameobject/task/EnterBuildingTask",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o;
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
      ],
      execute: function () {
        ((o = class extends n.EnterBuildingTask {
          isAllowed(e) {
            return (
              e.rules.movementZone !== s.MovementZone.Fly &&
              e.rules.locomotor !== r.LocomotorType.Chrono &&
              !e.rules.engineer &&
              0 < this.game.sellTrait.computeRefundValue(e) &&
              ((e.isInfantry() && this.target.rules.cloning) || this.target.rules.grinding) &&
              !this.target.isDestroyed &&
              this.target.buildStatus === i.BuildStatus.Ready &&
              e.owner === this.target.owner
            );
          }
          onEnter(e) {
            var g = this.game;
            // OpenYRWeb: trigger the grinder's SpecialAnim (grind animation) — the building
            // renderable plays it while this counter is > 0 (decremented in Building.update).
            // The counter is a generous safety net: a one-shot grind anim normally ends the
            // grind itself (SPECIAL_GRIND → IDLE when it stops), so 600 ticks ≈ 10s only
            // bounds looping grind anims.
            this.target._grindingAnimTicks = 600;
            // OpenYRWeb: a transport sent to the Grinder destroys AND recycles all units
            // within it (vanilla YR: passengers die with the transport and refund their
            // Soylent too). Passengers are limbo'd, so refund them directly and destroy.
            if (e.transportTrait && e.transportTrait.units.length) {
              for (var p of e.transportTrait.units.slice()) {
                (p.transport = void 0),
                  (p.garrisonedAt = void 0),
                  (this.target.owner.credits += g.sellTrait.computeRefundValue(p)),
                  g.destroyObject(p, { player: p.owner });
              }
              e.transportTrait.units.length = 0;
            }
            // OpenYRWeb: the refund must go to the GRINDER's owner, not the unit's own owner —
            // unspawning a mind-controlled unit reverts it to its original owner
            // (MindControllableTrait.onUnspawn), which would otherwise pay the enemy. Unspawn
            // (not destroy) also avoids death anims/crew escape, matching vanilla grinding.
            this.target.owner.credits += g.sellTrait.computeRefundValue(e);
            g.unspawnObject(e);
            g.events.dispatch(new a.UnitRecycleEvent(e));
            e.dispose();
          }
        }),
          e("EnterRecyclerTask", o));
      },
    };
  },
);
