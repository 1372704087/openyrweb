/**
 * Sentry — @sentry/browser 的薄封装（懒初始化，未 init 时调用静默跳过）。
 *
 * 由 util/Sentry.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as BrowserSdk from "@sentry/browser"; // 孪生

/** init 所需的业务配置（来自 Config 的 [Sentry] 节）。 */
export interface SentryInitOptions {
  dsn: string;
  tunnel?: string;
  env: string;
  defaultIntegrations: boolean;
  autoSessionTracking: boolean;
}

/** 与 SDK 可用方法对齐的最小接口；captureException 等在 sdk 未赋值时 ?. 短路。 */
interface SentrySdkLike {
  init(options: Record<string, unknown>): void;
  captureException(error: unknown, hint?: unknown): void;
  configureScope(callback: (scope: any) => void): void;
  addBreadcrumb(breadcrumb: Record<string, unknown>): void;
}

/** 全局 Sentry 包装单例（模块级导出）。 */
export class Sentry {
  /** 仅在 init 后有值；之前所有写操作方法为 no-op。 */
  private sdk?: SentrySdkLike;

  /**
   * 初始化底层 SDK。
   *
   * - release 由调用方传入（通常为 version）。
   * - denyUrls 屏蔽 file: 页面；ignoreErrors 过滤一批已知环境噪音。
   * - initialScope 打 locale 标签与 initTime 附加字段。
   * - defaultIntegrations 为 false 时才显式传入该键（与孪生展开一致）。
   */
  init(options: SentryInitOptions, release?: string): void {
    const sdk = (this.sdk = BrowserSdk as unknown as SentrySdkLike);
    const initTime = new Date();
    sdk.init({
      dsn: options.dsn,
      tunnel: options.tunnel,
      environment: options.env,
      release,
      denyUrls: [/^file:/],
      ignoreErrors: [
        /init message from worker/,
        /The object can not be found here/,
        /itemsclipboard/,
        /A requested file or directory could not be found/,
        /The requested file could not be read/,
        /The play\(\) request/,
        /^db$/,
      ],
      initialScope: (scope: any) => scope.setTags({ locale: navigator.language }).setExtra("initTime", initTime),
      ...(options.defaultIntegrations ? {} : { defaultIntegrations: false }),
      autoSessionTracking: options.autoSessionTracking,
    });
  }

  captureException(error: unknown, hint?: unknown): void {
    this.sdk?.captureException(error, hint);
  }

  configureScope(callback: (scope: any) => void): void {
    this.sdk?.configureScope(callback);
  }

  addBreadcrumb(breadcrumb: Record<string, unknown>): void {
    this.sdk?.addBreadcrumb(breadcrumb);
  }
}
