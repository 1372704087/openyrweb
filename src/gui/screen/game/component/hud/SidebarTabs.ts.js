// === Reconstructed SystemJS module: gui/screen/game/component/hud/SidebarTabs ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/jsx/UiComponent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/SidebarTabs",
  ["gui/jsx/jsx", "gui/UiObject", "gui/jsx/UiComponent"],
  function (e, t) {
    "use strict";
    var u, i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          u = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class extends r.UiComponent {
          constructor() {
            (super(...arguments), (this.tabObjects = []), (this.flashing = !1));
          }
          createUiObject() {
            let e = new i.UiObject(new THREE.Object3D());
            return (e.setPosition(this.props.x || 0, this.props.y || 0), e);
          }
          defineChildren() {
            let {
                aggregatedImageData: e,
                images: t,
                palette: i,
                tabSpacing: r,
                onTabClick: s,
                sidebarModel: a,
                strings: n,
              } = this.props,
              o = [];
            for (let c = 0; c < 4; c++) {
              var l = t[c];
              const h = this.props.aggregatedImageData.imageIndexes.get(l);
              if (void 0 === h) throw new Error(`Tab ${c} image not found in aggregated file`);
              o.push(
                u.jsx("sprite", {
                  image: e.file,
                  palette: i,
                  x: (r + l.width) * c,
                  tooltip: n.get("Tip:Tab" + (c + 1)),
                  onClick: (e) => {
                    var t;
                    0 === e.button && ((t = a.tabs[c]).disabled || s?.(t));
                  },
                  onFrame: (e, t) => this.handleFrame(e, t, a.tabs[c], h),
                }),
              );
            }
            return o;
          }
          handleFrame(e, t, i, r) {
            (!this.lastFlashUpdate || 250 <= e - this.lastFlashUpdate) &&
              ((this.lastFlashUpdate = e), (this.flashing = !this.flashing));
            let s;
            ((s = i.disabled ? 2 : this.props.sidebarModel.activeTab === i ? 1 : 0),
              i.flashing && this.flashing && (s = 3),
              t.setFrame(r + s));
          }
        }),
          e("SidebarTabs", s));
      },
    };
  },
);
