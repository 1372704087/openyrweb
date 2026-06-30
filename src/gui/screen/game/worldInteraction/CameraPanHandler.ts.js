// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/CameraPanHandler ===
// deps: ["util/geometry","engine/type/PointerType","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/CameraPanHandler",
  ["util/geometry", "engine/type/PointerType", "util/math"],
  function (e, t) {
    "use strict";
    var a, n, o, i;
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
          o = e;
        },
      ],
      execute: function () {
        e(
          "CameraPanHandler",
          (i = class {
            constructor(e, t, i, r, s) {
              ((this.cameraPan = e),
                (this.pointer = t),
                (this.panRate = i),
                (this.freeCamera = r),
                (this.worldScene = s),
                (this.isPanning = !1),
                (this.paused = !1),
                (this.stickyMode = !1),
                (this.onFrame = (e) => {
                  if (!this.paused)
                    if (this.isPanning && (!this.lastUpdate || e - this.lastUpdate >= 1e3 / 60))
                      if (((this.lastUpdate = e), this.panVector.x || this.panVector.y)) {
                        var i = this.stickyMode ? this.initialPan : this.cameraPan.getPan(),
                          r = this.cameraPan.getPanLimits();
                        let e = {
                          x: o.clamp(i.x + this.panVector.x, r.x, r.x + r.width),
                          y: o.clamp(i.y + this.panVector.y, r.y, r.y + r.height),
                        };
                        this.freeCamera.value && (e = { x: i.x + this.panVector.x, y: i.y + this.panVector.y });
                        var s = !a.pointEquals(e, i),
                          r = this.panVector.x && e.x === i.x,
                          i = this.panVector.y && e.y === i.y;
                        let t = 0;
                        if (r || i) {
                          let e = new THREE.Vector2(
                            r ? Math.sign(this.panVector.x) : 0,
                            i ? Math.sign(this.panVector.y) : 0,
                          );
                          t = 1 + ((THREE.Math.radToDeg(e.angle()) + 90) % 360) / 45;
                        }
                        (this.pointer.setPointerType(n.PointerType.Pan, t),
                          s && this.cameraPan.setPan({ x: e.x, y: e.y }),
                          (this.isPanning = s));
                      } else this.pointer.setPointerType(n.PointerType.Pan);
                }));
            }
            start(e) {
              ((this.startPos = e),
                (this.isPanning = !1),
                (this.panVector = new THREE.Vector2(0, 0)),
                this.worldScene.onBeforeCameraUpdate.subscribe(this.onFrame));
            }
            update(e, t) {
              var i;
              (t
                ? (this.initialPan || (this.initialPan = this.cameraPan.getPan()),
                  (this.panVector.x = this.startPos.x - e.x),
                  (this.panVector.y = this.startPos.y - e.y))
                : ((i = (this.panRate.value / 5) * 100),
                  (this.panVector.x = Math.floor((i * o.clamp(e.x - this.startPos.x, -600, 600)) / 600)),
                  (this.panVector.y = Math.floor((i * o.clamp(e.y - this.startPos.y, -600, 600)) / 600))),
                (this.isPanning = !0),
                (this.stickyMode = t));
            }
            finish() {
              (this.worldScene.onBeforeCameraUpdate.unsubscribe(this.onFrame),
                this.pointer.setPointerType(n.PointerType.Default),
                (this.initialPan = void 0));
            }
            setPaused(e) {
              this.paused = e;
            }
            dispose() {
              this.finish();
            }
          }),
        );
      },
    };
  },
);
