/**
 * CombatantUi — 参战方 UI：放置/买卖/规划/键位/HUD 事件与 action 入队。
 *
 * 由 gui/screen/game/CombatantUi.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生
import { PlacementMode } from "gui/screen/game/worldInteraction/PlacementMode"; // 已转换
import { ActionType } from "game/action/ActionType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { OrderType } from "game/order/OrderType"; // 已转换
import { OrderUnitsAction } from "game/action/OrderUnitsAction"; // 已转换
import { KeyCommandType } from "gui/screen/game/worldInteraction/keyboard/KeyCommandType"; // 已转换
import { MapPanningHelper } from "engine/util/MapPanningHelper"; // 已转换
import { SelectGroupCmd } from "gui/screen/game/worldInteraction/keyboard/command/SelectGroupCmd"; // 已转换
import { CenterGroupCmd } from "gui/screen/game/worldInteraction/keyboard/command/CenterGroupCmd"; // 已转换
import {
  SidebarCategory,
  SidebarItemTargetType,
} from "gui/screen/game/component/hud/viewmodel/SidebarModel"; // 已转换
import { EventType } from "game/event/EventType"; // 已转换
import { SellMode } from "gui/screen/game/worldInteraction/SellMode"; // 已转换
import { LastRadarEventCmd } from "gui/screen/game/worldInteraction/keyboard/command/LastRadarEventCmd"; // 已转换
import * as ProductionQueueModule from "game/player/production/ProductionQueue"; // 孪生
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import * as UpdateQueueActionModule from "game/action/UpdateQueueAction"; // 孪生
import { RepairMode } from "gui/screen/game/worldInteraction/RepairMode"; // 已转换
import { TriggerMode } from "gui/screen/game/worldInteraction/keyboard/KeyCommand"; // 已转换
import { PlanningMode } from "gui/screen/game/worldInteraction/PlanningMode"; // 已转换
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换
import { SelectNextUnitCmd } from "gui/screen/game/worldInteraction/keyboard/command/SelectNextUnitCmd"; // 已转换
import { SetCameraLocationCmd } from "gui/screen/game/worldInteraction/keyboard/command/SetCameraLocationCmd"; // 已转换
import { GoToCameraLocationCmd } from "gui/screen/game/worldInteraction/keyboard/command/GoToCameraLocationCmd"; // 已转换
import { SpecialActionMode } from "gui/screen/game/worldInteraction/SpecialActionMode"; // 已转换
import * as SuperWeaponModule from "game/SuperWeapon"; // 孪生
import { CenterViewCmd } from "gui/screen/game/worldInteraction/keyboard/command/CenterViewCmd"; // 已转换
import { FollowUnitCmd } from "gui/screen/game/worldInteraction/keyboard/command/FollowUnitCmd"; // 已转换
import { PendingPlacementHandler } from "gui/screen/game/worldInteraction/PendingPlacementHandler"; // 已转换
import { CommandBarButtonType } from "gui/screen/game/component/hud/commandBar/CommandBarButtonType"; // 已转换
import { BeaconMode } from "gui/screen/game/worldInteraction/BeaconMode"; // 已转换
import * as ReportBugModule from "gui/screen/mainMenu/main/ReportBug"; // 孪生
import { CenterBaseCmd } from "gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd"; // 已转换
import { SelectByTypeCmd } from "gui/screen/game/worldInteraction/keyboard/command/SelectTypeByCmd"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const React: any = (ReactModule as any).default ?? ReactModule;
const QueueStatus: any = (ProductionQueueModule as any).QueueStatus;
const UpdateType: any = (UpdateQueueActionModule as any).UpdateType;
const SuperWeaponStatus: any = (SuperWeaponModule as any).SuperWeaponStatus;
const ReportBug: any = (ReportBugModule as any).ReportBug;

/** 参战方 UI。 */
export class CombatantUi {
  /** 游戏。 */
  game: any;
  /** 玩家。 */
  player: any;
  /** 是否单机。 */
  isSinglePlayer: any;
  /** action 队列。 */
  actionQueue: any;
  /** action 工厂。 */
  actionFactory: any;
  /** 侧栏模型。 */
  sidebarModel: any;
  /** 渲染器。 */
  renderer: any;
  /** 世界场景。 */
  worldScene: any;
  /** 音效处理器。 */
  soundHandler: any;
  /** 消息列表。 */
  messageList: any;
  /** 音效。 */
  sound: any;
  /** EVA。 */
  eva: any;
  /** 世界交互工厂。 */
  worldInteractionFactory: any;
  /** 菜单。 */
  gameMenu: any;
  /** 指针。 */
  pointer: any;
  /** 运行时开关。 */
  runtimeVars: any;
  /** 速度作弊。 */
  speedCheat: any;
  /** 字符串。 */
  strings: any;
  /** taunt 处理。 */
  tauntHandler: any;
  /** 渲染件管理。 */
  renderableManager: any;
  /** 超武 FX。 */
  superWeaponFxHandler: any;
  /** 信标 FX。 */
  beaconFxHandler: any;
  /** 消息框。 */
  messageBoxApi: any;
  /** Discord URL。 */
  discordUrl: any;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 放置模式。 */
  placementMode: any;
  /** 待放置。 */
  pendingPlacement: any;
  /** 出售模式。 */
  sellMode: any;
  /** 维修模式。 */
  repairMode: any;
  /** 信标模式。 */
  beaconMode: any;
  /** 世界交互。 */
  worldInteraction: any;
  /** 规划模式。 */
  planningMode: any;
  /** 超武模式。 */
  specialMode: any;
  /** 上次选择哈希。 */
  lastSelectionHash: any;
  /** 规划入门提示已显。 */
  planningIntroShown = false;

