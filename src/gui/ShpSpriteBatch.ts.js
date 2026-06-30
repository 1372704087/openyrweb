// === Reconstructed SystemJS module: gui/ShpSpriteBatch ===
// deps: ["gui/UiObject","gui/HtmlContainer","data/ShpFile","engine/renderable/builder/BatchShpBuilder"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/ShpSpriteBatch",
  ["gui/UiObject", "gui/HtmlContainer", "data/ShpFile", "engine/renderable/builder/BatchShpBuilder"],
  function (e, t) {
    "use strict";
    var c, s, a, h, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        ((i = class extends c.UiObject {
          constructor(e, t, i, r) {
            (super(new THREE.Object3D(), new s.HtmlContainer()),
              (this.spriteProps = e),
              (this.getShpFile = t),
              (this.getPalette = i),
              (this.camera = r),
              (this.textureCache = new Map()),
              (this.batchShpBuilders = []));
          }
          create3DObject() {
            super.create3DObject();
            var e = this.createAggregatedShpFile();
            this.createObjects(this.get3DObject(), e);
          }
          createAggregatedShpFile() {
            let t = new a.ShpFile();
            t.filename = "agg_unnamed_spritebatch.shp";
            let i = new Map(),
              r = 0;
            for (var s of this.spriteProps) {
              let e = "string" == typeof s.image ? this.getShpFile(s.image) : s.image;
              s = e.getImage(s.frame ?? 0);
              i.has(s) || (t.addImage(s), i.set(s, r), r++);
            }
            return { file: t, imageIndexes: i };
          }
          createObjects(e, r) {
            let t = new Map();
            for (var i of this.spriteProps) {
              var s = ("string" == typeof i.palette ? this.getPalette(i.palette) : i.palette).hash;
              t.set(s, (t.get(s) ?? []).concat(i));
            }
            for (var a of t.values()) {
              var n,
                o = "string" == typeof a[0].palette ? this.getPalette(a[0].palette) : a[0].palette;
              let i = [];
              for (n of a) {
                let e = "string" == typeof n.image ? this.getShpFile(n.image) : n.image;
                var l = r.imageIndexes.get(e.getImage(n.frame ?? 0));
                if (void 0 === l) throw new Error("Missing frame in aggregated sprite shp file");
                l = {
                  position: new THREE.Vector3(n.x ?? 0, n.y ?? 0, c.UiObject.zIndexToWorld(n.zIndex ?? 0)),
                  shpFile: e,
                  depth: !1,
                  flat: !1,
                  frameNo: l,
                  offset: { x: e.width / 2, y: e.height / 2 },
                };
                i.push(l);
              }
              if (i.length) {
                let t = new h.BatchShpBuilder(r.file, o, this.camera, this.textureCache, void 0, void 0, i.length);
                (i.forEach((e) => t.add(e)), this.batchShpBuilders.push(t), e.add(t.build()));
              }
            }
          }
          destroy() {
            (super.destroy(),
              this.batchShpBuilders.forEach((e) => e.dispose()),
              [...this.textureCache.values()].forEach((e) => e.dispose()),
              this.textureCache.clear());
          }
        }),
          e("ShpSpriteBatch", i));
      },
    };
  },
);
