/**
 * Bridges — 桥梁 piece 链表、桥头类型推断与桥段查找/修复校验。
 *
 * 订阅 TileOccupation.onChange：overlay+bridge 落格时创建 piece 并按
 * 相邻格连成 prev/next 双向链，计算 headType；移除时断链并刷新邻 piece
 * overlay 变体。findClosestBridgeSpec 从起点环形找最近桥头再直线扫
 * 对端高/低桥边界，产出 {start,end,type,isHigh,isXBridge} 规格。
 * canBeRepaired / findDestroyedPieceTiles 等供 AI/剧本修复查询。
 *
 * 由 game/map/Bridges.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { TileCollection, TileDirection } from "game/map/TileCollection"; // 已转换
import { BridgeOverlayTypes, OverlayBridgeType } from "game/map/BridgeOverlayTypes"; // 已转换
import { HighBridgeHeadType } from "game/theater/TileSets"; // 已转换
import { DirectionalTileFinder } from "game/map/tileFinder/DirectionalTileFinder"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 桥 piece 在链上的端点角色。 */
export enum BridgeHeadType {
  /** 非端点（中段）。 */
  None = 0,
  /** 起始端。 */
  Start = 1,
  /** 结束端。 */
  End = 2,
}

/** 单节桥 piece（链表节点）。 */
type BridgePiece = {
  /** 对应 overlay 对象。 */
  obj: any;
  prev: BridgePiece | undefined;
  next: BridgePiece | undefined;
  headType: BridgeHeadType;
};

/** 桥梁规格（两端 + 材质 + 高/低 + 是否 X 向）。 */
export type BridgeSpec = {
  start: any;
  end: any;
  type: OverlayBridgeType;
  isHigh: boolean;
  isXBridge: boolean;
};

/** 桥梁管理器。 */
export class Bridges {
  tileSets: any;
  tiles: any;
  tileOccupation: any;
  mapBounds: any;
  rules: any;
  /** 全部 piece 集合。 */
  pieces: Set<BridgePiece>;
  /** tile → piece。 */
  piecesByTile: Map<any, BridgePiece>;

  constructor(
    tileSets: any,
    tiles: TileCollection | any,
    tileOccupation: any,
    mapBounds: any,
    rules: any,
  ) {
    this.tileSets = tileSets;
    this.tiles = tiles;
    this.tileOccupation = tileOccupation;
    this.mapBounds = mapBounds;
    this.rules = rules;
    this.pieces = new Set();
    this.piecesByTile = new Map();

    this.handleTileOccupationUpdate = ({ object, type }: any) => {
      // 仅桥梁 overlay 参与 piece 维护
      if (object.isOverlay() && object.isBridge()) {
        const tile = object.tile;
        let piece = this.piecesByTile.get(tile);
        if ("added" === type) {
          if (piece) {
            throw new Error(`A bridge piece already exists at tile (${tile.rx},${tile.ry})`);
          }
          const adjacent = this.findBridgeAdjacentTiles(object);
          piece = {
            obj: object,
            prev: void 0,
            next: void 0,
            headType: this.computeHead(object, adjacent.prev, adjacent.next),
          };
          this.piecesByTile.set(tile, piece);
          this.pieces.add(piece);
          this.connectPiece(piece, adjacent.prev, adjacent.next);
          this.updateOverlayData(piece);
          if (piece.prev) this.updateOverlayData(piece.prev);
          if (piece.next) this.updateOverlayData(piece.next);
        } else {
          if (!piece) {
            throw new Error(`Bridge piece was alredy removed at tile (${tile.rx},${tile.ry})`);
          }
          const prev = piece.prev;
          const next = piece.next;
          this.disconnectPiece(piece);
          this.piecesByTile.delete(tile);
          this.pieces.delete(piece);
          if (prev) this.updateOverlayData(prev);
          if (next) this.updateOverlayData(next);
        }
      }
    };
    tileOccupation.onChange.subscribe(this.handleTileOccupationUpdate);
  }

