// === Reconstructed SystemJS module: engine/sound/Eva ===
// deps: ["engine/sound/ChannelType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/sound/Eva", ["engine/sound/ChannelType"], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "Eva",
        (i = class {
          constructor(e, t, i) {
            ((this.evaSpecs = e),
              (this.sound = t),
              (this.renderer = i),
              (this.evaWaitingList = []),
              (this.lastEvaEventBySpec = new Map()),
              (this.handleFrame = (t) => {
                var e, i;
                this.currentEvaPlaying?.isPlaying()
                  ? (this.evaWaitingList = this.evaWaitingList.filter((e) => e.queue))
                  : ((this.currentEvaPlaying = void 0),
                    this.evaWaitingList.sort((e, t) => t.priority - e.priority),
                    (this.evaWaitingList = this.evaWaitingList.filter(
                      (e) => 5e3 <= t - (this.lastEvaEventBySpec.get(e) || 0),
                    )),
                    this.evaWaitingList.length &&
                      ((e = this.evaWaitingList.shift()),
                      (i = this.sound.getWavFile(e.sound)) &&
                        ((this.currentEvaPlaying = this.sound.audioSystem.playWavFile(i, r.ChannelType.Voice)),
                        this.lastEvaEventBySpec.set(e, t),
                        this.evaWaitingList.splice(1))));
              }));
          }
          init() {
            this.renderer.onFrame.subscribe(this.handleFrame);
          }
          dispose() {
            (this.renderer.onFrame.unsubscribe(this.handleFrame), this.currentEvaPlaying?.stop());
          }
          play(e, t = !1) {
            let i = this.evaSpecs.getSpec(e);
            i
              ? (t && (i = { ...i, queue: !0 }), this.evaWaitingList.push(i))
              : console.warn(`No EVA with name ${e} was found. Skipping.`);
          }
        }),
      );
    },
  };
});