  /**
   * @param game 游戏
   * @param player 玩家
   * @param isSinglePlayer 单机
   * @param actionQueue action 队列
   * @param actionFactory action 工厂
   * @param sidebarModel 侧栏
   * @param renderer 渲染器
   * @param worldScene 场景
   * @param soundHandler 音效
   * @param messageList 消息
   * @param sound 音效
   * @param eva EVA
   * @param worldInteractionFactory 交互工厂
   * @param gameMenu 菜单
   * @param pointer 指针
   * @param runtimeVars 运行时
   * @param speedCheat 速度作弊
   * @param strings 字符串
   * @param tauntHandler taunt
   * @param renderableManager 渲染件
   * @param superWeaponFxHandler 超武 FX
   * @param beaconFxHandler 信标 FX
   * @param messageBoxApi 消息框
   * @param discordUrl Discord
   */
  constructor(
    game: any,
    player: any,
    isSinglePlayer: any,
    actionQueue: any,
    actionFactory: any,
    sidebarModel: any,
    renderer: any,
    worldScene: any,
    soundHandler: any,
    messageList: any,
    sound: any,
    eva: any,
    worldInteractionFactory: any,
    gameMenu: any,
    pointer: any,
    runtimeVars: any,
    speedCheat: any,
    strings: any,
    tauntHandler: any,
    renderableManager: any,
    superWeaponFxHandler: any,
    beaconFxHandler: any,
    messageBoxApi: any,
    discordUrl: any,
  ) {
    this.game = game;
    this.player = player;
    this.isSinglePlayer = isSinglePlayer;
    this.actionQueue = actionQueue;
    this.actionFactory = actionFactory;
    this.sidebarModel = sidebarModel;
    this.renderer = renderer;
    this.worldScene = worldScene;
    this.soundHandler = soundHandler;
    this.messageList = messageList;
    this.sound = sound;
    this.eva = eva;
    this.worldInteractionFactory = worldInteractionFactory;
    this.gameMenu = gameMenu;
    this.pointer = pointer;
    this.runtimeVars = runtimeVars;
    this.speedCheat = speedCheat;
    this.strings = strings;
    this.tauntHandler = tauntHandler;
    this.renderableManager = renderableManager;
    this.superWeaponFxHandler = superWeaponFxHandler;
    this.beaconFxHandler = beaconFxHandler;
    this.messageBoxApi = messageBoxApi;
    this.discordUrl = discordUrl;
    this.disposables = new CompositeDisposable();
  }

  /**
   * 初始化交互与事件。
   * @param hud HUD
   */
  init(hud: any): void {
    const selection = this.game.getUnitSelection();
    const placement = PlacementMode.factory(
      this.game,
      this.player,
      this.renderer,
      this.worldScene,
      this.eva,
    );
    this.placementMode = placement;
    this.disposables.add(placement);
    const pending = PendingPlacementHandler.factory(
      this.game,
      this.player,
      this.renderer,
      this.worldScene,
    );
    pending.init();
    this.disposables.add(pending);
    placement.onBuildingPlaceRequest.subscribe(({ rules, tile }: any) => {
      pending.pushPlacementInfo({ rules, tile });
      this.pushAction(ActionType.PlaceBuilding, (a: any) => {
        a.buildingRules = rules;
        a.tile = { x: tile.rx, y: tile.ry };
      });
    });
    const sell = SellMode.factory(
      this.game,
      this.player,
      this.sidebarModel,
      this.pointer,
      this.renderer,
    );
    this.sellMode = sell;
    this.disposables.add(sell);
    sell.onExecute.subscribe((obj: any) => {
      this.pushAction(ActionType.SellObject, (a: any) => {
        a.objectId = obj.id;
      });
    });
    const repair = RepairMode.factory(
      this.game,
      this.player,
      this.sidebarModel,
      this.pointer,
      this.renderer,
    );
    this.repairMode = repair;
    this.disposables.add(repair);
    const beacon = BeaconMode.factory(this.pointer, this.renderer);
    this.beaconMode = beacon;
    this.disposables.add(beacon);
    repair.onExecute.subscribe((b: any) => {
      this.pushAction(ActionType.ToggleRepair, (a: any) => {
        a.buildingId = b.id;
      });
      this.sound.play(SoundKey.GenericClick, ChannelType.Ui);
    });
    beacon.onExecute.subscribe((tile: any) => this.handleBeacon(tile));
    const interaction = this.worldInteractionFactory.create();
    this.worldInteraction = interaction;
    interaction.init();
    this.disposables.add(interaction);
    const planning = new PlanningMode(
      this.player,
      this.messageList,
      this.sound,
      this.strings,
      this.worldScene,
      selection,
      interaction.unitSelectionHandler,
      this.renderer,
      interaction.targetLines,
      this.game.rules.general.maxWaypointPathLength,
    );
    this.planningMode = planning;
    this.disposables.add(planning);
    this.disposables.add(() => this.specialMode?.dispose());
    placement.init();
    this.initKeyboardCommands(interaction);
    this.initGameEventListeners();
    this.initGameMenuListeners();
    this.initHudEventListeners(hud, sell, repair, beacon, interaction);
    this.lastSelectionHash = selection.getHash();
    interaction.unitSelectionHandler.onUserSelectionChange.subscribe((e: any) => {
      if (planning.isActive()) {
        const expanded = planning.updateSelection(e.selection);
        if (expanded) {
          for (const u of expanded) selection.addToSelection(u);
        }
      }
      this.lastSelectionHash = selection.getHash();
      this.pushAction(ActionType.SelectUnits, (a: any) => {
        a.unitIds = selection.getSelectedUnits().map((u: any) => u.id);
      });
    });
    interaction.unitSelectionHandler.onUserSelectionUpdate.subscribe((e: any) =>
      this.soundHandler.handleSelectionChangeEvent(e),
    );
    interaction.defaultActionHandler.onOrder.subscribe(
      ({ orderType, terminal, feedbackType, feedbackUnit, target }: any) => {
        if (planning.isActive()) planning.pushOrder(orderType, target, terminal);
        else this.pushOrder(orderType, target, feedbackType, feedbackUnit);
      },
    );
  }

