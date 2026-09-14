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
            (super(),
              (this.renderableContainer = e),
              (this.batches = new Map()),
              (this._meshBatchMap = new Map()),
              (this._needsRebuild = !0),
              (this._frame = 0));
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
          /** Marks the batch contents as stale. Callers that add or remove batched
           *  meshes must call this, or the rebuild only happens on the periodic
           *  fallback inside updateMeshes(). */
          markNeedsRebuild() {
            this._needsRebuild = !0;
          }
          /** `e` forces a full rebuild this frame. It defaults to true, so a plain
           *  updateMeshes() keeps the original rebuild-every-frame behaviour — only
           *  callers that participate in the dirty protocol (passing false when
           *  nothing changed) get the incremental path. */
          updateMeshes(e = !0) {
            var t = this.renderableContainer.get3DObject();
            if (!t) return;
            ++this._frame;
            // Rebuild on an explicit force, on a pending invalidation, or every 4th
            // frame as a safety net. The net matters because not every mutation is
            // reported: Building.updateImage() and Anim flip `visible` on batched
            // meshes when damage state or animation state changes, which changes the
            // collected set without touching this manager. 4 frames keeps that lag
            // under ~70ms even if the frame rate drops, while still skipping 3 of
            // every 4 scene-graph walks.
            if (e || this._needsRebuild || (this._frame & 3) === 0) {
              ((this._needsRebuild = !1),
                (t = this.collectMeshes(t)),
                (t = this.fillBatches(this.groupMeshesByBatchKey(t))),
                this.cleanUnusedBatches(t));
            } else this.refreshOnly();
          }
          /** Re-applies the cached mesh lists without re-walking the scene graph. */
          refreshOnly() {
            for (var e of this.batches.values())
              for (var t of e) {
                var i = this._meshBatchMap.get(t);
                i && t.setMeshes(i);
              }
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
                  (this._meshBatchMap.set(t, e), t.setMeshes(e)),
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
                for (r of e.splice(i)) (this.remove(r), this._meshBatchMap.delete(r), r.dispose());
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
