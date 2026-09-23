/**
 * VehicleDisguisePlugin — 车辆地形伪装（Terrain 对象替换显示）。
 *
 * 伪装时隐藏本体、创建 ShpRenderable 地形外观；共享情报可透视且闪烁窗口
 * 外短暂暴露本体；getUiNameOverride/shouldDisableHighlight 面向 UI。
 *
 * 由 engine/renderable/entity/plugin/VehicleDisguisePlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as MapSpriteTranslationModule from "engine/renderable/MapSpriteTranslation"; // 孪生
import * as ShpRenderableModule from "engine/renderable/ShpRenderable"; // 孪生
import { ObjectType } from "engine/type/ObjectType"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const MapSpriteTranslation: any = (MapSpriteTranslationModule as any).MapSpriteTranslation;
const ShpRenderable: any = (ShpRenderableModule as any).ShpRenderable;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 车辆地形伪装插件。 */
export class VehicleDisguisePlugin {
  /** 所属车辆。 */
  gameObject: any;
  /** 伪装 trait。 */
  disguiseTrait: any;
  /** 本地玩家 Ref。 */
  localPlayer: any;
  /** 联盟/情报。 */
  alliances: any;
  /** 车辆渲染。 */
  renderable: any;
  /** art。 */
  art: any;
  /** 图像查找。 */
  imageFinder: any;
  /** 战区。 */
  theater: any;
  /** 相机。 */
  camera: any;
  /** 光照。 */
  lighting: any;
  /** 速度 Ref。 */
  gameSpeed: any;
  /** 批处理开关。 */
  useSpriteBatching: any;
  /** 上帧是否伪装渲染。 */
  lastRenderDisguised = false;
  /** 本地是否可透视伪装。 */
  canSeeThroughDisguise = false;
  /** 上帧伪装开关。 */
  lastDisguised?: boolean;
  /** 进入伪装 tick。 */
  disguisedAt?: number;
  /** 伪装根节点。 */
  disguiseObj?: any;
  /** 伪装 SHP 渲染。 */
  disguiseRenderable?: any;

  /**
   * @param gameObject - 车辆
   * @param disguiseTrait - DisguiseTrait
   * @param localPlayer - 本地玩家 Ref
   * @param alliances - alliances
   * @param renderable - 车辆渲染
   * @param art - art
   * @param imageFinder - ImageFinder
   * @param theater - 战区
   * @param camera - 相机
   * @param lighting - Lighting
   * @param gameSpeed - 速度 Ref
   * @param useSpriteBatching - 批处理开关
   */
  constructor(
    gameObject: any,
    disguiseTrait: any,
    localPlayer: any,
    alliances: any,
    renderable: any,
    art: any,
    imageFinder: any,
    theater: any,
    camera: any,
    lighting: any,
    gameSpeed: any,
    useSpriteBatching: any,
  ) {
    this.gameObject = gameObject;
    this.disguiseTrait = disguiseTrait;
    this.localPlayer = localPlayer;
    this.alliances = alliances;
    this.renderable = renderable;
    this.art = art;
    this.imageFinder = imageFinder;
    this.theater = theater;
    this.camera = camera;
    this.lighting = lighting;
    this.gameSpeed = gameSpeed;
    this.useSpriteBatching = useSpriteBatching;
    this.lastRenderDisguised = false;
    this.canSeeThroughDisguise = false;
  }

  /** 无初始化。 */
  onCreate(): void {}

