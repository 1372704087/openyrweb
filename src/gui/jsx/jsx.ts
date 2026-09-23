/**
 * jsx — 轻量 JSX 运行时：createRef / jsx / renderJsx。
 *
 * jsx 拆出 ref，children 单元素不包数组；renderJsx 递归实例化组件或
 * 查 intrinsic renderer，挂子节点、绑定 onFrame/onDispose，并写 ref。
 *
 * 由 gui/jsx/jsx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 可变 ref 容器。
 * @returns `{current: undefined}`
 */
export function createRef(): { current: any } {
  return { current: undefined };
}

/**
 * 构造轻量 JSX 元素（非 React）。
 * @param type - 标签名或组件类
 * @param config - props（含可选 ref）
 * @param children - 展开的 children
 */
export function jsx(type: any, config?: any, ...children: any[]): any {
  let { ref, ...props } = config = config || {};
  return {
    isJsxElement: true,
    type,
    props: { ...props, children: children.length > 1 ? children : children[0] },
    ref,
  };
}

/**
 * 递归渲染 jsx 树为 UiObject 列表。
 * @param node - 根（或数组）
 * @param intrinsicRenderers - 标签名 → renderer 映射
 */
export function renderJsx(node: any, intrinsicRenderers: Record<string, any>): any[] {
  let obj: any;
  let children: any;
  let instance: any;
  return (Array.isArray(node) ? node : [node])
    .map((el: any) => {
      if (el == null || !el.isJsxElement) return [];
      if (typeof el.type === "string") {
        children = el.props.children;
        if (el.type === "fragment") {
          obj = undefined;
        } else {
          const renderer = intrinsicRenderers[el.type];
          if (!renderer) throw new Error(`No renderer defined for intrinsic JSX element "${el.type}"`);
          const out = renderer({ ref: el.ref, ...el.props });
          obj = out.obj;
          if (obj) instance = obj;
          if (out.children) children = out.children;
        }
      } else {
        const comp = new el.type(el.props);
        obj = comp.getUiObject();
        children = comp.defineChildren?.() || el.props.children;
        if (comp.onRender) obj.onFrame.subscribeOnce((e: any) => comp.onRender(e));
        if (comp.onFrame) obj.onFrame.subscribe((e: any) => comp.onFrame(e));
        if (comp.onDispose) obj.onDispose.subscribe(() => comp.onDispose());
        instance = comp;
      }
      const kids = children
        ? (Array.isArray(children) ? children : [children])
            .map((c: any) => renderJsx(c, intrinsicRenderers))
            .reduce((a: any[], b: any[]) => [...a, ...b], [])
        : [];
      if (obj) obj.add(...kids);
      if (instance && el.ref) {
        if (typeof el.ref === "function") el.ref?.(instance);
        else el.ref.current = instance;
      }
      if (obj) return [obj];
      return null !== obj ? kids : [];
    })
    .reduce((a: any[], b: any[]) => [...a, ...b], []);
}
