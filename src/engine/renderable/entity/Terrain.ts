/**
 * Terrain — 地形物件渲染（可含矿树生长动画与 alpha 阴影）。
 *
 * 构造时探测 TiberiumTreeTrait；createObjects 处理 alphaImage、
 * 批处理层或 ShpRenderable；矿树状态转为 Spawning 时 reset 动画，
 * 每帧 tick 并 setFrame。缺图仅 warn。
 *
 * 由 engine/renderable/entity/Terrain.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import { ImageFinder } from "engine/ImageFinder"; // 已转换
import * as DebugUtilsModule from "engine/gfx/DebugUtils"; // 孪生
import { MapSpriteTranslation } from "engine/renderable/MapSpriteTranslation"; // 已转换
import * as ShpRenderableModule from "engine/renderable/ShpRenderable"; // 孪生
import { TiberiumTreeTrait, SpawnStatus } from "game/gameobject/trait/TiberiumTreeTrait"; // 已转换
import { SimpleRunner } from "engine/animation/SimpleRunner"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { Animation, AnimationState } from "engine/Animation"; // 已转换
import { IniSection } from "data/IniSection"; // 已转换
import * as AlphaRenderableModule from "engine/renderable/AlphaRenderable"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const DebugUtils: any = (DebugUtilsModule as any).DebugUtils;
const ShpRenderable: any = (ShpRenderableModule as any).ShpRenderable;
const AlphaRenderable: any = (AlphaRenderableModule as any).AlphaRenderable;

/**
 * 地形物件渲染件。
 */
export class Terrain {
  /** 宿主对象。 */
  gameObject: any;
  /** 地形批处理层（可选）。 */
  terrainLayer: any;
  /** 图片查找器。 */
  imageFinder: any;
  /** 调色板。 */
  palette: any;
  /** 相机。 */
  camera: any;
  /** 光照。 */
  lighting: any;
  /** 调试线框。 */
  debugFrame: any;
  /** 游戏速度。 */
  gameSpeed: any;
  /** 是否精灵批处理。 */
  useSpriteBatching: any;
  /** art 规则。 */
  objectArt: any;
  /** 调试名。 */
  label: string;

  /** 矿树 trait（可无）。 */
  tiberiumTreeTrait: any;
  /** 位置组件。 */
  withPosition: any;
  /** 额外光照。 */
  extraLight: any;
  /** 外层 Object3D。 */
  target: any;
  /** 主渲染对象。 */
  mainObj: any;
  /** 生长动画驱动（仅矿树）。 */
  animationRunner: any;
  /** 上次矿树状态（变化检测）。 */
  lastTiberiumSpawnStatus: any;

  /**
   * @param gameObject - 宿主
   * @param terrainLayer - 批处理层
   * @param imageFinder - 图片查找器
   * @param palette - 调色板
   * @param camera - 相机
   * @param lighting - 光照
   * @param debugFrame - 调试 Ref
   * @param gameSpeed - 游戏速度
   * @param useSpriteBatching - 是否批处理
   */
  constructor(
    gameObject: any,
    terrainLayer: any,
    imageFinder: any,
    palette: any,
    camera: any,
    lighting: any,
    debugFrame: any,
    gameSpeed: any,
    useSpriteBatching: any,
  ) {
    this.gameObject = gameObject;
    this.terrainLayer = terrainLayer;
    this.imageFinder = imageFinder;
    this.palette = palette;
    this.camera = camera;
    this.lighting = lighting;
    this.debugFrame = debugFrame;
    this.gameSpeed = gameSpeed;
    this.useSpriteBatching = useSpriteBatching;
    this.objectArt = gameObject.art;
    this.label = "terrain_" + gameObject.rules.name;
    this.init();
  }

  /** 探测矿树 trait 并初始化位置/光照。 */
  init(): void {
    this.tiberiumTreeTrait = this.gameObject.traits.find(TiberiumTreeTrait);
    this.withPosition = new WithPosition();
    this.extraLight = new THREE.Vector3();
    this.updateLighting();
  }

