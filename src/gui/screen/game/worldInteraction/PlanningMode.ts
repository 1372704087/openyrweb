/**
 * PlanningMode — 规划模式：多路径 waypoint 编辑与校验。
 *
 * 由 gui/screen/game/worldInteraction/PlanningMode.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { OrderType } from "game/order/OrderType"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { WaypointLines } from "engine/renderable/entity/WaypointLines"; // 孪生
import { ORDER_UNIT_LIMIT } from "game/action/OrderUnitsAction"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const WaypointLinesCtor: any = (WaypointLines as any) ?? WaypointLines;

/** 规划模式。 */
export class PlanningMode {
  /** 玩家。 */
  player: any;
  /** 消息列表。 */
  messageList: any;
  /** 音效。 */
  sound: any;
  /** 字符串。 */
  strings: any;
  /** 世界场景。 */
  worldScene: any;
  /** 单位选择。 */
  unitSelection: any;
  /** 选择处理器。 */
  unitSelectionHandler: any;
  /** 渲染器。 */
  renderer: any;
  /** 目标线。 */
  targetLines: any;
  /** 最大 waypoint 数。 */
  maxWaypointPathLength: any;
  /** 是否激活。 */
  active = false;
  /** 全部路径。 */
  paths: any[] = [];
  /** 选中路径。 */
  selectedPaths: any[] = [];
  /** 选中单位。 */
  selectedUnits = new Set<any>();
  /** 路径线渲染。 */
  waypointLines: any;
  /** 上次刷新。 */
  lastUpdate: number | undefined;
  /** 帧回调。 */
  onFrame: (now: number) => void;

  /**
   * @param player 玩家
   * @param messageList 消息
   * @param sound 音效
   * @param strings 字符串
   * @param worldScene 场景
   * @param unitSelection 选择
   * @param unitSelectionHandler 选择处理
   * @param renderer 渲染器
   * @param targetLines 目标线
   * @param maxWaypointPathLength 上限
   */
  constructor(
    player: any,
    messageList: any,
    sound: any,
    strings: any,
    worldScene: any,
    unitSelection: any,
    unitSelectionHandler: any,
    renderer: any,
    targetLines: any,
    maxWaypointPathLength: any,
  ) {
    this.player = player;
    this.messageList = messageList;
    this.sound = sound;
    this.strings = strings;
    this.worldScene = worldScene;
    this.unitSelection = unitSelection;
    this.unitSelectionHandler = unitSelectionHandler;
    this.renderer = renderer;
    this.targetLines = targetLines;
    this.maxWaypointPathLength = maxWaypointPathLength;
    this.active = false;
    this.paths = [];
    this.selectedPaths = [];
    this.selectedUnits = new Set();
    this.onFrame = (now: number) => {
      if (!this.lastUpdate || now - this.lastUpdate > 1e3 / 15) {
        this.lastUpdate = now;
        this.updatePaths();
      }
    };
  }

  /** 是否激活。 */
  isActive(): boolean {
    return this.active;
  }

  /** 进入：收集已有路径并挂线。 */
  enter(): void {
    if (this.active) return;
    this.active = true;
    if (this.targetLines.get3DObject()) {
      this.targetLines.get3DObject().visible = false;
    }
    this.renderer.onFrame.subscribe(this.onFrame);
    const unique = new Set(
      [
        ...this.player.getOwnedObjectsByType(ObjectType.Infantry),
        ...this.player.getOwnedObjectsByType(ObjectType.Vehicle),
      ]
        .map((u: any) => u.unitOrderTrait.waypointPath)
        .filter(isNotNullOrUndefined),
    );
    this.paths = [...unique].map((path: any) => {
      const wrap = { original: path, units: new Set(path.units), waypoints: [] as any[] };
      path.waypoints.forEach((wp: any) => {
        const node = {
          orderType: wp.orderType,
          target: wp.target,
          next: void 0 as any,
          draft: false,
          terminal: wp.terminal,
          original: wp,
        };
        if (wrap.waypoints.length) {
          wrap.waypoints[wrap.waypoints.length - 1].next = node;
        }
        wrap.waypoints.push(node);
      });
      return wrap;
    });
    this.waypointLines = new WaypointLinesCtor(
      this.unitSelection,
      this.player,
      this.selectedPaths,
      this.paths,
      this.worldScene.camera,
    );
    this.worldScene.add(this.waypointLines);
  }