  /**
   * HUD 更换时重绑。
   * @param hud 新 HUD
   */
  handleHudChange(hud: any): void {
    if (!this.worldInteraction) return;
    this.initHudEventListeners(
      hud,
      this.sellMode,
      this.repairMode,
      this.beaconMode,
      this.worldInteraction,
    );
  }

  /** 释放。 */
  dispose(): void {
    this.disposables.dispose();
  }

  /** 可用对象/超武/电力事件。 */
  initGameEventListeners(): void {
    const onObject = (obj: any) => {
      if (!obj.isTechno() || obj.owner !== this.player) return;
      if (
        obj.isBuilding() ||
        Number.isFinite(obj.rules.buildLimit) ||
        (obj.isVehicle() && obj.transportTrait) ||
        this.game.rules.general.padAircraft.includes(obj.name)
      ) {
        this.sidebarModel.updateAvailableObjects(this.game.art);
        this.soundHandler.handleAvailableObjectsUpdate(
          this.player.production.getAvailableObjects(),
        );
      }
    };
    const world = this.game.getWorld();
    this.sidebarModel.updateAvailableObjects(this.game.art);
    world.onObjectSpawned.subscribe(onObject);
    world.onObjectRemoved.subscribe(onObject);
    this.disposables.add(
      () => world.onObjectSpawned.unsubscribe(onObject),
      () => world.onObjectRemoved.unsubscribe(onObject),
    );
    this.disposables.add(
      this.game.events.subscribe(EventType.BuildingInfiltration, (e: any) => {
        if (e.source.owner === this.player) {
          this.sidebarModel.updateAvailableObjects(this.game.art);
        }
      }),
    );
    this.disposables.add(
      this.game.events.subscribe(EventType.ObjectOwnerChange, (e: any) => {
        if (!e.target.isBuilding()) return;
        if (e.prevOwner !== this.player && e.target.owner !== this.player) return;
        this.sidebarModel.updateAvailableObjects(this.game.art);
        this.soundHandler.handleAvailableObjectsUpdate(
          this.player.production.getAvailableObjects(),
        );
      }),
    );
    // rebuild the sidebar when a building is destroyed. LeaveRubble
    // buildings (e.g. the Secret Lab CASLAB) keep their game object on the map as
    // a rubble blocker after being destroyed, so the world-level onObjectRemoved
    // never fires and without this the sidebar would keep showing a Secret Lab
    // bonus that is no longer buildable.
    this.disposables.add(
      this.game.events.subscribe(EventType.ObjectDestroy, (e: any) => {
        if (e.target.isBuilding() && e.target.owner === this.player) {
          this.sidebarModel.updateAvailableObjects(this.game.art);
          this.soundHandler.handleAvailableObjectsUpdate(
            this.player.production.getAvailableObjects(),
          );
        }
      }),
    );
    this.player.production.onQueueUpdate.subscribe((queue: any) => {
      this.sidebarModel.updateFromQueue(queue);
      const building = this.placementMode.getBuilding();
      if (building && !this.player.production.getQueueForObject(building).find(building).length) {
        this.worldInteraction.setMode(void 0);
      }
      this.soundHandler.handleProductionQueueUpdate(queue);
    });
    const onSw = () => {
      this.sidebarModel.updateSuperWeapons();
      if (
        this.specialMode &&
        this.worldInteraction.getMode() === this.specialMode &&
        !this.player.superWeaponsTrait
          .getAll()
          .find((sw: any) => sw.rules.type === this.specialMode.superWeaponType)
      ) {
        this.worldInteraction.setMode(void 0);
        this.specialMode.dispose();
        this.specialMode = void 0;
      }
    };
    this.renderer.onFrame.subscribe(onSw);
    this.disposables.add(() => this.renderer.onFrame.unsubscribe(onSw));
    this.disposables.add(
      this.game.events.subscribe((e: any) => {
        if (e.type === EventType.PowerChange && e.target === this.player) {
          this.sidebarModel.powerGenerated = e.power;
          this.sidebarModel.powerDrained = e.drain;
        }
      }),
    );
  }

