/**
 * CampaignResources — 离线战役资源门。
 *
 * inspect 检测本地 VFS 战役图是否齐全；install 抛 OFFLINE_CAMPAIGN_RESOURCES
 * 引导去存储页；loadCampaignList 读 battlemd.ini [Battles]。
 *
 * 由 gui/screen/mainMenu/campaign/CampaignResources.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import * as IniFileModule from "data/IniFile"; // 孪生

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const IniFile: any = (IniFileModule as any).IniFile;

/** 内置常见战役图。 */
const campaignMapNames = [
  "trn01t.map",
  "trn02t.map",
  "all01t.map",
  "all02s.map",
  "all03u.map",
  "all04u.map",
  "all05s.map",
  "all06u.map",
  "all07t.map",
  "all08u.map",
  "all09t.map",
  "all10s.map",
  "all11t.map",
  "all12s.map",
  "sov01t.map",
  "sov02t.map",
  "sov03u.map",
  "sov04s.map",
  "sov05u.map",
  "sov06t.map",
  "sov07s.map",
  "sov08u.map",
  "sov09u.map",
  "sov10t.map",
  "sov11s.map",
  "sov12s.map",
];

/** 战役列表条目。 */
export interface CampaignEntry {
  /** INI 键（ALL1 等）。 */
  key: string;
  /** 地图场景名。 */
  scenario: string;
  /** 描述/CSF 键。 */
  description: string;
  /** 终幕影片键。 */
  finalMovie: string;
}

/** 离线战役资源门。 */
export class CampaignResources {
  /** VFS 引用。 */
  vfs: any;
  /** ObjectURL 池。 */
  objectUrls = new Map<string, string>();

  constructor(vfs: any) {
    this.vfs = vfs;
  }

  /** 本地战役图是否齐全。 */
  get isReady(): boolean {
    return (
      !!this.vfs && this.getCampaignMapNames().every((f) => this.vfs.fileExists(f))
    );
  }

  /** 需要检查的战役地图 = 内置 ∪ battlemd 引用。 */
  getCampaignMapNames(): string[] {
    var names = campaignMapNames.slice();
    try {
      var list = this.loadCampaignList();
      for (var c of list) {
        var m = String(c.scenario).trim().toLowerCase();
        if (m && names.indexOf(m) < 0) names.push(m);
      }
    } catch {
      /* 忽略 battlemd 解析失败 */
    }
    return names;
  }

  /** 缺失的战役地图。 */
  getMissingFiles(): string[] {
    if (!this.vfs) return this.getCampaignMapNames();
    return this.getCampaignMapNames().filter((f) => !this.vfs.fileExists(f));
  }

  /** 资源状态探测（离线，无下载）。 */
  async inspect() {
    return {
      state: this.isReady ? "ready" : "download-required",
      releaseId: "offline-local",
      totalBytes: 0,
      modOverride: void 0,
    };
  }

  /** 离线不自动下载。 */
  async install(): Promise<never> {
    // 离线适配版不自动下载；UI 会引导用户去存储页导入 Mix 文件。
    throw new Error("OFFLINE_CAMPAIGN_RESOURCES");
  }

  /** 读 battlemd.ini 战役列表（按 [Battles] 数字键升序）。 */
  loadCampaignList(): CampaignEntry[] {
    if (!this.vfs || !this.vfs.fileExists("battlemd.ini")) return [];
    var ini: any;
    try {
      ini = new IniFile(this.vfs.openFile("battlemd.ini"));
    } catch (e) {
      console.warn("[OpenYRWeb] Unable to parse battlemd.ini", e);
      return [];
    }
    var battles = ini.getSection("Battles");
    if (!battles) return [];
    // [Battles] 条目形如 1=ALL1 / 0=ALL1，键是数字，按数字升序收集战役 key。
    var keys: { n: number; v: string; k: string }[] = [];
    battles.entries.forEach(function (v: any, k: string) {
      var n = parseInt(k, 10);
      keys.push({
        n: isNaN(n) ? Number.MAX_SAFE_INTEGER : n,
        v: String(v).trim(),
        k: k,
      });
    });
    keys.sort(function (a, b) {
      return a.n - b.n;
    });
    var out: CampaignEntry[] = [];
    for (var it of keys) {
      var key = it.v;
      if (!key) continue;
      var sec = ini.getSection(key);
      if (!sec) continue;
      var scenario = sec.getString("Scenario").trim();
      // 原版 battlemd 里被注释掉的入口（Scenario= 为空）跳过。
      if (!scenario) continue;
      out.push({
        key: key,
        scenario: scenario,
        description: sec.getString("Description").trim(),
        finalMovie: sec.getString("FinalMovie").trim(),
      });
    }
    return out;
  }

  /** 释放 objectURL。 */
  dispose(): void {
    for (var url of this.objectUrls.values()) URL.revokeObjectURL(url);
    this.objectUrls.clear();
  }
}
