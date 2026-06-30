// === Reconstructed SystemJS module: gui/jsx/jsx ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/jsx/jsx", [], function (e, t) {
  "use strict";
  t && t.id;
  return (
    e("createRef", function () {
      return { current: void 0 };
    }),
    e("jsx", function (e, t, ...i) {
      let { ref: r, ...s } = (t = t || {});
      return { isJsxElement: !0, type: e, props: { ...s, children: 1 < i.length ? i : i[0] }, ref: r };
    }),
    e("renderJsx", function r(e, s) {
      let a, n, o;
      return (e = Array.isArray(e) ? e : [e])
        .map((i) => {
          if (null == i || !i.isJsxElement) return [];
          if ("string" == typeof i.type)
            if (((n = i.props.children), "fragment" === i.type)) a = void 0;
            else {
              let e = s[i.type];
              if (!e) throw new Error(`No renderer defined for intrinsic JSX element "${i.type}"`);
              var t = e({ ref: i.ref, ...i.props });
              ((a = t.obj), a && (o = a), t.children && (n = t.children));
            }
          else {
            let t = new i.type(i.props);
            ((a = t.getUiObject()),
              (n = t.defineChildren?.() || i.props.children),
              t.onRender && a.onFrame.subscribeOnce((e) => t.onRender(e)),
              t.onFrame && a.onFrame.subscribe((e) => t.onFrame(e)),
              t.onDispose && a.onDispose.subscribe(() => t.onDispose()),
              (o = t));
          }
          return (
            (t = n ? (Array.isArray(n) ? n : [n]).map((e) => r(e, s)).reduce((e, t) => [...e, ...t], []) : []),
            a && a.add(...t),
            o && i.ref && ("function" == typeof i.ref ? i.ref?.(o) : (i.ref.current = o)),
            a ? [a] : null !== a ? t : []
          );
        })
        .reduce((e, t) => [...e, ...t], []);
    }),
    { setters: [], execute: function () {} }
  );
});
