// === Reconstructed SystemJS module: gui/component/Image ===
// deps: ["data/Palette","data/PcxFile","data/ShpFile","engine/gfx/ImageUtils","react","gui/component/ImageContext"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/Image",
  ["data/Palette", "data/PcxFile", "data/ShpFile", "engine/gfx/ImageUtils", "react", "gui/component/ImageContext"],
  function (e, t) {
    "use strict";
    var c, h, u, d, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e("Image", (n) => {
          const o = r.ImageContext,
            [e, l] = i.useState("");
          return (
            i.useEffect(() => {
              let t, e;
              if (o.imageUrlCache.has(n.src)) t = o.imageUrlCache.get(n.src);
              else if (o.vfs?.fileExists(n.src)) {
                var i = n.src.split(".").pop();
                if ("shp" === i) {
                  var r,
                    s,
                    a = n.palette;
                  t = o.vfs.fileExists(a)
                    ? ((r = new u.ShpFile(o.vfs.openFile(n.src))),
                      (s = new c.Palette(o.vfs.openFile(a))),
                      d.ImageUtils.convertShpToCanvas(r, s).toDataURL())
                    : (console.warn(`Palette "${a}" not found in VFS"`), "");
                } else if ("pcx" === i) {
                  let e = new h.PcxFile(o.vfs.openFile(n.src));
                  t = e.toDataUrl();
                } else
                  "png" === i
                    ? ((a = o.vfs.openFile(n.src).stream),
                      (a = new Blob([new Uint8Array(a.buffer, a.byteOffset, a.byteLength)], { type: "image/png" })),
                      (t = URL.createObjectURL(a)),
                      (e = () => {
                        (URL.revokeObjectURL(t), o.imageUrlCache.delete(n.src));
                      }))
                    : (console.warn(`Unknown image format "${i}"`), (t = ""));
                o.imageUrlCache.set(n.src, t);
              } else
                t = o.cdnBaseUrl
                  ? o.cdnBaseUrl + n.src.substring(0, n.src.lastIndexOf(".")) + ".png"
                  : (console.warn(`Image "${n.src}" not found in VFS`), "");
              return (l(t), e);
            }, [n.src]),
            e ? i.default.createElement("img", { src: e }) : null
          );
        });
      },
    };
  },
);
