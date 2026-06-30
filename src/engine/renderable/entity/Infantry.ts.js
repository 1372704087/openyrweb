// === Reconstructed SystemJS module: engine/renderable/entity/Infantry ===
// deps: ["engine/renderable/WithPosition","engine/ImageFinder","engine/gfx/DebugUtils","engine/renderable/ShpRenderable","game/Coords","engine/animation/SimpleRunner","engine/Animation","engine/AnimProps","data/IniSection","game/gameobject/infantry/sequenceMap","game/gameobject/unit/ZoneType","game/gameobject/infantry/StanceType","game/art/SequenceType","util/math","game/gameobject/infantry/InfDeathType","game/gameobject/unit/VeteranLevel","engine/renderable/entity/HighlightAnimRunner","game/gameobject/common/DeathType","game/type/MovementZone","engine/renderable/entity/unit/BlobShadow","engine/renderable/entity/BoxIntersectObject3D","engine/renderable/entity/unit/ExtraLightHelper","engine/renderable/DebugRenderable","engine/gfx/MathUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/Infantry",
  [
    "engine/renderable/WithPosition",
    "engine/ImageFinder",
    "engine/gfx/DebugUtils",
    "engine/renderable/ShpRenderable",
    "game/Coords",
    "engine/animation/SimpleRunner",
    "engine/Animation",
    "engine/AnimProps",
    "data/IniSection",
    "game/gameobject/infantry/sequenceMap",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/infantry/StanceType",
    "game/art/SequenceType",
    "util/math",
    "game/gameobject/infantry/InfDeathType",
    "game/gameobject/unit/VeteranLevel",
    "engine/renderable/entity/HighlightAnimRunner",
    "game/gameobject/common/DeathType",
    "game/type/MovementZone",
    "engine/renderable/entity/unit/BlobShadow",
    "engine/renderable/entity/BoxIntersectObject3D",
    "engine/renderable/entity/unit/ExtraLightHelper",
    "engine/renderable/DebugRenderable",
    "engine/gfx/MathUtils",
  ],
  function (e, t) {
    "use strict";
    var m, a, r, n, f, o, y, l, c, T, v, b, S, s, w, E, C, i, h, u, d, x, g, p, O;
    t && t.id;
    return {
      setters: [
        function (e) {
          m = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          s = e;
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
          i = e;
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
          x = e;
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
          "Infantry",
          (O = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p) {
              ((this.gameObject = e),
                (this.rules = t),
                (this.art = i),
                (this.imageFinder = r),
                (this.palette = a),
                (this.camera = n),
                (this.lighting = o),
                (this.debugFrame = l),
                (this.gameSpeed = c),
                (this.selectionModel = h),
                (this.useSpriteBatching = u),
                (this.useMeshInstancing = d),
                (this.pipOverlay = g),
                (this.worldSound = p),
                (this.crashingSequencePlaying = !1),
                (this.deathAnimSequencePlaying = !1),
                (this.idleActionDue = !1),
                (this.disguiseChanged = !1),
                (this.highlightAnimRunner = new C.HighlightAnimRunner(this.gameSpeed)),
                (this.plugins = []),
                (this.objectArt = e.art),
                (this.label = "infantry_" + e.rules.name),
                (this.paletteRemaps = [...this.rules.colors.values()].map((e) => this.palette.clone().remap(e))),
                (this.palette = this.palette.remap(this.gameObject.owner.color)),
                (this.withPosition = new m.WithPosition()),
                this.updateBaseLight(),
                (this.extraLight = new THREE.Vector3().copy(this.baseExtraLight)));
            }
            updateBaseLight() {
              this.baseExtraLight = this.lighting
                .compute(this.objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
                .addScalar(-1 + this.rules.audioVisual.extraInfantryLight);
            }
            registerPlugin(e) {
              this.plugins.push(e);
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
                ((e = new d.BoxIntersectObject3D(
                  new THREE.Vector3(0.5, 2 / 3, 0.5).multiplyScalar(f.Coords.LEPTONS_PER_TILE),
                )),
                (e.name = this.label),
                (e.userData.id = this.gameObject.id),
                (this.target = e),
                (e.matrixAutoUpdate = !1),
                (this.withPosition.matrixUpdate = !0),
                this.withPosition.applyTo(this),
                this.createObjects(e),
                this.shpRenderable?.setExtraLight(this.extraLight),
                this.pipOverlay && (this.pipOverlay.create3DObject(), this.posWrap.add(this.pipOverlay.get3DObject())));
            }
            setPosition(e) {
              this.withPosition.setPosition(e.x, e.y, e.z);
            }
            getPosition() {
              return this.withPosition.getPosition();
            }
            highlight() {
              this.plugins.some((e) => e.shouldDisableHighlight?.()) ||
                (this.highlightAnimRunner.animation.getState() !== y.AnimationState.RUNNING &&
                  this.highlightAnimRunner.animate(2));
            }
            update(t) {
              this.plugins.forEach((e) => e.update(t));
              var {
                zone: i,
                stance: r,
                isCrashing: e,
                isMoving: s,
                isFiring: a,
                isPanicked: n,
                owner: o,
                veteranLevel: l,
              } = this.gameObject;
              (this.pipOverlay?.update(t),
                this.blobShadow?.update(t),
                l !== this.lastVeteranLevel &&
                  (l === E.VeteranLevel.Elite &&
                    void 0 !== this.lastVeteranLevel &&
                    this.highlightAnimRunner.animate(30),
                  (this.lastVeteranLevel = l)));
              var c = this.gameObject.tile.z + this.gameObject.tileElevation;
              ((void 0 !== this.lastElevation && this.lastElevation === c) ||
                ((this.lastElevation = c), this.updateBaseLight(), this.extraLight.copy(this.baseExtraLight)),
                this.highlightAnimRunner.shouldUpdate() &&
                  (this.highlightAnimRunner.tick(t),
                  x.ExtraLightHelper.multiplyShp(
                    this.extraLight,
                    this.baseExtraLight,
                    this.highlightAnimRunner.getValue(),
                  )));
              var h = this.disguise?.owner ?? o;
              this.lastOwnerColor !== h.color &&
                (this.palette.remap(h.color),
                (this.shpRenderable ?? this.placeholder)?.setPalette(this.palette),
                (this.lastOwnerColor = h.color));
              var u = this.gameObject.warpedOutTrait.isActive(),
                l = u !== this.lastWarpedOut;
              this.lastWarpedOut = u;
              ((c = this.gameObject.cloakableTrait?.isCloaked()), (h = c !== this.lastCloaked));
              if (
                ((this.lastCloaked = c),
                (l || h) && (this.shpRenderable ?? this.placeholder)?.setOpacity(u || c ? 0.5 : 1),
                e ||
                  (void 0 !== this.lastZone && this.lastZone === i) ||
                  (i === v.ZoneType.Water
                    ? this.gameObject.rules.enterWaterSound &&
                      this.worldSound?.playEffect(this.gameObject.rules.enterWaterSound, this.gameObject, o)
                    : this.lastZone === v.ZoneType.Water &&
                      this.gameObject.rules.leaveWaterSound &&
                      this.worldSound?.playEffect(this.gameObject.rules.leaveWaterSound, this.gameObject, o),
                  this.blobShadow && this.shpRenderable?.setShadowVisible(!this.blobShadow.get3DObject().visible)),
                this.gameObject.isDestroyed && this.deathPromiseResolve)
              )
                if (this.deadBodyAnimRenderable) {
                  if (
                    (((this.shpRenderable ?? this.placeholder).get3DObject().visible = !1),
                    this.deadBodyAnimRenderable.update(t),
                    this.deadBodyAnimRenderable.isAnimFinished())
                  )
                    return void this.deathPromiseResolve();
                } else {
                  if (!this.deathAnimRenderable) {
                    if (this.deathAnimSequencePlaying)
                      return this.animRunner && this.animRunner.animation.getState() !== y.AnimationState.STOPPED
                        ? (this.animRunner.tick(t),
                          void this.updateShapeFrame(this.computeFacingNumber(this.gameObject.direction)))
                        : void ([w.InfDeathType.Gunfire, w.InfDeathType.Explode].includes(
                            this.gameObject.infDeathType,
                          ) &&
                          this.gameObject.rules.isHuman &&
                          this.gameObject.zone === v.ZoneType.Ground
                            ? this.prepareDeadBodyAnim()
                            : this.deathPromiseResolve());
                    c = this.sequenceQueue.shift();
                    if (c) return ((this.deathAnimSequencePlaying = !0), void this.setAnimParams(c, t, !1));
                    throw new Error("We should have a death sequence scheduled right now");
                  }
                  if (
                    (((this.shpRenderable ?? this.placeholder).get3DObject().visible = !1),
                    this.deathAnimRenderable.update(t),
                    this.deathAnimRenderable.isAnimFinished())
                  )
                    return void ([w.InfDeathType.Gunfire, w.InfDeathType.Explode].includes(
                      this.gameObject.infDeathType,
                    ) && this.gameObject.rules.isHuman
                      ? this.prepareDeadBodyAnim()
                      : this.deathPromiseResolve());
                }
              else {
                if (this.gameObject.warpedOutTrait.isActive()) return;
                e &&
                  (this.crashingSequencePlaying ||
                    ((this.crashingSequencePlaying = !0),
                    (d = T.getCrashingSequences(this.gameObject)) && (this.sequenceQueue = d)));
              }
              (void 0 !== this.lastDirection && this.lastDirection === this.gameObject.direction) ||
                ((this.lastDirection = this.gameObject.direction),
                (this.computedDirection = this.gameObject.direction));
              var d = this.idleActionDue;
              this.idleActionDue = this.gameObject.idleActionTrait.actionDueThisTick();
              let g = this.idleActionDue && !d;
              if (
                void 0 === this.lastMoving ||
                this.lastMoving !== s ||
                void 0 === this.lastFiring ||
                this.lastFiring !== a ||
                void 0 === this.lastZone ||
                this.lastZone !== i ||
                void 0 === this.lastPanicked ||
                this.lastPanicked !== n ||
                this.disguiseChanged
              ) {
                var p = this.disguiseChanged,
                  m = this.lastFiring !== a;
                if (
                  ((this.lastMoving = s),
                  (this.lastFiring = a),
                  (this.lastZone = i),
                  (this.lastPanicked = n),
                  (this.computedDirection = this.gameObject.direction),
                  (this.disguiseChanged = !1),
                  !e && ((this.sequenceQueue = []), !m || a || p))
                ) {
                  let e = this.findSequenceBy(i, r, s, a, n);
                  void 0 !== e &&
                    (this.disguise &&
                      [S.SequenceType.FireUp, S.SequenceType.FireProne].includes(e) &&
                      (e = S.SequenceType.Ready),
                    this.setAnimParams(e, t, !a));
                }
              }
              if (
                ((void 0 !== this.lastStance && this.lastStance === r) ||
                  ((this.sequenceQueue = []),
                  (g = !1),
                  (m = T.getStanceTransitionSequenceBy(this.lastStance, r)),
                  (this.lastStance = r),
                  m && this.objectArt.sequences.has(m) && this.sequenceQueue.push(m),
                  void 0 !== (p = this.findSequenceBy(i, r, s, a, n)) && this.sequenceQueue.push(p),
                  void 0 !== this.currentSequenceParams?.onlyFacing &&
                    (this.computedDirection = this.directionFromFacingNo(this.currentSequenceParams.onlyFacing)),
                  (p = this.sequenceQueue.shift()),
                  this.setAnimParams(p, t, !m),
                  p === S.SequenceType.Paradrop
                    ? ((p = this.rules.audioVisual.parachute),
                      (this.paradropAnim = this.renderableManager.createAnim(p, void 0, !0)),
                      this.paradropAnim.remapColor(o.color),
                      this.paradropAnim.create3DObject(),
                      (this.paradropAnim.get3DObject().position.y = f.Coords.tileHeightToWorld(1)),
                      this.paradropAnim.get3DObject().updateMatrix(),
                      this.posWrap.add(this.paradropAnim.get3DObject()))
                    : this.paradropAnim &&
                      (this.paradropAnim.endAnimationLoop(),
                      this.blobShadow &&
                        (this.posWrap.remove(this.blobShadow.get3DObject()),
                        this.blobShadow.dispose(),
                        (this.blobShadow = void 0),
                        this.shpRenderable?.setShadowVisible(!0)))),
                this.paradropAnim &&
                  (this.paradropAnim.update(t),
                  this.paradropAnim.isAnimFinished() &&
                    (this.posWrap.remove(this.paradropAnim.get3DObject()), (this.paradropAnim = void 0))),
                this.sequenceQueue.length ||
                  s ||
                  a ||
                  (r !== b.StanceType.None && r !== b.StanceType.Guard) ||
                  i === v.ZoneType.Air ||
                  !g ||
                  (0.5 <= Math.random()
                    ? (o = this.findIdleSequence(i, r, this.objectArt)) && this.setAnimParams(o, t, !1)
                    : (this.computedDirection = Math.floor(360 * Math.random()))),
                this.animRunner)
              ) {
                if (this.animRunner.animation.getState() === y.AnimationState.STOPPED && this.currentSequenceParams) {
                  [S.SequenceType.Idle1, S.SequenceType.Idle2].includes(this.currentSequenceParams.type) &&
                    void 0 !== this.currentSequenceParams.onlyFacing &&
                    (this.computedDirection = this.directionFromFacingNo(this.currentSequenceParams.onlyFacing));
                  let e;
                  ((e = this.sequenceQueue.length ? this.sequenceQueue.shift() : this.findSequenceBy(i, r, s, a, n)),
                    void 0 !== e && this.setAnimParams(e, t, !a));
                }
                this.animRunner.tick(t);
                a = this.computeFacingNumber(this.computedDirection);
                this.updateShapeFrame(a);
              }
            }
            findIdleSequence(e, t, i) {
              let r = T.getIdleSequenceBy(e, t);
              if (
                (r?.length &&
                  ((r = r.filter((e) => i.sequences.has(e))),
                  r.length ||
                    e === v.ZoneType.Ground ||
                    (r = T.getIdleSequenceBy(v.ZoneType.Ground, t)?.filter((e) => i.sequences.has(e)))),
                r)
              )
                return r[s.getRandomInt(0, r.length - 1)];
            }
            prepareDeadBodyAnim() {
              var e = this.rules.audioVisual.deadBodies,
                e = e[s.getRandomInt(0, e.length - 1)];
              ((this.deadBodyAnimRenderable = this.renderableManager.createAnim(e, void 0, !0)),
                this.deadBodyAnimRenderable.create3DObject(),
                this.posWrap.add(this.deadBodyAnimRenderable.get3DObject()));
            }
            findSequenceBy(e, t, i, r, s) {
              var a = T.findSequence(e, t, i, r, s, [...this.objectArt.sequences.keys()]);
              if (void 0 !== a) return a;
              console.warn(
                `Couldn't find a sequence for infantry "${this.gameObject.name}" ` + `(moving=${i}, firing=${r})`,
              );
            }
            setAnimParams(t, i, r = !0) {
              if (this.animRunner) {
                var s = this.objectArt.sequences.get(t);
                if (s) {
                  this.currentSequenceParams = s;
                  let e = this.animRunner.animation.props;
                  ((e.loopCount = r ? -1 : 1),
                    (e.loopEnd = s.frameCount - 1),
                    [S.SequenceType.Deploy, S.SequenceType.Undeploy, S.SequenceType.Paradrop].includes(t)
                      ? t === S.SequenceType.Paradrop
                        ? (e.rate = 2 * l.AnimProps.defaultRate)
                        : (e.rate = l.AnimProps.defaultRate)
                      : (e.rate = l.AnimProps.defaultRate / 2),
                    [S.SequenceType.Walk].includes(t) && (e.rate /= 1.33),
                    this.animRunner.animation.start(i));
                } else console.warn(`Infantry "${this.gameObject.name}" is missing sequence "${S.SequenceType[t]}"`);
              }
            }
            updateShapeFrame(e) {
              var t, i;
              this.currentSequenceParams &&
                this.shpRenderable &&
                this.animRunner &&
                (({ startFrame: t, facingMult: i } = this.currentSequenceParams),
                (i = t + i * e + this.animRunner.animation.getCurrentFrame()) < this.shpRenderable.frameCount &&
                  this.shpRenderable.setFrame(i));
            }
            computeFacingNumber(e) {
              return Math.round((((e - 45 + 360) % 360) / 360) * 8) % 8;
            }
            directionFromFacingNo(e) {
              return 45 + (360 * e) / 8;
            }
            createObjects(t) {
              if (this.debugFrame.value) {
                let e = r.DebugUtils.createWireframe({ width: 0.5, height: 0.5 }, 1);
                (e.translateX(-f.Coords.getWorldTileSize() / 4),
                  e.translateZ(-f.Coords.getWorldTileSize() / 4),
                  t.add(e));
              }
              let e = (this.posWrap = new THREE.Object3D());
              ((e.matrixAutoUpdate = !1), t.add(e));
              var i = this.createMainObject(this.objectArt);
              (e.add(i),
                ((this.gameObject.rules.movementZone !== h.MovementZone.Fly || this.objectArt.isVoxel) &&
                  this.gameObject.stance !== b.StanceType.Paradrop) ||
                  ((this.blobShadow = new u.BlobShadow(this.gameObject, 3, this.useMeshInstancing)),
                  this.blobShadow.create3DObject(),
                  this.posWrap.add(this.blobShadow.get3DObject())));
            }
            createMainObject(e) {
              let t;
              try {
                t = this.imageFinder.findByObjectArt(e);
              } catch (e) {
                if (!(e instanceof a.ImageFinder.MissingImageError)) throw e;
                console.warn(`<${this.gameObject.name}>: ` + e.message);
              }
              if (!t)
                return (
                  (this.placeholder = new g.DebugRenderable(
                    { width: 0.25, height: 0.25 },
                    this.objectArt.height,
                    this.palette,
                    { centerFoundation: !0 },
                  )),
                  this.placeholder.setBatched(this.useSpriteBatching),
                  this.useSpriteBatching && this.placeholder.setBatchPalettes(this.paletteRemaps),
                  this.placeholder.create3DObject(),
                  this.placeholder.get3DObject()
                );
              var i = e.getDrawOffset();
              let r = (this.shpRenderable = n.ShpRenderable.factory(t, this.palette, this.camera, i, e.hasShadow));
              (r.setBatched(this.useSpriteBatching),
                this.useSpriteBatching && r.setBatchPalettes(this.paletteRemaps),
                r.create3DObject());
              let s = r.get3DObject();
              (p.MathUtils.translateTowardsCamera(s, this.camera, 15 * f.Coords.ISO_WORLD_SCALE), s.updateMatrix());
              ((i = new l.AnimProps(new c.IniSection("dummy"), t)), (i = new y.Animation(i, this.gameSpeed)));
              return ((this.animRunner = new o.SimpleRunner()), (this.animRunner.animation = i), s);
            }
            setDisguise(e) {
              this.gameObject.isDestroyed ||
                this.gameObject.isCrashing ||
                ((this.objectArt = e?.objectArt ?? this.gameObject.art),
                this.updateShpRenderableFromArt(this.objectArt),
                (this.disguiseChanged = !0),
                (this.disguise = e));
            }
            updateShpRenderableFromArt(e) {
              var t = (this.shpRenderable ?? this.placeholder)?.get3DObject();
              (t && (this.posWrap.remove(t), (this.shpRenderable ?? this.placeholder)?.dispose()),
                this.posWrap.add(this.createMainObject(e)));
            }
            onCreate(t) {
              ((this.renderableManager = t),
                this.plugins.forEach((e) => e.onCreate(t)),
                this.gameObject.rules.ambientSound &&
                  (this.ambientSound = this.worldSound?.playEffect(
                    this.gameObject.rules.ambientSound,
                    this.gameObject,
                  )));
            }
            onRemove(t) {
              if (
                ((this.renderableManager = void 0),
                this.plugins.forEach((e) => e.onRemove(t)),
                this.ambientSound?.stop(),
                this.gameObject.isDestroyed &&
                  this.gameObject.deathType !== i.DeathType.Temporal &&
                  this.gameObject.deathType !== i.DeathType.Crush &&
                  this.gameObject.stance !== b.StanceType.Paradrop)
              ) {
                var e,
                  r = T.getDeathSequence(this.gameObject, this.gameObject.infDeathType);
                if (r)
                  (1 < r.length
                    ? ((e = r[s.getRandomInt(0, r.length - 1)]), (this.sequenceQueue = [e]))
                    : (this.sequenceQueue = [r[0]]),
                    this.disguise &&
                      ((this.objectArt = this.gameObject.art), this.updateShpRenderableFromArt(this.gameObject.art)));
                else {
                  if (!this.gameObject.rules.isHuman) return;
                  r = T.getDeathAnim(this.rules, this.gameObject.infDeathType);
                  if (!r) return;
                  let i = this.art.getAnimation(r);
                  if (
                    ((this.deathAnimRenderable = t.createAnim(r, void 0, !0)),
                    this.deathAnimRenderable.create3DObject(),
                    this.create3DObject(),
                    this.posWrap.add(this.deathAnimRenderable.get3DObject()),
                    i.isFlamingGuy)
                  ) {
                    let e = i.art.clone();
                    (e.set("Shadow", "yes"), e.set("LoopCount", "0"), e.set("Start", String(8 * i.runningFrames)));
                    let t = this.deathAnimRenderable.getAnimProps();
                    t.setArt(e);
                  }
                }
                return (
                  (this.renderableManager = t),
                  new Promise((e) => {
                    this.deathPromiseResolve = () => {
                      ((this.renderableManager = void 0), e());
                    };
                  })
                );
              }
            }
            dispose() {
              (this.plugins.forEach((e) => e.dispose()),
                this.pipOverlay?.dispose(),
                this.shpRenderable?.dispose(),
                this.placeholder?.dispose(),
                this.deathAnimRenderable?.dispose(),
                this.deadBodyAnimRenderable?.dispose(),
                this.paradropAnim?.dispose(),
                this.blobShadow?.dispose());
            }
          }),
        );
      },
    };
  },
);
