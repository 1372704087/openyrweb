// === Reconstructed SystemJS module: engine/renderable/builder/CanvasTextureAtlas ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/builder/CanvasTextureAtlas", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CanvasTextureAtlas",
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
              t.push({ w: e.width, h: e.height, image: e });
            }),
              t.sort((e, t) => 1e3 * (t.w - e.w) + t.h - e.h));
            let i = new GrowingPacker();
            i.fit(t);
            var r = i.root.w,
              s = i.root.h;
            let a = document.createElement("canvas"),
              n = a.getContext("2d", { alpha: !0 });
            ((a.width = r), (a.height = s));
            let o = new Map();
            t.forEach((e) => {
              if (!e.fit) throw new Error("Couldn't fit all images in a single texture");
              var t = e.image,
                i = e.fit.x,
                r = e.fit.y;
              (o.set(t, { x: i, y: r, width: e.w, height: e.h }), n.drawImage(t, i, r));
            });
            let l = new THREE.Texture(a);
            ((l.minFilter = THREE.NearestFilter),
              (l.magFilter = THREE.NearestFilter),
              (l.needsUpdate = !0),
              (this.texture = l),
              (this.imageRects = o));
          }
        }),
      );
    },
  };
});
