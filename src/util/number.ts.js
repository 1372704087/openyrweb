// === Reconstructed SystemJS module: util/number ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/number", [], function (e, t) {
  "use strict";
  t && t.id;
  return (
    e("int32ToFloat32", function (e) {
      let t = new DataView(new ArrayBuffer(4));
      return (t.setInt32(0, e), t.getFloat32(0));
    }),
    { setters: [], execute: function () {} }
  );
});
