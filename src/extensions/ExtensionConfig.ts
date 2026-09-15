/**
 * ExtensionConfig — 扩展开关的运行时状态（总开关 + 子功能）。
 *
 * 存储：LocalPrefs StorageKey.Extensions（JSON）。
 * 与 GeneralOptions 逗号序列化解耦，便于以后加任意扩展/功能项。
 *
 * 不依赖 ExtensionHost（避免环）：默认值由注册表定义数组传入。
 */
import { ExtensionDefinition } from "extensions/ExtensionDefinition";

export interface ExtensionMasterState {
  master: boolean;
  /** featureId → 是否开启（总开关关闭时读取值仍保留，UI 可灰显展示）。 */
  features: Record<string, boolean>;
}

export interface ExtensionConfigSnapshot {
  extensions: Record<string, ExtensionMasterState>;
}

export class ExtensionConfig {
  private state: ExtensionConfigSnapshot = { extensions: {} };

  /** 按定义生成默认状态（总开 + 各 feature defaultEnabled，缺省 true）。 */
  static createDefault(definitions: ExtensionDefinition[]): ExtensionConfig {
    const config = new ExtensionConfig();
    for (const ext of definitions) {
      const features: Record<string, boolean> = {};
      for (const f of ext.features) {
        features[f.id] = f.defaultEnabled !== false;
      }
      config.state.extensions[ext.id] = { master: true, features };
    }
    return config;
  }

  /** 从 JSON 文本恢复；未知扩展/功能用默认补齐，坏数据整体回退默认。 */
  static fromJson(
    json: string | undefined | null,
    definitions: ExtensionDefinition[],
  ): ExtensionConfig {
    const config = ExtensionConfig.createDefault(definitions);
    if (!json) return config;
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || !parsed.extensions) return config;
      for (const ext of definitions) {
        const saved = parsed.extensions[ext.id];
        if (!saved || typeof saved !== "object") continue;
        if (typeof saved.master === "boolean") {
          config.state.extensions[ext.id].master = saved.master;
        }
        if (saved.features && typeof saved.features === "object") {
          for (const f of ext.features) {
            const v = saved.features[f.id];
            if (typeof v === "boolean") config.state.extensions[ext.id].features[f.id] = v;
          }
        }
      }
    } catch (err) {
      console.warn("Couldn't parse ExtensionConfig JSON", err);
    }
    return config;
  }

  toJson(): string {
    return JSON.stringify(this.state);
  }

  snapshot(): ExtensionConfigSnapshot {
    return JSON.parse(JSON.stringify(this.state)) as ExtensionConfigSnapshot;
  }

  private ensure(extId: string): ExtensionMasterState {
    if (!this.state.extensions[extId]) {
      this.state.extensions[extId] = { master: false, features: {} };
    }
    return this.state.extensions[extId];
  }

  getMaster(extId: string): boolean {
    return !!this.state.extensions[extId]?.master;
  }

  setMaster(extId: string, enabled: boolean): void {
    this.ensure(extId).master = enabled;
  }

  /** 子功能原始勾选值（不受总开关影响，供 UI 展示）。 */
  getFeatureRaw(extId: string, featureId: string): boolean {
    return !!this.state.extensions[extId]?.features?.[featureId];
  }

  /**
   * 运行时生效判定：总开关关闭 → 一律 false；
   * 否则看子功能勾选。
   */
  isFeatureEnabled(extId: string, featureId: string): boolean {
    if (!this.getMaster(extId)) return false;
    return this.getFeatureRaw(extId, featureId);
  }

  setFeature(extId: string, featureId: string, enabled: boolean): void {
    this.ensure(extId).features[featureId] = enabled;
  }

  /** 某扩展下所有「运行时生效」的功能 id。 */
  getEnabledFeatureIds(extId: string): string[] {
    if (!this.getMaster(extId)) return [];
    const state = this.state.extensions[extId];
    return Object.keys(state?.features || {}).filter((id) => state.features[id]);
  }
}
