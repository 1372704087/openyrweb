/**
 * Debris — 碎片/残骸渲染件（支持 VXL 或 SHP + 阴影）。
 *
 * voxelAnimRules 命中时用 vxlBuilderFactory 建 VXL 并绕 rotationAxis 旋转；
 * 否则 SHP + 半透明影子双渲染。update 跟随 velocity×i 位移并刷新光照
 * 高度；onRemove 播 explodeAnim。
 *
 * 由 engine/renderable/entity/Debris.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import * as ShpRenderableModule from "engine/renderable/ShpRenderable"; // 孪生
import { MapSpriteTranslation } from "engine/renderable/MapSpriteTranslation"; // 已转换
import { Animation } from "engine/Animation"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { SimpleRunner } from "engine/animation/SimpleRunner"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import * as ShadowRenderableModule from "engine/renderable/ShadowRenderable"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ShpRenderable: any = (ShpRenderableModule as any).ShpRenderable;
const ShadowRenderable: any = (ShadowRenderableModule as any).ShadowRenderable;

/**
 * 碎片渲染件。
 * 可挂 plugins（updateLighting/onCreate/onRemove/dispose）。
 */
export class Debris {
  /** 宿主对象。 */
  gameObject: any;
  /** 规则。 */
  rules: any;
  /** 图片查找器。 */
  imageFinder: any;
  /** VXL 资源集。 */
  voxels: any;
  /** 调色板。 */
  palette: any;
  /** 相机。 */
  camera: any;
  /** 光照。 */
  lighting: any;
  /** 游戏速度。 */
  gameSpeed: any;
  /** VXL builder 工厂。 */
  vxlBuilderFactory: any;
  /** 是否精灵批处理。 */
  useSpriteBatching: any;
  /** 插件列表。 */
  plugins: any[] = [];
  /** 对象规则。 */
  objectRules: any;
  /** 对象 art。 */
  objectArt: any;
  /** 调试名。 */
  label: string;

  /** 位置组件。 */
  withPosition: any;
  /** SHP 基础光。 */
  baseShpExtraLight: any;
  /** VXL 基础光（无环境光）。 */
  baseVxlExtraLight: any;
  /** VXL 当前光。 */
  vxlExtraLight: any;
  /** SHP 当前光。 */
  shpExtraLight: any;
  /** 外层 Object3D。 */
  target: any;
  /** 旋转容器。 */
  vxlRotObj: any;
  /** VXL builder。 */
  vxlBuilder: any;
  /** SHP 渲染件。 */
  shpRenderable: any;
  /** 影子 SHP。 */
  shpShadowRenderable: any;
  /** 影子包装节点。 */
  shadowWrap: any;
  /** SHP 动画驱动。 */
  shpAnimRunner: any;
  /** 上次高度（光照刷新）。 */
  lastElevation: any;

  /**
   * @param gameObject - 宿主
   * @param rules - 规则
   * @param imageFinder - 图片查找器
   * @param voxels - VXL 集
   * @param palette - 调色板（ctor 第 6 参，索引 5）
   * @param camera - 相机
   * @param lighting - 光照
   * @param gameSpeed - 游戏速度
   * @param vxlBuilderFactory - VXL 工厂
   * @param useSpriteBatching - 是否批处理
   */
  constructor(
    gameObject: any,
    rules: any,
    imageFinder: any,
    voxels: any,
    voxelAnims: any,
    palette: any,
    camera: any,
    lighting: any,
    gameSpeed: any,
    vxlBuilderFactory: any,
    useSpriteBatching: any,
  ) {
    // 孪生 ctor(e,t,i,r,s,a,n,o,l,c,h)：s=voxelAnims 占位、a=palette、n=camera…
    this.gameObject = gameObject;
    this.rules = rules;
    this.imageFinder = imageFinder;
    this.voxels = voxels;
    this.palette = palette;
    this.camera = camera;
    this.lighting = lighting;
    this.gameSpeed = gameSpeed;
    this.vxlBuilderFactory = vxlBuilderFactory;
    this.useSpriteBatching = useSpriteBatching;
    this.plugins = [];
    this.objectRules = gameObject.rules;
    this.objectArt = gameObject.art;
    this.label = "debris_" + this.objectRules.name;
    this.init();
  }

