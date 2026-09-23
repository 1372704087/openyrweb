/**
 * ReplayLoadingScreenApi — 回放加载屏：多玩家列表状态展示。
 *
 * 由 gui/screen/game/loadingScreen/ReplayLoadingScreenApi.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
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
const NO_TEAM_ID: any = (constantsModule as any).NO_TEAM_ID;
const PlayerConnectionStatus: any = (PlayerConnectionStatusModule as any).PlayerConnectionStatus;
const LoadingScreenWrapper: any = (LoadingScreenWrapperModule as any).LoadingScreenWrapper;

/** 回放加载屏 API。 */
export class ReplayLoadingScreenApi {
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
  /** 地图预览 URL。 */
  mapPreviewUrl: any;
  /** 最大进度。 */
  lastLoadPercent = 0;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 加载屏 ref。 */
  loadingScreen: any;
  /** 玩家列表。 */
  players: any[];
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
   */
  constructor(rules: any, strings: any, uiScene: any, jsxRenderer: any, gameResConfig: any) {
    this.rules = rules;
    this.strings = strings;
    this.uiScene = uiScene;
    this.jsxRenderer = jsxRenderer;
    this.gameResConfig = gameResConfig;
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
        this.createLoadingScreen(percent);
      }
    };
  }

  /**
   * 启动。
   * @param players 玩家
   * @param mapName 地图
   */
  async start(players: any[], mapName: string): Promise<void> {
    this.players = players;
    this.mapName = mapName;
    this.handleLoadInfoUpdate(0);
  }

  /**
   * 进度只增更新。
   * @param percent 百分比
   */
  onLoadProgress(percent: number): void {
    const p = Math.floor(percent);
    if (p > this.lastLoadPercent) {
      this.lastLoadPercent = p;
      this.handleLoadInfoUpdate(p);
    }
  }

  /**
   * 过滤观察者并按队伍排序。
   * @param percent 进度
   */
  createExtendedLoadingInfos(percent: number): any[] {
    const colors = [...this.rules.getMultiplayerColors().values()];
    const countries = this.rules.getMultiplayerCountries();
    const allPaired = this.players?.every(
      (p) => p.countryId === OBS_COUNTRY_ID || p.teamId !== NO_TEAM_ID,
    );
    return this.players
      .filter((p) => p.countryId !== OBS_COUNTRY_ID)
      .map((p) => ({
        name: p.name,
        status: PlayerConnectionStatus.Connected,
        loadPercent: percent,
        country: countries[p.countryId],
        color: colors[p.colorId].asHexString(),
        team: p.teamId,
      }))
      .sort((a, b) =>
        allPaired
          ? Boolean(a.country) === Boolean(b.country)
            ? a.team - b.team
            : Number(b.country !== void 0) - Number(a.country !== void 0)
          : 0,
      );
  }

  /**
   * 挂载包装层。
   * @param percent 进度
   */
  createLoadingScreen(percent: number): void {
    const [root] = this.jsxRenderer.render(
      jsx(LoadingScreenWrapper, {
        ref: (e: any) => (this.loadingScreen = e),
        strings: this.strings,
        rules: this.rules,
        viewport: this.uiScene.menuViewport,
        playerName: void 0,
        mapName: this.mapName,
        playerInfos: this.createExtendedLoadingInfos(percent),
        gameResConfig: this.gameResConfig,
        mapPreviewUrl: this.mapPreviewUrl,
      }),
    );
    this.uiScene.add(root);
    this.disposables.add(
      root,
      () => this.uiScene.remove(root),
      () => (this.loadingScreen = void 0),
    );
  }

  /** 释放。 */
  dispose(): void {
    this.disposables.dispose();
  }

  /** 更新视口。 */
  updateViewport(): void {
    this.loadingScreen?.updateViewport(this.uiScene.menuViewport);
  }
}
