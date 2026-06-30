// === Reconstructed SystemJS module: gui/screen/game/TauntPlayback ===
// deps: ["engine/sound/ChannelType","util/string"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/TauntPlayback", ["engine/sound/ChannelType", "util/string"], function (e, t) {
  "use strict";
  var s, i, r, a;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = new Map()
        .set("Americans", "am")
        .set("French", "fr")
        .set("Germans", "ge")
        .set("British", "br")
        .set("Russians", "ru")
        .set("Confederation", "cu")
        .set("Africans", "li")
        .set("Arabs", "ir")
        .set("Alliance", "ko")),
        e(
          "TauntPlayback",
          (a = class {
            constructor(e, t) {
              ((this.audioSystem = e), (this.taunts = t));
            }
            async playTaunt(e, t) {
              var i = this.getTauntFileName(e.country.name, t),
                r = await this.taunts.get(i);
              r ? this.audioSystem.playWavFile(r, s.ChannelType.Voice) : console.warn(`Taunt file "${i}" not found.`);
            }
            getTauntFileName(e, t) {
              return `tau${r.get(e)}${i.pad(t, "00")}.wav`;
            }
          }),
        ));
    },
  };
});
