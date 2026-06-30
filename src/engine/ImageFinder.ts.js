// === Reconstructed SystemJS module: engine/ImageFinder ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/ImageFinder", [], function (e, t) {
  "use strict";
  var s;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "ImageFinder",
        (s = class s {
          constructor(e, t) {
            ((this.images = e), (this.theater = t));
          }
          findByObjectArt(e) {
            return this.find(e.imageName, e.useTheaterExtension);
          }
          find(e, t) {
            var i = this.getFilename(e, t),
              r = this.images.get(i);
            if (!r) throw new s.MissingImageError(`No image file found for artName="${e}" (file=${i})`);
            return r;
          }
          tryFind(e, t) {
            let i;
            try {
              i = this.find(e, t);
            } catch (e) {
              if (!(e instanceof s.MissingImageError)) throw e;
            }
            return i;
          }
          getFilename(e, t) {
            let i = e.toLowerCase();
            return ((i += t ? this.theater.settings.extension : ".shp"), (i = this.applyNewTheaterIfNeeded(e, i)), i);
          }
          applyNewTheaterIfNeeded(e, t) {
            return -1 === ["G", "N", "C", "Y"].indexOf(e[0]) || -1 === ["A", "T", "U", "D", "L", "N"].indexOf(e[1])
              ? t
              : this.applyNewTheater(t);
          }
          applyNewTheater(e) {
            let t;
            var i = e[0],
              r = e.substr(2),
              s = this.theater.settings.newTheaterChar.toLowerCase();
            return ((t = i + s + r), this.images.has(t) || ((t = i + "g" + r), this.images.has(t) || (t = e)), t);
          }
        }),
      ),
        (function (e) {
          class t extends Error {}
          e.MissingImageError = t;
        })(s || e("ImageFinder", (s = {}))));
    },
  };
});
