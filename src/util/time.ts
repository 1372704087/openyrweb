/**
 * time — 时间节流与异步休眠工具。
 *
 * sleep(ms)：Promise 包装 setTimeout；throttle(fn, wait)：节流包装（进行中不重入）；
 * Throttle(wait)：装饰器形式，把方法换成节流版。
 *
 * 由 util/time.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 异步等待 ms 毫秒后 resolve。 */
export async function sleep(t?: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), t);
  });
}

/**
 * 节流：距上次放行不足 wait 毫秒时，先 sleep 补齐间隔再调用原函数。
 * 进行中的节流（inFlight）期间调用直接返回 undefined（不排队、不重入）。
 * 返回的包装函数保持 async，且用 apply 透传 this 与参数。
 */
export function throttle<T extends (...args: any[]) => any>(
  r: T,
  s: number,
): (...args: Parameters<T>) => Promise<void> {
  let a = false;
  let n = Number.NEGATIVE_INFINITY;
  return async function (this: unknown, ...e: Parameters<T>): Promise<void> {
    if (!a) {
      const t = Date.now();
      const i = t - n;
      if (s <= i) {
        n = t;
      } else {
        a = true;
        await sleep(s - i);
        a = false;
        n = Date.now();
      }
      await r.apply(this, e);
    }
  };
}

/**
 * 方法装饰器：把目标方法替换成 throttle(fn, wait)。
 * 用法：@Throttle(16) onTick(...)。
 */
export function Throttle(s: number) {
  return function (_e: unknown, _t: string, i: PropertyDescriptor): void {
    const r = i.value;
    i.value = throttle(r, s);
  };
}
