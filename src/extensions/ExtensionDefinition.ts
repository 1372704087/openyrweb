/**
 * ExtensionDefinition — 源码内置扩展（Ares / Phobos 等）的注册契约。
 *
 * 层级：
 *   扩展总开关（master）
 *     └── 功能组（feature）—— 可单独开关；总开关关闭时整组失效。
 *
 * YRpp 对齐字段：
 *   - dependsOn：依赖的其他扩展 id；加载时做拓扑排序，缺失依赖则跳过该扩展；
 *   - priority：数值越小越先执行（同依赖深度下的次序）；
 *   - hooks：引擎钩子处理函数（applyToRules / onMatchStart / onTick / …），
 *     由 ExtensionHost 按优先级序派发。钩子收到 ExtensionHookContext，
 *     INI 写入强制落在 OpenYRWeb.<ExtId>.* 命名空间下。
 */
import { ExtensionRuntimeHooks } from "extensions/ExtensionHooks";
import { ExtensionHookContext } from "extensions/ExtensionContext";

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

/** 数据钩子：Rules.init 解析前改写 rules INI。 */
export type ApplyToRulesHook = (ctx: ExtensionHookContext) => void;

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
   * 依赖的其他扩展 id（如 Phobos 可声明 dependsOn: ["ares"]）。
   * 依赖缺失或未启用时，本扩展整体跳过（规则钩子与运行时钩子均不执行）。
   */
  dependsOn?: string[];

  /**
   * 执行优先级：数值越小越先执行。缺省 100。
   * 仅在依赖拓扑排序结果相同时作为次级排序键。
   */
  priority?: number;

  /** 运行时钩子处理函数集合（含 applyToRules）。 */
  hooks?: ExtensionRuntimeHooks & {
    /** Rules.init 解析前改写 INI（数据钩子，init 期一次）。 */
    applyToRules?(ctx: ExtensionHookContext): void;
  };
}
