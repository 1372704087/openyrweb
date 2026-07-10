// === Reconstructed SystemJS module: engine/renderable/fx/MagBeamFx ===
// deps: ["game/Coords"]
//
// OpenYRWeb (2026-07-08): CPU-driven vertex color wave effect.
// Uses MeshBasicMaterial with vertexColors + AdditiveBlending.
// Sawtooth wave with soft-edge pulse overlay on continuous base beam.
// Screen-space physical-length uvx, fixed interval, max 6 pulses.
// Segments=100 for smooth per-pixel-like wave bands.

System.register("engine/renderable/fx/MagBeamFx", ["game/Coords"], function (e, t) {
  "use strict";
  var u, i;
  t && t.id;
  return {
    setters: [
      function (e) { u = e; },
    ],
    execute: function () {
      e(
        "MagBeamFx",
        (i = class {
          constructor(sourcePos, targetPos, camera, params) {
            this.sourcePos = sourcePos.clone();
            this.targetPos = targetPos.clone();
            this.camera = camera || null;
            var p = params || {};

            // Vanilla YR Wave parameters (Ares reverse-engineered)
            this._waveColor = p.waveColor || [0, 0, 0];
            this._waveIntensity = p.waveIntensity || [128, 0, 1024];
            this._waveIsHouseColor = !!p.waveIsHouseColor;
            this._waveReverse = !!p._waveReverse;

            // Beam visual parameters
            this._width = p.width != null ? p.width : 3.5;
            this._waveFreq = p.waveFrequency != null ? p.waveFrequency : 6.0;
            this._waveSpeed = p.waveSpeed != null ? p.waveSpeed : 2.2;
            this._pulseStr = p.pulseStrength != null ? p.pulseStrength : 0.3;
            this._pulseRate = p.pulseRate != null ? p.pulseRate : 3.5;
            this._alpha = p.alpha != null ? p.alpha : 0.85;
            this._duration = p.durationSeconds != null ? p.durationSeconds : null;
            this._houseColor = p.color || null;

            // 光束生长/收缩动画
            this._growth = 0;
            this._growthSpeed = p.growthSpeed != null ? p.growthSpeed : 3.0;
            this._isDying = false;
            this._growFromTarget = !!p.growFromTarget;
            this._lastUpdateMs = null;

            // State
            this._firstMs = null;
            this._timeLeft = 1;
            this._disposed = false;
            this.container = null;
            this.group = null;
            this.coreMesh = null;
            this._geom = null;
            this._beamSegments = 100;
            this._screenUvx = null;
            this._screenW = 1920;
            this._screenH = 1080;
          }

          setContainer(c) { this.container = c; }
          get3DObject() { return this.group || this.coreMesh; }

          create3DObject() {
            if (this.coreMesh) return;
            this.group = new THREE.Group();
            this.group.name = "fx_magbeam";
            this._geom = this._buildGeometry();

            // Normalize intensity for color calculation
            this._intensityNorm = new THREE.Vector3(
              this._waveIntensity[0] / 256.0,
              this._waveIntensity[1] / 256.0,
              this._waveIntensity[2] / 256.0
            );

            this._coreMat = new THREE.MeshBasicMaterial({
              vertexColors: true,
              transparent: true,
              depthTest: true,   // 光束应被前方单位/建筑遮挡
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              side: THREE.DoubleSide,
            });
            this.coreMesh = new THREE.Mesh(this._geom, this._coreMat);
            this.coreMesh.name = "fx_magbeam_core";
            this.coreMesh.frustumCulled = false;
            this.coreMesh.renderOrder = 0;
            this.group.add(this.coreMesh);

            this._updateGeometry();
          }

          update(nowMs) {
            if (this._disposed || !this.coreMesh) return;
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

            // 光束生长/收缩动画
            var dt = this._lastUpdateMs != null ? Math.min((nowMs - this._lastUpdateMs) / 1000, 0.1) : 1 / 60;
            this._lastUpdateMs = nowMs;
            if (this._isDying) {
              this._growth -= dt * this._growthSpeed;
              if (this._growth <= 0) {
                this._growth = 0;
                this.container && this.container.remove(this);
                this.dispose();
                return;
              }
            } else {
              this._growth = Math.min(1, this._growth + dt * this._growthSpeed);
            }

            this._updateGeometry();
            this._updateColors(elapsed);
          }

          updateEndpoints(src, dst) {
            if (this._disposed) return;
            this.sourcePos.copy(src);
            this.targetPos.copy(dst);
          }

          setWaveReverse(reverse) {
            this._waveReverse = !!reverse;
          }

          startDying() {
            this._isDying = true;
          }

          revive() {
            this._isDying = false;
            this._growth = Math.max(this._growth, 0.01);
            this._firstMs = null;
            this._lastUpdateMs = null;
          }

          isDying() {
            return this._isDying;
          }

          removeAndDispose() {
            if (this.container) { try { this.container.remove(this); } catch (e) {} }
            this.dispose();
          }

          isFinished() { return this._timeLeft <= 0 || (this._isDying && this._growth <= 0); }

          dispose() {
            this._disposed = true;
            if (this._geom) { this._geom.dispose(); this._geom = null; }
            if (this.coreMesh) { this.coreMesh.material.dispose(); this.coreMesh = null; }
            this.group = null;
            this._screenUvx = null;
            this._lastUpdateMs = null;
          }

          // --- internal ---

          _buildGeometry() {
            var segs = this._beamSegments;
            var vcount = (segs + 1) * 2;  // left+right per segment edge
            var geom = new THREE.BufferGeometry();
            var positions = new Float32Array(vcount * 3);
            var colors = new Float32Array(vcount * 4);
            var indices = new Uint16Array(segs * 6);

            for (var i = 0; i < segs; i++) {
              var a = i * 2, b = a + 1, c = a + 3, d = a + 2;
              indices[i * 6]     = a;
              indices[i * 6 + 1] = b;
              indices[i * 6 + 2] = c;
              indices[i * 6 + 3] = a;
              indices[i * 6 + 4] = c;
              indices[i * 6 + 5] = d;
            }
            geom.addAttribute("position", new THREE.BufferAttribute(positions, 3));
            geom.addAttribute("color", new THREE.BufferAttribute(colors, 4));
            geom.setIndex(new THREE.BufferAttribute(indices, 1));
            return geom;
          }

          _updateGeometry() {
            var src = this.sourcePos;
            var dst = this.targetPos;

            // 根据生长方向和进度计算实际渲染起点/终点
            var startPos, endPos;
            if (this._growFromTarget) {
              // 从目标向炮口生长（拖拽车辆）：起点固定在目标，终点向炮口延伸
              startPos = dst.clone();
              endPos = new THREE.Vector3().lerpVectors(dst, src, this._growth);
            } else {
              // 从炮口向目标生长（攻击建筑/地面）：起点固定在炮口，终点向目标延伸
              startPos = src.clone();
              endPos = new THREE.Vector3().lerpVectors(src, dst, this._growth);
            }

            var beamDir = new THREE.Vector3().subVectors(endPos, startPos);
            var beamLen = beamDir.length();
            if (beamLen < 0.001) {
              // 退化情况：光束长度为0，使用完整方向避免 right 向量计算异常
              beamDir.subVectors(dst, src);
              beamLen = beamDir.length();
              if (beamLen < 0.001) beamLen = 0.001;
            }
            beamDir.divideScalar(beamLen);

            var camPos = this.camera ? this.camera.position : new THREE.Vector3(0, 1000, 0);
            var beamMid = new THREE.Vector3().addVectors(src, dst).multiplyScalar(0.5);
            // 使用世界 Y 轴（地面平行），而非面向摄像机
            var worldUp = new THREE.Vector3(0, 1, 0);
            var right = new THREE.Vector3().crossVectors(beamDir, worldUp);
            if (right.lengthSq() < 0.0001) right.set(1, 0, 0);
            right.normalize();

            this._screenW = (typeof window !== "undefined" && window.innerWidth) || 1920;
            this._screenH = (typeof window !== "undefined" && window.innerHeight) || 1080;
            var halfW;

            if (this.camera && this.camera.isPerspectiveCamera) {
              var distance = camPos.distanceTo(beamMid);
              var fov = this.camera.fov * Math.PI / 180;
              var worldPerPixel = (2 * distance * Math.tan(fov / 2)) / this._screenH;
              halfW = this._width * worldPerPixel;
            } else if (this.camera && this.camera.top) {
              var worldPerPixel = (2 * this.camera.top) / this._screenH;
              halfW = this._width * worldPerPixel;
            } else {
              halfW = this._width;
            }

            var segs = this._beamSegments;

            // 计算 screen-space 物理长度（百像素为单位），不归一化
            if (!this._screenUvx || this._screenUvx.length !== segs + 1) {
              this._screenUvx = new Float32Array(segs + 1);
            }

            var totalScreenLen = 0;
            var prevSX = 0, prevSY = 0;
            var hasPrev = false;
            var ndcToPixelX = this._screenW / 2;
            var ndcToPixelY = this._screenH / 2;

            for (var i = 0; i <= segs; i++) {
              var t = i / segs;
              var pt = new THREE.Vector3().lerpVectors(startPos, endPos, t);

              if (this.camera) {
                var viewPos = pt.clone().applyMatrix4(this.camera.matrixWorldInverse);
                var projPos = new THREE.Vector4(viewPos.x, viewPos.y, viewPos.z, 1.0);
                projPos.applyMatrix4(this.camera.projectionMatrix);
                var sx = projPos.x / projPos.w;
                var sy = projPos.y / projPos.w;

                if (hasPrev) {
                  var dx = (sx - prevSX) * ndcToPixelX;
                  var dy = (sy - prevSY) * ndcToPixelY;
                  totalScreenLen += Math.sqrt(dx * dx + dy * dy);
                }
                this._screenUvx[i] = totalScreenLen / 100.0;
                prevSX = sx;
                prevSY = sy;
                hasPrev = true;
              } else {
                this._screenUvx[i] = t;
              }
            }

            var posAttr = this._geom.getAttribute("position");
            var arr = posAttr.array;
            for (var i = 0; i <= segs; i++) {
              var t = i / segs;
              var pt = new THREE.Vector3().lerpVectors(startPos, endPos, t);
              var li = i * 2 * 3;
              var ri = li + 3;
              arr[li]     = pt.x - right.x * halfW;
              arr[li + 1] = pt.y - right.y * halfW;
              arr[li + 2] = pt.z - right.z * halfW;
              arr[ri]     = pt.x + right.x * halfW;
              arr[ri + 1] = pt.y + right.y * halfW;
              arr[ri + 2] = pt.z + right.z * halfW;
            }
            posAttr.needsUpdate = true;
            this._geom.computeBoundingSphere();
          }

          _updateColors(elapsed) {
            var segs = this._beamSegments;
            var colorAttr = this._geom.getAttribute("color");
            var arr = colorAttr.array;
            var alpha = this._alpha;
            var timeLeft = this._timeLeft;
            var freq = this._waveFreq;
            var speed = this._waveSpeed;
            var pulseStr = this._pulseStr;
            var pulseRate = this._pulseRate;
            var reverse = this._waveReverse;
            var mod = this._intensityNorm;

            var pulse = 1.0 + pulseStr * Math.sin(elapsed * pulseRate * Math.PI * 2);
            if (pulse < 0) pulse = 0;
            if (pulse > 1) pulse = 1;

            for (var i = 0; i <= segs; i++) {
              // screen-space 物理长度（百像素单位），间隔固定
              var uvx = this._screenUvx ? this._screenUvx[i] : (i / segs);

              // 锯齿波: fract(uvx * freq - elapsed * speed)
              var wavePos = uvx * freq - elapsed * speed;
              if (reverse) wavePos = -wavePos;
              var cycle = Math.floor(wavePos);
              var saw = wavePos - cycle;

              // 最多6个脉冲：cycle 0~5 显示脉冲，>=6 纯底色
              if (cycle < 0 || cycle >= 6) {
                saw = 0;
              }

              // 柔和脉冲：底色与脉冲亮度差缩小，边缘渐变
              var base = 0.50;         // 底色 50%（始终可见，光束不断）
              var pulseWidth = 0.25;   // 脉冲占 25%
              var extra = 0.25;        // 脉冲只比底色亮 25%（峰值 75%）
              var fade = pulseWidth * 0.2; // 边缘渐变 20%

              var t = 0.0;
              if (saw < fade) {
                t = saw / fade;                 // 0 → 1 上升
              } else if (saw < pulseWidth - fade) {
                t = 1.0;                        // 平顶
              } else if (saw < pulseWidth) {
                t = (pulseWidth - saw) / fade;  // 1 → 0 下降
              }
              var modulation = base + extra * t;

              var x = modulation * pulse * alpha * timeLeft;

              // Purple beam with intensity modulation
              var r = 0.5 * mod.x * x * 2;
              var g = 0;
              var b = 1.0 * mod.z * x * 2;
              var a = x;

              var ci = i * 2 * 4;
              arr[ci]     = r;
              arr[ci + 1] = g;
              arr[ci + 2] = b;
              arr[ci + 3] = a;
              arr[ci + 4] = r;
              arr[ci + 5] = g;
              arr[ci + 6] = b;
              arr[ci + 7] = a;
            }
            colorAttr.needsUpdate = true;
          }
        }),
      );
    },
  };
});