// === Reconstructed SystemJS module: engine/gfx/TextureAtlas ===
// deps: ["data/Bitmap"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/TextureAtlas", ["data/Bitmap"], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  function u(e) {
    let t = e.target;
    ((t.isDisposed = !0), t.removeEventListener("dispose", u));
  }
  function d(e, t, i, s) {
    let a = new r.IndexedBitmap(t, i);
    return (
      e.forEach((e) => {
        if (!e.fit) throw new Error("Couldn't fit all images in a single texture");
        var t = e.image,
          i = e.fit.x,
          r = e.fit.y;
        (s?.set(t, { x: i, y: r, width: e.w, height: e.h }), a.drawIndexedImage(t, i, r));
      }),
      a
    );
  }
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "TextureAtlas",
        (i = class {
          getTexture() {
            if (!this.texture) throw new Error("Texture atlas not initialized");
            return this.texture;
          }
          getImageRect(e) {
            if (!this.imageRects) throw new Error("Texture atlas not initialized");
            var t = this.imageRects.get(e);
            if (!t) throw new Error("Image not found in atlas");
            return t;
          }
          pack(e) {
            let t = [];
            (e.forEach((e) => {
              t.push({ w: e.width + (e.width % 2), h: e.height + (e.height % 2), image: e });
            }),
              t.sort((e, t) => 1e4 * (t.w - e.w) + t.h - e.h));
            let i = new GrowingPacker();
            i.fit(t);
            var r,
              s,
              a,
              n = i.root.w,
              o = i.root.h,
              l = new Map(),
              c = d(t, n, o, l);
            let h = new THREE.DataTexture(c.data, n, o, THREE.AlphaFormat);
            ((h.needsUpdate = !0),
              (h.flipY = !0),
              (h.minFilter = THREE.NearestFilter),
              (h.magFilter = THREE.NearestFilter),
              (h.onUpdate =
                ((r = t),
                (s = n),
                (a = o),
                (e) => {
                  ((e.image = {
                    width: e.image.width,
                    height: e.image.height,
                    get data() {
                      return e.isDisposed
                        ? new Uint8Array(this.width * this.height)
                        : (console.log("TextureAtlas: Rebuilding texture for upload to GPU..."), d(r, s, a).data);
                    },
                  }),
                    e.addEventListener("dispose", u));
                })),
              (this.width = n),
              (this.height = o),
              (this.imageRects = l),
              (this.texture = h));
          }
          dispose() {
            this.texture?.dispose();
          }
        }),
      );
    },
  };
});
