/**
 * Vehicle — 车辆渲染件（VXL/SHP + 炮塔 + 摇晃 + 潜水 + 沉船）。
 *
 * update：无敌闪光/FS 蓝光、狂暴盘、下潜半透明、重力坡度混合、
 * 体素世界固定光向、SHP 序列帧、rocking/squidGrab、沉船 3s 动画后
 * resolveObjectRemove。onRemove 对 sinker 返回 Promise。
 *
 * 由 engine/renderable/entity/Vehicle.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as clip from "liang-barsky"; // 孪生
import { ROCKING_TICKS } from "game/gameobject/Vehicle"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import * as DebugUtilsModule from "engine/gfx/DebugUtils"; // 孪生
import * as ShpRenderableModule from "engine/renderable/ShpRenderable"; // 孪生
import { ImageFinder } from "engine/ImageFinder"; // 已转换
import { MapSpriteTranslation } from "engine/renderable/MapSpriteTranslation"; // 已转换
import { Animation, AnimationState } from "engine/Animation"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { IniSection } from "data/IniSection"; // 已转换
import { SimpleRunner } from "engine/animation/SimpleRunner"; // 已转换
import { getRandomInt } from "util/math"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { HighlightAnimRunner } from "engine/renderable/entity/HighlightAnimRunner"; // 已转换
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 已转换
import { HarvesterTrait, HarvesterStatus } from "game/gameobject/trait/HarvesterTrait"; // 已转换
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import { FacingUtil } from "game/gameobject/unit/FacingUtil"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { InvulnerableAnimRunner } from "engine/renderable/entity/InvulnerableAnimRunner"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { BoxIntersectObject3D } from "engine/renderable/entity/BoxIntersectObject3D"; // 已转换
import * as RotorHelperModule from "engine/renderable/entity/unit/RotorHelper"; // 孪生
import * as ExtraLightHelperModule from "engine/renderable/entity/unit/ExtraLightHelper"; // 孪生
import * as DebugRenderableModule from "engine/renderable/DebugRenderable"; // 孪生
import { MathUtils } from "engine/gfx/MathUtils"; // 已转换
import * as VxlShadowProxyModule from "engine/renderable/entity/unit/VxlShadowProxy"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const DebugUtils: any = (DebugUtilsModule as any).DebugUtils;
const ShpRenderable: any = (ShpRenderableModule as any).ShpRenderable;
const RotorHelper: any = (RotorHelperModule as any).RotorHelper;
const ExtraLightHelper: any = (ExtraLightHelperModule as any).ExtraLightHelper;
const DebugRenderable: any = (DebugRenderableModule as any).DebugRenderable;
const VxlShadowProxy: any = (VxlShadowProxyModule as any).VxlShadowProxy;
const clipFn: any = (clip as any).clip ?? (clip as any).default ?? clip;

/** 摇晃半周期系数 π/4。 */
const ROCK_PHASE = Math.PI / 4;

/** 章鱼吸附动画阶段（孪生枚举）。 */
export enum SquidGrabPhase {
  Grab = 0,
  Shake1 = 1,
  Shake2 = 2,
}

/** 重力坡度混合状态。 */
interface TiltBlend {
  startPitch: number;
  startYaw: number;
  targetPitch: number;
  targetYaw: number;
  progress: number;
  velocity: number;
  pitch: number;
  yaw: number;
}

/**
 * 车辆渲染件。
 * 支持 VXL 车体/炮塔/炮管、SHP 序列、沉船与章鱼吸附。
 */
export class Vehicle {
  gameObject: any;
  rules: any;
  imageFinder: any;
  voxels: any;
  voxelAnims: any;
  palette: any;
  camera: any;
  lighting: any;
  debugFrame: any;
  gameSpeed: any;
  selectionModel: any;
  vxlBuilderFactory: any;
  useSpriteBatching: any;
  pipOverlay: any;
  worldSound: any;
  rotorSpeeds: any[] = [];
  /** 旋翼 section 列表（init 时由 objectArt.rotors 构建）。 */
  rotors: any[] | undefined;
  /**
   * gravity-style tilt transition state. _curTilt drives an
   * accelerating (ease-in) progress from rest toward the ramp tilt, like a
   * tank settling onto a slope. tiltGravityTicks = blend time in game ticks
   * (a unit crosses one tile in ~10 ticks at Speed 6, so keep this well under
   * that or fast units never settle); set to 0 to restore the old instant snap.
   */
  _curTilt: TiltBlend | null = null;
  tiltGravityTicks = 5;
  vxlBuilders: any[] = [];
  // 炮塔/炮管 VXL：光向须按 turretFacing 抵消自转（TurretSpins 如飞碟），
  // 否则光只抵消车身朝向，明暗会跟着炮塔转。
  turretVxlBuilders: any[] = [];
  highlightAnimRunner: any;
  invulnAnimRunner: any;
  // invulnerable visual state tracking (version counter, flash, FS).
  _invulnFlashTimer: number | undefined;
  _lastInvulnV: number = 0;
  _lastFSActive: boolean = false;
  _fsEndFlashEndTimer: number = 0;
  lastInvulnerable: boolean = false;
  plugins: any[] = [];
  objectRules: any;
  objectArt: any;
  label: string;
  paletteRemaps: any[] = [];
  __berserkPalette: any;
  __wasBerserk: boolean | undefined;
  lastOwnerColor: any;
  baseShpExtraLight: any;
  baseVxlExtraLight: any;
  vxlExtraLight: any;
  shpExtraLight: any;
  withPosition: any;

  target: any;
  posObj: any;
  tiltObj: any;
  dirWrapObj: any;
  rockingTiltObj: any;
  mainObj: any;
  bodyVxlBuilder: any;
  mainVxl: any;
  noSpawnAltVxl: any;
  harvesterAltVxl: any;
  turret: any;
  barrel: any;
  allTurrets: any[];
  shpRenderable: any;
  shpAnimRunner: any;
  chargeTurretRunner: any;
  placeholder: any;
  shadowProxy: any;
  ambientSound: any;
  sinkWakeAnims: any[] = [];
  squidGrabAnim: any;
  resolveObjectRemove: (() => void) | undefined;
  renderableManager: any;

  lastVeteranLevel: any;
  lastElevation: any;
  lastWarpedOut: any;
  lastCloaked: any;
  lastSubmerged: any;
  lastInvulnerable2: any;
  lastMoving: any;
  lastFiring: any;
  lastDirection: any;
  lastDirectionDelta: number | undefined;
  lastTilt: { pitch: number; yaw: number } | undefined;
  lastTurretFacing: any;
  lastRockingFacing: any;
  lastSquidGrabbed: any;
  lastCurrentTurretIdx: any;
  currentTurretIdx: any;
  lastRockingFacing2: any;
  _lastVoxelLight: any;
  _lastTurretLight: any;
  _airShadowOn: boolean | undefined;
  destroyStartTime: number | undefined;
  rockingStartTime: number | undefined;
  rockingFactor: any;
  rockingPoint: any;
  rockingAxis: any;
  appResult: number | undefined;

