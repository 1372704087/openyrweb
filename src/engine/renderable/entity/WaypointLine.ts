/**
 * WaypointLine — 单条路径 MeshLine（前景虚线 + 背景粗线 + 端点 Points）。
 *
 * 从 linePath.vertices 取 enabled 顶点构建 MeshLine；每帧处理
 * verticesNeedUpdate / color 变化 / dashOffset 滚动 / 相机 resolution。
 * lineHead 用 Points 渲染（前景 size6 + 背景 size8）。
 *
 * 由 engine/renderable/entity/WaypointLine.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as MeshLineModule from "three.meshline"; // 孪生
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const MeshLineNS: any = MeshLineModule as any;

/**
 * 路径折线渲染。
 * 与 WaypointLines 配合：linePath 由上层创建/更新。
 */
export class WaypointLine {
  /** 路径数据（vertices/color/verticesNeedUpdate）。 */
  linePath: any;
  /** 相机。 */
  camera: any;
  /** 上次前景色。 */
  lastColor: any;
  /** 上次背景色。 */
  lastBgColor: any;
  /** 前景点材质。 */
  lineHeadMaterial: any;
  /** 背景点材质。 */
  lineHeadBgMaterial: any;

  /** 外层 Object3D。 */
  wrapper: any;
  /** MeshLine 实例。 */
  meshLine: any;
  /** 前景线网格。 */
  fgLineMesh: any;
  /** 背景线网格。 */
  bgLineMesh: any;
  /** 端点 Points 网格 [fg, bg]。 */
  lineHeadMeshes: any[];
  /** 上次 update 时间戳。 */
  lastUpdateMillis: number | undefined;
  /** 相机尺寸指纹。 */
  cameraHash: string | undefined;
  /** 上次启用顶点数（变化时清 attributes）。 */
  lastLineVertexCount: number = 0;

