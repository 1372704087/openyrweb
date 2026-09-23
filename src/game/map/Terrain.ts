/**
 * Terrain — 地形通行图（passability graph）与 A* 寻路封装。
 *
 * 按 SpeedType × onBridge 图模式 × crushMode 缓存 util/Graph；tile 占用
 * 变更增量失效。computePath 签名为 (speedType, onBridge 图模式,
 * startTile, startOnBridge, endTile, endOnBridge, options)，组装启发/边权
 * 后调 PathFinder；目标不在图时 bestEffort 用环形搜索找可达落点。
 * isBlockerObject / getPassableSpeed 含 OmniCrusher、战车工厂全地基封锁
 * 等原版语义。
 *
 * 由 game/map/Terrain.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { TileCollection, TileDirection } from "game/map/TileCollection"; // 已转换
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { Graph } from "util/Graph"; // 已转换
import { PathFinder } from "game/map/pathFinder/PathFinder"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import * as geometry from "util/geometry"; // 已转换
import { LandType, getLandType } from "game/type/LandType"; // 已转换
import { OccupationBits } from "game/rules/TerrainRules"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 通行图节点数据。 */
type PassNodeData = {
  tile: any;
  onBridge: any;
  islandId?: number;
  forceLandSpeed?: number;
};

/** 纯几何边权：对角修正的曼哈顿（octile）距离。 */
function edgeDistance(a: any, b: any): number {
  const dx = Math.abs(a.data.tile.rx - b.data.tile.rx);
  const dy = Math.abs(a.data.tile.ry - b.data.tile.ry);
  return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
}

/**
 * 启发函数：octile + 相对父节点转向罚 0.2。
 * 转向写入 state.dirX/dirY（与孪生副作用一致）。
 */
function edgeHeuristic(a: any, b: any, state?: any): number {
  const dx = Math.abs(a.data.tile.rx - b.data.tile.rx);
  const dy = Math.abs(a.data.tile.ry - b.data.tile.ry);
  let h = dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  if (state?.parent) {
    const parent = state.parent.node;
    const turnX = parent.data.tile.rx - a.data.tile.rx;
    const turnY = parent.data.tile.ry - a.data.tile.ry;
    state.dirX = turnX;
    state.dirY = turnY;
    if (!(turnX === state.parent.dirX && turnY === state.parent.dirY)) h += 0.2;
  }
  return h;
}

/** 地形通行与寻路。 */
export class Terrain {
  tiles: TileCollection | any;
  theaterType: any;
  mapBounds: any;
  tileOccupation: any;
  rules: any;
  /** 通行图缓存：key = speed_onBridge[_crushMode]。 */
  passabilityGraphs = new Map<string, Graph<PassNodeData>>();
  /** 各缓存图待失效的 tile 集合。 */
  invalidatedTiles = new Map<string, Set<any>>();
  /** 地表类型：SpeedType 速度修正在 Tiberium 与该地表上是否同为 0。 */
  tiberiumMayChangePassability = new Set<LandType>();

  handleTileOccupationUpdate: (payload: any) => void;
  handleMapBoundsResize: () => void;

