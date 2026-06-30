// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/MapHoverHandler ===
// deps: ["util/event","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/worldInteraction/MapHoverHandler", ["util/event", "game/Coords"], function (e, t) {
  "use strict";
  var a, n, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        a = e;
      },
      function (e) {
        n = e;
      },
    ],
    execute: function () {
      e(
        "MapHoverHandler",
        (i = class {
          get onHoverChange() {
            return this._onHoverChange.asEvent();
          }
          constructor(e, t, i, r, s) {
            ((this.entityIntersectHelper = e),
              (this.mapTileIntersectHelper = t),
              (this.map = i),
              (this.shroud = r),
              (this.renderer = s),
              (this._onHoverChange = new a.EventDispatcher()),
              (this.isActive = !1),
              (this.needsUpdate = !1),
              (this.onFrame = (e) => {
                this.isActive &&
                  (this.needsUpdate || !this.lastUpdate || e - this.lastUpdate >= 1e3 / 15) &&
                  ((this.needsUpdate = !1), (this.lastUpdate = e), this.doUpdate());
              }));
          }
          getCurrentHover() {
            if (this.currentHoverTile)
              return this.currentHoverEntity?.gameObject.isDestroyed || this.currentHoverEntity?.gameObject.isCrashing
                ? { entity: void 0, gameObject: void 0, tile: this.currentHoverTile }
                : {
                    entity: this.currentHoverEntity,
                    gameObject: this.currentHoverEntity?.gameObject,
                    tile: this.currentHoverTile,
                  };
          }
          setShroud(e) {
            this.shroud = e;
          }
          update(e, t = !1) {
            ((this.lastPointerPos = e),
              t
                ? this.doUpdate()
                : this.isActive ||
                  ((this.isActive = !0), (this.needsUpdate = !0), this.renderer.onFrame.subscribe(this.onFrame)));
          }
          doUpdate() {
            let e = this.currentHoverEntity;
            var t = this.currentHoverTile,
              i = this.entityIntersectHelper.getEntityAtScreenPoint(this.lastPointerPos);
            if (i) {
              this.currentHoverEntity = i.renderable;
              let e,
                t = i.renderable.gameObject;
              var r = t.getFoundation();
              (t.isBuilding() && (1 < r.width || 1 < r.height)
                ? (e = this.mapTileIntersectHelper.getTileAtScreenPoint(this.lastPointerPos))
                : t.isTechno() && !t.art.isVoxel
                  ? (e = t.tile)
                  : ((s = new THREE.Vector2(i.point.x, i.point.z)
                      .multiplyScalar(1 / n.Coords.LEPTONS_PER_TILE)
                      .floor()),
                    (e = this.map.tiles.getByMapCoords(s.x, s.y)),
                    e || console.warn(`No tile exists at rx,ry="${JSON.stringify(s)}". Falling back to obj location.`)),
                (e = e || t.tile));
              var s = this.map.tileOccupation.getBridgeOnTile(e);
              (this.currentHoverEntity.gameObject.isOverlay() &&
                this.currentHoverEntity.gameObject.isBridge() &&
                !s &&
                (this.currentHoverEntity = void 0),
                (this.currentHoverTile = e));
            } else {
              this.currentHoverEntity = void 0;
              s = this.mapTileIntersectHelper.getTileAtScreenPoint(this.lastPointerPos);
              this.currentHoverTile = s;
            }
            (!(
              this.shroud &&
              this.currentHoverTile &&
              this.shroud.isShrouded(this.currentHoverTile, this.currentHoverEntity?.gameObject.tileElevation)
            ) ||
              (this.currentHoverEntity?.gameObject.isOverlay() && this.currentHoverEntity.gameObject.isBridge()) ||
              (this.currentHoverEntity = void 0),
              (this.currentHoverEntity === e && this.currentHoverTile === t) ||
                (e?.selectionModel?.setHover(!1),
                this.currentHoverEntity?.selectionModel?.setHover(!0),
                this.currentHoverTile &&
                  this._onHoverChange.dispatch(this, {
                    entity: this.currentHoverEntity,
                    gameObject: this.currentHoverEntity?.gameObject,
                    tile: this.currentHoverTile,
                  })));
          }
          finish() {
            (this.currentHoverEntity?.selectionModel?.setHover(!1),
              (this.currentHoverEntity = void 0),
              (this.currentHoverTile = void 0),
              this.isActive &&
                (this.renderer.onFrame.unsubscribe(this.onFrame), (this.isActive = !1), (this.needsUpdate = !1)));
          }
          dispose() {
            this.finish();
          }
        }),
      );
    },
  };
});
