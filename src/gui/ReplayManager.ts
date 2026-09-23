/**
 * ReplayManager — 回放清单读写、保存/保留/删除/导入门面。
 *
 * saveReplay 生成 UUID、冲突名加 " (n)"、非 keep 超过 50 条截断；
 * keepReplay 改名保留（重名抛 ReplayExistsError）；importReplay 用 FileReader 读入。
 *
 * 由 gui/ReplayManager.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Replay } from "network/gamestate/Replay"; // 已转换
import * as ReplayExistsErrorModule from "gui/replay/ReplayExistsError"; // 孪生（本批内一并转换）

declare const THREE: any;

// 孪生 any-shim：本批内未完成导出面时取命名空间成员
const ReplayExistsError: any = (ReplayExistsErrorModule as any).ReplayExistsError;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 回放管理器。 */
export class ReplayManager {
  /** 回放存储后端。 */
  storage: any;

  /**
   * @param storage - ReplayStorage 实现
   */
  constructor(storage: any) {
    this.storage = storage;
  }

  /**
   * 读清单。
   * @param includeKeep - 是否含 keep 项（透传 getManifest）
   */
  async loadList(includeKeep = false): Promise<any[]> {
    return await this.storage.getManifest(includeKeep);
  }

  /**
   * 读序列化回放数据（string 或 File/Blob）。
   * @param meta - 清单项
   */
  async loadSerializedReplay(meta: any): Promise<any> {
    return await this.storage.getReplayData(meta);
  }

  /**
   * 读入并 unserialize 成 Replay。
   * @param meta - 清单项
   */
  async loadReplay(meta: any): Promise<any> {
    const raw = await this.loadSerializedReplay(meta);
    const replay = new Replay();
    replay.unserialize(typeof raw === "string" ? raw : await raw.text(), meta);
    return replay;
  }

  /**
   * 保存回放并写清单，返回 id。
   * @param replay - 已初始化 Replay
   * @param keep - 是否标记保留
   */
  async saveReplay(replay: any, keep = false): Promise<string> {
    const name = replay.name;
    if (!name) throw new Error("Replay is not initialized");
    const id = THREE.Math.generateUUID();
    const data = replay.serialize();
    const meta = { id, name, keep, timestamp: replay.timestamp };
    let n = 1;
    while (await this.storage.hasReplayData(meta)) {
      if (n > 1) {
        meta.name = meta.name.replace(/ \(\d+\)$/, "");
      }
      meta.name += ` (${++n})`;
    }
    let list = await this.loadList();
    const nonKeep = list.filter((e) => !e.keep);
    if (nonKeep.length > 50) {
      for (const drop of nonKeep.slice(50)) {
        await this.storage.deleteReplayData(drop);
        list.splice(list.indexOf(drop), 1);
      }
    }
    list.unshift(meta);
    await this.storage.saveReplayData(meta, data);
    await this.storage.saveManifest(list);
    return id;
  }

  /**
   * 将已有清单项改名并 keep（重名抛错）。
   * @param meta - 原清单项
   * @param newName - 新显示名
   */
  async keepReplay(meta: any, newName: string): Promise<void> {
    const list = await this.loadList();
    const found = list.find((e) => e.id === meta.id);
    if (found) {
      const next = { ...found, name: Replay.sanitizeFileName(newName), keep: true };
      if (await this.storage.hasReplayData(next)) {
        throw new ReplayExistsError(`A replay with name "${next.name}" already exists`);
      }
      let data = await this.storage.getReplayData(found);
      const text = typeof data === "string" ? data : await data.text();
      await this.storage.deleteReplayData(found);
      await this.storage.saveReplayData(next, text);
      Object.assign(found, next);
      await this.storage.saveManifest(list);
    }
  }

  /**
   * 删除回放数据并从清单摘除。
   * @param meta - 清单项
   */
  async deleteReplay(meta: any): Promise<void> {
    await this.storage.deleteReplayData(meta);
    const list = await this.loadList();
    const idx = list.findIndex((e) => e.id === meta.id);
    if (idx !== -1) {
      list.splice(idx, 1);
      await this.storage.saveManifest(list);
    }
  }

  /**
   * 从 File 导入回放并 keep 保存。
   * @param file - 用户选择的文件
   */
  async importReplay(file: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const name = file.name.replace(Replay.extension, "");
          const replay = new Replay();
          replay.unserialize(ev.target!.result as string, { name, timestamp: file.lastModified });
          await this.saveReplay(replay, true);
          resolve(replay);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsText(file, "utf-8");
    });
  }
}
