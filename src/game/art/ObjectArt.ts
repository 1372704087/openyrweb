/**
 * ObjectArt — 单对象美术规则（art.ini 段 + 规则派生的默认值/动画/旋翼/FLH）。
 *
 * 静态 default* 按 ObjectType 给出调色板、照明、可重染、绘制偏移、阴影与
 * 占用高度的缺省；factory 对步兵额外读 Sequence 节。init 顺序与字段语义
 * 与孪生逐项对齐。
 *
 * 由 game/art/ObjectArt.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { PaletteType } from "engine/type/PaletteType"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { SequenceReader } from "game/art/SequenceReader"; // 已转换
import { LightingType } from "engine/type/LightingType"; // 已转换
import { LandType } from "game/type/LandType"; // 已转换
import * as OverlayRulesModule from "game/rules/OverlayRules"; // 孪生（any-shim，未转换）
import { TechnoRules } from "game/rules/TechnoRules"; // 已转换
import * as TerrainRulesModule from "game/rules/TerrainRules"; // 孪生（any-shim，未转换）
import { ProjectileRules } from "game/rules/ProjectileRules"; // 已转换
import { FlhCoords } from "game/art/FlhCoords"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换

const OverlayRules = (OverlayRulesModule as any).OverlayRules;
const TerrainRules = (TerrainRulesModule as any).TerrainRules;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 单对象美术。 */
export class ObjectArt {
  /** 线尾迹颜色默认衰减。 */
  static DEFAULT_LINE_TRAIL_DEC = 16;
  /** 缺失 cameo 图标名。 */
  static MISSING_CAMEO = "xxicon";

  /** 按对象类型取默认调色板类别。 */
  static getDefaultPalette(type: any): any {
    switch (type) {
      case ObjectType.Building:
      case ObjectType.Aircraft:
      case ObjectType.Infantry:
      case ObjectType.Vehicle:
      case ObjectType.Projectile:
      case ObjectType.VoxelAnim:
        return PaletteType.Unit;
      case ObjectType.Overlay:
        return PaletteType.Overlay;
      case ObjectType.Smudge:
      case ObjectType.Terrain:
        return PaletteType.Iso;
      default:
        ObjectType.Animation;
        return PaletteType.Anim;
    }
  }

  /** 按对象类型取默认照明等级。 */
  static getDefaultLighting(type: any): any {
    switch (type) {
      case ObjectType.Animation:
        return LightingType.None;
      case ObjectType.Aircraft:
      case ObjectType.Building:
      case ObjectType.Infantry:
      case ObjectType.Vehicle:
        return LightingType.Ambient;
      case ObjectType.Projectile:
      case ObjectType.VoxelAnim:
        return LightingType.Global;
      case ObjectType.Overlay:
      case ObjectType.Smudge:
      case ObjectType.Terrain:
      default:
        return LightingType.Full;
    }
  }

  /** 按对象类型取是否可按阵营重染色。 */
  static getDefaultRemapability(type: any): boolean {
    switch (type) {
      case ObjectType.Aircraft:
      case ObjectType.Building:
      case ObjectType.Infantry:
      case ObjectType.Vehicle:
        return true;
      case ObjectType.Overlay:
      case ObjectType.Smudge:
      case ObjectType.Terrain:
      case ObjectType.Animation:
      case ObjectType.Projectile:
      case ObjectType.VoxelAnim:
        return false;
      default:
        throw new Error("Unknown object type " + type);
    }
  }

  /** 按对象类型取默认绘制 Y 偏移。 */
  static getDefaultDrawOffset(type: any): any {
    switch (type) {
      case ObjectType.Animation:
      case ObjectType.Building:
      case ObjectType.Vehicle:
      case ObjectType.Infantry:
      case ObjectType.Overlay:
      case ObjectType.Smudge:
      case ObjectType.Projectile:
      case ObjectType.VoxelAnim:
        return new Vector2(0, 0);
      case ObjectType.Terrain:
      case ObjectType.Aircraft:
        return new Vector2(0, (Coords.ISO_TILE_SIZE + 1) / 2);
      default:
        throw new Error("Unknown object type " + type);
    }
  }

  /** 按对象类型取默认是否画阴影（default 分支与 Smudge 等一并 false）。 */
  static getDefaultShadow(type: any): boolean {
    switch (type) {
      case ObjectType.Overlay:
      case ObjectType.Building:
      case ObjectType.Infantry:
      case ObjectType.Terrain:
      case ObjectType.Vehicle:
      case ObjectType.Aircraft:
        return true;
      default:
      case ObjectType.Smudge:
      case ObjectType.Animation:
      case ObjectType.Projectile:
      case ObjectType.VoxelAnim:
        return false;
    }
  }

