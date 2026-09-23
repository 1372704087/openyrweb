/**
 * RenderableFactory — 可视对象工厂（按 ObjectType 路由创建 Renderable + 插件）。
 *
 * create(gameObject)：Techno 路径组装 PipOverlay 与各类插件后按
 * Building/Vehicle/Infantry/Aircraft 分支构造；Terrain/Overlay/
 * Projectile/Smudge/Debris 独立分支；Animation 用 createAnim/
 * createTransientAnim 工厂方法。
 *
 * 由 engine/renderable/entity/RenderableFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as BuildingModule from "engine/renderable/entity/Building"; // 孪生
import * as VehicleModule from "engine/renderable/entity/Vehicle"; // 孪生
import { Terrain } from "engine/renderable/entity/Terrain"; // 已转换
import { Overlay } from "engine/renderable/entity/Overlay"; // 已转换
import { Smudge } from "engine/renderable/entity/Smudge"; // 已转换
import * as AnimationTypeModule from "engine/renderable/entity/building/AnimationType"; // 孪生
import * as InfantryModule from "engine/renderable/entity/Infantry"; // 孪生
import * as PipOverlayModule from "engine/renderable/entity/PipOverlay"; // 孪生
import { Aircraft } from "engine/renderable/entity/Aircraft"; // 已转换
import { TransientAnim } from "engine/renderable/entity/TransientAnim"; // 已转换
import { Projectile } from "engine/renderable/entity/Projectile"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import * as HarvesterPluginModule from "engine/renderable/entity/plugin/HarvesterPlugin"; // 孪生
import { Anim } from "engine/renderable/entity/Anim"; // 已转换
import * as MoveSoundFxPluginModule from "engine/renderable/entity/plugin/MoveSoundFxPlugin"; // 孪生
import * as VehicleDisguisePluginModule from "engine/renderable/entity/plugin/VehicleDisguisePlugin"; // 孪生
import * as ChronoSparkleFxPluginModule from "engine/renderable/entity/plugin/ChronoSparkleFxPlugin"; // 孪生
import * as TntFxPluginModule from "engine/renderable/entity/plugin/TntFxPlugin"; // 孪生
import * as MindControlLinkPluginModule from "engine/renderable/entity/plugin/MindControlLinkPlugin"; // 孪生
import * as MagnetronBeamPluginModule from "engine/renderable/entity/plugin/MagnetronBeamPlugin"; // 孪生
import * as RobotControlPluginModule from "engine/renderable/entity/plugin/RobotControlPlugin"; // 孪生
import * as InfantryDisguisePluginModule from "engine/renderable/entity/plugin/InfantryDisguisePlugin"; // 孪生
import * as PsychicDetectPluginModule from "engine/renderable/entity/building/PsychicDetectPlugin"; // 孪生
import * as TrailerSmokePluginModule from "engine/renderable/entity/plugin/TrailerSmokePlugin"; // 孪生
import * as DamageSmokePluginModule from "engine/renderable/entity/plugin/DamageSmokePlugin"; // 孪生
import { LocomotorType } from "game/type/LocomotorType"; // 已转换
import * as ShipWakeTrailPluginModule from "engine/renderable/entity/plugin/ShipWakeTrailPlugin"; // 孪生
import * as ObjectCloakPluginModule from "engine/renderable/entity/plugin/ObjectCloakPlugin"; // 孪生
import { Debris } from "engine/renderable/entity/Debris"; // 已转换
import * as ShpAggregatorModule from "engine/renderable/builder/ShpAggregator"; // 孪生
import { MovementZone } from "game/type/MovementZone"; // 已转换
import * as ForcedDisguisePluginModule from "engine/renderable/entity/plugin/ForcedDisguisePlugin"; // 孪生
import * as AirstrikeLaserPluginModule from "engine/renderable/entity/plugin/AirstrikeLaserPlugin"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const Building: any = (BuildingModule as any).Building;
const Vehicle: any = (VehicleModule as any).Vehicle;
const AnimationType: any = (AnimationTypeModule as any).AnimationType;
const Infantry: any = (InfantryModule as any).Infantry;
const PipOverlay: any = (PipOverlayModule as any).PipOverlay;
const HarvesterPlugin: any = (HarvesterPluginModule as any).HarvesterPlugin;
const MoveSoundFxPlugin: any = (MoveSoundFxPluginModule as any).MoveSoundFxPlugin;
const VehicleDisguisePlugin: any = (VehicleDisguisePluginModule as any).VehicleDisguisePlugin;
const ChronoSparkleFxPlugin: any = (ChronoSparkleFxPluginModule as any).ChronoSparkleFxPlugin;
const TntFxPlugin: any = (TntFxPluginModule as any).TntFxPlugin;
const MindControlLinkPlugin: any = (MindControlLinkPluginModule as any).MindControlLinkPlugin;
const MagnetronBeamPlugin: any = (MagnetronBeamPluginModule as any).MagnetronBeamPlugin;
const RobotControlPlugin: any = (RobotControlPluginModule as any).RobotControlPlugin;
const InfantryDisguisePlugin: any = (InfantryDisguisePluginModule as any).InfantryDisguisePlugin;
const PsychicDetectPlugin: any = (PsychicDetectPluginModule as any).PsychicDetectPlugin;
const TrailerSmokePlugin: any = (TrailerSmokePluginModule as any).TrailerSmokePlugin;
const DamageSmokePlugin: any = (DamageSmokePluginModule as any).DamageSmokePlugin;
const ShipWakeTrailPlugin: any = (ShipWakeTrailPluginModule as any).ShipWakeTrailPlugin;
const ObjectCloakPlugin: any = (ObjectCloakPluginModule as any).ObjectCloakPlugin;
const ShpAggregator: any = (ShpAggregatorModule as any).ShpAggregator;
const ForcedDisguisePlugin: any = (ForcedDisguisePluginModule as any).ForcedDisguisePlugin;
const AirstrikeLaserPlugin: any = (AirstrikeLaserPluginModule as any).AirstrikeLaserPlugin;

/**
 * 可视对象工厂。
 * 持有桥图缓存与渲染管线依赖。
 */