  /** 联盟切换入 action。 */
  initGameMenuListeners(): void {
    const onToggle = (toggle: any, toPlayer: any) => {
      this.pushAction(ActionType.ToggleAlliance, (a: any) => {
        a.toPlayer = toPlayer;
        a.toggle = toggle;
      });
    };
    this.gameMenu.onToggleAlliance.subscribe(onToggle);
    this.disposables.add(() => this.gameMenu.onToggleAlliance.unsubscribe(onToggle));
  }

  /**
   * HUD 按钮与命令栏。
   * @param hud HUD
   * @param sell 出售模式
   * @param repair 维修模式
   * @param beacon 信标模式
   * @param interaction 世界交互
   */
  initHudEventListeners(hud: any, sell: any, repair: any, beacon: any, interaction: any): void {
    hud.onSidebarSlotClick.subscribe((e: any) => this.handleSidebarSlotClick(e));
    hud.onSidebarTabClick.subscribe(() => {
      this.sound.play(SoundKey.GUITabSound, ChannelType.Ui);
    });
    hud.onRepairButtonClick.subscribe(() => {
      if (!interaction.isEnabled()) return;
      if (this.sidebarModel.repairMode) interaction.setMode(void 0);
      else interaction.setMode(repair);
      this.sound.play(SoundKey.GenericClick, ChannelType.Ui);
    });
    hud.onSellButtonClick.subscribe(() => {
      if (!interaction.isEnabled()) return;
      if (this.sidebarModel.sellMode) interaction.setMode(void 0);
      else interaction.setMode(sell);
      this.sound.play(SoundKey.GenericClick, ChannelType.Ui);
    });
    const creditTicks = this.game.rules.audioVisual.creditTicks;
    hud.onCreditsTick.subscribe((dir: string) => {
      this.sound.play(dir === "up" ? creditTicks[0] : creditTicks[1], ChannelType.CreditTicks);
    });
    hud.onMessagesTick.subscribe(() => {
      this.sound.play(SoundKey.MessageCharTyped, ChannelType.Ui);
    });
    hud.onScrollButtonClick.subscribe((ok: boolean) => {
      this.sound.play(ok ? SoundKey.GenericClick : SoundKey.ScoldSound, ChannelType.Ui);
    });
    let planningTipShown = this.planningIntroShown;
    const selection = interaction.unitSelectionHandler;
    hud.onCommandBarButtonClick.subscribe((type: any) => {
      switch (type) {
        case CommandBarButtonType.BugReport:
          if (!this.discordUrl) break;
          this.gameMenu.open();
          this.messageBoxApi.show(
            React.createElement(ReportBug, {
              discordUrl: this.discordUrl,
              strings: this.strings,
            }),
            this.strings.get("GUI:OK"),
          );
          break;
        case CommandBarButtonType.Beacon:
          if (interaction.getMode() !== beacon) interaction.setMode(beacon);
          break;
        case CommandBarButtonType.Cheer:
          this.pushOrder(OrderType.Cheer, void 0);
          break;
        case CommandBarButtonType.Deploy:
          this.handleDeploy();
          break;
        case CommandBarButtonType.Guard:
          this.handleGuard();
          break;
        case CommandBarButtonType.PlanningMode:
          if (this.planningMode.isActive()) {
            const paths = this.planningMode.exit();
            this.sound.play(SoundKey.EndPlanningModeSound, ChannelType.Ui);
            this.queueOrders(paths);
            if (!planningTipShown) {
              this.messageList.addUiFeedbackMessage(
                this.strings.get("MSG:PlanningModeIntro3"),
              );
              planningTipShown = true;
            }
          } else {
            this.planningMode.enter();
            this.planningMode.updateSelection(
              interaction.unitSelectionHandler.getSelectedUnits(),
            );
            this.sound.play(SoundKey.StartPlanningModeSound, ChannelType.Ui);
            if (!planningTipShown) {
              this.messageList.addUiFeedbackMessage(
                this.strings.get("MSG:PlanningModeIntro1Button"),
              );
            }
          }
          break;
        case CommandBarButtonType.Stop:
          this.handleStop();
          break;
        case CommandBarButtonType.Team01:
          this.handleCommandBarTeam(1, selection);
          break;
        case CommandBarButtonType.Team02:
          this.handleCommandBarTeam(2, selection);
          break;
        case CommandBarButtonType.Team03:
          this.handleCommandBarTeam(3, selection);
          break;
        case CommandBarButtonType.TypeSelect:
          selection.selectByType();
          break;
        default:
          console.warn("Unhandled command type " + type);
      }
    });
    this.planningIntroShown = planningTipShown;
  }

