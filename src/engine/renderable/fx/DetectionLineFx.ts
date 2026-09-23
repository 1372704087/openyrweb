/**
 * DetectionLineFx — 侦测连线特效（虚线 + 两端方块头 + 呼吸色）。
 *
 * 主线 MeshLine 带 dashArray/dashOffset 滚动；两端 PlaneGeometry 方块头
 * 跟随端点；颜色每秒在原色与白色间正弦呼吸；相机尺寸变化时刷新 resolution。
 *
 * 由 engine/renderable/fx/DetectionLineFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as MeshLineModule from "three.meshline"; // 孪生
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const MeshLineNS: any = MeshLineModule as any;

/** 呼吸色插值目标：纯白。 */
const WHITE = new THREE.Color(16777215);

/**
 * 侦测连线。
 * needsUpdate 置位后重建几何并同步两端方块头位置。
 */
export class DetectionLineFx {
  /** 相机。 */
  camera: any;
  /** 起点。 */
  sourcePos: any;
  /** 终点。 */
  targetPos: any;
  /** 基准颜色。 */
  color: any;
  /** 渲染顺序。 */
  renderOrder: any;

  /** 是否需要重建几何。 */
  needsUpdate: boolean = false;
  /** 相机尺寸指纹。 */
  cameraHash: string;
  /** 当前计算色（原色 ↔ 白 插值缓冲）。 */
  computedColor: any;
  /** 端块共享材质（每实例独立）。 */
  lineHeadMaterial: any;

  /** 容器。 */
  container: any;
  /** 外层 wrapper。 */
  wrapper: any;
  /** 主线网格。 */
  lineMesh: any;
  /** 起点方块头。 */
  srcLineHead: any;
  /** 终点方块头。 */
  destLineHead: any;
  /** 上次 update 时间戳。 */
  lastUpdateMillis: number | undefined;

  /** 类级共享端块几何（3×世界单位正方形）。 */
  static lineHeadGeometry: any;

  /**
   * @param camera - 相机
   * @param sourcePos - 起点
   * @param targetPos - 终点
   * @param color - 颜色
   * @param renderOrder - 渲染顺序
   */
  constructor(camera: any, sourcePos: any, targetPos: any, color: any, renderOrder: any) {
    this.camera = camera;
    this.sourcePos = sourcePos;
    this.targetPos = targetPos;
    this.color = color;
    this.renderOrder = renderOrder;
    this.cameraHash = this.camera.top + "_" + this.camera.right;
    this.computedColor = color;
    this.lineHeadMaterial = new THREE.MeshBasicMaterial({
      color: 16777215,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }

  /** 注入容器。 */
  setContainer(container: any): void {
    this.container = container;
  }

  /** 外层 wrapper。 */
  get3DObject(): any {
    return this.wrapper;
  }

  /** 惰性创建 wrapper、主线、两端方块头。 */
  create3DObject(): void {
    if (!this.wrapper) {
      this.wrapper = new THREE.Object3D();
      this.wrapper.name = "fx_detectionline";
      this.lineMesh = this.createLineMesh();
      this.srcLineHead = this.createLineHead();
      this.destLineHead = this.createLineHead();
      this.wrapper.add(this.srcLineHead);
      this.wrapper.add(this.destLineHead);
      this.wrapper.add(this.lineMesh);
      this.needsUpdate = true;
    }
  }

  /**
   * 每帧：dash 滚动、可选重建、呼吸色。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    if (!this.lastUpdateMillis) {
      this.lastUpdateMillis = now;
    }
    // 归一化到 120Hz 步长
    let step = (now - this.lastUpdateMillis) / (1000 / 120);
    this.lastUpdateMillis = now;

    const hash = this.camera.top + "_" + this.camera.right;
    if (hash !== this.cameraHash) {
      this.cameraHash = hash;
      this.lineMesh.material.uniforms.resolution.value.copy(this.computeResolution(this.camera));
    }

    let mat = this.lineMesh.material;
    if (this.needsUpdate) {
      this.needsUpdate = false;
      this.lineMesh.geometry.dispose();
      this.lineMesh.geometry = this.createLineGeometry(this.sourcePos, this.targetPos);
      const dist = this.sourcePos.distanceTo(this.targetPos);
      mat.uniforms.dashArray.value = this.computeDashArray(dist);
      this.srcLineHead.position.copy(this.sourcePos);
      this.destLineHead.position.copy(this.targetPos);
    }
    mat.uniforms.dashOffset.value -= (mat.uniforms.dashArray.value / 50) * step;

    // 呼吸：1 秒周期正弦，在原色与白之间插值
    const breathe = Math.sin(((now % 1000) / 1000) * Math.PI);
    const cur = this.computedColor.copy(this.color).lerp(WHITE, breathe);
    this.lineMesh.material.uniforms.color.value = cur.clone();
    this.lineHeadMaterial.color.set(cur);
  }

  /** 创建主线 Mesh（设置 renderOrder）。 */
  createLineMesh(): any {
    const start = this.sourcePos.clone();
    const end = this.targetPos.clone();
    const mesh = new THREE.Mesh(
      this.createLineGeometry(start, end),
      this.createLineMaterial(this.color.clone(), start.distanceTo(end)),
    );
    mesh.renderOrder = this.renderOrder;
    return mesh;
  }

  /**
   * MeshLine 两点几何。
   * @param from - 起点
   * @param to - 终点
   */
  createLineGeometry(from: any, to: any): any {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(from, to);
    const meshLine = new (MeshLineNS.MeshLine as any)();
    meshLine.setGeometry(geometry);
    return meshLine.geometry;
  }

  /**
   * 虚线材质（width=1，无 depthTest）。
   * @param color - 颜色
   * @param dist - 线长
   */
  createLineMaterial(color: any, dist: number): any {
    return new (MeshLineNS.MeshLineMaterial as any)({
      color,
      lineWidth: 1,
      resolution: this.computeResolution(this.camera),
      transparent: true,
      sizeAttenuation: 0,
      dashArray: this.computeDashArray(dist),
      depthTest: false,
    });
  }

  /** 创建一个朝向相机的端块 Mesh。 */
  createLineHead(): any {
    const mesh = new THREE.Mesh(DetectionLineFx.lineHeadGeometry, this.lineHeadMaterial);
    const quat = new THREE.Quaternion().setFromEuler(this.camera.rotation);
    mesh.setRotationFromQuaternion(quat);
    mesh.renderOrder = this.renderOrder;
    return mesh;
  }

  /**
   * dash 周期：min(1, 5/len) × 世界缩放。
   * @param dist - 线长
   */
  computeDashArray(dist: number): number {
    return Math.min(1, 5 / dist) * Coords.ISO_WORLD_SCALE;
  }

  /**
   * 相机分辨率 uniform。
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

  /** 从容器移除。 */
  remove(): void {
    this.container.remove(this);
  }

  /** 释放主线与端块材质。 */
  dispose(): void {
    if (this.wrapper) {
      this.lineMesh.geometry.dispose();
      this.lineMesh.material.dispose();
      this.lineHeadMaterial.dispose();
    }
  }
}

// 类级端块几何（孪生 execute 末尾初始化）
DetectionLineFx.lineHeadGeometry = new THREE.PlaneGeometry(
  3 * Coords.ISO_WORLD_SCALE,
  3 * Coords.ISO_WORLD_SCALE,
);
