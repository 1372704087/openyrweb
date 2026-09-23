/**
 * MapShroud — 战争迷雾（shroud）位图与揭示/撤销逻辑。
 *
 * 用 Uint8Array 存放每格低 3 位 ShroudType + 高位 flags（Darken=8）。
 * rxyzToSxy/sxyzToRxy 做地块↔遮蔽网格坐标换算（含 padding 与 z 偶补偿）。
 * revealFrom/revealAround 等登记 invalidation，update() 批量刷格并
 * 派发 onChange（full/incremental/clear/cover）。临时揭示带秒级倒计时
 * （temporaryReveals），到期回落 Unexplored。
 *
 * 由 game/map/MapShroud.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { EventDispatcher } from "util/event"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { TerrainType } from "engine/type/TerrainType"; // 已转换
import { clamp } from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 临时揭示默认持续秒数。 */
const TEMPORAL_REVEAL_SECONDS = 5;
/** revealObject 用的半径（码）。 */
const OBJECT_REVEAL_RADIUS = 4.25;
/** ShroudType 字段位宽与掩码（3 bit）。 */
const SHROUD_BITS = 3;
const SHROUD_MASK = (1 << SHROUD_BITS) - 1;

/** 迷雾状态（低 3 位）。 */
export enum ShroudType {
  /** 未探索。 */
  Unexplored = 0,
  /** 临时揭示中。 */
  TemporaryReveal = 1,
  /** 已探索。 */
  Explored = 2,
}

/** 迷雾附加标志（高位于掩码之上按位或）。 */
export enum ShroudFlag {
  /** 变暗标志。 */
  Darken = 8,
}

/** 战争迷雾网格。 */
export class MapShroud {
  /** 待应用的揭示区域：线性索引 → {center,elevation,radius}。 */
  invalidations = new Map<number, { center: any; elevation: number; radius: number }>();
  /** 临时揭示：遮蔽坐标 → 剩余 tick 数。 */
  temporaryReveals = new Map<any, number>();
  /** 是否需要全量刷新事件。 */
  fullInvalidation = false;
  private _onChange = new EventDispatcher();

  /** 变更事件：listener(payload, self)，payload={type,coords?}。 */
  get onChange() {
    return this._onChange.asEvent();
  }

  /** 遮蔽网格边长（含 padding）。 */
  size!: { width: number; height: number };
  /** 每格状态字节。 */
  tiles!: Uint8Array;
  /** 坐标 padding 半值。 */
  padding!: number;
  /** 每格有效高程（供 reveal 高度差过滤）。 */
  tileElevation!: Uint8Array;

  /**
   * 从 tile 集合初始化网格。
   * padding = (maxH + maxH%2)/2；elevation 对 Cliff 高于 0 的格记 z-1。
   */
  fromTiles(tiles: any): this {
    const mapSize = tiles.getMapSize();
    const maxH = tiles.getMaxTileHeight();
    this.padding = (maxH + (maxH % 2)) / 2;
    this.size = { width: mapSize.width + this.padding, height: mapSize.height + this.padding };
    this.tiles = new Uint8Array(this.size.width * this.size.height);
    this.tiles.fill(ShroudType.Unexplored);
    this.tileElevation = new Uint8Array(this.size.width * this.size.height);
    for (const tile of tiles.getAll()) {
      const index = this.getTileIndex(tile);
      this.tileElevation[index] = Math.max(
        this.tileElevation[index],
        tile.terrainType === TerrainType.Cliff && 0 < tile.z ? tile.z - 1 : tile.z,
      );
    }
    return this;
  }

  getSize() {
    return this.size;
  }

  getTileIndex(tile: any): number {
    const { sx, sy } = this.rxyzToSxy(tile.rx, tile.ry, tile.z);
    return sx + sy * this.size.width;
  }

