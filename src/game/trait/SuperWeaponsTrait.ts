/**
 * SuperWeaponsTrait — 玩家超武集合 + 效果调度（activateEffect / power / warp）。
 *
 * tick 推进全部超武计时与 effects（NotStarted→Running→Finished 并广播
 * Deactivate）。低电/恢复 pause/resume 需电超武。activateSuperWeapon 校验
 * Ready、oneTimeOnly 移除后 activateEffect 按 SuperWeaponType 工厂创建
 * 对应 Effect（伞兵/核弹/闪电/铁幕/超时空/心灵/基因/力场/心灵探测/间谍机）。
 *
 * 由 game/gameobject/trait/SuperWeaponsTrait.ts.js →
 * game/trait/SuperWeaponsTrait.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
import * as NotifyWarpChangeModule from "game/trait/interface/NotifyWarpChange"; // 已转换
import * as SuperWeaponModule from "game/SuperWeapon"; // 未转换（any-shim）
import * as SuperWeaponEffectModule from "game/superweapon/SuperWeaponEffect"; // 未转换（any-shim）
import * as NotifyPowerModule from "game/trait/interface/NotifyPower"; // 已转换
import * as NotifyTickModule from "game/trait/interface/NotifyTick"; // 已转换
import * as SuperWeaponTypeModule from "game/type/SuperWeaponType"; // 已转换
import * as NotifySuperWeaponActivateModule from "game/trait/interface/NotifySuperWeaponActivate"; // 已转换
import * as SuperWeaponActivateEventModule from "game/event/SuperWeaponActivateEvent"; // 未转换（any-shim）
import * as ParadropEffectModule from "game/superweapon/ParadropEffect"; // 未转换（any-shim）
import * as NukeEffectModule from "game/superweapon/NukeEffect"; // 未转换（any-shim）
import * as LightningStormEffectModule from "game/superweapon/LightningStormEffect"; // 未转换（any-shim）
import * as IronCurtainEffectModule from "game/superweapon/IronCurtainEffect"; // 未转换（any-shim）
import * as ChronoSphereEffectModule from "game/superweapon/ChronoSphereEffect"; // 未转换（any-shim）
import * as DominatorEffectModule from "game/superweapon/DominatorEffect"; // 未转换（any-shim）
import * as GeneticMutatorEffectModule from "game/superweapon/GeneticMutatorEffect"; // 未转换（any-shim）
import * as ForceShieldEffectModule from "game/superweapon/ForceShieldEffect"; // 未转换（any-shim）
import * as PsychicRevealEffectModule from "game/superweapon/PsychicRevealEffect"; // 未转换（any-shim）
import * as SpyPlaneEffectModule from "game/superweapon/SpyPlaneEffect"; // 未转换（any-shim）
import * as NotifySuperWeaponDeactivateModule from "game/trait/interface/NotifySuperWeaponDeactivate"; // 已转换
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SuperWeaponsTrait {
  /** 进行中的超武特效列表。 */
  effects: any[];

  constructor() {
    this.effects = [];
  }

  /** 每 tick：推进玩家超武计时；推进 effects 并清理已完成。 */
  [NotifyTickModule.NotifyTick.onTick](world: any) {
    for (const player of world.getCombatants()) {
      for (const sw of player.superWeaponsTrait.getAll()) sw.update(world);
    }
    for (const effect of this.effects) {
      if (effect.status === SuperWeaponEffectModule.EffectStatus.NotStarted) {
        effect.onStart(world);
        effect.status = SuperWeaponEffectModule.EffectStatus.Running;
      }
      if (effect.onTick(world)) {
        effect.status = SuperWeaponEffectModule.EffectStatus.Finished;
        world.traits.filter(NotifySuperWeaponDeactivateModule.NotifySuperWeaponDeactivate).forEach((trait: any) => {
          trait[NotifySuperWeaponDeactivateModule.NotifySuperWeaponDeactivate.onDeactivate](
            effect.type,
            effect.owner,
            world,
          );
        });
      }
    }
    this.effects = this.effects.filter((e) => e.status !== SuperWeaponEffectModule.EffectStatus.Finished);
  }

  /** 低电：需电超武 pauseTimer。 */
  [NotifyPowerModule.NotifyPower.onPowerLow](player: any, _world: any) {
    player.superWeaponsTrait
      ?.getAll()
      ?.filter((sw: any) => sw.rules.isPowered)
      .forEach((sw: any) => {
        this.updateTimer(sw, false);
      });
  }

  /** 电力恢复：需电超武 resumeTimer。 */
  [NotifyPowerModule.NotifyPower.onPowerRestore](player: any, _world: any) {
    player.superWeaponsTrait
      ?.getAll()
      ?.filter((sw: any) => sw.rules.isPowered)
      .forEach((sw: any) => {
        this.updateTimer(sw, true);
      });
  }

  /** 电力数值变化：孪生空实现。 */
  [NotifyPowerModule.NotifyPower.onPowerChange](_player: any, _world: any) {}

  /** 建筑传送态变化：按是否低电暂停/恢复其超武。 */
  [NotifyWarpChangeModule.NotifyWarpChange.onChange](object: any, world: any) {
    let sw: any;
    if (object.owner.powerTrait && object.isBuilding() && object.superWeaponTrait) {
      sw = object.superWeaponTrait.getSuperWeapon(object);
      if (sw) this.updateTimer(sw, !object.owner.powerTrait.isLowPower());
    }
  }

  /** 有有效建筑且允许则 resume，否则 pause。 */
  updateTimer(sw: any, allow: boolean) {
    const valid = this.superWeaponHasValidBuilding(sw);
    if (allow && valid) sw.resumeTimer();
    else sw.pauseTimer();
  }

  /** 是否存在仍持有该超武且未传送（需电时）的建筑。 */
  superWeaponHasValidBuilding(sw: any) {
    return [...sw.owner.buildings].find((b: any) => {
      if (b.superWeaponTrait?.getSuperWeapon(b) !== sw) return false;
      if (b.warpedOutTrait.isActive() && sw.rules.isPowered) return false;
      return true;
    });
  }

  /** 登记一个特效。 */
  addEffect(effect: any) {
    this.effects.push(effect);
  }

  /** 按类型在玩家超武中找 Ready 实例并激活；oneTimeOnly 先移除。 */
  activateSuperWeapon(type: any, player: any, world: any, target: any, tile2: any) {
    const sw = player.superWeaponsTrait?.getAll().find((s: any) => s.rules.type === type);
    if (sw && sw.status === SuperWeaponModule.SuperWeaponStatus.Ready) {
      if (sw.oneTimeOnly) {
        player.superWeaponsTrait.remove(sw.name);
        for (const building of player.buildings) {
          if (building.rules.superWeapon === sw.name && building.superWeaponTrait) {
            building.superWeaponTrait.addSuperWeaponToPlayerIfNeeded(player, world);
          }
        }
      } else {
        sw.resetTimer();
      }
      this.activateEffect(sw.rules, player, world, target, tile2);
    }
  }

  /**
   * 按 SuperWeaponType 创建对应 Effect 并广播 Activate + 事件。
   * @param rules 超武规则
   * @param player 所有者
   * @param world 游戏世界
   * @param target 目标（对象/坐标）
   * @param tile2 二次落点（ChronoSphere 需要）
   * @param isGift 是否 gift（事件标记，默认 false）
   */
  activateEffect(rules: any, player: any, world: any, target: any, tile2: any, isGift = false) {
    const type = rules.type;
    if (type === undefined) return;
    let created: any[] = [];
    switch (type) {
      case SuperWeaponTypeModule.SuperWeaponType.AmerParaDrop:
        for (const [index, squad] of world.rules.general.paradrop.amerParaDrop.entries()) {
          if (world.rules.hasObject(squad.inf, ObjectTypeModule.ObjectType.Infantry)) {
            created.push(new ParadropEffectModule.ParadropEffect(type, player, target, squad, index));
          } else {
            console.warn(`Can't paradrop unknown infantry type "${squad.inf}"`);
          }
        }
        break;
      case SuperWeaponTypeModule.SuperWeaponType.ParaDrop: {
        const squads = world.rules.general.paradrop.getParadropSquads(player.country.side);
        for (const [index, squad] of squads.entries()) {
          if (world.rules.hasObject(squad.inf, ObjectTypeModule.ObjectType.Infantry)) {
            created.push(new ParadropEffectModule.ParadropEffect(type, player, target, squad, index));
          } else {
            console.warn(`Can't paradrop unknown infantry type "${squad.inf}"`);
          }
        }
        break;
      }
      case SuperWeaponTypeModule.SuperWeaponType.MultiMissile:
        if (!rules.weaponType) throw new Error("Missing WeaponType in super weapon rules");
        created.push(new NukeEffectModule.NukeEffect(type, player, target, rules.weaponType));
        break;
      case SuperWeaponTypeModule.SuperWeaponType.LightningStorm:
        created.push(new LightningStormEffectModule.LightningStormEffect(type, player, target));
        break;
      case SuperWeaponTypeModule.SuperWeaponType.IronCurtain:
        created.push(new IronCurtainEffectModule.IronCurtainEffect(type, player, target));
        break;
      case SuperWeaponTypeModule.SuperWeaponType.ChronoSphere:
        if (!tile2) throw new Error("Missing tile2 action param");
        created.push(new ChronoSphereEffectModule.ChronoSphereEffect(type, player, target, tile2));
        break;
      // YR 超武：单击目标，无 tile2。
      case SuperWeaponTypeModule.SuperWeaponType.PsychicDominator:
        created.push(new DominatorEffectModule.DominatorEffect(type, player, target));
        break;
      case SuperWeaponTypeModule.SuperWeaponType.GeneticMutator:
        // 弹头由 [AudioVisual] Mutate* + [General] MutateExplosion 决定，无需 WeaponType。
        created.push(new GeneticMutatorEffectModule.GeneticMutatorEffect(type, player, target));
        break;
      // 力场：ForceShieldRadius 内无敌 ForceShieldDuration 帧，代价是
      // ForceShieldBlackoutDuration 帧断电。单击目标。
      case SuperWeaponTypeModule.SuperWeaponType.ForceShield:
        created.push(new ForceShieldEffectModule.ForceShieldEffect(type, player, target));
        break;
      // 心灵探测：永久揭示激活点 PsychicRevealRadius 圆域（YAGGNT 解锁）。
      case SuperWeaponTypeModule.SuperWeaponType.PsychicReveal:
        created.push(new PsychicRevealEffectModule.PsychicRevealEffect(type, player, target));
        break;
      // 间谍机：NARADR 支援，从随机边缘飞入拍照后对侧离开（SPYP）。
      case SuperWeaponTypeModule.SuperWeaponType.SpyPlane:
        created.push(new SpyPlaneEffectModule.SpyPlaneEffect(type, player, target));
        break;
    }
    for (const effect of created) this.addEffect(effect);
    world.traits.filter(NotifySuperWeaponActivateModule.NotifySuperWeaponActivate).forEach((trait: any) => {
      trait[NotifySuperWeaponActivateModule.NotifySuperWeaponActivate.onActivate](type, player, world, target, tile2);
    });
    world.events.dispatch(
      new SuperWeaponActivateEventModule.SuperWeaponActivateEvent(type, player, target, tile2, isGift),
    );
  }
}
