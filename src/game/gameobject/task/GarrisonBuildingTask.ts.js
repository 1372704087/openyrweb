// === Reconstructed SystemJS module: game/gameobject/task/GarrisonBuildingTask ===
// deps: ["game/event/BuildingGarrisonEvent","game/gameobject/task/EnterBuildingTask"]
//
// OpenYRWeb: GarrisonBuildingTask — standard garrison-building entry. Infantry walk to the
// building (EnterBuildingTask state machine: MovingNear → MovingIn via MoveInsideTask), then
// are limbo'd into garrisonTrait.units. InfantryAbsorb=yes buildings (bio reactor) no longer
// route here — they reuse the Battle Fortress transport entry (EnterTransportTask) instead —
// so this task only serves regular occupiable buildings (battle bunker, civilian houses).

System.register(
  "game/gameobject/task/GarrisonBuildingTask",
  ["game/event/BuildingGarrisonEvent", "game/gameobject/task/EnterBuildingTask"],
  function (e, t) {
    "use strict";
    var i, r, m;
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
        ((m = class extends r.EnterBuildingTask {
          isAllowed(e) {
            var t = this.target;
            if (t.isDestroyed || !t.garrisonTrait?.canBeOccupied()) return !1;
            if (t.garrisonTrait.units.length >= t.garrisonTrait.maxOccupants) return !1;
            if (t.garrisonTrait.units.length && t.garrisonTrait.units[0].owner !== e.owner) return !1;
            if (t.rules.isBaseDefense && t.owner === this.game.getCivilianPlayer()) return !1;
            if (!t.garrisonTrait.units.length && !this.game.areFriendly(e, t) && t.owner !== this.game.getCivilianPlayer())
              return !1;
            return !e.mindControllableTrait?.isActive();
          }
          onEnter(e) {
            if (e.mindControllableTrait?.isActive()) e.mindControllableTrait.restore(this.game);
            this.game.limboObject(e, {
              selected: !1,
              controlGroup: this.game.getUnitSelection().getOrCreateSelectionModel(e).getControlGroupNumber(),
            });
            let t = this.target.garrisonTrait;
            if (!t.units.length && this.target.owner === this.game.getCivilianPlayer() && !this.target.rules.isBaseDefense) {
              e.owner.buildingsCaptured++;
              this.game.changeObjectOwner(this.target, e.owner);
              this.target.wasCapturedFromCivilian = !0;
            }
            if (!t.units.length) {
              this.game.events.dispatch(new i.BuildingGarrisonEvent(this.target));
            }
            t.units.push(e);
            // OpenYRWeb: back-reference so the occupant's weapon can apply garrison bonuses
            // (OccupyWeaponRange / OccupyDamageMultiplier / OccupyROFMultiplier) while inside
            // (see Weapon.get range / get rof / fire). Cleared on evacuation/destruction.
            (e.garrisonedAt = this.target);
          }
        }),
          e("GarrisonBuildingTask", m));
      },
    };
  },
);
