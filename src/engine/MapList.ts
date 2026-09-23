/**
 * MapList — 地图清单集合（MultiMaps INI / 地图文件聚合，按文件名去重排序）。
 *
 * 由 engine/MapList.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { MapManifest } from "engine/MapManifest"; // 已转换

/** 游戏模式仓库最小形状（getAll 返回模式数组）。 */
export interface GameModesLike {
  getAll(): unknown[];
}

/** 可被 addFromIni 解析的地图列表 INI。 */
export interface MapListIniLike {
  getSection(name: string): { entries: Map<string, string> } | undefined | null;
}

/** 地图文件句柄（转发到 MapManifest.fromMapFile）。 */
export type MapListFileLike = Parameters<MapManifest["fromMapFile"]>[0];

/**
 * 地图清单列表。
 */
export class MapList {
  /** 游戏模式仓库 */
  gameModes: GameModesLike;
  /** 清单数组 */
  manifests: MapManifest[];

  constructor(gameModes: GameModesLike) {
    this.gameModes = gameModes;
    this.manifests = [];
  }

  /**
   * 从 MultiMaps 列表 INI 追加全部地图（并去重）。
   * @param i - 含 [MultiMaps] 与各地图节段的 INI
   * @returns this
   */
  addFromIni(i: MapListIniLike): this {
    const e = i.getSection("MultiMaps");
    if (!e) {
      throw new Error("Invalid map list. Missing [MultiMaps] section.");
    }
    this.manifests = this.manifests.concat(
      [...e.entries.values()].map((e) => {
        const t = i.getSection(e);
        if (!t) {
          throw new Error(`Invalid map list. Missing [${e}] section.`);
        }
        return new MapManifest().fromIni(t as any, this.gameModes.getAll() as any);
      }),
    );
    this.dedupeEntries();
    return this;
  }

  /** 追加一条清单。 */
  add(e: MapManifest): void {
    this.manifests.push(e);
  }

  /**
   * 从地图文件解析并追加。
   * @param e - 地图文件
   */
  addFromMapFile(e: MapListFileLike): void {
    this.add(new MapManifest().fromMapFile(e, this.gameModes.getAll() as any));
  }

  /** 全部清单。 */
  getAll(): MapManifest[] {
    return this.manifests;
  }

  /**
   * 按文件名（忽略大小写）查找。
   * @param t - 文件名
   */
  getByName(t: string): MapManifest | undefined {
    return this.manifests.find((e) => e.fileName.toLowerCase() === t.toLowerCase());
  }

  /** 按文件名 locale 排序。 */
  sortByName(): void {
    this.manifests.sort((e, t) => e.fileName.localeCompare(t.fileName));
  }

  /** 浅拷贝克隆（共享 gameModes 引用，manifests 数组复制）。 */
  clone(): MapList {
    const e = new MapList(this.gameModes);
    e.manifests = [...this.manifests];
    return e;
  }

  /**
   * 合并另一列表并去重。
   * @param e - 另一 MapList
   * @returns this
   */
  mergeWith(e: MapList): this {
    this.manifests.push(...e.manifests);
    this.dedupeEntries();
    return this;
  }

  /** 按 fileName 小写键去重（后写覆盖先写）。 */
  dedupeEntries(): void {
    this.manifests = [
      ...new Map(this.manifests.map((e) => [e.fileName.toLowerCase(), e] as const)).values(),
    ];
  }
}