  constructor(
    gameObject: any,
    rules: any,
    imageFinder: any,
    voxels: any,
    voxelAnims: any,
    palette: any,
    camera: any,
    lighting: any,
    debugFrame: any,
    gameSpeed: any,
    selectionModel: any,
    vxlBuilderFactory: any,
    useSpriteBatching: any,
    pipOverlay: any,
    worldSound: any,
  ) {
    this.gameObject = gameObject;
    this.rules = rules;
    this.imageFinder = imageFinder;
    this.voxels = voxels;
    this.voxelAnims = voxelAnims;
    this.palette = palette;
    this.camera = camera;
    this.lighting = lighting;
    this.debugFrame = debugFrame;
    this.gameSpeed = gameSpeed;
    this.selectionModel = selectionModel;
    this.vxlBuilderFactory = vxlBuilderFactory;
    this.useSpriteBatching = useSpriteBatching;
    this.pipOverlay = pipOverlay;
    this.worldSound = worldSound;
    this.rotorSpeeds = [];
    this.allTurrets = [];
    this.highlightAnimRunner = new HighlightAnimRunner(this.gameSpeed);
    this.invulnAnimRunner = new InvulnerableAnimRunner(this.gameSpeed);
    this.lastInvulnerable = false;
    this.plugins = [];
    this.objectRules = gameObject.rules;
    this.objectArt = gameObject.art;
    this.label = "vehicle_" + this.objectRules.name;
    this.paletteRemaps = [...this.rules.colors.values()].map((c) => this.palette.clone().remap(c));
    this.palette.remap(this.gameObject.owner.color);
    // pre-add full red-tinted berserk palette (all 256 colors,
    // not just player-color remap range) so VXL batched builders can find it.
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
    this.lastOwnerColor = this.gameObject.owner.color;
    this.updateBaseLight();
    this.vxlExtraLight = new THREE.Vector3().copy(this.baseVxlExtraLight);
    this.shpExtraLight = new THREE.Vector3().copy(this.baseShpExtraLight);
    this.withPosition = new WithPosition();
  }