  /** 按对象类型取默认占用高度层。 */
  static getDefaultHeight(type: any): number {
    switch (type) {
      case ObjectType.Building:
        return 2;
      case ObjectType.Infantry:
      case ObjectType.Vehicle:
      case ObjectType.Aircraft:
        return 1;
      default:
        return 0;
    }
  }

  /**
   * 工厂：构造实例；步兵若 art 段指定 Sequence= 且该节存在则装载序列。
   * @param type - ObjectType
   * @param rules - 对应规则对象
   * @param artIni - art.ini（用于 Sequence 节查找）
   * @param artSection - 对象 art 段
   */
  static factory(type: any, rules: any, artIni: any, artSection: any): any {
    const inst = new this(type, rules, artSection);
    if (type === ObjectType.Infantry) {
      let seqName = artSection.getString("Sequence");
      if (seqName) {
        const seqSection = artIni.getSection(seqName);
        if (seqSection) inst.sequences = new SequenceReader().readIni(seqSection);
      }
    }
    return inst;
  }

  /** 步兵 Sequence 表。 */
  sequences: Map<any, any>;
  /** 建筑停靠偏移。 */
  dockingOffsets: any[];
  type: any;
  rules: any;
  art: any;

  image: any;
  report: any;
  rotors: any;
  noHva: any;
  startSound: any;
  muzzleFlash: any;
  paletteType: any;
  lightingType: any;
  customPaletteName: any;
  remapable: any;
  flat: any;
  queueingCell: any;
  demandLoad: any;
  useLineTrail: any;
  lineTrailColor: any;
  lineTrailColorDecrement: any;
  crater: any;
  forceBigCraters: any;
  scorch: any;
  height: any;
  isVoxel: any;
  occupyHeight: any;
  canHideThings: any;
  canBeHidden: any;
  addOccupy: any;
  removeOccupy: any;
  rotates: any;
  toOverlay: any;

  constructor(type: any, rules: any, art: any) {
    this.sequences = new Map();
    this.dockingOffsets = [];
    this.type = type;
    this.rules = rules;
    this.art = art;
    this.init();
  }

  /** 按 art 段顺序读取全部字段（与孪生 init 语句序一致）。 */
  init(): void {
    this.image = [ObjectType.Infantry, ObjectType.Vehicle, ObjectType.Aircraft].includes(
      this.type,
    )
      ? ""
      : this.art.getString("Image");
    this.report = this.art.getString("Report") || void 0;
    this.readRotors();
    this.noHva = this.art.getBool("NoHVA");
    this.startSound = this.art.getString("StartSound") || void 0;
    this.readMuzzleFlash();
    this.readPaletteAndLightingTypes();
    this.readRemapability();
    this.readFlatness();
    this.readDockingOffsets();
    const queueing = this.art.getNumberArray("QueueingCell");
    this.queueingCell = queueing.length ? new Vector2(queueing[0], queueing[1]) : void 0;
    this.demandLoad = this.art.getBool("DemandLoad");
    const useTrail = this.art.getBool("UseLineTrail");
    const trailColor = this.art.getNumberArray("LineTrailColor");
    const trailDec = this.art.getNumber("LineTrailColorDecrement", ObjectArt.DEFAULT_LINE_TRAIL_DEC);
    if (useTrail && trailColor.length) {
      this.useLineTrail = true;
      this.lineTrailColor = trailColor;
      this.lineTrailColorDecrement = trailDec;
    } else {
      this.useLineTrail = false;
    }
    this.crater = this.art.getBool("Crater");
    this.forceBigCraters = this.art.getBool("ForceBigCraters");
    this.scorch = this.art.getBool("Scorch");
    this.height = this.art.getNumber("Height", ObjectArt.getDefaultHeight(this.type));
    this.isVoxel = this.art.getBool("Voxel");
    this.occupyHeight = this.art.getNumber("OccupyHeight", this.height);
    this.canHideThings =
      this.type === ObjectType.Building ? this.art.getBool("CanHideThings", true) : false;
    this.canBeHidden = this.art.getBool("CanBeHidden", true);
    this.addOccupy = this.readAddRemoveOccupy("AddOccupy");
    this.removeOccupy = this.readAddRemoveOccupy("RemoveOccupy");
    this.rotates = this.art.getBool("Rotates");
    this.toOverlay = this.art.getString("ToOverlay") || void 0;
  }

