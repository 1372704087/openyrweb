// === Reconstructed SystemJS module: game/gameobject/task/GarrisonBuildingTask ===
// deps: ["game/event/BuildingGarrisonEvent","game/gameobject/task/EnterBuildingTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/GarrisonBuildingTask",
  ["game/event/BuildingGarrisonEvent", "game/gameobject/task/EnterBuildingTask"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class extends r.EnterBuildingTask {
          isAllowed(e) {
            var t = this.target;
            if (t.isDestroyed || !t.garrisonTrait?.canBeOccupied()) return !1;
            if (t.garrisonTrait.units.length >= t.garrisonTrait.maxOccupants) return !1;
            if (t.garrisonTrait.units.length && t.garrisonTrait.units[0].owner !== e.owner) return !1;
            // OpenYRWeb: military buildings (isBaseDefense=yes, e.g. combat bunkers) cannot be garrisoned
            // by civilian infantry. Only player/ally-owned military buildings can be garrisoned.
            if (t.rules.isBaseDefense && t.owner === this.game.getCivilianPlayer()) return !1;
            // Non-military garrison buildings: allow entry if owned by civilian (to capture) or friendly.
            if (!t.garrisonTrait.units.length && !this.game.areFriendly(e, t) && t.owner !== this.game.getCivilianPlayer())
              return !1;
            return !e.mindControllableTrait?.isActive();
          }
          onEnter(e) {
            this.game.limboObject(e, {
              selected: !1,
              controlGroup: this.game.getUnitSelection().getOrCreateSelectionModel(e).getControlGroupNumber(),
            });
            let t = this.target.garrisonTrait;
            // OpenYRWeb: capturing a neutral garrisonable flips it to the entering infantry's owner.
            // Only capture if:
            // 1. Building is empty (no units)
            // 2. Building is owned by civilian player (neutral)
            // 3. Building is NOT a military structure (isBaseDefense=no)
            // Combat bunkers (isBaseDefense=yes) are military buildings and cannot be "captured".
            if (!t.units.length && this.target.owner === this.game.getCivilianPlayer() && !this.target.rules.isBaseDefense) {
              e.owner.buildingsCaptured++;
              this.game.changeObjectOwner(this.target, e.owner);
              this.target.wasCapturedFromCivilian = !0;
            }
            // OpenYRWeb: Bio Reactor (InfantryAbsorb=yes with bioReactorPowerTrait) has its own
            // EnterBioReactorSound and should not trigger the generic garrison sound/EVA.
            // Also only play sound when the building was empty (first occupant enters).
            if (!this.target.bioReactorPowerTrait && !t.units.length) {
              this.game.events.dispatch(new i.BuildingGarrisonEvent(this.target));
            }
            t.units.push(e);
          }
        }),
          e("GarrisonBuildingTask", s));
      },
    };
  },
);
