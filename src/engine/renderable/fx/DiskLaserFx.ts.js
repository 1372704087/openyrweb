// === Reconstructed SystemJS module: engine/renderable/fx/DiskLaserFx ===
// deps: ["three.meshline","game/Coords"]
//
// OpenYRWeb (2026-07-15): Floating Disc DiskLaser ring charge + beam effect.
// Ring geometry: mathematically a perfect circle (appears elliptical due to
// isometric projection). The ring is NOT a continuous closed loop — it is
// two short arc segments (each 60°/2-of-12 segments) that travel from the
// point opposite the target toward the nearest point: one clockwise, one
// counter-clockwise (like cars driving from start to finish). When they
// converge at the nearest point, a beam fires to the target.
// Uses MeshLine (same as President IFV LaserFx) + AdditiveBlending.

System.register("engine/renderable/fx/DiskLaserFx", ["three.meshline", "game/Coords"], function (e, t) {
  "use strict";
  var a, n, i;
  t && t.id;
  return {
    setters: [
      function (e) { a = e; },
      function (e) { n = e; },
    ],
    execute: function () {
      e(
        "DiskLaserFx",
        (i = class {
          /**
           * @param {THREE.Vector3} sourcePos - FLH muzzle world position (circle centre)
           * @param {THREE.Vector3} targetPos - initial target world position
           * @param {THREE.Camera} camera
           * @param {object} params:
           *   radius: number           Ring radius in leptons (default 240)
           *   durationSeconds: number  Total effect duration
           *   getSourcePos: () => THREE.Vector3|null  (optional, tracks moving firer)
           *   getTargetPos: () => THREE.Vector3|null  (optional, tracks moving target)
           */
          constructor(sourcePos, targetPos, camera, params) {
            this._src = sourcePos.clone();
            this._dst = targetPos.clone();
            this._camera = camera;
            var p = params || {};

            // Color: use INI innerColor (or houseColor if IsHouseColor=yes).
            // innerColor/outerColor are [R, G, B] 0-255 arrays from the INI.
            if (p.isHouseColor && p.houseColor) {
              this._color = p.houseColor.clone();
            } else {
              var c = p.innerColor;
              this._color = new THREE.Color(
                c ? c[0] / 255 : 200 / 255,
                c ? c[1] / 255 : 0,
                c ? c[2] / 255 : 220 / 255
              );
            }
            // Outer colour for trail/wake glow
            var oc = p.outerColor;
            this._outerColor = new THREE.Color(
              oc ? oc[0] / 255 : 80 / 255,
              oc ? oc[1] / 255 : 0,
              oc ? oc[2] / 255 : 88 / 255
            );

            this._radius = p.radius != null ? p.radius : 240;
            this._durationSeconds = p.durationSeconds != null ? p.durationSeconds : 1.0;
            this._chargeRatio = 0.7;
            this._holdSeconds = 0.08;

            // Ring: 12 segments total, each arc draws ~1.33 segments (40°)
            this._ringSegments = 12;
            this._ringArcSegs = 2;
            this._arcAngle = (Math.PI * 2) / this._ringSegments * this._ringArcSegs * 2 / 3;

            this._getSourcePos = p.getSourcePos || null;
            this._getTargetPos = p.getTargetPos || null;
            this._onChargeStart = p.onChargeStart || null;
            this._onBeamStart = p.onBeamStart || null;

            this._firstMs = null;
            this._disposed = false;
            this.container = null;
            this._chargeStarted = false;
            this._beamStarted = false;

            // MeshLine resolution (same as LaserFx)
            var top = camera.top,
              right = camera.right / camera.top,
              height = (2 * top) / Math.cos(camera.rotation.y),
              width = height * right;
            this._resolution = new THREE.Vector2(width, height).multiplyScalar(
              (top * Math.cos(camera.rotation.x)) / n.Coords.ISO_WORLD_SCALE
            );

            this._numRingSegs = 32; // arc subdivision for smooth rendering

            this._ring1 = null;
            this._ring2 = null;
            this._ringGlow1 = null;
            this._ringGlow2 = null;
            this._ringCore1 = null;
            this._ringCore2 = null;
            this._trail1 = null;
            this._trail2 = null;
            this._beamMesh = null;
            this._beamGlowMesh = null;
            this._group = null;
          }

          setContainer(c) { this.container = c; }

          get3DObject() { return this._group || null; }

          create3DObject() {
            if (this._group) return;
            this._group = new THREE.Group();
            this._group.name = "fx_disklaser";
            this._group.frustumCulled = false;
          }

          update(nowMs) {
            if (this._disposed || !this._group) return;
            if (this._firstMs == null) this._firstMs = nowMs;

            // Track moving firer
            if (this._getSourcePos) {
              var newSrc = this._getSourcePos();
              if (newSrc) this._src.copy(newSrc);
            }
            // Track moving target
            if (this._getTargetPos) {
              var newDst = this._getTargetPos();
              if (newDst) this._dst.copy(newDst);
            }

            var elapsed = (nowMs - this._firstMs) / 1000;
            var totalDur = this._durationSeconds + this._holdSeconds;
            if (elapsed >= totalDur) {
              this.container && this.container.remove(this);
              this.dispose();
              return;
            }

            var progress = Math.min(elapsed / totalDur, 1.0);
            var chargeEnd = (this._durationSeconds * this._chargeRatio) / totalDur;
            var holdEnd = chargeEnd + this._holdSeconds / totalDur;

            if (progress < chargeEnd) {
              // Charging phase: two short arcs travel from opposite toward nearest
              if (!this._chargeStarted) {
                this._chargeStarted = true;
                this._onChargeStart && this._onChargeStart();
              }
              var chargeProgress = progress / chargeEnd;
              this._rebuildChargePhase(chargeProgress, nowMs);
            } else if (progress < holdEnd) {
              // Hold phase: ring stays fully charged at nearest point, pause before beam
              this._rebuildChargePhase(1.0, nowMs);
            } else {
              // Beam phase: ring gone, beam fires from nearest point to target
              if (!this._beamStarted) {
                this._beamStarted = true;
                this._onBeamStart && this._onBeamStart();
              }
              var beamProgress = (progress - holdEnd) / (1 - holdEnd);
              this._rebuildBeamPhase(beamProgress);
            }
          }

          /**
           * Two short arc segments travel from the point opposite the target
           * toward the nearest point, like cars on a circular track.
           * Arcs move in opposite angular directions (pos / neg).
           * At chargeProgress=0 both arc tails are at the opposite point.
           * At chargeProgress=1 both arc tails converge at the nearest point
           * — only then does the beam fire.
           *
           * Direction convention (angles are in XZ-plane, atan2 standard):
           *   posDir (+angle) = counter-clockwise in top-down XZ
           *   negDir (-angle) = clockwise in top-down XZ
           */
          _rebuildChargePhase(chargeProgress, nowMs) {
            // Recalculate nearest/opposite angles from current positions
            this._recalcAngles();

            // Angular distances from opposite to nearest.
            // distPos = distance going in +angle direction (counter-clockwise top-down)
            // distNeg = distance going in -angle direction (clockwise top-down)
            var distPos = (this._nearestAngle - this._oppositeAngle + Math.PI * 2) % (Math.PI * 2);
            var distNeg = (this._oppositeAngle - this._nearestAngle + Math.PI * 2) % (Math.PI * 2);

            // Leading edge travels (dist + arcAngle) so that the trailing edge
            // (the tail of the "car") reaches nearestAngle exactly at chargeProgress=1.
            // Track 1: +angle direction
            var leadingPos = this._oppositeAngle + chargeProgress * (distPos + this._arcAngle);
            // Track 2: -angle direction
            var leadingNeg = this._oppositeAngle - chargeProgress * (distNeg + this._arcAngle);

            // Arc segment: trails behind the leading edge by _arcAngle
            // Track 1 (+dir): [leading - arc, leading]
            // Track 2 (-dir): [leading, leading + arc]
            var arc1Start = leadingPos - this._arcAngle;
            var arc1End = leadingPos;
            var arc2Start = leadingNeg;
            var arc2End = leadingNeg + this._arcAngle;

            // Opacity ramps up during charge
            var arcOpacity = 0.5 + chargeProgress * 0.5;

            // Flash near charge completion — preserve hue, flash brightness only
            var color = this._color.clone();
            if (chargeProgress > 0.85) {
              var flash = Math.sin(nowMs * 0.06) * 0.3 + 0.7;
              var hsl = {};
              this._color.getHSL(hsl);
              color.setHSL(hsl.h, hsl.s, flash);
            }

            // Track 1 arc (bright leading segment, +angle direction)
            this._disposeMesh(this._ring1);
            this._disposeMesh(this._ringGlow1);
            this._disposeMesh(this._ringCore1);
            this._ringGlow1 = this._buildArcMesh(arc1Start, arc1End, this._outerColor, 6, arcOpacity * 0.3);
            this._group.add(this._ringGlow1);
            this._ring1 = this._buildArcMesh(arc1Start, arc1End, color, 2, arcOpacity);
            this._group.add(this._ring1);
            this._ringCore1 = this._buildArcMesh(arc1Start, arc1End, new THREE.Color(1, 1, 1), 1, arcOpacity * 0.3);
            this._group.add(this._ringCore1);

            // Track 2 arc (bright leading segment, -angle direction)
            this._disposeMesh(this._ring2);
            this._disposeMesh(this._ringGlow2);
            this._disposeMesh(this._ringCore2);
            this._ringGlow2 = this._buildArcMesh(arc2Start, arc2End, this._outerColor, 6, arcOpacity * 0.3);
            this._group.add(this._ringGlow2);
            this._ring2 = this._buildArcMesh(arc2Start, arc2End, color, 2, arcOpacity);
            this._group.add(this._ring2);
            this._ringCore2 = this._buildArcMesh(arc2Start, arc2End, new THREE.Color(1, 1, 1), 1, arcOpacity * 0.3);
            this._group.add(this._ringCore2);

            // Trail: fading wake behind the arcs.
            // Only drawn once the arc has actually left the opposite point.
            var trailOpacity = 0.25 + Math.min(chargeProgress, 1) * 0.15;
            var trailColor = this._outerColor.clone();

            // Track 1 trail: from oppositeAngle to arc1Start in +angle direction
            var trailPosSpan = arc1Start - this._oppositeAngle;
            if (trailPosSpan > 0.001) {
              this._disposeMesh(this._trail1);
              this._trail1 = this._buildArcMesh(
                this._oppositeAngle, arc1Start, trailColor, 1, trailOpacity, trailPosSpan
              );
              this._group.add(this._trail1);
            } else {
              this._disposeMesh(this._trail1);
              this._trail1 = null;
            }

            // Track 2 trail: from arc2End to oppositeAngle in -angle direction
            var trailNegSpan = this._oppositeAngle - arc2End;
            if (trailNegSpan > 0.001) {
              this._disposeMesh(this._trail2);
              this._trail2 = this._buildArcMesh(
                arc2End, this._oppositeAngle, trailColor, 1, trailOpacity, -trailNegSpan
              );
              this._group.add(this._trail2);
            } else {
              this._disposeMesh(this._trail2);
              this._trail2 = null;
            }

            // No beam during charge
            this._disposeMesh(this._beamMesh);
            this._disposeMesh(this._beamGlowMesh);
          }

          _rebuildBeamPhase(beamProgress) {
            // Ring disappears (arcs + trails + glows + cores)
            this._disposeMesh(this._ring1);
            this._disposeMesh(this._ring2);
            this._disposeMesh(this._ringGlow1);
            this._disposeMesh(this._ringGlow2);
            this._disposeMesh(this._ringCore1);
            this._disposeMesh(this._ringCore2);
            this._disposeMesh(this._trail1);
            this._disposeMesh(this._trail2);

            // Beam opacity: fast fade-in, hold, short fade-out at the very end
            var beamOpacity;
            if (beamProgress < 0.08) {
              beamOpacity = beamProgress / 0.08;
            } else if (beamProgress < 0.85) {
              beamOpacity = 1.0;
            } else {
              beamOpacity = (1 - beamProgress) / 0.15;
            }

            // Recalculate nearest point (firer may have moved)
            this._recalcAngles();
            var startPt = this._getCirclePoint(this._nearestAngle);
            var endPt = this._dst.clone();

            // Outer glow: wide, translucent (Prism Tank laser style)
            this._disposeMesh(this._beamGlowMesh);
            var glowGeom = new THREE.Geometry();
            glowGeom.vertices.push(startPt.clone(), endPt.clone());
            var glowML = new a.MeshLine();
            glowML.setGeometry(glowGeom);
            var glowMat = new a.MeshLineMaterial({
              color: this._color,
              lineWidth: 5,
              resolution: this._resolution,
              transparent: true,
              opacity: beamOpacity * 0.3,
              sizeAttenuation: 0,
              blending: THREE.AdditiveBlending,
              depthTest: false,
              depthWrite: false,
            });
            this._beamGlowMesh = new THREE.Mesh(glowML.geometry, glowMat);
            this._beamGlowMesh.frustumCulled = false;
            this._group.add(this._beamGlowMesh);

            // Inner core: thin, bright (laser color)
            this._disposeMesh(this._beamMesh);
            var coreGeom = new THREE.Geometry();
            coreGeom.vertices.push(startPt.clone(), endPt.clone());
            var beamML = new a.MeshLine();
            beamML.setGeometry(coreGeom);
            var beamMat = new a.MeshLineMaterial({
              color: new THREE.Color(1, 1, 1),
              lineWidth: 2,
              resolution: this._resolution,
              transparent: true,
              opacity: beamOpacity * 0.3,
              sizeAttenuation: 0,
              blending: THREE.AdditiveBlending,
              depthTest: false,
              depthWrite: false,
            });
            this._beamMesh = new THREE.Mesh(beamML.geometry, beamMat);
            this._beamMesh.frustumCulled = false;
            this._group.add(this._beamMesh);
          }

          _recalcAngles() {
            var dir = new THREE.Vector3().subVectors(this._dst, this._src);
            dir.y = 0;
            if (dir.lengthSq() < 0.001) dir.set(1, 0, 0);
            dir.normalize();

            this._nearestAngle = Math.atan2(dir.z, dir.x);
            this._oppositeAngle = Math.atan2(-dir.z, -dir.x);
          }

          _getCirclePoint(angle) {
            return new THREE.Vector3(
              this._src.x + this._radius * Math.cos(angle),
              this._src.y,
              this._src.z + this._radius * Math.sin(angle),
            );
          }

          /**
           * Build a MeshLine arc.
           * @param {number} startAngle
           * @param {number} endAngle
           * @param {THREE.Color} color
           * @param {number} lineWidth
           * @param {number} opacity
           * @param {number} [forceSpan]  If provided, use this exact angular span
           *   instead of auto-normalising to the shortest arc (±π). Use for trails
           *   that must cover >180° in a specific direction.
           */
          _buildArcMesh(startAngle, endAngle, color, lineWidth, opacity, forceSpan) {
            var geom = new THREE.Geometry();
            var span = endAngle - startAngle;
            if (forceSpan != null) {
              span = forceSpan;
            } else {
              // Normalize to shortest signed span (for main arcs ≤180°)
              while (span > Math.PI) span -= Math.PI * 2;
              while (span < -Math.PI) span += Math.PI * 2;
            }
            var totalSegs = Math.max(2, Math.floor(this._numRingSegs * Math.abs(span) / (Math.PI * 2)));

            for (var i = 0; i <= totalSegs; i++) {
              var t = i / totalSegs;
              var angle = startAngle + span * t;
              geom.vertices.push(this._getCirclePoint(angle));
            }

            var ml = new a.MeshLine();
            ml.setGeometry(geom);

            var mat = new a.MeshLineMaterial({
              color: color.clone(),
              lineWidth: lineWidth,
              resolution: this._resolution,
              transparent: true,
              opacity: opacity,
              sizeAttenuation: 0,
              blending: THREE.AdditiveBlending,
              depthTest: false,
              depthWrite: false,
            });

            var mesh = new THREE.Mesh(ml.geometry, mat);
            mesh.frustumCulled = false;
            return mesh;
          }

          _disposeMesh(mesh) {
            if (!mesh) return;
            if (mesh.material) mesh.material.dispose();
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.parent) mesh.parent.remove(mesh);
          }

          isFinished() { return this._disposed; }

          dispose() {
            this._disposed = true;
            this._disposeMesh(this._ring1);
            this._disposeMesh(this._ring2);
            this._disposeMesh(this._ringGlow1);
            this._disposeMesh(this._ringGlow2);
            this._disposeMesh(this._ringCore1);
            this._disposeMesh(this._ringCore2);
            this._disposeMesh(this._trail1);
            this._disposeMesh(this._trail2);
            this._disposeMesh(this._beamMesh);
            this._disposeMesh(this._beamGlowMesh);
            this._ring1 = null;
            this._ring2 = null;
            this._ringGlow1 = null;
            this._ringGlow2 = null;
            this._ringCore1 = null;
            this._ringCore2 = null;
            this._trail1 = null;
            this._trail2 = null;
            this._beamMesh = null;
            this._group = null;
          }
        }),
      );
    },
  };
});
