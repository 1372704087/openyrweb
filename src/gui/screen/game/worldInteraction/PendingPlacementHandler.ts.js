// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/PendingPlacementHandler ===
// deps: ["game/event/EventType","util/disposable/CompositeDisposable","gui/screen/game/worldInteraction/placementMode/PlacementGrid"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/PendingPlacementHandler",
  [
    "game/event/EventType",
    "util/disposable/CompositeDisposable",
    "gui/screen/game/worldInteraction/placementMode/PlacementGrid",
  ],
  function (e, t) {
    "use strict";
    var i, s, r, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e(
          "PendingPlacementHandler",
          (a = class {
            static factory(e, t, i, r) {
              var s = e.getConstructionWorker(t);
              return new this(e, s, i, r);
            }
            constructor(e, t, i, r) {
              ((this.game = e),
                (this.constructionWorker = t),
                (this.renderer = i),
                (this.worldScene = r),
                (this.placements = []),
                (this.gridModels = new Map()),
                (this.grids = new Map()),
                (this.disposables = new s.CompositeDisposable()),
                (this.onFrame = () => {
                  for (var t of this.placements) {
                    let e = this.gridModels.get(t);
                    var i;
                    e &&
                      ((i = t.rules.name),
                      (e.tiles = this.constructionWorker.getPlacementPreview(i, t.tile, { normalizedTile: !0 })));
                  }
                }));
            }
            pushPlacementInfo(e) {
              (this.placements.push(e), this.addGrid(e));
            }
            init() {
              (this.renderer.onFrame.subscribe(this.onFrame),
                this.disposables.add(() => this.renderer.onFrame.unsubscribe(this.onFrame)),
                this.disposables.add(
                  this.game.events.subscribe(i.EventType.BuildingPlace, (e) => {
                    this.removePendingPlacement(e.target.tile);
                  }),
                  this.game.events.subscribe(i.EventType.BuildingFailedPlace, (e) => {
                    this.removePendingPlacement(e.tile);
                  }),
                ));
            }
            removePendingPlacement(t) {
              var e = this.placements.findIndex((e) => e.tile === t),
                i = this.placements[e];
              -1 !== e && (this.placements.splice(e, 1), this.removeGrid(i));
            }
            addGrid(e) {
              var t = {
                  tiles: this.constructionWorker.getPlacementPreview(e.rules.name, e.tile, { normalizedTile: !0 }),
                  visible: !0,
                  rangeIndicator: void 0,
                  rangeIndicatorColor: void 0,
                  showBusy: !0,
                },
                i = new r.PlacementGrid(t, this.worldScene.camera, this.game.map.tiles);
              (this.worldScene.add(i), this.gridModels.set(e, t), this.grids.set(e, i));
            }
            removeGrid(e) {
              let t = this.grids.get(e);
              t && (this.worldScene.remove(t), t.dispose(), this.gridModels.delete(e));
            }
            dispose() {
              for (var e of this.placements) this.removeGrid(e);
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
