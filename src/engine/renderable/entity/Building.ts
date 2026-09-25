/**
 * Building — 建筑渲染件（SHP 主图/地基/动画层 + 炮塔 VXL/SHP + 灯光 + 射程圈）。
 *
 * update：无敌/FS 闪光、Boris 激光红脉冲、狂暴/电力/维修/超武充能状态机、
 * 碉堡升降、磨碎机/精炼厂特殊动画、损伤帧、墙壁朝向、炮塔光向。
 * 构造时聚合 SHP 图集（buildingImageDataCache 命中则复用）。
 *
 * 由 engine/renderable/entity/Building.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { ShpBuilder } from "engine/renderable/builder/ShpBuilder"; // 已转换
import { DamageType } from "engine/renderable/entity/building/DamageType"; // 已转换
import { AnimationType } from "engine/renderable/entity/building/AnimationType"; // 已转换
import { OverlayUtils } from "engine/gfx/OverlayUtils"; // 已转换
import { BuildStatus } from "game/gameobject/Building"; // 已转换
import { Animation, AnimationState } from "engine/Animation"; // 已转换
import { wallTypes } from "game/map/wallTypes"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { getRandomInt } from "util/math"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import { ShpRenderable } from "engine/renderable/ShpRenderable"; // 已转换
import { ImageFinder } from "engine/ImageFinder"; // 已转换
import { DebugUtils } from "engine/gfx/DebugUtils"; // 已转换
import { MapSpriteTranslation } from "engine/renderable/MapSpriteTranslation"; // 已转换
import { BuildingAnimArtProps } from "engine/renderable/entity/building/BuildingAnimArtProps"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { HighlightAnimRunner } from "engine/renderable/entity/HighlightAnimRunner"; // 已转换
import { FactoryType } from "game/rules/TechnoRules"; // 已转换
import { AttackState } from "game/gameobject/trait/AttackTrait"; // 已转换
import { SideType } from "game/SideType"; // 已转换
import { FactoryStatus } from "game/gameobject/trait/FactoryTrait"; // 已转换
import { RepairStatus } from "game/gameobject/trait/UnitRepairTrait"; // 已转换
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import { InvulnerableAnimRunner } from "engine/renderable/entity/InvulnerableAnimRunner"; // 已转换
import { BuildingShpHelper } from "engine/renderable/entity/building/BuildingShpHelper"; // 已转换
import { ExtraLightHelper } from "engine/renderable/entity/unit/ExtraLightHelper"; // 已转换
import { AlphaRenderable } from "engine/renderable/AlphaRenderable"; // 已转换
import { DebugRenderable } from "engine/renderable/DebugRenderable"; // 已转换
import { MathUtils } from "engine/gfx/MathUtils"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

declare const THREE: any;

/**
 * 动画播完后的回退映射（孪生 j）。
 * 例如 PRODUCTION/BUILDUP 结束回 IDLE；维修开始→循环→结束→IDLE。
 */
const ANIM_FALLBACK: Map<AnimationType, AnimationType> = new Map<AnimationType, AnimationType>()
  .set(AnimationType.PRODUCTION, AnimationType.IDLE)
  .set(AnimationType.BUILDUP, AnimationType.IDLE)
  .set(AnimationType.SPECIAL_DOCKING, AnimationType.IDLE)
  .set(AnimationType.SPECIAL_REPAIR_START, AnimationType.SPECIAL_REPAIR_LOOP)
  .set(AnimationType.SPECIAL_REPAIR_LOOP, AnimationType.SPECIAL_REPAIR_END)
  .set(AnimationType.SPECIAL_REPAIR_END, AnimationType.IDLE)
  .set(AnimationType.SUPER_CHARGE_START, AnimationType.SUPER_CHARGE_LOOP)
  .set(AnimationType.SUPER_CHARGE_LOOP, AnimationType.SUPER_CHARGE_END)
  .set(AnimationType.SUPER_CHARGE_END, AnimationType.IDLE)
  .set(AnimationType.FACTORY_DEPLOYING, AnimationType.IDLE)
  .set(AnimationType.FACTORY_ROOF_DEPLOYING, AnimationType.IDLE)
  // Tank Bunker exit animation → back to IDLE when done.
  .set(AnimationType.SPECIAL_UNDOCKING, AnimationType.IDLE)
  // Grinder — if the grind animation stops on its own (one-shot
  // SpecialAnim), fall back to IDLE instead of leaving the building bare.
  .set(AnimationType.SPECIAL_GRIND, AnimationType.IDLE);

/**
 * 归一化映射：部分动画类型共享同一组 animObjects，
 * 值为 [归一化后的 AnimationType, 槽位下标]（孪生 l）。
 */
const ANIM_NORMALIZE: Map<AnimationType, [AnimationType, number]> = new Map<
  AnimationType,
  [AnimationType, number]
>()
  .set(AnimationType.SUPER_CHARGE_START, [AnimationType.SUPER, 1])
  .set(AnimationType.SUPER_CHARGE_LOOP, [AnimationType.SUPER, 2])
  .set(AnimationType.SUPER_CHARGE_END, [AnimationType.SUPER, 3])
  .set(AnimationType.SPECIAL_REPAIR_START, [AnimationType.SPECIAL, 0])
  .set(AnimationType.SPECIAL_REPAIR_LOOP, [AnimationType.SPECIAL, 1])
  .set(AnimationType.SPECIAL_REPAIR_END, [AnimationType.SPECIAL, 2])
  .set(AnimationType.SPECIAL_DOCKING, [AnimationType.SPECIAL, 0])
  .set(AnimationType.SPECIAL_SHOOT, [AnimationType.SPECIAL, 0])
  // Tank Bunker exit — maps to SpecialAnimThree (NATBNK_A2, reverse/going-down).
  .set(AnimationType.SPECIAL_UNDOCKING, [AnimationType.SPECIAL, 2])
  // Grinder — maps to SpecialAnim (grind animation).
  .set(AnimationType.SPECIAL_GRIND, [AnimationType.SPECIAL, 0])
  .set(AnimationType.FACTORY_DEPLOYING, [AnimationType.FACTORY_DEPLOYING, 0])
  .set(AnimationType.FACTORY_UNDER_DOOR, [AnimationType.FACTORY_DEPLOYING, 1])
  .set(AnimationType.FACTORY_ROOF_DEPLOYING, [AnimationType.FACTORY_ROOF_DEPLOYING, 0])
  .set(AnimationType.FACTORY_UNDER_ROOF_DOOR, [AnimationType.FACTORY_ROOF_DEPLOYING, 1]);

/**
 * 建筑渲染件。
 * 持有主 SHP、地基(bib)、动画层、炮塔、射程圈与电力/维修/超武状态机。
 */
export class Building {
  // ---- 构造注入 ----
  gameObject: any;
  selectionModel: any;
  rules: any;
  art: any;
  imageFinder: any;
  voxels: any;
  voxelAnims: any;
  palette: any;
  animPalette: any;
  isoPalette: any;
  camera: any;
  lighting: any;
  debugFrame: any;
  gameSpeed: any;
  vxlBuilderFactory: any;
  useSpriteBatching: any;
  buildingImageDataCache: any;
  pipOverlay: any;
  worldSound: any;
  initialAnimType: AnimationType;

  // ---- 运行时状态 ----
  objectArt: any;
  objectRules: any;
  type: string;
  paletteRemaps: any[];
  lastOwnerColor: any;
  baseShpExtraLight: any;
  baseVxlExtraLight: any;
  vxlExtraLight: any;
  shpExtraLight: any;
  animArtProps: BuildingAnimArtProps;
  animShpFiles: any;
  mainShpFile: any;
  bibShpFile: any;
  shpFrameInfos: any;
  aggregatedImageData: any;
  withPosition: WithPosition;

  animObjects: Map<AnimationType, any[]>;
  animations: Map<any, Animation>;
  animSounds: Map<any, any>;
  plugins: any[];

  powered = true;
  repairStopRequested = false;
  repairStartRequested = false;
  highlightAnimRunner: any;
  invulnAnimRunner: any;
  laserTargetAnimRunner: any;
  _wasLaserTarget = false;
  /** 必须 init lastInvulnerable=false，避免新建筑误触发 "invuln ended" 闪光。 */
  lastInvulnerable = false;
  /** init lastSuperWeaponAlmostCharged=false，避免建造完成后误 endLoop IDLE。 */
  lastSuperWeaponAlmostCharged = false;
  _fsEndFlashEndTimer = 0;
  _invulnFlashTimer: number | undefined;
  _lastInvulnV: number = 0;
  _lastFSActive: boolean = false;
  drainAnim: any;
  drainLastDiscPos: any;
  drainAnimFinishing = false;
  _prevBunkerVehicle = false;
  _lastGrindCnt: number | undefined;
  _grindingActive = false;
  _lastRefineryPileVal: number | undefined;
  lastHasC4Charge: boolean | undefined;
  lastInvulnerable0?: boolean;
  lastWarpedOut: boolean | undefined;
  lastAttackState: AttackState | undefined;
  lastFactoryStatus: FactoryStatus | undefined;
  lastRepairStatus: RepairStatus | undefined;
  lastOccupiedState: boolean | undefined;
  lastHealth: number | undefined;
  lastWallType: number | undefined;
  lastTurretFacing: number | undefined;
  lastTurretRotating: boolean | undefined;
  lastPowered: boolean | undefined;
  lastOverpowered: boolean | undefined;
  _lastTurretVxlLight: any;

  // ---- 3D 对象 ----
  target: any;
  intersectTarget: any[];
  spriteOffset: any;
  spriteWrap: any;
  mainObj: any;
  bib: any;
  rubbleObj: any;
  placeholderObj: any;
  turret: any;
  turretRot: any;
  turretBuilders: any[] | undefined;
  animObjectsNested?: never;
  fireObjects: any[] | undefined;
  rangeCircle: any;
  rangeCircleWrapper: any;
  muzzleAnims: any[] | undefined;
  renderableManager: any;
  ambientSound: any;
  turretRotateSound: any;
  poweredSound: any;
  currentAnimType: AnimationType | undefined;

  /** 类级灯纹理缓存（颜色 hex → Texture）。 */
  static lampTextures: Map<string, any> = new Map();

