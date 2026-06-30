// === Reconstructed SystemJS module: engine/sound/ChannelType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/sound/ChannelType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("ChannelType", (i = {})))[(e.Master = 0)] = "Master"),
        (e[(e.Ui = 1)] = "Ui"),
        (e[(e.Ambient = 2)] = "Ambient"),
        (e[(e.Effect = 3)] = "Effect"),
        (e[(e.Voice = 4)] = "Voice"),
        (e[(e.Music = 5)] = "Music"),
        (e[(e.CreditTicks = 6)] = "CreditTicks"));
    },
  };
});