  /** 地块 (rx,ry,z) → 遮蔽网格 (sx,sy)（z 取整后加偶补偿）。 */
  rxyzToSxy(rx: number, ry: number, z: number): { sx: number; sy: number } {
    z |= 0;
    const shift = z + (z % 2);
    return { sx: rx - shift / 2 + this.padding, sy: ry - shift / 2 + this.padding };
  }

  /** 遮蔽网格 (sx,sy,z) → 地块 (rx,ry)。 */
  sxyzToRxy(sx: number, sy: number, z: number): { rx: number; ry: number } {
    return {
      rx: sx + Math.ceil(z / 2) - this.padding,
      ry: sy + Math.ceil(z / 2) - this.padding,
    };
  }

  /** 遮蔽平面 z=0 反变换。 */
  shroudCoordsToWorld({ sx, sy }: { sx: number; sy: number }): { rx: number; ry: number } {
    return this.sxyzToRxy(sx, sy, 0);
  }

  /** 该遮蔽列上所有高度吻合的 tile（随 maxH 步进 2 扫 z）。 */
  findTilesAtShroudCoords({ sx, sy }: { sx: number; sy: number }, tiles: any): any[] {
    const maxH = tiles.getMaxTileHeight();
    const zSpan = maxH + (maxH % 2);
    const result: any[] = [];
    for (let z = 0; z <= zSpan; z += 2) {
      const zz = z + (z % 2);
      const { rx, ry } = this.sxyzToRxy(sx, sy, zz);
      const tile = tiles.getByMapCoords(rx, ry);
      if (tile?.z === z) result.push(tile);
    }
    return result;
  }

  /** 浅拷贝状态网格的新实例（elevation 共享引用，与孪生一致）。 */
  clone(): MapShroud {
    const copy = new MapShroud();
    copy.tiles = this.tiles.slice();
    copy.size = this.size;
    copy.padding = this.padding;
    copy.tileElevation = this.tileElevation;
    return copy;
  }

  copy(other: MapShroud): void {
    this.tiles = other.tiles.slice();
    this.size = other.size;
    this.padding = other.padding;
    this.tileElevation = other.tileElevation;
  }

  /** 与另一迷雾按位合并（type 取 max，flags 并集）。尺寸不一致抛错。 */
  merge(other: MapShroud): void {
    if (this.size.width !== other.size.width || this.size.height !== other.size.height) {
      throw new Error("Size mismatch");
    }
    const src = other.tiles;
    for (let i = 0, n = this.tiles.length; i < n; i++) {
      this.tiles[i] =
        Math.max(src[i] & SHROUD_MASK, this.tiles[i] & SHROUD_MASK) |
        (((src[i] | this.tiles[i]) >> SHROUD_BITS) << SHROUD_BITS);
    }
  }

  /** tile 是否被迷雾遮蔽；elevation 叠加额外高度。 */
  isShrouded(tile: any, elevation = 0): boolean {
    const coords = this.rxyzToSxy(tile.rx, tile.ry, tile.z + elevation);
    return this.getShroudTypeByShroudCoords(coords) === ShroudType.Unexplored;
  }

  getShroudType(tile: any): ShroudType {
    return this.tiles[this.getTileIndex(tile)] & SHROUD_MASK;
  }

  isFlagged(tile: any, flag: ShroudFlag): boolean {
    return 0 != (this.tiles[this.getTileIndex(tile)] & flag);
  }

  getShroudTypeByTileCoords(rx: number, ry: number, z: number): ShroudType {
    return this.getShroudTypeByShroudCoords(this.rxyzToSxy(rx, ry, z));
  }

  getShroudTypeByShroudCoords({ sx, sy }: { sx: number; sy: number }): ShroudType {
    if (sx < 0 || sy < 0 || sx >= this.size.width || sy >= this.size.height) {
      return ShroudType.Unexplored;
    }
    return this.tiles[sx + sy * this.size.width] & SHROUD_MASK;
  }

  /** 标记全图需要派发 full 事件。 */
  invalidateFull(): void {
    this.fullInvalidation = true;
  }

