/**
 * Infantry — 步兵渲染件（序列动画 + 变装 + 空降伞 + 死亡序列）。
 *
 * update 驱动 sequenceQueue/findSequenceBy/setAnimParams，处理 idle、
 * stance 过渡、shovel/carry 特殊序列、paradrop 伞；死亡 onRemove 返回
 * Promise 等 deathAnim/deadBody 结束。BERSERK 全红盘与 Aircraft 同构。
 *
 * 由 engine/renderable/entity/Infantry.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import { ImageFinder } from "engine/ImageFinder"; // 已转换
import * as DebugUtilsModule from "engine/gfx/DebugUtils"; // 孪生
import * as ShpRenderableModule from "engine/renderable/ShpRenderable"; // 孪生
import { Coords } from "game/Coords"; // 已转换
import { SimpleRunner } from "engine/animation/SimpleRunner"; // 已转换
import { Animation, AnimationState } from "engine/Animation"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { IniSection } from "data/IniSection"; // 已转换
import * as sequenceMapModule from "game/gameobject/infantry/sequenceMap"; // 孪生
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import { SequenceType } from "game/art/SequenceType"; // 已转换
import { getRandomInt } from "util/math"; // 已转换
import { InfDeathType } from "game/gameobject/infantry/InfDeathType"; // 已转换
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 已转换
import { HighlightAnimRunner } from "engine/renderable/entity/HighlightAnimRunner"; // 已转换
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import * as BlobShadowModule from "engine/renderable/entity/unit/BlobShadow"; // 孪生
import { BoxIntersectObject3D } from "engine/renderable/entity/BoxIntersectObject3D"; // 已转换
import * as ExtraLightHelperModule from "engine/renderable/entity/unit/ExtraLightHelper"; // 孪生
import * as DebugRenderableModule from "engine/renderable/DebugRenderable"; // 孪生
import { MathUtils } from "engine/gfx/MathUtils"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const DebugUtils: any = (DebugUtilsModule as any).DebugUtils;
const ShpRenderable: any = (ShpRenderableModule as any).ShpRenderable;
const sequenceMap: any = sequenceMapModule as any;
const getCrashingSequences: (u: any) => any = sequenceMap.getCrashingSequences;
const getStanceTransitionSequenceBy: (a: any, b: any) => any = sequenceMap.getStanceTransitionSequenceBy;
const findSequenceByFn: (...a: any[]) => any = sequenceMap.findSequence;
const getIdleSequenceBy: (...a: any[]) => any = sequenceMap.getIdleSequenceBy;
const getDeathSequence: (...a: any[]) => any = sequenceMap.getDeathSequence;
const getDeathAnim: (...a: any[]) => any = sequenceMap.getDeathAnim;
const BlobShadow: any = (BlobShadowModule as any).BlobShadow;
const ExtraLightHelper: any = (ExtraLightHelperModule as any).ExtraLightHelper;
const DebugRenderable: any = (DebugRenderableModule as any).DebugRenderable;

/**
 * 步兵渲染件。
 * 8 向 facing × 序列动画状态机。
 */
export class Infantry {
  /** 宿主对象。 */
  gameObject: any;
  /** 规则。 */
  rules: any;
  /** art 容器。 */
  art: any;
  /** 图片查找器。 */
  imageFinder: any;
  /** 调色板。 */
  palette: any;
  /** 相机。 */
  camera: any;
  /** 光照。 */
  lighting: any;
  /** 调试线框。 */
  debugFrame: any;
  /** 游戏速度。 */
  gameSpeed: any;
  /** 选择模型。 */
  selectionModel: any;
  /** 是否精灵批处理。 */
  useSpriteBatching: any;
  /** 是否 mesh instancing。 */
  useMeshInstancing: any;
  /** pip 覆盖。 */
  pipOverlay: any;
  /** 世界音效。 */
  worldSound: any;

  crashingSequencePlaying = false;
  deathAnimSequencePlaying = false;
  idleActionDue = false;
  disguiseChanged = false;
  /** 高亮驱动。 */
  highlightAnimRunner: any;
  /** 插件。 */
  plugins: any[] = [];
  /** art 规则。 */
  objectArt: any;
  /** 调试名。 */
  label: string;
  /** 调色板组。 */
  paletteRemaps: any[] = [];
  /** 狂暴全红盘。 */
  __berserkPalette: any;
  /** 上次狂暴。 */
  __wasBerserk: boolean | undefined;

