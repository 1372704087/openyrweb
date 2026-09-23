/**
 * CombatantSidebarModel — 参战方侧栏：生产队列/超武状态同步。
 *
 * 由 gui/screen/game/component/hud/viewmodel/CombatantSidebarModel.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as TechnoRulesModule from "game/rules/TechnoRules"; // 孪生
import * as ProductionQueueModule from "game/player/production/ProductionQueue"; // 孪生
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import * as DockTraitModule from "game/gameobject/trait/DockTrait"; // 孪生
import {
  SidebarModel,
  SidebarCategory,
  SidebarItemStatus,
  SidebarItemTargetType,
} from "gui/screen/game/component/hud/viewmodel/SidebarModel"; // 已转换
import * as SuperWeaponModule from "game/SuperWeapon"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const FactoryType: any = (TechnoRulesModule as any).FactoryType ?? TechnoRulesModule;
const QueueType: any = (ProductionQueueModule as any).QueueType;
const QueueStatus: any = (ProductionQueueModule as any).QueueStatus;
const DockTrait: any = (DockTraitModule as any).DockTrait;
const SuperWeaponStatus: any = (SuperWeaponModule as any).SuperWeaponStatus;

/** 超武状态 → 侧栏条目状态。 */
const SW_STATUS_MAP = new Map<any, any>()
  .set(SuperWeaponStatus.Charging, SidebarItemStatus.Started)
  .set(SuperWeaponStatus.Paused, SidebarItemStatus.OnHold)
  .set(SuperWeaponStatus.Ready, SidebarItemStatus.Ready);

/** 参战方侧栏模型。 */
export class CombatantSidebarModel extends SidebarModel {
  /** 玩家。 */
  player: any;
  /** 规则。 */
  rules: any;

  /** 现金。 */
  get credits(): number {
    return Math.floor(this.player.credits);
  }

  /** 雷达可用。 */
  get radarEnabled(): boolean {
    return !(!this.player.radarTrait || this.player.radarTrait.isDisabled());
  }

  /**
   * @param player 玩家
   * @param game 游戏
   */
  constructor(player: any, game: any) {
    super(game);
    this.player = player;
    this.rules = game.rules;
  }

  /**
   * 购买价（含折扣）。
   * @param rules 规则
   */
  computePurchaseCost(rules: any): number {
    return Math.round(rules.cost * this.player.production.getCostBonusMultiplier(rules.type));
  }

  /**
   * 从可用对象重建页签条目。
   * @param art art 表
   */
  updateAvailableObjects(art: any): void {
    if (!this.player.production) throw new Error("Player is not a combatant");
    const sorted = this.sortAvailableObjects(this.player.production.getAvailableObjects());
    for (const tab of this.tabs) {
      tab.items.length = 0;
      tab.needsUpdate = true;
    }
    this.updateSuperWeaponItems();
    for (const rules of sorted) {
      const objectArt = art.getObject(rules.name, rules.type);
      const tab =
        this.tabs[
          this.getSidebarCategoryForQueueType(
            this.player.production.getQueueTypeForObject(rules),
          )
        ];
      const queue = this.player.production.getQueueForObject(rules);
      const factoryType = this.player.production.getFactoryTypeForQueueType(queue.type);
      const item = {
        target: { type: SidebarItemTargetType.Techno, rules },
        cameo:
          this.player.production.hasVeteranType(factoryType) && rules.trainable
            ? objectArt.altCameo
            : objectArt.cameo,
        disabled: false,
        progress: 0,
        quantity: 0,
        status: SidebarItemStatus.Idle,
      };
      tab.items.push(item);
      this.updateSidebarTechnoItem(item, queue, this.player.production);
    }
    for (const tab of this.tabs) this.updateTabFlashing(tab);
    this.updateActiveTab();
  }

  /** 空激活页时自动跳到有内容的页。 */
  updateActiveTab(): void {
    if (this.activeTab.items.length !== 0) return;
    const found = this.tabs.find((t) => t.items.length > 0)?.id;
    if (found !== void 0) this.selectTab(found);
  }

  /**
   * 队列变更刷新对应页。
   * @param queue 队列
   */
  updateFromQueue(queue: any): void {
    if (!this.player.production) throw new Error("Player is not a combatant");
    const tab = this.tabs[this.getSidebarCategoryForQueueType(queue.type)];
    tab.needsUpdate = true;
    for (const item of tab.items) {
      if (
        item.target.type === SidebarItemTargetType.Techno &&
        this.player.production.getQueueForObject(item.target.rules) === queue
      ) {
        this.updateSidebarTechnoItem(item, queue, this.player.production);
      }
    }
    this.updateTabFlashing(tab);
  }

  /** 刷新超武条。 */
  updateSuperWeapons(): void {
    this.updateSuperWeaponItems();
    this.updateActiveTab();
  }