  /**
   * 侧栏槽点击：生产/放置/出售队列。
   * @param raw 原始事件
   */
  handleSidebarSlotClick(raw: any): void {
    if (!this.worldInteraction.isEnabled()) return;
    const event =
      raw.isTouch && raw.button === 0 && raw.touchDuration && raw.touchDuration > 300
        ? { ...raw, shiftKey: true, button: 2 }
        : raw;
    if (event.target.type !== SidebarItemTargetType.Special) {
      const rules = event.target.rules;
      const queue = this.player.production.getQueueForObject(rules);
      const entries = queue.find(rules);
      const total = entries.reduce((sum: number, e: any) => sum + e.quantity, 0);
      let failClick = false;
      if (event.button === 0) {
        if (queue.status === QueueStatus.Ready && rules.type === ObjectType.Building) {
          if (entries[0] === queue.getFirst()) {
            this.placementMode.setBuilding(rules);
            this.worldInteraction.setMode(this.placementMode);
          } else {
            this.eva.play("EVA_UnableToComply");
          }
        } else if (queue.status === QueueStatus.OnHold && entries[0] === queue.getFirst()) {
          this.pushAction(ActionType.UpdateQueue, (a: any) => {
            a.queueType = queue.type;
            a.updateType = UpdateType.Resume;
          });
        } else {
          const room = Math.min(
            queue.maxSize - queue.currentSize,
            queue.maxItemQuantity - total,
          );
          const add = Math.min(event.shiftKey ? 5 : 1, room);
          if (add <= 0) {
            if (rules.type === ObjectType.Building) {
              this.eva.play("EVA_UnableToComply");
            } else {
              failClick = true;
              this.sound.play(SoundKey.ScoldSound, ChannelType.Ui);
            }
          } else {
            const insertNext =
              this.worldInteraction.getLastKeyModifiers()?.ctrlKey ?? false;
            this.pushAction(ActionType.UpdateQueue, (a: any) => {
              a.queueType = queue.type;
              a.updateType = insertNext ? UpdateType.AddNext : UpdateType.Add;
              a.item = rules;
              a.quantity = add;
            });
          }
        }
      } else {
        // 孪生：button≠0/2（中键等）在 GenericClick 前直接 return
        if (event.button !== 2) return;
        if (queue.status === QueueStatus.Active && entries[0] === queue.getFirst()) {
          this.pushAction(ActionType.UpdateQueue, (a: any) => {
            a.queueType = queue.type;
            a.updateType = UpdateType.Pause;
          });
        } else if (
          entries.length &&
          [QueueStatus.Ready, QueueStatus.OnHold, QueueStatus.Active].includes(queue.status)
        ) {
          const cancel = Math.min(
            total,
            event.shiftKey ? Number.POSITIVE_INFINITY : 1,
          );
          if (cancel > 0) {
            this.pushAction(ActionType.UpdateQueue, (a: any) => {
              a.queueType = queue.type;
              a.updateType = UpdateType.Cancel;
              a.item = rules;
              a.quantity = cancel;
            });
            this.eva.play("EVA_Canceled");
          }
        } else {
          failClick = true;
        }
      }
      if (!failClick) this.sound.play(SoundKey.GenericClick, ChannelType.Ui);
    } else if (event.button === 0) {
      this.sound.play(SoundKey.GenericClick, ChannelType.Ui);
      const ready =
        this.player.superWeaponsTrait
          ?.getAll()
          .find((sw: any) => sw.rules === event.target.rules)?.status ===
        SuperWeaponStatus.Ready;
      if (!ready) return;
      if (event.target.rules.type !== void 0) {
        this.activateSpecialMode(event.target.rules);
      }
    }
  }

  /**
   * 下发单位指令 action。
   * @param orderType 指令
   * @param target 目标
   * @param feedbackType 反馈
   * @param feedbackUnit 反馈单位
   */
  pushOrder(orderType: any, target: any, feedbackType = OrderFeedbackType.None, feedbackUnit?: any): void {
    const selection = this.game.getUnitSelection();
    const hash = selection.getHash();
    const units = selection.getSelectedUnits();
    const last = this.actionQueue.getLast();
    if (
      last &&
      last instanceof OrderUnitsAction &&
      last.orderType === orderType &&
      !last.queue &&
      hash === this.lastSelectionHash
    ) {
      if (!last.target || !target || last.target.equals(target)) return;
      this.actionQueue.dequeueLast();
    }
    if (hash !== this.lastSelectionHash) {
      this.lastSelectionHash = hash;
      this.pushAction(ActionType.SelectUnits, (a: any) => {
        a.unitIds = units.map((u: any) => u.id);
      });
    }
    this.pushAction(ActionType.OrderUnits, (a: any) => {
      a.orderType = orderType;
      a.target = target;
    });
    this.soundHandler.handleOrderPushed(feedbackUnit || units[0], orderType, feedbackType);
  }

  /**
   * 批量规划路径入队。
   * @param paths 路径
   */
  queueOrders(paths: any[]): void {
    if (!paths.length) return;
    for (const path of paths) {
      this.pushAction(ActionType.SelectUnits, (a: any) => {
        a.unitIds = [...path.units].map((u: any) => u.id);
      });
      for (const wp of path.waypoints) {
        this.pushAction(ActionType.OrderUnits, (a: any) => {
          a.orderType = wp.orderType;
          a.target = wp.target;
          a.queue = true;
        });
      }
    }
    this.pushAction(ActionType.SelectUnits, (a: any) => {
      a.unitIds = this.worldInteraction.unitSelectionHandler
        .getSelectedUnits()
        .map((u: any) => u.id);
    });
  }

  /**
   * 创建并入队 action。
   * @param type ActionType
   * @param mut 突变
   */
  pushAction(type: any, mut?: (a: any) => void): void {
    const action = this.actionFactory.create(type);
    mut?.(action);
    this.actionQueue.push(action);
  }

