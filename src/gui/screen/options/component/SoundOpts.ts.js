// === Reconstructed SystemJS module: gui/screen/options/component/SoundOpts ===
// deps: ["react","gui/component/Slider","engine/sound/ChannelType","gui/screen/options/component/MusicJukebox"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/component/SoundOpts",
  ["react", "gui/component/Slider", "engine/sound/ChannelType", "gui/screen/options/component/MusicJukebox"],
  function (e, t) {
    "use strict";
    var s, a, i, n, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        ((o = new Map([
          [i.ChannelType.Master, "GUI:MasterVolume"],
          [i.ChannelType.Music, "GUI:MusicVolume"],
          [i.ChannelType.Effect, "GUI:SFXVolume"],
          [i.ChannelType.Voice, "GUI:VoiceVolume"],
          [i.ChannelType.Ambient, "GUI:AmbientVolume"],
          [i.ChannelType.Ui, "GUI:UIVolume"],
          [i.ChannelType.CreditTicks, "GUI:CreditsVolume"],
        ])),
          e("SoundOpts", ({ strings: i, music: e, mixer: r }) =>
            s.createElement(
              "div",
              { className: "opts sound-opts" },
              s.createElement(
                "div",
                { className: "sound-sliders" },
                [...o].map(([t, e]) =>
                  s.createElement(
                    "div",
                    { className: "slider-item", key: t },
                    s.createElement("span", { className: "label" }, i.get(e)),
                    s.createElement(a.Slider, {
                      min: 0,
                      max: 10,
                      value: "" + 10 * r.getVolume(t),
                      onChange: (e) => r.setVolume(t, Number(e.target.value) / 10),
                    }),
                  ),
                ),
              ),
              e && s.createElement(n.MusicJukebox, { music: e, strings: i }),
            ),
          ));
      },
    };
  },
);