  handleTileOccupationUpdate: (payload: any) => void;

  getPieceAtTile(tile: any): BridgePiece | undefined {
    return this.piecesByTile.get(tile);
  }

  /** piece 血量/overlay 变更后刷新自身与两端邻 piece 的 overlay。 */
  handlePieceHealthChange(piece: BridgePiece): void {
    this.updateOverlayData(piece);
    if (piece.prev) this.updateOverlayData(piece.prev);
    if (piece.next) this.updateOverlayData(piece.next);
  }

  /**
   * 多米诺骨牌倒塌：从 piece 向 next 方向收集直至遇到端点；
   * 若该侧无端点则改扫 prev 侧；两侧都无端点返回 []。
   */
  findDominoPieces(piece: BridgePiece): BridgePiece[] {
    let collected: BridgePiece[] = [];
    let foundEnd = false;
    let cur = piece.next;
    if (piece.headType === BridgeHeadType.None || cur) {
      for (; cur; ) {
        collected.push(cur);
        if (cur.headType !== BridgeHeadType.None) {
          foundEnd = true;
          break;
        }
        cur = cur.next;
      }
    } else {
      foundEnd = true;
    }
    if (foundEnd) {
      foundEnd = false;
      collected.length = 0;
      let cur2 = piece.prev;
      if (piece.headType === BridgeHeadType.None || cur2) {
        for (; cur2; ) {
          collected.push(cur2);
          if (cur2.headType !== BridgeHeadType.None) {
            foundEnd = true;
            break;
          }
          cur2 = cur2.prev;
        }
      } else {
        foundEnd = true;
      }
      if (foundEnd) return [];
    }
    return collected;
  }

  /** 按桥走向取左右相邻两格（X 向用 (1,0)，否则 (0,1)）。 */
  findBridgeAdjacentTiles(obj: any): { prev: any; next: any } {
    let isX = obj.isXBridge();
    let dir = new Vector2(Number(isX), Number(!isX));
    const origin = new Vector2(obj.tile.rx, obj.tile.ry);
    const prevCoords = origin.clone().sub(dir);
    const prevTile = this.tiles.getByMapCoords(prevCoords.x, prevCoords.y);
    const nextCoords = origin.clone().add(dir);
    return { prev: prevTile, next: this.tiles.getByMapCoords(nextCoords.x, nextCoords.y) };
  }

  /** 把 piece 接到 prev/next 两侧已有 piece 上（双向指针）。 */
  connectPiece(piece: BridgePiece, prevTile: any, nextTile: any): void {
    if (prevTile) {
      piece.prev = this.getPieceAtTile(prevTile);
      if (piece.prev) piece.prev.next = piece;
    }
    if (nextTile) {
      piece.next = this.getPieceAtTile(nextTile);
      if (piece.next) piece.next.prev = piece;
    }
  }

  disconnectPiece(piece: BridgePiece): void {
    if (piece.next) {
      piece.next.prev = void 0;
      piece.next = void 0;
    }
    if (piece.prev) {
      piece.prev.next = void 0;
      piece.prev = void 0;
    }
  }

  /**
   * 推断桥头类型：
   * - 高桥：绝对高程 z+tileElevation 与邻 piece.z 相等则 Start/End；
   * - 低桥：靠 overlay 是否 LowBridgeHead / HeadStart 区分。
   */
  computeHead(obj: any, prevTile: any, nextTile: any): BridgeHeadType {
    let absZ = obj.tile;
    if (obj.isHighBridge()) {
      absZ = absZ.z + obj.tileElevation;
      return prevTile?.z === absZ
        ? BridgeHeadType.Start
        : nextTile?.z === absZ
          ? BridgeHeadType.End
          : BridgeHeadType.None;
    }
    return BridgeOverlayTypes.isLowBridgeHead(obj.overlayId)
      ? BridgeOverlayTypes.isLowBridgeHeadStart(obj.overlayId)
        ? BridgeHeadType.Start
        : BridgeHeadType.End
      : BridgeHeadType.None;
  }

