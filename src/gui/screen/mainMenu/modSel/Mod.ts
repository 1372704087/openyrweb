/**
 * Mod — 本地/远端 meta 合并后的模组视图。
 *
 * ctor：无本地 → NotInstalled+remote；版本不一致 → UpdateAvailable
 * （克隆本地并覆写 download 字段）；否则 Installed。
 *
 * 由 gui/screen/mainMenu/modSel/Mod.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { ModStatus } from "gui/screen/mainMenu/modSel/ModStatus"; // 孪生（本组内一并转换）
import type { ModMeta } from "gui/screen/mainMenu/modSel/ModMeta"; // 孪生（本组内一并转换；仅类型）

export class Mod {
  /** 元数据（始终非空，ctor 赋值）。 */
  meta!: ModMeta;
  /** 安装状态。 */
  status!: ModStatus;
  /** 远端最新版本。 */
  latestVersion?: string;

  /** 模组 ID。 */
  get id() {
    return this.meta.id;
  }

  /** 显示名。 */
  get name() {
    return this.meta.name;
  }

  /** 是否受支持。 */
  get supported() {
    return this.meta.supported;
  }

  constructor(local?: ModMeta, remote?: ModMeta) {
    if (local)
      if (remote && remote.version !== local.version) {
        this.status = ModStatus.UpdateAvailable;
        this.meta = local.clone();
        this.meta.download = remote.download;
        this.meta.downloadSize = remote.downloadSize;
        this.meta.manualDownload = remote.manualDownload;
        this.latestVersion = remote.version;
      } else {
        this.status = ModStatus.Installed;
        this.meta = local;
        this.latestVersion = local.version;
      }
    else {
      this.status = ModStatus.NotInstalled;
      if (!remote)
        throw new Error("At least a local or remote meta must be specified");
      this.meta = remote;
      this.latestVersion = remote.version;
    }
  }

  /** 非 NotInstalled 即已安装。 */
  isInstalled() {
    return this.status !== ModStatus.NotInstalled;
  }
}
