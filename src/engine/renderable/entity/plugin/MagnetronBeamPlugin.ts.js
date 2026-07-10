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
// deps: ["engine/renderable/fx/MagBeamFx", "game/Coords"]
System.register(
  "engine/renderable/entity/plugin/MagnetronBeamPlugin",
  ["engine/renderable/fx/MagBeamFx", "game/Coords"],
  function (e, t) {
    "use strict";
    var F, C;
    t && t.id;
    return {
      setters: [
        function (x) {
          F = x;
        },
        function (x) {
          C = x;
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
              this._waveReverseAgainstVehicles = false;
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
              // Store wave reversal flag for per-frame direction control in update().
              this._waveReverseAgainstVehicles = wr.waveReverseAgainstVehicles;
              // Build params for shader-based MagBeamFx (vanilla YR Wave blending).
              // Formula: result = c + color*x + c*intensity*x  (Ares reverse-engineered)
              var houseColor = wr.waveIsHouseColor
                ? new THREE.Color(src.owner ? src.owner.color.asHex() : 0xB000D0)
                : null;
              return {
                waveColor: wr.waveColor,
                waveIntensity: wr.waveIntensity,
                waveIsHouseColor: wr.waveIsHouseColor,
                waveReverse: false,  // set per-frame via setWaveReverse()
                growFromTarget: false, // set per-frame via update()
                growthSpeed: 3.0,      // 光束生长/收缩速度（每秒）
                width: wr.magnaBeamWidth,
                waveFrequency: wr.magnaBeamWaveFrequency,
                waveSpeed: wr.magnaBeamWaveSpeed,
                pulseStrength: wr.magnaBeamPulse,
                pulseRate: wr.magnaBeamPulseRate,
                alpha: wr.magnaBeamAlpha,
                durationSeconds: null,  // continuous beam, no timeout
                color: houseColor,
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
                if (this.beam) {
                  if (!this.beam.isDying()) this.beam.startDying();
                  if (this.beam.isFinished()) this.beam = void 0;
                }
                return;
              }

              // 炮口位置 = 单位位置 + PrimaryFireFLH 偏移（含炮塔旋转）
              var a = src.position.worldPosition.clone();
              try {
                var flh = src.art && src.art.primaryFireFlh;
                if (flh && (flh.forward || flh.lateral || flh.vertical)) {
                  var muzzleFacing = src.turretTrait ? src.turretTrait.facing : src.direction;
                  var rad = muzzleFacing * Math.PI / 180;
                  var cos = Math.cos(rad), sin = Math.sin(rad);
                  var lx = flh.lateral, fy = flh.forward;
                  var rx = lx * cos - fy * sin;   // rotated lateral
                  var ry = lx * sin + fy * cos;   // rotated forward
                  // 炮塔偏移（TurretOffset 沿车身中心线）
                  var turretOff = src.art && src.art.turretOffset || 0;
                  if (turretOff) {
                    var dirRad = src.direction * Math.PI / 180;
                    a.x += -turretOff * Math.sin(dirRad);
                    a.z += -turretOff * Math.cos(dirRad);
                  }
                  // FLH 偏移：leptons → world（X/Z 1:1，Y 同 world 单位）
                  a.x += rx;
                  a.z += -ry;
                  a.y += flh.vertical;
                }
              } catch (err) {}
              var b;
              // Handle both game objects (with position) and tile objects (with rx, ry, z)
              if (beamTarget.position) {
                b = beamTarget.position.worldPosition.clone();
              } else if (typeof beamTarget.getWorldCoords === "function") {
                b = beamTarget.getWorldCoords().clone();
              } else if (beamTarget.rx !== undefined && beamTarget.ry !== undefined) {
                // Tile object: { dx, dy, rx, ry, z, ... } - rx/ry are tile indices
                // Use tile center (rx+0.5, ry+0.5) for proper world position
                b = C.Coords.tile3dToWorld(beamTarget.rx + 0.5, beamTarget.ry + 0.5, beamTarget.z || 0);
              }
              if (!b) { this.disposeBeam(); return; }

              // 目标是车辆/坦克（包括已举起的拖拽目标和正在攻击的车辆）：光束从目标向炮口生长
              // 目标是建筑/地面：光束从炮口向目标生长
              var isVehicleTarget = !!(victim && !victim.isDestroyed && !victim.isDisposed) ||
                !!(beamTarget && typeof beamTarget.isVehicle === "function" && beamTarget.isVehicle());

              if (!this.beam) {
                if (!this._params) {
                  this._params = {
                    waveColor: [0, 0, 0],
                    waveIntensity: [128, 0, 1024],
                    waveIsHouseColor: false,
                    waveReverse: false,
                    growFromTarget: false,
                    growthSpeed: 3.0,
                    width: 10.0,
                    waveFrequency: 6.0,
                    waveSpeed: 2.2,
                    pulseStrength: 0.3,
                    pulseRate: 3.5,
                    alpha: 0.85,
                    durationSeconds: null,
                    color: null,
                  };
                }
                this._params.growFromTarget = isVehicleTarget;
                var cam = this.renderableManager && this.renderableManager.camera;
                this.beam = new F.MagBeamFx(a, b, cam, this._params);
                this.renderableManager && this.renderableManager.addEffect(this.beam);
              } else if (!this.beam.isDying()) {
                this.beam.updateEndpoints(a, b);
              } else if (this.beam.isFinished()) {
                // 旧光束已缩完，清理后下帧创建新光束
                this.beam = void 0;
              }
              // 波纹方向：车辆目标从目标流向炮口，建筑/地面从炮口流向目标
              if (this.beam) {
                this.beam.setWaveReverse(this._waveReverseAgainstVehicles && isVehicleTarget);
              }
            }

            /** Check if the source is attacking a target with an IsMagBeam weapon
             *  (e.g. MagneShake vs buildings, or ground attack) and return the attack target for beam rendering. */
            _getAttackBeamTarget(src) {
              try {
                var at = src.attackTrait;
                if (!at || !at.currentTarget) return null;
                // Must be actively firing (not in Idle/CheckRange).
                // AttackState: Idle=0, CheckRange=1, PrepareToFire=2, FireUp=3, Firing=4, JustFired=5
                // Allow beam through PrepareToFire/FireUp/Firing/JustFired to avoid gaps between shots.
                if (at.attackState == null || at.attackState <= 1) return null;
                // Support both object targets and ground (tile) targets
                var target = at.currentTarget.obj || at.currentTarget.tile;
                if (!target) return null;
                // For object targets, check if destroyed/disposed
                if (target.isDestroyed || target.isDisposed) return null;
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
