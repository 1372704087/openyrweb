// === Reconstructed SystemJS module: engine/renderable/entity/map/MinimapRenderer ===
// deps: ["game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/map/MinimapRenderer", ["game/Coords"], function (e, t) {
  "use strict";
  var o, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
    ],
    execute: function () {
      e(
        "MinimapRenderer",
        (i = class {
          constructor(e, t, i, r, s) {
            ((this.map = e), (this.minimapModel = t), (this.borderColor = r), (this.canvasRenderScale = s));
            var a = this.map.mapBounds.getRawLocalSize();
            this.dxySize = { x: 2 * a.x, y: 2 * a.y + 4, width: 2 * a.width, height: 2 * a.height + 8 };
            a = this.dxySize.height / this.dxySize.width;
            this.canvasSize = this.computeCanvasSize(i, a);
          }
          computeCanvasSize(e, t) {
            var i = e.width,
              r = e.height;
            let s;
            return (
              (s = r / i <= t ? { width: Math.floor(r / t), height: r } : { width: i, height: Math.floor(i * t) }),
              s
            );
          }
          renderFull() {
            if (this.canvas)
              ((this.ctx.fillStyle = "black"),
                this.ctx.fillRect(
                  0,
                  0,
                  this.canvasRenderScale * this.canvasSize.width,
                  this.canvasRenderScale * this.canvasSize.height,
                ));
            else {
              let e = (this.canvas = document.createElement("canvas"));
              ((e.width = this.canvasRenderScale * this.canvasSize.width),
                (e.height = this.canvasRenderScale * this.canvasSize.height));
              let t = (this.ctx = e.getContext("2d", { alpha: !1 }));
              t.translate(0.5, 0.5);
            }
            return (this.renderTiles(this.map.tiles.getAll(), !0), this.canvas);
          }
          renderIncremental(e) {
            let t = new Set(e);
            for (var i of e) {
              let e = this.map.tiles.getAllNeighbourTiles(i);
              e.forEach((e) => t.add(e));
            }
            this.renderTiles(t);
          }
          renderTiles(e, t = !1) {
            var i,
              r = this.canvasSize.width / this.dxySize.width / o.Coords.COS_ISO_CAMERA_BETA;
            const s = this.ctx;
            if (!s) throw new Error("Must do a full render before re-rendering any individual tiles.");
            ((s.imageSmoothingEnabled = !1), s.save(), s.rotate(o.Coords.ISO_CAMERA_BETA), s.scale(r, r));
            for (i of e) {
              var a,
                n = this.minimapModel.getTileColor(i);
              !n ||
                (t && "#000000" === n) ||
                ((s.fillStyle = n),
                ({ x: a, y: n } = this.tileToLocalRxyOrigin(i)),
                s.fillRect(
                  this.canvasRenderScale * a,
                  this.canvasRenderScale * n,
                  this.canvasRenderScale + 0.5,
                  this.canvasRenderScale + 0.5,
                ));
            }
            (s.restore(),
              (s.strokeStyle = this.borderColor),
              (s.lineWidth = this.canvasRenderScale),
              s.strokeRect(0, 0, s.canvas.width - this.canvasRenderScale, s.canvas.height - this.canvasRenderScale));
          }
          tileToLocalRxyOrigin(e) {
            var t = this.dxyToLocalRxy(this.dxySize.x, this.dxySize.y);
            return { x: e.rx - t.x, y: e.ry - this.map.mapBounds.getFullSize().width / 2 - t.y };
          }
          dxyToLocalRxy(e, t) {
            return { x: (e + t) / 2, y: (t - e) / 2 };
          }
          dxyToCanvas(e, t) {
            var i = this.canvasSize.width / this.dxySize.width;
            return { x: (e - this.dxySize.x) * i, y: (t - this.dxySize.y) * i };
          }
          canvasToDxy(e, t) {
            var i = this.canvasSize.width / this.dxySize.width;
            return { x: e / i + this.dxySize.x, y: t / i + this.dxySize.y };
          }
        }),
      );
    },
  };
});
