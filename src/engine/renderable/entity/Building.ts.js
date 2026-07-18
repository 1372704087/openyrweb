// === Reconstructed SystemJS module: engine/renderable/entity/Building ===
// deps: ["engine/renderable/builder/ShpBuilder","engine/renderable/entity/building/DamageType","engine/renderable/entity/building/AnimationType","engine/gfx/OverlayUtils","game/gameobject/Building","engine/Animation","game/map/wallTypes","game/Coords","util/math","engine/AnimProps","engine/renderable/WithPosition","engine/renderable/ShpRenderable","engine/ImageFinder","engine/gfx/DebugUtils","engine/renderable/MapSpriteTranslation","engine/renderable/entity/building/BuildingAnimArtProps","util/typeGuard","engine/renderable/entity/HighlightAnimRunner","game/rules/TechnoRules","game/gameobject/trait/AttackTrait","game/SideType","game/gameobject/trait/FactoryTrait","game/gameobject/trait/UnitRepairTrait","game/gameobject/common/DeathType","engine/renderable/entity/InvulnerableAnimRunner","engine/renderable/entity/building/BuildingShpHelper","engine/renderable/entity/unit/ExtraLightHelper","engine/renderable/AlphaRenderable","engine/renderable/DebugRenderable","engine/gfx/MathUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/Building",
  [
    "engine/renderable/builder/ShpBuilder",
    "engine/renderable/entity/building/DamageType",
    "engine/renderable/entity/building/AnimationType",
    "engine/gfx/OverlayUtils",
    "game/gameobject/Building",
    "engine/Animation",
    "game/map/wallTypes",
    "game/Coords",
    "util/math",
    "engine/AnimProps",
    "engine/renderable/WithPosition",
    "engine/renderable/ShpRenderable",
    "engine/ImageFinder",
    "engine/gfx/DebugUtils",
    "engine/renderable/MapSpriteTranslation",
    "engine/renderable/entity/building/BuildingAnimArtProps",
    "util/typeGuard",
    "engine/renderable/entity/HighlightAnimRunner",
    "game/rules/TechnoRules",
    "game/gameobject/trait/AttackTrait",
    "game/SideType",
    "game/gameobject/trait/FactoryTrait",
    "game/gameobject/trait/UnitRepairTrait",
    "game/gameobject/common/DeathType",
    "engine/renderable/entity/InvulnerableAnimRunner",
    "engine/renderable/entity/building/BuildingShpHelper",
    "engine/renderable/entity/unit/ExtraLightHelper",
    "engine/renderable/AlphaRenderable",
    "engine/renderable/DebugRenderable",
    "engine/gfx/MathUtils",
  ],
  function (e, t) {
    "use strict";
    var d, p, M, s, m, f, r, g, u, y, R, T, P, v, b, I, i, k, S, w, a, E, C, n, B, N, x, o, O, A, j, l, L;
    t && t.id;
    return {
      setters: [
        function (e) {
          d = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          P = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          A = e;
        },
      ],
      execute: function () {
        ((j = new Map()
          .set(M.AnimationType.PRODUCTION, M.AnimationType.IDLE)
          .set(M.AnimationType.BUILDUP, M.AnimationType.IDLE)
          .set(M.AnimationType.SPECIAL_DOCKING, M.AnimationType.IDLE)
          .set(M.AnimationType.SPECIAL_REPAIR_START, M.AnimationType.SPECIAL_REPAIR_LOOP)
          .set(M.AnimationType.SPECIAL_REPAIR_LOOP, M.AnimationType.SPECIAL_REPAIR_END)
          .set(M.AnimationType.SPECIAL_REPAIR_END, M.AnimationType.IDLE)
          .set(M.AnimationType.SUPER_CHARGE_START, M.AnimationType.SUPER_CHARGE_LOOP)
          .set(M.AnimationType.SUPER_CHARGE_LOOP, M.AnimationType.SUPER_CHARGE_END)
          .set(M.AnimationType.SUPER_CHARGE_END, M.AnimationType.IDLE)
          .set(M.AnimationType.FACTORY_DEPLOYING, M.AnimationType.IDLE)
          .set(M.AnimationType.FACTORY_ROOF_DEPLOYING, M.AnimationType.IDLE)),
          (l = new Map()
            .set(M.AnimationType.SUPER_CHARGE_START, [M.AnimationType.SUPER, 1])
            .set(M.AnimationType.SUPER_CHARGE_LOOP, [M.AnimationType.SUPER, 2])
            .set(M.AnimationType.SUPER_CHARGE_END, [M.AnimationType.SUPER, 3])
            .set(M.AnimationType.SPECIAL_REPAIR_START, [M.AnimationType.SPECIAL, 0])
            .set(M.AnimationType.SPECIAL_REPAIR_LOOP, [M.AnimationType.SPECIAL, 1])
            .set(M.AnimationType.SPECIAL_REPAIR_END, [M.AnimationType.SPECIAL, 2])
            .set(M.AnimationType.SPECIAL_DOCKING, [M.AnimationType.SPECIAL, 0])
            .set(M.AnimationType.SPECIAL_SHOOT, [M.AnimationType.SPECIAL, 0])
            .set(M.AnimationType.FACTORY_DEPLOYING, [M.AnimationType.FACTORY_DEPLOYING, 0])
            .set(M.AnimationType.FACTORY_UNDER_DOOR, [M.AnimationType.FACTORY_DEPLOYING, 1])
            .set(M.AnimationType.FACTORY_ROOF_DEPLOYING, [M.AnimationType.FACTORY_ROOF_DEPLOYING, 0])
            .set(M.AnimationType.FACTORY_UNDER_ROOF_DOOR, [M.AnimationType.FACTORY_ROOF_DEPLOYING, 1])),
          e(
            "Building",
            (L = class L {
              constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f, y, T, v, b, S = M.AnimationType.IDLE) {
                ((this.gameObject = e),
                  (this.selectionModel = t),
                  (this.rules = i),
                  (this.art = r),
                  (this.imageFinder = s),
                  (this.voxels = n),
                  (this.voxelAnims = o),
                  (this.palette = l),
                  (this.animPalette = c),
                  (this.isoPalette = h),
                  (this.camera = u),
                  (this.lighting = d),
                  (this.debugFrame = g),
                  (this.gameSpeed = p),
                  (this.vxlBuilderFactory = m),
                  (this.useSpriteBatching = f),
                  (this.buildingImageDataCache = T),
                  (this.pipOverlay = v),
                  (this.worldSound = b),
                  (this.initialAnimType = S),
                  (this.animObjects = new Map()),
                  (this.animations = new Map()),
                  (this.animSounds = new Map()),
                  (this.powered = !0),
                  (this.repairStopRequested = !1),
                  (this.repairStartRequested = !1),
                  (this.highlightAnimRunner = new k.HighlightAnimRunner(this.gameSpeed)),
                  (this.invulnAnimRunner = new B.InvulnerableAnimRunner(this.gameSpeed)),
                  (this.drainAnim = void 0),
                  (this.drainLastDiscPos = void 0),
                  (this.plugins = []),
                  (this.objectArt = e.art),
                  (this.objectRules = e.rules),
                  (this.type = this.objectRules.name),
                  (this.paletteRemaps = [...this.rules.colors.values()].map((e) => this.palette.clone().remap(e))),
                  this.palette.remap(this.gameObject.owner.color),
                  (this.lastOwnerColor = this.gameObject.owner.color),
                  this.updateBaseLight(),
                  (this.vxlExtraLight = new THREE.Vector3().copy(this.baseVxlExtraLight)),
                  (this.shpExtraLight = new THREE.Vector3().copy(this.baseShpExtraLight)));
                var w = (this.animArtProps = new I.BuildingAnimArtProps());
                this.animArtProps.read(this.objectArt.art, this.art);
                let E;
                try {
                  E = this.imageFinder.findByObjectArt(this.objectArt);
                } catch (e) {
                  if (!(e instanceof P.ImageFinder.MissingImageError)) throw e;
                  console.warn(e.message);
                }
                this.mainShpFile = E;
                let C;
                try {
                  C = this.objectArt.bibShape
                    ? this.imageFinder.find(this.objectArt.bibShape, this.objectArt.useTheaterExtension)
                    : void 0;
                } catch (e) {
                  if (!(e instanceof P.ImageFinder.MissingImageError)) throw e;
                  console.warn(e.message);
                }
                this.bibShpFile = C;
                let x = new N.BuildingShpHelper(this.imageFinder);
                w = this.animShpFiles = x.collectAnimShpFiles(w, this.objectArt);
                let O = (this.shpFrameInfos = x.getShpFrameInfos(this.objectArt, E, C, w, this.animArtProps)),
                  A = this.buildingImageDataCache.get(this.gameObject.name);
                (A ||
                  ((A = y.aggregate(O.values(), `agg_${this.objectRules.name}.shp`)),
                  this.buildingImageDataCache.set(this.gameObject.name, A)),
                  (this.aggregatedImageData = A),
                  (this.withPosition = new R.WithPosition()));
              }
              updateBaseLight() {
                ((this.baseShpExtraLight = this.lighting
                  .compute(this.objectArt.lightingType, this.gameObject.tile)
                  .addScalar(-1)),
                  (this.baseVxlExtraLight = new THREE.Vector3().setScalar(
                    this.lighting.computeNoAmbient(this.objectArt.lightingType, this.gameObject.tile),
                  )));
              }
              updateLighting() {
                (this.updateBaseLight(),
                  this.vxlExtraLight.copy(this.baseVxlExtraLight),
                  this.shpExtraLight.copy(this.baseShpExtraLight),
                  this.plugins.forEach((e) => e.updateLighting?.()));
              }
              get3DObject() {
                return this.target;
              }
              getIntersectTarget() {
                return this.intersectTarget;
              }
              updateIntersectTarget() {
                this.intersectTarget = [
                  this.placeholderObj?.get3DObject(),
                  this.mainObj?.getShapeMesh(),
                  this.bib?.getShapeMesh(),
                  ...[...this.animObjects.values()].flat().map((e) => e.getShapeMesh()),
                ].filter(i.isNotNullOrUndefined);
              }
              getUiName() {
                var e = this.plugins.reduce((e, t) => t.getUiNameOverride?.() ?? e, void 0);
                return void 0 !== e ? e : this.gameObject.getUiName();
              }
              create3DObject() {
                let t = this.get3DObject();
                if (!t) {
                  ((t = new THREE.Object3D()),
                    (t.name = "building_" + this.type),
                    (t.userData.id = this.gameObject.id),
                    (this.target = t),
                    (t.matrixAutoUpdate = !1),
                    (this.withPosition.matrixUpdate = !0),
                    this.withPosition.applyTo(this));
                  var e = this.gameObject.rules.alphaImage;
                  if (e) {
                    var i = this.imageFinder.tryFind(e, !1);
                    if (i) {
                      let e = new o.AlphaRenderable(
                        i,
                        this.camera,
                        new THREE.Vector2(0, (g.Coords.ISO_TILE_SIZE + 1) / 2),
                      );
                      (e.create3DObject(), t.add(e.get3DObject()));
                    } else console.warn(`<${this.objectRules.name}>: Alpha image "${e}" not found`);
                  }
                  (this.objectRules.lightIntensity && (this.createLamp(t), this.objectRules.isLightpost)) ||
                    (this.createObjects(t),
                    this.updateIntersectTarget(),
                    this.pipOverlay && (this.pipOverlay.create3DObject(), t.add(this.pipOverlay.get3DObject())),
                    this.updateImage(this.computeDamageType(this.gameObject.healthTrait.health)),
                    this.mainObj?.setExtraLight(this.shpExtraLight),
                    [...this.animObjects.values()].forEach((e) => {
                      e.forEach((e) => {
                        let t = this.animations.get(e);
                        t.props.getArt().has("UseNormalLight") || e.setExtraLight(this.shpExtraLight);
                      });
                    }),
                    this.bib?.setExtraLight(this.shpExtraLight),
                    this.turretBuilders?.forEach((e) => {
                      e instanceof d.ShpBuilder
                        ? e.setExtraLight(this.shpExtraLight)
                        : e.setExtraLight(this.vxlExtraLight);
                    }));
                }
              }
              createLamp(e) {
                var t = this.objectRules;
                let i = t.lightRedTint,
                  r = t.lightGreenTint,
                  s = t.lightBlueTint;
                var a = Math.abs(Math.min(i, r, s, 0));
                0 < a && ((i += a), (r += a), (s += a));
                let n = (1 + i) * (1 + Math.abs(t.lightIntensity)) - 1,
                  o = (1 + r) * (1 + Math.abs(t.lightIntensity)) - 1,
                  l = (1 + s) * (1 + Math.abs(t.lightIntensity)) - 1;
                a = Math.max(n, o, l);
                1 < a && ((n /= a), (o /= a), (l /= a));
                let c = new THREE.Color(n, o, l).multiplyScalar(0.9);
                a = c.getHexString();
                let h = L.lampTextures.get(a);
                h || ((h = this.createLampTexture(a)), L.lampTextures.set(a, h));
                ((a = new THREE.MeshBasicMaterial({
                  map: h,
                  depthTest: !1,
                  depthWrite: !1,
                  transparent: !0,
                  blending: THREE.CustomBlending,
                  blendEquation: 0 < t.lightIntensity ? THREE.AddEquation : THREE.ReverseSubtractEquation,
                  blendSrc: THREE.DstColorFactor,
                  blendDst: THREE.OneFactor,
                })),
                  (t = t.lightVisibility),
                  (t = new THREE.PlaneBufferGeometry(2 * t, 2 * t)));
                let u = new THREE.Mesh(t, a);
                ((u.rotation.x = -Math.PI / 2),
                  (u.renderOrder = 999995),
                  (u.matrixAutoUpdate = !1),
                  u.updateMatrix(),
                  e.add(u));
              }
              createLampTexture(e) {
                let t = document.createElement("canvas");
                t.width = t.height = 32;
                let i = t.getContext("2d");
                ((i.fillStyle = "black"), i.fillRect(0, 0, 32, 32));
                let r = i.createRadialGradient(16, 16, 0, 16, 16, 16);
                (r.addColorStop(0, "#" + e),
                  r.addColorStop(1, "black"),
                  i.arc(16, 16, 16, 0, 2 * Math.PI),
                  (i.fillStyle = r),
                  i.fill());
                let s = new THREE.Texture(t);
                return ((s.needsUpdate = !0), s);
              }
              setPosition(e) {
                var t = this.gameObject.getFoundationCenterOffset();
                this.withPosition.setPosition(e.x - t.x, e.y, e.z - t.y);
              }
              getPosition() {
                return this.withPosition.getPosition();
              }
              registerPlugin(e) {
                this.plugins.push(e);
              }
              highlight() {
                this.plugins.some((e) => e.shouldDisableHighlight?.()) || this.highlightAnimRunner.animate(2);
              }
              update(i) {
                if (!this.objectRules.isLightpost) {
                  (this.gameObject.isDestroyed ||
                    void 0 !== this.currentAnimType ||
                    this.setAnimation(this.initialAnimType, i),
                    this.plugins.forEach((e) => e.update(i)),
                    this.pipOverlay?.update(i));
                  var t = this.gameObject.c4ChargeTrait?.hasCharge();
                  !this.gameObject.isDestroyed &&
                    this.lastHasC4Charge !== t &&
                    t &&
                    ((this.lastHasC4Charge = t), this.highlight());
                  var r = this.highlightAnimRunner.shouldUpdate(),
                    s = this.gameObject.invulnerableTrait.isActive(),
                    t = s !== this.lastInvulnerable;
                  ((this.lastInvulnerable = s) && t && this.invulnAnimRunner.animate(),
                    this.invulnAnimRunner.shouldUpdate() && this.invulnAnimRunner.tick(i),
                    (r || t || s) &&
                      (r && this.highlightAnimRunner.tick(i),
                      (s = s ? this.invulnAnimRunner.getValue() : 0),
                      (n = (r ? this.highlightAnimRunner.getValue() : 0) || s),
                      (s = this.lighting.getAmbientIntensity()),
                      x.ExtraLightHelper.multiplyVxl(this.vxlExtraLight, this.baseVxlExtraLight, s, n),
                      x.ExtraLightHelper.multiplyShp(this.shpExtraLight, this.baseShpExtraLight, n)));
                  var a,
                    n = this.gameObject.warpedOutTrait.isActive();
                  if (n !== this.lastWarpedOut) {
                    let t = (this.lastWarpedOut = n) ? 0.5 : 1;
                    for (a of [this.mainObj, this.bib, ...[...this.animObjects.values()].flat()]) a?.setOpacity(t);
                    (this.turretBuilders?.forEach((e) => e.setOpacity(t)), this.placeholderObj?.setOpacity(t));
                  }
                  (this.gameObject.isDestroyed ||
                    ((o = this.gameObject.owner.color),
                    this.lastOwnerColor !== o &&
                      (this.palette.remap(o),
                      this.mainObj?.setPalette(this.palette),
                      [...this.animObjects.values()].forEach((e) => {
                        e.forEach((e) => e.setPalette(this.palette));
                      }),
                      this.bib?.setPalette(this.palette),
                      this.turretBuilders?.forEach((e) => e.setPalette(this.palette)),
                      this.placeholderObj?.setPalette(this.palette),
                      (this.lastOwnerColor = o))),
                    !this.gameObject.isDestroyed &&
                      j.has(this.currentAnimType) &&
                      ((l = j.get(this.currentAnimType)),
                      this.hasObjectWithStoppedAnimation(this.currentAnimType) && this.setAnimation(l, i)),
                    this.gameObject.isDestroyed ||
                      this.gameObject.buildStatus !== m.BuildStatus.BuildDown ||
                      this.currentAnimType === M.AnimationType.UNBUILD ||
                      this.setAnimation(M.AnimationType.UNBUILD, i));
                  var o = this.gameObject.attackTrait?.attackState;
                  if (
                    (void 0 === this.lastAttackState || (this.lastAttackState !== o && !this.gameObject.isDestroyed)) &&
                    ((this.lastAttackState = o),
                    !this.gameObject.isDestroyed &&
                      this.hasAnimation(M.AnimationType.SPECIAL_SHOOT) &&
                      (o === w.AttackState.FireUp
                        ? this.setAnimation(M.AnimationType.SPECIAL_SHOOT, i)
                        : this.currentAnimType === M.AnimationType.SPECIAL_SHOOT &&
                          this.setAnimation(M.AnimationType.IDLE, i)),
                    o === w.AttackState.JustFired && this.objectArt.muzzleFlash)
                  ) {
                    let e = this.createMuzzleFlashAnim(this.spriteOffset, this.renderableManager);
                    e &&
                      (e.create3DObject(),
                      this.spriteWrap.add(e.get3DObject()),
                      (this.muzzleAnims = this.muzzleAnims || []),
                      this.muzzleAnims.push(e));
                  }
                  var l = this.gameObject.factoryTrait;
                  if (l) {
                    var c = l.status;
                    if (this.lastFactoryStatus !== c && !this.gameObject.isDestroyed) {
                      o = this.lastFactoryStatus;
                      if (((this.lastFactoryStatus = c), void 0 !== o)) {
                        let e,
                          t = !1;
                        ([S.FactoryType.BuildingType, S.FactoryType.NavalUnitType].includes(l.type)
                          ? (e = M.AnimationType.PRODUCTION)
                          : l.type === S.FactoryType.UnitType
                            ? ((e = l.deliveringUnit?.rules.consideredAircraft
                                ? M.AnimationType.FACTORY_ROOF_DEPLOYING
                                : M.AnimationType.FACTORY_DEPLOYING),
                              (t = !0))
                            : (e = void 0),
                          e &&
                            this.hasAnimation(e) &&
                            (c === E.FactoryStatus.Delivering
                              ? this.setAnimation(e, i)
                              : t && this.setAnimation(M.AnimationType.IDLE, i)));
                      }
                    }
                  }
                  c = this.gameObject.unitRepairTrait?.status;
                  this.lastRepairStatus === c ||
                    this.gameObject.isDestroyed ||
                    ((d = this.lastRepairStatus),
                    (this.lastRepairStatus = c),
                    this.hasAnimation(M.AnimationType.SPECIAL_REPAIR_START) &&
                      (c === C.RepairStatus.Repairing
                        ? ((this.currentAnimType !== M.AnimationType.SPECIAL_REPAIR_LOOP &&
                            this.currentAnimType !== M.AnimationType.SPECIAL_REPAIR_END) ||
                          d !== C.RepairStatus.Idle
                            ? this.setAnimation(M.AnimationType.SPECIAL_REPAIR_START, i)
                            : (this.repairStartRequested = !0),
                          (this.repairStopRequested = !1))
                        : (this.currentAnimType === M.AnimationType.SPECIAL_REPAIR_START
                            ? (this.repairStopRequested = !0)
                            : this.endCurrentAnimation(),
                          (this.repairStartRequested = !1))));
                  let e = this.gameObject.superWeaponTrait?.getSuperWeapon(this.gameObject);
                  (!e ||
                    !this.hasAnimation(M.AnimationType.SUPER_CHARGE_START) ||
                    this.gameObject.isDestroyed ||
                    ((g = e.getTimerSeconds() <= 60 * this.objectRules.chargedAnimTime) !==
                      this.lastSuperWeaponAlmostCharged &&
                      ((this.lastSuperWeaponAlmostCharged = g)
                        ? this.setAnimation(M.AnimationType.SUPER_CHARGE_START, i)
                        : this.endCurrentAnimation())),
                    this.repairStopRequested &&
                      this.currentAnimType === M.AnimationType.SPECIAL_REPAIR_LOOP &&
                      (this.endCurrentAnimation(), (this.repairStopRequested = !1)),
                    this.repairStartRequested &&
                      this.currentAnimType === M.AnimationType.IDLE &&
                      (this.setAnimation(M.AnimationType.SPECIAL_REPAIR_START, i), (this.repairStartRequested = !1)),
                    this.muzzleAnims && this.updateMuzzleAnims(i),
                    this.updateDrainAnim(i),
                    n ||
                      (this.animations.forEach((e, t) => {
                        switch (e.getState()) {
                          case f.AnimationState.STOPPED:
                            t.get3DObject().visible = !1;
                            return;
                          case f.AnimationState.DELAYED:
                            (e.update(i),
                            (t.get3DObject().visible =
                              e.getState() !== f.AnimationState.DELAYED
                                ? t.get3DObject().userData.intendedVisible !== !1
                                : !1));
                            break;
                          case f.AnimationState.NOT_STARTED:
                            e.start(i);
                          case f.AnimationState.RUNNING:
                          default:
                            e.update(i);
                        }
                        t.setFrame(e.getCurrentFrame());
                      }),
                      this.animObjects.forEach((e, t) => {
                        let a = this.animArtProps.getByType(t);
                        e.forEach((t, e) => {
                          var i = a[e];
                          let r = this.animations.get(t);
                          var s = i.translucent,
                            i = i.translucency;
                          if (s || 0 < i) {
                            let e;
                            ((e = s ? ((s = r.props), 1 - r.getCurrentFrame() / (s.end - s.start)) : 1 - i),
                              t.setOpacity(e));
                          }
                        });
                      })),
                    this.toggleRangeCircleVisibility(
                      (this.gameObject.showWeaponRange ||
                        (this.selectionModel.isSelected() && -1 !== this.gameObject.rules.techLevel)) &&
                        !n,
                    ));
                  var h,
                    u,
                    c = this.gameObject.wallTrait?.wallType !== this.lastWallType,
                    d =
                      void 0 === this.lastOccupiedState ||
                      this.lastOccupiedState !== !!this.gameObject.garrisonTrait?.isOccupied(),
                    g = void 0 === this.lastHealth || this.lastHealth !== this.gameObject.healthTrait.health;
                  ((c || d || g) &&
                    ((h = this.computeDamageType(this.gameObject.healthTrait.health)),
                    (g = g && h !== this.computeDamageType(this.lastHealth)),
                    (this.lastOccupiedState = !!this.gameObject.garrisonTrait?.isOccupied()),
                    (this.lastHealth = this.gameObject.healthTrait.health),
                    (this.lastWallType = this.gameObject.wallTrait?.wallType),
                    (c || d || g) && this.updateImage(h),
                    d &&
                      this.currentAnimType === M.AnimationType.IDLE &&
                      (this.setActiveAnimationVisible(),
                        this.setAnimationVisibility(
                          M.AnimationType.IDLE,
                          !this.gameObject.bioReactorPowerTrait,
                        )),
                    g &&
                      h === p.DamageType.DESTROYED &&
                      this.objectRules.explosion.length &&
                      this.createExplosionAnims(this.renderableManager)),
                    this.gameObject.turretTrait &&
                      ((h = this.gameObject.turretTrait.facing) !== this.lastTurretFacing &&
                        ((this.lastTurretFacing = h),
                        (this.turretRot.rotation.y = THREE.Math.degToRad(h)),
                        this.turretRot.updateMatrix()),
                      (h = this.gameObject.turretTrait.isRotating() && !n),
                      this.lastTurretRotating !== h &&
                        ((this.lastTurretRotating = h),
                        (u = this.objectRules.turretRotateSound) &&
                          (h && !this.gameObject.isDestroyed
                            ? (this.turretRotateSound = this.worldSound?.playEffect(
                                u,
                                this.gameObject,
                                this.gameObject.owner,
                              ))
                            : this.turretRotateSound?.stop()))),
                    this.gameObject.poweredTrait &&
                      (this.gameObject.isDestroyed
                        ? this.poweredSound && (this.poweredSound.stop(), (this.poweredSound = void 0))
                        : (u = this.gameObject.poweredTrait.isPoweredOn() && !n) !== this.lastPowered &&
                          (this.setPowered(u),
                          (this.lastPowered = u),
                          this.poweredSound?.stop(),
                          (u = u ? this.gameObject.rules.workingSound : this.gameObject.rules.notWorkingSound) &&
                            !n &&
                            (this.poweredSound = this.worldSound?.playEffect(
                              u,
                              this.gameObject,
                              this.gameObject.owner,
                              0.25,
                            )))));
                }
              }
              createExplosionAnims(e) {
                var i = this.objectArt.foundation,
                  r = this.objectRules.explosion;
                for (let a = 0; a < i.width; a++)
                  for (let t = 0; t < i.height; t++) {
                    var s = r[u.getRandomInt(0, r.length - 1)];
                    e.createTransientAnim(s, (e) => {
                      e.setPosition(g.Coords.tile3dToWorld(a, t, 0).add(this.withPosition.getPosition()));
                    });
                  }
              }
              updateMuzzleAnims(t) {
                let i = this.muzzleAnims,
                  r = [];
                (i.forEach((e) => {
                  (e.update(t),
                    e.isAnimFinished() && (this.spriteWrap.remove(e.get3DObject()), e.dispose(), r.push(e)));
                }),
                  r.forEach((e) => i.splice(i.indexOf(e), 1)));
              }
              updateDrainAnim(e) {
                if (this.gameObject.isDestroyed) return this.clearDrainAnim();

                // OpenYRWeb: Y offset below the disc so the animation sits just beneath
                // the flying disc's model rather than at its exact center.
                const DRAIN_ANIM_Y_OFFSET = 0;

                // If the animation is in its finishing state (drain ended, playing to
                // completion), keep updating its position and wait for it to stop.
                if (this.drainAnim && this.drainAnimFinishing) {
                  if (this.drainLastDiscPos) {
                    this.drainAnim.setPosition(this.drainLastDiscPos);
                  }
                  if (this.drainAnim.isAnimFinished()) this.clearDrainAnim();
                  return;
                }

                var t = this.rules.combatDamage.drainAnimationType;
                var disc = this.gameObject.drainedBy;
                if (disc && t && !disc.isDisposed && !disc.isDestroyed && this.renderableManager) {
                  if (!this.drainAnim) {
                    this.drainAnim = this.renderableManager.createAnim(t, (e) => {
                      var t = disc.position.worldPosition.clone();
                      (t.y += DRAIN_ANIM_Y_OFFSET), e.setPosition(t);
                    });
                    // Render behind the disc so the animation doesn't cover it.
                    this.drainAnim.setRenderOrder(-999995);
                    this.drainAnim.create3DObject();
                  }
                  // Keep the animation positioned just below the disc every frame so it
                  // follows the disc as it moves.
                  var pos = disc.position.worldPosition.clone();
                  (pos.y += DRAIN_ANIM_Y_OFFSET), this.drainAnim.setPosition(pos);
                  // Save the last known disc position so the finishing state can use it.
                  this.drainLastDiscPos = pos;
                } else if (this.drainAnim && !this.drainAnimFinishing) {
                  // Drain ended — let the animation play 4 full loops then stop.
                  (this.drainAnimFinishing = !0), this.drainAnim.playRemainingLoops(4);
                }
              }
              clearDrainAnim() {
                (this.drainAnimFinishing = !1),
                  (this.drainLastDiscPos = void 0),
                  this.drainAnim &&
                    (this.renderableManager?.container.remove(this.drainAnim),
                    this.drainAnim.dispose(),
                    (this.drainAnim = void 0));
              }
              getNormalizedAnimType(e) {
                let t = 0,
                  i = e;
                return (l.has(e) && ([i, t] = l.get(e)), [i, t]);
              }
              hasObjectWithStoppedAnimation(t) {
                var [i, r] = this.getNormalizedAnimType(t),
                  i = this.animObjects.get(i);
                if (i) {
                  let e = this.animations.get(i[r]);
                  if (!e) throw new Error(`Missing animation for type '${M.AnimationType[t]}'`);
                  if (e.getState() === f.AnimationState.STOPPED) return !0;
                }
                return !1;
              }
              computeDamageType(e) {
                if (!e) return p.DamageType.DESTROYED;
                let t;
                return (
                  (t =
                    e > 100 * this.rules.audioVisual.conditionYellow
                      ? p.DamageType.NORMAL
                      : e > 100 * this.rules.audioVisual.conditionRed
                        ? p.DamageType.CONDITION_YELLOW
                        : p.DamageType.CONDITION_RED),
                  // OpenYRWeb: civilian buildings (non-military, non-bio reactor) use normal model
                  // at yellow and only show damage at red (only 2 frames: 0=normal, 1=damaged).
                  !this.gameObject.bioReactorPowerTrait &&
                    !this.objectRules.isBaseDefense &&
                    (t === p.DamageType.CONDITION_YELLOW
                      ? (t = p.DamageType.NORMAL)
                      : t === p.DamageType.CONDITION_RED && (t = p.DamageType.CONDITION_YELLOW)),
                  t
                );
              }
              updateImage(o) {
                let l = o === p.DamageType.DESTROYED;
                (l
                  ? (this.objectRules.leaveRubble && this.rubbleObj && (this.rubbleObj.get3DObject().visible = !0),
                    this.mainObj && (this.mainObj.get3DObject().visible = !1))
                  : this.gameObject.wallTrait
                    ? this.updateWallImage(this.gameObject.wallTrait.wallType, o)
                    : this.updateMainObjFrame(!!this.gameObject.garrisonTrait?.isOccupied(), o),
                  this.bib &&
                    (l && (this.bib.get3DObject().visible = !1), this.bib.setFrame(o !== p.DamageType.NORMAL ? 1 : 0)),
                  this.turret && l && (this.turret.visible = !1),
                  this.animObjects.forEach((a, n) => {
                    a.forEach((t, i) => {
                      if (n !== M.AnimationType.BUILDUP && n !== M.AnimationType.UNBUILD) {
                        l && a.forEach((e) => ((e.get3DObject().visible = !1), (e.get3DObject().userData.intendedVisible = !1)));
                        let e = this.animations.get(t);
                        var r = o !== p.DamageType.NORMAL,
                          s = this.animArtProps.getByType(n)[i];
                        if (!r || s.damagedArt) {
                          let a = r ? s.damagedImage : s.image,
                            l = this.animShpFiles.get(a);
                          e.props.setArt(r ? s.damagedArt : s.art),
                            e.rewind(),
                            l && t.builder.setFrameOffset(this.aggregatedImageData.imageIndexes.get(l));
                        } else console.warn(`<${this.gameObject.name}>: Missing damaged anim ${M.AnimationType[n]},` + i);
                      }
                    });
                  }));
                var r;
                if (this.objectRules.isBaseDefense && this.gameObject.garrisonTrait) {
                  // Military garrison buildings: fire only at red health
                  r = o === p.DamageType.CONDITION_RED && !l;
                } else {
                  r = o !== p.DamageType.NORMAL && !l;
                }
                this.fireObjects.forEach((e) => {
                  e.get3DObject().visible = r;
                  let t = this.animations.get(e);
                  t.rewind();
                  var i = t.props.getArt().getString("StartSound");
                  i && this.handleSoundChange(i, e, r, 0.15);
                }),
                  !l && this.gameObject.bioReactorPowerTrait && this.currentAnimType === M.AnimationType.IDLE && this.setActiveAnimationVisible();
              }
              updateMainObjFrame(e, t) {
                // Garrisonable buildings (non-BioReactor) may have 4-frame SHP:
                // 0=empty-normal, 1=empty-damaged, 2=occupied-normal, 3=occupied-damaged.
                // Bio Reactor has no occupied frame — frame 2 is the RED damage frame.
                // Civilian buildings with only 2 frames are protected by the frameCount guard below.
                let i;
                if (e && !this.gameObject.bioReactorPowerTrait) {
                  i = t === p.DamageType.NORMAL ? 2 : 3;
                } else if (!this.gameObject.bioReactorPowerTrait && this.objectRules.isBaseDefense) {
                  // Unoccupied military building: CONDITION_RED maps to same damaged frame as CONDITION_YELLOW
                  i = t === p.DamageType.CONDITION_RED ? p.DamageType.CONDITION_YELLOW : t;
                } else {
                  i = t;
                }
                var r;
                this.mainShpFile &&
                  this.mainObj &&
                  ((r = this.shpFrameInfos.get(this.mainShpFile).frameCount),
                  i >= r &&
                    (console.warn(
                      `Building ${this.objectRules.name} has damage frame ` +
                        i +
                        ` (occupied=${e}, damageType=${p.DamageType[t]}) out of bounds`,
                    ),
                    (i = p.DamageType.NORMAL)),
                  this.mainObj.setFrame(i));
              }
              updateWallImage(e, t) {
                var i;
                this.mainObj &&
                  this.mainShpFile &&
                  ((i =
                    this.shpFrameInfos.get(this.mainShpFile).frameCount < r.wallTypes.length ? 1 : r.wallTypes.length) -
                    1 <
                    e &&
                    ((e = i - 1),
                    console.warn(`Building ${this.objectRules.name} is a wall but has fewer frames than facings.`)),
                  this.mainObj.setFrame(e + t * i));
              }
              createObjects(t) {
                var e = this.objectArt.foundation;
                this.debugFrame.value && ((a = v.DebugUtils.createWireframe(e, this.objectArt.height)), t.add(a));
                let i = new b.MapSpriteTranslation(e.width, e.height);
                var { spriteOffset: r, anchorPointWorld: s } = i.compute(),
                  a = (this.spriteOffset = this.computeSpriteAnchorOffset(r));
                let n = (this.spriteWrap = new THREE.Object3D());
                n.matrixAutoUpdate = !1;
                let o = n,
                  l = { ...a },
                  c = !1;
                r = this.objectArt.zShapePointMove;
                if (r.length) {
                  ((o = new THREE.Object3D()), (o.matrixAutoUpdate = !1), n.add(o), (c = !0));
                  r = { x: -r[0] / g.Coords.ISO_TILE_SIZE, y: -r[1] / g.Coords.ISO_TILE_SIZE };
                  let e = new b.MapSpriteTranslation(r.x, r.y);
                  var { spriteOffset: h, anchorPointWorld: r } = e.compute();
                  ((o.position.x = r.x), (o.position.z = r.y), o.updateMatrix(), (l.x += h.x), (l.y += h.y));
                }
                (this.mainShpFile
                  ? ((this.mainObj = this.createMainObject(this.mainShpFile, l, c)),
                    this.gameObject.slaveMinerTrait && this.mainObj.setBatched(!1),
                    this.mainObj.create3DObject(),
                    o.add(this.mainObj.get3DObject()),
                    this.mainObj.getFlat() &&
                      (A.MathUtils.translateTowardsCamera(
                        this.mainObj.get3DObject(),
                        this.camera,
                        +g.Coords.ISO_WORLD_SCALE,
                      ),
                      this.mainObj.get3DObject().updateMatrix()))
                  : ((this.placeholderObj = new O.DebugRenderable(e, this.objectArt.height, this.palette)),
                    this.placeholderObj.setBatched(this.useSpriteBatching),
                    this.useSpriteBatching && this.placeholderObj.setBatchPalettes(this.paletteRemaps),
                    this.placeholderObj.create3DObject(),
                    t.add(this.placeholderObj.get3DObject())),
                  this.objectRules.leaveRubble &&
                    ((this.rubbleObj = this.createRubbleObject(a)),
                    this.rubbleObj &&
                      (this.rubbleObj.setExtraLight(this.shpExtraLight),
                      this.rubbleObj.create3DObject(),
                      (this.rubbleObj.get3DObject().visible = !1),
                      n.add(this.rubbleObj.get3DObject()))));
                let u = this.createAnimObjects(l, c);
                if (
                  (u.forEach((e) => {
                    o.add(e);
                  }),
                  (this.fireObjects = this.createFireObjects(a)),
                  this.fireObjects.forEach((e) => {
                    n.add(e.get3DObject());
                  }),
                  this.objectRules.turret &&
                    (({ turret: h, turretRot: e } = this.createTurretObject(a, s)),
                    (this.turret = h),
                    (this.turretRot = e),
                    n.add(this.turret)),
                  this.bibShpFile)
                ) {
                  ((this.bib = this.createBibObject(this.bibShpFile, a)), this.bib.create3DObject());
                  let e = this.bib.get3DObject();
                  (A.MathUtils.translateTowardsCamera(e, this.camera, -1),
                    e.updateMatrix(),
                    n.add(this.bib.get3DObject()));
                }
                if (this.gameObject.primaryWeapon || this.gameObject.rules.hasRadialIndicator) {
                  a =
                    this.gameObject.psychicDetectorTrait?.radiusTiles ??
                    this.gameObject.gapGeneratorTrait?.radiusTiles ??
                    this.gameObject.primaryWeapon?.range;
                  if (a) {
                    a = this.rangeCircle = this.createRangeCircle(a);
                    let e = (this.rangeCircleWrapper = new THREE.Object3D());
                    ((e.matrixAutoUpdate = !1),
                      (e.position.x = s.x / 2),
                      (e.position.z = s.y / 2),
                      e.updateMatrix(),
                      (e.visible = !1),
                      e.add(a),
                      t.add(e));
                  }
                }
                ((n.position.x = s.x), (n.position.z = s.y), n.updateMatrix(), t.add(n));
              }
              computeSpriteAnchorOffset(e) {
                var t = this.objectArt.getDrawOffset();
                return { x: e.x + t.x, y: e.y + t.y };
              }
              createMainObject(e, t, i = !1) {
                let r = !1;
                this.objectRules.turret && "CAOUTP" !== this.objectRules.name && (r = !0);
                let s = T.ShpRenderable.factory(
                  this.aggregatedImageData.file,
                  this.palette,
                  this.camera,
                  t,
                  this.objectArt.hasShadow,
                  0,
                  !r,
                  0,
                  i,
                );
                return (
                  s.setSize(e),
                  s.setFrameOffset(this.aggregatedImageData.imageIndexes.get(e)),
                  s.setBatched(this.useSpriteBatching),
                  this.useSpriteBatching && s.setBatchPalettes(this.paletteRemaps),
                  s.setFlat(r),
                  s
                );
              }
              createRubbleObject(t) {
                var i = this.mainShpFile;
                if (i) {
                  let e = T.ShpRenderable.factory(
                    this.aggregatedImageData.file,
                    this.isoPalette,
                    this.camera,
                    t,
                    this.objectArt.hasShadow,
                  );
                  if ((e.setSize(i), !(this.shpFrameInfos.get(i).frameCount < 4)))
                    return (
                      e.setFrameOffset(this.aggregatedImageData.imageIndexes.get(i)),
                      e.setBatched(this.useSpriteBatching),
                      this.useSpriteBatching && e.setBatchPalettes([this.isoPalette]),
                      e.setFlat(!0),
                      e.setFrame(3),
                      e
                    );
                  console.warn(`Building image ${this.objectArt.imageName} has no rubble frame (missing 4th frame)`);
                }
              }
              createAnimObjects(n, o) {
                let l = [];
                return (
                  this.animArtProps.getAll().forEach((e, t) => {
                    let i = [],
                      r = 1;
                    for (var s of e) {
                      var a = this.animShpFiles.get(s.image);
                      if (a) {
                        let e = this.createAnimObject(s, a, n, r++, o);
                        e && (l.push(e.get3DObject()), i.push(e));
                      }
                    }
                    this.animObjects.set(t, i);
                  }),
                  l
                );
              }
              createFireObjects(n) {
                let o = [],
                  l = 0;
                for (;;) {
                  let e = this.objectArt.art.getString("DamageFireOffset" + l++);
                  if (!e) break;
                  var c = this.rules.audioVisual.fireNames,
                    h = c[u.getRandomInt(0, c.length - 1)];
                  let t;
                  try {
                    t = this.imageFinder.find(h, this.objectArt.useTheaterExtension);
                  } catch (e) {
                    if (e instanceof P.ImageFinder.MissingImageError) {
                      console.warn(e.message);
                      continue;
                    }
                    throw e;
                  }
                  c = e.split(/\.|,/).filter((e) => "" !== e);
                  let i = parseInt(c[0], 10),
                    r = parseInt(c[1], 10);
                  c = this.animPalette;
                  let s = new d.ShpBuilder(t, c, this.camera, g.Coords.ISO_WORLD_SCALE, !0, 3);
                  s.setOffset({ x: n.x + i, y: n.y + r });
                  let a = new T.ShpRenderable(s);
                  (a.setBatched(this.useSpriteBatching),
                    this.useSpriteBatching && a.setBatchPalettes([c]),
                    a.create3DObject(),
                    (a.get3DObject().visible = !1));
                  ((h = this.art.getAnimation(h)), (h = new y.AnimProps(h.art, t)));
                  (this.animations.set(a, new f.Animation(h, this.gameSpeed)), o.push(a));
                }
                return o;
              }
              createMuzzleFlashAnim(e, i) {
                if (this.objectArt.muzzleFlash?.length) {
                  var r = u.getRandomInt(0, this.objectArt.muzzleFlash.length - 1),
                    s = this.objectArt.muzzleFlash[r],
                    r =
                      this.gameObject.owner.country?.side === a.SideType.GDI
                        ? this.gameObject.primaryWeapon
                        : this.gameObject.secondaryWeapon;
                  if (r) {
                    r = r.rules.anim;
                    if (r.length) {
                      r = r[u.getRandomInt(0, r.length - 1)];
                      let t = { x: e.x + s.x, y: e.y + s.y };
                      return i.createAnim(
                        r,
                        (e) => {
                          e.extraOffset = t;
                        },
                        !0,
                      );
                    }
                  }
                }
              }
              createAnimObject(e, t, i, r, s) {
                var a = e.art;
                let n = new y.AnimProps(a, t);
                (e.type !== M.AnimationType.BUILDUP && e.type !== M.AnimationType.UNBUILD) ||
                  ((o = n.shadow ? t.numImages / 2 : t.numImages),
                  (n.rate = o / (60 * this.rules.general.buildupTime)));
                var o = { x: i.x + e.offset.x, y: i.y + e.offset.y };
                let l = T.ShpRenderable.factory(
                  this.aggregatedImageData.file,
                  this.palette,
                  this.camera,
                  o,
                  n.shadow,
                  0,
                  !e.flat,
                  r,
                  s && !e.flat,
                );
                return (
                  l.setSize(t),
                  l.setFrameOffset(this.aggregatedImageData.imageIndexes.get(t)),
                  l.setBatched(this.useSpriteBatching),
                  this.useSpriteBatching && l.setBatchPalettes(this.paletteRemaps),
                  l.setFlat(e.flat),
                  (e.translucent || 0 < e.translucency) && l.setForceTransparent(!0),
                  l.create3DObject(),
                  this.animations.set(l, new f.Animation(n, this.gameSpeed)),
                  l
                );
              }
              createBibObject(e, t) {
                let i = T.ShpRenderable.factory(
                  this.aggregatedImageData.file,
                  this.palette,
                  this.camera,
                  t,
                  this.objectArt.hasShadow,
                );
                return (
                  i.setSize(e),
                  i.setFrameOffset(this.aggregatedImageData.imageIndexes.get(e)),
                  i.setBatched(this.useSpriteBatching),
                  this.useSpriteBatching && i.setBatchPalettes(this.paletteRemaps),
                  i.setFlat(!0),
                  i
                );
              }
              createTurretObject(i, e) {
                this.turretBuilders = [];
                let r = new THREE.Object3D();
                r.matrixAutoUpdate = !1;
                let s = new THREE.Object3D();
                s.matrixAutoUpdate = !1;
                let a = this.objectRules.turretAnim;
                var n = { x: this.objectRules.turretAnimX, y: this.objectRules.turretAnimY };
                let o;
                if (this.objectRules.turretAnimIsVoxel) {
                  var l = !this.objectArt.noHva;
                  let t = a.toLowerCase() + ".vxl";
                  var c = this.voxels.get(t);
                  if (c) {
                    var h = l ? this.voxelAnims.get(t.replace(".vxl", ".hva")) : void 0;
                    let e = this.vxlBuilderFactory.create(c, h, this.paletteRemaps, this.palette);
                    (this.turretBuilders.push(e), (o = e.build()), o.children.forEach((e) => (e.castShadow = !1)));
                  } else console.warn(`Turret missing for building ${this.type}. Vxl file ${t} not found. `);
                  if (a.toLowerCase().includes("tur")) {
                    let i = t.replace("tur", "barl");
                    h = this.voxels.get(i);
                    if (h) {
                      var u = l ? this.voxelAnims.get(i.replace(".vxl", ".hva")) : void 0;
                      let e = this.vxlBuilderFactory.create(h, u, this.paletteRemaps, this.palette);
                      this.turretBuilders.push(e);
                      let t = e.build();
                      (t.children.forEach((e) => (e.castShadow = !1)), s.add(t));
                    }
                  }
                  u = g.Coords.screenDistanceToWorld(n.x, n.y);
                  ((r.position.x = -e.x + u.x), (r.position.z = -e.y + u.y));
                } else {
                  let t;
                  try {
                    t = this.imageFinder.find(a, this.objectArt.useTheaterExtension);
                  } catch (e) {
                    if (!(e instanceof P.ImageFinder.MissingImageError)) throw e;
                    console.warn(e.message);
                  }
                  if (t) {
                    let e = new d.ShpBuilder(t, this.palette, this.camera, g.Coords.ISO_WORLD_SCALE, !0, 2);
                    (e.setBatched(this.useSpriteBatching),
                      this.useSpriteBatching && e.setBatchPalettes(this.paletteRemaps),
                      this.turretBuilders.push(e),
                      e.setOffset({ x: i.x + n.x, y: i.y + n.y }),
                      (o = e.build()));
                  }
                }
                return (
                  o && s.add(o),
                  r.add(s),
                  A.MathUtils.translateTowardsCamera(
                    r,
                    this.camera,
                    -(
                      this.objectRules.turretAnimZAdjust +
                      this.objectRules.turretAnimY / Math.cos(this.camera.rotation.y)
                    ) * g.Coords.ISO_WORLD_SCALE,
                  ),
                  r.updateMatrix(),
                  { turret: r, turretRot: s }
                );
              }
              createRangeCircle(e) {
                var t = e * g.Coords.getWorldTileSize();
                let i = this.gameObject.owner.color,
                  r = s.OverlayUtils.createGroundCircle(t, i.asHex());
                return ((r.matrixAutoUpdate = !1), r.updateMatrix(), r);
              }
              toggleRangeCircleVisibility(e) {
                var t;
                this.rangeCircleWrapper &&
                  ((this.rangeCircleWrapper.visible = e),
                  (t = this.gameObject.overpoweredTrait?.isOverpowered()) !== this.lastOverpowered &&
                    ((this.lastOverpowered = t),
                    this.rangeCircle &&
                      (this.rangeCircleWrapper.remove(this.rangeCircle),
                      this.rangeCircle.material.dispose(),
                      this.rangeCircle.geometry.dispose()),
                    (t = this.gameObject.overpoweredTrait?.getWeapon()?.range) &&
                      ((this.rangeCircle = this.createRangeCircle(t)), this.rangeCircleWrapper.add(this.rangeCircle))));
              }
              setAnimationVisibility(e, i, t = -1) {
                let r = this.animObjects.get(e);
                if (void 0 === r) throw new Error(`Missing animObjects for animType "${M.AnimationType[e]}"`);
                if (-1 !== t) {
                  if (t >= r.length)
                    throw new RangeError(
                      `Index ${t} exceeds length of animation objects (${r.length}) ` + "of type " + M.AnimationType[e],
                    );
                  r = [r[t]];
                }
                for (var s of r) {
                  s.get3DObject().visible = i;
                  s.get3DObject().userData.intendedVisible = i;
                  let e = this.animations.get(s).props.getArt(),
                    t = e.getString("Report");
                  ((t = t || e.getString("StartSound")), t && this.handleSoundChange(t, s, i));
                }
              }
              setActiveAnimationVisible() {
                let e = this.animArtProps.getByType(M.AnimationType.ACTIVE);
                (this.objectRules.refinery && (e = [e[0]]),
                  e.forEach(({ showWhenUnpowered: e }, t) => {
                    let i = this.powered || e;
                    if (this.gameObject.bioReactorPowerTrait) {
                      let r = !!this.gameObject.garrisonTrait?.isOccupied();
                      0 === t && (i = i && !r), 1 === t && (i = i && r);
                    }
                    try {
                      this.setAnimationVisibility(M.AnimationType.ACTIVE, i, t);
                    } catch (e) {
                      if (!(e instanceof RangeError)) throw e;
                    }
                    // Bio Reactor: hide shadow on ACTIVE animation overlays — main building already provides shadow
                    if (this.gameObject.bioReactorPowerTrait) {
                      let r = this.animObjects.get(M.AnimationType.ACTIVE);
                      r && t < r.length && r[t].setShadowVisible(!1);
                    }
                  }));
              }
              setPowered(r) {
                if (
                  ((this.powered = r),
                  this.currentAnimType === M.AnimationType.IDLE && this.setActiveAnimationVisible(),
                  this.objectRules.superWeapon && this.hasAnimation(M.AnimationType.SUPER))
                ) {
                  var [t, i] = this.getNormalizedAnimType(M.AnimationType.SUPER_CHARGE_LOOP),
                    s = this.animObjects.get(t);
                  if (void 0 === s)
                    throw new Error(`Missing anim object for normalized anim type "${M.AnimationType[t]}"`);
                  i = s[i];
                  let e = this.animations.get(i);
                  r ? e.unpause() : e.pause();
                } else
                  this.animObjects.get(M.AnimationType.ACTIVE).forEach((e, t) => {
                    let i = this.animations.get(e);
                    i &&
                      (!r && this.animArtProps.getByType(M.AnimationType.ACTIVE)[t].pauseWhenUnpowered
                        ? i.pause()
                        : i.unpause());
                  });
              }
              hasAnimation(e) {
                return (
                  e === M.AnimationType.IDLE ||
                  (([e] = this.getNormalizedAnimType(e)), this.animObjects.has(e) && !!this.animObjects.get(e).length)
                );
              }
              setAnimation(e, t) {
                if (!this.gameObject.healthTrait.health)
                  throw new Error("We can't switch building animation for a destroyed building");
                switch (
                  (this.hasAnimation(e) || (e = M.AnimationType.IDLE),
                  (this.currentAnimType = e),
                  this.setAnimationVisibility(M.AnimationType.IDLE, !1),
                  this.setAnimationVisibility(M.AnimationType.SPECIAL, !1),
                  this.setAnimationVisibility(M.AnimationType.PRODUCTION, !1),
                  this.setAnimationVisibility(M.AnimationType.SUPER, !1),
                  this.setAnimationVisibility(M.AnimationType.BUILDUP, !1),
                  this.setAnimationVisibility(M.AnimationType.UNBUILD, !1),
                  this.setAnimationVisibility(M.AnimationType.FACTORY_DEPLOYING, !1),
                  this.setAnimationVisibility(M.AnimationType.FACTORY_ROOF_DEPLOYING, !1),
                  this.setActiveAnimationVisible(),
                  e !== M.AnimationType.BUILDUP && e !== M.AnimationType.UNBUILD
                    ? (this.mainObj && (this.mainObj.get3DObject().visible = !0),
                      this.bib && (this.bib.get3DObject().visible = !0),
                      this.turret && (this.turret.visible = !0))
                    : (this.mainObj && (this.mainObj.get3DObject().visible = !1),
                      this.bib && (this.bib.get3DObject().visible = !1),
                      this.turret && (this.turret.visible = !1)),
                  (e !== M.AnimationType.FACTORY_DEPLOYING && e !== M.AnimationType.FACTORY_ROOF_DEPLOYING) ||
                    (this.mainObj && (this.mainObj.get3DObject().visible = !1)),
                  e)
                ) {
                  case M.AnimationType.PRODUCTION:
                    (this.setAnimationVisibility(M.AnimationType.PRODUCTION, !0),
                      this.animObjects.get(M.AnimationType.PRODUCTION).forEach((e) => {
                        this.animations.get(e).start(t);
                      }));
                    break;
                  case M.AnimationType.BUILDUP:
                    (this.setAnimationVisibility(M.AnimationType.ACTIVE, !1),
                      this.setAnimationVisibility(M.AnimationType.BUILDUP, !0),
                      this.animObjects.get(M.AnimationType.BUILDUP).forEach((e) => {
                        this.animations.get(e).start(t);
                      }));
                    break;
                  case M.AnimationType.UNBUILD:
                    (this.setAnimationVisibility(M.AnimationType.ACTIVE, !1),
                      this.setAnimationVisibility(M.AnimationType.UNBUILD, !0),
                      this.animObjects.get(M.AnimationType.UNBUILD).forEach((e) => {
                        this.animations.get(e).start(t);
                      }));
                    break;
                  case M.AnimationType.FACTORY_DEPLOYING:
                    if (this.hasAnimation(M.AnimationType.FACTORY_DEPLOYING) && this.objectRules.factory) {
                      (this.setAnimationVisibility(M.AnimationType.FACTORY_DEPLOYING, !0),
                        this.animObjects.get(M.AnimationType.FACTORY_DEPLOYING).forEach((e) => {
                          this.animations.get(e).start(t);
                        }));
                      break;
                    }
                  case M.AnimationType.FACTORY_ROOF_DEPLOYING:
                    if (this.hasAnimation(M.AnimationType.FACTORY_ROOF_DEPLOYING) && this.objectRules.factory) {
                      (this.setAnimationVisibility(M.AnimationType.FACTORY_ROOF_DEPLOYING, !0),
                        this.animObjects.get(M.AnimationType.FACTORY_ROOF_DEPLOYING).forEach((e) => {
                          this.animations.get(e).start(t);
                        }));
                      break;
                    }
                  case M.AnimationType.SPECIAL_REPAIR_START:
                  case M.AnimationType.SPECIAL_REPAIR_LOOP:
                  case M.AnimationType.SPECIAL_REPAIR_END:
                  case M.AnimationType.SPECIAL_DOCKING:
                    if (
                      this.hasAnimation(M.AnimationType.SPECIAL) &&
                      ((e === M.AnimationType.SPECIAL_DOCKING && this.objectRules.refinery) ||
                        (e !== M.AnimationType.SPECIAL_DOCKING && this.objectRules.unitRepair))
                    ) {
                      var [i, r] = this.getNormalizedAnimType(e);
                      this.setAnimationVisibility(i, !0, r);
                      r = this.animObjects.get(i)[r];
                      this.animations.get(r).start(t);
                      break;
                    }
                  case M.AnimationType.SPECIAL_SHOOT:
                    if (this.objectRules.isBaseDefense) {
                      this.setAnimationVisibility(M.AnimationType.ACTIVE, !1);
                      var [r, s] = this.getNormalizedAnimType(e);
                      this.setAnimationVisibility(r, !0, s);
                      s = this.animObjects.get(r)[s];
                      this.animations.get(s).start(t);
                      break;
                    }
                  case M.AnimationType.SUPER_CHARGE_START:
                  case M.AnimationType.SUPER_CHARGE_LOOP:
                  case M.AnimationType.SUPER_CHARGE_END:
                    if (this.objectRules.superWeapon && this.hasAnimation(M.AnimationType.SUPER)) {
                      var [s, a] = this.getNormalizedAnimType(e);
                      this.setAnimationVisibility(s, !0, a);
                      a = this.animObjects.get(s)[a];
                      this.animations.get(a).start(t);
                      break;
                    }
                  case M.AnimationType.IDLE:
                  default:
                    ((this.currentAnimType = M.AnimationType.IDLE),
                      this.objectRules.superWeapon && this.hasAnimation(M.AnimationType.SUPER)
                        ? (this.setAnimationVisibility(M.AnimationType.SUPER, !0, 0),
                          (a = this.animObjects.get(M.AnimationType.SUPER)[0]),
                          this.animations.get(a).start(t))
                        : (this.setAnimationVisibility(
                            M.AnimationType.IDLE,
                            !this.gameObject.bioReactorPowerTrait,
                          ),
                          this.animObjects.get(M.AnimationType.IDLE).forEach((e) => {
                            this.animations.get(e).start(t);
                          }),
                          // Slave Miner: hide shadow on IDLE animation overlays — main building already provides shadow
                          this.gameObject.slaveMinerTrait &&
                            this.animObjects.get(M.AnimationType.IDLE).forEach((e) => {
                              e.setShadowVisible(!1);
                            })));
                }
              }
              doWithAnimation(e, i) {
                var [t, r] = this.getNormalizedAnimType(e);
                let s = this.animObjects.get(t);
                if (void 0 === s) throw new Error(`Missing animObjects for anim type "${M.AnimationType[t]}"`);
                (t !== e && (s = [s[r]]),
                  s.forEach((e, t) => {
                    i(this.animations.get(e), e);
                  }));
              }
              doWithCurrentAnimation(e) {
                this.doWithAnimation(this.currentAnimType, e);
              }
              endCurrentAnimation() {
                this.doWithCurrentAnimation((e) => e.endLoop());
              }
              handleSoundChange(e, t, i, r = 1) {
                if (i) {
                  var s;
                  (this.animSounds.has(t) && this.animSounds.get(t).isPlaying()) ||
                    ((s = this.worldSound?.playEffect(e, this.gameObject, this.gameObject.owner, r)) &&
                      this.animSounds.set(t, s));
                } else {
                  let e = this.animSounds.get(t);
                  e && e.isLoop && (e.stop(), this.animSounds.delete(t));
                }
              }
              onCreate(t) {
                ((this.renderableManager = t),
                  this.plugins.forEach((e) => e.onCreate(t)),
                  this.objectRules.ambientSound &&
                    (this.ambientSound = this.worldSound?.playEffect(
                      this.objectRules.ambientSound,
                      this.gameObject,
                      void 0,
                      0.25,
                    )),
                  this.pipOverlay?.onCreate(t));
              }
              onRemove(t) {
                if (
                  (this.clearDrainAnim(),
                  (this.renderableManager = void 0),
                  this.plugins.forEach((e) => e.onRemove(t)),
                  this.animSounds.forEach((e) => e.stop()),
                  this.ambientSound?.stop(),
                  this.turretRotateSound?.stop(),
                  this.poweredSound?.stop(),
                  this.gameObject.isDestroyed)
                )
                  return this.gameObject.deathType === n.DeathType.Temporal ||
                    this.gameObject.deathType === n.DeathType.None
                    ? void 0
                    : void (this.objectRules.explosion.length && this.createExplosionAnims(t));
              }
              dispose() {
                (this.plugins.forEach((e) => e.dispose()),
                  this.pipOverlay?.dispose(),
                  this.placeholderObj?.dispose(),
                  this.mainObj?.dispose(),
                  this.rubbleObj?.dispose(),
                  this.bib?.dispose(),
                  this.fireObjects?.forEach((e) => e.dispose()),
                  this.turretBuilders?.forEach((e) => e.dispose()),
                  [...(this.animObjects?.values() ?? [])].forEach((e) => e.forEach((e) => e.dispose())));
              }
            }),
          ),
          (L.lampTextures = new Map()));
      },
    };
  },
);
