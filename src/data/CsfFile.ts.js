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
        // 与 TS 侧对齐：掩码回 8 位。>>>0 会令 UTF-16 配对恒为 0xFFxx 乱码
        // （标准 CSF 实测 "Hi"→"ｈｩ"），GBK 误回退 + sprintf %\0 炸
        (l = (e) => e.map((e) => (~e & 255))),
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
                var s = t.readInt32(),
                  a = t.readString(t.readInt32());
                // 与 TS 侧对齐：s 是标签内字符串数量（原误当标志位，偶数标签存空串且流不消费致后续乱码）；
                // 逐块解析取第一串为值
                let v = "";
                for (let m = 0; m < s; m++) {
                  var r = t.readInt32() === o,
                    u = c(l(t.readUint8Array(2 * t.readInt32())));
                  if (0 === m) v = u;
                  r && t.readString(t.readInt32());
                }
                this.data[a] = v;
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
