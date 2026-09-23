/**
 * ServerRegions — 服务器区域（Region）配置表加载与选中管理。
 *
 * 由 network/ServerRegions.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - load() 从 IniSection 列表重建 regions Map，键为 section 名。
 * - get() 对未知 id 抛错；getSelectedRegion() 在未选中时抛错。
 * - normalizeVersion 将 "x.y" 补成 "x.y.0"，其余原样。
 */

/** 单个服务器区域配置。 */
export interface ServerRegion {
  /** 区域 id（= 配置节名）。 */
  id: string;
  /** 显示标签。 */
  label: string;
  /** 是否可用。 */
  available: boolean;
  /** 游戏版本（已归一化，可能为 undefined）。 */
  gameVersion?: string;
  /** WOL 连接 URL。 */
  wolUrl: string;
  /** 账号注册 API URL。 */
  apiRegUrl: string;
  /** 天梯服务 URL（可选）。 */
  wladderUrl?: string;
  /** 战报服务 URL（可选）。 */
  wgameresUrl?: string;
  /** 地图传输服务 URL（可选）。 */
  mapTransferUrl?: string;
  /** 排行榜 URL（可选）。 */
  leaderboardUrl?: string;
}

/** 具备 getString/getBool 的配置节最小接口（对应 data/IniSection）。 */
export interface ServerRegionsIniSection {
  /** 节名。 */
  name: string;
  /** 读字符串字段。 */
  getString(key: string): string;
  /** 读布尔字段（缺省回退 defaultValue）。 */
  getBool(key: string, defaultValue: boolean): boolean;
}

/** 具备 getOrderedSections 的配置文件最小接口。 */
export interface ServerRegionsIniFile {
  /** 按声明顺序返回所有节。 */
  getOrderedSections(): ServerRegionsIniSection[];
}

/** 服务器区域配置表。 */
export class ServerRegions {
  /** 区域 id → 配置。 */
  private regions = new Map<string, ServerRegion>();
  /** 当前选中的区域（可能未设置）。 */
  private selectedRegion?: ServerRegion;

  /**
   * 从 INI 配置加载全部区域（先清空再重建）。
   * @param ini 配置文件对象。
   */
  load(ini: ServerRegionsIniFile): void {
    this.regions.clear();
    for (const section of ini.getOrderedSections()) {
      this.regions.set(section.name, {
        id: section.name,
        label: section.getString("label"),
        available: section.getBool("available", true),
        gameVersion: this.normalizeVersion(section.getString("gameVersion") || undefined),
        wolUrl: section.getString("wolUrl"),
        apiRegUrl: section.getString("apiRegUrl"),
        wladderUrl: section.getString("wladderUrl") || undefined,
        wgameresUrl: section.getString("wgameresUrl") || undefined,
        mapTransferUrl: section.getString("mapTransferUrl") || undefined,
        leaderboardUrl: section.getString("leaderboardUrl") || undefined,
      });
    }
  }

  /**
   * 版本号归一化："x.y" → "x.y.0"，其余不变。
   * @param version 原始版本字符串（可为 undefined）。
   */
  private normalizeVersion(version: string | undefined): string | undefined {
    if (version !== undefined && version.match(/^\d+\.\d+$/)) {
      version += ".0";
    }
    return version;
  }

  /**
   * 按 id 取区域配置；未知 id 抛错。
   * @param id 区域 id。
   */
  get(id: string): ServerRegion {
    if (!this.regions.has(id)) {
      throw new Error("Unknown region id " + id);
    }
    return this.regions.get(id)!;
  }

  /**
   * 判断区域是否存在。
   * @param id 区域 id。
   */
  has(id: string): boolean {
    return this.regions.has(id);
  }

  /**
   * 判断区域是否存在且 available。
   * @param id 区域 id。
   */
  isAvailable(id: string): boolean {
    return this.regions.has(id) && this.regions.get(id)!.available;
  }

  /** 返回全部区域数组。 */
  getAll(): ServerRegion[] {
    return [...this.regions.values()];
  }

  /** 返回第一个 available 的区域（可能为 undefined）。 */
  getFirstAvailable(): ServerRegion | undefined {
    return this.getAll().filter((r) => r.available)[0];
  }

  /** 区域数量。 */
  getSize(): number {
    return this.regions.size;
  }

  /**
   * 按 id 设置当前选中区域（未知 id 会经 get() 抛错）。
   * @param id 区域 id。
   */
  setSelectedRegion(id: string): void {
    this.selectedRegion = this.get(id);
  }

  /** 取当前选中区域；未选中时抛错。 */
  getSelectedRegion(): ServerRegion {
    if (!this.selectedRegion) {
      throw new Error("No server region selected");
    }
    return this.selectedRegion;
  }
}
