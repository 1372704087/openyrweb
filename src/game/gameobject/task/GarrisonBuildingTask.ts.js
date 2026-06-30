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
            return (
              !this.target.isDestroyed &&
              !!this.target.garrisonTrait?.canBeOccupied() &&
              this.target.garrisonTrait.units.length < this.target.garrisonTrait.maxOccupants &&
              !(this.target.garrisonTrait.units.length && this.target.garrisonTrait.units[0].owner !== e.owner) &&
              !e.mindControllableTrait?.isActive()
            );
          }
          onEnter(e) {
            this.game.limboObject(e, {
              selected: !1,
              controlGroup: this.game.getUnitSelection().getOrCreateSelectionModel(e).getControlGroupNumber(),
            });
            let t = this.target.garrisonTrait;
            // OpenYRWeb: capturing a neutral garrisonable (Battle Bunker) flips it to the entering
            // infantry's owner. A player-built absorber (Bio Reactor, carries bioReactorPowerTrait)
            // already belongs to its builder and must not be "captured" / counted as a capture.
            (t.units.length ||
              !!this.target.bioReactorPowerTrait ||
              (e.owner.buildingsCaptured++,
              this.game.changeObjectOwner(this.target, e.owner),
              this.game.events.dispatch(new i.BuildingGarrisonEvent(this.target))),
              t.units.push(e));
          }
        }),
          e("GarrisonBuildingTask", s));
      },
    };
  },
);
