// === Reconstructed SystemJS module: gui/screen/game/component/hud/SidebarIconButton ===
// deps: ["gui/jsx/jsx","gui/jsx/UiComponent","gui/UiObject"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/SidebarIconButton",
  ["gui/jsx/jsx", "gui/jsx/UiComponent", "gui/UiObject"],
  function (e, t) {
    "use strict";
    var o, i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class extends i.UiComponent {
          constructor() {
            (super(...arguments),
              (this.toggle = this.props.toggle),
              (this.disabled = !!this.props.disabled),
              (this.handleMouseDown = () => {
                this.disabled ||
                  (void 0 === this.toggle && this.sprite.setFrame((this.props.imageFrameOffset ?? 0) + 1),
                  document.addEventListener("mouseup", this.onDocumentMouseUp),
                  document.addEventListener("touchend", this.onDocumentMouseUp),
                  document.addEventListener("touchcancel", this.onDocumentMouseUp));
              }),
              (this.onDocumentMouseUp = () => {
                (void 0 === this.toggle && this.sprite.setFrame((this.props.imageFrameOffset ?? 0) + 0),
                  document.removeEventListener("mouseup", this.onDocumentMouseUp),
                  document.removeEventListener("touchend", this.onDocumentMouseUp),
                  document.removeEventListener("touchcancel", this.onDocumentMouseUp));
              }));
          }
          createUiObject() {
            return new r.UiObject(new THREE.Object3D());
          }
          defineChildren() {
            let { image: e, imageFrameOffset: t, palette: i, x: r, y: s, onClick: a, tooltip: n } = this.props;
            return o.jsx("sprite", {
              image: e,
              palette: i,
              x: r,
              y: s,
              frame: this.getBaseFrameNo(t ?? 0),
              onClick: (e) => 0 === e.button && !this.disabled && a?.(),
              onMouseDown: this.handleMouseDown,
              tooltip: n,
              ref: (e) => (this.sprite = e),
            });
          }
          getBaseFrameNo(e) {
            return e + (this.disabled ? 2 : this.toggle ? 1 : 0);
          }
          setToggleState(e) {
            this.toggle !== e &&
              ((this.toggle = e), this.sprite.setFrame(this.getBaseFrameNo(this.props.imageFrameOffset ?? 0)));
          }
          setDisabled(e) {
            e !== this.disabled &&
              ((this.disabled = e), this.sprite.setFrame(this.getBaseFrameNo(this.props.imageFrameOffset ?? 0)));
          }
          onDispose() {
            (document.removeEventListener("mouseup", this.onDocumentMouseUp),
              document.removeEventListener("touchend", this.onDocumentMouseUp),
              document.removeEventListener("touchcancel", this.onDocumentMouseUp));
          }
        }),
          e("SidebarIconButton", s));
      },
    };
  },
);
