// === Reconstructed SystemJS module: engine/gfx/OctreeContainer ===
// deps: ["engine/gfx/RenderableContainer","engine/gfx/FrustumCuller","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/gfx/OctreeContainer",
  ["engine/gfx/RenderableContainer", "engine/gfx/FrustumCuller", "game/Coords"],
  function (e, t) {
    "use strict";
    var i, a, r, s, n, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((n = 3),
          (o = class o extends i.RenderableContainer {
            static factory(e) {
              var { near: t, far: i } = e,
                r = new THREE.Box3(new THREE.Vector3(2 * t, 2 * t, 2 * t), new THREE.Vector3(2 * i, 2 * i, 2 * i));
              let s = new Octree(r, {
                maxDepth: Math.ceil(Math.log2((2 * (i - t)) / 128)),
                splitThreshold: 10,
                joinThreshold: 5,
                skipInvisMatrixUpdate: !0,
              });
              s.name = "octree";
              t = new a.FrustumCuller();
              return new o(s, t, e);
            }
            constructor(e, t, i) {
              (super(e),
                (this.autoCull = !0),
                (this.lastCameraPosition = new THREE.Vector3()),
                (this.tree = e),
                (this.frustumCuller = t),
                (this.camera = i));
            }
            update(e, t) {
              (super.update(e, t), this.autoCull && this.cullChildren());
            }
            cullChildren() {
              if (!this.camera.position.equals(this.lastCameraPosition)) {
                this.lastCameraPosition.copy(this.camera.position);
                var t = this.computeProjectionMatrix();
                (this.camera.updateMatrixWorld(!1), this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld));
                t = new THREE.Matrix4().multiplyMatrices(t, this.camera.matrixWorldInverse);
                let e = new THREE.Frustum();
                (e.setFromMatrix(t), this.frustumCuller.cull(this.tree, e));
              }
            }
            computeProjectionMatrix() {
              return (
                s ? s.copy(this.camera) : (s = this.camera.clone()),
                (s.top += n * r.Coords.LEPTONS_PER_TILE * r.Coords.COS_ISO_CAMERA_BETA),
                (s.bottom -= n * r.Coords.LEPTONS_PER_TILE * r.Coords.COS_ISO_CAMERA_BETA),
                (s.left -= n * (2 * r.Coords.LEPTONS_PER_TILE) * r.Coords.COS_ISO_CAMERA_BETA),
                (s.right += n * (2 * r.Coords.LEPTONS_PER_TILE) * r.Coords.COS_ISO_CAMERA_BETA),
                s.updateProjectionMatrix(),
                s.projectionMatrix
              );
            }
            updateChild(e) {
              var t = e.get3DObject();
              t && t.parent && this.tree.updateObject(t);
            }
          }),
          e("OctreeContainer", o));
      },
    };
  },
);
