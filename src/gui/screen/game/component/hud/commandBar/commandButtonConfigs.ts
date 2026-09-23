/**
 * commandButtonConfigs — 命令栏按钮静态配置表（图标 + tooltip 取串）。
 *
 * 由 gui/screen/game/component/hud/commandBar/commandButtonConfigs.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CommandBarButtonType } from "gui/screen/game/component/hud/commandBar/CommandBarButtonType"; // 已转换

/** 单条命令栏按钮配置。 */
export type CommandButtonConfig = {
  /** 按钮类型。 */
  type: CommandBarButtonType;
  /** 图标 SHP 文件名。 */
  icon: string;
  /** 从字符串表取 tooltip 的函数。 */
  tooltip: (strings: { get: (key: string) => string }) => string;
};

/** 命令栏按钮配置列表。 */
export const commandButtonConfigs: CommandButtonConfig[] = [
  { type: CommandBarButtonType.BugReport, icon: "reportbug.shp", tooltip: (e) => e.get("ts:reportbug") },
  { type: CommandBarButtonType.Team01, icon: "button00.shp", tooltip: (e) => e.get("tip:team01") },
  { type: CommandBarButtonType.Team02, icon: "button01.shp", tooltip: (e) => e.get("tip:team02") },
  { type: CommandBarButtonType.Team03, icon: "button02.shp", tooltip: (e) => e.get("tip:team03") },
  { type: CommandBarButtonType.TypeSelect, icon: "button03.shp", tooltip: (e) => e.get("tip:typeselect") },
  { type: CommandBarButtonType.Deploy, icon: "button04.shp", tooltip: (e) => e.get("tip:deploy") },
  { type: CommandBarButtonType.Guard, icon: "button06.shp", tooltip: (e) => e.get("tip:guard") },
  { type: CommandBarButtonType.Beacon, icon: "button07.shp", tooltip: (e) => e.get("tip:beacon") },
  { type: CommandBarButtonType.Stop, icon: "button08.shp", tooltip: (e) => e.get("tip:stop") },
  {
    type: CommandBarButtonType.PlanningMode,
    icon: "button09.shp",
    tooltip: (e) => e.get("tip:planningmode"),
  },
  { type: CommandBarButtonType.Cheer, icon: "button10.shp", tooltip: (e) => e.get("tip:cheer") },
  { type: CommandBarButtonType.ReplayRewind, icon: "rewind.shp", tooltip: (e) => e.get("tip:replayrewind") },
  { type: CommandBarButtonType.ReplayPlay, icon: "play.shp", tooltip: (e) => e.get("tip:play") },
  { type: CommandBarButtonType.ReplayPause, icon: "pause.shp", tooltip: (e) => e.get("tip:pause") },
  { type: CommandBarButtonType.ReplaySpeed, icon: "ffwd.shp", tooltip: (e) => e.get("tip:replayspeed") },
];
