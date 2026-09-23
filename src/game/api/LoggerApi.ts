/**
 * LoggerApi — 玩家维度日志门面（前缀时间戳 + level 切换）。
 *
 * 包装 AppLogger：setDebugLevel(true)→DEBUG、false→WARN；debug/info/
 * log/warn/error 在首参前插入 "[mm:ss]" 前缀（formatTimeDuration +
 * gameApi.getCurrentTime 取整秒）；time/timeEnd 直接透传。
 *
 * 由 game/api/LoggerApi.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
import { formatTimeDuration } from "util/format"; // 已转换
import { AppLogger } from "util/Logger"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class LoggerApi {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  /** 底层 js-logger 实例（孪生为 WeakMap 私有）。 */
  private logger: any;
  /** 提供 getCurrentTime 的 GameApi（孪生为 WeakMap 私有）。 */
  private gameApi: any;

  constructor(logger: any, gameApi: any) {
    this.logger = logger;
    this.gameApi = gameApi;
  }

  /** true→DEBUG 级，false→WARN 级。 */
  setDebugLevel(enabled: any): void {
    this.logger.setLevel(enabled ? AppLogger.DEBUG : AppLogger.WARN);
  }

  debug(...args: any[]): void {
    this.logger.debug(this.formatPrefix(), ...args);
  }

  info(...args: any[]): void {
    this.logger.info(this.formatPrefix(), ...args);
  }

  log(...args: any[]): void {
    this.logger.log(this.formatPrefix(), ...args);
  }

  warn(...args: any[]): void {
    this.logger.warn(this.formatPrefix(), ...args);
  }

  error(...args: any[]): void {
    this.logger.error(this.formatPrefix(), ...args);
  }

  time(label: any): void {
    this.logger.time(label);
  }

  timeEnd(label: any): void {
    this.logger.timeEnd(label);
  }

  /** "[mm:ss]" 前缀（孪生 WeakSet 私有方法）。 */
  private formatPrefix(): string {
    return (
      "[" +
      formatTimeDuration(Math.floor(this.gameApi.getCurrentTime())) +
      "]"
    );
  }
}
