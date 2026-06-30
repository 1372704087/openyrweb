// === Reconstructed SystemJS module: gui/screen/game/component/hud/SidebarMenu ===
// deps: ["gui/jsx/jsx","gui/component/MenuButton","gui/UiObject","gui/HtmlContainer","gui/jsx/HtmlView","gui/jsx/UiComponent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/SidebarMenu",
  [
    "gui/jsx/jsx",
    "gui/component/MenuButton",
    "gui/UiObject",
    "gui/HtmlContainer",
    "gui/jsx/HtmlView",
    "gui/jsx/UiComponent",
  ],
  function (e, t) {
    "use strict";
    var n, o, i, r, l, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = class extends s.UiComponent {
          createUiObject() {
            return new i.UiObject(new THREE.Object3D(), new r.HtmlContainer());
          }
          defineChildren() {
            return this.props.buttons.map((e, t) => this.createButton(e, t));
          }
          createButton(t, e) {
            var i = this.props.buttonImg;
            let r = { x: 0, y: e * i.height };
            t.isBottom && (r.y = this.props.menuHeight - i.height);
            var s = { x: r.x, y: r.y, width: i.width, height: i.height };
            let a = n.createRef();
            return n.jsx(
              "fragment",
              null,
              n.jsx("sprite", { image: i, palette: this.props.buttonPal, x: r.x, y: r.y, ref: a }),
              n.jsx(l.HtmlView, {
                component: o.MenuButton,
                props: {
                  buttonConfig: { label: t.label, disabled: !!t.disabled },
                  box: { x: s.x, y: s.y, width: s.width, height: s.height },
                  onMouseDown: (e) => {
                    a.current.setFrame(1);
                    let t = () => {
                      (a.current.setFrame(0), document.removeEventListener("mouseup", t));
                    };
                    document.addEventListener("mouseup", t);
                  },
                  onClick: (e) => {
                    t.onClick && t.onClick();
                  },
                },
              }),
            );
          }
        }),
          e("SidebarMenu", a));
      },
    };
  },
);