  /** 登记以 center 为中心的圆形揭示（elevation/radius 取 max 合并）。 */
  invalidate(center: { sx: number; sy: number }, elevation: number, radius: number): void {
    const key = center.sx + center.sy * this.size.width;
    let entry = this.invalidations.get(key);
    if (!entry) {
      entry = { center, elevation: 0, radius: 0 };
      this.invalidations.set(key, entry);
    }
    entry.elevation = Math.max(entry.elevation, elevation);
    entry.radius = Math.max(entry.radius, radius);
  }

  /** 从对象视野登记揭示（建筑且带墙 trait 则跳过）。 */
  revealFrom(obj: any): void {
    if (obj.isBuilding() && obj.wallTrait) return;
    const sight = obj.sight;
    if (sight) {
      const elev = obj.tile.z + obj.tileElevation;
      const center = this.rxyzToSxy(obj.tile.rx, obj.tile.ry, elev);
      this.invalidate(center, elev, sight);
    }
  }

  /** 以无穷高程（穿层）揭示半径 radius 的圆。 */
  revealAround(tile: any, radius: number): void {
    const center = this.rxyzToSxy(tile.rx, tile.ry, tile.z);
    this.invalidate(center, Number.POSITIVE_INFINITY, radius);
  }

  /** 撤销揭示：把范围内 Explored 回落 Unexplored 并派发 incremental。 */
  unrevealAround(tile: any, radius: number): void {
    const changed: any[] = [];
    const center = this.rxyzToSxy(tile.rx, tile.ry, tile.z);
    this.setValueAround(
      center,
      radius,
      Number.POSITIVE_INFINITY,
      changed,
      ShroudType.Unexplored,
      ShroudType.Explored,
    );
    this._onChange.dispatch(this, { type: "incremental", coords: changed });
  }

  /** 临时揭示：登记倒计时（秒 × BASE_TICKS_PER_SECOND）。 */
  revealTemporarily(obj: any): void {
    const center = this.rxyzToSxy(obj.tile.rx, obj.tile.ry, obj.tile.z + obj.tileElevation);
    this.temporaryReveals.set(center, TEMPORAL_REVEAL_SECONDS * GameSpeed.BASE_TICKS_PER_SECOND);
  }

  /** 对象视野揭示（半径 OBJECT_REVEAL_RADIUS，高程无穷）。 */
  revealObject(obj: any): void {
    const center = this.rxyzToSxy(obj.tile.rx, obj.tile.ry, obj.tile.z + obj.tileElevation);
    this.invalidate(center, Number.POSITIVE_INFINITY, OBJECT_REVEAL_RADIUS);
  }

  /**
   * 在范围内按 set/clear 方式开关 flags（不改 type 字段时用）。
   * @param set - true 则 setFlags，否则 clearFlags
   */
  toggleFlagsAround(
    tile: any,
    radius: number,
    flags: number,
    set: boolean,
  ): void {
    const changed: any[] = [];
    const center = this.rxyzToSxy(tile.rx, tile.ry, tile.z);
    this.setValueAround(
      center,
      radius,
      Number.POSITIVE_INFINITY,
      changed,
      undefined,
      undefined,
      set ? { setFlags: flags } : { clearFlags: flags },
    );
    this._onChange.dispatch(this, { type: "incremental", coords: changed });
  }

