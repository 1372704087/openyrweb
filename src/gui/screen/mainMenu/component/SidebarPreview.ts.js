// === Reconstructed SystemJS module: gui/screen/mainMenu/component/SidebarPreview ===
// deps: ["gui/jsx/jsx","gui/jsx/UiComponent","gui/UiObject","gui/HtmlContainer","gui/screen/mainMenu/component/MenuSdTopAnimRunner","data/IniSection","engine/AnimProps","engine/Animation","engine/animation/SimpleRunner","gui/jsx/HtmlView","gui/screen/mainMenu/component/SidebarTitle","engine/Engine","util/BoxedVar"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/component/SidebarPreview",
  [
    "gui/jsx/jsx",
    "gui/jsx/UiComponent",
    "gui/UiObject",
    "gui/HtmlContainer",
    "gui/screen/mainMenu/component/MenuSdTopAnimRunner",
    "data/IniSection",
    "engine/AnimProps",
    "engine/Animation",
    "engine/animation/SimpleRunner",
    "gui/jsx/HtmlView",
    "gui/screen/mainMenu/component/SidebarTitle",
    "engine/Engine",
    "util/BoxedVar",
  ],
  function (e, t) {
    "use strict";
    var l, i, r, s, c, h, u, d, g, p, m, f, y, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
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
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
      ],
      execute: function () {
        ((a = class extends i.UiComponent {
          constructor() {
            (super(...arguments),
              (this.sidebarPreviewNeedsRefresh = !1),
              (this.closed = this.props.closed),
              (this.preview = this.props.preview),
              (this.title = this.props.title));
          }
          createUiObject() {
            let e = new r.UiObject(new THREE.Object3D(), new s.HtmlContainer());
            return (e.onFrame.subscribe((e) => this.handleFrame(e)), e);
          }
          defineChildren() {
            var { sdtpImg: e, sdtpAnimImg: t } = this.props,
              i = this.closed;
            let r = this.preview;
            var s = this.title || "",
              a = new h.IniSection("");
            let n = new u.AnimProps(a, t);
            n.loopCount = -1;
            a = new d.Animation(n, new y.BoxedVar(f.Engine.UI_ANIM_SPEED));
            let o = new g.SimpleRunner();
            o.animation = a;
            a = this.getPreviewSize();
            return l.jsx(
              "fragment",
              null,
              l.jsx("sprite", { image: e, palette: "shell.pal", frame: i ? 0 : 1, ref: (e) => (this.sidebarTop = e) }),
              l.jsx(p.HtmlView, {
                component: m.SidebarTitle,
                props: { title: s },
                innerRef: (e) => (this.titleView = e),
                x: 25,
                y: 3,
                width: 118,
                height: this.closed ? 32 : 18,
              }),
              l.jsx("sprite", {
                image: "sdwrntmp.shp",
                palette: "shell.pal",
                hidden: !0,
                ref: (e) => (this.sidebarTopPreviewAnim = e),
                animationRunner: new c.MenuSdTopAnimRunner(),
              }),
              l.jsx("sprite", {
                image: t,
                palette: "shell2.pal",
                x: 38,
                y: 48,
                hidden: !i,
                ref: (e) => (this.sidebarTopClosedAnim = e),
                animationRunner: o,
              }),
              l.jsx("container", {
                hidden: !r || i,
                ref: (e) => {
                  ((this.previewContainer = e), r && this.previewContainer.add(r));
                },
                x: 12,
                y: 40,
                width: a.width,
                height: a.height,
              }),
            );
          }
          getPreviewSize() {
            return { width: 146, height: 112 };
          }
          toggleSidebarPreview(t) {
            if (this.closed !== !t) {
              let e = this.sidebarTopPreviewAnim.getAnimationRunner();
              (t ? e.slideIn() : e.slideOut(),
                (this.closed = !t),
                (this.sidebarPreviewNeedsRefresh = !0),
                this.sidebarTopPreviewAnim.setVisible(!0),
                (t ? this.sidebarTopClosedAnim : this.previewContainer).setVisible(!1),
                this.titleView.setVisible(!1),
                this.updateTitleSize());
            }
          }
          setPreview(e) {
            (this.preview && this.previewContainer.remove(this.preview),
              e && this.previewContainer.add(e),
              (this.preview = e));
          }
          setTitle(t) {
            ((this.title = t), this.titleView.applyOptions((e) => (e.title = t)), this.updateTitleSize());
          }
          updateTitleSize() {
            this.titleView.setSize(this.titleView.getSize().width, this.closed ? 32 : 18);
          }
          handleFrame(e) {
            if (this.sidebarPreviewNeedsRefresh) {
              let e = this.sidebarTopPreviewAnim.getAnimationRunner();
              e.isStopped() &&
                ((this.closed ? this.sidebarTopClosedAnim : this.previewContainer).setVisible(!0),
                this.sidebarTopPreviewAnim.setVisible(!1),
                this.sidebarTop.setFrame(this.closed ? 0 : 1),
                this.titleView.setVisible(!0),
                (this.sidebarPreviewNeedsRefresh = !1));
            }
          }
        }),
          e("SidebarPreview", a));
      },
    };
  },
);