  constructor(
    tiles: TileCollection | any,
    theaterType: any,
    mapBounds: any,
    tileOccupation: any,
    rules: any,
  ) {
    this.tiles = tiles;
    this.theaterType = theaterType;
    this.mapBounds = mapBounds;
    this.tileOccupation = tileOccupation;
    this.rules = rules;
    this.passabilityGraphs = new Map();
    this.invalidatedTiles = new Map();
    this.tiberiumMayChangePassability = new Set();

    this.handleTileOccupationUpdate = ({ tiles: changedTiles, object }: any) => {
      const relevant = changedTiles.filter((tile: any) => {
        if (object.isOverlay()) {
          if (object.isBridge()) return true;
          if (object.isTiberium()) {
            const land = getLandType(tile.terrainType);
            if (this.tiberiumMayChangePassability.has(land)) return true;
          }
        }
        const speed = SpeedType.Foot;
        const useBridgeLand = !object.isTerrain();
        return (
          this.isBlockerObject(object, tile, false, speed, useBridgeLand) ||
          (object.isBuilding() && object.rules.leaveRubble)
        );
      });
      if (relevant.length) this.invalidateTiles(relevant);
    };
    this.handleMapBoundsResize = () => {
      this.passabilityGraphs.clear();
    };
    tileOccupation.onChange.subscribe(this.handleTileOccupationUpdate);
    mapBounds.onLocalResize.subscribe(this.handleMapBoundsResize);
    this.tiberiumMayChangePassability.clear();
    // 预计算：Tiberium 上某 SpeedType 的 0/非0 修正是否会因地表切换而变化
    const tibRules = this.rules.getLandRules(LandType.Tiberium);
    for (const speed of Object.values(SpeedType).filter((v) => "string" != typeof v)) {
      const tibEnabled = Boolean(Math.sign(tibRules.getSpeedModifier(speed as SpeedType)));
      for (const land of Object.values(LandType).filter((v) => "string" != typeof v)) {
        const landEnabled = Boolean(
          Math.sign(
            this.rules.getLandRules(land as LandType).getSpeedModifier(speed as SpeedType),
          ),
        );
        if (landEnabled !== tibEnabled) this.tiberiumMayChangePassability.add(land as LandType);
      }
    }
  }

  /** 通行图缓存键。 */
  getGraphKey(speedType: any, onBridge: boolean, crushMode = ""): string {
    return speedType + "_" + Number(onBridge) + (crushMode ? "_" + crushMode : "");
  }

  /** 把 tiles 登记到所有已缓存图的失效集合。 */
  invalidateTiles(tiles: any[]): void {
    if (tiles.length) {
      [...this.passabilityGraphs.keys()].forEach((key) => {
        let set = this.invalidatedTiles.get(key);
        if (set) tiles.forEach((t) => set!.add(t));
        else this.invalidatedTiles.set(key, new Set(tiles));
      });
    }
  }

