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
                      var r = Math.floor(e.getShpFile().numImages / 8),
                        t = (this.gameObject.direction - 45 + 360) % 360,
                        t = (Math.round((t / 360) * 8) % 8) * r;
                      ((i.loopStart = i.start = t), (i.loopEnd = t + r - 1), (i.loopCount = -1));
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
