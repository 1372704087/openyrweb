/**
 * LocalPrefs — localStorage 键名表 + 容错读写包装。
 *
 * StorageKey：应用全部持久化键（GameRes/Options/…），以 `_r_` 前缀区分。
 * LocalPrefs：对 Storage 的 try/catch 包装；读失败 warn 返回 undefined，
 * 写失败 warn 返回 false，remove 失败仅 warn；listItems 返回 storage 自身
 * 的 Object.keys（storage 为 null/undefined 时返回 []）。
 *
 * 由 LocalPrefs.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 应用 localStorage 键名常量表（与孪生逐键一致）。 */
export const StorageKey = {
  /** GameRes 来源序列化。 */
  GameRes: "_r_gameRes",
  /** 通用选项（v3）。 */
  Options: "_r_opts_v3",
  /** 扩展配置。 */
  Extensions: "_r_extensions",
  /** 混音器音量（v3）。 */
  Mixer: "_r_mixer_v3",
  /** 音乐选项。 */
  MusicOpts: "_r_opts_music",
  /** 上次 GPU tier 探测结果。 */
  LastGpuTier: "_r_last_gpu",
  /** 上次已读补丁说明版本。 */
  LastSeenPatch: "_r_last_patch",
  /** 上次选择的地图。 */
  LastMap: "_r_lastMap",
  /** 上次游戏模式。 */
  LastMode: "_r_lastMode",
  /** 上次地图排序。 */
  LastSortMap: "_r_lastSortMap",
  /** 上次玩家国家。 */
  LastPlayerCountry: "_r_lastCountry",
  /** 上次玩家颜色。 */
  LastPlayerColor: "_r_lastColor",
  /** 上次出生点。 */
  LastPlayerStartPos: "_r_lastStartPos",
  /** 上次队伍编号。 */
  LastPlayerTeam: "_r_lastTeam",
  /** 上次排位队列开关。 */
  LastQueueRanked: "_r_lastRanked",
  /** 上次队列类型。 */
  LastQueueType: "_r_lastQueueType",
  /** 上次机器人数量。 */
  LastBots: "_r_lastBots",
  /** 上次房主观察者模式。 */
  LastHostObserver: "_r_lastHostObserver",
  /** 房主常用游戏选项。 */
  PreferredGameOpts: "_r_hostOpts",
  /** 上次连接参数（重连用）。 */
  LastConnection: "_r_lastCon",
  /** 首选服务器区域。 */
  PreferredServerRegion: "_r_region",
  /** 嘲讽开关。 */
  TauntsEnabled: "_r_taunts",
  /** 捐赠提示框状态。 */
  DonateBoxState: "_r_donateBoxState",
  /** 拒绝组队邀请。 */
  PartyNoInvites: "_r_partyNoInvites",
} as const;

/** 可注入的存储后端（localStorage 或测试桩）。 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class LocalPrefs {
  /** 底层存储（可空：构造可不传，所有操作安全降级）。 */
  readonly storage?: StorageLike | null;

  /**
   * @param storage - localStorage 实例（或兼容 Storage；可缺省）
   */
  constructor(storage?: StorageLike | null) {
    this.storage = storage;
  }

  /**
   * 读取键值；storage 为空或抛错 → undefined（并 warn）。
   * 空串/null 由 storage 决定，不做归一。
   */
  getItem(key: string): string | undefined {
    try {
      return this.storage?.getItem(key) ?? void 0;
    } catch (e) {
      return void console.warn(`Unable to read key ${key} from localStorage.`, e);
    }
  }

  /**
   * 写入键值；成功 true，storage 空或抛错 false（并 warn）。
   * storage 为空时可选链短路后逗号表达式仍返回 true（与孪生一致）。
   */
  setItem(key: string, value: string): boolean {
    try {
      return (this.storage?.setItem(key, value), true);
    } catch (e) {
      return (console.warn(`Unable to write key ${key} to localStorage.`, e), false);
    }
  }

  /** 删除键；storage 为空或抛错仅 warn，不返回值。 */
  removeItem(key: string): void {
    try {
      this.storage?.removeItem(key);
    } catch (e) {
      console.warn(`Unable to remove key ${key} from localStorage.`, e);
    }
  }

  /** 列出 storage 自身的可枚举键；storage 为空 → []。 */
  listItems(): string[] {
    return this.storage ? Object.keys(this.storage) : [];
  }
}
