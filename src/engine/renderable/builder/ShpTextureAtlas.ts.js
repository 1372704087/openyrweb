// === Reconstructed SystemJS module: engine/renderable/builder/ShpTextureAtlas ===
// deps: ["data/Bitmap","engine/gfx/TextureAtlas"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/builder/ShpTextureAtlas",
  ["data/Bitmap", "engine/gfx/TextureAtlas"],
  function (e, t) {
    "use strict";
    var a, n, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        e(
          "ShpTextureAtlas",
          (i = class {
            fromShpFile(e) {
              let t = [];
              for (let s = 0; s < e.numImages; s++) {
                var i = e.getImage(s);
                t.push(new a.IndexedBitmap(i.width, i.height, i.imageData));
              }
              let r = new n.TextureAtlas();
              return (r.pack(t), (this.images = t), (this.atlas = r), this);
            }
            getTextureArea(e) {
              return this.atlas.getImageRect(this.images[e]);
            }
            getTexture() {
              return this.atlas.getTexture();
            }
            dispose() {
              this.atlas.dispose();
            }
          }),
        );
      },
    };
  },
);
