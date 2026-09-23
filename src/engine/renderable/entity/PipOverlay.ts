/**
 * PipOverlay — 单位/建筑 HUD 覆盖（血条、pips、选框、集结点、治疗图标等）。
 *
 * 类级缓存图集/几何/材质；create3DObject 按建筑/单位分支挂各 sprite；
 * update 脏检测刷新血条/pips/编组/主厂/电力/集结点/治疗闪烁/ flyerHelper。
 * 敌方经 objectIsOpaqueToViewer 隐藏敏感 UI。
 *
 * 由 engine/renderable/entity/PipOverlay.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as TextureAtlasModule from "engine/gfx/TextureAtlas"; // 孪生
import { IndexedBitmap } from "data/Bitmap"; // 已转换
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import { Coords } from "game/Coords"; // 已转换
import * as TextureUtilsModule from "engine/gfx/TextureUtils"; // 孪生
import { SelectionLevel } from "game/gameobject/selection/SelectionLevel"; // 已转换
import { PipColor } from "game/type/PipColor"; // 已转换
import { PipScale } from "game/type/PipScale"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as OverlayUtilsModule from "engine/gfx/OverlayUtils"; // 孪生
import { RallyPointFx } from "engine/renderable/fx/RallyPointFx"; // 已转换
import { FlyerHelperMode } from "engine/renderable/entity/unit/FlyerHelperMode"; // 孪生
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import * as BufferGeometryUtilsModule from "engine/gfx/BufferGeometryUtils"; // 孪生
import * as PaletteBasicMaterialModule from "engine/gfx/material/PaletteBasicMaterial"; // 孪生
import * as BatchedMeshModule from "engine/gfx/batch/BatchedMesh"; // 孪生
import { HealthLevel } from "game/gameobject/unit/HealthLevel"; // 已转换
import * as DebugLabelModule from "engine/renderable/entity/unit/DebugLabel"; // 孪生
import { Engine } from "engine/Engine"; // 已转换
import { EngineType } from "engine/EngineType"; // 已转换
import { UnitCastBarSprite } from "engine/renderable/entity/UnitCastBarSprite"; // 已转换
import { SecureProgressSprite } from "engine/renderable/entity/SecureProgressSprite"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const TextureAtlas: any = (TextureAtlasModule as any).TextureAtlas;
const SpriteUtils: any = (SpriteUtilsModule as any).SpriteUtils;
const TextureUtils: any = (TextureUtilsModule as any).TextureUtils;
const OverlayUtils: any = (OverlayUtilsModule as any).OverlayUtils;
const BufferGeometryUtils: any = (BufferGeometryUtilsModule as any).BufferGeometryUtils;
const PaletteBasicMaterial: any = (PaletteBasicMaterialModule as any).PaletteBasicMaterial;
const BatchedMesh: any = (BatchedMeshModule as any).BatchedMesh;
const BatchMode: any = (BatchedMeshModule as any).BatchMode;
const DebugLabel: any = (DebugLabelModule as any).DebugLabel;

/** 血条/选框左边距偏移（孪生 E=-1）。 */
const PIP_X_BIAS = -1;
/** 控制组格子尺寸。 */
const CG_CELL = { width: 8, height: 11 };
/** 内边距。 */
const CG_PAD = 1;
/** 选择级别 → 该元素最低可见级别。 */
const LEVEL_REQUIRE: Record<number, any> = {
  [0]: SelectionLevel.Hover,
  2: SelectionLevel.Selected,
  1: SelectionLevel.Hover,
  3: SelectionLevel.Hover,
  4: SelectionLevel.Selected,
  5: SelectionLevel.Selected,
  6: SelectionLevel.Selected,
};
/** 引擎 → HealthLevel → pips 纹理帧（仅 YR 16/17/18）。 */
const HEALTH_PIP_INDEX = new Map()
  // YR-only — health-pip texture indices for YR (16/17/18). RA2 entry dropped.
  .set(
    EngineType.YurisRevenge,
    new Map().set(HealthLevel.Green, 16).set(HealthLevel.Yellow, 17).set(HealthLevel.Red, 18),
  );

/**
 * 单位/建筑 HUD 覆盖。
 * 类级持有图集与共享材质。
 */
export class PipOverlay {
  /** 类级图集缓存。 */
  static atlasCache: any;
  /** 类级 sprite 几何表。 */
  static geometries = new Map<any, any>();
  static buildingHealthGeoCache = new Map<string, any>();
  static unitHealthGeoCache = new Map<string, any>();
  static atlasImageHandles = new Map<any, any>();
  static unitHealthTextures = new Map<boolean, any>();
  static unitHealthMaterials = new Map<boolean, any>();
  static controlGroupTextures = new Map<any, any>();
  static controlGroupMaterials = new Map<any, any>();
  static primaryFactoryTextures = new Map<any, any>();
  static primaryFactoryMaterials = new Map<any, any>();
  static powerInfoTextures = new Map<any, any>();
  static powerInfoMaterials = new Map<any, any>();
  /** 共享图集材质。 */
  static material: any;
  static pipBrdFile: any;
  static pipsFile: any;
  static pips2File: any;

  /** 清空全部类级缓存。 */
  static clearCaches(): void {
    PipOverlay.atlasCache?.dispose();
    PipOverlay.atlasCache = void 0;
    PipOverlay.atlasImageHandles.clear();
    [...PipOverlay.unitHealthTextures.values()].forEach((t) => t.dispose());
    PipOverlay.unitHealthTextures.clear();
    PipOverlay.unitHealthMaterials.forEach((m) => m.dispose());
    PipOverlay.unitHealthMaterials.clear();
    [...PipOverlay.controlGroupTextures.values()].forEach((t) => t.dispose());
    PipOverlay.controlGroupTextures.clear();
    PipOverlay.controlGroupMaterials.forEach((m) => m.dispose());
    PipOverlay.controlGroupMaterials.clear();
    [...PipOverlay.primaryFactoryTextures.values()].forEach((t) => t.dispose());
    PipOverlay.primaryFactoryTextures.clear();
    PipOverlay.primaryFactoryMaterials.forEach((m) => m.dispose());
    PipOverlay.primaryFactoryMaterials.clear();
    [...PipOverlay.powerInfoTextures.values()].forEach((t) => t.dispose());
    PipOverlay.powerInfoTextures.clear();
    PipOverlay.powerInfoMaterials.forEach((m) => m.dispose());
    PipOverlay.powerInfoMaterials.clear();
  }

  paradropRules: any;
  audioVisualRules: any;
  gameObject: any;
  viewer: any;
  alliances: any;
  selectionModel: any;
  imageFinder: any;
  palette: any;
  camera: any;
  strings: any;
  flyerHelperOpt: any;
  hiddenObjectsOpt: any;
  debugTextEnabled: any;
  animFactory: any;
  useSpriteBatching: any;
  useMeshInstancing: any;
  lastPrimaryFactory = false;
  lastPowerInfo = false;
  lastPowerVal = -1;
  lastDrainVal = -1;
  // Tech Hospital healing indicator state tracking
  lastHasTechHospital = false;
  lastBeingHealed = false;
  // Flash timer: starts at ~200ms when a heal pulse raises HP; the icon fades
  // to a semi-transparent shadow tint and back (vanilla YR flicker style).
  healFlashTimer = 0;
  // Last rAF timestamp, used to measure real elapsed ms for the flash timer
  _lastHealUpdate: number | undefined;
  healingIndicator: any = void 0;
  healingMaterial: any = void 0;
  invalidatedElements: boolean[] = [];
  disposables: any;

