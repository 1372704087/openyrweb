/**
 * DrainTrait — 浮空碟（Floating Disc）吸取/压制 trait（YR）。
 *
 * 挂在武器标记 DrainWeapon=yes 的单位上（原版即 Yuri 浮空碟）。当
 * DrainWeapon 弹头命中 Drainable=yes 建筑时由 Warhead.detonate()
 * 直接调用 startDrain() 启动吸取：
 *  - 矿场/奴隶矿车：每 DrainMoneyFrameDelay tick 向碟主转移
 *    DrainMoneyAmount 资金（原版默认 30$/30f）；
 *  - 电厂/电力防御：给建筑打 drainedBy 标记，抑制其电力/武器输出
 *    （由 PowerTrait 消费该软标记，不直接清零 power 字段）。
 *
 * 停止条件：碟停止攻击该建筑（换目标/移动指令/AttackTask 结束）、
 * 碟死亡、建筑死亡、建筑换主（变为友方）、或目标被其他碟占用。
 *
 * 触发路径唯一性：早期 NotifyAttack 触发为死代码（inflictDamage 遍历
 * game.traits，从不通知攻击者 trait）；NotifyTick 自动附着方案已移除，
 * 现仅由弹头命中触发，与原版 YR DrainWeapon 路径一致。
 *
 * 由 game/gameobject/trait/DrainTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 本组新写

export class DrainTrait {
  /** 当前被吸取的建筑（startDrain 设置；undefined=未吸取）。 */
  drainTarget?: any;
  /** 距下一次资金转移的剩余 tick。 */
  drainTicksLeft: number;
  /** 是否正在压制目标电力/武器。 */
  draining: boolean;
  /** 主武器被动扫描冷却（tick），避免每 tick 全图 O(n²) 扫描。 */
  primaryScanCooldown: number;

  constructor() {
    this.drainTarget = undefined;
    this.drainTicksLeft = 0;
    this.draining = false;
    this.primaryScanCooldown = 0;
  }

  /**
   * 开始吸取建筑。由 Warhead.detonate() 在 DrainWeapon 弹头命中
   * Drainable=yes 建筑时调用。
   *  - 目标必须是建筑且 rules.drainable；
   *  - 拒绝友方/己方（防 attach-detach 死循环）；
   *  - 拒绝已被其他碟占用（drainedBy≠self）；
   *  - 同目标重复调用 = 刷新；不同目标先 _detach 再挂新目标；
   *  - 挂上后立即 drainTicksLeft=1（首个 tick 即转移），并递增
   *    owner.powerTrait.drainPowerOverride（电厂时覆盖显示电力为 0），
   *  - 调用 updateFrom 抑制该建筑的电力贡献。
   */
  startDrain(disc: any, building: any, world: any): void {
    if (!building || !building.isBuilding || !building.isBuilding() || !building.rules.drainable) {
      return;
    }
    // 拒绝吸取友方/己方建筑，防止无限 attach-detach 循环
    // （武器命中 → startDrain → 电力下降 → tick 中 areFriendly 分离 →
    //  电力恢复 → 武器再开火 → 重复）。
    if (building.owner === disc.owner || world.areFriendly(building, disc)) {
      return;
    }
    // 拒绝已被其他碟占用的建筑（纵深防御；瞄准系统通常已阻止开火）。
    if (building.drainedBy && building.drainedBy !== disc) {
      return;
    }
    if (building === this.drainTarget) {
      // 刷新：已是同一目标。
      this.draining = true;
      building.drainedBy = disc;
      return;
    }
    if (this.drainTarget) this._detach(world);
    this.drainTarget = building;
    this.draining = true;
    this.drainTicksLeft = 1; // 首个可转移 tick 立即吸钱
    // 标记建筑被吸取，供 PowerTrait/防御系统抑制。
    building.drainedBy = disc;
    // 吸取电厂时覆盖所有者显示电力为 0。
    if (building.rules.power > 0 && building.owner?.powerTrait) {
      building.owner.powerTrait.drainPowerOverride++;
    }
    // 抑制该建筑的电力贡献。
    if (world && building.owner?.powerTrait?.updateFrom) {
      building.owner.powerTrait.updateFrom(building, "update", world);
    }
  }

  /**
   * 从当前吸取目标脱离：清自身状态 + 清 building.drainedBy（电力/防御恢复）。
   * 可重复调用（幂等）。
   */
  _detach(world: any): void {
    if (this.drainTarget && !this.drainTarget.isDisposed && !this.drainTarget.isDestroyed) {
      const wasPowerPlant = this.drainTarget.rules.power > 0;
      this.drainTarget.drainedBy = undefined;
      // 吸取结束时恢复建筑电力贡献。
      if (world && this.drainTarget.owner?.powerTrait?.updateFrom) {
        this.drainTarget.owner.powerTrait.updateFrom(this.drainTarget, "update", world);
      }
      // 若为电厂，释放全局电力覆盖计数并刷新电力等级。
      if (wasPowerPlant && this.drainTarget.owner?.powerTrait) {
        this.drainTarget.owner.powerTrait.drainPowerOverride = Math.max(
          0,
          this.drainTarget.owner.powerTrait.drainPowerOverride - 1,
        );
        if (world) this.drainTarget.owner.powerTrait.updateLevel(world);
      }
    }
    this.drainTarget = undefined;
    this.draining = false;
    this.drainTicksLeft = 0;
  }

  /**
   * 碟是否仍在攻击该建筑。原版：只要碟持续对建筑开火 DiskDrain
   * （ROF=50 每次命中刷新），吸取就持续；换目标/移动/AttackTask 结束
   * 时 currentTarget 变化即脱离。Range=1.5 时碟悬停在相邻格而非建筑
   * 正上方——物理格重叠检查会错误地立刻断开，故用 currentTarget 判断。
   */
  _isStillAttacking(disc: any, target: any): boolean {
    if (!target) return false;
    const ct = disc.attackTrait?.currentTarget;
    return !!ct && ct.obj === target;
  }

  /**
   * 每 tick 推进吸取状态机：
   *  1. 无目标 → 空返回；
   *  2. 目标消失/换主为我方/我方已死 → _detach；
   *  3. 不再攻击该建筑：
   *     a. 若有新目标且在主武器射程内（非 drainWeapon）→ 保持吸取
   *        （碟边吸边用主武器打远处，原版行为）；
   *     b. 新目标出射程或可吸取 → _detach 让碟移动过去；
   *     c. 无 currentTarget（手动目标死亡后 AttackTask 结束）→ 若仍在
   *        吸取目标 centerTile 正上方则保持，否则 _detach；
   *  4. 仍在正上方 → 刷新 drainedBy，按 DrainMoneyFrameDelay 转移资金
   *     （仅矿场 refinery），并 _autoFirePrimary 让碟对附近敌人开火。
   */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    const target = this.drainTarget;
    if (!target) return;
    // 目标消失、换主为我方、或我方已死 → 放弃。
    if (
      target.isDisposed ||
      target.isDestroyed ||
      target.owner === object.owner ||
      world.areFriendly(target, object)
    ) {
      this._detach(world);
      return;
    }
    // 碟不再攻击该建筑（换目标/移动指令/AttackTask 结束）。
    if (!this._isStillAttacking(object, target)) {
      const ct = object.attackTrait?.currentTarget;
      // 若仍有对射程内其他目标的攻击，保持吸取——碟悬停在吸取建筑上方
      // 同时用主武器（DiskLaser）攻击手动目标，匹配原版 YR。
      // 注意：此处不检查 drainable；射程内的可吸取建筑也不断开。
      // 仅出射程（需移动）或 AttackTask 完成才断开。
      if (ct && ct.obj && ct.obj !== target) {
        const pw = object.primaryWeapon;
        if (pw && !pw.rules.drainWeapon) {
          const ctTile =
            ct.obj.isBuilding && ct.obj.isBuilding() ? ct.obj.centerTile : ct.obj.tile || ct.tile;
          const dx = object.tile.rx - ctTile.rx;
          const dy = object.tile.ry - ctTile.ry;
          if (Math.sqrt(dx * dx + dy * dy) <= pw.range) {
            // 在主武器射程内——保持吸取，AttackTask 对手动目标开火
            // 而不移动碟（MoveInWeaponRangeTask 航程中射程检查立即停）。
            return;
          }
        }
        // 新目标出射程或可吸取 → 脱离让碟移动过去。
        this._detach(world);
        return;
      }
      // 无 currentTarget（AttackTask 结束/取消）：手动目标死亡时发生。
      // 不立刻脱离——若吸取目标仍有效且碟未离开 centerTile，保持吸取，
      // 等 AttackTrait 被动获取在下一扫描 tick 重新锁定吸取建筑。
      if (
        target &&
        !target.isDisposed &&
        !target.isDestroyed &&
        target.owner !== object.owner &&
        !world.areFriendly(target, object)
      ) {
        // 仅当碟仍在吸取建筑 centerTile 正上方才保持；若收到移动指令，
        // 下 tick 就会离开 → 检查失败 → 脱离。
        const drainCt = target.centerTile;
        if (drainCt && object.tile.rx === drainCt.rx && object.tile.ry === drainCt.ry) {
          target.drainedBy = object;
          return;
        }
      }
      this._detach(world);
      return;
    }
    // 仍在正上方 → 刷新压制标记。
    target.drainedBy = object;
    // 资金转移（仅矿场/奴隶矿车）。原版：每 DrainMoneyFrameDelay 转
    // DrainMoneyAmount；全局配置未设/为 0 时无操作。
    const cd = world.rules.combatDamage;
    if (
      target.rules.refinery &&
      cd &&
      cd.drainMoneyAmount > 0 &&
      cd.drainMoneyFrameDelay > 0
    ) {
      if (this.drainTicksLeft <= 0) this.drainTicksLeft = cd.drainMoneyFrameDelay;
      if (--this.drainTicksLeft <= 0) {
        const amt = cd.drainMoneyAmount;
        const victim = target.owner;
        const me = object.owner;
        if (victim && me && victim !== me) {
          const steal = Math.min(amt, Math.max(0, victim.credits));
          if (steal > 0) {
            victim.credits -= steal;
            me.credits += steal;
            me.creditsGained += steal;
          }
        }
      }
    }
    // 吸取期间对射程内附近敌人自动开主武器（激光），与原版 YR 一致。
    this._autoFirePrimary(object, world);
  }

  /**
   * 吸取期间用游戏被动目标获取系统（同警戒/待机模式）对附近敌人开主武器。
   * 每 10 tick 至多扫一次，控制 CPU 开销。
   */
  _autoFirePrimary(object: any, world: any): void {
    if (!this.draining || !this.drainTarget) return;
    if (0 < this.primaryScanCooldown) {
      this.primaryScanCooldown--;
      return;
    }
    this.primaryScanCooldown = 10;
    const primaryWp = object.primaryWeapon;
    if (!primaryWp || primaryWp.getCooldownTicks() > 0) return;
    if (!object.attackTrait) return;
    // 用标准被动扫描（威胁评分/武器选择/空间索引/过滤器全套）而非暴力遍历。
    const scanResult = object.attackTrait.scanForTarget(object, primaryWp, world);
    if (scanResult && scanResult.target && scanResult.target !== this.drainTarget) {
      primaryWp.fire(
        world.createTarget(scanResult.target, scanResult.target.tile),
        world,
        1,
      );
    }
  }

  /** 被吸取建筑（或其摧毁目标）被摧毁 → 脱离。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](
    destroyed: any,
    attacker?: any,
    world?: any,
  ): void {
    if (
      this.drainTarget &&
      (destroyed === this.drainTarget || attacker?.obj === this.drainTarget)
    ) {
      this._detach(world);
    }
  }

  /** 碟死亡/离场 → 释放建筑。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](_object: any, world: any): void {
    this._detach(world);
  }
}