  /**
   * 激活超武目标模式。
   * @param rules 超武规则
   */
  activateSpecialMode(rules: any): void {
    this.specialMode?.dispose();
    const mode = (this.specialMode = SpecialActionMode.factory(
      this.game.rules.superWeaponRules,
      rules,
      this.superWeaponFxHandler,
      this.pointer,
      this.eva,
      this.player,
    ));
    mode.onExecute.subscribe(({ tile, tile2 }: any) => {
      this.pushAction(ActionType.ActivateSuperWeapon, (a: any) => {
        a.superWeaponType = rules.type;
        a.tile = { x: tile.rx, y: tile.ry };
        if (tile2) a.tile2 = { x: tile2.rx, y: tile2.ry };
      });
    });
    this.worldInteraction.setMode(mode);
  }

  /**
   * 注册参战方键位。
   * @param interaction 世界交互
   */
  initKeyboardCommands(interaction: any): void {
    const selection = interaction.unitSelectionHandler;
    const typeSelect = new SelectByTypeCmd(selection);
    typeSelect.init();
    this.disposables.add(typeSelect);
    interaction
      .registerKeyCommand(KeyCommandType.Options, () => this.gameMenu.open())
      .registerKeyCommand(KeyCommandType.Scoreboard, () => this.gameMenu.openDiplo())
      .registerKeyCommand(KeyCommandType.DeployObject, () => this.handleDeploy())
      .registerKeyCommand(KeyCommandType.UnloadGarrison, () => this.handleUnloadAll())
      .registerKeyCommand(KeyCommandType.StopObject, () => this.handleStop())
      .registerKeyCommand(KeyCommandType.GuardObject, () => this.handleGuard())
      .registerKeyCommand(KeyCommandType.AllToCheer, () =>
        this.pushOrder(OrderType.Cheer, void 0),
      )
      .registerKeyCommand(KeyCommandType.TypeSelect, typeSelect)
      .registerKeyCommand(KeyCommandType.CombatantSelect, () => selection.selectCombatants())
      .registerKeyCommand(KeyCommandType.VeterancyNav, () => selection.selectByVeterancy())
      .registerKeyCommand(KeyCommandType.HealthNav, () => selection.selectByHealth());
    ([
      KeyCommandType.TeamCreate_1,
      KeyCommandType.TeamCreate_2,
      KeyCommandType.TeamCreate_3,
      KeyCommandType.TeamCreate_4,
      KeyCommandType.TeamCreate_5,
      KeyCommandType.TeamCreate_6,
      KeyCommandType.TeamCreate_7,
      KeyCommandType.TeamCreate_8,
      KeyCommandType.TeamCreate_9,
      KeyCommandType.TeamCreate_10,
    ] as string[]).forEach((cmd, idx) =>
      interaction.registerKeyCommand(cmd, () => selection.createGroup((idx + 1) % 10)),
    );
    ([
      KeyCommandType.TeamAddSelect_1,
      KeyCommandType.TeamAddSelect_2,
      KeyCommandType.TeamAddSelect_3,
      KeyCommandType.TeamAddSelect_4,
      KeyCommandType.TeamAddSelect_5,
      KeyCommandType.TeamAddSelect_6,
      KeyCommandType.TeamAddSelect_7,
      KeyCommandType.TeamAddSelect_8,
      KeyCommandType.TeamAddSelect_9,
      KeyCommandType.TeamAddSelect_10,
    ] as string[]).forEach((cmd, idx) =>
      interaction.registerKeyCommand(cmd, () =>
        selection.addGroupToSelection((idx + 1) % 10),
      ),
    );
    const panning = new MapPanningHelper(this.game.map);
    ([
      KeyCommandType.TeamSelect_1,
      KeyCommandType.TeamSelect_2,
      KeyCommandType.TeamSelect_3,
      KeyCommandType.TeamSelect_4,
      KeyCommandType.TeamSelect_5,
      KeyCommandType.TeamSelect_6,
      KeyCommandType.TeamSelect_7,
      KeyCommandType.TeamSelect_8,
      KeyCommandType.TeamSelect_9,
      KeyCommandType.TeamSelect_10,
    ] as string[]).forEach((cmd, idx) =>
      interaction.registerKeyCommand(
        cmd,
        new SelectGroupCmd(
          (idx + 1) % 10,
          selection,
          interaction.targetLines,
          panning,
          this.worldScene.cameraPan,
        ),
      ),
    );
    ([
      KeyCommandType.TeamCenter_1,
      KeyCommandType.TeamCenter_2,
      KeyCommandType.TeamCenter_3,
      KeyCommandType.TeamCenter_4,
      KeyCommandType.TeamCenter_5,
      KeyCommandType.TeamCenter_6,
      KeyCommandType.TeamCenter_7,
      KeyCommandType.TeamCenter_8,
      KeyCommandType.TeamCenter_9,
      KeyCommandType.TeamCenter_10,
    ] as string[]).forEach((cmd, idx) =>
      interaction.registerKeyCommand(
        cmd,
        new CenterGroupCmd(
          (idx + 1) % 10,
          selection,
          panning,
          this.worldScene.cameraPan,
        ),
      ),
    );
    new Map<string, any>([
      [KeyCommandType.StructureTab, SidebarCategory.Structures],
      [KeyCommandType.DefenseTab, SidebarCategory.Armory],
      [KeyCommandType.InfantryTab, SidebarCategory.Infantry],
      [KeyCommandType.UnitTab, SidebarCategory.Vehicles],
    ]).forEach((category, cmd) => {
      interaction.registerKeyCommand(cmd, () => {
        this.sidebarModel.selectTab(category);
        for (const queue of this.player.production
          .getAllQueues()
          .filter((q: any) => q.status === QueueStatus.Ready)) {
          const tab = this.sidebarModel.getTabForQueueType(queue.type);
          if (category === tab.id && queue.getFirst().rules.type === ObjectType.Building) {
            this.placementMode.setBuilding(queue.getFirst().rules);
            interaction.setMode(this.placementMode);
            break;
          }
        }
      });
    });
    interaction.registerKeyCommand(
      KeyCommandType.CenterBase,
      new CenterBaseCmd(this.player, this.game.rules, panning, this.worldScene.cameraPan),
    );
    interaction.registerKeyCommand(KeyCommandType.ToggleSell, () => {
      if (this.sidebarModel.sellMode) interaction.setMode(void 0);
      else interaction.setMode(this.sellMode);
    });
    interaction.registerKeyCommand(KeyCommandType.ToggleRepair, () => {
      if (this.sidebarModel.repairMode) interaction.setMode(void 0);
      else interaction.setMode(this.repairMode);
    });
    const radar = new LastRadarEventCmd(this.player, panning, this.worldScene.cameraPan);
    interaction.registerKeyCommand(KeyCommandType.CenterOnRadarEvent, radar);
    this.disposables.add(this.game.events.subscribe((e: any) => radar.handleGameEvent(e)));
    const syncCheats = () => {
      if (this.runtimeVars.cheatsEnabled.value) {
        interaction
          .registerKeyCommand(KeyCommandType.BuildCheat, () =>
            (this.speedCheat.value = !this.speedCheat.value),
          )
          .registerKeyCommand(KeyCommandType.FreeMoney, () => (this.player.credits += 1e4))
          .registerKeyCommand(KeyCommandType.ToggleShroud, () =>
            this.game.mapShroudTrait.revealMap(this.player, this.game),
          );
      } else {
        interaction
          .unregisterKeyCommand(KeyCommandType.BuildCheat)
          .unregisterKeyCommand(KeyCommandType.FreeMoney)
          .unregisterKeyCommand(KeyCommandType.ToggleShroud);
        this.speedCheat.value = false;
      }
    };
    syncCheats();
    this.runtimeVars.cheatsEnabled.onChange.subscribe(syncCheats);
    this.disposables.add(() => this.runtimeVars.cheatsEnabled.onChange.unsubscribe(syncCheats));
    interaction.registerKeyCommand(KeyCommandType.ToggleFps, () =>
      (this.runtimeVars.fps.value = !this.runtimeVars.fps.value),
    );
    interaction.registerKeyCommand(KeyCommandType.ToggleAlliance, () => {
      const settings = this.game.rules.mpDialogSettings;
      if (!settings.alliesAllowed || !settings.allyChangeAllowed) return;
      const other = selection.getSelectedUnits()[0]?.owner;
      if (
        other &&
        other !== this.player &&
        this.game.alliances.canRequestAlliance(other)
      ) {
        this.pushAction(ActionType.ToggleAlliance, (a: any) => {
          a.toPlayer = other;
          a.toggle = !this.game.alliances.areAllied(this.player, other);
        });
      }
    });
    let planningTipShown = false;
    interaction.registerKeyCommand(KeyCommandType.PlanningMode, {
      triggerMode: TriggerMode.KeyDownUp,
      execute: (isKeyUp: boolean) => {
        if (isKeyUp) {
          const paths = this.planningMode.exit();
          this.sound.play(SoundKey.EndPlanningModeSound, ChannelType.Ui);
          this.queueOrders(paths);
          if (!planningTipShown) {
            this.messageList.addUiFeedbackMessage(this.strings.get("MSG:PlanningModeIntro3"));
            planningTipShown = true;
          }
        } else {
          this.planningMode.enter();
          this.planningMode.updateSelection(
            interaction.unitSelectionHandler.getSelectedUnits(),
          );
          this.sound.play(SoundKey.StartPlanningModeSound, ChannelType.Ui);
          if (!planningTipShown) {
            this.messageList.addUiFeedbackMessage(
              this.strings.get("MSG:PlanningModeIntro1Key"),
            );
          }
        }
      },
    });
    interaction.registerKeyCommand(KeyCommandType.ScatterObject, () => {
      if (this.planningMode.isActive()) {
        this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoScatter"));
      } else {
        this.pushOrder(OrderType.Scatter, void 0);
      }
    });
    const next = new SelectNextUnitCmd(
      selection,
      panning,
      this.worldScene.cameraPan,
      this.player,
      this.game.getWorld(),
    );
    interaction.registerKeyCommand(KeyCommandType.NextObject, () => {
      next.setReverse(false);
      next.execute();
    });
    interaction.registerKeyCommand(KeyCommandType.PreviousObject, () => {
      next.setReverse(true);
      next.execute();
    });
    this.disposables.add(next);
    const loc = this.game.map.startingLocations[this.player.startLocation];
    const startTile = this.game.map.tiles.getByMapCoords(loc.x, loc.y);
    const defaultPan = panning.computeCameraPanFromTile(startTile.rx, startTile.ry);
    const locations = new Map();
    ([
      KeyCommandType.SetView1,
      KeyCommandType.SetView2,
      KeyCommandType.SetView3,
      KeyCommandType.SetView4,
    ] as string[]).forEach((cmd, idx) => {
      interaction.registerKeyCommand(
        cmd,
        new SetCameraLocationCmd(this.worldScene.cameraPan, locations, idx - 1),
      );
    });
    ([
      KeyCommandType.View1,
      KeyCommandType.View2,
      KeyCommandType.View3,
      KeyCommandType.View4,
    ] as string[]).forEach((cmd, idx) => {
      interaction.registerKeyCommand(
        cmd,
        new GoToCameraLocationCmd(
          this.worldScene.cameraPan,
          locations,
          idx - 1,
          defaultPan,
        ),
      );
    });
    ([
      KeyCommandType.Taunt_1,
      KeyCommandType.Taunt_2,
      KeyCommandType.Taunt_3,
      KeyCommandType.Taunt_4,
      KeyCommandType.Taunt_5,
      KeyCommandType.Taunt_6,
      KeyCommandType.Taunt_7,
      KeyCommandType.Taunt_8,
    ] as string[]).forEach((cmd, idx) => {
      interaction.registerKeyCommand(cmd, () => this.tauntHandler?.sendTaunt(idx + 1));
    });
    interaction.registerKeyCommand(KeyCommandType.PlaceBeacon, () => {
      if (interaction.getMode() !== this.beaconMode) interaction.setMode(this.beaconMode);
    });
    const center = new CenterViewCmd(selection, panning, this.worldScene.cameraPan);
    interaction.registerKeyCommand(KeyCommandType.CenterView, center);
    const follow = new FollowUnitCmd(
      selection,
      this.renderableManager,
      interaction,
      panning,
      this.worldScene.cameraPan,
      this.worldScene,
    );
    follow.init();
    this.disposables.add(follow);
    interaction.registerKeyCommand(KeyCommandType.Follow, follow);
    const err = () => this.sound.play(SoundKey.SystemError, ChannelType.Ui);
    const unhandled = [KeyCommandType.PageUser, KeyCommandType.ScreenCapture];
    unhandled.forEach((cmd) => interaction.registerKeyCommand(cmd, err));
  }

