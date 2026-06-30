// === Reconstructed SystemJS module: engine/renderable/builder/vxlGeometry/VxlGeometryPool ===
// deps: ["engine/renderable/entity/unit/ModelQuality","util/typeGuard","engine/renderable/builder/vxlGeometry/VxlGeometryMonotoneBuilder"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/builder/vxlGeometry/VxlGeometryPool",
  [
    "engine/renderable/entity/unit/ModelQuality",
    "util/typeGuard",
    "engine/renderable/builder/vxlGeometry/VxlGeometryMonotoneBuilder",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a;
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
      ],
      execute: function () {
        e(
          "VxlGeometryPool",
          (a = class {
            constructor(e, t = i.ModelQuality.High) {
              ((this.cache = e), (this.modelQuality = t));
            }
            setModelQuality(e) {
              this.modelQuality = e;
            }
            getModelQuality() {
              return this.modelQuality;
            }
            async loadFromStorage(e, t) {
              let i = await Promise.all(e.sections.map((e) => this.cache.loadFromStorage(e, t)));
              return i.every(r.isNotNullOrUndefined);
            }
            async persistToStorage(e, t, i) {
              for (let s = 0; s < e.sections.length; s++) {
                var r = e.sections[s];
                await this.cache.persistToStorage(r, t, i[s]);
              }
            }
            clear() {
              this.cache.clear();
            }
            async clearStorage() {
              await this.cache.clearStorage();
            }
            async clearOtherModStorage() {
              await this.cache.clearOtherModStorage();
            }
            get(e) {
              let t = this.cache.get(e);
              return (t || ((t = new s.VxlGeometryMonotoneBuilder().build(e)), this.cache.set(e, t)), t);
            }
          }),
        );
      },
    };
  },
);
