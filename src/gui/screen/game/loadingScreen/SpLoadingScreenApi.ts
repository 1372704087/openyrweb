/**
 * SpLoadingScreenApi — 单机加载屏：本地玩家进度条与扩展状态。
 *
 * 由 gui/screen/game/loadingScreen/SpLoadingScreenApi.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as constantsModule from "game/gameopts/constants"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as PlayerConnectionStatusModule from "network/gamestate/PlayerConnectionStatus"; // 孪生
import * as LoadingScreenWrapperModule from "gui/screen/game/loadingScreen/LoadingScreenWrapper"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const OBS_COUNTRY_ID: any = (constantsModule as any).OBS_COUNTRY_ID;
const PlayerConnectionStatus: any = (PlayerConnectionStatusModule as any).PlayerConnectionStatus;
const LoadingScreenWrapper: any = (LoadingScreenWrapperModule as any).LoadingScreenWrapper;

/** 单机加载屏 API。 */
export class SpLoadingScreenApi {
  /** 规则。 */
  rules: any;
  /** 字符串。 */
  strings: any;
  /** UI 场景。 */
  uiScene: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 资源配置。 */
  gameResConfig: any;
  /** 关卡信息。 */
  campaignInfo: any;
  /** 地图预览 URL。 */
  mapPreviewUrl: any;
  /** 已上报最大进度百分比。 */
  lastLoadPercent = 0;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 加载屏组件 ref。 */
  loadingScreen: any;
  /** 玩家列表。 */
  players: any[];
  /** 本地玩家名。 */
  localPlayerName: string;
  /** 地图名。 */
  mapName: string;
  /** 上次渲染时间。 */
  lastRenderTime: number | undefined;
  /** 进度回调。 */
  handleLoadInfoUpdate: (percent: number) => void;

  /**
   * @param rules 规则
   * @param strings 字符串
   * @param uiScene 场景
   * @param jsxRenderer JSX
   * @param gameResConfig 资源
   * @param campaignInfo 关卡
   */
  constructor(
    rules: any,
    strings: any,
    uiScene: any,
    jsxRenderer: any,
    gameResConfig: any,
    campaignInfo?: any,
  ) {
    this.rules = rules;
    this.strings = strings;
    this.uiScene = uiScene;
    this.jsxRenderer = jsxRenderer;
    this.gameResConfig = gameResConfig;
    this.campaignInfo = campaignInfo;
    this.lastLoadPercent = 0;
    this.disposables = new CompositeDisposable();
    this.handleLoadInfoUpdate = (percent: number) => {
      if (this.loadingScreen) {
        const now = performance.now();
        if (!this.lastRenderTime || now - this.lastRenderTime > 1e3 / 15) {
          this.lastRenderTime = now;
          this.loadingScreen.applyOptions((opts: any) => {
            opts.playerInfos = this.createExtendedLoadingInfos(percent);
          });
        }
      } else {
        this.createLoadingScreen();
      }
    };
  }

  /**
   * 启动加载屏。
   * @param players 玩家
   * @param mapName 地图名
   * @param localPlayerName 本地玩家
   */
  async start(players: any[], mapName: string, localPlayerName: string): Promise<void> {
    this.players = players;
    this.localPlayerName = localPlayerName;
    this.mapName = mapName;
    this.handleLoadInfoUpdate(0);
  }

  /**
   * 进度推进（取整且只增）。
   * @param percent 0..100
   */
  onLoadProgress(percent: number): void {
    const p = Math.floor(percent);
    if (p > this.lastLoadPercent) {
      this.lastLoadPercent = p;
      this.handleLoadInfoUpdate(p);
    }
  }

  /**
   * 构造本地玩家一条状态。
   * @param percent 进度
   */
  createExtendedLoadingInfos(percent: number): any[] {
    const colors = [...this.rules.getMultiplayerColors().values()];
    const countries = this.rules.getMultiplayerCountries();
    const local = this.players.find((p: any) => p.name === this.localPlayerName);
    return [
      {
        name: this.localPlayerName,
        status: PlayerConnectionStatus.Connected,
        loadPercent: percent,
        country: countries[local.countryId],
        color: local.countryId === OBS_COUNTRY_ID ? "#fff" : colors[local.colorId].asHexString(),
        team: local.teamId,
      },
    ];
  }

  /** 挂载 LoadingScreenWrapper。 */
  createLoadingScreen(): void {
    const [root] = this.jsxRenderer.render(
      jsx(LoadingScreenWrapper, {
        ref: (e: any) => (this.loadingScreen = e),
        strings: this.strings,
        rules: this.rules,
        viewport: this.uiScene.menuViewport,
        playerName: this.localPlayerName,
        mapName: this.mapName,
        playerInfos: this.createExtendedLoadingInfos(0),
        gameResConfig: this.gameResConfig,
        mapPreviewUrl: this.mapPreviewUrl,
        campaignInfo: this.campaignInfo,
      }),
    );
    this.uiScene.add(root);
    this.disposables.add(root, () => this.uiScene.remove(root));
  }

  /** 释放。 */
  dispose(): void {
    this.disposables.dispose();
  }

  /** 更新视口尺寸。 */
  updateViewport(): void {
    this.loadingScreen?.updateViewport(this.uiScene.menuViewport);
  }
}
