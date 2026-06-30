// === Reconstructed SystemJS module: gui/screen/game/component/Hud ===
// deps: ["gui/jsx/jsx","data/ShpFile","game/SideType","gui/screen/game/component/hud/SidebarCard","gui/screen/game/component/hud/SidebarTabs","gui/screen/game/component/hud/SidebarIconButton","gui/screen/game/component/hud/SidebarMenu","gui/UiObject","gui/HtmlContainer","util/event","gui/screen/game/component/hud/GameMenuContentArea","gui/screen/game/component/hud/SidebarPower","gui/screen/game/component/hud/SidebarCredits","gui/screen/game/component/hud/SidebarRadar","gui/screen/game/component/hud/viewmodel/CombatantSidebarModel","gui/screen/game/component/hud/SidebarGameTime","gui/screen/game/component/hud/Messages","gui/screen/game/component/hud/SuperWeaponTimers","engine/renderable/builder/ShpAggregator","gui/screen/game/component/hud/commandBar/CommandBarButtonType","gui/screen/game/component/hud/commandBar/commandButtonConfigs","util/typeGuard","gui/screen/game/component/hud/DebugText","engine/Engine","engine/EngineType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/Hud",
  [
    "gui/jsx/jsx",
    "data/ShpFile",
    "game/SideType",
    "gui/screen/game/component/hud/SidebarCard",
    "gui/screen/game/component/hud/SidebarTabs",
    "gui/screen/game/component/hud/SidebarIconButton",
    "gui/screen/game/component/hud/SidebarMenu",
    "gui/UiObject",
    "gui/HtmlContainer",
    "util/event",
    "gui/screen/game/component/hud/GameMenuContentArea",
    "gui/screen/game/component/hud/SidebarPower",
    "gui/screen/game/component/hud/SidebarCredits",
    "gui/screen/game/component/hud/SidebarRadar",
    "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel",
    "gui/screen/game/component/hud/SidebarGameTime",
    "gui/screen/game/component/hud/Messages",
    "gui/screen/game/component/hud/SuperWeaponTimers",
    "engine/renderable/builder/ShpAggregator",
    "gui/screen/game/component/hud/commandBar/CommandBarButtonType",
    "gui/screen/game/component/hud/commandBar/commandButtonConfigs",
    "util/typeGuard",
    "gui/screen/game/component/hud/DebugText",
    "engine/Engine",
    "engine/EngineType",
  ],
  function (e, t) {
    "use strict";
    var Q, r, Y, Z, X, J, i, s, y, T, ee, te, ie, re, se, ae, ne, oe, le, c, ce, he, ue, de, ge, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          Q = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          Y = e;
        },
        function (e) {
          Z = e;
        },
        function (e) {
          X = e;
        },
        function (e) {
          J = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          ee = e;
        },
        function (e) {
          te = e;
        },
        function (e) {
          ie = e;
        },
        function (e) {
          re = e;
        },
        function (e) {
          se = e;
        },
        function (e) {
          ae = e;
        },
        function (e) {
          ne = e;
        },
        function (e) {
          oe = e;
        },
        function (e) {
          le = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          ce = e;
        },
        function (e) {
          he = e;
        },
        function (e) {
          ue = e;
        },
        function (e) {
          de = e;
        },
        function (e) {
          ge = e;
        },
      ],
      execute: function () {
        ((a = class extends s.UiObject {
          constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f) {
            (super(new THREE.Object3D(), new y.HtmlContainer()),
              (this.sideType = e),
              (this.viewport = t),
              (this.images = i),
              (this.palettes = r),
              (this.cameoFilenames = s),
              (this.sidebarModel = a),
              (this.messageList = n),
              (this.chatHistory = o),
              (this.debugTextValue = l),
              (this.debugTextEnabled = c),
              (this.localPlayer = h),
              (this.players = u),
              (this.stalemateDetectTrait = d),
              (this.countdownTimer = g),
              (this.jsxRenderer = p),
              (this.strings = m),
              (this.commandBarButtonTypes = f),
              (this._onDiploButtonClick = new T.EventDispatcher()),
              (this._onOptButtonClick = new T.EventDispatcher()),
              (this._onRepairButtonClick = new T.EventDispatcher()),
              (this._onSellButtonClick = new T.EventDispatcher()),
              (this._onSidebarSlotClick = new T.EventDispatcher()),
              (this._onSidebarTabClick = new T.EventDispatcher()),
              (this._onCreditsTick = new T.EventDispatcher()),
              (this._onMessagesTick = new T.EventDispatcher()),
              (this._onMessageSubmit = new T.EventDispatcher()),
              (this._onMessageCancel = new T.EventDispatcher()),
              (this._onScrollButtonClick = new T.EventDispatcher()),
              (this._onCommandBarButtonClick = new T.EventDispatcher()),
              (this.commandBarButtons = []),
              this.init());
          }
          get onDiploButtonClick() {
            return this._onDiploButtonClick.asEvent();
          }
          get onOptButtonClick() {
            return this._onOptButtonClick.asEvent();
          }
          get onRepairButtonClick() {
            return this._onRepairButtonClick.asEvent();
          }
          get onSellButtonClick() {
            return this._onSellButtonClick.asEvent();
          }
          get onSidebarSlotClick() {
            return this._onSidebarSlotClick.asEvent();
          }
          get onSidebarTabClick() {
            return this._onSidebarTabClick.asEvent();
          }
          get onCreditsTick() {
            return this._onCreditsTick.asEvent();
          }
          get onMessagesTick() {
            return this._onMessagesTick.asEvent();
          }
          get onMessageSubmit() {
            return this._onMessageSubmit.asEvent();
          }
          get onMessageCancel() {
            return this._onMessageCancel.asEvent();
          }
          get onScrollButtonClick() {
            return this._onScrollButtonClick.asEvent();
          }
          get onCommandBarButtonClick() {
            return this._onCommandBarButtonClick.asEvent();
          }
          getImage(e) {
            var t = this.images.get(e);
            if (!t) throw new Error(`Missing image "${e}"`);
            return t;
          }
          init() {
            const i = this.palettes.get("sidebar.pal");
            if (!i) throw new Error('Missing palette "sidebar.pal"');
            // OpenYRWeb: YR-only — the engine check is always true; keep the Yuri-side
            // (ThirdSide) styling branch for Yuri faction UI.
            var e = this.sideType === Y.SideType.ThirdSide,
              t = this.getImage("credits.shp"),
              r = this.getImage("top.shp"),
              s = e ? this.getImage("radary.shp") : this.getImage("radar.shp"),
              a = e ? this.palettes.get("radaryuri.pal") : i;
            if (!a) throw new Error('Missing palette "radaryuri.pal"');
            var n = this.getImage("side1.shp");
            let o = this.getImage("side2.shp"),
              l = this.getImage("side2b.shp");
            var c = this.getImage("side3.shp"),
              h = this.getImage("addon.shp");
            let u = this.getImage("tab00.shp"),
              d = this.getImage("tab01.shp"),
              g = this.getImage("tab02.shp"),
              p = this.getImage("tab03.shp"),
              m = this.getImage("diplobtn.shp"),
              f = this.getImage("optbtn.shp"),
              y = this.getImage("repair.shp"),
              T = this.getImage("sell.shp"),
              v = this.getImage("r-up.shp"),
              b = this.getImage("r-dn.shp");
            var S = [
              ...new Set(
                this.commandBarButtonTypes.map((t) => ce.commandButtonConfigs.find((e) => e.type === t)?.icon),
              ),
            ]
              .map((e) => (e ? this.images.get(e) : void 0))
              .filter(he.isNotNullOrUndefined);
            let w = new le.ShpAggregator(),
              E = w.aggregate(
                [m, f, y, T, u, d, g, p, b, v, ...S].map((e) => le.ShpAggregator.getShpFrameInfo(e, !1)),
                "agg_hud.shp",
              );
            var C = (this.sidebarWidth = t.width),
              x = { x: this.viewport.width - C, y: 0, width: C, height: this.viewport.height },
              O = t.height + r.height,
              A = O + s.height;
            let M = O + s.height + n.height;
            var R = (this.repeaterCount = Math.floor((x.height - M - c.height) / o.height));
            let P = (this.repeaterHeight = o.height);
            var I = O + s.height + n.height + P * R;
            let k = this.getImage("lendcap.shp");
            var B = (this.actionBarHeight = k.height),
              N = this.viewport.y + this.viewport.height - B;
            let j = this.getImage("bttnbkgd.shp");
            var L = this.getImage("rendcap.shp"),
              D = x.x - k.width - L.width,
              F = Math.floor(D / j.width),
              _ = D % j.width;
            let U;
            _ && (U = j.clip(_, j.height));
            let H = { x: 12, y: 4 };
            this.sideType !== Y.SideType.GDI && (H = { x: 14, y: 5 });
            let G = { x: 20, y: 8 };
            this.sideType !== Y.SideType.GDI && (G = { x: 34, y: 7 });
            let V = 1,
              W = { x: 26, y: -3 };
            this.sideType !== Y.SideType.GDI && ((V = 0), (W = { x: 20, y: -2 }));
            e = this.palettes.get("cameo.pal");
            if (!e) throw new Error('Missing palette "cameo.pal"');
            ((S = this.buildCameoFile()), (C = this.createCameoNameToIdMap()));
            let z = 22,
              K = 1;
            B = this.sideType === Y.SideType.GDI ? { x: 5, y: 2 } : { x: 0, y: 0 };
            let q = 38,
              $ = 7;
            ((D = this.getImage("powerp.shp")), (_ = this.getTextColor()));
            this.add(
              ...this.jsxRenderer.render(
                Q.jsx(
                  "fragment",
                  null,
                  Q.jsx(
                    "container",
                    { x: x.x, y: x.y },
                    Q.jsx(
                      "sprite-batch",
                      null,
                      Q.jsx("sprite", { static: !0, image: t, palette: i }),
                      Q.jsx(
                        "container",
                        { ref: (e) => (this.sidebarTop = e), zIndex: 1 },
                        this.sidebarModel instanceof se.CombatantSidebarModel
                          ? Q.jsx(ie.SidebarCredits, {
                              sidebarModel: this.sidebarModel,
                              height: t.height,
                              width: t.width,
                              textColor: _,
                              onTick: (e) => this._onCreditsTick.dispatch(this, e),
                            })
                          : Q.jsx(ae.SidebarGameTime, {
                              sidebarModel: this.sidebarModel,
                              height: t.height,
                              width: t.width,
                              textColor: _,
                            }),
                      ),
                      Q.jsx("sprite", { static: !0, image: r, palette: i, y: t.height }),
                      Q.jsx("sprite", { static: !0, image: s, palette: a, y: O }),
                      Q.jsx(re.SidebarRadar, {
                        image: s,
                        palette: a,
                        y: O,
                        sidebarModel:
                          this.sidebarModel instanceof se.CombatantSidebarModel ? this.sidebarModel : void 0,
                        zIndex: 1,
                        ref: (e) => (this.sidebarRadar = e),
                      }),
                      Q.jsx("sprite", { static: !0, image: n, palette: i, y: A }),
                      new Array(R)
                        .fill(0)
                        .map((e, t) => Q.jsx("sprite", { static: !0, image: l, palette: i, y: M + P * t })),
                      Q.jsx(
                        "sprite-batch",
                        { ref: (e) => (this.sideCameoRepeaters = e) },
                        new Array(R)
                          .fill(0)
                          .map((e, t) =>
                            Q.jsx("sprite", { static: !0, image: o, palette: i, y: M + P * t, zIndex: 1 }),
                          ),
                      ),
                      Q.jsx(te.SidebarPower, {
                        sidebarModel: this.sidebarModel,
                        powerImg: D,
                        palette: i,
                        x: B.x,
                        y: M,
                        height: P * R + B.y,
                        ref: (e) => (this.sidebarPower = e),
                        zIndex: 2,
                        strings: this.strings,
                      }),
                      Q.jsx(Z.SidebarCard, {
                        cameoImages: S,
                        cameoPalette: e,
                        cameoNameToIdMap: C,
                        sidebarModel: this.sidebarModel,
                        slots: 2 * R,
                        onSlotClick: (e) => this._onSidebarSlotClick.dispatch(this, e),
                        x: z,
                        y: M + K,
                        strings: this.strings,
                        textColor: _,
                        ref: (e) => (this.sidebarCard = e),
                        zIndex: 2,
                      }),
                      Q.jsx("container", {
                        ref: (e) => (this.sidebarMenuContainer = e),
                        x: z - 1,
                        y: M + K,
                        zIndex: 2,
                      }),
                      Q.jsx("sprite", { static: !0, image: c, palette: i, y: I }),
                      Q.jsx("sprite", { static: !0, image: h, palette: i, y: I + c.height }),
                    ),
                  ),
                  Q.jsx(
                    "container",
                    { x: x.x, y: x.y, ref: (e) => (this.sidebarButtonsContainer = e), zIndex: 2 },
                    Q.jsx(J.SidebarIconButton, {
                      image: E.file,
                      palette: i,
                      imageFrameOffset: E.imageIndexes.get(m),
                      x: H.x,
                      y: t.height + H.y,
                      onClick: () => this._onDiploButtonClick.dispatch(this, void 0),
                      tooltip: this.strings.get("Tip:DiplomacyButton"),
                    }),
                    Q.jsx(J.SidebarIconButton, {
                      image: E.file,
                      palette: i,
                      imageFrameOffset: E.imageIndexes.get(f),
                      x: H.x + m.width,
                      y: t.height + H.y,
                      onClick: () => this._onOptButtonClick.dispatch(this, void 0),
                      tooltip: this.strings.get("Tip:OptionsButton"),
                    }),
                    Q.jsx(J.SidebarIconButton, {
                      image: E.file,
                      palette: i,
                      imageFrameOffset: E.imageIndexes.get(y),
                      x: G.x,
                      y: A + G.y,
                      toggle: this.sidebarModel.repairMode,
                      ref: (e) => (this.repairButton = e),
                      onClick: () => this._onRepairButtonClick.dispatch(this, void 0),
                      tooltip: this.strings.get("TXT_REPAIR_MODE"),
                    }),
                    Q.jsx(J.SidebarIconButton, {
                      image: E.file,
                      palette: i,
                      imageFrameOffset: E.imageIndexes.get(T),
                      x: G.x + y.width,
                      y: A + G.y,
                      toggle: this.sidebarModel.sellMode,
                      ref: (e) => (this.sellButton = e),
                      onClick: () => this._onSellButtonClick.dispatch(this, void 0),
                      tooltip: this.strings.get("TXT_SELL_MODE"),
                    }),
                    Q.jsx(X.SidebarTabs, {
                      aggregatedImageData: E,
                      images: [u, d, g, p],
                      palette: i,
                      sidebarModel: this.sidebarModel,
                      tabSpacing: V,
                      onTabClick: (e) => {
                        (this.sidebarModel.selectTab(e.id), this._onSidebarTabClick.dispatch(this, e.id));
                      },
                      strings: this.strings,
                      x: W.x,
                      y: M - u.height + W.y,
                    }),
                    Q.jsx(J.SidebarIconButton, {
                      image: E.file,
                      palette: i,
                      disabled: !0,
                      imageFrameOffset: E.imageIndexes.get(b),
                      x: q,
                      y: I + $,
                      ref: (e) => (this.pgDnButton = e),
                      onClick: () => this._onScrollButtonClick.dispatch(this, this.sidebarCard.pageDown()),
                    }),
                    Q.jsx(J.SidebarIconButton, {
                      image: E.file,
                      palette: i,
                      disabled: !0,
                      imageFrameOffset: E.imageIndexes.get(v),
                      x: q + b.width,
                      y: I + $,
                      ref: (e) => (this.pgUpButton = e),
                      onClick: () => this._onScrollButtonClick.dispatch(this, this.sidebarCard.pageUp()),
                    }),
                  ),
                  Q.jsx(
                    "container",
                    { x: this.viewport.x, y: N },
                    Q.jsx(
                      "container",
                      { x: k.width, zIndex: 1 },
                      this.renderCommandBarButtons(E, this.commandBarButtonTypes, j.width, F),
                    ),
                    Q.jsx(
                      "sprite-batch",
                      null,
                      Q.jsx("sprite", { static: !0, image: k, palette: i }),
                      new Array(F)
                        .fill(0)
                        .map((e, t) => Q.jsx("sprite", { static: !0, image: j, palette: i, x: k.width + j.width * t })),
                      U ? Q.jsx("sprite", { static: !0, image: U, palette: i, x: k.width + F * j.width }) : [],
                      Q.jsx("sprite", { static: !0, image: L, palette: i, x: x.x - L.width }),
                    ),
                  ),
                  Q.jsx(ne.Messages, {
                    messages: this.messageList,
                    chatHistory: this.chatHistory,
                    width: x.x - 10,
                    height: 200,
                    ref: (e) => (this.messages = e),
                    strings: this.strings,
                    onMessageTick: () => this._onMessagesTick.dispatch(this),
                    onMessageSubmit: (e) => this._onMessageSubmit.dispatch(this, e),
                    onMessageCancel: () => this._onMessageCancel.dispatch(this),
                  }),
                  Q.jsx(ue.DebugText, {
                    text: this.debugTextValue,
                    visible: this.debugTextEnabled,
                    color: new THREE.Color(16777215),
                    x: 20,
                    y: 200,
                    width: Math.floor(x.x / 2),
                    height: 200,
                    ref: (e) => (this.debugText = e),
                  }),
                  Q.jsx(oe.SuperWeaponTimers, {
                    localPlayer: this.localPlayer,
                    players: this.players,
                    stalemateDetectTrait: this.stalemateDetectTrait,
                    countdownTimer: this.countdownTimer,
                    strings: this.strings,
                    width: 200,
                    height: 500,
                    x: x.x - 200,
                    y: N - 500,
                    ref: (e) => (this.superWeaponTimers = e),
                  }),
                  Q.jsx(ee.GameMenuContentArea, {
                    hidden: !0,
                    screenSize: this.viewport,
                    viewport: { x: this.viewport.x, y: this.viewport.y, width: x.x, height: N },
                    sideType: this.sideType,
                    images: this.images,
                    ref: (e) => (this.menuContentContainer = e.getUiObject()),
                    innerRef: (e) => (this.menuContentContainerInner = e),
                  }),
                ),
              ),
            );
          }
          getTextColor() {
            return this.sideType === Y.SideType.GDI ? "rgb(165,211,255)" : "yellow";
          }
          createSidebarMenu(e) {
            return this.jsxRenderer.render(
              Q.jsx(i.SidebarMenu, {
                buttonImg: this.getImage("sidebttn.shp"),
                buttonPal: "sidebar.pal",
                menuHeight: this.repeaterHeight * this.repeaterCount - 2,
                buttons: e,
              }),
            )[0];
          }
          showSidebarMenu(e) {
            (this.destroySidebarMenu(),
              (this.sidebarMenu = this.createSidebarMenu(e)),
              this.sidebarMenuContainer.add(this.sidebarMenu),
              this.sideCameoRepeaters.setVisible(!1),
              this.remove(this.sidebarButtonsContainer),
              this.sidebarCard.hide(),
              this.sidebarPower.hide(),
              this.sidebarTop?.setVisible(!1),
              this.sidebarRadar?.hide(),
              this.commandBarButtons?.forEach((e) => e.getUiObject().setVisible(!1)),
              this.messages.getUiObject().setVisible(!1),
              this.debugText.getUiObject().setVisible(!1),
              this.superWeaponTimers.getUiObject().setVisible(!1));
          }
          hideSidebarMenu() {
            (this.sideCameoRepeaters.setVisible(!0),
              this.destroySidebarMenu(),
              this.add(this.sidebarButtonsContainer),
              this.sidebarCard.show(),
              this.sidebarPower.show(),
              this.sidebarTop?.setVisible(!0),
              this.sidebarRadar?.show(),
              this.commandBarButtons?.forEach((e) => e.getUiObject().setVisible(!0)),
              this.messages.getUiObject().setVisible(!0),
              this.debugText.getUiObject().setVisible(!0),
              this.superWeaponTimers.getUiObject().setVisible(!0));
          }
          setMenuContentComponent(e) {
            let t = this.menuContentContainerInner;
            (this.menuContent && (t.remove(this.menuContent), this.menuContent.destroy(), (this.menuContent = void 0)),
              e && (t.add(e), (this.menuContent = e)));
          }
          setMinimap(e) {
            this.sidebarRadar.setMinimap(e);
          }
          toggleMenuContentVisibility(e) {
            this.menuContentContainer.setVisible(e);
          }
          renderCommandBarButtons(t, e, i, r) {
            let s = 0,
              a = [];
            for (let l of e.slice(0, r))
              if (l !== c.CommandBarButtonType.Separator) {
                let e = ce.commandButtonConfigs.find((e) => e.type === l);
                var n, o;
                e
                  ? (n = this.images.get(e.icon))
                    ? ((o = t.imageIndexes.get(n)),
                      a.push(
                        Q.jsx(J.SidebarIconButton, {
                          image: void 0 !== o ? t.file : n,
                          imageFrameOffset: o,
                          palette: "sidebar.pal",
                          tooltip: e.tooltip(this.strings),
                          x: s,
                          onClick: () => {
                            this._onCommandBarButtonClick.dispatch(this, l);
                          },
                          ref: (e) => this.commandBarButtons.push(e),
                        }),
                      ),
                      (s += n.width))
                    : console.warn(`Missing image for command bar button "${c.CommandBarButtonType[l]}"`)
                  : console.warn(`Unknown command bar button type "${l}"`);
              } else s += i;
            return a;
          }
          buildCameoFile() {
            let i = new r.ShpFile();
            return (
              (i.filename = "agg_cameos.shp"),
              this.cameoFilenames.forEach((e) => {
                let t = this.getImage(e);
                (i.width || (i.width = t.width), i.height || (i.height = t.height), i.addImage(t.getImage(0)));
              }),
              i
            );
          }
          createCameoNameToIdMap() {
            let e = new Map();
            for (let t = 0; t < this.cameoFilenames.length; ++t) e.set(this.cameoFilenames[t], t);
            return e;
          }
          destroySidebarMenu() {
            this.sidebarMenu && (this.sidebarMenuContainer.remove(this.sidebarMenu), this.sidebarMenu.destroy());
          }
          update(e) {
            (super.update(e),
              this.repairButton?.setToggleState(this.sidebarModel.repairMode),
              this.sellButton?.setToggleState(this.sidebarModel.sellMode));
            var t = 0 < this.sidebarModel.activeTab.items.length - 2 * this.repeaterCount;
            (this.pgUpButton?.setDisabled(!t), this.pgDnButton?.setDisabled(!t));
          }
          destroy() {
            (this.sidebarButtonsContainer.destroy(),
              this.destroySidebarMenu(),
              this.sidebarRadar.setMinimap(void 0),
              super.destroy());
          }
        }),
          e("Hud", a));
      },
    };
  },
);
