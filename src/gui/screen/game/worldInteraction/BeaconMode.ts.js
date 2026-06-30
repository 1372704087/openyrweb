// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/BeaconMode ===
// deps: ["engine/type/PointerType","util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/BeaconMode",
  ["engine/type/PointerType", "util/event"],
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
          "BeaconMode",
          (s = class {
            get onExecute() {
              return this._onExecute.asEvent();
            }
            static factory(e, t) {
              return new this(e, t);
            }
            constructor(e, t) {
              ((this.pointer = e),
                (this.renderer = t),
                (this._onExecute = new r.EventDispatcher()),
                (this.onFrame = (e) => {
                  var t;
                  (this.lastTile !== this.currentTile || !this.lastUpdate || e - this.lastUpdate >= 1e3 / 15) &&
                    ((this.lastTile = this.currentTile),
                    (this.lastUpdate = e),
                    (t = this.currentTile),
                    this.pointer.setPointerType(t ? i.PointerType.Beacon : i.PointerType.Default));
                }));
            }
            enter() {
              ((this.currentTile = void 0),
                (this.lastTile = void 0),
                (this.lastUpdate = void 0),
                this.renderer.onFrame.subscribe(this.onFrame));
            }
            hover(e, t) {
              t || (this.currentTile = e?.tile);
            }
            execute(e, t) {
              if (t) return !1;
              var i = e?.tile;
              if (!i) return !1;
              (this._onExecute.dispatch(this, i), this.end());
            }
            cancel() {
              this.end();
            }
            end() {
              this.renderer.onFrame.unsubscribe(this.onFrame);
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
