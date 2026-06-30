// === Reconstructed SystemJS module: util/fullScreen ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/fullScreen", [], function (e, t) {
  "use strict";
  t && t.id;
  return (
    e("setupFullScreenChangeListener", function (i, r) {
      if (i.fullscreenEnabled) {
        let t = !0;
        const e = () => {
            var e = !!i.fullscreenElement;
            (e ? (t = !1) : setTimeout(() => (t = !0), 100), r(e));
          },
          s = async (e) => {
            if (122 === e.keyCode && t && !i.fullscreenElement)
              try {
                await i.documentElement.requestFullscreen();
              } catch {
                console.warn("Full screen permission denied by user.");
              }
          };
        return (
          i.addEventListener("fullscreenchange", e),
          i.addEventListener("keyup", s),
          () => {
            (i.removeEventListener("fullscreenchange", e), i.removeEventListener("keyup", s));
          }
        );
      }
      console.warn("Browser fullscreen API not available.");
    }),
    { setters: [], execute: function () {} }
  );
});
