/**
 * RulesApi — 规则只读门面（透传 Rules 各分区与查询方法）。
 *
 * 构造时注入 rules，所有 getter（allObjectRules / buildingRules /
 * general / ai / combatDamage …）与 hasObject / getObject / getBuilding /
 * getWeapon / getWarhead 等查询均直接委托底层 rules。
 *
 * 由 game/api/RulesApi.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class RulesApi {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  /** 底层 Rules（孪生为 WeakMap 私有）。 */
  private rules: any;

  constructor(rules: any) {
    this.rules = rules;
  }

  get allObjectRules(): any {
    return this.rules.allObjectRules;
  }

  get buildingRules(): any {
    return this.rules.buildingRules;
  }

  get infantryRules(): any {
    return this.rules.infantryRules;
  }

  get vehicleRules(): any {
    return this.rules.vehicleRules;
  }

  get aircraftRules(): any {
    return this.rules.aircraftRules;
  }

  get terrainRules(): any {
    return this.rules.terrainRules;
  }

  get overlayRules(): any {
    return this.rules.overlayRules;
  }

  get countryRules(): any {
    return this.rules.countryRules;
  }

  get general(): any {
    return this.rules.general;
  }

  get ai(): any {
    return this.rules.ai;
  }

  get crateRules(): any {
    return this.rules.crateRules;
  }

  get combatDamage(): any {
    return this.rules.combatDamage;
  }

  get radiation(): any {
    return this.rules.radiation;
  }

  hasObject(name: any, type: any): any {
    return this.rules.hasObject(name, type);
  }

  getObject(name: any, type: any): any {
    return this.rules.getObject(name, type);
  }

  getBuilding(name: any): any {
    return this.rules.getBuilding(name);
  }

  getWeapon(name: any): any {
    return this.rules.getWeapon(name);
  }

  getWarhead(name: any): any {
    return this.rules.getWarhead(name);
  }

  getProjectile(name: any): any {
    return this.rules.getProjectile(name);
  }

  getOverlayName(id: any): any {
    return this.rules.getOverlayName(id);
  }

  getOverlayId(name: any): any {
    return this.rules.getOverlayId(name);
  }

  getOverlay(id: any): any {
    return this.rules.getOverlay(id);
  }

  getCountry(name: any): any {
    return this.rules.getCountry(name);
  }

  getMultiplayerCountries(): any {
    return this.rules.getMultiplayerCountries();
  }

  getIni(): any {
    return this.rules.getIni();
  }
}
