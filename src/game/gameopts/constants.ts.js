// === Reconstructed SystemJS module: game/gameopts/constants ===
// deps: ["game/gameopts/GameOpts"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameopts/constants", ["game/gameopts/GameOpts"], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      (e("RANDOM_COUNTRY_ID", -2),
        e("RANDOM_COLOR_ID", -2),
        e("RANDOM_START_POS", -2),
        e("NO_TEAM_ID", -2),
        e("OBS_COUNTRY_ID", -3),
        e("OBS_COLOR_ID", -2),
        e("RANDOM_COUNTRY_NAME", "Random"),
        e("OBS_COUNTRY_NAME", "Observer"),
        e("aiUiNames", new Map().set(i.AiDifficulty.Easy, "GUI:AIDummy").set(i.AiDifficulty.Medium, "NOSTR:伊拉克AI").set(i.AiDifficulty.Brutal, "NOSTR:Custom AI")),
        e("aiUiTooltips", new Map()),
        e("RANDOM_COUNTRY_UI_NAME", "GUI:RandomEx"),
        e("RANDOM_COUNTRY_UI_TOOLTIP", "STT:PlayerSideRandom"),
        e("OBS_COUNTRY_UI_NAME", "GUI:Observer"),
        e("OBS_COUNTRY_UI_TOOLTIP", "STT:PlayerSideObserver"),
        e("RANDOM_COLOR_NAME", ""));
    },
  };
});
