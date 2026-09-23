/**
 * PowerTrait — 玩家电力管理（发电量、消耗、低电力状态与黑屏）。
 *
 * 职责：
 *  - 追踪玩家全部建筑的发电/耗电（powerByObject 按对象记录实际贡献，
 *    updateFrom 以 add/update/remove 三种操作维护）；
 *  - 建筑受损时发电量按血量百分比折算（Math.ceil(额外值×血量/100)）；
 *  - 低电力判定：显示电力 < 总消耗或处于黑屏 → PowerLevel.Low，状态切换
 *    时派发 PowerLowEvent / PowerRestoreEvent 并广播 NotifyPower trait；
 *  - 黑屏（blackoutFrames）：超武/特殊效果强制低电力若干帧；
 *  - 被漂浮圆盘吸取（drainedBy）的电厂贡献归零，使 Low Power 生效。
 *
 * 每次电力变化都派发 PowerChangeEvent（含显示电力与总消耗），sidebar
 * HUD 据此刷新电力条。
 *
 * 由 game/player/trait/PowerTrait.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { PowerLowEvent } from "game/event/PowerLowEvent";
import { PowerRestoreEvent } from "game/event/PowerRestoreEvent";
import { PowerChangeEvent } from "game/event/PowerChangeEvent";
import { NotifyPower } from "game/trait/interface/NotifyPower";
import { fnv32a } from "util/math";

/** 电力状态：低电力 / 正常。 */
export enum PowerLevel {
  Low = 0,
  Normal = 1,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PowerTrait {
  /** 所属玩家。 */
  player: any;
  /** 当前可用电力（受损伤折算）。 */
  power: number;
  /** 当前总电力消耗。 */
  drain: number;
  /** 电力状态（Low/Normal）。 */
  level: PowerLevel;
  /** 剩余黑屏帧数（>0 期间强制 Low）。 */
  blackoutFrames: number;
  /** 黑屏期间的显示覆盖（>0 时显示电力强制为 0）。 */
  drainPowerOverride: number;
  /** 每个建筑的实际发电贡献（含血量折算）。 */
  powerByObject: Map<any, any>;

  constructor(player: any) {
    this.player = player;
    this.power = 0;
    this.drain = 0;
    this.level = PowerLevel.Normal;
    this.blackoutFrames = 0;
    this.drainPowerOverride = 0;
    this.powerByObject = new Map();
  }

  isLowPower(): boolean {
    return this.level === PowerLevel.Low;
  }

  /**
   * 强制黑屏若干帧（铁幕类效果/事件触发）。
   * 已在黑屏中则只刷新时长；黑屏期间显示电力强制为 0 以驱动 sidebar。
   */
  setBlackoutFor(frames: number, world: any): void {
    const wasBlackout = this.blackoutFrames > 0;
    this.blackoutFrames = frames;
    if (!wasBlackout) this.updateLevel(world);
    this.drainPowerOverride = frames > 0 ? 1 : 0;
    world.traits.filter(NotifyPower).forEach((trait: any) => {
      trait[NotifyPower.onPowerChange](this.player, world);
    });
    world.events.dispatch(new PowerChangeEvent(this.player, this.getDisplayPower(), this.drain));
  }

  /** 每逻辑 tick：黑屏倒计时，归零时恢复电力等级并清除显示覆盖。 */
  updateBlackout(world: any): void {
    if (this.blackoutFrames > 0) {
      this.blackoutFrames--;
      if (this.blackoutFrames <= 0) this.updateLevel(world);
    }
    if (this.blackoutFrames <= 0) this.drainPowerOverride = 0;
    // 总是派发 PowerChangeEvent，保证 sidebar HUD 及时更新。
    world.traits.filter(NotifyPower).forEach((trait: any) => {
      trait[NotifyPower.onPowerChange](this.player, world);
    });
    world.events.dispatch(new PowerChangeEvent(this.player, this.getDisplayPower(), this.drain));
  }

  getBlackoutDuration(): number {
    return this.blackoutFrames;
  }

  /**
   * 建筑上/下线或受损时更新电力账目。
   * @param object 建筑（rules.power 为发电/耗电值，负值为耗电）
   * @param action "add" | "update" | "remove"
   * @param world 游戏世界
   */
  updateFrom(object: any, action: string, world: any): void {
    const power = object.rules.power;
    if (power) {
      // 耗电建筑（power<0）：add 时累加消耗，remove 时按原值抵扣。
      if (power < 0) {
        if (action === "add" || action === "remove") this.drain += action === "add" ? -power : power;
      } else {
        let delta = 0;
        // 被圆盘吸取（drainedBy）的电厂贡献归零，触发低电力。
        const effectivePower = object.drainedBy ? 0 : power;
        if (action === "add") {
          const contributed = Math.ceil((effectivePower * object.healthTrait.health) / 100);
          this.powerByObject.set(object, contributed);
          delta = contributed;
        } else if (action === "update" || action === "remove") {
          const previous = this.powerByObject.get(object);
          if (previous === undefined) throw new Error("Cannot update power before add.");
          let effective = effectivePower;
          delta =
            action === "update"
              ? ((effective = Math.ceil((effective * object.healthTrait.health) / 100)),
                this.powerByObject.set(object, effective),
                effective - previous)
              : (this.powerByObject.delete(object), -previous);
        }
        this.power += delta;
      }
      this.updateLevel(world);
      world.traits.filter(NotifyPower).forEach((trait: any) => {
        trait[NotifyPower.onPowerChange](this.player, world);
      });
      world.events.dispatch(new PowerChangeEvent(this.player, this.getDisplayPower(), this.drain));
    }
  }

  /** sidebar 显示的电力：黑屏期间强制 0。 */
  getDisplayPower(): number {
    return this.drainPowerOverride > 0 ? 0 : this.power;
  }

  /** 重算电力等级；Low↔Normal 切换时广播 NotifyPower 与对应事件。 */
  updateLevel(world: any): void {
    const previous = this.level;
    const displayPower = this.getDisplayPower();
    this.level = displayPower >= this.drain && !this.blackoutFrames ? PowerLevel.Normal : PowerLevel.Low;
    if (this.level !== previous) {
      if (previous === PowerLevel.Normal && this.level === PowerLevel.Low) {
        world.traits.filter(NotifyPower).forEach((trait: any) => {
          trait[NotifyPower.onPowerLow](this.player, world);
        });
        world.events.dispatch(new PowerLowEvent(this.player));
      }
      if (previous === PowerLevel.Low && this.level === PowerLevel.Normal) {
        world.traits.filter(NotifyPower).forEach((trait: any) => {
          trait[NotifyPower.onPowerRestore](this.player, world);
        });
        world.events.dispatch(new PowerRestoreEvent(this.player));
      }
    }
  }

  /** 锁步校验散列：电力与消耗的 FNV。 */
  getHash(): number {
    return fnv32a([this.power, this.drain]);
  }

  debugGetState() {
    return { power: this.getDisplayPower(), drain: this.drain };
  }

  dispose(): void {
    this.player = undefined;
    this.powerByObject.clear();
  }
}
