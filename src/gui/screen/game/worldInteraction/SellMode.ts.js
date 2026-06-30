// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/SellMode ===
// deps: ["engine/type/PointerType","util/event","game/gameobject/Building","game/gameobject/trait/DockableTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/SellMode",
  ["engine/type/PointerType", "util/event", "game/gameobject/Building", "game/gameobject/trait/DockableTrait"],
  function (e, t) {
    "use strict";
    var a, n, i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e(
          "SellMode",
          (s = class {
            get onExecute() {
              return this._onExecute.asEvent();
            }
            static factory(e, t, i, r, s) {
              return new this(e, t, i, r, s);
            }
            constructor(e, t, i, r, s) {
              ((this.game = e),
                (this.player = t),
                (this.sidebarModel = i),
                (this.pointer = r),
                (this.renderer = s),
                (this._onExecute = new n.EventDispatcher()),
                (this.onFrame = (e) => {
                  if (
                    this.lastHover?.tile !== this.currentHover?.tile ||
                    this.lastHover?.gameObject !== this.currentHover?.gameObject ||
                    !this.lastUpdate ||
                    e - this.lastUpdate >= 1e3 / 15
                  ) {
                    ((this.lastHover = this.currentHover), (this.lastUpdate = e));
                    let t = a.PointerType.Default;
                    if (this.currentHover?.tile) {
                      let e = this.currentHover.gameObject;
                      t =
                        e && this.isRefundableObject(e)
                          ? e.isBuilding()
                            ? a.PointerType.Sell
                            : a.PointerType.SellMini
                          : a.PointerType.NoSell;
                    }
                    this.pointer.setPointerType(t);
                  }
                }));
            }
            enter() {
              ((this.sidebarModel.sellMode = !0),
                (this.currentHover = void 0),
                (this.lastHover = void 0),
                (this.lastUpdate = void 0),
                this.renderer.onFrame.subscribe(this.onFrame));
            }
            hover(e, t) {
              t || (this.currentHover = e);
            }
            isRefundableObject(e) {
              return !!(
                e.isTechno() &&
                e.owner === this.player &&
                !e.rules.unsellable &&
                0 < this.game.sellTrait.computeRefundValue(e) &&
                (e.isBuilding()
                  ? e.buildStatus === i.BuildStatus.Ready && !e.warpedOutTrait.isActive()
                  : e.traits.find(r.DockableTrait)?.dock?.rules.unitSell)
              );
            }
            execute(e, t) {
              if (t) return !1;
              var i = e?.gameObject;
              return (i && this.isRefundableObject(i) && this._onExecute.dispatch(this, i), !1);
            }
            cancel() {
              this.end();
            }
            end() {
              ((this.sidebarModel.sellMode = !1), this.renderer.onFrame.unsubscribe(this.onFrame));
            }
            dispose() {
              this.end();
            }
          }),
        );
      },
    };
  },
);
