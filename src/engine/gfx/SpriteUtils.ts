/**
 * SpriteUtils — 精灵面片几何构造（相机对齐/贴地、UV、深度偏移）。
 * 默认导出为单例 new SpriteUtils()；USE_INDEXED_GEOMETRY=true。
 *
 * 由 engine/gfx/SpriteUtils.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { isBetween } from "util/math"; // 已转换
import { BufferGeometryUtils } from "engine/gfx/BufferGeometryUtils"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** createSpriteGeometry 参数。 */
export interface SpriteGeometryParams {
  camera: any;
  texture: any;
  textureArea?: { x: number; y: number; width: number; height: number };
  offset?: { x: number; y: number };
  align?: { x: number; y: number };
  scale?: number;
  flat?: boolean;
  depth?: boolean;
  depthOffset?: number;
  [key: string]: any;
}

/** SpriteUtils 实现类。孪生导出的是单例实例（export const SpriteUtils = new SpriteUtils()），
 *  对外（如 l.SpriteUtils.createSpriteGeometry）都是实例方法；MAGIC_DEPTH_SCALE 为类静态。 */
class SpriteUtilsImpl {
  USE_INDEXED_GEOMETRY = true;
  VERTICES_PER_SPRITE = this.USE_INDEXED_GEOMETRY ? 8 : 12;
  TRIANGLES_PER_SPRITE = 4;

  static MAGIC_DEPTH_SCALE = 0.8;

