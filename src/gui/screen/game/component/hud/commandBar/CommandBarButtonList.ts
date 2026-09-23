/**
 * CommandBarButtonList — 从 INI ButtonList 解析命令栏按钮序列。
 *
 * "x" 映射为 Separator；未知名 console.warn 后跳过。
 *
 * 由 gui/screen/game/component/hud/commandBar/CommandBarButtonList.ts.js
 * 重写为 TS（行为完全一致）。
 */
import { CommandBarButtonType } from "gui/screen/game/component/hud/commandBar/CommandBarButtonType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 命令栏按钮列表。 */
export class CommandBarButtonList {
  /** 解析出的按钮类型数组。 */
  buttons: CommandBarButtonType[] = [];

  /**
   * 从 INI 段读取 ButtonList（逗号分隔）。
   * @param ini 配置段
   * @returns this
   */
  fromIni(ini: any): this {
    const raw = (ini.getString("ButtonList") || void 0)?.split(",") ?? [];
    const out: CommandBarButtonType[] = [];
    // 仅保留字符串名（过滤反向数值映射）
    const names = new Set(
      Object.keys(CommandBarButtonType).filter((k) => typeof k === "string"),
    );
    for (const token of raw) {
      if (token === "x") {
        out.push(CommandBarButtonType.Separator);
      } else if (names.has(token)) {
        out.push((CommandBarButtonType as any)[token]);
      } else {
        console.warn(`Unknown command bar button type "${token}"`);
      }
    }
    this.buttons = out;
    return this;
  }
}
