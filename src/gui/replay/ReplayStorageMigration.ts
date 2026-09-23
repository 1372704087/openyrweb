/**
 * ReplayStorageMigration — 旧 localStorage / replays.json → _index.json 迁移。
 *
 * migratedMarker 为 "4" 时跳过；runMigrationTo4 清旧键、把 replays.json
 * 条目按磁盘 .rpl 对齐并重命名（消重后写 manifest）。
 *
 * 由 gui/replay/ReplayStorageMigration.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Replay } from "network/gamestate/Replay"; // 已转换
import { ReplayStorageFileSystem } from "gui/replay/ReplayStorageFileSystem"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 回放存储迁移。 */
export class ReplayStorageMigration {
  /** 迁移完成标记键。 */
  static migratedMarker = "_r_replays_migrated";

  /** 启动闪屏（进度文案）。 */
  splashScreen: any;
  /** i18n。 */
  strings: any;
  /** 回放目录句柄。 */
  replayDir: any;
  /** LocalPrefs。 */
  localPrefs: any;
  /** 目标文件系统存储。 */
  storageFileSystem: any;

  /**
   * @param splashScreen - 闪屏
   * @param strings - i18n
   * @param replayDir - 回放目录
   * @param localPrefs - 本地偏好
   * @param storageFileSystem - FileSystem 存储
   */
  constructor(splashScreen: any, strings: any, replayDir: any, localPrefs: any, storageFileSystem: any) {
    this.splashScreen = splashScreen;
    this.strings = strings;
    this.replayDir = replayDir;
    this.localPrefs = localPrefs;
    this.storageFileSystem = storageFileSystem;
  }

  /** 版本不足时执行到 v4 的迁移。 */
  async migrate(): Promise<void> {
    if (Number(this.localPrefs.getItem(ReplayStorageMigration.migratedMarker) || 0) !== 4) {
      console.info("Running replay storage migrations...");
      await this.runMigrationTo4();
      this.localPrefs.setItem(ReplayStorageMigration.migratedMarker, "4");
      console.info("Migrations finished.");
    }
  }

  /** 清 localStorage 旧键，迁移 replays.json → manifest + 重命名 .rpl。 */
  async runMigrationTo4(): Promise<void> {
    this.localPrefs.removeItem("_r_replayList");
    for (const key of this.localPrefs.listItems()) {
      if (key.startsWith("_r_replay_")) this.localPrefs.removeItem(key);
    }
    const dir = this.replayDir;
    const legacyName = "replays.json";
    if (await dir.containsEntry(legacyName)) {
      if (await dir.containsEntry(ReplayStorageFileSystem.manifestFileName)) {
        await dir.deleteFile(legacyName);
      } else {
        const text = (await dir.openFile(legacyName)).readAsString("utf-8");
        let legacy: any[] = [];
        try {
          legacy = JSON.parse(text);
        } catch (_err) {}
        if (legacy.length) {
          this.splashScreen.setLoadingText(this.strings.get("ts:replay_storage_migrating", 0));
          const nextManifest: any[] = [];
          const onDisk = new Set<string>();
          for await (const entry of dir.getEntries()) {
            if (entry.endsWith(Replay.extension)) onDisk.add(entry);
          }
          const renameMap = new Map<string, string>();
          const usedNames = new Set<string>();
          for (const item of legacy) {
            const oldFileName = "replay_" + item.id + Replay.extension;
            if (onDisk.has(oldFileName)) {
              const meta = {
                id: THREE.Math.generateUUID(),
                name: Replay.sanitizeFileName(item.name),
                keep: item.keep,
                timestamp: item.timestamp,
              };
              nextManifest.push(meta);
              let newFileName = this.storageFileSystem.getReplayFileName(meta);
              let n = 1;
              while (usedNames.has(newFileName.toLowerCase())) {
                newFileName = newFileName.replace(Replay.extension, "");
                if (n > 1) newFileName = newFileName.replace(/ \(\d+\)$/, "");
                newFileName += ` (${++n})` + Replay.extension;
              }
              if (n > 1) meta.name += ` (${n})`;
              renameMap.set(oldFileName, newFileName);
              usedNames.add(newFileName.toLowerCase());
            }
          }
          await dir.deleteFile(legacyName);
          try {
            let done = 0;
            let from: any;
            let to: any;
            const total = renameMap.size;
            for ([from, to] of renameMap) {
              const file = await dir.openFile(from);
              file.filename = to;
              await dir.writeFile(file);
              await dir.deleteFile(from);
              this.splashScreen.setLoadingText(
                this.strings.get("ts:replay_storage_migrating", Math.floor((++done / total) * 100)),
              );
            }
            await this.storageFileSystem.saveManifest(nextManifest);
          } catch (err) {
            console.error(err);
          }
        } else {
          await dir.deleteFile(legacyName);
        }
      }
    }
  }
}
