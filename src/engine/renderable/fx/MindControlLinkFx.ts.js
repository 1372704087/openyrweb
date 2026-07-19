// === Reconstructed SystemJS module: engine/renderable/fx/MindControlLinkFx ===
// deps: ["game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: renders a curved line between source and target with camera-facing plane
// dots at both endpoints.

System.register("engine/renderable/fx/MindControlLinkFx", ["game/Coords"], function (e, t) {
  "use strict";
  var m, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        m = e;
      },
    ],
    execute: function () {
      ((i = function () {
        function i(e, t, r, s, a) {
          ((this.sourcePos = e),
            (this.targetPos = t),
            (this.color = r),
            (this.heightTiles = s),
            (this.camera = a),
            (this.colorAnimProgress = 0));
        }
        i.prototype.setContainer = function (e) {
          this.container = e;
        };
        i.prototype.get3DObject = function () {
          return this.group;
        };
        i.prototype.create3DObject = function () {
          if (this.group) return;
          var t = this;
          (t.group = new THREE.Group()), (t.group.name = "fx_mclink");
          var e = t.sourcePos,
            r = t.targetPos;
          var s = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors, transparent: !0 });
          (t.lineMesh = new THREE.Line(t.createLineGeometry(e, r, t.heightTiles, t.color, t.colorAnimProgress), s)),
            (t.lineMesh.renderOrder = 1e6),
            t.group.add(t.lineMesh);
          var a = new THREE.Color(t.color);
          (t.dotMat = new THREE.MeshBasicMaterial({ color: a, transparent: !0, depthTest: !1, depthWrite: !1 }));
          var n = i._dotGeo;
          var yOff = m.Coords.LEPTONS_PER_TILE / 4;
          (t.srcDot = new THREE.Mesh(n, t.dotMat)),
            (t.srcDot.renderOrder = 1e6 + 1),
            t.srcDot.position.set(t.sourcePos.x, t.sourcePos.y + yOff, t.sourcePos.z),
            t.camera && t.srcDot.setRotationFromQuaternion(new THREE.Quaternion().setFromEuler(t.camera.rotation)),
            t.group.add(t.srcDot);
          (t.dstDot = new THREE.Mesh(n, t.dotMat)),
            (t.dstDot.renderOrder = 1e6 + 1),
            t.dstDot.position.set(t.targetPos.x, t.targetPos.y + yOff, t.targetPos.z),
            t.camera && t.dstDot.setRotationFromQuaternion(new THREE.Quaternion().setFromEuler(t.camera.rotation)),
            t.group.add(t.dstDot);
        };
        i.prototype.updateEndpoints = function (e, t) {
          var r = !e.equals(this.sourcePos) || !t.equals(this.targetPos);
          ((this.sourcePos = e),
            (this.targetPos = t),
            r &&
              this.lineMesh &&
              (this.lineMesh.geometry.dispose(),
              (this.lineMesh.geometry = this.createLineGeometry(this.sourcePos, this.targetPos, this.heightTiles, this.color, this.colorAnimProgress)),
              this.srcDot && this.srcDot.position.set(e.x, e.y + m.Coords.LEPTONS_PER_TILE / 4, e.z),
              this.dstDot && this.dstDot.position.set(t.x, t.y + m.Coords.LEPTONS_PER_TILE / 4, t.z)));
        };
        i.prototype.update = function (e) {
          var t = this;
          t.lastUpdate = void 0 === t.lastUpdate ? e : t.lastUpdate;
          (t.colorAnimProgress += (e - t.lastUpdate) / 1e3),
            (t.colorAnimProgress -= Math.floor(t.colorAnimProgress)),
            (t.lastUpdate = e),
            t.lineMesh.geometry.dispose(),
            (t.lineMesh.geometry = t.createLineGeometry(t.sourcePos, t.targetPos, t.heightTiles, t.color, t.colorAnimProgress)),
            t.srcDot && t.srcDot.position.set(t.sourcePos.x, t.sourcePos.y + m.Coords.LEPTONS_PER_TILE / 4, t.sourcePos.z),
            t.dstDot && t.dstDot.position.set(t.targetPos.x, t.targetPos.y + m.Coords.LEPTONS_PER_TILE / 4, t.targetPos.z);
          if (t.camera) {
            var r = new THREE.Quaternion().setFromEuler(t.camera.rotation);
            t.srcDot && t.srcDot.quaternion.copy(r);
            t.dstDot && t.dstDot.quaternion.copy(r);
          }
        };
        i.prototype.createLineGeometry = function (t, i, r, s, e) {
          var a = new THREE.Color(16777215),
            n = 1.5 * e,
            o = i.clone().sub(t).length() / m.Coords.LEPTONS_PER_TILE,
            l = Math.floor(15 * o);
          var c = new Float32Array(3 * l),
            h = new Float32Array(3 * l),
            u = new THREE.Vector3();
          for (var p = 0; p <= l; p++) {
            var d = p / l;
            (u.lerpVectors(t, i, d),
              (u.y += m.Coords.LEPTONS_PER_TILE / 4 + r * m.Coords.LEPTONS_PER_TILE * Math.sin(d * Math.PI)),
              (c[3 * p] = u.x),
              (c[3 * p + 1] = u.y),
              (c[3 * p + 2] = u.z));
            var g = s;
            (d < n && n - 0.5 <= d && (g = s.clone().lerp(a, (d - (n - 0.5)) / 0.5)),
              (h[3 * p] = g.r),
              (h[3 * p + 1] = g.g),
              (h[3 * p + 2] = g.b));
          }
          var f = new THREE.BufferGeometry();
          return (
            f.addAttribute("position", new THREE.BufferAttribute(c, 3)),
            f.addAttribute("color", new THREE.BufferAttribute(h, 3)),
            f
          );
        };
        i.prototype.removeAndDispose = function () {
          (this.container.remove(this), this.dispose());
        };
        i.prototype.dispose = function () {
          (this.lineMesh && (this.lineMesh.geometry.dispose(), this.lineMesh.material.dispose()),
            this.dotMat && this.dotMat.dispose());
        };
        return i;
      }()),
        e("MindControlLinkFx", i)),
        (i._dotGeo = new THREE.PlaneGeometry(3 * m.Coords.ISO_WORLD_SCALE, 3 * m.Coords.ISO_WORLD_SCALE));
    },
  };
});
