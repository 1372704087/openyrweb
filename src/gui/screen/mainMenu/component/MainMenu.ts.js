// === Reconstructed SystemJS module: gui/screen/mainMenu/component/MainMenu ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/HtmlContainer","gui/screen/mainMenu/component/MenuVideo","gui/component/MenuButton","util/event","gui/screen/mainMenu/component/MenuSlotAnimationRunner","gui/jsx/HtmlView","gui/screen/mainMenu/component/MenuMpSlotAnimRunner","gui/screen/mainMenu/component/MenuMpSlotText","gui/screen/mainMenu/component/SidebarPreview","gui/screen/mainMenu/component/MenuTooltip","gui/screen/mainMenu/component/VersionString"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/component/MainMenu",
  [
    "gui/jsx/jsx",
    "gui/UiObject",
    "gui/HtmlContainer",
    "gui/screen/mainMenu/component/MenuVideo",
    "gui/component/MenuButton",
    "util/event",
    "gui/screen/mainMenu/component/MenuSlotAnimationRunner",
    "gui/jsx/HtmlView",
    "gui/screen/mainMenu/component/MenuMpSlotAnimRunner",
    "gui/screen/mainMenu/component/MenuMpSlotText",
    "gui/screen/mainMenu/component/SidebarPreview",
    "gui/screen/mainMenu/component/MenuTooltip",
    "gui/screen/mainMenu/component/VersionString",
  ],
  function (e, t) {
    "use strict";
    var n, i, s, a, o, l, c, h, u, d, g, p, m, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        ((r = class extends i.UiObject {
          constructor(e, t, i, r) {
            (super(new THREE.Object3D(), new s.HtmlContainer()),
              (this.viewport = e),
              (this.images = t),
              (this.jsxRenderer = i),
              (this.videoSrc = r),
              (this.rootObjects = []),
              (this.sidebarObjects = []),
              (this.sidebarSlots = []),
              (this.sidebarMpSlotEnabled = !1),
              (this.sidebarButtons = []),
              (this.sidebarButtonConfigs = []),
              (this.sidebarCollapsed = !0),
              (this.defaultBackgroundImageName = "mnscrnl.shp"),
              (this.backgroundImageName = this.defaultBackgroundImageName),
              (this._onSidebarToggle = new l.EventDispatcher()),
              this.create3DObject());
          }
          get onSidebarToggle() {
            return this._onSidebarToggle;
          }
          setViewport(e) {
            ((this.viewport = e), this.setPosition(this.viewport.x, this.viewport.y));
            var t = this.getImage("lwscrnl.shp");
            this.statusBar.setPosition(0, this.viewport.height - t.height);
            var i = this.getImage("sdtp.shp"),
              t = this.computeSidebarViewport(i);
            (this.sidebarContainer.setPosition(t.x, t.y),
              this.sidebarContainer.remove(...this.sidebarObjects),
              this.sidebarObjects.forEach((e) => e.destroy()),
              this.createSidebarButtons(this.computeSidebarButtonsViewport(i)),
              this.updateButtons(this.sidebarButtonsRawConfigs ?? []),
              this.sidebarCollapsed || this.showButtons());
          }
          setContentComponent(e) {
            let t = this.mainContainer;
            (this.contentComponent &&
              (t.remove(this.contentComponent), this.contentComponent.destroy(), (this.contentComponent = void 0)),
              e && (t.add(e), (this.contentComponent = e)));
          }
          setSlots(r, s, a = !1) {
            let n = this.sidebarSlots.length;
            if (!n) throw new Error("Cannot call setButtons prior to render");
            (this.sidebarMpSlotContainer.setVisible(a),
              this.sidebarSlots[0].setVisible(!a),
              this.sidebarSlots.forEach((e, t) => {
                let i = e.getAnimationRunner();
                t < r + (a ? 1 : 0)
                  ? (i.buttonState = c.MenuButtonState.Unlit)
                  : t === n - 1
                    ? (i.buttonState = s ? c.MenuButtonState.Unlit : c.MenuButtonState.Hidden)
                    : (i.buttonState = c.MenuButtonState.Hidden);
              }));
          }
          setButtons(e, t = !1) {
            ((this.sidebarButtonsRawConfigs = e), (this.sidebarMpSlotEnabled = t), this.updateButtons(e));
          }
          updateButtons(e) {
            let r = this.sidebarMpSlotEnabled;
            var t = !!e.find((e) => !!e.isBottom);
            (this.setSlots(e.length - (t ? 1 : 0), t, r),
              this.updateSidebarMpContent(),
              this.sidebarButtons.forEach((e) => e.applyOptions((e) => (e.buttonConfig = void 0))),
              e.forEach((t, e) => {
                var i = t.isBottom ? this.sidebarButtons.length - 1 : r ? e + 1 : e;
                ((this.sidebarButtonConfigs[i] = t),
                  this.sidebarButtons[i]?.applyOptions(
                    (e) => (e.buttonConfig = { label: t.label, tooltip: t.tooltip, disabled: !!t.disabled }),
                  ));
              }),
              (this.sidebarNeedsRefresh = !0));
          }
          isSidebarCollapsed() {
            return this.sidebarCollapsed;
          }
          showButtons() {
            ((this.sidebarCollapsed = !1),
              (this.sidebarNeedsRefresh = !0),
              this.sidebarMpSlot.getAnimationRunner().slideIn(),
              this.sidebarSlots.forEach((e) => {
                let t = e.getAnimationRunner();
                t.slideIn();
              }));
          }
          hideButtons() {
            ((this.sidebarCollapsed = !0),
              this.updateSidebarButtons(),
              (this.sidebarNeedsRefresh = !0),
              this.sidebarMpSlot.getAnimationRunner().slideOut(),
              this.sidebarSlots.forEach((e) => {
                let t = e.getAnimationRunner();
                t.slideOut();
              }));
          }
          setSidebarTitle(e) {
            this.sidebarPreview.setTitle(e);
          }
          toggleSidebarPreview(e) {
            this.sidebarPreview.toggleSidebarPreview(e);
          }
          setSidebarPreview(e) {
            (this.sidebarPreviewInner && this.sidebarPreviewInner.destroy(),
              this.sidebarPreview.setPreview(e),
              (this.sidebarPreviewInner = e));
          }
          getSidebarPreviewSize() {
            return this.sidebarPreview.getPreviewSize();
          }
          toggleVideo(e) {
            if (!this.menuVideo) throw new Error("Cannot call toggleVideo prior to render");
            this.menuVideo.getUiObject().setVisible(e);
          }
          showVersion(t) {
            (this.version.getUiObject().setVisible(!0), this.version.getElement().applyOptions((e) => (e.value = t)));
          }
          hideVersion() {
            this.version.getUiObject().setVisible(!1);
          }
          setSidebarMpContent(e) {
            ((this.sidebarMpSlotContent = e), this.updateSidebarMpContent());
          }
          updateSidebarMpContent() {
            this.sidebarMpSlotContentEl.applyOptions((e) => {
              this.sidebarMpSlotContent &&
                ((e.text = this.sidebarMpSlotContent.text),
                (e.icon = this.sidebarMpSlotContent.icon),
                (e.tooltip = this.sidebarMpSlotContent.tooltip));
            });
          }
          getImage(e) {
            var t = this.images.get(e);
            if (!t) throw new Error(`Missing image "${e}"`);
            return t;
          }
          setBackgroundImageName(e) {
            if (this.backgroundImageName === e) return;
            this.backgroundOverlay.setVisible(!1);
            if (e === this.defaultBackgroundImageName) return void (this.backgroundImageName = e);
            try {
              var t = e.replace(/\.shp$/i, ".pal"),
                i = this.getImage(e),
                [r] = this.jsxRenderer.render(n.jsx("sprite", { image: i, palette: t, zIndex: 1 }));
              this.mainContainer.remove(this.backgroundOverlay),
                this.backgroundOverlay.destroy(),
                this.mainContainer.add(r),
                (this.backgroundOverlay = r),
                (this.backgroundImageName = e),
                this.backgroundOverlay.setVisible(!0);
            } catch (r) {
              console.error("Failed to load background image " + e, r);
              this.mainContainer.remove(this.backgroundOverlay);
              this.backgroundOverlay.destroy();
              this.backgroundImageName = this.defaultBackgroundImageName;
            }
          }
          create3DObject() {
            var e, t, i, r, s;
            (super.create3DObject(),
              this.rootObjects.length ||
                (this.setPosition(this.viewport.x, this.viewport.y),
                (e = this.getImage("mnscrnl.shp")),
                (t = this.getImage("lwscrnl.shp")),
                (i = this.getImage("sdtp.shp")),
                (r = this.getImage("sdwrnanm.shp")),
                (s = this.computeSidebarViewport(i)),
                (this.rootObjects = this.jsxRenderer.render(
                  n.jsx(
                    "fragment",
                    null,
                    n.jsx(
                      "container",
                      { width: e.width, height: e.height, ref: (e) => (this.mainContainer = e) },
                      n.jsx("sprite", { image: e, palette: "shell.pal", ref: (e) => (this.backgroundSprite = e) }),
                      n.jsx("sprite", {
                        image: e,
                        palette: "shell.pal",
                        hidden: !0,
                        zIndex: 1,
                        ref: (e) => (this.backgroundOverlay = e),
                      }),
                      n.jsx(h.HtmlView, {
                        component: a.MenuVideo,
                        props: { src: this.videoSrc },
                        hidden: !0,
                        ref: (e) => (this.menuVideo = e),
                      }),
                    ),
                    n.jsx(
                      "container",
                      { x: 0, y: this.viewport.height - t.height, ref: (e) => (this.statusBar = e) },
                      n.jsx("sprite", { image: t, palette: "shell.pal" }),
                      n.jsx(h.HtmlView, {
                        component: p.MenuTooltip,
                        props: { monitorContainer: this.getHtmlContainer() },
                        width: t.width,
                        height: t.height,
                      }),
                    ),
                    n.jsx(
                      "container",
                      { x: s.x, y: s.y, ref: (e) => (this.sidebarContainer = e) },
                      n.jsx(g.SidebarPreview, {
                        sdtpImg: i,
                        sdtpAnimImg: r,
                        closed: !0,
                        ref: (e) => (this.sidebarPreview = e),
                      }),
                      n.jsx(h.HtmlView, {
                        component: m.VersionString,
                        props: { value: "" },
                        width: s.width,
                        y: s.height - 20,
                        ref: (e) => (this.version = e),
                        hidden: !0,
                      }),
                    ),
                  ),
                )),
                this.add(...this.rootObjects),
                this.createSidebarButtons(this.computeSidebarButtonsViewport(i))));
          }
          createSidebarButtons(r) {
            let s = this.getImage("sdbtnbkgd.shp"),
              a = this.getImage("sdbtnanm.shp");
            var e = Math.floor(r.height / s.height);
            let t = this.getImage("sdbtm.shp");
            var i = r.height - s.height * e,
              i = t.clip(t.width, i);
            ((this.sidebarSlots = []),
              (this.sidebarButtons = []),
              (this.sidebarObjects = this.jsxRenderer.render(
                n.jsx(
                  "fragment",
                  null,
                  new Array(e).fill(0).map((e, t) => {
                    let i = new c.MenuSlotAnimationRunner(t);
                    return n.jsx(
                      "fragment",
                      null,
                      n.jsx(
                        "container",
                        { x: r.x, y: r.y + s.height * t },
                        n.jsx("sprite", { image: s, palette: "shell2.pal" }),
                        t
                          ? []
                          : n.jsx(
                              "container",
                              {
                                zIndex: 1,
                                hidden: !0,
                                ref: (e) => (this.sidebarMpSlotContainer = e),
                                x: 12,
                                y: -s.height,
                              },
                              n.jsx("sprite", {
                                image: "sdmpbtn.shp",
                                palette: "shell.pal",
                                ref: (e) => (this.sidebarMpSlot = e),
                                animationRunner: new u.MenuMpSlotAnimRunner(),
                              }),
                              n.jsx(h.HtmlView, {
                                component: d.MenuMpSlotText,
                                props: { text: "" },
                                width: 146,
                                height: 2 * s.height,
                                innerRef: (e) => (this.sidebarMpSlotContentEl = e),
                              }),
                            ),
                        n.jsx("sprite", {
                          image: a,
                          palette: "sdbtnanm.pal",
                          ref: (e) => this.sidebarSlots.push(e),
                          x: 12,
                          animationRunner: i,
                        }),
                        n.jsx(h.HtmlView, {
                          x: 12,
                          hidden: !0,
                          innerRef: (e) => this.sidebarButtons.push(e),
                          component: o.MenuButton,
                          props: {
                            box: { x: 0, y: 0, width: 146, height: a.height },
                            onMouseDown: () => {
                              i.buttonState = c.MenuButtonState.Active;
                              let e = () => {
                                ((i.buttonState = c.MenuButtonState.Normal),
                                  document.removeEventListener("mouseup", e));
                              };
                              document.addEventListener("mouseup", e);
                            },
                            onClick: () => {
                              this.onSidebarButtonClick(t);
                            },
                          },
                        }),
                      ),
                    );
                  }),
                  n.jsx("sprite", { image: i, palette: "shell.pal", x: r.x, y: r.y + s.height * e }),
                ),
              )),
              this.sidebarContainer.add(...this.sidebarObjects));
          }
          computeSidebarViewport(e) {
            return { x: this.viewport.width - e.width, y: 0, width: e.width, height: this.viewport.height };
          }
          computeSidebarButtonsViewport(e) {
            return { x: 0, y: e.height, width: e.width, height: this.viewport.height - e.height };
          }
          update(e) {
            if ((super.update(e), this.sidebarNeedsRefresh)) {
              let e = this.sidebarSlots[this.sidebarSlots.length - 1],
                t = e.getAnimationRunner();
              t.isStopped() &&
                (this.updateSidebarButtons(), this._onSidebarToggle.dispatch(this, !this.sidebarCollapsed));
            }
          }
          updateSidebarButtons() {
            (this.sidebarCollapsed
              ? (this.sidebarButtons.forEach((e) => e.hide()),
                this.sidebarMpSlotContentEl.hide(),
                this.sidebarSlots.forEach((e) => {
                  let t = e.getAnimationRunner();
                  t.buttonState !== c.MenuButtonState.Hidden && (t.buttonState = c.MenuButtonState.Unlit);
                }))
              : (this.sidebarButtons.forEach((e) => e.show()),
                this.sidebarMpSlotContentEl.show(),
                this.sidebarSlots.forEach((e, t) => {
                  let i = e.getAnimationRunner();
                  i.buttonState !== c.MenuButtonState.Hidden &&
                    i.buttonState !== c.MenuButtonState.Active &&
                    (i.buttonState = this.sidebarButtonConfigs[t]?.flashing
                      ? c.MenuButtonState.Flashing
                      : c.MenuButtonState.Normal);
                })),
              (this.sidebarNeedsRefresh = !1));
          }
          onSidebarButtonClick(e) {
            const t = this.sidebarButtonConfigs[e].onClick;
            t && t();
          }
          destroy() {
            ((this.sidebarButtons.length = 0),
              this.remove(...this.rootObjects),
              this.rootObjects.forEach((e) => e.destroy()),
              (this.rootObjects.length = 0),
              super.destroy());
          }
        }),
          e("MainMenu", r));
      },
    };
  },
);