  /** 部署（规划中拒绝）。 */
  handleDeploy(): void {
    if (this.planningMode.isActive()) {
      this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoDeploy"));
      return;
    }
    this.pushOrder(OrderType.DeploySelected, void 0);
  }

  // Unload all garrisoned infantry from selected bio reactors (LIFO drain).
  /** 全部卸载驻军。 */
  handleUnloadAll(): void {
    if (this.planningMode.isActive()) {
      this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoDeploy"));
      return;
    }
    this.pushOrder(OrderType.UnloadAll, void 0);
  }

  /** 停止。 */
  handleStop(): void {
    if (this.planningMode.isActive()) {
      this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoStop"));
      return;
    }
    this.pushOrder(OrderType.Stop, void 0);
  }

  /** 警戒。 */
  handleGuard(): void {
    if (this.planningMode.isActive()) {
      this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoGuardArea"));
      return;
    }
    this.pushOrder(OrderType.Guard, void 0);
  }

  /**
   * 信标（多人）。
   * @param tile tile
   */
  handleBeacon(tile: any): void {
    if (this.isSinglePlayer) return;
    if (!this.beaconFxHandler.canPingLocation(this.player, tile)) return;
    this.pushAction(ActionType.PingLocation, (a: any) => {
      a.tile = { x: tile.rx, y: tile.ry };
    });
  }

