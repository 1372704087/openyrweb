// === Reconstructed SystemJS module: engine/renderable/entity/Vehicle ===
// deps: ["liang-barsky","game/gameobject/Vehicle","game/Coords","engine/renderable/WithPosition","engine/gfx/DebugUtils","engine/renderable/ShpRenderable","engine/ImageFinder","engine/renderable/MapSpriteTranslation","engine/Animation","engine/AnimProps","data/IniSection","engine/animation/SimpleRunner","util/math","engine/type/ObjectType","game/type/SpeedType","engine/renderable/entity/HighlightAnimRunner","game/gameobject/unit/VeteranLevel","game/gameobject/trait/HarvesterTrait","game/gameobject/common/DeathType","game/gameobject/unit/FacingUtil","game/gameobject/unit/ZoneType","engine/renderable/entity/InvulnerableAnimRunner","game/GameSpeed","engine/renderable/entity/BoxIntersectObject3D","engine/renderable/entity/unit/RotorHelper","engine/renderable/entity/unit/ExtraLightHelper","engine/renderable/DebugRenderable","engine/gfx/MathUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/Vehicle",
  [
    "liang-barsky",
    "game/gameobject/Vehicle",
    "game/Coords",
    "engine/renderable/WithPosition",
    "engine/gfx/DebugUtils",
    "engine/renderable/ShpRenderable",
    "engine/ImageFinder",
    "engine/renderable/MapSpriteTranslation",
    "engine/Animation",
    "engine/AnimProps",
    "data/IniSection",
    "engine/animation/SimpleRunner",
    "util/math",
    "engine/type/ObjectType",
    "game/type/SpeedType",
    "engine/renderable/entity/HighlightAnimRunner",
    "game/gameobject/unit/VeteranLevel",
    "game/gameobject/trait/HarvesterTrait",
    "game/gameobject/common/DeathType",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/unit/ZoneType",
    "engine/renderable/entity/InvulnerableAnimRunner",
    "game/GameSpeed",
    "engine/renderable/entity/BoxIntersectObject3D",
    "engine/renderable/entity/unit/RotorHelper",
    "engine/renderable/entity/unit/ExtraLightHelper",
    "engine/renderable/DebugRenderable",
    "engine/gfx/MathUtils",
  ],
  function (t, e) {
    "use strict";
    var o, a, S, y, n, p, m, f, w, E, C, x, h, i, s, T, O, r, l, c, A, v, u, d, g, M, b, R, P, I, k;
    e && e.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          n = e;
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
          w = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          x = e;
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
          T = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          v = e;
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
          M = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          R = e;
        },
      ],
      execute: function () {
        var e;
        ((P = Math.PI / 4),
          ((e = I = I || {})[(e.Grab = 0)] = "Grab"),
          (e[(e.Shake1 = 1)] = "Shake1"),
          (e[(e.Shake2 = 2)] = "Shake2"),
          t(
            "Vehicle",
            (k = class {
              constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f) {
                ((this.gameObject = e),
                  (this.rules = t),
                  (this.imageFinder = r),
                  (this.voxels = a),
                  (this.voxelAnims = n),
                  (this.palette = o),
                  (this.camera = l),
                  (this.lighting = c),
                  (this.debugFrame = h),
                  (this.gameSpeed = u),
                  (this.selectionModel = d),
                  (this.vxlBuilderFactory = g),
                  (this.useSpriteBatching = p),
                  (this.pipOverlay = m),
                  (this.worldSound = f),
                  (this.rotorSpeeds = []),
                  (this.vxlBuilders = []),
                  (this.highlightAnimRunner = new T.HighlightAnimRunner(this.gameSpeed)),
                  (this.invulnAnimRunner = new v.InvulnerableAnimRunner(this.gameSpeed)),
                  (this.plugins = []),
                  (this.objectRules = e.rules),
                  (this.objectArt = e.art),
                  (this.label = "vehicle_" + this.objectRules.name),
                  (this.paletteRemaps = [...this.rules.colors.values()].map((e) => this.palette.clone().remap(e))),
                  this.palette.remap(this.gameObject.owner.color),
                  (this.lastOwnerColor = this.gameObject.owner.color),
                  this.updateBaseLight(),
                  (this.vxlExtraLight = new THREE.Vector3().copy(this.baseVxlExtraLight)),
                  (this.shpExtraLight = new THREE.Vector3().copy(this.baseShpExtraLight)),
                  (this.withPosition = new y.WithPosition()));
              }
              updateBaseLight() {
                ((this.baseShpExtraLight = this.lighting
                  .compute(this.objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
                  .addScalar(-1)
                  .addScalar(this.rules.audioVisual.extraUnitLight)),
                  (this.baseVxlExtraLight = new THREE.Vector3().addScalar(
                    this.lighting.computeNoAmbient(
                      this.objectArt.lightingType,
                      this.gameObject.tile,
                      this.gameObject.tileElevation,
                    ) + this.rules.audioVisual.extraUnitLight,
                  )));
              }
              registerPlugin(e) {
                this.plugins.push(e);
              }
              updateLighting() {
                (this.plugins.forEach((e) => e.updateLighting?.()),
                  this.updateBaseLight(),
                  this.vxlExtraLight.copy(this.baseVxlExtraLight),
                  this.shpExtraLight.copy(this.baseShpExtraLight));
              }
              get3DObject() {
                return this.target;
              }
              create3DObject() {
                let e = this.get3DObject();
                e ||
                  ((e = new d.BoxIntersectObject3D(
                    new THREE.Vector3(1, 1 / 3, 1).multiplyScalar(S.Coords.LEPTONS_PER_TILE),
                  )),
                  (e.name = this.label),
                  (e.userData.id = this.gameObject.id),
                  (this.target = e),
                  (e.matrixAutoUpdate = !1),
                  (this.withPosition.matrixUpdate = !0),
                  this.withPosition.applyTo(this),
                  this.createObjects(e),
                  this.vxlBuilders.forEach((e) => e.setExtraLight(this.vxlExtraLight)),
                  this.shpRenderable?.setExtraLight(this.shpExtraLight),
                  this.pipOverlay &&
                    (this.pipOverlay.create3DObject(), this.posObj?.add(this.pipOverlay.get3DObject())));
              }
              updateClippingPlanes(e, t = !1) {
                if (t || (this.objectRules.naval && !this.objectRules.underwater)) {
                  var i = S.Coords.tileHeightToWorld(e);
                  let t = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -i)];
                  this.vxlBuilders.forEach((e) => e.setClippingPlanes(t));
                }
              }
              getIntersectTarget() {
                return this.target;
              }
              getUiName() {
                var e = this.plugins.reduce((e, t) => t.getUiNameOverride?.() ?? e, void 0);
                return void 0 !== e ? e : this.gameObject.getUiName();
              }
              setPosition(e) {
                this.withPosition.setPosition(e.x, e.y, e.z);
              }
              getPosition() {
                return this.withPosition.getPosition();
              }
              highlight() {
                this.plugins.some((e) => e.shouldDisableHighlight?.()) ||
                  (this.highlightAnimRunner.animation.getState() !== w.AnimationState.RUNNING &&
                    this.highlightAnimRunner.animate(2));
              }
              update(i, r = 0) {
                (this.plugins.forEach((e) => e.update(i)),
                  this.pipOverlay?.update(i),
                  this.gameObject.veteranLevel !== this.lastVeteranLevel &&
                    (this.gameObject.veteranLevel === O.VeteranLevel.Elite &&
                      void 0 !== this.lastVeteranLevel &&
                      this.highlightAnimRunner.animate(30),
                    (this.lastVeteranLevel = this.gameObject.veteranLevel)));
                var e = this.gameObject.tile.z + this.gameObject.tileElevation,
                  t = void 0 === this.lastElevation || this.lastElevation !== e;
                t &&
                  ((this.lastElevation = e), this.updateBaseLight(), this.updateClippingPlanes(this.gameObject.tile.z));
                var s = this.gameObject.invulnerableTrait.isActive(),
                  a = s !== this.lastInvulnerable;
                this.lastInvulnerable = s;
                var n = this.highlightAnimRunner.shouldUpdate();
                (n && this.highlightAnimRunner.tick(i),
                  s && a && this.invulnAnimRunner.animate(),
                  this.invulnAnimRunner.shouldUpdate() && this.invulnAnimRunner.tick(i));
                var o = this.gameObject.warpedOutTrait.isActive(),
                  l = o !== this.lastWarpedOut;
                this.lastWarpedOut = o;
                var c = this.gameObject.cloakableTrait?.isCloaked(),
                  h = c !== this.lastCloaked;
                this.lastCloaked = c;
                let submergeTrait = this.gameObject.submergibleTrait,
                  submergeProgress = submergeTrait ? submergeTrait.getSurfaceProgress() : 0,
                  u = submergeProgress > 0.5;
                e = u !== this.lastSubmerged;
                if (((this.lastSubmerged = u), l || h || e || submergeTrait)) {
                  let t = o || c ? 0.5 : 1 - 0.5 * submergeProgress;
                  (this.shpRenderable?.setOpacity(t),
                    this.shpRenderable?.setFlat(u),
                    this.vxlBuilders.forEach((e) => {
                      (e.setOpacity(t), e.setShadow(!u));
                    }),
                    this.placeholder?.setOpacity(t),
                    this.posObj &&
                      ((this.posObj.position.y = -8 * S.Coords.ISO_WORLD_SCALE * submergeProgress),
                      this.posObj.updateMatrix()));
                }
                if (
                  ((t || a || s || n) &&
                    ((p = s ? this.invulnAnimRunner.getValue() : 0),
                    (y = (n ? this.highlightAnimRunner.getValue() : 0) || p),
                    (m = this.lighting.getAmbientIntensity()),
                    M.ExtraLightHelper.multiplyVxl(this.vxlExtraLight, this.baseVxlExtraLight, m, y),
                    M.ExtraLightHelper.multiplyShp(this.shpExtraLight, this.baseShpExtraLight, y)),
                  this.gameObject.isDestroyed && this.resolveObjectRemove)
                ) {
                  if (
                    (this.squidGrabAnim &&
                      (this.posObj?.remove(this.squidGrabAnim.get3DObject()),
                      this.squidGrabAnim.dispose(),
                      (this.squidGrabAnim = void 0)),
                    this.destroyStartTime || (this.destroyStartTime = i),
                    this.isSinker())
                  ) {
                    var d = (i - this.destroyStartTime) / 3e3,
                      g = 1 <= d;
                    g
                      ? (this.mainObj.visible = !1)
                      : (this.objectRules.naval && (this.mainObj.rotation.x = (Math.PI / 4) * d),
                        (this.mainObj.position.y = -16 * S.Coords.ISO_WORLD_SCALE * d),
                        (this.mainObj.position.z = 8 * S.Coords.ISO_WORLD_SCALE * d),
                        this.mainObj.updateMatrix());
                    let e = !1;
                    (this.sinkWakeAnims.forEach((e) => e.update(i)),
                      this.sinkWakeAnims.filter((e) => !e.isAnimFinished()).length ||
                        (this.sinkWakeAnims.forEach((e) => this.get3DObject().remove(e.get3DObject())),
                        (this.sinkWakeAnims.length = 0),
                        (e = !0)),
                      g && e && this.resolveObjectRemove());
                  }
                } else if (!this.gameObject.warpedOutTrait.isActive()) {
                  let e = (Math.floor(this.gameObject.direction + this.gameObject.spinVelocity * r) + 360) % 360;
                  var p = e !== this.lastDirection;
                  (p &&
                    void 0 !== this.lastDirection &&
                    this.objectArt.isVoxel &&
                    this.gameObject.zone === A.ZoneType.Air &&
                    ((T = e - this.lastDirection),
                    void 0 !== this.lastDirectionDelta &&
                    Math.abs(T) < 2 &&
                    Math.abs(this.lastDirectionDelta) < 2 &&
                    Math.sign(T) !== Math.sign(this.lastDirectionDelta)
                      ? (e = this.lastDirection)
                      : (this.lastDirectionDelta = T)),
                    (this.lastDirection = e));
                  var m = this.gameObject.owner.color;
                  this.lastOwnerColor !== m &&
                    (this.palette.remap(m),
                    (this.lastOwnerColor = m),
                    this.vxlBuilders.forEach((e) => e.setPalette(this.palette)),
                    this.shpRenderable?.setPalette(this.palette),
                    this.placeholder?.setPalette(this.palette));
                  var f,
                    y = this.gameObject.isMoving || (!this.objectArt.isVoxel && !!this.gameObject.spinVelocity),
                    d = this.gameObject.isFiring,
                    g = void 0 === this.lastMoving || this.lastMoving !== y,
                    T = void 0 === this.lastFiring || this.lastFiring !== d;
                  if (0 < r && (y || g)) {
                    let e = this.gameObject.moveTrait.velocity.clone(),
                      t = e.multiplyScalar(r);
                    m = t.add(this.gameObject.position.worldPosition);
                    this.setPosition(m);
                  }
                  (g || T) &&
                    ((this.lastMoving = y),
                    (this.lastFiring = d),
                    this.objectArt.isVoxel || this.updateShapeAnimation(y, d));
                  let t;
                  if (this.gameObject.rules.isChargeTurret) {
                    if (T && d) {
                      this.chargeTurretRunner = new x.SimpleRunner();
                      let e = new E.AnimProps(new C.IniSection("dummy"), this.gameObject.rules.turretCount);
                      ((e.reverse = !0), (e.rate = 5));
                      var v = new w.Animation(e, this.gameSpeed);
                      this.chargeTurretRunner.animation = v;
                    }
                    this.chargeTurretRunner?.tick(i);
                    var b = this.chargeTurretRunner?.getCurrentFrame() ?? 0;
                    ((t = b !== this.currentTurretIdx),
                      (this.currentTurretIdx = b),
                      this.chargeTurretRunner?.animation.getState() === w.AnimationState.STOPPED &&
                        (this.chargeTurretRunner = void 0));
                  } else
                    ((t = this.gameObject.turretNo !== this.currentTurretIdx),
                      (this.currentTurretIdx = this.gameObject.turretNo));
                  this.objectArt.isVoxel
                    ? (this.updateVxlRotation(e, p),
                      this.updateBodyVxl(),
                      (v = (T = this.gameObject.rocking?.facing) !== this.lastRockingFacing),
                      (this.lastRockingFacing = T),
                      !v || void 0 === T || (0 < (f = this.gameObject.rocking.factor) && this.startRocking(T, f, i)),
                      (f =
                        (b = !(
                          !this.gameObject.parasiteableTrait?.isInfested() ||
                          !this.gameObject.parasiteableTrait.getParasite()?.rules.organic
                        )) !== this.lastSquidGrabbed),
                      (this.lastSquidGrabbed = b),
                      this.updateRocking(i, b),
                      this.gameObject.turretTrait &&
                        1 < this.objectRules.turretCount &&
                        t &&
                        this.updateActiveTurret(this.currentTurretIdx),
                      this.updateSquidGrab(i, b, f, p, e, T, v))
                    : this.shpAnimRunner && (this.shpAnimRunner.tick(i), this.updateShapeFrame(e, y, d));
                }
              }
              updateVxlRotation(e, t) {
                var i,
                  r = this.gameObject.tilterTrait?.tilt ?? { yaw: 0, pitch: 0 };
                var crashPitch = this.gameObject.crashPitch ?? 0,
                  combinedPitch = r.pitch + crashPitch;
                ((this.lastTilt && combinedPitch === this.lastTilt.pitch && r.yaw === this.lastTilt.yaw && !t) ||
                  ((this.lastTilt = { pitch: combinedPitch, yaw: r.yaw }),
                  (this.tiltObj.rotation.y = THREE.Math.degToRad(r.yaw)),
                  (this.tiltObj.rotation.x = THREE.Math.degToRad(combinedPitch)),
                  this.tiltObj.updateMatrix(),
                  (this.dirWrapObj.rotation.y = THREE.Math.degToRad(e - r.yaw)),
                  this.dirWrapObj.updateMatrix()),
                  this.turret &&
                    ((r = (i = Math.floor(this.gameObject.turretTrait.facing)) !== this.lastTurretFacing),
                    (this.lastTurretFacing = i),
                    (r || t) &&
                      ((i = THREE.Math.degToRad(i - e)),
                      (this.turret.rotation.y = i),
                      this.turret.updateMatrix(),
                      this.barrel && ((this.barrel.rotation.y = i), this.barrel.updateMatrix()))),
                  this.rotors &&
                    this.rotors.forEach((e, t) => {
                      ((this.rotorSpeeds[t] = g.RotorHelper.computeRotationStep(
                        this.gameObject,
                        this.rotorSpeeds[t] ?? 0,
                        this.objectArt.rotors[t],
                      )),
                        this.rotorSpeeds[t] &&
                          (e.rotateOnAxis(this.objectArt.rotors[t].axis, this.rotorSpeeds[t]), e.updateMatrix()));
                    }));
              }
              startRocking(i, r, s) {
                if (this.bodyVxlBuilder) {
                  ((this.rockingStartTime = s), (this.rockingFactor = r));
                  var a = this.bodyVxlBuilder.getLocalBoundingBox();
                  let e = new THREE.Box2(new THREE.Vector2(a.min.x, a.min.y), new THREE.Vector2(a.max.x, a.max.y));
                  var n = THREE.Math.degToRad(c.FacingUtil.toWorldDeg(i)),
                    a = new THREE.Vector2();
                  let t = new THREE.Vector2(10, 0)
                    .rotateAround(new THREE.Vector2(), n)
                    .setLength(e.getSize(a).length() + 1);
                  a = t.toArray();
                  (o.clip([0, 0], a, [e.min.x, e.min.y, e.max.x, e.max.y]),
                    (this.rockingPoint = new THREE.Vector3(a[0], 0, a[1])));
                  a = t
                    .clone()
                    .rotateAround(new THREE.Vector2(), -Math.PI / 2)
                    .normalize();
                  this.rockingAxis = new THREE.Vector3(a.x, 0, a.y);
                }
              }
              updateRocking(t, i) {
                if (this.rockingStartTime) {
                  var r = t - this.rockingStartTime;
                  let e = this.rockingFactor;
                  i || (e *= 1 - Math.min(1, this.gameObject.rules.weight / 5));
                  var s =
                      r || e
                        ? Math.min(
                            1,
                            ((r / ((a.ROCKING_TICKS / u.GameSpeed.BASE_TICKS_PER_SECOND) * 1e3)) *
                              this.gameSpeed.value) /
                              e,
                          )
                        : 0,
                    r = P * e * (1 - Math.pow(2 * (s - 0.5), 2));
                  (this.rockingTiltObj.position.set(0, 0, 0),
                    this.rockingTiltObj.rotation.set(0, 0, 0),
                    this.rockingTiltObj.scale.set(1, 1, 1),
                    R.MathUtils.rotateObjectAboutPoint(this.rockingTiltObj, this.rockingPoint, this.rockingAxis, r),
                    this.rockingTiltObj.updateMatrix(),
                    (1 !== s && 0 !== e) || (this.rockingStartTime = void 0));
                }
              }
              updateSquidGrab(e, t, i, r, s, a, n) {
                var o;
                if (
                  (i &&
                    (this.squidGrabAnim &&
                      (this.posObj?.remove(this.squidGrabAnim.get3DObject()),
                      this.squidGrabAnim.dispose(),
                      (this.squidGrabAnim = void 0)),
                    t &&
                      ((this.squidGrabAnim = this.renderableManager.createAnim(
                        "SQDG",
                        (e) => {
                          ((e.extraOffset = { x: 0, y: -S.Coords.ISO_TILE_SIZE / 4 }),
                            e.setExtraLight(this.shpExtraLight));
                        },
                        !0,
                      )),
                      this.squidGrabAnim.remapColor(this.gameObject.parasiteableTrait.getParasite().owner.color),
                      this.squidGrabAnim.create3DObject(),
                      this.posObj?.add(this.squidGrabAnim.get3DObject()))),
                  t && (r || i) && this.updateSquidGrabAnim(this.squidGrabAnim.getAnimProps(), s, I.Grab),
                  t &&
                    n &&
                    a &&
                    ((o = 0 < a ? I.Shake1 : I.Shake2),
                    this.updateSquidGrabAnim(this.squidGrabAnim.getAnimProps(), s, o),
                    this.squidGrabAnim.reset()),
                  t && n && !a)
                ) {
                  var l = this.rules.combatDamage.splashList;
                  for (let e = 0; e < 3; e++) {
                    var c = l[h.getRandomInt(0, l.length - 1)];
                    this.renderableManager.createTransientAnim(c, (e) => {
                      let t = this.withPosition.getPosition().clone();
                      var i = {
                        x:
                          h.getRandomInt(-S.Coords.ISO_TILE_SIZE / 2, S.Coords.ISO_TILE_SIZE / 2) *
                          S.Coords.ISO_WORLD_SCALE,
                        y:
                          h.getRandomInt(-S.Coords.ISO_TILE_SIZE / 2, S.Coords.ISO_TILE_SIZE / 2) *
                          S.Coords.ISO_WORLD_SCALE,
                      };
                      e.setPosition(t.add(new THREE.Vector3(i.x, 0, i.y)));
                    });
                  }
                }
                this.squidGrabAnim?.update(e);
              }
              updateShapeAnimation(t, i) {
                if (this.shpAnimRunner) {
                  let e = this.shpAnimRunner.animation.props;
                  var r;
                  (i
                    ? ((e.loopEnd = this.objectArt.firingFrames - 1), (e.rate = E.AnimProps.defaultRate / 2))
                    : t || this.objectRules.naval
                      ? ((e.loopEnd = this.objectArt.walkFrames - 1),
                        (r = this.objectRules.naval && !t ? this.objectRules.idleRate : this.objectRules.walkRate),
                        (e.rate = E.AnimProps.defaultRate / r))
                      : (e.loopEnd = this.objectArt.standingFrames - 1),
                    this.shpAnimRunner.animation.rewind());
                }
              }
              updateShapeFrame(t, i, r) {
                if (this.shpRenderable && this.shpAnimRunner) {
                  let e;
                  var s = this.objectArt.facings,
                    a = Math.round((((45 - t + 360) % 360) / 360) * s) % s,
                    s = this.shpAnimRunner.animation.getCurrentFrame();
                  ((e = r
                    ? this.objectArt.startFiringFrame + this.objectArt.firingFrames * a + s
                    : i || this.objectRules.naval
                      ? this.objectArt.startWalkFrame + this.objectArt.walkFrames * a + s
                      : this.objectArt.startStandFrame + this.objectArt.standingFrames * a + s),
                    this.shpRenderable.setFrame(e));
                }
              }
              updateSquidGrabAnim(e, t, i) {
                var r = Math.round((((360 - t) % 360) / 360) * 8) % 8;
                ((e.start = 10 * r + 80 * i),
                  (e.end = 10 * r + 9 + 80 * i),
                  (e.loopStart = e.start),
                  (e.loopEnd = e.end),
                  (e.loopCount = 0),
                  (e.rate = 10 / (a.ROCKING_TICKS / u.GameSpeed.BASE_TICKS_PER_SECOND / (this.rockingFactor ?? 1))));
              }
              createObjects(t) {
                if (this.debugFrame.value) {
                  let e = n.DebugUtils.createWireframe({ width: 1, height: 1 }, 1);
                  (e.translateX(-S.Coords.getWorldTileSize() / 2),
                    e.translateZ(-S.Coords.getWorldTileSize() / 2),
                    t.add(e));
                }
                let e = (this.tiltObj = new THREE.Object3D());
                ((e.matrixAutoUpdate = !1), (e.rotation.order = "YXZ"));
                let i = (this.dirWrapObj = new THREE.Object3D());
                i.matrixAutoUpdate = !1;
                var r = (this.mainObj = this.createMainObject());
                let s = (this.rockingTiltObj = new THREE.Object3D());
                ((s.matrixAutoUpdate = !1), (s.rotation.order = "YXZ"), s.add(r), i.add(s), e.add(i));
                let a = (this.posObj = new THREE.Object3D());
                ((a.matrixAutoUpdate = !1), a.add(e), t.add(a));
              }
              computeSpriteAnchorOffset(e) {
                var t = this.objectArt.getDrawOffset();
                return { x: e.x + t.x, y: e.y + t.y };
              }
              createMainObject() {
                let n = new THREE.Object3D();
                if (((n.matrixAutoUpdate = !1), this.objectArt.isVoxel)) {
                  var o = !this.objectArt.noHva,
                    e = this.objectArt.imageName.toLowerCase(),
                    t = e + ".vxl",
                    r = this.voxels.get(t);
                  if (r) {
                    var s = o ? this.voxelAnims.get(e + ".hva") : void 0;
                    let i = (this.bodyVxlBuilder = this.vxlBuilderFactory.create(
                      r,
                      s,
                      this.paletteRemaps,
                      this.palette,
                    ));
                    this.vxlBuilders.push(i);
                    s = this.mainVxl = i.build();
                    (n.add(s),
                      this.objectArt.rotors &&
                        (this.rotors = this.objectArt.rotors.map((e) => {
                          var t = i.getSection(e.name);
                          if (!t)
                            throw new Error(`Vehicle "${this.objectRules.name}" VXL section "${e.name}" not found`);
                          return t;
                        })));
                  } else
                    (console.warn(`VXL missing for vehicle ${this.objectRules.name}. Vxl file ${t} not found. `),
                      n.add(this.createPlaceholder()));
                  if (this.objectRules.spawns && this.objectRules.noSpawnAlt) {
                    let i = e + "wo.vxl";
                    var a = this.voxels.get(i);
                    if (a) {
                      var l = o ? this.voxelAnims.get(i.replace(".vxl", ".hva")) : void 0;
                      let e = this.vxlBuilderFactory.create(a, l, this.paletteRemaps, this.palette);
                      this.vxlBuilders.push(e);
                      let t = (this.noSpawnAltVxl = e.build());
                      ((t.visible = !1), n.add(t));
                    } else console.warn(`<${this.gameObject.name}>: Couldn't find noSpawnAlt image "${i}"`);
                  }
                  if (this.gameObject.harvesterTrait && this.objectRules.unloadingClass) {
                    var c = this.rules.hasObject(this.objectRules.unloadingClass, i.ObjectType.Vehicle)
                        ? this.rules
                            .getObject(this.objectRules.unloadingClass, i.ObjectType.Vehicle)
                            .imageName.toLowerCase()
                        : void 0,
                      a = c ? this.voxels.get(c + ".vxl") : void 0;
                    if (a) {
                      l = o ? this.voxelAnims.get(c + ".hva") : void 0;
                      let e = this.vxlBuilderFactory.create(a, l, this.paletteRemaps, this.palette);
                      this.vxlBuilders.push(e);
                      let t = (this.harvesterAltVxl = e.build());
                      ((t.visible = !1), n.add(t));
                    } else console.warn(`<${this.gameObject.name}>: Couldn't find UnloadingClass image "${c}.vxl"`);
                  }
                  if (this.gameObject.turretTrait) {
                    c = this.objectArt.turretOffset;
                    let t = n;
                    if (c) {
                      let e = new THREE.Object3D();
                      ((e.matrixAutoUpdate = !1), (e.position.z = -c), e.updateMatrix(), n.add(e), (t = e));
                    }
                    let r = [];
                    for (let a = 0; a < this.objectRules.turretCount; ++a) {
                      let i = e + `tur${a || ""}.vxl`;
                      var h = this.voxels.get(i);
                      if (h) {
                        var u = o ? this.voxelAnims.get(i.replace(".vxl", ".hva")) : void 0;
                        let e = this.vxlBuilderFactory.create(h, u, this.paletteRemaps, this.palette);
                        this.vxlBuilders.push(e);
                        let t = e.build();
                        ((t.visible = a === this.gameObject.turretNo), r.push(t));
                      } else (console.warn(`<${this.gameObject.name}>: Missing turret file "${i}"`), r.push(void 0));
                    }
                    ((this.currentTurretIdx = this.gameObject.turretNo), (this.allTurrets = r));
                    let i;
                    (1 < r.length
                      ? ((i = this.turret = new THREE.Object3D()),
                        (i.matrixAutoUpdate = !1),
                        r.forEach((e) => e && i.add(e)))
                      : (i = this.turret = r[0]),
                      i && t.add(i));
                    let s = e + "barl.vxl";
                    c = this.voxels.get(s);
                    if (c) {
                      var d = o ? this.voxelAnims.get(s.replace(".vxl", ".hva")) : void 0;
                      let e = this.vxlBuilderFactory.create(c, d, this.paletteRemaps, this.palette);
                      this.vxlBuilders.push(e);
                      var g = (this.barrel = e.build());
                      t.add(g);
                    }
                  }
                } else {
                  let e = new f.MapSpriteTranslation(1, 1);
                  var { spriteOffset: d, anchorPointWorld: g } = e.compute(),
                    d = this.computeSpriteAnchorOffset(d);
                  let i;
                  try {
                    i = this.imageFinder.findByObjectArt(this.objectArt);
                  } catch (e) {
                    if (!(e instanceof m.ImageFinder.MissingImageError)) throw e;
                    console.warn(`<${this.gameObject.name}>: ` + e.message);
                  }
                  if (i) {
                    let e = (this.shpRenderable = p.ShpRenderable.factory(
                      i,
                      this.palette,
                      this.camera,
                      d,
                      this.objectArt.hasShadow,
                    ));
                    (e.setBatched(this.useSpriteBatching),
                      this.useSpriteBatching && e.setBatchPalettes(this.paletteRemaps),
                      e.create3DObject(),
                      n.add(e.get3DObject()),
                      (n.position.x = g.x),
                      (n.position.z = g.y),
                      n.updateMatrix());
                    let t = new E.AnimProps(new C.IniSection("dummy"), i);
                    t.loopCount = -1;
                    g = new w.Animation(t, this.gameSpeed);
                    ((this.shpAnimRunner = new x.SimpleRunner()), (this.shpAnimRunner.animation = g));
                  } else n.add(this.createPlaceholder());
                }
                return n;
              }
              createPlaceholder() {
                return (
                  (this.placeholder = new b.DebugRenderable(
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
              }
              updateActiveTurret(i) {
                this.allTurrets.forEach((e, t) => {
                  e && (e.visible = t === i);
                });
              }
              updateBodyVxl() {
                var e = !!this.noSpawnAltVxl && !this.gameObject.airSpawnTrait.availableSpawns,
                  t =
                    !!this.harvesterAltVxl &&
                    !!this.gameObject.harvesterTrait &&
                    [r.HarvesterStatus.PreparingToUnload, r.HarvesterStatus.Unloading].includes(
                      this.gameObject.harvesterTrait.status,
                    );
                (this.noSpawnAltVxl && (this.noSpawnAltVxl.visible = e),
                  this.harvesterAltVxl && (this.harvesterAltVxl.visible = t),
                  this.mainVxl && (this.mainVxl.visible = !e && !t));
              }
              isSinker() {
                return this.gameObject.zone === A.ZoneType.Water && this.gameObject.isSinker;
              }
              onCreate(t) {
                ((this.renderableManager = t),
                  this.plugins.forEach((e) => e.onCreate(t)),
                  this.objectRules.ambientSound &&
                    (this.ambientSound = this.worldSound?.playEffect(this.objectRules.ambientSound, this.gameObject)));
              }
              onRemove(t) {
                if (
                  ((this.renderableManager = void 0),
                  this.plugins.forEach((e) => e.onRemove(t)),
                  this.ambientSound?.stop(),
                  this.gameObject.isDestroyed && this.gameObject.isVehicle() && this.get3DObject())
                ) {
                  if (this.gameObject.deathType === l.DeathType.Temporal) return;
                  if (this.gameObject.deathType === l.DeathType.None) return;
                  if (this.gameObject.deathType === l.DeathType.Crush) return;
                  if (
                    !this.isSinker() ||
                    this.objectRules.underwater ||
                    (this.gameObject.deathType !== l.DeathType.Sink && this.objectRules.speedType === s.SpeedType.Hover)
                  ) {
                    if (this.objectRules.underwater && this.objectRules.organic) return;
                    if (!this.objectRules.explosion.length) return;
                    if (this.gameObject.explodes && this.objectRules.deathWeapon) return;
                    var e = this.objectRules.explosion,
                      e = e[h.getRandomInt(0, e.length - 1)];
                    return void t.createTransientAnim(e, (e) => e.setPosition(this.withPosition.getPosition()));
                  }
                  if (this.isSinker()) {
                    var i = this.rules.audioVisual.wake;
                    this.sinkWakeAnims = [];
                    for (let e = 0; e < 5; e++) {
                      let e = t.createAnim(i, void 0, !0);
                      var r = {
                        x: h.getRandomInt(-15, 15) * S.Coords.ISO_WORLD_SCALE,
                        y: h.getRandomInt(-15, 15) * S.Coords.ISO_WORLD_SCALE,
                      };
                      (e.setPosition(new THREE.Vector3(r.x, 0, r.y)),
                        this.sinkWakeAnims.push(e),
                        e.create3DObject(),
                        this.get3DObject().add(e.get3DObject()));
                    }
                    this.gameObject.rules.naval || this.updateClippingPlanes(this.gameObject.tile.z, !0);
                  }
                  return new Promise((e) => (this.resolveObjectRemove = e));
                }
              }
              dispose() {
                (this.plugins.forEach((e) => e.dispose()),
                  this.pipOverlay?.dispose(),
                  this.shpRenderable?.dispose(),
                  this.vxlBuilders.forEach((e) => e.dispose()),
                  this.sinkWakeAnims?.forEach((e) => e.dispose()),
                  this.squidGrabAnim?.dispose(),
                  this.placeholder?.dispose());
              }
            }),
          ));
      },
    };
  },
);
