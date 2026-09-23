/**
 * ExtensionsModel — 扩展设置界面 ↔ ExtensionHost 薄适配。
 *
 * snapshot 读注册表 + 配置；setMaster 写回后立即
 * applyExtensionKeyCommands 重算键位注册。
 *
 * 由 gui/screen/mainMenu/extensions/component/ExtensionsModel.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { ExtensionHost } from "extensions/ExtensionHost"; // 已转换

export class ExtensionsModel {
  /** 读取当前扩展/特性开关快照。 */
  static snapshot() {
    var config = ExtensionHost.getConfig();
    const registered = ExtensionHost.getRegistered();
    return {
      extensions: registered.map((ext) => ({
        id: ext.id,
        name: ext.name,
        master: config.getMaster(ext.id),
        features: ext.features.map((feat) => ({
          id: feat.id,
          labelKey: feat.labelKey,
          hintKey: feat.hintKey,
          groupKey: feat.groupKey,
          enabled: config.getFeatureRaw(ext.id, feat.id),
        })),
      })),
    };
  }

  /** 写主开关并重算键位命令注册。 */
  static setMaster(id: string, on: boolean): void {
    ExtensionHost.getConfig().setMaster(id, on);
    // 开关变更后立即重算键位命令注册：被关掉的扩展必须从「键盘设置」界面移除，
    // 重新打开的则重新出现（并由宿主按 manifest 声明补默认键）。
    ExtensionHost.applyExtensionKeyCommands();
  }

  /** 写单个特性开关。 */
  static setFeature(extId: string, featId: string, on: boolean): void {
    ExtensionHost.getConfig().setFeature(extId, featId, on);
  }
}