  /** 实际图像名（Image || rules.imageName，北极图追加 A）。 */
  get imageName(): any {
    return (this.image || this.rules.imageName) + (this.rules.alternateArcticArt ? "A" : "");
  }

  /** cameo 文件名（小写；缺省 xxicon）。 */
  get cameo(): any {
    const name = this.art.getString("Cameo") || ObjectArt.MISSING_CAMEO;
    return name.toLowerCase();
  }

  /** 备用 cameo（缺省回落主 cameo）。 */
  get altCameo(): any {
    const name = this.art.getString("AltCameo") || this.cameo;
    return name.toLowerCase();
  }

  /** 是否使用战区扩展名。 */
  get useTheaterExtension(): any {
    return this.art.getBool("Theater");
  }

  /** 解析调色板与照明类型（含 Overlay/Terrain 特例链）。 */
  readPaletteAndLightingTypes(): void {
    this.paletteType = PaletteType.Default;
    this.lightingType = LightingType.Default;
    // 孪生：仅 OverlayRules 且 noUseTileLandType 为真时强制 Iso/Full（三元短路取 void 0）
    if (this.rules instanceof OverlayRules ? this.rules.noUseTileLandType : void 0) {
      this.paletteType = PaletteType.Iso;
      this.lightingType = LightingType.Full;
    }
    if (this.art.getBool("TerrainPalette") || this.art.getBool("ShouldUseCellDrawer")) {
      this.paletteType = PaletteType.Iso;
    } else if (this.art.getBool("AnimPalette")) {
      this.paletteType = PaletteType.Anim;
      this.lightingType = LightingType.None;
    } else if (this.art.getString("Palette")) {
      this.paletteType = PaletteType.Custom;
      this.customPaletteName = this.art.getString("Palette");
    }
    if (this.art.getBool("AltPalette")) this.paletteType = PaletteType.Unit;
    if (
      (this.rules instanceof OverlayRules || this.rules instanceof TechnoRules) &&
      this.rules.wall
    ) {
      this.paletteType = PaletteType.Unit;
      this.lightingType = LightingType.Ambient;
    }
    if ((this.rules instanceof TerrainRules || this.rules instanceof TechnoRules) && this.rules.gate) {
      this.paletteType = PaletteType.Unit;
    }
    if (this.rules instanceof TerrainRules && this.rules.spawnsTiberium) {
      this.paletteType = PaletteType.Unit;
      this.lightingType = LightingType.None;
    }
    if (this.rules instanceof OverlayRules) {
      if (this.rules.isVeins) {
        this.paletteType = PaletteType.Unit;
        this.lightingType = LightingType.None;
      }
      if (this.rules.isVeinholeMonster) {
        this.paletteType = PaletteType.Unit;
        this.lightingType = LightingType.None;
      }
      if (this.rules.tiberium) this.lightingType = LightingType.None;
      if (this.rules.land === LandType.Railroad) {
        this.paletteType = PaletteType.Iso;
        this.lightingType = LightingType.Full;
      }
      if (this.rules.crate) {
        this.paletteType = PaletteType.Iso;
        this.lightingType = LightingType.Full;
      }
    }
    if (this.paletteType === PaletteType.Default) {
      this.paletteType = ObjectArt.getDefaultPalette(this.type);
    }
    if (this.lightingType === LightingType.Default) {
      this.lightingType = ObjectArt.getDefaultLighting(this.type);
    }
  }

  /** 是否可按阵营重染（地形/动画调色板强制否，弹丸 firersPalette 强制是）。 */
  readRemapability(): void {
    this.remapable = ObjectArt.getDefaultRemapability(this.type);
    if (this.art.getBool("TerrainPalette") || this.art.getBool("AnimPalette")) {
      this.remapable = false;
    } else if (this.rules instanceof ProjectileRules && this.rules.firersPalette) {
      this.remapable = true;
    }
  }

  /** 是否平面（贴地）绘制。 */
  readFlatness(): void {
    let flat = false;
    if (this.type === ObjectType.Building || this.type === ObjectType.Animation) {
      flat = this.art.getBool("Flat");
    } else if (this.type === ObjectType.Smudge) {
      flat = true;
    }
    // 孪生：非墙/矿箱/岩石的 Overlay 在三者全假时把 flat 置 true（短路赋值）
    if (
      this.rules instanceof OverlayRules &&
      (this.rules.wall || this.rules.crate || this.rules.isARock || (flat = true))
    ) {
      // wall/crate/rock 任一为真时短路不改 flat；全假则 flat=true
    }
    this.flat = flat;
  }

