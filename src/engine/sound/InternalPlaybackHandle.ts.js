// === Reconstructed SystemJS module: engine/sound/InternalPlaybackHandle ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/sound/InternalPlaybackHandle", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "InternalPlaybackHandle",
        (i = class {
          constructor() {
            ((this.playing = !0), (this.isLoop = !1), (this.stopRequested = !1));
          }
          setNodes(e, t, i) {
            ((this.sourceNode = e),
              (this.gainNode = t),
              (this.panNode = i),
              this.stopRequested
                ? this.stop()
                : (this.volumeRequested && (t.gain.value = this.volumeRequested),
                  this.panRequested && (i.pan.value = this.panRequested)));
          }
          isPlaying() {
            return this.playing;
          }
          stop() {
            try {
              (this.sourceNode ? this.sourceNode.stop() : (this.stopRequested = !0), (this.playing = !1));
            } catch (e) {
              console.error(e);
            }
          }
          setVolume(e) {
            this.gainNode ? (this.gainNode.gain.value = e) : (this.volumeRequested = e);
          }
          setPan(e) {
            this.panNode ? (this.panNode.pan.value = e) : (this.panRequested = e);
          }
        }),
      );
    },
  };
});