  /**
   * 追加规划指令（含大量非法校验）。
   * @param orderType 指令
   * @param target 目标
   * @param terminal 是否终点
   */
  pushOrder(orderType: any, target: any, terminal: boolean): void {
    if (orderType === OrderType.Deploy) {
      this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoDeploy"));
      return;
    }
    if (this.selectedPaths.length > 1) {
      this.handleInvalidCommand(this.strings.get("MSG:PlanningModeHeteroSel"));
      return;
    }
    if (this.selectedUnits.size > ORDER_UNIT_LIMIT) {
      this.handleInvalidCommand(this.strings.get("MSG:PlannerMaximum"));
      return;
    }
    for (const unit of this.selectedUnits) {
      if (unit.isBuilding()) {
        this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoBuildings"));
        return;
      }
      if (unit.isAircraft()) {
        this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoAircraft"));
        return;
      }
    }
    let path = this.selectedPaths[0];
    if (!path && this.selectedUnits.size) {
      path = { original: void 0, units: new Set(this.selectedUnits), waypoints: [] };
      this.paths.push(path);
      this.selectedPaths.push(path);
    }
    if (!path) return;
    if (path.waypoints.length !== this.maxWaypointPathLength) {
      if (path.waypoints.find((w: any) => w.target.equals(target))) {
        this.handleInvalidCommand(this.strings.get("MSG:PlanningModeInvalidNodeX"));
        return;
      }
      const hasTerminal = path.waypoints.length
        ? path.waypoints
            .slice(path.waypoints[0].draft ? 0 : 1)
            .find((w: any) => w.terminal)
        : undefined;
      if (hasTerminal) {
        this.handleInvalidCommand(this.strings.get("MSG:PostTerminatingCommand"));
        return;
      }
      const node = {
        orderType,
        target,
        terminal,
        next: void 0 as any,
        draft: true,
        original: void 0,
      };
      if (path.waypoints.length) {
        path.waypoints[path.waypoints.length - 1].next = node;
      }
      path.waypoints.push(node);
      if (terminal) {
        this.handleInvalidCommand(this.strings.get("MSG:PostTerminatingCommand"));
        this.unitSelectionHandler.deselectAll();
      } else {
        this.sound.play(SoundKey.AddPlanningModeCommandSound, ChannelType.Ui);
      }
    } else {
      this.handleInvalidCommand(this.strings.get("MSG:NodeMaximum"));
    }
  }

  /** 退出：只保留 draft 节点。 */
  exit(): any[] {
    const paths = this.paths;
    if (this.active) {
      if (this.targetLines.get3DObject()) {
        this.targetLines.get3DObject().visible = true;
      }
      this.renderer.onFrame.unsubscribe(this.onFrame);
      this.active = false;
      this.paths = [];
      this.selectedPaths = [];
      this.selectedUnits.clear();
      if (this.waypointLines) {
        this.worldScene.remove(this.waypointLines);
        this.waypointLines.dispose();
        this.waypointLines = void 0;
      }
    }
    for (const path of paths) {
      path.waypoints = path.waypoints.filter((w: any) => w.draft);
    }
    return paths.filter((p) => p.waypoints.length);
  }

  /** 同步原路径变更并清理空路径。 */
  updatePaths(): void {
    for (const path of [...this.paths]) {
      if (!path.original) continue;
      if (
        path.original.units.length !== path.units.size &&
        !path.waypoints.find((w: any) => w.draft)
      ) {
        path.units = new Set(path.original.units);
      }
      if (path.original.units.length === 0) {
        path.waypoints = path.waypoints.filter((w: any) => w.draft);
      } else {
        path.waypoints = path.waypoints.filter(
          (w: any) => w.draft || path.original.waypoints.includes(w.original),
        );
      }
      if (!path.waypoints.length) {
        this.paths.splice(this.paths.indexOf(path), 1);
        const selIdx = this.selectedPaths.indexOf(path);
        if (selIdx !== -1) this.selectedPaths.splice(selIdx, 1);
      }
    }
  }

  /**
   * 根据单位选择更新路径选中；返回展开后的单位列表（若数量变化）。
   * @param units 选中单位
   */
  updateSelection(units: Iterable<any>): any[] | undefined {
    this.updatePaths();
    const list = [...units];
    const related = new Set<any>();
    for (const unit of units) {
      for (const path of this.paths) {
        if (path.units.has(unit)) {
          related.add(path);
          list.push(...path.units);
        }
      }
    }
    this.selectedPaths.length = 0;
    this.selectedPaths.push(...related);
    this.selectedUnits = new Set(list);
    if (this.selectedUnits.size !== (units as any[]).length) {
      return [...this.selectedUnits];
    }
    return void 0;
  }

  /**
   * 非法指令反馈。
   * @param message 文本
   */
  handleInvalidCommand(message: string): void {
    this.sound.play(SoundKey.ScoldSound, ChannelType.Ui);
    this.messageList.addUiFeedbackMessage(message);
  }

  /** 释放=exit。 */
  dispose(): void {
    this.exit();
  }
}