  /**
   * 计算路径（返回 **起点在末尾** 的节点数组，与孪生一致）。
   *
   * @param speedType - 移动速度类型（图键）
   * @param onBridgeGraph - 图是否按"可走桥"模式构建
   * @param startTile / startOnBridge - 起点 tile 与其上桥位
   * @param endTile / endOnBridge - 终点 tile 与其上桥位
   *
   * 短距默认单向；`(endTile - startTile)` 在孪生中对对象做减法得 NaN，
   * 阈值 16 恒不满足——除非调用方显式传 bidirectional。
   * 目标不在图且 bestEffort 时用 RadialTileFinder 半径 15/5 找落点；
   * 否则强插目标节点并把 maxExpandedNodes 压到 500。
   */
  computePath(
    speedType: any,
    onBridgeGraph: boolean,
    startTile: any,
    startOnBridge: boolean,
    endTile: any,
    endOnBridge: boolean,
    {
      maxExpandedNodes = Number.POSITIVE_INFINITY,
      bestEffort = true,
      excludeTiles,
      ignoredBlockers = [] as any[],
      bidirectional: bidirectionalOpt,
      mover,
    }: {
      maxExpandedNodes?: number;
      bestEffort?: boolean;
      excludeTiles?: (node: any) => boolean;
      ignoredBlockers?: any[];
      bidirectional?: boolean;
      mover?: any;
    } = {},
  ): any[] {
    // 短距离寻路用单向 A*（固定开销更小、路径更稳），长距离才启用双向。
    // 孪生对 tile 对象做减法 → NaN → 阈值恒 false（原样保留）。
    let useBidirectional = bidirectionalOpt;
    if (void 0 === useBidirectional) {
      const dx = Math.abs((startTile as any) - (endTile as any));
      const dy = Math.abs((startOnBridge as any) - (endOnBridge as any));
      useBidirectional = 16 <= dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
    }
    // OmniCrusher（如要塞）按可碾穿对象寻路；图按 crush mode 分缓存。
    const crushMode = mover?.crusher && mover.omniCrusher ? "omni" : "";
    const graph = this.computePassabilityGraph(speedType, onBridgeGraph, crushMode);
    // ignoredBlockers 所占格临时改为可通行
    const ignoredTiles = ignoredBlockers
      .map((obj) => this.tileOccupation.calculateTilesForGameObject(obj.tile, obj))
      .reduce((acc: any[], t: any[]) => acc.concat(t), [] as any[]);
    if (ignoredTiles.length) {
      this.updatePassability(
        ignoredTiles,
        speedType,
        onBridgeGraph,
        graph,
        ignoredBlockers,
        void 0,
        crushMode,
      );
    }
    const startId = this.getNodeId(startTile, startOnBridge);
    const startInGraph = !!graph.hasNode(startId);
    if (!startInGraph) {
      // forcePass=1：强制把起点标为可通行节点（临时）
      this.updatePassability(
        [startTile],
        speedType,
        onBridgeGraph,
        graph,
        ignoredBlockers,
        1,
        crushMode,
      );
    }
    const goalId = this.getNodeId(endTile, endOnBridge);
    const goalInGraph = !!graph.hasNode(goalId);
    // 连通性谓词：起点已知且无忽略阻挡 → 岛 id 相等；否则退回速度探测
    const canUseIslands = startInGraph && !ignoredTiles.length;
    let isConnected: (tile: any, onBridge: boolean) => boolean;
    if (canUseIslands) {
      const islands = this.getIslandIdMap(speedType, onBridgeGraph, crushMode);
      const startIsland = islands.get(startTile, startOnBridge);
      isConnected = (tile, onBridge) => islands.get(tile, onBridge) === startIsland;
    } else {
      isConnected = (tile, onBridge) =>
        0 <
        this.getPassableSpeed(
          tile,
          speedType,
          onBridgeGraph,
          onBridge,
          ignoredBlockers,
          false,
          void 0,
          crushMode,
        );
    }
    let goalTile = endTile;
    let goalOnBridge = endOnBridge;
    if (!goalInGraph || !isConnected(endTile, endOnBridge)) {
      const fallback = bestEffort
        ? new RadialTileFinder(
            this.tiles,
            this.mapBounds,
            endTile,
            { width: 1, height: 1 },
            1,
            canUseIslands ? 15 : 5,
            (tile: any) =>
              isConnected(tile, false) &&
              Math.abs(tile.z - endTile.z) < 2 &&
              !excludeTiles?.({ tile, onBridge: void 0 }),
          ).getNextTile()
        : void 0;
      if (fallback) {
        goalTile = fallback;
        goalOnBridge = false;
      } else {
        if (canUseIslands) {
          if (ignoredTiles.length) {
            this.updatePassability(
              ignoredTiles,
              speedType,
              onBridgeGraph,
              graph,
              void 0,
              void 0,
              crushMode,
            );
          }
          return [];
        }
        // 非岛模式：强插目标节点并限步
        graph.addNode(goalId, { tile: goalTile, onBridge: void 0 });
        maxExpandedNodes = Math.min(maxExpandedNodes, 500);
      }
    }
    const finder = PathFinder(graph, {
      bestEffort,
      maxExpandedNodes,
      excludedNodes: excludeTiles,
      distance: edgeDistance,
      heuristic: edgeHeuristic,
      bidirectional: useBidirectional,
    });
    let path = finder
      .find(this.getNodeId(startTile, startOnBridge), this.getNodeId(goalTile, goalOnBridge))
      .map((node: any) => ({ tile: node.data.tile, onBridge: node.data.onBridge }));
    // 长度不足或 excludeTiles 要求端点严格吻合时清空
    if (
      path.length < 2 ||
      (excludeTiles &&
        path.length &&
        ((!bestEffort && path[0].tile !== goalTile) ||
          path[path.length - 1].tile !== startTile))
    ) {
      path = [];
    }
    if (!startInGraph) {
      graph.removeNode(startId);
      this.updatePassability(
        [startTile],
        speedType,
        onBridgeGraph,
        graph,
        void 0,
        void 0,
        crushMode,
      );
    }
    if (!goalInGraph) graph.removeNode(goalId);
    if (ignoredTiles.length) {
      this.updatePassability(
        ignoredTiles,
        speedType,
        onBridgeGraph,
        graph,
        void 0,
        void 0,
        crushMode,
      );
    }
    return path;
  }

