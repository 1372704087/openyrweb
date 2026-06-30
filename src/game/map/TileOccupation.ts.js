// === Reconstructed SystemJS module: game/map/TileOccupation ===
// deps: ["game/type/LandType","util/event","game/gameobject/unit/ZoneType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/map/TileOccupation",
  ["game/type/LandType", "util/event", "game/gameobject/unit/ZoneType"],
  function (t, e) {
    "use strict";
    var r, s, a, i, n;
    e && e.id;
    return {
      setters: [
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
        var e;
        (((e = i || t("LayerType", (i = {})))[(e.All = 0)] = "All"),
          (e[(e.Ground = 1)] = "Ground"),
          (e[(e.Air = 2)] = "Air"),
          t(
            "TileOccupation",
            (n = class {
              get onChange() {
                return this._onChange.asEvent();
              }
              constructor(e) {
                ((this.tiles = e),
                  (this.tileOccupation = []),
                  (this.emptyTiles = new Set()),
                  (this._onChange = new s.EventDispatcher()));
                let t = this.tileOccupation;
                for (var i of e.getAll())
                  ((t[i.rx] = t[i.rx] || []), (t[i.rx][i.ry] = new Set()), this.emptyTiles.add(i));
              }
              occupyTileRange(e, t) {
                let i = this.calculateTilesForGameObject(e, t);
                (i.forEach((e) => this.occupyTile(e, t)),
                  this._onChange.dispatch(this, { tiles: i, object: t, type: "added" }));
              }
              unoccupyTileRange(e, t) {
                let i = this.calculateTilesForGameObject(e, t);
                (i.forEach((e) => this.unoccupyTile(e, t)),
                  this._onChange.dispatch(this, { tiles: i, object: t, type: "removed" }));
              }
              occupySingleTile(e, t) {
                (this.occupyTile(e, t), this._onChange.dispatch(this, { tiles: [e], object: t, type: "added" }));
              }
              unoccupySingleTile(e, t) {
                (this.unoccupyTile(e, t), this._onChange.dispatch(this, { tiles: [e], object: t, type: "removed" }));
              }
              calculateTilesForGameObject(e, t) {
                return this.tiles.getInRectangle(e, t.getFoundation());
              }
              occupyTile(e, t) {
                let i = this.tileOccupation[e.rx]?.[e.ry];
                i &&
                  (i.add(t),
                  this.emptyTiles.delete(e),
                  (e.landType = this.computeTileLandType(e)),
                  (e.onBridgeLandType = this.computeOnBridgeLandType(e)));
              }
              unoccupyTile(e, t) {
                let i = this.tileOccupation[e.rx]?.[e.ry];
                i &&
                  (i.delete(t),
                  i.size || this.emptyTiles.add(e),
                  (e.landType = this.computeTileLandType(e)),
                  (e.onBridgeLandType = this.computeOnBridgeLandType(e)));
              }
              isTileOccupiedBy(e, t) {
                return !!this.tileOccupation[e.rx]?.[e.ry]?.has(t);
              }
              computeTileLandType(e) {
                if (e.landType === r.LandType.Rock) return r.LandType.Rock;
                var t,
                  i = r.getLandType(e.terrainType);
                for (t of this.tileOccupation[e.rx]?.[e.ry] ?? []) {
                  if (t.isBuilding() && t.rules.wall) return r.LandType.Wall;
                  if (t.isOverlay() && !t.isBridge() && !t.isBridgePlaceholder())
                    if (t.getLandType() !== r.LandType.Clear) return t.getLandType();
                }
                return i;
              }
              computeOnBridgeLandType(e) {
                for (var t of this.tileOccupation[e.rx]?.[e.ry] ?? [])
                  if (t.isOverlay() && t.isBridge()) return t.getLandType();
              }
              getTileZone(e, t = !1) {
                return a.getZoneType(t ? e.landType : (e.onBridgeLandType ?? e.landType));
              }
              getBridgeOnTile(e) {
                for (var t of this.tileOccupation[e.rx]?.[e.ry] ?? []) if (t.isOverlay() && t.isBridge()) return t;
              }
              getObjectsOnTile(e) {
                return [...(this.tileOccupation[e.rx]?.[e.ry] ?? [])];
              }
              getGroundObjectsOnTile(e) {
                let t = [];
                for (var i of this.tileOccupation[e.rx]?.[e.ry] ?? [])
                  (i.isTechno() && !i.isBuilding() && i.zone === a.ZoneType.Air) || t.push(i);
                return t;
              }
              getAirObjectsOnTile(e) {
                let t = [];
                for (var i of this.tileOccupation[e.rx]?.[e.ry] ?? [])
                  i.isUnit() && i.zone === a.ZoneType.Air && t.push(i);
                return t;
              }
              getObjectsOnTileByLayer(e, t) {
                if (t === i.Ground) return this.getGroundObjectsOnTile(e);
                if (t === i.Air) return this.getAirObjectsOnTile(e);
                if (t === i.All) return this.getObjectsOnTile(e);
                throw new Error(`Unhandled layer type "${t}"`);
              }
              getEmptyTiles() {
                return [...this.emptyTiles];
              }
            }),
          ));
      },
    };
  },
);
