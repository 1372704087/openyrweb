/**
 * LaserFx — 短时激光射线特效（three.meshline + 透明度衰减）。
 *
 * 构造时缓存相机/起终点/颜色/时长/线宽；createObject 用 MeshLine 在
 * 起终点间画线，材质 resolution 按正交相机参数换算；update 用
 * firstUpdateMillis 推进 timeLeft∈[0,1]，归零后从容器移除并 dispose。
 *
 * 由 engine/renderable/fx/LaserFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as MeshLineModule from "three.meshline"; // 孪生
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const MeshLineNS: any = MeshLineModule as any;

/**
 * 短时激光射线。
 * timeLeft 从 1 线性衰减到 0，opacity 同步。
 */
export class LaserFx {
  /** 等轴测/正交相机。 */
  camera: any;
  /** 射线起点。 */
  sourcePos: any;
  /** 射线终点。 */
  targetPos: any;
  /** 颜色。 */
  color: any;
  /** 持续时长（现实秒）。 */
  durationSeconds: number;
  /** 线宽。 */
  width: any;

  /** 所属容器。 */
  container: any;
  /** 线网格。 */
  lineMesh: any;
  /** 首次 update 时间戳。 */
  firstUpdateMillis: number | undefined;
  /** 剩余寿命比例。 */
  timeLeft: number | undefined;

  /**
   * @param camera - 相机
   * @param sourcePos - 起点
   * @param targetPos - 终点
   * @param color - 颜色
   * @param durationSeconds - 持续秒数
   * @param width - 线宽
   */
  constructor(
    camera: any,
    sourcePos: any,
    targetPos: any,
    color: any,
    durationSeconds: number,
    width: any,
  ) {
    this.camera = camera;
    this.sourcePos = sourcePos;
    this.targetPos = targetPos;
    this.color = color;
    this.durationSeconds = durationSeconds;
    this.width = width;
  }

  /** 注入容器。 */
  setContainer(container: any): void {
    this.container = container;
  }

  /** 当前线网格。 */
  get3DObject(): any {
    return this.lineMesh;
  }

  /** 惰性创建线网格。 */
  create3DObject(): void {
    if (!this.lineMesh) {
      this.lineMesh = this.createObject();
      this.lineMesh.name = "fx_laser";
    }
  }

  /**
   * 按 elapsed 推进 timeLeft，并同步 material.opacity。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    if (!this.firstUpdateMillis) {
      this.firstUpdateMillis = now;
    }
    this.timeLeft = Math.max(0, 1 - (now - this.firstUpdateMillis) / (1000 * this.durationSeconds));
    this.lineMesh.material.uniforms.opacity.value = +this.timeLeft;
    if (this.isFinished()) {
      this.container.remove(this);
      this.dispose();
    }
  }

  /** 构建 MeshLine 几何与加法混合材质，返回 Mesh。 */
  createObject(): any {
    const start = this.sourcePos.clone();
    const end = this.targetPos.clone();
    const geometry = new THREE.Geometry();
    geometry.vertices.push(start, end);
    const meshLine = new (MeshLineNS.MeshLine as any)();
    meshLine.setGeometry(geometry);

    const top = this.camera.top;
    const ratio = this.camera.right / this.camera.top;
    const r = (2 * top) / Math.cos(this.camera.rotation.y);
    const width = r * ratio;
    const material = new (MeshLineNS.MeshLineMaterial as any)({
      color: this.color.clone(),
      lineWidth: this.width,
      resolution: new THREE.Vector2(width, r).multiplyScalar(
        (top * Math.cos(this.camera.rotation.x)) / Coords.ISO_WORLD_SCALE,
      ),
      transparent: true,
      sizeAttenuation: 0,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Mesh(meshLine.geometry, material);
  }

  /** timeLeft 是否已耗尽。 */
  isFinished(): boolean {
    return this.timeLeft === 0;
  }

  /** 释放几何与材质。 */
  dispose(): void {
    if (this.lineMesh) {
      this.lineMesh.geometry.dispose();
      this.lineMesh.material.dispose();
    }
  }
}
