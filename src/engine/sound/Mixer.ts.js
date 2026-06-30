// === Reconstructed SystemJS module: engine/sound/Mixer ===
// deps: ["util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/sound/Mixer", ["util/event"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "Mixer",
        (r = class {
          constructor() {
            ((this.volumes = new Map()), (this.mutes = new Map()), (this._onVolumeChange = new i.EventDispatcher()));
          }
          get onVolumeChange() {
            return this._onVolumeChange.asEvent();
          }
          setVolume(e, t) {
            this.getVolume(e) !== t && (this.volumes.set(e, t), this._onVolumeChange.dispatch(this, e));
          }
          getVolume(e) {
            return this.volumes.get(e) ?? 1;
          }
          setMuted(e, t) {
            (this.mutes.set(e, t), this._onVolumeChange.dispatch(this, e));
          }
          isMuted(e) {
            return !!this.mutes.get(e);
          }
          serialize() {
            return [...this.volumes.entries()].map(([e, t]) => e + "," + t).join(";");
          }
          unserialize(e) {
            return ((this.volumes = new Map(e.split(";").map((e) => e.split(",").map(Number)))), this);
          }
        }),
      );
    },
  };
});