  rootObj: any;
  healthBar: any;
  selectionBox: any;
  pipsSprite: any;
  unitCastBarSprite: any;
  secureProgressSprite: any;
  flyHelper: any;
  behindAnim: any;
  debugLabel: any;
  repairWrench: any;
  veteranIndicator: any;
  rallyLine: any;
  primaryFactorySprite: any;
  controlGroupSprite: any;
  powerInfoSprite: any;
  _healExtraLight: any;
  lastHealth: any;
  lastOwner: any;
  lastPipsDataKey: any;
  lastControlGroup: any;
  lastRallyPoint: any;
  lastRepairState: any;
  lastVeteranLevel: any;
  lastSelectionLevel: any;
  lastDebugLabel: any;
  lastDebugTextEnabled: any;

  constructor(
    paradropRules: any,
    audioVisualRules: any,
    gameObject: any,
    viewer: any,
    alliances: any,
    selectionModel: any,
    imageFinder: any,
    palette: any,
    camera: any,
    strings: any,
    flyerHelperOpt: any,
    hiddenObjectsOpt: any,
    debugTextEnabled: any,
    animFactory: any,
    useSpriteBatching: any,
    useMeshInstancing: any,
  ) {
    this.paradropRules = paradropRules;
    this.audioVisualRules = audioVisualRules;
    this.gameObject = gameObject;
    this.viewer = viewer;
    this.alliances = alliances;
    this.selectionModel = selectionModel;
    this.imageFinder = imageFinder;
    this.palette = palette;
    this.camera = camera;
    this.strings = strings;
    this.flyerHelperOpt = flyerHelperOpt;
    this.hiddenObjectsOpt = hiddenObjectsOpt;
    this.debugTextEnabled = debugTextEnabled;
    this.animFactory = animFactory;
    this.useSpriteBatching = useSpriteBatching;
    this.useMeshInstancing = useMeshInstancing;
    this.invalidatedElements = [];
    this.disposables = new CompositeDisposable();
  }

  /** 惰性创建 root 与全部初始 sprite。 */
  create3DObject(): void {
    let root = this.rootObj;
    if (root) return;
    root = new THREE.Object3D();
    root.name = "pip_overlay";
    root.matrixAutoUpdate = false;
    if (!PipOverlay.atlasCache) {
      const atlas = this.initTexture();
      PipOverlay.atlasCache = atlas;
      [...PipOverlay.atlasImageHandles.keys()].forEach((img) => {
        const geo = SpriteUtils.createSpriteGeometry(this.buildSpriteGeometry(img));
        PipOverlay.geometries.set(img, geo);
      });
      PipOverlay.material = new PaletteBasicMaterial({
        map: PipOverlay.atlasCache.getTexture(),
        palette: TextureUtils.textureFromPalette(this.palette),
        alphaTest: 0.5,
        flatShading: true,
        transparent: true,
        depthTest: false,
      });
    }

    if (this.gameObject.isBuilding()) {
      this.healthBar = this.createBuildingHealthBar(this.gameObject);
      root.add(this.healthBar);
      if (this.gameObject.art.height >= 1) {
        this.selectionBox = this.createBuildingSelectionBox(this.gameObject);
        root.add(this.selectionBox);
      }
      const occupation = this.createBuildingOccupationInfo(this.gameObject);
      if (occupation) {
        root.add(occupation);
        this.pipsSprite = occupation;
      }
      this.lastPipsDataKey = this.gameObject.garrisonTrait?.units.length;
      if (this.gameObject.secureProgressTrait) {
        const secure = (this.secureProgressSprite = new SecureProgressSprite(
          this.gameObject,
          this.camera,
          this.viewer,
          this.alliances,
          this.selectionModel,
        ));
        secure.create3DObject();
        root.add(secure.get3DObject());
      }
    } else {
      const { healthBarWrapper, selectionBox } = this.createUnitHealthBar(this.gameObject);
      this.healthBar = healthBarWrapper;
      this.selectionBox = selectionBox;
      root.add(this.healthBar);
      if (this.gameObject.castProgressTrait) {
        const brd = PipOverlay.pipBrdFile.getImage(1);
        const cast = (this.unitCastBarSprite = new UnitCastBarSprite(
          this.gameObject.castProgressTrait,
          this.camera,
          brd.width - 2 * CG_PAD,
          PIP_X_BIAS,
          Math.floor(brd.height / 2),
          this.healthBar.position.y,
        ));
        cast.create3DObject();
        root.add(cast.get3DObject());
      }
      if (
        this.gameObject.art.isVoxel &&
        (this.gameObject.rules.consideredAircraft || this.gameObject.isAircraft()) &&
        !this.gameObject.rules.missileSpawn
      ) {
        const fly = this.animFactory(this.audioVisualRules.flyerHelper);
        this.flyHelper = fly;
        fly.create3DObject();
        root.add(fly.get3DObject());
      }
      if (this.gameObject.isUnit()) {
        const behind = this.animFactory(this.audioVisualRules.behind);
        behind.setRenderOrder(999995);
        this.behindAnim = behind;
      }
    }
    if (this.gameObject.debugLabel && this.debugTextEnabled.value) {
      const label = new DebugLabel(
        this.gameObject.debugLabel,
        this.gameObject.owner.color.asHex(),
        this.camera,
      );
      this.debugLabel = label;
      label.create3DObject();
      label.get3DObject().renderOrder = 999999;
      root.add(label.get3DObject());
    }
    this.lastHealth = this.gameObject.healthTrait.health;
    this.lastOwner = this.gameObject.owner;
    this.rootObj = root;
  }

  /**
   * 创建回调：建筑挂集结点线。
   * @param manager - 渲染管理器
   */
  onCreate(manager: any): void {
    if (this.gameObject.isBuilding() && this.gameObject.rallyTrait) {
      this.rallyLine = new RallyPointFx(
        this.camera,
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Color(),
        999999,
      );
      this.rallyLine.visible = false;
      manager.addEffect(this.rallyLine);
      this.disposables.add(() => this.rallyLine.remove(), this.rallyLine);
    }
  }

  /** 打包 pipbrd/pips/pips2 图集。 */
  initTexture(): any {
    PipOverlay.pipBrdFile = this.imageFinder.find("pipbrd", false);
    // pips.shp in ra2md.mix\conqmd.mix, 21 frames:
    //   0- 5 血条格子: 空 绿 金 白 红 蓝
    //   6-12 小人格子: 空 绿 金 白 红 蓝 紫
    //  13    步兵血条旁治疗图标
    //  14-15 单位一星/三星图标
    //  16-19 其他: 绿 金 红 黑
    //  20    坦克血条旁维修扳手
    PipOverlay.pipsFile = this.imageFinder.find("pips", false);
    // pips2.shp in ra2md.mix\conqmd.mix, 19 frames:
    //   0- 5 单位进入士兵格子: 空 绿 金 白 红 蓝
    //   6-12 小人格: 空 绿 金 白 红 蓝 紫
    //  13-18 弹药格子: 绿 空 红 金 绿 蓝
    PipOverlay.pips2File = this.imageFinder.find("pips2", false);
    const files = [PipOverlay.pipBrdFile, PipOverlay.pipsFile, PipOverlay.pips2File];
    const bitmaps: any[] = [];
    files.forEach((file) => {
      for (let i = 0; i < file.numImages; i++) {
        const image = file.getImage(i);
        const indexed = new IndexedBitmap(image.width, image.height, image.imageData);
        bitmaps.push(indexed);
        PipOverlay.atlasImageHandles.set(image, { bitmap: indexed, shpFile: file });
      }
    });
    const atlas = new TextureAtlas();
    atlas.pack(bitmaps);
    return atlas;
  }