  /**
   * 命令栏编组按钮：选/居中/创建。
   * @param group 组号
   * @param selection 选择处理
   */
  handleCommandBarTeam(group: number, selection: any): void {
    const units = selection.getGroupUnits(group);
    if (units.length) {
      if (selection.getSelectedUnits().some((u: any) => units.includes(u))) {
        const cmd = new CenterGroupCmd(
          group,
          selection,
          new MapPanningHelper(this.game.map),
          this.worldScene.cameraPan,
        );
        cmd.execute();
      } else {
        selection.selectGroup(group);
      }
    } else {
      selection.createGroup(group);
    }
  }

  // [CHEAT] 调试作弊：设置选中单位为一星/三星，供 F10 作弊菜单调用
  // 后续删除作弊功能时，连同 GameScreen.ts.js 中 F10 菜单的对应按钮一起删除
  /**
   * 设置选中单位老兵等级。
   * @param level 等级
   */
  setSelectedVeteranLevel(level: any): void {
    const selection = this.game?.getUnitSelection?.();
    if (!selection) return;
    for (const u of selection.getSelectedUnits()) {
      if (u.veteranTrait) {
        u.veteranTrait.setVeteranLevel(level);
        u.veteranTrait.handlePromotion(u, this.game);
      }
    }
  }
  // [CHEAT] 结束

  /**
   * 非法指令反馈。
   * @param text 文本
   */
  handleInvalidCommand(text: string): void {
    this.sound.play(SoundKey.ScoldSound, ChannelType.Ui);
    this.messageList.addUiFeedbackMessage(text);
  }
}
