/**
 * TrailerSmokeFx — 拖车烟雾特效（SPE 粒子 + SHP 序列帧纹理）。
 *
 * 类级 textureCache 按 shpFile 缓存 Texture；create3DObject 构建
 * SPE.Group（帧序列）与 Emitter；update 用游戏速度缩放 tick，支持
 * finishAndRemove 在下一帧把 lifetime 锁定为「已过秒数 + 粒子最大年龄」。
 *
 * 由 engine/renderable/fx/TrailerSmokeFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { AnimProps } from "engine/AnimProps"; // 已转换
import * as ImageUtilsModule from "engine/gfx/ImageUtils"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

/** SPE 粒子引擎为 vendor 全局。 */
declare const SPE: any;

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ImageUtils: any = (ImageUtilsModule as any).ImageUtils;

/** 发射器粒子数上限。 */
const MAX_PARTICLE_COUNT = 1000;
/** 粒子组容量上限。 */
const GROUP_MAX_PARTICLE_COUNT = 1000;

/**
 * 拖车烟雾特效。
 * 与 DamageSmokeFx 类似，但纹理可被多个烟雾实例共享缓存。
 */
export class TrailerSmokeFx {
  /** 按 shpFile 缓存的纹理。 */
  static textureCache = new Map<any, any>();

  /** 清空并 dispose 全部缓存纹理（场景切换时调用）。 */
  static clearTextureCache(): void {
    TrailerSmokeFx.textureCache.forEach((tex) => tex.dispose());
    TrailerSmokeFx.textureCache.clear();
  }

  /** 烟雾发射点（世界坐标，随载体移动）。 */
  pos: any;
  /** 发射间隔帧数（用于换算 activeMultiplier）。 */
  spawnDelayFrames: number;
  /** 烟雾 art 规则（含 art / translucent / translucency）。 */
  smokeArt: any;
  /** 烟雾 SHP 文件。 */
  shpFile: any;
  /** 调色板。 */
  palette: any;
  /** 游戏速度（读 value）。 */
  gameSpeed: any;

  /** 寿命（秒）；初始 +∞，finish 处理后锁定。 */
  lifetimeSeconds: number = Number.POSITIVE_INFINITY;
  /** 请求结束（finishAndRemove 置位）。 */
  finishRequested: boolean = false;
  /** finish 是否已处理（只处理一次）。 */
  finishProcessed: boolean = false;

  /** 所属容器。 */
  container: any;
  /** 粒子组。 */
  particleGroup: any;
  /** 粒子发射器。 */
  particleEmitter: any;
  /** 粒子最大年龄（秒，= numImages/rate）。 */
  particleMaxAge: number | undefined;
  /** 首次 update 时间戳。 */
  firstUpdateMillis: number | undefined;
  /** 上次 update 时间戳。 */
  lastUpdateMillis: number | undefined;
  /** 剩余寿命比例。 */
  timeLeft: number | undefined;

  /**
   * @param pos - 发射点
   * @param spawnDelayFrames - 发射间隔帧数
   * @param smokeArt - 烟雾 art 规则
   * @param shpFile - SHP 资源
   * @param palette - 调色板
   * @param gameSpeed - 游戏速度
   */
  constructor(
    pos: any,
    spawnDelayFrames: number,
    smokeArt: any,
    shpFile: any,
    palette: any,
    gameSpeed: any,
  ) {
    this.pos = pos;
    this.spawnDelayFrames = spawnDelayFrames;
    this.smokeArt = smokeArt;
    this.shpFile = shpFile;
    this.palette = palette;
    this.gameSpeed = gameSpeed;
  }

  /** 注入容器。 */
  setContainer(container: any): void {
    this.container = container;
  }

  /** 惰性创建纹理缓存条目与 SPE 粒子组/发射器。 */
  create3DObject(): void {
    if (!this.particleGroup) {
      let tex = TrailerSmokeFx.textureCache.get(this.shpFile);
      if (!tex) {
        const canvas: any = ImageUtils.convertShpToCanvas(this.shpFile, this.palette, true);
        tex = new THREE.Texture(canvas);
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.needsUpdate = true;
        tex.flipY = true;
        TrailerSmokeFx.textureCache.set(this.shpFile, tex);
      }
      this.particleGroup = new SPE.Group({
        texture: {
          value: tex,
          frames: new THREE.Vector2(this.shpFile.numImages, 1),
          frameCount: this.shpFile.numImages,
          loop: 1,
        },
        maxParticleCount: GROUP_MAX_PARTICLE_COUNT,
        hasPerspective: false,
        transparent: true,
        alphaTest: 0,
        blending: THREE.NormalBlending,
      });
      this.particleGroup.mesh.name = "fx_trailer_smoke";
      this.particleGroup.mesh.frustumCulled = false;

      const props = new AnimProps(this.smokeArt.art, this.shpFile);
      // Normalized art 播速加倍；再按发射间隔折算每秒发射节奏
      let rate = ((this.smokeArt.art.getBool("Normalized") ? 2 : 1) * props.rate) / this.spawnDelayFrames;
      const maxAge = (this.particleMaxAge = this.shpFile.numImages / props.rate);
      const emitter = (this.particleEmitter = new SPE.Emitter({
        particleCount: MAX_PARTICLE_COUNT,
        maxAge: { value: maxAge },
        activeMultiplier: rate / (MAX_PARTICLE_COUNT / maxAge),
        position: { value: this.pos },
        acceleration: { value: new THREE.Vector3() },
        velocity: { value: new THREE.Vector3() },
        opacity: { value: this.smokeArt.translucent ? [1, 0] : 1 - this.smokeArt.translucency },
        size: { value: Math.max(this.shpFile.height, this.shpFile.width) },
      }));
      this.particleGroup.addEmitter(emitter);
    }
  }

  /** 当前粒子网格。 */
  get3DObject(): any {
    return this.particleGroup?.mesh;
  }

  /**
   * 推进粒子；处理 finish 请求锁定 lifetime。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    // 发射点每帧同步（载体移动）
    this.particleEmitter.position.value = this.pos;
    let dt: number;
    if (this.lastUpdateMillis) {
      dt = now - this.lastUpdateMillis;
      this.particleGroup.tick((dt / 1000) * this.gameSpeed.value);
    } else {
      this.firstUpdateMillis = now;
      this.particleGroup.tick(0);
    }
    this.lastUpdateMillis = now;

    if (this.finishRequested) {
      this.finishRequested = false;
      if (!this.finishProcessed) {
        this.finishProcessed = true;
        const elapsedSec = ((now - this.firstUpdateMillis!) / 1000) * this.gameSpeed.value;
        this.lifetimeSeconds = elapsedSec + this.particleMaxAge!;
      }
      if (this.particleEmitter.alive) {
        this.particleEmitter.disable();
      }
    }

    this.timeLeft = Math.max(
      0,
      1 - (now - this.firstUpdateMillis!) / ((1000 * this.lifetimeSeconds) / this.gameSpeed.value),
    );
    if (!this.timeLeft) {
      this.container.remove(this);
      this.dispose();
    }
  }

  /** 请求在当前粒子播完后移除。 */
  finishAndRemove(): void {
    this.finishRequested = true;
  }

  /** 立即停止发射。 */
  disable(): void {
    this.particleEmitter.disable();
  }

  /** 恢复发射。 */
  enable(): void {
    this.particleEmitter.enable();
  }

  /** 释放粒子网格资源。 */
  dispose(): void {
    this.particleGroup?.mesh.geometry.dispose();
    this.particleGroup?.mesh.material.dispose();
  }
}