  /**
   * 图集帧 → sprite 几何参数。
   * @param image - 图集 image 句柄
   */
  buildSpriteGeometry(image: any): any {
    if (!PipOverlay.atlasCache) throw new Error("Must build texture atlas before geometry");
    const atlas = PipOverlay.atlasCache;
    const { bitmap, shpFile } = PipOverlay.atlasImageHandles.get(image);
    return {
      texture: atlas.getTexture(),
      textureArea: atlas.getImageRect(bitmap),
      align: { x: 1, y: -1 },
      offset: {
        x: image.x - Math.floor(shpFile.width / 2),
        y: image.y - Math.floor(shpFile.height / 2),
      },
      camera: this.camera,
      scale: Coords.ISO_WORLD_SCALE,
    };
  }

  /**
   * 建筑地基旁竖排血条。
   * @param building - 建筑
   */
  createBuildingHealthBar(building: any): any {
    const foundationH = building.art.foundation.height;
    const health = building.healthTrait.health;
    const cell = 4 * Coords.ISO_WORLD_SCALE;
    const cells = Math.floor((foundationH * Coords.getWorldTileSize()) / cell);
    const filled = Math.max(1, Math.floor((health / 100) * cells));
    let levelIdx: number;
    if (health > 100 * this.audioVisualRules.conditionYellow) levelIdx = 1;
    else if (health > 100 * this.audioVisualRules.conditionRed) levelIdx = 2;
    else levelIdx = 4;
    const key = `${levelIdx}_${foundationH}_${filled}`;
    let geometry = PipOverlay.buildingHealthGeoCache.get(key);
    if (!geometry) {
      const geos: any[] = [];
      const empty = PipOverlay.pipsFile.getImage(0);
      const filledImg = PipOverlay.pipsFile.getImage(levelIdx);
      for (let i = 0; i < cells; i++) {
        const frame = i < filled ? filledImg : empty;
        const g = PipOverlay.geometries.get(frame).clone();
        const y = cell * i + cell / 2;
        g.applyMatrix(new THREE.Matrix4().makeTranslation(cell, 0, y));
        geos.push(g);
      }
      geometry = BufferGeometryUtils.mergeBufferGeometries(geos);
      PipOverlay.buildingHealthGeoCache.set(key, geometry);
    }
    const mesh = this.useMeshInstancing
      ? new BatchedMesh(geometry, PipOverlay.material, BatchMode.Instancing)
      : new THREE.Mesh(geometry, PipOverlay.material);
    mesh.matrixAutoUpdate = false;
    mesh.renderOrder = 999999;
    mesh.position.y = Coords.tileHeightToWorld(building.art.height || 0.5);
    mesh.updateMatrix();
    return mesh;
  }

  /**
   * 单位头顶血条 + 选框。
   * @param unit - 单位
   */
  createUnitHealthBar(unit: any): { healthBarWrapper: any; selectionBox: any } {
    const isVehicle = !unit.isInfantry();
    const health = unit.healthTrait.health;
    const level = unit.healthTrait.level;
    let texture = PipOverlay.unitHealthTextures.get(isVehicle);
    if (!texture) {
      texture = this.createUnitHealthTexture(isVehicle);
      PipOverlay.unitHealthTextures.set(isVehicle, texture);
    }
    const brd = PipOverlay.pipBrdFile.getImage(isVehicle ? 0 : 1);
    const pipFrameIdx = HEALTH_PIP_INDEX.get(Engine.getActiveEngine())?.get(level);
    if (pipFrameIdx === void 0) throw new Error(`Unhandled health level "${level}"`);
    const pipImg = PipOverlay.pipsFile.getImage(pipFrameIdx);
    const maxCells = Math.floor((brd.width - 2 * CG_PAD) / pipImg.width);
    const filled = Math.max(1, Math.floor((health / 100) * maxCells));
    const geoKey = `${isVehicle ? 1 : 0}_${filled}`;
    let geometry = PipOverlay.unitHealthGeoCache.get(geoKey);
    if (!geometry) {
      geometry = SpriteUtils.createSpriteGeometry({
        texture,
        textureArea: { x: 0, y: (filled - 1) * brd.height, width: brd.width, height: brd.height },
        camera: this.camera,
        align: { x: 0, y: 0 },
        scale: Coords.ISO_WORLD_SCALE,
      });
      PipOverlay.unitHealthGeoCache.set(geoKey, geometry);
    }
    let material = PipOverlay.unitHealthMaterials.get(isVehicle);
    if (!material) {
      material = new PaletteBasicMaterial({
        map: texture,
        palette: TextureUtils.textureFromPalette(this.palette),
        alphaTest: 0.5,
        flatShading: true,
        transparent: true,
        depthTest: false,
      });
      PipOverlay.unitHealthMaterials.set(isVehicle, material);
    }
    const bar = this.useSpriteBatching
      ? new BatchedMesh(geometry, material, BatchMode.Merging)
      : new THREE.Mesh(geometry, material);
    bar.matrixAutoUpdate = false;
    bar.renderOrder = 999998;
    const off = Coords.screenDistanceToWorld(Math.floor(brd.width / 2) + PIP_X_BIAS, 0);
    bar.applyMatrix(new THREE.Matrix4().makeTranslation(off.x, 0, off.y));
    bar.updateMatrix();

    // 选框背景条
    const selectionGeo = PipOverlay.geometries.get(brd);
    const selection = this.useSpriteBatching
      ? new BatchedMesh(selectionGeo, PipOverlay.material, BatchMode.Merging)
      : new THREE.Mesh(selectionGeo, PipOverlay.material);
    selection.matrixAutoUpdate = false;
    const off2 = Coords.screenDistanceToWorld(
      Math.floor(PipOverlay.pipBrdFile.getImage(0).width / 2) + PIP_X_BIAS,
      0,
    );
    selection.applyMatrix(new THREE.Matrix4().makeTranslation(off2.x, 0, off2.y));
    selection.updateMatrix();
    selection.renderOrder = 999997;

    const wrapper = new THREE.Object3D();
    wrapper.matrixAutoUpdate = false;
    wrapper.add(selection);
    wrapper.add(bar);
    const pos = Coords.screenDistanceToWorld(-Math.floor(brd.width / 2), 0);
    wrapper.applyMatrix(
      new THREE.Matrix4().makeTranslation(pos.x, Coords.tileHeightToWorld(2), pos.y),
    );
    wrapper.updateMatrix();
    return { healthBarWrapper: wrapper, selectionBox: selection };
  }

