// === Reconstructed SystemJS module: engine/gfx/batch/MeshBatchManager ===
// deps: ["engine/gfx/batch/BatchedMesh","engine/gfx/batch/MeshInstancingBatch","engine/gfx/RenderableContainer","engine/gfx/batch/MeshMergingBatch"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/gfx/batch/MeshBatchManager",
  [
    "engine/gfx/batch/BatchedMesh",
    "engine/gfx/batch/MeshInstancingBatch",
    "engine/gfx/RenderableContainer",
    "engine/gfx/batch/MeshMergingBatch",
  ],
  function (e, t) {
    "use strict";
    var l, c, i, h, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        ((r = class extends i.RenderableContainer {
          constructor(e) {
            (super(), (this.renderableContainer = e), (this.batches = new Map()));
          }
          create3DObject() {
            let e = this.get3DObject();
            (e ||
              ((e = new THREE.Object3D()),
              (e.name = "mesh_batch_manager"),
              (e.matrixAutoUpdate = !1),
              this.set3DObject(e)),
              super.create3DObject());
          }
          updateMeshes() {
            var e = this.renderableContainer.get3DObject();
            e &&
              ((e = this.collectMeshes(e)),
              (e = this.fillBatches(this.groupMeshesByBatchKey(e))),
              this.cleanUnusedBatches(e));
          }
          collectMeshes(e) {
            let t = [];
            return (
              e.traverseVisible((e) => {
                e.isBatchedMesh && t.push(e);
              }),
              t
            );
          }
          fillBatches(e) {
            let t = new Map([...this.batches.keys()].map((e) => [e, 0]));
            for (var [s, a] of e) {
              let i = this.batches.get(s),
                r = 0;
              for (; a.length;) {
                var n = a[0].batchMode === l.BatchMode.Instancing,
                  o = n ? 1024 : 128;
                let e = a.splice(0, o),
                  t = i?.[r];
                (t ||
                  (i || ((i = []), this.batches.set(s, i)),
                  (t = new (n ? c.MeshInstancingBatch : h.MeshMergingBatch)(o)),
                  (t.castShadow = e[0].castShadow),
                  (t.receiveShadow = e[0].receiveShadow),
                  (t.renderOrder = e[0].renderOrder),
                  (t.clippingPlanes = e[0].getClippingPlanes()),
                  i.push(t),
                  this.add(t),
                  this.processRenderQueue()),
                  t.setMeshes(e),
                  r++);
              }
              t.set(s, r);
            }
            return t;
          }
          cleanUnusedBatches(e) {
            for (var [t, i] of e) {
              let e = this.batches.get(t);
              if (e) {
                var r;
                for (r of e.splice(i)) (this.remove(r), r.dispose());
                e.length || this.batches.delete(t);
              }
            }
          }
          groupMeshesByBatchKey(t) {
            let i = new Map();
            for (let a = 0, e = t.length; a < e; a++) {
              var r = t[a],
                s = this.getBatchKey(r);
              let e = i.get(s);
              (e || ((e = []), i.set(s, e)), e.push(r));
            }
            return i;
          }
          getBatchKey(e) {
            return (
              e.batchMode +
              "_" +
              (e.batchMode === l.BatchMode.Instancing ? e.geometry.uuid : e.geometry.attributes.position.count) +
              "_" +
              e.material.uuid +
              "_" +
              Number(e.castShadow) +
              "_" +
              e.renderOrder +
              "_" +
              Number(e.receiveShadow) +
              "_" +
              e.getClippingPlanesHash()
            );
          }
          dispose() {
            this.batches.forEach((e) => e.forEach((e) => e.dispose()));
          }
        }),
          e("MeshBatchManager", r));
      },
    };
  },
);