  /**
   * 重算 piece 的 overlayId/value（损坏状态与端点连通性决定变体）。
   * 低桥桥头单独走 head 偏移；高桥仅写 value。
   */
  updateOverlayData(piece: BridgePiece): void {
    const obj = piece.obj;
    const prev = piece.prev;
    const next = piece.next;
    let overlayIdChanged = false;
    const isX = obj.isXBridge();
    const bridgeType = BridgeOverlayTypes.getOverlayBridgeType(obj.overlayId);
    if (BridgeOverlayTypes.isLowBridgeHead(obj.overlayId)) {
      // 桥头变体：有无对端邻 piece 决定是否 +1
      let offset = 0;
      if (BridgeOverlayTypes.isLowBridgeHeadStart(obj.overlayId)) {
        offset = isX ? 20 : 22;
        if (!next) offset++;
      } else {
        offset = isX ? 18 : 24;
        if (!prev) offset++;
      }
      obj.overlayId =
        (bridgeType === OverlayBridgeType.Wood
          ? BridgeOverlayTypes.minLowBridgeWoodId
          : BridgeOverlayTypes.minLowBridgeConcreteId) + offset;
      obj.value = offset;
      overlayIdChanged = true;
    } else {
      let offset: number;
      const selfDamaged = (obj.healthTrait?.health ?? 100) <= 50;
      if (piece.headType !== BridgeHeadType.None) {
        if (piece.headType === BridgeHeadType.Start) {
          if (next) {
            offset = selfDamaged ? 6 : (next.obj.healthTrait?.health ?? 100) <= 50 ? 5 : 0;
          } else {
            offset = isX ? 8 : 7;
          }
        } else {
          if (prev) {
            offset = selfDamaged ? 6 : (prev.obj.healthTrait?.health ?? 100) <= 50 ? 4 : 0;
          } else {
            offset = isX ? 7 : 8;
          }
        }
      } else {
        // 非端点：!isX 时交换 prev/next（孪生 `n || swap(r,s)`），再按方向取偏移
        let p = prev;
        let n = next;
        if (!isX) {
          const tmp = p;
          p = n;
          n = tmp;
        }
        if (p || n) {
          if (p) {
            if (n) {
              const pDamaged = (p.obj.healthTrait?.health ?? 100) <= 50;
              const nDamaged = (n.obj.healthTrait?.health ?? 100) <= 50;
              offset = selfDamaged || (pDamaged && nDamaged) ? 6 : pDamaged ? 4 : nDamaged ? 5 : 0;
            } else {
              offset = 8;
            }
          } else {
            offset = 7;
          }
        } else {
          offset = 0;
        }
      }
      if (!isX) offset += 9;
      if (obj.isHighBridge()) {
        obj.value = offset;
      } else {
        obj.overlayId =
          (bridgeType === OverlayBridgeType.Wood
            ? BridgeOverlayTypes.minLowBridgeWoodId
            : BridgeOverlayTypes.minLowBridgeConcreteId) + offset;
        obj.value = offset;
        overlayIdChanged = true;
      }
    }
    if (overlayIdChanged) obj.name = this.rules.getOverlayName(obj.overlayId);
  }

