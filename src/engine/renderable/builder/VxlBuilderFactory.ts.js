// === Reconstructed SystemJS module: engine/renderable/builder/VxlBuilderFactory ===
// deps: ["engine/renderable/builder/VxlBatchedBuilder","engine/renderable/builder/VxlNonBatchedBuilder"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/builder/VxlBuilderFactory",
  ["engine/renderable/builder/VxlBatchedBuilder", "engine/renderable/builder/VxlNonBatchedBuilder"],
  function (e, t) {
    "use strict";
    var s, a, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        e(
          "VxlBuilderFactory",
          (i = class {
            constructor(e, t, i) {
              ((this.vxlGeometryPool = e), (this.useBatching = t), (this.camera = i));
            }
            create(e, t, i, r) {
              return this.useBatching
                ? new s.VxlBatchedBuilder(e, t, i, r, this.vxlGeometryPool, this.camera)
                : new a.VxlNonBatchedBuilder(e, t, r, this.vxlGeometryPool, this.camera);
            }
          }),
        );
      },
    };
  },
);
