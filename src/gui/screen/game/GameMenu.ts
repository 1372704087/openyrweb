/**
 * GameMenu — 对局菜单门面（Home/Diplo/ConnectionInfo 切屏与事件）。
 *
 * 由 gui/screen/game/GameMenu.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { GameMenuController } from "gui/screen/game/gameMenu/GameMenuController"; // 已转换
import { ScreenType } from "gui/screen/game/gameMenu/ScreenType"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 对局菜单。 */
export class GameMenu {
  /** 子屏注册表。 */
  subScreens: any;
  /** 游戏。 */
  game: any;
  /** 本地玩家。 */
  localPlayer: any;
  /** 聊天历史。 */
  chatHistory: any;
  /** gserv。 */
  gservCon: any;
  /** 是否单机。 */
  isSinglePlayer: any;
  /** 是否锦标赛（禁观察）。 */
  isTournament: boolean;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 控制器。 */
  controller: GameMenuController | undefined;
  /** 打开事件。 */
  private _onOpen = new EventDispatcher();
  /** 退出事件。 */
  private _onQuit = new EventDispatcher();
  /** 观察事件。 */
  private _onObserve = new EventDispatcher();
  /** 取消事件。 */
  private _onCancel = new EventDispatcher();
  /** 联盟切换事件。 */
  private _onToggleAlliance = new EventDispatcher();
  /** 发消息事件。 */
  private _onSendMessage = new EventDispatcher();

  /** 打开。 */
  get onOpen() {
    return this._onOpen.asEvent();
  }

  /** 退出对局。 */
  get onQuit() {
    return this._onQuit.asEvent();
  }

  /** 转观察。 */
  get onObserve() {
    return this._onObserve.asEvent();
  }

  /** 取消/关闭。 */
  get onCancel() {
    return this._onCancel.asEvent();
  }

  /** 联盟切换。 */
  get onToggleAlliance() {
    return this._onToggleAlliance.asEvent();
  }

  /** 发消息。 */
  get onSendMessage() {
    return this._onSendMessage.asEvent();
  }

  /**
   * @param subScreens 子屏
   * @param game 游戏
   * @param localPlayer 本地玩家
   * @param chatHistory 聊天历史
   * @param gservCon gserv
   * @param isSinglePlayer 单机
   * @param isTournament 锦标赛
   */
  constructor(
    subScreens: any,
    game: any,
    localPlayer: any,
    chatHistory: any,
    gservCon: any,
    isSinglePlayer: any,
    isTournament = false,
  ) {
    this.subScreens = subScreens;
    this.game = game;
    this.localPlayer = localPlayer;
    this.chatHistory = chatHistory;
    this.gservCon = gservCon;
    this.isSinglePlayer = isSinglePlayer;
    this.isTournament = isTournament;
    this.disposables = new CompositeDisposable();
    this._onOpen = new EventDispatcher();
    this._onQuit = new EventDispatcher();
    this._onObserve = new EventDispatcher();
    this._onCancel = new EventDispatcher();
    this._onToggleAlliance = new EventDispatcher();
    this._onSendMessage = new EventDispatcher();
  }

  /**
   * 用 HUD 创建控制器并注册子屏。
   * @param hud HUD
   */
  init(hud: any): void {
    const controller = new GameMenuController(hud);
    for (const [type, factory] of this.subScreens) {
      controller.addScreen(type, factory);
    }
    this.controller = controller;
    this.disposables.add(controller, () => (this.controller = void 0));
    this.bindHudEvents(hud);
  }

  /**
   * HUD 更换时重绑并重渲染。
   * @param hud 新 HUD
   */
  handleHudChange(hud: any): void {
    if (!this.controller) return;
    this.controller.setHud(hud);
    this.bindHudEvents(hud);
    this.controller.rerenderCurrentScreen();
  }

  /**
   * 订阅选项/外交按钮。
   * @param hud HUD
   */
  bindHudEvents(hud: any): void {
    hud.onOptButtonClick.subscribe(() => this.open());
    hud.onDiploButtonClick.subscribe(() => this.openDiplo());
  }

  /** 打开 Home。 */
  open(): void {
    if (!this.controller) {
      console.warn("Menu not initialized");
      return;
    }
    this._onOpen.dispatch(this);
    this.controller.goToScreen(ScreenType.Home, {
      observeAllowed: !(
        this.isTournament ||
        this.isSinglePlayer ||
        this.localPlayer === void 0 ||
        this.localPlayer.isObserver ||
        this.localPlayer.defeated
      ),
      onQuit: async () => {
        this.controller!.close();
        this._onQuit.dispatch(this);
      },
      onObserve: () => {
        this.controller!.close();
        this._onObserve.dispatch(this);
      },
      onCancel: () => {
        this.controller!.close();
        this._onCancel.dispatch(this);
      },
    });
  }

  /** 打开外交屏。 */
  openDiplo(): void {
    if (!this.controller) {
      console.warn("Menu not initialized");
      return;
    }
    this._onOpen.dispatch(this);
    this.controller.goToScreen(ScreenType.Diplo, {
      game: this.game,
      localPlayer: this.localPlayer,
      isSinglePlayer: this.isSinglePlayer,
      chatHistory: this.chatHistory,
      gservCon: this.gservCon,
      onToggleAlliance: (a: any, b: any) => {
        this._onToggleAlliance.dispatch(a, b);
      },
      onSendMessage: (msg: any) => this._onSendMessage.dispatch(this, msg),
      onCancel: () => {
        this.controller!.close();
        this._onCancel.dispatch(this);
      },
    });
  }

  /**
   * 打开连接信息屏。
   * @param players 玩家
   * @param gservCon gserv
   * @param chatNetHandler 聊天处理器
   */
  openConnectionInfo(players: any, gservCon: any, chatNetHandler: any): void {
    if (!this.controller) {
      console.warn("Menu not initialized");
      return;
    }
    this._onOpen.dispatch(this);
    this.controller.goToScreen(ScreenType.ConnectionInfo, {
      players,
      localPlayer: this.localPlayer,
      chatHistory: this.chatHistory,
      chatNetHandler,
      gservCon,
      onQuit: async () => {
        this.controller!.close();
        this._onQuit.dispatch(this);
      },
    });
  }

  /** 若有当前屏则关闭并广播取消。 */
  close(): void {
    if (!this.controller) {
      console.warn("Menu not initialized");
      return;
    }
    if (this.controller.getCurrentScreen()) {
      this.controller.close();
      this._onCancel.dispatch(this);
    }
  }

  /** 当前屏。 */
  getCurrentScreen(): any {
    return this.controller?.getCurrentScreen();
  }

  /** 释放。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
