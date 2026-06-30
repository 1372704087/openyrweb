// === Reconstructed SystemJS module: engine/renderable/entity/plugin/ShipWakeTrailPlugin ===
// deps: ["game/Coords","engine/renderable/fx/TrailerSmokeFx","game/gameobject/unit/ZoneType","game/type/LandType","game/type/LocomotorType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/plugin/ShipWakeTrailPlugin",
  [
    "game/Coords",
    "engine/renderable/fx/TrailerSmokeFx",
    "game/gameobject/unit/ZoneType",
    "game/type/LandType",
    "game/type/LocomotorType",
  ],
  function (e, t) {
    "use strict";
    var o, l, c, h, u, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        e(
          "ShipWakeTrailPlugin",
          (i = class {
            constructor(e, t, i, r, s, a) {
              ((this.gameObject = e),
                (this.rules = t),
                (this.art = i),
                (this.theater = r),
                (this.imageFinder = s),
                (this.gameSpeed = a),
                (this.trailPos = new THREE.Vector3()));
            }
            onCreate(e) {
              this.renderableManager = e;
            }
            update(e) {
              var t, i, r, s, a, n;
              this.renderableManager &&
                (this.trailPos.copy(this.gameObject.position.worldPosition),
                (this.trailPos.y = o.Coords.tileHeightToWorld(this.gameObject.tile.z)),
                this.gameObject.rules.locomotor === u.LocomotorType.Hover &&
                  ((r = this.rules.general.hover.height), (this.trailPos.x -= r), (this.trailPos.z -= r)),
                (t = (s = this.gameObject.moveTrait.isMoving()) !== this.lastMoving),
                (i = (a = this.gameObject.submergibleTrait?.isSubmerged()) !== this.lastSubmerged),
                (r =
                  (n =
                    this.gameObject.zone === c.ZoneType.Water && this.gameObject.tile.landType === h.LandType.Water) !==
                  this.lastInWater),
                (t || i || r) &&
                  ((this.lastMoving = s),
                  (this.lastSubmerged = a),
                  (this.lastInWater = n),
                  s && !a && n
                    ? this.trailerFx
                      ? this.trailerFx.enable()
                      : (r = this.art.getAnimation(this.rules.audioVisual.wake)) &&
                        ((s = this.imageFinder.findByObjectArt(r)),
                        (a = this.theater.getPalette(r.paletteType)),
                        (n = this.gameObject.art.spawnDelay),
                        (this.trailerFx = new l.TrailerSmokeFx(this.trailPos, n, r, s, a, this.gameSpeed)),
                        this.renderableManager.addEffect(this.trailerFx))
                    : this.trailerFx?.disable()));
            }
            onRemove(e) {
              ((this.renderableManager = void 0), this.trailerFx?.finishAndRemove());
            }
            dispose() {
              this.trailerFx?.finishAndRemove();
            }
          }),
        );
      },
    };
  },
);