  /** 应用 pending invalidations 与临时揭示倒计时，并派发变更事件。 */
  update(): void {
    const changed: any[] = [];
    if (this.invalidations.size) {
      for (const inv of this.invalidations.values()) {
        // 仅当当前 type 在 from 集合内时改为 to（Unexplored/TemporaryReveal → Explored）
        this.setValueAround(inv.center, inv.radius, inv.elevation, changed, ShroudType.Explored, [
          ShroudType.Unexplored,
          ShroudType.TemporaryReveal,
        ]);
      }
      this.invalidations.clear();
    }
    if (this.temporaryReveals.size) {
      this.temporaryReveals.forEach((ticks, center) => {
        if (ticks <= 0) {
          // 到期：TemporaryReveal → Unexplored
          this.setValueAround(
            center,
            SHROUD_BITS,
            Number.POSITIVE_INFINITY,
            changed,
            ShroudType.Unexplored,
            ShroudType.TemporaryReveal,
          );
          this.temporaryReveals.delete(center);
        } else {
          if (ticks === TEMPORAL_REVEAL_SECONDS * GameSpeed.BASE_TICKS_PER_SECOND) {
            // 刚登记：先把 Unexplored 置为 TemporaryReveal 展示
            this.setValueAround(
              center,
              SHROUD_BITS,
              Number.POSITIVE_INFINITY,
              changed,
              ShroudType.TemporaryReveal,
              ShroudType.Unexplored,
            );
          }
          this.temporaryReveals.set(center, ticks - 1);
        }
      });
    }
    if (this.fullInvalidation) {
      this.fullInvalidation = false;
      this._onChange.dispatch(this, { type: "full" });
    } else if (changed.length) {
      this._onChange.dispatch(this, { type: "incremental", coords: changed });
    }
  }

  /**
   * 圆形区域内批量写 type / flags。
   *
   * @param to - 目标 ShroudType（undefined 保留原 type）
   * @param filter - 当前 type 过滤：数组=「仅这些才写」，数字=「仅等于才写」，
   *                 undefined=全部写
   * @param opts.setFlags / opts.clearFlags - 与/非操作的标志位
   *
   * 跳过条件（与孪生 || 短路一致）：filter 不匹配，或中心距² > r²+1，
   * 或 tileElevation >= elevation+4。写入后 type/flags 有变化则 push changed。
   */
  setValueAround(
    center: { sx: number; sy: number },
    radius: number,
    elevation: number,
    changed: any[],
    to?: ShroudType,
    filter: ShroudType | ShroudType[] | undefined = undefined,
    { setFlags, clearFlags }: { setFlags?: number; clearFlags?: number } = {},
  ): void {
    const r = Math.ceil(radius);
    const minX = clamp(center.sx - r, 0, this.size.width - 1);
    const maxX = clamp(center.sx + r, 0, this.size.width - 1);
    const minY = clamp(center.sy - r, 0, this.size.height - 1);
    const maxY = clamp(center.sy + r, 0, this.size.height - 1);
    const width = this.size.width;
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const index = x + y * width;
        const currentType = this.tiles[index] & SHROUD_MASK;
        const currentFlags = (this.tiles[index] >> SHROUD_BITS) << SHROUD_BITS;
        let flags = currentFlags;
        if (void 0 !== setFlags) flags |= setFlags;
        if (void 0 !== clearFlags) flags &= ~clearFlags;
        // 孪生 A：filter 已设且当前 type 不匹配 → 跳过写入
        const filterMismatch =
          void 0 !== filter &&
          (typeof filter !== "number" ? !filter.includes(currentType) : filter !== currentType);
        if (
          filterMismatch ||
          (x - center.sx) * (x - center.sx) + (y - center.sy) * (y - center.sy) >
            radius * radius + 1 ||
          this.tileElevation[index] >= elevation + 4
        ) {
          continue;
        }
        this.tiles[index] = (to ?? currentType) | flags;
        // 孪生：(f===n && y===e) || push ⇒ type 或 flags 任一变化才记录
        if (currentType !== to || currentFlags !== flags) {
          changed.push({ sx: x, sy: y });
        }
      }
    }
  }

  /** 全图已探索并派发 clear。 */
  revealAll(): void {
    this.tiles.fill(ShroudType.Explored);
    this._onChange.dispatch(this, { type: "clear" });
  }

  /** 全图未探索并派发 cover。 */
  reset(): void {
    this.tiles.fill(ShroudType.Unexplored);
    this._onChange.dispatch(this, { type: "cover" });
  }
}
