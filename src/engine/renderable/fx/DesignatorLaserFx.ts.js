// === Reconstructed SystemJS module: engine/renderable/fx/DesignatorLaserFx ===
// deps: ["three.meshline","game/Coords"]
// Note: Simulates Boris's airstrike laser designator. In vanilla YR, the laser is a
// hardcoded engine feature of the airstrike manager — a continuous red beam from the
// unit's FLH to the target building, with brightness flickering between RGB(190,0,0)
// and RGB(255,0,0). This fx class provides the same persistent beam by reading source
// and target positions each update frame, recreating the MeshLine when endpoints move.

System.register("engine/renderable/fx/DesignatorLaserFx", ["three.meshline", "game/Coords"], function (e, t) {
  "use strict";
  var s, n, a;
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
      // Pre-allocated scratch vector for lerp/flicker calculations.
      var _scratchColor = new THREE.Color();

      e(
        "DesignatorLaserFx",
        (a = class {
          constructor(e, t, i, r) {
            ((this.camera = e),
              (this.sourcePos = t),
              (this.targetPos = i),
              (this.color = r),
              (this.lineWidth = 2),
              // Vanilla YR: brightness oscillates between 190 and 255 out of 255.
              (this.dimColor = new THREE.Color(0.75, 0, 0)),
              (this.brightColor = new THREE.Color(1, 0, 0)),
              (this._lineGeom = void 0),
              (this._meshLine = void 0));
          }
          setContainer(e) {
            this.container = e;
          }
          get3DObject() {
            return this.lineMesh;
          }
          create3DObject() {
            if (this.lineMesh) return;
            this._lineGeom = new THREE.Geometry();
            this._lineGeom.vertices.push(this.sourcePos.clone(), this.targetPos.clone());
            this._meshLine = new s.MeshLine();
            this._meshLine.setGeometry(this._lineGeom);
            this.lineMesh = new THREE.Mesh(this._meshLine.geometry, this.buildMaterial(this.color.clone()));
            this.lineMesh.name = "fx_designator_laser";
          }
          update(e) {
            var src = this.sourcePos,
              tgt = this.targetPos;
            // e is total elapsed ms since creation, convert to seconds directly.
            var t = e * 0.001;

            // 1) Slow ellipse oriented along the laser direction (Boris → target).
            var wobbleFreq = 1.0 / 3.0;
            var angle = t * Math.PI * 2 * wobbleFreq;
            // Forward direction from source to target on XZ plane.
            var fDx = tgt.x - src.x,
                fDz = tgt.z - src.z;
            var fLen = Math.sqrt(fDx * fDx + fDz * fDz);
            if (fLen > 1e-6) { fDx /= fLen; fDz /= fLen; } else { fDx = 1; fDz = 0; }
            // Perpendicular direction.
            var pDx = -fDz,
                pDz = fDx;
            // Ellipse: long axis (15) perpendicular to beam, short axis (5) along beam.
            var ellLong = Math.sin(angle) * 5;
            var ellShort = Math.cos(angle) * 20;
            var ellX = ellLong * fDx + ellShort * pDx;
            var ellZ = ellLong * fDz + ellShort * pDz;

            // 2) Micro-tremor (sine comb, subtle hand shake).
            var tremorX = Math.sin(t * 100) * 0.3 + Math.cos(t * 83) * 0.2;
            var tremorZ = Math.cos(t * 97) * 0.25 + Math.sin(t * 74) * 0.2;

            // Update vertices in-place (reusable geometry, no GC pressure).
            this._lineGeom.vertices[0].copy(src);
            this._lineGeom.vertices[1].set(
              tgt.x + ellX + tremorX,
              tgt.y,
              tgt.z + ellZ + tremorZ,
            );
            this._meshLine.setGeometry(this._lineGeom);
            this.lineMesh.geometry = this._meshLine.geometry;

            // 3) Color flicker: 2 Hz brightness oscillation.
            var flicker = 0.5 + 0.5 * Math.sin(t * Math.PI * 4);
            _scratchColor.copy(this.dimColor).lerp(this.brightColor, flicker);
            this.lineMesh.material.uniforms.color.value = _scratchColor;

            // 4) Sync resolution with current camera state.
            var cam = this.camera,
              top = cam.top,
              ratio = cam.right / cam.top,
              r = (2 * top) / Math.cos(cam.rotation.y);
            this.lineMesh.material.uniforms.resolution.value
              .set(r * ratio, r)
              .multiplyScalar((top * Math.cos(cam.rotation.x)) / n.Coords.ISO_WORLD_SCALE);
          }
          buildMaterial(e) {
            var t = this.camera.top,
              i = this.camera.right / this.camera.top,
              r = (2 * t) / Math.cos(this.camera.rotation.y);
            return new s.MeshLineMaterial({
              color: e,
              lineWidth: this.lineWidth,
              resolution: new THREE.Vector2(r * i, r).multiplyScalar(
                (t * Math.cos(this.camera.rotation.x)) / n.Coords.ISO_WORLD_SCALE,
              ),
              transparent: !0,
              opacity: 0.80,
              sizeAttenuation: 0,
              depthTest: !1,
              blending: THREE.NormalBlending,
            });
          }
          remove() {
            this.container && this.container.remove(this);
          }
          dispose() {
            this.lineMesh && (this.lineMesh.geometry.dispose(), this.lineMesh.material.dispose());
          }
        }),
      );
    },
  };
});
