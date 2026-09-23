/**
 * Effect — 特效基类占位模块（type-only，无运行时导出）。
 *
 * 孪生 engine/renderable/fx/Effect.ts.js 的 execute 为空体：
 * System.register 仅声明模块名与 deps（[]），不导出任何值。
 * 因此本 TS 重写同样不产生运行时导出，仅保留空模块语义。
 *
 * 由 engine/renderable/fx/Effect.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export {};
