/**
 * PingLocationAction — 小地图/雷达标记玩家点击的位置。
 *
 * 序列化载荷：tile x/y 各 u16（4 字节）。process 校验格子存在后
 * 派发 PingLocationEvent，并向本人与全部盟友各派发一条
 * RadarEvent(GenericNonCombat)。
 *
 * 由 game/action/PingLocationAction.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as DataStreamModule from "data/DataStream"; // 未转换（any-shim）
import { RadarEventType } from "game/rules/general/RadarRules"; // 已转换
import * as ActionModule from "game/action/Action"; // 已转换
import * as ActionTypeModule from "game/action/ActionType"; // 已转换
import * as RadarEventModule from "game/event/RadarEvent"; // 未转换（any-shim）
import * as PingLocationEventModule from "game/event/PingLocationEvent"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PingLocationAction extends ActionModule.Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  /** 处理时由 Action 队列外部注入（孪生基类无此字段声明）。 */
  player: any;
  tile: any;

  constructor(game: any) {
    super(ActionTypeModule.ActionType.PingLocation);
    this.game = game;
  }

  unserialize(data: any): void {
    const stream = new DataStreamModule.DataStream(data);
    this.tile = { x: stream.readUint16(), y: stream.readUint16() };
  }

  serialize(): any {
    const stream = new DataStreamModule.DataStream(4);
    stream.writeUint16(this.tile.x);
    stream.writeUint16(this.tile.y);
    return stream.toUint8Array();
  }

  print(): string {
    return `Ping location at tile (${this.tile.x}, ${this.tile.y})`;
  }

  process(): void {
    const player = this.player;
    const tile = this.game.map.tiles.getByMapCoords(this.tile.x, this.tile.y);
    if (!tile) {
      console.warn(`Tile ${this.tile.x},${this.tile.y} doesn't exist`);
      return;
    }
    this.game.events.dispatch(
      new PingLocationEventModule.PingLocationEvent(tile, player),
    );
    for (const recipient of [
      player,
      ...this.game.alliances.getAllies(player),
    ]) {
      this.game.events.dispatch(
        new RadarEventModule.RadarEvent(
          recipient,
          RadarEventType.GenericNonCombat,
          tile,
        ),
      );
    }
  }
}
