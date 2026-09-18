/**
 * Ares — 源码内置扩展骨架（总开关 + 子功能分组）。
 *
 * 子功能 id 与设置界面 / 存储字段一一对应；具体键位实现落在各 feature 分支。
 * 钩子走 ExtensionHookContext：INI 写入自动落在 OpenYRWeb.Ares.* 命名空间下。
 */
import { ExtensionDefinition } from "extensions/ExtensionDefinition";
import { ExtensionHookContext } from "extensions/ExtensionContext";

export const aresExtension: ExtensionDefinition = {
  id: "ares",
  name: "Ares",
  descriptionKey: "STT:Ext.Ares",
  // Ares 是基础扩展：无依赖，优先级略高（Phobos 若声明 dependsOn: ["ares"] 则自动排后）
  priority: 50,
  // 占位功能组（weapons/general/technos）已移除：无实际引擎逻辑的条目不再展示
  features: [
    {
      // 「AI克隆生产」：关闭后向 [General] 注入 DisableParallelAIQueues=yes
      // （对应 Ares 自身的 AllowParallelAIQueues=no 语义），AI 同一时刻
      // 只从一座同类工厂出货。与 npext 同名开关任一关闭即生效。
      id: "aiCloneProduction",
      labelKey: "TS:Ext.Ares.Feature.AICloneProduction",
      hintKey: "STT:Ext.Ares.Feature.AICloneProduction",
      groupKey: "TS:Ext.Group.EnhancedLogic",
      defaultEnabled: true,
    },
  ],
  hooks: {
    applyToRules(ctx: ExtensionHookContext) {
      if (!ctx.ini) return;
      // 命名空间写入：实际键为 OpenYRWeb.Ares.Enabled 等
      ctx.ini.set("Enabled", "yes");
      const enabled = ctx.getEnabledFeatures();
      ctx.ini.set("Features", enabled.join(";") || "none");
    },
  },
};
