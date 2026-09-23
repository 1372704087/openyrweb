/**
 * BridgeOverlayTypes — 桥梁 overlay ID 区间判定与桥头 ID 计算。
 *
 * 高/低桥各有 Wood/Concrete 两段 id 区间；placeholder id 单独列出。
 * isXBridge / isLowBridgeHead* 用于 Bridges 桥头变体重算；
 * calculateLow/HighBridgeOverlayId 按材料与朝向位算最终 id。
 *
 * 由 game/map/BridgeOverlayTypes.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { isBetween } from "util/math"; // 已转换

/** 桥梁材料/形态分类（与孪生枚举值一致）。 */
export enum OverlayBridgeType {
  /** 非桥梁 overlay。 */
  NotBridge = 0,
  /** 混凝土桥。 */
  Concrete = 1,
  /** 木桥。 */
  Wood = 2,
}

/** 桥梁 overlay 静态查询表。 */
export class BridgeOverlayTypes {
  /** 低桥木桥 id 下界。 */
  static minLowBridgeWoodId = 74;
  /** 低桥木桥 id 上界。 */
  static maxLowBridgeWoodId = 99;
  /** 低桥混凝土 id 下界。 */
  static minLowBridgeConcreteId = 205;
  /** 低桥混凝土 id 上界。 */
  static maxLowBridgeConcreteId = 230;
  /** 高桥混凝土 id 下界。 */
  static minHighBridgeConcreteId = 24;
  /** 高桥混凝土 id 上界。 */
  static maxHighBridgeConcreteId = 25;
  /** 高桥木桥 id 下界。 */
  static minHighBridgeWoodId = 237;
  /** 高桥木桥 id 上界。 */
  static maxHighBridgeWoodId = 238;
  /** 桥梁占位（placeholder）overlay id 列表。 */
  static bridgePlaceholderIds = [100, 101, 231, 232];

  /** overlay id → 桥梁类型；不在任何区间时 NotBridge。 */
  static getOverlayBridgeType(overlayId: number): OverlayBridgeType {
    return isBetween(overlayId, this.minHighBridgeConcreteId, this.maxHighBridgeConcreteId) ||
      isBetween(overlayId, this.minLowBridgeConcreteId, this.maxLowBridgeConcreteId)
      ? OverlayBridgeType.Concrete
      : isBetween(overlayId, this.minHighBridgeWoodId, this.maxHighBridgeWoodId) ||
          isBetween(overlayId, this.minLowBridgeWoodId, this.maxLowBridgeWoodId)
        ? OverlayBridgeType.Wood
        : OverlayBridgeType.NotBridge;
  }

  /** 是否为任意高桥或低桥 overlay。 */
  static isBridge(overlayId: number): boolean {
    return this.isHighBridge(overlayId) || this.isLowBridge(overlayId);
  }

  /** 是否为桥梁占位 id。 */
  static isBridgePlaceholder(overlayId: number): boolean {
    return this.bridgePlaceholderIds.includes(overlayId);
  }

  static isHighBridge(overlayId: number): boolean {
    return (
      isBetween(overlayId, this.minHighBridgeWoodId, this.maxHighBridgeWoodId) ||
      isBetween(overlayId, this.minHighBridgeConcreteId, this.maxHighBridgeConcreteId)
    );
  }

  static isLowBridge(overlayId: number): boolean {
    return (
      isBetween(overlayId, this.minLowBridgeWoodId, this.maxLowBridgeWoodId) ||
      isBetween(overlayId, this.minLowBridgeConcreteId, this.maxLowBridgeConcreteId)
    );
  }

  /** X 向（对角走向）桥体/桥头相关 id 集合判定。 */
  static isXBridge(overlayId: number): boolean {
    return (
      overlayId === this.minHighBridgeWoodId ||
      overlayId === this.minHighBridgeConcreteId ||
      isBetween(overlayId, this.minLowBridgeWoodId, this.minLowBridgeWoodId + 8) ||
      isBetween(overlayId, this.minLowBridgeWoodId + 18, this.minLowBridgeWoodId + 21) ||
      isBetween(overlayId, this.minLowBridgeConcreteId, this.minLowBridgeConcreteId + 8) ||
      isBetween(overlayId, this.minLowBridgeConcreteId + 18, this.minLowBridgeConcreteId + 21)
    );
  }

  /** 低桥桥头（头区 id 段）。 */
  static isLowBridgeHead(overlayId: number): boolean {
    return (
      isBetween(overlayId, this.minLowBridgeWoodId + 18, this.minLowBridgeWoodId + 25) ||
      isBetween(overlayId, this.minLowBridgeConcreteId + 18, this.minLowBridgeConcreteId + 25)
    );
  }

  /** 低桥桥头起始端（Start 头，而非 End 头）。 */
  static isLowBridgeHeadStart(overlayId: number): boolean {
    return (
      isBetween(overlayId, this.minLowBridgeWoodId + 20, this.minLowBridgeWoodId + 23) ||
      isBetween(overlayId, this.minLowBridgeConcreteId + 20, this.minLowBridgeConcreteId + 23)
    );
  }

  /**
   * 低桥桥头最终 overlay id。
   * @param type - 桥梁材料类型
   * @param isStart - true 偏移 0，false 偏移 9；非 Wood/Concrete 抛错
   */
  static calculateLowBridgeOverlayId(type: OverlayBridgeType, isStart: boolean): number {
    let base: number;
    if (type === OverlayBridgeType.Concrete) {
      base = this.minLowBridgeConcreteId;
    } else {
      if (type !== OverlayBridgeType.Wood) throw new Error("Not implemented");
      base = this.minLowBridgeWoodId;
    }
    return base + (isStart ? 0 : 9);
  }

  /**
   * 高桥桥头最终 overlay id。
   * @param type - 桥梁材料类型
   * @param isStart - true 偏移 0，false 偏移 1；非 Wood/Concrete 抛错
   */
  static calculateHighBridgeOverlayId(type: OverlayBridgeType, isStart: boolean): number {
    let base: number;
    if (type === OverlayBridgeType.Concrete) {
      base = this.minHighBridgeConcreteId;
    } else {
      if (type !== OverlayBridgeType.Wood) throw new Error("Not implemented");
      base = this.minHighBridgeWoodId;
    }
    return base + (isStart ? 0 : 1);
  }
}
