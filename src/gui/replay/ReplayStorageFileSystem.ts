/**
 * ReplayStorageFileSystem — 基于目录句柄的回放存储（manifest 重建/配额错误透传）。
 *
 * getManifest 损坏时删档重建；rebuildManifest 对齐磁盘 .rpl 与索引；
 * StorageQuotaError 直接抛出，其余包 ReplayStorageError。
 *
 * 由 gui/replay/ReplayStorageFileSystem.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { VirtualFile } from "data/vfs/VirtualFile"; // 已转换
import { DataStream } from "data/DataStream"; // 已转换
import { StorageQuotaError } from "data/vfs/StorageQuotaError"; // 已转换
import { Replay } from "network/gamestate/Replay"; // 已转换
import { ReplayStorageError } from "gui/replay/ReplayStorageError"; // 孪生（本批内一并转换）

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 文件系统回放存储。 */
export class ReplayStorageFileSystem {
  /** 清单文件名。 */
  static manifestFileName = "_index.json";
  /** 未保留回放文件名前缀。 */
  static unsavedReplayPrefix = "Unsaved_";

  /** 目录句柄。 */
  dir: any;
  /** 可选 Sentry（captureException）。 */
  sentry?: any;

  /**
   * @param dir - 目录句柄
   * @param sentry - 可选 Sentry
   */
  constructor(dir: any, sentry?: any) {
    this.dir = dir;
    this.sentry = sentry;
  }

  /**
   * 读清单；includeKeep 强制重建；损坏则删档重建。
   * @param includeKeep - 强制重建
   */
  async getManifest(includeKeep = false): Promise<any[]> {
    if (includeKeep) return await this.rebuildManifest();
    if (!(await this.dir.containsEntry(ReplayStorageFileSystem.manifestFileName))) return [];
    const text = (await this.dir.openFile(ReplayStorageFileSystem.manifestFileName)).readAsString("utf-8");
    if (!text.length) return [];
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("Replay manifest is corrupt", err);
      this.sentry?.captureException(
        err,
        (scope: any) => (scope.addAttachment({ filename: ReplayStorageFileSystem.manifestFileName, data: text }), scope),
      );
      await this.deleteManifest();
      return await this.rebuildManifest();
    }
  }

  /**
   * 写清单。
   * @param list - 清单
   */
  async saveManifest(list: any[]): Promise<void> {
    const stream = new DataStream();
    stream.writeString(JSON.stringify(list), "utf-8");
    const file = new VirtualFile(stream, ReplayStorageFileSystem.manifestFileName);
    try {
      await this.dir.writeFile(file);
    } catch (err) {
      if (err instanceof StorageQuotaError) throw err;
      throw new ReplayStorageError(`Failed to save manifest (${err.message})`, { cause: err });
    }
  }

  /** 删清单文件。 */
  async deleteManifest(): Promise<void> {
    await this.dir.deleteFile(ReplayStorageFileSystem.manifestFileName);
  }

  /** 对齐磁盘 .rpl 与清单：删孤儿、补新文件，再写回。 */
  async rebuildManifest(): Promise<any[]> {
    let existing: any;
    let raw: any;
    let meta: any;
    const current = await this.getManifest();
    let rplCount = 0;
    for await (existing of this.dir.getEntries()) {
      if (existing.endsWith(Replay.extension)) rplCount++;
    }
    if (rplCount === current.length) return current;

    console.info("Rebuilding replay index...");
    const rawFiles = new Map<string, any>();
    for await (raw of this.dir.getRawFiles()) {
      if (raw.name.endsWith(Replay.extension)) rawFiles.set(raw.name, raw);
    }

    const next: any[] = [];
    for (meta of current) {
      const fileName = this.getReplayFileName(meta);
      if (rawFiles.has(fileName)) {
        next.push(meta);
        rawFiles.delete(fileName);
      }
    }
    if (next.length < current.length) {
      console.info(`Removed ${current.length - next.length} orphaned entries from index`);
    }
    if (rawFiles.size) {
      for (const entry of rawFiles.values()) {
        const timestamp = entry.lastModified;
        next.unshift({
          id: THREE.Math.generateUUID(),
          name: entry.name
            .replace(ReplayStorageFileSystem.unsavedReplayPrefix, "")
            .replace(Replay.extension, ""),
          keep: !entry.name.startsWith(ReplayStorageFileSystem.unsavedReplayPrefix),
          timestamp,
        });
      }
      next.sort((a, b) =>
        a.timestamp === b.timestamp ? a.name.localeCompare(b.name) : b.timestamp - a.timestamp,
      );
      console.info(`Added ${rawFiles.size} new entries to replay index`);
    }
    try {
      await this.saveManifest(next);
    } catch (err) {
      if (!(err instanceof StorageQuotaError)) throw err;
      console.error("Failed to save rebuilt manifest because storage is full", err);
    }
    console.info("Rebuild finished.");
    return next;
  }

  /** 删除全部 .rpl 与清单。 */
  async deleteAllReplays(): Promise<void> {
    for await (const name of this.dir.getEntries()) {
      if (name.endsWith(Replay.extension)) await this.dir.deleteFile(name);
    }
    await this.deleteManifest();
  }

  /**
   * 读回放原始文件。
   * @param meta - 清单项
   */
  async getReplayData(meta: any): Promise<any> {
    const fileName = this.getReplayFileName(meta);
    if (!(await this.dir.containsEntry(fileName))) throw new Error(`Replay file "${fileName}" not found.`);
    return await this.dir.getRawFile(fileName);
  }

  /**
   * 是否已有回放文件。
   * @param meta - 清单项
   */
  async hasReplayData(meta: any): Promise<boolean> {
    return await this.dir.containsEntry(this.getReplayFileName(meta));
  }

  /**
   * 写回放文件。
   * @param meta - 清单项
   * @param data - 序列化文本
   */
  async saveReplayData(meta: any, data: string): Promise<void> {
    const stream = new DataStream();
    stream.writeString(data, "utf-8");
    const fileName = this.getReplayFileName(meta);
    const file = new VirtualFile(stream, fileName);
    try {
      await this.dir.writeFile(file);
    } catch (err) {
      if (err instanceof StorageQuotaError) throw err;
      if (err instanceof TypeError) {
        throw new ReplayStorageError(`Failed to save replay file "${fileName}" (${err.message})`, { cause: err });
      }
      throw new ReplayStorageError(`Failed to save replay file (${err.message})`, { cause: err });
    }
  }

  /**
   * 删回放文件。
   * @param meta - 清单项
   */
  async deleteReplayData(meta: any): Promise<void> {
    await this.dir.deleteFile(this.getReplayFileName(meta));
  }

  /**
   * 清单项 → 文件名（未 keep 加前缀）。
   * @param meta - 清单项
   */
  getReplayFileName(meta: any): string {
    return (meta.keep ? "" : ReplayStorageFileSystem.unsavedReplayPrefix) + meta.name + Replay.extension;
  }
}
