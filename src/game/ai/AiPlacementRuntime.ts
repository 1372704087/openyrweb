/**
 * AiPlacementRuntime — 原版 AI 建筑放置选址移植（批次 5 第二切片）。
 *
 * 依据 gamemd.exe 1.001 反编译（0x443C60 放置分支 + BaseClass/FailedToPlaceNode）：
 * - 候选位置：节点固定位置优先（BuildingType+3720 标记，来自 BaseNode），否则从
 *   BaseClass 的 Cell 候选列表选格（列表=围绕既有基地的可放格，构建于节点登记时）。
 * - 无候选位置：若当前正在生产该类型 → 撤销该建造条目（队列压缩，0x443C60 内
 *   +22276/+16 计数递减段）。
 * - 放置尝试：sub_45EE70(&cell, house)，返回码 1=放置失败 → 节点失败计数 +1
 *   （FailedToPlaceNode 0x42F380）；非战役且失败次数超过 [General] 数组
 *   （+3656，按难度索引）→ 取消该建造条目。
 * - 位置换算：cell → lepton 为 (coord<<8)+128（半格偏移），放置目标即该 cell。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/** 基地规划节点（BaseNodeClass 语义层）。 */
export interface PlacementNode {
  /** 来源 Prerequisite 组键。 */
  groupName: string;
  /** 要放置的建筑类型名。 */
  typeName: string;
  /** 节点固定位置（原版 +3720 标记节点；无则走候选格）。 */
  fixedPos?: { x: number; y: number };
  /** 放置失败计数（原版 node+12）。 */
  failCount: number;
}

/** 选址 world：地图可行性检测与放置动作由引擎侧注入。 */
export interface PlacementWorld {
  /** 该类型能否放在此格（地基形状/地形/占用，原版 foundation 检测）。 */
  canPlace(typeName: string, x: number, y: number): boolean;
  /** 候选格列表（BaseClass Cell 列表：围绕既有基地的可放格，按优先序）。 */
  candidateCells(typeName: string): { x: number; y: number }[];
  /** 当前是否正在生产该类型（原版 +22276 队列头比对）。 */
  isProducing(typeName: string): boolean;
  /** 撤销当前生产条目（队列压缩）。 */
  cancelCurrentProduction(): void;
  /** 尝试放置（sub_45EE70）：返回 1=失败，其余=成功/其他状态。 */
  place(typeName: string, x: number, y: number): number;
  /** 非战役。 */
  isCampaign(): boolean;
  /** 难度（失败上限数组索引）。 */
  difficulty(): number;
  /** [General] 失败上限数组（+3656，按难度；原版键名待考证，缺省 3,2,1）。 */
  failLimits(): number[];
}

export type PlacementResult =
  | "placed"
  | "failed"
  | "cancelled"
  | "no-position"
  | "idle";

/**
 * 单节点放置尝试（0x443C60 放置分支移植）。
 * 顺序：固定位置 → 候选格遍历 → 无位取消生产 → 放置 → 失败计数/超限取消。
 */
export function attemptPlacement(
  node: PlacementNode,
  world: PlacementWorld,
): PlacementResult {
  // 1. 候选位置：固定位置优先，否则遍历候选格
  let target: { x: number; y: number } | null = null;
  if (node.fixedPos) {
    if (world.canPlace(node.typeName, node.fixedPos.x, node.fixedPos.y)) {
      target = node.fixedPos;
    }
  } else {
    const cells = world.candidateCells(node.typeName) || [];
    for (let i = 0; i < cells.length; i++) {
      if (world.canPlace(node.typeName, cells[i].x, cells[i].y)) {
        target = cells[i];
        break;
      }
    }
  }

  // 2. 无候选位置：正在生产 → 撤销条目（原版返回前压缩 +22276 队列）
  if (!target) {
    if (world.isProducing(node.typeName)) {
      world.cancelCurrentProduction();
    }
    return "no-position";
  }

  // 3. 放置尝试与失败计数
  const result = world.place(node.typeName, target.x, target.y);
  if (result === 1) {
    node.failCount++;
    const limits = world.failLimits() || [3, 2, 1];
    const limit = limits[world.difficulty()] ?? 3;
    if (!world.isCampaign() && node.failCount > limit) {
      if (world.isProducing(node.typeName)) {
        world.cancelCurrentProduction();
      }
      return "cancelled";
    }
    return "failed";
  }
  return "placed";
}

/**
 * 节点列表放置主循环（0x443C60 遍历语义：按序尝试，每次至多成功一个节点，
 * 失败节点保留待下轮重试，超限节点由 attemptPlacement 内部取消生产）。
 * @returns 本轮结果："placed" | "failed" | "no-position" | "cancelled" | "idle"
 */
export function processPlacementNodes(
  nodes: PlacementNode[],
  world: PlacementWorld,
): PlacementResult {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;
    const r = attemptPlacement(node, world);
    if (r === "placed") return "placed";
    if (r === "cancelled") {
      // 超限节点出队
      nodes.splice(i, 1);
      return "cancelled";
    }
    if (r === "no-position") return "no-position";
    // failed → 继续尝试下一节点
  }
  return "idle";
}