  /**
   * 构建面向相机（或贴地）的精灵四边形几何体：
   * 左右两半矩形（支持 textureArea 左半深度锚定）合并 → 对齐/偏移 → 深度 → 旋转。
   */
  createSpriteGeometry(options: SpriteGeometryParams): any {
    if (typeof options !== "object") throw new Error("Invalid argument");
    const camera = options.camera;
    let texture = options.texture;
    if (!options.textureArea) {
      options.textureArea = { x: 0, y: 0, width: texture.image.width, height: texture.image.height };
    }
    if (!options.offset) options.offset = { x: 0, y: 0 };
    let srcW = options.textureArea.width;
    let srcH = options.textureArea.height;
    const texSize = { width: options.texture.image.width, height: options.texture.image.height };
    const scale = Math.cos(camera.rotation.y) * (options.scale ?? 1);
    const flatStretch = scale / Math.sin(-camera.rotation.x);
    const worldW = srcW * scale;
    const worldH = srcH * (options.flat ? flatStretch : scale);

    const useDepth = options.depth && !options.flat;
    // depth 锚：depth 且 offset.x 落在 [0, 宽] 内时用 -offset.x，否则半宽
    const leftPortion =
      useDepth && isBetween(-options.offset.x, 0, worldW / scale)
        ? -options.offset.x
        : worldW / scale / 2;
    srcW = leftPortion; // 后续 as left portion
    srcH = worldH;

    let left = this.createRectGeometry(srcW * scale, srcH);
    let right = this.createRectGeometry(worldW - srcW * scale, srcH);
    this.addRectUvs(left, { ...options.textureArea, width: srcW }, texSize);
    this.addRectUvs(right, {
      ...options.textureArea,
      x: options.textureArea.x + srcW,
      width: options.textureArea.width - srcW,
    }, texSize);
    right.applyMatrix(new THREE.Matrix4().makeTranslation((worldW - srcW * scale + srcW * scale) / 2, 0, 0));
    const geometry = BufferGeometryUtils.mergeBufferGeometries([left, right]);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-(worldW / 2 - (srcW * scale) / 2), 0, 0));

    const align = options.align as { x: number; y: number };
    const offset = options.offset as { x: number; y: number };
    geometry.applyMatrix(
      new THREE.Matrix4().makeTranslation(
        (align.x * worldW) / 2 + offset.x * scale,
        (align.y * worldH) / 2 - offset.y * (options.flat ? flatStretch : scale),
        0,
      ),
    );
    if (useDepth) {
      this.applyDepth(geometry, camera, options.depthOffset ?? 0);
    } else if (options.depth && options.flat && options.depthOffset) {
      this.applyFlatDepth(geometry, options.depthOffset);
    }

    const euler = new THREE.Euler(camera.rotation.x, camera.rotation.y, 0, "YXZ");
    geometry.applyMatrix(
      new THREE.Matrix4()
        .makeRotationFromEuler(euler)
        .multiply(
          options.flat
            ? new THREE.Matrix4().makeRotationFromEuler(
                new THREE.Euler(-camera.rotation.x - Math.PI / 2, 0, 0),
              )
            : new THREE.Matrix4().identity(),
        ),
    );
    return geometry;
  }

  createRectGeometry(width: number, height: number): any {
    if (this.USE_INDEXED_GEOMETRY) return this.createIndexedRectGeometry(width, height);
    return this.createNonIndexedRectGeometry(width, height);
  }

  createNonIndexedRectGeometry(width: number, height: number): any {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      -0.5 * width, 0.5 * height, 0,
      -0.5 * width, -0.5 * height, 0,
      0.5 * width, 0.5 * height, 0,
      -0.5 * width, -0.5 * height, 0,
      0.5 * width, -0.5 * height, 0,
      0.5 * width, 0.5 * height, 0,
    ]);
    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }

  createIndexedRectGeometry(width: number, height: number): any {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      -0.5 * width, 0.5 * height, 0,
      0.5 * width, 0.5 * height, 0,
      -0.5 * width, -0.5 * height, 0,
      0.5 * width, -0.5 * height, 0,
    ]);
    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
    const index = new Uint16Array([0, 2, 1, 2, 3, 1]);
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
    return geometry;
  }

  addRectUvs(geometry: any, area: any, textureSize: any): void {
    const buffer = new Float32Array(2 * geometry.getAttribute("position").count);
    if (this.USE_INDEXED_GEOMETRY) {
      this.writeIndexedRectUvsIntoBuffer(buffer, 0, area, textureSize);
    } else {
      this.writeNonIndexedRectUvsIntoBuffer(buffer, 0, area, textureSize);
    }
    geometry.addAttribute("uv", new THREE.BufferAttribute(buffer, 2));
  }

  writeNonIndexedRectUvsIntoBuffer(buffer: Float32Array, offset: number, area: any, tex: any): void {
    const u = area.x / tex.width;
    const v = 1 - (area.y + area.height) / tex.height;
    const du = area.width / tex.width;
    const dv = area.height / tex.height;
    buffer.set([u, v + dv, u, v, u + du, v + dv, u, v, u + du, v, u + du, v + dv], 12 * offset);
  }

  writeIndexedRectUvsIntoBuffer(buffer: Float32Array, offset: number, area: any, tex: any): void {
    const u = area.x / tex.width;
    const v = 1 - (area.y + area.height) / tex.height;
    const du = area.width / tex.width;
    const dv = area.height / tex.height;
    buffer.set([u, v + dv, u + du, v + dv, u, v, u + du, v], 8 * offset);
  }

  /** 顶点深度偏移（YXZ 相机下按 MAGIC_DEPTH_SCALE 映射到 z）。 */
  applyDepth(geometry: any, camera: any, depthOffset: number): void {
    const position = geometry.getAttribute("position");
    for (let i = 0, n = position.count; i < n; i++) {
      const scaled = position.getX(i) * SpriteUtilsImpl.MAGIC_DEPTH_SCALE;
      const z =
        scaled < 0
          ? depthOffset - (Math.abs(scaled) / Math.cos(camera.rotation.x)) * Math.tan(camera.rotation.y)
          : depthOffset - scaled / Math.cos(camera.rotation.x) / Math.tan(camera.rotation.y);
      position.setZ(i, z);
    }
  }

  /** 贴地深度：全部顶点 z = depthOffset。 */
  applyFlatDepth(geometry: any, depthOffset: number): void {
    const position = geometry.getAttribute("position");
    for (let i = 0, n = position.count; i < n; i++) position.setZ(i, depthOffset);
  }
}

export const SpriteUtils = new SpriteUtilsImpl();
