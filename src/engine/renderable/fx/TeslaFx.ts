/**
 * TeslaFx — 特斯拉电弧特效（THREE.LightningStrike 三道）。
 *
 * 主色两道 + 副色一道；update 按秒驱动 bolt.update(t)，寿命结束后
 * 从容器移除并 dispose 全部 Mesh。创建失败仅 console.warn。
 *
 * 由 engine/renderable/fx/TeslaFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 特斯拉电弧。
 * 三道闪电：[primary, primary, secondary]。
 */
export class TeslaFx {
  /** 起点。 */
  sourcePos: any;
  /** 终点。 */
  targetPos: any;
  /** 主色。 */
  primaryColor: any;
  /** 副色。 */
  secondaryColor: any;
  /** 持续秒数。 */
  durationSeconds: number;
  /** LightningStrike 实例列表。 */
  bolts: any[] = [];
  /** 对应 Mesh 列表。 */
  boltMeshes: any[] = [];

  /** 容器。 */
  container: any;
  /** 外层 Object3D。 */
  target: any;
  /** 首次 update 时间戳。 */
  firstUpdateMillis: number | undefined;
  /** 剩余寿命比例。 */
  timeLeft: number | undefined;

  /**
   * @param sourcePos - 起点
   * @param targetPos - 终点
   * @param primaryColor - 主色
   * @param secondaryColor - 副色
   * @param durationSeconds - 时长
   */
  constructor(
    sourcePos: any,
    targetPos: any,
    primaryColor: any,
    secondaryColor: any,
    durationSeconds: number,
  ) {
    this.sourcePos = sourcePos;
    this.targetPos = targetPos;
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;
    this.durationSeconds = durationSeconds;
  }

  /** 注入容器。 */
  setContainer(container: any): void {
    this.container = container;
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建三道闪电。 */
  create3DObject(): void {
    if (!this.target) {
      this.target = new THREE.Object3D();
      this.target.name = "fx_tesla";
      const primaryHex = this.primaryColor.getHex();
      const colors = [primaryHex, primaryHex, this.secondaryColor.getHex()];
      colors.forEach((hex) => {
        try {
          const { mesh, bolt } = this.createBolt(hex);
          this.boltMeshes.push(mesh);
          this.bolts.push(bolt);
          this.target.add(mesh);
        } catch (e) {
          console.warn("Couldn't create lightning FX", [e]);
        }
      });
    }
  }

  /**
   * 推进寿命并驱动各 bolt。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    if (!this.firstUpdateMillis) {
      this.firstUpdateMillis = now;
    }
    const elapsedSec = (now - this.firstUpdateMillis) / 1000;
    this.timeLeft = Math.max(0, 1 - elapsedSec / this.durationSeconds);
    try {
      this.bolts.forEach((bolt) => bolt.update(elapsedSec));
    } catch (e) {
      console.warn("Couldn't update lightning FX", [e]);
    }
    if (this.isFinished()) {
      this.container.remove(this);
      this.dispose();
    }
  }

  /**
   * 创建一道 LightningStrike 与其 Mesh。
   * @param colorHex - 颜色（hex number）
   */
  createBolt(colorHex: number): { mesh: any; bolt: any } {
    const source = this.sourcePos.clone();
    const dest = this.targetPos.clone();
    const bolt = new (THREE as any).LightningStrike({
      sourceOffset: source,
      destOffset: dest,
      radius0: 0.3 * Coords.ISO_WORLD_SCALE,
      radius1: 0.3 * Coords.ISO_WORLD_SCALE,
      isEternal: true,
      timeScale: 2,
      propagationTimeFactor: 0.05,
      vanishingTimeFactor: 0.95,
      ramification: 0,
      roughness: 0.85,
      straightness: 0.7,
    });
    const material = new THREE.MeshBasicMaterial({ color: colorHex });
    return { mesh: new THREE.Mesh(bolt, material), bolt };
  }

  /** 是否结束。 */
  isFinished(): boolean {
    return this.timeLeft === 0;
  }

  /** 释放全部 Mesh。 */
  dispose(): void {
    this.boltMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
  }
}