  /**
   * 从 start 附近找最近的低桥桥头或高桥边界，再扫对端合成规格。
   * 找不到返回 undefined。
   */
  findClosestBridgeSpec(start: any): BridgeSpec | undefined {
    const finder = new RadialTileFinder(
      this.tiles,
      this.mapBounds,
      start,
      { width: 1, height: 1 },
      1,
      3,
      (tile: any) => {
        if (tile.z !== start.z) return false;
        const bridge = this.tileOccupation.getBridgeOnTile(tile);
        return (
          !(!bridge?.isLowBridge() || this.getPieceAtTile(bridge.tile)?.headType === BridgeHeadType.None) ||
          !!this.tileSets.isHighBridgeBoundaryTile(tile.tileNum)
        );
      },
      false,
    );
    const first = finder.getNextTile();
    if (first) {
      let headTile: any, type: OverlayBridgeType, isX: boolean, isStart: boolean;
      const isHigh = !this.tileOccupation.getBridgeOnTile(first);
      let firstHeadType: HighBridgeHeadType | undefined;
      if (isHigh) {
        const boundary = this.findHighBridgeBoundary(first);
        if (!boundary) return;
        headTile = boundary.tile;
        type = OverlayBridgeType.Concrete;
        if (
          this.tileSets.getSetNum(first.tileNum) ===
          this.tileSets.getGeneralValue("WoodBridgeSet")
        ) {
          type = OverlayBridgeType.Wood;
        }
        isX =
          boundary.headType === HighBridgeHeadType.TopLeft ||
          boundary.headType === HighBridgeHeadType.BottomRight;
        isStart =
          boundary.headType === HighBridgeHeadType.TopLeft ||
          boundary.headType === HighBridgeHeadType.TopRight;
        firstHeadType = boundary.headType;
      } else {
        headTile = this.tileOccupation.getBridgeOnTile(first).tile;
        const headPiece = this.getPieceAtTile(headTile);
        if (!headPiece) throw new Error("Bridge head is not defined");
        const t = BridgeOverlayTypes.getOverlayBridgeType(headPiece.obj.overlayId);
        if (t === OverlayBridgeType.NotBridge) throw new Error("Expected a bridge type");
        type = t;
        isX = headPiece.obj.isXBridge();
        isStart = headPiece.headType === BridgeHeadType.Start;
      }
      // 沿桥方向单位向量（带符号）
      const dirX = Number(isX) * (isStart ? 1 : -1);
      const dirY = Number(!isX) * (isStart ? 1 : -1);
      let farTile: any;
      if (isHigh) {
        const found = new DirectionalTileFinder(
          this.tiles,
          this.mapBounds,
          headTile,
          1,
          100,
          dirX,
          dirY,
          (tile: any) =>
            tile.z === headTile.z && this.tileSets.isHighBridgeBoundaryTile(tile.tileNum),
          false,
        ).getNextTile();
        const headSetNum = this.tileSets.getSetNum(headTile.tileNum);
        if (!found || this.tileSets.getSetNum(found.tileNum) !== headSetNum) return;
        const farBoundary = this.findHighBridgeBoundary(found);
        if (!farBoundary) return;
        if (
          firstHeadType !== this.tileSets.getOppositeHighBridgeHeadType(farBoundary.headType)
        ) {
          return;
        }
        farTile = farBoundary.tile;
      } else {
        // 低桥：沿方向找到对端 End/Start piece
        let endPiece: BridgePiece | undefined;
        let step = 1;
        for (let x = headTile.rx, y = headTile.ry; !endPiece; ) {
          const tile = this.tiles.getByMapCoords(x + dirX * step, y + dirY * step);
          if (!tile) return;
          const piece = this.getPieceAtTile(tile);
          if (piece && piece.obj.isXBridge() !== isX) return;
          if (piece?.headType === (isStart ? BridgeHeadType.End : BridgeHeadType.Start)) {
            endPiece = piece;
          }
          step++;
        }
        farTile = endPiece.obj.tile;
      }
      return {
        start: isStart ? headTile : farTile,
        end: isStart ? farTile : headTile,
        type,
        isHigh,
        isXBridge: isX,
      };
    }
  }

