// === Reconstructed SystemJS module: game/rules/ObjectRules ===
// deps: ["engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/ObjectRules", ["engine/type/ObjectType"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      (e(
        "ObjectRules",
        (r = class {
          static iniSpeedToLeptonsPerTick(e, t) {
            return Math.min(256, (256 * e) / t);
          }
          static iniRotToDegsPerTick(e) {
            return (e / 256) * 360;
          }
          constructor(e, t, i = -1, r) {
            ((this.type = e), (this.ini = t), (this.index = i), (this.generalRules = r), this.parse());
          }
          parse() {
            ((this.alphaImage = this.ini.getString("AlphaImage") || void 0),
              (this.alternateArcticArt = this.ini.getBool("AlternateArcticArt")),
              (this.crushable = this.ini.getBool("Crushable", this.type === i.ObjectType.Infantry)),
              (this.crushSound = this.ini.getString("CrushSound") || void 0),
              (this.dontScore = this.ini.getBool("DontScore")),
              (this.insignificant = this.ini.getBool("Insignificant")),
              (this.legalTarget = this.ini.getBool("LegalTarget", !0)),
              (this.noShadow = this.ini.getBool("NoShadow")),
              (this.uiName = this.ini.getString("UIName")));
          }
          get name() {
            return this.ini.name;
          }
          get imageName() {
            let e = this.ini.getString("Image");
            return ((e && "null" !== e) || (e = this.name), e);
          }
        }),
      ),
        (r.IMAGE_NONE = "none"));
    },
  };
});