  /** 将超武插入军械页顶部。 */
  updateSuperWeaponItems(): void {
    const list =
      this.player.superWeaponsTrait
        ?.getAll()
        .slice()
        .sort(
          (a: any, b: any) =>
            1e3 * (a.rules.rechargeTime - b.rules.rechargeTime) +
            a.name.charCodeAt(0) -
            b.name.charCodeAt(0),
        ) ?? [];
    const tab = this.tabs[SidebarCategory.Armory];
    tab.needsUpdate = true;
    const technoIdx = tab.items.findIndex(
      (i: any) => i.target.type === SidebarItemTargetType.Techno,
    );
    if (technoIdx !== -1) tab.items.splice(0, technoIdx);
    else tab.items.length = 0;
    const items = list.map((sw: any) => {
      const status = SW_STATUS_MAP.get(sw.status);
      if (status === void 0) throw new Error(`Unhandled super weapon status "${sw.status}"`);
      return {
        target: { type: SidebarItemTargetType.Special, rules: sw.rules },
        cameo: sw.rules.sidebarImage,
        disabled: false,
        progress: sw.getChargeProgress(),
        quantity: 1,
        status,
      };
    });
    if (items && items.length) tab.items.unshift(...items);
    this.updateTabFlashing(tab);
  }

  /**
   * 有 Ready 条则闪烁。
   * @param tab 页签
   */
  updateTabFlashing(tab: any): void {
    tab.flashing = tab.items.some((i: any) => i.status === SidebarItemStatus.Ready);
  }

  /**
   * 刷新单个 Techno 条目状态。
   * @param item 条目
   * @param queue 队列
   * @param production 生产
   */
  updateSidebarTechnoItem(item: any, queue: any, production: any): void {
    if (item.target.type === SidebarItemTargetType.Special) {
      throw new Error("Sidebar item must be of type Techno");
    }
    const rules = item.target.rules;
    const buildings = [...this.player.buildings];
    let overLimit = false;
    if (!production.cheatsBypassBuildLimits && Number.isFinite(rules.buildLimit)) {
      let count: number;
      if (rules.buildLimit >= 0) {
        const source =
          rules.type === ObjectType.Building
            ? buildings
            : this.player.getOwnedObjectsByType(rules.type, true);
        count = source.filter((o: any) => o.name === rules.name).length;
      } else {
        count = this.player.getLimitedUnitsBuilt(rules.name);
      }
      overLimit = count >= Math.abs(rules.buildLimit);
    }
    if (queue.type === QueueType.Aircrafts) {
      overLimit = overLimit || queue.maxSize <= 0;
    }
    const factoryType = production.getFactoryTypeForQueueType(queue.type);
    const factories = buildings.filter(
      (b: any) => b.factoryTrait?.type === factoryType && !b.warpedOutTrait.isActive(),
    );
    const entries = queue.find(rules);
    item.progress = entries.length ? entries[0].progress : 0;
    item.quantity = entries.reduce((sum: number, e: any) => sum + e.quantity, 0);
    item.status = this.computeStatus(queue, entries[0]);
    item.disabled =
      (queue.maxSize === 1 && queue.currentSize > 0 && entries[0] !== queue.getFirst()) ||
      overLimit ||
      (!factories.length &&
        (!queue.currentSize || entries[0] !== queue.getFirst()));
  }

  /**
   * 队列类型 → 页签。
   * @param type 队列类型
   */
  getTabForQueueType(type: any): any {
    return this.tabs[this.getSidebarCategoryForQueueType(type)];
  }

  /**
   * 队列类型 → 侧栏类别。
   * @param type 队列类型
   */
  getSidebarCategoryForQueueType(type: any): SidebarCategory {
    switch (type) {
      case QueueType.Structures:
        return SidebarCategory.Structures;
      case QueueType.Armory:
        return SidebarCategory.Armory;
      case QueueType.Infantry:
        return SidebarCategory.Infantry;
      case QueueType.Vehicles:
      case QueueType.Ships:
      case QueueType.Aircrafts:
        return SidebarCategory.Vehicles;
      default:
        throw new Error("Unhandled queueType " + QueueType[type]);
    }
  }

  /**
   * 由队列与首条目推状态。
   * @param queue 队列
   * @param entry 首条目（可空）
   */
  computeStatus(queue: any, entry: any): SidebarItemStatus {
    if (!entry) return SidebarItemStatus.Idle;
    if (queue.getFirst() !== entry) return SidebarItemStatus.InQueue;
    if (queue.status === QueueStatus.Ready) return SidebarItemStatus.Ready;
    if (queue.status === QueueStatus.OnHold) return SidebarItemStatus.OnHold;
    return SidebarItemStatus.Started;
  }

  /**
   * 可用对象排序。
   * @param list 列表
   */
  sortAvailableObjects(list: Iterable<any>): any[] {
    return [...list].sort((a, b) => {
      const va = this.getObjectTypeSortValue(a);
      const vb = this.getObjectTypeSortValue(b);
      if (va !== vb) return va - vb;
      if (a.aiBasePlanningSide === b.aiBasePlanningSide) {
        if (a.techLevel === b.techLevel) {
          return a.prerequisite.length < b.prerequisite.length ? -1 : 1;
        }
        return a.techLevel < b.techLevel ? -1 : 1;
      }
      return (a.aiBasePlanningSide ?? -1) < (b.aiBasePlanningSide ?? -1) ? -1 : 1;
    });
  }

  /**
   * 类型排序权重：飞机/海军优先。
   * @param rules 规则
   */
  getObjectTypeSortValue(rules: any): number {
    if (rules.type === ObjectType.Aircraft) return 1;
    if (rules.type === ObjectType.Vehicle) {
      if (rules.naval) return 2;
      if (rules.consideredAircraft) return 1;
      return 0;
    }
    return 0;
  }
}
