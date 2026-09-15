/**
 * ExtensionDefinition — 源码内置扩展（Ares / Phobos 等）的注册契约。
 *
 * 层级：
 *   扩展总开关（master）
 *     └── 功能组（feature）—— 可单独开关；总开关关闭时整组失效。
 */
import { ExtensionConfig } from "extensions/ExtensionConfig";

/** 单个子功能的静态定义（不随用户状态变化）。 */
export interface ExtensionFeatureDef {
  /** 扩展内稳定 id，如 "weapons"。 */
  id: string;
  /** 文案 key（locale）。 */
  labelKey: string;
  /** 提示文案 key（可选）。 */
  hintKey?: string;
  /** 默认是否开启（总开关默认开时生效）。 */
  defaultEnabled?: boolean;
}

export interface ExtensionDefinition {
  /** 稳定 id：与存储/序列化字段对应，如 "ares"、"phobos"。 */
  id: string;
  /** 展示名。 */
  name: string;
  /** 说明文案 key。 */
  descriptionKey?: string;
  /** 子功能列表（设置界面按此顺序渲染）。 */
  features: ExtensionFeatureDef[];
  /**
   * 在 Rules.init 解析前改写 rules INI。
   * 仅在总开关开启时调用；内部用 config.isFeatureEnabled 判断子功能。
   */
  applyToRules?: (ini: any, config: ExtensionConfig) => void;
}
