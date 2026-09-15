/**
 * CompositeDisposable — 一次性释放的清理容器。
 *
 * add() 接受函数（包装为 {dispose: fn}）或带 dispose/destroy 的对象；
 * dispose() 时按注册顺序逐个释放并清空集合。
 *
 * 由 util/disposable/CompositeDisposable.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const isNotDisposable = (item: any) => !item.dispose;

export class CompositeDisposable {
  disposables = new Set<any>();

  /** 批量注册：函数包装为 {dispose: fn}，对象原样入集。 */
  add(...items: any[]): void {
    items.map((item) => this.disposables.add(typeof item === "function" ? { dispose: item } : item));
  }

  remove(...items: any[]): void {
    items.map((item) => this.disposables.delete(item));
  }

  /** 逐个释放并清空（函数直接调用、有 destroy 的走 destroy、其余走 dispose）。 */
  dispose(): void {
    this.disposables.forEach((item) => {
      if (typeof item === "function") item();
      else if (isNotDisposable(item)) item.destroy();
      else item.dispose();
    });
    this.disposables.clear();
  }
}
