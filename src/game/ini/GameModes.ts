/**
 * GameModes — 多人游戏模式表（mp mode INI 段的解析结果）。
 *
 * 遍历 mode INI 的有序段落；每段段名映射到 GameModeType（未知段名回落
 * Battle）。段内每个键为模式 ID，值为至少 5 项的 CSV：
 *   0 label, 1 description, 2 rulesOverride(小写), 3 mapFilter,
 *   4 randomMapsAllowed；aiAllowed = id < 3。每条还会按
 * rulesOverride 载入 MultiplayerDialogSettings。
 *
 * 由 game/ini/GameModes.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { MpDialogSettings } from "game/rules/MpDialogSettings"; // 已转换
import { GameModeType } from "game/ini/GameModeType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 单条多人模式记录。 */
export interface GameModeEntry {
  /** 模式数字 ID（段内键名解析）。 */
  id: number;
  /** 模式类型（段名映射）。 */
  type: GameModeType;
  /** 侧栏显示标签。 */
  label: string;
  /** 描述文案。 */
  description: string;
  /** 规则覆盖文件名（已小写）。 */
  rulesOverride: string;
  /** 地图过滤表达式。 */
  mapFilter: string;
  /** 是否允许随机地图。 */
  randomMapsAllowed: string;
  /** 是否允许 AI（id < 3）。 */
  aiAllowed: boolean;
  /** 多人对话框设置（从覆盖规则载入）。 */
  mpDialogSettings: MpDialogSettings;
}

export class GameModes {
  /** 按规则名懒加载 INI（由构造参数传入）。 */
  modeIniLoader: any;
  /** 模式 ID → 条目。 */
  entries: Map<number, GameModeEntry>;

  constructor(modeIni: any, modeIniLoader: any) {
    this.modeIniLoader = modeIniLoader;
    this.entries = new Map();
    this.loadIni(modeIni);
  }

  loadIni(modeIni: any): void {
    modeIni.getOrderedSections().forEach((section: any) => {
      const type: GameModeType = GameModeType[section.name as keyof typeof GameModeType] ?? GameModeType.Battle;
      [...section.entries.keys()].forEach((key: string) => {
        const parts = section.getArray(key);
        if (parts.length < 5) throw new Error(`Invalid format for mp mode entry "${key}".`);
        const id = Number(key);
        const rulesOverride = parts[2].toLowerCase();
        const entry: GameModeEntry = {
          id,
          type,
          label: parts[0],
          description: parts[1],
          rulesOverride,
          mapFilter: parts[3],
          randomMapsAllowed: parts[4],
          aiAllowed: id < 3,
          mpDialogSettings: new MpDialogSettings().readIni(
            this.modeIniLoader(rulesOverride).getOrCreateSection("MultiplayerDialogSettings"),
          ),
        };
        this.entries.set(id, entry);
      });
    });
  }

  /** 按 ID 取模式；不存在抛错。 */
  getById(id: number): GameModeEntry {
    if (!this.entries.has(id)) throw new Error("No game mode found with id " + id);
    return this.entries.get(id);
  }

  /** 是否存在该 ID 模式。 */
  hasId(id: number): boolean {
    return this.entries.has(id);
  }

  /** 全部模式条目数组。 */
  getAll(): GameModeEntry[] {
    return [...this.entries.values()];
  }
}
