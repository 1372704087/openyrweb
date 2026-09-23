/**
 * Overlay — 覆盖物渲染（墙/桥/矿等，支持批处理与独立 Shp）。
 *
 * update 用 overlayId+value+conditionY 算 hash 决定帧号；桥 value=0 时
 * 随机 0-3；残血墙在帧号上叠加 wallTypes 长度。createObjects 分批处理
 * 与独立路径，低桥用聚合 SHP 虚拟桥文件，高桥附加阴影面。
 *
 * 由 engine/renderable/entity/Overlay.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { ShpFile } from "data/ShpFile"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import * as DebugUtilsModule from "engine/gfx/DebugUtils"; // 孪生
import { MapSpriteTranslation } from "engine/renderable/MapSpriteTranslation"; // 已转换
import * as ShpRenderableModule from "engine/renderable/ShpRenderable"; // 孪生
import { getRandomInt } from "util/math"; // 已转换
import * as BridgeOverlayTypesModule from "game/map/BridgeOverlayTypes"; // 孪生
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import { BoxIntersectObject3D } from "engine/renderable/entity/BoxIntersectObject3D"; // 已转换
import { MathUtils } from "engine/gfx/MathUtils"; // 已转换
import * as MapSurfaceModule from "engine/renderable/entity/map/MapSurface"; // 孪生
import * as wallTypesModule from "game/map/wallTypes"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const DebugUtils: any = (DebugUtilsModule as any).DebugUtils;
const ShpRenderable: any = (ShpRenderableModule as any).ShpRenderable;
const BridgeOverlayTypes: any = (BridgeOverlayTypesModule as any).BridgeOverlayTypes;
const OverlayBridgeType: any = (BridgeOverlayTypesModule as any).OverlayBridgeType;
// MapSurface.MAGIC_OFFSET（孪生 execute 内常量经模块引用）
const MAGIC_OFFSET: number = ((MapSurfaceModule as any).MAGIC_OFFSET ??
  (MapSurfaceModule as any).MapSurface?.MAGIC_OFFSET ??
  -0.5) as number;
const wallTypes: any[] = (wallTypesModule as any).wallTypes;

/**
 * 覆盖物渲染件。
 */
export class Overlay {
  /** 宿主对象。 */
  gameObject: any;
  /** 规则。 */
  rules: any;
  /** art 容器。 */
  art: any;
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
  /** 桥图像缓存。 */
  bridgeImageCache: any;
  /** 覆盖物批处理层。 */
  mapOverlayLayer: any;
  /** 是否精灵批处理。 */
  useSpriteBatching: any;
  /** 是否完全不可见（残骸/桥占位）。 */
  isInvisible: boolean = false;
  /** 对象规则。 */
  objectRules: any;
  /** 对象 art。 */
  objectArt: any;
  /** 调试名。 */
  label: string;

  /** 位置组件。 */
  withPosition: any;
  /** 额外光照。 */
  extraLight: any;
  /** 外层 Object3D。 */
  target: any;
  /** 主渲染对象（独立路径）。 */
  mainRenderable: any;
  /** 射线拾取目标。 */
  intersectTarget: any;
  /** 上次帧 hash。 */
  lastOverlayHash: number | undefined;

  /**
   * @param gameObject - 宿主
   * @param rules - 规则
   * @param art - art 容器
   * @param imageFinder - 图片查找器
   * @param palette - 调色板
   * @param camera - 相机
   * @param lighting - 光照
   * @param debugFrame - 调试 Ref
   * @param bridgeImageCache - 桥图缓存
   * @param mapOverlayLayer - 批处理层
   * @param useSpriteBatching - 是否批处理
   */
  constructor(
    gameObject: any,
    rules: any,
    art: any,
    imageFinder: any,
    palette: any,
    camera: any,
    lighting: any,
    debugFrame: any,
    bridgeImageCache: any,
    mapOverlayLayer: any,
    useSpriteBatching: any,
  ) {
    this.gameObject = gameObject;
    this.rules = rules;
    this.art = art;
    this.imageFinder = imageFinder;
    this.palette = palette;
    this.camera = camera;
    this.lighting = lighting;
    this.debugFrame = debugFrame;
    this.bridgeImageCache = bridgeImageCache;
    this.mapOverlayLayer = mapOverlayLayer;
    this.useSpriteBatching = useSpriteBatching;
    this.objectRules = gameObject.rules;
    this.objectArt = gameObject.art;
    this.label = "overlay_" + this.objectRules.name;
    this.init();
  }

  /** 初始化位置与光照。 */
  init(): void {
    this.withPosition = new WithPosition();
    this.extraLight = new THREE.Vector3();
    this.updateLighting();
  }

