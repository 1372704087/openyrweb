/**
 * SelectTypeByCmd — 按类型选择：1 秒双击窗口内 selectByType。
 *
 * 运行时导出名为 SelectByTypeCmd（模块文件 SelectTypeByCmd）。
 * triggerMode = TriggerMode.KeyDownUp。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/SelectTypeByCmd.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerMode } from "gui/screen/game/worldInteraction/keyboard/KeyCommand"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 按类型选择命令（导出名 SelectByTypeCmd）。 */
export class SelectByTypeCmd {
  /** 单位选择处理器。 */
  unitSelectionHandler: any;
  /** 触发模式：按下+抬起。 */
  triggerMode = TriggerMode.KeyDownUp;
  /** 订阅释放。 */
  disposables = new CompositeDisposable();
  /** 按下时间戳（空表示未按下）。 */
  keyDownTime: number | undefined;
  /** 选择变化回调。 */
  handleUserSelectionUpdate: (update: any) => void;

  /**
   * @param unitSelectionHandler 选择处理器
   */
  constructor(unitSelectionHandler: any) {
    this.unitSelectionHandler = unitSelectionHandler;
    this.triggerMode = TriggerMode.KeyDownUp;
    this.disposables = new CompositeDisposable();
    this.handleUserSelectionUpdate = (update: any) => {
      if (!update.queryType && this.keyDownTime) {
        this.unitSelectionHandler.selectByType();
      }
    };
  }

  /** 订阅选择变化。 */
  init(): void {
    this.unitSelectionHandler.onUserSelectionUpdate.subscribe(this.handleUserSelectionUpdate);
    this.disposables.add(() =>
      this.unitSelectionHandler.onUserSelectionUpdate.unsubscribe(this.handleUserSelectionUpdate),
    );
  }

  /**
   * isKeyUp=false 记按下时间；isKeyUp=true 且 1s 内则 selectByType。
   * @param isKeyUp 是否为抬起触发
   */
  execute(isKeyUp: boolean): void {
    const now = Date.now();
    if (isKeyUp) {
      if (this.keyDownTime && now - this.keyDownTime <= 1e3) {
        this.unitSelectionHandler.selectByType();
      }
      this.keyDownTime = void 0;
    } else {
      this.keyDownTime ??= now;
    }
  }

  /** 释放订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
