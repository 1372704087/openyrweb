// === Reconstructed SystemJS module: engine/renderable/fx/MindControlLinkFx ===
// deps: ["game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

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
      e(
        "MindControlLinkFx",
        (i = class {
          constructor(e, t, i, r) {
            ((this.sourcePos = e),
              (this.targetPos = t),
              (this.color = i),
              (this.heightTiles = r),
              (this.colorAnimProgress = 0));
          }
          setContainer(e) {
            this.container = e;
          }
          get3DObject() {
            return this.lineMesh;
          }
          create3DObject() {
            this.lineMesh || ((this.lineMesh = this.createObject()), (this.lineMesh.name = "fx_mclink"));
          }
          updateEndpoints(e, t) {
            var i = !e.equals(this.sourcePos) || !t.equals(this.targetPos);
            ((this.sourcePos = e),
              (this.targetPos = t),
              i &&
                this.lineMesh &&
                (this.lineMesh.geometry.dispose(),
                (this.lineMesh.geometry = this.createLineGeometry(
                  this.sourcePos,
                  this.targetPos,
                  this.heightTiles,
                  this.color,
                  this.colorAnimProgress,
                ))));
          }
          update(e) {
            (this.lastUpdate ?? (this.lastUpdate = e),
              (this.colorAnimProgress += (e - this.lastUpdate) / 1e3),
              (this.colorAnimProgress -= Math.floor(this.colorAnimProgress)),
              (this.lastUpdate = e),
              this.lineMesh.geometry.dispose(),
              (this.lineMesh.geometry = this.createLineGeometry(
                this.sourcePos,
                this.targetPos,
                this.heightTiles,
                this.color,
                this.colorAnimProgress,
              )));
          }
          createObject() {
            var e = this.sourcePos,
              t = this.targetPos,
              e = this.createLineGeometry(e, t, this.heightTiles, this.color, this.colorAnimProgress),
              t = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors, transparent: !0 });
            let i = new THREE.Line(e, t);
            return ((i.renderOrder = 1e6), i);
          }
          createLineGeometry(t, i, r, s, e) {
            var a = new THREE.Color(16777215),
              n = 1.5 * e,
              o = i.clone().sub(t).length() / m.Coords.LEPTONS_PER_TILE,
              l = Math.floor(15 * o);
            let c = new Float32Array(3 * l),
              h = new Float32Array(3 * l),
              u = new THREE.Vector3();
            for (let p = 0; p <= l; p++) {
              var d = p / l;
              (u.lerpVectors(t, i, d),
                (u.y += m.Coords.LEPTONS_PER_TILE / 4 + r * m.Coords.LEPTONS_PER_TILE * Math.sin(d * Math.PI)),
                (c[3 * p] = u.x),
                (c[3 * p + 1] = u.y),
                (c[3 * p + 2] = u.z));
              let e = s;
              (d < n && n - 0.5 <= d && (e = s.clone().lerp(a, (d - (n - 0.5)) / 0.5)),
                (h[3 * p] = e.r),
                (h[3 * p + 1] = e.g),
                (h[3 * p + 2] = e.b));
            }
            let g = new THREE.BufferGeometry();
            return (
              g.addAttribute("position", new THREE.BufferAttribute(c, 3)),
              g.addAttribute("color", new THREE.BufferAttribute(h, 3)),
              g
            );
          }
          removeAndDispose() {
            (this.container.remove(this), this.dispose());
          }
          dispose() {
            this.lineMesh && (this.lineMesh.geometry.dispose(), this.lineMesh.material.dispose());
          }
        }),
      );
    },
  };
});
