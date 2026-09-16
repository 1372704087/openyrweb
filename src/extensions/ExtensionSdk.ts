/**
 * ExtensionSdk — 多扩展共享的公共 SDK（对应 YRpp 的 .hpp 头部集合）。
 *
 * 每个插件（Ares / Phobos / 未来第三方）统一从这里 import：
 *   import { ExtensionSdk } from "extensions/ExtensionSdk";
 *
 * 提供：
 *  - 类型：ExtensionDefinition / ExtensionHookContext / 各钩子 Payload；
 *  - 命名空间 INI 写入器（强制 OpenYRWeb.<ExtId>.* 前缀）；
 *  - 事件总线（插件间松耦合通信）；
 *  - Host 快捷访问（isEnabled / isFeatureEnabled / emitEvent）。
 *
 * 设计约束：
 *  - 插件不得绕过 ExtensionContext.ini 直接写 General 段的裸键——
 *    命名空间隔离是 SDK 层强制，不是约定；
 *  - 插件间通信走事件总线，不直接 import 对方模块（避免硬耦合）。
 */

export {
  ExtensionDefinition,
  ExtensionFeatureDef,
  ApplyToRulesHook,
} from "extensions/ExtensionDefinition";
export {
  ExtensionConfig,
  ExtensionMasterState,
  ExtensionConfigSnapshot,
} from "extensions/ExtensionConfig";
export {
  ExtensionHookContext,
  NamespacedIniWriter,
  createHookContext,
} from "extensions/ExtensionContext";
export {
  ExtensionRuntimeHooks,
  MatchStartPayload,
  MatchEndPayload,
  TickPayload,
  ObjectSpawnPayload,
  ObjectRemovePayload,
  UnitProducePayload,
  WarheadDetonatePayload,
  RUNTIME_HOOK_NAMES,
  RuntimeHookName,
} from "extensions/ExtensionHooks";
export { ExtensionEventBus } from "extensions/ExtensionEventBus";

import { ExtensionHost } from "extensions/ExtensionHost";
import { ExtensionConfig } from "extensions/ExtensionConfig";
import { ExtensionEventBus } from "extensions/ExtensionEventBus";

/**
 * 插件侧最常用的运行时门面。
 * 插件在 hooks 里通常只需要 ctx；此门面供模块顶层（如版本查询、
 * 跨钩子状态）在任意时刻读全局状态时使用。
 */
export const ExtensionSdk = {
  /** 扩展总开关。 */
  isEnabled(extensionId: string): boolean {
    return ExtensionHost.isEnabled(extensionId);
  },

  /** 子功能开关（总开关关闭时恒 false）。 */
  isFeatureEnabled(extensionId: string, featureId: string): boolean {
    return ExtensionHost.isFeatureEnabled(extensionId, featureId);
  },

  /** 当前配置实例。 */
  getConfig(): ExtensionConfig {
    return ExtensionHost.getConfig();
  },

  /** 扩展级事件总线（发布/订阅）。 */
  get events(): ExtensionEventBus {
    return ExtensionHost.events;
  },

  /** 发布扩展事件。 */
  emit(eventName: string, data?: unknown): void {
    ExtensionHost.emitEvent(eventName, data);
  },

  /** 订阅扩展事件；返回退订函数。 */
  on(eventName: string, listener: (data: unknown, name: string) => void): () => void {
    return ExtensionHost.onEvent(eventName, listener);
  },

  /** 当前对局引用（未开局时 null）。 */
  getGame(): unknown {
    return ExtensionHost.getGame();
  },
};
