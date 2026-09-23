/**
 * RootController — 根屏幕控制器（创建/加入对局快捷入口）。
 *
 * 扩展 gui/screen/Controller：持有 serverRegions；createGame/joinGame
 * 校验区域与多人 gserv 后跳转 ScreenType.Game。mapTransfer/createPrivateGame
 * 默认 false，与孪生可选参一致。
 *
 * 由 gui/screen/RootController.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Controller } from "gui/screen/Controller"; // 孪生（本组内一并转换）
import { ScreenType } from "gui/screen/ScreenType"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class RootController extends Controller {
  /** 已加载的服务器区域列表（未加载时 create/join 会 throw）。 */
  serverRegions: any;

  constructor(serverRegions: any) {
    super();
    this.serverRegions = serverRegions;
  }

  /** 孪生 rest 包装：解构 (type, params) 后转 super。 */
  async goToScreenBlocking(...args: any[]): Promise<void> {
    var [type, params] = args;
    return super.goToScreenBlocking(type, params);
  }

  /** 孪生 rest 包装。 */
  goToScreen(...args: any[]): void {
    var [type, params] = args;
    return super.goToScreen(type, params);
  }

  /** 孪生 rest 包装。 */
  async pushScreen(...args: any[]): Promise<void> {
    var [type, params] = args;
    return super.pushScreen(type, params);
  }

  /**
   * 创建对局并跳转 Game 屏。
   * 单机（singlePlayer=true）时 gservUrl 可空；多人必须提供 gameServer。
   */
  createGame(
    gameId: any,
    timestamp: any,
    gameServer: any,
    playerName: any,
    gameOpts: any,
    singlePlayer: any,
    tournament: any,
    mapTransfer: any = false,
    createPrivateGame: any = false,
    returnTo?: any,
  ): void {
    if (!this.serverRegions)
      throw new Error("Server regions must be loaded first");
    let gservUrl = "";
    if (!singlePlayer) {
      if (!gameServer)
        throw new Error(
          "Game server must be set for a multiplayer game",
        );
      gservUrl = gameServer;
    }
    this.goToScreen(ScreenType.Game, {
      create: true,
      gameId,
      timestamp,
      playerName,
      gameOpts,
      singlePlayer,
      tournament,
      mapTransfer,
      createPrivateGame,
      gservUrl,
      returnTo,
    });
  }

  /** 加入已有对局并跳转 Game 屏。 */
  joinGame(
    gameId: any,
    timestamp: any,
    gservUrl: any,
    playerName: any,
    tournament: any,
    mapTransfer: any = false,
    returnTo?: any,
  ): void {
    if (!this.serverRegions)
      throw new Error("Server regions must be loaded first");
    this.goToScreen(ScreenType.Game, {
      create: false,
      gameId,
      timestamp,
      playerName,
      tournament,
      mapTransfer,
      gservUrl,
      returnTo,
    });
  }
}
