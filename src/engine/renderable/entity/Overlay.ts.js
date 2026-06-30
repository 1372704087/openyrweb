// === Reconstructed SystemJS module: engine/renderable/entity/Overlay ===
// deps: ["data/ShpFile","game/Coords","engine/renderable/WithPosition","engine/gfx/DebugUtils","engine/renderable/MapSpriteTranslation","engine/renderable/ShpRenderable","util/math","game/map/BridgeOverlayTypes","engine/type/ObjectType","game/gameobject/common/DeathType","engine/renderable/entity/BoxIntersectObject3D","engine/gfx/MathUtils","engine/renderable/entity/map/MapSurface","game/map/wallTypes"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/Overlay",
  [
    "data/ShpFile",
    "game/Coords",
    "engine/renderable/WithPosition",
    "engine/gfx/DebugUtils",
    "engine/renderable/MapSpriteTranslation",
    "engine/renderable/ShpRenderable",
    "util/math",
    "game/map/BridgeOverlayTypes",
    "engine/type/ObjectType",
    "game/gameobject/common/DeathType",
    "engine/renderable/entity/BoxIntersectObject3D",
    "engine/gfx/MathUtils",
    "engine/renderable/entity/map/MapSurface",
    "game/map/wallTypes",
  ],
  function (e, t) {
    "use strict";
    var n, h, i, s, u, a, o, d, l, c, r, g, p, m, f;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        e(
          "Overlay",
          (f = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h) {
              ((this.gameObject = e),
                (this.rules = t),
                (this.art = i),
                (this.imageFinder = r),
                (this.palette = s),
                (this.camera = a),
                (this.lighting = n),
                (this.debugFrame = o),
                (this.bridgeImageCache = l),
                (this.mapOverlayLayer = c),
                (this.useSpriteBatching = h),
                (this.isInvisible = !1),
                (this.objectRules = e.rules),
                (this.objectArt = e.art),
                (this.label = "overlay_" + this.objectRules.name),
                this.init());
            }
            init() {
              ((this.withPosition = new i.WithPosition()),
                (this.extraLight = new THREE.Vector3()),
                this.updateLighting());
            }
            updateLighting() {
              var e = this.objectArt.lightingType;
              this.extraLight
                .copy(this.lighting.compute(e, this.gameObject.tile, this.gameObject.isHighBridge() ? 4 : 0))
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
                (e.userData.id = this.gameObject.id),
                (this.target = e),
                (e.matrixAutoUpdate = !1),
                (this.withPosition.matrixUpdate = !0),
                this.withPosition.applyTo(this),
                this.createObjects(e));
            }
            update(e) {
              var t, i;
              this.isInvisible ||
                ((i =
                  !!this.gameObject.healthTrait &&
                  this.gameObject.healthTrait.health <= 100 * this.rules.audioVisual.conditionYellow),
                (t = 1e5 * this.gameObject.overlayId + 10 * this.gameObject.value + Number(i)) !==
                  this.lastOverlayHash &&
                  ((this.lastOverlayHash = t),
                  (i = this.computeFrame(i)),
                  this.mainRenderable
                    ? i < this.mainRenderable.frameCount && this.mainRenderable.setFrame(i)
                    : this.mapOverlayLayer.setObjectFrame(this.gameObject, i)));
            }
            computeFrame(e) {
              let t = this.gameObject,
                i = t.value;
              var r;
              return (
                t.isBridge()
                  ? 0 === i && (i = o.getRandomInt(0, 3))
                  : t.wallTrait &&
                    e &&
                    ((r =
                      (this.mainRenderable
                        ? this.mainRenderable.frameCount
                        : this.mapOverlayLayer.getObjectFrameCount(this.gameObject)) < m.wallTypes.length
                        ? 1
                        : m.wallTypes.length),
                    (i += r)),
                i
              );
            }
            setPosition(e) {
              this.withPosition.setPosition(e.x, e.y, e.z);
            }
            getPosition() {
              return this.withPosition.getPosition();
            }
            getIntersectTarget() {
              return this.intersectTarget;
            }
            getUiName() {
              return this.gameObject.getUiName();
            }
            createObjects(n) {
              var o = this.gameObject.getFoundation();
              if (
                (this.debugFrame.value && ((c = this.createWireframe(o, 1)), n.add(c)),
                this.objectRules.isRubble || this.gameObject.isBridgePlaceholder())
              )
                this.isInvisible = !0;
              else {
                var l = this.gameObject.isBridge() || this.gameObject.isTiberium() || this.gameObject.rules.wall;
                if (this.mapOverlayLayer?.shouldBeBatched(this.gameObject)) {
                  if ((this.mapOverlayLayer.addObject(this.gameObject), l)) {
                    let e = new r.BoxIntersectObject3D(
                      new THREE.Vector3(1, 0, 1).multiplyScalar(h.Coords.LEPTONS_PER_TILE),
                    );
                    (e.position.add(
                      new THREE.Vector3(o.width / 2, 0, o.height / 2).multiplyScalar(h.Coords.LEPTONS_PER_TILE),
                    ),
                      (e.matrixAutoUpdate = !1),
                      e.updateMatrix(),
                      n.add(e),
                      (this.intersectTarget = e));
                  }
                } else {
                  let t = new THREE.Object3D();
                  t.matrixAutoUpdate = !1;
                  let e = new u.MapSpriteTranslation(o.width, o.height),
                    { spriteOffset: i, anchorPointWorld: r } = e.compute();
                  var c = i.clone().add(this.objectArt.getDrawOffset());
                  let s;
                  if (this.gameObject.isLowBridge()) {
                    o = d.BridgeOverlayTypes.getOverlayBridgeType(this.gameObject.overlayId);
                    let e = this.bridgeImageCache.get(o);
                    (e || ((e = this.buildVirtualBridgeFile(o)), this.bridgeImageCache.set(o, e)), (s = e));
                  } else s = this.imageFinder.findByObjectArt(this.objectArt);
                  let a = (this.mainRenderable = this.createMainObject(s, c));
                  (a.create3DObject(), t.add(a.get3DObject()), l && a && (this.intersectTarget = a.getShapeMesh()));
                  c = h.Coords.getWorldTileSize();
                  ((t.position.x = r.x), (t.position.z = r.y));
                  l = this.gameObject.isXBridge();
                  if (
                    (this.gameObject.isBridge() &&
                      ((t.position.x += c / 2),
                      (t.position.z += c / 2),
                      (t.position.x += l ? 0 : c),
                      (t.position.z += l ? c : 0)),
                    this.gameObject.isHighBridge())
                  ) {
                    ((t.position.x -= +h.Coords.ISO_WORLD_SCALE),
                      (t.position.z -= +h.Coords.ISO_WORLD_SCALE),
                      (t.position.x += c + (l ? 0.5 * c : 0)),
                      (t.position.z += c + (l ? 0.5 * c : 0)));
                    let e = a.getShadowMesh();
                    e &&
                      (g.MathUtils.translateTowardsCamera(
                        e,
                        this.camera,
                        (p.MAGIC_OFFSET + 0.05) * h.Coords.ISO_WORLD_SCALE,
                      ),
                      e.updateMatrix());
                    c = this.createBridgeShadowSurface();
                    n.add(c);
                  }
                  (t.updateMatrix(), n.add(t));
                }
              }
            }
            buildVirtualBridgeFile(e) {
              var t =
                  e === d.OverlayBridgeType.Concrete
                    ? d.BridgeOverlayTypes.minLowBridgeConcreteId
                    : d.BridgeOverlayTypes.minLowBridgeWoodId,
                i =
                  e === d.OverlayBridgeType.Concrete
                    ? d.BridgeOverlayTypes.maxLowBridgeConcreteId
                    : d.BridgeOverlayTypes.maxLowBridgeWoodId;
              let r = new n.ShpFile();
              r.filename = "agg_" + this.gameObject.name + ".shp";
              for (let a = t; a <= i; a++) {
                var s = this.rules.getOverlay(this.rules.getOverlayName(a)),
                  s = this.art.getObject(s.name, l.ObjectType.Overlay);
                let e = this.imageFinder.findByObjectArt(s);
                (r.width || ((r.width = e.width), (r.height = e.height)), r.addImage(e.getImage(1)));
              }
              return r;
            }
            createBridgeShadowSurface() {
              var e = this.gameObject.getFoundation(),
                t = e.width * h.Coords.getWorldTileSize(),
                e = e.height * h.Coords.getWorldTileSize();
              let i = new THREE.PlaneGeometry(t, e);
              i.applyMatrix(
                new THREE.Matrix4()
                  .makeTranslation(t / 2, p.MAGIC_OFFSET, e / 2)
                  .multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2)),
              );
              let r = new THREE.ShadowMaterial();
              ((r.transparent = !0), (r.opacity = 0.5));
              let s = new THREE.Mesh(i, r);
              return ((s.receiveShadow = !0), (s.renderOrder = 5), s);
            }
            createWireframe(e, t) {
              let i = s.DebugUtils.createWireframe(e, t);
              var r = this.gameObject.isBridge();
              return ((i.position.y += r ? h.Coords.tileHeightToWorld(-1) : 0), i);
            }
            createMainObject(e, t) {
              var i = this.objectRules.wall,
                r = this.gameObject.isHighBridge() ? 4 : 0;
              let s = a.ShpRenderable.factory(
                e,
                this.palette,
                this.camera,
                t,
                this.objectArt.hasShadow && !this.gameObject.isLowBridge(),
                r,
                i,
              );
              return (
                s.setBatched(this.useSpriteBatching),
                this.useSpriteBatching && s.setBatchPalettes([this.palette]),
                s.setFlat(this.objectArt.flat),
                s.setExtraLight(this.extraLight),
                s
              );
            }
            onRemove(e) {
              if (
                (this.mapOverlayLayer?.hasObject(this.gameObject) && this.mapOverlayLayer.removeObject(this.gameObject),
                this.gameObject.isDestroyed &&
                  (this.gameObject.deathType === c.DeathType.Demolish || this.gameObject.isHighBridge()))
              ) {
                var r = this.gameObject.getFoundation(),
                  s = this.rules.audioVisual.bridgeExplosions;
                for (let i = 0; i < r.width; i++)
                  for (let t = 0; t < r.height; t++) {
                    var a = s[o.getRandomInt(0, s.length - 1)];
                    e.createTransientAnim(a, (e) => {
                      e.setPosition(h.Coords.tile3dToWorld(i, t, 0).add(this.withPosition.getPosition()));
                    });
                  }
              }
            }
            dispose() {
              this.mainRenderable?.dispose();
            }
          }),
        );
      },
    };
  },
);
