/**
 * MeshBatchManager — 按 batchKey 分组收集 BatchedMesh，填入 Instancing/Merging 批次，
 * 支持脏标记增量刷新与每 4 帧安全网重建。
 *
 * 由 engine/gfx/batch/MeshBatchManager.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { BatchedMesh, BatchMode } from "engine/gfx/batch/BatchedMesh"; // 孪生（本批内一并转换）
import { MeshInstancingBatch } from "engine/gfx/batch/MeshInstancingBatch"; // 孪生（本批内一并转换）
import { RenderableContainer } from "engine/gfx/RenderableContainer"; // 孪生（本批内一并转换）
import { MeshMergingBatch } from "engine/gfx/batch/MeshMergingBatch"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 批次最小形状（两种 batch 共用协议）。 */
export interface MeshBatchLike {
  castShadow: boolean;
  receiveShadow: boolean;
  renderOrder: number;
  clippingPlanes: any[];
  setMeshes(meshes: any[]): void;
  dispose(): void;
}

/** MeshBatchManager。 */
export class MeshBatchManager extends RenderableContainer {
  batches: Map<string, MeshBatchLike[]> = new Map();
  private _meshBatchMap: Map<MeshBatchLike, any[]> = new Map();
  private _needsRebuild: boolean = true;
  private _frame: number = 0;

  constructor(public readonly renderableContainer: any) {
    super();
  }

  create3DObject(): void {
    let root = this.get3DObject();
    if (!root) {
      root = new THREE.Object3D();
      root.name = "mesh_batch_manager";
      root.matrixAutoUpdate = false;
      this.set3DObject(root);
    }
    super.create3DObject();
  }

  /**
   * 标记批次内容失效。增删批处理网格的调用方必须调用，
   * 否则仅依赖 updateMeshes 内的周期兜底重建。
   */
  markNeedsRebuild(): void {
    this._needsRebuild = true;
  }

  /**
   * @param force 本帧强制全量重建，默认 true（保持原每帧重建行为）；
   *   脏协议调用方传 false 走增量路径。
   * 重建条件：force || needsRebuild || 每 4 帧兜底（捕捉 visible 翻转等未上报变更）。
   */
  updateMeshes(force: boolean = true): void {
    let root = this.renderableContainer.get3DObject();
    if (!root) return;
    ++this._frame;
    if (force || this._needsRebuild || (this._frame & 3) === 0) {
      this._needsRebuild = false;
      const meshes = this.collectMeshes(root);
      const kept = this.fillBatches(this.groupMeshesByBatchKey(meshes));
      this.cleanUnusedBatches(kept);
    } else {
      this.refreshOnly();
    }
  }

  /** 仅用缓存 mesh 列表回填各批次，不遍历场景图。 */
  refreshOnly(): void {
    for (const list of this.batches.values()) {
      for (const batch of list) {
        const meshes = this._meshBatchMap.get(batch);
        if (meshes) batch.setMeshes(meshes);
      }
    }
  }

  /** traverseVisible 收集 isBatchedMesh。 */
  private collectMeshes(root: any): BatchedMesh[] {
    const out: BatchedMesh[] = [];
    root.traverseVisible((obj: any) => {
      if (obj.isBatchedMesh) out.push(obj);
    });
    return out;
  }

  /**
   * 按 key 分槽填入：Instancing 槽 1024、Merging 槽 128。
   * 首次创建批次时继承首 mesh 的阴影/renderOrder/裁剪并立即 processRenderQueue。
   * @returns key → 实际使用的批次数（供 cleanUnusedBatches）。
   */
  private fillBatches(groups: Map<string, BatchedMesh[]>): Map<string, number> {
    const usedCounts = new Map<string, number>([...this.batches.keys()].map((k) => [k, 0]));
    for (const [key, queue] of groups) {
      let list = this.batches.get(key);
      let slot = 0;
      while (queue.length) {
        const isInstancing = queue[0].batchMode === BatchMode.Instancing;
        const capacity = isInstancing ? 1024 : 128;
        const slice = queue.splice(0, capacity);
        let batch = list?.[slot];
        if (!batch) {
          if (!list) {
            list = [];
            this.batches.set(key, list);
          }
          batch = new (isInstancing ? MeshInstancingBatch : MeshMergingBatch)(capacity) as any;
          (batch as any).castShadow = slice[0].castShadow;
          (batch as any).receiveShadow = slice[0].receiveShadow;
          (batch as any).renderOrder = slice[0].renderOrder;
          (batch as any).clippingPlanes = slice[0].getClippingPlanes();
          list.push(batch);
          this.add(batch as any);
          this.processRenderQueue();
        }
        this._meshBatchMap.set(batch, slice);
        batch.setMeshes(slice);
        slot++;
      }
      usedCounts.set(key, slot);
    }
    return usedCounts;
  }

  /** 多余批次：从树移除、出映射、dispose。 */
  private cleanUnusedBatches(usedCounts: Map<string, number>): void {
    for (const [key, count] of usedCounts) {
      const list = this.batches.get(key);
      if (list) {
        for (const batch of list.splice(count)) {
          this.remove(batch as any);
          this._meshBatchMap.delete(batch);
          batch.dispose();
        }
        if (!list.length) this.batches.delete(key);
      }
    }
  }

  private groupMeshesByBatchKey(meshes: BatchedMesh[]): Map<string, BatchedMesh[]> {
    const map = new Map<string, BatchedMesh[]>();
    for (let i = 0, len = meshes.length; i < len; i++) {
      const mesh = meshes[i];
      const key = this.getBatchKey(mesh);
      let group = map.get(key);
      if (!group) {
        group = [];
        map.set(key, group);
      }
      group.push(mesh);
    }
    return map;
  }

  /**
   * batchMode + 几何体标识 + 材质 uuid + 阴影/渲染序/裁剪哈希。
   * Instancing 用 geometry.uuid；Merging 用 position.count（同顶点数可合并）。
   */
  private getBatchKey(mesh: BatchedMesh): string {
    return (
      mesh.batchMode +
      "_" +
      (mesh.batchMode === BatchMode.Instancing ? mesh.geometry.uuid : mesh.geometry.attributes.position.count) +
      "_" +
      mesh.material.uuid +
      "_" +
      Number(mesh.castShadow) +
      "_" +
      mesh.renderOrder +
      "_" +
      Number(mesh.receiveShadow) +
      "_" +
      mesh.getClippingPlanesHash()
    );
  }

  dispose(): void {
    this.batches.forEach((list) => list.forEach((b) => b.dispose()));
  }
}
