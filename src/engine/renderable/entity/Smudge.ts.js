// === Reconstructed SystemJS module: engine/renderable/entity/Smudge ===
// deps: ["engine/renderable/builder/ShpBuilder","engine/renderable/WithPosition","engine/ImageFinder","engine/gfx/DebugUtils","engine/renderable/MapSpriteTranslation","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/Smudge",
  [
    "engine/renderable/builder/ShpBuilder",
    "engine/renderable/WithPosition",
    "engine/ImageFinder",
    "engine/gfx/DebugUtils",
    "engine/renderable/MapSpriteTranslation",
    "game/Coords",
  ],
  function (e, t) {
    "use strict";
    var l, i, c, r, h, u, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          r = e;
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
          "Smudge",
          (s = class {
            constructor(e, t, i, r, s, a, n) {
              ((this.gameObject = e),
                (this.imageFinder = t),
                (this.palette = i),
                (this.camera = r),
                (this.lighting = s),
                (this.debugFrame = a),
                (this.mapSmudgeLayer = n),
                (this.objectArt = e.art),
                (this.label = "smudge_" + e.name),
                this.init());
            }
            init() {
              ((this.withPosition = new i.WithPosition()),
                (this.extraLight = new THREE.Vector3()),
                this.updateLighting());
            }
            updateLighting() {
              this.extraLight
                .copy(this.lighting.compute(this.objectArt.lightingType, this.gameObject.tile))
                .addScalar(-1);
            }
            get3DObject() {
              return this.target;
            }
            create3DObject() {
              let e = this.get3DObject();
              e ||
                ((e = new THREE.Object3D()),
                (e.name = this.label),
                (this.target = e),
                (e.matrixAutoUpdate = !1),
                (this.withPosition.matrixUpdate = !0),
                this.withPosition.applyTo(this),
                this.createObjects(e));
            }
            update(e) {}
            setPosition(e) {
              this.withPosition.setPosition(e.x, e.y, e.z);
            }
            getPosition() {
              return this.withPosition.getPosition();
            }
            createObjects(a) {
              var e,
                n = { width: 1, height: 1 };
              let o = new THREE.Object3D();
              if (
                ((o.matrixAutoUpdate = !1),
                this.debugFrame.value && ((e = r.DebugUtils.createWireframe(n, 0)), a.add(e)),
                this.mapSmudgeLayer?.shouldBeBatched(this.gameObject))
              )
                this.mapSmudgeLayer.addObject(this.gameObject);
              else {
                let e;
                try {
                  e = this.imageFinder.findByObjectArt(this.objectArt);
                } catch (e) {
                  if (e instanceof c.ImageFinder.MissingImageError) return void console.warn(e.message);
                  throw e;
                }
                let t = new h.MapSpriteTranslation(n.width, n.height),
                  { spriteOffset: i, anchorPointWorld: r } = t.compute();
                n = i.clone().add(this.objectArt.getDrawOffset());
                let s = (this.builder = new l.ShpBuilder(e, this.palette, this.camera, u.Coords.ISO_WORLD_SCALE));
                (s.setOffset(n), (s.flat = this.objectArt.flat), s.setExtraLight(this.extraLight));
                n = s.build();
                (o.add(n), (o.position.x = r.x), (o.position.z = r.y), o.updateMatrix(), a.add(o));
              }
            }
            onRemove() {
              this.mapSmudgeLayer?.hasObject(this.gameObject) && this.mapSmudgeLayer.removeObject(this.gameObject);
            }
            dispose() {
              this.builder?.dispose();
            }
          }),
        );
      },
    };
  },
);
