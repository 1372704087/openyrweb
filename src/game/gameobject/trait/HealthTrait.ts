/**
 * HealthTrait — 生命值管理（setHitPoints/inflictDamage/healBy，_computedHealth 百分比，level 色阶）。
 *
 * 由 game/gameobject/trait/HealthTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as math from "util/math"; // 已转换
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 未转换（any-shim）
import * as LegacyNotifyHealthChangeModule from "game/trait/interface/NotifyHealthChange"; // 未转换（any-shim）
import * as InflictDamageEventModule from "game/event/InflictDamageEvent"; // 未转换（any-shim）
import * as NotifyHealthChangeModule from "game/gameobject/trait/interface/NotifyHealthChange"; // 未转换（any-shim）
import * as NotifyHealModule from "game/gameobject/trait/interface/NotifyHeal"; // 未转换（any-shim）
import * as HealthLevelModule from "game/gameobject/unit/HealthLevel"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as HealthChangeEventModule from "game/event/HealthChangeEvent"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class HealthTrait {
  projectedHitPoints: any;
  maxHitPoints: any;
  gameObject: any;
  conditionYellow: any;
  conditionRed: any;
  hitPoints: any;
  _computedHealth: any;

  get health() {
    return this._computedHealth;
  }
  set health(percent: number) {
    this.setHitPoints(0 < percent ? Math.max(1, Math.floor((percent * this.maxHitPoints) / 100)) : 0);
    this.projectedHitPoints = this.hitPoints;
  }
  get level() {
    return this.health > 100 * this.conditionYellow
      ? HealthLevelModule.HealthLevel.Green
      : this.health > 100 * this.conditionRed
        ? HealthLevelModule.HealthLevel.Yellow
        : HealthLevelModule.HealthLevel.Red;
  }
  constructor(maxHitPoints: any, gameObject: any, conditionYellow: any, conditionRed: any) {
    this.maxHitPoints = maxHitPoints;
    this.gameObject = gameObject;
    this.conditionYellow = conditionYellow;
    this.conditionRed = conditionRed;
    this.setHitPoints(maxHitPoints);
    this.projectedHitPoints = this.hitPoints;
  }
  setHitPoints(hp: number) {
    if (hp !== Math.floor(hp)) throw new Error(`Value ${hp} is not an integer`);
    this.hitPoints = math.clamp(hp, 0, this.maxHitPoints);
    this._computedHealth = (this.hitPoints / this.maxHitPoints) * 100;
  }
  getHitPoints() {
    return this.hitPoints;
  }
  getProjectedHitPoints() {
    return this.projectedHitPoints;
  }
  inflictDamage(damage: number, attacker: any, world: any) {
    const previousHitPoints = this.hitPoints;
    const previousHealth = this.health;
    this.applyHitPoints(previousHitPoints - damage, world);
    if (previousHitPoints !== this.hitPoints && 0 < damage && this.gameObject) {
      this.gameObject.traits.filter(NotifyDamageModule.NotifyDamage).forEach((trait: any) => {
        trait[NotifyDamageModule.NotifyDamage.onDamage](this.gameObject, world, damage, attacker);
      });
      world.events.dispatch(
        new InflictDamageEventModule.InflictDamageEvent(this.gameObject, attacker, damage, this.health, previousHealth),
      );
    }
  }
  healBy(amount: number, healer: any, world: any) {
    if (amount < 0) throw new Error("Can't heal by negative value " + amount);
    if (this.hitPoints < this.maxHitPoints) {
      const previousHitPoints = this.hitPoints;
      this.applyHitPoints(this.hitPoints + amount, world);
      this.projectedHitPoints = this.hitPoints;
      const healed = this.hitPoints - previousHitPoints;
      this.gameObject &&
        this.gameObject.traits.filter(NotifyHealModule.NotifyHeal).forEach((trait: any) => {
          trait[NotifyHealModule.NotifyHeal.onHeal]?.(this.gameObject, world, healed, healer);
        });
    }
  }
  healToFull(healer: any, world: any) {
    if (this.hitPoints < this.maxHitPoints) {
      const previousHitPoints = this.hitPoints;
      this.applyHitPoints(this.maxHitPoints, world);
      this.projectedHitPoints = this.hitPoints;
      const healed = this.hitPoints - previousHitPoints;
      this.gameObject &&
        this.gameObject.traits.filter(NotifyHealModule.NotifyHeal).forEach((trait: any) => {
          trait[NotifyHealModule.NotifyHeal.onHeal]?.(this.gameObject, world, healed, healer);
        });
    }
  }
  applyHitPoints(hp: number, world: any) {
    const previousHealth = this.health;
    this.setHitPoints(hp);
    if (previousHealth !== this.health && this.gameObject) {
      world.traits.filter(LegacyNotifyHealthChangeModule.NotifyHealthChange).forEach((trait: any) => {
        trait[LegacyNotifyHealthChangeModule.NotifyHealthChange.onChange](this.gameObject, world, previousHealth);
      });
      this.gameObject.traits.filter(NotifyHealthChangeModule.NotifyHealthChange).forEach((trait: any) => {
        trait[NotifyHealthChangeModule.NotifyHealthChange.onChange](this.gameObject, world, previousHealth);
      });
      world.events.dispatch(
        new HealthChangeEventModule.HealthChangeEvent(this.gameObject, this.health, previousHealth),
      );
    }
  }
  projectDamage(damage: number) {
    if (damage < 0) throw new Error("Projected damage must be positive");
    this.projectedHitPoints = Math.max(-30, this.projectedHitPoints - damage);
  }
  [NotifyTickModule.NotifyTick.onTick](_obj: any, world: any) {
    if (world.currentTick % 4 == 0) {
      this.projectedHitPoints = Math.min(this.projectedHitPoints + 1, this.hitPoints);
    }
  }
  getHash() {
    return this.hitPoints;
  }
  debugGetState() {
    return { hitPoints: this.hitPoints };
  }
  dispose() {
    this.gameObject = void 0;
  }
}
