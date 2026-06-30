// === Reconstructed SystemJS module: game/order/GatherOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/task/harvester/GatherOreTask","game/order/OrderFeedbackType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/GatherOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/task/harvester/GatherOreTask",
    "game/order/OrderFeedbackType",
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
        ((o = class extends i.Order {
          constructor(e) {
            (super(r.OrderType.Gather),
              (this.game = e),
              (this.targetOptional = !1),
              (this.feedbackType = n.OrderFeedbackType.Move));
          }
          getPointerType(e) {
            return e ? s.PointerType.AttackMini : s.PointerType.AttackNoRange;
          }
          isValid() {
            return (
              !(
                !this.sourceObject.isVehicle() ||
                !this.sourceObject.harvesterTrait ||
                this.sourceObject.moveTrait.isDisabled() ||
                this.game.mapShroudTrait
                  .getPlayerShroud(this.sourceObject.owner)
                  ?.isShrouded(this.target.tile, this.target.obj?.tileElevation)
              ) && this.target.isOre
            );
          }
          isAllowed() {
            return !0;
          }
          process() {
            return [new a.GatherOreTask(this.game, this.target.tile, !0)];
          }
        }),
          e("GatherOrder", o));
      },
    };
  },
);
