// === Reconstructed SystemJS module: util/userAgent ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/userAgent", [], function (e, t) {
  "use strict";
  t && t.id;
  function i() {
    return navigator.platform.includes("Mac");
  }
  return (
    e("isIpad", function () {
      return /iPad/i.test(navigator.userAgent) || (/MacIntel/i.test(navigator.platform) && !!navigator.maxTouchPoints);
    }),
    e("isMac", i),
    e("isMacFirefox", function () {
      return i() && -1 !== navigator.userAgent.toLowerCase().indexOf("firefox");
    }),
    { setters: [], execute: function () {} }
  );
});
