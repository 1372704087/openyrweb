// === Reconstructed SystemJS module: data/CsfFile ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/CsfFile", [], function (t, e) {
  "use strict";
  var o, l, c, h, i, r;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      ((o = new Uint32Array(
        new Uint8Array(Array.prototype.map.call("STRW", (e) => e.charCodeAt(0)).reverse()).buffer,
      )[0]),
        (l = (e) => e.map((e) => ~e >>> 0)),
        (c = (e) => {
          let t = "";
          for (let i = 0; i < e.length; i += 2) t += String.fromCharCode((e[i + 1] << 8) | e[i]);
          return t;
        }),
        ((e = h || t("CsfLanguage", (h = {})))[(e.EnglishUS = 0)] = "EnglishUS"),
        (e[(e.EnglishUK = 1)] = "EnglishUK"),
        (e[(e.German = 2)] = "German"),
        (e[(e.French = 3)] = "French"),
        (e[(e.Spanish = 4)] = "Spanish"),
        (e[(e.Italian = 5)] = "Italian"),
        (e[(e.Japanese = 6)] = "Japanese"),
        (e[(e.Jabberwockie = 7)] = "Jabberwockie"),
        (e[(e.Korean = 8)] = "Korean"),
        (e[(e.Unknown = 9)] = "Unknown"),
        (e[(e.ChineseCN = 100)] = "ChineseCN"),
        (e[(e.ChineseTW = 101)] = "ChineseTW"),
        t(
          "csfLocaleMap",
          (i = new Map()
            .set(h.EnglishUS, "en-US")
            .set(h.EnglishUK, "en-GB")
            .set(h.German, "de-DE")
            .set(h.French, "fr-FR")
            .set(h.Spanish, "es-ES")
            .set(h.Italian, "it-IT")
            .set(h.Japanese, "ja-JP")
            .set(h.Korean, "ko-KR")
            .set(h.ChineseCN, "zh-CN")
            .set(h.ChineseTW, "zh-TW")),
        ),
        t(
          "CsfFile",
          (r = class {
            constructor(e) {
              ((this.language = h.Unknown), (this.data = {}), e && this.fromVirtualFile(e));
            }
            fromVirtualFile(e) {
              let t = e.stream;
              (t.readInt32(), t.readInt32());
              var i = t.readInt32();
              (t.readInt32(), t.readInt32(), (this.language = t.readInt32()));
              for (let n = 0; n < i; n++) {
                t.readInt32();
                var r,
                  s = t.readInt32(),
                  a = t.readString(t.readInt32());
                0 != (1 & s)
                  ? ((r = t.readInt32() === o),
                    (s = l(t.readUint8Array(2 * t.readInt32()))),
                    (s = c(s)),
                    r && t.readString(t.readInt32()),
                    (this.data[a] = s))
                  : (this.data[a] = "");
              }
              this.language === h.Unknown && this.autoDetectLocale();
            }
            autoDetectLocale() {
              switch (this.data["THEME:Intro"]) {
                case "開場":
                  this.language = h.ChineseTW;
                  break;
                case "开场":
                  this.language = h.ChineseCN;
              }
            }
            getIsoLocale() {
              return i.get(this.language);
            }
          }),
        ));
    },
  };
});
