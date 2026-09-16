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
  features: [
    {
      id: "weapons",
      labelKey: "TS:Ext.Ares.Feature.Weapons",
      hintKey: "STT:Ext.Ares.Feature.Weapons",
      defaultEnabled: true,
    },
    {
      id: "general",
      labelKey: "TS:Ext.Ares.Feature.General",
      hintKey: "STT:Ext.Ares.Feature.General",
      defaultEnabled: true,
    },
    {
      id: "technos",
      labelKey: "TS:Ext.Ares.Feature.Technos",
      hintKey: "STT:Ext.Ares.Feature.Technos",
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