  /** 预计算所有 SpeedType（除 Winged）× onBridge 的通行图。 */
  computeAllPassabilityGraphs(): void {
    Object.keys(SpeedType).forEach((key) => {
      const speed = Number(key);
      if (isNaN(speed) || speed === SpeedType.Winged) return;
      this.computePassabilityGraph(speed, false);
      this.computePassabilityGraph(speed, true);
    });
  }

  /** 取（或建）指定 key 的通行图，并处理失效 tile 的增量重建。 */
  computePassabilityGraph(
    speedType: any,
    onBridge: boolean,
    crushMode = "",
  ): Graph<PassNodeData> {
    const key = this.getGraphKey(speedType, onBridge, crushMode);
    let graph = this.passabilityGraphs.get(key);
    if (graph) {
      const dirty = this.invalidatedTiles.get(key);
      if (dirty?.size) {
        this.updatePassability([...dirty], speedType, onBridge, graph, [], void 0, crushMode);
        dirty.clear();
        this.computeIslandIds(graph);
      }
    } else {
      graph = new Graph<PassNodeData>();
      this.passabilityGraphs.set(key, graph);
      this.tiles.forEach((tile: any) => {
        this.computePassability(tile, speedType, onBridge, graph, [], void 0, crushMode);
      });
      this.computeIslandIds(graph);
    }
    return graph;
  }

  /**
   * 增量更新若干 tile 的节点与边（含 Right/BottomRight/Bottom/BottomLeft 邻域）。
   * 删除前保留 islandId，重建后写回。
   * @param forcePass - 非 undefined 时仅对 tiles 列表内 tile 强制 forceLandSpeed
   */
  updatePassability(
    tiles: any[],
    speedType: any,
    onBridge: boolean,
    graph: Graph<PassNodeData>,
    ignoredBlockers: any[] = [],
    forcePass?: number,
    crushMode = "",
  ): void {
    const affected = new Set<any>();
    tiles.forEach((tile: any) => {
      [
        tile,
        this.tiles.getNeighbourTile(tile, TileDirection.Right),
        this.tiles.getNeighbourTile(tile, TileDirection.BottomRight),
        this.tiles.getNeighbourTile(tile, TileDirection.Bottom),
        this.tiles.getNeighbourTile(tile, TileDirection.BottomLeft),
      ]
        .filter(isNotNullOrUndefined)
        .forEach((t) => affected.add(t));
    });
    const preservedIslands = new Map<unknown, number | undefined>();
    tiles.forEach((tile: any) => {
      for (const id of [this.getNodeId(tile, false), this.getNodeId(tile, true)]) {
        const node = graph.getNode(id);
        if (node) {
          preservedIslands.set(node.id, node.data.islandId);
          graph.removeNode(node.id);
        }
      }
    });
    affected.forEach((tile: any) => {
      this.computePassability(
        tile,
        speedType,
        onBridge,
        graph,
        ignoredBlockers,
        forcePass && tiles.includes(tile) ? forcePass : void 0,
        crushMode,
      );
    });
    preservedIslands.forEach((islandId, id) => {
      const node = graph.getNode(id);
      if (node) node.data.islandId = islandId;
    });
  }

