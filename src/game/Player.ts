/**
 * Player — 玩家运行时状态（资源、所属对象、统计、特性容器）。
 *
 * 由 game/Player.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Color } from "util/Color";
import { ObjectType } from "engine/type/ObjectType";
import { Traits } from "game/Traits";
import { fnv32a } from "util/math";
import type { Country } from "game/Country";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Player {
  name: string;
  country: Country | undefined;
  startLocation: any;
  color: Color;
  isAi: boolean;
  defeated: boolean;
  resigned: boolean;
  dropped: boolean;
  objectsByType: Map<any, Set<any>>;
  objectsById: Map<any, any>;
  traits: Traits;
  _credits: number;
  score: number;
  limitedUnitsBuiltByName: Map<string, number>;
  unitsBuiltByType: Map<any, number>;
  unitsKilledByType: Map<any, number>;
  unitsLostByType: Map<any, number>;
  buildingsCaptured: number;
  cratesPickedUp: number;
  creditsGained: number;
  cheerCooldownTicks: number;
  isObserver: boolean;
  isNeutral: boolean;
  /** 由游戏侧注入的 生产队列 接口（未转换，任意结构）。 */
  production?: any;

  get credits(): number {
    return this._credits;
  }

  set credits(value: number) {
    if (value < 0) throw new RangeError("Can't set credits to a negative value");
    this._credits = value;
  }

  constructor(
    name: string,
    country: Country | undefined = undefined,
    startLocation: any = undefined,
    color: Color = new Color(255, 0, 0),
  ) {
    this.name = name;
    this.country = country;
    this.startLocation = startLocation;
    this.color = color;
    this.isAi = false;
    this.defeated = false;
    this.resigned = false;
    this.dropped = false;
    this.objectsByType = new Map();
    this.objectsById = new Map();
    this.traits = new Traits();
    this._credits = 0;
    this.score = 0;
    this.limitedUnitsBuiltByName = new Map();
    this.unitsBuiltByType = new Map();
    this.unitsKilledByType = new Map();
    this.unitsLostByType = new Map();
    this.buildingsCaptured = 0;
    this.cratesPickedUp = 0;
    this.creditsGained = 0;
    this.cheerCooldownTicks = 0;
    this.isObserver = !country;
    this.isNeutral = !!country && !country.isPlayable();
  }

  private getOrCreateObjectsForType(type: any): Set<any> {
    let set = this.objectsByType.get(type);
    if (!set) {
      set = new Set();
      this.objectsByType.set(type, set);
    }
    return set;
  }

  addOwnedObject(object: any): void {
    const set = this.getOrCreateObjectsForType(object.type);
    set.add(object);
    object.owner = this;
    this.objectsById.set(object.id, object);
  }

  removeOwnedObject(object: any): void {
    const set = this.objectsByType.get(object.type);
    if (!set || !set.has(object))
      throw new Error(`GameObject ${object.name} does not belong to player ` + this.name);
    set.delete(object);
    this.objectsById.delete(object.id);
  }

  getOwnedObjectById(id: any): any {
    return this.objectsById.get(id);
  }

  getOwnedObjectsByType(type: any, includeLimbo = false): any[] {
    let objects = [...(this.objectsByType.get(type) || new Set())];
    if (!includeLimbo) objects = objects.filter((object) => !object.limboData);
    return objects;
  }

  getOwnedObjects(includeLimbo = false): any[] {
    const objects = [];
    [...this.objectsByType.values()].forEach((set) => {
      set.forEach((object) => objects.push(object));
    });
    if (!includeLimbo) return objects.filter((object) => !object.limboData);
    return objects;
  }

  removeAllOwnedObjects(): void {
    this.objectsByType.forEach((set) => set.clear());
    this.objectsById.clear();
  }

  get buildings(): Set<any> {
    return this.getOrCreateObjectsForType(ObjectType.Building);
  }

  /** 累计生产数量；buildLimit < 0 的单位另按名字限建计数。 */
  addUnitsBuilt(unitRules: any, count: number): void {
    this.unitsBuiltByType.set(unitRules.type, (this.unitsBuiltByType.get(unitRules.type) ?? 0) + count);
    if (unitRules.buildLimit < 0)
      this.limitedUnitsBuiltByName.set(
        unitRules.name,
        (this.limitedUnitsBuiltByName.get(unitRules.name) ?? 0) + count,
      );
  }

  getUnitsBuilt(type?: any): number {
    return type !== undefined
      ? (this.unitsBuiltByType.get(type) ?? 0)
      : [...this.unitsBuiltByType.values()].reduce((a, b) => a + b, 0);
  }

  getLimitedUnitsBuilt(name: string): number {
    return this.limitedUnitsBuiltByName.get(name) ?? 0;
  }

  addUnitsKilled(type: any, count: number): void {
    this.unitsKilledByType.set(type, (this.unitsKilledByType.get(type) ?? 0) + count);
  }

  getUnitsKilled(type?: any): number {
    return type !== undefined
      ? (this.unitsKilledByType.get(type) ?? 0)
      : [...this.unitsKilledByType.values()].reduce((a, b) => a + b, 0);
  }

  addUnitsLost(type: any, count: number): void {
    this.unitsLostByType.set(type, (this.unitsLostByType.get(type) ?? 0) + count);
  }

  getUnitsLost(type?: any): number {
    return type !== undefined
      ? (this.unitsLostByType.get(type) ?? 0)
      : [...this.unitsLostByType.values()].reduce((a, b) => a + b, 0);
  }

  isCombatant(): boolean {
    return !this.isNeutral && !this.isObserver && !this.defeated;
  }

  canProduceVeteran(unitRules: any): boolean {
    if (!this.production || !this.country) throw new Error("Non-combatants can't produce units");
    let queueType = this.production.getQueueTypeForObject(unitRules);
    queueType = this.production.getFactoryTypeForQueueType(queueType);
    return this.production.hasVeteranType(queueType) || this.country.hasVeteranUnit(unitRules.type, unitRules.name);
  }

  /** 锁步校验用散列：资金 + 各 trait 散列的 FNV。 */
  getHash(): number {
    return fnv32a([this.credits, ...this.traits.getAll().map((trait) => trait.getHash?.() ?? 0)]);
  }

  debugGetState() {
    return {
      name: this.name,
      credits: this.credits,
      traits: this.traits.getAll().reduce((acc: any, trait) => {
        const state = trait.debugGetState?.();
        if (state !== undefined) acc[trait.constructor.name] = state;
        return acc;
      }, {}),
    };
  }

  dispose(): void {
    this.traits.dispose();
    this.production?.dispose();
  }
}
