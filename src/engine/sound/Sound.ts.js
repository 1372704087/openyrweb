// === Reconstructed SystemJS module: engine/sound/Sound ===
// deps: ["engine/sound/ChannelType","engine/sound/SoundKey","engine/sound/SoundSpecs","util/math","util/typeGuard"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/sound/Sound",
  ["engine/sound/ChannelType", "engine/sound/SoundKey", "engine/sound/SoundSpecs", "util/math", "util/typeGuard"],
  function (e, t) {
    "use strict";
    var a, n, g, p, m, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        e(
          "Sound",
          (i = class {
            constructor(e, t, i, r, s) {
              ((this.audioSystem = e),
                (this.audioFiles = t),
                (this.soundSpecs = i),
                (this.audioVisualRules = r),
                (this.document = s),
                (this.playbackHandles = new Map()),
                (this.handleClick = (e) => {
                  let t = e.target;
                  t.matches("button, .menu-button:not(.disabled)")
                    ? this.play(n.SoundKey.GUIMainButtonSound, a.ChannelType.Ui)
                    : t.matches(".list-item")
                      ? this.play(n.SoundKey.GenericClick, a.ChannelType.Ui)
                      : t instanceof HTMLInputElement && ["checkbox", "radio", "range"].includes(t.type) && !t.disabled
                        ? this.play(n.SoundKey.GUICheckboxSound, a.ChannelType.Ui)
                        : ((t instanceof HTMLSelectElement && !t.disabled) || t.matches(".select:not(.disabled) *")) &&
                          this.play(n.SoundKey.GUIComboOpenSound, a.ChannelType.Ui);
                }));
            }
            initialize() {
              (this.audioSystem.initialize(), this.document.addEventListener("click", this.handleClick));
            }
            dispose() {
              (this.audioSystem.dispose(), this.document.removeEventListener("click", this.handleClick));
            }
            getSoundKey(e) {
              let t;
              if ("string" == typeof n.SoundKey[e]) {
                if (((t = this.audioVisualRules.ini.getString(n.SoundKey[e])), !t)) return;
              } else t = e;
              return t;
            }
            getSoundSpec(e) {
              var t = this.getSoundKey(e);
              if (t) {
                var i = this.soundSpecs.getSpec(t);
                if (i) return i;
                console.warn(`Sound "${t}" is not defined`);
              } else console.warn(`No sound is defined for key "${n.SoundKey[e]}"`);
            }
            play(e, t) {
              let i = this.getSoundSpec(e);
              if (i) {
                var r = i.control.has(g.SoundControl.Loop) ? i.loop || Number.POSITIVE_INFINITY : 0;
                return this.playWithOptions(i, t, i.volume / 100, 0, i.limit, r);
              }
            }
            playWithOptions(r, s, a, n, t, o) {
              if (r.sounds.length) {
                this.cleanOldHandles();
                let e = this.playbackHandles.get(r.name);
                if ((e || ((e = []), this.playbackHandles.set(r.name, e)), t && e.length >= t)) {
                  if (!r.control.has(g.SoundControl.Interrupt)) return;
                  e.shift().stop();
                }
                var l = 1 + (r.fShift ? p.getRandomInt(r.fShift.min, r.fShift.max) / 100 : 0);
                let i;
                var c = r.control.has(g.SoundControl.Attack),
                  h = r.control.has(g.SoundControl.Decay);
                if (o && (1 < r.sounds.length || o !== Number.POSITIVE_INFINITY || r.delay)) {
                  let e = this.buildAttackDecaySequence(r, c, h, !0);
                  var u = e.map((e) => this.getWavFile(e)).filter(m.isNotNullOrUndefined);
                  i = this.audioSystem.playWavLoop(u, s, a, n, r.delay, l, c, h, o);
                } else {
                  let t = 0;
                  if ((r.delay && (t = p.getRandomInt(r.delay.min, r.delay.max)), c || h)) {
                    let e = this.buildAttackDecaySequence(r, c, h, !1);
                    var d = e.map((e) => this.getWavFile(e)).filter(m.isNotNullOrUndefined);
                    i = this.audioSystem.playWavSequence(d, s, a, n, t, l);
                  } else {
                    let e;
                    e = r.control.has(g.SoundControl.Random)
                      ? r.sounds[p.getRandomInt(0, r.sounds.length - 1)]
                      : r.sounds[0];
                    d = this.getWavFile(e);
                    if (!d) return;
                    i = this.audioSystem.playWavFile(d, s, a, n, t, l, 0 !== o);
                  }
                }
                return (i && e.push(i), i);
              }
            }
            buildAttackDecaySequence(e, t, i, r) {
              var s = t ? e.attack || 1 : 0,
                a = i ? e.decay || 1 : 0,
                n = e.sounds.slice(s, e.sounds.length - a);
              let o = [];
              return (
                0 < s && ((s = e.sounds[p.getRandomInt(0, s - 1)]), o.push(s)),
                r ? o.push(...n) : o.push(n[p.getRandomInt(0, n.length - 1)]),
                0 < a && ((a = e.sounds[p.getRandomInt(e.sounds.length - a, e.sounds.length - 1)]), o.push(a)),
                o
              );
            }
            getWavFile(e) {
              var t = e + ".wav",
                i = this.audioFiles.get(t);
              if (i) return i;
              console.error(`Audio file "${t}" not found.`);
            }
            cleanOldHandles() {
              for (var [e, t] of this.playbackHandles)
                ((t = t.filter((e) => e.isPlaying())), this.playbackHandles.set(e, t));
            }
          }),
        );
      },
    };
  },
);
