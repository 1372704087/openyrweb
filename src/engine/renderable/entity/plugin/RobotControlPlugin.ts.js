// === Reconstructed SystemJS module: engine/renderable/entity/plugin/RobotControlPlugin ===
// deps: ["engine/renderable/fx/SparkFx","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/plugin/RobotControlPlugin",
  ["engine/renderable/fx/SparkFx", "game/Coords"],
  function (e, t) {
    "use strict";
    var s, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        // OpenYRWeb: Electric spark effect for paralyzed Robot Tanks.
        // When the RobotControlTrait reports paralyzed (control center offline/destroyed),
        // this plugin periodically spawns SparkFx at the vehicle's position to simulate
        // electrical short-circuiting. Sparks are white, short-lived (0.4s), and spawn
        // every ~0.8 seconds of game time.
        e(
          "RobotControlPlugin",
          (class {
            constructor(e, t) {
              this.gameObject = e;
              this.gameSpeed = t;
              this.lastSparkMillis = 0;
            }
            onCreate(e) {
              this.renderableManager = e;
            }
            update(e) {
              if (!this.renderableManager) return;
              if (this.gameObject.isDestroyed) return;
              var paralyzed = this.gameObject.robotControlTrait?.isParalyzed();
              if (!paralyzed) return;
              // Spawn sparks every ~2000ms of real time (adjusted by game speed).
              var interval = 2000 / (this.gameSpeed?.value || 1);
              if (e - this.lastSparkMillis < interval) return;
              this.lastSparkMillis = e;
              // Spark origin: vehicle position, slightly above ground.
              var pos = this.gameObject.position.worldPosition.clone();
              pos.y += n.Coords.tileHeightToWorld(0.5);
              var duration = 0.4;
              var fx = new s.SparkFx(pos, new THREE.Color(1, 1, 1), duration, this.gameSpeed);
              this.renderableManager.addEffect(fx);
            }
            onRemove(e) {
              this.renderableManager = void 0;
            }
            dispose() {
              this.renderableManager = void 0;
            }
          }),
        );
      },
    };
  },
);