  /**
   * 为单 tile 建地/桥节点，并向 Left/TopLeft/Top/TopRight 四邻连边。
   * @param forceLandSpeed - 非 undefined 时强制视为可通行
   */
  computePassability(
    tile: any,
    speedType: any,
    onBridge: boolean,
    graph: Graph<PassNodeData>,
    ignoredBlockers: any[] = [],
    forceLandSpeed?: number,
    crushMode = "",
  ): void {
    const linkDirs = [
      TileDirection.Left,
      TileDirection.TopLeft,
      TileDirection.Top,
      TileDirection.TopRight,
    ];
    if (
      forceLandSpeed ||
      this.getPassableSpeed(
        tile,
        speedType,
        onBridge,
        false,
        ignoredBlockers,
        false,
        void 0,
        crushMode,
      )
    ) {
      const id = this.getNodeId(tile, false);
      if (!graph.hasNode(id)) {
        graph.addNode(id, {
          tile,
          onBridge: void 0,
          forceLandSpeed: forceLandSpeed as any,
        });
      }
      for (const dir of linkDirs) {
        this.connectTiles(tile, void 0, dir, speedType, onBridge, graph, ignoredBlockers, crushMode);
      }
    }
    const bridge = this.tileOccupation.getBridgeOnTile(tile);
    if (
      bridge &&
      (forceLandSpeed ||
        this.getPassableSpeed(
          tile,
          speedType,
          onBridge,
          true,
          ignoredBlockers,
          false,
          void 0,
          crushMode,
        ))
    ) {
      const id = this.getNodeId(tile, true);
      if (!graph.hasNode(id)) {
        graph.addNode(id, {
          tile,
          onBridge: bridge,
          forceLandSpeed: forceLandSpeed as any,
        });
      }
      for (const dir of linkDirs) {
        this.connectTiles(tile, bridge, dir, speedType, onBridge, graph, ignoredBlockers, crushMode);
      }
    }
  }

  /**
   * 从 fromTile（可选所在桥）向 dir 邻格连边。
   * 高程差超阈值（无桥 1 / 有桥 0）：若两侧非高架或地面 z 不等则不连；
   * 否则清空桥上下文按地节点继续（与孪生一致）。
   */
  connectTiles(
    fromTile: any,
    fromBridge: any,
    direction: TileDirection,
    speedType: any,
    onBridge: boolean,
    graph: Graph<PassNodeData>,
    ignoredBlockers: any[] = [],
    crushMode = "",
  ): void {
    const neighbour = this.tiles.getNeighbourTile(fromTile, direction);
    if (neighbour) {
      let neighbourBridge = this.tileOccupation.getBridgeOnTile(neighbour);
      const maxStep = fromBridge || neighbourBridge ? 0 : 1;
      const elevDiff = Math.abs(
        fromTile.z +
          (fromBridge?.tileElevation ?? 0) -
          (neighbour.z + (neighbourBridge?.tileElevation ?? 0)),
      );
      if (elevDiff > maxStep) {
        if (
          (!neighbourBridge?.isHighBridge() && !fromBridge?.isHighBridge()) ||
          0 !== Math.abs(fromTile.z - neighbour.z) ||
          !graph.hasNode(this.getNodeId(fromTile, false))
        ) {
          return;
        }
        fromBridge = neighbourBridge = void 0;
      }
      const neighbourId = this.getNodeId(neighbour, !!neighbourBridge);
      let neighbourNode = graph.getNode(neighbourId);
      if (
        this.getPassableSpeed(
          neighbour,
          speedType,
          onBridge,
          !!neighbourBridge,
          ignoredBlockers,
          void 0,
          neighbourNode?.data.forceLandSpeed,
          crushMode,
        )
      ) {
        neighbourNode =
          neighbourNode ??
          graph.addNode(neighbourId, { tile: neighbour, onBridge: neighbourBridge });
        const fromId = this.getNodeId(fromTile, !!fromBridge);
        graph.getNode(fromId)!.addLink(neighbourNode);
      }
    }
  }

  /** 图节点 id：`tile.id` + 可选 `_bridge` 后缀。 */
  getNodeId(tile: any, onBridge?: any): string {
    return tile.id + (onBridge ? "_bridge" : "");
  }

  /** 两遍洪泛标注 islandId。 */
  computeIslandIds(graph: Graph<PassNodeData>): void {
    let nextId = 1;
    graph.forEachNode((node) => {
      node.data.islandId = void 0;
    });
    graph.forEachNode((node) => {
      if (!node.data.islandId) this.floodIslandId(node, nextId++);
    });
  }