  /** 读取旋翼 Rotors/RotorNAxis/RotorNRate。 */
  readRotors(): void {
    const names = this.art.getArray("Rotors");
    if (names.length) {
      const list: any[] = [];
      for (let i = 0; i < names.length; ++i) {
        const axisArr = this.art.getNumberArray(`Rotor${i + 1}Axis`, void 0, [0, 1, 0]);
        // 孪生调用 THREE.Vector3.normalize；ambient 声明未列该方法，经 any 桥接保持运行时语义
        const axisVec: any = new Vector3(-axisArr[2], -axisArr[0], axisArr[1]);
        const axis = axisVec.normalize();
        list.push({
          name: names[i],
          axis: axis,
          speed: this.art.getNumber(`Rotor${i + 1}Rate`) || void 0,
          idleSpeed: this.art.getNumber(`Rotor${i + 1}IdleRate`) || void 0,
        });
      }
      if (list.length) this.rotors = list;
    }
  }

  /** 连续读取 MuzzleFlash0/1/… 枪口坐标列表。 */
  readMuzzleFlash(): void {
    let index = 0;
    let key = "MuzzleFlash" + index;
    const points: any[] = [];
    while (this.art.has(key)) {
      const [x, y] = this.art.getNumberArray(key);
      points.push({ x: x, y: y });
      index++;
      key = "MuzzleFlash" + index;
    }
    this.muzzleFlash = points.length ? points : void 0;
  }

  /** 建筑 DockingOffset0..N-1 → Vector3（INI xy z → 世界 x,z,y 重排）。 */
  readDockingOffsets(): void {
    if (this.type === ObjectType.Building) {
      const count = this.rules.numberOfDocks;
      for (let i = 0; i < count; i++) {
        const [ox, oy, oz] = this.art.getNumberArray(
          "DockingOffset" + i,
          /,\s*/,
          [0, 0, 0],
        );
        this.dockingOffsets.push(new Vector3(ox, oz, oy));
      }
    }
  }

  /** 连续读取 AddOccupy1/2/… → Vector2 列表（键缺失停止）。 */
  readAddRemoveOccupy(prefix: any): any[] {
    let n = 0;
    const list: any[] = [];
    for (;;) {
      const arr = this.art.getNumberArray(prefix + ++n);
      if (!arr.length) break;
      list.push(new Vector2(arr[0], arr[1]));
    }
    return list;
  }

  /** Bib 形状字符串。 */
  get bibShape(): any {
    return this.art.getString("BibShape");
  }

  /** 占用格子尺寸（默认 "1x1"）。 */
  get foundation(): any {
    const raw = this.art.getString("Foundation", "1x1");
    const [w, h] = raw.split(/x/i);
    return { width: parseInt(w, 10), height: parseInt(h, 10) };
  }

  /** 基础中心格偏移（floor(w/2-0.5), floor(h/2-0.5)）。 */
  get foundationCenter(): any {
    return new Vector2(
      Math.floor(this.foundation.width / 2 - 0.5),
      Math.floor(this.foundation.height / 2 - 0.5),
    );
  }

  /** 绘制 Y 偏移（树木矿/岩石特例叠加半格）。 */
  getDrawOffset(): any {
    if (this.rules instanceof TerrainRules && this.rules.spawnsTiberium) {
      return new Vector2(0, 0);
    }
    const offset = ObjectArt.getDefaultDrawOffset(this.type);
    if (this.rules instanceof OverlayRules && this.rules.isARock) {
      offset.y += (Coords.ISO_TILE_SIZE + 1) / 2;
    }
    return offset;
  }

  /** 是否画阴影（art 可覆盖默认，且 rules.noShadow 否决）。 */
  get hasShadow(): any {
    return (
      this.art.getBool("Shadow", ObjectArt.getDefaultShadow(this.type)) && !this.rules.noShadow
    );
  }

  /** 炮塔偏移。 */
  get turretOffset(): any {
    return this.art.getNumber("TurretOffset");
  }

  /** 朝向数（默认 8）。 */
  get facings(): any {
    return this.art.getNumber("Facings", 8);
  }

  /** 行走帧数。 */
  get walkFrames(): any {
    return this.art.getNumber("WalkFrames");
  }

  /** 开火帧数。 */
  get firingFrames(): any {
    return this.art.getNumber("FiringFrames");
  }

  /** 站立帧数（默认 1）。 */
  get standingFrames(): any {
    return this.art.getNumber("StandingFrames", 1);
  }

