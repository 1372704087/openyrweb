// === Reconstructed SystemJS module: engine/renderable/fx/MagBeamFx ===
// deps: ["three.meshline","game/Coords"]
//
// OpenYRWeb (2026-07-06): Dedicated Magnetron magnetic tractor beam renderer.
// Renders a purple, wavy, pulsating beam between two world-space points.
// Dual-layer: opaque core + wider translucent glow for halo effect.

System.register("engine/renderable/fx/MagBeamFx", ["three.meshline", "game/Coords"], function (e, t) {
  "use strict";
  var h, u, i;
  t && t.id;
  return {
    setters: [
      function (e) { h = e; },
      function (e) { u = e; },
    ],
    execute: function () {
      var _beamId = 0;
      e(
        "MagBeamFx",
        (i = class {
          constructor(sourcePos, targetPos, camera, params) {
            this.sourcePos = sourcePos.clone();
            this.targetPos = targetPos.clone();
            this.camera = camera || null;
            this._id = ++_beamId;
            var p = params || {};
            this._color = p.color || new THREE.Color(160 / 255, 80 / 255, 240 / 255);
            this._alpha = p.alpha != null ? p.alpha : 0.85;
            this._width = p.width != null ? p.width : 10.0;
            this._outerSpread = p.outerSpread != null ? p.outerSpread : 5.0;
            this._waveAmp = p.waveAmplitude != null ? p.waveAmplitude : 1.8;
            this._waveFreq = p.waveFrequency != null ? p.waveFrequency : 6.0;
            this._waveSpeed = p.waveSpeed != null ? p.waveSpeed : 2.2;
            this._pulseStr = p.pulseStrength != null ? p.pulseStrength : 0.3;
            this._pulseRate = p.pulseRate != null ? p.pulseRate : 3.5;
            this._duration = p.durationSeconds != null ? p.durationSeconds : null;
            this._phase = 0;
            this._firstMs = null;
            this._timeLeft = 1;
            this._disposed = false;
            this.container = null;
            this.lineMesh = null;
            this.glowMesh = null;
            this.group = null;
          }

          setContainer(c) { this.container = c; }

          get3DObject() { return this.group || this.lineMesh; }

          create3DObject() {
            if (this.lineMesh) return;
            // Resolution derived from orthographic camera frustum, identical to LaserFx.
            // Continuous-beam plugin context must pass a camera; if absent, fall back to canvas size.
            var res;
            if (this.camera) {
              var top = this.camera.top,
                  aspect = this.camera.right / this.camera.top,
                  vh = (2 * top) / Math.cos(this.camera.rotation.y),
                  vw = vh * aspect;
              res = new THREE.Vector2(vw, vh).multiplyScalar(
                (top * Math.cos(this.camera.rotation.x)) / u.Coords.ISO_WORLD_SCALE
              );
            } else {
              res = new THREE.Vector2(window.innerWidth || 1920, window.innerHeight || 1080);
            }
            // Core beam
            this.lineMesh = this._createMesh(this.sourcePos, this.targetPos, this._width, res);
            this.lineMesh.name = "fx_magbeam_core";
            // Glow halo (wider, translucent)
            if (this._outerSpread > 0) {
              this.glowMesh = this._createMesh(this.sourcePos, this.targetPos, this._width + this._outerSpread * 2, res);
              this.glowMesh.name = "fx_magbeam_glow";
              this.group = new THREE.Group();
              this.group.name = "fx_magbeam";
              this.group.add(this.lineMesh);
              this.group.add(this.glowMesh);
            } else {
              this.lineMesh.name = "fx_magbeam";
            }
          }

          update(nowMs) {
            if (this._disposed || !this.lineMesh) return;
            if (this._firstMs == null) this._firstMs = nowMs;
            var elapsed = (nowMs - this._firstMs) / 1000;
            if (this._duration != null) {
              this._timeLeft = Math.max(0, 1 - elapsed / this._duration);
              if (this._timeLeft <= 0) {
                this.container && this.container.remove(this);
                this.dispose();
                return;
              }
            }
            this._phase = elapsed * this._waveSpeed;
            var pulse = 1 + this._pulseStr * Math.sin(elapsed * this._pulseRate * Math.PI * 2);
            pulse = Math.max(0, Math.min(1, pulse));
            // Core
            var oldGeom = this.lineMesh.geometry;
            this.lineMesh.geometry = this._makeGeom(this.sourcePos, this.targetPos, this._phase);
            oldGeom.dispose();
            this.lineMesh.material.uniforms.opacity.value = this._alpha * pulse * this._timeLeft;
            // Glow
            if (this.glowMesh) {
              var oldGeom2 = this.glowMesh.geometry;
              this.glowMesh.geometry = this._makeGeom(this.sourcePos, this.targetPos, this._phase);
              oldGeom2.dispose();
              this.glowMesh.material.uniforms.opacity.value = this._alpha * 0.35 * pulse * this._timeLeft;
            }
          }

          updateEndpoints(src, dst) {
            if (this._disposed) return;
            this.sourcePos.copy(src);
            this.targetPos.copy(dst);
          }

          removeAndDispose() {
            if (this.container) { try { this.container.remove(this); } catch (e) {} }
            this.dispose();
          }

          isFinished() { return this._timeLeft <= 0; }

          dispose() {
            this._disposed = true;
            if (this.lineMesh) { this.lineMesh.geometry.dispose(); this.lineMesh.material.dispose(); this.lineMesh = null; }
            if (this.glowMesh) { this.glowMesh.geometry.dispose(); this.glowMesh.material.dispose(); this.glowMesh = null; }
            this.group = null;
          }

          // --- internal ---

          _createMesh(src, dst, lineWidth, res) {
            var segs = 16;
            var geom = new THREE.Geometry();
            var pt = new THREE.Vector3();
            for (var j = 0; j <= segs; j++) {
              pt.lerpVectors(src, dst, j / segs);
              geom.vertices.push(pt.clone());
            }
            var ml = new h.MeshLine();
            ml.setGeometry(geom);
            return new THREE.Mesh(ml.geometry, new h.MeshLineMaterial({
              color: this._color.clone(),
              lineWidth: lineWidth,
              resolution: res,
              transparent: true,
              sizeAttenuation: 0,
              blending: THREE.AdditiveBlending,
            }));
          }

          _makeGeom(src, dst, phase) {
            var dir = dst.clone().sub(src);
            var lenTiles = dir.length() / u.Coords.LEPTONS_PER_TILE;
            var segs = Math.max(8, Math.floor(20 * lenTiles));
            var amp = this._waveAmp;
            var freq = this._waveFreq;
            // Vertical wave (Y-axis), matching OpenRA RadBeamRenderable which oscillates
            // the beam along the world Z-axis (vertical in OpenRA's coordinate system).
            var geom = new THREE.Geometry();
            var pt = new THREE.Vector3();
            for (var j = 0; j <= segs; j++) {
              var t = j / segs;
              pt.lerpVectors(src, dst, t);
              var wave = amp * Math.sin(t * freq * Math.PI * 2 + phase);
              pt.y += wave;
              geom.vertices.push(pt.clone());
            }
            var ml = new h.MeshLine();
            ml.setGeometry(geom);
            return ml.geometry;
          }
        }),
      );
    },
  };
});