  /** 每帧：同步伪装外观与透视闪烁。 */
  update(tick: number): void {
    if (this.gameObject.isDestroyed || this.gameObject.warpedOutTrait.isActive()) return;
    let disguised = this.disguiseTrait.isDisguised();
    if (disguised !== this.lastDisguised) {
      this.lastDisguised = disguised;
      this.disguisedAt = disguised ? tick : void 0;
    }
    const local = this.localPlayer.value;
    if (disguised) {
      this.canSeeThroughDisguise =
        !local ||
        this.alliances.haveSharedIntel(local, this.gameObject.owner) ||
        !!local.sharedDetectDisguiseTrait?.has(this.gameObject);
    }
    if (disguised && this.canSeeThroughDisguise) {
      disguised =
        !local?.sharedDetectDisguiseTrait?.has(this.gameObject) &&
        Math.floor(((tick - this.disguisedAt!) * this.gameSpeed.value) / 1e3) % 16 <= 3;
    }
    if (this.lastRenderDisguised !== disguised) {
      this.lastRenderDisguised = disguised;
      this.renderable.mainObj.visible = !disguised;
      this.renderable.posObj.visible = !disguised || this.canSeeThroughDisguise;
      if (this.disguiseObj) this.disguiseObj.visible = false;
      if (disguised) {
        let disguise = this.disguiseTrait.getDisguise();
        if (disguise.rules.type !== ObjectType.Terrain) {
          throw new Error("Unsupported disguise type " + ObjectType[disguise.rules.type]);
        }
        const objectArt = this.art.getObject(disguise.rules.name, ObjectType.Terrain);
        if (!this.disguiseObj) {
          this.disguiseObj = this.createDisguiseObj(objectArt);
          this.renderable.get3DObject().add(this.disguiseObj);
        }
        this.disguiseObj.visible = true;
        const light = this.lighting
          .compute(objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
          .addScalar(-1);
        this.disguiseRenderable.setExtraLight(light);
      }
    }
  }

  /**
   * 创建地形伪装 SHP 节点。
   * @param objectArt - Terrain art
   */
  createDisguiseObj(objectArt: any): any {
    const root = new (THREE as any).Object3D();
    root.matrixAutoUpdate = false;
    const foundationW = 1;
    const foundationH = 1;
    const translation = new MapSpriteTranslation(foundationW, foundationH);
    const { spriteOffset, anchorPointWorld } = translation.compute();
    root.position.x = anchorPointWorld.x;
    root.position.z = anchorPointWorld.y;
    root.updateMatrix();
    const shpFile = this.imageFinder.findByObjectArt(objectArt);
    const palette = this.theater.getPalette(objectArt.paletteType, objectArt.customPaletteName);
    const shp = ShpRenderable.factory(shpFile, palette, this.camera, spriteOffset, objectArt.hasShadow);
    shp.setBatched(this.useSpriteBatching);
    if (this.useSpriteBatching) shp.setBatchPalettes([palette]);
    shp.setFrame(0);
    shp.create3DObject();
    root.add(shp.get3DObject());
    this.disguiseRenderable = shp;
    return root;
  }

  /** 伪装可见时刷新 extraLight。 */
  updateLighting(): void {
    if (!this.disguiseObj?.visible || !this.disguiseRenderable) return;
    let disguise = this.disguiseTrait.getDisguise();
    if (!disguise) return;
    if (disguise.rules.type !== ObjectType.Terrain) {
      throw new Error("Unsupported disguise type " + ObjectType[disguise.rules.type]);
    }
    const objectArt = this.art.getObject(disguise.rules.name, ObjectType.Terrain);
    this.disguiseRenderable.setExtraLight(
      this.lighting
        .compute(objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
        .addScalar(-1),
    );
  }

  /** 移除时卸下伪装节点。 */
  onRemove(): void {
    if (this.disguiseObj) {
      this.renderable.get3DObject().remove(this.disguiseObj);
      this.disguiseObj = void 0;
    }
  }

  /** 地形伪装且未透视时清空 UI 名。 */
  getUiNameOverride(): string | undefined {
    if (this.gameObject.disguiseTrait?.hasTerrainDisguise() && !this.canSeeThroughDisguise) return "";
  }

  /** 地形伪装且未透视时禁用高亮。 */
  shouldDisableHighlight(): boolean {
    return !!this.gameObject.disguiseTrait?.hasTerrainDisguise() && !this.canSeeThroughDisguise;
  }

  /** dispose 伪装渲染。 */
  dispose(): void {
    this.disguiseRenderable?.dispose();
  }
}
