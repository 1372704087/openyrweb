// === Reconstructed SystemJS module: engine/renderable/entity/Anim ===
// deps: ["engine/renderable/WithPosition","engine/AnimProps","engine/Animation","engine/renderable/ShpRenderable","engine/ImageFinder","engine/gfx/DebugUtils","engine/renderable/MapSpriteTranslation","engine/animation/SimpleRunner","engine/gfx/MathUtils","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/Anim",
  [
    "engine/renderable/WithPosition",
    "engine/AnimProps",
    "engine/Animation",
    "engine/renderable/ShpRenderable",
    "engine/ImageFinder",
    "engine/gfx/DebugUtils",
    "engine/renderable/MapSpriteTranslation",
    "engine/animation/SimpleRunner",
    "engine/gfx/MathUtils",
    "game/Coords",
  ],
  function (e, t) {
    "use strict";
    var d, s, a, n, o, l, c, h, u, g, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          d = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
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
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        e(
          "Anim",
          (i = class {
            constructor(e, t, i, r, s, a, n, o, l, c = new THREE.Vector3(0, 0, 0), h, u) {
              ((this.objectArt = t),
                (this.extraOffset = i),
                (this.imageFinder = r),
                (this.theater = s),
                (this.camera = a),
                (this.debugFrame = n),
                (this.gameSpeed = o),
                (this.useSpriteBatching = l),
                (this.extraLight = c),
                (this.worldSound = h),
                (this.renderOrder = 0),
                (this.name = e),
                (this.palette =
                  u ?? this.theater.getPalette(this.objectArt.paletteType, this.objectArt.customPaletteName)),
                (this.withPosition = new d.WithPosition()));
            }
            get3DObject() {
              return this.target;
            }
            create3DObject() {
              let e = this.get3DObject();
              e ||
                ((e = new THREE.Object3D()),
                (e.name = "anim_" + this.name),
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
            update(t) {
              if (this.animationRunner) {
                var i = this.objectArt.startSound ?? this.objectArt.report;
                (i &&
                  !this.soundHandle &&
                  this.animation?.getState() === a.AnimationState.NOT_STARTED &&
                  (this.soundHandle = this.worldSound?.playEffect(i, this.withPosition.getPosition(), void 0, 1, 0.25)),
                  this.animationRunner.tick(t));
                let e = this.mainObj.get3DObject();
                ((e.visible = this.animation.getState() !== a.AnimationState.DELAYED),
                  this.mainObj.setFrame(this.animationRunner.getCurrentFrame()));
                var r = this.objectArt.translucent,
                  i = this.objectArt.translucency;
                if (r || 0 < i) {
                  let e;
                  ((e = r
                    ? ((r = this.animation.props), 1 - this.animationRunner.getCurrentFrame() / (r.end - r.start))
                    : 1 - i),
                    this.mainObj.setOpacity(e));
                }
              }
            }
            createObjects(e) {
              var t = { width: 1, height: 1 };
              this.debugFrame.value && ((a = l.DebugUtils.createWireframe(t, 0)), e.add(a));
              let i = new c.MapSpriteTranslation(t.width, t.height);
              var { spriteOffset: r, anchorPointWorld: s } = i.compute(),
                a = this.computeSpriteAnchorOffset(r);
              let n = new THREE.Object3D();
              if (((n.matrixAutoUpdate = !1), (this.mainObj = this.createMainObject(a)), this.mainObj)) {
                this.mainObj.setExtraLight(this.extraLight);
                t = this.useSpriteBatching && !this.renderOrder;
                (this.mainObj.setBatched(t), t && this.mainObj.setBatchPalettes([this.palette]));
                ((r = this.objectArt.translucent), (a = this.objectArt.translucency));
                if (
                  ((r || 0 < a) && this.mainObj.setForceTransparent(!0),
                  this.mainObj.create3DObject(),
                  this.renderOrder)
                ) {
                  if (t) throw new Error("Render order not supported with batching");
                  ((this.mainObj.getShapeMesh().renderOrder = this.renderOrder),
                    (this.mainObj.getShapeMesh().material.depthTest = !this.renderOrder),
                    (this.mainObj.getShapeMesh().material.transparent = !!this.renderOrder));
                }
                (n.add(this.mainObj.get3DObject()),
                  (n.position.x = s.x),
                  (n.position.z = s.y),
                  this.objectArt.zAdjust &&
                    u.MathUtils.translateTowardsCamera(
                      n,
                      this.camera,
                      -this.objectArt.zAdjust * g.Coords.ISO_WORLD_SCALE,
                    ),
                  n.updateMatrix(),
                  e.add(n));
              }
            }
            setExtraLight(e) {
              ((this.extraLight = e), this.mainObj?.setExtraLight(this.extraLight));
            }
            setRenderOrder(e) {
              if (this.mainObj) throw new Error("Render order must be set before 3DObject is created");
              this.renderOrder = e;
            }
            computeSpriteAnchorOffset(e) {
              var t = this.objectArt.getDrawOffset();
              return { x: e.x + t.x + this.extraOffset.x, y: e.y + t.y + this.extraOffset.y };
            }
            createMainObject(e) {
              let t;
              try {
                t = this.shpFile = this.imageFinder.findByObjectArt(this.objectArt);
              } catch (e) {
                if (e instanceof o.ImageFinder.MissingImageError) return void console.warn(e.message);
                throw e;
              }
              let i = n.ShpRenderable.factory(t, this.palette, this.camera, e);
              i.setFlat(this.objectArt.flat);
              var r = new s.AnimProps(this.objectArt.art, t);
              return (
                (this.animation = new a.Animation(r, this.gameSpeed)),
                (this.animationRunner = new h.SimpleRunner()),
                (this.animationRunner.animation = this.animation),
                i
              );
            }
            getAnimProps() {
              return this.animation?.props;
            }
            getShpFile() {
              return this.shpFile;
            }
            remapColor(e) {
              if (this.mainObj) throw new Error("Palette can only be remapped before creating 3DObject");
              let t = this.palette.clone();
              (t.remap(e), (this.palette = t));
            }
            isAnimFinished() {
              return this.animation?.getState() === a.AnimationState.STOPPED;
            }
            isAnimNotStarted() {
              return this.animation?.getState() === a.AnimationState.NOT_STARTED;
            }
            endAnimationLoop() {
              this.animation?.endLoopAndPlayToEnd();
            }
            reset() {
              this.animation?.reset();
            }
            dispose() {
              (this.mainObj?.dispose(), this.soundHandle?.isLoop && this.soundHandle.stop());
            }
          }),
        );
      },
    };
  },
);
