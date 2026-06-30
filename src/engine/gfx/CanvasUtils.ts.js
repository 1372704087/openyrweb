// === Reconstructed SystemJS module: engine/gfx/CanvasUtils ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/CanvasUtils", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CanvasUtils",
        (i = class {
          static canvasFromRgbImageData(e, t, i) {
            let r = document.createElement("canvas"),
              s = r.getContext("2d");
            if (!s) throw new Error("Couldn't acquire canvas 2d context");
            let a = s.createImageData(t, i);
            ((r.width = t), (r.height = i));
            let n = 0;
            for (let o = 0, l = e.length; o < l; o += 3)
              ((a.data[n] = e[o]),
                (a.data[n + 1] = e[o + 1]),
                (a.data[n + 2] = e[o + 2]),
                (a.data[n + 3] = 255),
                (n += 4));
            return (s.putImageData(a, 0, 0), r);
          }
          static canvasFromRgbaImageData(e, t, i) {
            let r = document.createElement("canvas"),
              s = r.getContext("2d");
            if (!s) throw new Error("Couldn't acquire canvas 2d context");
            let a = s.createImageData(t, i);
            ((r.width = t), (r.height = i));
            let n = 0;
            for (let o = 0, l = e.length; o < l; o += 4)
              ((a.data[n] = e[o]),
                (a.data[n + 1] = e[o + 1]),
                (a.data[n + 2] = e[o + 2]),
                (a.data[n + 3] = e[o + 3]),
                (n += 4));
            return (s.putImageData(a, 0, 0), r);
          }
          static canvasFromIndexedImageData(e, t, i, s) {
            let r = document.createElement("canvas"),
              a = r.getContext("2d");
            if (!a) throw new Error("Couldn't acquire canvas 2d context");
            let n = a.createImageData(t, i);
            ((r.width = t), (r.height = i));
            let o = 0;
            return (
              e.forEach((e) => {
                var { r: t, g: i, b: r } = s.getColor(e);
                ((n.data[o++] = t), (n.data[o++] = i), (n.data[o++] = r), (n.data[o++] = e ? 255 : 0));
              }),
              a.putImageData(n, 0, 0),
              r
            );
          }
          static async canvasToBlob(e) {
            let t = await new Promise((t) => {
              try {
                e.toBlob((e) => {
                  t(e);
                });
              } catch (e) {
                (console.error(e), t(null));
              }
            });
            if (!t) {
              console.warn("Failed to convert canvas to blob. Falling back to dataURL generation.");
              try {
                t = this.dataUrlToBlob(e.toDataURL());
              } catch (e) {
                throw new Error("Failed to generate image from canvas using fallback", { cause: e });
              }
            }
            return t;
          }
          static dataUrlToBlob(e) {
            var t = e.match(/^data:((.*?)(;charset=.*?)?)(;base64)?,/);
            if (!t) throw new Error("invalid dataURI");
            var i = t[2] ? t[1] : "text/plain" + (t[3] || ";charset=utf-8"),
              r = !!t[4],
              t = e.slice(t[0].length);
            let s = (r ? atob : decodeURIComponent)(t),
              a = [];
            for (let n = 0; n < s.length; n++) a.push(s.charCodeAt(n));
            return new Blob([new Uint8Array(a)], { type: i });
          }
          static drawText(
            e,
            t,
            i = 0,
            r = 0,
            {
              color: s = "white",
              backgroundColor: a,
              outlineColor: n,
              outlineWidth: o,
              fontSize: l,
              fontFamily: c = "Arial, sans-serif",
              fontWeight: h = "normal",
              borderColor: u,
              borderWidth: d = 0,
              paddingTop: g = 0,
              paddingBottom: p = 0,
              paddingLeft: m = 0,
              paddingRight: f = 0,
              textAlign: y = "left",
              width: T,
              height: v,
              autoEnlargeCanvas: b = !1,
            },
          ) {
            var S = h + ` ${l}px ` + c;
            e.font = S;
            var w = e.measureText(t),
              E = e.measureText("A"),
              C = E.actualBoundingBoxAscent + E.actualBoundingBoxDescent,
              x = Math.ceil(Math.max(w.width, Math.abs(w.actualBoundingBoxLeft) + Math.abs(w.actualBoundingBoxRight))),
              O = x + 2 * d + m + f,
              O = {
                x: "right" === y && void 0 === T ? e.canvas.width - O : i,
                y: r,
                width: T ?? O,
                height: v ?? C + 2 * d + g + p,
              };
            (b &&
              (O.x + O.width > e.canvas.width || O.y + O.height > e.canvas.height) &&
              ((C =
                0 < e.canvas.width + e.canvas.height ? e.getImageData(0, 0, e.canvas.width, e.canvas.height) : void 0),
              O.x + O.width > e.canvas.width && (e.canvas.width = O.x + O.width),
              O.y + O.height > e.canvas.height && (e.canvas.height = O.y + O.height),
              C && e.putImageData(C, 0, 0)),
              a && ((e.fillStyle = a), e.fillRect(O.x, O.y, O.width, O.height)),
              u &&
                ((e.strokeStyle = u), (e.lineWidth = 1), e.strokeRect(0.5 + O.x, 0.5 + O.y, O.width - 1, O.height - 1)),
              (e.fillStyle = s),
              (e.font = S));
            let A = d + m;
            "right" === y
              ? (A = O.width - d - f - x)
              : "center" === y && (A += Math.floor((O.width - 2 * d - m - f - x) / 2));
            w = w.actualBoundingBoxAscent + g + (E.actualBoundingBoxAscent - w.actualBoundingBoxAscent);
            return (
              n &&
                ((e.strokeStyle = n), (e.lineWidth = 2 * (o ?? 1)), e.strokeText(t, O.x + A + 0.5, O.y + w, O.width)),
              e.fillText(t, O.x + A + 0.5, O.y + w, O.width),
              O
            );
          }
        }),
      );
    },
  };
});
