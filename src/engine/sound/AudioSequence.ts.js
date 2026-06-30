// === Reconstructed SystemJS module: engine/sound/AudioSequence ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/sound/AudioSequence", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "AudioSequence",
        (i = class {
          constructor(e, t, i, r, s, a) {
            ((this.audioContext = e),
              (this.volume = t),
              (this.pan = i),
              (this.rate = r),
              (this.delayMs = s),
              (this.playBuffer = a),
              (this.isLoop = !1),
              (this.items = []),
              (this.playing = !1),
              (this.handleSoundEnded = () => {
                this.playing && (this.removeCompleted(), this.items.length || (this.playing = !1));
              }));
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
            this.playing && ((this.playing = !1), this.items.forEach((e) => e.handle.stop()), (this.items.length = 0));
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
            let t = this.delayMs ? this.delayMs / 1e3 : 0;
            for (var i of e) {
              i = this.queueBuffer(i, this.timePointer, t);
              ((this.timePointer += i), (t = 0));
            }
          }
          queueBuffer(e, t, i) {
            var r = t + i,
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
