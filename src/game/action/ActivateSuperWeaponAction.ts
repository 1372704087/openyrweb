/**
 * ActivateSuperWeaponAction — 玩家激活超级武器。
 *
 * 序列化载荷：superWeaponType(u8) + tile 坐标对数(u8: 2 或 4) +
 * tile1(x,y 各 u16) [+ tile2(x,y)]。process 解析目标格后交给
 * SuperWeaponsTrait.activateSuperWeapon；目标格不存在时仅 warn。
 *
 * 由 game/action/ActivateSuperWeaponAction.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */
import { SuperWeaponType } from "game/type/SuperWeaponType"; // 已转换
import * as DataStreamModule from "data/DataStream"; // 未转换（any-shim）
import * as ActionTypeModule from "game/action/ActionType"; // 已转换
import * as SuperWeaponsTraitModule from "game/trait/SuperWeaponsTrait"; // 未转换（any-shim）
import * as ActionModule from "game/action/Action"; // 已转换
export class ActivateSuperWeaponAction extends ActionModule.Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  /** 处理时由 Action 队列外部注入（孪生基类无此字段声明）。 */
  player: any;
  superWeaponType: any;
  tile: any;
  tile2: any;

  constructor(game: any) {
    super(ActionTypeModule.ActionType.ActivateSuperWeapon);
    this.game = game;
  }

  unserialize(data: any): void {
    const stream = new DataStreamModule.DataStream(data);
    this.superWeaponType = stream.readUint8();
    const tileCount = stream.readUint8();
    this.tile = { x: stream.readUint16(), y: stream.readUint16() };
    this.tile2 =
      tileCount > 2
        ? { x: stream.readUint16(), y: stream.readUint16() }
        : void 0;
  }

  serialize(): any {
    const stream = new DataStreamModule.DataStream(6 + (this.tile2 ? 4 : 0));
    stream.dynamicSize = false;
    stream.writeUint8(this.superWeaponType);
    stream.writeUint8(this.tile2 ? 4 : 2);
    stream.writeUint16(this.tile.x);
    stream.writeUint16(this.tile.y);
    if (this.tile2) {
      stream.writeUint16(this.tile2.x);
      stream.writeUint16(this.tile2.y);
    }
    return stream.toUint8Array();
  }

  print(): string {
    return (
      `Activate SuperW ${SuperWeaponType[this.superWeaponType]} at tile (${this.tile.x}, ${this.tile.y})` +
      (this.tile2 ? `, (${this.tile2.x}, ${this.tile2.y})` : "")
    );
  }

  process(): void {
    const player = this.player;
    const tile = this.game.map.tiles.getByMapCoords(this.tile.x, this.tile.y);
    if (!tile) {
      console.warn(`Tile ${this.tile.x},${this.tile.y} doesn't exist`);
      return;
    }
    const tile2 = this.tile2
      ? this.game.map.tiles.getByMapCoords(this.tile2.x, this.tile2.y)
      : void 0;
    this.game.traits
      .get(SuperWeaponsTraitModule.SuperWeaponsTrait)
      .activateSuperWeapon(
        this.superWeaponType,
        player,
        this.game,
        tile,
        tile2,
      );
  }
}
