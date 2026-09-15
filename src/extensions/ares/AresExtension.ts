/**
 * Ares — 源码内置扩展骨架（总开关 + 子功能分组）。
 *
 * 子功能 id 与设置界面 / 存储字段一一对应；具体键位实现落在各 feature 分支。
 */
import { ExtensionDefinition } from "extensions/ExtensionDefinition";
import { ExtensionConfig } from "extensions/ExtensionConfig";

export const aresExtension: ExtensionDefinition = {
  id: "ares",
  name: "Ares",
  descriptionKey: "STT:Ext.Ares",
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
  applyToRules(ini: any, config: ExtensionConfig) {
    const general = ini?.getOrCreateSection?.("General");
    if (!general?.set) return;
    general.set("OpenYRWeb.Ares.Enabled", "yes");
    const enabled = config.getEnabledFeatureIds("ares");
    general.set("OpenYRWeb.Ares.Features", enabled.join(";") || "none");
  },
};
