/**
 * BoxedVar — 可订阅的值包装（设置项/运行时开关常用）。
 *
 * 由 util/BoxedVar.ts.js 重写为 TS（行为完全一致）。
 */
import { EventDispatcher } from "util/event";

export class BoxedVar<T> {
  private _onChange = new EventDispatcher();
  private _value: T;

  constructor(value: T) {
    this.value = value;
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    const changed = value !== this._value;
    this._value = value;
    if (changed) this._onChange.dispatch(this, value);
  }

  get onChange() {
    return this._onChange.asEvent();
  }
}
