// === Reconstructed SystemJS module: engine/renderable/entity/Projectile ===
// deps: ["engine/renderable/WithPosition","engine/renderable/ShpRenderable","game/gameobject/Projectile","game/Coords","engine/renderable/fx/LaserFx","game/WeaponType","engine/renderable/fx/TeslaFx","game/GameSpeed","engine/renderable/fx/LineTrailFx","engine/renderable/fx/SparkFx","engine/renderable/fx/RadBeamFx","engine/renderable/entity/unit/BlobShadow","engine/gfx/lighting/NukeLightingFx","engine/gfx/batch/BatchedMesh","game/rules/ObjectRules","game/math/geometry","engine/type/PaletteType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/Projectile",
  [
    "engine/renderable/WithPosition",
    "engine/renderable/ShpRenderable",
    "game/gameobject/Projectile",
    "game/Coords",
    "engine/renderable/fx/LaserFx",
    "game/WeaponType",
    "engine/renderable/fx/TeslaFx",
    "game/GameSpeed",
    "engine/renderable/fx/LineTrailFx",
    "engine/renderable/fx/SparkFx",
    "engine/renderable/fx/RadBeamFx",
    "engine/renderable/entity/unit/BlobShadow",
    "engine/gfx/lighting/NukeLightingFx",
    "engine/gfx/batch/BatchedMesh",
    "game/rules/ObjectRules",
    "game/math/geometry",
    "engine/type/PaletteType",
  ],
  function (e, t) {
    "use strict";
    var y, o, s, u, d, g, p, m, f, T, v, l, a, c, h, n, b, S;
    t && t.id;
    return {
      setters: [
        function (e) {
          y = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          s = e;
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
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          b = e;
        },
      ],
      execute: function () {
        e(
          "Projectile",
          (S = class S {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p) {
              var m, f;
              ((this.gameObject = e),
                (this.rules = t),
                (this.imageFinder = i),
                (this.voxels = r),
                (this.voxelAnims = s),
                (this.theater = a),
                (this.palette = n),
                (this.specialPalette = o),
                (this.camera = l),
                (this.gameSpeed = c),
                (this.lighting = h),
                (this.lightingDirector = u),
                (this.vxlBuilderFactory = d),
                (this.useSpriteBatching = g),
                (this.useMeshInstancing = p),
                (this.plugins = []),
                (this.objectArt = e.art),
                (this.label = "projectile_" + e.rules.name),
                (this.withPosition = new y.WithPosition()),
                (this.extraLight = new THREE.Vector3()),
                this.updateLighting(),
                this.gameObject.rules.firersPalette &&
                  ((m = (f = this.gameObject.fromObject)?.art.paletteType ?? b.PaletteType.Unit),
                  (f = f?.art.customPaletteName),
                  (this.palette = this.theater.getPalette(m, f)),
                  this.gameObject.art.remapable &&
                    ((this.palette = this.palette.clone()), this.palette.remap(this.gameObject.fromPlayer.color))),
                this.gameObject.rules.firersPalette && this.objectArt.remapable
                  ? (this.paletteRemaps = [...this.rules.colors.values()].map((e) => this.palette.clone().remap(e)))
                  : (this.paletteRemaps = [this.palette]));
            }
            registerPlugin(e) {
              this.plugins.push(e);
            }
            updateLighting() {
              (this.plugins.forEach((e) => e.updateLighting?.()),
                this.objectArt.isVoxel
                  ? this.extraLight.setScalar(
                      this.lighting.computeNoAmbient(
                        this.objectArt.lightingType,
                        this.gameObject.tile,
                        this.gameObject.tileElevation,
                      ),
                    )
                  : this.extraLight
                      .copy(
                        this.lighting.compute(
                          this.objectArt.lightingType,
                          this.gameObject.tile,
                          this.gameObject.tileElevation,
                        ),
                      )
                      .addScalar(-1));
            }
            getIntersectTarget() {}
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
            update(t, i) {
              if ((this.plugins.forEach((e) => e.update(t)), 0 < i && !this.gameObject.isDestroyed)) {
                let e = this.gameObject.velocity.clone(),
                  t = e.multiplyScalar(i);
                var r = t.add(this.gameObject.position.worldPosition);
                this.setPosition(r);
              }
              this.blobShadow?.update(t, i);
              var e = this.gameObject.direction;
              ((!this.vxlRotWrapper && void 0 !== this.lastDirection && this.lastDirection === e) ||
                (this.shpRenderable && 2 < this.shpRenderable.frameCount
                  ? ((this.lastDirection = e), this.updateShapeFrame(e))
                  : this.vxlRotWrapper
                    ? ((r = n.quaternionFromVec3(this.gameObject.velocity.clone().negate())),
                      this.vxlRotWrapper.rotation.setFromQuaternion(r, "YXZ"),
                      this.gameObject.rules.vertical && (this.vxlRotWrapper.rotation.y = THREE.Math.degToRad(180 + e)),
                      this.vxlRotWrapper.updateMatrix())
                    : this.sonicWaveMesh &&
                      ((this.sonicWaveMesh.rotation.y = THREE.Math.degToRad(e)), this.sonicWaveMesh.updateMatrix())),
                this.gameObject.state !== this.lastState &&
                  ((this.lastState = this.gameObject.state),
                  this.gameObject.state === s.ProjectileState.Impact &&
                    ((this.target.visible = !1),
                    this.renderableManager.createTransientAnim(this.gameObject.impactAnim, (e) => {
                      e.setPosition(this.withPosition.getPosition());
                    }),
                    this.gameObject.isNuke && this.lightingDirector.addEffect(new a.NukeLightingFx()))));
            }
            updateShapeFrame(e) {
              let t = 0;
              (this.objectArt.rotates && (t = Math.round((((e - 45 + 360) % 360) / 360) * 32) % 32),
                this.shpRenderable.setFrame(t));
            }
            createObjects(i) {
              if (this.gameObject.fromWeapon.rules.isSonic) {
                (S.sonicWaveGeometry ?? (S.sonicWaveGeometry = this.createSonicWaveGeometry()),
                  S.sonicWaveMaterial ??
                    (S.sonicWaveMaterial = new THREE.MeshBasicMaterial({
                      color: 48340,
                      blending: THREE.CustomBlending,
                      blendEquation: THREE.AddEquation,
                      blendSrc: THREE.DstColorFactor,
                      blendDst: THREE.OneFactor,
                      transparent: !0,
                      opacity: 0.25,
                      alphaTest: 0.01,
                      depthTest: !1,
                      depthWrite: !1,
                    })));
                let e = new (this.useMeshInstancing ? c.BatchedMesh : THREE.Mesh)(
                  S.sonicWaveGeometry,
                  S.sonicWaveMaterial,
                );
                return (
                  (e.rotation.order = "YXZ"),
                  (e.rotation.x = -Math.PI / 2),
                  (e.rotation.y = THREE.Math.degToRad(this.gameObject.direction)),
                  e.updateMatrix(),
                  (e.matrixAutoUpdate = !1),
                  i.add(e),
                  void (this.sonicWaveMesh = e)
                );
              }
              if (!this.gameObject.rules.inviso && this.gameObject.rules.imageName !== h.ObjectRules.IMAGE_NONE) {
                if (this.gameObject.art.isVoxel) {
                  var r = this.objectArt.imageName.toLowerCase(),
                    s = r + ".vxl",
                    a = this.voxels.get(s);
                  if (!a)
                    throw new Error(
                      `VXL missing for projectile ${this.gameObject.rules.name}. Vxl file ${s} not found. `,
                    );
                  var n = this.objectArt.noHva ? void 0 : this.voxelAnims.get(r + ".hva");
                  let e = (this.vxlBuilder = this.vxlBuilderFactory.create(a, n, this.paletteRemaps, this.palette));
                  e.setExtraLight(this.extraLight);
                  s = e.build();
                  let t = (this.vxlRotWrapper = new THREE.Object3D());
                  ((t.rotation.order = "YXZ"), (t.matrixAutoUpdate = !1), t.add(s), i.add(t));
                } else {
                  ((r = this.imageFinder.findByObjectArt(this.objectArt)),
                    (a = this.objectArt.getDrawOffset()),
                    (n = this.gameObject.rules.arcing),
                    (s = this.gameObject.rules.shadow && !n && 1 < r.numImages));
                  let e = o.ShpRenderable.factory(r, this.palette, this.camera, a, s);
                  (e.setBatched(this.useSpriteBatching),
                    this.useSpriteBatching && e.setBatchPalettes(this.paletteRemaps),
                    e.setExtraLight(this.extraLight),
                    e.create3DObject(),
                    (this.shpRenderable = e),
                    i.add(e.get3DObject()),
                    n &&
                      ((this.blobShadow = new l.BlobShadow(this.gameObject, 1.5, this.useMeshInstancing)),
                      this.blobShadow.create3DObject(),
                      i.add(this.blobShadow.get3DObject())));
                }
                this.gameObject.fromWeapon.type === g.WeaponType.DeathWeapon && (i.visible = !1);
              }
            }
            createSonicWaveGeometry() {
              let e = new THREE.PlaneBufferGeometry(u.Coords.LEPTONS_PER_TILE, u.Coords.LEPTONS_PER_TILE / 3, 10, 10),
                t = e.getAttribute("position");
              for (let i = 0; i < t.count; i++)
                t.setY(
                  i,
                  t.getY(i) + Math.cos((t.getX(i) * Math.PI) / u.Coords.LEPTONS_PER_TILE) * u.Coords.ISO_WORLD_SCALE,
                );
              return e;
            }
            onCreate(r) {
              ((this.renderableManager = r), this.plugins.forEach((e) => e.onCreate(r)));
              var s =
                this.gameObject.fromObject?.name === this.rules.general.prism.type &&
                this.gameObject.fromWeapon.type === g.WeaponType.Secondary;
              let a;
              a = this.gameObject.fromObject
                ? this.gameObject.fromWeapon.type === g.WeaponType.Primary ||
                  this.gameObject.fromWeapon.type === g.WeaponType.DeathWeapon ||
                  s
                  ? this.gameObject.fromObject.art.primaryFirePixelOffset
                  : this.gameObject.fromObject.art.secondaryFirePixelOffset
                : [];
              var e,
                t,
                s = this.gameObject.fromWeapon.rules;
              if (this.gameObject.fromWeapon.type !== g.WeaponType.DeathWeapon && !s.limboLaunch) {
                var n = this.gameObject.fromWeapon.rules.anim;
                let e;
                (n.length
                  ? (e =
                      1 === n.length
                        ? n[0]
                        : ((o = this.gameObject.direction), n[Math.round((((45 - o + 360) % 360) / 360) * 8) % 8]))
                  : this.gameObject.fromWeapon.warhead.rules.nukeMaker && (e = this.rules.audioVisual.nukeTakeOff),
                  e &&
                    r.createTransientAnim(e, (e) => {
                      (e.setPosition(this.gameObject.position.worldPosition),
                        a.length && (e.extraOffset = { x: a[0], y: -a[1] / 2 }));
                    }));
              }
              if (s.isLaser) {
                let e = this.gameObject.position.worldPosition.clone(),
                  t = new THREE.Vector3();
                a.length &&
                  ((l = u.Coords.screenDistanceToWorld(a[0], 0)),
                  (t.x = 4 * l.x),
                  (t.z = 4 * l.y),
                  (t.y = 4 * u.Coords.tileHeightToWorld(-a[1] / (u.Coords.ISO_TILE_SIZE / 2))));
                let i = this.gameObject.target.getWorldCoords().clone();
                (this.gameObject.fromObject?.name === this.rules.general.prism.type &&
                  this.gameObject.fromWeapon.type === g.WeaponType.Secondary &&
                  ((t.y += this.gameObject.fromObject.art.primaryFireFlh.vertical), i.add(t)),
                  e.add(t));
                var n = new THREE.Color(s.isHouseColor ? this.gameObject.fromPlayer.color.asHex() : 16711680),
                  o = s.laserDuration / m.GameSpeed.BASE_TICKS_PER_SECOND / this.gameSpeed.value,
                  l = 2 * (1 < this.gameObject.baseDamageMultiplier ? 2 : 1),
                  l = new d.LaserFx(this.camera, e, i, n, o, l);
                r.addEffect(l);
              }
              if (s.isElectricBolt) {
                let e = this.gameObject.position.worldPosition.clone();
                this.gameObject.fromObject?.isBuilding() && (e.y += u.Coords.tileHeightToWorld(1));
                l = this.gameObject.target.getWorldCoords();
                let t = this.specialPalette;
                var i = new THREE.Color(t.getColorAsHex(s.isAlternateColor ? 5 : 10)),
                  c = new THREE.Color(t.getColorAsHex(15)),
                  h = 1 / this.gameSpeed.value,
                  i = new p.TeslaFx(e, l, i, c, h);
                r.addEffect(i);
              }
              (s.isRadBeam &&
                ((c = this.gameObject.position.worldPosition.clone()),
                (h = this.gameObject.target.getWorldCoords().clone()),
                (i = this.gameObject.fromWeapon.warhead.rules.temporal
                  ? new THREE.Color(...this.rules.audioVisual.chronoBeamColor.map((e) => e / 255))
                  : new THREE.Color(...this.rules.radiation.radColor.map((e) => e / 255))),
                (e = 1 / this.gameSpeed.value),
                (e = new v.RadBeamFx(this.camera, c, h, i, e, 1)),
                r.addEffect(e)),
              // OpenYRWeb: Magnetron beam rendering is handled by MagnetronBeamPlugin,
              // which provides a continuous beam for both vehicle dragging and building attacks.
              this.objectArt.useLineTrail &&
                  ((e = new THREE.Color().fromArray(this.objectArt.lineTrailColor.map((e) => e / 255))),
                  (t = this.objectArt.lineTrailColorDecrement),
                  (t = new f.LineTrailFx(() => this.target, e, t, this.gameSpeed, this.camera)),
                  r.addEffect(t),
                  (this.lineTrailFx = t)),
                s.useSparkParticles &&
                  ((t = this.gameObject.position.worldPosition.clone()),
                  (s = 20 / m.GameSpeed.BASE_TICKS_PER_SECOND),
                  (s = new T.SparkFx(t, new THREE.Color(1, 1, 1), s, this.gameSpeed)),
                  r.addEffect(s)));
            }
            onRemove(t) {
              ((this.renderableManager = void 0),
                this.plugins.forEach((e) => e.onRemove(t)),
                this.gameObject.overshootTiles && this.lineTrailFx?.stopTracking(),
                this.lineTrailFx?.requestFinishAndDispose());
            }
            dispose() {
              (this.plugins.forEach((e) => e.dispose()),
                this.shpRenderable?.dispose(),
                this.vxlBuilder?.dispose(),
                this.blobShadow?.dispose());
            }
          }),
        );
      },
    };
  },
);
