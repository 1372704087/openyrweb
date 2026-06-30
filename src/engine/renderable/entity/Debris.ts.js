// === Reconstructed SystemJS module: engine/renderable/entity/Debris ===
// deps: ["engine/renderable/WithPosition","engine/renderable/ShpRenderable","engine/renderable/MapSpriteTranslation","engine/Animation","engine/AnimProps","engine/animation/SimpleRunner","game/Coords","engine/renderable/ShadowRenderable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/Debris",
  [
    "engine/renderable/WithPosition",
    "engine/renderable/ShpRenderable",
    "engine/renderable/MapSpriteTranslation",
    "engine/Animation",
    "engine/AnimProps",
    "engine/animation/SimpleRunner",
    "game/Coords",
    "engine/renderable/ShadowRenderable",
  ],
  function (e, t) {
    "use strict";
    var i, c, h, u, d, g, s, p, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {
        e(
          "Debris",
          (r = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h) {
              ((this.gameObject = e),
                (this.rules = t),
                (this.imageFinder = i),
                (this.voxels = r),
                (this.palette = a),
                (this.camera = n),
                (this.lighting = o),
                (this.gameSpeed = l),
                (this.vxlBuilderFactory = c),
                (this.useSpriteBatching = h),
                (this.plugins = []),
                (this.objectRules = e.rules),
                (this.objectArt = e.art),
                (this.label = "debris_" + this.objectRules.name),
                this.init());
            }
            init() {
              ((this.baseShpExtraLight = this.lighting
                .compute(this.objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
                .addScalar(-1)),
                (this.baseVxlExtraLight = new THREE.Vector3().addScalar(
                  this.lighting.computeNoAmbient(
                    this.objectArt.lightingType,
                    this.gameObject.tile,
                    this.gameObject.tileElevation,
                  ),
                )),
                (this.vxlExtraLight = new THREE.Vector3().copy(this.baseVxlExtraLight)),
                (this.shpExtraLight = new THREE.Vector3().copy(this.baseShpExtraLight)),
                (this.withPosition = new i.WithPosition()));
            }
            registerPlugin(e) {
              this.plugins.push(e);
            }
            updateLighting() {
              (this.plugins.forEach((e) => e.updateLighting?.()),
                (this.baseShpExtraLight = this.lighting
                  .compute(this.objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
                  .addScalar(-1)),
                (this.baseVxlExtraLight = new THREE.Vector3().addScalar(
                  this.lighting.computeNoAmbient(
                    this.objectArt.lightingType,
                    this.gameObject.tile,
                    this.gameObject.tileElevation,
                  ),
                )),
                this.vxlExtraLight.copy(this.baseVxlExtraLight),
                this.shpExtraLight.copy(this.baseShpExtraLight));
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
                this.createObjects(e),
                this.vxlBuilder?.setExtraLight(this.vxlExtraLight),
                this.shpRenderable?.setExtraLight(this.shpExtraLight));
            }
            setPosition(e) {
              this.withPosition.setPosition(e.x, e.y, e.z);
            }
            getPosition() {
              return this.withPosition.getPosition();
            }
            update(t, i = 0) {
              this.plugins.forEach((e) => e.update(t));
              var e = this.gameObject.tile.z + this.gameObject.tileElevation;
              if (
                ((void 0 === this.lastElevation || this.lastElevation !== e) &&
                  ((this.lastElevation = e),
                  (this.baseVxlExtraLight = new THREE.Vector3().addScalar(
                    this.lighting.computeNoAmbient(
                      this.objectArt.lightingType,
                      this.gameObject.tile,
                      this.gameObject.tileElevation,
                    ),
                  )),
                  (this.baseShpExtraLight = this.lighting
                    .compute(this.objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
                    .addScalar(-1)),
                  this.vxlExtraLight.copy(this.baseVxlExtraLight),
                  this.shpExtraLight.copy(this.baseShpExtraLight),
                  this.shadowWrap &&
                    ((this.shadowWrap.position.y = -s.Coords.tileHeightToWorld(this.gameObject.tileElevation)),
                    this.shadowWrap.updateMatrix())),
                0 < i)
              ) {
                let e = this.gameObject.velocity.clone(),
                  t = e.multiplyScalar(i);
                var r = t.add(this.gameObject.position.worldPosition);
                this.setPosition(r);
              }
              this.vxlBuilder
                ? (({ rotationAxis: e, angularVelocity: r } = this.gameObject),
                  this.vxlRotObj.rotateOnAxis(e, THREE.Math.degToRad(r)),
                  this.vxlRotObj.updateMatrix())
                : (this.shpAnimRunner.tick(t),
                  this.shpRenderable.setFrame(this.shpAnimRunner.animation.getCurrentFrame()),
                  this.shpShadowRenderable.setFrame(this.shpAnimRunner.animation.getCurrentFrame()));
            }
            createObjects(e) {
              let t = (this.vxlRotObj = new THREE.Object3D());
              ((t.matrixAutoUpdate = !1), (t.rotation.order = "YXZ"));
              var i = this.createMainObject();
              (t.add(i), e.add(t));
            }
            computeSpriteAnchorOffset(e) {
              var t = this.objectArt.getDrawOffset();
              return { x: e.x + t.x, y: e.y + t.y };
            }
            createMainObject() {
              let s = new THREE.Object3D();
              if (((s.matrixAutoUpdate = !1), this.rules.voxelAnimRules.has(this.gameObject.name))) {
                var a = this.getVxlFileName(this.objectRules, this.objectArt),
                  n = this.voxels.get(a);
                if (!n) throw new Error(`VXL missing for anim ${this.objectRules.name}. Vxl file ${a} not found. `);
                let e = this.vxlBuilderFactory.create(n, void 0, [this.palette], this.palette);
                this.vxlBuilder = e;
                var o = e.build();
                s.add(o);
              } else {
                let e = new h.MapSpriteTranslation(1, 1);
                var { spriteOffset: l, anchorPointWorld: a } = e.compute(),
                  n = this.computeSpriteAnchorOffset(l),
                  o = this.imageFinder.findByObjectArt(this.objectArt);
                let t = (this.shpRenderable = c.ShpRenderable.factory(o, this.palette, this.camera, n, !1));
                (t.setBatched(this.useSpriteBatching),
                  this.useSpriteBatching && t.setBatchPalettes([this.palette]),
                  t.create3DObject(),
                  s.add(t.get3DObject()));
                l = p.ShadowRenderable.getOrCreateShadowPalette();
                let i = (this.shpShadowRenderable = c.ShpRenderable.factory(o, l, this.camera, n, !1));
                (i.setBatched(this.useSpriteBatching),
                  this.useSpriteBatching && i.setBatchPalettes([l]),
                  i.setOpacity(0.5),
                  i.create3DObject());
                let r = (this.shadowWrap = new THREE.Object3D());
                ((r.matrixAutoUpdate = !1),
                  r.add(i.get3DObject()),
                  s.add(r),
                  (s.position.x = a.x),
                  (s.position.z = a.y),
                  s.updateMatrix(),
                  t.setFlat(this.objectArt.flat));
                ((o = new d.AnimProps(this.objectArt.art, o)), (o = new u.Animation(o, this.gameSpeed)));
                ((this.shpAnimRunner = new g.SimpleRunner()), (this.shpAnimRunner.animation = o));
              }
              return s;
            }
            getVxlFileName(e, t) {
              let i = t.imageName;
              return (
                e.shareSource &&
                  ((i = e.shareSource), e.shareTurretData ? (i += "tur") : e.shareBarrelData && (i += "barl")),
                i.toLowerCase() + ".vxl"
              );
            }
            onCreate(t) {
              this.plugins.forEach((e) => e.onCreate(t));
            }
            onRemove(t) {
              var e;
              (this.plugins.forEach((e) => e.onRemove(t)),
                this.gameObject.isDestroyed &&
                  this.get3DObject() &&
                  (e = this.gameObject.explodeAnim) &&
                  t.createTransientAnim(e, (e) => e.setPosition(this.withPosition.getPosition())));
            }
            dispose() {
              (this.plugins.forEach((e) => e.dispose()),
                this.shpRenderable?.dispose(),
                this.shpShadowRenderable?.dispose(),
                this.vxlBuilder?.dispose());
            }
          }),
        );
      },
    };
  },
);
