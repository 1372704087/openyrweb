// === Reconstructed SystemJS module: engine/sound/MusicSpecs ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/sound/MusicSpecs", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "MusicSpecs",
        (i = class {
          constructor(e) {
            ((this.ini = e), (this.specs = new Map()), this.parse());
          }
          parse() {
            let e = this.ini.getSection("Themes");
            if (e) {
              for (var t of e.entries.values())
                if (t) {
                  let e = this.ini.getSection(t);
                  var i;
                  e
                    ? ((i = {
                        name: e.getString("Name"),
                        sound: e.getString("Sound"),
                        normal: e.getBool("Normal", !0),
                        repeat: e.getBool("Repeat"),
                      }),
                      this.specs.set(t, i))
                    : console.warn(`Music section [${t}] not found. Skipping.`);
                }
            } else console.warn("[Themes] section missing. Music will not be played.");
          }
          getSpec(e) {
            return this.specs.get(e);
          }
          getAll() {
            return [...this.specs.values()];
          }
        }),
      );
    },
  };
});
