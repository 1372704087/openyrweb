// === Reconstructed SystemJS module: util/stream ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/stream", [], function (e, t) {
  "use strict";
  t && t.id;
  return (
    e("makeTextFileLineIterator", async function* (e) {
      const t = new TextDecoder("utf-8");
      let i = e.stream().getReader(),
        { value: r, done: s } = await i.read();
      r = r ? t.decode(r, { stream: !0 }) : "";
      let a = /\r\n|\n|\r/gm,
        n = 0;
      for (;;) {
        var o = a.exec(r);
        if (o) (yield r.substring(n, o.index), (n = a.lastIndex));
        else {
          if (s) break;
          o = r.substr(n);
          (({ value: r, done: s } = await i.read()),
            (r = o + (r ? t.decode(r, { stream: !0 }) : "")),
            (n = a.lastIndex = 0));
        }
      }
      n < r.length && (yield r.substr(n));
    }),
    { setters: [], execute: function () {} }
  );
});
