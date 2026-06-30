// === Reconstructed SystemJS module: engine/renderable/entity/Terrain ===
// deps: ["engine/renderable/WithPosition","engine/ImageFinder","engine/gfx/DebugUtils","engine/renderable/MapSpriteTranslation","engine/renderable/ShpRenderable","game/gameobject/trait/TiberiumTreeTrait","engine/animation/SimpleRunner","engine/AnimProps","engine/Animation","data/IniSection","engine/renderable/AlphaRenderable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/Terrain",
  [
    "engine/renderable/WithPosition",
    "engine/ImageFinder",
    "engine/gfx/DebugUtils",
    "engine/renderable/MapSpriteTranslation",
    "engine/renderable/ShpRenderable",
    "game/gameobject/trait/TiberiumTreeTrait",
    "engine/animation/SimpleRunner",
    "engine/AnimProps",
    "engine/Animation",
    "data/IniSection",
    "engine/renderable/AlphaRenderable",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, l, c, a, h, u, d, g, p, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {
        e(
          "Terrain",
          (n = class {
            constructor(e, t, i, r, s, a, n, o, l) {
              ((this.gameObject = e),
                (this.terrainLayer = t),
                (this.imageFinder = i),
                (this.palette = r),
                (this.camera = s),
                (this.lighting = a),
                (this.debugFrame = n),
                (this.gameSpeed = o),
                (this.useSpriteBatching = l),
                (this.objectArt = e.art),
                (this.label = "terrain_" + e.rules.name),
                this.init());
            }
            init() {
              ((this.tiberiumTreeTrait = this.gameObject.traits.find(a.TiberiumTreeTrait)),
                (this.withPosition = new i.WithPosition()),
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
            setPosition(e) {
              this.withPosition.setPosition(e.x, e.y, e.z);
            }
            getPosition() {
              return this.withPosition.getPosition();
            }
            update(e) {
              var t;
              this.tiberiumTreeTrait &&
                ((t = this.tiberiumTreeTrait.status) !== this.lastTiberiumSpawnStatus &&
                  (this.lastTiberiumSpawnStatus = t) === a.SpawnStatus.Spawning &&
                  this.animationRunner?.animation.reset(),
                this.animationRunner &&
                  (this.animationRunner.tick(e),
                  this.animationRunner.animation.getState() !== d.AnimationState.STOPPED
                    ? this.mainObj.setFrame(this.animationRunner.getCurrentFrame())
                    : this.mainObj.setFrame(0)));
            }
            createObjects(a) {
              var n = { width: 1, height: 1 };
              this.debugFrame.value && ((t = s.DebugUtils.createWireframe(n, 2)), a.add(t));
              let o;
              try {
                o = this.imageFinder.findByObjectArt(this.objectArt);
              } catch (e) {
                if (e instanceof r.ImageFinder.MissingImageError) return void console.warn(e.message);
                throw e;
              }
              var e = this.gameObject.rules.alphaImage;
              if (e) {
                var t = this.imageFinder.tryFind(e, !1);
                if (t) {
                  let e = new p.AlphaRenderable(t, this.camera, this.objectArt.getDrawOffset());
                  (e.create3DObject(), a.add(e.get3DObject()));
                } else console.warn(`<${this.gameObject.name}>: Alpha image "${e}" not found`);
              }
              if (this.terrainLayer?.shouldBeBatched(this.gameObject)) this.terrainLayer.addObject(this.gameObject);
              else {
                let e = new THREE.Object3D();
                e.matrixAutoUpdate = !1;
                let t = new l.MapSpriteTranslation(n.width, n.height),
                  { spriteOffset: i, anchorPointWorld: r } = t.compute();
                ((e.position.x = r.x), (e.position.z = r.y), e.updateMatrix());
                n = i.clone().add(this.objectArt.getDrawOffset());
                let s = c.ShpRenderable.factory(o, this.palette, this.camera, n, this.objectArt.hasShadow);
                if (
                  (s.setBatched(this.useSpriteBatching),
                  this.useSpriteBatching && s.setBatchPalettes([this.palette]),
                  s.setFrame(0),
                  s.setExtraLight(this.extraLight),
                  s.create3DObject(),
                  e.add(s.get3DObject()),
                  (this.mainObj = s),
                  this.tiberiumTreeTrait)
                ) {
                  let e = new g.IniSection("dummy");
                  this.gameObject.rules.animationRate &&
                    (e.set("Rate", "" + 60 * this.gameObject.rules.animationRate), e.set("Shadow", "yes"));
                  n = new u.AnimProps(e, o);
                  let t = new d.Animation(n, this.gameSpeed);
                  ((this.animationRunner = new h.SimpleRunner()), (this.animationRunner.animation = t), t.stop());
                }
                a.add(e);
              }
            }
            onRemove() {
              this.terrainLayer?.hasObject(this.gameObject) && this.terrainLayer.removeObject(this.gameObject);
            }
            dispose() {
              this.mainObj?.dispose();
            }
          }),
        );
      },
    };
  },
);
