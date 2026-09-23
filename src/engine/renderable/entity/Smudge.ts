/**
 * Smudge — 地面污痕/弹坑渲染（ShpBuilder 或批处理层）。
 *
 * 构造后 updateLighting 计算 extraLight；createObjects 走两条路：
 * mapSmudgeLayer.shouldBeBatched 时交给批处理层，否则 ImageFinder +
 * ShpBuilder 单独建网格。缺图仅 warn。
 *
 * 由 engine/renderable/entity/Smudge.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as ShpBuilderModule from "engine/renderable/builder/ShpBuilder"; // 孪生
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import { ImageFinder } from "engine/ImageFinder"; // 已转换
import * as DebugUtilsModule from "engine/gfx/DebugUtils"; // 孪生
import { MapSpriteTranslation } from "engine/renderable/MapSpriteTranslation"; // 已转换
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ShpBuilder: any = (ShpBuilderModule as any).ShpBuilder;
const DebugUtils: any = (DebugUtilsModule as any).DebugUtils;

/**
 * 地面污痕渲染件。
 */
export class Smudge {
  /** 宿主游戏对象。 */
  gameObject: any;
  /** 图片查找器。 */
  imageFinder: any;
  /** 调色板。 */
  palette: any;
  /** 相机。 */
  camera: any;
  /** 光照。 */
  lighting: any;
  /** 调试线框 Ref。 */
  debugFrame: any;
  /** 地图污痕批处理层（可选）。 */
  mapSmudgeLayer: any;
  /** art 规则（= gameObject.art）。 */
  objectArt: any;
  /** 调试标签。 */
  label: string;

  /** 位置组件。 */
  withPosition: any;
  /** 额外光照向量。 */
  extraLight: any;
  /** 外层 Object3D。 */
  target: any;
  /** ShpBuilder 实例（非批处理路径）。 */
  builder: any;

  /**
   * @param gameObject - 宿主对象
   * @param imageFinder - 图片查找器
   * @param palette - 调色板
   * @param camera - 相机
   * @param lighting - 光照
   * @param debugFrame - 调试 Ref
   * @param mapSmudgeLayer - 批处理层
   */
  constructor(
    gameObject: any,
    imageFinder: any,
    palette: any,
    camera: any,
    lighting: any,
    debugFrame: any,
    mapSmudgeLayer: any,
  ) {
    this.gameObject = gameObject;
    this.imageFinder = imageFinder;
    this.palette = palette;
    this.camera = camera;
    this.lighting = lighting;
    this.debugFrame = debugFrame;
    this.mapSmudgeLayer = mapSmudgeLayer;
    this.objectArt = gameObject.art;
    this.label = "smudge_" + gameObject.name;
    this.init();
  }

  /** 初始化位置组件与光照。 */
  init(): void {
    this.withPosition = new WithPosition();
    this.extraLight = new THREE.Vector3();
    this.updateLighting();
  }

  /** 按地块光照刷新 extraLight。 */
  updateLighting(): void {
    this.extraLight
      .copy(this.lighting.compute(this.objectArt.lightingType, this.gameObject.tile))
      .addScalar(-1);
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建外层并应用位置。 */
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

  /** 无逐帧更新（孪生空实现）。 */
  update(_now: number): void {}

  /**
   * 转发到 WithPosition。
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
   * 构建子对象：批处理或 ShpBuilder 单网格。
   * @param parent - 父 Object3D
   */
  createObjects(parent: any): void {
    let tile = { width: 1, height: 1 };
    if (this.debugFrame.value) {
      const wire = DebugUtils.createWireframe(tile, 0);
      parent.add(wire);
    }

    if (this.mapSmudgeLayer?.shouldBeBatched(this.gameObject)) {
      this.mapSmudgeLayer.addObject(this.gameObject);
    } else {
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

      const translation = new MapSpriteTranslation(tile.width, tile.height);
      const { spriteOffset, anchorPointWorld } = translation.compute();
      const offset = spriteOffset.clone().add(this.objectArt.getDrawOffset());

      const builder = (this.builder = new ShpBuilder(
        shp,
        this.palette,
        this.camera,
        Coords.ISO_WORLD_SCALE,
      ));
      builder.setOffset(offset);
      builder.flat = this.objectArt.flat;
      builder.setExtraLight(this.extraLight);

      const mesh = builder.build();
      const wrapper = new THREE.Object3D();
      wrapper.matrixAutoUpdate = false;
      wrapper.add(mesh);
      wrapper.position.x = anchorPointWorld.x;
      wrapper.position.z = anchorPointWorld.y;
      wrapper.updateMatrix();
      parent.add(wrapper);
    }
  }

  /** 从批处理层摘除。 */
  onRemove(): void {
    if (this.mapSmudgeLayer?.hasObject(this.gameObject)) {
      this.mapSmudgeLayer.removeObject(this.gameObject);
    }
  }

  /** 释放 builder。 */
  dispose(): void {
    this.builder?.dispose();
  }
}
