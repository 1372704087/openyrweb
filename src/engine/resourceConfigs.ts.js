// === Reconstructed SystemJS module: engine/resourceConfigs ===
// deps: ["engine/TheaterType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/resourceConfigs", ["engine/TheaterType"], function (t, e) {
  "use strict";
  var i, r;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      var e;
      (((e = r || t("ResourceType", (r = {})))[(e.IsoSnow = 0)] = "IsoSnow"),
        (e[(e.IsoTemp = 1)] = "IsoTemp"),
        (e[(e.IsoUrb = 2)] = "IsoUrb"),
        (e[(e.BuildGen = 3)] = "BuildGen"),
        (e[(e.TheaterSnow = 4)] = "TheaterSnow"),
        (e[(e.TheaterTemp = 5)] = "TheaterTemp"),
        (e[(e.TheaterUrb = 6)] = "TheaterUrb"),
        (e[(e.TheaterSnow2 = 7)] = "TheaterSnow2"),
        (e[(e.TheaterTemp2 = 8)] = "TheaterTemp2"),
        (e[(e.TheaterUrb2 = 9)] = "TheaterUrb2"),
        (e[(e.Ui = 10)] = "Ui"),
        (e[(e.UiAlly = 11)] = "UiAlly"),
        (e[(e.UiSov = 12)] = "UiSov"),
        (e[(e.Anims = 13)] = "Anims"),
        (e[(e.Vxl = 14)] = "Vxl"),
        (e[(e.Cameo = 15)] = "Cameo"),
        (e[(e.Ini = 16)] = "Ini"),
        (e[(e.Strings = 17)] = "Strings"),
        (e[(e.EvaAlly = 18)] = "EvaAlly"),
        (e[(e.EvaSov = 19)] = "EvaSov"),
        (e[(e.Sounds = 20)] = "Sounds"),
        (e[(e.HalloweenMix = 21)] = "HalloweenMix"),
        (e[(e.XmasMix = 22)] = "XmasMix"),
        t(
          "resourceConfigs",
          new Map()
            .set(r.IsoSnow, { id: "isoSnow", src: "isosnow.mix", type: "binary", sizeHint: 28758698 })
            .set(r.IsoTemp, { id: "isoTemp", src: "isotemp.mix", type: "binary", sizeHint: 29171410 })
            .set(r.IsoUrb, { id: "isoUrb", src: "isourb.mix", type: "binary", sizeHint: 31811402 })
            .set(r.BuildGen, { id: "buildGen", src: "build-gen.mix", type: "binary", sizeHint: 27801690 })
            .set(r.TheaterSnow, { id: "theater.snow", src: "snow.mix", type: "binary", sizeHint: 18421274 })
            .set(r.TheaterTemp, { id: "theater.temp", src: "temperat.mix", type: "binary", sizeHint: 2728266 })
            .set(r.TheaterUrb, { id: "theater.urb", src: "urban.mix", type: "binary", sizeHint: 2726218 })
            .set(r.TheaterSnow2, { id: "theater.snow2", src: "sno.mix", type: "binary", sizeHint: 10898 })
            .set(r.TheaterTemp2, { id: "theater.temp2", src: "tem.mix", type: "binary", sizeHint: 10850 })
            .set(r.TheaterUrb2, { id: "theater.urb2", src: "urb.mix", type: "binary", sizeHint: 10850 })
            .set(r.UiAlly, { id: "uially", src: "sidec01.mix", type: "binary", sizeHint: 2099412 })
            .set(r.UiSov, { id: "uisov", src: "sidec02.mix", type: "binary", sizeHint: 2102564 })
            .set(r.Anims, { id: "anims", src: "anims.mix", type: "binary", sizeHint: 15867898 })
            .set(r.Vxl, { id: "vxl", src: "vxl.mix", type: "binary", sizeHint: 5271701 })
            .set(r.Cameo, { id: "cameo", src: "cameo.mix", type: "binary", sizeHint: 608120 })
            .set(r.Ini, { id: "ini", src: "ini.mix", type: "binary", sizeHint: 1000842 })
            .set(r.Ui, { id: "ui", src: "ui.mix", type: "binary", sizeHint: 4424093 })
            .set(r.Strings, { id: "strings", src: "strings.mix", type: "binary", sizeHint: 485818 })
            .set(r.EvaAlly, { id: "evaally", src: "eva-ally.mix", type: "binary", sizeHint: 1835436 })
            .set(r.EvaSov, { id: "evasov", src: "eva-sov.mix", type: "binary", sizeHint: 2021760 })
            .set(r.Sounds, { id: "sounds", src: "sounds.mix", type: "binary", sizeHint: 17684750 })
            .set(r.HalloweenMix, { id: "halloweenmix", src: "expandspawn09.mix", type: "binary", sizeHint: 20312 })
            .set(r.XmasMix, { id: "xmasmix", src: "expandspawn10.mix", type: "binary", sizeHint: 10318 }),
        ),
        t("resourcesForPrefetch", [
          r.BuildGen,
          r.Sounds,
          r.Anims,
          r.Vxl,
          r.IsoUrb,
          r.TheaterUrb,
          r.TheaterUrb2,
          r.IsoTemp,
          r.TheaterTemp,
          r.TheaterTemp2,
          r.IsoSnow,
          r.TheaterSnow,
          r.TheaterSnow2,
        ]),
        t(
          "theaterSpecificResources",
          new Map([
            [i.TheaterType.Snow, [r.TheaterSnow, r.TheaterSnow2, r.IsoSnow]],
            [i.TheaterType.Temperate, [r.TheaterTemp, r.TheaterTemp2, r.IsoTemp]],
            [i.TheaterType.Urban, [r.TheaterUrb, r.TheaterUrb2, r.IsoUrb]],
          ]),
        ));
    },
  };
});
