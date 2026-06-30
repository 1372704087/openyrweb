// === Reconstructed SystemJS module: gui/PointerEvents ===
// deps: ["util/disposable/CompositeDisposable","util/array","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/PointerEvents",
  ["util/disposable/CompositeDisposable", "util/array", "util/math"],
  function (e, t) {
    "use strict";
    var a, l, i, o, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((o = (e, t) => !!e.visible && (e === t || (!!e.parent && o(e.parent, t)))),
          e(
            "PointerEvents",
            (r = class {
              constructor(e, t, i, r) {
                ((this.renderer = e),
                  (this.lockModePointer = t),
                  (this.document = i),
                  (this.canvasMetrics = r),
                  (this.disposables = new a.CompositeDisposable()),
                  (this.canvasContext = { handlers: new Map() }),
                  (this.objectContexts = new Map()),
                  (this.intersectionsEnabled = !0),
                  (this.clickPaths = new Map()),
                  (this.touchFingers = 0),
                  (this.onDblClick = (e) => {
                    0 === e.button && this.onMouseEvent("dblclick", e);
                  }),
                  (this.onMouseMove = (i) => {
                    let r = this.getPointerPosition(i);
                    if (this.intersectionsEnabled) {
                      let e = this.currentHoverPath ? [...this.currentHoverPath] : void 0;
                      var s = e?.[0],
                        a = this.findObjectUnderPointer(r);
                      let t = a?.object;
                      if (
                        ((this.currentHoverPath = void 0),
                        t &&
                          ((this.currentHoverPath = [t]),
                          t.traverseAncestors((e) => {
                            this.currentHoverPath.push(e);
                          })),
                        !l.equals(this.currentHoverPath ?? [], e ?? []))
                      ) {
                        if (e)
                          for (var n of e)
                            (this.currentHoverPath && this.currentHoverPath.includes(n)) ||
                              this.notify("mouseleave", n, r, i, void 0, !1);
                        if (this.currentHoverPath)
                          for (var o of this.currentHoverPath)
                            (e && e.includes(o)) || this.notify("mouseenter", o, r, i, a, !1);
                        (s && this.notify("mouseout", s, r, i), t && this.notify("mouseover", t, r, i, a));
                      }
                      t
                        ? this.notify("mousemove", t, r, i, a)
                        : this.renderer.getScenes().forEach((e) => this.notify("mousemove", e.get3DObject(), r, i));
                    }
                    this.notify("mousemove", "canvas", r, i);
                  }),
                  (this.onMouseDown = (e) => {
                    this.onMouseEvent("mousedown", e);
                  }),
                  (this.onMouseUp = (e) => {
                    this.onMouseEvent("mouseup", e);
                  }),
                  (this.onMouseWheel = (e) => {
                    this.onMouseEvent("wheel", e);
                  }),
                  (this.onTouchMove = (e) => {
                    if ((e.preventDefault(), this.initialTouchEvent?.touches)) {
                      let t = this.initialTouchEvent.touches[0];
                      var i = [...e.changedTouches].find((e) => t.identifier === e.identifier);
                      i &&
                        (this.touchStartBuffer &&
                          (clearTimeout(this.touchStartBuffer.timeoutId),
                          this.touchStartBuffer.cb(),
                          (this.touchStartBuffer = void 0)),
                        (i = this.fakeMouseEventFromTouch(i, e)),
                        this.onMouseMove(i));
                    }
                  }),
                  (this.onTouchStart = (t) => {
                    t.preventDefault();
                    let i = t.touches;
                    var e, r;
                    1 < i.length
                      ? 0 < this.touchFingers ||
                        (i[0].target === this.renderer.getCanvas() &&
                          2 === i.length &&
                          (this.touchStartBuffer &&
                            (clearTimeout(this.touchStartBuffer.timeoutId), (this.touchStartBuffer = void 0)),
                          (this.touchFingers = 2),
                          this.initialTouchEvent || (this.initialTouchEvent = t),
                          (e = this.initialTouchEvent.touches[0]),
                          (r = this.fakeMouseEventFromTouch(e, t, 2)),
                          this.onMouseEvent("mousedown", r)))
                      : ((e = () => {
                          this.touchFingers = 1;
                          var e = this.fakeMouseEventFromTouch(i[0], t);
                          this.onMouseEvent("mousedown", e);
                        }),
                        (r = setTimeout(e, 50)),
                        (this.touchStartBuffer = { cb: e, timeoutId: r }),
                        (this.initialTouchEvent = t));
                  }),
                  (this.onTouchEnd = (i) => {
                    if ((i.preventDefault(), this.initialTouchEvent?.touches)) {
                      let t = this.initialTouchEvent.touches[0];
                      var r = [...i.changedTouches].find((e) => t.identifier === e.identifier);
                      if (r) {
                        this.touchStartBuffer &&
                          (clearTimeout(this.touchStartBuffer.timeoutId),
                          this.touchStartBuffer.cb(),
                          (this.touchStartBuffer = void 0));
                        var s = 2 === this.touchFingers ? 2 : 0;
                        let e = this.fakeMouseEventFromTouch(r, i, s);
                        ((e.touchDuration = i.timeStamp - this.initialTouchEvent.timeStamp),
                          (this.touchFingers = 0),
                          (this.initialTouchEvent = void 0),
                          this.onMouseEvent("mouseup", e));
                      }
                    }
                  }));
                let s = e.getCanvas();
                (s.addEventListener("dblclick", this.onDblClick, !1),
                  s.addEventListener("mousemove", this.onMouseMove, !1),
                  s.addEventListener("mousedown", this.onMouseDown, !1),
                  s.addEventListener("mouseup", this.onMouseUp, !1),
                  s.addEventListener("touchmove", this.onTouchMove, !1),
                  s.addEventListener("touchstart", this.onTouchStart, !1),
                  s.addEventListener("touchend", this.onTouchEnd, !1),
                  s.addEventListener("wheel", this.onMouseWheel, { passive: !0 }),
                  this.disposables.add(() => {
                    (s.removeEventListener("dblclick", this.onDblClick, !1),
                      s.removeEventListener("mousemove", this.onMouseMove, !1),
                      s.removeEventListener("mousedown", this.onMouseDown, !1),
                      s.removeEventListener("mouseup", this.onMouseUp, !1),
                      s.removeEventListener("touchmove", this.onTouchMove, !1),
                      s.removeEventListener("touchstart", this.onTouchStart, !1),
                      s.removeEventListener("touchend", this.onTouchEnd, !1),
                      s.removeEventListener("wheel", this.onMouseWheel, !1));
                  }));
              }
              addEventListener(e, t, i, r = !1) {
                let s = "canvas" === e ? this.canvasContext : this.getOrCreateObjectContext(e),
                  a = s.handlers.get(t);
                return (
                  a || ((a = []), s.handlers.set(t, a)),
                  a.push({ callback: i, useCapture: r }),
                  () => this.removeEventListener(e, t, i, r)
                );
              }
              removeEventListener(t, i, r, s = !1) {
                let a = "canvas" === t ? this.canvasContext : this.objectContexts.get(t);
                if (a && a.handlers.has(i)) {
                  let e = a.handlers.get(i);
                  ((e = e.filter((e) => !(e.callback === r && e.useCapture === s))),
                    e.length ? a.handlers.set(i, e) : a.handlers.delete(i),
                    a.handlers.size || "canvas" === t || this.objectContexts.delete(t));
                }
              }
              getOrCreateObjectContext(e) {
                if (!e) throw new Error("Undefined Object3D instance.");
                let t = this.objectContexts.get(e);
                return (t || ((t = { handlers: new Map() }), this.objectContexts.set(e, t)), t);
              }
              fakeMouseEventFromTouch(e, t, i = 0) {
                var r = this.computeTouchPosition(e);
                return {
                  offsetX: r.x,
                  offsetY: r.y,
                  button: i,
                  isTouch: !0,
                  detail: 1,
                  altKey: t.altKey,
                  ctrlKey: t.ctrlKey,
                  metaKey: t.metaKey,
                  shiftKey: t.shiftKey,
                  timeStamp: t.timeStamp,
                };
              }
              computeTouchPosition(e) {
                let t = { x: e.pageX - this.canvasMetrics.x, y: e.pageY - this.canvasMetrics.y };
                return (
                  (t.x = i.clamp(t.x, 0, this.canvasMetrics.width - 1)),
                  (t.y = i.clamp(t.y, 0, this.canvasMetrics.height - 1)),
                  t
                );
              }
              onMouseEvent(t, r) {
                let s = this.getPointerPosition(r);
                var a = this.findObjectUnderPointer(s);
                if (
                  (a
                    ? this.notify(t, a.object, s, r, a)
                    : this.renderer.getScenes().forEach((e) => this.notify(t, e.get3DObject(), s, r)),
                  this.notify(t, "canvas", s, r),
                  "mousedown" === t || "mouseup" === t)
                ) {
                  let e = a?.object,
                    i = [];
                  if (
                    (e &&
                      ((i = [e]),
                      e.traverseAncestors((e) => {
                        i.push(e);
                      })),
                    "mousedown" === t)
                  )
                    this.clickPaths.set(r.button, i);
                  else {
                    let e = this.clickPaths.get(r.button);
                    this.clickPaths.delete(r.button);
                    let t = !1;
                    for (var n of i)
                      if (e?.includes(n)) {
                        (this.notify("click", n, s, r, a), (t = !0));
                        break;
                      }
                    (t || this.renderer.getScenes().forEach((e) => this.notify("click", e.get3DObject(), s, r)),
                      this.notify("click", "canvas", s, r));
                  }
                }
              }
              getPointerPosition(e) {
                return this.document.pointerLockElement ? this.lockModePointer : { x: e.offsetX, y: e.offsetY };
              }
              findObjectUnderPointer(t) {
                let r = this.renderer.getScenes(),
                  s = this.groupObjectsByScene();
                for (let n = r.length - 1; 0 <= n; n--) {
                  let e = new THREE.Raycaster();
                  var a = this.normalizePointer(t, r[n].viewport);
                  e.setFromCamera(a, r[n].camera);
                  a = s.get(r[n].scene).filter((e) => o(e, r[n].get3DObject()));
                  let i = e.intersectObjects(a, !0);
                  if (i.length) {
                    if (1 === i.length) return i[0];
                    let t = new Set(i.map((e) => e.object));
                    return (
                      i.forEach((e) => {
                        t.has(e.object) &&
                          e.object.traverseAncestors((e) => {
                            t.has(e) && t.delete(e);
                          });
                      }),
                      i.filter((e) => t.has(e.object))[0]
                    );
                  }
                }
              }
              normalizePointer(e, t) {
                return { x: ((e.x - t.x) / t.width) * 2 - 1, y: 2 * -((e.y - t.y) / t.height) + 1 };
              }
              groupObjectsByScene() {
                let i = new Map();
                return (
                  this.renderer.getScenes().forEach((e) => i.set(e.get3DObject(), [])),
                  [...this.objectContexts.keys()].forEach((t) => {
                    if ("Scene" !== t.type) {
                      let e = t;
                      for (; e.parent;) e = e.parent;
                      "Scene" === e.type && i.get(e).push(t);
                    }
                  }),
                  i
                );
              }
              notify(i, r, s, a, n, o = !0) {
                let e = "canvas" === r ? this.canvasContext : this.objectContexts.get(r),
                  t = e?.handlers.get(i);
                ((t && t.length) || ("canvas" !== r && r.parent && o && this.notify(i, r.parent, s, a, n)),
                  t?.forEach((e) => {
                    let t = !0;
                    (e.callback({
                      type: i,
                      target: "canvas" !== r ? r : void 0,
                      pointer: { ...s },
                      intersection: n,
                      button: a.button,
                      isTouch: !!a.isTouch,
                      touchDuration: a.touchDuration,
                      clicks: a.detail,
                      altKey: a.altKey,
                      ctrlKey: a.ctrlKey,
                      metaKey: a.metaKey,
                      shiftKey: a.shiftKey,
                      timeStamp: a.timeStamp,
                      wheelDeltaY: a.deltaY ?? 0,
                      stopPropagation: () => {
                        t = !1;
                      },
                    }),
                      t && "canvas" !== r && !e.useCapture && r.parent && o && this.notify(i, r.parent, s, a, n));
                  }));
              }
              dispose() {
                (this.touchStartBuffer &&
                  (clearTimeout(this.touchStartBuffer.timeoutId), (this.touchStartBuffer = void 0)),
                  this.disposables.dispose());
              }
            }),
          ));
      },
    };
  },
);
