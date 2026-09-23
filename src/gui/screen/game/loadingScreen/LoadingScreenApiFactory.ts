/**
 * LoadingScreenApiFactory — 按模式创建 SP/MP/回放加载屏 API。
 *
 * 由 gui/screen/game/loadingScreen/LoadingScreenApiFactory.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as LoadInfoParserModule from "network/gameopt/LoadInfoParser"; // 孪生
import * as MpLoadingScreenApiModule from "gui/screen/game/loadingScreen/MpLoadingScreenApi"; // 孪生
import * as ReplayLoadingScreenApiModule from "gui/screen/game/loadingScreen/ReplayLoadingScreenApi"; // 孪生
import * as SpLoadingScreenApiModule from "gui/screen/game/loadingScreen/SpLoadingScreenApi"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const LoadInfoParser: any = (LoadInfoParserModule as any).LoadInfoParser;
const MpLoadingScreenApi: any = (MpLoadingScreenApiModule as any).MpLoadingScreenApi;
const ReplayLoadingScreenApi: any = (ReplayLoadingScreenApiModule as any).ReplayLoadingScreenApi;
const SpLoadingScreenApi: any = (SpLoadingScreenApiModule as any).SpLoadingScreenApi;

/** 加载屏类型。 */
export enum LoadingScreenType {
  /** 单机 */
  SinglePlayer = 0,
  /** 多人 */
  MultiPlayer = 1,
  /** 回放 */
  Replay = 2,
}

/** 加载屏 API 工厂。 */
export class LoadingScreenApiFactory {
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
  /** gserv 连接。 */
  gservCon: any;

  /**
   * @param rules 规则
   * @param strings 字符串
   * @param uiScene 场景
   * @param jsxRenderer JSX
   * @param gameResConfig 资源
   * @param gservCon gserv
   */
  constructor(
    rules: any,
    strings: any,
    uiScene: any,
    jsxRenderer: any,
    gameResConfig: any,
    gservCon: any,
  ) {
    this.rules = rules;
    this.strings = strings;
    this.uiScene = uiScene;
    this.jsxRenderer = jsxRenderer;
    this.gameResConfig = gameResConfig;
    this.gservCon = gservCon;
  }

  /**
   * 创建对应加载屏 API。
   * @param type LoadingScreenType
   * @param campaignInfo 单机关卡信息（SP 用）
   */
  create(type: LoadingScreenType, campaignInfo?: any): any {
    const { rules, strings, uiScene, jsxRenderer, gameResConfig, gservCon } = this;
    switch (type) {
      case LoadingScreenType.SinglePlayer:
        return new SpLoadingScreenApi(
          rules,
          strings,
          uiScene,
          jsxRenderer,
          gameResConfig,
          campaignInfo,
        );
      case LoadingScreenType.MultiPlayer: {
        const parser = new LoadInfoParser();
        return new MpLoadingScreenApi(
          gservCon,
          parser,
          rules,
          strings,
          uiScene,
          jsxRenderer,
          gameResConfig,
        );
      }
      case LoadingScreenType.Replay:
        return new ReplayLoadingScreenApi(rules, strings, uiScene, jsxRenderer, gameResConfig);
      default:
        throw new Error(`Unsupported loading screen type "${type}"`);
    }
  }
}
