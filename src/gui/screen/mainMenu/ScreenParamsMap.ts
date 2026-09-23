/**
 * ScreenParamsMap — 主菜单各屏幕参数类型映射（type-only 空执行模块）。
 *
 * 孪生仅依赖 mainMenu/ScreenType，setter 为 `0`，execute 为空；
 * 运行时不导出任何值。
 *
 * 由 gui/screen/mainMenu/ScreenParamsMap.ts.js 重写为 TS（行为完全一致：空导出）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import type { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换；仅类型）

/** 保留类型侧依赖占位（孪生 setter 为 `0`）。 */
export type ScreenParamsMap = Partial<Record<ScreenType, any>>;
