// === Reconstructed SystemJS module: engine/renderable/entity/Aircraft ===
// deps: ["game/Coords","engine/renderable/WithPosition","engine/gfx/DebugUtils","util/math","game/gameobject/unit/VeteranLevel","engine/renderable/entity/HighlightAnimRunner","engine/Animation","game/gameobject/common/DeathType","game/gameobject/unit/ZoneType","engine/renderable/entity/InvulnerableAnimRunner","engine/renderable/entity/BoxIntersectObject3D","engine/renderable/entity/unit/RotorHelper","engine/renderable/entity/unit/ExtraLightHelper","engine/renderable/DebugRenderable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/Aircraft",
  [
    "game/Coords",
    "engine/renderable/WithPosition",
    "engine/gfx/DebugUtils",
    "util/math",
    "game/gameobject/unit/VeteranLevel",
    "engine/renderable/entity/HighlightAnimRunner",
    "engine/Animation",
    "game/gameobject/common/DeathType",
    "game/gameobject/unit/ZoneType",
    "engine/renderable/entity/InvulnerableAnimRunner",
    "engine/renderable/entity/BoxIntersectObject3D",
    "engine/renderable/entity/unit/RotorHelper",
    "engine/renderable/entity/unit/ExtraLightHelper",
    "engine/renderable/DebugRenderable",
  ],
  function (e, t) {
    "use strict";
    var s, i, a, r, o, g, n, l, c, p, h, u, d, m, f;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          p = e;
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
          m = e;
        },
      ],
      execute: function () {
        e(
          "Aircraft",
          (f = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d) {
              ((this.gameObject = e),
                (this.rules = t),
                (this.voxels = i),
                (this.voxelAnims = r),
                (this.palette = s),
                (this.lighting = n),
                (this.debugFrame = o),
                (this.gameSpeed = l),
                (this.selectionModel = c),
                (this.vxlBuilderFactory = h),
                (this.useSpriteBatching = u),
                (this.pipOverlay = d),
                (this.rotorSpeeds = []),
                (this.vxlBuilders = []),
                (this.highlightAnimRunner = new g.HighlightAnimRunner(this.gameSpeed)),
                (this.invulnAnimRunner = new p.InvulnerableAnimRunner(this.gameSpeed)),
                (this.plugins = []),
                (this.objectRules = e.rules),
                (this.objectArt = e.art),
                (this.label = "aircraft_" + this.objectRules.name),
                this.init());
            }
            init() {
              ((this.paletteRemaps = [...this.rules.colors.values()].map((e) => this.palette.clone().remap(e))),
                this.palette.remap(this.gameObject.owner.color),
                (this.lastOwnerColor = this.gameObject.owner.color),
                (this.withPosition = new i.WithPosition()),
                this.updateBaseLight(),
                (this.extraLight = new THREE.Vector3().copy(this.baseExtraLight)));
            }
            updateBaseLight() {
              this.baseExtraLight = new THREE.Vector3().setScalar(
                this.lighting.computeNoAmbient(this.objectArt.lightingType, this.gameObject.tile) +
                  this.rules.audioVisual.extraAircraftLight,
              );
            }
            updateLighting() {
              (this.plugins.forEach((e) => e.updateLighting?.()),
                this.updateBaseLight(),
                this.extraLight.copy(this.baseExtraLight));
            }
            get3DObject() {
              return this.target;
            }
            getIntersectTarget() {
              return this.target;
            }
            getUiName() {
              var e = this.plugins.reduce((e, t) => t.getUiNameOverride?.() ?? e, void 0);
              return void 0 !== e ? e : this.gameObject.getUiName();
            }
            create3DObject() {
              let e = this.get3DObject();
              e ||
                ((e = new h.BoxIntersectObject3D(
                  new THREE.Vector3(1, 1 / 3, 1).multiplyScalar(
                    s.Coords.LEPTONS_PER_TILE * (this.gameObject.rules.spawned ? 0.5 : 1),
                  ),
                )),
                (e.name = this.label),
                (e.userData.id = this.gameObject.id),
                (this.target = e),
                (e.matrixAutoUpdate = !1),
                (this.withPosition.matrixUpdate = !0),
                this.withPosition.applyTo(this),
                this.createObjects(e),
                this.vxlBuilders.forEach((e) => e.setExtraLight(this.extraLight)),
                this.pipOverlay && (this.pipOverlay.create3DObject(), this.posObj?.add(this.pipOverlay.get3DObject())));
            }
            setPosition(e) {
              this.withPosition.setPosition(e.x, e.y, e.z);
            }
            getPosition() {
              return this.withPosition.getPosition();
            }
            registerPlugin(e) {
              this.plugins.push(e);
            }
            highlight() {
              this.plugins.some((e) => e.shouldDisableHighlight?.()) ||
                (this.highlightAnimRunner.animation.getState() !== n.AnimationState.RUNNING &&
                  this.highlightAnimRunner.animate(2));
            }
            update(t) {
              (this.plugins.forEach((e) => e.update(t)),
                this.pipOverlay?.update(t),
                this.gameObject.veteranLevel !== this.lastVeteranLevel &&
                  (this.gameObject.veteranLevel === o.VeteranLevel.Elite &&
                    void 0 !== this.lastVeteranLevel &&
                    this.highlightAnimRunner.animate(30),
                  (this.lastVeteranLevel = this.gameObject.veteranLevel)));
              var e = this.highlightAnimRunner.shouldUpdate(),
                i = this.gameObject.invulnerableTrait.isActive(),
                r = i !== this.lastInvulnerable;
              ((this.lastInvulnerable = i) && r && this.invulnAnimRunner.animate(),
                this.invulnAnimRunner.shouldUpdate() && this.invulnAnimRunner.tick(t),
                (e || r) &&
                  (e && this.highlightAnimRunner.tick(t),
                  (s = i ? this.invulnAnimRunner.getValue() : 0),
                  (n = (e ? this.highlightAnimRunner.getValue() : 0) || s),
                  (a = this.lighting.getAmbientIntensity()),
                  d.ExtraLightHelper.multiplyVxl(this.extraLight, this.baseExtraLight, a, n)));
              var e = this.gameObject.warpedOutTrait.isActive(),
                s = e !== this.lastWarpedOut;
              this.lastWarpedOut = e;
              var a = this.gameObject.cloakableTrait?.isCloaked(),
                n = a !== this.lastCloaked;
              if (((this.lastCloaked = a), s || n)) {
                let t = e || a ? 0.5 : 1;
                (this.vxlBuilders.forEach((e) => e.setOpacity(t)), this.placeholder?.setOpacity(t));
              }
              a = this.gameObject.owner.color;
              this.lastOwnerColor !== a &&
                (this.palette.remap(a),
                (this.lastOwnerColor = a),
                this.vxlBuilders.forEach((e) => e.setPalette(this.palette)),
                this.placeholder?.setPalette(this.palette));
              a = this.gameObject.zone;
              (a !== this.lastZone &&
                (this.gameObject.rules.missileSpawn &&
                  a === c.ZoneType.Air &&
                  this.lastZone !== c.ZoneType.Air &&
                  this.renderableManager.createTransientAnim("V3TAKOFF", (e) =>
                    e.setPosition(this.withPosition.getPosition()),
                  ),
                (this.lastZone = a)),
                this.updateVxlRotation());
            }
            updateVxlRotation() {
              var { pitch: e, yaw: t, roll: i } = this.gameObject;
              ((this.tiltObj.rotation.z = THREE.Math.degToRad(i)),
                (this.tiltObj.rotation.x = THREE.Math.degToRad(e)),
                (this.tiltObj.rotation.y = THREE.Math.degToRad(t)),
                this.rotors &&
                  this.rotors.forEach((e, t) => {
                    ((this.rotorSpeeds[t] = u.RotorHelper.computeRotationStep(
                      this.gameObject,
                      this.rotorSpeeds[t] ?? 0,
                      this.objectArt.rotors[t],
                    )),
                      this.rotorSpeeds[t] &&
                        (e.rotateOnAxis(this.objectArt.rotors[t].axis, this.rotorSpeeds[t]), e.updateMatrix()));
                  }));
            }
            createObjects(t) {
              if (this.debugFrame.value) {
                let e = a.DebugUtils.createWireframe({ width: 1, height: 1 }, 1);
                (e.translateX(-s.Coords.getWorldTileSize() / 2),
                  e.translateZ(-s.Coords.getWorldTileSize() / 2),
                  t.add(e));
              }
              let e = (this.tiltObj = new THREE.Object3D());
              e.rotation.order = "YXZ";
              var i = this.createMainObject();
              e.add(i);
              let r = (this.posObj = new THREE.Object3D());
              ((r.matrixAutoUpdate = !1), r.add(e), t.add(r));
            }
            createMainObject() {
              var e = this.objectArt.imageName.toLowerCase(),
                t = e + ".vxl",
                i = this.voxels.get(t);
              if (!i)
                return (
                  console.warn(`VXL missing for aircraft ${this.objectRules.name}. Vxl file ${t} not found. `),
                  (this.placeholder = new m.DebugRenderable(
                    { width: 0.5, height: 0.5 },
                    this.objectArt.height,
                    this.palette,
                    { centerFoundation: !0 },
                  )),
                  this.placeholder.setBatched(this.useSpriteBatching),
                  this.useSpriteBatching && this.placeholder.setBatchPalettes(this.paletteRemaps),
                  this.placeholder.create3DObject(),
                  this.placeholder.get3DObject()
                );
              ((t = this.objectArt.noHva ? void 0 : this.voxelAnims.get(e + ".hva")),
                (e = [...this.rules.colors.values()].map((e) => this.palette.clone().remap(e))));
              let r = this.vxlBuilderFactory.create(i, t, e, this.palette);
              this.vxlBuilders.push(r);
              e = r.build();
              return (
                this.objectArt.rotors &&
                  (this.rotors = this.objectArt.rotors.map((e) => {
                    var t = r.getSection(e.name);
                    if (!t) throw new Error(`Aircraft "${this.objectRules.name}" VXL section "${e.name}" not found`);
                    return t;
                  })),
                e
              );
            }
            onCreate(t) {
              ((this.renderableManager = t), this.plugins.forEach((e) => e.onCreate(t)));
            }
            onRemove(t) {
              var e;
              ((this.renderableManager = void 0),
                this.plugins.forEach((e) => e.onRemove(t)),
                this.gameObject.isDestroyed &&
                  this.objectRules.explosion.length &&
                  this.gameObject.deathType !== l.DeathType.Temporal &&
                  this.gameObject.deathType !== l.DeathType.None &&
                  ((e = (e = this.objectRules.explosion)[r.getRandomInt(0, e.length - 1)]),
                  t.createTransientAnim(e, (e) => {
                    let t = this.withPosition.getPosition();
                    (this.gameObject.rules.missileSpawn &&
                      (t = t
                        .clone()
                        .add(
                          this.gameObject.moveTrait.velocity
                            .clone()
                            .setLength(this.rules.general.getMissileRules(this.gameObject.name).bodyLength),
                        )),
                      e.setPosition(t));
                  })));
            }
            dispose() {
              (this.plugins.forEach((e) => e.dispose()),
                this.pipOverlay?.dispose(),
                this.vxlBuilders.forEach((e) => e.dispose()),
                this.placeholder?.dispose());
            }
          }),
        );
      },
    };
  },
);
