// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/TooltipHandler ===
// deps: ["util/disposable/CompositeDisposable","gui/screen/game/worldInteraction/Tooltip"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/TooltipHandler",
  ["util/disposable/CompositeDisposable", "gui/screen/game/worldInteraction/Tooltip"],
  function (e, t) {
    "use strict";
    var o, l, c, h;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        ((c = class {
          equals(e) {
            return (this.entity ?? this.uiObject) === (e.entity ?? e.uiObject);
          }
          copy(e) {
            ((this.entity = e.entity), (this.uiObject = e.uiObject));
          }
        }),
          e(
            "TooltipHandler",
            (h = class h {
              constructor(e, t, i, r, s, a, n) {
                ((this.mapHoverHandler = e),
                  (this.textColor = t),
                  (this.pointer = i),
                  (this.uiScene = r),
                  (this.renderer = s),
                  (this.strings = a),
                  (this.debugText = n),
                  (this.disposables = new o.CompositeDisposable()),
                  (this.currentHover = new c()),
                  (this.lastHover = new c()),
                  (this.isTouch = !1),
                  (this.needsHoverTimeReset = !1),
                  (this.paused = !1),
                  (this.handleUiMouseMove = (e) => {
                    var t = e.intersection?.object;
                    let i = t;
                    for (; void 0 === i?.userData.tooltip && ((i = i?.parent), i););
                    ((this.currentHover.uiObject = i ?? t),
                      this.hoverStartTime && (this.needsHoverTimeReset = !0),
                      (this.isTouch = e.isTouch));
                  }),
                  (this.handleMouseDown = () => {
                    ((this.paused = !0), this.reset());
                  }),
                  (this.handleMouseUp = (e) => {
                    ((this.paused = !1), (this.isTouch = e.isTouch));
                  }),
                  (this.handleMouseWheel = () => {
                    this.reset();
                  }),
                  (this.onFrame = (e) => {
                    var t;
                    (!this.lastUpdate || e - this.lastUpdate >= 1e3 / 15) &&
                      ((this.lastUpdate = e),
                      (t = this.mapHoverHandler.getCurrentHover()?.entity),
                      (this.currentHover.entity = t),
                      this.paused ||
                        (this.currentHover.equals(this.lastHover)
                          ? (this.needsHoverTimeReset && ((this.needsHoverTimeReset = !1), (this.hoverStartTime = e)),
                            (t = this.currentHover.entity ? 800 : 400),
                            this.hoverStartTime &&
                              e - this.hoverStartTime > t &&
                              (!(t = this.getTooltipText(this.currentHover)) ||
                                this.tooltip ||
                                this.isTouch ||
                                ((this.tooltip = new l.Tooltip(t, this.textColor, this.pointer, this.uiScene.viewport)),
                                this.tooltip.setZIndex(h.ZINDEX),
                                this.uiScene.add(this.tooltip))))
                          : (this.lastHover.copy(this.currentHover),
                            (this.hoverStartTime = void 0),
                            this.destroyTooltip(),
                            void 0 !== this.getTooltipText(this.currentHover) && (this.hoverStartTime = e))));
                  }));
              }
              init() {
                (this.disposables.add(
                  this.pointer.pointerEvents.addEventListener(
                    this.uiScene.get3DObject(),
                    "mousemove",
                    this.handleUiMouseMove,
                  ),
                ),
                  this.disposables.add(
                    this.pointer.pointerEvents.addEventListener("canvas", "mousedown", this.handleMouseDown),
                    this.pointer.pointerEvents.addEventListener("canvas", "wheel", this.handleMouseWheel),
                    this.pointer.pointerEvents.addEventListener("canvas", "mouseup", this.handleMouseUp),
                  ),
                  this.renderer.onFrame.subscribe(this.onFrame),
                  this.disposables.add(() => this.renderer.onFrame.unsubscribe(this.onFrame)));
              }
              reset() {
                (this.destroyTooltip(), this.hoverStartTime && (this.needsHoverTimeReset = !0));
              }
              getTooltipText(t) {
                let i;
                if (t.entity) {
                  let e = t.entity.getUiName?.();
                  (void 0 !== e &&
                    "" !== e &&
                    (-1 !== e.indexOf("{")
                      ? (i = e.replace(/\{([^}]+)\}/g, (e, t) => this.strings.get(t)))
                      : (this.strings.has(e) || e.match(/^NOSTR:/i)) && (i = this.strings.get(e))),
                    this.debugText.value && (i += ` (ID: ${t.entity.gameObject.id})`));
                  // OpenYRWeb: append power output for power-generating buildings. Vanilla YR shows
                  // "+<N>" on power-plant tooltips and "-<N>" on drains. For the Bio Reactor the
                  // current output already includes the per-garrison ExtraPower bonus (the Bio Reactor's
                  // full output is owned by BioReactorPowerTrait.registered), so the tooltip reflects
                  // the live garrisoned total.
                  if (t.entity.isTechno?.() && t.entity.rules?.power && t.entity.owner && !t.entity.owner.isNeutral) {
                    var p = t.entity.bioReactorPowerTrait ? t.entity.bioReactorPowerTrait.registered : t.entity.rules.power;
                    if (p) {
                      i = i ? i + "\n" : "";
                      i += 0 < p ? "+" + p : "" + p;
                    }
                  }
                } else t.uiObject && (i = t.uiObject.userData.tooltip);
                return i;
              }
              destroyTooltip() {
                this.tooltip && (this.uiScene.remove(this.tooltip), this.tooltip?.destroy(), (this.tooltip = void 0));
              }
              dispose() {
                (this.disposables.dispose(), this.destroyTooltip());
              }
            }),
          ),
          (h.ZINDEX = 100));
      },
    };
  },
);
