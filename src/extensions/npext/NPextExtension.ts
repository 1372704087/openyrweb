/**
 * NPext（NPatch Extended）— 源码内置扩展骨架（总开关 + 子功能分组）。
 *
 * NPext 是 NPatch 平台的增强扩展：新增阵营/国家、单位与武器扩展标签、
 * 以及大量原版逻辑修复。这里按 Ares/Phobos 同构方式注册为骨架扩展，
 * 具体键位实现落在各 feature 分支。
 *
 * 依赖：NPatch 平台本身未注册为本项目扩展，故 npext 独立声明；
 * priority 150 排在 ares(50)/phobos(100) 之后执行。
 * 钩子走 ExtensionHookContext：INI 写入自动落在 OpenYRWeb.NPext.* 命名空间下。
 */
import { ExtensionDefinition } from "extensions/ExtensionDefinition";
import { ExtensionHookContext } from "extensions/ExtensionContext";

export const npextExtension: ExtensionDefinition = {
  id: "npext",
  name: "NPext",
  descriptionKey: "STT:Ext.NPext",
  priority: 150,
  features: [
    {
      id: "general",
      labelKey: "TS:Ext.NPext.Feature.General",
      hintKey: "STT:Ext.NPext.Feature.General",
      defaultEnabled: true,
    },
    {
      id: "countries",
      labelKey: "TS:Ext.NPext.Feature.Countries",
      hintKey: "STT:Ext.NPext.Feature.Countries",
      defaultEnabled: true,
    },
    {
      id: "technos",
      labelKey: "TS:Ext.NPext.Feature.Technos",
      hintKey: "STT:Ext.NPext.Feature.Technos",
      defaultEnabled: true,
    },
    {
      id: "weapons",
      labelKey: "TS:Ext.NPext.Feature.Weapons",
      hintKey: "STT:Ext.NPext.Feature.Weapons",
      defaultEnabled: true,
    },
    {
      // 「AI克隆生产」：关闭后向 [General] 注入 DisableParallelAIQueues=yes，
      // AI 同一时刻只从一座同类工厂出货（见 ExtensionHost.applyToRules 注入）。
      id: "aiCloneProduction",
      labelKey: "TS:Ext.NPext.Feature.AICloneProduction",
      hintKey: "STT:Ext.NPext.Feature.AICloneProduction",
      groupKey: "TS:Ext.NPext.Group.EnhancedLogic",
      defaultEnabled: true,
    },
    {
      // 「AI超越上限生产」：关闭后向 [General] 注入 EnableAIBuildLimitation=yes，
      // AI 生产受 BuildLimit 约束（Production.isAvailableForProduction 生效点）。
      id: "aiOverLimitProduction",
      labelKey: "TS:Ext.NPext.Feature.AIOverLimitProduction",
      hintKey: "STT:Ext.NPext.Feature.AIOverLimitProduction",
      groupKey: "TS:Ext.NPext.Group.EnhancedLogic",
      defaultEnabled: true,
    },
  ],
  hooks: {
    applyToRules(ctx: ExtensionHookContext) {
      if (!ctx.ini) return;
      // 命名空间写入：实际键为 OpenYRWeb.NPext.*
      ctx.ini.set("Enabled", "yes");
      const enabled = ctx.getEnabledFeatures();
      ctx.ini.set("Features", enabled.join(";") || "none");
    },
  },
};
