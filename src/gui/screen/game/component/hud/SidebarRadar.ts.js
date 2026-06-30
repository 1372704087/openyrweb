// === Reconstructed SystemJS module: gui/screen/game/component/hud/SidebarRadar ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/jsx/UiComponent","gui/HtmlContainer","gui/screen/game/component/hud/SidebarRadarAnimRunner"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/SidebarRadar",
  [
    "gui/jsx/jsx",
    "gui/UiObject",
    "gui/jsx/UiComponent",
    "gui/HtmlContainer",
    "gui/screen/game/component/hud/SidebarRadarAnimRunner",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o;
    t && t.id;
    return {
      setters: [
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
          a = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        ((o = class extends s.UiComponent {
          constructor() {
            (super(...arguments), (this.visible = !0));
          }
          createUiObject() {
            let e = new r.UiObject(new THREE.Object3D(), new a.HtmlContainer());
            return (e.setPosition(this.props.x || 0, this.props.y || 0), e);
          }
          defineChildren() {
            return i.jsx(
              "fragment",
              null,
              i.jsx("sprite", {
                image: this.props.image,
                palette: this.props.palette,
                zIndex: this.props.zIndex,
                ref: (e) => (this.cover = e),
                animationRunner: new n.SidebarRadarAnimationRunner(this.props.image),
              }),
              i.jsx("container", { ref: (e) => (this.minimapContainer = e), hidden: !0, x: 13 }),
            );
          }
          onFrame(e) {
            let t = this.getUiObject().get3DObject();
            t.visible = this.visible;
            var i = this.props["sidebarModel"],
              i = i?.radarEnabled ?? !0;
            i !== this.coverOpen && (this.toggleCover(i, void 0 === this.coverOpen), (this.coverOpen = i));
            let r = this.cover.getAnimationRunner();
            r.isStopped() && this.minimapContainer.setVisible(this.coverOpen);
          }
          toggleCover(e, t = !1) {
            let i = this.cover.getAnimationRunner();
            (e ? i.radarOn(t) : i.radarOff(t), this.minimapContainer.setVisible(!!t && e));
          }
          setMinimap(e) {
            (this.minimap && this.minimapContainer.remove(this.minimap),
              (this.minimap = e) &&
                (e.setFitSize(this.getMinimapAvailSpace()),
                this.minimapContainer.add(e),
                e.setZIndex(this.props.zIndex + 1)));
          }
          getMinimapAvailSpace() {
            return { width: this.props.image.width - 13 - 15, height: this.props.image.height };
          }
          hide() {
            this.visible = !1;
          }
          show() {
            this.visible = !0;
          }
        }),
          e("SidebarRadar", o));
      },
    };
  },
);
