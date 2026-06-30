// === Reconstructed SystemJS module: engine/gfx/lighting/LightingDirector ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/lighting/LightingDirector", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "LightingDirector",
        (i = class {
          constructor(e, t, i) {
            ((this.lighting = e),
              (this.renderer = t),
              (this.gameSpeed = i),
              (this.effects = []),
              (this.onFrame = (s) => {
                if (this.effects.length) {
                  let r = !1;
                  (this.effects.slice().forEach((e, t) => {
                    e.isRunning ||
                      ((e.isRunning = !0), (e.startTime = s), e.mapLighting.copy(this.lighting.getBaseAmbient()));
                    var i = e.update(s, this.gameSpeed.value);
                    (i.done && (this.effects.splice(this.effects.indexOf(e), 1), t || (r = !0)),
                      t || (i.updated && this.lighting.applyAmbientOverride(e.mapLighting)));
                  }),
                    this.effects.length
                      ? r && this.lighting.applyAmbientOverride(this.effects[0].mapLighting)
                      : this.lighting.applyAmbientOverride(void 0));
                }
              }));
          }
          init() {
            this.renderer.onFrame.subscribe(this.onFrame);
          }
          addEffect(e) {
            (this.effects.push(e), this.effects.sort((e, t) => t.priority - e.priority));
          }
          dispose() {
            this.renderer.onFrame.unsubscribe(this.onFrame);
          }
        }),
      );
    },
  };
});
