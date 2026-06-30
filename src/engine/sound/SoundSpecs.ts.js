// === Reconstructed SystemJS module: engine/sound/SoundSpecs ===
// deps: ["engine/sound/SoundSpec"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/sound/SoundSpecs", ["engine/sound/SoundSpec"], function (t, e) {
  "use strict";
  var s, a, n, i, r;
  e && e.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      var e;
      (((e = a || t("SoundType", (a = {})))[(e.Global = 0)] = "Global"),
        (e[(e.Normal = 1)] = "Normal"),
        (e[(e.Screen = 2)] = "Screen"),
        (e[(e.Local = 3)] = "Local"),
        (e[(e.Player = 4)] = "Player"),
        (e[(e.Unshroud = 5)] = "Unshroud"),
        (e[(e.Shroud = 6)] = "Shroud"),
        ((e = n || t("SoundPriority", (n = {})))[(e.Lowest = 0)] = "Lowest"),
        (e[(e.Low = 1)] = "Low"),
        (e[(e.Normal = 2)] = "Normal"),
        (e[(e.High = 3)] = "High"),
        (e[(e.Critical = 4)] = "Critical"),
        ((e = i || t("SoundControl", (i = {})))[(e.All = 0)] = "All"),
        (e[(e.Loop = 1)] = "Loop"),
        (e[(e.Random = 2)] = "Random"),
        (e[(e.Predelay = 3)] = "Predelay"),
        (e[(e.Interrupt = 4)] = "Interrupt"),
        (e[(e.Attack = 5)] = "Attack"),
        (e[(e.Decay = 6)] = "Decay"),
        (e[(e.Ambient = 7)] = "Ambient"),
        t(
          "SoundSpecs",
          (r = class {
            constructor(e) {
              ((this.ini = e), (this.specs = new Map()), this.parse());
            }
            parse() {
              let t = this.ini.getSection("Defaults");
              if (t) {
                this.defaults = {
                  minVolume: t.getNumber("MinVolume"),
                  range: t.getNumber("Range"),
                  volume: t.getNumber("Volume"),
                  limit: t.getNumber("Limit"),
                  type: t.getEnumArray("Type", a, /\s+/, [], !0),
                  priority: t.getEnum("Priority", n, n.Normal, !0),
                };
                let e = this.ini.getSection("SoundList");
                var i, r;
                if (e)
                  for (i of new Set(e.entries.values()))
                    i &&
                      ((r = this.ini.getSection(i))
                        ? this.specs.set(i, new s.SoundSpec().read(r, this.defaults))
                        : console.warn(`Missing sound section [${i}]`));
                else console.warn("Missing sound [SoundList] section. Sounds will not be played.");
              } else console.warn("Missing sound [Defaults] section. Sounds will not be played.");
            }
            getSpec(e) {
              return this.specs.get(e);
            }
            getAll() {
              return [...this.specs.values()];
            }
          }),
        ));
    },
  };
});
