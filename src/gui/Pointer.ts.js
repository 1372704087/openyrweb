// === Reconstructed SystemJS module: gui/Pointer ===
// deps: ["util/PointerLock","util/math","util/disposable/CompositeDisposable","gui/PointerSprite","gui/PointerEvents","engine/type/PointerType","engine/animation/SimpleRunner","engine/Animation","engine/AnimProps","data/IniSection","util/BoxedVar"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/Pointer",
  [
    "util/PointerLock",
    "util/math",
    "util/disposable/CompositeDisposable",
    "gui/PointerSprite",
    "gui/PointerEvents",
    "engine/type/PointerType",
    "engine/animation/SimpleRunner",
    "engine/Animation",
    "engine/AnimProps",
    "data/IniSection",
    "util/BoxedVar",
  ],
  function (e, t) {
    "use strict";
    var h, n, o, u, d, l, s, a, c, g, p, m;
    t && t.id;
    return {
      setters: [
        function (e) {
          h = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {
        e(
          "Pointer",
          (m = class m {
            static factory(e, t, i, r, s, a) {
              let n = u.PointerSprite.fromShpFile(e, t);
              n.setVisible(!1);
              var o = i.getCanvas(),
                l = new h.PointerLock(o, r);
              let c = new m(l, n, r, o, s, a);
              return (
                (c.pointerEvents = new d.PointerEvents(i, c.getPosition(), r, s)),
                c.disposables.add(c.pointerEvents),
                c
              );
            }
            constructor(e, t, i, r, s, a) {
              ((this.pointerLock = e),
                (this.sprite = t),
                (this.document = i),
                (this.canvas = r),
                (this.canvasMetrics = s),
                (this.mouseAcceleration = a),
                (this.userLockMode = !1),
                (this.userPointerVisible = !0),
                (this.userPermissionGranted = !1),
                (this.position = { x: 0, y: 0 }),
                (this.disposables = new o.CompositeDisposable()),
                (this.pointerType = l.PointerType.Default),
                (this.pointerSubFrame = 0),
                (this.onMouseMove = (e) => {
                  let t = this.position;
                  (this.pointerLock.isActive()
                    ? ((t.x = t.x + e.movementX), (t.y = t.y + e.movementY))
                    : ((t.x = e.pageX - this.canvasMetrics.x), (t.y = e.pageY - this.canvasMetrics.y)),
                    (t.x = n.clamp(t.x, 0, this.canvasMetrics.width - 1)),
                    (t.y = n.clamp(t.y, 0, this.canvasMetrics.height - 1)),
                    this.updateSpritePosition());
                }));
            }
            getPosition() {
              return this.position;
            }
            getPointerLock() {
              return this.pointerLock;
            }
            init() {
              (this.listenForFirstCanvasClick(),
                this.pointerLock.onChange.subscribe((e) => {
                  this.sprite.setVisible(this.userPointerVisible && e);
                  const t = () => {
                    this.userLockMode &&
                      this.pointerLock.request({ unadjustedMovement: !this.mouseAcceleration.value }).catch((e) => {
                        (console.warn("Couldn't acquire pointer lock.", e),
                          this.canvas.addEventListener("click", t, { once: !0 }));
                      });
                  };
                  e ||
                    (this.canvas.addEventListener("click", t, { once: !0 }),
                    this.disposables.add(() => this.canvas.removeEventListener("click", t)));
                }),
                this.document.addEventListener("mousemove", this.onMouseMove, !0),
                this.disposables.add(() => this.document.removeEventListener("mousemove", this.onMouseMove, !0)));
            }
            listenForFirstCanvasClick() {
              const t = async () => {
                if (!this.userPermissionGranted)
                  try {
                    (await this.pointerLock.request({ unadjustedMovement: !this.mouseAcceleration.value }),
                      this.userLockMode || (await this.pointerLock.exit()),
                      (this.userPermissionGranted = !0));
                  } catch (e) {
                    (console.warn("Couldn't acquire initial pointer lock", e),
                      this.canvas.addEventListener("click", t, { once: !0 }));
                  }
              };
              (this.canvas.addEventListener("click", t, { once: !0 }),
                this.disposables.add(() => this.canvas.removeEventListener("click", t)));
            }
            lock() {
              ((this.userLockMode = !0),
                this.userPermissionGranted &&
                  this.pointerLock.request({ unadjustedMovement: !this.mouseAcceleration.value }).catch((e) => {
                    (console.warn("Couldn't reacquire pointer lock. Will attempt to require lock on next click", e),
                      (this.userPermissionGranted = !1),
                      this.listenForFirstCanvasClick());
                  }));
            }
            unlock() {
              ((this.userLockMode = !1),
                this.pointerLock
                  .exit()
                  .catch((e) => console.error("Couldn't release pointer lock. This should never happen", e)));
            }
            setVisible(e) {
              ((this.userPointerVisible = e), this.sprite.setVisible(e && this.pointerLock.isActive()));
            }
            getUserLockMode() {
              return this.userLockMode;
            }
            getSprite() {
              return this.sprite;
            }
            setPointerType(t, e = 0) {
              if (this.pointerType !== t || this.pointerSubFrame !== e) {
                if (
                  ((this.pointerType = t),
                  (this.pointerSubFrame = e),
                  this.sprite.setAnimationRunner(void 0),
                  [l.PointerType.Scroll, l.PointerType.NoScroll, l.PointerType.Pan].includes(t))
                )
                  this.sprite.setFrame(t + e);
                else {
                  var i = t,
                    r =
                      (Object.keys(l.PointerType)
                        .map(Number)
                        .find((e) => !Number.isNaN(e) && t < e) ?? this.sprite.getFrameCount()) - 1;
                  if ((this.sprite.setFrame(i), i < r)) {
                    let e = new s.SimpleRunner(),
                      t = new c.AnimProps(new g.IniSection("dummy"), this.sprite.getFrameCount());
                    ((t.loopCount = -1), (t.start = i), (t.loopStart = i), (t.loopEnd = r));
                    r = new a.Animation(t, new p.BoxedVar(1.5));
                    ((e.animation = r), this.sprite.setAnimationRunner(e));
                  }
                }
                this.updateSpritePosition();
              }
            }
            updateSpritePosition() {
              let e = { ...this.position };
              var t = this.sprite.getSize(),
                i = Math.floor(t.width / 2),
                r = Math.floor(t.height / 2);
              (this.pointerType > l.PointerType.Mini && ((e.x -= i), (e.y -= r)),
                [l.PointerType.Scroll, l.PointerType.NoScroll, l.PointerType.Pan].includes(this.pointerType) &&
                  ((e.x = n.clamp(e.x, 0, this.canvasMetrics.width - 1 - t.width)),
                  (e.y = n.clamp(e.y, 0, this.canvasMetrics.height - 1 - t.height))),
                this.sprite.setPosition(e.x, e.y));
            }
            dispose() {
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
