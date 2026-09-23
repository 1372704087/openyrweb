/**
 * ObserverUi — 观察者/回放侧栏与键位（切换观察玩家、快捷键绑定）。
 *
 * 由 gui/screen/game/ObserverUi.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { KeyCommandType } from "gui/screen/game/worldInteraction/keyboard/KeyCommandType"; // 已转换
import { MapPanningHelper } from "engine/util/MapPanningHelper"; // 已转换
import { SidebarModel, SidebarCategory } from "gui/screen/game/component/hud/viewmodel/SidebarModel"; // 已转换
import { EventType } from "game/event/EventType"; // 已转换
import { CombatantSidebarModel } from "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel"; // 已转换
import { CenterViewCmd } from "gui/screen/game/worldInteraction/keyboard/command/CenterViewCmd"; // 已转换
import { FollowUnitCmd } from "gui/screen/game/worldInteraction/keyboard/command/FollowUnitCmd"; // 已转换
import { CommandBarButtonType } from "gui/screen/game/component/hud/commandBar/CommandBarButtonType"; // 已转换
import * as ReportBugModule from "gui/screen/mainMenu/main/ReportBug"; // 孪生
import { EventDispatcher } from "util/event"; // 已转换
import { SetCameraLocationCmd } from "gui/screen/game/worldInteraction/keyboard/command/SetCameraLocationCmd"; // 已转换
import { GoToCameraLocationCmd } from "gui/screen/game/worldInteraction/keyboard/command/GoToCameraLocationCmd"; // 已转换
import { CenterBaseCmd } from "gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd"; // 已转换
import { SelectPlayerCmd } from "gui/screen/game/worldInteraction/keyboard/command/SelectPlayerCmd"; // 已转换
import { BoxedVar } from "util/BoxedVar"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const React: any = (ReactModule as any).default ?? ReactModule;
const ReportBug: any = (ReportBugModule as any).ReportBug;

/** 观察者 UI。 */
export class ObserverUi {
  /** 游戏。 */
  game: any;
  /** 当前观察玩家。 */
  player: any;
  /** 侧栏模型。 */
  sidebarModel: any;
  /** 回放。 */
  replay: any;
  /** 渲染器。 */
  renderer: any;
  /** 世界场景。 */
  worldScene: any;
  /** 音效。 */
  sound: any;
  /** 世界交互工厂。 */
  worldInteractionFactory: any;
  /** 菜单。 */
  gameMenu: any;
  /** 运行时开关。 */
  runtimeVars: any;
  /** 字符串。 */
  strings: any;
  /** 渲染件管理。 */
  renderableManager: any;
  /** 消息框。 */
  messageBoxApi: any;
  /** Discord URL。 */
  discordUrl: any;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 世界交互实例。 */
  worldInteraction: any;
  /** 玩家切换事件源。 */
  private _onPlayerChange = new EventDispatcher();
  /** 队列更新回调。 */
  handleProductionQueueUpdate: (queue: any) => void;

  /** 玩家切换事件。 */
  get onPlayerChange() {
    return this._onPlayerChange.asEvent();
  }

  /**
   * @param game 游戏
   * @param player 玩家
   * @param sidebarModel 侧栏
   * @param replay 回放
   * @param renderer 渲染器
   * @param worldScene 场景
   * @param sound 音效
   * @param worldInteractionFactory 交互工厂
   * @param gameMenu 菜单
   * @param runtimeVars 运行时
   * @param strings 字符串
   * @param renderableManager 渲染件
   * @param messageBoxApi 消息框
   * @param discordUrl 报告链接
   */
  constructor(
    game: any,
    player: any,
    sidebarModel: any,
    replay: any,
    renderer: any,
    worldScene: any,
    sound: any,
    worldInteractionFactory: any,
    gameMenu: any,
    runtimeVars: any,
    strings: any,
    renderableManager: any,
    messageBoxApi: any,
    discordUrl: any,
  ) {
    this.game = game;
    this.player = player;
    this.sidebarModel = sidebarModel;
    this.replay = replay;
    this.renderer = renderer;
    this.worldScene = worldScene;
    this.sound = sound;
    this.worldInteractionFactory = worldInteractionFactory;
    this.gameMenu = gameMenu;
    this.runtimeVars = runtimeVars;
    this.strings = strings;
    this.renderableManager = renderableManager;
    this.messageBoxApi = messageBoxApi;
    this.discordUrl = discordUrl;
    this.disposables = new CompositeDisposable();
    this._onPlayerChange = new EventDispatcher();
    this.handleProductionQueueUpdate = (queue: any) => {
      if (this.sidebarModel instanceof CombatantSidebarModel) {
        this.sidebarModel.updateFromQueue(queue);
      }
    };
  }

