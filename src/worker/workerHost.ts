/**
 * worker/workerHost — 线程池宿主 API（decodeWav / VXL 几何 / 压缩）。
 *
 * 对外仅导出 workerHostApi 对象（与孪生 e("workerHostApi", …) 一致）：
 * - concurrency = (hardwareConcurrency || 4) - 1
 * - warmUpPool：惰性创建 Pool，spawn dist/worker.min.js?v=0.1.0
 * - queueTask：确保池就绪后把任务排入队列，回调收到 WorkerHostBridge
 * - waitForTasks / dispose：等待完成与终止池
 * 内部 WorkerHostBridge 类不导出（与孪生局部 class s 一致）。
 *
 * 由 worker/workerHost.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as threads from "threads"; // 孪生（第三方 any-shim）

/** 可注入的 worker 任务库（threads 门面的最小结构）。 */
export interface WorkerLibLike {
  /** 解码 WAV 字节。 */
  decodeWav(data: ArrayBuffer | Uint8Array | unknown): Promise<unknown>;
  /** 由 VXL 生成几何（先 toPlain）。 */
  generateVxlGeometry(vxl: { toPlain(): unknown }, args: unknown): Promise<unknown>;
  /** 压缩文件。 */
  compressFile(data: unknown, opts: unknown): Promise<unknown>;
}

/**
 * 每个池 worker 的桥接封装（不导出，对齐孪生局部 class）。
 * 构造时持有 threads 暴露的 workerLib，方法全部 async 透传。
 */
class WorkerHostBridge {
  readonly workerLib: WorkerLibLike;

  constructor(workerLib: WorkerLibLike) {
    this.workerLib = workerLib;
  }

  /** 解码 WAV。 */
  async decodeWav(data: ArrayBuffer | Uint8Array | unknown): Promise<unknown> {
    return this.workerLib.decodeWav(data);
  }

  /** 生成 VXL 几何：先把对象 toPlain 再交给库。 */
  async generateVxlGeometry(vxl: any, args: unknown): Promise<unknown> {
    return this.workerLib.generateVxlGeometry(vxl.toPlain(), args);
  }

  /** 压缩文件。 */
  async compressFile(data: unknown, opts: unknown): Promise<unknown> {
    return this.workerLib.compressFile(data, opts);
  }
}

/** 池任务回调：拿到桥接实例后执行业务。 */
export type WorkerTask = (api: WorkerHostBridge) => Promise<unknown> | unknown;

/** 对外暴露的 worker 宿主 API（模块唯一导出名 workerHostApi）。 */
export interface WorkerHostApi {
  /** 可用并发 worker 数（hardwareConcurrency-1，至少 3 侧语义与孪生一致）。 */
  readonly concurrency: number;
  /** 惰性创建线程池（幂等）。 */
  warmUpPool(): unknown;
  /** 把任务排入线程池（自动 ensure pool）。 */
  queueTask(task: WorkerTask): void;
  /** 等待队列内全部任务完成。 */
  waitForTasks(): Promise<void>;
  /** 终止池并清空引用。 */
  dispose(): Promise<void>;
}

/** 模块级池实例；warmUpPool 用 `??` 保证只创建一次。 */
let pool: any;

export const workerHostApi: WorkerHostApi = {
  concurrency: (navigator.hardwareConcurrency || 4) - 1,

  warmUpPool() {
    return (pool =
      pool ??
      (threads as any).Pool(() =>
        (threads as any).spawn(new (threads as any).Worker("./dist/worker.min.js?v=0.1.0")),
        this.concurrency,
      ));
  },

  queueTask(task: WorkerTask) {
    (this.warmUpPool(), pool.queue((workerLib: WorkerLibLike) => task(new WorkerHostBridge(workerLib))));
  },

  async waitForTasks() {
    await pool?.completed();
  },

  async dispose() {
    pool && (await pool.terminate(), (pool = void 0));
  },
};