  /**
   * @param linePath - 路径数据
   * @param camera - 相机
   */
  constructor(linePath: any, camera: any) {
    this.linePath = linePath;
    this.camera = camera;
    this.lastColor = this.linePath.color;
    this.lastBgColor = this.linePath.bgColor;
    this.lineHeadMaterial = new THREE.PointsMaterial({
      size: 6,
      sizeAttenuation: false,
      color: linePath.color,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    this.lineHeadBgMaterial = new THREE.PointsMaterial({
      size: 8,
      sizeAttenuation: false,
      color: linePath.bgColor,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.wrapper;
  }

  /** 惰性创建前景/背景线与端点。 */
  create3DObject(): void {
    if (!this.wrapper) {
      this.wrapper = new THREE.Object3D();
      this.wrapper.name = "waypoint_line";
      const meshLine = (this.meshLine = new (MeshLineNS.MeshLine as any)());
      const positions = this.linePath.vertices
        .filter((v: any) => v.enabled)
        .map((v: any) => v.position);
      this.lastLineVertexCount = positions.length;
      meshLine.setGeometry(positions.map((p: any) => [p.x, p.y, p.z]).flat());

      this.fgLineMesh = new THREE.Mesh(
        meshLine.geometry,
        this.createFgLineMaterial(new THREE.Color(this.linePath.color), this.computeLineLength(positions)),
      );
      this.fgLineMesh.renderOrder = 1000002;
      this.wrapper.add(this.fgLineMesh);

      this.bgLineMesh = new THREE.Mesh(
        meshLine.geometry,
        this.createBgLineMaterial(new THREE.Color(this.linePath.bgColor)),
      );
      this.bgLineMesh.renderOrder = 1000001;
      this.wrapper.add(this.bgLineMesh);

      this.lineHeadMeshes = this.createLineHeads(
        this.linePath.vertices
          .filter((v: any) => v.enabled && v.lineHead)
          .map((v: any) => v.position),
      );
      this.lineHeadMeshes.forEach((m) => this.wrapper.add(m));
    }
  }

  /**
   * 每帧：resolution / 顶点更新 / 颜色变化 / dash 滚动。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    if (!this.lastUpdateMillis) {
      this.lastUpdateMillis = now;
    }
    // 归一化到 120Hz
    const step = (now - this.lastUpdateMillis) / (1000 / 120);
    this.lastUpdateMillis = now;

    const hash = this.camera.top + "_" + this.camera.right;
    if (hash !== this.cameraHash) {
      this.cameraHash = hash;
      [this.fgLineMesh, this.bgLineMesh].forEach((mesh: any) => {
        mesh.material.uniforms.resolution.value.copy(this.computeResolution(this.camera));
      });
    }

    if (this.linePath.verticesNeedUpdate) {
      this.linePath.verticesNeedUpdate = false;
      const positions = this.linePath.vertices
        .filter((v: any) => v.enabled)
        .map((v: any) => v.position);
      if (this.lastLineVertexCount !== positions.length) {
        this.lastLineVertexCount = positions.length;
        this.meshLine.attributes = void 0;
      }
      this.meshLine.setGeometry(positions.map((p: any) => [p.x, p.y, p.z]).flat());
      const len = this.computeLineLength(positions);
      [this.fgLineMesh].forEach((mesh: any) => {
        const mat = mesh.material;
        mat.uniforms.dashArray.value = this.computeDashArray(len);
      });
      this.updateLineHeads(
        this.linePath.vertices
          .filter((v: any) => v.enabled && v.lineHead)
          .map((v: any) => v.position),
      );
    }

    if (this.linePath.color !== this.lastColor) {
      this.lastColor = this.linePath.color;
      this.fgLineMesh.material.uniforms.color.value = new THREE.Color(this.linePath.color);
      this.lineHeadMaterial.color.set(this.linePath.color);
    }
    if (this.linePath.bgColor !== this.lastBgColor) {
      this.lastBgColor = this.linePath.bgColor;
      this.bgLineMesh.material.uniforms.color.value = new THREE.Color(this.linePath.bgColor);
      this.lineHeadBgMaterial.color.set(this.linePath.bgColor);
    }
    [this.fgLineMesh].forEach((mesh: any) => {
      const mat = mesh.material;
      mat.uniforms.dashOffset.value -= (mat.uniforms.dashArray.value / 50) * step;
    });
  }

  /**
   * 折线总长。
   * @param positions - 顶点序列
   */
  computeLineLength(positions: any[]): number {
    let sum = 0;
    for (let i = 1, n = positions.length; i < n; i++) {
      sum += positions[i].distanceTo(positions[i - 1]);
    }
    return sum;
  }

  /**
   * 前景虚线材质。
   * @param color - 颜色
   * @param len - 线长
   */
  createFgLineMaterial(color: any, len: number): any {
    return new (MeshLineNS.MeshLineMaterial as any)({
      color,
      lineWidth: 2,
      resolution: this.computeResolution(this.camera),
      transparent: true,
      sizeAttenuation: 0,
      dashArray: this.computeDashArray(len),
      depthTest: false,
    });
  }

  /**
   * 背景实线材质。
   * @param color - 颜色
   */
  createBgLineMaterial(color: any): any {
    return new (MeshLineNS.MeshLineMaterial as any)({
      color,
      lineWidth: 4,
      resolution: this.computeResolution(this.camera),
      transparent: true,
      sizeAttenuation: 0,
      depthTest: false,
    });
  }

  /**
   * dash 周期。
   * @param len - 线长
   */
  computeDashArray(len: number): number {
    return Math.min(1, 5 / len) * Coords.ISO_WORLD_SCALE;
  }

  /**
   * 相机 resolution。
   * @param camera - 相机
   */
  computeResolution(camera: any): any {
    const top = camera.top;
    const ratio = camera.right / camera.top;
    const r = (2 * top) / Math.cos(camera.rotation.y);
    return new THREE.Vector2(r * ratio, r).multiplyScalar(
      (top * Math.cos(this.camera.rotation.x)) / Coords.ISO_WORLD_SCALE,
    );
  }

  /**
   * 创建端点 Points [fg, bg]（共享 BufferGeometry）。
   * @param positions - 端点位置
   */
  createLineHeads(positions: any[]): any[] {
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(positions.map((p: any) => [p.x, p.y, p.z]).flat()), 3),
    );
    const fg = new THREE.Points(geometry, this.lineHeadMaterial);
    fg.renderOrder = 1000004;
    const bg = new THREE.Points(geometry, this.lineHeadBgMaterial);
    bg.renderOrder = 1000003;
    return [fg, bg];
  }

  /**
   * 原地更新端点位置（长度变化时重建 attribute）。
   * @param positions - 新端点
   */
  updateLineHeads(positions: any[]): void {
    const flat = positions.map((p: any) => [p.x, p.y, p.z]).flat();
    const geometry = this.lineHeadMeshes[0].geometry;
    const attr = geometry.getAttribute("position");
    if (attr.array.length !== flat.length) {
      geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(flat), 3));
    } else {
      const arr: any = attr.array;
      for (let i = 0, n = arr.length; i < n; i++) {
        arr[i] = flat[i];
      }
      attr.needsUpdate = true;
    }
  }

  /** 释放线与点资源。 */
  dispose(): void {
    [this.fgLineMesh, this.bgLineMesh].forEach((mesh: any) => {
      if (mesh) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    });
    this.lineHeadMeshes?.forEach((m) => m.geometry.dispose());
    this.lineHeadMaterial.dispose();
    this.lineHeadBgMaterial.dispose();
  }
}
