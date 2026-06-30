// === Reconstructed SystemJS module: engine/Theater ===
// deps: ["game/theater/TileSets","engine/type/PaletteType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/Theater", ["game/theater/TileSets", "engine/type/PaletteType"], function (e, t) {
  "use strict";
  var u, r, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        u = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "Theater",
        (i = class {
          static factory(e, t, i, r, s) {
            var a = s.get(i.isoPaletteName);
            if (!a) throw new Error(`Missing palette "${i.isoPaletteName}"`);
            var n = s.get(i.overlayPaletteName);
            if (!n) throw new Error(`Missing palette "${i.overlayPaletteName}"`);
            var o = s.get(i.unitPaletteName);
            if (!o) throw new Error(`Missing palette "${i.unitPaletteName}"`);
            var l = s.get("anim.pal");
            if (!l) throw new Error("Missing anim palette");
            var c = s.get(i.libPaletteName);
            if (!c) throw new Error("Missing lib palette " + i.libPaletteName);
            let h = new u.TileSets(t);
            return (h.loadTileData(r, i.extension), new this(e, i, s, a, n, o, l, c, h));
          }
          constructor(e, t, i, r, s, a, n, o, l) {
            ((this.type = e),
              (this.settings = t),
              (this.palettes = i),
              (this.isoPalette = r),
              (this.ovlPalette = s),
              (this.unitPalette = a),
              (this.animPalette = n),
              (this.libPalette = o),
              (this.tileSets = l));
          }
          getPalette(e, t) {
            switch (e) {
              case r.PaletteType.Anim:
                return this.animPalette;
              case r.PaletteType.Overlay:
                return this.ovlPalette;
              case r.PaletteType.Unit:
                return this.unitPalette;
              case r.PaletteType.Custom:
                if ("lib" === t) return this.libPalette;
                var i = this.palettes.get(t + ".pal");
                if (!i) throw new Error(`Custom palette "${t}" not found`);
                return i;
              default:
                r.PaletteType.Iso;
                return this.isoPalette;
            }
          }
        }),
      );
    },
  };
});
