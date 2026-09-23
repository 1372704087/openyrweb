/**
 * TechBuildingCapturedCondition — 科技建筑被占领条件。
 *
 * 事件 24: TechBuildingCaptured — 当 Capturable=yes 的科技建筑被占领时触发。
 * 参数: params[1] = 占领方阵营国家 ID（0 表示任意阵营占领都触发）。
 * 实现: 监听 BuildingCaptureEvent（SecureProgressTrait/CaptureBuildingTask 派发；
 * 派发时 target.owner 已是新占领方），并按规则 Capturable 标志过滤。
 *
 * 由 game/trigger/condition/TechBuildingCapturedCondition.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class TechBuildingCapturedCondition extends TriggerCondition {
  /** 新占领方国家 id；0 = 任意。 */
  readonly houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.houseId = Number(this.event.params[1] || 0);
  }

  check(_game: any, events: any[]): any[] {
    return events
      .filter((ev) => {
        if (ev.type !== EventType.BuildingCapture) return false;
        const target = ev.target;
        if (!target) return false;
        if (!target.rules.capturable) return false;
        if (target.isDestroyed) return false;
        // 0 = 任意阵营
        if (this.houseId !== 0 && target.owner?.country?.id !== this.houseId) return false;
        return true;
      })
      .map((ev) => ev.target);
  }
}
