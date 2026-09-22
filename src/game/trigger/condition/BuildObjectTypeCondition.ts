/**
 * BuildObjectTypeCondition — 建造指定类别/索引对象条件。
 *
 * 由 game/trigger/condition/BuildObjectTypeCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 BuildBuilding/BuildUnit/BuildInfantry/BuildAircraft 四类事件，
 * 由工厂注入 ObjectType；objectIndex 取 params[1]（规则索引）。
 * check 扫描本批事件是否存在匹配 type+rules.index 的 ObjectSpawn。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class BuildObjectTypeCondition extends TriggerCondition {
  /** 期望的对象类别（Building/Vehicle/Infantry/Aircraft）。 */
  objectType: any;
  /** 期望的规则索引（params[1]）。 */
  objectIndex: number;

  constructor(event: any, trigger: any, objectType: any) {
    super(event, trigger);
    this.objectType = objectType;
    this.objectIndex = Number(event.params[1]);
  }

  /**
   * 检查本批事件中是否发生匹配的建造。
   *
   * @returns 有匹配则 true，否则 false。
   */
  check(_context?: any, events?: any[]): boolean {
    return events.some(
      (ev) =>
        ev.type === EventType.ObjectSpawn &&
        ev.gameObject.type === this.objectType &&
        ev.gameObject.rules.index === this.objectIndex,
    );
  }
}
