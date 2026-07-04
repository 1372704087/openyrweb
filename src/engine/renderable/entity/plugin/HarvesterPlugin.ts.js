// === Reconstructed SystemJS module: engine/renderable/entity/plugin/HarvesterPlugin ===
// deps: ["game/gameobject/trait/HarvesterTrait","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/plugin/HarvesterPlugin",
  ["game/gameobject/trait/HarvesterTrait", "game/Coords"],
  function (e, t) {
    "use strict";
    var i, s, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        e(
          "HarvesterPlugin",
          (r = class {
            constructor(e, t) {
              ((this.gameObject = e), (this.harvesterTrait = t));
            }
            onCreate(e) {
              this.renderableManager = e;
            }
            update(e) {
              if (this.gameObject.warpedOutTrait.isActive())
                return (this.disposeHarvAnim(), void (this.lastHarvesterStatus = void 0));
              var t;
              !this.renderableManager ||
                ((t = this.harvesterTrait.status) !== this.lastHarvesterStatus &&
                  ((this.lastHarvesterStatus = t),
                  this.disposeHarvAnim(),
                  t === i.HarvesterStatus.Harvesting &&
                    (this.harvestAnim = this.renderableManager.createTransientAnim("OREGATH", (e) => {
                      var t = this.gameObject.tile;
                      (e.setPosition(s.Coords.tile3dToWorld(t.rx + 0.5, t.ry + 0.5, t.z)), e.create3DObject());
                      let i = e.getAnimProps();
                      if (!i) return;
                      var shpFile = e.getShpFile();
                      if (!shpFile) return;
                      // Read Facings from animation art config; ObjectArt defaults to 8.
                      // If the SHP has fewer frames than the declared facings (e.g. OREGATH
                      // is a non-directional ground spark with Facings=8 default but only a
                      // few SHP frames), treat as non-directional and play all frames.
                      var facings = Math.max(1, e.objectArt?.facings ?? 1),
                        numImages = shpFile.numImages;
                      if (facings <= 1 || numImages < facings) {
                        // Non-directional: loop the entire SHP from frame 0
                        ((i.loopStart = i.start = 0), (i.loopEnd = numImages - 1));
                      } else {
                        // Directional: pick the slice matching the unit's facing
                        var framesPerDir = Math.floor(numImages / facings),
                          dir = (this.gameObject.direction - 45 + 360) % 360,
                          dirIndex = Math.round((dir / 360) * facings) % facings;
                        ((i.loopStart = i.start = dirIndex * framesPerDir), (i.loopEnd = i.start + framesPerDir - 1));
                      }
                      i.loopCount = -1;
                    }))));
            }
            disposeHarvAnim() {
              (this.harvestAnim?.remove(), this.harvestAnim?.dispose(), (this.harvestAnim = void 0));
            }
            onRemove() {
              this.disposeHarvAnim();
            }
            dispose() {
              this.disposeHarvAnim();
            }
          }),
        );
      },
    };
  },
);
