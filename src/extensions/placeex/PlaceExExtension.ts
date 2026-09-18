/**
 * PlaceEx（占位名，待定）— 建筑放置预览渲染增强扩展。
 *
 * 「使用 place.shp」开关：开启后建筑放置的红绿占地格子改用游戏资源
 * place.shp 的原版菱形色块（无描边，与 gamemd 的 0x006D5030/0x0047EC90
 * 逐格 DrawSHP 一致，参考 VERA20K 复刻实现）；关闭或 place.shp 缺失时
 * 回退到自绘格子（带 1px 描边，历史行为）。
 *
 * 渲染切换发生在 PlacementGrid 纹理生成处（gui/screen/game/worldInteraction/
 * placementMode/PlacementGrid.ts.js）；纹理首次进入放置模式时生成，
 * 因此开关对新一局生效。
 */
import { ExtensionDefinition } from "extensions/ExtensionDefinition";
import { ExtensionHookContext } from "extensions/ExtensionContext";

export const placeExExtension: ExtensionDefinition = {
  id: "placeex",
  name: "PlaceEx",
  descriptionKey: "STT:Ext.PlaceEx",
  priority: 200,
  features: [
    {
      id: "usePlaceShp",
      labelKey: "TS:Ext.PlaceEx.Feature.UsePlaceShp",
      hintKey: "STT:Ext.PlaceEx.Feature.UsePlaceShp",
      defaultEnabled: false,
    },
  ],
  hooks: {
    applyToRules(ctx: ExtensionHookContext) {
      if (!ctx.ini) return;
      // 命名空间写入：实际键为 OpenYRWeb.PlaceEx.*
      ctx.ini.set("Enabled", "yes");
      const enabled = ctx.getEnabledFeatures();
      ctx.ini.set("Features", enabled.join(";") || "none");
    },
  },
};
