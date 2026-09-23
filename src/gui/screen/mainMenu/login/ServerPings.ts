/**
 * ServerPings — 并发探测各可用区域 WOL 延迟。
 *
 * 每个区域新建 WolConnection，CONNECT_TIMEOUT=5 秒，ping(5)；
 * 取消/失败时 pings 置 undefined 并回调 onProgress。
 *
 * 由 gui/screen/mainMenu/login/ServerPings.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 已转换
import { WolConnection } from "network/WolConnection"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ServerPings {
  /** 连接超时秒数（孪生静态字段）。 */
  static CONNECT_TIMEOUT = 5;

  /** 区域列表。 */
  regions: any;
  /** WOL 日志器。 */
  wolLogger: any;
  /** 区域 → 最近一次 ping（undefined=失败/进行中）。 */
  pings = new Map<any, any>();

  constructor(regions: any, wolLogger: any) {
    this.regions = regions;
    this.wolLogger = wolLogger;
  }

  /** 对全部 available 区域并发 ping；cancelToken 可中断。 */
  async update(onProgress?: (() => void) | undefined, cancelToken?: any): Promise<void> {
    await Promise.all(
      this.regions
        .getAll()
        .filter((r: any) => r.available)
        .map(async (region: any) => {
          let conn = WolConnection.factory(this.wolLogger);
          try {
            await conn.connect(region.wolUrl, {
              timeoutSeconds: ServerPings.CONNECT_TIMEOUT,
              cancelToken,
            });
          } catch (e) {
            if (!(e instanceof OperationCanceledError)) {
              console.error(e);
              conn.close();
              this.pings.set(region, void 0);
            }
            return onProgress?.();
          }
          let ping: any;
          try {
            ping = await conn.ping(5);
          } catch (e) {
            console.error(e);
          } finally {
            conn.close();
          }
          if (!cancelToken?.isCancelled()) {
            this.pings.set(region, ping);
            onProgress?.();
          }
        }),
    );
  }
}
