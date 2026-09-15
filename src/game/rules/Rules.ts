/**
 * Rules — rulesmd.ini 的聚合根：解析全部规则段并对外提供查询。
 *
 * init() 的顺序即依赖顺序：
 *  1. 全局段（AudioVisual → CombatDamage → Radiation → General → AI →
 *     CrateRules → ElevationModel → MultiplayerDialogSettings）；
 *  2. 十余张"类型 id → 对象名"表（BuildingTypes/InfantryTypes/…，
 *     readObjectTypes 顺序编号并跳过重复/非数字 id）；
 *  3. allObjectRules 把 8 张规则 Map 挂到 ObjectType 维度；
 *  4. readObjects 逐名实例化规则（缺失段落仅 debug 跳过，不报错）；
 *  5. 国家/弹头/箱子掉落/矿石/超武各表 + buildWeaponsList 汇总全武器名。
 *
 * 缓存语义：getWeapon/getWarhead/getProjectile 首次解析后进 Map 缓存
 * （弹头/弹体按小写名缓存，支持大小写不敏感的段落查找回退）。
 *
 * readCombatDamage 里把力盾参数从 [General] 搬运到 [CombatDamage]（原版
 * 键位与代码读取位置不一致的兼容补丁），并把碉堡/敞开运输车/驻楼三组
 * 武器加成参数传播到 Weapon 类静态字段。
 *
 * 由 game/rules/Rules.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Color } from "util/Color";
import { ObjectType } from "engine/type/ObjectType";
import { CountryRules } from "game/rules/CountryRules";
import { WeaponRules } from "game/rules/WeaponRules";
import { AudioVisualRules } from "game/rules/AudioVisualRules";
import { GeneralRules } from "game/rules/GeneralRules";
import { MpDialogSettings } from "game/rules/MpDialogSettings";
import * as LandTypeModule from "game/type/LandType"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { LandRules } from "game/rules/LandRules";
import { WarheadRules } from "game/rules/WarheadRules";
import { ProjectileRules } from "game/rules/ProjectileRules";
import { ObjectRulesFactory } from "game/rules/ObjectRulesFactory";
import { CombatDamageRules } from "game/rules/CombatDamageRules";
import { TiberiumRules } from "game/rules/TiberiumRules";
import { AiRules } from "game/rules/AiRules";
import { ElevationModelRules } from "game/rules/ElevationModelRules";
import { RadiationRules } from "game/rules/RadiationRules";
import { SuperWeaponRules } from "game/rules/SuperWeaponRules";
import { CrateRules } from "game/rules/CrateRules";
import { PowerupsRules } from "game/rules/PowerupsRules";
import { mpAllowedColors } from "game/rules/mpAllowedColors";
import { isNotNullOrUndefined } from "util/typeGuard";
import { Weapon } from "game/Weapon";
import * as IniSectionModule from "data/IniSection"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Rules {
  ini: any;
  logger: any;

  // ---- 类型 id → 对象名 ----
  buildingTypes = new Map();
  vehicleTypes = new Map();
  infantryTypes = new Map();
  aircraftTypes = new Map();
  terrainTypes = new Map();
  overlayTypes = new Map();
  overlayIdsByType = new Map();
  animationTypes = new Map();
  animationNames = new Set();
  voxelAnimTypes = new Map();
  smudgeTypes = new Map();
  warheadTypes = new Map();
  tiberiumTypes = new Map();
  superWeaponTypes = new Map();
  countryTypes = new Map();
  weaponTypes = new Map();
  /** [Particles] 段（原版 YR 粒子类型，如 VirusCloud1）：毒雾云的调参（伤害/图/弹头等）直接读这些段而非硬编码。 */
  particleTypes = new Map();

  // ---- 规则实例表 ----
  allObjectRules = new Map();
  buildingRules = new Map();
  infantryRules = new Map();
  vehicleRules = new Map();
  aircraftRules = new Map();
  terrainRules = new Map();
  overlayRules = new Map();
  smudgeRules = new Map();
  voxelAnimRules = new Map();
  countryRules = new Map();
  warheadRules = new Map();

  // ---- 全局子规则 ----
  powerups = new PowerupsRules();
  colors = new Map();
  general = new GeneralRules();
  ai = new AiRules();
  crateRules = new CrateRules();
  elevationModel = new ElevationModelRules();
  mpDialogSettings = new MpDialogSettings();
  audioVisual = new AudioVisualRules();
  combatDamage = new CombatDamageRules();
  radiation = new RadiationRules();
  landRules = new Map();
  tiberiumRules = new Map();
  superWeaponRules = new Map();
  cachedWeaponRules = new Map();
  cachedProjectileRules = new Map();

  constructor(ini: any, logger?: any) {
    this.ini = ini;
    this.logger = logger;
    this.init();
  }

  /** 指定类型注册表中是否存在该对象名。 */
  hasObject(name: string, type: ObjectType): boolean {
    return this.allObjectRules.get(type)?.has(name);
  }

  /** 取对象规则；缺失抛错。 */
  getObject(name: string, type: ObjectType): any {
    const rules = this.allObjectRules.get(type)?.get(name);
    if (!rules) throw new Error(`Missing rules for object "${name}"`);
    return rules;
  }

  /** 按数字 id 找 techno（建筑/步兵/载具/飞行器四表之一）；id 或规则缺失均抛错。 */
  getTechnoByInternalId(id: number, type: ObjectType): any {
    let name;
    if (type === ObjectType.Building) name = this.buildingTypes.get(id);
    else if (type === ObjectType.Infantry) name = this.infantryTypes.get(id);
    else if (type === ObjectType.Vehicle) name = this.vehicleTypes.get(id);
    else {
      if (type !== ObjectType.Aircraft) throw new Error(`Type ${ObjectType[type]} is not a techno type`);
      name = this.aircraftTypes.get(id);
    }
    if (name === undefined) throw new Error(`Object type "${ObjectType[type]}" with ID "${id}" not found`);
    return this.getObject(name, type);
  }

  /** 取建筑规则；缺失抛错。 */
  getBuilding(name: string): any {
    const rules = this.buildingRules.get(name);
    if (!rules) throw new Error(`Missing rules for building "${name}"`);
    return rules;
  }

  /** 取武器规则（按名缓存）。 */
  getWeapon(name: string): WeaponRules {
    let rules = this.cachedWeaponRules.get(name);
    if (!rules) {
      const section = this.ini.getSection(name);
      if (!section) throw new Error(`Weapon ${name} is missing ini section`);
      rules = new WeaponRules(section);
      this.cachedWeaponRules.set(name, rules);
    }
    return rules;
  }

  /** 按数字 id 取武器名再取规则。 */
  getWeaponByInternalId(id: number): WeaponRules {
    const name = this.weaponTypes.get(id);
    if (!name) throw new RangeError(`Weapon with internal ID "${id}" not found`);
    return this.getWeapon(name);
  }

  /**
   * 取弹头规则（按小写名缓存）。段落精确名找不到时，回退到
   * getOrderedSections 的大小写不敏感查找——rulesmd.ini 里弹头段名
   * 大小写不保证一致。
   */
  getWarhead(name: string): WarheadRules {
    const lower = name.toLowerCase();
    let rules = this.warheadRules.get(lower);
    if (!rules) {
      let section = this.ini.getSection(name);
      if (!section && ((section = this.ini.getOrderedSections().find((s: any) => s.name.toLowerCase() === lower)), !section))
        throw new Error("Unknown warhead " + name);
      rules = new WarheadRules(section);
      this.warheadRules.set(lower, rules);
    }
    return rules;
  }

  /** 取弹体规则（按小写名缓存，同样带大小写回退）。 */
  getProjectile(name: string): ProjectileRules {
    const lower = name.toLowerCase();
    let rules = this.cachedProjectileRules.get(lower);
    if (!rules) {
      let section = this.ini.getSection(name);
      if (!section && ((section = this.ini.getOrderedSections().find((s: any) => s.name.toLowerCase() === lower)), !section))
        throw new Error(`Projectile ${name} is missing ini section`);
      rules = new ProjectileRules(ObjectType.Projectile, section);
      this.cachedProjectileRules.set(lower, rules);
    }
    return rules;
  }

  /** overlay 数字 id → 名称；非法 id 抛错。 */
  getOverlayName(id: number): string {
    const name = this.overlayTypes.get(id);
    if (!name) throw new Error("Invalid overlay id " + id);
    return name;
  }

  hasOverlayId(id: number): boolean {
    return this.overlayTypes.has(id);
  }

  /** overlay 名称 → 数字 id；未登记抛错。 */
  getOverlayId(name: string): number {
    const id = this.overlayIdsByType.get(name);
    if (id === undefined) throw new Error("Invalid overlay name " + name);
    return id;
  }

  /** 取覆盖层规则；缺失抛错。 */
  getOverlay(name: string): any {
    const rules = this.overlayRules.get(name);
    if (!rules) throw new Error(`Missing rules for overlay "${name}"`);
    return rules;
  }

  /** 动画类型名（可为 undefined——动画表允许缺项）。 */
  getAnimationName(id: number): any {
    return this.animationTypes.get(id);
  }

  /** 取国家规则；未知国家抛错。 */
  getCountry(name: string): CountryRules {
    if (!this.countryRules.has(name)) throw new Error("Unknown country " + name);
    return this.countryRules.get(name);
  }

  /** 全部可玩（multiplay）国家。 */
  getMultiplayerCountries(): CountryRules[] {
    return [...this.countryRules.values()].filter((country) => country.multiplay);
  }

  /**
   * 多人对局可选颜色：从 [Colors] 表按 mpAllowedColors 白名单抽取；
   * 白名单里的颜色在 [Colors] 缺失时抛错。
   */
  getMultiplayerColors(): Map<string, any> {
    const result = new Map();
    mpAllowedColors.forEach((color) => {
      if (!this.colors.has(color))
        throw new Error(`Multiplayer color "${color}" does not exist in the rules [Colors] section.`);
      result.set(color, this.colors.get(color));
    });
    return result;
  }

  /**
   * 地表规则（按 LandType 缓存）：Cliff（悬崖）的规则段落在 "Rock"
   * 名下，其余地表直接用 LandType 名作为段名。
   */
  getLandRules(landType: any): LandRules {
    let rules = this.landRules.get(landType);
    if (!rules) {
      const sectionName = landType === LandTypeModule.LandType.Cliff ? "Rock" : LandTypeModule.LandType[landType];
      rules = new LandRules().readIni(this.ini.getOrCreateSection(sectionName));
      this.landRules.set(landType, rules);
    }
    return rules;
  }

  /** 矿石类型名 → 规则；未知类型抛错（返回 undefined 但类型上不会发生）。 */
  getTiberium(name: string): TiberiumRules {
    const rulesName = this.tiberiumTypes.get(name);
    if (!rulesName) throw new Error("Unknown tiberium type " + name);
    return this.tiberiumRules.get(rulesName);
  }

  /** 取超武规则；未知类型抛错。 */
  getSuperWeapon(name: string): SuperWeaponRules {
    if (!this.superWeaponRules.has(name)) throw new Error(`Unknown superweapon type "${name}"`);
    return this.superWeaponRules.get(name);
  }

  getIni(): any {
    return this.ini;
  }

  /** 开局特例开关：map 载入参数允许初始老兵时，强制打开全局 initialVeteran。 */
  applySpecialFlags(flags: any): void {
    if (flags.initialVeteran) this.general.veteran.initialVeteran = true;
  }

  /** 解析全部规则段（顺序见类注释）。 */
  init(): void {
    this.readAudioVisual();
    this.readCombatDamage();
    this.readRadiation();
    this.readGeneral();
    this.readAi();
    this.readCrateRules();
    this.readElevationModel();
    this.readMpDialogSettings();
    this.readObjectTypes("BuildingTypes", this.buildingTypes);
    this.readObjectTypes("InfantryTypes", this.infantryTypes);
    this.readObjectTypes("VehicleTypes", this.vehicleTypes);
    this.readObjectTypes("AircraftTypes", this.aircraftTypes);
    this.readObjectTypes("TerrainTypes", this.terrainTypes);
    this.readObjectTypes("SmudgeTypes", this.smudgeTypes);
    this.readObjectTypes("Animations", this.animationTypes);
    this.animationNames = new Set(this.animationTypes.values());
    this.readObjectTypes("VoxelAnims", this.voxelAnimTypes);
    this.readObjectTypes("OverlayTypes", this.overlayTypes);
    this.overlayTypes.forEach((name: any, id: any) => this.overlayIdsByType.set(name, id));
    this.readColors();
    this.readObjectTypes("Countries", this.countryTypes);
    this.readObjectTypes("Warheads", this.warheadTypes);
    this.readObjectTypes("Tiberiums", this.tiberiumTypes);
    this.readObjectTypes("SuperWeaponTypes", this.superWeaponTypes);
    this.readParticleTypes();
    this.allObjectRules
      .set(ObjectType.Building, this.buildingRules)
      .set(ObjectType.Infantry, this.infantryRules)
      .set(ObjectType.Vehicle, this.vehicleRules)
      .set(ObjectType.Aircraft, this.aircraftRules)
      .set(ObjectType.Terrain, this.terrainRules)
      .set(ObjectType.Overlay, this.overlayRules)
      .set(ObjectType.Smudge, this.smudgeRules)
      .set(ObjectType.VoxelAnim, this.voxelAnimRules);
    this.readObjects(ObjectType.Building, this.buildingTypes, this.buildingRules);
    this.readObjects(ObjectType.Infantry, this.infantryTypes, this.infantryRules);
    this.readObjects(ObjectType.Vehicle, this.vehicleTypes, this.vehicleRules);
    this.readObjects(ObjectType.Aircraft, this.aircraftTypes, this.aircraftRules);
    this.readObjects(ObjectType.Terrain, this.terrainTypes, this.terrainRules);
    this.readObjects(ObjectType.Overlay, this.overlayTypes, this.overlayRules);
    this.readObjects(ObjectType.Smudge, this.smudgeTypes, this.smudgeRules);
    this.readObjects(ObjectType.VoxelAnim, this.voxelAnimTypes, this.voxelAnimRules);
    this.readCountries();
    this.readWarheads();
    this.readPowerups();
    this.readTiberiums();
    this.readSuperWeapons();
    this.buildWeaponsList();
  }

  readAudioVisual(): void {
    const section = this.ini.getSection("AudioVisual");
    if (!section) throw new Error("Missing [AudioVisual] section");
    this.audioVisual.readIni(section);
  }

  readCombatDamage(): void {
    const section = this.ini.getSection("CombatDamage");
    if (!section) throw new Error("Missing [CombatDamage] section");
    // 力盾参数在原版 YR 的 rulesmd.ini 里位于 [General]
    //（ForceShieldRadius/Duration/BlackoutDuration），但代码从
    // [CombatDamage] 读取——这里把键搬过去，避免丢失。
    const generalSection = this.ini.getSection("General");
    if (generalSection) {
      const fsKeys = ["ForceShieldDuration", "ForceShieldRadius", "ForceShieldBlackoutDuration", "ForceShieldPlayFadeSoundTime"];
      for (const key of fsKeys) {
        const value = generalSection.getString(key);
        if (value) section.set(key, value);
      }
    }
    this.combatDamage.readIni(section);
    // 把三组武器加成参数传播到 Weapon 类静态字段（见 Weapon 头注释）。
    Weapon.bunkerDamageMultiplier = this.combatDamage.bunkerDamageMultiplier;
    Weapon.bunkerROFMultiplier = this.combatDamage.bunkerROFMultiplier;
    Weapon.bunkerWeaponRangeBonus = this.combatDamage.bunkerWeaponRangeBonus;
    Weapon.openToppedRangeBonus = this.combatDamage.openToppedRangeBonus;
    Weapon.openToppedDamageMultiplier = this.combatDamage.openToppedDamageMultiplier;
    Weapon.occupyWeaponRange = this.combatDamage.occupyWeaponRange;
    Weapon.occupyDamageMultiplier = this.combatDamage.occupyDamageMultiplier;
    Weapon.occupyROFMultiplier = this.combatDamage.occupyROFMultiplier;
  }

  readRadiation(): void {
    const section = this.ini.getSection("Radiation");
    if (!section) throw new Error("Missing [Radiation] section");
    this.radiation.readIni(section);
  }

  readGeneral(): void {
    const section = this.ini.getSection("General");
    if (!section) throw new Error("Missing [General] section");
    this.general.readIni(section);
  }

  readAi(): void {
    const section = this.ini.getSection("AI");
    if (!section) throw new Error("Missing [AI] section");
    this.ai.readIni(section);
  }

  readCrateRules(): void {
    const section = this.ini.getSection("CrateRules");
    if (!section) throw new Error("Missing [CrateRules] section");
    this.crateRules.readIni(section);
  }

  readElevationModel(): void {
    const section = this.ini.getSection("ElevationModel");
    if (!section) throw new Error("Missing [ElevationModel] section");
    this.elevationModel.readIni(section);
  }

  readMpDialogSettings(): void {
    const section = this.ini.getSection("MultiplayerDialogSettings");
    if (!section) throw new Error("Missing [MultiplayerDialogSettings] section");
    this.mpDialogSettings.readIni(section);
  }

  /**
   * 读取 "id=对象名" 类型表：值必须是字符串、id 必须是数字（否则仅
   * debug 跳过）；对象名重复时后到者跳过。id 从 0 起顺序分配。
   */
  readObjectTypes(sectionName: string, target: Map<number, string>): void {
    const section = this.ini.getSection(sectionName);
    if (!section) throw new Error(`Missing [${sectionName}] section`);
    let nextId = 0;
    const seen = new Set();
    section.entries.forEach((value: any, key: any) => {
      if (typeof value === "string") {
        if (Number.isNaN(Number(key))) this.logger?.debug(`Non-numeric id "${key}" found in rules section [${sectionName}]. Skipping.`);
        else if (seen.has(value)) this.logger?.debug(`Duplicate type "${value}" in rules section [${sectionName}]. Skipping.`);
        else {
          target.set(nextId++, value);
          seen.add(value);
        }
      } else {
        this.logger?.debug(`Non-string type found in rules section [${sectionName}]. Skipping.`);
      }
    });
  }

  // [Particles] 列表（id=段名）：记录每个粒子的规则段，供毒雾云调参。
  readParticleTypes(): void {
    const section = this.ini.getSection("Particles");
    if (section)
      section.entries.forEach((value: any, key: any) => {
        if (typeof value === "string" && !this.particleTypes.has(value)) {
          this.particleTypes.set(value, this.ini.getSection(value) ?? new IniSectionModule.IniSection(value));
        }
      });
  }

  /** 按大小写不敏感方式取粒子规则段；未知粒子抛错。 */
  getParticle(name: string): any {
    const lower = name.toLowerCase();
    const found = [...this.particleTypes.entries()].find(([particleName]) => particleName.toLowerCase() === lower);
    if (!found) throw new Error("Unknown particle " + name);
    return found[1];
  }

  readColors(): void {
    const section = this.ini.getSection("Colors");
    if (!section) throw new Error("Missing [Colors] section");
    section.entries.forEach((value: any, key: any) => {
      const [h, s, v] = value.split(",");
      const color = Color.fromHsv(parseInt(h, 10), parseInt(s, 10), parseInt(v, 10));
      this.colors.set(key, color);
    });
  }

  /** 逐名实例化对象规则；缺段仅 debug（地图可能引用可选对象）。 */
  readObjects(type: ObjectType, typeNames: Map<number, string>, target: Map<string, any>): void {
    typeNames.forEach((name) => {
      let section = this.ini.getSection(name);
      if (section) {
        section = new ObjectRulesFactory().create(type, section, this.general, name);
        target.set(name, section);
      } else {
        this.logger?.debug(ObjectType[type] + ` type "${name}" has no rules section`);
      }
    });
  }

  readCountries(): void {
    this.countryTypes.forEach((name, id) => {
      const section = this.ini.getSection(name);
      if (!section) throw new Error("Missing ini section for country " + name);
      const country = new CountryRules(id);
      country.readIni(section);
      this.countryRules.set(name, country);
    });
  }

  readWarheads(): void {
    this.warheadTypes.forEach((name) => {
      let section = this.ini.getSection(name);
      if (section) {
        section = new WarheadRules(section);
        this.warheadRules.set(name.toLowerCase(), section);
      } else {
        this.logger?.debug(`Warhead "${name}" has no rules section`);
      }
    });
  }

  readPowerups(): void {
    const section = this.ini.getSection("Powerups");
    if (!section) throw new Error("Missing [Powerups] section");
    this.powerups.readIni(section);
  }

  readTiberiums(): void {
    this.tiberiumTypes.forEach((name, id) => {
      const section = this.ini.getSection(name);
      if (!section) throw new Error("Missing rules section for tiberium type " + name);
      this.tiberiumRules.set(name, new TiberiumRules(id).readIni(section));
    });
  }

  readSuperWeapons(): void {
    this.superWeaponTypes.forEach((name, id) => {
      const section = this.ini.getSection(name);
      if (!section) throw new Error("Missing rules section for superweapon type " + name);
      this.superWeaponRules.set(name, new SuperWeaponRules(id).readIni(section));
    });
  }

  /**
   * 汇总全武器名清单（weaponTypes: 序号 → 名）：
   * 空降武器 + 各超武挂接武器 + 核弹子弹头名 + 全部 techno 的七类武器槽
   *（含 WeaponN/EliteWeaponN 扩展槽），Set 去重后顺序编号。
   */
  buildWeaponsList(): void {
    const names = new Set();
    names.add(this.general.dropPodWeapon);
    for (const swRules of this.superWeaponRules.values()) {
      if (swRules.weaponType) names.add(swRules.weaponType);
    }
    names.add(Weapon.NUKE_PAYLOAD_NAME);
    for (const technoRules of [
      ...this.buildingRules.values(),
      ...this.aircraftRules.values(),
      ...this.vehicleRules.values(),
      ...this.infantryRules.values(),
    ]) {
      for (const name of [
        technoRules.deathWeapon,
        technoRules.primary,
        technoRules.secondary,
        technoRules.elitePrimary,
        technoRules.eliteSecondary,
        technoRules.occupyWeapon,
        technoRules.eliteOccupyWeapon,
        ...(technoRules.weaponCount
          ? new Array(technoRules.weaponCount)
              .fill(0)
              .map((_v, i) => [technoRules.getWeaponAtIndex(i), technoRules.getEliteWeaponAtIndex(i)])
              .flat()
          : []),
      ]
        .filter(isNotNullOrUndefined)
        .filter((name) => name !== "")) {
        names.add(name);
      }
    }
    let index = 0;
    for (const name of names) this.weaponTypes.set(index++, name);
  }
}
