// === Reconstructed SystemJS module: gui/screen/game/component/hud/SidebarCard ===
// deps: ["gui/jsx/jsx","gui/screen/game/component/hud/viewmodel/SidebarModel","gui/UiObject","gui/jsx/UiComponent","engine/gfx/OverlayUtils","gui/HtmlContainer","util/math","gui/screen/game/component/hud/viewmodel/CombatantSidebarModel","game/art/ObjectArt"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/SidebarCard",
  [
    "gui/jsx/jsx",
    "gui/screen/game/component/hud/viewmodel/SidebarModel",
    "gui/UiObject",
    "gui/jsx/UiComponent",
    "engine/gfx/OverlayUtils",
    "gui/HtmlContainer",
    "util/math",
    "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel",
    "game/art/ObjectArt",
  ],
  function (t, e) {
    "use strict";
    var d, s, r, i, a, n, o, l, c, h, u;
    e && e.id;
    return {
      setters: [
        function (e) {
          d = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
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
      ],
      execute: function () {
        var e;
        (((e = h = h || {})[(e.Ready = 0)] = "Ready"),
          (e[(e.OnHold = 1)] = "OnHold"),
          (u = class u extends i.UiComponent {
            constructor() {
              (super(...arguments),
                (this.slotContainers = []),
                (this.slotObjects = []),
                (this.progressOverlays = []),
                (this.visible = !0),
                (this.labelObjects = []),
                (this.quantityObjects = []),
                (this.justCreated = !0),
                (this.lastItemCount = 0),
                (this.pagingOffset = 0),
                (this.handleWheel = (e) => {
                  this.scrollToOffset(this.pagingOffset + (0 < e.wheelDeltaY ? 2 : -2));
                }));
            }
            createUiObject() {
              let e = new r.UiObject(new THREE.Object3D(), new n.HtmlContainer());
              (e.setPosition(this.props.x || 0, this.props.y || 0),
                e.onFrame.subscribe(() => this.handleFrame()),
                (this.slotOutline = new r.UiObject(this.createSlotOutline())),
                this.slotOutline.setVisible(!1),
                this.slotOutline.setZIndex((this.props.zIndex ?? 0) + 1),
                e.add(this.slotOutline));
              let t = u.labelImageCache.get(this.props.textColor);
              (t ||
                ((t = this.createLabelImages(this.props.textColor)), u.labelImageCache.set(this.props.textColor, t)),
                (this.labelImages = t));
              let i = u.quantityImageCache.get(this.props.textColor);
              return (
                i ||
                  ((i = this.createQuantityImages(this.props.textColor)),
                  u.quantityImageCache.set(this.props.textColor, i)),
                (this.quantityImages = i),
                e
              );
            }
            defineChildren() {
              let {
                slots: e,
                cameoImages: i,
                cameoPalette: r,
                sidebarModel: s,
                onSlotClick: a,
                zIndex: n,
              } = this.props;
              var o = this.getCameoSize();
              let l = 3,
                c = 2,
                h = [];
              for (let u = 0; u < e; u++) {
                let t = { x: (l + o.width) * (u % 2), y: (c + o.height) * Math.floor(u / 2) };
                h.push(
                  d.jsx(
                    "container",
                    {
                      x: t.x,
                      y: t.y,
                      zIndex: n,
                      ref: (e) => this.slotContainers.push(e),
                      onWheel: this.handleWheel,
                      onClick: (e) => {
                        var t = s.activeTab.items[this.getItemIndexAtSlot(u)];
                        t && !t.disabled && a?.(this.createSlotClickEvent(t, e));
                      },
                      onMouseEnter: () => {
                        var e = s.activeTab.items[this.getItemIndexAtSlot(u)];
                        e &&
                          (e.disabled || this.slotOutline.setPosition(t.x, t.y),
                          this.slotOutline.setVisible(!e.disabled),
                          (this.hoverSlotIndex = u));
                      },
                      onMouseLeave: () => {
                        this.hoverSlotIndex === u && (this.slotOutline.setVisible(!1), (this.hoverSlotIndex = void 0));
                      },
                    },
                    d.jsx("sprite", {
                      image: "gclock2.shp",
                      palette: "sidebar.pal",
                      zIndex: 1,
                      frame: 0,
                      opacity: 0.5,
                      transparent: !0,
                      ref: (e) => this.progressOverlays.push(e),
                    }),
                    d.jsx("sprite", {
                      images: this.labelImages,
                      zIndex: 2,
                      x: o.width / 2,
                      transparent: !0,
                      ref: (e) => this.labelObjects.push(e),
                    }),
                    d.jsx("sprite", {
                      images: this.quantityImages,
                      zIndex: 2,
                      x: o.width,
                      alignX: 1,
                      alignY: -1,
                      transparent: !0,
                      ref: (e) => this.quantityObjects.push(e),
                    }),
                    d.jsx("sprite", { image: i, palette: r, ref: (e) => this.slotObjects.push(e) }),
                  ),
                );
              }
              return h;
            }
            createSlotClickEvent(e, t) {
              return {
                target: e.target,
                button: t.button,
                altKey: t.altKey,
                ctrlKey: t.ctrlKey,
                metaKey: t.metaKey,
                shiftKey: t.shiftKey,
                isTouch: t.isTouch,
                touchDuration: t.touchDuration,
              };
            }
            handleFrame() {
              let { sidebarModel: e, slots: t } = this.props,
                i = this.getUiObject().get3DObject();
              var r;
              ((i.visible = this.visible),
                (this.justCreated || e.activeTab.needsUpdate || this.lastActiveTab !== e.activeTab) &&
                  ((this.justCreated = !1),
                  (r = e.activeTab.items.length),
                  (this.lastActiveTab === e.activeTab && this.lastItemCount === r) ||
                    (this.lastItemCount > r && (this.pagingOffset = 0), (this.lastItemCount = r)),
                  (this.lastActiveTab = e.activeTab),
                  (e.activeTab.needsUpdate = !1),
                  this.updateSlots(e.activeTab.items, t)));
            }
            updateSlots(s, e) {
              for (let n = 0; n < e; n++) {
                var a = s[this.getItemIndexAtSlot(n)];
                let e = this.slotObjects[n],
                  t = this.progressOverlays[n],
                  i = this.labelObjects[n],
                  r = this.quantityObjects[n];
                s.length - this.pagingOffset <= n
                  ? ((e.get3DObject().visible = !1),
                    (t.get3DObject().visible = !1),
                    (i.get3DObject().visible = !1),
                    (r.get3DObject().visible = !1))
                  : (this.updateCameo(a, e),
                    this.updateProgressOverlay(a, t),
                    this.updateStatusText(a, i),
                    this.updateQuantities(a, r),
                    this.updateTooltip(a, this.slotContainers[n]));
              }
            }
            updateCameo(e, t) {
              let i = this.props["cameoNameToIdMap"];
              var r;
              let s = e.cameo + ".shp";
              if ((void 0 === (r = i.get(s)) && (s = c.ObjectArt.MISSING_CAMEO + ".shp"), void 0 === (r = i.get(s))))
                throw new Error(`Missing cameo placeholder image "${c.ObjectArt.MISSING_CAMEO}.shp"`);
              (t.setFrame(r), (t.get3DObject().visible = !0), t.setLightMult(e.disabled ? 0.5 : 1));
            }
            updateProgressOverlay(e, t) {
              let i = 0;
              var r;
              ([s.SidebarItemStatus.Started, s.SidebarItemStatus.OnHold].includes(e.status) &&
                ((r = t.getFrameCount()), (i = Math.max(1, Math.ceil(e.progress * (r - 1))) % r)),
                t.setFrame(i),
                (t.get3DObject().visible = 0 < i));
            }
            updateStatusText(e, t) {
              ((t.get3DObject().visible = [s.SidebarItemStatus.Ready, s.SidebarItemStatus.OnHold].includes(e.status)),
                e.status === s.SidebarItemStatus.Ready
                  ? (t.setFrame(h.Ready),
                    t.setPosition(this.getCameoSize().width / 2, t.getPosition().y),
                    t.builder.setAlign(0, -1))
                  : e.status === s.SidebarItemStatus.OnHold &&
                    (t.setFrame(h.OnHold),
                    t.setPosition(1 < e.quantity ? 0 : this.getCameoSize().width / 2, t.getPosition().y),
                    t.builder.setAlign(1 < e.quantity ? -1 : 0, -1)));
            }
            updateQuantities(e, t) {
              e.quantity > (e.status === s.SidebarItemStatus.InQueue ? 0 : 1)
                ? (t.setFrame(e.quantity > u.MAX_QUANTITY ? u.MAX_QUANTITY : e.quantity - 1), t.setVisible(!0))
                : t.setVisible(!1);
            }
            updateTooltip(t, e) {
              let i;
              if (t.target.type === s.SidebarItemTargetType.Techno) {
                let e = t.target.rules.cost;
                (this.props.sidebarModel instanceof l.CombatantSidebarModel &&
                  (e = this.props.sidebarModel.computePurchaseCost(t.target.rules)),
                  (i = this.props.strings.get(t.target.rules.uiName) + "\n$" + e));
              } else {
                if (t.target.type !== s.SidebarItemTargetType.Special)
                  throw new Error(`Type "${t.target.type}" not implemented`);
                i = this.props.strings.get(t.target.rules.uiName);
              }
              e.setTooltip(i);
            }
            getItemIndexAtSlot(e) {
              return e + this.pagingOffset;
            }
            getCameoSize() {
              return { width: this.props.cameoImages.width, height: this.props.cameoImages.height };
            }
            createSlotOutline() {
              var e = this.getCameoSize(),
                t = e.width,
                e = e.height;
              let i = new THREE.Geometry();
              i.vertices.push(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, e, 0),
                new THREE.Vector3(t, e, 0),
                new THREE.Vector3(t, 0, 0),
                new THREE.Vector3(0, 0, 0),
              );
              t = new THREE.LineBasicMaterial({ color: this.props.textColor, transparent: !0, side: THREE.DoubleSide });
              return new THREE.Line(i, t);
            }
            hide() {
              this.visible = !1;
            }
            show() {
              this.visible = !0;
            }
            scrollToOffset(e) {
              var t = this.pagingOffset,
                i = Math.max(0, this.props.sidebarModel.activeTab.items.length - this.props.slots);
              return (
                (this.pagingOffset = o.clamp(e, 0, i)),
                this.pagingOffset % 2 && this.pagingOffset++,
                this.updateSlots(this.props.sidebarModel.activeTab.items, this.props.slots),
                t !== this.pagingOffset
              );
            }
            pageDown() {
              return this.scrollToOffset(this.pagingOffset + this.props.slots);
            }
            pageUp() {
              return this.scrollToOffset(this.pagingOffset - this.props.slots);
            }
            createLabelImages(t) {
              let e = [
                { text: this.props.strings.get("TXT_READY"), type: h.Ready },
                { text: this.props.strings.get("TXT_HOLD"), type: h.OnHold },
              ];
              return e.map((e) => this.createTextBox(e.text, t));
            }
            createQuantityImages(i) {
              let r = { paddingRight: 2 },
                e = new Array(u.MAX_QUANTITY).fill(0).map((e, t) => this.createTextBox("" + (t + 1), i, r));
              return (e.push(this.createTextBox("∞", i, r)), e);
            }
            createTextBox(e, t, i) {
              return a.OverlayUtils.createTextBox(e, {
                color: t,
                backgroundColor: "rgba(0, 0, 0, .5)",
                fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
                fontSize: 12,
                fontWeight: "500",
                paddingTop: 5,
                paddingBottom: 5,
                paddingLeft: 2,
                paddingRight: 4,
                ...i,
              });
            }
          }),
          t("SidebarCard", u),
          (u.MAX_QUANTITY = 99),
          (u.labelImageCache = new Map()),
          (u.quantityImageCache = new Map()));
      },
    };
  },
);
