// === Reconstructed SystemJS module: game/gameobject/ObjectPosition ===
// deps: ["game/Coords","util/event","game/theater/rampHeights","game/math/Vector3","game/math/Vector2","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/ObjectPosition",
  ["game/Coords", "util/event", "game/theater/rampHeights", "game/math/Vector3", "game/math/Vector2", "util/math"],
  function (e, t) {
    "use strict";
    var o, i, n, r, s, a, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        e(
          "ObjectPosition",
          (l = class l {
            get onPositionChange() {
              return this._onPositionChange.asEvent();
            }
            get worldPosition() {
              return this._worldPosition;
            }
            get tile() {
              return this._tile;
            }
            set tile(e) {
              var t = !!this._tile && e !== this._tile;
              (this._tile = e) &&
                (this.updateWorldPosition(e, this._tileOffset),
                this._onPositionChange.dispatch(this, { tileChanged: t }));
            }
            get tileElevation() {
              return void 0 === this._tileElevation
                ? (void 0 === this._computedTileElevation &&
                    (this._computedTileElevation = this.computeTileElevationFromWorldPos()),
                  this._computedTileElevation)
                : this._tileElevation;
            }
            set tileElevation(e) {
              ((this._absoluteElevation = void 0),
                (this._tileElevation = e),
                this._tile &&
                  (this.updateWorldPosition(this._tile, this._tileOffset),
                  this._onPositionChange.dispatch(this, { tileChanged: !1 })));
            }
            get subCell() {
              if (!this._tileOffset.x && !this._tileOffset.y) return 0;
              var e = Math.sign(this._tileOffset.x / o.Coords.LEPTONS_PER_TILE - 0.5),
                t = Math.sign(this._tileOffset.y / o.Coords.LEPTONS_PER_TILE - 0.5);
              return e && t ? t + 1 + (e + 1) / 2 + 1 : 0;
            }
            set subCell(e) {
              ((this._tileOffset = this.computeSubCellOffset(e)),
                (this.desiredSubCell = e),
                this._tile &&
                  (this.updateWorldPosition(this._tile, this._tileOffset),
                  this._onPositionChange.dispatch(this, { tileChanged: !1 })));
            }
            constructor(e, t) {
              ((this.tiles = e),
                (this.tileOccupation = t),
                (this._worldPosition = new r.Vector3()),
                (this._tileOffset = new s.Vector2()),
                (this._centerOffset = new s.Vector2()),
                (this.desiredSubCell = 0),
                (this._tileElevation = 0),
                (this._onPositionChange = new i.EventDispatcher()));
            }
            getTileOffset() {
              return this._tileOffset.clone();
            }
            setTileOffset(e) {
              (this._tileOffset.copy(e),
                this._tile &&
                  (this.updateWorldPosition(this._tile, this._tileOffset),
                  this._onPositionChange.dispatch(this, { tileChanged: !1 })));
            }
            setCenterOffset(e) {
              (this._centerOffset.copy(e),
                this._tile &&
                  (this.updateWorldPosition(this._tile, this._tileOffset),
                  this._onPositionChange.dispatch(this, { tileChanged: !1 })));
            }
            getMapPosition() {
              if (this._tile)
                return new s.Vector2(
                  this._tile.rx * o.Coords.LEPTONS_PER_TILE + this._tileOffset.x + this._centerOffset.x,
                  this._tile.ry * o.Coords.LEPTONS_PER_TILE + this._tileOffset.y + this._centerOffset.y,
                );
            }
            getBridgeBelow() {
              return this._tile?.onBridgeLandType ? this.tileOccupation.getBridgeOnTile(this._tile) : void 0;
            }
            moveToTileCell(e, t = 0) {
              if (!this._tile) throw new Error("Tile is not set");
              var i = e !== this._tile;
              ((this._tile = e),
                (this._tileOffset = this.computeSubCellOffset(t)),
                (this.desiredSubCell = t),
                this.updateWorldPosition(e, this._tileOffset),
                this._onPositionChange.dispatch(this, { tileChanged: i }));
            }
            moveToTileCoords(e, t, i = !1) {
              var r = Math.floor(e),
                s = Math.floor(t),
                a = !this._tile || this._tile.rx !== r || this._tile.ry !== s;
              if (a) {
                let e = this.tiles.getByMapCoords(r, s);
                if (!e) {
                  if (!i) throw new RangeError(`Attempted move to a non-existent tile: [${r},${s}]`);
                  e = this.tiles.getPlaceholderTile(r, s);
                }
                this._tile = e;
              }
              (this._tileOffset.set((e - r) * o.Coords.LEPTONS_PER_TILE, (t - s) * o.Coords.LEPTONS_PER_TILE),
                this.updateWorldPosition(this._tile, this._tileOffset),
                this._onPositionChange.dispatch(this, { tileChanged: a }));
            }
            moveToLeptons(e, t = !1) {
              this.moveToTileCoords(e.x / o.Coords.LEPTONS_PER_TILE, e.y / o.Coords.LEPTONS_PER_TILE, t);
            }
            moveByLeptons(e, t, i = !1) {
              if (!this._tile) throw new Error("Tile is not set");
              this.moveToTileCoords(
                this._tile.rx + (this._tileOffset.x + e) / o.Coords.LEPTONS_PER_TILE,
                this._tile.ry + (this._tileOffset.y + t) / o.Coords.LEPTONS_PER_TILE,
                i,
              );
            }
            moveByLeptons3(e, t = !1) {
              var i = this._worldPosition.y;
              (this.moveByLeptons(e.x, e.z, t), this.setAbsoluteElevationWorld(i + e.y));
            }
            setAbsoluteElevationWorld(e) {
              ((this._absoluteElevation = e),
                (this._tileElevation = void 0),
                this._tile &&
                  (this.updateWorldPosition(this._tile, this._tileOffset),
                  this._onPositionChange.dispatch(this, { tileChanged: !1 })));
            }
            computeSubCellOffset(e) {
              let t = { width: 0, height: 0 };
              var i;
              e &&
                ((i = ((e - 1) % 2) * 2 - 1),
                (r = 2 * Math.floor((e - 1) / 2) - 1),
                (t = { width: (i * o.Coords.LEPTONS_PER_TILE) / 4, height: (r * o.Coords.LEPTONS_PER_TILE) / 4 }));
              var r = o.Coords.LEPTONS_PER_TILE / 2;
              return new s.Vector2(r + t.width, r + t.height);
            }
            interpolateRampHeight(e, t, i) {
              var r = n.rampHeights[i],
                s = r[1],
                a = r[0];
              return s * (1 - e) * (1 - t) + r[2] * e * (1 - t) + a * (1 - e) * t + r[3] * e * t;
            }
            updateWorldPosition(t, e) {
              var i = e.x + this._centerOffset.x,
                r = e.y + this._centerOffset.y,
                s = i / o.Coords.LEPTONS_PER_TILE,
                a = r / o.Coords.LEPTONS_PER_TILE;
              let n;
              if (void 0 !== this._tileElevation) {
                let e = 0;
                (0 !== t.rampType && (e = this.interpolateRampHeight(s, a, t.rampType)),
                  (n = o.Coords.tileHeightToWorld(t.z + e + this._tileElevation)));
              } else n = this._absoluteElevation;
              (this._worldPosition.set(t.rx * o.Coords.LEPTONS_PER_TILE + i, n, t.ry * o.Coords.LEPTONS_PER_TILE + r),
                void 0 === this._tileElevation &&
                  (this._computedTileElevation = this.computeTileElevationFromWorldPos()));
            }
            computeTileElevationFromWorldPos() {
              if (!this._tile) return 0;
              var e = a.roundToDecimals(o.Coords.worldToTileHeight(this._worldPosition.y), 14),
                t = (this._tileOffset.x + this._centerOffset.x) / o.Coords.LEPTONS_PER_TILE,
                i = (this._tileOffset.y + this._centerOffset.y) / o.Coords.LEPTONS_PER_TILE;
              let r = 0;
              return (
                0 !== this._tile.rampType && (r = this.interpolateRampHeight(t, i, this._tile.rampType)),
                e - this._tile.z - r
              );
            }
            clone() {
              let e = new l(this.tiles, this.tileOccupation);
              return (
                (e._worldPosition = this._worldPosition.clone()),
                (e._tile = this._tile),
                (e._tileOffset = this._tileOffset.clone()),
                (e._centerOffset = this._centerOffset.clone()),
                (e._tileElevation = this._tileElevation),
                (e._absoluteElevation = this._absoluteElevation),
                (e._computedTileElevation = this._computedTileElevation),
                e
              );
            }
          }),
        );
      },
    };
  },
);