  /**
   * 从单格高桥边界 tile 向内找对称边界（返回 {tile,headType} 或 undefined）。
   * 用 TileSetEntry 相对坐标中 height===4 的 subTile 定位偏移。
   */
  findHighBridgeBoundary(tile: any): { tile: any; headType: HighBridgeHeadType } | undefined {
    const entry = this.tileSets.getTile(tile.tileNum);
    const headType = this.tileSets.getHighBridgeHeadType(entry.index);
    if (void 0 !== headType) {
      let sortX = 0;
      let sortY = 0;
      switch (headType) {
        case HighBridgeHeadType.TopLeft:
          sortX = 1;
          sortY = 0;
          break;
        case HighBridgeHeadType.BottomRight:
          sortX = -1;
          sortY = 0;
          break;
        case HighBridgeHeadType.TopRight:
          sortX = 0;
          sortY = 1;
          break;
        case HighBridgeHeadType.BottomLeft:
          sortX = 0;
          sortY = -1;
          break;
        case HighBridgeHeadType.MiddleTlBr:
          sortX = 1;
          sortY = 0;
          break;
        case HighBridgeHeadType.MiddleTrBl:
          sortX = 0;
          sortY = 1;
          break;
        default:
          throw new Error(`Unhandled head type "${headType}"`);
      }
      const positions = entry.getRelativeTilePositions();
      // 取 height===4 的子图，按 sort 轴排序后取首个
      const targetSubTile = positions
        .filter((p: any) => 4 === p.z)
        .sort(
          (a: any, b: any) =>
            100 * (sortX ? sortX * (b.rx - a.rx) : sortY * (b.ry - a.ry)) +
            (sortX ? a.ry - b.ry : a.rx - b.rx),
        )[0].subTile;
      const dx = positions[targetSubTile].rx - positions[tile.subTile].rx;
      const dy = positions[targetSubTile].ry - positions[tile.subTile].ry;
      const neighbour = this.tiles.getByMapCoords(tile.rx + dx, tile.ry + dy);
      if (neighbour) {
        if (neighbour.subTile === targetSubTile && neighbour.tileNum === tile.tileNum) {
          return { tile: neighbour, headType };
        }
        console.warn(
          "Found invalid bridge boundary tile. " + `(${tile.rx},${tile.ry})+(${dx},${dy})`,
        );
      }
    } else {
      console.warn(
        `Couldn't find a valid bridge type for index "${entry.index}" @ ${tile.rx},` + tile.ry,
      );
    }
  }

  /**
   * 桥是否可修复：沿 piece 线扫描所有空缺段，高桥不能有可见建筑，
   * 低桥不能有单位/污迹/非占位 overlay 阻挡；至少扫到一格才 true。
   */
  canBeRepaired(spec: BridgeSpec): boolean {
    const finder = this.createBridgePieceTileFinder(spec, (tile: any) =>
      !(
        this.getPieceAtTile(tile) ||
        (this.tileSets.isHighBridgeMiddleTile(tile.tileNum) && tile.z === spec.start.z)
      ),
    );
    let anyFound = false;
    let tile: any;
    const direction =
      spec.start.rx !== spec.end.rx ? TileDirection.BottomLeft : TileDirection.BottomRight;
    for (; (tile = finder.getNextTile()); ) {
      anyFound = true;
      const n1 = this.tiles.getNeighbourTile(tile, direction);
      const n2 = this.tiles.getNeighbourTile(n1, direction);
      if (spec.isHigh) {
        if (
          [tile, n1, n2].find((t: any) =>
            this.tileOccupation
              .getGroundObjectsOnTile(t)
              .some((o: any) => o.isBuilding() && !o.rules.invisibleInGame),
          )
        ) {
          return false;
        }
      } else if (
        [tile, n1, n2].find((t: any) =>
          this.tileOccupation
            .getGroundObjectsOnTile(t)
            .some(
              (o: any) =>
                !(o.isUnit() || o.isSmudge() || (o.isOverlay() && o.isBridgePlaceholder())),
            ),
        )
      ) {
        return false;
      }
    }
    return anyFound;
  }

  /** piece 占用的三格（沿方向扩展两步）。 */
  getPieceTiles(piece: BridgePiece): any[] {
    const origin = piece.obj.tile;
    const direction = piece.obj.isXBridge() ? TileDirection.BottomLeft : TileDirection.BottomRight;
    const mid = this.tiles.getNeighbourTile(origin, direction);
    return [origin, mid, this.tiles.getNeighbourTile(mid, direction)];
  }

