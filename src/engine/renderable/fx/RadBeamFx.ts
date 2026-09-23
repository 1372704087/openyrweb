/**
 * RadBeamFx — 辐射光束特效（MeshLine 弧形波，振幅随寿命增长）。
 *
 * timeLeft 从 1 衰减到 0；振幅 = truncToDecimals((LEPTONS/6)*(1-timeLeft),1)，
 * 变化时重建折线几何。光线用 MeshLine 材质，resolution 按正交相机换算。
 *
 * 由 engine/renderable/fx/RadBeamFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as MeshLineModule from "three.meshline"; // 孪生
import { Coords } from "game/Coords"; // 已转换
import * as mathUtil from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const MeshLineNS: any = MeshLineModule as any;
const truncToDecimals: (n: number, d: number) => number = (mathUtil as any).truncToDecimals;

/**
 * 辐射光束。
 * 振幅随寿命增大，形成逐渐起伏的弧线。
 */
export class RadBeamFx {
  /** 相机。 */
  camera: any;
  /** 起点。 */
  sourcePos: any;
  /** 终点。 */
  targetPos: any;
  /** 颜色。 */
  color: any;
  /** 持续秒数。 */
  durationSeconds: number;
  /** 线宽。 */
  width: any;
  /** 当前弧线振幅（lepton）。 */
  amplitude: number = 0;

  /** 容器。 */
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
   * @param durationSeconds - 时长
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
      this.lineMesh.name = "fx_radbeam";
    }
  }

  /**
   * 推进寿命并按需重建振幅。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    if (!this.firstUpdateMillis) {
      this.firstUpdateMillis = now;
    }
    this.timeLeft = Math.max(0, 1 - (now - this.firstUpdateMillis) / (1000 * this.durationSeconds));
    // 振幅随寿命剩余减少而增大（保留 1 位小数）
    const amp = truncToDecimals((Coords.LEPTONS_PER_TILE / 6) * (1 - this.timeLeft), 1);
    if (amp !== this.amplitude) {
      this.amplitude = amp;
      this.lineMesh.geometry.dispose();
      this.lineMesh.geometry = this.createLineGeometry(this.sourcePos, this.targetPos, amp);
    }
    if (this.isFinished()) {
      this.container.remove(this);
      this.dispose();
    }
  }

  /** 构建 Mesh + MeshLineMaterial。 */
  createObject(): any {
    const start = this.sourcePos.clone();
    const end = this.targetPos.clone();
    const geometry = this.createLineGeometry(start, end, this.amplitude);

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
    });
    return new THREE.Mesh(geometry, material);
  }

  /**
   * 生成带 sin 扰动的折线 MeshLine 几何。
   * @param from - 起点
   * @param to - 终点
   * @param amp - 振幅
   */
  createLineGeometry(from: any, to: any, amp: number): any {
    const points: number[] = [];
    const lenTiles = to.clone().sub(from).length() / Coords.LEPTONS_PER_TILE;
    const segs = 15 * lenTiles;
    const tmp = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      tmp.lerpVectors(from, to, t);
      tmp.y += amp * Math.sin(t * lenTiles * (Coords.LEPTONS_PER_TILE / Math.PI));
      points.push(tmp.x, tmp.y, tmp.z);
    }
    const meshLine = new (MeshLineNS.MeshLine as any)();
    meshLine.setGeometry(points);
    return meshLine.geometry;
  }

  /** timeLeft 是否归零。 */
  isFinished(): boolean {
    return this.timeLeft === 0;
  }

  /** 释放资源。 */
  dispose(): void {
    if (this.lineMesh) {
      this.lineMesh.geometry.dispose();
      this.lineMesh.material.dispose();
    }
  }
}
