// === Reconstructed SystemJS module: engine/gfx/TextureUtils ===
// deps: ["data/Bitmap","util/math","engine/gfx/CanvasUtils","engine/gfx/drawable/PalDrawable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/gfx/TextureUtils",
  ["data/Bitmap", "util/math", "engine/gfx/CanvasUtils", "engine/gfx/drawable/PalDrawable"],
  function (e, t) {
    "use strict";
    var n, o, r, l, c;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        (e(
          "TextureUtils",
          (c = class c {
            static textureFromPalette(e) {
              var t = e.hash,
                i = c.cache.get(t);
              if (i) return i;
              ((i = new l.PalDrawable(e).draw()), (i = this.textureFromPalBitmap(i)));
              return (c.cache.set(t, i), i);
            }
            static textureFromPalettes(e) {
              if (!e.length) throw new Error("At least one palette is required");
              var t = o.fnv32a(e.map((e) => e.hash)),
                i = c.cache.get(t);
              if (i) return i;
              let r;
              var s,
                i = e.map((e) => new l.PalDrawable(e).draw());
              r = new n.RgbaBitmap(i[0].width, i.length);
              let a = 0;
              for (s of i) r.drawRgbaImage(s, 0, a++);
              i = this.textureFromPalBitmap(r);
              return (c.cache.set(t, i), i);
            }
            static textureFromPalBitmap(e) {
              var t = r.CanvasUtils.canvasFromRgbaImageData(e.data, e.width, e.height);
              let i = new THREE.Texture(t);
              return (
                (i.minFilter = THREE.NearestFilter),
                (i.magFilter = THREE.NearestFilter),
                (i.needsUpdate = !0),
                (i.flipY = !1),
                i
              );
            }
          }),
        ),
          (c.cache = new Map()));
      },
    };
  },
);
