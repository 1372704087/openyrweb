/**
 * ReplayStorage — 回放存储接口（孪生 execute 为空，仅导出类型）。
 *
 * 由 gui/replay/ReplayStorage.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 方法面依据 ReplayManager 调用（getManifest/getReplayData/save…）反推。
 */
import type { ReplayMeta } from "gui/replay/ReplayMeta"; // 孪生（本批内一并转换）

/** 回放存储后端。 */
export interface ReplayStorage {
  /**
   * 读清单。
   * @param includeKeep - 是否含 keep 项
   */
  getManifest(includeKeep?: boolean): Promise<ReplayMeta[]>;
  /**
   * 写清单。
   * @param list - 清单
   */
  saveManifest(list: ReplayMeta[]): Promise<void>;
  /**
   * 读回放数据（字符串或可读 File/Blob）。
   * @param meta - 清单项
   */
  getReplayData(meta: ReplayMeta): Promise<string | any>;
  /**
   * 是否已有该 id 的数据。
   * @param meta - 清单项
   */
  hasReplayData(meta: ReplayMeta): Promise<boolean>;
  /**
   * 写回放数据。
   * @param meta - 清单项
   * @param data - 序列化文本
   */
  saveReplayData(meta: ReplayMeta, data: string): Promise<void>;
  /**
   * 删除回放数据。
   * @param meta - 清单项
   */
  deleteReplayData(meta: ReplayMeta): Promise<void>;
}

/** 空运行时导出（与孪生 execute 为空对齐）。 */
export {};
