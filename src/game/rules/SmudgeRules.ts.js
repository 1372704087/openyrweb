// === Reconstructed SystemJS module: game/rules/SmudgeRules ===
// deps: ["game/rules/ObjectRules"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/SmudgeRules", ["game/rules/ObjectRules"], function (e, t) {
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
      ((r = class extends i.ObjectRules {
        parse() {
          (super.parse(),
            (this.burn = this.ini.getBool("Burn")),
            (this.crater = this.ini.getBool("Crater")),
            (this.width = this.ini.getNumber("Width", 1)),
            (this.height = this.ini.getNumber("Height", 1)));
        }
      }),
        e("SmudgeRules", r));
    },
  };
});