  /** 高桥抬高 4 格光照。 */
  updateLighting(): void {
    const lightingType = this.objectArt.lightingType;
    this.extraLight
      .copy(
        this.lighting.compute(
          lightingType,
          this.gameObject.tile,
          this.gameObject.isHighBridge() ? 4 : 0,
        ),
      )
      .addScalar(-1);
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建外层并挂 userData.id。 */
  create3DObject(): void {
    let obj = this.get3DObject();
    if (!obj) {
      obj = new THREE.Object3D();
      obj.name = this.label;
      obj.userData.id = this.gameObject.id;
      this.target = obj;
      obj.matrixAutoUpdate = false;
      this.withPosition.matrixUpdate = true;
      this.withPosition.applyTo(this);
      this.createObjects(obj);
    }
  }

  /**
   * 按 hash 更新帧号。
   * @param now - 时间戳（未直接用）
   */
  update(now: number): void {
    if (this.isInvisible) return;
    const conditionYellow =
      !!this.gameObject.healthTrait &&
      this.gameObject.healthTrait.health <= 100 * this.rules.audioVisual.conditionYellow;
    // hash = 1e5*overlayId + 10*value + conditionY
    const hash =
      1e5 * this.gameObject.overlayId + 10 * this.gameObject.value + Number(conditionYellow);
    if (hash !== this.lastOverlayHash) {
      this.lastOverlayHash = hash;
      const frame = this.computeFrame(conditionYellow);
      if (this.mainRenderable) {
        if (frame < this.mainRenderable.frameCount) {
          this.mainRenderable.setFrame(frame);
        }
      } else {
        this.mapOverlayLayer.setObjectFrame(this.gameObject, frame);
      }
    }
  }

  /**
   * 计算帧号：桥 value=0 随机 0-3；残血墙 +wallTypes 长度。
   * @param conditionYellow - 是否残血
   */
  computeFrame(conditionYellow: boolean): number {
    let value = this.gameObject.value;
    if (this.gameObject.isBridge()) {
      if (value === 0) {
        value = getRandomInt(0, 3);
      }
    } else if (this.gameObject.wallTrait && conditionYellow) {
      const maxFrames = this.mainRenderable
        ? this.mainRenderable.frameCount
        : this.mapOverlayLayer.getObjectFrameCount(this.gameObject);
      const damageOffset = maxFrames < wallTypes.length ? 1 : wallTypes.length;
      value += damageOffset;
    }
    return value;
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

  /** 射线拾取目标。 */
  getIntersectTarget(): any {
    return this.intersectTarget;
  }

  /** UI 名称。 */
  getUiName(): any {
    return this.gameObject.getUiName();
  }

  /**
   * 构建子对象（批处理 / 独立 / 高桥阴影）。
   * @param parent - 父 Object3D
   */
  createObjects(parent: any): void {
    const foundation = this.gameObject.getFoundation();
    if (this.debugFrame.value) {
      const wire = this.createWireframe(foundation, 1);
      parent.add(wire);
    }

    if (this.objectRules.isRubble || this.gameObject.isBridgePlaceholder()) {
      this.isInvisible = true;
      return;
    }

    const needsPick =
      this.gameObject.isBridge() || this.gameObject.isTiberium() || this.gameObject.rules.wall;

    if (this.mapOverlayLayer?.shouldBeBatched(this.gameObject)) {
      this.mapOverlayLayer.addObject(this.gameObject);
      if (needsPick) {
        const box = new BoxIntersectObject3D(
          new THREE.Vector3(1, 0, 1).multiplyScalar(Coords.LEPTONS_PER_TILE),
        );
        box.position.add(
          new THREE.Vector3(foundation.width / 2, 0, foundation.height / 2).multiplyScalar(
            Coords.LEPTONS_PER_TILE,
          ),
        );
        box.matrixAutoUpdate = false;
        box.updateMatrix();
        parent.add(box);
        this.intersectTarget = box;
      }
    } else {
      const wrapper = new THREE.Object3D();
      wrapper.matrixAutoUpdate = false;
      const translation = new MapSpriteTranslation(foundation.width, foundation.height);
      const { spriteOffset, anchorPointWorld } = translation.compute();
      const offset = spriteOffset.clone().add(this.objectArt.getDrawOffset());

      let shp: any;
      if (this.gameObject.isLowBridge()) {
        const bridgeType = BridgeOverlayTypes.getOverlayBridgeType(this.gameObject.overlayId);
        let cached = this.bridgeImageCache.get(bridgeType);
        if (!cached) {
          cached = this.buildVirtualBridgeFile(bridgeType);
          this.bridgeImageCache.set(bridgeType, cached);
        }
        shp = cached;
      } else {
        shp = this.imageFinder.findByObjectArt(this.objectArt);
      }

      const renderable = (this.mainRenderable = this.createMainObject(shp, offset));
      renderable.create3DObject();
      wrapper.add(renderable.get3DObject());
      if (needsPick && renderable) {
        this.intersectTarget = renderable.getShapeMesh();
      }

      const tileSize = Coords.getWorldTileSize();
      wrapper.position.x = anchorPointWorld.x;
      wrapper.position.z = anchorPointWorld.y;

      const isXBridge = this.gameObject.isXBridge();
      if (this.gameObject.isBridge()) {
        wrapper.position.x += tileSize / 2;
        wrapper.position.z += tileSize / 2;
        wrapper.position.x += isXBridge ? 0 : tileSize;
        wrapper.position.z += isXBridge ? tileSize : 0;
      }
      if (this.gameObject.isHighBridge()) {
        wrapper.position.x -= +Coords.ISO_WORLD_SCALE;
        wrapper.position.z -= +Coords.ISO_WORLD_SCALE;
        wrapper.position.x += tileSize + (isXBridge ? 0.5 * tileSize : 0);
        wrapper.position.z += tileSize + (isXBridge ? 0.5 * tileSize : 0);
        const shadow = renderable.getShadowMesh();
        if (shadow) {
          MathUtils.translateTowardsCamera(
            shadow,
            this.camera,
            (MAGIC_OFFSET + 0.05) * Coords.ISO_WORLD_SCALE,
          );
          shadow.updateMatrix();
        }
        const shadowSurface = this.createBridgeShadowSurface();
        parent.add(shadowSurface);
      }
      wrapper.updateMatrix();
      parent.add(wrapper);
    }
  }

  /**
   * 把低桥系列 overlay 帧聚合成一个虚拟 ShpFile。
   * @param bridgeType - 桥类型
   */
  buildVirtualBridgeFile(bridgeType: any): any {
    const minId =
      bridgeType === OverlayBridgeType.Concrete
        ? BridgeOverlayTypes.minLowBridgeConcreteId
        : BridgeOverlayTypes.minLowBridgeWoodId;
    const maxId =
      bridgeType === OverlayBridgeType.Concrete
        ? BridgeOverlayTypes.maxLowBridgeConcreteId
        : BridgeOverlayTypes.maxLowBridgeWoodId;
    const result = new ShpFile();
    result.filename = "agg_" + this.gameObject.name + ".shp";
    for (let id = minId; id <= maxId; id++) {
      const overlayRules = this.rules.getOverlay(this.rules.getOverlayName(id));
      const overlayArt = this.art.getObject(overlayRules.name, ObjectType.Overlay);
      const image = this.imageFinder.findByObjectArt(overlayArt);
      if (!result.width) {
        result.width = image.width;
        result.height = image.height;
      }
      result.addImage(image.getImage(1));
    }
    return result;
  }

  /** 高桥投影用 ShadowMaterial 平面。 */
  createBridgeShadowSurface(): any {
    const foundation = this.gameObject.getFoundation();
    const w = foundation.width * Coords.getWorldTileSize();
    const h = foundation.height * Coords.getWorldTileSize();
    const geometry = new THREE.PlaneGeometry(w, h);
    geometry.applyMatrix(
      new THREE.Matrix4()
        .makeTranslation(w / 2, MAGIC_OFFSET, h / 2)
        .multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2)),
    );
    const material = new THREE.ShadowMaterial();
    material.transparent = true;
    material.opacity = 0.5;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.renderOrder = 5;
    return mesh;
  }

