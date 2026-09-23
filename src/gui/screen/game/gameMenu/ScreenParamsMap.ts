/**
 * ScreenParamsMap — 各菜单屏参数映射类型（type-only 空模块）。
 *
 * 由 gui/screen/game/gameMenu/ScreenParamsMap.ts.js 重写为 TS。
 * 孪生依赖 ScreenType 但仅作 type-only 引用（setter 体为 `0;`），
 * execute 为空；此处同样不产生运行时导出。
 *
 * 由 gui/screen/game/gameMenu/ScreenParamsMap.ts.js 重写为 TS
 * （行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ScreenTypeModule from "gui/screen/game/gameMenu/ScreenType"; // 孪生

export {};
