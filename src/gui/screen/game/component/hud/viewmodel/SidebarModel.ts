/**
 * SidebarModel — 侧栏视图模型（页签/电力/模式/时间）。
 *
 * 由 gui/screen/game/component/hud/viewmodel/SidebarModel.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as SidebarTabModule from "gui/screen/game/component/hud/viewmodel/SidebarTab"; // 孪生
import { GameSpeed } from "game/GameSpeed"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：SidebarTab 模块在孪生中为 type-only 空导出时无具名类；
// 仍按孪生调用 (module as any).SidebarTab 构造。
const SidebarTab: any = (SidebarTabModule as any).SidebarTab;

/** 侧栏条目目标类型。 */
export enum SidebarItemTargetType {
  /** Techno */
  Techno = 0,
  /** 特殊武器 */
  Special = 1,
}

/** 侧栏条目状态。 */
export enum SidebarItemStatus {
  /** 空闲 */
  Idle = 0,
  /** 排队中 */
  InQueue = 1,
  /** 已开始 */
  Started = 2,
  /** 暂停 */
  OnHold = 3,
  /** 就绪 */
  Ready = 4,
}

/** 侧栏类别。 */
export enum SidebarCategory {
  /** 建筑 */
  Structures = 0,
  /** 军械 */
  Armory = 1,
  /** 步兵 */
  Infantry = 2,
  /** 载具 */
  Vehicles = 3,
}

/** 侧栏模型。 */
export class SidebarModel {
  /** 游戏。 */
  game: any;
  /** 回放（可空）。 */
  replay: any;
  /** 耗电。 */
  powerDrained = 0;
  /** 发电。 */
  powerGenerated = 0;
  /** 出售模式。 */
  sellMode = false;
  /** 维修模式。 */
  repairMode = false;
  /** 顶栏文字左对齐。 */
  topTextLeftAlign = false;
  /** 四页签。 */
  tabs: any[];
  /** 激活页签下标。 */
  activeTabId: SidebarCategory;

  /**
   * @param game 游戏
   * @param replay 回放
   */
  constructor(game: any, replay?: any) {
    this.game = game;
    this.replay = replay;
    this.powerDrained = 0;
    this.powerGenerated = 0;
    this.sellMode = false;
    this.repairMode = false;
    this.topTextLeftAlign = false;
    this.tabs = [
      new SidebarTab(SidebarCategory.Structures),
      new SidebarTab(SidebarCategory.Armory),
      new SidebarTab(SidebarCategory.Infantry),
      new SidebarTab(SidebarCategory.Vehicles),
    ];
    this.activeTabId = SidebarCategory.Structures;
  }

  /** 当前激活页签。 */
  get activeTab(): any {
    return this.tabs[this.activeTabId];
  }

  /** 对局秒数。 */
  get currentGameTime(): number {
    return Math.floor(this.game.currentTime / 1e3);
  }

  /** 回放总时长秒（无回放则 undefined）。 */
  get replayTime(): number | undefined {
    return this.replay
      ? Math.floor(this.replay.endTick / GameSpeed.BASE_TICKS_PER_SECOND)
      : void 0;
  }

  /**
   * 切换页签（禁用不可选）。
   * @param id 下标
   */
  selectTab(id: number): void {
    if (!this.tabs[id].disabled) this.activeTabId = id;
  }
}