  /**
   * @param gameObject - 建筑 GameObject
   * @param selectionModel - 选择模型
   * @param rules - TechnoRules
   * @param art - ObjectArt
   * @param imageFinder - 图片查找器
   * @param theater - 剧场资源（第 6 参，不写入 this，与孪生一致）
   * @param voxels - VXL 文件表
   * @param voxelAnims - HVA 文件表
   * @param palette - 主调色板
   * @param animPalette - 动画调色板
   * @param isoPalette - 等距调色板
   * @param camera - 相机
   * @param lighting - 光照
   * @param debugFrame - 调试线框开关
   * @param gameSpeed - 游戏速度
   * @param vxlBuilderFactory - VXL 构建器工厂
   * @param useSpriteBatching - 是否精灵合批
   * @param shpAggregator - SHP 聚合器（仅 ctor 调用一次 aggregate）
   * @param buildingImageDataCache - 建筑图缓存
   * @param pipOverlay - HUD 覆盖
   * @param worldSound - 世界音效
   * @param initialAnimType - 初始动画类型
   */
  constructor(
    gameObject: any,
    selectionModel: any,
    rules: any,
    art: any,
    imageFinder: any,
    theater: any,
    voxels: any,
    voxelAnims: any,
    palette: any,
    animPalette: any,
    isoPalette: any,
    camera: any,
    lighting: any,
    debugFrame: any,
    gameSpeed: any,
    vxlBuilderFactory: any,
    useSpriteBatching: any,
    shpAggregator: any,
    buildingImageDataCache: any,
    pipOverlay: any,
    worldSound: any,
    initialAnimType: AnimationType = AnimationType.IDLE,
  ) {
    this.gameObject = gameObject;
    this.selectionModel = selectionModel;
    this.rules = rules;
    this.art = art;
    this.imageFinder = imageFinder;
    // theater 不写入 this（与孪生一致）。
    this.voxels = voxels;
    this.voxelAnims = voxelAnims;
    this.palette = palette;
    this.animPalette = animPalette;
    this.isoPalette = isoPalette;
    this.camera = camera;
    this.lighting = lighting;
    this.debugFrame = debugFrame;
    this.gameSpeed = gameSpeed;
    this.vxlBuilderFactory = vxlBuilderFactory;
    this.useSpriteBatching = useSpriteBatching;
    this.buildingImageDataCache = buildingImageDataCache;
    this.pipOverlay = pipOverlay;
    this.worldSound = worldSound;
    this.initialAnimType = initialAnimType;

    this.animObjects = new Map();
    this.animations = new Map();
    this.animSounds = new Map();
    this.powered = true;
    this.repairStopRequested = false;
    this.repairStartRequested = false;
    this.highlightAnimRunner = new HighlightAnimRunner(this.gameSpeed);
    this.invulnAnimRunner = new InvulnerableAnimRunner(this.gameSpeed);
    // laser-target red pulse runner — mirrors the Force Shield pulse.
    // Produces a sine value in [-0.5, -0.1] which is used to modulate
    // brightness; the red tint is lerped on top.
    // steps=60, rate=10 → 60 frames per cycle at 10 fps = 6s period.
    this.laserTargetAnimRunner = new InvulnerableAnimRunner(this.gameSpeed, -0.5, -0.1, 60, 10);
    this._wasLaserTarget = false;
    this.lastInvulnerable = false;
    this.lastSuperWeaponAlmostCharged = false;
    this._fsEndFlashEndTimer = 0;
    this._invulnFlashTimer = 0;
    this._lastInvulnV = 0;
    this._lastFSActive = false;
    this.drainAnim = undefined;
    this.drainLastDiscPos = undefined;
    this.plugins = [];
    this._prevBunkerVehicle = false;

    this.objectArt = gameObject.art;
    this.objectRules = gameObject.rules;
    this.type = this.objectRules.name;
    this.paletteRemaps = [...this.rules.colors.values()].map((e: any) => this.palette.clone().remap(e));
    this.palette.remap(this.gameObject.owner.color);
    this.lastOwnerColor = this.gameObject.owner.color;
    this.updateBaseLight();
    this.vxlExtraLight = new THREE.Vector3().copy(this.baseVxlExtraLight);
    this.shpExtraLight = new THREE.Vector3().copy(this.baseShpExtraLight);

    const animArtProps = (this.animArtProps = new BuildingAnimArtProps());
    this.animArtProps.read(this.objectArt.art, this.art);

    let mainShpFile: any;
    try {
      mainShpFile = this.imageFinder.findByObjectArt(this.objectArt);
    } catch (e: any) {
      if (!(e instanceof ImageFinder.MissingImageError)) throw e;
      console.warn(e.message);
    }
    this.mainShpFile = mainShpFile;

    let bibShpFile: any;
    try {
      bibShpFile = this.objectArt.bibShape
        ? this.imageFinder.find(this.objectArt.bibShape, this.objectArt.useTheaterExtension)
        : undefined;
    } catch (e: any) {
      if (!(e instanceof ImageFinder.MissingImageError)) throw e;
      console.warn(e.message);
    }
    this.bibShpFile = bibShpFile;

    const helper = new BuildingShpHelper(this.imageFinder);
    this.animShpFiles = helper.collectAnimShpFiles(animArtProps, this.objectArt);
    this.shpFrameInfos = helper.getShpFrameInfos(
      this.objectArt,
      mainShpFile,
      bibShpFile,
      this.animShpFiles,
      this.animArtProps,
    );

    let imageData = this.buildingImageDataCache.get(this.gameObject.name);
    if (!imageData) {
      imageData = shpAggregator.aggregate(this.shpFrameInfos.values(), `agg_${this.objectRules.name}.shp`);
      this.buildingImageDataCache.set(this.gameObject.name, imageData);
    }
    this.aggregatedImageData = imageData;
    this.withPosition = new WithPosition();
  }

  /** 按 tile 与 lightingType 重算 baseShp/baseVxl 额外光。 */
  updateBaseLight(): void {
    this.baseShpExtraLight = this.lighting
      .compute(this.objectArt.lightingType, this.gameObject.tile)
      .addScalar(-1);
    this.baseVxlExtraLight = new THREE.Vector3().setScalar(
      this.lighting.computeNoAmbient(this.objectArt.lightingType, this.gameObject.tile),
    );
  }

  /** 刷新 base light 并同步到 vxl/shp 额外光；广播 plugins.updateLighting。 */
  updateLighting(): void {
    this.updateBaseLight();
    this.vxlExtraLight.copy(this.baseVxlExtraLight);
    this.shpExtraLight.copy(this.baseShpExtraLight);
    this.plugins.forEach((e) => e.updateLighting?.());
  }

  /**
   * VPL 体素光=世界固定太阳：炮塔 VXL 的 lightDir 须按 turretFacing
   * 反向抵消 mesh 旋转（同 Vehicle）。建筑此前从不更新 lightDir，
   * 巨炮等 TurretAnimIsVoxel 建筑一转炮塔明暗就错位。
   * force=true 时忽略 lastTurretVxlLight 强制写入（创建后首帧）。
   */
  updateTurretVxlLightDir(force?: boolean): void {
    if (!this.turretBuilders?.length || !this.gameObject.turretTrait) return;
    const facing = ((Math.floor(this.gameObject.turretTrait.facing) % 360) + 360) % 360;
    const rad = (facing * Math.PI) / 180;
    const ld = new THREE.Vector3(-Math.cos(rad), Math.sin(rad), 0);
    if (
      !force &&
      this._lastTurretVxlLight &&
      this._lastTurretVxlLight.distanceToSquared(ld) <= 1e-8
    ) {
      return;
    }
    if (!this._lastTurretVxlLight) this._lastTurretVxlLight = new THREE.Vector3();
    this._lastTurretVxlLight.copy(ld);
    this.turretBuilders.forEach((b) => {
      // SHP 炮塔无 VPL lightDir，只处理 VXL
      if (b instanceof ShpBuilder) return;
      b.setVxlLightDir?.(ld);
    });
  }

  /** 根 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /** 可拾取相交目标列表。 */
  getIntersectTarget(): any {
    return this.intersectTarget;
  }

  /** 重建相交目标（placeholder/主图/bib/各动画层）。 */
  updateIntersectTarget(): void {
    this.intersectTarget = [
      this.placeholderObj?.get3DObject(),
      this.mainObj?.getShapeMesh(),
      this.bib?.getShapeMesh(),
      ...[...this.animObjects.values()].flat().map((e) => e.getShapeMesh()),
    ].filter(isNotNullOrUndefined);
  }

  /** UI 显示名：plugins 可覆盖。 */
  getUiName(): any {
    const override = this.plugins.reduce((acc, plugin) => plugin.getUiNameOverride?.() ?? acc, undefined);
    return override !== undefined ? override : this.gameObject.getUiName();
  }

  /** 创建根对象、Alpha 图、主对象、动画、炮塔、射程圈。 */
  create3DObject(): void {
    let root = this.get3DObject();
    if (!root) {
      root = new THREE.Object3D();
      root.name = "building_" + this.type;
      root.userData.id = this.gameObject.id;
      this.target = root;
      root.matrixAutoUpdate = false;
      this.withPosition.matrixUpdate = true;
      this.withPosition.applyTo(this);

      const alphaImage = this.gameObject.rules.alphaImage;
      if (alphaImage) {
        const img = this.imageFinder.tryFind(alphaImage, false);
        if (img) {
          const alpha = new AlphaRenderable(
            img,
            this.camera,
            new THREE.Vector2(0, (Coords.ISO_TILE_SIZE + 1) / 2),
          );
          alpha.create3DObject();
          root.add(alpha.get3DObject());
        } else {
          console.warn(`<${this.objectRules.name}>: Alpha image "${alphaImage}" not found`);
        }
      }

      // 孪生：(lightIntensity && (createLamp, isLightpost)) || (createObjects, …)
      // 路灯(isLightpost+有强度)：只建灯；否则建灯(若有强度)并建主体全套。
      if (this.objectRules.lightIntensity) this.createLamp(root);
      const lampSatisfied =
        !!this.objectRules.lightIntensity && !!this.objectRules.isLightpost;
      if (!lampSatisfied) {
        this.createObjects(root);
        this.updateIntersectTarget();
        if (this.pipOverlay) {
          this.pipOverlay.create3DObject();
          root.add(this.pipOverlay.get3DObject());
        }
        this.updateImage(this.computeDamageType(this.gameObject.healthTrait.health));
        this.mainObj?.setExtraLight(this.shpExtraLight);
        [...this.animObjects.values()].forEach((layers) => {
          layers.forEach((obj) => {
            const anim = this.animations.get(obj);
            if (!(anim.props.getArt() as any).has("UseNormalLight")) obj.setExtraLight(this.shpExtraLight);
          });
        });
        this.bib?.setExtraLight(this.shpExtraLight);
        this.turretBuilders?.forEach((builder) => {
          if (builder instanceof ShpBuilder) builder.setExtraLight(this.shpExtraLight);
          else builder.setExtraLight(this.vxlExtraLight);
        });
        this.updateTurretVxlLightDir(true);
      }
    }
  }

  /** 创建路灯光晕网格（在 create3DObject 中、主体之前调用）。 */
  createLamp(parent: any): void {
    const rules = this.objectRules;
    let r = rules.lightRedTint;
    let g = rules.lightGreenTint;
    let b = rules.lightBlueTint;
    const boost = Math.abs(Math.min(r, g, b, 0));
    if (boost > 0) {
      r += boost;
      g += boost;
      b += boost;
    }
    let ln = (1 + r) * (1 + Math.abs(rules.lightIntensity)) - 1;
    let lg = (1 + g) * (1 + Math.abs(rules.lightIntensity)) - 1;
    let lb = (1 + b) * (1 + Math.abs(rules.lightIntensity)) - 1;
    const maxc = Math.max(ln, lg, lb);
    if (maxc > 1) {
      ln /= maxc;
      lg /= maxc;
      lb /= maxc;
    }
    const color = new THREE.Color(ln, lg, lb).multiplyScalar(0.9);
    const hex = color.getHexString();
    let tex = Building.lampTextures.get(hex);
    if (!tex) {
      tex = this.createLampTexture(hex);
      Building.lampTextures.set(hex, tex);
    }
    const material = new THREE.MeshBasicMaterial({
      map: tex,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      blending: THREE.CustomBlending,
      blendEquation: rules.lightIntensity > 0 ? THREE.AddEquation : THREE.ReverseSubtractEquation,
      blendSrc: THREE.DstColorFactor,
      blendDst: THREE.OneFactor,
    });
    const vis = rules.lightVisibility;
    const geo = new THREE.PlaneBufferGeometry(2 * vis, 2 * vis);
    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = 999995;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    parent.add(mesh);
  }

