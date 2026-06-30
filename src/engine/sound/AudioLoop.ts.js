// === Reconstructed SystemJS module: engine/sound/AudioLoop ===
// deps: ["util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/sound/AudioLoop", ["util/math"], function (e, t) {
  "use strict";
  var o, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
    ],
    execute: function () {
      e(
        "AudioLoop",
        (i = class {
          constructor(e, t, i, r, s, a, n, o, l) {
            ((this.audioContext = e),
              (this.volume = t),
              (this.pan = i),
              (this.rate = r),
              (this.delayMs = s),
              (this.attack = a),
              (this.decay = n),
              (this.playBuffer = l),
              (this.isLoop = !0),
              (this.items = []),
              (this.playing = !1),
              (this.handleSoundEnded = () => {
                this.playing &&
                  (this.removeCompleted(),
                  this.fill(this.buffers),
                  this.remainingLoops || this.items.length || this.stop());
              }),
              (this.remainingLoops = o));
          }
          setBuffers(e) {
            ((this.buffers = e),
              this.playing &&
                ((this.timePointer = Math.max(this.timePointer, this.audioContext.currentTime)),
                this.fill(this.buffers)));
          }
          start(e) {
            if (this.playing) throw new Error("Already playing");
            ((this.timePointer = e), (this.playing = !0), this.buffers && this.fill(this.buffers));
          }
          isPlaying() {
            return this.playing;
          }
          stop() {
            var e;
            this.playing &&
              ((this.playing = !1),
              this.decay && this.buffers
                ? (this.removeCompleted(),
                  this.items.length &&
                    ((e = this.items[0].startTime + this.items[0].duration),
                    this.items.splice(1).forEach((e) => e.handle.stop()),
                    this.queueBuffer(this.buffers[this.buffers.length - 1], e)))
                : (this.items.forEach((e) => e.handle.stop()), (this.items.length = 0)));
          }
          setVolume(t) {
            ((this.volume = t), this.items.forEach((e) => e.handle.setVolume(t)));
          }
          setPan(t) {
            ((this.pan = t), this.items.forEach((e) => e.handle.setPan(t)));
          }
          add(e) {
            this.items.push(e);
          }
          removeCompleted() {
            this.items = this.items.filter((e) => e.startTime + e.duration >= this.audioContext.currentTime);
          }
          fill(e) {
            let t = this.items.length ? this.timePointer - this.items[0].startTime : 0;
            for (; t < 0.1 || this.items.length < 3;) {
              if (!this.attack || void 0 !== this.bufferPointer) {
                if (this.remainingLoops <= 0) break;
                this.remainingLoops--;
              }
              this.attack
                ? (this.bufferPointer =
                    void 0 === this.bufferPointer ? 0 : o.getRandomInt(1, e.length - 1 - (this.decay ? 1 : 0)))
                : (this.bufferPointer = o.getRandomInt(0, e.length - 1));
              var i = e[this.bufferPointer],
                i = this.queueBuffer(i, this.timePointer);
              ((this.timePointer += i), (t += i));
            }
          }
          queueBuffer(e, t) {
            var i = this.delayMs ? o.getRandomInt(this.delayMs.min, this.delayMs.max) / 1e3 : 0,
              r = t + i,
              s = e.duration / this.rate;
            let { handle: a, source: n } = this.playBuffer(e, r, this.volume, this.pan, this.rate);
            return (
              n.addEventListener("ended", this.handleSoundEnded),
              this.add({ startTime: r, duration: s, handle: a }),
              s + i
            );
          }
        }),
      );
    },
  };
});
