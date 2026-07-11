// === Reconstructed SystemJS module: game/gameobject/task/GarrisonBuildingTask ===
// deps: ["game/event/BuildingGarrisonEvent","game/gameobject/task/EnterBuildingTask","game/event/EnterObjectEvent","game/gameobject/task/move/MoveNextToTask","game/gameobject/task/move/MoveTask"]
//
// OpenYRWeb: GarrisonBuildingTask with explicit rally-point queue state machine.
//
// Phases:
//   MoveToRallyPoint (0) — all infantry pathfind to a rally tile on the front (SE) edge
//     of the bio reactor building first. No one enters until everyone is at the front.
//   WaitForTurn (1) — infantry wait at their rally tile, polling the FIFO queue
//     maintained by InfantryAbsorbTrait. Only the head-of-queue unit gets the mutex.
//   Entering (2) — the unit with the mutex delegates to EnterBuildingTask's standard
//     state machine (MoveInsideTask → onEnter), which walks the unit into the building.

System.register(
  "game/gameobject/task/GarrisonBuildingTask",
  ["game/event/BuildingGarrisonEvent", "game/gameobject/task/EnterBuildingTask", "game/event/EnterObjectEvent", "game/gameobject/task/move/MoveNextToTask", "game/gameobject/task/move/MoveTask"],
  function (e, t) {
    "use strict";
    var i, r, a, n, o, m, d;
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
        var q;
        // Internal state enum for bio-reactor rally-point queueing
        (((q = d = d || {})[(q.MoveToRallyPoint = 0)] = "MoveToRallyPoint"),
          (q[(q.WaitForTurn = 1)] = "WaitForTurn"),
          (q[(q.Entering = 2)] = "Entering"));

        ((m = class extends r.EnterBuildingTask {
          constructor(e, t, i = 0) {
            super(e, t, i);
            this._bioDone = !1;
            // Bio reactor: use an explicit rally-point state machine that runs BEFORE
            // EnterBuildingTask's own state machine. Non-bio buildings fall through
            // to the parent's onTick immediately.
            this._queueState = d.MoveToRallyPoint;
          }
          isAllowed(e) {
            var t = this.target;
            if (t.isDestroyed || !t.garrisonTrait?.canBeOccupied()) return !1;
            if (t.garrisonTrait.units.length >= t.garrisonTrait.maxOccupants) return !1;
            if (t.garrisonTrait.units.length && t.garrisonTrait.units[0].owner !== e.owner) return !1;
            if (t.rules.isBaseDefense && t.owner === this.game.getCivilianPlayer()) return !1;
            if (t.rules.infantryAbsorb && t.owner === this.game.getCivilianPlayer()) return !1;
            if (!t.garrisonTrait.units.length && !this.game.areFriendly(e, t) && t.owner !== this.game.getCivilianPlayer())
              return !1;
            return !e.mindControllableTrait?.isActive();
          }
          onStart(e) {
            // Bio reactor: register into the FIFO entry queue.
            // The queue order determines who enters first after everyone gathers.
            if (this.target.rules.infantryAbsorb) {
              this.target.garrisonTrait.registerEntry(this, e);
            }
            super.onStart(e);
          }
          onTick(e) {
            if (!this.target.rules.infantryAbsorb) return super.onTick(e);
            if (this._bioDone) return !0;
            if (this.isCancelling()) return super.onTick(e);
            if (this.target.isDestroyed) return !0;

            var garrison = this.target.garrisonTrait;

            // ── Phase 1: MoveToRallyPoint ──
            // All infantry pathfind to a specific rally tile on the front (SE) edge.
            // Using a plain MoveTask (not MoveNextToTask) so the unit must actually
            // reach the SE tile instead of stopping on a "close enough" back-side tile.
            if (this._queueState === d.MoveToRallyPoint) {
              if (!this.children.length) {
                var rallyTile = n.MoveNextToTask.chooseTargetFoundationTile(this.target, this.game);
                this.children.push(new o.MoveTask(this.game, rallyTile, !1, {
                  ignoredBlockers: [this.target],
                  closeEnoughTiles: Math.SQRT2,
                  strictCloseEnough: !0,
                }));
              }
              this._queueState = d.WaitForTurn;
              return !1;
            }

            // ── Phase 2: WaitForTurn ──
            // Unit is at the rally point; poll the FIFO queue until it's our turn.
            if (this._queueState === d.WaitForTurn) {
              if (this.children.length) return !1; // still walking to rally point
              if (!garrison.unitMayEnterNow(this, e)) return !1; // not our turn yet
              this._queueState = d.Entering;
              // Fall through to Entering phase
            }

            // ── Phase 3: Entering ──
            // We hold the mutex; delegate to EnterBuildingTask's standard state machine.
            // enterDelaySeconds=0 → Initial → MovingIn (MoveInsideTask) → onEnter.
            return super.onTick(e);
          }
          onEnter(e) {
            this._bioDone = !0;
            if (e.mindControllableTrait?.isActive()) e.mindControllableTrait.restore(this.game);
            this.game.limboObject(e, {
              selected: !1,
              controlGroup: this.game.getUnitSelection().getOrCreateSelectionModel(e).getControlGroupNumber(),
            });
            let t = this.target.garrisonTrait;
            if (!t.units.length && this.target.owner === this.game.getCivilianPlayer() && !this.target.rules.isBaseDefense && !this.target.rules.infantryAbsorb) {
              e.owner.buildingsCaptured++;
              this.game.changeObjectOwner(this.target, e.owner);
              this.target.wasCapturedFromCivilian = !0;
            }
            if (this.target.bioReactorPowerTrait || !t.units.length) {
              this.game.events.dispatch(new i.BuildingGarrisonEvent(this.target));
            }
            t.units.push(e);
            if (this.target.rules.infantryAbsorb) this.target.garrisonTrait.onUnitEnteredBio(this);
          }
          onEnd(e) {
            if (this.target.rules.infantryAbsorb && !this._bioDone) {
              this.target.garrisonTrait.onUnitAbortedEntry(this, e);
            }
            super.onEnd(e);
          }
        }),
          e("GarrisonBuildingTask", m));
      },
    };
  },
);