  /** 行走起始帧（默认 0）。 */
  get startWalkFrame(): any {
    return this.art.getNumber("StartWalkFrame", 0);
  }

  /** 站立起始帧（默认 walkFrames*facings）。 */
  get startStandFrame(): any {
    return this.art.getNumber("StartStandFrame", this.walkFrames * this.facings);
  }

  /** 开火起始帧（默认 (walk+stand)*facings）。 */
  get startFiringFrame(): any {
    return this.art.getNumber(
      "StartFiringFrame",
      (this.walkFrames + this.standingFrames) * this.facings,
    );
  }

  /** 是否"火人"特殊步兵。 */
  get isFlamingGuy(): any {
    return this.art.getBool("IsFlamingGuy");
  }

  /** 奔跑帧数。 */
  get runningFrames(): any {
    return this.art.getNumber("RunningFrames");
  }

  /** 是否匍匐（默认 true）。 */
  get crawls(): any {
    return this.art.getBool("Crawls", true);
  }

  /** 主武器 FLH。 */
  get primaryFireFlh(): any {
    return new FlhCoords(this.art.getNumberArray("PrimaryFireFLH"));
  }

  /** 精英主武器 FLH（缺省回落主武器）。 */
  get elitePrimaryFireFlh(): any {
    const arr = this.art.getNumberArray("ElitePrimaryFireFLH");
    return arr.length ? new FlhCoords(arr) : this.primaryFireFlh;
  }

  /** 主武器像素偏移。 */
  get primaryFirePixelOffset(): any {
    return this.art.getNumberArray("PrimaryFirePixelOffset");
  }

  /** 副武器像素偏移。 */
  get secondaryFirePixelOffset(): any {
    return this.art.getNumberArray("SecondaryFirePixelOffset");
  }

  /** 副武器 FLH。 */
  get secondaryFireFlh(): any {
    return new FlhCoords(this.art.getNumberArray("SecondaryFireFLH"));
  }

  /** 精英副武器 FLH（缺省回落副武器）。 */
  get eliteSecondaryFireFlh(): any {
    const arr = this.art.getNumberArray("EliteSecondaryFireFLH");
    return arr.length ? new FlhCoords(arr) : this.secondaryFireFlh;
  }

  /** 第 index 把额外武器（WeaponN，0-based）的 FLH。 */
  getSpecialWeaponFlh(index: any): any {
    return new FlhCoords(this.art.getNumberArray(`Weapon${index + 1}FLH`));
  }

  /**
   * AlternateFLH{index} — OpenTopped 运输载具乘客炮口（如战斗堡垒）。
   * 乘客槽 0-based 对应 AlternateFLH0/1/…；未定义时返回 (0,0,0)（车心开火）。
   */
  getAlternateFlh(index: any): any {
    return new FlhCoords(this.art.getNumberArray(`AlternateFLH${index}`));
  }

  /**
   * 已定义的 AlternateFLH 炮口数（从 0 连续计数）。
   * 乘客多于炮口时 Weapon.fire 循环使用（如 15 乘客仅 AlternateFLH0-4）。
   */
  getAlternateFlhCount(): number {
    let n = 0;
    while (0 < this.art.getNumberArray(`AlternateFLH${n}`).length) n++;
    return n;
  }

  /** 起飞/延迟开火帧（FireUp 或 DelayedFireDelay）。 */
  get fireUp(): any {
    return this.art.getNumber("FireUp") || this.art.getNumber("DelayedFireDelay");
  }

  /** 是否动画延迟开火。 */
  get isAnimDelayedFire(): any {
    return this.art.getBool("IsAnimDelayedFire");
  }

  /** Z 轴形状点移动偏移。 */
  get zShapePointMove(): any {
    return this.art.getNumberArray("ZShapePointMove");
  }

  /** Z 轴微调。 */
  get zAdjust(): any {
    return this.art.getNumber("ZAdjust");
  }

  /** 尾迹动画名。 */
  get trailer(): any {
    return this.art.getString("Trailer");
  }

  /** 生成延迟（默认 1）。 */
  get spawnDelay(): any {
    return this.art.getNumber("SpawnDelay", 1);
  }

  /** 是否半透明。 */
  get translucent(): any {
    return this.art.getBool("Translucent");
  }

  /** 半透明度系数：((Translucency/25)*25)/100。 */
  get translucency(): any {
    let value = this.art.getNumber("Translucency", 0);
    value = (value / 25) * 25;
    value /= 100;
    return value;
  }
}
