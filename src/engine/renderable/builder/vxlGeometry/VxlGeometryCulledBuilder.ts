/**
 * VxlGeometryCulledBuilder — 剔除被邻接体素遮挡面的立方体几何。
 *
 * 由 engine/renderable/builder/vxlGeometry/VxlGeometryCulledBuilder.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as BufferGeometryUtilsModule from "engine/gfx/BufferGeometryUtils"; // 孪生

const BufferGeometryUtils = (BufferGeometryUtilsModule as any)
  .BufferGeometryUtils as any;

declare const THREE: any;

/** 体素几何源最小形状。 */
export interface VoxelSourceLike {
  getAllVoxels(): { voxels: any[]; voxelField: any };
  minBounds: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  getNormals(): any[];
}

/**
 * 剔除式 VXL 几何构建器。
 * 对每体素立方体：仅保留邻接 voxelField 为空的顶点，
 * 再只输出三顶点均保留的三角形，最后 mergeVertices。
 */
export class VxlGeometryCulledBuilder {
  /**
   * 构建 BufferGeometry。
   * @param e - 体素源
   */
  build(e: VoxelSourceLike): any {
    const { voxels: a, voxelField: n } = e.getAllVoxels();
    const t = new THREE.BoxBufferGeometry(1, 1, 1);
    const o = t.getAttribute("position").array;
    const l = o.length / 3;
    const c = t.getAttribute("normal").array;
    const h = t.getIndex().array;
    const u: number[] = [];
    const d: number[] = [];
    const g: number[] = [];
    const p: number[] = [];
    const m = e.minBounds;
    const f = e.scale;
    const y = e.getNormals();
    let T = 0;
    for (let C = 0, r = a.length; C < r; C++) {
      const v = a[C];
      const b = y[Math.min(a[C].normalIndex, y.length - 1)];
      // 该盒 8 顶点 → 保留后的新顶点索引；未写入为 undefined
      const remap: (number | undefined)[] = new Array(l);
      for (let t2 = 0, i = 3 * l; t2 < i; t2 += 3) {
        if (!n.get(v.x + c[t2], v.y + c[t2 + 1], v.z + c[t2 + 2])) {
          remap[t2 / 3] = T;
          u.push(
            m.x + v.x * f.x + o[t2],
            m.y + v.y * f.y + o[t2 + 1],
            m.z + v.z * f.z + o[t2 + 2],
          );
          d.push(b.x, b.y, b.z);
          g.push(v.colorIndex / 255, 0, 0);
          T++;
        }
      }
      for (let r2 = 0, s = h.length; r2 < s; r2 += 3) {
        const S = remap[h[r2]];
        const w = remap[h[r2 + 1]];
        const E = remap[h[r2 + 2]];
        if (S !== undefined && w !== undefined && E !== undefined)
          p.push(S, w, E);
      }
    }
    let i = new THREE.BufferGeometry();
    i.setIndex(new THREE.BufferAttribute(new Uint32Array(p), 1));
    i.addAttribute("position", new THREE.BufferAttribute(new Float32Array(u), 3));
    i.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(d), 3));
    i.addAttribute("color", new THREE.BufferAttribute(new Float32Array(g), 3));
    i = BufferGeometryUtils.mergeVertices(i);
    i.computeBoundingBox();
    return i;
  }
}