  /**
   * 按血量阈值生成多段单位血条纹理。
   * @param isVehicle - 是否载具
   */
  createUnitHealthTexture(isVehicle: boolean): any {
    const brd = PipOverlay.pipBrdFile.getImage(isVehicle ? 0 : 1);
    const levelMap = HEALTH_PIP_INDEX.get(Engine.getActiveEngine());
    if (!levelMap) {
      throw new Error("Unhandled engine type " + EngineType[Engine.getActiveEngine()]);
    }
    const pipW = PipOverlay.pipsFile.getImage(levelMap.values().next().value).width;
    const cells = Math.floor((brd.width - 2 * CG_PAD) / pipW);
    const result = new IndexedBitmap(brd.width, brd.height * cells);
    for (let d = 1; d <= cells; ++d) {
      const pct = (d / cells) * 100;
      let level: any;
      if (pct > 100 * this.audioVisualRules.conditionYellow) level = HealthLevel.Green;
      else if (pct > 100 * this.audioVisualRules.conditionRed) level = HealthLevel.Yellow;
      else level = HealthLevel.Red;
      const frame = levelMap.get(level);
      if (frame === void 0) throw new Error(`Unhandled health level "${level}"`);
      const pip = PipOverlay.pipsFile.getImage(frame);
      const indexed = new IndexedBitmap(pip.width, pip.height, pip.imageData);
      const y = (d - 1) * brd.height;
      for (let x = 0; x < d; x++) {
        const px = pip.width * x;
        result.drawIndexedImage(indexed, px + CG_PAD, y + CG_PAD);
      }
    }
    const tex = new THREE.DataTexture(result.data, result.width, result.height, THREE.AlphaFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.flipY = true;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * 建筑四角选框。
   * @param building - 建筑
   */
  createBuildingSelectionBox(building: any): any {
    const root = new THREE.Object3D();
    root.matrixAutoUpdate = false;
    const foundation = building.art.foundation;
    const tile = Coords.getWorldTileSize();
    const corners: [number, number][] = [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
    ];
    corners.forEach(([cx, cz], i) => {
      const corner = this.createBuildingSelectionCornerMesh();
      corner.matrixAutoUpdate = false;
      corner.position.set(
        cx * tile * foundation.width,
        Coords.tileHeightToWorld(building.art.height),
        cz * tile * foundation.height,
      );
      corner.rotation.y = (i * Math.PI) / 2;
      corner.scale.set(
        ((i % 2 === 0 ? foundation.width : foundation.height) / 4) * Coords.getWorldTileSize(),
        Coords.tileHeightToWorld(building.art.height / 4),
        ((i % 2 === 0 ? foundation.height : foundation.width) / 4) * Coords.getWorldTileSize(),
      );
      corner.updateMatrix();
      root.add(corner);
    });
    return root;
  }

  /** 单角 L 线段。 */
  createBuildingSelectionCornerMesh(): any {
    const positions = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1];
    const colors = new Array(positions.length).fill(1);
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.addAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
    const material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
    this.disposables.add(geometry, material);
    return new THREE.LineSegments(geometry, material);
  }

  /**
   * 驻军/心灵控制/生物反应堆 pips。
   * @param building - 建筑
   */
  createBuildingOccupationInfo(building: any): any {
    const isInfantryAbsorb = building.rules.infantryAbsorb;
    const isMindControl = building.rules.pipScale === PipScale.MindControl;
    // Bio reactor shows pips even when empty (only to owner/allies).
    // Standard garrison only shows when occupied.
    // MindControl shows pips even when empty, green for occupied, red for overload.
    if (
      (isInfantryAbsorb || isMindControl || building.garrisonTrait?.units.length) &&
      !this.objectIsOpaqueToViewer()
    ) {
      let occupied: number;
      let capacity: number;
      let emptyImg: any;
      let fillImg: any;
      if (isMindControl) {
        occupied = building.mindControllerTrait?.getTargets().length || 0;
        capacity = building.mindControllerTrait?.maxCapacity || 3;
        emptyImg = PipOverlay.pipsFile.getImage(0);
        fillImg = PipOverlay.pipsFile.getImage(1);
      } else if (isInfantryAbsorb) {
        // InfantryAbsorb=yes: use pips.shp frames 0/3 (white bar style), capacity from Passengers=
        occupied = building.garrisonTrait?.units?.length || 0;
        capacity = building.rules.passengers || 1;
        emptyImg = PipOverlay.pipsFile.getImage(0);
        fillImg = PipOverlay.pipsFile.getImage(3);
      } else {
        occupied = building.garrisonTrait?.units?.length || 0;
        capacity = building.rules.maxNumberOccupants;
        emptyImg = PipOverlay.pips2File.getImage(6);
        fillImg = PipOverlay.pips2File.getImage(7);
      }
      const cell = 4 * Coords.ISO_WORLD_SCALE;
      const foundationZ = building.art.foundation.height * Coords.getWorldTileSize();
      // MindControl uses different per-pip color (green/red); Bio/standard use same material.
      if (isMindControl) {
        const mindPips: any[] = [];
        for (let pi = 1; pi <= capacity; pi++) {
          const g = PipOverlay.geometries.get(pi <= occupied ? fillImg : emptyImg).clone();
          const px = cell * pi + cell / 2;
          g.applyMatrix(new THREE.Matrix4().makeTranslation(px, 0, foundationZ));
          mindPips.push(g);
        }
        const merged = BufferGeometryUtils.mergeBufferGeometries(mindPips);
        const mesh = this.useSpriteBatching
          ? new BatchedMesh(merged, PipOverlay.material, BatchMode.Merging)
          : new THREE.Mesh(merged, PipOverlay.material);
        mesh.matrixAutoUpdate = false;
        mesh.renderOrder = 999999;
        return mesh;
      }
      // All building pips: single-material approach
      const geos: any[] = [];
      for (let i = 1; i <= capacity; i++) {
        const frame = i <= occupied ? fillImg : emptyImg;
        const g = PipOverlay.geometries.get(frame).clone();
        const px = cell * i + cell / 2;
        g.applyMatrix(new THREE.Matrix4().makeTranslation(px, 0, foundationZ));
        geos.push(g);
      }
      const merged = BufferGeometryUtils.mergeBufferGeometries(geos);
      const mesh = this.useSpriteBatching
        ? new BatchedMesh(merged, PipOverlay.material, BatchMode.Merging)
        : new THREE.Mesh(merged, PipOverlay.material);
      mesh.matrixAutoUpdate = false;
      mesh.renderOrder = 999999;
      return mesh;
    }
  }

  /**
   * 一排彩色 pips。
   * @param colors - 颜色列表
   * @param total - 总格数
   * @param isAmmo - 是否弹药样式（用 YR 13/14 帧）
   */
  createPipsSprite(colors: any[], total: number, isAmmo: boolean = false): any {
    if (this.objectIsOpaqueToViewer()) return;
    const geos: any[] = [];
    // YR-only — pip indices are the YR values (13/14).
    const ammoEmpty = 13;
    const ammoFull = 14;
    const cellW = PipOverlay.pips2File.getImage(isAmmo ? ammoEmpty : 0).width;
    const emptyImg = PipOverlay.pips2File.getImage(isAmmo ? ammoFull : 0);
    for (let i = 0; i < total; i++) {
      let frameImg: any;
      if (i < colors.length) {
        const c = colors[i];
        let frame = isAmmo ? ammoEmpty : 3;
        if (c === PipColor.Green) frame = 1;
        else if (c === PipColor.Blue) frame = 5;
        else if (c === PipColor.Red) frame = 4;
        else if (c === PipColor.Yellow) frame = 2;
        frameImg = PipOverlay.pips2File.getImage(frame);
      } else {
        frameImg = emptyImg;
      }
      const g = PipOverlay.geometries.get(frameImg).clone();
      const x = cellW * i + cellW / 2;
      const pos = Coords.screenDistanceToWorld(
        -Math.floor(
          PipOverlay.pipBrdFile.getImage(this.gameObject.isInfantry() ? 1 : 0).width / 2,
        ) + x,
        Math.floor(emptyImg.height / 2) + 3,
      );
      g.applyMatrix(new THREE.Matrix4().makeTranslation(pos.x, 0, pos.y));
      geos.push(g);
    }
    const merged = BufferGeometryUtils.mergeBufferGeometries(geos);
    const mesh = this.useSpriteBatching
      ? new BatchedMesh(merged, PipOverlay.material, BatchMode.Merging)
      : new THREE.Mesh(merged, PipOverlay.material);
    mesh.renderOrder = 999996;
    return mesh;
  }

  /**
   * 控制编组数字纹理（0-9 一排）。
   * @param color - 玩家色
   */
  createControlGroupTexture(color: any): any {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    const pad = CG_PAD;
    const cell = CG_CELL;
    canvas.width = 10 * (cell.width + 2 * pad);
    canvas.height = cell.height + 2 * pad;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color.asHexString();
    ctx.fillStyle = color.asHexString();
    ctx.font = "bold 12px Arial, sans-serif";
    for (let i = 0; i < 10; i++) {
      const x = (cell.width + 2 * pad) * i;
      ctx.strokeRect(0.5 + x, 0.5, cell.width + 2 * pad - 1, canvas.height - 1);
      ctx.fillText(String(i), x + pad + 0.5, cell.height);
    }
    const tex = new THREE.Texture(canvas);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * 控制编组 sprite。
   * @param group - 0-9
   */
  createControlGroupSprite(group: number): any {
    const color = this.gameObject.owner.color;
    if (!PipOverlay.controlGroupTextures.has(color.asHex())) {
      const tex = this.createControlGroupTexture(color);
      PipOverlay.controlGroupTextures.set(color.asHex(), tex);
    }
    const texture = PipOverlay.controlGroupTextures.get(color.asHex());
    const geometry = SpriteUtils.createSpriteGeometry({
      texture,
      textureArea: {
        x: group * (CG_CELL.width + 2 * CG_PAD),
        y: 0,
        width: CG_CELL.width + 2 * CG_PAD,
        height: CG_CELL.height + 2 * CG_PAD,
      },
      camera: this.camera,
      align: { x: 1, y: -1 },
      scale: Coords.ISO_WORLD_SCALE,
    });
    let material = PipOverlay.controlGroupMaterials.get(texture);
    if (!material) {
      material = new THREE.MeshBasicMaterial({
        map: texture,
        alphaTest: 0.5,
        transparent: true,
        depthTest: false,
        flatShading: true,
      });
      PipOverlay.controlGroupMaterials.set(texture, material);
    }
    const mesh = this.useSpriteBatching
      ? new BatchedMesh(geometry, material, BatchMode.Merging)
      : new THREE.Mesh(geometry, material);
    mesh.matrixAutoUpdate = false;
    mesh.renderOrder = 999996;
    return mesh;
  }

  /**
   * PRIMARY 文本纹理。
   * @param color - 玩家色
   */
  createPrimaryFactoryTexture(color: any): any {
    const canvas = OverlayUtils.createTextBox(this.strings.get("TXT_PRIMARY"), {
      color: color.asHexString(),
      borderColor: color.asHexString(),
      backgroundColor: "#000",
      fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
      fontSize: 14,
      fontWeight: "500",
      paddingTop: 3,
      paddingBottom: 3,
      paddingLeft: 4,
      paddingRight: 4,
    });
    const tex = new THREE.Texture(canvas);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }

  /** 主厂标记 sprite。 */
  createPrimaryFactorySprite(): any {
    if (this.objectIsOpaqueToViewer()) return;
    const color = this.gameObject.owner.color;
    if (!PipOverlay.primaryFactoryTextures.has(color.asHex())) {
      const tex = this.createPrimaryFactoryTexture(color);
      PipOverlay.primaryFactoryTextures.set(color.asHex(), tex);
    }
    const texture = PipOverlay.primaryFactoryTextures.get(color.asHex());
    const geometry = SpriteUtils.createSpriteGeometry({
      texture,
      camera: this.camera,
      align: { x: 1, y: -1 },
      offset: {
        x: -Math.floor(texture.image.width / 2),
        y: -Math.floor(texture.image.height / 2),
      },
      scale: Coords.ISO_WORLD_SCALE,
    });
    let material = PipOverlay.primaryFactoryMaterials.get(texture);
    if (!material) {
      material = new THREE.MeshBasicMaterial({
        map: texture,
        alphaTest: 0.5,
        transparent: true,
        depthTest: false,
        flatShading: true,
      });
      PipOverlay.primaryFactoryMaterials.set(texture, material);
    }
    const mesh = this.useSpriteBatching
      ? new BatchedMesh(geometry, material, BatchMode.Merging)
      : new THREE.Mesh(geometry, material);
    mesh.renderOrder = 999999;
    return mesh;
  }

  /**
   * 电力产/耗文本纹理。
   * @param text - 文本
   */
  createPowerInfoTexture(text: string): any {
    const canvas = OverlayUtils.createTextBox(text, {
      color: this.gameObject.owner.color.asHexString(),
      borderColor: this.gameObject.owner.color.asHexString(),
      backgroundColor: "#000",
      fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
      fontSize: 14,
      fontWeight: "500",
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 2,
      paddingRight: 4,
    });
    const tex = new THREE.Texture(canvas);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * 电力信息 sprite。
   * @param text - 文本
   */
  createPowerInfoSprite(text: string): any {
    if (this.objectIsOpaqueToViewer()) return;
    const texture = this.createPowerInfoTexture(text);
    const geometry = SpriteUtils.createSpriteGeometry({
      texture,
      camera: this.camera,
      align: { x: 1, y: 1 },
      offset: {
        x: -Math.floor(texture.image.width / 2),
        y: Math.floor(texture.image.height / 2),
      },
      scale: Coords.ISO_WORLD_SCALE,
    });
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0.5,
      transparent: true,
      depthTest: false,
      flatShading: true,
    });
    const mesh = this.useSpriteBatching
      ? new BatchedMesh(geometry, material, BatchMode.Merging)
      : new THREE.Mesh(geometry, material);
    mesh.renderOrder = 999998;
    return mesh;
  }

  /**
   * 老练星级图标。
   * @param unit - 单位
   */
  createVeteranIndicator(unit: any): any {
    if (unit.veteranLevel) {
      const frame = PipOverlay.pipsFile.getImage(14 + unit.veteranLevel - 1);
      const geometry = PipOverlay.geometries.get(frame);
      const mesh = this.useSpriteBatching
        ? new BatchedMesh(geometry, PipOverlay.material, BatchMode.Merging)
        : new THREE.Mesh(geometry, PipOverlay.material);
      mesh.matrixAutoUpdate = false;
      mesh.renderOrder = 999996;
      mesh.receiveShadow = false;
      return mesh;
    }
  }

  // check if this unit's owner has a Tech Hospital building
  /** 所属玩家是否有医院。 */
  _hasTechHospital(): boolean {
    const obj = this.gameObject;
    if (!obj.owner || !obj.owner.buildings) return false;
    for (const b of obj.owner.buildings) {
      if (b.buildStatus !== 1) continue;
      if (obj.isInfantry() && b.rules.infantryGainSelfHeal > 0) return true;
      if (obj.isVehicle() && b.rules.unitsGainSelfHeal > 0) return true;
    }
    return false;
  }

  // check if this unit is actively being healed (injured + has Tech Hospital)
  /** 是否正在被医院治疗。 */
  _isBeingHealed(): boolean {
    return this.gameObject.healthTrait.health < 100 && this._hasTechHospital();
  }

  /** 治疗图标 mesh（独立材质可闪）。 */
  createHealingIndicator(): any {
    // Use pips.shp frame 13 (medical cross) for infantry, frame 20 (wrench) for vehicles
    const frameIdx = this.gameObject.isInfantry() ? 13 : 20;
    const img = PipOverlay.pipsFile.getImage(frameIdx);
    if (!img) return void 0;
    const geo = PipOverlay.geometries.get(img);
    if (!geo) return void 0;
    // Dedicated material so the heal-pulse flash can animate opacity/brightness
    // without affecting the shared pip material (PipOverlay.material). alphaTest is lowered
    // so the semi-transparent flash state isn't discarded (alphaTest 0.5 would).
    this.healingMaterial ??= new PaletteBasicMaterial({
      map: PipOverlay.atlasCache.getTexture(),
      palette: TextureUtils.textureFromPalette(this.palette),
      alphaTest: 0.1,
      flatShading: true,
      transparent: true,
      depthTest: false,
    });
    const mesh = this.useSpriteBatching
      ? new BatchedMesh(geo, this.healingMaterial, BatchMode.Merging)
      : new THREE.Mesh(geo, this.healingMaterial);
    mesh.matrixAutoUpdate = false;
    mesh.renderOrder = 999996;
    mesh.receiveShadow = false;
    return mesh;
  }

  /** 重建治疗图标位置。 */
  updateHealingIndicatorSprite(): void {
    if (this.healingIndicator) this.rootObj.remove(this.healingIndicator);
    this.healingIndicator = void 0;
    // Only the owner, allies and observers see the heal icon (enemies don't).
    if (this._hasTechHospital() && !this.objectIsOpaqueToViewer()) {
      const indicator = this.createHealingIndicator();
      if (indicator) {
        this.rootObj.add(indicator);
        // Position the healing indicator to the right of the health bar
        const pipBrd = PipOverlay.pipBrdFile.getImage(this.gameObject.isInfantry() ? 1 : 0);
        const iconFrame = this.gameObject.isInfantry() ? 13 : 20;
        const pos = Coords.screenDistanceToWorld(
          Math.floor(pipBrd.width / 2) +
            Math.floor(PipOverlay.pipsFile.getImage(iconFrame).width / 2) +
            2,
          0,
        );
        indicator.position.x = pos.x;
        // Match the health bar's height so the icon sits beside the bar,
        // not at the unit's feet (same pattern as the control-group sprite).
        indicator.position.y = this.healthBar.position.y;
        indicator.position.z = pos.y;
        indicator.updateMatrix();
        this.healingIndicator = indicator;
      }
    }
  }

  get3DObject(): any {
    return this.rootObj;
  }

  /**
   * 主更新：脏检测刷新各元素。
   * @param now - rAF 时间戳
   */
  update(now: number): void {
    const obj = this.gameObject;
    if (obj.isDestroyed || obj.isCrashing) {
      this.rootObj.visible = false;
      return;
    }
    if (obj.healthTrait.health !== this.lastHealth) {
      this.lastHealth = obj.healthTrait.health;
      this.invalidatedElements[0] = true;
    }
    const level = this.selectionModel.getSelectionLevel();
    if (
      this.invalidatedElements[0] &&
      (level >= LEVEL_REQUIRE[0] || level >= LEVEL_REQUIRE[3])
    ) {
      this.invalidatedElements[0] = void 0 as any;
      this.updateHealthBarSprite(level);
    }
    let pipsKey = this.computePipsDataKey(obj);
    if (this.lastPipsDataKey !== pipsKey || this.lastOwner !== obj.owner) {
      this.lastPipsDataKey = pipsKey;
      this.invalidatedElements[1] = true;
    }
    if (this.invalidatedElements[1] && level >= LEVEL_REQUIRE[1]) {
      this.invalidatedElements[1] = void 0 as any;
      this.updatePipsSprite();
    }
    const group = this.selectionModel.getControlGroupNumber();
    if (this.lastControlGroup !== group) {
      this.lastControlGroup = group;
      this.invalidatedElements[3] = true;
    }
    if (this.invalidatedElements[3] && level >= LEVEL_REQUIRE[3]) {
      this.invalidatedElements[3] = void 0 as any;
      this.updateControlGroupSprite(group);
    }
    const isPrimary =
      obj.isBuilding() &&
      !!obj.rules.factory &&
      obj.owner.production?.getPrimaryFactory(obj.rules.factory) === obj;
    if (this.lastPrimaryFactory !== isPrimary || this.lastOwner !== obj.owner) {
      this.lastPrimaryFactory = isPrimary;
      this.invalidatedElements[4] = true;
    }
    if (this.invalidatedElements[4] && level >= LEVEL_REQUIRE[4]) {
      this.invalidatedElements[4] = void 0 as any;
      this.updatePrimaryFactorySprite(isPrimary);
    }
    // show power info overlay for power-generating buildings
    const showPower = obj.isBuilding() && obj.rules.power > 0 && !!obj.owner?.powerTrait;
    const powerVal = showPower ? obj.owner.powerTrait.power : -1;
    const drainVal = showPower ? obj.owner.powerTrait.drain : -1;
    if (
      this.lastPowerInfo !== showPower ||
      this.lastPowerVal !== powerVal ||
      this.lastDrainVal !== drainVal
    ) {
      this.lastPowerInfo = showPower;
      this.lastPowerVal = powerVal;
      this.lastDrainVal = drainVal;
      this.invalidatedElements[6] = true;
    }
    if (this.invalidatedElements[6] && level >= LEVEL_REQUIRE[6]) {
      this.invalidatedElements[6] = void 0 as any;
      this.updatePowerInfoSprite(showPower, powerVal, drainVal);
    }
    const rally = (obj.isBuilding() && obj.rallyTrait?.getRallyPoint()) || void 0;
    if (this.lastRallyPoint !== rally || this.lastOwner !== obj.owner) {
      this.lastRallyPoint = rally;
      this.invalidatedElements[5] = true;
    }
    if (this.invalidatedElements[5] && level >= LEVEL_REQUIRE[5] && this.rallyLine) {
      this.invalidatedElements[5] = void 0 as any;
      this.updateRallyPointLine(rally, this.rallyLine);
    }

    if (obj.isBuilding()) {
      this.secureProgressSprite?.update(now);
      const repair = !obj.autoRepairTrait.isDisabled();
      if (this.lastRepairState !== repair) {
        this.lastRepairState = repair;
        this.updateRepairWrenchSprite(repair);
      }
    } else {
      this.unitCastBarSprite?.update(now);
      if (this.lastVeteranLevel !== obj.veteranLevel) {
        this.lastVeteranLevel = obj.veteranLevel;
        this.updateVeteranIndicatorSprite(obj);
      }
      // Tech Hospital healing indicator — steady when full, blinks on each heal pulse
      if (obj.isInfantry() || obj.isVehicle()) {
        // Gate on viewer relationship so enemies never see the heal icon
        const has = this._hasTechHospital() && !this.objectIsOpaqueToViewer();
        const heal = this._isBeingHealed();
        // Rebuild indicator when Tech Hospital presence changes
        if (has !== this.lastHasTechHospital) {
          this.lastHasTechHospital = has;
          this.lastBeingHealed = heal;
          this.updateHealingIndicatorSprite();
        }
        // Detect heal pulse: the hospital heal trait marks every unit it
        // actually heals (including the pulse that restores full HP). The
        // icon flashes on that mark and stays steady otherwise — full-health
        // units never flash, and other heal sources don't trigger it.
        if (obj.__hospitalHealFlash) {
          this.healFlashTimer = 200; // ~200ms flash
          obj.__hospitalHealFlash = false;
        }
        // Tick down flash timer using real elapsed ms (now is the rAF timestamp)
        if (this._lastHealUpdate !== void 0) {
          this.healFlashTimer -= now - this._lastHealUpdate;
        }
        this._lastHealUpdate = now;
        // Show only while the health bar is shown (hover/select).
        if (this.healingIndicator) {
          this.healingIndicator.visible = level >= LEVEL_REQUIRE[0];
          const flash = this.healFlashTimer > 0 ? this.healFlashTimer / 200 : 0;
          const opacity = 1 - 0.55 * flash;
          const el = -0.6 * flash;
          const icon = this.healingIndicator;
          // Batched path: per-item tint/alpha is baked into vertexColorMult
          // by MeshBatchManager from the BatchedMesh's own opacity/extraLight.
          if (icon.setOpacity) {
            icon.setOpacity(opacity);
            (this._healExtraLight ??= new THREE.Vector3()).set(el, el, el);
            icon.setExtraLight(this._healExtraLight);
          } else {
            // Non-batched path: animate the dedicated material directly.
            const mat = icon.material;
            mat.opacity = opacity;
            mat.extraLight.set(el, el, el);
          }
        }
      }
    }

    this.updateFlyerHelper(level, now);
    this.updateBehindAnim(now);
    this.updateDebugLabel();
    if (this.lastSelectionLevel === void 0 || this.lastSelectionLevel !== level) {
      this.lastSelectionLevel = level;
      const visibility = new Map<any, any>([
        [0, this.healthBar],
        [2, this.selectionBox],
        [1, this.pipsSprite],
        [3, this.controlGroupSprite],
        [4, this.primaryFactorySprite],
        [5, this.rallyLine],
        [6, this.powerInfoSprite],
      ]);
      visibility.forEach((el, idx) => {
        if (el) el.visible = level >= LEVEL_REQUIRE[idx];
      });
    }
    this.lastOwner = obj.owner;
    this.lastDebugTextEnabled = this.debugTextEnabled.value;
    this.repairWrench?.update(now);
  }

  /**
   * flyer helper 显隐与高度。
   * @param level - 选择级别
   * @param now - 时间戳
   */
  updateFlyerHelper(level: any, now: number): void {
    if (!this.flyHelper || !this.gameObject.isUnit()) return;
    let show: boolean;
    switch (this.flyerHelperOpt.value) {
      case FlyerHelperMode.Never:
        show = false;
        break;
      case FlyerHelperMode.Always:
        show = true;
        break;
      case FlyerHelperMode.Selected:
        show = level >= SelectionLevel.Selected;
        break;
      default:
        show = false;
    }
    show = show && this.gameObject.zone === ZoneType.Air;
    const obj = this.flyHelper.get3DObject();
    obj.visible = show;
    if (show) {
      this.flyHelper.update(now);
      const y = -Coords.tileHeightToWorld(this.gameObject.tileElevation);
      if (y !== obj.position.y) {
        obj.position.y = y;
        obj.updateMatrix();
      }
    }
  }

  /**
   * 遮挡 behind 动画。
   * @param now - 时间戳
   */
  updateBehindAnim(now: number): void {
    if (!this.behindAnim) return;
    if (
      this.hiddenObjectsOpt.value &&
      this.gameObject.isSpawned &&
      this.gameObject.tile.occluded &&
      this.gameObject.art.canBeHidden &&
      this.gameObject.zone !== ZoneType.Air
    ) {
      this.behindAnim?.update(now);
      if (!this.behindAnim.get3DObject()?.parent) {
        this.behindAnim.create3DObject();
        this.rootObj.add(this.behindAnim.get3DObject());
        this.behindAnim.get3DObject().updateMatrix();
      }
    } else if (this.behindAnim.get3DObject()?.parent) {
      this.rootObj.remove(this.behindAnim.get3DObject());
    }
  }

  /** 调试标签脏刷新。 */
  updateDebugLabel(): void {
    if (
      this.gameObject.debugLabel !== this.lastDebugLabel ||
      this.gameObject.owner !== this.lastOwner ||
      this.debugTextEnabled.value !== this.lastDebugTextEnabled
    ) {
      this.lastDebugLabel = this.gameObject.debugLabel;
      if (this.debugLabel) {
        this.rootObj.remove(this.debugLabel.get3DObject());
        this.debugLabel.dispose();
        this.debugLabel = void 0;
      }
      if (this.gameObject.debugLabel && this.debugTextEnabled.value) {
        const label = new DebugLabel(
          this.gameObject.debugLabel,
          this.gameObject.owner.color.asHex(),
          this.camera,
        );
        this.debugLabel = label;
        label.create3DObject();
        label.get3DObject().renderOrder = 999999;
        this.rootObj.add(label.get3DObject());
      }
    }
  }

  /**
   * 维修扳手开关。
   * @param show - 是否显示
   */
  updateRepairWrenchSprite(show: boolean): void {
    if (this.repairWrench) this.rootObj.remove(this.repairWrench.get3DObject());
    if (show) {
      this.repairWrench = this.createRepairWrench();
      if (this.repairWrench) {
        this.repairWrench.create3DObject();
        this.rootObj.add(this.repairWrench.get3DObject());
      }
    }
  }

  /**
   * 老练星位置刷新。
   * @param unit - 单位
   */
  updateVeteranIndicatorSprite(unit: any): void {
    if (this.veteranIndicator) this.rootObj.remove(this.veteranIndicator);
    this.veteranIndicator = this.createVeteranIndicator(unit);
    if (this.veteranIndicator) {
      this.rootObj.add(this.veteranIndicator);
      const pos = Coords.screenDistanceToWorld(
        Math.floor(PipOverlay.pipBrdFile.getImage(unit.isInfantry() ? 1 : 0).width / 2) -
          Math.floor(PipOverlay.pipsFile.getImage(14).width / 2),
        0,
      );
      this.veteranIndicator.position.x = pos.x;
      this.veteranIndicator.position.y = 0;
      this.veteranIndicator.position.z = pos.y;
      this.veteranIndicator.updateMatrix();
    }
  }

  /**
   * 集结点线状态。
   * @param tile - 集结地块
   * @param line - RallyPointFx
   */
  updateRallyPointLine(tile: any, line: any): void {
    line.visible = false;
    if (!tile) return;
    if (this.objectIsOpaqueToViewer()) return;
    line.sourcePos = this.gameObject.position.worldPosition;
    line.targetPos = Coords.tile3dToWorld(tile.rx + 0.5, tile.ry + 0.5, tile.z);
    line.color = new THREE.Color(this.gameObject.owner.color.asHex());
    line.needsUpdate = true;
    line.visible = true;
  }

  /**
   * 主厂标记。
   * @param show - 是否显示
   */
  updatePrimaryFactorySprite(show: boolean): void {
    if (this.primaryFactorySprite) this.rootObj.remove(this.primaryFactorySprite);
    if (!show) return;
    const sprite = (this.primaryFactorySprite = this.createPrimaryFactorySprite());
    if (sprite) this.rootObj.add(sprite);
  }

  /**
   * 电力信息。
   * @param show - 是否显示
   * @param power - 产电
   * @param drain - 耗电
   */
  updatePowerInfoSprite(show: boolean, power: number, drain: number): void {
    if (this.powerInfoSprite) {
      this.rootObj.remove(this.powerInfoSprite);
      this.powerInfoSprite = void 0;
    }
    if (show && power !== void 0 && drain !== void 0) {
      const text = this.strings.get("TXT_POWER_DRAIN", power, drain);
      const sprite = this.createPowerInfoSprite(text);
      if (sprite) {
        this.powerInfoSprite = sprite;
        this.rootObj.add(sprite);
      }
    }
  }

  /**
   * 控制编组位置。
   * @param group - 编组号
   */
  updateControlGroupSprite(group: number | undefined): void {
    if (this.controlGroupSprite) this.rootObj.remove(this.controlGroupSprite);
    if (group === void 0) return;
    const sprite = (this.controlGroupSprite = this.createControlGroupSprite(group));
    const obj = this.gameObject;
    if (obj.isBuilding()) {
      sprite.position.x = 1;
      sprite.position.y = Coords.tileHeightToWorld(obj.art.height - 0.5);
      sprite.position.z = Coords.getWorldTileSize() * obj.art.foundation.height;
    } else if (obj.isInfantry()) {
      const pos = Coords.screenDistanceToWorld(
        -(CG_CELL.width + 2 * CG_PAD + PipOverlay.pipBrdFile.getImage(1).width / 2 + 1),
        -PipOverlay.pipBrdFile.height / 2,
      );
      sprite.position.x = pos.x;
      sprite.position.y = this.healthBar.position.y;
      sprite.position.z = pos.y;
    } else {
      const pos = Coords.screenDistanceToWorld(
        -PipOverlay.pipBrdFile.getImage(0).width / 2,
        PipOverlay.pipBrdFile.height / 2,
      );
      sprite.position.x = pos.x;
      sprite.position.y = this.healthBar.position.y;
      sprite.position.z = pos.y;
    }
    sprite.updateMatrix();
    this.rootObj.add(sprite);
  }

  /** 按类型重建 pips。 */
  updatePipsSprite(): void {
    if (this.pipsSprite) {
      this.rootObj.remove(this.pipsSprite);
      this.pipsSprite = void 0;
    }
    const obj = this.gameObject;
    let sprite: any;
    if (obj.isBuilding()) {
      sprite = this.createBuildingOccupationInfo(obj);
    } else if (obj.isVehicle()) {
      let colors: any[] = [];
      let total: number | undefined = void 0;
      // PipScale=MindControl — green/red pips for controlled targets.
      if (obj.rules.pipScale === PipScale.MindControl) {
        const targets = obj.mindControllerTrait.getTargets().length;
        const safe = obj.mindControllerTrait.maxCapacity;
        const pipCount = Math.max(safe, targets);
        for (let i = 0; i < pipCount; i++) {
          if (i < targets) {
            colors.push(i < safe ? PipColor.Green : PipColor.Red);
          }
          // else leave empty (no pip → show blank slot)
        }
        total = pipCount;
        sprite = this.createPipsSprite(colors, total);
      } else if (obj.harvesterTrait && obj.rules.storage > 0) {
        total = 5;
        const storage = obj.rules.storage;
        const gems = Math.floor((obj.harvesterTrait.gems / storage) * total);
        const ore = Math.floor((obj.harvesterTrait.ore / storage) * total);
        colors.push(...new Array(gems).fill(PipColor.Blue), ...new Array(ore).fill(PipColor.Yellow));
        if (total) sprite = this.createPipsSprite(colors, total);
      } else if (obj.transportTrait && obj.rules.passengers > 0) {
        total = obj.rules.passengers;
        obj.transportTrait.units.forEach((passenger: any) => {
          let vehicleCells = 0;
          if (passenger.isVehicle()) {
            colors.push(PipColor.Blue);
            vehicleCells++;
          }
          colors.push(
            ...new Array(passenger.rules.size - vehicleCells).fill(
              passenger.isVehicle() ? PipColor.Red : passenger.rules.pip,
            ),
          );
        });
        if (total) sprite = this.createPipsSprite(colors, total);
      } else if (obj.airSpawnTrait) {
        colors = new Array(obj.airSpawnTrait.availableSpawns).fill(PipColor.Yellow);
        total = obj.rules.spawnsNumber;
        if (total) sprite = this.createPipsSprite(colors, total);
      }
    } else if (obj.isInfantry() && obj.harvesterTrait && obj.rules.storage > 0) {
      // infantry with a cargo trait (SlaveMiner slaves, SLAV). Renders
      // ore/gems pips exactly like the vehicle harvester branch above. Slaves are
      // forced to Storage=3 so the pip scale matches the expected 3-cell cargo.
      const total = obj.rules.storage;
      const storage = obj.rules.storage;
      const gems = Math.floor((obj.harvesterTrait.gems / storage) * total);
      const ore = Math.floor((obj.harvesterTrait.ore / storage) * total);
      const colors = [
        ...new Array(gems).fill(PipColor.Blue),
        ...new Array(ore).fill(PipColor.Yellow),
      ];
      sprite = this.createPipsSprite(colors, total);
    } else if (
      obj.isAircraft() &&
      obj.ammo &&
      obj.name !== this.paradropRules.paradropPlane &&
      !obj.rules.missileSpawn
    ) {
      sprite = this.createPipsSprite(new Array(obj.ammo).fill(PipColor.Green), obj.ammo, true);
    }
    if (sprite) {
      sprite.updateMatrix();
      this.rootObj.add(sprite);
      this.pipsSprite = sprite;
    }
  }

  /**
   * pips 脏 key。
   * @param obj - 对象
   */
  computePipsDataKey(obj: any): any {
    let key: any = void 0;
    if (obj.isBuilding()) {
      if (obj.rules.pipScale === PipScale.MindControl) {
        key =
          (obj.mindControllerTrait?.getTargets().length || 0) +
          "_" +
          (obj.mindControllerTrait?.maxCapacity || 3);
      } else if (obj.rules.infantryAbsorb) {
        key =
          (obj.garrisonTrait?.units?.length || 0) + "_" + (obj.rules.passengers || 0);
      } else {
        key = obj.garrisonTrait?.units.length;
      }
    } else if (obj.isVehicle()) {
      if (obj.mindControllerTrait) {
        key = obj.mindControllerTrait.getTargets().length + "_" + obj.mindControllerTrait.maxCapacity;
      } else if (obj.harvesterTrait) {
        key = obj.harvesterTrait.ore + "_" + obj.harvesterTrait.gems;
      } else if (obj.transportTrait) {
        key = obj.transportTrait.units.length;
      } else if (obj.airSpawnTrait) {
        key = obj.airSpawnTrait.availableSpawns;
      }
    } else if (obj.isInfantry() && obj.harvesterTrait) {
      key = obj.harvesterTrait.ore + "_" + obj.harvesterTrait.gems;
    } else if (obj.isAircraft()) {
      key = obj.ammo;
    }
    return key;
  }

  /**
   * 血条重建。
   * @param level - 选择级别（控制选框可见性）
   */
  updateHealthBarSprite(level: any): void {
    if (this.healthBar) {
      this.rootObj.remove(this.healthBar);
      if (this.gameObject.isBuilding()) {
        this.healthBar = this.createBuildingHealthBar(this.gameObject);
      } else {
        const { healthBarWrapper, selectionBox } = this.createUnitHealthBar(this.gameObject);
        this.healthBar = healthBarWrapper;
        this.selectionBox = selectionBox;
        selectionBox.visible = level >= LEVEL_REQUIRE[2];
      }
      this.rootObj.add(this.healthBar);
    }
    // re-evaluate healing indicator when health bar is refreshed (health changed)
    if (this.gameObject.isInfantry() || this.gameObject.isVehicle()) {
      const has = this._hasTechHospital() && !this.objectIsOpaqueToViewer();
      const heal = this._isBeingHealed();
      if (has !== this.lastHasTechHospital || heal !== this.lastBeingHealed) {
        this.lastHasTechHospital = has;
        this.lastBeingHealed = heal;
        this.updateHealingIndicatorSprite();
      }
    }
  }

  /** 维修扳手动画。 */
  createRepairWrench(): any {
    const wrench = this.animFactory("WRENCH");
    wrench.setRenderOrder(999998);
    return wrench;
  }

  /** 观察者/己方/盟友可见；敌方不可见。 */
  objectIsOpaqueToViewer(): boolean {
    const local = this.viewer.value;
    if (!local || local.isObserver) return false;
    return !(
      this.gameObject.owner === local || this.alliances.areAllied(this.gameObject.owner, local)
    );
  }

  dispose(): void {
    this.disposables.dispose();
    this.unitCastBarSprite?.dispose();
    this.secureProgressSprite?.dispose();
    this.repairWrench?.dispose();
    this.flyHelper?.dispose();
    this.behindAnim?.dispose();
    this.debugLabel?.dispose();
    if (this.powerInfoSprite) {
      this.rootObj.remove(this.powerInfoSprite);
      this.powerInfoSprite = void 0;
    }
    // clean up healing indicator + its dedicated material
    if (this.healingIndicator) {
      this.rootObj.remove(this.healingIndicator);
      this.healingIndicator = void 0;
    }
    if (this.healingMaterial) {
      this.healingMaterial.dispose();
      this.healingMaterial = void 0;
    }
    this.animFactory = void 0;
  }
}
