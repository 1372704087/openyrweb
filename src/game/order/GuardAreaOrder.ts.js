// === Reconstructed SystemJS module: game/order/GuardAreaOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/task/system/CallbackTask","game/gameobject/task/move/MoveTask","game/order/OrderFeedbackType","game/gameobject/trait/MoveTrait","game/gameobject/task/harvester/GatherOreTask","game/gameobject/task/harvester/ReturnOreTask"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/GuardAreaOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/move/MoveTask",
    "game/order/OrderFeedbackType",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/task/harvester/GatherOreTask",
    "game/gameobject/task/harvester/ReturnOreTask",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u;
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
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        ((u = class extends i.Order {
          constructor(e, t) {
            (super(t ? r.OrderType.GuardArea : r.OrderType.Guard),
              (this.game = e),
              (this.targeted = t),
              (this.getPointerType = (e) =>
                e
                  ? this.isAllowed()
                    ? s.PointerType.GuardMini
                    : s.PointerType.NoActionMini
                  : this.isAllowed()
                    ? s.PointerType.Guard
                    : s.PointerType.NoMove),
              (this.terminal = !0),
              (this.targetOptional = !t),
              (this.minimapAllowed = t),
              (this.feedbackType = t ? o.OrderFeedbackType.Move : o.OrderFeedbackType.None));
          }
          isValid() {
            return (
              this.sourceObject.isUnit() &&
              (!!this.targetOptional || !this.sourceObject.moveTrait.isDisabled()) &&
              !(
                this.target &&
                this.game.mapShroudTrait
                  .getPlayerShroud(this.sourceObject.owner)
                  ?.isShrouded(this.target.tile, this.target.obj?.tileElevation) &&
                !this.sourceObject.rules.moveToShroud
              )
            );
          }
          isAllowed() {
            return !0;
          }
          process() {
            let t = this.targeted ? this.target.tile : void 0;
            const e = this.sourceObject;
            let i = [];
            return (
              t &&
                i.push(
                  new n.MoveTask(this.game, t, !!this.target.getBridge(), {
                    closeEnoughTiles: this.game.rules.general.closeEnough,
                  }),
                ),
              e.isVehicle() && e.harvesterTrait
                ? i.push(
                    new a.CallbackTask(() => (e.harvesterTrait.lastOreSite = void 0)),
                    e.harvesterTrait.isFull()
                      ? new h.ReturnOreTask(this.game, void 0, void 0, !0)
                      : new c.GatherOreTask(this.game, void 0, !0),
                  )
                : i.push(
                    new a.CallbackTask((e) => {
                      (t &&
                        ![l.MoveResult.Success, l.MoveResult.CloseEnough].includes(
                          this.sourceObject.moveTrait?.lastMoveResult,
                        )) ||
                        (this.sourceObject.guardMode = !0);
                    }),
                  ),
              i
            );
          }
        }),
          e("GuardAreaOrder", u));
      },
    };
  },
);
