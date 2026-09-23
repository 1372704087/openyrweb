/**
 * SelectPlayerCmd — 循环切换观察/选中玩家；400ms 内连按回居中主基地。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/SelectPlayerCmd.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CenterBaseCmd } from "gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 按玩家序号切换选择。 */
export class SelectPlayerCmd {
  /** 玩家下标（0-based）。 */
  playerNum: any;
  /** 当前选中玩家的 BoxedVar/可写包装。 */
  player: any;
  /** 地图平移辅助。 */
  mapPanningHelper: any;
  /** 镜头平移。 */
  cameraPan: any;
  /** 游戏。 */
  game: any;
  /** 上次执行时间。 */
  lastSelectTime: number | undefined;

  /**
   * @param playerNum 玩家序号
   * @param player 选中玩家包装
   * @param mapPanningHelper 平移辅助
   * @param cameraPan 镜头平移
   * @param game 游戏
   */
  constructor(playerNum: any, player: any, mapPanningHelper: any, cameraPan: any, game: any) {
    this.playerNum = playerNum;
    this.player = player;
    this.mapPanningHelper = mapPanningHelper;
    this.cameraPan = cameraPan;
    this.game = game;
  }

  /** 切换玩家；400ms 连按时对新玩家执行 CenterBaseCmd。 */
  execute(): void {
    const now = performance.now();
    let rapid = true;
    if (!this.lastSelectTime || now - this.lastSelectTime > 400) {
      rapid = false;
      this.lastSelectTime = now;
    }
    let next: any = void 0;
    const combatants = this.game.getCombatants();
    if (this.playerNum < combatants.length) next = combatants[this.playerNum];
    if (next && (this.player.value === next || (rapid && !this.player.value))) {
      if (rapid) {
        const cmd = new CenterBaseCmd(next, this.game.rules, this.mapPanningHelper, this.cameraPan);
        cmd.execute();
      } else {
        next = void 0;
      }
    }
    this.player.value = next;
  }
}
