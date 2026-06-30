// === Reconstructed SystemJS module: gui/component/MenuButton ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/MenuButton", ["react"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends i.default.Component {
        render() {
          var e = this.props["buttonConfig"];
          return e
            ? i.default.createElement(
                "div",
                {
                  className: this.getClassName(e),
                  style: this.getStyle(),
                  onMouseDown: (e) => this.onMouseDown(e),
                  onMouseUp: (e) => this.onMouseUp(e),
                  onClick: (e) => this.onClick(e),
                  "data-r-tooltip": e.tooltip,
                },
                e.label,
              )
            : null;
        }
        getClassName(e) {
          let t = ["menu-button"];
          return (e.disabled && t.push("disabled"), t.join(" "));
        }
        getStyle() {
          var e = this.props.box;
          return {
            position: "absolute",
            left: e.x,
            top: e.y,
            width: e.width,
            height: e.height,
            lineHeight: e.height + 1 + "px",
          };
        }
        onMouseDown(e) {
          !this.props.buttonConfig.disabled && this.props.onMouseDown && this.props.onMouseDown(e);
        }
        onMouseUp(e) {
          !this.props.buttonConfig.disabled && this.props.onMouseUp && this.props.onMouseUp(e);
        }
        onClick(e) {
          !this.props.buttonConfig.disabled && this.props.onClick && this.props.onClick(e);
        }
      }),
        e("MenuButton", r));
    },
  };
});