  withPosition: any;
  baseExtraLight: any;
  extraLight: any;
  target: any;
  posWrap: any;
  shpRenderable: any;
  placeholder: any;
  animRunner: any;
  blobShadow: any;
  paradropAnim: any;
  deathAnimRenderable: any;
  deadBodyAnimRenderable: any;
  deathPromiseResolve: (() => void) | undefined;
  ambientSound: any;
  sequenceQueue: any[] = [];
  currentSequenceParams: any;
  disguise: any;
  renderableManager: any;
  lastVeteranLevel: any;
  lastElevation: any;
  lastOwnerColor: any;
  lastWarpedOut: any;
  lastCloaked: any;
  lastZone: any;
  lastMoving: any;
  lastFiring: any;
  lastPanicked: any;
  lastHarvesting: any;
  lastCarrying: any;
  lastStance: any;
  lastDirection: any;
  computedDirection: any;

  /**
   * @param gameObject - 宿主
   * @param rules - 规则
   * @param art - art
   * @param imageFinder - 图片查找器
   * @param palette - 调色板
   * @param camera - 相机
   * @param lighting - 光照
   * @param debugFrame - 调试
   * @param gameSpeed - 游戏速度
   * @param selectionModel - 选择
   * @param useSpriteBatching - 批处理
   * @param useMeshInstancing - instancing
   * @param pipOverlay - pip
   * @param worldSound - 音效
   */
  constructor(
    gameObject: any,
    rules: any,
    art: any,
    imageFinder: any,
    // 孪生第 5 参 theater：调用方传入，本类不写入字段（与孪生一致）
    theater: any,
    palette: any,
    camera: any,
    lighting: any,
    debugFrame: any,
    gameSpeed: any,
    selectionModel: any,
    useSpriteBatching: any,
    useMeshInstancing: any,
    pipOverlay: any,
    worldSound: any,
  ) {
    void theater;
    this.gameObject = gameObject;
    this.rules = rules;
    this.art = art;
    this.imageFinder = imageFinder;
    this.palette = palette;
    this.camera = camera;
    this.lighting = lighting;
    this.debugFrame = debugFrame;
    this.gameSpeed = gameSpeed;
    this.selectionModel = selectionModel;
    this.useSpriteBatching = useSpriteBatching;
    this.useMeshInstancing = useMeshInstancing;
    this.pipOverlay = pipOverlay;
    this.worldSound = worldSound;
    this.crashingSequencePlaying = false;
    this.deathAnimSequencePlaying = false;
    this.idleActionDue = false;
    this.disguiseChanged = false;
    this.highlightAnimRunner = new HighlightAnimRunner(this.gameSpeed);
    this.plugins = [];
    this.objectArt = gameObject.art;
    this.label = "infantry_" + gameObject.rules.name;
    this.paletteRemaps = [...this.rules.colors.values()].map((c) => this.palette.clone().remap(c));
    this.palette = this.palette.remap(this.gameObject.owner.color);
    // 预挂全红狂暴盘
    (() => {
      this.__berserkPalette = this.palette.clone();
      for (let i = 0; i < this.__berserkPalette.colors.length; i++) {
        const c = this.__berserkPalette.colors[i];
        c.r = 255;
        c.g = Math.max(0, c.g - 20);
        c.b = Math.max(0, c.b - 20);
      }
      this.__berserkPalette._hash = this.__berserkPalette.computeHash(this.__berserkPalette.colors);
      this.paletteRemaps.push(this.__berserkPalette);
    })();
    this.withPosition = new WithPosition();
    this.updateBaseLight();
    this.extraLight = new THREE.Vector3().copy(this.baseExtraLight);
  }

