// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/RepairMode ===
// deps: ["engine/type/PointerType","util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/RepairMode",
  ["engine/type/PointerType", "util/event"],
  function (e, t) {
    "use strict";
    var a, n, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        e(
          "RepairMode",
          (i = class {
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
                  var t, i;
                  (this.lastTile !== this.currentTile || !this.lastUpdate || e - this.lastUpdate >= 1e3 / 15) &&
                    ((this.lastTile = this.currentTile),
                    (this.lastUpdate = e),
                    (i = !(!(t = this.currentTile) || !this.findRepairableBuilding(t))),
                    this.pointer.setPointerType(
                      t ? (i ? a.PointerType.SideRepair : a.PointerType.NoRepair) : a.PointerType.Default,
                    ));
                }));
            }
            enter() {
              ((this.sidebarModel.repairMode = !0),
                (this.currentTile = void 0),
                (this.lastTile = void 0),
                (this.lastUpdate = void 0),
                this.renderer.onFrame.subscribe(this.onFrame));
            }
            hover(e, t) {
              t || (this.currentTile = e?.tile);
            }
            findRepairableBuilding(e) {
              return this.game.map
                .getObjectsOnTile(e)
                .find(
                  (e) =>
                    e.isBuilding() &&
                    e.owner === this.player &&
                    e.healthTrait.health < 100 &&
                    e.rules.repairable &&
                    e.rules.clickRepairable,
                );
            }
            execute(e, t) {
              if (t) return !1;
              var i = e?.tile;
              if (!i) return !1;
              i = this.findRepairableBuilding(i);
              return (i && this._onExecute.dispatch(this, i), !1);
            }
            cancel() {
              this.end();
            }
            end() {
              ((this.sidebarModel.repairMode = !1), this.renderer.onFrame.unsubscribe(this.onFrame));
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
