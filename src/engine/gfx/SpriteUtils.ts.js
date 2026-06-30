// === Reconstructed SystemJS module: engine/gfx/SpriteUtils ===
// deps: ["util/math","engine/gfx/BufferGeometryUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/SpriteUtils", ["util/math", "engine/gfx/BufferGeometryUtils"], function (e, t) {
  "use strict";
  var d, g, o;
  t && t.id;
  return {
    setters: [
      function (e) {
        d = e;
      },
      function (e) {
        g = e;
      },
    ],
    execute: function () {
      (((o = class o {
        constructor() {
          ((this.USE_INDEXED_GEOMETRY = !0),
            (this.VERTICES_PER_SPRITE = this.USE_INDEXED_GEOMETRY ? 8 : 12),
            (this.TRIANGLES_PER_SPRITE = 4));
        }
        createSpriteGeometry(e) {
          if ("object" != typeof e) throw new Error("Invalid argument");
          var t = e.camera,
            i = e.texture;
          (e.textureArea || (e.textureArea = { x: 0, y: 0, width: i.image.width, height: i.image.height }),
            e.offset || (e.offset = { x: 0, y: 0 }));
          var r = e.textureArea.width,
            s = e.textureArea.height,
            a = { width: e.texture.image.width, height: e.texture.image.height },
            n = Math.cos(t.rotation.y) * (e.scale ?? 1),
            o = n / Math.sin(-t.rotation.x),
            l = r * n,
            c = s * (e.flat ? o : n);
          let h;
          ((i = e.depth && !e.flat),
            (r = i && d.isBetween(-e.offset.x, 0, l / n) ? -e.offset.x : l / n / 2),
            (s = this.createRectGeometry(r * n, c)));
          let u = this.createRectGeometry(l - r * n, c);
          (this.addRectUvs(s, { ...e.textureArea, width: r }, a),
            this.addRectUvs(u, { ...e.textureArea, x: e.textureArea.x + r, width: e.textureArea.width - r }, a),
            u.applyMatrix(new THREE.Matrix4().makeTranslation((l - r * n + r * n) / 2, 0, 0)),
            (h = g.BufferGeometryUtils.mergeBufferGeometries([s, u])),
            h.applyMatrix(new THREE.Matrix4().makeTranslation(-(l / 2 - (r * n) / 2), 0, 0)));
          ((s = e.align), (r = e.offset));
          (h.applyMatrix(
            new THREE.Matrix4().makeTranslation((s.x * l) / 2 + r.x * n, (s.y * c) / 2 - r.y * (e.flat ? o : n), 0),
          ),
            i
              ? this.applyDepth(h, t, e.depthOffset ?? 0)
              : e.depth && e.flat && e.depthOffset && this.applyFlatDepth(h, e.depthOffset));
          i = new THREE.Euler(t.rotation.x, t.rotation.y, 0, "YXZ");
          return (
            h.applyMatrix(
              new THREE.Matrix4()
                .makeRotationFromEuler(i)
                .multiply(
                  e.flat
                    ? new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-t.rotation.x - Math.PI / 2, 0, 0))
                    : new THREE.Matrix4().identity(),
                ),
            ),
            h
          );
        }
        createRectGeometry(e, t) {
          return this.USE_INDEXED_GEOMETRY
            ? this.createIndexedRectGeometry(e, t)
            : this.createNonIndexedRectGeometry(e, t);
        }
        createNonIndexedRectGeometry(e, t) {
          let i = new THREE.BufferGeometry();
          var r = new Float32Array([
            -0.5 * e,
            0.5 * t,
            0,
            -0.5 * e,
            -0.5 * t,
            0,
            0.5 * e,
            0.5 * t,
            0,
            -0.5 * e,
            -0.5 * t,
            0,
            0.5 * e,
            -0.5 * t,
            0,
            0.5 * e,
            0.5 * t,
            0,
          ]);
          return (i.addAttribute("position", new THREE.BufferAttribute(r, 3)), i);
        }
        createIndexedRectGeometry(e, t) {
          let i = new THREE.BufferGeometry();
          var r = new Float32Array([
            -0.5 * e,
            0.5 * t,
            0,
            0.5 * e,
            0.5 * t,
            0,
            -0.5 * e,
            -0.5 * t,
            0,
            0.5 * e,
            -0.5 * t,
            0,
          ]);
          i.addAttribute("position", new THREE.BufferAttribute(r, 3));
          r = new Uint16Array([0, 2, 1, 2, 3, 1]);
          return (i.setIndex(new THREE.BufferAttribute(r, 1)), i);
        }
        addRectUvs(e, t, i) {
          var r = new Float32Array(2 * e.getAttribute("position").count);
          (this.USE_INDEXED_GEOMETRY
            ? this.writeIndexedRectUvsIntoBuffer(r, 0, t, i)
            : this.writeNonIndexedRectUvsIntoBuffer(r, 0, t, i),
            e.addAttribute("uv", new THREE.BufferAttribute(r, 2)));
        }
        writeNonIndexedRectUvsIntoBuffer(e, t, i, r) {
          var s = i.x / r.width,
            a = 1 - (i.y + i.height) / r.height,
            n = i.width / r.width,
            o = i.height / r.height;
          e.set([s, a + o, s, a, s + n, a + o, s, a, s + n, a, s + n, a + o], 12 * t);
        }
        writeIndexedRectUvsIntoBuffer(e, t, i, r) {
          var s = i.x / r.width,
            a = 1 - (i.y + i.height) / r.height,
            n = i.width / r.width,
            o = i.height / r.height;
          e.set([s, a + o, s + n, a + o, s, a, s + n, a], 8 * t);
        }
        applyDepth(e, t, i) {
          let r = e.getAttribute("position");
          for (let a = 0, n = r.count; a < n; a++) {
            var s = r.getX(a) * o.MAGIC_DEPTH_SCALE;
            let e;
            ((e =
              s < 0
                ? i - (Math.abs(s) / Math.cos(t.rotation.x)) * Math.tan(t.rotation.y)
                : i - s / Math.cos(t.rotation.x) / Math.tan(t.rotation.y)),
              r.setZ(a, e));
          }
        }
        applyFlatDepth(e, t) {
          let i = e.getAttribute("position");
          for (let r = 0, s = i.count; r < s; r++) i.setZ(r, t);
        }
      }).MAGIC_DEPTH_SCALE = 0.8),
        e("SpriteUtils", new o()));
    },
  };
});
