/**
 * Overlay — 覆盖物对象（墙/桥/矿/装饰等贴地单格对象）。
 *
 * 由 ObjectType.Overlay 继承 GameObject；factory 在规则带 wall 时自动挂
 * WallTrait。查询方法委托 BridgeOverlayTypes / OreOverlayTypes：
 *  - isTiberium：OreOverlayTypes.getOverlayTibType 非 undefined；
 *  - isBridge/isXBridge/isHighBridge/isLowBridge/isBridgePlaceholder：
 *    按 overlayId 分类；
 *  - getFoundation：普通 1×1；桥非 X 横向 +2，X 桥纵向 +2；
 *  - getLandType：墙→Wall；矿→Tiberium；高桥→Road；否则取 rules.land。
 *
 * 由 game/gameobject/Overlay.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换
import * as GameObjectModule from "game/gameobject/GameObject"; // 已转换
import * as BridgeOverlayTypesModule from "game/map/BridgeOverlayTypes"; // 已转换
import * as OreOverlayTypesModule from "game/map/OreOverlayTypes"; // 已转换
import * as WallTraitModule from "game/gameobject/trait/WallTrait"; // 已转换
import * as LandTypeModule from "game/type/LandType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Overlay extends GameObjectModule.GameObject {
  /** 覆盖物 overlayId（由工厂/规则层注入；桥/矿分类查询用）。 */
  overlayId: any;
  /** 规则声明是否为墙。 */
  radarInvisible: boolean;
  /** 挂在本对象上的墙体 trait（factory 在 wall 规则时创建）。 */
  wallTrait: any;

  /**
   * 工厂：构造 Overlay；rules.wall 时创建 WallTrait 并加入 traits。
   */
  static factory(name: string, rules: any, art: any): Overlay {
    const obj = new this(name, rules, art);
    if (rules.wall) {
      obj.wallTrait = new WallTraitModule.WallTrait();
      obj.traits.add(obj.wallTrait);
    }
    return obj;
  }

  constructor(name: string, rules: any, art: any) {
    super(ObjectTypeModule.ObjectType.Overlay, name, rules, art);
    this.radarInvisible = this.rules.radarInvisible;
  }

  /** 是否为泰伯利亚矿覆盖物。 */
  isTiberium(): boolean {
    return void 0 !== OreOverlayTypesModule.OreOverlayTypes.getOverlayTibType(this.overlayId);
  }

  /** 是否为桥。 */
  isBridge(): boolean {
    return BridgeOverlayTypesModule.BridgeOverlayTypes.isBridge(this.overlayId);
  }

  /** 是否为交叉桥（X 型）。 */
  isXBridge(): boolean {
    return BridgeOverlayTypesModule.BridgeOverlayTypes.isXBridge(this.overlayId);
  }

  /** 是否为高架桥。 */
  isHighBridge(): boolean {
    return BridgeOverlayTypesModule.BridgeOverlayTypes.isHighBridge(this.overlayId);
  }

  /** 是否为低矮桥（可从下方通行）。 */
  isLowBridge(): boolean {
    return BridgeOverlayTypesModule.BridgeOverlayTypes.isLowBridge(this.overlayId);
  }

  /** 是否为桥占位（不可通行的占位格）。 */
  isBridgePlaceholder(): boolean {
    return BridgeOverlayTypesModule.BridgeOverlayTypes.isBridgePlaceholder(this.overlayId);
  }

  /** 占位尺寸：普通 1×1；非 X 桥宽 +2；X 桥高 +2。 */
  getFoundation(): { width: number; height: number } {
    const foundation = { width: 1, height: 1 };
    if (this.isBridge()) {
      if (this.isXBridge()) foundation.height += 2;
      else foundation.width += 2;
    }
    return foundation;
  }

  /** 地表类型：墙→Wall；矿→Tiberium；高桥→Road；否则 rules.land。 */
  getLandType(): any {
    return this.rules.wall
      ? LandTypeModule.LandType.Wall
      : this.isTiberium()
        ? LandTypeModule.LandType.Tiberium
        : this.isBridge() && this.isHighBridge()
          ? LandTypeModule.LandType.Road
          : this.rules.land;
  }
}
