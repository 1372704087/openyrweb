// === Reconstructed SystemJS module: gui/screen/mainMenu/lobby/MapPreviewRenderer ===
// deps: ["engine/gfx/CanvasUtils","gui/HtmlContainer","gui/UiObject","gui/screen/mainMenu/lobby/component/viewmodel/lobby","game/Coords","engine/IsoCoords","data/ShpFile","data/Palette","engine/gfx/ImageUtils","engine/Engine"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/lobby/MapPreviewRenderer",
  [
    "engine/gfx/CanvasUtils",
    "gui/HtmlContainer",
    "gui/UiObject",
    "gui/screen/mainMenu/lobby/component/viewmodel/lobby",
    "game/Coords",
    "engine/IsoCoords",
    "data/ShpFile",
    "data/Palette",
    "engine/gfx/ImageUtils",
    "engine/Engine",
  ],
  function (e, t) {
    "use strict";
    var d, g, p, i, m, f, y, r, w, v, b, S;
    t && t.id;
    return {
      setters: [
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
      ],
      execute: function () {
        ((y = new Map([
          [i.LobbyType.Singleplayer, "STT:SkirmishMapThumbnail"],
          [i.LobbyType.MultiplayerHost, "STT:HostMapThumbnail"],
          [i.LobbyType.MultiplayerGuest, "STT:GuestMapThumbnail"],
        ])),
          e(
            "MapPreviewRenderer",
            (r = class {
              constructor(e) {
                (this.strings = e),
                  (this._startButCanvas = null),
                  (this._startButFrameWidth = 0),
                  (this._startButFrameHeight = 0),
                  (this._startButNumFrames = 0);
              }
              render(a, n, o) {
                let l;
                try {
                  l = a.decodePreviewImage();
                } catch (e) {
                  console.error("Failed to decode map preview data", e);
                }
                if (l) {
                  var { data: c, width: h, height: u } = l;
                  let e = d.CanvasUtils.canvasFromRgbImageData(c, h, u),
                    t = 1;
                  u = e.width < o.width / 2 || e.height < o.height / 2 ? 4 : 2;
                  let i = document.createElement("canvas");
                  ((i.width = u * e.width), (i.height = u * e.height));
                  let r = i.getContext("2d");
                  (r && ((t = u), r.scale(t, t), r.drawImage(e, 0, 0), (e = i)), this.drawStartLocations(e, a, o, t));
                  let s = new g.HtmlContainer();
                  u = new p.UiObject(new THREE.Object3D(), s);
                  return (
                    s.setSize("100%", "100%"),
                    s.render(),
                    (e.style.objectFit = "contain"),
                    (e.style.width = "100%"),
                    (e.style.height = "100%"),
                    e.setAttribute("data-r-tooltip", this.strings.get(y.get(n))),
                    s.getElement().appendChild(e),
                    u
                  );
                }
              }
              drawStartLocations(i, r, e, s) {
                var a = i.getContext("2d");
                if (a) {
                  this._loadStartBut();
                  f.IsoCoords.init({ x: 0, y: (r.fullSize.width * m.Coords.getWorldTileSize()) / 2 });
                  var n,
                    o,
                    t = f.IsoCoords.worldToScreen(0, 0),
                    l = f.IsoCoords.screenToScreenTile(t.x, t.y),
                    t = i.width > i.height ? i.width / e.width / s : i.height / e.height / s,
                    c = 13 * t,
                    k = 13 * t,
                    h = 2 * t;
                  for ([n, o] of r.startingLocations.entries()) {
                    var u = o,
                      u = f.IsoCoords.tileToScreen(u.x, u.y);
                    let e = f.IsoCoords.screenToScreenTile(u.x, u.y);
                    ((e.x += l.x), (e.y += l.y));
                    let t = this.dxyToCanvas(e.x, e.y, i, r.localSize);
                    if (((t.x /= s), (t.y /= s), this._startButCanvas)) {
                      var p = Math.max(k * 1.5, 14);
                      a.drawImage(
                        this._startButCanvas,
                        0,
                        0,
                        this._startButFrameWidth,
                        this._startButFrameHeight,
                        t.x - p / 2,
                        t.y - p / 2,
                        p,
                        p,
                      );
                    }
                    d.CanvasUtils.drawText(a, String(n + 1), t.x - k / 4, t.y - k / 2, {
                      fontSize: k,
                      color: "#FFEF63",
                      fontWeight: "bold",
                    });
                  }
                }
              }
              _loadStartBut() {
                if (this._startButCanvas) return;
                try {
                  var e = S.Engine.vfs;
                  if (!e) return;
                  var t = new w.ShpFile(e.openFile("startbut.shp")),
                    i = "shell.pal",
                    r = new v.Palette(e.openFile(i));
                  (this._startButCanvas = b.ImageUtils.convertShpToCanvas(t, r)),
                    (this._startButFrameWidth = t.width),
                    (this._startButFrameHeight = t.height),
                    (this._startButNumFrames = t.numImages);
                } catch (e) {
                  console.warn("Failed to load startbut.shp", e), (this._startButCanvas = null);
                }
              }
              dxyToCanvas(e, t, i, r) {
                var s = i.width / (2 * r.width),
                  a = i.height / r.height / 2;
                return { x: (e - 2 * r.x) * s, y: (t - 2 * r.y) * a };
              }
            }),
          ));
      },
    };
  },
);
