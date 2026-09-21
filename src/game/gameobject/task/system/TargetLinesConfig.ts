/**
 * TargetLinesConfig — UI 目标线配置的克隆/比较工具。
 *
 * 由 game/gameobject/task/system/TargetLinesConfig.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 *
 * 配置形状：{ isAttack?: boolean, pathNodes: any[], target?: any }
 * pathNodes / target 以引用相等比较；configsAreEqual 对双空返回 true。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export function cloneConfig(config: any): any {
  return config ? { ...config } : undefined;
}

export function configsAreEqual(a: any, b: any): boolean {
  return (
    (!a && !b) || (a?.isAttack === b?.isAttack && a?.pathNodes === b?.pathNodes && a?.target === b?.target)
  );
}

export function configHasTarget(config: any): boolean {
  return !(!config?.pathNodes.length && !config?.target);
}
