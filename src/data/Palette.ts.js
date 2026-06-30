// === Reconstructed SystemJS module: data/Palette ===
// deps: ["util/Color","util/math","data/vfs/VirtualFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/Palette", ["util/Color", "util/math", "data/vfs/VirtualFile"], function (e, t) {
  "use strict";
  var i, s, r, a;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        s = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      (e(
        "Palette",
        (a = class a {
          constructor(e) {
            e instanceof r.VirtualFile ? this.fromVirtualFile(e) : "object" == typeof e && this.fromJson(e);
          }
          fromVirtualFile(e) {
            var t = e.stream.readUint8Array(768);
            this.fromJson(t);
          }
          fromJson(e) {
            this.colors = [];
            for (let t = 0; t < e.length / 3; ++t)
              this.colors.push(i.Color.fromRgb(4 * e[3 * t], 4 * e[3 * t + 1], 4 * e[3 * t + 2]));
            this._hash = this.computeHash(this.colors);
          }
          getColor(e) {
            return this.colors[e];
          }
          getColorAsHex(e) {
            return this.getColor(e).asHex();
          }
          setColors(e) {
            ((this.colors = e), (this._hash = this.computeHash(this.colors)));
          }
          get size() {
            return this.colors.length;
          }
          get hash() {
            return this._hash;
          }
          computeHash(e) {
            let t = new Uint8Array(3 * this.size),
              i = 0;
            for (var r of e) ((t[i] = r.r), (t[i + 1] = r.g), (t[i + 2] = r.b), (i += 3));
            return s.fnv32a(t);
          }
          clone() {
            let e = new a();
            return ((e.colors = this.colors.map((e) => e.clone())), (e._hash = this._hash), e);
          }
          remap(e) {
            var t = [63, 59, 55, 52, 48, 44, 41, 37, 33, 30, 26, 22, 19, 15, 11, 8];
            for (let i = a.REMAP_START_IDX; i < a.REMAP_START_IDX + t.length; i++)
              ((this.colors[i].r = Math.floor((e.r / 255) * t[i - a.REMAP_START_IDX] * 4)),
                (this.colors[i].g = Math.floor((e.g / 255) * t[i - a.REMAP_START_IDX] * 4)),
                (this.colors[i].b = Math.floor((e.b / 255) * t[i - a.REMAP_START_IDX] * 4)));
            return ((this._hash = this.computeHash(this.colors)), this);
          }
        }),
      ),
        (a.REMAP_START_IDX = 16));
    },
  };
});
