// === Reconstructed SystemJS module: engine/sound/SoundSpec ===
// deps: ["engine/sound/SoundSpecs"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/sound/SoundSpec", ["engine/sound/SoundSpecs"], function (e, t) {
  "use strict";
  var s, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "SoundSpec",
        (i = class {
          read(e, t) {
            let i = e.getNumber("Range", t.range);
            var r;
            return (
              -2 === i && (i = Number.POSITIVE_INFINITY),
              (this.name = e.name),
              (this.control = new Set(e.getEnumArray("Control", s.SoundControl, /\s+/, [], !0))),
              (this.sounds = e.getArray("Sounds", /\s+/).map((e) => e.replace(/^\$/, ""))),
              (this.volume = e.has("Volume") ? e.getNumber("Volume", t.volume) : e.getNumber("volume", t.volume)),
              (this.delay = this.createMinMaxPair(e.getNumberArray("Delay", /\s+/, []))),
              (this.priority = e.getEnum("Priority", s.SoundPriority, t.priority, !0)),
              (this.type = e.getEnumArray("Type", s.SoundType, /\s+/, t.type, !0)),
              this.type.some((e) => [s.SoundType.Screen, s.SoundType.Local, s.SoundType.Global].includes(e)) ||
                ((r = t.type.find((e) => [s.SoundType.Screen, s.SoundType.Local, s.SoundType.Global].includes(e))) &&
                  this.type.push(r)),
              (this.fShift = this.createMinMaxPair(e.getNumberArray("FShift", /\s+/, []))),
              (this.limit = e.getNumber("Limit", t.limit)),
              (this.loop = e.getNumber("Loop")),
              (this.range = i),
              (this.minVolume = e.getNumber("MinVolume", t.minVolume)),
              (this.vShift = this.createMinMaxPair(e.getNumberArray(e.has("Vshift") ? "Vshift" : "VShift", /\s+/, []))),
              (this.attack = e.getNumber("Attack")),
              (this.decay = e.getNumber("Decay")),
              this
            );
          }
          createMinMaxPair(i) {
            if (i.length) {
              let [e, t] = i;
              return (void 0 === t && (t = e), { min: e, max: t });
            }
          }
        }),
      );
    },
  };
});