  floodIslandId(start: any, islandId: number): void {
    const stack = [start];
    while (stack.length) {
      const node = stack.pop()!;
      node.data.islandId = islandId;
      for (const neighbour of node.neighbors) {
        if (!neighbour.data.islandId) stack.push(neighbour);
      }
    }
  }

  /** 惰性岛 id 查询视图。 */
  getIslandIdMap(
    speedType: any,
    onBridge: boolean,
    crushMode = "",
  ): { get: (tile: any, onBridge: any) => any } {
    const graph = this.computePassabilityGraph(speedType, onBridge, crushMode);
    return {
      get: (tile: any, onBridge: any) => {
        const id = this.getNodeId(tile, onBridge);
        return graph.getNode(id)?.data.islandId;
      },
    };
  }

  /**
   * 取 tile 在给定 SpeedType 下的通行速度修正。
   * 越界/无地表类型/修正为 0 → 0；Wall 且 Track 时用地形回推；
   * 未 skipBlockers 时遇阻挡物（且不在 ignoredBlockers）返回 0。
   */
  getPassableSpeed(
    tile: any,
    speedType: any,
    onBridge: boolean,
    useBridgeLand: boolean,
    ignoredBlockers: any[] = [],
    skipBlockers = false,
    forceLandSpeed?: number,
    mover?: any,
  ): number {
    if (!this.mapBounds.isWithinBounds(tile)) return 0;
    let landType = useBridgeLand ? tile.onBridgeLandType : tile.landType;
    if (void 0 === landType) return 0;
    if (landType === LandType.Wall && speedType === SpeedType.Track) {
      landType = getLandType(tile.terrainType);
    }
    const landRules = this.rules.getLandRules(landType);
    const modifier = forceLandSpeed || landRules.getSpeedModifier(speedType);
    if (!modifier) return 0;
    if (!skipBlockers) {
      for (const obj of this.tileOccupation.getObjectsOnTile(tile)) {
        if (
          this.isBlockerObject(obj, tile, useBridgeLand, speedType, onBridge, mover) &&
          !ignoredBlockers.includes(obj)
        ) {
          return 0;
        }
      }
    }
    return modifier;
  }

  /**
   * 对象是否阻挡给定速度类型在该 tile 的通行。
   *
   * 可碾压且 Track/Hover 不挡；OmniCrusher 模式可碾目标不挡；地形需
   * 全占据位；建筑按 foundation 判定（战车工厂强制全宽）；飞机/步兵/
   * 载具/污迹/矿/箱子/桥占位不挡。
   */
  isBlockerObject(
    obj: any,
    tile: any,
    useBridgeLand: boolean,
    speedType: any,
    onBridge: boolean,
    mover?: any,
  ): boolean {
    if (obj.rules.crushable && [SpeedType.Track, SpeedType.Hover].includes(speedType)) {
      return false;
    }
    // OmniCrusher（如战斗要塞）可碾过通常不可碾的载具；OmniCrushResistant
    // 优先于 OmniCrusher。无敌（铁幕/力场）对象也不可被碾穿。`mover` 可以是
    // 单位本身或建图时用的 crush mode 字符串 "omni"。
    if (
      [SpeedType.Track, SpeedType.Hover].includes(speedType) &&
      ("omni" === mover || (mover?.crusher && mover.omniCrusher)) &&
      this.isOmniCrushTarget(obj)
    ) {
      return false;
    }
    if (obj.isTerrain()) {
      return (
        !onBridge || obj.rules.getOccupationBits(this.theaterType) === OccupationBits.All
      );
    }
    if (obj.isBuilding()) {
      if (obj.rules.invisibleInGame) return false;
      if (obj.isDestroyed && obj.rules.leaveRubble) return false;
      if (obj.rules.gate) return false;
      const foundation = obj.art.foundation;
      let impassableRows = obj.rules.numberImpassableRows;
      // 战车工厂必须为所有单位封锁全地基宽度；出生单位由 ExitFactoryTask
      // 通过 ignoredBlockers 放行。
      if (onBridge) {
        impassableRows = foundation.width;
      } else if (obj.rules.weaponsFactory) {
        impassableRows = foundation.width;
      }
      const rect = {
        x: obj.tile.rx,
        y: obj.tile.ry,
        width: (impassableRows || foundation.width) - 1,
        height: foundation.height - 1,
      };
      return geometry.rectContainsPoint(rect, { x: tile.rx, y: tile.ry });
    }
    return !(
      obj.isAircraft() ||
      obj.isInfantry() ||
      obj.isVehicle() ||
      obj.isSmudge() ||
      (obj.isOverlay() &&
        ((useBridgeLand && obj.isBridge()) ||
          (!useBridgeLand && obj.isHighBridge()) ||
          obj.isTiberium() ||
          obj.rules.crate ||
          obj.isBridgePlaceholder()))
    );
  }

