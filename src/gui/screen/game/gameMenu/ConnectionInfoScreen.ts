/**
 * ConnectionInfoScreen — 断线重连/连接状态表单屏。
 *
 * 由 gui/screen/game/gameMenu/ConnectionInfoScreen.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import { ScreenType } from "gui/screen/game/gameMenu/ScreenType"; // 已转换
import * as HtmlViewModule from "gui/jsx/HtmlView"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as ConInfoFormModule from "gui/screen/game/gameMenu/ConInfoForm"; // 孪生
import { GameMenuScreen } from "gui/screen/game/GameMenuScreen"; // 已转换
import * as LoadInfoParserModule from "network/gameopt/LoadInfoParser"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const HtmlView: any = (HtmlViewModule as any).HtmlView;
const ConInfoForm: any = (ConInfoFormModule as any).ConInfoForm;
const LoadInfoParser: any = (LoadInfoParserModule as any).LoadInfoParser;

/** 连接信息屏。 */
export class ConnectionInfoScreen extends GameMenuScreen {
  /** 字符串。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 聊天消息缓存。 */
  messages: any[] = [];
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 表单 ref。 */
  form: any;
  /** 进入参数。 */
  params: any;
  /** 聊天消息回调。 */
  handleChatMessage: (msg: any) => void;
  /** LoadInfo 回调。 */
  handleConInfoUpdate: (raw: any) => void;

  /**
   * @param strings 字符串
   * @param jsxRenderer JSX
   */
  constructor(strings: any, jsxRenderer: any) {
    super();
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.messages = [];
    this.disposables = new CompositeDisposable();
    this.handleChatMessage = (msg: any) => {
      this.messages.push(msg);
      this.form.refresh();
    };
    this.handleConInfoUpdate = (raw: any) => {
      this.form.applyOptions((opts: any) => {
        opts.conInfos = new LoadInfoParser().parse(raw);
      });
    };
  }

  /**
   * 进入：订阅 LoadInfo / 聊天（gserv 开着时）。
   * @param params 进入参数
   */
  onEnter(params: any): void {
    this.params = params;
    this.controller.toggleContentAreaVisibility(true);
    this.initView(params);
    if (params.gservCon.isOpen()) {
      params.gservCon.onLoadInfo.subscribe(this.handleConInfoUpdate);
      this.disposables.add(() =>
        params.gservCon.onLoadInfo.unsubscribe(this.handleConInfoUpdate),
      );
      params.gservCon.requestLoadInfo();
      const poll = setInterval(() => {
        if (params.gservCon.isOpen()) params.gservCon.requestLoadInfo();
        else this.disposables.dispose();
      }, 1e3);
      this.disposables.add(() => clearInterval(poll));
      params.chatHistory.onNewMessage.subscribe(this.handleChatMessage);
      this.disposables.add(() => {
        this.messages.length = 0;
        params.chatHistory.onNewMessage.unsubscribe(this.handleChatMessage);
      });
    }
    this.messages.push({
      text:
        this.strings.get("GUI:ConnectingToPlayers") +
        "...\n" +
        this.strings.get("TXT_RECONNECT_HELP2") +
        " " +
        this.strings.get("TXT_RECONNECT_HELP2B"),
    });
  }

  /**
   * 侧栏 + 渲染 ConInfoForm。
   * @param params 进入参数
   */
  initView(params: any): void {
    const t = this.strings;
    const buttons = [
      {
        label: t.get("GUI:AbortMission"),
        onClick: () => {
          this.controller?.pushScreen(ScreenType.QuitConfirm, {
            onQuit: params.onQuit,
            onCancel: () => {
              this.controller?.popScreen();
            },
          });
        },
      },
    ];
    this.controller.setSidebarButtons(buttons);
    this.controller.showSidebarButtons();
    const [root] = this.jsxRenderer.render(
      jsx(HtmlView, {
        width: "100%",
        height: "100%",
        component: ConInfoForm,
        innerRef: (e: any) => (this.form = e),
        props: {
          players: params.players,
          localPlayer: params.localPlayer,
          strings: this.strings,
          messages: this.messages,
          chatHistory: params.chatHistory,
          onSendMessage: (e: any) => {
            params.chatNetHandler.submitMessage(e.value, e.recipient);
          },
        },
      }),
    );
    this.controller.setMainComponent(root);
    this.disposables.add(() => (this.form = void 0));
  }

  /** 离开清理。 */
  async onLeave(): Promise<void> {
    this.params = void 0;
    this.controller.hideSidebarButtons();
    this.controller.toggleContentAreaVisibility(false);
    this.disposables.dispose();
  }

  /** 压栈隐藏侧栏。 */
  async onStack(): Promise<void> {
    this.controller.hideSidebarButtons();
  }

  /** 出栈重建。 */
  onUnstack(): void {
    this.initView(this.params);
  }
}
