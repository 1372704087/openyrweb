/**
 * MissileRules — 导弹规则基类（空实现）。
 *
 * V3RocketRules / DMislRules / CMislRules 的公共父类：当前仅提供类型
 * 归属（GeneralRules.getMissileRules 按弹体名返回具体子类实例）。
 *
 * 由 game/rules/general/MissileRules.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MissileRules {}
