/**
 * ModMeta — 模组元数据（从 [General] INI 解析）。
 *
 * fromIniSection 校验 ID 匹配 ModManager.modIdRegex、必须有 Name；
 * website 非 http(s) 仅 warn 不写入；clone 浅拷贝 authors 切片。
 *
 * 由 gui/screen/mainMenu/modSel/ModMeta.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import * as ModManagerModule from "gui/screen/mainMenu/modSel/ModManager"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ModManager: any = (ModManagerModule as any).ModManager;

export class ModMeta {
  /** 模组 ID。 */
  id?: string;
  /** 显示名。 */
  name?: string;
  /** 是否通过校验/受支持（ctor 默认 false）。 */
  supported = false;
  /** 描述。 */
  description?: string;
  /** 作者列表。 */
  authors?: string[];
  /** 主页。 */
  website?: string;
  /** 版本。 */
  version?: string;
  /** 下载 URL。 */
  download?: string;
  /** 下载体积（字节）。 */
  downloadSize?: number;
  /** 仅手动下载（ctor 默认 false）。 */
  manualDownload = false;

  /** 从 IniFile 读 [General]。 */
  fromIniFile(file: any): this {
    var section = file.getSection("General");
    if (!section) throw new Error("Mod meta missing [General] section");
    return this.fromIniSection(section), this;
  }

  /** 从 IniSection 解析字段（严格校验 ID/Name）。 */
  fromIniSection(section: any): this {
    let id = section.getString("ID");
    var name = section.getString("Name");
    if (!id) throw new Error("Mod meta missing ID");
    if (!id.match(ModManager.modIdRegex))
      throw new Error(
        `Mod meta has invalid ID "${id}". ` +
          "ID must contain only alphanumeric characters, dash (-) or underscore (_)",
      );
    if (!name) throw new Error("Mod meta missing Name");
    this.id = id;
    this.name = name;
    this.supported = true;
    this.description = section.getString("Description") || void 0;
    let author = section.get("Author");
    if (author) this.authors = Array.isArray(author) ? author : [author];
    let website = section.getString("Website");
    if (website)
      website.match(/^https?:\/\//)
        ? (this.website = website)
        : console.warn(`Invalid mod meta website "${website}"`);
    this.version = section.getString("Version") || void 0;
    this.download = section.getString("Download") || void 0;
    this.downloadSize = section.getNumber("DownloadSize") || void 0;
    this.manualDownload = section.getBool("ManualDownload");
    return this;
  }

  /** 深浅混合拷贝（authors 切片）。 */
  clone(): ModMeta {
    let out = new ModMeta();
    out.id = this.id;
    out.name = this.name;
    out.supported = this.supported;
    out.description = this.description;
    out.authors = this.authors?.slice();
    out.website = this.website;
    out.version = this.version;
    out.download = this.download;
    out.downloadSize = this.downloadSize;
    out.manualDownload = this.manualDownload;
    return out;
  }
}
