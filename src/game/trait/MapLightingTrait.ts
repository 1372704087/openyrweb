/**
 * MapLightingTrait — 地图环境光渐变 trait（挂在世界/玩家侧）。
 *
 * 持有 MapLighting 快照与 ambientChangeRate/Step。设定目标环境光强度后，
 * 每隔 floor(60×BASE_TICKS_PER_SECOND×rate) tick 按 step 向目标逼近一步，
 * 每步派发 _onChange 供渲染订阅。onChange getter 暴露为事件形态。
 *
 * 由 game/trait/MapLightingTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as MapLightingModule from "data/map/MapLighting"; // 未转换（any-shim）
type MapLighting = any;
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import * as NotifyTickModule from "game/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MapLightingTrait {
  /** 当前地图光照快照。 */
  mapLighting: MapLighting;
  /** 内部变更派发器。 */
  _onChange: EventDispatcher;
  /** ambient 每隔多少 tick 允许变一步（换算见 onTick）。 */
  ambientChangeRate: number;
  /** 每次变更允许的最大步长。 */
  ambientChangeStep: number;
  /** 目标 ambient 强度（未设定则为 undefined）。 */
  targetAmbient: number | undefined;
  /** 距下次 ambient 步进的剩余 tick（首次使用时惰性初始化）。 */
  ambientUpdateTicks: number | undefined;

  /** 变更事件（每次 ambient 实际变化时派发）。 */
  get onChange() {
    return this._onChange.asEvent();
  }

  constructor(rules: any, initial?: any) {
    this.mapLighting = new MapLightingModule.MapLighting();
    this._onChange = new EventDispatcher();
    this.ambientChangeRate = rules.ambientChangeRate;
    this.ambientChangeStep = rules.ambientChangeStep;
    if (initial) this.mapLighting.copy(initial);
  }

  /** 设置 ambient 变化速率。 */
  setAmbientChangeRate(rate: number): void {
    this.ambientChangeRate = rate;
  }

  /** 设置 ambient 单次步长上限。 */
  setAmbientChangeStep(step: number): void {
    this.ambientChangeStep = step;
  }

  /** 设定目标 ambient 强度（触发后续逐 tick 渐变）。 */
  setTargetAmbientIntensity(target: number): void {
    this.targetAmbient = target;
  }

  /** 取当前 MapLighting 快照。 */
  getAmbient(): MapLighting {
    return this.mapLighting;
  }

  /** 每 tick：向 targetAmbient 逐步逼近并派发变更。 */
  [NotifyTickModule.NotifyTick.onTick](): void {
    if (void 0 !== this.targetAmbient) {
      if (this.ambientUpdateTicks == null) {
        this.ambientUpdateTicks = Math.floor(60 * GameSpeed.BASE_TICKS_PER_SECOND * this.ambientChangeRate);
      }
      if (this.ambientUpdateTicks <= 0) {
        this.ambientUpdateTicks = void 0;
        let delta = this.targetAmbient - this.mapLighting.ambient;
        if (delta) {
          delta = Math.sign(delta) * Math.min(this.ambientChangeStep, Math.abs(delta));
          this.mapLighting.ambient += delta;
          this._onChange.dispatch(this, this.mapLighting);
        } else {
          this.targetAmbient = void 0;
        }
      } else {
        this.ambientUpdateTicks--;
      }
    }
  }
}
