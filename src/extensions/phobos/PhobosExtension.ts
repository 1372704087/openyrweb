/**
 * Phobos — 源码内置扩展骨架（总开关 + 子功能分组）。
 *
 * 子功能 id 与设置界面 / 存储字段一一对应；具体键位实现落在各 feature 分支。
 */
import { ExtensionDefinition } from "extensions/ExtensionDefinition";
import { ExtensionConfig } from "extensions/ExtensionConfig";
import {
  getPhobosVersionDescription,
  PHOBOS_PRODUCT_VERSION,
  PHOBOS_BUILD_TYPE,
} from "extensions/phobos/PhobosVersion";

export const phobosExtension: ExtensionDefinition = {
  id: "phobos",
  name: "Phobos",
  descriptionKey: "STT:Ext.Phobos",
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
  applyToRules(ini: any, config: ExtensionConfig) {
    const general = ini?.getOrCreateSection?.("General");
    if (!general?.set) return;
    general.set("OpenYRWeb.Phobos.Enabled", "yes");
    general.set("OpenYRWeb.Phobos.ProductVersion", PHOBOS_PRODUCT_VERSION);
    general.set("OpenYRWeb.Phobos.BuildType", PHOBOS_BUILD_TYPE);
    general.set("OpenYRWeb.Phobos.VersionDescription", getPhobosVersionDescription());
    const enabled = config.getEnabledFeatureIds("phobos");
    general.set("OpenYRWeb.Phobos.Features", enabled.join(";") || "none");
  },
};