  /** 计算基础光照并初始化位置。 */
  init(): void {
    this.baseShpExtraLight = this.lighting
      .compute(this.objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
      .addScalar(-1);
    this.baseVxlExtraLight = new THREE.Vector3().addScalar(
      this.lighting.computeNoAmbient(
        this.objectArt.lightingType,
        this.gameObject.tile,
        this.gameObject.tileElevation,
      ),
    );
    this.vxlExtraLight = new THREE.Vector3().copy(this.baseVxlExtraLight);
    this.shpExtraLight = new THREE.Vector3().copy(this.baseShpExtraLight);
    this.withPosition = new WithPosition();
  }

  /**
   * 注册插件。
   * @param plugin - 插件
   */
  registerPlugin(plugin: any): void {
    this.plugins.push(plugin);
  }

  /** 刷新插件与基础光照。 */
  updateLighting(): void {
    this.plugins.forEach((p) => p.updateLighting?.());
    this.baseShpExtraLight = this.lighting
      .compute(this.objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
      .addScalar(-1);
    this.baseVxlExtraLight = new THREE.Vector3().addScalar(
      this.lighting.computeNoAmbient(
        this.objectArt.lightingType,
        this.gameObject.tile,
        this.gameObject.tileElevation,
      ),
    );
    this.vxlExtraLight.copy(this.baseVxlExtraLight);
    this.shpExtraLight.copy(this.baseShpExtraLight);
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建外层与子对象。 */
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
      this.vxlBuilder?.setExtraLight(this.vxlExtraLight);
      this.shpRenderable?.setExtraLight(this.shpExtraLight);
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
   * 插件 tick + 高度变化刷新光照 + 位移 + VXL 旋转/SHP 帧。
   * @param now - 当前时间戳（ms）
   * @param dt - 位移步长（可选，默认 0）
   */
  update(now: number, dt: number = 0): void {
    this.plugins.forEach((p) => p.update(now));
    const elev = this.gameObject.tile.z + this.gameObject.tileElevation;
    if (this.lastElevation === void 0 || this.lastElevation !== elev) {
      this.lastElevation = elev;
      this.baseVxlExtraLight = new THREE.Vector3().addScalar(
        this.lighting.computeNoAmbient(
          this.objectArt.lightingType,
          this.gameObject.tile,
          this.gameObject.tileElevation,
        ),
      );
      this.baseShpExtraLight = this.lighting
        .compute(this.objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
        .addScalar(-1);
      this.vxlExtraLight.copy(this.baseVxlExtraLight);
      this.shpExtraLight.copy(this.baseShpExtraLight);
      if (this.shadowWrap) {
        this.shadowWrap.position.y = -Coords.tileHeightToWorld(this.gameObject.tileElevation);
        this.shadowWrap.updateMatrix();
      }
    }

    if (dt > 0) {
      const step = this.gameObject.velocity.clone().multiplyScalar(dt);
      const next = step.add(this.gameObject.position.worldPosition);
      this.setPosition(next);
    }

    if (this.vxlBuilder) {
      const { rotationAxis, angularVelocity } = this.gameObject;
      this.vxlRotObj.rotateOnAxis(rotationAxis, THREE.Math.degToRad(angularVelocity));
      this.vxlRotObj.updateMatrix();
    } else {
      this.shpAnimRunner.tick(now);
      const frame = this.shpAnimRunner.animation.getCurrentFrame();
      this.shpRenderable.setFrame(frame);
      this.shpShadowRenderable.setFrame(frame);
    }
  }

  /**
   * 创建旋转容器并挂主对象。
   * @param parent - 父 Object3D
   */
  createObjects(parent: any): void {
    const rot = (this.vxlRotObj = new THREE.Object3D());
    rot.matrixAutoUpdate = false;
    rot.rotation.order = "YXZ";
    const main = this.createMainObject();
    rot.add(main);
    parent.add(rot);
  }

  /**
   * 精灵锚点偏移。
   * @param spriteOffset - 精灵偏移
   */
  computeSpriteAnchorOffset(spriteOffset: any): any {
    const draw = this.objectArt.getDrawOffset();
    return { x: spriteOffset.x + draw.x, y: spriteOffset.y + draw.y };
  }

  /** 按规则建 VXL 或 SHP+影子，返回容器。 */
  createMainObject(): any {
    const wrap = new THREE.Object3D();
    wrap.matrixAutoUpdate = false;

    if (this.rules.voxelAnimRules.has(this.gameObject.name)) {
      const fileName = this.getVxlFileName(this.objectRules, this.objectArt);
      const vxl = this.voxels.get(fileName);
      if (!vxl) {
        throw new Error(
          `VXL missing for anim ${this.objectRules.name}. Vxl file ${fileName} not found. `,
        );
      }
      const builder = this.vxlBuilderFactory.create(vxl, void 0, [this.palette], this.palette);
      this.vxlBuilder = builder;
      const mesh = builder.build();
      wrap.add(mesh);
    } else {
      const translation = new MapSpriteTranslation(1, 1);
      const { spriteOffset, anchorPointWorld } = translation.compute();
      const offset = this.computeSpriteAnchorOffset(spriteOffset);
      const shp = this.imageFinder.findByObjectArt(this.objectArt);

      const renderable = (this.shpRenderable = ShpRenderable.factory(
        shp,
        this.palette,
        this.camera,
        offset,
        false,
      ));
      renderable.setBatched(this.useSpriteBatching);
      if (this.useSpriteBatching) renderable.setBatchPalettes([this.palette]);
      renderable.create3DObject();
      wrap.add(renderable.get3DObject());

      const shadowPalette = ShadowRenderable.getOrCreateShadowPalette();
      const shadow = (this.shpShadowRenderable = ShpRenderable.factory(
        shp,
        shadowPalette,
        this.camera,
        offset,
        false,
      ));
      shadow.setBatched(this.useSpriteBatching);
      if (this.useSpriteBatching) shadow.setBatchPalettes([shadowPalette]);
      shadow.setOpacity(0.5);
      shadow.create3DObject();

      const shadowNode = (this.shadowWrap = new THREE.Object3D());
      shadowNode.matrixAutoUpdate = false;
      shadowNode.add(shadow.get3DObject());
      wrap.add(shadowNode);
      wrap.position.x = anchorPointWorld.x;
      wrap.position.z = anchorPointWorld.y;
      wrap.updateMatrix();
      renderable.setFlat(this.objectArt.flat);

      const props = new AnimProps(this.objectArt.art, shp);
      const animation = new Animation(props, this.gameSpeed);
      this.shpAnimRunner = new SimpleRunner();
      this.shpAnimRunner.animation = animation;
    }
    return wrap;
  }

  /**
   * 推导 VXL 文件名（含 shareSource/turret/barrel 后缀）。
   * @param rules - 规则
   * @param art - art
   */
  getVxlFileName(rules: any, art: any): string {
    let imageName = art.imageName;
    if (rules.shareSource) {
      imageName = rules.shareSource;
      if (rules.shareTurretData) imageName += "tur";
      else if (rules.shareBarrelData) imageName += "barl";
    }
    return imageName.toLowerCase() + ".vxl";
  }

  /**
   * 创建回调：转发插件。
   * @param manager - 渲染管理器
   */
  onCreate(manager: any): void {
    this.plugins.forEach((p) => p.onCreate(manager));
  }

  /**
   * 移除回调：插件 + 播 explodeAnim。
   * @param manager - 渲染管理器
   */
  onRemove(manager: any): void {
    this.plugins.forEach((p) => p.onRemove(manager));
    if (
      this.gameObject.isDestroyed &&
      this.get3DObject() &&
      this.gameObject.explodeAnim
    ) {
      const name = this.gameObject.explodeAnim;
      manager.createTransientAnim(name, (anim: any) =>
        anim.setPosition(this.withPosition.getPosition()),
      );
    }
  }

  /** 释放插件与渲染资源。 */
  dispose(): void {
    this.plugins.forEach((p) => p.dispose());
    this.shpRenderable?.dispose();
    this.shpShadowRenderable?.dispose();
    this.vxlBuilder?.dispose();
  }
}
