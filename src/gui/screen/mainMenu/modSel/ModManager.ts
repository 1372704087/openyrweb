/**
 * ModManager — 模组目录管理：列表、元数据加载、加载跳转。
 *
 * 静态：remoteListFileName=mods.ini、modMetaFileName=modcd.ini、
 * modIdRegex=/^[a-z0-9-_]+$/i。
 *
 * 由 gui/screen/mainMenu/modSel/ModManager.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { IniFile } from "data/IniFile"; // 已转换
import { RouteHelper } from "RouteHelper"; // 已转换
import { Mod } from "gui/screen/mainMenu/modSel/Mod"; // 孪生（本组内一并转换）
import { ModMeta } from "gui/screen/mainMenu/modSel/ModMeta"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ModManager {
  /** 远端列表文件名（静态）。 */
  static remoteListFileName = "mods.ini";
  /** 模组 meta 文件名（静态）。 */
  static modMetaFileName = "modcd.ini";
  /** 合法模组 ID（静态）。 */
  static modIdRegex = /^[a-z0-9-_]+$/i;

  /** location 引用（loadMod 改 href）。 */
  location: any;
  /** 模组根目录。 */
  modDir: any;
  /** 资源加载器。 */
  appResourceLoader: any;

  constructor(location: any, modDir: any, appResourceLoader: any) {
    this.location = location;
    this.modDir = modDir;
    this.appResourceLoader = appResourceLoader;
  }

  /** 取模组根目录。 */
  getModDir() {
    return this.modDir;
  }

  /** 本地 ∪ 远端合并为 Mod 列表（本地优先占用 remote）。 */
  async buildModList(local: any, remote?: any): Promise<Mod[]> {
    let out: Mod[] = [];
    remote = [...(remote ?? [])];
    for (let meta of local) {
      var idx = remote.findIndex((r) => r.id === meta.id);
      var matched = -1 !== idx ? remote.splice(idx, 1)[0] : void 0;
      out.push(new Mod(meta, matched));
    }
    for (var leftover of remote) out.push(new Mod(void 0, leftover));
    return out;
  }

  /** 拉取并解析远端 mods.ini。 */
  async listRemote(): Promise<ModMeta[]> {
    var text = await this.appResourceLoader.loadText(ModManager.remoteListFileName);
    let ini = new IniFile(text);
    const general = ini.getSection("General");
    if (!general)
      throw new Error(
        ModManager.remoteListFileName + " is missing the [General] section",
      );
    let out: ModMeta[] = [];
    for (const sectionName of general.entries.values()) {
      var section = ini.getSection(sectionName as string);
      if (section) {
        out.push(new ModMeta().fromIniSection(section as any));
      } else console.warn(`Mod "${String(sectionName)}" has no INI section`);
    }
    return out;
  }

  /** 列出本地模组目录（按名排序）。 */
  async listLocal(): Promise<ModMeta[]> {
    let out: ModMeta[] = [];
    if (this.modDir)
      for await (const name of this.modDir.getEntries()) {
        const meta = await this.loadModMeta(name);
        out.push(meta);
      }
    return out.sort((a, b) => a.name!.localeCompare(b.name!)), out;
  }

  /** 读取单个模组目录的 meta（失败回退 folder 名）。 */
  async loadModMeta(folder: string): Promise<ModMeta> {
    let meta = new ModMeta();
    meta.id = folder;
    meta.name = folder;
    try {
      let dir = await this.modDir.getDirectory(folder, true);
      const raw = (await dir.containsEntry(ModManager.modMetaFileName))
        ? await dir.getRawFile(ModManager.modMetaFileName)
        : void 0;
      if (raw) {
        try {
          meta.fromIniFile(new IniFile(await raw.text()));
        } catch {
          console.warn(`Couldn't parse meta file in mod folder "${folder}"`);
          meta.name = folder;
        }
        meta.id = folder;
      }
    } catch (e) {
      console.warn(e);
    }
    return meta;
  }

  /** 删除模组目录。 */
  async deleteModFiles(id: string): Promise<void> {
    if (await this.modDir?.containsEntry(id))
      await this.modDir.deleteDirectory(id, true);
  }

  /** 设置/清除 location 上的 mod 查询参数并跳转。 */
  loadMod(id?: string): void {
    let url = new URL(this.location.href);
    if (id) url.searchParams.set(RouteHelper.modQueryStringName, id);
    else url.searchParams.delete(RouteHelper.modQueryStringName);
    this.location.href = url.href;
  }
}
