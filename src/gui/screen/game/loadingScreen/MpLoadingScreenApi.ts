/**
 * MpLoadingScreenApi — 多人加载屏：订阅 gserv LoadInfo 并上报本机进度。
 *
 * 由 gui/screen/game/loadingScreen/MpLoadingScreenApi.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as constantsModule from "game/gameopts/constants"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as LoadingScreenWrapperModule from "gui/screen/game/loadingScreen/LoadingScreenWrapper"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const OBS_COUNTRY_ID: any = (constantsModule as any).OBS_COUNTRY_ID;
const NO_TEAM_ID: any = (constantsModule as any).NO_TEAM_ID;
const LoadingScreenWrapper: any = (LoadingScreenWrapperModule as any).LoadingScreenWrapper;

/** 多人加载屏 API。 */
export class MpLoadingScreenApi {
  /** gserv。 */
  gservCon: any;
  /** LoadInfo 解析器。 */
  loadInfoParser: any;
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
  /** 最大进度。 */
  lastLoadPercent = 0;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 加载屏 ref。 */
  loadingScreen: any;
  /** 玩家列表。 */
  players: any[];
  /** 本地玩家名。 */
  localPlayerName: string;
  /** 地图名。 */
  mapName: string;
  /** 地图预览。 */
  mapPreviewUrl: any;
  /** LoadInfo 回调。 */
  handleLoadInfoUpdate: (info: any) => void;

  /**
   * @param gservCon gserv
   * @param loadInfoParser 解析器
   * @param rules 规则
   * @param strings 字符串
   * @param uiScene 场景
   * @param jsxRenderer JSX
   * @param gameResConfig 资源
   */
  constructor(
    gservCon: any,
    loadInfoParser: any,
    rules: any,
    strings: any,
    uiScene: any,
    jsxRenderer: any,
    gameResConfig: any,
  ) {
    this.gservCon = gservCon;
    this.loadInfoParser = loadInfoParser;
    this.rules = rules;
    this.strings = strings;
    this.uiScene = uiScene;
    this.jsxRenderer = jsxRenderer;
    this.gameResConfig = gameResConfig;
    this.lastLoadPercent = 0;
    this.disposables = new CompositeDisposable();
    this.handleLoadInfoUpdate = (raw: any) => {
      const parsed = this.loadInfoParser.parse(raw);
      if (this.loadingScreen) {
        this.loadingScreen.applyOptions((opts: any) => {
          opts.playerInfos = this.createExtendedLoadingInfos(parsed);
        });
      } else {
        this.createLoadingScreen(parsed);
      }
    };
  }

  /**
   * 启动：订阅 LoadInfo，每 10s 轮询。
   * @param players 玩家
   * @param mapName 地图
   * @param localPlayerName 本地玩家
   */
  async start(players: any[], mapName: string, localPlayerName: string): Promise<void> {
    if (!this.gservCon.isOpen()) return;
    this.players = players;
    this.localPlayerName = localPlayerName;
    this.mapName = mapName;
    this.gservCon.onLoadInfo.subscribe(this.handleLoadInfoUpdate);
    this.disposables.add(() =>
      this.gservCon.onLoadInfo.unsubscribe(this.handleLoadInfoUpdate),
    );
    this.gservCon.requestLoadInfo();
    const id = setInterval(() => {
      if (this.gservCon.isOpen()) this.gservCon.requestLoadInfo();
      else this.disposables.dispose();
    }, 1e4);
    this.disposables.add(() => clearInterval(id));
  }

  /**
   * 上报进度（只增）。
   * @param percent 百分比
   */
  onLoadProgress(percent: number): void {
    const p = Math.floor(percent);
    if (p > this.lastLoadPercent) {
      this.lastLoadPercent = p;
      if (this.gservCon.isOpen()) this.gservCon.sendLoadedPercent(p);
    }
  }

  /**
   * 将解析后的 loadInfo 映射到 UI 状态。
   * @param entries 解析结果
   */
  createExtendedLoadingInfos(entries: any[]): any[] {
    const colors = [...this.rules.getMultiplayerColors().values()];
    const countries = this.rules.getMultiplayerCountries();
    const allPaired = this.players?.every(
      (p) => p.countryId === OBS_COUNTRY_ID || p.teamId !== NO_TEAM_ID,
    );
    return entries
      .map((entry) => {
        const player = this.players.find((p) => p.name === entry.name);
        return {
          name: entry.name,
          status: entry.status,
          loadPercent: entry.loadPercent,
          country: countries[player.countryId],
          color:
            player.countryId === OBS_COUNTRY_ID ? "#fff" : colors[player.colorId].asHexString(),
          team: player.teamId,
        };
      })
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
   * @param entries 玩家状态
   */
  createLoadingScreen(entries: any[]): void {
    const [root] = this.jsxRenderer.render(
      jsx(LoadingScreenWrapper, {
        ref: (e: any) => (this.loadingScreen = e),
        strings: this.strings,
        rules: this.rules,
        viewport: this.uiScene.menuViewport,
        playerName: this.localPlayerName,
        mapName: this.mapName,
        playerInfos: this.createExtendedLoadingInfos(entries),
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
