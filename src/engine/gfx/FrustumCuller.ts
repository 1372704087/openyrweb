/**
 * FrustumCuller — 八叉树视锥剔除：按包围盒递归标记 visible 并收集可见节点。
 *
 * 由 engine/gfx/FrustumCuller.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 八叉树节点最小形状。 */
export interface OctreeNodeLike {
  box: any;
  visible: boolean;
  children?: any[] | null;
  isOctree?: boolean;
  config?: { skipInvisMatrixUpdate?: boolean };
  updateMatrixWorld(force?: boolean): void;
}

/** 视锥剔除器。 */
export class FrustumCuller {
  /**
   * 从 root 起按 box 与 frustum 相交性标记 visible，返回可见节点数组。
   * 相交 → visible=true 并入列；不相交 → visible=false（子树不深入）。
   * 可见父节点下：若子节点是 octree 则递归；否则仅当父原本不可见且
   * skipInvisMatrixUpdate 时补一次 updateMatrixWorld。
   */
  cull(root: OctreeNodeLike, frustum: any): any[] {
    const result: any[] = [];
    const visit = (node: OctreeNodeLike, f: any, out: any[], depth: number = 0): void => {
      const children = node.children;
      const wasVisible = node.visible;
      if (f.intersectsBox(node.box)) {
        node.visible = true;
        if (children !== null && children !== undefined) {
          for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[i];
            if (child.isOctree) {
              visit(child, f, out, depth + 1);
            } else if (!wasVisible && node.config && node.config.skipInvisMatrixUpdate) {
              child.updateMatrixWorld(false);
            }
          }
        }
        out.push(node);
      } else {
        node.visible = false;
      }
    };
    visit(root, frustum, result, 0);
    return result;
  }
}
