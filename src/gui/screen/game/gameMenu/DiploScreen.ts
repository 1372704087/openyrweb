/**
 * DiploScreen — 外交/玩家列表屏（帧刷新 + gserv LoadInfo）。
 *
 * 由 gui/screen/game/gameMenu/DiploScreen.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as HtmlViewModule from "gui/jsx/HtmlView"; // 孪生
import * as DiploFormModule from "gui/screen/game/gameMenu/DiploForm"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { GameMenuScreen } from "gui/screen/game/GameMenuScreen"; // 已转换
import * as LoadInfoParserModule from "network/gameopt/LoadInfoParser"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const HtmlView: any = (HtmlViewModule as any).HtmlView;
const DiploForm: any = (DiploFormModule as any).DiploForm;
const LoadInfoParser: any = (LoadInfoParserModule as any).LoadInfoParser;

/** 外交屏。 */
export class DiploScreen extends GameMenuScreen {
  /** 字符串。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 渲染器。 */
  renderer: any;
  /** 游戏模式表。 */
  gameModes: any;
  /** taunt 开关。 */
  taunts: any;
  /** 屏蔽集。 */
  mutedPlayers: Set<string>;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 表单 ref。 */
  form: any;
  /** 进入参数。 */
  params: any;
  /** 上次刷新时间。 */
  lastUpdate: number | undefined;
  /** 帧回调。 */
  onFrame: (now: number) => void;
  /** LoadInfo 回调。 */
  handleConInfoUpdate: (raw: any) => void;
  /** 表单刷新。 */
  updateForm: () => void;

  /**
   * @param strings 字符串
   * @param jsxRenderer JSX
   * @param renderer 渲染器
   * @param gameModes 模式
   * @param taunts taunt 开关
   * @param mutedPlayers 屏蔽集
   */
  constructor(
    strings: any,
    jsxRenderer: any,
    renderer: any,
    gameModes: any,
    taunts: any,
    mutedPlayers: Set<string>,
  ) {
    super();
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.renderer = renderer;
    this.gameModes = gameModes;
    this.taunts = taunts;
    this.mutedPlayers = mutedPlayers;
    this.disposables = new CompositeDisposable();
    this.onFrame = (now: number) => {
      if (!this.lastUpdate || now - this.lastUpdate > 500) {
        this.lastUpdate = now;
        this.updateForm();
      }
    };
    this.handleConInfoUpdate = (raw: any) => {
      this.form.applyOptions((opts: any) => {
        opts.conInfos = new LoadInfoParser().parse(raw);
      });
    };
    this.updateForm = () => {
      this.form.applyOptions((opts: any) => {
        if (this.params) {
          opts.playerInfos = this.buildPlayerInfos(this.params.game, this.params.localPlayer);
          opts.taunts = this.taunts.value;
          opts.messages = this.params.chatHistory?.getAll();
        }
      });
    };
  }

  /**
   * 进入：帧订阅、聊天与 LoadInfo。
   * @param params 参数
   */
  onEnter(params: any): void {
    this.controller.toggleContentAreaVisibility(true);
    this.initView(params);
    this.params = params;
    this.renderer.onFrame.subscribe(this.onFrame);
    this.disposables.add(() => this.renderer.onFrame.unsubscribe(this.onFrame));
    const chat = params.chatHistory;
    if (chat) {
      chat.onNewMessage.subscribe(this.updateForm);
      this.disposables.add(() => chat.onNewMessage.unsubscribe(this.updateForm));
    }
    const gserv = params.gservCon;
    if (gserv?.isOpen()) {
      gserv.onLoadInfo.subscribe(this.handleConInfoUpdate);
      this.disposables.add(() => gserv.onLoadInfo.unsubscribe(this.handleConInfoUpdate));
      gserv.requestLoadInfo();
      const poll = setInterval(() => {
        if (gserv.isOpen()) gserv.requestLoadInfo();
        else this.disposables.dispose();
      }, 1e4);
      this.disposables.add(() => clearInterval(poll));
    }
  }

  /**
   * 侧栏 Resume + DiploForm。
   * @param params 参数
   */
  initView(params: any): void {
    const t = this.strings;
    const buttons = [{ label: t.get("GUI:ResumeMission"), isBottom: true, onClick: params.onCancel }];
    this.controller.setSidebarButtons(buttons);
    this.controller.showSidebarButtons();
    const { localPlayer, isSinglePlayer, game } = params;
    const [root] = this.jsxRenderer.render(
      jsx(HtmlView, {
        width: "100%",
        height: "100%",
        component: DiploForm,
        innerRef: (e: any) => (this.form = e),
        props: {
          playerInfos: this.buildPlayerInfos(game, localPlayer),
          localPlayer,
          gameOpts: game.gameOpts,
          gameModes: this.gameModes,
          taunts: isSinglePlayer ? void 0 : this.taunts.value,
          singlePlayer: isSinglePlayer,
          alliancesAllowed:
            !isSinglePlayer &&
            game.rules.mpDialogSettings.alliesAllowed &&
            game.rules.mpDialogSettings.allyChangeAllowed,
          mapName: game.gameOpts.mapTitle,
          messages: params.chatHistory?.getAll(),
          chatHistory: params.chatHistory,
          onToggleTaunts: (v: any) => (this.taunts.value = v),
          onToggleAlliance: params.onToggleAlliance,
          onToggleChat: (player: any, enabled: boolean) => {
            if (enabled) this.mutedPlayers.delete(player.name);
            else this.mutedPlayers.add(player.name);
          },
          onSendMessage: params.onSendMessage,
          onCancelMessage: (force: any) => force && params.onCancel(),
          strings: this.strings,
        },
      }),
    );
    this.controller.setMainComponent(root);
    this.disposables.add(() => (this.form = void 0));
  }

  /**
   * 构造非本地玩家外交状态。
   * @param game 游戏
   * @param local 本地玩家
   */
  buildPlayerInfos(game: any, local?: any): any[] {
    const localAlliances = local ? game.alliances.filterByPlayer(local) : void 0;
    return game
      .getNonNeutralPlayers()
      .filter((p: any) => p !== local)
      .map((p: any) => ({
        player: p,
        muted: this.mutedPlayers.has(p.name),
        allianceToggleable:
          !!local && game.alliances.canRequestAlliance(p) && game.alliances.canFormAlliance(local, p),
        alliance: localAlliances?.find(
          (a: any) => a.players.first === p || a.players.second === p,
        ),
      }));
  }

  /** 离开清理。 */
  async onLeave(): Promise<void> {
    this.params = void 0;
    this.controller.hideSidebarButtons();
    this.controller.toggleContentAreaVisibility(false);
    this.disposables.dispose();
  }
}
