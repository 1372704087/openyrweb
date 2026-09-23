/**
 * VxlGeometryNaiveBuilder — 朴素体素几何：每可见体素复制立方体顶点/面。
 *
 * 由 engine/renderable/builder/vxlGeometry/VxlGeometryNaiveBuilder.ts.js
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
 * 朴素 VXL 几何构建器。
 * 每个体素展开为单位立方体，跳过被邻接体素遮挡的顶点颜色，
 * 最后 mergeVertices + computeBoundingBox。
 */
export class VxlGeometryNaiveBuilder {
  /**
   * 构建 BufferGeometry。
   * @param e - 体素源
   */
  build(e: VoxelSourceLike): any {
    const { voxels: t, voxelField: i } = e.getAllVoxels();
    const r = new THREE.BoxBufferGeometry(1, 1, 1);
    const vertsPerBox = r.getAttribute("position").array.length / 3;
    const a = r.getAttribute("normal").array;
    let n = new THREE.BufferGeometry();
    n.setIndex(this.createIndexAttr(t, r, vertsPerBox));
    n.addAttribute("position", this.createPositionAttr(e, t, r));
    n.addAttribute("normal", this.createNormalAttr(e, t, vertsPerBox));
    n.addAttribute("color", this.createColorAttr(t, vertsPerBox, a, i));
    n = BufferGeometryUtils.mergeVertices(n);
    n.computeBoundingBox();
    return n;
  }

  /**
   * 位置属性：minBounds + voxel*scale + 立方体局部偏移。
   * @param e - 体素源
   * @param i - 体素列表
   * @param t - 参考立方体几何
   */
  protected createPositionAttr(e: VoxelSourceLike, i: any[], t: any): any {
    const r = t.getAttribute("position").array;
    const s = r.length;
    const a = new Float32Array(r.length * i.length);
    const n = e.minBounds;
    const o = e.scale;
    for (let h = 0, u = i.length; h < u; h++) {
      const l = h * s;
      const c = i[h];
      for (let e2 = 0, t2 = r.length; e2 < t2; e2 += 3) {
        (a[l + e2] = n.x + c.x * o.x + r[e2]),
          (a[l + e2 + 1] = n.y + c.y * o.y + r[e2 + 1]),
          (a[l + e2 + 2] = n.z + c.z * o.z + r[e2 + 2]);
      }
    }
    return new THREE.BufferAttribute(a, 3);
  }

  /**
   * 法线属性：按 voxel.normalIndex 取法线表并复制到该体素全部顶点。
   * @param e - 体素源
   * @param i - 体素列表
   * @param r - 每盒顶点数
   */
  protected createNormalAttr(e: VoxelSourceLike, i: any[], r: number): any {
    const s = new Float32Array(r * i.length * 3);
    const a = e.getNormals();
    for (let l = 0, t = i.length; l < t; l++) {
      const n = l * r * 3;
      const o = a[Math.min(i[l].normalIndex, a.length - 1)];
      for (let e2 = 0, t2 = 3 * r; e2 < t2; e2 += 3) {
        (s[n + e2] = o.x), (s[n + e2 + 1] = o.y), (s[n + e2 + 2] = o.z);
      }
    }
    return new THREE.BufferAttribute(s, 3);
  }

  /**
   * 颜色属性：x=colorIndex/255；被邻接体素占据则写 0（标记隐藏）。
   * @param i - 体素列表
   * @param r - 每盒顶点数
   * @param s - 立方体法线数组（用于邻接采样）
   * @param a - voxelField
   */
  protected createColorAttr(i: any[], r: number, s: any, a: any): any {
    const n = new Float32Array(r * i.length * 3);
    for (let h = 0, e = i.length; h < e; h++) {
      const o = h * r * 3;
      const l = i[h];
      for (let e2 = 0, t = 3 * r; e2 < t; e2 += 3) {
        const c = a.get(l.x + s[e2], l.y + s[e2 + 1], l.z + s[e2 + 2]);
        (n[o + e2] = c ? 0 : l.colorIndex / 255),
          (n[o + e2 + 1] = 0),
          (n[o + e2 + 2] = 0);
      }
    }
    return new THREE.BufferAttribute(n, 3);
  }

  /**
   * 索引属性：每个体素偏移立方体索引。
   * @param i - 体素列表
   * @param e - 参考立方体
   * @param r - 每盒顶点数
   */
  protected createIndexAttr(i: any[], e: any, r: number): any {
    const s = e.getIndex().array;
    const a = new Uint32Array(i.length * s.length);
    for (let n = 0, o = i.length; n < o; n++)
      for (let e2 = 0, t = s.length; e2 < t; e2++)
        a[n * t + e2] = n * r + s[e2];
    return new THREE.BufferAttribute(a, 1);
  }
}
