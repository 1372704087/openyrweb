// === Reconstructed SystemJS module: game/action/ToggleRepairAction ===
// deps: ["game/action/Action","data/DataStream","game/gameobject/trait/AutoRepairTrait","game/event/BuildingRepairStartEvent","game/action/ActionType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/ToggleRepairAction",
  [
    "game/action/Action",
    "data/DataStream",
    "game/gameobject/trait/AutoRepairTrait",
    "game/event/BuildingRepairStartEvent",
    "game/action/ActionType",
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
        ((o = class extends i.Action {
          constructor(e) {
            (super(n.ActionType.ToggleRepair), (this.game = e));
          }
          unserialize(e) {
            this.buildingId = new r.DataStream(e).readUint32();
          }
          serialize() {
            return new r.DataStream(4).writeUint32(this.buildingId).toUint8Array();
          }
          print() {
            return "Toggle repair " + this.buildingId;
          }
          process() {
            var e = this.player;
            if (this.game.getWorld().hasObjectId(this.buildingId)) {
              let t = this.game.getObjectById(this.buildingId);
              if (
                t.isBuilding() &&
                e === t.owner &&
                !t.isDestroyed &&
                t.rules.repairable &&
                t.rules.clickRepairable &&
                100 !== t.healthTrait.health
              ) {
                let e = t.traits.get(s.AutoRepairTrait);
                (e.setDisabled(!e.isDisabled()),
                  e.isDisabled() || this.game.events.dispatch(new a.BuildingRepairStartEvent(t)));
              }
            }
          }
        }),
          e("ToggleRepairAction", o));
      },
    };
  },
);
