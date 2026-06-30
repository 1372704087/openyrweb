// === Reconstructed SystemJS module: game/map/MapBounds ===
// deps: ["util/geometry","game/Coords","util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/MapBounds", ["util/geometry", "game/Coords", "util/event"], function (e, t) {
  "use strict";
  var s, a, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        a = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "MapBounds",
        (r = class {
          constructor() {
            ((this.mapCutoffHeight = 0),
              (this.mapBuildableSize = { x: 0, y: 0, width: 0, height: 0 }),
              (this.localSize = { x: 0, y: 0, width: 0, height: 0 }),
              (this.fullSize = { width: 0, height: 0 }),
              (this.clampedFullSize = { x: 0, y: 0, width: 0, height: 0 }),
              (this.rawLocalSize = { x: 0, y: 0, width: 0, height: 0 }),
              (this._onLocalResize = new i.EventDispatcher()));
          }
          get onLocalResize() {
            return this._onLocalResize.asEvent();
          }
          fromMapFile(e, t) {
            ((this.fullSize = { width: 2 * e.fullSize.width, height: 2 * e.fullSize.height }),
              (this.clampedFullSize = {
                x: 1,
                y: 2,
                width: 2 * (e.fullSize.width - 1) - 1 / a.Coords.ISO_TILE_SIZE,
                height: 2 * (e.fullSize.height - 1) + 1 - 1 / a.Coords.ISO_TILE_SIZE,
              }),
              (this.mapCutoffHeight = Math.max(9, t.getCutoffTileHeight())));
            var i = Math.max(2, e.localSize.x),
              i = {
                x: i,
                y: e.localSize.y,
                width: Math.min(e.fullSize.width - 2 - i, e.localSize.width),
                height: e.localSize.height,
              };
            return (this.updateRawLocalSize(i), this);
          }
          updateRawLocalSize(e) {
            this.rawLocalSize.width && this.rawLocalSize.height && !s.rectContainsRect(e, this.rawLocalSize)
              ? console.warn("New map limits must be outside old limits. Skipping.")
              : s.rectEquals(e, this.rawLocalSize) ||
                ((this.localSize = this.computeLocalSize(e, this.fullSize.height / 2, this.mapCutoffHeight)),
                (this.rawLocalSize = { ...e }),
                (this.mapBuildableSize = {
                  x: this.localSize.x,
                  y: this.localSize.y + 4,
                  width: this.localSize.width - 2,
                  height: this.localSize.height - 8,
                }),
                this._onLocalResize.dispatch(this));
          }
          computeLocalSize(e, t, i) {
            return {
              x: 2 * e.x,
              y: 2 * e.y - 4,
              height: Math.min(2 * (e.height + 5) - 1, 2 * t - 2 * (e.y - 3) - i),
              width: 2 * e.width,
            };
          }
          getLocalSize() {
            return this.localSize;
          }
          getRawLocalSize() {
            return this.rawLocalSize;
          }
          getFullSize() {
            return this.fullSize;
          }
          getClampedFullSize() {
            return this.clampedFullSize;
          }
          isWithinBounds(e) {
            return s.rectContainsPoint(this.mapBuildableSize, { x: e.dx, y: e.dy - e.z });
          }
          clampWithinBounds(e) {
            let { x: t, y: i } = s.rectClampPoint(this.mapBuildableSize, { x: e.dx, y: e.dy - e.z });
            return (
              (i += (t % 2) - (i % 2)),
              i > this.mapBuildableSize.y + this.mapBuildableSize.height && (i -= 2),
              { dx: t, dy: i }
            );
          }
          isWithinHardBounds(e) {
            var t = e.x / a.Coords.LEPTONS_PER_TILE,
              i = (e.z ?? e.y) / a.Coords.LEPTONS_PER_TILE,
              r = t - i + this.fullSize.width / 2 - 1,
              i = t + i - this.fullSize.width / 2 - 1;
            return s.rectContainsPoint(this.clampedFullSize, { x: ++r, y: ++i });
          }
        }),
      );
    },
  };
});
