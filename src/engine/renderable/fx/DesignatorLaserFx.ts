/**
 * DesignatorLaserFx — 空袭激光指示器特效（持续抖动红线）。
 *
 * 模拟原版 YR 空袭指示激光：每帧根据 source/target 更新 MeshLine 两端，
 * 叠加沿光束的慢椭圆摆动与高频微颤；颜色在暗红(0.75,0,0)与亮红(1,0,0)
 * 之间以 2Hz 正弦插值闪烁；resolution 随相机同步。
 *
 * 由 engine/renderable/fx/DesignatorLaserFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as MeshLineModule from "three.meshline"; // 孪生
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const MeshLineNS: any = MeshLineModule as any;

/** 预分配颜色暂存（lerp/闪烁，避免每帧 new Color）。 */
const _scratchColor = new THREE.Color();

/**
 * 空袭激光指示线。
 * 持续存在直至 remove/dispose，无自然寿命。
 */
export class DesignatorLaserFx {
  /** 相机。 */
  camera: any;
  /** 起点（单位 FLH，每帧读）。 */
  sourcePos: any;
  /** 终点（目标建筑，每帧读）。 */
  targetPos: any;
  /** 基准颜色。 */
  color: any;
  /** 线宽（固定 2）。 */
  lineWidth: number = 2;
  /** 暗态（亮度 ~190/255 → 0.75）。 */
  dimColor: any = new THREE.Color(0.75, 0, 0);
  /** 亮态纯红。 */
  brightColor: any = new THREE.Color(1, 0, 0);

  /** 可复用两点几何（原地改 vertex，无 GC）。 */
  _lineGeom: any = undefined;
  /** MeshLine 实例。 */
  _meshLine: any = undefined;

  /** 所属容器。 */
  container: any;
  /** 线网格。 */
  lineMesh: any;

  /**
   * @param camera - 相机
   * @param sourcePos - 起点（引用，随单位移动）
   * @param targetPos - 终点（引用，随目标移动）
   * @param color - 颜色
   */
  constructor(camera: any, sourcePos: any, targetPos: any, color: any) {
    this.camera = camera;
    this.sourcePos = sourcePos;
    this.targetPos = targetPos;
    this.color = color;
  }

  /** 注入容器。 */
  setContainer(container: any): void {
    this.container = container;
  }

  /** 当前线网格。 */
  get3DObject(): any {
    return this.lineMesh;
  }

  /** 惰性创建几何与 Mesh。 */
  create3DObject(): void {
    if (this.lineMesh) return;
    this._lineGeom = new THREE.Geometry();
    this._lineGeom.vertices.push(this.sourcePos.clone(), this.targetPos.clone());
    this._meshLine = new (MeshLineNS.MeshLine as any)();
    this._meshLine.setGeometry(this._lineGeom);
    this.lineMesh = new THREE.Mesh(this._meshLine.geometry, this.buildMaterial(this.color.clone()));
    this.lineMesh.name = "fx_designator_laser";
  }

  /**
   * 每帧：端点抖动 + 颜色闪烁 + resolution 同步。
   * @param now - 自创建起经过的毫秒
   */
  update(now: number): void {
    const src = this.sourcePos;
    const tgt = this.targetPos;
    // 毫秒 → 秒
    const t = now * 0.001;

    // 1) 沿光束方向的慢椭圆（1/3 Hz）
    const wobbleFreq = 1.0 / 3.0;
    const angle = t * Math.PI * 2 * wobbleFreq;
    // XZ 平面前向
    let fDx = tgt.x - src.x;
    let fDz = tgt.z - src.z;
    const fLen = Math.sqrt(fDx * fDx + fDz * fDz);
    if (fLen > 1e-6) {
      fDx /= fLen;
      fDz /= fLen;
    } else {
      fDx = 1;
      fDz = 0;
    }
    // 垂直方向
    const pDx = -fDz;
    const pDz = fDx;
    // 椭圆：长轴 15 垂直光束，短轴 5 沿光束（sin/cos 分量按孪生顺序）
    const ellLong = Math.sin(angle) * 5;
    const ellShort = Math.cos(angle) * 20;
    const ellX = ellLong * fDx + ellShort * pDx;
    const ellZ = ellLong * fDz + ellShort * pDz;

    // 2) 高频微颤（正弦梳，模拟手抖）
    const tremorX = Math.sin(t * 100) * 0.3 + Math.cos(t * 83) * 0.2;
    const tremorZ = Math.cos(t * 97) * 0.25 + Math.sin(t * 74) * 0.2;

    // 原地更新顶点
    this._lineGeom.vertices[0].copy(src);
    this._lineGeom.vertices[1].set(tgt.x + ellX + tremorX, tgt.y, tgt.z + ellZ + tremorZ);
    this._meshLine.setGeometry(this._lineGeom);
    this.lineMesh.geometry = this._meshLine.geometry;

    // 3) 颜色 2Hz 闪烁
    const flicker = 0.5 + 0.5 * Math.sin(t * Math.PI * 4);
    _scratchColor.copy(this.dimColor).lerp(this.brightColor, flicker);
    this.lineMesh.material.uniforms.color.value = _scratchColor;

    // 4) 相机 resolution 同步
    const cam = this.camera;
    const top = cam.top;
    const ratio = cam.right / cam.top;
    const r = (2 * top) / Math.cos(cam.rotation.y);
    this.lineMesh.material.uniforms.resolution.value
      .set(r * ratio, r)
      .multiplyScalar((top * Math.cos(cam.rotation.x)) / Coords.ISO_WORLD_SCALE);
  }

  /**
   * 构建 MeshLineMaterial（透明、无 depthTest、NormalBlending、opacity 0.8）。
   * @param color - 颜色
   */
  buildMaterial(color: any): any {
    const top = this.camera.top;
    const ratio = this.camera.right / this.camera.top;
    const r = (2 * top) / Math.cos(this.camera.rotation.y);
    return new (MeshLineNS.MeshLineMaterial as any)({
      color,
      lineWidth: this.lineWidth,
      resolution: new THREE.Vector2(r * ratio, r).multiplyScalar(
        (top * Math.cos(this.camera.rotation.x)) / Coords.ISO_WORLD_SCALE,
      ),
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: 0,
      depthTest: false,
      blending: THREE.NormalBlending,
    });
  }

  /** 从容器移除（容器可能尚未注入）。 */
  remove(): void {
    if (this.container) {
      this.container.remove(this);
    }
  }

  /** 释放网格资源。 */
  dispose(): void {
    if (this.lineMesh) {
      this.lineMesh.geometry.dispose();
      this.lineMesh.material.dispose();
    }
  }
}