  updateBaseLight(): void {
    this.baseShpExtraLight = this.lighting
      .compute(this.objectArt.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
      .addScalar(-1)
      .addScalar(this.rules.audioVisual.extraUnitLight);
    this.baseVxlExtraLight = new THREE.Vector3().addScalar(
      this.lighting.computeNoAmbient(
        this.objectArt.lightingType,
        this.gameObject.tile,
        this.gameObject.tileElevation,
      ) + this.rules.audioVisual.extraUnitLight,
    );
  }

  registerPlugin(plugin: any): void {
    this.plugins.push(plugin);
  }

  updateLighting(): void {
    this.plugins.forEach((p) => p.updateLighting?.());
    this.updateBaseLight();
    this.vxlExtraLight.copy(this.baseVxlExtraLight);
    this.shpExtraLight.copy(this.baseShpExtraLight);
  }

  get3DObject(): any {
    return this.target;
  }

  create3DObject(): void {
    let obj = this.get3DObject();
    if (!obj) {
      obj = new BoxIntersectObject3D(
        new THREE.Vector3(1, 1 / 3, 1).multiplyScalar(Coords.LEPTONS_PER_TILE),
      );
      obj.name = this.label;
      obj.userData.id = this.gameObject.id;
      this.target = obj;
      obj.matrixAutoUpdate = false;
      this.withPosition.matrixUpdate = true;
      this.withPosition.applyTo(this);
      this.createObjects(obj);
      this.vxlBuilders.forEach((b) => b.setExtraLight(this.vxlExtraLight));
      this.shpRenderable?.setExtraLight(this.shpExtraLight);
      if (this.pipOverlay) {
        this.pipOverlay.create3DObject();
        this.posObj?.add(this.pipOverlay.get3DObject());
      }
    }
  }

  /**
   * 海军/潜水裁剪面。
   * @param elevation - 高度
   * @param force - 强制
   */
  updateClippingPlanes(elevation: number, force: boolean = false): void {
    if (force || (this.objectRules.naval && !this.objectRules.underwater)) {
      const planeY = Coords.tileHeightToWorld(elevation);
      const planes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY)];
      this.vxlBuilders.forEach((b) => b.setClippingPlanes(planes));
    }
  }

  getIntersectTarget(): any {
    return this.target;
  }

  getUiName(): any {
    const override = this.plugins.reduce((acc, p) => p.getUiNameOverride?.() ?? acc, void 0);
    return override !== void 0 ? override : this.gameObject.getUiName();
  }

  setPosition(pos: any): void {
    this.withPosition.setPosition(pos.x, pos.y, pos.z);
  }

  getPosition(): any {
    return this.withPosition.getPosition();
  }

  highlight(): void {
    if (this.plugins.some((p) => p.shouldDisableHighlight?.())) return;
    if (this.highlightAnimRunner.animation.getState() !== AnimationState.RUNNING) {
      this.highlightAnimRunner.animate(2);
    }
  }

  /**
   * 主更新。
   * @param now - 时间戳
   * @param dt - 位移/旋转步长
   */
  update(now: number, dt: number = 0): void {
    this.plugins.forEach((p) => p.update(now));
    this.pipOverlay?.update(now);

    if (this.gameObject.veteranLevel !== this.lastVeteranLevel) {
      if (this.gameObject.veteranLevel === VeteranLevel.Elite && this.lastVeteranLevel !== void 0) {
        this.highlightAnimRunner.animate(30);
      }
      this.lastVeteranLevel = this.gameObject.veteranLevel;
    }

    const elev = this.gameObject.tile.z + this.gameObject.tileElevation;
    const elevChanged = this.lastElevation === void 0 || this.lastElevation !== elev;
    if (elevChanged) {
      this.lastElevation = elev;
      this.updateBaseLight();
      this.updateClippingPlanes(this.gameObject.tile.z);
    }

    const invuln = this.gameObject.invulnerableTrait.isActive();
    const invulnChanged = invuln !== this.lastInvulnerable;
    // version counter for invulnerability re-application detection.
    if (this._invulnFlashTimer === void 0) {
      this._invulnFlashTimer = (this as any)._invulnFlashPlayed = 0;
    }
    const vNow = this.gameObject.invulnerableTrait._version;
    if (this._lastInvulnV === void 0) this._lastInvulnV = vNow;
    if (vNow !== this._lastInvulnV && invuln) {
      this._invulnFlashTimer = 180;
      this._fsEndFlashEndTimer = 0;
    }
    this._lastInvulnV = vNow;
    // FS end flash detection.
    const fsNow = this.gameObject.invulnerableTrait.isForceShieldActive();
    if (this._lastFSActive === void 0) this._lastFSActive = fsNow;
    if (!fsNow && this._lastFSActive) {
      if (!this._fsEndFlashEndTimer) this._fsEndFlashEndTimer = 180;
    }
    this._lastFSActive = fsNow;
    // generic end flash when invulnerability expires.
    if (invulnChanged && !invuln) {
      if (!this._fsEndFlashEndTimer) this._fsEndFlashEndTimer = 180;
    }
    this.lastInvulnerable = invuln;

    const doHighlight = this.highlightAnimRunner.shouldUpdate();
    if (doHighlight) this.highlightAnimRunner.tick(now);
    if (invuln && invulnChanged) this.invulnAnimRunner.animate();
    if (this.invulnAnimRunner.shouldUpdate()) this.invulnAnimRunner.tick(now);

    const warped = this.gameObject.warpedOutTrait.isActive();
    const warpedChanged = warped !== this.lastWarpedOut;
    this.lastWarpedOut = warped;
    const cloaked = this.gameObject.cloakableTrait?.isCloaked();
    const cloakChanged = cloaked !== this.lastCloaked;
    this.lastCloaked = cloaked;

    const submergeTrait = this.gameObject.submergibleTrait;
    const submergeProgress = submergeTrait ? submergeTrait.getSurfaceProgress() : 0;
    const submerged = submergeProgress > 0.5;
    const submergeChanged = submerged !== this.lastSubmerged;
    this.lastSubmerged = submerged;
    if (warpedChanged || cloakChanged || submergeChanged || submergeTrait) {
      const opacity = warped || cloaked ? 0.5 : 1 - 0.5 * submergeProgress;
      this.shpRenderable?.setOpacity(opacity);
      this.shpRenderable?.setFlat(submerged);
      this.vxlBuilders.forEach((b) => {
        b.setOpacity(opacity);
        b.setShadow(!submerged && !this._airShadowOn);
      });
      this.placeholder?.setOpacity(opacity);
      if (this.posObj) {
        this.posObj.position.y = -8 * Coords.ISO_WORLD_SCALE * submergeProgress;
        this.posObj.updateMatrix();
      }
    }

    // fix invulnerable visual — reset base FIRST, then apply effects on top.
    // 1. Reset to base (or paralysis dark) as starting point (was overwriting invuln after apply).
    if (this.gameObject.robotControlTrait?.isParalyzed()) {
      this.vxlExtraLight.set(-0.35, -0.35, -0.35);
      this.shpExtraLight.set(-0.35, -0.35, -0.35);
    } else {
      this.vxlExtraLight.copy(this.baseVxlExtraLight);
      this.shpExtraLight.copy(this.baseShpExtraLight);
    }
    // 2. Apply invulnerable/highlight effects on top with flash & FS tint.
    (() => {
      const endF = this._fsEndFlashEndTimer | 0;
      if (endF > 0) {
        this._fsEndFlashEndTimer = endF - 1;
        const bright = new THREE.Vector3(2, 2, 2);
        const t = 1 - Math.pow(this._fsEndFlashEndTimer / 180, 2);
        this.vxlExtraLight.lerpVectors(bright, this.baseVxlExtraLight, t);
        this.shpExtraLight.lerpVectors(bright, this.baseShpExtraLight, t);
      } else if (this._invulnFlashTimer > 0) {
        this._invulnFlashTimer--;
        const iv = invuln ? this.invulnAnimRunner.getValue() : 0;
        const amb = this.lighting.getAmbientIntensity();
        const tv = this.baseVxlExtraLight.clone();
        const ts = this.baseShpExtraLight.clone();
        ExtraLightHelper.multiplyVxl(tv, this.baseVxlExtraLight, amb, iv);
        ExtraLightHelper.multiplyShp(ts, this.baseShpExtraLight, iv);
        if (this.gameObject.invulnerableTrait.isForceShieldActive()) {
          tv.lerp(new THREE.Vector3(0, 0, 255), 0.2);
          ts.lerp(new THREE.Vector3(0, 0, 255), 0.2);
        }
        const flash = new THREE.Vector3(2, 2, 2);
        const lerpT = 1 - Math.pow(this._invulnFlashTimer / 180, 2);
        this.vxlExtraLight.lerpVectors(flash, tv, lerpT);
        this.shpExtraLight.lerpVectors(flash, ts, lerpT);
      } else {
        const boost =
          (doHighlight ? this.highlightAnimRunner.getValue() : 0) ||
          (invuln ? this.invulnAnimRunner.getValue() : 0);
        if (boost) {
          const amb = this.lighting.getAmbientIntensity();
          ExtraLightHelper.multiplyVxl(this.vxlExtraLight, this.baseVxlExtraLight, amb, boost);
          ExtraLightHelper.multiplyShp(this.shpExtraLight, this.baseShpExtraLight, boost);
          if (this.gameObject.invulnerableTrait.isForceShieldActive()) {
            this.vxlExtraLight.lerp(new THREE.Vector3(0, 0, 255), 0.2);
            this.shpExtraLight.lerp(new THREE.Vector3(0, 0, 255), 0.2);
          }
        }
      }
    })();
    // berserk palette switch — use full red-tinted palette.
    (() => {
      const isBerserk = !!this.gameObject.berserkTrait?.isBerserk();
      if (isBerserk !== this.__wasBerserk) {
        this.__wasBerserk = isBerserk;
        const pal = isBerserk ? this.__berserkPalette : this.palette;
        this.vxlBuilders.forEach((b) => b.setPalette(pal));
        this.shpRenderable?.setPalette(pal);
        this.placeholder?.setPalette(pal);
      }
    })();

    if (this.gameObject.isDestroyed && this.resolveObjectRemove) {
      if (this.squidGrabAnim) {
        this.posObj?.remove(this.squidGrabAnim.get3DObject());
        this.squidGrabAnim.dispose();
        this.squidGrabAnim = void 0;
      }
      if (!this.destroyStartTime) this.destroyStartTime = now;
      if (this.isSinker()) {
        const progress = (now - this.destroyStartTime) / 3000;
        const sunk = progress >= 1;
        if (sunk) {
          this.mainObj.visible = false;
        } else {
          if (this.objectRules.naval) {
            this.mainObj.rotation.x = (Math.PI / 4) * progress;
          }
          this.mainObj.position.y = -16 * Coords.ISO_WORLD_SCALE * progress;
          this.mainObj.position.z = 8 * Coords.ISO_WORLD_SCALE * progress;
          this.mainObj.updateMatrix();
        }
        let wakesDone = false;
        this.sinkWakeAnims.forEach((a) => a.update(now));
        if (!this.sinkWakeAnims.filter((a) => !a.isAnimFinished()).length) {
          this.sinkWakeAnims.forEach((a) => this.get3DObject().remove(a.get3DObject()));
          this.sinkWakeAnims.length = 0;
          wakesDone = true;
        }
        if (sunk && wakesDone) this.resolveObjectRemove();
      }
    } else if (!this.gameObject.warpedOutTrait.isActive()) {
      let direction =
        (Math.floor(this.gameObject.direction + this.gameObject.spinVelocity * dt) + 360) % 360;
      const dirChanged = direction !== this.lastDirection;
      if (
        dirChanged &&
        this.lastDirection !== void 0 &&
        this.objectArt.isVoxel &&
        this.gameObject.zone === ZoneType.Air
      ) {
        const delta = direction - this.lastDirection;
        if (
          this.lastDirectionDelta !== void 0 &&
          Math.abs(delta) < 2 &&
          Math.abs(this.lastDirectionDelta) < 2 &&
          Math.sign(delta) !== Math.sign(this.lastDirectionDelta)
        ) {
          direction = this.lastDirection;
        } else {
          this.lastDirectionDelta = delta;
        }
      }
      this.lastDirection = direction;

      // vera20k 体素光=世界固定太阳：模型按 facing(度) 连续旋转，光反向 Rz(-facing)·(-1,0,0) 抵消。
      // 车身用 body 朝向 e；炮塔/炮管在 dirWrap 下还有相对炮塔角，须用 turretFacing 抵消完整世界旋转，
      // 否则 TurretSpins（飞碟）自转时明暗跟着炮塔转。
      const vxlRad = (direction * Math.PI) / 180;
      const vxlLd = new THREE.Vector3(-Math.cos(vxlRad), Math.sin(vxlRad), 0);
      if (!this._lastVoxelLight || this._lastVoxelLight.distanceToSquared(vxlLd) > 1e-8) {
        (this._lastVoxelLight ??= new THREE.Vector3()).copy(vxlLd);
        this.vxlBuilders.forEach((b) => {
          // 炮塔构建器在下方按 turretFacing 单独设，这里只更新车身
          if (this.turretVxlBuilders && this.turretVxlBuilders.indexOf(b) >= 0) return;
          b.setVxlLightDir(vxlLd);
        });
      }
      if (this.gameObject.turretTrait && this.turretVxlBuilders?.length) {
        const tF = ((Math.floor(this.gameObject.turretTrait.facing) % 360) + 360) % 360;
        const tRad = (tF * Math.PI) / 180;
        const tLd = new THREE.Vector3(-Math.cos(tRad), Math.sin(tRad), 0);
        if (!this._lastTurretLight || this._lastTurretLight.distanceToSquared(tLd) > 1e-8) {
          (this._lastTurretLight ??= new THREE.Vector3()).copy(tLd);
          this.turretVxlBuilders.forEach((b) => b.setVxlLightDir(tLd));
        }
      }

      const ownerColor = this.gameObject.owner.color;
      if (this.lastOwnerColor !== ownerColor) {
        this.palette.remap(ownerColor);
        this.lastOwnerColor = ownerColor;
        this.vxlBuilders.forEach((b) => b.setPalette(this.palette));
        this.shpRenderable?.setPalette(this.palette);
        this.placeholder?.setPalette(this.palette);
      }

      const moving =
        this.gameObject.isMoving ||
        (!this.objectArt.isVoxel && !!this.gameObject.spinVelocity);
      const firing = this.gameObject.isFiring;
      const movingChanged = this.lastMoving === void 0 || this.lastMoving !== moving;
      const firingChanged = this.lastFiring === void 0 || this.lastFiring !== firing;

      if (dt > 0 && (moving || movingChanged)) {
        const step = this.gameObject.moveTrait.velocity.clone().multiplyScalar(dt);
        const next = step.add(this.gameObject.position.worldPosition);
        this.setPosition(next);
      }
      if (movingChanged || firingChanged) {
        this.lastMoving = moving;
        this.lastFiring = firing;
        if (!this.objectArt.isVoxel) this.updateShapeAnimation(moving, firing);
      }

      let turretIdxChanged: boolean;
      if (this.gameObject.rules.isChargeTurret) {
        if (firingChanged && firing) {
          this.chargeTurretRunner = new SimpleRunner();
          const props = new AnimProps(
            new IniSection("dummy"),
            this.gameObject.rules.turretCount,
          );
          props.reverse = true;
          props.rate = 5;
          const anim = new Animation(props, this.gameSpeed);
          this.chargeTurretRunner.animation = anim;
        }
        this.chargeTurretRunner?.tick(now);
        const frame = this.chargeTurretRunner?.getCurrentFrame() ?? 0;
        turretIdxChanged = frame !== this.currentTurretIdx;
        this.currentTurretIdx = frame;
        if (this.chargeTurretRunner?.animation.getState() === AnimationState.STOPPED) {
          this.chargeTurretRunner = void 0;
        }
      } else {
        turretIdxChanged = this.gameObject.turretNo !== this.currentTurretIdx;
        this.currentTurretIdx = this.gameObject.turretNo;
      }

      if (this.objectArt.isVoxel) {
        this.updateVxlRotation(direction, dirChanged, dt);
        this.updateBodyVxl();
        const rockingFacing = this.gameObject.rocking?.facing;
        const rockingFacingChanged = rockingFacing !== this.lastRockingFacing;
        this.lastRockingFacing = rockingFacing;
        if (rockingFacingChanged && rockingFacing !== void 0) {
          const factor = this.gameObject.rocking.factor;
          if (factor > 0) this.startRocking(rockingFacing, factor, now);
        }
        const squidGrabbed = !!(
          !this.gameObject.parasiteableTrait?.isInfested() ||
          !this.gameObject.parasiteableTrait.getParasite()?.rules.organic
        );
        const grabChanged = squidGrabbed !== this.lastSquidGrabbed;
        this.lastSquidGrabbed = squidGrabbed;
        this.updateRocking(now, squidGrabbed);
        if (this.gameObject.turretTrait && this.objectRules.turretCount > 1 && turretIdxChanged) {
          this.updateActiveTurret(this.currentTurretIdx);
        }
        // 孪生参数：updateSquidGrab(i, b, f, p, e, T, v)
        // i=grabChanged, b=grab, f=grabChanged(实际孪生 f 为 grabChanged 后的变量)、
        // p=dirChanged, e=direction, T=firingChanged, v=rockingFacingChanged
        this.updateSquidGrab(
          now,
          squidGrabbed,
          grabChanged,
          dirChanged,
          direction,
          firingChanged,
          rockingFacingChanged,
        );
      } else if (this.shpAnimRunner) {
        this.shpAnimRunner.tick(now);
        this.updateShapeFrame(direction, moving, firing);
      }

      // Re-apply extraLight to VXL/SHP every frame — the values
      // are updated by highlight, invulnerable, and paralysis darkening code
      // in the comma expression above, but setExtraLight is only called once
      // during create3DObject(). Without this, extraLight changes (darkening
      // on Robot Tank paralysis) would have no visible effect.
      this.vxlBuilders.forEach((b) => b.setExtraLight(this.vxlExtraLight));
      this.shpRenderable?.setExtraLight(this.shpExtraLight);
      this.updateShadowProxy();
    }
  }

  // 只有真正升空的单位才走影子副本 —— 在地面时保持主体的实时投影，
  // 避免起降瞬间出现"两个影子"。潜水（submerged）时主体本来就不投影。
  /** 切换影子代理。 */
  updateShadowProxy(): void {
    if (!this.shadowProxy) return;
    const airborne = this.gameObject.zone === ZoneType.Air;
    if (airborne !== this._airShadowOn) {
      this._airShadowOn = airborne;
      this.shadowProxy.setEnabled(airborne);
      this.vxlBuilders.forEach((b) => b.setShadow(!airborne && !this.lastSubmerged));
    }
    if (airborne) this.shadowProxy.update();
  }

  /**
   * 坡度重力混合 + 炮塔/旋翼。
   * @param direction - 车身朝向
   * @param dirChanged - 方向是否变化
   * @param dt - 步长
   */
  updateVxlRotation(direction: number, dirChanged: boolean, dt: number): void {
    const tilter = this.gameObject.tilterTrait?.tilt ?? { yaw: 0, pitch: 0 };
    const crashPitch = this.gameObject.crashPitch ?? 0;
    // crush-tilt (vanilla YR TiltsWhenCrushes). Degrees; POSITIVE =
    // nose up on mainObj's local X axis (in-engine verified; the VXL local
    // axis is inverted vs. yrmd's -0.1 rad). Applied on mainObj's LOCAL axis
    // so the nose pitches up no matter which way the unit is facing.
    const crushTilt = this.gameObject.crushTilt ?? 0;
    // the blend tracks the RAMP tilt only. crashPitch is rewritten
    // every tick while crashing (JumpjetLocomotor.tickCrash), so including it
    // in the target would restart the blend every frame and it would never
    // complete. It is added back after the blend instead, like crushTilt.
    const targetPitch = tilter.pitch;
    const targetYaw = tilter.yaw;

    // gravity-style tilt transition. When the ramp tilt changes the
    // tilt starts from rest and ACCELERATES toward the new target (ease-in),
    // then stops firmly on arrival — the feel of a tank settling onto a slope
    // instead of the old instant snap. Acceleration is derived so the blend
    // completes in tiltGravityTicks; tiltGravityTicks = 0 disables it.
    let tiltCur = this._curTilt;
    if (!tiltCur) {
      tiltCur = this._curTilt = {
        startPitch: targetPitch,
        startYaw: targetYaw,
        targetPitch: targetPitch,
        targetYaw: targetYaw,
        progress: 1,
        velocity: 0,
        pitch: targetPitch,
        yaw: targetYaw,
      };
    }
    const tiltRestart = tiltCur.targetPitch !== targetPitch || tiltCur.targetYaw !== targetYaw;
    if (tiltRestart) {
      tiltCur.startPitch = tiltCur.pitch;
      tiltCur.startYaw = tiltCur.yaw;
      tiltCur.targetPitch = targetPitch;
      tiltCur.targetYaw = targetYaw;
      tiltCur.progress = 0;
      // velocity is deliberately NOT reset here: a unit crossing tiles faster
      // than the blend time would otherwise restart from rest every tile and
      // never catch up (visible as a jitter that never reaches the ramp tilt).
    }
    const tiltDt = Math.max(0, dt ?? 0);
    if (this.tiltGravityTicks > 0 && tiltCur.progress < 1 && tiltDt > 0) {
      const accel = 2 / (this.tiltGravityTicks * this.tiltGravityTicks);
      tiltCur.velocity += accel * tiltDt; // cumulative gravity pull
      tiltCur.progress += tiltCur.velocity * tiltDt;
      if (tiltCur.progress >= 1) {
        tiltCur.progress = 1; // firm landing: stop
        tiltCur.velocity = 0; // and rest, so the next ramp starts from zero
      }
      // shortest arc
      const yawDelta =
        ((((tiltCur.targetYaw - tiltCur.startYaw + 180) % 360) + 360) % 360) - 180;
      tiltCur.pitch =
        tiltCur.startPitch + (tiltCur.targetPitch - tiltCur.startPitch) * tiltCur.progress;
      tiltCur.yaw = tiltCur.startYaw + yawDelta * tiltCur.progress;
    }
    if (this.tiltGravityTicks > 0) {
      if (tiltCur.progress >= 1) {
        tiltCur.pitch = tiltCur.targetPitch;
        tiltCur.yaw = tiltCur.targetYaw;
      }
    } else {
      // tiltGravityTicks = 0 -> no blend at all, snap straight to the ramp tilt.
      // Without this the restart above leaves progress at 0 while both the
      // advance branch and the progress>=1 branch are skipped, freezing the tilt
      // at the previous ramp's value instead of snapping.
      tiltCur.progress = 1;
      tiltCur.velocity = 0;
      tiltCur.pitch = tiltCur.targetPitch;
      tiltCur.yaw = tiltCur.targetYaw;
    }
    const appliedPitch = tiltCur.pitch + crashPitch;
    const appliedYaw = tiltCur.yaw;
    if (
      this.lastTilt &&
      appliedPitch === this.lastTilt.pitch &&
      appliedYaw === this.lastTilt.yaw &&
      !dirChanged
    ) {
      // 无变化
    } else {
      this.lastTilt = { pitch: appliedPitch, yaw: appliedYaw };
      this.tiltObj.rotation.y = THREE.Math.degToRad(appliedYaw);
      this.tiltObj.rotation.x = THREE.Math.degToRad(appliedPitch);
      this.tiltObj.updateMatrix();
      this.dirWrapObj.rotation.y = THREE.Math.degToRad(direction - appliedYaw);
      this.dirWrapObj.updateMatrix();
    }
    if (this.mainObj) {
      this.mainObj.rotation.x = THREE.Math.degToRad(crushTilt);
      this.mainObj.updateMatrix();
    }
    if (this.turret) {
      const turretFacing = Math.floor(this.gameObject.turretTrait.facing);
      const turretChanged = turretFacing !== this.lastTurretFacing;
      this.lastTurretFacing = turretFacing;
      if (turretChanged || dirChanged) {
        const rot = THREE.Math.degToRad(turretFacing - direction);
        this.turret.rotation.y = rot;
        this.turret.updateMatrix();
        if (this.barrel) {
          this.barrel.rotation.y = rot;
          this.barrel.updateMatrix();
        }
      }
    }
    if (this.rotors) {
      this.rotors.forEach((section: any, i: number) => {
        this.rotorSpeeds[i] = RotorHelper.computeRotationStep(
          this.gameObject,
          this.rotorSpeeds[i] ?? 0,
          this.objectArt.rotors[i],
        );
        if (this.rotorSpeeds[i]) {
          section.rotateOnAxis(this.objectArt.rotors[i].axis, this.rotorSpeeds[i]);
          section.updateMatrix();
        }
      });
    }
  }

  /**
   * 开始车身摇晃（Liang-Barsky 找接触点）。
   * @param facing - 朝向
   * @param factor - 幅度系数
   * @param now - 时间戳
   */
  startRocking(facing: number, factor: number, now: number): void {
    if (!this.bodyVxlBuilder) return;
    this.rockingStartTime = now;
    this.rockingFactor = factor;
    const box = this.bodyVxlBuilder.getLocalBoundingBox();
    const rect = new THREE.Box2(
      new THREE.Vector2(box.min.x, box.min.y),
      new THREE.Vector2(box.max.x, box.max.y),
    );
    const angle = THREE.Math.degToRad(FacingUtil.toWorldDeg(facing));
    const size = new THREE.Vector2();
    const dir = new THREE.Vector2(10, 0)
      .rotateAround(new THREE.Vector2(), angle)
      .setLength(rect.getSize(size).length() + 1);
    const point = dir.toArray();
    clipFn([0, 0], point, [rect.min.x, rect.min.y, rect.max.x, rect.max.y]);
    this.rockingPoint = new THREE.Vector3(point[0], 0, point[1]);
    const axis = dir
      .clone()
      .rotateAround(new THREE.Vector2(), -Math.PI / 2)
      .normalize();
    this.rockingAxis = new THREE.Vector3(axis.x, 0, axis.y);
  }

  /**
   * 推进摇晃动画。
   * @param now - 时间戳
   * @param grab - 是否被章鱼抓住（跳过衰减）
   */
  updateRocking(now: number, grab: boolean): void {
    if (!this.rockingStartTime) return;
    const elapsed = now - this.rockingStartTime;
    let factor = this.rockingFactor;
    if (!grab) {
      factor *= 1 - Math.min(1, this.gameObject.rules.weight / 5);
    }
    const progress =
      elapsed || factor
        ? Math.min(
            1,
            ((elapsed /
              ((ROCKING_TICKS / GameSpeed.BASE_TICKS_PER_SECOND) * 1000)) *
              this.gameSpeed.value) /
              factor,
          )
        : 0;
    const tilt = ROCK_PHASE * factor * (1 - Math.pow(2 * (progress - 0.5), 2));
    this.rockingTiltObj.position.set(0, 0, 0);
    this.rockingTiltObj.rotation.set(0, 0, 0);
    this.rockingTiltObj.scale.set(1, 1, 1);
    MathUtils.rotateObjectAboutPoint(
      this.rockingTiltObj,
      this.rockingPoint,
      this.rockingAxis,
      tilt,
    );
    this.rockingTiltObj.updateMatrix();
    if (progress === 1 || factor === 0) {
      this.rockingStartTime = void 0;
    }
  }

  /**
   * 章鱼吸附 SQDG 动画与死亡水花。
   * @param now - 时间戳
   * @param grabbed - 是否抓住
   * @param grabChanged - 抓取状态变化
   * @param dirChanged - 方向变化
   * @param direction - 方向
   * @param firingChanged - 开火变化（孪生第 6 参）
   * @param rockingChanged - 摇晃触发（孪生第 7 参）
   */
  updateSquidGrab(
    now: number,
    grabbed: boolean,
    grabChanged: boolean,
    dirChanged: boolean,
    direction: number,
    firingChanged: boolean,
    rockingChanged: boolean,
  ): void {
    // 孪生参数：e=now, t=grab, i=grabChanged, r=dirChanged, s=direction, a=firingChanged, n=rockingChanged
    if (grabChanged && this.squidGrabAnim) {
      this.posObj?.remove(this.squidGrabAnim.get3DObject());
      this.squidGrabAnim.dispose();
      this.squidGrabAnim = void 0;
    }
    if (grabChanged && grabbed) {
      this.squidGrabAnim = this.renderableManager.createAnim(
        "SQDG",
        (a: any) => {
          a.extraOffset = { x: 0, y: -Coords.ISO_TILE_SIZE / 4 };
          a.setExtraLight(this.shpExtraLight);
        },
        true,
      );
      this.squidGrabAnim.remapColor(
        this.gameObject.parasiteableTrait.getParasite().owner.color,
      );
      this.squidGrabAnim.create3DObject();
      this.posObj?.add(this.squidGrabAnim.get3DObject());
    }
    if (grabbed && (firingChanged || grabChanged) && this.squidGrabAnim) {
      this.updateSquidGrabAnim(this.squidGrabAnim.getAnimProps(), direction, SquidGrabPhase.Grab);
    }
    if (grabbed && rockingChanged && firingChanged && this.squidGrabAnim) {
      const phase = firingChanged && this.rockingFactor && this.rockingFactor > 0
        ? SquidGrabPhase.Shake1
        : SquidGrabPhase.Shake2;
      // 孪生：o = 0 < a ? Shake1 : Shake2，a=firingChanged 的布尔被当作 0/1
      // 但实际 a 是 firingChanged；孪生用 0<a 即 firingChanged
      this.updateSquidGrabAnim(
        this.squidGrabAnim.getAnimProps(),
        direction,
        firingChanged ? SquidGrabPhase.Shake1 : SquidGrabPhase.Shake2,
      );
      this.squidGrabAnim.reset();
    }
    // 孪生：t && n && !a → 死亡水花
    if (grabbed && rockingChanged && !firingChanged) {
      const splash = this.rules.combatDamage.splashList;
      for (let i = 0; i < 3; i++) {
        const name = splash[getRandomInt(0, splash.length - 1)];
        this.renderableManager.createTransientAnim(name, (a: any) => {
          const base = this.withPosition.getPosition().clone();
          const jitter = {
            x:
              getRandomInt(-Coords.ISO_TILE_SIZE / 2, Coords.ISO_TILE_SIZE / 2) *
              Coords.ISO_WORLD_SCALE,
            y:
              getRandomInt(-Coords.ISO_TILE_SIZE / 2, Coords.ISO_TILE_SIZE / 2) *
              Coords.ISO_WORLD_SCALE,
          };
          a.setPosition(base.add(new THREE.Vector3(jitter.x, 0, jitter.y)));
        });
      }
    }
    this.squidGrabAnim?.update(now);
  }

  /**
   * SHP 序列参数（开火/行走/站立）。
   * @param moving - 移动
   * @param firing - 开火
   */
  updateShapeAnimation(moving: boolean, firing: boolean): void {
    if (!this.shpAnimRunner) return;
    const props = this.shpAnimRunner.animation.props;
    if (firing) {
      props.loopEnd = this.objectArt.firingFrames - 1;
      props.rate = AnimProps.defaultRate / 2;
    } else if (moving || this.objectRules.naval) {
      props.loopEnd = this.objectArt.walkFrames - 1;
      const rate =
        this.objectRules.naval && !moving
          ? this.objectRules.idleRate
          : this.objectRules.walkRate;
      props.rate = AnimProps.defaultRate / rate;
    } else {
      props.loopEnd = this.objectArt.standingFrames - 1;
    }
    this.shpAnimRunner.animation.rewind();
  }

  /**
   * SHP 帧号（facings × 序列）。
   * @param direction - 方向
   * @param moving - 移动
   * @param firing - 开火
   */
  updateShapeFrame(direction: number, moving: boolean, firing: boolean): void {
    if (!this.shpRenderable || !this.shpAnimRunner) return;
    const facings = this.objectArt.facings;
    const facing = Math.round((((45 - direction + 360) % 360) / 360) * facings) % facings;
    const frame = this.shpAnimRunner.animation.getCurrentFrame();
    let index: number;
    if (firing) {
      index = this.objectArt.startFiringFrame + this.objectArt.firingFrames * facing + frame;
    } else if (moving || this.objectRules.naval) {
      index = this.objectArt.startWalkFrame + this.objectArt.walkFrames * facing + frame;
    } else {
      index = this.objectArt.startStandFrame + this.objectArt.standingFrames * facing + frame;
    }
    this.shpRenderable.setFrame(index);
  }

  /**
   * SQDG 动画 props 区间。
   * @param props - AnimProps
   * @param direction - 方向
   * @param phase - 阶段
   */
  updateSquidGrabAnim(props: any, direction: number, phase: SquidGrabPhase): void {
    const facing = Math.round((((360 - direction) % 360) / 360) * 8) % 8;
    props.start = 10 * facing + 80 * phase;
    props.end = 10 * facing + 9 + 80 * phase;
    props.loopStart = props.start;
    props.loopEnd = props.end;
    props.loopCount = 0;
    props.rate =
      10 /
      (ROCKING_TICKS / GameSpeed.BASE_TICKS_PER_SECOND / (this.rockingFactor ?? 1));
  }

  /**
   * 构建节点层级与影子代理。
   * @param parent - 父
   */
  createObjects(parent: any): void {
    if (this.debugFrame.value) {
      const wire = DebugUtils.createWireframe({ width: 1, height: 1 }, 1);
      wire.translateX(-Coords.getWorldTileSize() / 2);
      wire.translateZ(-Coords.getWorldTileSize() / 2);
      parent.add(wire);
    }
    const tilt = (this.tiltObj = new THREE.Object3D());
    tilt.matrixAutoUpdate = false;
    tilt.rotation.order = "YXZ";
    const dirWrap = (this.dirWrapObj = new THREE.Object3D());
    dirWrap.matrixAutoUpdate = false;
    const main = (this.mainObj = this.createMainObject());
    const rocking = (this.rockingTiltObj = new THREE.Object3D());
    rocking.matrixAutoUpdate = false;
    rocking.rotation.order = "YXZ";
    rocking.add(main);
    dirWrap.add(rocking);
    tilt.add(dirWrap);
    const pos = (this.posObj = new THREE.Object3D());
    pos.matrixAutoUpdate = false;
    pos.add(tilt);
    parent.add(pos);
    // 空中单位（jumpjet 类，如基洛夫/飞碟）的阴影偏移同样随高度线性放大，
    // 改用限制在低位的不可见影子副本投影，偏移封顶在约 1 格。详见 VxlShadowProxy。
    this.shadowProxy = new VxlShadowProxy(this.gameObject);
    this.shadowProxy.create3DObject(pos, tilt);
  }

  /**
   * 精灵锚点。
   * @param spriteOffset - 偏移
   */
  computeSpriteAnchorOffset(spriteOffset: any): any {
    const draw = this.objectArt.getDrawOffset();
    return { x: spriteOffset.x + draw.x, y: spriteOffset.y + draw.y };
  }

  /** 主体：VXL 车体/炮塔/多形态 或 SHP。 */
  createMainObject(): any {
    const wrap = new THREE.Object3D();
    wrap.matrixAutoUpdate = false;
    if (this.objectArt.isVoxel) {
      const hasHva = !this.objectArt.noHva;
      const baseName = this.objectArt.imageName.toLowerCase();
      const vxlName = baseName + ".vxl";
      const vxl = this.voxels.get(vxlName);
      if (vxl) {
        const hva = hasHva ? this.voxelAnims.get(baseName + ".hva") : void 0;
        const builder = (this.bodyVxlBuilder = this.vxlBuilderFactory.create(
          vxl,
          hva,
          this.paletteRemaps,
          this.palette,
        ));
        this.vxlBuilders.push(builder);
        const mesh = (this.mainVxl = builder.build());
        wrap.add(mesh);
        if (this.objectArt.rotors) {
          this.rotors = this.objectArt.rotors.map((rotor: any) => {
            const section = builder.getSection(rotor.name);
            if (!section) {
              throw new Error(
                `Vehicle "${this.objectRules.name}" VXL section "${rotor.name}" not found`,
              );
            }
            return section;
          });
        }
      } else {
        console.warn(
          `VXL missing for vehicle ${this.objectRules.name}. Vxl file ${vxlName} not found. `,
        );
        wrap.add(this.createPlaceholder());
      }
      // noSpawnAlt（无子机 alt 外观）
      if (this.objectRules.spawns && this.objectRules.noSpawnAlt) {
        const altName = baseName + "wo.vxl";
        const altVxl = this.voxels.get(altName);
        if (altVxl) {
          const hva = hasHva ? this.voxelAnims.get(altName.replace(".vxl", ".hva")) : void 0;
          const builder = this.vxlBuilderFactory.create(altVxl, hva, this.paletteRemaps, this.palette);
          this.vxlBuilders.push(builder);
          const mesh = (this.noSpawnAltVxl = builder.build());
          mesh.visible = false;
          wrap.add(mesh);
        } else {
          console.warn(`<${this.gameObject.name}>: Couldn't find noSpawnAlt image "${altName}"`);
        }
      }
      // 采矿车卸矿形态
      if (this.gameObject.harvesterTrait && this.objectRules.unloadingClass) {
        const unloadName = this.rules.hasObject(this.objectRules.unloadingClass, ObjectType.Vehicle)
          ? this.rules
              .getObject(this.objectRules.unloadingClass, ObjectType.Vehicle)
              .imageName.toLowerCase()
          : void 0;
        const altVxl = unloadName ? this.voxels.get(unloadName + ".vxl") : void 0;
        if (altVxl) {
          const hva = hasHva ? this.voxelAnims.get(unloadName + ".hva") : void 0;
          const builder = this.vxlBuilderFactory.create(altVxl, hva, this.paletteRemaps, this.palette);
          this.vxlBuilders.push(builder);
          const mesh = (this.harvesterAltVxl = builder.build());
          mesh.visible = false;
          wrap.add(mesh);
        } else {
          console.warn(
            `<${this.gameObject.name}>: Couldn't find UnloadingClass image "${unloadName}.vxl"`,
          );
        }
      }
      // 炮塔/炮管
      if (this.gameObject.turretTrait) {
        const turretOffset = this.objectArt.turretOffset;
        let turretParent = wrap;
        if (turretOffset) {
          const node = new THREE.Object3D();
          node.matrixAutoUpdate = false;
          node.position.z = -turretOffset;
          node.updateMatrix();
          wrap.add(node);
          turretParent = node;
        }
        const turretMeshes: any[] = [];
        for (let i = 0; i < this.objectRules.turretCount; ++i) {
          const turName = baseName + `tur${i || ""}.vxl`;
          const turVxl = this.voxels.get(turName);
          if (turVxl) {
            const hva = hasHva ? this.voxelAnims.get(turName.replace(".vxl", ".hva")) : void 0;
            const builder = this.vxlBuilderFactory.create(turVxl, hva, this.paletteRemaps, this.palette);
            this.vxlBuilders.push(builder);
            this.turretVxlBuilders.push(builder);
            const mesh = builder.build();
            mesh.visible = i === this.gameObject.turretNo;
            turretMeshes.push(mesh);
          } else {
            console.warn(`<${this.gameObject.name}>: Missing turret file "${turName}"`);
            turretMeshes.push(void 0);
          }
        }
        this.currentTurretIdx = this.gameObject.turretNo;
        this.allTurrets = turretMeshes;
        let turretNode: any;
        if (turretMeshes.length > 1) {
          turretNode = this.turret = new THREE.Object3D();
          turretNode.matrixAutoUpdate = false;
          turretMeshes.forEach((m) => m && turretNode.add(m));
        } else {
          turretNode = this.turret = turretMeshes[0];
        }
        if (turretNode) turretParent.add(turretNode);

        const barlName = baseName + "barl.vxl";
        const barlVxl = this.voxels.get(barlName);
        if (barlVxl) {
          const hva = hasHva ? this.voxelAnims.get(barlName.replace(".vxl", ".hva")) : void 0;
          const builder = this.vxlBuilderFactory.create(barlVxl, hva, this.paletteRemaps, this.palette);
          this.vxlBuilders.push(builder);
          this.turretVxlBuilders.push(builder);
          const mesh = (this.barrel = builder.build());
          turretParent.add(mesh);
        }
      }
    } else {
      const translation = new MapSpriteTranslation(1, 1);
      const { spriteOffset, anchorPointWorld } = translation.compute();
      const offset = this.computeSpriteAnchorOffset(spriteOffset);
      let shp: any;
      try {
        shp = this.imageFinder.findByObjectArt(this.objectArt);
      } catch (err) {
        if (!(err instanceof ImageFinder.MissingImageError)) throw err;
        console.warn(`<${this.gameObject.name}>: ` + err.message);
      }
      if (shp) {
        const renderable = (this.shpRenderable = ShpRenderable.factory(
          shp,
          this.palette,
          this.camera,
          offset,
          this.objectArt.hasShadow,
        ));
        renderable.setBatched(this.useSpriteBatching);
        if (this.useSpriteBatching) renderable.setBatchPalettes(this.paletteRemaps);
        renderable.create3DObject();
        wrap.add(renderable.get3DObject());
        wrap.position.x = anchorPointWorld.x;
        wrap.position.z = anchorPointWorld.y;
        wrap.updateMatrix();
        const props = new AnimProps(new IniSection("dummy"), shp);
        props.loopCount = -1;
        const anim = new Animation(props, this.gameSpeed);
        this.shpAnimRunner = new SimpleRunner();
        this.shpAnimRunner.animation = anim;
      } else {
        wrap.add(this.createPlaceholder());
      }
    }
    return wrap;
  }

  /** 缺图 DebugRenderable 占位。 */
  createPlaceholder(): any {
    this.placeholder = new DebugRenderable(
      { width: 0.5, height: 0.5 },
      this.objectArt.height,
      this.palette,
      { centerFoundation: true },
    );
    this.placeholder.setBatched(this.useSpriteBatching);
    if (this.useSpriteBatching) this.placeholder.setBatchPalettes(this.paletteRemaps);
    this.placeholder.create3DObject();
    return this.placeholder.get3DObject();
  }

  /**
   * 多炮塔可见性。
   * @param active - 活动炮塔下标
   */
  updateActiveTurret(active: number): void {
    this.allTurrets.forEach((mesh, i) => {
      if (mesh) mesh.visible = i === active;
    });
  }

  /** 子机/卸矿 VXL 显隐。 */
  updateBodyVxl(): void {
    const useAlt =
      !!this.noSpawnAltVxl && !this.gameObject.airSpawnTrait.availableSpawns;
    const useHarvester =
      !!this.harvesterAltVxl &&
      !!this.gameObject.harvesterTrait &&
      [HarvesterStatus.PreparingToUnload, HarvesterStatus.Unloading].includes(
        this.gameObject.harvesterTrait.status,
      );
    if (this.noSpawnAltVxl) this.noSpawnAltVxl.visible = useAlt;
    if (this.harvesterAltVxl) this.harvesterAltVxl.visible = useHarvester;
    if (this.mainVxl) this.mainVxl.visible = !useAlt && !useHarvester;
  }

  /** 是否沉船（水区 sinker）。 */
  isSinker(): boolean {
    return this.gameObject.zone === ZoneType.Water && this.gameObject.isSinker;
  }

  onCreate(manager: any): void {
    this.renderableManager = manager;
    this.plugins.forEach((p) => p.onCreate(manager));
    if (this.objectRules.ambientSound) {
      this.ambientSound = this.worldSound?.playEffect(this.objectRules.ambientSound, this.gameObject);
    }
  }

  /**
   * 移除：爆炸或沉船 wake 动画 Promise。
   * @param manager - 渲染管理器
   */
  onRemove(manager: any): Promise<void> | undefined {
    this.renderableManager = void 0;
    this.plugins.forEach((p) => p.onRemove(manager));
    this.ambientSound?.stop();
    if (this.gameObject.isDestroyed && this.gameObject.isVehicle() && this.get3DObject()) {
      if (this.gameObject.deathType === DeathType.Temporal) return;
      if (this.gameObject.deathType === DeathType.None) return;
      if (this.gameObject.deathType === DeathType.Crush) return;
      if (
        !this.isSinker() ||
        this.objectRules.underwater ||
        (this.gameObject.deathType !== DeathType.Sink &&
          this.objectRules.speedType === SpeedType.Hover)
      ) {
        if (this.objectRules.underwater && this.objectRules.organic) return;
        if (!this.objectRules.explosion.length) return;
        if (this.gameObject.explodes && this.objectRules.deathWeapon) return;
        const explosions = this.objectRules.explosion;
        const name = explosions[getRandomInt(0, explosions.length - 1)];
        manager.createTransientAnim(name, (a: any) =>
          a.setPosition(this.withPosition.getPosition()),
        );
        return;
      }
      if (this.isSinker()) {
        const wakeName = this.rules.audioVisual.wake;
        this.sinkWakeAnims = [];
        for (let i = 0; i < 5; i++) {
          const wake = manager.createAnim(wakeName, void 0, true);
          const jitter = {
            x: getRandomInt(-15, 15) * Coords.ISO_WORLD_SCALE,
            y: getRandomInt(-15, 15) * Coords.ISO_WORLD_SCALE,
          };
          wake.setPosition(new THREE.Vector3(jitter.x, 0, jitter.y));
          this.sinkWakeAnims.push(wake);
          wake.create3DObject();
          this.get3DObject().add(wake.get3DObject());
        }
        if (!this.gameObject.rules.naval) {
          this.updateClippingPlanes(this.gameObject.tile.z, true);
        }
      }
      return new Promise((resolve) => {
        this.resolveObjectRemove = resolve;
      });
    }
  }

  dispose(): void {
    this.plugins.forEach((p) => p.dispose());
    this.pipOverlay?.dispose();
    this.shpRenderable?.dispose();
    this.shadowProxy?.dispose();
    this.vxlBuilders.forEach((b) => b.dispose());
    this.sinkWakeAnims?.forEach((a) => a.dispose());
    this.squidGrabAnim?.dispose();
    this.placeholder?.dispose();
  }
}
