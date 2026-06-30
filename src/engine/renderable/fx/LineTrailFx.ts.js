// === Reconstructed SystemJS module: engine/renderable/fx/LineTrailFx ===
// deps: ["game/art/ObjectArt","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/fx/LineTrailFx", ["game/art/ObjectArt", "game/Coords"], function (e, t) {
  "use strict";
  var l, c, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        l = e;
      },
      function (e) {
        c = e;
      },
    ],
    execute: function () {
      e(
        "LineTrailFx",
        (i = class {
          constructor(e, t, i, r, s) {
            ((this.lazyTarget = e),
              (this.trailColor = t),
              (this.trailDecrement = i),
              (this.gameSpeed = r),
              (this.camera = s),
              (this.trailInitialized = !1));
          }
          setContainer(e) {
            this.container = e;
          }
          get3DObject() {
            return this.placeholderObj;
          }
          create3DObject() {
            this.placeholderObj ||
              ((this.placeholderObj = new THREE.Object3D()), (this.placeholderObj.name = "fx_linetrail_placeholder"));
          }
          update(e) {
            var t;
            (void 0 !== this.timeLeft &&
              ((t = this.prevUpdateMillis),
              (this.prevUpdateMillis = e),
              t && (this.timeLeft = Math.max(0, this.timeLeft - (e - t) / 1e3))),
              this.trailInitialized ||
                ((this.trailInitialized = !0),
                (t = this.createTrail(this.trailColor, this.trailDecrement)) ? (this.trail = t) : (this.timeLeft = 0)),
              this.trail && (this.trail.advance(), (this.lastTargetMatrix = this.trail.targetObject.matrixWorld)),
              this.isFinished() && (this.container.remove(this), this.dispose()));
          }
          createTrail(r, s) {
            var a = this.lazyTarget();
            if (a) {
              let e = new THREE.TrailRenderer(this.container.get3DObject()),
                t = THREE.TrailRenderer.createBaseMaterial();
              (t.uniforms.headColor.value.set(r.r, r.g, r.b, 1), t.uniforms.tailColor.value.set(r.r, r.g, r.b, 0));
              var n = Math.floor(((3 / this.gameSpeed.value) * 50) / (s / l.ObjectArt.DEFAULT_LINE_TRAIL_DEC)),
                o = 0.8 * c.Coords.ISO_WORLD_SCALE;
              let i = new THREE.PlaneGeometry(o, o);
              o = new THREE.Quaternion().setFromEuler(this.camera.rotation);
              return (
                i.applyMatrix(new THREE.Matrix4().makeRotationFromQuaternion(o)),
                e.initialize(t, n, !1, 0, i.vertices, a),
                e.activate(),
                e
              );
            }
          }
          isFinished() {
            return 0 === this.timeLeft;
          }
          requestFinishAndDispose() {
            this.timeLeft = 0.8 / this.gameSpeed.value;
          }
          stopTracking() {
            if (this.trail && this.lastTargetMatrix) {
              let e = new THREE.Object3D();
              ((e.updateMatrixWorld = () => {}),
                (e.matrixWorld = this.lastTargetMatrix),
                (this.trail.targetObject = e));
            }
          }
          dispose() {
            (this.trail?.deactivate(), this.trail?.material.dispose(), this.trail?.geometry.dispose());
          }
        }),
      );
    },
  };
});