  // vanilla YR OmniCrusher target test. An OmniCrusher can drive over
  // infantry/walls (already crushable) and vehicles; OmniCrushResistant objects
  // and regular (non-wall) buildings are NOT crushable by an OmniCrusher.
  // Invulnerable objects (Iron Curtain / Force Shield) are NOT drive-over
  // targets either — vanilla YR: invulnerability negates crush, so they block
  // the crusher like any other non-crushable obstacle.
  isOmniCrushTarget(obj: any): boolean {
    if (obj?.isBuilding?.() && !obj.rules.wall) return false;
    if (obj.rules.omniCrushResistant) return false;
    if (obj?.invulnerableTrait?.isActive?.()) return false;
    return obj.isVehicle() || obj.isInfantry() || (obj.isOverlay() && obj.rules.wall);
  }

  /**
   * 找 path 节点上的动态障碍。`static` 标记是否为硬阻挡。
   * 含同格/预约单位、可碾穿目标、步兵子格冲突、门建筑等。
   */
  findObstacles(node: { tile: any; onBridge: any }, mover: any): any[] {
    const speedType = mover.rules.speedType;
    const moverIsInfantry = mover.isInfantry();
    const result: any[] = [];
    for (const obj of this.tileOccupation.getGroundObjectsOnTile(node.tile)) {
      if (obj === mover) continue;
      const staticBlock = this.isBlockerObject(
        obj,
        node.tile,
        !!node.onBridge,
        speedType,
        moverIsInfantry,
        mover,
      );
      const reserved =
        obj.isUnit() &&
        ((obj.tile === node.tile && obj.onBridge === !!node.onBridge) ||
          obj.moveTrait.reservedPathNodes.find(
            (n: any) => n.tile === node.tile && !!n.onBridge == !!node.onBridge,
          ));
      // Track/Hover 把可碾对象当可穿透障碍，便于 MoveTask 执行碾压而非绕行。
      const crushPass =
        [SpeedType.Track, SpeedType.Hover].includes(speedType) &&
        (obj.rules.crushable || mover?.canCrushObject?.(obj));
      const infantryOnTerrain = moverIsInfantry && obj.isTerrain();
      const isGate = obj.isBuilding() && obj.rules.gate;
      if (staticBlock || reserved || crushPass || infantryOnTerrain || isGate) {
        const entry = { obj, static: staticBlock };
        // 孪生：步兵×步兵用 `same && push`；否则 `(地形&&步兵&&子格不匹配) || push`
        if (obj.isInfantry() && moverIsInfantry) {
          if (obj.position.desiredSubCell === mover.position.desiredSubCell) {
            result.push(entry);
          }
        } else if (
          !(
            obj.isTerrain() &&
            moverIsInfantry &&
            !obj.rules
              .getOccupiedSubCells(this.theaterType)
              .includes(mover.position.desiredSubCell)
          )
        ) {
          result.push(entry);
        }
      }
    }
    return result;
  }

  dispose(): void {
    this.tileOccupation.onChange.unsubscribe(this.handleTileOccupationUpdate);
    this.mapBounds.onLocalResize.unsubscribe(this.handleMapBoundsResize);
  }
}