  /**
   * 创建世界交互并绑事件。
   * @param hud HUD
   */
  init(hud: any): void {
    const interaction = this.worldInteractionFactory.create();
    this.worldInteraction = interaction;
    interaction.init();
    this.disposables.add(interaction);
    this.initKeyboardCommands(interaction);
    this.initGameEventListeners();
    this.initHudEventListeners(hud);
  }

  /**
   * HUD 更换时重绑。
   * @param hud 新 HUD
   */
  handleHudChange(hud: any): void {
    this.initHudEventListeners(hud);
  }

  /** 释放。 */
  dispose(): void {
    this.disposables.dispose();
  }

  /** 侧栏可用对象/超武/电力事件。 */
  initGameEventListeners(): void {
    const onObject = (obj: any) => {
      if (!(this.sidebarModel instanceof CombatantSidebarModel)) return;
      if (!obj.isTechno() || obj.owner !== this.player) return;
      if (
        obj.isBuilding() ||
        Number.isFinite(obj.rules.buildLimit) ||
        (obj.isVehicle() && obj.transportTrait) ||
        this.game.rules.general.padAircraft.includes(obj.name)
      ) {
        this.sidebarModel.updateAvailableObjects(this.game.art);
      }
    };
    const world = this.game.getWorld();
    if (this.sidebarModel instanceof CombatantSidebarModel) {
      this.sidebarModel.updateAvailableObjects(this.game.art);
    }
    world.onObjectSpawned.subscribe(onObject);
    world.onObjectRemoved.subscribe(onObject);
    this.disposables.add(
      () => world.onObjectSpawned.unsubscribe(onObject),
      () => world.onObjectRemoved.unsubscribe(onObject),
    );
    this.disposables.add(
      this.game.events.subscribe(EventType.BuildingInfiltration, (e: any) => {
        if (
          e.source.owner === this.player &&
          this.sidebarModel instanceof CombatantSidebarModel
        ) {
          this.sidebarModel.updateAvailableObjects(this.game.art);
        }
      }),
    );
    this.disposables.add(
      this.game.events.subscribe(EventType.ObjectOwnerChange, (e: any) => {
        if (
          e.target.isBuilding() &&
          (e.prevOwner === this.player || e.target.owner === this.player) &&
          this.sidebarModel instanceof CombatantSidebarModel
        ) {
          this.sidebarModel.updateAvailableObjects(this.game.art);
        }
      }),
    );
    // rebuild the sidebar when a building is destroyed. LeaveRubble
    // buildings (e.g. the Secret Lab CASLAB) keep their game object on the map as
    // a rubble blocker after being destroyed, so the world-level onObjectRemoved
    // never fires and the sidebar would keep showing a Secret Lab bonus that is no
    // longer buildable.
    this.disposables.add(
      this.game.events.subscribe(EventType.ObjectDestroy, (e: any) => {
        if (
          e.target.isBuilding() &&
          e.target.owner === this.player &&
          this.sidebarModel instanceof CombatantSidebarModel
        ) {
          this.sidebarModel.updateAvailableObjects(this.game.art);
        }
      }),
    );
    this.player?.production.onQueueUpdate.subscribe(this.handleProductionQueueUpdate);
    this.disposables.add(() =>
      this.player?.production.onQueueUpdate.unsubscribe(this.handleProductionQueueUpdate),
    );
    const onSw = () => {
      if (this.sidebarModel instanceof CombatantSidebarModel) {
        this.sidebarModel.updateSuperWeapons();
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

  /**
   * 切换观察玩家并重建侧栏。
   * @param player 新玩家
   */
  changePlayer(player: any): void {
    if (player === this.player) return;
    this.player?.production.onQueueUpdate.unsubscribe(this.handleProductionQueueUpdate);
    this.player = player;
    this.player?.production.onQueueUpdate.subscribe(this.handleProductionQueueUpdate);
    const prev = this.sidebarModel;
    this.sidebarModel = player
      ? new CombatantSidebarModel(player, this.game)
      : new SidebarModel(this.game, this.replay);
    if (this.sidebarModel instanceof CombatantSidebarModel) {
      this.sidebarModel.updateAvailableObjects(this.game.art);
    }
    this.sidebarModel.selectTab(prev.activeTab.id);
    this.sidebarModel.topTextLeftAlign = prev.topTextLeftAlign;
    const shroud = player ? this.game.mapShroudTrait.getPlayerShroud(player) : void 0;
    this.worldInteraction?.setShroud(shroud);
    this._onPlayerChange.dispatch(this, {
      player,
      sidebarModel: this.sidebarModel,
    });
  }

  /**
   * HUD 音效与命令栏按钮。
   * @param hud HUD
   */
  initHudEventListeners(hud: any): void {
    hud.onSidebarTabClick.subscribe(() => {
      this.sound.play(SoundKey.GUITabSound, ChannelType.Ui);
    });
    const creditTicks = this.game.rules.audioVisual.creditTicks;
    hud.onCreditsTick.subscribe((dir: string) => {
      this.sound.play(dir === "up" ? creditTicks[0] : creditTicks[1], ChannelType.CreditTicks);
    });
    hud.onMessagesTick.subscribe(() => {
      this.sound.play(SoundKey.MessageCharTyped, ChannelType.Ui);
    });
    hud.onScrollButtonClick.subscribe((enabled: boolean) => {
      this.sound.play(
        enabled ? SoundKey.GenericClick : SoundKey.ScoldSound,
        ChannelType.Ui,
      );
    });
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
      }
    });
  }

