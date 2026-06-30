// === Reconstructed SystemJS module: gui/component/ChannelOpIndicator ===
// deps: ["react","gui/component/Image"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/ChannelOpIndicator", ["react", "gui/component/Image"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e("ChannelOpIndicator", ({ operator: e }) =>
        i.default.createElement(
          "div",
          { className: "channel-op-indicator" },
          e ? i.default.createElement(r.Image, { src: "woloper.pcx" }) : null,
        ),
      );
    },
  };
});
