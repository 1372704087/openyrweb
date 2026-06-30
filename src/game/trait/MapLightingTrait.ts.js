// === Reconstructed SystemJS module: game/trait/MapLightingTrait ===
// deps: ["data/map/MapLighting","game/GameSpeed","util/event","game/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/MapLightingTrait",
  ["data/map/MapLighting", "game/GameSpeed", "util/event", "game/trait/interface/NotifyTick"],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((n = class {
          get onChange() {
            return this._onChange.asEvent();
          }
          constructor(e, t) {
            ((this.mapLighting = new i.MapLighting()),
              (this._onChange = new s.EventDispatcher()),
              (this.ambientChangeRate = e.ambientChangeRate),
              (this.ambientChangeStep = e.ambientChangeStep),
              t && this.mapLighting.copy(t));
          }
          setAmbientChangeRate(e) {
            this.ambientChangeRate = e;
          }
          setAmbientChangeStep(e) {
            this.ambientChangeStep = e;
          }
          setTargetAmbientIntensity(e) {
            this.targetAmbient = e;
          }
          getAmbient() {
            return this.mapLighting;
          }
          [a.NotifyTick.onTick]() {
            var e;
            void 0 !== this.targetAmbient &&
              (this.ambientUpdateTicks ??
                (this.ambientUpdateTicks = Math.floor(60 * r.GameSpeed.BASE_TICKS_PER_SECOND * this.ambientChangeRate)),
              this.ambientUpdateTicks <= 0
                ? ((this.ambientUpdateTicks = void 0),
                  (e = this.mapLighting.ambient),
                  (e = this.targetAmbient - e)
                    ? ((e = Math.sign(e) * Math.min(this.ambientChangeStep, Math.abs(e))),
                      (this.mapLighting.ambient += e),
                      this._onChange.dispatch(this, this.mapLighting))
                    : (this.targetAmbient = void 0))
                : this.ambientUpdateTicks--);
          }
        }),
          e("MapLightingTrait", n));
      },
    };
  },
);