  /**
   * 注册观察者键位。
   * @param interaction 世界交互
   */
  initKeyboardCommands(interaction: any): void {
    const selection = interaction.unitSelectionHandler;
    interaction
      .registerKeyCommand(KeyCommandType.Options, () => this.gameMenu.open())
      .registerKeyCommand(KeyCommandType.Scoreboard, () => this.gameMenu.openDiplo())
      .registerKeyCommand(KeyCommandType.VeterancyNav, () => selection.selectByVeterancy())
      .registerKeyCommand(KeyCommandType.HealthNav, () => selection.selectByHealth())
      .registerKeyCommand(
        KeyCommandType.ToggleFps,
        () => (this.runtimeVars.fps.value = !this.runtimeVars.fps.value),
      );
    const panning = new MapPanningHelper(this.game.map);
    const playerVar = new BoxedVar(this.player);
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
    ] as string[]).forEach((cmd, index) =>
      interaction.registerKeyCommand(
        cmd,
        new SelectPlayerCmd(index, playerVar, panning, this.worldScene.cameraPan, this.game),
      ),
    );
    playerVar.onChange.subscribe((p: any) => this.changePlayer(p));
    new Map<string, any>([
      [KeyCommandType.StructureTab, SidebarCategory.Structures],
      [KeyCommandType.DefenseTab, SidebarCategory.Armory],
      [KeyCommandType.InfantryTab, SidebarCategory.Infantry],
      [KeyCommandType.UnitTab, SidebarCategory.Vehicles],
    ]).forEach((cat, cmd) => {
      interaction.registerKeyCommand(cmd, () => {
        this.sidebarModel.selectTab(cat);
      });
    });
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
        new GoToCameraLocationCmd(this.worldScene.cameraPan, locations, idx - 1, void 0),
      );
    });
    interaction.registerKeyCommand(KeyCommandType.CenterBase, () => {
      if (this.player) {
        const cmd = new CenterBaseCmd(
          this.player,
          this.game.rules,
          panning,
          this.worldScene.cameraPan,
        );
        cmd.execute();
      }
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
  }
}
