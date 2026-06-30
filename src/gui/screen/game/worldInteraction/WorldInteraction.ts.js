// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/WorldInteraction ===
// deps: ["util/geometry","engine/type/PointerType","gui/screen/game/worldInteraction/DefaultActionHandler","util/userAgent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/WorldInteraction",
  [
    "util/geometry",
    "engine/type/PointerType",
    "gui/screen/game/worldInteraction/DefaultActionHandler",
    "util/userAgent",
  ],
  function (e, t) {
    "use strict";
    var b, S, l, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        (0,
          e(
            "WorldInteraction",
            (r = class {
              constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f, y, T, v) {
                ((this.worldScene = e),
                  (this.pointer = t),
                  (this.pointerEvents = i),
                  (this.cameraPanHandler = r),
                  (this.mapScrollHandler = s),
                  (this.mapHoverHandler = a),
                  (this.tooltipHandler = n),
                  (this.unitSelectionHandler = o),
                  (this.defaultActionHandler = l),
                  (this.keyboardHandler = c),
                  (this.arrowScrollHandler = h),
                  (this.customScrollHandler = u),
                  (this.minimapHandler = d),
                  (this.cameraZoom = g),
                  (this.document = p),
                  (this.renderer = m),
                  (this.targetLines = f),
                  (this.rightClickMove = y),
                  (this.rightClickScroll = T),
                  (this.battleControlApi = v),
                  (this.initialized = !1),
                  (this.enabled = !0),
                  (this.clickOrigin = { x: 0, y: 0 }),
                  (this.maybePan = !1),
                  (this.hasDragged = !1),
                  (this.isMinimapHover = !1),
                  (this.clearModeOnSelectionChange = !1),
                  (this.handleSelectionChange = () => {
                    this.clearModeOnSelectionChange && this.setMode(void 0);
                  }),
                  (this.handleKeyDown = (e) => {
                    (this.handleKeyModifierChange(e),
                      this.keyboardHandler.handleKeyDown(e),
                      this.arrowScrollHandler.handleKeyDown(e),
                      this.chatTypingHandler?.handleKeyDown(e));
                  }),
                  (this.handleKeyUp = (e) => {
                    (this.handleKeyModifierChange(e),
                      this.keyboardHandler.handleKeyUp(e),
                      this.arrowScrollHandler.handleKeyUp(e),
                      this.chatTypingHandler?.handleKeyUp(e),
                      this.tooltipHandler.reset());
                  }),
                  (this.handleKeyModifierChange = (e) => {
                    var t = this.lastKeyMods;
                    ((this.lastKeyMods = e),
                      (this.lastKeyboardEvent = e),
                      this.currentMode ||
                        (this.maybePan && this.hasDragged) ||
                        this.mapScrollHandler.isScrolling() ||
                        e.repeat ||
                        (e.shiftKey === t?.shiftKey && e.ctrlKey === t?.ctrlKey && e.altKey === t?.altKey) ||
                        this.updateDefaultAction(
                          this.getCurrentHover(),
                          this.unitSelectionHandler.getSelectedUnits(),
                          e,
                        ));
                  }),
                  (this.handleMapHoverChange = (e) => {
                    (this.currentMode?.hover(e, this.isMinimapHover),
                      this.isMinimapHover ||
                        this.currentMode ||
                        this.updateDefaultAction(e, this.unitSelectionHandler.getSelectedUnits(), this.lastKeyMods));
                  }),
                  (this.handleMouseMove = (e) => {
                    this.queuedMouseMoveEvent = e;
                  }),
                  (this.handleFrame = (e) => {
                    this.lastFrameTime = e;
                    let t = !1;
                    var i = this.unitSelectionHandler.getHash();
                    i === this.lastSelectionHash || this.currentMode || ((this.lastSelectionHash = i), (t = !0));
                    i = this.queuedMouseMoveEvent;
                    i && ((this.queuedMouseMoveEvent = void 0), this.processMouseMove(i));
                    ((!this.lastDefaultActionUpdate || e - this.lastDefaultActionUpdate >= 1e3 / 15) &&
                      ((this.lastDefaultActionUpdate = e),
                      this.currentMode ||
                        this.mapScrollHandler.isScrolling() ||
                        (this.hasDragged && this.maybePan) ||
                        (t = !0)),
                      t &&
                        this.updateDefaultAction(
                          this.getCurrentHover(),
                          this.unitSelectionHandler.getSelectedUnits(),
                          this.lastKeyMods,
                        ));
                  }),
                  (this.handleMouseDown = (e) => {
                    b.rectContainsPoint(this.worldScene.viewport, e.pointer) &&
                      void 0 === this.mousePressed &&
                      (this.hasFaultyCtrlLeftClick && e.ctrlKey && 2 === e.button && (e.button = 0),
                      this.mapScrollHandler.cancel(),
                      (this.pointerEvents.intersectionsEnabled = !1),
                      (this.clickOrigin = e.pointer),
                      (this.mousePressed = e.button),
                      (this.lastMouseDownEvent = e),
                      (this.hasDragged = !1),
                      ((2 === e.button && this.isRightClickPanAllowed()) || 1 === e.button) &&
                        ((this.maybePan = !0), this.cameraPanHandler.start(e.pointer)),
                      2 === e.button &&
                        (this.isRightClickPanAllowed() ||
                          this.isRightClickMove() ||
                          this.unitSelectionHandler.deselectAll(),
                        this.chatTypingHandler?.endTyping()));
                  }),
                  (this.handleMouseUp = (i) => {
                    if (
                      (this.hasFaultyCtrlLeftClick && i.ctrlKey && 2 === i.button && (i.button = 0),
                      this.mousePressed === i.button)
                    ) {
                      (i.isTouch &&
                        this.lastKeyMods &&
                        this.lastKeyMods !== this.lastKeyboardEvent &&
                        ((i.ctrlKey = this.lastKeyMods.ctrlKey),
                        (i.shiftKey = this.lastKeyMods.shiftKey),
                        (i.altKey = this.lastKeyMods.altKey)),
                        (this.pointerEvents.intersectionsEnabled = !0),
                        (this.mousePressed = void 0));
                      var r = this.maybePan;
                      if (((this.maybePan = !1), r && this.cameraPanHandler.finish(), r && this.hasDragged))
                        return (
                          this.mapHoverHandler.update(i.pointer, !0),
                          void this.currentMode?.hover(this.getCurrentHover(), this.isMinimapHover)
                        );
                      if (this.currentMode)
                        0 === i.button
                          ? (this.mapHoverHandler.update(i.pointer, !0),
                            !1 !== this.currentMode.execute(this.getCurrentHover(), this.isMinimapHover) &&
                              (this.currentMode = void 0))
                          : 2 === i.button &&
                            this.isClickRange(i.pointer) &&
                            (this.currentMode.cancel?.(),
                            (this.currentMode = void 0),
                            this.pointer.setPointerType(S.PointerType.Default));
                      else {
                        let t = !1;
                        if (
                          (0 === i.button &&
                            this.hasDragged &&
                            ((t = this.unitSelectionHandler.finishBoxSelect(i.pointer, !i.shiftKey)),
                            t || this.mapHoverHandler.update(i.pointer, !0)),
                          0 === i.button || 2 === i.button)
                        ) {
                          var s = this.isRightClickMove(),
                            a = i.button === (s ? 2 : 0),
                            n = this.isClickRange(i.pointer);
                          let e = !1;
                          var o = n && i.isTouch && 500 <= i.timeStamp - this.lastMouseDownEvent.timeStamp;
                          i.isTouch && this.mapHoverHandler.update(i.pointer, !0);
                          var l,
                            c = this.mapHoverHandler.getCurrentHover();
                          if (
                            (n &&
                              ((l = this.lastDefaultModeClickDetails),
                              (r = {
                                mouseUpEvent: i,
                                hoverObject: c?.gameObject,
                                selectionHash: this.unitSelectionHandler.getHash(),
                                time: Date.now(),
                              }),
                              l &&
                                (e =
                                  r.mouseUpEvent.button === l.mouseUpEvent.button &&
                                  r.hoverObject === l.hoverObject &&
                                  r.selectionHash === l.selectionHash &&
                                  r.time - l.time < 500),
                              (this.lastDefaultModeClickDetails = e ? void 0 : r)),
                            !a && (!s || !i.shiftKey || i.ctrlKey) && (!s || !e))
                          ) {
                            if (!n) return;
                            this.unitSelectionHandler.deselectAll();
                          }
                          (t || (!s && !a) || this.handleDefaultClickAction(s, a, e, o, i, c),
                            this.lastDefaultModeClickDetails &&
                              (this.lastDefaultModeClickDetails.selectionHash = this.unitSelectionHandler.getHash()));
                        }
                      }
                    }
                  }),
                  (this.handleWheel = (e) => {
                    this.cameraZoom.applyStep(0 < e.wheelDeltaY ? -0.1 : 0.1);
                  }),
                  (this.handleMinimapClick = (e) => {
                    this.executeMinimapClickCommand(e, !1);
                  }),
                  (this.handleMinimapRightClick = (e) => {
                    this.executeMinimapClickCommand(e, !0);
                  }),
                  (this.handleMinimapMouseOver = () => {
                    this.isMinimapHover = !0;
                  }),
                  (this.handleMinimapMouseMove = (e) => {
                    this.minimapHoverTile = e;
                    var t = this.minimapHandler.getHover(e);
                    this.currentMode
                      ? this.currentMode.hover(t, !0)
                      : this.updateDefaultAction(t, this.unitSelectionHandler.getSelectedUnits(), this.lastKeyMods);
                  }),
                  (this.handleMinimapMouseOut = () => {
                    (this.pointer.setPointerType(S.PointerType.Default),
                      (this.isMinimapHover = !1),
                      (this.minimapHoverTile = void 0));
                  }));
              }
              init() {
                this.initialized ||
                  (this.setupHandlers(),
                  this.worldScene.add(this.targetLines),
                  (this.initialized = !0),
                  (this.hasFaultyCtrlLeftClick = i.isMacFirefox()),
                  this.battleControlApi._setWorldInteraction(this),
                  this.battleControlApi._notifyToggle(!0));
              }
              setShroud(e) {
                (this.mapHoverHandler.setShroud(e), this.minimapHandler.setShroud(e));
              }
              setupHandlers() {
                (this.pointerEvents.addEventListener("canvas", "mousemove", this.handleMouseMove),
                  this.pointerEvents.addEventListener("canvas", "mousedown", this.handleMouseDown),
                  this.pointerEvents.addEventListener("canvas", "mouseup", this.handleMouseUp),
                  this.pointerEvents.addEventListener("canvas", "wheel", this.handleWheel),
                  this.document.addEventListener("keydown", this.handleKeyDown),
                  this.document.addEventListener("keyup", this.handleKeyUp),
                  this.mapHoverHandler.onHoverChange.subscribe(this.handleMapHoverChange),
                  this.renderer.onFrame.subscribe(this.handleFrame),
                  this.unitSelectionHandler.onUserSelectionChange.subscribe(this.handleSelectionChange),
                  this.minimapHandler.minimap.onClick.subscribe(this.handleMinimapClick),
                  this.minimapHandler.minimap.onRightClick.subscribe(this.handleMinimapRightClick),
                  this.minimapHandler.minimap.onMouseOver.subscribe(this.handleMinimapMouseOver),
                  this.minimapHandler.minimap.onMouseMove.subscribe(this.handleMinimapMouseMove),
                  this.minimapHandler.minimap.onMouseOut.subscribe(this.handleMinimapMouseOut),
                  this.tooltipHandler.init());
              }
              teardownHandlers() {
                (this.pointerEvents.removeEventListener("canvas", "mousemove", this.handleMouseMove),
                  this.pointerEvents.removeEventListener("canvas", "mousedown", this.handleMouseDown),
                  this.pointerEvents.removeEventListener("canvas", "mouseup", this.handleMouseUp),
                  this.pointerEvents.removeEventListener("canvas", "wheel", this.handleWheel),
                  this.document.removeEventListener("keydown", this.handleKeyDown),
                  this.document.removeEventListener("keyup", this.handleKeyUp),
                  this.mapHoverHandler.onHoverChange.unsubscribe(this.handleMapHoverChange),
                  this.renderer.onFrame.unsubscribe(this.handleFrame),
                  this.unitSelectionHandler.onUserSelectionChange.unsubscribe(this.handleSelectionChange),
                  this.unitSelectionHandler.cancelBoxSelect(),
                  this.minimapHandler.minimap.onClick.unsubscribe(this.handleMinimapClick),
                  this.minimapHandler.minimap.onRightClick.unsubscribe(this.handleMinimapRightClick),
                  this.minimapHandler.minimap.onMouseOver.unsubscribe(this.handleMinimapMouseOver),
                  this.minimapHandler.minimap.onMouseMove.unsubscribe(this.handleMinimapMouseMove),
                  this.minimapHandler.minimap.onMouseOut.unsubscribe(this.handleMinimapMouseOut),
                  this.tooltipHandler.dispose(),
                  this.mapScrollHandler.cancel(),
                  this.arrowScrollHandler.cancel(),
                  this.customScrollHandler.cancel());
              }
              dispose() {
                (this.initialized &&
                  this.enabled &&
                  (this.teardownHandlers(),
                  this.pointer.setPointerType(S.PointerType.Default),
                  this.battleControlApi._setWorldInteraction(void 0),
                  this.battleControlApi._notifyToggle(!1)),
                  this.currentMode?.dispose(),
                  this.mapScrollHandler.dispose(),
                  this.cameraPanHandler.dispose(),
                  this.mapHoverHandler.dispose(),
                  this.unitSelectionHandler.dispose(),
                  this.chatTypingHandler?.dispose(),
                  this.keyboardHandler.dispose(),
                  this.worldScene.remove(this.targetLines),
                  this.targetLines.dispose(),
                  this.tooltipHandler.dispose());
              }
              setEnabled(e) {
                this.enabled !== e &&
                  ((this.enabled = e)
                    ? this.setupHandlers()
                    : (this.teardownHandlers(),
                      this.cancelMouseUp(),
                      this.cancelKeyUp(),
                      this.pointer.setPointerType(S.PointerType.Default),
                      this.chatTypingHandler?.endTyping()),
                  this.battleControlApi._setWorldInteraction(e ? this : void 0),
                  this.battleControlApi._notifyToggle(e));
              }
              isEnabled() {
                return this.enabled;
              }
              pausePanning() {
                (this.cameraPanHandler.setPaused(!0), this.mapScrollHandler.setPaused(!0));
              }
              unpausePanning() {
                (this.cameraPanHandler.setPaused(!1), this.mapScrollHandler.setPaused(!1));
              }
              setMode(e) {
                var t;
                (this.currentMode !== e &&
                  (this.currentMode?.cancel?.(), this.pointer.setPointerType(S.PointerType.Default)),
                  (this.currentMode = e),
                  (this.clearModeOnSelectionChange = !1),
                  e &&
                    (this.unitSelectionHandler.cancelBoxSelect(),
                    this.unitSelectionHandler.deselectAll(),
                    (this.clearModeOnSelectionChange = !0),
                    e.enter(),
                    this.mapHoverHandler.update(this.pointer.getPosition(), !0),
                    (t = this.getCurrentHover()) && e.hover(t, this.isMinimapHover)));
              }
              getMode() {
                return this.currentMode;
              }
              getLastKeyModifiers() {
                return this.lastKeyMods;
              }
              registerKeyCommand(e, t) {
                return (this.keyboardHandler.registerCommand(e, t), this);
              }
              unregisterKeyCommand(e) {
                return (this.keyboardHandler.unregisterCommand(e), this);
              }
              applyKeyModifiers(e) {
                ((this.lastKeyMods = e),
                  this.currentMode ||
                    (this.maybePan && this.hasDragged) ||
                    this.mapScrollHandler.isScrolling() ||
                    this.updateDefaultAction(this.getCurrentHover(), this.unitSelectionHandler.getSelectedUnits(), e));
              }
              updateDefaultAction(e, t, i) {
                var r = this.mapScrollHandler.isScrolling();
                (e
                  ? (this.defaultActionHandler.update(e, t, this.isRightClickMove(), i, this.isMinimapHover),
                    r || this.pointer.setPointerType(this.defaultActionHandler.getPointerType(this.isMinimapHover)))
                  : r || this.pointer.setPointerType(this.isMinimapHover ? S.PointerType.Mini : S.PointerType.Default),
                  (this.lastDefaultActionUpdate = this.lastFrameTime));
              }
              processMouseMove(e) {
                var t = this.mapScrollHandler.isScrolling();
                (void 0 === this.mousePressed
                  ? e.isTouch || this.mapScrollHandler.update(e.pointer)
                  : this.hasDragged ||
                    this.isClickRange(e.pointer) ||
                    ((this.hasDragged = !0),
                    this.currentMode ||
                      0 !== this.mousePressed ||
                      this.unitSelectionHandler.startBoxSelect(this.clickOrigin)),
                  !this.currentMode ||
                    this.mapScrollHandler.isScrolling() ||
                    (this.maybePan && this.hasDragged) ||
                    (!this.isMinimapHover && t && this.pointer.setPointerType(S.PointerType.Default),
                    this.mapHoverHandler.update(e.pointer),
                    this.currentMode.hover(this.getCurrentHover(), this.isMinimapHover)),
                  void 0 === this.mousePressed
                    ? this.mapScrollHandler.isScrolling() ||
                      (this.mapHoverHandler.update(e.pointer),
                      this.currentMode ||
                        this.updateDefaultAction(
                          this.getCurrentHover(),
                          this.unitSelectionHandler.getSelectedUnits(),
                          e,
                        ))
                    : (!this.hasDragged ||
                      ((this.currentMode || (this.isRightClickMove() && 2 === this.mousePressed)) && !this.maybePan)
                        ? this.mapHoverHandler.update(e.pointer)
                        : this.mapHoverHandler.finish(),
                      this.hasDragged &&
                        (this.maybePan
                          ? this.cameraPanHandler.update(e.pointer, e.isTouch)
                          : this.currentMode ||
                            (this.isRightClickMove() && 2 === this.mousePressed) ||
                            (this.pointer.setPointerType(S.PointerType.Default),
                            this.unitSelectionHandler.updateBoxSelect(e.pointer)))));
              }
              handleDefaultClickAction(e, t, i, r, s, a) {
                var n, o;
                a &&
                  ((n = this.unitSelectionHandler.getSelectedUnits()),
                  (o = e ? (t ? l.ActionFilter.NoSelect : l.ActionFilter.SelectOnly) : l.ActionFilter.All),
                  this.defaultActionHandler.execute(a, n, o, e && !t, i, r ? { ...s, ctrlKey: !0 } : s));
              }
              cancelMouseUp() {
                void 0 !== this.mousePressed &&
                  ((this.pointerEvents.intersectionsEnabled = !0),
                  (this.mousePressed = void 0),
                  this.maybePan && ((this.maybePan = !1), this.cameraPanHandler.finish()),
                  this.currentMode && (this.currentMode.cancel?.(), (this.currentMode = void 0)),
                  this.unitSelectionHandler.cancelBoxSelect());
              }
              cancelKeyUp() {
                var e;
                "keydown" === this.lastKeyboardEvent?.type &&
                  ((e = new KeyboardEvent("keyup", {
                    key: this.lastKeyboardEvent.key,
                    keyCode: this.lastKeyboardEvent.keyCode,
                    ctrlKey: this.lastKeyboardEvent.ctrlKey,
                    altKey: this.lastKeyboardEvent.altKey,
                    shiftKey: this.lastKeyboardEvent.shiftKey,
                    metaKey: this.lastKeyboardEvent.metaKey,
                  })),
                  this.handleKeyUp(e));
              }
              isClickRange(e) {
                return Math.abs(e.x - this.clickOrigin.x) <= 7 && Math.abs(e.y - this.clickOrigin.y) <= 7;
              }
              isRightClickPanAllowed() {
                return this.rightClickScroll.value;
              }
              isRightClickMove() {
                return this.rightClickMove.value;
              }
              executeMinimapClickCommand(e, t) {
                let i = !1;
                var r, s;
                (t === this.isRightClickMove() &&
                  ((r = this.minimapHandler.getHover(e)),
                  this.currentMode
                    ? !1 !== this.currentMode.execute(r, !0) && ((this.currentMode = void 0), (i = !0))
                    : ((s = this.unitSelectionHandler.getSelectedUnits()),
                      (i = this.defaultActionHandler.execute(r, s, l.ActionFilter.All, !1, !1, this.lastKeyMods, !0)))),
                  i || this.minimapHandler.panToTile(e));
              }
              getCurrentHover() {
                return this.isMinimapHover
                  ? this.minimapHoverTile
                    ? this.minimapHandler.getHover(this.minimapHoverTile)
                    : void 0
                  : this.mapHoverHandler.getCurrentHover();
              }
            }),
          ));
      },
    };
  },
);
