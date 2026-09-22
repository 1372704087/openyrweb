/**
 * ExtensionContext — 单个扩展在一次钩子调用中的受限上下文。
 *
 * 对应 YRpp 里"每个插件拿到自己的命名空间 + 辅助函数"。
 * 核心约束：所有 INI 写入强制落在 `OpenYRWeb.<ExtId>.*` 前缀下，
 * 插件无法覆盖其他插件或原版的键——把 Ares/Phobos 现在靠约定
 * 手写的命名空间隔离升级为 SDK 层强制。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 命名空间安全的 INI 写入器：所有键自动加前缀。 */
export class NamespacedIniWriter {
  constructor(
    private readonly section: any,
    /** 完整前缀，如 "OpenYRWeb.Ares."（含结尾点）。 */
    readonly prefix: string,
  ) {}

  /**
   * 写入一个键。key 为逻辑名（如 "Weapons.Enabled"），
   * 实际写入 `<prefix><key>`（如 "OpenYRWeb.Ares.Weapons.Enabled"）。
   */
  set(key: string, value: string | number | boolean): void {
    if (!this.section?.set) return;
    const fullKey = this.prefix + key;
    const raw =
      typeof value === "boolean" ? (value ? "yes" : "no") : String(value);
    this.section.set(fullKey, raw);
  }

  /** 读取（带前缀）；用于扩展读自己之前写的键。 */
  get(key: string): any {
    return this.section?.get?.(this.prefix + key);
  }

  /** 读布尔；缺省 yes/no/1/0/true/false/on/off。 */
  getBool(key: string, fallback = false): boolean {
    const v = this.get(key);
    if (v == null) return fallback;
    const s = String(v).trim().toLowerCase();
    if (["yes", "1", "true", "on"].includes(s)) return true;
    if (["no", "0", "false", "off"].includes(s)) return false;
    return fallback;
  }

  /** 读数字。 */
  getNumber(key: string, fallback = 0): number {
    const v = this.get(key);
    if (v == null) return fallback;
    const n = Number(String(v).replace(",", "."));
    return isNaN(n) ? fallback : n;
  }
}

/** 扩展在钩子中拿到的上下文。 */
export interface ExtensionHookContext {
  /** 扩展 id（如 "ares"）。 */
  readonly extensionId: string;
  /** 当前子功能是否生效（总开关已由 Host 判过）。 */
  isFeatureEnabled(featureId: string): boolean;
  /** 当前生效的全部子功能 id。 */
  getEnabledFeatures(): string[];
  /** 命名空间安全的 INI 写入器（针对 General 段）。 */
  ini: NamespacedIniWriter | null;
  /** 对局内 Game 引用；rules 钩子阶段为 null。 */
  game: any;
  /**
   * 注册一个游戏键位命令（必须是 KeyCommandType 成员）——注册后它会出现在
   * 「键盘设置」界面、可被用户改键，并由游戏统一在 keydown 中分发（自带 preventDefault）。
   *
   * 由 ExtensionHost 注入；rules 阶段等 GUI 未就绪的场景下可能为 undefined，调用方需容忍。
   * 走 ctx 而非让扩展直接 import ExtensionHost —— 后者会形成 ExtensionHost ⇄ 扩展 的循环依赖。
   */
  registerKeyCommand?(command: any, handler: () => void): void;
}

/** 构造一次钩子调用的上下文。 */
export function createHookContext(
  extensionId: string,
  config: {
    isFeatureEnabled(extId: string, featureId: string): boolean;
    getEnabledFeatureIds(extId: string): string[];
  },
  ini: any,
  game: any | null,
  /** 由 ExtensionHost 注入的键位命令注册器（对应 ExtensionHookContext.registerKeyCommand）。 */
  keyCommandRegistrar?: (command: any, handler: () => void) => void,
): ExtensionHookContext {
  const section = ini?.getOrCreateSection?.("General");
  const prefix = `OpenYRWeb.${extensionId}.`;
  const writer = section?.set ? new NamespacedIniWriter(section, prefix) : null;
  return {
    extensionId,
    isFeatureEnabled: (fid) => config.isFeatureEnabled(extensionId, fid),
    getEnabledFeatures: () => config.getEnabledFeatureIds(extensionId),
    ini: writer,
    game,
    registerKeyCommand: keyCommandRegistrar,
  };
}
