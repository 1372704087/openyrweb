/**
 * SparkFx — 火花粒子特效（SPE 粒子群）。
 *
 * 构造时记录发射点、颜色、生成时长与游戏速度；create3DObject 惰性创建
 * 共享 1×1 白纹理与 SPE.Group/Emitter；update 按 dt×gameSpeed.tick 推进，
 * 超过 spawn 窗口后 disable 发射器，total 窗口耗尽则从容器移除并 dispose。
 *
 * 由 engine/renderable/fx/SparkFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** SPE 粒子引擎为 vendor 全局（vendor/lib/three/SPE.min.js）。 */
declare const SPE: any;

/** 火花发射器最大年龄（秒）。 */
const SPARK_MAX_AGE = 1;
/** 单次发射粒子数上限。 */
const MAX_PARTICLE_COUNT = 100;

/**
 * 火花粒子特效。
 * 首次 create3DObject 时构建 SPE 粒子群；update 驱动寿命倒计时。
 */
export class SparkFx {
  /** 发射中心（世界坐标）。 */
  pos: any;
  /** 火花颜色。 */
  color: any;
  /** 发射持续时长（现实秒，不含 SPARK_MAX_AGE）。 */
  spawnDurationSeconds: number;
  /** 游戏速度（读 value 倍率）。 */
  gameSpeed: any;
  /** 总寿命 = spawnDurationSeconds + SPARK_MAX_AGE。 */
  totalDurationSeconds: number;

  /** 所属特效容器（setContainer 注入）。 */
  container: any;
  /** 粒子组（惰性创建）。 */
  particleGroup: any;
  /** 粒子发射器（create3DObject 时赋值）。 */
  particleEmitter: any;
  /** 首次 update 的时间戳（ms）。 */
  firstUpdateMillis: number | undefined;
  /** 上一次 update 的时间戳（ms）。 */
  lastUpdateMillis: number | undefined;
  /** 剩余寿命比例 [0,1]，归零时移除。 */
  timeLeft: number | undefined;

  /** 共享 1×1 白纹理（类级缓存，避免重复 DataTexture）。 */
  static sparkTex: any;

  /**
   * @param pos - 发射中心世界坐标
   * @param color - 火花颜色
   * @param spawnDurationSeconds - 发射窗口（秒）
   * @param gameSpeed - 游戏速度对象（含 value）
   */
  constructor(pos: any, color: any, spawnDurationSeconds: number, gameSpeed: any) {
    this.pos = pos;
    this.color = color;
    this.spawnDurationSeconds = spawnDurationSeconds;
    this.gameSpeed = gameSpeed;
    this.totalDurationSeconds = spawnDurationSeconds + SPARK_MAX_AGE;
  }

  /** 注入特效容器。 */
  setContainer(container: any): void {
    this.container = container;
  }

  /** 惰性创建粒子组与发射器；确保类级纹理缓存存在。 */
  create3DObject(): void {
    if (!this.particleGroup) {
      if (!SparkFx.sparkTex) {
        SparkFx.sparkTex = new THREE.DataTexture(new Uint8Array(4).fill(255), 1, 1, THREE.RGBAFormat);
        SparkFx.sparkTex.needsUpdate = true;
      }
      this.particleGroup = new SPE.Group({
        texture: { value: SparkFx.sparkTex },
        maxParticleCount: MAX_PARTICLE_COUNT,
      });
      this.particleGroup.mesh.name = "fx_spark";
      this.particleGroup.mesh.frustumCulled = false;
      const emitter = (this.particleEmitter = new SPE.Emitter({
        maxAge: { value: SPARK_MAX_AGE },
        position: {
          value: this.pos,
          spread: new THREE.Vector3(10, 0, 10).multiplyScalar(Coords.ISO_WORLD_SCALE),
        },
        acceleration: {
          value: new THREE.Vector3(0, -50, 0).multiplyScalar(Coords.ISO_WORLD_SCALE),
          spread: new THREE.Vector3(0, 0, 0),
        },
        velocity: {
          value: new THREE.Vector3(0, 30, 0).multiplyScalar(Coords.ISO_WORLD_SCALE),
          spread: new THREE.Vector3(40, 5, 40).multiplyScalar(Coords.ISO_WORLD_SCALE),
        },
        color: { value: [this.color] },
        opacity: { value: [1, 0.5] },
        size: { value: 1 },
        particleCount: MAX_PARTICLE_COUNT,
      }));
      this.particleGroup.addEmitter(emitter);
    }
  }

  /** 当前粒子网格（未创建时 undefined）。 */
  get3DObject(): any {
    return this.particleGroup?.mesh;
  }

  /**
   * 推进粒子寿命。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    let dt: number;
    if (this.lastUpdateMillis) {
      dt = now - this.lastUpdateMillis;
      this.particleGroup.tick((dt / 1000) * this.gameSpeed.value);
    } else {
      this.firstUpdateMillis = now;
      this.particleGroup.tick(0);
    }
    this.lastUpdateMillis = now;
    // 发射窗口结束后关闭发射器
    if (
      this.particleEmitter.alive &&
      now - this.firstUpdateMillis! >= (1000 * this.spawnDurationSeconds) / this.gameSpeed.value
    ) {
      this.particleEmitter.disable();
    }
    // 总寿命倒计时（游戏速度缩放）
    this.timeLeft = Math.max(
      0,
      1 - (now - this.firstUpdateMillis!) / ((1000 * this.totalDurationSeconds) / this.gameSpeed.value),
    );
    if (!this.timeLeft) {
      this.container.remove(this);
      this.dispose();
    }
  }

  /** 释放粒子网格几何与材质。 */
  dispose(): void {
    this.particleGroup?.mesh.geometry.dispose();
    this.particleGroup?.mesh.material.dispose();
  }
}