  /** 32×32 径向渐变灯纹理。 */
  createLampTexture(hex: string): any {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 32, 32);
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "#" + hex);
    grad.addColorStop(1, "black");
    ctx.arc(16, 16, 16, 0, 2 * Math.PI);
    ctx.fillStyle = grad as any;
    ctx.fill();
    const tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  /** 按地基中心偏移写入世界坐标。 */
  setPosition(pos: any): void {
    const center = this.gameObject.getFoundationCenterOffset();
    this.withPosition.setPosition(pos.x - center.x, pos.y, pos.z - center.y);
  }

  /** 当前世界坐标。 */
  getPosition(): any {
    return this.withPosition.getPosition();
  }

  /** 注册建筑插件。 */
  registerPlugin(plugin: any): void {
    this.plugins.push(plugin);
  }

  /** 高亮闪烁（除非 plugins 禁止）。 */
  highlight(): void {
    if (!this.plugins.some((e) => e.shouldDisableHighlight?.())) {
      this.highlightAnimRunner.animate(2);
    }
  }

  /**
   * 每帧主更新：动画状态机、无敌/FS 闪光、激光红脉冲、
   * 电力/工厂/维修/超武、损伤帧、碉堡/磨碎机/精炼厂特殊逻辑。
   */
  update(now: number): void {
    if (this.objectRules.isLightpost) return;

    // 孪生：isDestroyed || currentAnimType !== undefined || setAnimation(initial)
    if (!this.gameObject.isDestroyed && this.currentAnimType === undefined) {
      this.setAnimation(this.initialAnimType, now);
    }
    this.plugins.forEach((p) => p.update(now));
    this.pipOverlay?.update(now);

    const c4 = this.gameObject.c4ChargeTrait?.hasCharge();
    if (!this.gameObject.isDestroyed && this.lastHasC4Charge !== c4 && c4) {
      this.lastHasC4Charge = c4;
      this.highlight();
    }

    const highlightOn = this.highlightAnimRunner.shouldUpdate();
    const invulnOn = this.gameObject.invulnerableTrait.isActive();
    const invulnChanged = invulnOn !== this.lastInvulnerable;

    // start flash for ANY new invulnerability application (IC or FS) via version counter.
    if (this._invulnFlashTimer === undefined) this._invulnFlashTimer = 0;
    const vNow = this.gameObject.invulnerableTrait._version;
    if (this._lastInvulnV === undefined) this._lastInvulnV = vNow;
    if (vNow !== this._lastInvulnV && invulnOn) {
      this._invulnFlashTimer = 180;
      // Interrupt any ongoing FS end flash — new application takes priority.
      this._fsEndFlashEndTimer = 0;
    }
    this._lastInvulnV = vNow;

    // FS end flash — independent of invulnerability state (for IC overlap).
    const fsNow = this.gameObject.invulnerableTrait.isForceShieldActive();
    if (this._lastFSActive === undefined) this._lastFSActive = fsNow;
    if (!fsNow && this._lastFSActive) {
      if (!this._fsEndFlashEndTimer) this._fsEndFlashEndTimer = 180;
    }
    this._lastFSActive = fsNow;

    // generic end flash when invulnerability expires (IC and FS).
    if (invulnChanged && !invulnOn) {
      if (!this._fsEndFlashEndTimer) this._fsEndFlashEndTimer = 180;
    }

    let endFTimer = this._fsEndFlashEndTimer || 0;
    if (endFTimer > 0) {
      this._fsEndFlashEndTimer = --endFTimer;
      this.lastInvulnerable = invulnOn;
      // Start at full white, decay to normal.
      const e2Bright = new THREE.Vector3(2, 2, 2);
      const eLerpT = 1 - Math.pow(endFTimer / 180, 2);
      this.vxlExtraLight.lerpVectors(e2Bright, this.baseVxlExtraLight, eLerpT);
      this.shpExtraLight.lerpVectors(e2Bright, this.baseShpExtraLight, eLerpT);
    } else if ((this._invulnFlashTimer as number) > 0) {
      (this._invulnFlashTimer as number)--;
      this.lastInvulnerable = invulnOn;
      if (invulnChanged) this.invulnAnimRunner.animate();
      if (this.invulnAnimRunner.shouldUpdate()) this.invulnAnimRunner.tick(now);
      const ivVal = invulnOn ? this.invulnAnimRunner.getValue() : 0;
      const nV = (highlightOn ? this.highlightAnimRunner.getValue() : 0) || ivVal;
      const amb = this.lighting.getAmbientIntensity();
      const tgtVxl = this.baseVxlExtraLight.clone();
      const tgtShp = this.baseShpExtraLight.clone();
      ExtraLightHelper.multiplyVxl(tgtVxl, this.baseVxlExtraLight, amb, nV);
      ExtraLightHelper.multiplyShp(tgtShp, this.baseShpExtraLight, nV);
      // FS blue glow for start flash target.
      if (this.gameObject.invulnerableTrait.isForceShieldActive()) {
        const fsTint = new THREE.Vector3(0, 0, 255);
        tgtVxl.lerp(fsTint, 0.2);
        tgtShp.lerp(fsTint, 0.2);
      }
      // Start at full white, decay to darkening (no ramp-up).
      const flashColor = new THREE.Vector3(2, 2, 2);
      const lerpT = 1 - Math.pow((this._invulnFlashTimer as number) / 180, 2);
      this.vxlExtraLight.lerpVectors(flashColor, tgtVxl, lerpT);
      this.shpExtraLight.lerpVectors(flashColor, tgtShp, lerpT);
    } else {
      this.lastInvulnerable = invulnOn;
      if (invulnOn && invulnChanged) this.invulnAnimRunner.animate();
      if (this.invulnAnimRunner.shouldUpdate()) this.invulnAnimRunner.tick(now);
      if (highlightOn || invulnChanged || invulnOn) {
        if (highlightOn) this.highlightAnimRunner.tick(now);
        const iv = invulnOn ? this.invulnAnimRunner.getValue() : 0;
        const n = (highlightOn ? this.highlightAnimRunner.getValue() : 0) || iv;
        const amb = this.lighting.getAmbientIntensity();
        ExtraLightHelper.multiplyVxl(this.vxlExtraLight, this.baseVxlExtraLight, amb, n);
        ExtraLightHelper.multiplyShp(this.shpExtraLight, this.baseShpExtraLight, n);
        // FS blue glow during pulsing.
        if (this.gameObject.invulnerableTrait.isForceShieldActive()) {
          this.vxlExtraLight.lerp(new THREE.Vector3(0, 0, 255), 0.2);
          this.shpExtraLight.lerp(new THREE.Vector3(0, 0, 255), 0.2);
        }
      }
    }

    // red pulsing tint while being laser-designated by a Boris airstrike.
    // Mirrors the Force Shield pulse: the runner's sine value darkens/
    // brightens the building, then a red tint is lerped on top so the
    // building visibly pulses red.
    if (this.gameObject.airstrikeLaserTarget) {
      if (!this._wasLaserTarget) {
        this._wasLaserTarget = true;
        this.laserTargetAnimRunner.animate();
      }
      if (this.laserTargetAnimRunner.shouldUpdate()) this.laserTargetAnimRunner.tick(now);
      const lv = this.laserTargetAnimRunner.getValue();
      const lAmb = this.lighting.getAmbientIntensity();
      ExtraLightHelper.multiplyVxl(this.vxlExtraLight, this.baseVxlExtraLight, lAmb, lv);
      ExtraLightHelper.multiplyShp(this.shpExtraLight, this.baseShpExtraLight, lv);
      this.vxlExtraLight.lerp(new THREE.Vector3(255, 0, 0), 0.4);
      this.shpExtraLight.lerp(new THREE.Vector3(255, 0, 0), 0.4);
    } else if (this._wasLaserTarget) {
      // Laser target just cleared — restore the base extra light.
      this._wasLaserTarget = false;
      this.vxlExtraLight.copy(this.baseVxlExtraLight);
      this.shpExtraLight.copy(this.baseShpExtraLight);
    } else {
      this._wasLaserTarget = false;
    }

    // warped-out 半透明
    const warped = this.gameObject.warpedOutTrait.isActive();
    if (warped !== this.lastWarpedOut) {
      this.lastWarpedOut = warped;
      const opacity = warped ? 0.5 : 1;
      for (const obj of [this.mainObj, this.bib, ...[...this.animObjects.values()].flat()]) {
        obj?.setOpacity(opacity);
      }
      this.turretBuilders?.forEach((e) => e.setOpacity(opacity));
      this.placeholderObj?.setOpacity(opacity);
    }

    // 属主颜色变化 → remap 调色板
    if (!this.gameObject.isDestroyed) {
      const color = this.gameObject.owner.color;
      if (this.lastOwnerColor !== color) {
        this.palette.remap(color);
        this.mainObj?.setPalette(this.palette);
        [...this.animObjects.values()].forEach((layers) => {
          layers.forEach((obj) => obj.setPalette(this.palette));
        });
        this.bib?.setPalette(this.palette);
        this.turretBuilders?.forEach((e) => e.setPalette(this.palette));
        this.placeholderObj?.setPalette(this.palette);
        this.lastOwnerColor = color;
      }
    }

    // 动画播完回退
    if (
      !this.gameObject.isDestroyed &&
      this.currentAnimType !== undefined &&
      ANIM_FALLBACK.has(this.currentAnimType)
    ) {
      const next = ANIM_FALLBACK.get(this.currentAnimType)!;
      if (this.hasObjectWithStoppedAnimation(this.currentAnimType)) {
        this.setAnimation(next, now);
      }
    }

    // 卖出/拆除
    if (
      !this.gameObject.isDestroyed &&
      this.gameObject.buildStatus === BuildStatus.BuildDown &&
      this.currentAnimType !== AnimationType.UNBUILD
    ) {
      this.setAnimation(AnimationType.UNBUILD, now);
    }

    // 攻击状态机
    const attackState: AttackState | undefined = this.gameObject.attackTrait?.attackState;
    if (
      this.lastAttackState === undefined ||
      (this.lastAttackState !== attackState && !this.gameObject.isDestroyed)
    ) {
      this.lastAttackState = attackState;
      if (
        !this.gameObject.isDestroyed &&
        this.hasAnimation(AnimationType.SPECIAL_SHOOT)
      ) {
        if (attackState === AttackState.FireUp) {
          this.setAnimation(AnimationType.SPECIAL_SHOOT, now);
        } else if (this.currentAnimType === AnimationType.SPECIAL_SHOOT) {
          this.setAnimation(AnimationType.IDLE, now);
        }
      }
      if (attackState === AttackState.JustFired && this.objectArt.muzzleFlash) {
        const flash = this.createMuzzleFlashAnim(this.spriteOffset, this.renderableManager);
        if (flash) {
          flash.create3DObject();
          this.spriteWrap.add(flash.get3DObject());
          if (!this.muzzleAnims) this.muzzleAnims = [];
          this.muzzleAnims.push(flash);
        }
      }
    }

    // 工厂生产动画
    const factory = this.gameObject.factoryTrait;
    if (factory) {
      const status = factory.status;
      if (this.lastFactoryStatus !== status && !this.gameObject.isDestroyed) {
        const prev = this.lastFactoryStatus;
        this.lastFactoryStatus = status;
        if (prev !== undefined) {
          let animType: AnimationType | undefined;
          let isUnitFactory = false;
          if (
            [FactoryType.BuildingType, FactoryType.NavalUnitType].includes(factory.type)
          ) {
            animType = AnimationType.PRODUCTION;
          } else if (factory.type === FactoryType.UnitType) {
            animType = factory.deliveringUnit?.rules.consideredAircraft
              ? AnimationType.FACTORY_ROOF_DEPLOYING
              : AnimationType.FACTORY_DEPLOYING;
            isUnitFactory = true;
          } else {
            animType = undefined;
          }
          if (animType !== undefined && this.hasAnimation(animType)) {
            if (status === FactoryStatus.Delivering) {
              this.setAnimation(animType, now);
            } else if (isUnitFactory) {
              this.setAnimation(AnimationType.IDLE, now);
            }
          }
        }
      }
    }

    // 单位维修动画
    const repairStatus: RepairStatus | undefined = this.gameObject.unitRepairTrait?.status;
    if (this.lastRepairStatus !== repairStatus && !this.gameObject.isDestroyed) {
      const prevRepair = this.lastRepairStatus;
      this.lastRepairStatus = repairStatus;
      if (this.hasAnimation(AnimationType.SPECIAL_REPAIR_START)) {
        if (repairStatus === RepairStatus.Repairing) {
          if (
            (this.currentAnimType !== AnimationType.SPECIAL_REPAIR_LOOP &&
              this.currentAnimType !== AnimationType.SPECIAL_REPAIR_END) ||
            prevRepair !== RepairStatus.Idle
          ) {
            this.setAnimation(AnimationType.SPECIAL_REPAIR_START, now);
          } else {
            this.repairStartRequested = true;
          }
          this.repairStopRequested = false;
        } else {
          if (this.currentAnimType === AnimationType.SPECIAL_REPAIR_START) {
            this.repairStopRequested = true;
          } else {
            this.endCurrentAnimation();
          }
          this.repairStartRequested = false;
        }
      }
    }

    // 超武充能动画（仅建筑 Ready 后生效）
    const sw = this.gameObject.superWeaponTrait?.getSuperWeapon(this.gameObject);
    if (
      sw &&
      this.hasAnimation(AnimationType.SUPER_CHARGE_START) &&
      !this.gameObject.isDestroyed &&
      this.gameObject.buildStatus === BuildStatus.Ready
    ) {
      const almost = sw.getTimerSeconds() <= 60 * this.objectRules.chargedAnimTime;
      if (almost !== this.lastSuperWeaponAlmostCharged) {
        this.lastSuperWeaponAlmostCharged = almost;
        if (almost) this.setAnimation(AnimationType.SUPER_CHARGE_START, now);
        else this.endCurrentAnimation();
      }
    }

    if (
      this.repairStopRequested &&
      this.currentAnimType === AnimationType.SPECIAL_REPAIR_LOOP
    ) {
      this.endCurrentAnimation();
      this.repairStopRequested = false;
    }
    if (
      this.repairStartRequested &&
      this.currentAnimType === AnimationType.IDLE
    ) {
      this.setAnimation(AnimationType.SPECIAL_REPAIR_START, now);
      this.repairStartRequested = false;
    }

    if (this.muzzleAnims && this.muzzleAnims.length) this.updateMuzzleAnims(now);
    this.updateDrainAnim(now);

    // Grinder (Grinding=yes) — play SpecialAnim while grinding; return to IDLE
    // once it completes or the safety counter runs out. A fresh grind is
    // detected by the counter jumping up (EnterRecyclerTask resets it).
    if (
      !this.gameObject.isDestroyed &&
      this.objectRules.grinding &&
      this.hasAnimation(AnimationType.SPECIAL)
    ) {
      const cnt = this.gameObject._grindingAnimTicks ?? 0;
      const fresh = cnt > (this._lastGrindCnt ?? 0);
      this._lastGrindCnt = cnt;
      if (cnt > 0) {
        if (fresh) {
          this._grindingActive = true;
          if (this.currentAnimType !== AnimationType.SPECIAL_GRIND) {
            this.setAnimation(AnimationType.SPECIAL_GRIND, now);
          }
        }
      } else if (this._grindingActive) {
        this._grindingActive = false;
        if (this.currentAnimType === AnimationType.SPECIAL_GRIND) {
          this.setAnimation(AnimationType.IDLE, now);
        }
      }
    }

    // Grinder with IdleAnimTwo — hide body and other layers in idle/grind.
    if (
      !this.gameObject.isDestroyed &&
      this.objectRules.grinding &&
      (this.animObjects.get(AnimationType.IDLE)?.length ?? 0) > 1 &&
      (this.currentAnimType === AnimationType.IDLE ||
        this.currentAnimType === AnimationType.SPECIAL_GRIND)
    ) {
      if (this.mainObj) this.mainObj.get3DObject().visible = false;
      if (this.bib) this.bib.get3DObject().visible = false;
      if (this.currentAnimType === AnimationType.IDLE) {
        this.setAnimationVisibility(AnimationType.ACTIVE, false);
        this.setAnimationVisibility(AnimationType.IDLE, false, 0);
        this.setAnimationVisibility(AnimationType.IDLE, true, 1);
      }
    }

    // 精炼厂倒矿 SPECIAL_DOCKING 一次性 SpecialAnim（GAREFNOR/NAREFNOR）
    if (
      !this.gameObject.isDestroyed &&
      this.objectRules.refinery &&
      (this.currentAnimType === AnimationType.IDLE ||
        this.currentAnimType === AnimationType.SPECIAL_DOCKING)
    ) {
      if (this.currentAnimType === AnimationType.IDLE) {
        const pile = this.gameObject._refineryOrePile ?? 0;
        const prevPile = this._lastRefineryPileVal ?? 0;
        this._lastRefineryPileVal = pile;
        if (pile > prevPile && this.hasAnimation(AnimationType.SPECIAL)) {
          this.setAnimation(AnimationType.SPECIAL_DOCKING, now);
        }
      } else {
        const specialObjs = this.animObjects.get(AnimationType.SPECIAL);
        if (
          specialObjs &&
          specialObjs.length &&
          specialObjs.every(
            (o) =>
              (this.animations.get(o)?.getState() ?? AnimationState.STOPPED) ===
              AnimationState.STOPPED,
          )
        ) {
          this.setAnimation(AnimationType.IDLE, now);
        }
      }
    }

    // 推进动画帧 + 半透明层
    if (!warped) {
      this.animations.forEach((anim, obj) => {
        switch (anim.getState()) {
          case AnimationState.STOPPED:
            obj.get3DObject().visible = false;
            return;
          case AnimationState.DELAYED:
            anim.update(now);
            obj.get3DObject().visible =
              anim.getState() !== AnimationState.DELAYED
                ? obj.get3DObject().userData.intendedVisible !== false
                : false;
            break;
          case AnimationState.NOT_STARTED:
            anim.start(now);
          // fallthrough
          case AnimationState.RUNNING:
          default:
            anim.update(now);
        }
        obj.setFrame(anim.getCurrentFrame());
      });
      this.animObjects.forEach((layers, type) => {
        const artList = this.animArtProps.getByType(type);
        layers.forEach((obj, idx) => {
          const prop = artList[idx];
          const anim = this.animations.get(obj);
          const translucent = prop.translucent;
          const translucency = prop.translucency;
          if (translucent || translucency > 0) {
            let opacity: number;
            if (translucent) {
              const p = anim.props;
              opacity = 1 - anim.getCurrentFrame() / (p.end - p.start);
            } else {
              opacity = 1 - translucency;
            }
            obj.setOpacity(opacity);
          }
        });
      });
    }

    this.toggleRangeCircleVisibility(
      (this.gameObject.showWeaponRange ||
        (this.selectionModel.isSelected() && this.gameObject.rules.techLevel !== -1)) &&
        !warped,
    );

    // 损伤/驻军/墙类型脏检测
    const wallChanged = this.gameObject.wallTrait?.wallType !== this.lastWallType;
    const occupancyChanged =
      this.lastOccupiedState === undefined ||
      this.lastOccupiedState !== !!this.gameObject.garrisonTrait?.isOccupied();
    const healthChanged =
      this.lastHealth === undefined || this.lastHealth !== this.gameObject.healthTrait.health;
    if (wallChanged || occupancyChanged || healthChanged) {
      const damageType = this.computeDamageType(this.gameObject.healthTrait.health);
      const damageTierChanged =
        healthChanged && damageType !== this.computeDamageType(this.lastHealth);
      this.lastOccupiedState = !!this.gameObject.garrisonTrait?.isOccupied();
      this.lastHealth = this.gameObject.healthTrait.health;
      this.lastWallType = this.gameObject.wallTrait?.wallType;
      if (wallChanged || occupancyChanged || damageTierChanged) {
        this.updateImage(damageType);
      }
      if (
        occupancyChanged &&
        this.currentAnimType === AnimationType.IDLE
      ) {
        this.setActiveAnimationVisible();
        this.setIdleAnimationVisible();
      }
      if (
        damageTierChanged &&
        damageType === DamageType.DESTROYED &&
        this.objectRules.explosion.length
      ) {
        this.createExplosionAnims(this.renderableManager);
      }
    }

    // Tank Bunker — track bunkered vehicle changes.
    // Must be outside the (wall||occupancy||health) guard because the bunker
    // has no wallTrait/garrisonTrait and the guard short-circuits after frame 1.
    {
      const trait = this.gameObject.tankBunkerTrait;
      const hasV = !!trait?.bunkeredVehicle;
      if (hasV !== this._prevBunkerVehicle) {
        this._prevBunkerVehicle = hasV;
        const soundName = hasV
          ? this.rules.audioVisual.bunkerWallsUpSound
          : this.rules.audioVisual.bunkerWallsDownSound;
        if (soundName) {
          this.worldSound?.playEffect(soundName, this.gameObject, this.gameObject.owner);
        }
        if (this.hasAnimation(AnimationType.SPECIAL)) {
          this.setAnimationVisibility(AnimationType.SPECIAL, false);
          const specAnimObjs = this.animObjects.get(AnimationType.SPECIAL)!;
          const specData = this.animArtProps.getByType(AnimationType.SPECIAL);
          // Front wall (index 0 or 2)
          const frontIdx = hasV ? 0 : 2;
          this.setAnimationVisibility(AnimationType.SPECIAL, true, frontIdx);
          const frontAnim = specAnimObjs[frontIdx];
          this.animations.get(frontAnim)!.start(now);
          const frontC3d = frontAnim.get3DObject().children[0];
          const frontYSort = specData[frontIdx].ySort || 0;
          if (frontC3d && frontYSort !== 0) {
            MathUtils.translateTowardsCamera(frontC3d, this.camera, frontYSort * (256 / 30));
            frontC3d.updateMatrix();
          }
          // Rear wall (index 1 or 3): depthTest=false set at creation time
          const rearIdx = hasV ? 1 : 3;
          this.setAnimationVisibility(AnimationType.SPECIAL, true, rearIdx);
          const rearAnim = specAnimObjs[rearIdx];
          this.animations.get(rearAnim)!.start(now);
          const rearC3d = rearAnim.get3DObject().children[0];
          const rearYSort = specData[rearIdx].ySort || 0;
          if (rearC3d && rearYSort !== 0) {
            MathUtils.translateTowardsCamera(rearC3d, this.camera, rearYSort * (256 / 30));
            rearC3d.updateMatrix();
          }
        }
      }
    }

    // 炮塔转向 / 旋转音效
    if (this.gameObject.turretTrait) {
      const facing = this.gameObject.turretTrait.facing;
      if (facing !== this.lastTurretFacing) {
        this.lastTurretFacing = facing;
        this.turretRot.rotation.y = THREE.Math.degToRad(facing);
        this.turretRot.updateMatrix();
        this.updateTurretVxlLightDir();
      }
      const rotating = this.gameObject.turretTrait.isRotating() && !warped;
      if (this.lastTurretRotating !== rotating) {
        this.lastTurretRotating = rotating;
        const sound = this.objectRules.turretRotateSound;
        if (sound) {
          if (rotating && !this.gameObject.isDestroyed) {
            this.turretRotateSound = this.worldSound?.playEffect(
              sound,
              this.gameObject,
              this.gameObject.owner,
            );
          } else {
            this.turretRotateSound?.stop();
          }
        }
      }
    }

    // 电力开关音效
    if (this.gameObject.poweredTrait) {
      if (this.gameObject.isDestroyed) {
        if (this.poweredSound) {
          this.poweredSound.stop();
          this.poweredSound = undefined;
        }
      } else {
        const on = this.gameObject.poweredTrait.isPoweredOn() && !warped;
        if (on !== this.lastPowered) {
          this.setPowered(on);
          this.lastPowered = on;
          this.poweredSound?.stop();
          const sound = on
            ? this.gameObject.rules.workingSound
            : this.gameObject.rules.notWorkingSound;
          if (sound && !warped) {
            this.poweredSound = this.worldSound?.playEffect(
              sound,
              this.gameObject,
              this.gameObject.owner,
              0.25,
            );
          }
        }
      }
    }
  }

  /** 按地基网格逐格创建爆炸瞬移动画。 */
  createExplosionAnims(manager: any): void {
    const foundation = this.objectArt.foundation;
    const explosionAnims = this.objectRules.explosion;
    for (let x = 0; x < foundation.width; x++) {
      for (let y = 0; y < foundation.height; y++) {
        const animName = explosionAnims[getRandomInt(0, explosionAnims.length - 1)];
        manager.createTransientAnim(animName, (anim: any) => {
          anim.setPosition(Coords.tile3dToWorld(x, y, 0).add(this.withPosition.getPosition()));
        });
      }
    }
  }

  /** 推进枪口闪光动画并回收已结束的。 */
  updateMuzzleAnims(now: number): void {
    const list = this.muzzleAnims!;
    const finished: any[] = [];
    list.forEach((anim) => {
      anim.update(now);
      if (anim.isAnimFinished()) {
        this.spriteWrap.remove(anim.get3DObject());
        anim.dispose();
        finished.push(anim);
      }
    });
    finished.forEach((anim) => list.splice(list.indexOf(anim), 1));
  }

  /**
   * 矿石飞碟吸取建筑矿石的 drain 动画：
   * 跟随 disc 位置；disc 离开后播完 4 圈再清理。
   */
  updateDrainAnim(now: number): void {
    if (this.gameObject.isDestroyed) return this.clearDrainAnim();

    // Y offset below the disc so the animation sits just beneath
    // the flying disc's model rather than at its exact center.
    const DRAIN_ANIM_Y_OFFSET = 0;

    if (this.drainAnim && this.drainAnimFinishing) {
      if (this.drainLastDiscPos) {
        this.drainAnim.setPosition(this.drainLastDiscPos);
      }
      if (this.drainAnim.isAnimFinished()) this.clearDrainAnim();
      return;
    }

    const drainType = this.rules.combatDamage.drainAnimationType;
    const disc = this.gameObject.drainedBy;
    if (disc && drainType && !disc.isDisposed && !disc.isDestroyed && this.renderableManager) {
      if (!this.drainAnim) {
        this.drainAnim = this.renderableManager.createAnim(drainType, (anim: any) => {
          const p = disc.position.worldPosition.clone();
          p.y += DRAIN_ANIM_Y_OFFSET;
          anim.setPosition(p);
        });
        // Render behind the disc so the animation doesn't cover it.
        this.drainAnim.setRenderOrder(-999995);
        this.drainAnim.create3DObject();
      }
      const pos = disc.position.worldPosition.clone();
      pos.y += DRAIN_ANIM_Y_OFFSET;
      this.drainAnim.setPosition(pos);
      this.drainLastDiscPos = pos;
    } else if (this.drainAnim && !this.drainAnimFinishing) {
      // Drain ended — let the animation play 4 full loops then stop.
      this.drainAnimFinishing = true;
      this.drainAnim.playRemainingLoops(4);
    }
  }

  /** 清理 drain 动画。 */
  clearDrainAnim(): void {
    this.drainAnimFinishing = false;
    this.drainLastDiscPos = undefined;
    if (this.drainAnim) {
      this.renderableManager?.container.remove(this.drainAnim);
      this.drainAnim.dispose();
      this.drainAnim = undefined;
    }
  }

  /** 将动画类型归一化到 [实际 animObjects 类型, 槽位]。 */
  getNormalizedAnimType(type: AnimationType): [AnimationType, number] {
    let index = 0;
    let resolved = type;
    if (ANIM_NORMALIZE.has(type)) {
      const pair = ANIM_NORMALIZE.get(type)!;
      resolved = pair[0];
      index = pair[1];
    }
    return [resolved, index];
  }

  /** 指定类型对应动画对象是否已 STOPPED。 */
  hasObjectWithStoppedAnimation(type: AnimationType): boolean {
    const [normType, idx] = this.getNormalizedAnimType(type);
    const list = this.animObjects.get(normType);
    if (list) {
      const anim = this.animations.get(list[idx]);
      if (!anim) throw new Error(`Missing animation for type '${AnimationType[type]}'`);
      if (anim.getState() === AnimationState.STOPPED) return true;
    }
    return false;
  }

  /** 按血量计算损伤帧类型（民用 2 帧时红血降级为黄帧）。 */
  computeDamageType(health: number): DamageType {
    if (!health) return DamageType.DESTROYED;
    let type: DamageType;
    if (health > 100 * this.rules.audioVisual.conditionYellow) {
      type = DamageType.NORMAL;
    } else if (health > 100 * this.rules.audioVisual.conditionRed) {
      type = DamageType.CONDITION_YELLOW;
    } else {
      type = DamageType.CONDITION_RED;
    }
    // Civilian buildings (non-military, non-bio reactor) have only 2 frames:
    // 0=normal, 1=damaged. Both yellow and red health show the damaged frame.
    if (
      !this.gameObject.bioReactorPowerTrait &&
      !this.objectRules.isBaseDefense &&
      type === DamageType.CONDITION_RED
    ) {
      type = DamageType.CONDITION_YELLOW;
    }
    return type;
  }

  /** 按损伤类型刷新主图/墙/动画/火焰可见性。 */
  updateImage(damageType: DamageType): void {
    const destroyed = damageType === DamageType.DESTROYED;
    if (destroyed) {
      if (this.objectRules.leaveRubble && this.rubbleObj) {
        this.rubbleObj.get3DObject().visible = true;
      }
      if (this.mainObj) this.mainObj.get3DObject().visible = false;
    } else if (this.gameObject.wallTrait) {
      this.updateWallImage(this.gameObject.wallTrait.wallType, damageType);
    } else {
      this.updateMainObjFrame(!!this.gameObject.garrisonTrait?.isOccupied(), damageType);
    }

    if (this.bib) {
      if (destroyed) this.bib.get3DObject().visible = false;
      this.bib.setFrame(damageType !== DamageType.NORMAL ? 1 : 0);
    }
    if (this.turret && destroyed) this.turret.visible = false;

    this.animObjects.forEach((objects, animType) => {
      if (animType !== AnimationType.BUILDUP && animType !== AnimationType.UNBUILD) {
        if (destroyed) {
          objects.forEach((obj) => {
            obj.get3DObject().visible = false;
            obj.get3DObject().userData.intendedVisible = false;
          });
        }
        objects.forEach((obj, idx) => {
          const anim = this.animations.get(obj);
          const isDamaged = damageType !== DamageType.NORMAL;
          const prop = this.animArtProps.getByType(animType)[idx];
          if (!isDamaged || prop.damagedArt) {
            const imageName = isDamaged ? prop.damagedImage : prop.image;
            const shpFile = this.animShpFiles.get(imageName);
            anim.props.setArt(isDamaged ? prop.damagedArt : prop.art);
            anim.rewind();
            if (shpFile) {
              obj.builder.setFrameOffset(this.aggregatedImageData.imageIndexes.get(shpFile));
            }
          } else {
            console.warn(
              `<${this.gameObject.name}>: Missing damaged anim ${AnimationType[animType]},` + idx,
            );
          }
        });
      }
    });

    // 火焰层：军事驻军仅红血显示；一般建筑非正常血显示
    let fireVisible: boolean;
    if (this.objectRules.isBaseDefense && this.gameObject.garrisonTrait) {
      fireVisible = damageType === DamageType.CONDITION_RED && !destroyed;
    } else {
      fireVisible = damageType !== DamageType.NORMAL && !destroyed;
    }
    this.fireObjects?.forEach((obj) => {
      obj.get3DObject().visible = fireVisible;
      const anim = this.animations.get(obj);
      anim.rewind();
      const startSound = (anim.props.getArt() as any).getString("StartSound");
      if (startSound) this.handleSoundChange(startSound, obj, fireVisible, 0.15);
    });

    if (
      !destroyed &&
      this.gameObject.bioReactorPowerTrait &&
      this.currentAnimType === AnimationType.IDLE
    ) {
      this.setActiveAnimationVisible();
    }
  }

  /**
   * 主图帧选择：
   * 驻军 4 帧 SHP：0=空正常,1=空受损,2=驻军正常,3=驻军受损。
   * Bio Reactor 无驻军帧；未驻军军事建筑直接用 damageType 作帧号。
   */
  updateMainObjFrame(occupied: boolean, damageType: DamageType): void {
    let frame: number;
    if (occupied && !this.gameObject.bioReactorPowerTrait) {
      frame = damageType === DamageType.NORMAL ? 2 : 3;
    } else if (!this.gameObject.bioReactorPowerTrait && this.objectRules.isBaseDefense) {
      // Unoccupied military building: damage type as frame index (0/1/2)
      frame = damageType;
    } else {
      frame = damageType;
    }

    if (this.mainShpFile && this.mainObj) {
      const frameCount = this.shpFrameInfos.get(this.mainShpFile).frameCount;
      if (frame >= frameCount) {
        console.warn(
          `Building ${this.objectRules.name} has damage frame ` +
            frame +
            ` (occupied=${occupied}, damageType=${DamageType[damageType]}) out of bounds`,
        );
        frame = DamageType.NORMAL;
      }
      this.mainObj.setFrame(frame);
    }
  }

  /** 墙体帧 = facing + damageType * facingCount。 */
  updateWallImage(facing: number, damageType: DamageType): void {
    if (this.mainObj && this.mainShpFile) {
      const facingCount =
        this.shpFrameInfos.get(this.mainShpFile).frameCount < wallTypes.length
          ? 1
          : wallTypes.length;
      if (facingCount - 1 < facing) {
        facing = facingCount - 1;
        console.warn(
          `Building ${this.objectRules.name} is a wall but has fewer frames than facings.`,
        );
      }
      this.mainObj.setFrame(facing + damageType * facingCount);
    }
  }

  /** 创建主对象/占位符/废墟/动画/火焰/炮塔/地基/射程圈。 */
  createObjects(parent: any): void {
    const foundation = this.objectArt.foundation;
    if (this.debugFrame.value) {
      const wire = DebugUtils.createWireframe(foundation, this.objectArt.height);
      parent.add(wire);
    }
    const translation = new MapSpriteTranslation(foundation.width, foundation.height);
    const { spriteOffset, anchorPointWorld } = translation.compute();
    const drawOffset = (this.spriteOffset = this.computeSpriteAnchorOffset(spriteOffset));
    const spriteWrap = (this.spriteWrap = new THREE.Object3D());
    spriteWrap.matrixAutoUpdate = false;
    let attachTarget: any = spriteWrap;
    const localOffset = { ...drawOffset };
    let hasZShape = false;
    const zMove = this.objectArt.zShapePointMove;
    if (zMove.length) {
      attachTarget = new THREE.Object3D();
      attachTarget.matrixAutoUpdate = false;
      spriteWrap.add(attachTarget);
      hasZShape = true;
      const zx = -zMove[0] / Coords.ISO_TILE_SIZE;
      const zy = -zMove[1] / Coords.ISO_TILE_SIZE;
      const zTrans = new MapSpriteTranslation(zx, zy);
      const { spriteOffset: zs, anchorPointWorld: za } = zTrans.compute();
      attachTarget.position.x = za.x;
      attachTarget.position.z = za.y;
      attachTarget.updateMatrix();
      localOffset.x += zs.x;
      localOffset.y += zs.y;
    }

    if (this.mainShpFile) {
      this.mainObj = this.createMainObject(this.mainShpFile, localOffset, hasZShape);
      if (this.gameObject.slaveMinerTrait) this.mainObj.setBatched(false);
      this.mainObj.create3DObject();
      attachTarget.add(this.mainObj.get3DObject());
      if (this.mainObj.getFlat()) {
        MathUtils.translateTowardsCamera(
          this.mainObj.get3DObject(),
          this.camera,
          +Coords.ISO_WORLD_SCALE,
        );
        this.mainObj.get3DObject().updateMatrix();
      }
    } else {
      this.placeholderObj = new DebugRenderable(
        foundation,
        this.objectArt.height,
        this.palette,
      );
      this.placeholderObj.setBatched(this.useSpriteBatching);
      if (this.useSpriteBatching) this.placeholderObj.setBatchPalettes(this.paletteRemaps);
      this.placeholderObj.create3DObject();
      parent.add(this.placeholderObj.get3DObject());
    }

    if (this.objectRules.leaveRubble) {
      this.rubbleObj = this.createRubbleObject(drawOffset);
      if (this.rubbleObj) {
        this.rubbleObj.setExtraLight(this.shpExtraLight);
        this.rubbleObj.create3DObject();
        this.rubbleObj.get3DObject().visible = false;
        spriteWrap.add(this.rubbleObj.get3DObject());
      }
    }

    const animNodes = this.createAnimObjects(localOffset, hasZShape);
    animNodes.forEach((node) => attachTarget.add(node));

    this.fireObjects = this.createFireObjects(drawOffset);
    this.fireObjects.forEach((obj) => spriteWrap.add(obj.get3DObject()));

    if (this.objectRules.turret) {
      const { turret, turretRot } = this.createTurretObject(drawOffset, anchorPointWorld);
      this.turret = turret;
      this.turretRot = turretRot;
      spriteWrap.add(this.turret);
    }

    if (this.bibShpFile) {
      this.bib = this.createBibObject(this.bibShpFile, drawOffset);
      this.bib.create3DObject();
      const bibNode = this.bib.get3DObject();
      MathUtils.translateTowardsCamera(bibNode, this.camera, -1);
      bibNode.updateMatrix();
      spriteWrap.add(this.bib.get3DObject());
    }

    if (this.gameObject.primaryWeapon || this.gameObject.rules.hasRadialIndicator) {
      const rangeTiles =
        this.gameObject.psychicDetectorTrait?.radiusTiles ??
        this.gameObject.gapGeneratorTrait?.radiusTiles ??
        this.gameObject.primaryWeapon?.range;
      if (rangeTiles) {
        const circle = (this.rangeCircle = this.createRangeCircle(rangeTiles));
        const wrapper = (this.rangeCircleWrapper = new THREE.Object3D());
        wrapper.matrixAutoUpdate = false;
        wrapper.position.x = anchorPointWorld.x / 2;
        wrapper.position.z = anchorPointWorld.y / 2;
        wrapper.updateMatrix();
        wrapper.visible = false;
        wrapper.add(circle);
        parent.add(wrapper);
      }
    }

    spriteWrap.position.x = anchorPointWorld.x;
    spriteWrap.position.z = anchorPointWorld.y;
    spriteWrap.updateMatrix();
    parent.add(spriteWrap);
  }

  /** 合成 draw offset。 */
  computeSpriteAnchorOffset(offset: any): any {
    const artOffset = this.objectArt.getDrawOffset();
    return { x: offset.x + artOffset.x, y: offset.y + artOffset.y };
  }

  /** 构建主 SHP Renderable（带炮塔时可能 flat）。 */
  createMainObject(shpFile: any, offset: any, forceFlat = false): any {
    let flat = false;
    if (this.objectRules.turret && this.objectRules.name !== "CAOUTP") flat = true;
    const renderable = ShpRenderable.factory(
      this.aggregatedImageData.file,
      this.palette,
      this.camera,
      offset,
      this.objectArt.hasShadow,
      0,
      !flat,
      0,
      forceFlat,
    );
    renderable.setSize(shpFile);
    renderable.setFrameOffset(this.aggregatedImageData.imageIndexes.get(shpFile));
    renderable.setBatched(this.useSpriteBatching);
    if (this.useSpriteBatching) renderable.setBatchPalettes(this.paletteRemaps);
    renderable.setFlat(flat);
    return renderable;
  }

  /** 废墟帧（需 ≥4 帧，使用第 4 帧）。 */
  createRubbleObject(offset: any): any {
    const shpFile = this.mainShpFile;
    if (!shpFile) return;
    const renderable = ShpRenderable.factory(
      this.aggregatedImageData.file,
      this.isoPalette,
      this.camera,
      offset,
      this.objectArt.hasShadow,
    );
    renderable.setSize(shpFile);
    if (this.shpFrameInfos.get(shpFile).frameCount < 4) {
      console.warn(
        `Building image ${this.objectArt.imageName} has no rubble frame (missing 4th frame)`,
      );
      return;
    }
    renderable.setFrameOffset(this.aggregatedImageData.imageIndexes.get(shpFile));
    renderable.setBatched(this.useSpriteBatching);
    if (this.useSpriteBatching) renderable.setBatchPalettes([this.isoPalette]);
    renderable.setFlat(true);
    renderable.setFrame(3);
    return renderable;
  }

  /** 按 animArtProps 创建各类型动画层节点。 */
  createAnimObjects(offset: any, forceFlat: boolean): any[] {
    const nodes: any[] = [];
    this.animArtProps.getAll().forEach((entries, type) => {
      const created: any[] = [];
      let depth = 1;
      for (const entry of entries) {
        const shpFile = this.animShpFiles.get(entry.image);
        if (shpFile) {
          const obj = this.createAnimObject(entry, shpFile, offset, depth++, forceFlat);
          if (obj) {
            nodes.push(obj.get3DObject());
            created.push(obj);
          }
        }
      }
      this.animObjects.set(type, created);
    });
    return nodes;
  }

  /** 按 DamageFireOffset* 创建损伤火焰动画。 */
  createFireObjects(offset: any): any[] {
    const result: any[] = [];
    let idx = 0;
    for (;;) {
      const posStr = this.objectArt.art.getString("DamageFireOffset" + idx++);
      if (!posStr) break;
      const fireNames = this.rules.audioVisual.fireNames;
      const fireName = fireNames[getRandomInt(0, fireNames.length - 1)];
      let shpFile: any;
      try {
        shpFile = this.imageFinder.find(fireName, this.objectArt.useTheaterExtension);
      } catch (e: any) {
        if (e instanceof ImageFinder.MissingImageError) {
          console.warn(e.message);
          continue;
        }
        throw e;
      }
      const parts = posStr.split(/\.|,/).filter((s) => s !== "");
      const ox = parseInt(parts[0], 10);
      const oy = parseInt(parts[1], 10);
      const palette = this.animPalette;
      const builder = new ShpBuilder(
        shpFile,
        palette,
        this.camera,
        Coords.ISO_WORLD_SCALE,
        true,
        3,
      );
      builder.setOffset({ x: offset.x + ox, y: offset.y + oy });
      const renderable = new ShpRenderable(builder);
      renderable.setBatched(this.useSpriteBatching);
      if (this.useSpriteBatching) renderable.setBatchPalettes([palette]);
      renderable.create3DObject();
      renderable.get3DObject().visible = false;
      const animDef = this.art.getAnimation(fireName);
      const props = new AnimProps(animDef.art, shpFile);
      this.animations.set(renderable, new Animation(props, this.gameSpeed));
      result.push(renderable);
    }
    return result;
  }

  /** 为建筑武器创建一次性枪口闪光动画。 */
  createMuzzleFlashAnim(offset: any, manager: any): any {
    if (!this.objectArt.muzzleFlash?.length) return;
    const flashIdx = getRandomInt(0, this.objectArt.muzzleFlash.length - 1);
    const flashOffset = this.objectArt.muzzleFlash[flashIdx];
    const weapon =
      this.gameObject.owner.country?.side === SideType.GDI
        ? this.gameObject.primaryWeapon
        : this.gameObject.secondaryWeapon;
    if (!weapon) return;
    const animList = weapon.rules.anim;
    if (!animList.length) return;
    const animName = animList[getRandomInt(0, animList.length - 1)];
    const extra = { x: offset.x + flashOffset.x, y: offset.y + flashOffset.y };
    return manager.createAnim(
      animName,
      (anim: any) => {
        anim.extraOffset = extra;
      },
      true,
    );
  }

  /** 创建单个动画层 Renderable（BUILDUP/UNBUILD 按 buildupTime 速率）。 */
  createAnimObject(
    entry: any,
    shpFile: any,
    offset: any,
    depth: number,
    forceFlat: boolean,
  ): any {
    const props = new AnimProps(entry.art, shpFile);
    if (
      entry.type === AnimationType.BUILDUP ||
      entry.type === AnimationType.UNBUILD
    ) {
      const frames = props.shadow ? shpFile.numImages / 2 : shpFile.numImages;
      props.rate = frames / (60 * this.rules.general.buildupTime);
    }
    const at = { x: offset.x + entry.offset.x, y: offset.y + entry.offset.y };
    const isTankBunkerRear =
      entry.type === AnimationType.SPECIAL && this.gameObject.tankBunkerTrait && depth % 2 === 0;
    const depthOffset = isTankBunkerRear ? 0 : depth;
    const renderable = ShpRenderable.factory(
      this.aggregatedImageData.file,
      this.palette,
      this.camera,
      at,
      props.shadow,
      0,
      !entry.flat,
      depthOffset,
      forceFlat && !entry.flat,
    );
    renderable.setSize(shpFile);
    renderable.setFrameOffset(this.aggregatedImageData.imageIndexes.get(shpFile));
    renderable.setBatched(this.useSpriteBatching);
    if (this.useSpriteBatching) renderable.setBatchPalettes(this.paletteRemaps);
    // Tank Bunker rear wall: independent batch so we control depthTest
    if (isTankBunkerRear) {
      renderable.setBatched(false);
      renderable.setPalette(this.palette);
    }
    renderable.setFlat(entry.flat);
    if (entry.translucent || entry.translucency > 0) renderable.setForceTransparent(true);
    renderable.create3DObject();
    // Rear wall: disable depthTest so it renders on top of body
    // but the tank (separate Object3D) can still render via depth buffer.
    // 孪生为 `mesh && (material.depthTest = false) && (material.depthWrite = false)`：
    // 赋值表达式求值为 false，depthWrite 短路从不执行——只关 depthTest。
    if (isTankBunkerRear && renderable.getShapeMesh()) {
      renderable.getShapeMesh().material.depthTest = false;
    }
    this.animations.set(renderable, new Animation(props, this.gameSpeed));
    return renderable;
  }

  /** 地基 bib Renderable。 */
  createBibObject(shpFile: any, offset: any): any {
    const renderable = ShpRenderable.factory(
      this.aggregatedImageData.file,
      this.palette,
      this.camera,
      offset,
      this.objectArt.hasShadow,
    );
    renderable.setSize(shpFile);
    renderable.setFrameOffset(this.aggregatedImageData.imageIndexes.get(shpFile));
    renderable.setBatched(this.useSpriteBatching);
    if (this.useSpriteBatching) renderable.setBatchPalettes(this.paletteRemaps);
    renderable.setFlat(true);
    return renderable;
  }

  /** 创建炮塔 + 炮管（VXL 或 SHP）。 */
  createTurretObject(spriteOffset: any, anchorPointWorld: any): { turret: any; turretRot: any } {
    this.turretBuilders = [];
    const turretRoot = new THREE.Object3D();
    turretRoot.matrixAutoUpdate = false;
    const rot = new THREE.Object3D();
    rot.matrixAutoUpdate = false;
    const animName = this.objectRules.turretAnim;
    const animPos = { x: this.objectRules.turretAnimX, y: this.objectRules.turretAnimY };
    let turretMesh: any;

    if (this.objectRules.turretAnimIsVoxel) {
      const hasHva = !this.objectArt.noHva;
      const key = animName.toLowerCase() + ".vxl";
      const vxl = this.voxels.get(key);
      if (vxl) {
        const hva = hasHva ? this.voxelAnims.get(key.replace(".vxl", ".hva")) : undefined;
        const builder = this.vxlBuilderFactory.create(vxl, hva, this.paletteRemaps, this.palette);
        this.turretBuilders.push(builder);
        turretMesh = builder.build();
        turretMesh.children.forEach((c: any) => {
          c.castShadow = false;
        });
      } else {
        console.warn(
          `Turret missing for building ${this.type}. Vxl file ${key} not found. `,
        );
      }
      if (animName.toLowerCase().includes("tur")) {
        const barlKey = key.replace("tur", "barl");
        const barlVxl = this.voxels.get(barlKey);
        if (barlVxl) {
          const barlHva = hasHva
            ? this.voxelAnims.get(barlKey.replace(".vxl", ".hva"))
            : undefined;
          const barlBuilder = this.vxlBuilderFactory.create(
            barlVxl,
            barlHva,
            this.paletteRemaps,
            this.palette,
          );
          this.turretBuilders.push(barlBuilder);
          const barlMesh = barlBuilder.build();
          barlMesh.children.forEach((c: any) => {
            c.castShadow = false;
          });
          rot.add(barlMesh);
        }
      }
      const screen = Coords.screenDistanceToWorld(animPos.x, animPos.y);
      turretRoot.position.x = -anchorPointWorld.x + screen.x;
      turretRoot.position.z = -anchorPointWorld.y + screen.y;
    } else {
      let shpFile: any;
      try {
        shpFile = this.imageFinder.find(animName, this.objectArt.useTheaterExtension);
      } catch (e: any) {
        if (!(e instanceof ImageFinder.MissingImageError)) throw e;
        console.warn(e.message);
      }
      if (shpFile) {
        const builder = new ShpBuilder(
          shpFile,
          this.palette,
          this.camera,
          Coords.ISO_WORLD_SCALE,
          true,
          2,
        );
        builder.setBatched(this.useSpriteBatching);
        if (this.useSpriteBatching) builder.setBatchPalettes(this.paletteRemaps);
        this.turretBuilders.push(builder);
        builder.setOffset({ x: spriteOffset.x + animPos.x, y: spriteOffset.y + animPos.y });
        turretMesh = builder.build();
      }
    }

    if (turretMesh) rot.add(turretMesh);
    turretRoot.add(rot);
    MathUtils.translateTowardsCamera(
      turretRoot,
      this.camera,
      -(
        this.objectRules.turretAnimZAdjust +
        this.objectRules.turretAnimY / Math.cos(this.camera.rotation.y)
      ) * Coords.ISO_WORLD_SCALE,
    );
    turretRoot.updateMatrix();
    return { turret: turretRoot, turretRot: rot };
  }

  /** 射程圆网格。 */
  createRangeCircle(rangeTiles: number): any {
    const radius = rangeTiles * Coords.getWorldTileSize();
    const color = this.gameObject.owner.color;
    const circle = OverlayUtils.createGroundCircle(radius, color.asHex());
    circle.matrixAutoUpdate = false;
    circle.updateMatrix();
    return circle;
  }

  /** 切换射程圈可见性；超载武器变化时重建圆。 */
  toggleRangeCircleVisibility(visible: boolean): void {
    if (!this.rangeCircleWrapper) return;
    this.rangeCircleWrapper.visible = visible;
    const overpowered = this.gameObject.overpoweredTrait?.isOverpowered();
    if (overpowered !== this.lastOverpowered) {
      this.lastOverpowered = overpowered;
      if (this.rangeCircle) {
        this.rangeCircleWrapper.remove(this.rangeCircle);
        this.rangeCircle.material.dispose();
        this.rangeCircle.geometry.dispose();
      }
      const range = this.gameObject.overpoweredTrait?.getWeapon()?.range;
      if (range) {
        this.rangeCircle = this.createRangeCircle(range);
        this.rangeCircleWrapper.add(this.rangeCircle);
      }
    }
  }

  /**
   * 设置某类型动画层可见性（可选只改单个槽位 index=-1 全部）。
   * 同步 Report/StartSound 音效。
   */
  setAnimationVisibility(type: AnimationType, visible: boolean, index = -1): void {
    let list = this.animObjects.get(type);
    if (list === undefined) {
      throw new Error(`Missing animObjects for animType "${AnimationType[type]}"`);
    }
    if (index !== -1) {
      if (index >= list.length) {
        throw new RangeError(
          `Index ${index} exceeds length of animation objects (${list.length}) ` +
            "of type " +
            AnimationType[type],
        );
      }
      list = [list[index]];
    }
    for (const obj of list) {
      obj.get3DObject().visible = visible;
      obj.get3DObject().userData.intendedVisible = visible;
      const art = this.animations.get(obj)!.props.getArt() as any;
      let sound = art.getString("Report");
      sound = sound || art.getString("StartSound");
      if (sound) this.handleSoundChange(sound, obj, visible);
    }
  }

  /** 激活层可见性（电力/驻军 BioReact 分支；精炼厂仅第 0 槽）。 */
  setActiveAnimationVisible(): void {
    let entries = this.animArtProps.getByType(AnimationType.ACTIVE);
    // 精炼厂矿堆（GAREFNL1-4 槽）——数据通常只带 GAREFNL1 一个 shp，
    // 固定只渲染第 0 槽，避免缺 GAREFNL2/3/4 触发 "No image file found"。
    if (this.objectRules.refinery) entries = [entries[0]];
    entries.forEach((entry, idx) => {
      let show = this.powered || entry.showWhenUnpowered;
      if (this.gameObject.bioReactorPowerTrait) {
        const occupied = !!this.gameObject.garrisonTrait?.isOccupied();
        if (idx === 0) show = show && !occupied;
        if (idx === 1) show = show && occupied;
      }
      try {
        this.setAnimationVisibility(AnimationType.ACTIVE, show, idx);
      } catch (e) {
        if (!(e instanceof RangeError)) throw e;
      }
      if (this.gameObject.bioReactorPowerTrait) {
        const objs = this.animObjects.get(AnimationType.ACTIVE);
        if (objs && idx < objs.length) objs[idx].setShadowVisible(false);
      }
    });
  }

  /** 待机层可见性（电力 / BioReact 驻军）。 */
  setIdleAnimationVisible(): void {
    const entries = this.animArtProps.getByType(AnimationType.IDLE);
    entries.forEach((entry, idx) => {
      let show = this.powered || entry.showWhenUnpowered;
      if (this.gameObject.bioReactorPowerTrait) {
        show = show && !this.gameObject.garrisonTrait?.isOccupied();
      }
      try {
        this.setAnimationVisibility(AnimationType.IDLE, show, idx);
      } catch (e) {
        if (!(e instanceof RangeError)) throw e;
      }
    });
  }

  /** 切换电力：暂停/恢复 ACTIVE/IDLE/SUPER 动画。 */
  setPowered(on: boolean): void {
    this.powered = on;
    if (this.currentAnimType === AnimationType.IDLE) {
      this.setActiveAnimationVisible();
      this.setIdleAnimationVisible();
    }
    if (this.objectRules.superWeapon && this.hasAnimation(AnimationType.SUPER)) {
      const [normType, idx] = this.getNormalizedAnimType(AnimationType.SUPER_CHARGE_LOOP);
      const list = this.animObjects.get(normType);
      if (list === undefined) {
        throw new Error(`Missing anim object for normalized anim type "${AnimationType[normType]}"`);
      }
      const obj = list[idx];
      const anim = this.animations.get(obj)!;
      if (on) anim.unpause();
      else anim.pause();
    } else {
      this.animObjects.get(AnimationType.ACTIVE).forEach((obj, i) => {
        const anim = this.animations.get(obj);
        if (anim) {
          if (!on && this.animArtProps.getByType(AnimationType.ACTIVE)[i].pauseWhenUnpowered) {
            anim.pause();
          } else {
            anim.unpause();
          }
        }
      });
      this.animObjects.get(AnimationType.IDLE).forEach((obj, i) => {
        const anim = this.animations.get(obj);
        if (anim) {
          if (!on && this.animArtProps.getByType(AnimationType.IDLE)[i].pauseWhenUnpowered) {
            anim.pause();
          } else {
            anim.unpause();
          }
        }
      });
    }
  }

  /** 是否有该类型动画（IDLE 恒真）。 */
  hasAnimation(type: AnimationType): boolean {
    if (type === AnimationType.IDLE) return true;
    const [norm] = this.getNormalizedAnimType(type);
    return this.animObjects.has(norm) && !!this.animObjects.get(norm)!.length;
  }

  /**
   * 切换当前动画：先隐藏所有已知层，再按 type 分支显示并 start。
   * 无目标动画则回落到 IDLE。BUILDUP/UNBUILD 隐藏主体；工厂展开隐藏主体。
   */
  setAnimation(type: AnimationType, now: number): void {
    if (!this.gameObject.healthTrait.health) {
      throw new Error("We can't switch building animation for a destroyed building");
    }
    if (!this.hasAnimation(type)) type = AnimationType.IDLE;
    this.currentAnimType = type;

    this.setAnimationVisibility(AnimationType.IDLE, false);
    this.setAnimationVisibility(AnimationType.SPECIAL, false);
    this.setAnimationVisibility(AnimationType.PRODUCTION, false);
    this.setAnimationVisibility(AnimationType.SUPER, false);
    this.setAnimationVisibility(AnimationType.BUILDUP, false);
    this.setAnimationVisibility(AnimationType.UNBUILD, false);
    this.setAnimationVisibility(AnimationType.FACTORY_DEPLOYING, false);
    this.setAnimationVisibility(AnimationType.FACTORY_ROOF_DEPLOYING, false);
    this.setActiveAnimationVisible();

    if (type !== AnimationType.BUILDUP && type !== AnimationType.UNBUILD) {
      if (this.mainObj) this.mainObj.get3DObject().visible = true;
      if (this.bib) this.bib.get3DObject().visible = true;
      if (this.turret) this.turret.visible = true;
    } else {
      if (this.mainObj) this.mainObj.get3DObject().visible = false;
      if (this.bib) this.bib.get3DObject().visible = false;
      if (this.turret) this.turret.visible = false;
    }
    if (type === AnimationType.FACTORY_DEPLOYING || type === AnimationType.FACTORY_ROOF_DEPLOYING) {
      if (this.mainObj) this.mainObj.get3DObject().visible = false;
    }

    switch (type) {
      case AnimationType.PRODUCTION: {
        this.setAnimationVisibility(AnimationType.PRODUCTION, true);
        this.animObjects.get(AnimationType.PRODUCTION)!.forEach((obj) => {
          this.animations.get(obj)!.start(now);
        });
        break;
      }
      case AnimationType.BUILDUP: {
        this.setAnimationVisibility(AnimationType.ACTIVE, false);
        this.setAnimationVisibility(AnimationType.BUILDUP, true);
        this.animObjects.get(AnimationType.BUILDUP)!.forEach((obj) => {
          this.animations.get(obj)!.start(now);
        });
        break;
      }
      case AnimationType.UNBUILD: {
        this.setAnimationVisibility(AnimationType.ACTIVE, false);
        this.setAnimationVisibility(AnimationType.UNBUILD, true);
        this.animObjects.get(AnimationType.UNBUILD)!.forEach((obj) => {
          this.animations.get(obj)!.start(now);
        });
        break;
      }
      case AnimationType.FACTORY_DEPLOYING: {
        if (this.hasAnimation(AnimationType.FACTORY_DEPLOYING) && this.objectRules.factory) {
          this.setAnimationVisibility(AnimationType.FACTORY_DEPLOYING, true);
          this.animObjects.get(AnimationType.FACTORY_DEPLOYING)!.forEach((obj) => {
            this.animations.get(obj)!.start(now);
          });
          break;
        }
        // fallthrough
      }
      case AnimationType.FACTORY_ROOF_DEPLOYING: {
        if (this.hasAnimation(AnimationType.FACTORY_ROOF_DEPLOYING) && this.objectRules.factory) {
          this.setAnimationVisibility(AnimationType.FACTORY_ROOF_DEPLOYING, true);
          this.animObjects.get(AnimationType.FACTORY_ROOF_DEPLOYING)!.forEach((obj) => {
            this.animations.get(obj)!.start(now);
          });
          break;
        }
        // fallthrough
      }
      case AnimationType.SPECIAL_REPAIR_START:
      case AnimationType.SPECIAL_REPAIR_LOOP:
      case AnimationType.SPECIAL_REPAIR_END:
      case AnimationType.SPECIAL_DOCKING: {
        if (
          this.hasAnimation(AnimationType.SPECIAL) &&
          ((type === AnimationType.SPECIAL_DOCKING && this.objectRules.refinery) ||
            (type !== AnimationType.SPECIAL_DOCKING && this.objectRules.unitRepair))
        ) {
          const [norm, idx] = this.getNormalizedAnimType(type);
          this.setAnimationVisibility(norm, true, idx);
          const obj = this.animObjects.get(norm)![idx];
          this.animations.get(obj)!.start(now);
          break;
        }
        // fallthrough
      }
      case AnimationType.SPECIAL_SHOOT: {
        if (this.objectRules.isBaseDefense) {
          this.setAnimationVisibility(AnimationType.ACTIVE, false);
          const [norm, idx] = this.getNormalizedAnimType(type);
          this.setAnimationVisibility(norm, true, idx);
          const obj = this.animObjects.get(norm)![idx];
          this.animations.get(obj)!.start(now);
          break;
        }
        // fallthrough
      }
      case AnimationType.SUPER_CHARGE_START:
      case AnimationType.SUPER_CHARGE_LOOP:
      case AnimationType.SUPER_CHARGE_END: {
        if (this.objectRules.superWeapon && this.hasAnimation(AnimationType.SUPER)) {
          const [norm, idx] = this.getNormalizedAnimType(type);
          this.setAnimationVisibility(norm, true, idx);
          const obj = this.animObjects.get(norm)![idx];
          this.animations.get(obj)!.start(now);
          break;
        }
        // fallthrough
      }
      case AnimationType.SPECIAL_GRIND: {
        // Grinder — SpecialAnim replaces ActiveAnim while grinding.
        if (this.objectRules.grinding && this.hasAnimation(AnimationType.SPECIAL)) {
          const [norm, idx] = this.getNormalizedAnimType(type);
          if (this.hasAnimation(AnimationType.ACTIVE)) {
            this.setAnimationVisibility(AnimationType.ACTIVE, false);
          }
          this.setAnimationVisibility(norm, true, idx);
          const obj = this.animObjects.get(norm)![idx];
          this.animations.get(obj)!.start(now);
          // play the grinder's grind sound ([AudioVisual] EnterGrinderSound=)
          if (this.rules.audioVisual.enterGrinderSound) {
            this.worldSound?.playEffect(
              this.rules.audioVisual.enterGrinderSound,
              this.gameObject,
              this.gameObject.owner,
            );
          }
          break;
        }
        // fallthrough
      }
      case AnimationType.IDLE:
      default: {
        this.currentAnimType = AnimationType.IDLE;
        if (this.objectRules.superWeapon && this.hasAnimation(AnimationType.SUPER)) {
          this.setAnimationVisibility(AnimationType.SUPER, true, 0);
          const superObj = this.animObjects.get(AnimationType.SUPER)![0];
          this.animations.get(superObj)!.start(now);
        } else {
          this.setAnimationVisibility(
            AnimationType.IDLE,
            !this.gameObject.bioReactorPowerTrait,
          );
          this.animObjects.get(AnimationType.IDLE)!.forEach((obj) => {
            this.animations.get(obj)!.start(now);
          });
          // Slave Miner: hide shadow on IDLE animation overlays
          if (this.gameObject.slaveMinerTrait) {
            this.animObjects.get(AnimationType.IDLE)!.forEach((obj) => {
              obj.setShadowVisible(false);
            });
          }
          // Sync power state after IDLE becomes visible
          this.setPowered(this.powered);
        }
      }
    }
  }

  /** 对归一化后的动画对象执行回调。 */
  doWithAnimation(type: AnimationType, fn: (anim: Animation, obj: any) => void): void {
    const [norm, idx] = this.getNormalizedAnimType(type);
    let list = this.animObjects.get(norm);
    if (list === undefined) {
      throw new Error(`Missing animObjects for anim type "${AnimationType[norm]}"`);
    }
    if (norm !== type) list = [list[idx]];
    list.forEach((obj) => {
      fn(this.animations.get(obj)!, obj);
    });
  }

  /** 对当前动画执行回调。 */
  doWithCurrentAnimation(fn: (anim: Animation, obj: any) => void): void {
    this.doWithAnimation(this.currentAnimType as AnimationType, fn);
  }

  /** 当前动画 endLoop（用于状态退出）。 */
  endCurrentAnimation(): void {
    this.doWithCurrentAnimation((anim) => anim.endLoop());
  }

  /** 动画 Report/StartSound 播放与停止（仅 loop 停止）。 */
  handleSoundChange(
    name: string,
    obj: any,
    playing: boolean,
    volume = 1,
  ): void {
    if (playing) {
      const existing = this.animSounds.get(obj);
      if (existing && existing.isPlaying()) return;
      const sound = this.worldSound?.playEffect(name, this.gameObject, this.gameObject.owner, volume);
      if (sound) this.animSounds.set(obj, sound);
    } else {
      const sound = this.animSounds.get(obj);
      if (sound && sound.isLoop) {
        sound.stop();
        this.animSounds.delete(obj);
      }
    }
  }

  /** 注册到 renderableManager；播环境音；通知 plugins/pipOverlay。 */
  onCreate(manager: any): void {
    this.renderableManager = manager;
    this.plugins.forEach((p) => p.onCreate(manager));
    if (this.objectRules.ambientSound) {
      this.ambientSound = this.worldSound?.playEffect(
        this.objectRules.ambientSound,
        this.gameObject,
        undefined,
        0.25,
      );
    }
    this.pipOverlay?.onCreate(manager);
  }

  /** 移除时停音效；被毁时按 DeathType 决定是否播爆炸。 */
  onRemove(manager: any): void {
    this.clearDrainAnim();
    this.renderableManager = undefined;
    this.plugins.forEach((p) => p.onRemove(manager));
    this.animSounds.forEach((sound) => sound.stop());
    this.ambientSound?.stop();
    this.turretRotateSound?.stop();
    this.poweredSound?.stop();
    if (this.gameObject.isDestroyed) {
      if (
        this.gameObject.deathType === DeathType.Temporal ||
        this.gameObject.deathType === DeathType.None
      ) {
        return undefined;
      }
      if (this.objectRules.explosion.length) {
        this.createExplosionAnims(manager);
      }
    }
  }

  /** 释放 plugins 与各 Renderable。 */
  dispose(): void {
    this.plugins.forEach((p) => p.dispose());
    this.pipOverlay?.dispose();
    this.placeholderObj?.dispose();
    this.mainObj?.dispose();
    this.rubbleObj?.dispose();
    this.bib?.dispose();
    this.fireObjects?.forEach((e) => e.dispose());
    this.turretBuilders?.forEach((e) => e.dispose());
    [...(this.animObjects?.values() ?? [])].forEach((list) =>
      list.forEach((e) => e.dispose()),
    );
  }
}