export class RenderableFactory {
  localPlayer: any;
  unitSelection: any;
  alliances: any;
  rules: any;
  art: any;
  mapRenderable: any;
  imageFinder: any;
  palettes: any;
  voxels: any;
  voxelAnims: any;
  theater: any;
  camera: any;
  lighting: any;
  lightingDirector: any;
  debugWireframes: any;
  debugText: any;
  gameSpeed: any;
  worldSound: any;
  strings: any;
  flyerHelperOpt: any;
  hiddenObjectsOpt: any;
  vxlBuilderFactory: any;
  buildingImageDataCache: any;
  useSpriteBatching: boolean;
  useMeshInstancing: boolean;
  forcedYuriDisguise: boolean;
  /** 低桥聚合 SHP 缓存。 */
  bridgeImageCache = new Map<any, any>();

  /**
   * @param localPlayer - 本地玩家 Ref
   * @param unitSelection - 单位选择
   * @param alliances - 联盟
   * @param rules - 规则
   * @param art - art 容器
   * @param mapRenderable - 地图渲染
   * @param imageFinder - 图片查找器
   * @param palettes - 调色板表
   * @param voxels - VXL
   * @param voxelAnims - HVA
   * @param theater - 剧场
   * @param camera - 相机
   * @param lighting - 光照
   * @param lightingDirector - 光照导演
   * @param debugWireframes - 调试线框
   * @param debugText - 调试文本
   * @param gameSpeed - 游戏速度
   * @param worldSound - 世界音效
   * @param strings - 字符串表
   * @param flyerHelperOpt - flyer helper 开关
   * @param hiddenObjectsOpt - 隐藏对象开关
   * @param vxlBuilderFactory - VXL 工厂
   * @param buildingImageDataCache - 建筑图缓存
   * @param useSpriteBatching - 精灵批处理
   * @param useMeshInstancing - mesh instancing
   * @param forcedYuriDisguise - 强制尤里伪装
   */
  constructor(
    localPlayer: any,
    unitSelection: any,
    alliances: any,
    rules: any,
    art: any,
    mapRenderable: any,
    imageFinder: any,
    palettes: any,
    voxels: any,
    voxelAnims: any,
    theater: any,
    camera: any,
    lighting: any,
    lightingDirector: any,
    debugWireframes: any,
    debugText: any,
    gameSpeed: any,
    worldSound: any,
    strings: any,
    flyerHelperOpt: any,
    hiddenObjectsOpt: any,
    vxlBuilderFactory: any,
    buildingImageDataCache: any,
    useSpriteBatching: boolean = false,
    useMeshInstancing: boolean = false,
    forcedYuriDisguise: boolean = false,
  ) {
    this.localPlayer = localPlayer;
    this.unitSelection = unitSelection;
    this.alliances = alliances;
    this.rules = rules;
    this.art = art;
    this.mapRenderable = mapRenderable;
    this.imageFinder = imageFinder;
    this.palettes = palettes;
    this.voxels = voxels;
    this.voxelAnims = voxelAnims;
    this.theater = theater;
    this.camera = camera;
    this.lighting = lighting;
    this.lightingDirector = lightingDirector;
    this.debugWireframes = debugWireframes;
    this.debugText = debugText;
    this.gameSpeed = gameSpeed;
    this.worldSound = worldSound;
    this.strings = strings;
    this.flyerHelperOpt = flyerHelperOpt;
    this.hiddenObjectsOpt = hiddenObjectsOpt;
    this.vxlBuilderFactory = vxlBuilderFactory;
    this.buildingImageDataCache = buildingImageDataCache;
    this.useSpriteBatching = useSpriteBatching;
    this.useMeshInstancing = useMeshInstancing;
    this.forcedYuriDisguise = forcedYuriDisguise;
    this.bridgeImageCache = new Map();
  }

