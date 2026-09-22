/**
 * SecureProgressTrait — 中立建筑占领进度 trait。
 *
 * start(player) 启动 secureTicks 计时；期间每 tick 校验目标仍中立且
 * 攻占方未败，计时结束 changeObjectOwner + BuildingCaptureEvent。
 * 换主/非法状态 reset。getProgress 返回 0..1。getHash/debugGetState
 * 供同步/调试快照。
 *
 * 由 game/gameobject/trait/SecureProgressTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { clamp, fnv32a } from "util/math"; // 已转换
import { BuildingCaptureEvent } from "game/event/BuildingCaptureEvent"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import { Timer } from "game/gameobject/unit/Timer"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SecureProgressTrait {
  /** 占领计时器。 */
  timer: Timer;
  /** 完整占领所需 tick（由秒数换算）。 */
  secureTicks: number;
  /** 当前发起占领的玩家。 */
  securingPlayer: any;

  constructor(secureSeconds = 0) {
    this.timer = new Timer();
    this.secureTicks = Math.max(0, Math.round(60 * secureSeconds * GameSpeed.BASE_TICKS_PER_SECOND));
  }

  /** 占领进行中（有发起者且计时器活跃）。 */
  isActive(): boolean {
    return !!this.securingPlayer && this.timer.isActive();
  }

  /** 当前占领发起者。 */
  getSecuringPlayer(): any {
    return this.securingPlayer;
  }

  /** 进度 0..1（未激活为 0）。 */
  getProgress(): number {
    return this.isActive()
      ? clamp(1 - this.timer.getTicksLeft() / this.timer.getInitialTicks(), 0, 1)
      : 0;
  }

  /** 是否由指定玩家发起且进行中。 */
  isActiveFrom(player: any): boolean {
    return this.isActive() && this.securingPlayer === player;
  }

  /** 尝试对中立建筑启动占领；失败返回 false。 */
  start(building: any, player: any): boolean {
    if (
      !building.owner.isNeutral ||
      building.isDestroyed ||
      this.isActiveFrom(player) ||
      this.secureTicks <= 0
    ) {
      return !1;
    }
    this.securingPlayer = player;
    this.timer.setActiveFor(this.secureTicks, undefined);
    return !0;
  }

  /** 重置进度与发起者。 */
  reset(): void {
    this.securingPlayer = void 0;
    this.timer.reset();
  }

  /** 每 tick：校验条件并推进计时；完成则换主+事件。 */
  [NotifyTickModule.NotifyTick.onTick](building: any, world: any): void {
    if (this.isActive()) {
      if (!building.owner.isNeutral || building.isDestroyed || this.securingPlayer?.defeated) {
        this.reset();
      } else if (this.timer.tick(world.currentTick)) {
        const winner = this.securingPlayer;
        this.reset();
        winner.buildingsCaptured++;
        world.changeObjectOwner(building, winner);
        world.events.dispatch(new BuildingCaptureEvent(building));
      }
    }
  }

  /** 换主：进度失效。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](): void {
    this.reset();
  }

  /** 同步哈希：激活、剩余/总 tick、发起者颜色。 */
  getHash(): number {
    return fnv32a([
      this.isActive() ? 1 : 0,
      this.timer.getTicksLeft(),
      this.timer.getInitialTicks(),
      this.securingPlayer?.color.asHex() ?? 0,
    ]);
  }

  /** 调试状态快照。 */
  debugGetState(): Record<string, unknown> {
    return {
      active: this.isActive(),
      securingPlayer: this.securingPlayer?.name,
      ticksLeft: this.timer.getTicksLeft(),
      totalTicks: this.timer.getInitialTicks(),
    };
  }
}
