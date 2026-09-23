/**
 * HudFactory — 持有依赖并创建 Hud 实例。
 *
 * 由 gui/screen/game/HudFactory.ts.js 重写为 TS（行为完全一致）。
 */
import * as HudModule from "gui/screen/game/component/Hud"; // 孪生
import { Engine } from "engine/Engine"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const Hud: any = (HudModule as any).Hud;

/** HUD 工厂。 */
export class HudFactory {
  /** 阵营。 */
  sideType: any;
  /** UI 场景。 */
  uiScene: any;
  /** 侧栏模型。 */
  sidebarModel: any;
  /** 消息列表。 */
  messageList: any;
  /** 聊天历史。 */
  chatHistory: any;
  /** 调试文本。 */
  debugText: any;
  /** 调试文本开关。 */
  debugTextEnabled: any;
  /** 本地玩家。 */
  localPlayer: any;
  /** 玩家列表。 */
  players: any;
  /** 僵局检测。 */
  stalemateDetectTrait: any;
  /** 倒计时。 */
  countdownTimer: any;
  /** cameo 文件名表。 */
  cameoFilenames: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 字符串表。 */
  strings: any;
  /** 命令栏按钮。 */
  commandBarButtons: any;

  /**
   * @param sideType 阵营
   * @param uiScene UI 场景
   * @param sidebarModel 侧栏
   * @param messageList 消息
   * @param chatHistory 历史
   * @param debugText 调试文本
   * @param debugTextEnabled 开关
   * @param localPlayer 本地玩家
   * @param players 玩家
   * @param stalemateDetectTrait 僵局
   * @param countdownTimer 倒计时
   * @param cameoFilenames cameo 表
   * @param jsxRenderer JSX
   * @param strings 字符串
   * @param commandBarButtons 按钮
   */
  constructor(
    sideType: any,
    uiScene: any,
    sidebarModel: any,
    messageList: any,
    chatHistory: any,
    debugText: any,
    debugTextEnabled: any,
    localPlayer: any,
    players: any,
    stalemateDetectTrait: any,
    countdownTimer: any,
    cameoFilenames: any,
    jsxRenderer: any,
    strings: any,
    commandBarButtons: any,
  ) {
    this.sideType = sideType;
    this.uiScene = uiScene;
    this.sidebarModel = sidebarModel;
    this.messageList = messageList;
    this.chatHistory = chatHistory;
    this.debugText = debugText;
    this.debugTextEnabled = debugTextEnabled;
    this.localPlayer = localPlayer;
    this.players = players;
    this.stalemateDetectTrait = stalemateDetectTrait;
    this.countdownTimer = countdownTimer;
    this.cameoFilenames = cameoFilenames;
    this.jsxRenderer = jsxRenderer;
    this.strings = strings;
    this.commandBarButtons = commandBarButtons;
  }

  /**
   * 替换侧栏模型引用。
   * @param model 新模型
   */
  setSidebarModel(model: any): void {
    this.sidebarModel = model;
  }

  /** 创建 Hud。 */
  create(): any {
    return new Hud(
      this.sideType,
      this.uiScene.viewport,
      Engine.getImages(),
      Engine.getPalettes(),
      this.cameoFilenames,
      this.sidebarModel,
      this.messageList,
      this.chatHistory,
      this.debugText,
      this.debugTextEnabled,
      this.localPlayer,
      this.players,
      this.stalemateDetectTrait,
      this.countdownTimer,
      this.jsxRenderer,
      this.strings,
      this.commandBarButtons,
    );
  }
}
