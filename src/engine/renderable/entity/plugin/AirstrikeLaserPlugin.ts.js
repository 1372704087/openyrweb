// OpenYRWeb: renders the Boris airstrike designator laser as a persistent beam from Boris
// to the targeted structure. Pattern mirrors MindControlLinkPlugin/MagnetronBeamPlugin.
// In vanilla YR the laser is a hardcoded engine feature of the airstrike manager —
// a continuous red beam from the unit's FLH to the target, with brightness flickering
// between RGB(190,0,0) and RGB(255,0,0). This plugin reads airstrikeTrait state and
// creates/manages a DesignatorLaserFx that updates endpoints every render frame.
// deps: ["engine/renderable/fx/DesignatorLaserFx"]

System.register(
  "engine/renderable/entity/plugin/AirstrikeLaserPlugin",
  ["engine/renderable/fx/DesignatorLaserFx"],
  function (e, t) {
    "use strict";
    var L, i;
    t && t.id;
    return {
      setters: [
        function (x) {
          L = x;
        },
      ],
      execute: function () {
        e(
          "AirstrikeLaserPlugin",
          (i = class {
            constructor(source) {
              this.source = source;
              this.laser = void 0;
              this.renderableManager = void 0;
            }
            onCreate(rm) {
              this.renderableManager = rm;
            }
            update() {
              var src = this.source;
              if (!src || src.isDestroyed || src.isCrashing || src.isDisposed) {
                this.disposeLaser();
                return;
              }
              var at = src.airstrikeTrait;
              // Keep laser as long as a target exists, even if active=false (post-strike cooldown).
              // The target is cleared only when the building is destroyed or Boris cancels/moves.
              if (!at || (!at.targetObject && !at.targetTile)) {
                this.disposeLaser();
                return;
              }
              // Compute source position: the unit's configured firing position.
              // The airstrike is called with the secondary weapon (Flare), so use
              // SecondaryFireFLH first; if it is not defined, fall back to the
              // primary weapon's PrimaryFireFLH. The FLH is rotated by the unit's
              // facing, exactly like the muzzle position the weapon uses when
              // firing. Mirrors MagnetronBeamPlugin's FLH computation.
              var a = src.position.worldPosition.clone();
              try {
                var flh = src.art && src.art.secondaryFireFlh;
                if (!flh || !(flh.forward || flh.lateral || flh.vertical)) {
                  flh = src.art && src.art.primaryFireFlh;
                }
                if (flh && (flh.forward || flh.lateral || flh.vertical)) {
                  var muzzleFacing = src.turretTrait ? src.turretTrait.facing : src.direction;
                  var rad = muzzleFacing * Math.PI / 180;
                  var cos = Math.cos(rad), sin = Math.sin(rad);
                  var lx = flh.lateral, fy = flh.forward;
                  // FLH offset: leptons → world (X/Z 1:1, Y is world units).
                  a.x += lx * cos - fy * sin;
                  a.z += -(lx * sin + fy * cos);
                  a.y += flh.vertical;
                } else {
                  // No FLH configured — fall back to a chest-height offset.
                  a.y += 50;
                }
              } catch (err) {
                a.y += 50;
              }

              // Compute target position: the targeted building's world position.
              var targetObj = at.targetObject;
              var b;
              if (targetObj && !targetObj.isDestroyed) {
                b = targetObj.position.worldPosition.clone();
                // Add a slight vertical offset to hit the building center rather than ground.
                b.y += 50;
              } else if (at.targetTile && at.targetTile.rx !== void 0) {
                b = new THREE.Vector3(
                  (at.targetTile.rx + 0.5) * 24,
                  0,
                  (at.targetTile.ry + 0.5) * 24
                );
              } else {
                this.disposeLaser();
                return;
              }

              if (!this.laser) {
                var cam = this.renderableManager && this.renderableManager.camera;
                if (!cam) return;
                // Red color for the Soviet airstrike designator.
                var color = new THREE.Color(1, 0, 0);
                this.laser = new L.DesignatorLaserFx(cam, a, b, color);
                this.renderableManager && this.renderableManager.addEffect(this.laser);
              } else {
                // Update endpoints — the DesignatorLaserFx reads from these Vector3s each frame.
                this.laser.sourcePos.copy(a);
                this.laser.targetPos.copy(b);
              }
            }
            onRemove() {
              this.renderableManager = void 0;
              this.disposeLaser();
            }
            dispose() {
              this.disposeLaser();
            }
            disposeLaser() {
              if (this.laser) {
                this.laser.remove();
                this.laser.dispose();
                this.laser = void 0;
              }
            }
          }),
        );
      },
    };
  },
);
