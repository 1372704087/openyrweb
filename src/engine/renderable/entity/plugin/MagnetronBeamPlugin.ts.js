// === Reconstructed SystemJS module: engine/renderable/entity/plugin/MagnetronBeamPlugin ===
// OpenYRWeb: renders a CONTINUOUS purple tractor beam from this unit (a Magnetron) to the
// vehicle it is currently lifting/dragging. Replaces the per-shot RadBeamFx flicker (each
// MagneticBeam hit only spawned a ~1-frame RadBeamFx, so a locked Magnetron looked like a
// stuttering "spam" of beams rather than a steady tractor beam).
//
// Pattern mirrors MindControlLinkPlugin: a persistent FX owned by the plugin, endpoints
// refreshed every render frame, disposed when the drag link ends. The drag link is read from
// the game object's `magnetronDragging` field (set/cleared by MagnetronDragTask).
// deps: ["engine/renderable/fx/MindControlLinkFx"]
System.register(
  "engine/renderable/entity/plugin/MagnetronBeamPlugin",
  ["engine/renderable/fx/MindControlLinkFx"],
  function (e, t) {
    "use strict";
    var F;
    t && t.id;
    return {
      setters: [
        function (x) {
          F = x;
        },
      ],
      execute: function () {
        e(
          "MagnetronBeamPlugin",
          class {
            // source = the Magnetron unit (game object). colorLeft unused; beam is fixed purple.
            constructor(source) {
              this.source = source;
              this.beam = void 0;
              this.renderableManager = void 0;
            }
            onCreate(rm) {
              this.renderableManager = rm;
            }
            update() {
              var src = this.source;
              if (!src || src.isDestroyed || src.isCrashing || src.isDisposed) {
                this.disposeBeam();
                return;
              }
              var victim = src.magnetronDragging;
              if (!victim || victim.isDestroyed || victim.isDisposed) {
                this.disposeBeam();
                return;
              }
              var a = src.position.worldPosition.clone();
              var b = victim.position.worldPosition.clone();
              if (!this.beam) {
                // Persistent purple beam (Yuri faction colour), MindControlLinkFx-style line.
                // heightTiles=0 keeps it a straight beam (no arc); colour fixed purple.
                this.beam = new F.MindControlLinkFx(a, b, new THREE.Color(0.55, 0.12, 0.75), 0);
                this.renderableManager && this.renderableManager.addEffect(this.beam);
              } else {
                this.beam.updateEndpoints(a, b);
              }
            }
            onRemove() {
              this.renderableManager = void 0;
              this.disposeBeam();
            }
            dispose() {
              this.disposeBeam();
            }
            disposeBeam() {
              if (this.beam) {
                this.beam.removeAndDispose();
                this.beam = void 0;
              }
            }
          },
        );
      },
    };
  },
);
