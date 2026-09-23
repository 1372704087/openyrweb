/**
 * Anim — 通用 SHP 动画渲染件（帧动画 + 半透明/批处理/音效）。
 *
 * 惰性创建 Object3D；update 推进 SimpleRunner，按状态控制可见性与
 * translucent/translucency 透明度；createMainObject 走 ImageFinder +
 * ShpRenderable.factory，缺图仅 warn。renderOrder 必须在 3DObject
 * 创建前设置。
 *
 * 由 engine/renderable/entity/Anim.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { Animation, AnimationState } from "engine/Animation"; // 已转换
import * as ShpRenderableModule from "engine/renderable/ShpRenderable"; // 孪生
import { ImageFinder } from "engine/ImageFinder"; // 已转换
import * as DebugUtilsModule from "engine/gfx/DebugUtils"; // 孪生
import { MapSpriteTranslation } from "engine/renderable/MapSpriteTranslation"; // 已转换
import { SimpleRunner } from "engine/animation/SimpleRunner"; // 已转换
import { MathUtils } from "engine/gfx/MathUtils"; // 已转换
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ShpRenderable: any = (ShpRenderableModule as any).ShpRenderable;
const DebugUtils: any = (DebugUtilsModule as any).DebugUtils;

/**
 * 通用动画渲染件。
 */
export class Anim {
  /** 动画名。 */
  name: any;
  /** art 规则。 */
  objectArt: any;
  /** 额外像素偏移。 */
  extraOffset: any;
  /** 图片查找器。 */
  imageFinder: any;
  /** 剧场。 */
  theater: any;
  /** 相机。 */
  camera: any;
  /** 调试线框 Ref。 */
  debugFrame: any;
  /** 游戏速度。 */
  gameSpeed: any;
  /** 是否精灵批处理。 */
  useSpriteBatching: any;
  /** 额外光照（默认零向量）。 */
  extraLight: any = new THREE.Vector3(0, 0, 0);
  /** 世界音效（可选）。 */
  worldSound: any;
  /** 渲染顺序（须在 create3DObject 前设置）。 */
  renderOrder: number = 0;
  /** 调色板。 */
  palette: any;
  /** 位置组件。 */
  withPosition: any;

  /** 外层 Object3D。 */
  target: any;
  /** 主 SHP 渲染件。 */
  mainObj: any;
  /** SHP 文件缓存。 */
  shpFile: any;
  /** 动画实例。 */
  animation: any;
  /** 动画驱动。 */
  animationRunner: any;
  /** 音效句柄。 */
  soundHandle: any;

