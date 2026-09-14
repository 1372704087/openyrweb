/**
 * RadarRules — 雷达事件规则（小地图上事件标记的表现参数）。
 *
 * 三张数组表按事件类型（RadarEventType）索引：抑制距离（多远内不重复
 * 报警）、可见时长（标记停留）、总时长；越界索引抛 RangeError。
 *
 * 由 game/rules/general/RadarRules.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 雷达事件类型（三张数组的索引依据）。 */
export enum RadarEventType {
  /** 通用战斗事件。 */
  GenericCombat = 0,
  /** 通用非战斗事件。 */
  GenericNonCombat = 1,
  /** 空投区。 */
  DropZone = 2,
  /** 基地遇袭。 */
  BaseUnderAttack = 3,
  /** 矿车遇袭。 */
  HarvesterUnderAttack = 4,
  /** 敌方目标被侦测。 */
  EnemyObjectSensed = 5,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RadarRules {
  eventSuppressionDistances: any;
  eventVisibilityDurations: any;
  eventDurations: any;
  /** 雷达标记闪烁的帧间隔。 */
  flashFrameTime: any;
  /** 战斗事件闪烁时长。 */
  combatFlashTime: any;
  eventMinRadius: any;
  eventSpeed: any;
  eventRotationSpeed: any;
  eventColorSpeed: any;

  /** 从 [General] 段读取本组键（链式返回 this）。 */
  readIni(ini: any): this {
    this.eventSuppressionDistances = ini.getNumberArray("RadarEventSuppressionDistances");
    this.eventVisibilityDurations = ini.getNumberArray("RadarEventVisibilityDurations");
    this.eventDurations = ini.getNumberArray("RadarEventDurations");
    this.flashFrameTime = ini.getNumber("FlashFrameTime");
    this.combatFlashTime = ini.getNumber("RadarCombatFlashTime");
    this.eventMinRadius = ini.getNumber("RadarEventMinRadius");
    this.eventSpeed = ini.getNumber("RadarEventSpeed");
    this.eventRotationSpeed = ini.getNumber("RadarEventRotationSpeed");
    this.eventColorSpeed = ini.getNumber("RadarEventColorSpeed");
    return this;
  }

  /** 事件类型的抑制距离（同距离内不重复报警）；越界抛 RangeError。 */
  getEventSuppresionDistance(eventType: RadarEventType): any {
    if (eventType > this.eventSuppressionDistances.length - 1)
      throw new RangeError("No event suppression distance is defined for type " + RadarEventType[eventType]);
    return this.eventSuppressionDistances[eventType];
  }

  /** 事件类型的标记可见时长；越界抛 RangeError。 */
  getEventVisibilityDuration(eventType: RadarEventType): any {
    if (eventType > this.eventVisibilityDurations.length - 1)
      throw new RangeError("No event visibility duration is defined for type " + RadarEventType[eventType]);
    return this.eventVisibilityDurations[eventType];
  }

  /** 事件类型的总时长；越界抛 RangeError。 */
  getEventDuration(eventType: RadarEventType): any {
    if (eventType > this.eventDurations.length - 1)
      throw new RangeError("No event duration is defined for type " + RadarEventType[eventType]);
    return this.eventDurations[eventType];
  }
}
