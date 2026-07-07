// OpenYRWeb: renders a CONTINUOUS purple tractor beam from this unit (a Magnetron) to the
// vehicle it is currently lifting/dragging. Replaces the per-shot RadBeamFx flicker (each
// MagneticBeam hit only spawned a ~1-frame RadBeamFx, so a locked Magnetron looked like a
// stuttering "spam" of beams rather than a steady tractor beam).
//
// Pattern mirrors MindControlLinkPlugin: a persistent FX owned by the plugin, endpoints
// refreshed every render frame, disposed when the drag link ends. The drag link is read from
// the game object's `magnetronDragging` field (set/cleared by MagnetronDragTask).
//
// OpenYRWeb (2026-07-06): Now uses MagBeamFx with MagnaBeam parameters from the Magnetron's
// IsMagBeam weapon rules instead of the old hardcoded MindControlLinkFx. This gives the
// continuous tractor beam the full wave/pulse/glow pipeline matching the per-shot beam.
// deps: ["engine/renderable/fx/MagBeamFx"]
System.register(
  "engine/renderable/entity/plugin/MagnetronBeamPlugin",
  ["engine/renderable/fx/MagBeamFx"],
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
            // source = the Magnetron unit (game object). colorLeft unused; beam is from weapon rules.
            constructor(source) {
              this.source = source;
              this.beam = void 0;
              this.renderableManager = void 0;
              this._params = this._resolveParams();
            }
            /** Find the IsMagBeam weapon on this unit and build MagBeamFx params from it. */
            _resolveParams() {
              var src = this.source;
              var wr = null;
              // Search primary then secondary for IsMagBeam weapon.
              if (src.primaryWeapon && src.primaryWeapon.rules && src.primaryWeapon.rules.isMagBeam)
                wr = src.primaryWeapon.rules;
              else if (src.secondaryWeapon && src.secondaryWeapon.rules && src.secondaryWeapon.rules.isMagBeam)
                wr = src.secondaryWeapon.rules;
              if (!wr) return null;
              // Build params object matching MagBeamFx constructor.
              return {
                color: wr.isCustomColor && wr.magnaBeamHouseColor
                  ? new THREE.Color(src.owner ? src.owner.color.asHex() : null)
                  : wr.isCustomColor
                    ? new THREE.Color(wr.magnaBeamColor[0] / 255, wr.magnaBeamColor[1] / 255, wr.magnaBeamColor[2] / 255)
                    : new THREE.Color(160 / 255, 80 / 255, 240 / 255),
                alpha: wr.magnaBeamAlpha,
                width: wr.magnaBeamWidth,
                outerSpread: wr.magnaBeamOuterSpread,
                waveAmplitude: wr.magnaBeamWaveAmplitude,
                waveFrequency: wr.magnaBeamWaveFrequency,
                waveSpeed: wr.magnaBeamWaveSpeed,
                pulseStrength: wr.magnaBeamPulse,
                pulseRate: wr.magnaBeamPulseRate,
                additive: wr.magnaBeamAdditive,
                durationSeconds: null,  // continuous beam, no timeout
              };
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
              var beamTarget = null;

              // Case 1: dragging a vehicle (existing behaviour).
              if (victim && !victim.isDestroyed && !victim.isDisposed) {
                beamTarget = victim;
              } else {
                // Case 2: attacking a building/target with IsMagBeam weapon (no drag).
                // Render a continuous beam while the Magnetron is actively firing at a target.
                beamTarget = this._getAttackBeamTarget(src);
              }

              if (!beamTarget) {
                this.disposeBeam();
                return;
              }

              var a = src.position.worldPosition.clone();
              var b = beamTarget.position
                ? beamTarget.position.worldPosition.clone()
                : (typeof beamTarget.getWorldCoords === "function"
                    ? beamTarget.getWorldCoords().clone()
                    : null);
              if (!b) { this.disposeBeam(); return; }

              if (!this.beam) {
                if (!this._params) {
                  this._params = {
                    color: new THREE.Color(160 / 255, 80 / 255, 240 / 255),
                    alpha: 0.85,
                    width: 10.0,
                    outerSpread: 5.0,
                    waveAmplitude: 1.8,
                    waveFrequency: 6.0,
                    waveSpeed: 2.2,
                    pulseStrength: 0.3,
                    pulseRate: 3.5,
                    additive: true,
                    durationSeconds: null,
                  };
                }
                var cam = this.renderableManager && this.renderableManager.camera;
                this.beam = new F.MagBeamFx(a, b, cam, this._params);
                this.renderableManager && this.renderableManager.addEffect(this.beam);
              } else {
                this.beam.updateEndpoints(a, b);
              }
            }

            /** Check if the source is attacking a target with an IsMagBeam weapon
             *  (e.g. MagneShake vs buildings) and return the attack target for beam rendering. */
            _getAttackBeamTarget(src) {
              try {
                var at = src.attackTrait;
                if (!at || !at.currentTarget || !at.currentTarget.obj) return null;
                // Must be actively firing (not in Idle/CheckRange).
                // AttackState: Idle=0, CheckRange=1, PrepareToFire=2, FireUp=3, Firing=4, JustFired=5
                // Allow beam through PrepareToFire/FireUp/Firing/JustFired to avoid gaps between shots.
                if (at.attackState == null || at.attackState <= 1) return null;
                var target = at.currentTarget.obj;
                if (!target || target.isDestroyed || target.isDisposed) return null;
                // Verify the source has an IsMagBeam weapon (primary or secondary).
                // The MagnetronBeamPlugin is only created for units with IsMagBeam weapons,
                // but double-check to be safe.
                var hasMagBeam = (src.primaryWeapon && src.primaryWeapon.rules && src.primaryWeapon.rules.isMagBeam)
                  || (src.secondaryWeapon && src.secondaryWeapon.rules && src.secondaryWeapon.rules.isMagBeam);
                if (!hasMagBeam) return null;
                return target;
              } catch (err) { return null; }
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
