/**
 * RallyPointFx — 集结点虚线特效（主线 + 阴影偏移线，dash 滚动）。
 *
 * 双 MeshLine：主线与向相机偏移 ISO_WORLD_SCALE 的阴影线。needsUpdate
 * 时重建几何/颜色/dashArray；每帧 dashOffset 按 120Hz 归一化步长滚动。
 * 相机 top/right 变化时刷新 resolution uniform。
 *
 * 由 engine/renderable/fx/RallyPointFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as MeshLineModule from "three.meshline"; // 孪生
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const MeshLineNS: any = MeshLineModule as any;

/**
 * 集结点虚线。
 * 独立于容器逐帧驱动 needsUpdate / visible。
 */
export class RallyPointFx {
  /** 相机。 */
  camera: any;
  /** 起点（通常为单位位置）。 */
  sourcePos: any;
  /** 终点（集结点）。 */
  targetPos: any;
  /** 主线颜色。 */
  color: any;
  /** 渲染顺序（undefined 时 depthTest=true）。 */
  renderOrder: any;

  /** 下一帧是否重建几何/材质参数。 */
  needsUpdate: boolean = false;
  /** 是否可见（同步到 wrapper.visible）。 */
  visible: boolean = true;

  /** 所属容器。 */
  container: any;
  /** 外层 Object3D。 */
  wrapper: any;
  /** 主线网格。 */
  lineMesh: any;
  /** 阴影线网格。 */
  shadowLineMesh: any;
  /** 上次 update 时间戳。 */
  lastUpdateMillis: number | undefined;
  /** 相机尺寸指纹（top_right），变化时刷新 resolution。 */
  cameraHash: string;

  /**
   * @param camera - 相机
   * @param sourcePos - 起点
   * @param targetPos - 终点
   * @param color - 颜色
   * @param renderOrder - 渲染顺序（可选）
   */
  constructor(camera: any, sourcePos: any, targetPos: any, color: any, renderOrder: any) {
    this.camera = camera;
    this.sourcePos = sourcePos;
    this.targetPos = targetPos;
    this.color = color;
    this.renderOrder = renderOrder;
    this.cameraHash = this.camera.top + "_" + this.camera.right;
  }

  /** 注入容器。 */
  setContainer(container: any): void {
    this.container = container;
  }

  /** 外层 wrapper。 */
  get3DObject(): any {
    return this.wrapper;
  }

  /** 惰性创建 wrapper + 主线 + 阴影线。 */
  create3DObject(): void {
    if (!this.wrapper) {
      this.wrapper = new THREE.Object3D();
      this.wrapper.matrixAutoUpdate = false;
      this.lineMesh = this.createLineMesh();
      this.lineMesh.name = "fx_rallypoint";
      this.lineMesh.matrixAutoUpdate = false;
      this.shadowLineMesh = this.createLineShadowMesh();
      this.shadowLineMesh.name = "fx_rallypoint_shadow";
      this.shadowLineMesh.matrixAutoUpdate = false;
      this.wrapper.add(this.lineMesh);
      this.wrapper.add(this.shadowLineMesh);
    }
  }

  /**
   * 每帧：同步可见性、相机 resolution、可选重建、滚动 dash。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    if (!this.lastUpdateMillis) {
      this.lastUpdateMillis = now;
    }
    // 归一化到 120Hz 步长
    const step = (now - this.lastUpdateMillis) / (1000 / 120);
    this.lastUpdateMillis = now;
    this.wrapper.visible = this.visible;

    const hash = this.camera.top + "_" + this.camera.right;
    if (hash !== this.cameraHash) {
      this.cameraHash = hash;
      [this.lineMesh, this.shadowLineMesh].forEach((mesh: any) => {
        mesh.material.uniforms.resolution.value.copy(this.computeResolution(this.camera));
      });
    }

    if (this.needsUpdate) {
      this.needsUpdate = false;
      this.lineMesh.geometry = this.createLineGeometry(this.sourcePos, this.targetPos);
      this.shadowLineMesh.geometry = this.createShadowLineGeometry(this.sourcePos, this.targetPos);
      this.lineMesh.material.uniforms.color.value = this.color.clone();
      const dist = this.sourcePos.distanceTo(this.targetPos);
      [this.lineMesh, this.shadowLineMesh].forEach((mesh: any) => {
        const mat = mesh.material;
        mat.uniforms.dashArray.value = this.computeDashArray(dist);
        mat.depthTest = this.renderOrder === undefined;
      });
      this.lineMesh.renderOrder = this.renderOrder ?? 0;
      this.shadowLineMesh.renderOrder = this.renderOrder !== undefined ? this.renderOrder - 1 : 0;
    }

    [this.lineMesh, this.shadowLineMesh].forEach((mesh: any) => {
      const mat = mesh.material;
      mat.uniforms.dashOffset.value -= (mat.uniforms.dashArray.value / 50) * step;
    });
  }

  /** 创建主线 Mesh（可选设置 renderOrder）。 */
  createLineMesh(): any {
    const start = this.sourcePos.clone();
    const end = this.targetPos.clone();
    const mesh = new THREE.Mesh(
      this.createLineGeometry(start, end),
      this.createLineMaterial(this.color.clone(), start.distanceTo(end)),
    );
    if (this.renderOrder) {
      mesh.renderOrder = this.renderOrder;
    }
    return mesh;
  }

  /** 创建阴影线 Mesh（黑色，renderOrder-1）。 */
  createLineShadowMesh(): any {
    const mesh = new THREE.Mesh(
      this.createShadowLineGeometry(this.sourcePos, this.targetPos),
      this.createLineMaterial(new THREE.Color(0), this.sourcePos.distanceTo(this.targetPos)),
    );
    if (this.renderOrder) {
      mesh.renderOrder = this.renderOrder - 1;
    }
    return mesh;
  }

  /**
   * 阴影线几何：起终点沿相机前方偏移 ISO_WORLD_SCALE。
   * @param from - 起点
   * @param to - 终点
   */
  createShadowLineGeometry(from: any, to: any): any {
    const offset = new THREE.Vector3(+Coords.ISO_WORLD_SCALE, 0, +Coords.ISO_WORLD_SCALE);
    return this.createLineGeometry(from.clone().add(offset), to.clone().add(offset));
  }

  /**
   * MeshLine 几何（两点线段）。
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
   * MeshLine 材质（虚线 + 分辨率）。
   * @param color - 颜色
   * @param dist - 起终点距离（用于 dashArray）
   */
  createLineMaterial(color: any, dist: number): any {
    return new (MeshLineNS.MeshLineMaterial as any)({
      color,
      lineWidth: 2,
      resolution: this.computeResolution(this.camera),
      transparent: true,
      sizeAttenuation: 0,
      dashArray: this.computeDashArray(dist),
      depthTest: this.renderOrder === undefined,
    });
  }

  /**
   * 虚线周期：短距拉满，长距按 5/len 收缩，再乘世界缩放。
   * @param dist - 线段长度
   */
  computeDashArray(dist: number): number {
    return Math.min(1, 5 / dist) * Coords.ISO_WORLD_SCALE;
  }

  /**
   * 按正交相机参数计算 MeshLine resolution。
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

  /** 从容器移除自身。 */
  remove(): void {
    this.container.remove(this);
  }

  /** 释放主线与阴影线资源。 */
  dispose(): void {
    if (this.wrapper) {
      [this.lineMesh, this.shadowLineMesh].forEach((mesh: any) => {
        if (mesh) {
          mesh.geometry.dispose();
          mesh.material.dispose();
        }
      });
    }
  }
}
