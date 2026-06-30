// === Reconstructed SystemJS module: game/map/MapShroud ===
// deps: ["util/event","game/GameSpeed","engine/type/TerrainType","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/map/MapShroud",
  ["util/event", "game/GameSpeed", "engine/type/TerrainType", "util/math"],
  function (t, e) {
    "use strict";
    var i, r, a, v, s, n, o, b, S, l, c, h;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          v = e;
        },
      ],
      execute: function () {
        var e;
        ((s = 5),
          (o = 4.25),
          (S = (1 << (b = n = 3)) - 1),
          ((e = l || t("ShroudType", (l = {})))[(e.Unexplored = 0)] = "Unexplored"),
          (e[(e.TemporaryReveal = 1)] = "TemporaryReveal"),
          (e[(e.Explored = 2)] = "Explored"),
          ((e = c || t("ShroudFlag", (c = {})))[(e.Darken = 8)] = "Darken"),
          t(
            "MapShroud",
            (h = class h {
              constructor() {
                ((this.invalidations = new Map()),
                  (this.temporaryReveals = new Map()),
                  (this.fullInvalidation = !1),
                  (this._onChange = new i.EventDispatcher()));
              }
              get onChange() {
                return this._onChange.asEvent();
              }
              fromTiles(e) {
                var t,
                  i = e.getMapSize(),
                  r = e.getMaxTileHeight(),
                  r = (this.padding = (r + (r % 2)) / 2);
                ((this.size = { width: i.width + r, height: i.height + r }),
                  (this.tiles = new Uint8Array(this.size.width * this.size.height)),
                  this.tiles.fill(l.Unexplored),
                  (this.tileElevation = new Uint8Array(this.size.width * this.size.height)));
                for (t of e.getAll()) {
                  var s = this.getTileIndex(t);
                  this.tileElevation[s] = Math.max(
                    this.tileElevation[s],
                    t.terrainType === a.TerrainType.Cliff && 0 < t.z ? t.z - 1 : t.z,
                  );
                }
                return this;
              }
              getSize() {
                return this.size;
              }
              getTileIndex(e) {
                var { sx: t, sy: i } = this.rxyzToSxy(e.rx, e.ry, e.z);
                return t + i * this.size.width;
              }
              rxyzToSxy(e, t, i) {
                var r = (i |= 0) + (i % 2);
                return { sx: e - r / 2 + this.padding, sy: t - r / 2 + this.padding };
              }
              sxyzToRxy(e, t, i) {
                return { rx: e + Math.ceil(i / 2) - this.padding, ry: t + Math.ceil(i / 2) - this.padding };
              }
              shroudCoordsToWorld({ sx: e, sy: t }) {
                return this.sxyzToRxy(e, t, 0);
              }
              findTilesAtShroudCoords({ sx: e, sy: t }, i) {
                var r = i.getMaxTileHeight(),
                  s = r + (r % 2);
                let a = [];
                for (let l = 0; l <= s; l += 2) {
                  var n = l + (l % 2),
                    { rx: o, ry: n } = this.sxyzToRxy(e, t, n),
                    n = i.getByMapCoords(o, n);
                  n?.z === l && a.push(n);
                }
                return a;
              }
              clone() {
                let e = new h();
                return (
                  (e.tiles = this.tiles.slice()),
                  (e.size = this.size),
                  (e.padding = this.padding),
                  (e.tileElevation = this.tileElevation),
                  e
                );
              }
              copy(e) {
                ((this.tiles = e.tiles.slice()),
                  (this.size = e.size),
                  (this.padding = e.padding),
                  (this.tileElevation = e.tileElevation));
              }
              merge(e) {
                if (this.size.width !== e.size.width || this.size.height !== e.size.height)
                  throw new Error("Size mismatch");
                var t = e.tiles;
                for (let i = 0, r = this.tiles.length; i < r; i++)
                  this.tiles[i] = Math.max(t[i] & S, this.tiles[i] & S) | (((t[i] | this.tiles[i]) >> b) << b);
              }
              isShrouded(e, t = 0) {
                var i = this.rxyzToSxy(e.rx, e.ry, e.z + t);
                return this.getShroudTypeByShroudCoords(i) === l.Unexplored;
              }
              getShroudType(e) {
                return this.tiles[this.getTileIndex(e)] & S;
              }
              isFlagged(e, t) {
                return 0 != (this.tiles[this.getTileIndex(e)] & t);
              }
              getShroudTypeByTileCoords(e, t, i) {
                return this.getShroudTypeByShroudCoords(this.rxyzToSxy(e, t, i));
              }
              getShroudTypeByShroudCoords({ sx: e, sy: t }) {
                return e < 0 || t < 0 || e >= this.size.width || t >= this.size.height
                  ? l.Unexplored
                  : this.tiles[e + t * this.size.width] & S;
              }
              invalidateFull() {
                this.fullInvalidation = !0;
              }
              invalidate(e, t, i) {
                var r = e.sx + e.sy * this.size.width;
                let s = this.invalidations.get(r);
                (s || ((s = { center: e, elevation: 0, radius: 0 }), this.invalidations.set(r, s)),
                  (s.elevation = Math.max(s.elevation, t)),
                  (s.radius = Math.max(s.radius, i)));
              }
              revealFrom(e) {
                var t, i, r;
                (e.isBuilding() && e.wallTrait) ||
                  ((t = e.sight) &&
                    ((i = e.tile.z + e.tileElevation),
                    (r = this.rxyzToSxy(e.tile.rx, e.tile.ry, i)),
                    this.invalidate(r, i, t)));
              }
              revealAround(e, t) {
                var i = this.rxyzToSxy(e.rx, e.ry, e.z);
                this.invalidate(i, Number.POSITIVE_INFINITY, t);
              }
              unrevealAround(e, t) {
                var i = [],
                  r = this.rxyzToSxy(e.rx, e.ry, e.z);
                (this.setValueAround(r, t, Number.POSITIVE_INFINITY, i, l.Unexplored, l.Explored),
                  this._onChange.dispatch(this, { type: "incremental", coords: i }));
              }
              revealTemporarily(e) {
                var t = this.rxyzToSxy(e.tile.rx, e.tile.ry, e.tile.z + e.tileElevation);
                this.temporaryReveals.set(t, s * r.GameSpeed.BASE_TICKS_PER_SECOND);
              }
              revealObject(e) {
                var t = this.rxyzToSxy(e.tile.rx, e.tile.ry, e.tile.z + e.tileElevation);
                this.invalidate(t, Number.POSITIVE_INFINITY, o);
              }
              toggleFlagsAround(e, t, i, r) {
                var s = [],
                  a = this.rxyzToSxy(e.rx, e.ry, e.z);
                (this.setValueAround(
                  a,
                  t,
                  Number.POSITIVE_INFINITY,
                  s,
                  void 0,
                  void 0,
                  r ? { setFlags: i } : { clearFlags: i },
                ),
                  this._onChange.dispatch(this, { type: "incremental", coords: s }));
              }
              update() {
                let i = [];
                if (this.invalidations.size) {
                  for (var e of this.invalidations.values())
                    this.setValueAround(e.center, e.radius, e.elevation, i, l.Explored, [
                      l.Unexplored,
                      l.TemporaryReveal,
                    ]);
                  this.invalidations.clear();
                }
                (this.temporaryReveals.size &&
                  this.temporaryReveals.forEach((e, t) => {
                    e <= 0
                      ? (this.setValueAround(t, n, Number.POSITIVE_INFINITY, i, l.Unexplored, l.TemporaryReveal),
                        this.temporaryReveals.delete(t))
                      : (e === s * r.GameSpeed.BASE_TICKS_PER_SECOND &&
                          this.setValueAround(t, n, Number.POSITIVE_INFINITY, i, l.TemporaryReveal, l.Unexplored),
                        this.temporaryReveals.set(t, e - 1));
                  }),
                  this.fullInvalidation
                    ? ((this.fullInvalidation = !1), this._onChange.dispatch(this, { type: "full" }))
                    : i.length && this._onChange.dispatch(this, { type: "incremental", coords: i }));
              }
              setValueAround(i, r, s, a, n, o = void 0, { setFlags: l, clearFlags: c } = {}) {
                var e = Math.ceil(r),
                  h = v.clamp(i.sx - e, 0, this.size.width - 1),
                  u = v.clamp(i.sx + e, 0, this.size.width - 1),
                  d = v.clamp(i.sy - e, 0, this.size.height - 1),
                  g = v.clamp(i.sy + e, 0, this.size.height - 1),
                  p = this.size.width;
                for (let T = h; T <= u; T++)
                  for (let t = d; t <= g; t++) {
                    var m = T + t * p,
                      f = this.tiles[m] & S,
                      y = (this.tiles[m] >> b) << b;
                    let e = y;
                    (void 0 !== l && (e |= l),
                      void 0 !== c && (e &= ~c),
                      (void 0 !== o && ("number" != typeof o ? !o.includes(f) : o !== f)) ||
                        (T - i.sx) * (T - i.sx) + (t - i.sy) * (t - i.sy) > r * r + 1 ||
                        this.tileElevation[m] >= s + 4 ||
                        ((this.tiles[m] = (n ?? f) | e), (f === n && y === e) || a.push({ sx: T, sy: t })));
                  }
              }
              revealAll() {
                (this.tiles.fill(l.Explored), this._onChange.dispatch(this, { type: "clear" }));
              }
              reset() {
                (this.tiles.fill(l.Unexplored), this._onChange.dispatch(this, { type: "cover" }));
              }
            }),
          ));
      },
    };
  },
);
