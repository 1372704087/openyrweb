// === Reconstructed SystemJS module: gui/component/Dialog ===
// deps: ["react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/Dialog", ["react"], function (e, t) {
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
          return this.props.hidden
            ? null
            : i.default.createElement(
                "div",
                { style: this.getWrapperStyle() },
                i.default.createElement(
                  "div",
                  { className: "message-box " + (this.props.className || "") },
                  i.default.createElement("div", { className: "message-box-content" }, this.props.children),
                  i.default.createElement(
                    "div",
                    { className: "message-box-footer" },
                    this.props.buttons.map((e, t) => this.renderButton(e, t)),
                  ),
                ),
              );
        }
        renderButton(e, t) {
          return i.default.createElement(
            "button",
            { key: t, className: "dialog-button", onClick: e.onClick, disabled: e.disabled },
            e.label,
          );
        }
        getWrapperStyle() {
          var e = this.props.viewport;
          return {
            position: "absolute",
            top: e.x,
            left: e.y,
            width: e.width,
            height: e.height,
            zIndex: this.props.zIndex,
          };
        }
      }),
        e("Dialog", r));
    },
  };
});
