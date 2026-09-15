/**
 * ExtensionHost — 源码扩展的注册表与应用入口。
 *
 * 用法：
 *  1. Application 启动时 ExtensionConfig.fromJson + bindConfig()；
 *  2. Rules.init() 开头 applyToRules(ini)，按总开关/子功能改写 INI；
 *  3. 扩展页 ExtensionsScreen 读写同一 ExtensionConfig 实例并写入 LocalPrefs。
 */
import { ExtensionDefinition } from "extensions/ExtensionDefinition";
import { ExtensionConfig } from "extensions/ExtensionConfig";
import { aresExtension } from "extensions/ares/AresExtension";
import { phobosExtension } from "extensions/phobos/PhobosExtension";

export class ExtensionHost {
  private static readonly registry = new Map<string, ExtensionDefinition>();
  private static config: ExtensionConfig | null = null;
  private static registered = false;

  static registerBuiltins(): void {
    if (ExtensionHost.registered) return;
    ExtensionHost.register(aresExtension);
    ExtensionHost.register(phobosExtension);
    ExtensionHost.registered = true;
  }

  static register(ext: ExtensionDefinition): void {
    ExtensionHost.registry.set(ext.id, ext);
  }

  static getRegistered(): ExtensionDefinition[] {
    ExtensionHost.registerBuiltins();
    return [...ExtensionHost.registry.values()];
  }

  static getDefinition(id: string): ExtensionDefinition | undefined {
    ExtensionHost.registerBuiltins();
    return ExtensionHost.registry.get(id);
  }

  /** 绑定运行时配置（同一实例，界面改动立即对后续新开局生效）。 */
  static bindConfig(config: ExtensionConfig | null): void {
    ExtensionHost.config = config;
  }

  static getConfig(): ExtensionConfig {
    ExtensionHost.registerBuiltins();
    if (!ExtensionHost.config) {
      ExtensionHost.config = ExtensionConfig.createDefault(ExtensionHost.getRegistered());
    }
    return ExtensionHost.config;
  }

  /** 按当前配置创建默认实例（Application 启动时用）。 */
  static createConfigFromStorage(json: string | undefined | null): ExtensionConfig {
    ExtensionHost.registerBuiltins();
    return ExtensionConfig.fromJson(json, ExtensionHost.getRegistered());
  }

  static isEnabled(id: string): boolean {
    return !!ExtensionHost.getConfig()?.getMaster(id);
  }

  static isFeatureEnabled(extId: string, featureId: string): boolean {
    return !!ExtensionHost.getConfig()?.isFeatureEnabled(extId, featureId);
  }

  /**
   * 对 rules INI 应用所有「总开关开启」的扩展。
   * Rules.init 在读取任何段之前调用。
   */
  static applyToRules(ini: any): void {
    ExtensionHost.registerBuiltins();
    const config = ExtensionHost.getConfig();
    for (const ext of ExtensionHost.registry.values()) {
      if (!config.getMaster(ext.id)) continue;
      try {
        ext.applyToRules?.(ini, config);
      } catch (err) {
        console.warn(`Extension "${ext.id}" applyToRules failed`, err);
      }
    }
  }
}
