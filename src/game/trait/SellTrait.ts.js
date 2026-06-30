// === Reconstructed SystemJS module: game/trait/SellTrait ===
// deps: ["game/event/ObjectSellEvent","game/gameobject/trait/interface/NotifySell"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/SellTrait",
  ["game/event/ObjectSellEvent", "game/gameobject/trait/interface/NotifySell"],
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
        e(
          "SellTrait",
          (s = class {
            constructor(e, t) {
              ((this.game = e), (this.generalRules = t));
            }
            sell(t) {
              if (!t.isBuilding() || !t.rules.unsellable) {
                let e = this.computeRefundValue(t);
                e &&
                  (t.rules.wall && (e = 0),
                  t.traits.filter(r.NotifySell).forEach((e) => {
                    e[r.NotifySell.onSell](t, this.game);
                  }),
                  t.isBuilding()
                    ? this.game.getConstructionWorker(t.owner).unplace(t, () => this.afterObjectUnspawned(t, e))
                    : (this.game.unspawnObject(t), this.afterObjectUnspawned(t, e)));
              }
            }
            afterObjectUnspawned(e, t) {
              ((e.owner.credits += t), this.game.events.dispatch(new i.ObjectSellEvent(e)), e.dispose());
            }
            computeRefundValue(e) {
              let t = 0;
              return (
                0 < e.rules.soylent
                  ? (t = e.rules.soylent)
                  : e.rules.cost &&
                    ((t = e.purchaseValue), e.owner.isAi || (t = Math.floor(t * this.generalRules.refundPercent))),
                t
              );
            }
            computePurchaseValue(e, t) {
              return e.cost;
            }
            dispose() {
              this.game = void 0;
            }
          }),
        );
      },
    };
  },
);