  /**
   * @param name - 动画名
   * @param objectArt - art 规则
   * @param extraOffset - 额外偏移
   * @param imageFinder - 图片查找器
   * @param theater - 剧场
   * @param camera - 相机
   * @param debugFrame - 调试 Ref
   * @param gameSpeed - 游戏速度
   * @param useSpriteBatching - 是否批处理
   * @param extraLight - 额外光（可省，默认零向量）
   * @param worldSound - 世界音效
   * @param palette - 显式调色板（省略时按 objectArt 取）
   */
  constructor(
    name: any,
    objectArt: any,
    extraOffset: any,
    imageFinder: any,
    theater: any,
    camera: any,
    debugFrame: any,
    gameSpeed: any,
    useSpriteBatching: any,
    extraLight: any = new THREE.Vector3(0, 0, 0),
    worldSound?: any,
    palette?: any,
  ) {
    this.objectArt = objectArt;
    this.extraOffset = extraOffset;
    this.imageFinder = imageFinder;
    this.theater = theater;
    this.camera = camera;
    this.debugFrame = debugFrame;
    this.gameSpeed = gameSpeed;
    this.useSpriteBatching = useSpriteBatching;
    this.extraLight = extraLight;
    this.worldSound = worldSound;
    this.renderOrder = 0;
    this.name = name;
    this.palette =
      palette ?? this.theater.getPalette(this.objectArt.paletteType, this.objectArt.customPaletteName);
    this.withPosition = new WithPosition();
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建外层并构建子对象。 */
  create3DObject(): void {
    let obj = this.get3DObject();
    if (!obj) {
      obj = new THREE.Object3D();
      obj.name = "anim_" + this.name;
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
   * 推进动画：起播音效、控制可见性与透明度。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    if (!this.animationRunner) return;

    // 起播时若 startSound/report 存在则播一次
    const soundName = this.objectArt.startSound ?? this.objectArt.report;
    if (
      soundName &&
      !this.soundHandle &&
      this.animation?.getState() === AnimationState.NOT_STARTED
    ) {
      this.soundHandle = this.worldSound?.playEffect(
        soundName,
        this.withPosition.getPosition(),
        void 0,
        1,
        0.25,
      );
    }
    this.animationRunner.tick(now);

    const obj3d = this.mainObj.get3DObject();
    // DELAYED 时隐藏
    obj3d.visible = this.animation.getState() !== AnimationState.DELAYED;
    this.mainObj.setFrame(this.animationRunner.getCurrentFrame());

    const translucent = this.objectArt.translucent;
    const translucency = this.objectArt.translucency;
    if (translucent || translucency > 0) {
      let opacity: number;
      if (translucent) {
        // 半透明模式：按帧从 start 到 end 线性淡出
        const props = this.animation.props;
        opacity = 1 - this.animationRunner.getCurrentFrame() / (props.end - props.start);
      } else {
        opacity = 1 - translucency;
      }
      this.mainObj.setOpacity(opacity);
    }
  }

  /**
   * 构建子对象（调试线框 + 主 SHP）。
   * @param parent - 父 Object3D
   */
  createObjects(parent: any): void {
    const tile = { width: 1, height: 1 };
    if (this.debugFrame.value) {
      const wire = DebugUtils.createWireframe(tile, 0);
      parent.add(wire);
    }

    const translation = new MapSpriteTranslation(tile.width, tile.height);
    const { spriteOffset, anchorPointWorld } = translation.compute();
    const offset = this.computeSpriteAnchorOffset(spriteOffset);

    const wrapper = new THREE.Object3D();
    wrapper.matrixAutoUpdate = false;
    this.mainObj = this.createMainObject(offset);
    if (this.mainObj) {
      this.mainObj.setExtraLight(this.extraLight);
      const batched = this.useSpriteBatching && !this.renderOrder;
      this.mainObj.setBatched(batched);
      if (batched) {
        this.mainObj.setBatchPalettes([this.palette]);
      }

      const translucent = this.objectArt.translucent;
      const translucency = this.objectArt.translucency;
      if (translucent || translucency > 0) {
        this.mainObj.setForceTransparent(true);
      }
      this.mainObj.create3DObject();

      if (this.renderOrder) {
        if (batched) throw new Error("Render order not supported with batching");
        this.mainObj.getShapeMesh().renderOrder = this.renderOrder;
        this.mainObj.getShapeMesh().material.depthTest = !this.renderOrder;
        this.mainObj.getShapeMesh().material.transparent = !!this.renderOrder;
      }

      wrapper.add(this.mainObj.get3DObject());
      wrapper.position.x = anchorPointWorld.x;
      wrapper.position.z = anchorPointWorld.y;
      if (this.objectArt.zAdjust) {
        MathUtils.translateTowardsCamera(
          wrapper,
          this.camera,
          -this.objectArt.zAdjust * Coords.ISO_WORLD_SCALE,
        );
      }
      wrapper.updateMatrix();
      parent.add(wrapper);
    }
  }

  /**
   * 更新额外光并转发主对象。
   * @param light - 新光照
   */
  setExtraLight(light: any): void {
    this.extraLight = light;
    this.mainObj?.setExtraLight(this.extraLight);
  }

  /**
   * 设置渲染顺序（须在 create3DObject 前）。
   * @param order - 渲染顺序
   */
  setRenderOrder(order: number): void {
    if (this.mainObj) throw new Error("Render order must be set before 3DObject is created");
    this.renderOrder = order;
  }

  /**
   * 精灵锚点偏移 = spriteOffset + drawOffset + extraOffset。
   * @param spriteOffset - 精灵偏移
   */
  computeSpriteAnchorOffset(spriteOffset: any): any {
    const draw = this.objectArt.getDrawOffset();
    return {
      x: spriteOffset.x + draw.x + this.extraOffset.x,
      y: spriteOffset.y + draw.y + this.extraOffset.y,
    };
  }

  /**
   * 创建主 SHP 渲染件与动画（缺图仅 warn 返回 undefined）。
   * @param offset - 像素偏移
   */
  createMainObject(offset: any): any {
    let shp: any;
    try {
      shp = this.shpFile = this.imageFinder.findByObjectArt(this.objectArt);
    } catch (err) {
      if (err instanceof ImageFinder.MissingImageError) {
        console.warn(err.message);
        return void 0;
      }
      throw err;
    }

    const renderable = ShpRenderable.factory(shp, this.palette, this.camera, offset);
    renderable.setFlat(this.objectArt.flat);

    const props = new AnimProps(this.objectArt.art, shp);
    this.animation = new Animation(props, this.gameSpeed);
    this.animationRunner = new SimpleRunner();
    this.animationRunner.animation = this.animation;
    return renderable;
  }

  /** 动画 props（可无）。 */
  getAnimProps(): any {
    return this.animation?.props;
  }

  /** SHP 文件。 */
  getShpFile(): any {
    return this.shpFile;
  }

  /**
   * 重映色调色板（须在 create3DObject 前）。
   * @param rgb - RGB 三元组
   */
  remapColor(rgb: any): void {
    if (this.mainObj) throw new Error("Palette can only be remapped before creating 3DObject");
    const next = this.palette.clone();
    next.remap(rgb);
    this.palette = next;
  }

  /** 动画是否已 STOPPED。 */
  isAnimFinished(): boolean {
    return this.animation?.getState() === AnimationState.STOPPED;
  }

  /** 动画是否尚未 start。 */
  isAnimNotStarted(): boolean {
    return this.animation?.getState() === AnimationState.NOT_STARTED;
  }

  /** 结束循环并播到末帧。 */
  endAnimationLoop(): void {
    this.animation?.endLoopAndPlayToEnd();
  }

  /**
   * 再播 n 圈后停止（重置圈计数）。
   * @param loops - 额外完整循环数
   */
  playRemainingLoops(loops: number): void {
    if (this.animation) {
      this.animation.props.loopCount = loops;
      this.animation.loopNo = 0;
      this.animation.endLoopAndPlayToEnd();
    }
  }

  /** 重置动画状态。 */
  reset(): void {
    this.animation?.reset();
  }

  /** 释放主对象与循环音效。 */
  dispose(): void {
    this.mainObj?.dispose();
    if (this.soundHandle?.isLoop) {
      this.soundHandle.stop();
    }
  }
}