  /**
   * 创建瞬时动画。
   * @param name - 动画名
   * @param container - 容器回调（ctor 第 10 参）
   */
  createTransientAnim(name: string, container?: any): TransientAnim {
    const objectArt = this.art.getObject(name, ObjectType.Animation);
    return new TransientAnim(
      name,
      objectArt,
      { x: 0, y: 0 },
      this.imageFinder,
      this.theater,
      this.camera,
      this.debugWireframes,
      this.gameSpeed,
      this.useSpriteBatching,
      container,
      this.worldSound,
    );
  }

  /**
   * 创建常驻动画（不自动 remove）。
   * @param name - 动画名
   */
  createAnim(name: string): Anim {
    const objectArt = this.art.getObject(name, ObjectType.Animation);
    return new Anim(
      name,
      objectArt,
      { x: 0, y: 0 },
      this.imageFinder,
      this.theater,
      this.camera,
      this.debugWireframes,
      this.gameSpeed,
      this.useSpriteBatching,
      void 0,
      this.worldSound,
    );
  }

  /**
   * 按对象类型创建 Renderable。
   * @param obj - 游戏对象
   */
  create(obj: any): any {
    let palette = this.theater.getPalette(obj.art.paletteType, obj.art.customPaletteName);
    const plugins: any[] = [];

    // 飞机/弹道/碎片统一挂拖车烟
    if (obj.isAircraft() || obj.isProjectile() || obj.isDebris()) {
      plugins.push(
        new TrailerSmokePlugin(obj, this.art, this.theater, this.imageFinder, this.gameSpeed),
      );
    }

    if (obj.isTechno()) {
      palette = palette.clone();
      const selectionModel = this.unitSelection.getOrCreateSelectionModel(obj);
      const pipOverlay = new PipOverlay(
        this.rules.general.paradrop,
        this.rules.audioVisual,
        obj,
        this.localPlayer,
        this.alliances,
        selectionModel,
        this.imageFinder,
        this.palettes.get("palette.pal"),
        this.camera,
        this.strings,
        this.flyerHelperOpt,
        this.hiddenObjectsOpt,
        this.debugText,
        (name: string) => this.createAnim(name),
        this.useSpriteBatching,
        this.useMeshInstancing,
      );

      // 单位移动音
      if (!obj.isUnit() || obj.rules.moveSound) {
        // 孪生：(!isUnit || (moveSound && worldSound && push…))
        if (!obj.isUnit()) {
          // 无移动音插件
        } else if (obj.rules.moveSound && this.worldSound) {
          plugins.push(new MoveSoundFxPlugin(obj, obj.rules.moveSound, this.worldSound));
        }
      }
      plugins.push(new ChronoSparkleFxPlugin(obj, this.rules.audioVisual.chronoSparkle1));
      if (obj.mindControllerTrait || obj.mindControllableTrait) {
        plugins.push(
          new MindControlLinkPlugin(obj, selectionModel, this.alliances, this.localPlayer, this.camera),
        );
      }
      // continuous Magnetron tractor beam while dragging a target.
      if (obj.isUnit()) {
        plugins.push(new MagnetronBeamPlugin(obj));
      }
      // Boris airstrike designator laser — plugin checks
      // airstrikeTrait.targetObject and renders a persistent red beam.
      if (obj.isInfantry()) {
        plugins.push(new AirstrikeLaserPlugin(obj));
      }

      let renderable: any;
      if (obj.isBuilding()) {
        const animPalette = this.theater.animPalette;
        const isoPalette = this.theater.isoPalette;
        renderable = new Building(
          obj,
          selectionModel,
          this.rules,
          this.art,
          this.imageFinder,
          this.theater,
          this.voxels,
          this.voxelAnims,
          palette,
          animPalette,
          isoPalette,
          this.camera,
          this.lighting,
          this.debugWireframes,
          this.gameSpeed,
          this.vxlBuilderFactory,
          this.useSpriteBatching,
          new ShpAggregator(),
          this.buildingImageDataCache,
          pipOverlay,
          this.worldSound,
          AnimationType.BUILDUP,
        );
        if (obj.psychicDetectorTrait) {
          plugins.push(
            new PsychicDetectPlugin(obj, obj.psychicDetectorTrait, this.localPlayer, this.camera),
          );
        }
      } else if (obj.isVehicle()) {
        renderable = new Vehicle(
          obj,
          this.rules,
          this.art,
          this.imageFinder,
          this.theater,
          this.voxels,
          this.voxelAnims,
          palette,
          this.camera,
          this.lighting,
          this.debugWireframes,
          this.gameSpeed,
          selectionModel,
          this.vxlBuilderFactory,
          this.useSpriteBatching,
          pipOverlay,
          this.worldSound,
        );
        if (obj.rules.damageParticleSystems.length) {
          plugins.push(
            new DamageSmokePlugin(obj, this.art, this.theater, this.imageFinder, this.gameSpeed),
          );
        }
        // Robot Tank electric spark effect when paralyzed.
        // Attached to vehicles with PoweredUnit=yes or Powered=yes (e.g. ROBO)
        // that have a RobotControlTrait. The plugin spawns SparkFx periodically
        // when the control center is offline.
        if (obj.rules.poweredUnit || obj.rules.powered) {
          plugins.push(new RobotControlPlugin(obj, this.gameSpeed));
        }
        if (
          obj.rules.locomotor === LocomotorType.Ship ||
          obj.rules.locomotor === LocomotorType.Hover
        ) {
          plugins.push(
            new ShipWakeTrailPlugin(
              obj,
              this.rules,
              this.art,
              this.theater,
              this.imageFinder,
              this.gameSpeed,
            ),
          );
        }
        if (obj.harvesterTrait && this.mapRenderable) {
          plugins.push(new HarvesterPlugin(obj, obj.harvesterTrait));
        }
        if (obj.disguiseTrait) {
          plugins.push(
            new VehicleDisguisePlugin(
              obj,
              obj.disguiseTrait,
              this.localPlayer,
              this.alliances,
              renderable,
              this.art,
              this.imageFinder,
              this.theater,
              this.camera,
              this.lighting,
              this.gameSpeed,
              this.useSpriteBatching,
            ),
          );
        }
      } else if (obj.isInfantry()) {
        renderable = new Infantry(
          obj,
          this.rules,
          this.art,
          this.imageFinder,
          this.theater,
          palette,
          this.camera,
          this.lighting,
          this.debugWireframes,
          this.gameSpeed,
          selectionModel,
          this.useSpriteBatching,
          this.useMeshInstancing,
          pipOverlay,
          this.worldSound,
        );
        // HarvesterPlugin (OREGATH spark) is NOT attached to enslaved
        // infantry — vanilla YR slaves do NOT show the OREGATH ground sparkle while
        // mining; only the body Shovel digging sequence plays. The spark is exclusive
        // to vehicle harvesters (HARV). harvesterTrait.status is still set by
        // SlaveGatherTask for tracking but has no visual effect without HarvesterPlugin.
        if (
          this.forcedYuriDisguise &&
          this.rules.audioVisual.benderOfSpoons &&
          obj.rules.isHuman &&
          obj.rules.movementZone !== MovementZone.Fly &&
          this.art.hasObject(this.rules.audioVisual.benderOfSpoons, ObjectType.Infantry)
        ) {
          const disguiseArt = this.art.getObject(
            this.rules.audioVisual.benderOfSpoons,
            ObjectType.Infantry,
          );
          plugins.push(new ForcedDisguisePlugin(obj, disguiseArt, this.localPlayer, renderable));
        } else if (obj.disguiseTrait) {
          plugins.push(
            new InfantryDisguisePlugin(
              obj,
              obj.disguiseTrait,
              this.localPlayer,
              this.alliances,
              renderable,
              this.art,
              this.gameSpeed,
            ),
          );
        }
      } else {
        if (!obj.isAircraft()) throw new Error("Unhandled game object type " + obj.type);
        renderable = new Aircraft(
          obj,
          this.rules,
          this.voxels,
          this.voxelAnims,
          palette,
          this.camera,
          this.lighting,
          this.debugWireframes,
          this.gameSpeed,
          selectionModel,
          this.vxlBuilderFactory,
          this.useSpriteBatching,
          pipOverlay,
        );
      }

      if (obj.tntChargeTrait) {
        plugins.push(
          new TntFxPlugin(
            obj,
            obj.tntChargeTrait,
            this.rules.combatDamage.ivanIconFlickerRate,
            renderable,
            this.imageFinder,
            this.art,
            this.alliances,
            this.localPlayer,
            this.worldSound,
            (name: string) => this.createAnim(name),
          ),
        );
      }
      plugins.push(new ObjectCloakPlugin(obj, this.localPlayer, this.alliances, renderable));
      plugins.forEach((p) => renderable.registerPlugin(p));
      return renderable;
    }

    if (obj.isTerrain()) {
      return new Terrain(
        obj,
        this.mapRenderable?.terrainLayer,
        this.imageFinder,
        palette,
        this.camera,
        this.lighting,
        this.debugWireframes,
        this.gameSpeed,
        this.useSpriteBatching,
      );
    }
    if (obj.isOverlay()) {
      return new Overlay(
        obj,
        this.rules,
        this.art,
        this.imageFinder,
        palette,
        this.camera,
        this.lighting,
        this.debugWireframes,
        this.bridgeImageCache,
        this.mapRenderable?.overlayLayer,
        this.useSpriteBatching,
      );
    }
    if (obj.isProjectile()) {
      const projectile = new Projectile(
        obj,
        this.rules,
        this.imageFinder,
        this.voxels,
        this.voxelAnims,
        this.theater,
        palette,
        this.palettes.get("palette.pal"),
        this.camera,
        this.gameSpeed,
        this.lighting,
        this.lightingDirector,
        this.vxlBuilderFactory,
        this.useSpriteBatching,
        this.useMeshInstancing,
        this.worldSound,
      );
      plugins.forEach((p) => projectile.registerPlugin(p));
      return projectile;
    }
    if (obj.isSmudge()) {
      return new Smudge(
        obj,
        this.imageFinder,
        palette,
        this.camera,
        this.lighting,
        this.debugWireframes,
        this.mapRenderable?.smudgeLayer,
      );
    }
    if (obj.isDebris()) {
      const debris = new Debris(
        obj,
        this.rules,
        this.imageFinder,
        this.voxels,
        this.voxelAnims,
        palette,
        this.camera,
        this.lighting,
        this.gameSpeed,
        this.vxlBuilderFactory,
        this.useSpriteBatching,
      );
      plugins.forEach((p) => debris.registerPlugin(p));
      return debris;
    }
    throw new Error("Not implemented");
  }
}