  /** 全图高桥边界 tile 集合。 */
  findMapHighBridgeHeadTiles(): Set<any> {
    const all = this.tiles.getAllBridgeSetTiles();
    const result = new Set();
    for (const tile of all) {
      const boundary = this.findHighBridgeBoundary(tile);
      if (boundary) result.add(boundary.tile);
    }
    return result;
  }

  /** 从一组桥头 tile 出发找规格（start:end 去重）。 */
  findBridgeSpecsForHeadTiles(heads: Iterable<any>): BridgeSpec[] {
    const byKey = new Map<string, BridgeSpec>();
    for (let head of heads) {
      head = this.findClosestBridgeSpec(head);
      if (head) byKey.set(head.start.id + ":" + head.end.id, head);
    }
    return [...byKey.values()];
  }

  /** 规格覆盖的全部三格组（含非 piece 段）。 */
  findAllBridgeTiles(spec: BridgeSpec): any[] {
    const result: any[] = [];
    const direction =
      spec.start.rx !== spec.end.rx ? TileDirection.BottomLeft : TileDirection.BottomRight;
    for (const tile of this.findNonBuildablePieceTiles(spec)) {
      const mid = this.tiles.getNeighbourTile(tile, direction);
      const far = this.tiles.getNeighbourTile(mid, direction);
      result.push(tile, mid, far);
    }
    return result;
  }

  /** 桥在地图上的格子包围尺寸（X 向宽×3 / Y 向 3×高）。 */
  getBridgeSize(spec: BridgeSpec): { width: number; height: number } {
    const isX = spec.start.rx !== spec.end.rx;
    return {
      width: isX ? spec.end.rx - spec.start.rx + 1 : 3,
      height: isX ? 3 : spec.end.ry - spec.start.ry + 1,
    };
  }

  /** 规格线上全部已有 piece。 */
  findBridgePieces(spec: BridgeSpec): BridgePiece[] {
    const finder = this.createBridgePieceTileFinder(spec, (tile: any) => !!this.getPieceAtTile(tile));
    const result: BridgePiece[] = [];
    for (let tile: any; (tile = finder.getNextTile()); ) {
      result.push(this.getPieceAtTile(tile)!);
    }
    return result;
  }

  /** 规格线上缺失 piece 的空格（含非中段高桥格）。 */
  findDestroyedPieceTiles(spec: BridgeSpec): any[] {
    const finder = this.createBridgePieceTileFinder(
      spec,
      (tile: any) =>
        !(
          this.getPieceAtTile(tile) ||
          (this.tileSets.isHighBridgeMiddleTile(tile.tileNum) && tile.z === spec.start.z)
        ),
    );
    const result: any[] = [];
    for (let tile: any; (tile = finder.getNextTile()); ) result.push(tile);
    return result;
  }

  /** 规格线上不可再建的段（排除高桥中段空格）。 */
  findNonBuildablePieceTiles(spec: BridgeSpec): any[] {
    const finder = this.createBridgePieceTileFinder(
      spec,
      (tile: any) =>
        !(this.tileSets.isHighBridgeMiddleTile(tile.tileNum) && tile.z === spec.start.z),
    );
    const result: any[] = [];
    for (let tile: any; (tile = finder.getNextTile()); ) result.push(tile);
    return result;
  }

  /** 按规格方向建 DirectionalTileFinder（步数为跨度-1）。 */
  private createBridgePieceTileFinder(
    spec: BridgeSpec,
    predicate: (tile: any) => boolean,
  ): DirectionalTileFinder {
    const isX = spec.start.rx !== spec.end.rx;
    return new DirectionalTileFinder(
      this.tiles,
      this.mapBounds,
      spec.start,
      1,
      (isX ? spec.end.rx - spec.start.rx : spec.end.ry - spec.start.ry) - 1,
      Number(isX),
      Number(!isX),
      predicate,
      false,
    );
  }

  dispose(): void {
    this.pieces.forEach((piece) => {
      piece.prev = void 0;
      piece.next = void 0;
    });
    this.tileOccupation.onChange.unsubscribe(this.handleTileOccupationUpdate);
  }
}
