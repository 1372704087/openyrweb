/**
 * TntChargeTrait — 伊万炸弹（计时器 + 到时/被毁引爆 Ivan 弹头）。
 *
 * setCharge 登记 attackerInfo 并启动 Timer；tick 到时（及 destroy 非
 * None/Temporal/Sink 死因且非 ivanBomb 弹头）detonateIvanWarhead。
 * 碉堡小屋连带 demolishBridge。弹头伤害来自 combatDamage.ivanDamage。
 *
 * 由 game/gameobject/trait/TntChargeTrait.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as CoordsModule from "game/Coords"; // 已转换
import * as WarheadModule from "game/Warhead"; // 未转换（any-shim）
import * as DeathTypeModule from "game/gameobject/common/DeathType"; // 未转换（any-shim）
import * as CollisionTypeModule from "game/gameobject/unit/CollisionType"; // 未转换（any-shim）
import * as TimerModule from "game/gameobject/unit/Timer"; // 未转换（any-shim）
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as SpecialWarheadTypeModule from "game/SpecialWarheadType"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TntChargeTrait {
  /** 引信计时器。 */
  timer: any;
  /** 放置者信息（player/weapon）。 */
  attackerInfo: any;

  constructor() {
    this.timer = new TimerModule.Timer();
  }

  /** 是否已装药。 */
  hasCharge() {
    return this.timer.isActive();
  }

  /**
   * 装药（已有则忽略）。
   * @param ticks 引信时长
   * @param ??? 孪生第二参传给 setActiveFor
   * @param attackerInfo 攻击者信息
   */
  setCharge(ticks: any, activeArg: any, attackerInfo: any) {
    if (!this.hasCharge()) {
      this.timer.setActiveFor(ticks, activeArg);
      this.attackerInfo = attackerInfo;
    }
  }

  /** 放置者玩家。 */
  getChargeOwner() {
    return this.attackerInfo?.player;
  }

  /** 拆除引信。 */
  removeCharge() {
    this.timer.reset();
  }

  /** 剩余引信 tick。 */
  getTicksLeft() {
    return this.timer.getTicksLeft();
  }

  /** 初始引信 tick。 */
  getInitialTicks() {
    return this.timer.getInitialTicks();
  }

  /** 每 tick：引信到时则（若碉堡小屋）拆桥并引爆。 */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any) {
    if (this.timer.isActive() && this.timer.tick(world.currentTick) === true) {
      if (object.isBuilding() && object.cabHutTrait) {
        object.cabHutTrait.demolishBridge(world, this.attackerInfo);
      }
      this.detonateIvanWarhead(world, object);
    }
  }

  /** 被毁：非 Ivan 自爆/非特殊死因则立即引爆。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, world: any, attackerInfo: any) {
    if (!this.timer.isActive()) return;
    if (attackerInfo?.weapon?.warhead.rules.ivanBomb) return;
    if (
      [DeathTypeModule.DeathType.None, DeathTypeModule.DeathType.Temporal, DeathTypeModule.DeathType.Sink].includes(
        object.deathType,
      )
    ) {
      return;
    }
    this.timer.reset();
    this.detonateIvanWarhead(world, object);
  }

  /** 用 Ivan 弹头在对象位置引爆。 */
  detonateIvanWarhead(world: any, object: any) {
    const damage = world.rules.combatDamage.ivanDamage;
    const warhead = new WarheadModule.Warhead(world.rules.getWarhead(world.rules.combatDamage.ivanWarhead));
    const tile = object.tile;
    const elevation = object.tileElevation;
    const zone = object.isUnit() ? object.zone : world.map.getTileZone(tile);
    const onBridge = !!object.isUnit() && object.onBridge;
    warhead.detonate(
      world,
      damage,
      tile,
      elevation,
      object.isBuilding()
        ? CoordsModule.Coords.tile3dToWorld(tile.rx + 0.5, tile.ry + 0.5, tile.z + elevation)
        : object.position.worldPosition,
      zone,
      onBridge ? CollisionTypeModule.CollisionType.OnBridge : CollisionTypeModule.CollisionType.None,
      world.createTarget(object, tile),
      { ...this.attackerInfo, weapon: undefined },
      SpecialWarheadTypeModule.SpecialWarheadType.TntCharge,
      // 孪生只传 10 参：smudgeType/cellSpreadOverride 实参为 undefined
      undefined,
      undefined,
    );
  }
}
