/**
 * Phobos — 源码内置扩展骨架（总开关 + 子功能分组）。
 *
 * 子功能 id 与设置界面 / 存储字段一一对应；具体键位实现落在各 feature 分支。
 * 钩子走 ExtensionHookContext：INI 写入自动落在 OpenYRWeb.Phobos.* 命名空间下。
 *
 * 依赖：Phobos 以 Ares 为运行框架（YRpp 生态同构）——dependsOn 声明后，
 * ExtensionHost 拓扑排序保证 Ares 先于 Phobos 执行；Ares 关闭时 Phobos 整体跳过。
 */
import { ExtensionDefinition } from "extensions/ExtensionDefinition";
import { ExtensionHookContext } from "extensions/ExtensionContext";
import {
  getPhobosVersionDescription,
  PHOBOS_PRODUCT_VERSION,
  PHOBOS_BUILD_TYPE,
} from "extensions/phobos/PhobosVersion";

export const phobosExtension: ExtensionDefinition = {
  id: "phobos",
  name: "Phobos",
  descriptionKey: "STT:Ext.Phobos",
  // 依赖 Ares 作为运行框架（与真实 Phobos↔Ares 关系一致）
  dependsOn: ["ares"],
  priority: 100,
  features: [
    {
      id: "weapons",
      labelKey: "TS:Ext.Phobos.Feature.Weapons",
      hintKey: "STT:Ext.Phobos.Feature.Weapons",
      defaultEnabled: true,
    },
    {
      id: "technos",
      labelKey: "TS:Ext.Phobos.Feature.Technos",
      hintKey: "STT:Ext.Phobos.Feature.Technos",
      defaultEnabled: true,
    },
    {
      id: "drawing",
      labelKey: "TS:Ext.Phobos.Feature.Drawing",
      hintKey: "STT:Ext.Phobos.Feature.Drawing",
      defaultEnabled: true,
    },
  ],
  hooks: {
    applyToRules(ctx: ExtensionHookContext) {
      if (!ctx.ini) return;
      // 命名空间写入：实际键为 OpenYRWeb.Phobos.* 
      ctx.ini.set("Enabled", "yes");
      ctx.ini.set("ProductVersion", PHOBOS_PRODUCT_VERSION);
      ctx.ini.set("BuildType", PHOBOS_BUILD_TYPE);
      ctx.ini.set("VersionDescription", getPhobosVersionDescription());
      const enabled = ctx.getEnabledFeatures();
      ctx.ini.set("Features", enabled.join(";") || "none");
    },
  },
};
