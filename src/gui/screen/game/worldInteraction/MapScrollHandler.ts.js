// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/MapScrollHandler ===
// deps: ["util/geometry","util/math","engine/type/PointerType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/MapScrollHandler",
  ["util/geometry", "util/math", "engine/type/PointerType"],
  function (e, t) {
    "use strict";
    var o, l, c, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        e(
          "MapScrollHandler",
          (i = class {
            constructor(e, t, i, r, s) {
              ((this.canvas = e),
                (this.cameraPan = t),
                (this.pointer = i),
                (this.scrollRate = r),
                (this.worldScene = s),
                (this.isActive = !1),
                (this.paused = !1),
                (this.forceScrollCancelRequested = !1),
                (this.onFrame = (r) => {
                  if (!this.paused)
                    if (this.isActive && (!this.lastUpdate || r - this.lastUpdate >= 1e3 / 60)) {
                      this.lastUpdate = r;
                      var s = this.cameraPan.getPan(),
                        a = this.cameraPan.getPanLimits();
                      let e,
                        t = !1;
                      (this.panDirection?.x || this.panDirection?.y) &&
                        ((n = (this.scrollRate.value / 5) * 10),
                        (e = {
                          x: l.clamp(s.x + this.panDirection.x * n, a.x, a.x + a.width),
                          y: l.clamp(s.y + this.panDirection.y * n, a.y, a.y + a.height),
                        }),
                        (n = !o.pointEquals(e, s)),
                        this.pointer.setPointerType(
                          n ? c.PointerType.Scroll : c.PointerType.NoScroll,
                          this.pointerFrameNo,
                        ),
                        n && (t = !0));
                      var n = this.forceScrollDirection;
                      let i = !1;
                      (n &&
                        ((e = {
                          x: l.clamp(s.x + 30 * n.x, a.x, a.x + a.width),
                          y: l.clamp(s.y + 30 * n.y, a.y, a.y + a.height),
                        }),
                        o.pointEquals(e, s) || (i = !0)),
                        (this.isActive = t || i),
                        e && this.cameraPan.setPan({ x: e.x, y: e.y }),
                        this.isActive || this.worldScene.onBeforeCameraUpdate.unsubscribe(this.onFrame),
                        this.forceScrollCancelRequested &&
                          ((this.forceScrollCancelRequested = !1), (this.forceScrollDirection = void 0)));
                    }
                }));
            }
            isScrolling() {
              return !(!this.panDirection || (!this.panDirection.x && !this.panDirection.y));
            }
            requestForceScroll(e) {
              ((this.forceScrollDirection = e),
                (this.forceScrollCancelRequested = !1),
                this.isActive || ((this.isActive = !0), this.worldScene.onBeforeCameraUpdate.subscribe(this.onFrame)));
            }
            cancelForceScroll() {
              this.forceScrollCancelRequested = !0;
            }
            update(e) {
              var t = this.canvas.height,
                i = this.canvas.width;
              let r = e.x < 3 ? -1 : e.x > i - 1 - 3 ? 1 : 0,
                s = e.y < 3 ? -1 : e.y > t - 1 - 3 ? 1 : 0;
              (r
                ? e.y < Math.min(300, t / 3)
                  ? (s = -1)
                  : e.y > Math.max(t - 300, (2 * t) / 3) && (s = 1)
                : s && (e.x < Math.min(300, i / 3) ? (r = -1) : e.x > Math.max(i - 300, (2 * i) / 3) && (r = 1)),
                (this.panDirection = new THREE.Vector2(r, s)),
                (this.pointerFrameNo = ((THREE.Math.radToDeg(this.panDirection.angle()) + 90) % 360) / 45),
                this.isActive || ((this.isActive = !0), this.worldScene.onBeforeCameraUpdate.subscribe(this.onFrame)));
            }
            cancel() {
              (this.cancelForceScroll(),
                this.isActive &&
                  (this.worldScene.onBeforeCameraUpdate.unsubscribe(this.onFrame), (this.isActive = !1)));
            }
            setPaused(e) {
              this.paused = e;
            }
            dispose() {
              this.cancel();
            }
          }),
        );
      },
    };
  },
);
