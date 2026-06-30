// === Reconstructed SystemJS module: engine/Lighting ===
// deps: ["engine/type/LightingType","data/map/MapLighting","util/event","util/disposable/CompositeDisposable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/Lighting",
  ["engine/type/LightingType", "data/map/MapLighting", "util/event", "util/disposable/CompositeDisposable"],
  function (e, t) {
    "use strict";
    var l, i, r, s, a, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = new THREE.Vector3()),
          e(
            "Lighting",
            (n = class {
              get onChange() {
                return this._onChange.asEvent();
              }
              get mapLighting() {
                return this.ambientOverride ?? this.baseAmbient;
              }
              constructor(t) {
                if (
                  ((this.baseAmbient = new i.MapLighting()),
                  (this.tileLights = new Map()),
                  (this.disposables = new s.CompositeDisposable()),
                  (this._onChange = new r.EventDispatcher()),
                  t)
                ) {
                  this.baseAmbient.copy(t.getAmbient());
                  let e = (e) => {
                    (this.baseAmbient.copy(e), this._onChange.dispatch(this, void 0));
                  };
                  (t.onChange.subscribe(e), this.disposables.add(() => t.onChange.unsubscribe(e)));
                }
              }
              forceUpdate(e) {
                this._onChange.dispatch(this, e);
              }
              applyAmbientOverride(e) {
                ((this.ambientOverride = e), this._onChange.dispatch(this, void 0));
              }
              getBaseAmbient() {
                return new i.MapLighting().copy(this.baseAmbient);
              }
              addTileLight(e, t) {
                (this.tileLights.has(e) || this.tileLights.set(e, new Set()), this.tileLights.get(e).add(t));
              }
              removeTileLight(e, t) {
                let i = this.tileLights.get(e);
                i && (i.delete(t), i.size || this.tileLights.delete(e));
              }
              compute(e, t, i = 0) {
                return e === l.LightingType.None
                  ? new THREE.Vector3(1, 1, 1)
                  : this.computeTint(e)
                      .add(this.computeTileTint(t, e, a))
                      .multiplyScalar(
                        this.mapLighting.ambient +
                          this.mapLighting.ground +
                          this.computeLevel(e, t.z + i) +
                          this.computeTileLightIntensity(t),
                      );
              }
              computeNoAmbient(e, t, i = 0) {
                return this.computeLevel(e, t.z + i) + this.computeTileLightIntensity(t);
              }
              computeLevel(e, t) {
                return e >= l.LightingType.Level ? this.mapLighting.level * (t - 1) : 0;
              }
              computeTint(e) {
                let t = 1,
                  i = 1,
                  r = 1;
                return (
                  (e >= l.LightingType.Full || this.mapLighting.forceTint) &&
                    ((t = this.mapLighting.red), (i = this.mapLighting.green), (r = this.mapLighting.blue)),
                  new THREE.Vector3(t, i, r)
                );
              }
              computeTileTint(e, t, i = new THREE.Vector3()) {
                let r = 0,
                  s = 0,
                  a = 0;
                if (t >= l.LightingType.Full) {
                  var n = this.tileLights.get(e);
                  if (n?.size) for (var o of n) ((r += o.red), (s += o.green), (a += o.blue));
                }
                return i.set(r, s, a);
              }
              computeTileLightIntensity(e) {
                let t = 0;
                var i = this.tileLights.get(e);
                if (i?.size) for (var r of i) t += r.intensity;
                return t;
              }
              getAmbientIntensity() {
                return this.mapLighting.ambient + this.mapLighting.ground;
              }
              dispose() {
                this.disposables.dispose();
              }
            }),
          ));
      },
    };
  },
);