  /**
   * 调试线框（桥下沉 1 格高度）。
   * @param foundation - 地基
   * @param color - 颜色索引
   */
  createWireframe(foundation: any, color: number): any {
    const wire = DebugUtils.createWireframe(foundation, color);
    const isBridge = this.gameObject.isBridge();
    wire.position.y += isBridge ? Coords.tileHeightToWorld(-1) : 0;
    return wire;
  }

  /**
   * 创建主 ShpRenderable。
   * @param shp - SHP
   * @param offset - 偏移
   */
  createMainObject(shp: any, offset: any): any {
    const isWall = this.objectRules.wall;
    const lightingBias = this.gameObject.isHighBridge() ? 4 : 0;
    const renderable = ShpRenderable.factory(
      shp,
      this.palette,
      this.camera,
      offset,
      this.objectArt.hasShadow && !this.gameObject.isLowBridge(),
      lightingBias,
      isWall,
    );
    renderable.setBatched(this.useSpriteBatching);
    if (this.useSpriteBatching) {
      renderable.setBatchPalettes([this.palette]);
    }
    renderable.setFlat(this.objectArt.flat);
    renderable.setExtraLight(this.extraLight);
    return renderable;
  }

  /**
   * 移除：批处理层摘除；被拆毁的墙/高桥按地基逐格播爆炸。
   * @param renderableManager - 渲染管理器（createTransientAnim）
   */
  onRemove(renderableManager: any): void {
    if (this.mapOverlayLayer?.hasObject(this.gameObject)) {
      this.mapOverlayLayer.removeObject(this.gameObject);
    }
    if (
      this.gameObject.isDestroyed &&
      (this.gameObject.deathType === DeathType.Demolish || this.gameObject.isHighBridge())
    ) {
      const foundation = this.gameObject.getFoundation();
      const explosions = this.rules.audioVisual.bridgeExplosions;
      for (let x = 0; x < foundation.width; x++) {
        for (let y = 0; y < foundation.height; y++) {
          const animName = explosions[getRandomInt(0, explosions.length - 1)];
          renderableManager.createTransientAnim(animName, (anim: any) => {
            anim.setPosition(Coords.tile3dToWorld(x, y, 0).add(this.withPosition.getPosition()));
          });
        }
      }
    }
  }

  /** 释放主对象。 */
  dispose(): void {
    this.mainRenderable?.dispose();
  }
}
