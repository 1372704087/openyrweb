/**
 * DOM 几何小工具：文档坐标偏移、祖先包含判定。
 *
 * 由 util/dom.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 文档坐标：距文档左上角的偏移。 */
export interface Offset {
  top: number;
  left: number;
}

/**
 * 累加 offsetTop/offsetLeft 直到 offsetParent 为空，得到相对文档的偏移。
 * 与孪生 for 条件中的逗号表达式一致：每轮先加 top 再加 left，再上溯父级。
 */
export function getOffset(el: HTMLElement): Offset {
  let top = 0;
  let left = 0;
  for (; (top += el.offsetTop || 0), (left += el.offsetLeft || 0), (el = el.offsetParent as HTMLElement); );
  return { top, left };
}

/**
 * 判断 container 是否为（或包含）node 的祖先。
 * 从 node 沿 parentElement 上溯，命中 container 即 true；到达根为 false。
 */
export function contains(container: Node, node: Node): boolean {
  do {
    if (node === container) return true;
  } while ((node = node.parentElement!));
  return false;
}
