// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/PlacementMode ===
// deps: ["gui/screen/game/worldInteraction/placementMode/PlacementGrid","util/geometry","util/event","engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/PlacementMode",
  [
    "gui/screen/game/worldInteraction/placementMode/PlacementGrid",
    "util/geometry",
    "util/event",
    "engine/type/ObjectType",
  ],
  function (e, t) {
    "use strict";
    var l, r, o, s, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        e(
          "PlacementMode",
          (i = class {
            get onBuildingPlaceRequest() {
              return this._onBuildingPlaceRequest;
            }
            static factory(e, t, i, r, s) {
              var a = e.getConstructionWorker(t),
                n = { tiles: [], visible: !1, rangeIndicator: void 0, rangeIndicatorColor: void 0 };
              let o = new this(e, t, a, i, s, new l.PlacementGrid(n, r.camera, e.map.tiles), r);
              return ((o.placementGridModel = n), o);
            }
            constructor(e, t, i, r, s, a, n) {
              ((this.game = e),
                (this.player = t),
                (this.constrWorker = i),
                (this.renderer = r),
                (this.eva = s),
                (this.placementGrid = a),
                (this.worldScene = n),
                (this.defenseMode = !1),
                (this.buildingRanges = new Map()),
                (this._onBuildingPlaceRequest = new o.EventDispatcher()),
                (this.onFrame = (e) => {
                  (this.lastTile !== this.currentTile || !this.lastUpdate || e - this.lastUpdate >= 1e3 / 15) &&
                    ((this.lastTile = this.currentTile),
                    (this.lastUpdate = e),
                    this.currentBuilding && this.updateGridModel(this.currentBuilding.name));
                }));
            }
            init() {
              this.worldScene.add(this.placementGrid);
            }
            dispose() {
              (this.worldScene.remove(this.placementGrid), this.placementGrid.dispose(), this.endConstrMode());
            }
            enter() {
              ((this.currentTile = void 0),
                (this.lastTile = void 0),
                (this.lastUpdate = void 0),
                this.renderer.onFrame.subscribe(this.onFrame));
            }
            setBuilding(e) {
              (this.currentBuilding = e).primary || e.hasRadialIndicator
                ? ((this.defenseMode = !0), this.prepareBuildingRanges(e))
                : (this.defenseMode = !1);
            }
            getBuilding() {
              return this.currentBuilding;
            }
            hover(e, t) {
              var i;
              t || ((i = e?.tile) !== this.currentTile && (this.currentTile = i));
            }
            updateGridModel(e) {
              var t,
                i = this.currentTile;
              i
                ? ((t = this.constrWorker.getPlacementPreview(e, i)),
                  (this.placementGridModel.tiles = t),
                  (this.placementGridModel.visible = !0),
                  this.defenseMode
                    ? (this.showBuildingRangeOverlays(i, e),
                      (this.placementGridModel.rangeIndicator = this.getBuildingRangeCircle(i, e)),
                      (this.placementGridModel.rangeIndicatorColor = this.player.color.asHex()))
                    : (this.placementGridModel.rangeIndicator = void 0))
                : (this.placementGridModel.visible = !1);
            }
            execute(e, t) {
              if (!this.currentBuilding || t) return !1;
              var i = e?.tile;
              if (!i) return !1;
              if (this.player.production.isAvailableForProduction(this.currentBuilding)) {
                if (!this.constrWorker.canPlaceAt(this.currentBuilding.name, i))
                  return (this.eva.play("EVA_CannotDeployHere"), !1);
                (this._onBuildingPlaceRequest.dispatch(this, {
                  rules: this.currentBuilding,
                  tile: this.constrWorker.normalizePlacementTile(this.currentBuilding.name, i),
                }),
                  this.endConstrMode());
              } else this.endConstrMode();
            }
            cancel() {
              this.endConstrMode();
            }
            endConstrMode() {
              ((this.defenseMode = !1),
                (this.placementGridModel.visible = !1),
                this.hideBuildingRangeOverlays(),
                this.buildingRanges.clear(),
                (this.currentBuilding = void 0),
                this.renderer.onFrame.unsubscribe(this.onFrame));
            }
            hideBuildingRangeOverlays() {
              this.buildingRanges.forEach((e, t) => {
                t.showWeaponRange = !1;
              });
            }
            showBuildingRangeOverlays(e, t) {
              let i = this.getBuildingRangeCircle(e, t);
              this.buildingRanges.forEach((e, t) => {
                t.showWeaponRange = r.circleIntersect(i, e);
              });
            }
            getBuildingRangeCircle(e, t) {
              var i = this.game.art.getObject(t, s.ObjectType.Building).foundation;
              return {
                center: { x: e.rx + (i.width % 2 != 0 ? 0.5 : 0), y: e.ry + (i.height % 2 != 0 ? 0.5 : 0) },
                radius: this.currentRangeCircleRadius,
              };
            }
            prepareBuildingRanges(t) {
              let e = [...this.player.buildings].filter((e) => e.name === t.name);
              var i;
              (t.psychicDetectionRadius
                ? (this.currentRangeCircleRadius = t.psychicDetectionRadius)
                : t.gapGenerator
                  ? (this.currentRangeCircleRadius = t.gapRadiusInCells)
                  : (i = t.primary) && (this.currentRangeCircleRadius = this.game.rules.getWeapon(i).range),
                this.buildingRanges.clear(),
                e.forEach((e) => {
                  var t = e.tile,
                    i = this.game.art.getObject(e.name, s.ObjectType.Building).foundation,
                    t = { x: t.rx + i.width / 2, y: t.ry + i.height / 2 },
                    i =
                      e.psychicDetectorTrait?.radiusTiles ?? e.gapGeneratorTrait?.radiusTiles ?? e.primaryWeapon?.range;
                  i && this.buildingRanges.set(e, { center: t, radius: i });
                }));
            }
          }),
        );
      },
    };
  },
);
