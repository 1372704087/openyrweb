/**
 * MapManifest — 地图清单（从 INI 段或 .map/.yrm 文件提取元数据）。
 *
 * 由 engine/MapManifest.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { IniFile } from "data/IniFile"; // 已转换

/** 游戏模式最小形状（仅用 mapFilter 字段）。 */
export interface GameModeLike {
  mapFilter: string | number;
}

/** 地图文件句柄最小形状。 */
export interface MapFileLike {
  readAsString(): string;
  filename: string;
}

/** INI 节段最小形状（getString / getNumber / getBool / getArray / entries）。 */
export interface IniSectionLike {
  name?: string;
  getString(key: string): string | undefined | null;
  getNumber(key: string, defaultValue?: number): number;
  getBool(key: string): boolean;
  getArray(key: string, ...rest: any[]): string[];
  entries: Map<string, string>;
}

/** 地图清单条目。 */
export class MapManifest {
  /** 地图文件名 */
  fileName!: string;
  /** UI 显示名（fromMapFile 时带 NOSTR: 前缀） */
  uiName!: string;
  /** 最大玩家槽位 */
  maxSlots!: number;
  /** 是否官方地图 */
  official!: boolean;
  /** 匹配的游戏模式列表 */
  gameModes!: GameModeLike[];

  /**
   * 从 MultiMaps 引用的 INI 节段填充。
   * @param t - [File]/[Description] 等所在节段
   * @param e - 全部游戏模式（按 mapFilter 过滤）
   */
  fromIni(t: IniSectionLike, e: GameModeLike[]): this {
    this.fileName = t.getString("File") || (t.name as string).toLowerCase() + ".map";
    this.uiName = t.getString("Description") as string;
    this.maxSlots = t.getNumber("MaxPlayers");
    this.official = true;
    this.gameModes = e.filter((e) => t.getArray("GameMode").includes(String(e.mapFilter)));
    return this;
  }

  /**
   * 带槽位后缀的完整标题。
   * @param e - 本地化文案表（Strings 实例；**取文案走 `e.get(key)`**）。
   *
   * ⚠️ 孪生是 `e.get(this.uiName)`：`e` 是**对象**不是回调。此处曾误写成
   * `e(this.uiName)` ⇒ 所有调用点（`SkirmishScreen.initOptions` / `createGame`、
   * `LobbyScreen`、`MapSelScreen`、`GameBrowser`）传入的都是 `strings` 对象，
   * 运行期抛 `TypeError: e is not a function`，遭遇战开局菜单直接中断。
   */
  getFullMapTitle(e: { get(key: string): string }): string {
    return this.addTitleSlotsSuffix(e.get(this.uiName), this.maxSlots);
  }

  /**
   * 若标题尚无 “(2)” / “(2-4)” 形式槽位标注则追加。
   * @param e - 标题文案
   * @param t - 槽位数
   */
  addTitleSlotsSuffix(e: string, t: number): string {
    if (!e.match(/(\(|（)\s*\d(-\d)?\s*(\)|）)\s*$/)) {
      e += ` (2${t > 2 ? "-" + t : ""})`;
    }
    return e;
  }

  /**
   * 从地图文件（map/yrm 等）填充。
   * @param e - 地图文件
   * @param t - 可选游戏模式列表（按 mapFilter 过滤）
   */
  fromMapFile(e: MapFileLike, t?: GameModeLike[]): this {
    let i = e.readAsString();
    const r = e.filename;
    const s = new IniFile(this.extractIniSection("Basic", i)).getSection("Basic");
    if (!s) {
      throw new Error(`Map "${r}" is missing the [Basic] section`);
    }
    this.fileName = r;
    this.uiName = "NOSTR:" + (s.getString("Name") || r.replace(/\.[^.]+$/, ""));
    i = this.extractIniSection("Waypoints", i) as string;
    const a = i ? new IniFile(i).getSection("Waypoints") : undefined;
    this.maxSlots = [...(a?.entries.keys() ?? [])].filter((e) => Number(e) < 8).length;
    this.official = s.getBool("Official");
    const n = s.getArray("GameMode", undefined, ["standard"]);
    this.gameModes = (t ?? []).filter((e) => n.includes(String(e.mapFilter)));
    return this;
  }

  /**
   * 从完整文本中切出 `[section]` 到下一顶格 `[` 之间的片段。
   * 未找到时返回 undefined。
   * @param e - 节段名（不含方括号）
   * @param t - 源文本
   */
  extractIniSection(e: string, t: string): string | undefined {
    const i = t.indexOf(`[${e}]`);
    if (i !== -1) {
      let e = i + 1;
      while (e < t.length && !("[" === t[e] && "\n" === t[e - 1])) {
        e++;
      }
      return t.slice(i, e);
    }
    return undefined;
  }
}
