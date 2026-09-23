/**
 * ReplayStorageMemStorage — 内存回放存储（Map + JSON manifest）。
 *
 * 由 gui/replay/ReplayStorageMemStorage.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 内存回放存储。 */
export class ReplayStorageMemStorage {
  /** id → 序列化数据。 */
  replays = new Map<string, string>();
  /** 序列化后的清单。 */
  manifest?: string;

  constructor() {
    this.replays = new Map();
  }

  /** 读清单（无则 []）。 */
  async getManifest(): Promise<any[]> {
    return this.manifest ? JSON.parse(this.manifest) : [];
  }

  /**
   * 写清单。
   * @param list - 清单
   */
  async saveManifest(list: any[]): Promise<void> {
    this.manifest = JSON.stringify(list);
  }

  /**
   * 读回放数据。
   * @param meta - {id}
   */
  async getReplayData(meta: any): Promise<string> {
    const data = this.replays.get(meta.id);
    if (!data) throw new Error(`Replay "${meta.id}" not found in memory`);
    return data;
  }

  /**
   * 是否已有数据。
   * @param meta - {id}
   */
  async hasReplayData(meta: any): Promise<boolean> {
    return this.replays.has(meta.id);
  }

  /**
   * 写数据。
   * @param meta - {id}
   * @param data - 序列化文本
   */
  async saveReplayData(meta: any, data: string): Promise<void> {
    this.replays.set(meta.id, data);
  }

  /**
   * 删数据。
   * @param meta - {id}
   */
  async deleteReplayData(meta: any): Promise<void> {
    this.replays.delete(meta.id);
  }
}
