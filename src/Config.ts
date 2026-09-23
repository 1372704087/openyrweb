/**
 * Config — 应用配置（IniFile → 强类型访问器 + CORS 代理表）。
 *
 * 由 Config.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { IniSection } from "data/IniSection"; // 孪生

/** 应用 INI 配置的最小接口（load 只依赖 getSection）。 */
export interface ConfigSource {
  getSection(name: string): IniSection | undefined;
}

/** [Sentry] 节解析结果；tunnel 空串归一为 undefined。 */
export interface SentryConfig {
  dsn: string;
  tunnel?: string;
  env: string;
  defaultIntegrations: boolean;
  autoSessionTracking: boolean;
}

/** 视口逻辑分辨率。 */
export interface ViewportConfig {
  width: number;
  height: number;
}

/** 顶层 Config 类。 */
export class Config {
  /** CORS 代理规则 [匹配键, 代理 URL]，保持 [CorsProxy] 节插入序。 */
  corsProxies: [string, string][] = [];
  /** [General] 原始节（load 后由各 getter 惰性读取）。 */
  generalData!: IniSection;
  /** [Sentry] 解析结果；无该节则保持 undefined。 */
  sentry?: SentryConfig;
  /** 视口 width/height。 */
  viewport!: ViewportConfig;

  /**
   * 从 IniFile 灌入配置。
   * - 缺少 [General] 抛错；有 [Sentry] 才构造 sentry。
   * - [CorsProxy] 的 entries 全部 push 进 corsProxies（不清空旧值，与孪生一致）。
   */
  load(config: ConfigSource): void {
    const general = config.getSection("General");
    if (!general) throw new Error("Missing [General] section in application config");
    this.generalData = general;
    this.viewport = {
      width: general.getNumber("viewport.width"),
      height: general.getNumber("viewport.height"),
    };
    const sentry = config.getSection("Sentry");
    if (sentry) {
      this.sentry = {
        dsn: sentry.getString("dsn"),
        tunnel: sentry.getString("tunnel") || void 0,
        env: sentry.getString("env"),
        defaultIntegrations: sentry.getBool("defaultIntegrations"),
        autoSessionTracking: sentry.getBool("autoSessionTracking"),
      };
    }
    const cors = config.getSection("CorsProxy");
    if (cors)
      for (const [match, proxy] of cors.entries) this.corsProxies.push([match as string, proxy as string]);
  }

  /** 默认界面语言（缺省 en-US）。 */
  get defaultLocale(): string {
    return this.generalData.getString("defaultLanguage", "en-US");
  }

  /** 服务器列表 INI 相对路径（缺省 servers.ini）。 */
  get serversUrl(): string {
    return this.generalData.getString("serversUrl", "servers.ini");
  }

  /** GameRes 服务 base URL；未配置 → undefined。 */
  get gameresBaseUrl(): string | undefined {
    return this.generalData.getString("gameresBaseUrl") || void 0;
  }

  /** 主资源包（6 个 mix 所在）归档 URL。 */
  get gameResArchiveUrl(): string {
    return this.generalData.getString("gameResArchiveUrl");
  }

  /**
   * YR 扩展包归档 URL（与 gameResArchiveUrl 配对，支撑
   * 「一键下载双 exe + 解出 6 个 mix」流程）。
   */
  get gameResExpansionArchiveUrl(): string {
    return this.generalData.getString("gameResExpansionArchiveUrl");
  }

  /** 地图库 base URL。 */
  get mapsBaseUrl(): string {
    return this.generalData.getString("mapsBaseUrl");
  }

  /** Mod 库 base URL。 */
  get modsBaseUrl(): string {
    return this.generalData.getString("modsBaseUrl");
  }

  /** 开发模式开关（[General] dev）。 */
  get devMode(): boolean {
    return this.generalData.getBool("dev");
  }

  /** Discord 邀请链接；空 → undefined。 */
  get discordUrl(): string | undefined {
    const value = this.generalData.getString("discordUrl");
    if (value.length) return value;
  }

  /** 更新日志链接；空 → undefined。 */
  get patchNotesUrl(): string | undefined {
    const value = this.generalData.getString("patchNotesUrl");
    if (value.length) return value;
  }

  /** 天梯规则文档链接；空 → undefined。 */
  get ladderRulesUrl(): string | undefined {
    const value = this.generalData.getString("ladderRulesUrl");
    if (value.length) return value;
  }

  /** Mod SDK 文档链接；空 → undefined。 */
  get modSdkUrl(): string | undefined {
    const value = this.generalData.getString("modSdkUrl");
    if (value.length) return value;
  }

  /** 捐赠页链接；空 → undefined。 */
  get donateUrl(): string | undefined {
    const value = this.generalData.getString("donateUrl");
    if (value.length) return value;
  }

  /** 回放 URL 白名单（逗号分隔 → 数组）。 */
  get replaysUrlWhitelist(): string[] {
    return this.generalData.getArray("replaysUrlWhitelist");
  }

  /** 首页突发新闻链接；空 → undefined。 */
  get breakingNewsUrl(): string | undefined {
    const value = this.generalData.getString("breakingNewsUrl");
    if (value.length) return value;
  }

  /** 快速匹配开关。 */
  get quickMatchEnabled(): boolean {
    return this.generalData.getBool("quickMatchEnabled");
  }

  /** 非排位队列开关（缺省 true）。 */
  get unrankedQueueEnabled(): boolean {
    return this.generalData.getBool("unrankedQueueEnabled", true);
  }

  /** 是否允许机器人。 */
  get botsEnabled(): boolean {
    return this.generalData.getBool("botsEnabled");
  }

  /** 旧客户端 base URL；空 → undefined。 */
  get oldClientsBaseUrl(): string | undefined {
    const value = this.generalData.getString("oldClientsBaseUrl");
    if (value.length) return value;
  }

  /** 调试：游戏状态转储开关。 */
  get debugGameState(): boolean {
    return this.generalData.getBool("debugGameState");
  }

  /**
   * 调试日志级别：
   * - 键未设或空 → undefined（关闭）；
   * - 若解析为真布尔则返回 true；若为非空但非真值字符串则返回该字符串本身
   *   （`getBool || e` 保留如 "verbose" 一类自由文本，与孪生一致）。
   */
  get debugLogging(): boolean | string | undefined {
    const raw = this.generalData.getString("debugLogging") || void 0;
    if (!raw) return void 0;
    return this.generalData.getBool("debugLogging") || raw;
  }

  /**
   * 按 URL 查 CORS 代理：
   * - 规则键以 "." 开头 → 后缀匹配（url.endsWith(key)）；
   * - 否则全等匹配；
   * - 键为 "*" 的规则作为通配兜底（扫描中记住，无精确命中时返回）。
   */
  getCorsProxy(url: string): string | undefined {
    let wildcard: string | undefined;
    for (const [match, proxy] of this.corsProxies) {
      if (match.startsWith(".") ? url.endsWith(match) : url === match) return proxy;
      if ("*" === match) wildcard = proxy;
    }
    return wildcard;
  }
}
