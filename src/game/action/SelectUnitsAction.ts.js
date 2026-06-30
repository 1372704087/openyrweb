// === Reconstructed SystemJS module: game/action/SelectUnitsAction ===
// deps: ["game/action/Action","game/action/ActionType","data/DataStream","game/action/OrderUnitsAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/SelectUnitsAction",
  ["game/action/Action", "game/action/ActionType", "data/DataStream", "game/action/OrderUnitsAction"],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
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
      ],
      execute: function () {
        ((n = class extends i.Action {
          get unitIds() {
            return this._unitIds;
          }
          set unitIds(e) {
            this._unitIds = e.slice(0, a.ORDER_UNIT_LIMIT);
          }
          constructor(e, t) {
            (super(r.ActionType.SelectUnits), (this.game = e), (this.orderActionContext = t));
          }
          unserialize(e) {
            let t = new s.DataStream(e);
            this.unitIds = new Array(e.byteLength / 4);
            for (let i = 0; i < e.byteLength / 4; i++) this.unitIds[i] = t.readUint32();
          }
          serialize() {
            let e = new s.DataStream(4 * this.unitIds.length);
            e.dynamicSize = !1;
            for (var t of this.unitIds) e.writeUint32(t);
            return e.toUint8Array();
          }
          print() {
            return `Select unit(s) [${this.unitIds.join(",")}]`;
          }
          process() {
            let e = this.player,
              i = [];
            for (var r of this.unitIds) {
              let t = e.getOwnedObjectById(r);
              if (!t && this.game.getWorld().hasObjectId(r)) {
                let e = this.game.getWorld().getObjectById(r);
                e.isTechno() && (t = e);
              }
              t && i.push(t);
            }
            this.orderActionContext.getOrCreateSelection(e).update(i);
          }
        }),
          e("SelectUnitsAction", n));
      },
    };
  },
);
