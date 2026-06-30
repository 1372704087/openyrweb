// === Reconstructed SystemJS module: game/action/SellObjectAction ===
// deps: ["game/action/Action","data/DataStream","game/gameobject/Building","game/action/ActionType","game/gameobject/trait/DockableTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/SellObjectAction",
  [
    "game/action/Action",
    "data/DataStream",
    "game/gameobject/Building",
    "game/action/ActionType",
    "game/gameobject/trait/DockableTrait",
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
            (super(a.ActionType.SellObject), (this.game = e));
          }
          unserialize(e) {
            this.objectId = new r.DataStream(e).readUint32();
          }
          serialize() {
            return new r.DataStream(4).writeUint32(this.objectId).toUint8Array();
          }
          print() {
            return "Sell object " + this.objectId;
          }
          process() {
            var t = this.player;
            if (this.game.getWorld().hasObjectId(this.objectId)) {
              let e = this.game.getObjectById(this.objectId);
              e.isTechno() &&
                t === e.owner &&
                e.isSpawned &&
                (e.isBuilding()
                  ? e.buildStatus === s.BuildStatus.Ready && !e.warpedOutTrait.isActive()
                  : e.traits.find(n.DockableTrait)?.dock?.rules.unitSell) &&
                this.game.sellTrait.sell(e);
            }
          }
        }),
          e("SellObjectAction", o));
      },
    };
  },
);