  /** 按地块刷新 extraLight。 */
  updateLighting(): void {
    this.extraLight
      .copy(this.lighting.compute(this.objectArt.lightingType, this.gameObject.tile))
      .addScalar(-1);
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建外层。 */
  create3DObject(): void {
    let obj = this.get3DObject();
    if (!obj) {
      obj = new THREE.Object3D();
      obj.name = this.label;
      this.target = obj;
      obj.matrixAutoUpdate = false;
      this.withPosition.matrixUpdate = true;
      this.withPosition.applyTo(this);
      this.createObjects(obj);
    }
  }

  /**
   * 设置位置。
   * @param pos - 位置
   */
  setPosition(pos: any): void {
    this.withPosition.setPosition(pos.x, pos.y, pos.z);
  }

  /** 当前位置。 */
  getPosition(): any {
    return this.withPosition.getPosition();
  }

  /**
   * 推进矿树生长动画。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    if (this.tiberiumTreeTrait) {
      const status = this.tiberiumTreeTrait.status;
      // 状态变化且新状态为 Spawning → reset 动画
      // 孪生：(t = status) !== last && (last = t) === Spawning && reset
      if (status !== this.lastTiberiumSpawnStatus) {
        this.lastTiberiumSpawnStatus = status;
        if (status === SpawnStatus.Spawning) {
          this.animationRunner?.animation.reset();
        }
      }
      if (this.animationRunner) {
        this.animationRunner.tick(now);
        if (this.animationRunner.animation.getState() !== AnimationState.STOPPED) {
          this.mainObj.setFrame(this.animationRunner.getCurrentFrame());
        } else {
          this.mainObj.setFrame(0);
        }
      }
    }
  }

  /**
   * 构建子对象（alpha 阴影 / 批处理 / ShpRenderable / 矿树动画）。
   * @param parent - 父 Object3D
   */
  createObjects(parent: any): void {
    let tile = { width: 1, height: 1 };
    if (this.debugFrame.value) {
      const wire = DebugUtils.createWireframe(tile, 2);
      parent.add(wire);
    }

    let shp: any;
    try {
      shp = this.imageFinder.findByObjectArt(this.objectArt);
    } catch (err) {
      if (err instanceof ImageFinder.MissingImageError) {
        console.warn(err.message);
        return;
      }
      throw err;
    }

    // 可选 alpha 阴影图
    const alphaName = this.gameObject.rules.alphaImage;
    if (alphaName) {
      const alphaShp = this.imageFinder.tryFind(alphaName, false);
      if (alphaShp) {
        const alpha = new AlphaRenderable(alphaShp, this.camera, this.objectArt.getDrawOffset());
        alpha.create3DObject();
        parent.add(alpha.get3DObject());
      } else {
        console.warn(`<${this.gameObject.name}>: Alpha image "${alphaName}" not found`);
      }
    }

    if (this.terrainLayer?.shouldBeBatched(this.gameObject)) {
      this.terrainLayer.addObject(this.gameObject);
    } else {
      const wrapper = new THREE.Object3D();
      wrapper.matrixAutoUpdate = false;
      const translation = new MapSpriteTranslation(tile.width, tile.height);
      const { spriteOffset, anchorPointWorld } = translation.compute();
      wrapper.position.x = anchorPointWorld.x;
      wrapper.position.z = anchorPointWorld.y;
      wrapper.updateMatrix();

      const offset = spriteOffset.clone().add(this.objectArt.getDrawOffset());
      const renderable = ShpRenderable.factory(
        shp,
        this.palette,
        this.camera,
        offset,
        this.objectArt.hasShadow,
      );
      renderable.setBatched(this.useSpriteBatching);
      if (this.useSpriteBatching) {
        renderable.setBatchPalettes([this.palette]);
      }
      renderable.setFrame(0);
      renderable.setExtraLight(this.extraLight);
      renderable.create3DObject();
      wrapper.add(renderable.get3DObject());
      this.mainObj = renderable;

      if (this.tiberiumTreeTrait) {
        const section = new IniSection("dummy");
        if (this.gameObject.rules.animationRate) {
          section.set("Rate", "" + 60 * this.gameObject.rules.animationRate);
          section.set("Shadow", "yes");
        }
        const props = new AnimProps(section, shp);
        const animation = new Animation(props, this.gameSpeed);
        this.animationRunner = new SimpleRunner();
        this.animationRunner.animation = animation;
        animation.stop();
      }
      parent.add(wrapper);
    }
  }

  /** 从批处理层摘除。 */
  onRemove(): void {
    if (this.terrainLayer?.hasObject(this.gameObject)) {
      this.terrainLayer.removeObject(this.gameObject);
    }
  }

  /** 释放主对象。 */
  dispose(): void {
    this.mainObj?.dispose();
  }
}
