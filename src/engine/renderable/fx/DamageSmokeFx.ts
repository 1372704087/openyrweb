/**
 * DamageSmokeFx — 受损冒烟特效（SPE 粒子，随物体移动）。
 *
 * 类级 textureCache 按 shpFile 缓存 Texture（flipY=false）；发射器
 * position 每帧跟随 gameObject.position + rules.damageSmokeOffset；
 * finishAndRemove 在 alive 时锁定 lifetime 并 disable 发射器。
 *
 * 由 engine/renderable/fx/DamageSmokeFx.ts.js 重写为 TS（行为完全一致）。
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
 * 受损冒烟特效。
 * lifetime 默认 +∞，finish 后锁定为 elapsed + particleMaxAge。
 */
export class DamageSmokeFx {
  /** 按 shpFile 缓存的纹理。 */
  static textureCache = new Map<any, any>();

  /** 清空并 dispose 全部缓存纹理。 */
  static clearTextureCache(): void {
    DamageSmokeFx.textureCache.forEach((tex) => tex.dispose());
    DamageSmokeFx.textureCache.clear();
  }

  /** 所属游戏对象（读取位置与 offset）。 */
  gameObject: any;
  /** 冒烟 art 规则。 */
  smokeArt: any;
  /** 烟雾 SHP。 */
  shpFile: any;
  /** 调色板。 */
  palette: any;
  /** 游戏速度。 */
  gameSpeed: any;

  /** 寿命（秒）。 */
  lifetimeSeconds: number = Number.POSITIVE_INFINITY;
  /** 请求结束。 */
  finishRequested: boolean = false;

  /** 容器。 */
  container: any;
  /** 粒子组。 */
  particleGroup: any;
  /** 发射器。 */
  particleEmitter: any;
  /** 粒子最大年龄（秒）。 */
  particleMaxAge: number | undefined;
  /** 首次 update 时间戳。 */
  firstUpdateMillis: number | undefined;
  /** 上次 update 时间戳。 */
  lastUpdateMillis: number | undefined;
  /** 剩余寿命比例。 */
  timeLeft: number | undefined;

  /**
   * @param gameObject - 冒烟宿主对象
   * @param smokeArt - 冒烟 art
   * @param shpFile - SHP
   * @param palette - 调色板
   * @param gameSpeed - 游戏速度
   */
  constructor(gameObject: any, smokeArt: any, shpFile: any, palette: any, gameSpeed: any) {
    this.gameObject = gameObject;
    this.smokeArt = smokeArt;
    this.shpFile = shpFile;
    this.palette = palette;
    this.gameSpeed = gameSpeed;
  }

  /** 注入容器。 */
  setContainer(container: any): void {
    this.container = container;
  }

  /** 惰性创建纹理/粒子组/发射器。 */
  create3DObject(): void {
    if (!this.particleGroup) {
      let tex = DamageSmokeFx.textureCache.get(this.shpFile);
      if (!tex) {
        const canvas: any = ImageUtils.convertShpToCanvas(this.shpFile, this.palette, true);
        tex = new THREE.Texture(canvas);
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.needsUpdate = true;
        tex.flipY = false;
        DamageSmokeFx.textureCache.set(this.shpFile, tex);
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
      this.particleGroup.mesh.name = "fx_damage_smoke";
      this.particleGroup.mesh.frustumCulled = false;

      const props = new AnimProps(this.smokeArt.art, this.shpFile);
      // Normalized 播速加倍；r=发射节奏/10 作为 activeMultiplier 基数
      let emitRate = (this.smokeArt.art.getBool("Normalized") ? 2 : 1) * props.rate;
      const activeMultBase = emitRate / 10;
      const maxAge = (this.particleMaxAge = (2 * this.shpFile.numImages) / props.rate);
      const upSpeed = 9 * emitRate;
      const downAccel = 0.05 * emitRate;
      const emitter = (this.particleEmitter = new SPE.Emitter({
        particleCount: MAX_PARTICLE_COUNT,
        maxAge: { value: maxAge },
        activeMultiplier: activeMultBase / (MAX_PARTICLE_COUNT / maxAge),
        position: { value: this.computeEmitterPosition() },
        acceleration: { value: new THREE.Vector3(0, -downAccel, 0), spread: new THREE.Vector3(2, 0, 2) },
        velocity: { value: new THREE.Vector3(0, upSpeed, 0), spread: new THREE.Vector3(0.1 * upSpeed, 0, 0.1 * upSpeed) },
        opacity: { value: 0.5 },
        size: { value: Math.max(this.shpFile.height, this.shpFile.width) },
      }));
      this.particleGroup.addEmitter(emitter);
    }
  }

  /** 发射点 = 世界位置 + damageSmokeOffset。 */
  computeEmitterPosition(): any {
    return this.gameObject.position.worldPosition.clone().add(this.gameObject.rules.damageSmokeOffset);
  }

  /** 当前粒子网格。 */
  get3DObject(): any {
    return this.particleGroup?.mesh;
  }

  /**
   * 推进粒子；处理 finish 锁定 lifetime。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    this.particleEmitter.position.value = this.computeEmitterPosition();
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
      if (this.particleEmitter.alive) {
        const elapsedSec = ((now - this.firstUpdateMillis!) / 1000) * this.gameSpeed.value;
        this.lifetimeSeconds = elapsedSec + this.particleMaxAge!;
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

  /** 请求结束（下一帧锁定 lifetime 并停发）。 */
  finishAndRemove(): void {
    this.finishRequested = true;
  }

  /** 释放粒子网格资源。 */
  dispose(): void {
    this.particleGroup?.mesh.geometry.dispose();
    this.particleGroup?.mesh.material.dispose();
  }
}
