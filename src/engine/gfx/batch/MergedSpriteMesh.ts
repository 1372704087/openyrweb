/**
 * MergedSpriteMesh — 合并顶点精灵网格（position/uv 槽位差分上传 + 可选 mult/palette）。
 *
 * 由 engine/gfx/batch/MergedSpriteMesh.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { equals as arrayEquals } from "util/array"; // 已转换
import { PaletteBasicMaterial } from "engine/gfx/material/PaletteBasicMaterial"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 模块级复用向量。 */
const tmpVec3 = new THREE.Vector3();
const tmpVec4 = new THREE.Vector4();

/** MergedSpriteMesh。 */
export class MergedSpriteMesh extends THREE.Mesh {
  maxInstances: number;
  verticesPerItem: number;
  indicesPerItem?: number;

  /** 按副本数扩展属性集合的合并几何体。 */
  static createMergedGeometry(source: any, instances: number, material: any): any {
    const geometry = new THREE.BufferGeometry();
    for (const name of Object.keys(source.attributes)) {
      const srcAttr = source.getAttribute(name);
      const array = new srcAttr.array.constructor(instances * srcAttr.array.length);
      geometry.addAttribute(name, new THREE.BufferAttribute(array, srcAttr.itemSize, srcAttr.normalized));
    }
    const vertexCount = source.getAttribute("position").count;
    if (material instanceof PaletteBasicMaterial) {
      geometry.addAttribute(
        "vertexColorMult",
        new THREE.BufferAttribute(new Float32Array(vertexCount * instances * 4), 4),
      );
    }
    if (material.palette) {
      geometry.addAttribute(
        "vertexPaletteOffset",
        new THREE.BufferAttribute(new Float32Array(vertexCount * instances), 1),
      );
    }
    for (const attr of Object.values(geometry.attributes)) (attr as any).setDynamic?.(true);
    if (source.index) {
      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(instances * source.index.array.length), 1));
      for (let i = 0; i < instances; i++) {
        const offset = i * vertexCount;
        geometry.index.array.set(
          Uint32Array.from(source.index.array, (v: number) => v + offset),
          i * source.index.array.length,
        );
      }
    }
    return geometry;
  }

  constructor(templateGeometry: any, material: any, maxInstances: number) {
    super(MergedSpriteMesh.createMergedGeometry(templateGeometry, maxInstances, material));
    this.maxInstances = maxInstances;
    this.material = this.decorateMaterial(material.clone());
    this.verticesPerItem = templateGeometry.getAttribute("position").count;
    this.indicesPerItem = templateGeometry.index?.count;
    this.frustumCulled = false;
  }

  private decorateMaterial(material: any): any {
    const m = material;
    if (m.defines == null) m.defines = {};
    if (material.palette) m.defines.VERTEX_PALETTE_OFFSET = "";
    if (material instanceof PaletteBasicMaterial) m.useVertexColorMult = true;
    return material;
  }

  /** 同步 position/uv/mult/palette，并设置 drawRange 与 updateRange。 */
  updateFromMeshes(meshes: any[]): void {
    const attrs = this.geometry.attributes;
    const positionAttr = attrs.position;
    const uvAttr = attrs.uv;
    const multAttr = attrs.vertexColorMult;
    const paletteAttr = attrs.vertexPaletteOffset;
    const count = meshes.length;
    if (count > this.maxInstances) throw new RangeError("Exceeded maximum number of instances");
    for (let i = 0; i < count; i++) {
      const baseVertex = i * this.verticesPerItem;
      const mesh = meshes[i];
      this.setGeometryAt(
        baseVertex,
        mesh.geometry,
        tmpVec3.setFromMatrixPosition(mesh.matrixWorld),
        positionAttr,
        uvAttr,
      );
      const extra = mesh.getExtraLight();
      if (multAttr) {
        this.setColorMultAt(
          baseVertex,
          tmpVec4.set(1 + extra.x, 1 + extra.y, 1 + extra.z, mesh.getOpacity()),
          multAttr,
        );
      }
      if (paletteAttr) this.setPaletteIndexAt(baseVertex, mesh.getPaletteIndex(), paletteAttr);
    }
    this.geometry.setDrawRange(
      0,
      count * (this.geometry.index ? this.indicesPerItem! : this.verticesPerItem),
    );
    for (const attr of Object.values(attrs) as any[]) {
      if (attr.dynamic) {
        attr.updateRange.count =
          count < this.maxInstances ? count * this.verticesPerItem * attr.itemSize : -1;
      }
    }
  }

  /** 写一槽位 position/uv；与缓冲 fround 一致时跳过。 */
  private setGeometryAt(
    baseVertex: number,
    source: any,
    worldPos: any,
    positionAttr: any,
    uvAttr: any,
  ): void {
    const srcAttrs = source.attributes;
    const posArray = srcAttrs.position.array;
    const outPos = positionAttr.array;
    for (let v = 0; v < this.verticesPerItem; v++) {
      const o = 3 * (baseVertex + v);
      const x = Math.fround(posArray[3 * v] + Math.fround(worldPos.x));
      const y = Math.fround(posArray[3 * v + 1] + Math.fround(worldPos.y));
      const z = Math.fround(posArray[3 * v + 2] + Math.fround(worldPos.z));
      if (x !== outPos[o] || y !== outPos[o + 1] || z !== outPos[o + 2]) {
        outPos[o] = x;
        outPos[o + 1] = y;
        outPos[o + 2] = z;
        positionAttr.needsUpdate = true;
      }
    }
    const outUv = uvAttr.array;
    const srcUv = srcAttrs.uv.array;
    if (!arrayEquals(srcUv, outUv.subarray(2 * baseVertex, 2 * baseVertex + srcUv.length))) {
      outUv.set(srcUv, 2 * baseVertex);
      uvAttr.needsUpdate = true;
    }
  }

  /** 首顶点变化时向整槽位写入 vertexColorMult 并标 needsUpdate。 */
  private setColorMultAt(baseVertex: number, value: any, attr: any): void {
    if (
      attr.getX(baseVertex) !== value.x ||
      attr.getY(baseVertex) !== value.y ||
      attr.getZ(baseVertex) !== value.z ||
      attr.getW(baseVertex) !== value.w
    ) {
      attr.needsUpdate = true;
      for (let v = 0; v < this.verticesPerItem; v++) {
        attr.setXYZW(baseVertex + v, value.x, value.y, value.z, value.w);
      }
    }
  }

  /** 首顶点 paletteOffset 变化时写整槽位。 */
  private setPaletteIndexAt(baseVertex: number, index: number, attr: any): void {
    if (attr.getX(baseVertex) !== index) {
      attr.needsUpdate = true;
      for (let v = 0; v < this.verticesPerItem; v++) attr.setX(baseVertex + v, index);
    }
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