  /** 基础光含 extraInfantryLight。 */
  updateBaseLight(): void {
    this.baseExtraLight = this.lighting
      .compute(this.objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
      .addScalar(-1 + this.rules.audioVisual.extraInfantryLight);
  }

  /**
   * 注册插件。
   * @param plugin - 插件
   */
  registerPlugin(plugin: any): void {
    this.plugins.push(plugin);
  }

  /** 刷新插件与基础光。 */
  updateLighting(): void {
    this.plugins.forEach((p) => p.updateLighting?.());
    this.updateBaseLight();
    this.extraLight.copy(this.baseExtraLight);
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /** 射线拾取目标。 */
  getIntersectTarget(): any {
    return this.target;
  }

  /** UI 名（可被插件覆盖）。 */
  getUiName(): any {
    const override = this.plugins.reduce((acc, p) => p.getUiNameOverride?.() ?? acc, void 0);
    return override !== void 0 ? override : this.gameObject.getUiName();
  }

  /** 惰性创建拾取盒与子对象。 */
  create3DObject(): void {
    let obj = this.get3DObject();
    if (!obj) {
      obj = new BoxIntersectObject3D(
        new THREE.Vector3(0.5, 2 / 3, 0.5).multiplyScalar(Coords.LEPTONS_PER_TILE),
      );
      obj.name = this.label;
      obj.userData.id = this.gameObject.id;
      this.target = obj;
      obj.matrixAutoUpdate = false;
      this.withPosition.matrixUpdate = true;
      this.withPosition.applyTo(this);
      this.createObjects(obj);
      this.shpRenderable?.setExtraLight(this.extraLight);
      if (this.pipOverlay) {
        this.pipOverlay.create3DObject();
        this.posWrap.add(this.pipOverlay.get3DObject());
      }
    }
  }

  /**
   * 设置位置。
   * @param pos - 位置
   */
  setPosition(pos: any): void {
    this.withPosition.setPosition(pos.x, pos.y, pos.z);
  }

  /** 当前位置。 */
  getPosition(): any {
    return this.withPosition.getPosition();
  }

  /** 触发 2 圈高亮。 */
  highlight(): void {
    if (this.plugins.some((p) => p.shouldDisableHighlight?.())) return;
    if (this.highlightAnimRunner.animation.getState() !== AnimationState.RUNNING) {
      this.highlightAnimRunner.animate(2);
    }
  }

  /**
   * 序列状态机主更新。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    this.plugins.forEach((p) => p.update(now));
    const {
      zone,
      stance,
      isCrashing,
      isMoving,
      isFiring,
      isPanicked,
      owner,
      veteranLevel,
      isHarvesting,
      isCarrying,
    } = this.gameObject;
    this.pipOverlay?.update(now);
    this.blobShadow?.update(now);

    // 升 Elite 高亮
    if (veteranLevel !== this.lastVeteranLevel) {
      if (veteranLevel === VeteranLevel.Elite && this.lastVeteranLevel !== void 0) {
        this.highlightAnimRunner.animate(30);
      }
      this.lastVeteranLevel = veteranLevel;
    }

    const elev = this.gameObject.tile.z + this.gameObject.tileElevation;
    if (this.lastElevation !== void 0 && this.lastElevation === elev) {
      // 高度未变
    } else {
      this.lastElevation = elev;
      this.updateBaseLight();
      this.extraLight.copy(this.baseExtraLight);
    }
    if (this.highlightAnimRunner.shouldUpdate()) {
      this.highlightAnimRunner.tick(now);
      ExtraLightHelper.multiplyShp(
        this.extraLight,
        this.baseExtraLight,
        this.highlightAnimRunner.getValue(),
      );
    }

    // 狂暴盘切换
    (() => {
      const isBerserk = !!this.gameObject.berserkTrait?.isBerserk();
      if (isBerserk !== this.__wasBerserk) {
        this.__wasBerserk = isBerserk;
        const pal = isBerserk ? this.__berserkPalette : this.palette;
        (this.shpRenderable ?? this.placeholder)?.setPalette(pal);
      }
    })();

    // owner / 变装 owner 换色
    const colorOwner = this.disguise?.owner ?? owner;
    if (this.lastOwnerColor !== colorOwner.color) {
      this.palette.remap(colorOwner.color);
      (this.shpRenderable ?? this.placeholder)?.setPalette(this.palette);
      this.lastOwnerColor = colorOwner.color;
    }

    // warpedOut / cloak 半透明
    const warped = this.gameObject.warpedOutTrait.isActive();
    const warpedChanged = warped !== this.lastWarpedOut;
    this.lastWarpedOut = warped;
    const cloaked = this.gameObject.cloakableTrait?.isCloaked();
    const cloakChanged = cloaked !== this.lastCloaked;
    this.lastCloaked = cloaked;
    if (warpedChanged || cloakChanged) {
      (this.shpRenderable ?? this.placeholder)?.setOpacity(warped || cloaked ? 0.5 : 1);
    }

    // 进出水音效 + 影子同步
    if (
      !isCrashing &&
      (this.lastZone === void 0 || this.lastZone !== zone)
    ) {
      if (zone === ZoneType.Water) {
        if (this.gameObject.rules.enterWaterSound) {
          this.worldSound?.playEffect(this.gameObject.rules.enterWaterSound, this.gameObject, owner);
        }
      } else if (
        this.lastZone === ZoneType.Water &&
        this.gameObject.rules.leaveWaterSound
      ) {
        this.worldSound?.playEffect(this.gameObject.rules.leaveWaterSound, this.gameObject, owner);
      }
      if (this.blobShadow && this.shpRenderable) {
        this.shpRenderable.setShadowVisible(!this.blobShadow.get3DObject().visible);
      }
    }

    // 死亡流程
    if (this.gameObject.isDestroyed && this.deathPromiseResolve) {
      if (this.deadBodyAnimRenderable) {
        (this.shpRenderable ?? this.placeholder).get3DObject().visible = false;
        this.deadBodyAnimRenderable.update(now);
        if (this.deadBodyAnimRenderable.isAnimFinished()) {
          this.deathPromiseResolve();
          return;
        }
      } else {
        if (!this.deathAnimRenderable) {
          if (this.deathAnimSequencePlaying) {
            if (this.animRunner && this.animRunner.animation.getState() !== AnimationState.STOPPED) {
              this.animRunner.tick(now);
              this.updateShapeFrame(this.computeFacingNumber(this.gameObject.direction));
              return;
            }
            if (
              [InfDeathType.Gunfire, InfDeathType.Explode].includes(this.gameObject.infDeathType) &&
              this.gameObject.rules.isHuman &&
              this.gameObject.zone === ZoneType.Ground
            ) {
              this.prepareDeadBodyAnim();
            } else {
              this.deathPromiseResolve();
            }
            return;
          }
          const seq = this.sequenceQueue.shift();
          if (seq) {
            this.deathAnimSequencePlaying = true;
            this.setAnimParams(seq, now, false);
            return;
          }
          throw new Error("We should have a death sequence scheduled right now");
        }
        (this.shpRenderable ?? this.placeholder).get3DObject().visible = false;
        this.deathAnimRenderable.update(now);
        if (this.deathAnimRenderable.isAnimFinished()) {
          if (
            [InfDeathType.Gunfire, InfDeathType.Explode].includes(this.gameObject.infDeathType) &&
            this.gameObject.rules.isHuman
          ) {
            this.prepareDeadBodyAnim();
          } else {
            this.deathPromiseResolve();
          }
          return;
        }
      }
    } else {
      if (this.gameObject.warpedOutTrait.isActive()) return;
      if (isCrashing && !this.crashingSequencePlaying) {
        this.crashingSequencePlaying = true;
        const crashing = getCrashingSequences(this.gameObject);
        if (crashing) this.sequenceQueue = crashing;
      }
    }

    // 方向变化
    if (this.lastDirection === void 0 || this.lastDirection !== this.gameObject.direction) {
      this.lastDirection = this.gameObject.direction;
      this.computedDirection = this.gameObject.direction;
    }

    // idle 动作到期
    const wasIdleDue = this.idleActionDue;
    this.idleActionDue = this.gameObject.idleActionTrait.actionDueThisTick();
    let idleTrigger = this.idleActionDue && !wasIdleDue;

    const stateChanged =
      this.lastMoving === void 0 ||
      this.lastMoving !== isMoving ||
      this.lastFiring === void 0 ||
      this.lastFiring !== isFiring ||
      this.lastZone === void 0 ||
      this.lastZone !== zone ||
      this.lastPanicked === void 0 ||
      this.lastPanicked !== isPanicked ||
      this.lastHarvesting !== isHarvesting ||
      this.lastCarrying !== isCarrying ||
      this.lastStance === void 0 ||
      this.lastStance !== stance ||
      this.disguiseChanged;

    if (stateChanged) {
      const wasDisguiseChanged = this.disguiseChanged;
      const firingChanged = this.lastFiring !== void 0 && this.lastFiring !== isFiring;
      this.lastMoving = isMoving;
      this.lastFiring = isFiring;
      this.lastZone = zone;
      this.lastPanicked = isPanicked;
      this.lastHarvesting = isHarvesting;
      this.lastCarrying = isCarrying;
      this.computedDirection = this.gameObject.direction;
      this.disguiseChanged = false;
      if (!isCrashing) {
        this.sequenceQueue = [];
        // 状态变化时：收获中或非「开火刚结束」才重选序列
        if (isHarvesting || !firingChanged || isFiring || wasDisguiseChanged) {
          let seq: any;
          if (isHarvesting && this.objectArt.sequences.has(SequenceType.Shovel)) {
            seq = SequenceType.Shovel;
          } else {
            seq = this.findSequenceBy(zone, stance, isMoving, isFiring, isPanicked);
            if (
              isCarrying &&
              isMoving &&
              seq === SequenceType.Walk &&
              this.objectArt.sequences.has(SequenceType.Carry)
            ) {
              seq = SequenceType.Carry;
            }
          }
          if (seq !== void 0) {
            if (
              this.disguise &&
              [SequenceType.FireUp, SequenceType.FireProne].includes(seq)
            ) {
              seq = SequenceType.Ready;
            }
            this.setAnimParams(seq, now, !isFiring);
          }
        }
      }
    }

    // stance 过渡
    if (
      (this.lastStance !== void 0 && this.lastStance === stance) ||
      isHarvesting
    ) {
      // 姿态未变 / 收获中跳过
    } else {
      this.sequenceQueue = [];
      idleTrigger = false;
      const transition = getStanceTransitionSequenceBy(this.lastStance, stance);
      this.lastStance = stance;
      if (transition && this.objectArt.sequences.has(transition)) {
        this.sequenceQueue.push(transition);
      }
      const current = this.findSequenceBy(zone, stance, isMoving, isFiring, isPanicked);
      if (current !== void 0) this.sequenceQueue.push(current);
      if (this.currentSequenceParams?.onlyFacing !== void 0) {
        this.computedDirection = this.directionFromFacingNo(this.currentSequenceParams.onlyFacing);
      }
      const next = this.sequenceQueue.shift();
      this.setAnimParams(next, now, !transition);

      // 空降伞
      if (stance === StanceType.Paradrop) {
        if (!this.paradropAnim) {
          const chuteName = this.rules.audioVisual.parachute;
          if (chuteName) {
            this.paradropAnim = this.renderableManager.createAnim(chuteName, void 0, true);
            this.paradropAnim.remapColor(owner.color);
            this.paradropAnim.create3DObject();
            this.paradropAnim.get3DObject().position.y = Coords.tileHeightToWorld(1);
            this.paradropAnim.get3DObject().updateMatrix();
            this.posWrap.add(this.paradropAnim.get3DObject());
          } else {
            console.warn(`Parachute anim name missing for infantry "${this.gameObject.name}"`);
          }
        }
      } else if (this.paradropAnim) {
        this.paradropAnim.endAnimationLoop();
        if (this.blobShadow) {
          this.posWrap.remove(this.blobShadow.get3DObject());
          this.blobShadow.dispose();
          this.blobShadow = void 0;
          this.shpRenderable?.setShadowVisible(true);
        }
      }
    }

    // 推进降落伞
    if (this.paradropAnim) {
      this.paradropAnim.update(now);
      if (this.paradropAnim.isAnimFinished()) {
        this.posWrap.remove(this.paradropAnim.get3DObject());
        this.paradropAnim = void 0;
      }
    }

    // 随机 idle
    if (
      !this.sequenceQueue.length &&
      !isMoving &&
      !isFiring &&
      !isHarvesting &&
      (stance === StanceType.None || stance === StanceType.Guard) &&
      zone !== ZoneType.Air &&
      idleTrigger
    ) {
      if (Math.random() >= 0.5) {
        const idle = this.findIdleSequence(zone, stance, this.objectArt);
        if (idle) this.setAnimParams(idle, now, false);
      } else {
        this.computedDirection = Math.floor(360 * Math.random());
      }
    }

    // 推进动画与帧
    if (this.animRunner) {
      if (
        this.animRunner.animation.getState() === AnimationState.STOPPED &&
        this.currentSequenceParams
      ) {
        if (
          [SequenceType.Idle1, SequenceType.Idle2].includes(this.currentSequenceParams.type) &&
          this.currentSequenceParams.onlyFacing !== void 0
        ) {
          this.computedDirection = this.directionFromFacingNo(this.currentSequenceParams.onlyFacing);
        }
        let next: any;
        if (this.sequenceQueue.length) {
          next = this.sequenceQueue.shift();
        } else if (isHarvesting && this.objectArt.sequences.has(SequenceType.Shovel)) {
          next = SequenceType.Shovel;
        } else {
          next = this.findSequenceBy(zone, stance, isMoving, isFiring, isPanicked);
          if (
            isCarrying &&
            isMoving &&
            next === SequenceType.Walk &&
            this.objectArt.sequences.has(SequenceType.Carry)
          ) {
            next = SequenceType.Carry;
          }
        }
        if (next !== void 0) this.setAnimParams(next, now, !isFiring);
      }
      this.animRunner.tick(now);
      const facing = this.computeFacingNumber(this.computedDirection);
      this.updateShapeFrame(facing);
    }
  }

  /**
   * 随机挑一个可用 idle 序列。
   * @param zone - 区域
   * @param stance - 姿态
   * @param art - art
   */
  findIdleSequence(zone: any, stance: any, art: any): any {
    let candidates = getIdleSequenceBy(zone, stance);
    if (candidates?.length) {
      candidates = candidates.filter((s: any) => art.sequences.has(s));
      if (!candidates.length && zone !== ZoneType.Ground) {
        candidates = getIdleSequenceBy(ZoneType.Ground, stance)?.filter((s: any) =>
          art.sequences.has(s),
        );
      }
    }
    if (candidates) {
      return candidates[getRandomInt(0, candidates.length - 1)];
    }
  }

  /** 从 deadBodies 随机播尸体动画。 */
  prepareDeadBodyAnim(): void {
    const bodies = this.rules.audioVisual.deadBodies;
    const name = bodies[getRandomInt(0, bodies.length - 1)];
    this.deadBodyAnimRenderable = this.renderableManager.createAnim(name, void 0, true);
    this.deadBodyAnimRenderable.create3DObject();
    this.posWrap.add(this.deadBodyAnimRenderable.get3DObject());
  }

  /**
   * 按状态查可用序列。
   * @param zone - 区域
   * @param stance - 姿态
   * @param isMoving - 移动中
   * @param isFiring - 开火中
   * @param isPanicked - 恐慌中
   */
  findSequenceBy(zone: any, stance: any, isMoving: any, isFiring: any, isPanicked: any): any {
    // Boris firing his secondary weapon (the Flare, which calls the
    // airstrike) uses the dedicated SecondaryFire hand-raise sequence
    // from artmd.ini (e.g. "SecondaryFire=401,1,1") instead of the
    // generic primary FireUp.
    if (
      isFiring &&
      this.gameObject.isFiringSecondary &&
      this.objectArt.sequences.has(SequenceType.SecondaryFire)
    ) {
      return SequenceType.SecondaryFire;
    }
    const seq = findSequenceByFn(
      zone,
      stance,
      isMoving,
      isFiring,
      isPanicked,
      [...this.objectArt.sequences.keys()],
    );
    if (seq !== void 0) return seq;
    console.warn(
      `Couldn't find a sequence for infantry "${this.gameObject.name}" ` +
        `(moving=${isMoving}, firing=${isFiring})`,
    );
  }

  /**
   * 应用序列参数并启动动画。
   * @param type - 序列类型
   * @param now - 时间戳
   * @param loop - 是否无限循环（默认 true）
   */
  setAnimParams(type: any, now: number, loop: boolean = true): void {
    if (!this.animRunner) return;
    const params = this.objectArt.sequences.get(type);
    if (!params) {
      console.warn(
        `Infantry "${this.gameObject.name}" is missing sequence "${SequenceType[type]}"`,
      );
      return;
    }
    this.currentSequenceParams = params;
    const props = this.animRunner.animation.props;
    props.loopCount = loop ? -1 : 1;
    props.loopEnd = params.frameCount - 1;
    if ([SequenceType.Deploy, SequenceType.Undeploy, SequenceType.Paradrop].includes(type)) {
      props.rate = type === SequenceType.Paradrop ? 2 * AnimProps.defaultRate : AnimProps.defaultRate;
    } else {
      props.rate = AnimProps.defaultRate / 2;
    }
    if ([SequenceType.Walk].includes(type)) {
      props.rate /= 1.33;
    }
    if ([SequenceType.Shovel].includes(type)) {
      props.rate = AnimProps.defaultRate / 6;
    }
    this.animRunner.animation.start(now);
  }

  /**
   * 按 facing + 帧偏移更新 SHP。
   * @param facing - 0-7 方向号
   */
  updateShapeFrame(facing: number): void {
    if (this.currentSequenceParams && this.shpRenderable && this.animRunner) {
      const { startFrame, facingMult } = this.currentSequenceParams;
      const frame = startFrame + facingMult * facing + this.animRunner.animation.getCurrentFrame();
      if (frame < this.shpRenderable.frameCount) {
        this.shpRenderable.setFrame(frame);
      }
    }
  }

  /**
   * 方向角 → 0-7 facing。
   * @param direction - 度
   */
  computeFacingNumber(direction: number): number {
    return Math.round((((direction - 45 + 360) % 360) / 360) * 8) % 8;
  }

  /**
   * facing 号 → 方向角。
   * @param facing - 0-7
   */
  directionFromFacingNo(facing: number): number {
    return 45 + (360 * facing) / 8;
  }

  /**
   * 创建 pos 包装与主对象/blob 影子。
   * @param parent - 父 Object3D
   */
  createObjects(parent: any): void {
    if (this.debugFrame.value) {
      const wire = DebugUtils.createWireframe({ width: 0.5, height: 0.5 }, 1);
      wire.translateX(-Coords.getWorldTileSize() / 4);
      wire.translateZ(-Coords.getWorldTileSize() / 4);
      parent.add(wire);
    }
    const wrap = (this.posWrap = new THREE.Object3D());
    wrap.matrixAutoUpdate = false;
    parent.add(wrap);
    const main = this.createMainObject(this.objectArt);
    wrap.add(main);

    // 孪生：((movementZone !== Fly || isVoxel) && stance !== Paradrop) || 挂影子
    if (
      !(
        (this.gameObject.rules.movementZone !== MovementZone.Fly || this.objectArt.isVoxel) &&
        this.gameObject.stance !== StanceType.Paradrop
      )
    ) {
      this.blobShadow = new BlobShadow(this.gameObject, 3, this.useMeshInstancing);
      this.blobShadow.create3DObject();
      this.posWrap.add(this.blobShadow.get3DObject());
    }
  }

  /**
   * 创建主 SHP / 占位，建立 animRunner。
   * @param art - art 规则
   */
  createMainObject(art: any): any {
    let shp: any;
    try {
      shp = this.imageFinder.findByObjectArt(art);
    } catch (err) {
      if (!(err instanceof ImageFinder.MissingImageError)) throw err;
      console.warn(`<${this.gameObject.name}>: ` + err.message);
    }
    if (!shp) {
      this.placeholder = new DebugRenderable(
        { width: 0.25, height: 0.25 },
        this.objectArt.height,
        this.palette,
        { centerFoundation: true },
      );
      this.placeholder.setBatched(this.useSpriteBatching);
      if (this.useSpriteBatching) this.placeholder.setBatchPalettes(this.paletteRemaps);
      this.placeholder.create3DObject();
      return this.placeholder.get3DObject();
    }
    const drawOffset = art.getDrawOffset();
    const renderable = (this.shpRenderable = ShpRenderable.factory(
      shp,
      this.palette,
      this.camera,
      drawOffset,
      art.hasShadow,
    ));
    renderable.setBatched(this.useSpriteBatching);
    if (this.useSpriteBatching) renderable.setBatchPalettes(this.paletteRemaps);
    renderable.create3DObject();
    const obj = renderable.get3DObject();
    // 步兵抬高 15 单位
    MathUtils.translateTowardsCamera(obj, this.camera, 15 * Coords.ISO_WORLD_SCALE);
    obj.updateMatrix();
    const props = new AnimProps(new IniSection("dummy"), shp);
    const animation = new Animation(props, this.gameSpeed);
    this.animRunner = new SimpleRunner();
    this.animRunner.animation = animation;
    return obj;
  }

  /**
   * 切换变装 art 并重建渲染。
   * @param disguise - 变装状态（null 恢复本体）
   */
  setDisguise(disguise: any): void {
    if (this.gameObject.isDestroyed || this.gameObject.isCrashing) return;
    this.objectArt = disguise?.objectArt ?? this.gameObject.art;
    this.updateShpRenderableFromArt(this.objectArt);
    this.disguiseChanged = true;
    this.disguise = disguise;
  }

  /**
   * 换 art 后重建 SHP。
   * @param art - 新 art
   */
  updateShpRenderableFromArt(art: any): void {
    const old = (this.shpRenderable ?? this.placeholder)?.get3DObject();
    if (old) {
      this.posWrap.remove(old);
      (this.shpRenderable ?? this.placeholder)?.dispose();
    }
    this.posWrap.add(this.createMainObject(art));
  }

  /**
   * 创建回调：记 manager、播环境音。
   * @param manager - 渲染管理器
   */
  onCreate(manager: any): void {
    this.renderableManager = manager;
    this.plugins.forEach((p) => p.onCreate(manager));
    if (this.gameObject.rules.ambientSound) {
      this.ambientSound = this.worldSound?.playEffect(
        this.gameObject.rules.ambientSound,
        this.gameObject,
      );
    }
  }

  /**
   * 移除：播死亡序列或死亡动画，返回完成 Promise。
   * @param manager - 渲染管理器
   */
  onRemove(manager: any): Promise<void> | undefined {
    this.renderableManager = void 0;
    this.plugins.forEach((p) => p.onRemove(manager));
    this.ambientSound?.stop();
    if (
      this.gameObject.isDestroyed &&
      this.gameObject.deathType !== DeathType.Temporal &&
      this.gameObject.deathType !== DeathType.Crush &&
      this.gameObject.stance !== StanceType.Paradrop
    ) {
      const sequences = getDeathSequence(this.gameObject, this.gameObject.infDeathType);
      if (sequences) {
        if (sequences.length > 1) {
          const pick = sequences[getRandomInt(0, sequences.length - 1)];
          this.sequenceQueue = [pick];
        } else {
          this.sequenceQueue = [sequences[0]];
        }
        if (this.disguise) {
          this.objectArt = this.gameObject.art;
          this.updateShpRenderableFromArt(this.gameObject.art);
        }
      } else {
        if (!this.gameObject.rules.isHuman) return;
        const deathAnimName = getDeathAnim(this.rules, this.gameObject.infDeathType);
        if (!deathAnimName) return;
        const animation = this.art.getAnimation(deathAnimName);
        this.deathAnimRenderable = manager.createAnim(deathAnimName, void 0, true);
        // GENDEATH (InfantryMutate) uses unit palette (unitsno/unittem/uniturb)
        // rather than the default animation palette (anim.pal). Override the death
        // anim's palette with the unit palette remapped to the CASTER's player color
        // (recorded by GeneticMutatorEffect as _mutateCasterColor) so the transform
        // anim shows who launched the Genetic Mutator, matching vanilla YR behaviour.
        if (this.gameObject.infDeathType === 9) {
          this.deathAnimRenderable.palette = this.palette
            .clone()
            .remap(this.gameObject._mutateCasterColor ?? this.gameObject.owner.color);
        }
        this.deathAnimRenderable.create3DObject();
        this.create3DObject();
        this.posWrap.add(this.deathAnimRenderable.get3DObject());
        if (animation.isFlamingGuy) {
          const artSection = animation.art.clone();
          artSection.set("Shadow", "yes");
          artSection.set("LoopCount", "0");
          artSection.set("Start", String(8 * animation.runningFrames));
          const props = this.deathAnimRenderable.getAnimProps();
          props.setArt(artSection);
        }
      }
      this.renderableManager = manager;
      return new Promise((resolve) => {
        this.deathPromiseResolve = () => {
          // signal Genetic Mutator effect that this infantry's
          // GENDEATH death animation (infDeathType=Mutate) has finished.
          if (this.gameObject && this.gameObject.infDeathType === 9) {
            this.gameObject._genDeathAnimDone = true;
            // Fire immediate callback so the Brute spawns on the same frame
            // the animation finishes, avoiding a visible gap.
            try {
              this.gameObject._cbOnGenDeathDone?.();
            } catch {
              /* 孪生吞掉 */
            }
          }
          this.renderableManager = void 0;
          resolve();
        };
      });
    }
  }

  /** 释放全部资源。 */
  dispose(): void {
    this.plugins.forEach((p) => p.dispose());
    this.pipOverlay?.dispose();
    this.shpRenderable?.dispose();
    this.placeholder?.dispose();
    this.deathAnimRenderable?.dispose();
    this.deadBodyAnimRenderable?.dispose();
    this.paradropAnim?.dispose();
    this.blobShadow?.dispose();
  }
}
