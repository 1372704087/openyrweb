/**
 * VirtualFileSystem — 逻辑 VFS：按优先级挂载归档并统一开文件。
 *
 * 归档去重按文件名；openFile 从高到低（插入序）查找。隐式 MIX
 * 列表固定为 YR（YurisRevenge）集合，缺失的归档静默跳过。
 * loadExtraMixFiles 扫描真实 FS 中 expand/ecache/elocal 系列；
 * loadStandaloneFiles 把散落 .ini/.csf 收进 mem.archive。
 *
 * 由 data/vfs/VirtualFileSystem.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { AudioBagFile } from "data/AudioBagFile"; // 已转换
import * as IdxFileModule from "data/IdxFile"; // 已转换
import * as MixFileModule from "data/MixFile"; // 未转换（any-shim）
import * as EngineTypeModule from "engine/EngineType"; // 未转换（any-shim）
import { pad } from "util/string"; // 已转换
import { FileNotFoundError } from "data/vfs/FileNotFoundError"; // 本组已写
import * as MemArchiveModule from "data/vfs/MemArchive"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
/** MIX 归档类。 */
const MixFile: any = MixFileModule.MixFile;
/** 引擎类型枚举（仅签名兼容）。 */
const EngineType: any = EngineTypeModule.EngineType;
/** 内存归档。 */
const MemArchive: any = MemArchiveModule.MemArchive;
/** IDX 索引。 */
const IdxFile: any = IdxFileModule.IdxFile;

/** 归档接口（containsFile/openFile）。 */
export interface Archive {
  containsFile(path: string): boolean;
  openFile(path: string): any;
}

/** loadStandaloneFiles 可选参数。 */
export interface StandaloneOptions {
  /** 要排除的小写文件名集合。 */
  exclude?: string[];
}

export class VirtualFileSystem {
  /** 真实文件系统门面（优先从磁盘打开）。 */
  rfs: any;
  /** 日志器（info 输出挂载/卸载）。 */
  logger: { info(msg: string): void };
  /** 文件名 → 归档。 */
  allArchives: Map<string, Archive>;
  /** 按挂载顺序的归档列表（查找优先级）。 */
  archivesByPriority: Archive[];

  constructor(rfs: any, logger: { info(msg: string): void }) {
    this.rfs = rfs;
    this.logger = logger;
    this.allArchives = new Map();
    this.archivesByPriority = [];
  }

  /** 任一已挂载归档包含该文件则为 true。 */
  fileExists(path: string): boolean {
    for (const a of this.archivesByPriority) if (a.containsFile(path)) return true;
    return false;
  }

  /** 按优先级开文件；全部未命中抛 FileNotFoundError。 */
  openFile(path: string): any {
    for (const a of this.archivesByPriority) if (a.containsFile(path)) return a.openFile(path);
    throw new FileNotFoundError(`File "${path}" not found in VFS`);
  }

  /** 按文件名挂载归档（同名已存在则跳过挂载但仍打日志）。 */
  addArchive(archive: Archive, name: string): void {
    if (!this.allArchives.has(name)) {
      this.allArchives.set(name, archive);
      this.archivesByPriority.push(archive);
    }
    this.logger.info(`Added archive "${name}" to VFS`);
  }

  /** 是否已挂载该名称。 */
  hasArchive(name: string): boolean {
    return this.allArchives.has(name);
  }

  /** 卸载归档；找不到则静默。 */
  removeArchive(name: string): void {
    const a = this.allArchives.get(name);
    if (a) {
      this.allArchives.delete(name);
      this.archivesByPriority.splice(this.archivesByPriority.indexOf(a), 1);
      this.logger.info(`Removed archive "${name}" from VFS`);
    }
  }

  /** 已挂载归档名列表。 */
  listArchives(): string[] {
    return [...this.allArchives.keys()];
  }

  /** 挂载 .mix 归档。 */
  async addMixFile(path: string): Promise<void> {
    await this.addArchiveByFilename(path, (f) => new MixFile(f.stream));
  }

  /** 挂载 audio.bag（需同名 .idx 作索引）。 */
  async addBagFile(path: string): Promise<void> {
    const idxFile = await this.openFileWithRfs(path.replace(".bag", ".idx"));
    await this.addArchiveByFilename(path, (f) => {
      const idx = new IdxFile(idxFile.stream);
      return new AudioBagFile().fromVirtualFile(f, idx);
    });
  }

  /** 通用：同名未挂载时从 RFS/VFS 打开再挂载；FileNotFound 静默跳过。 */
  async addArchiveByFilename(path: string, factory: (f: any) => Archive): Promise<void> {
    if (this.allArchives.has(path)) return;
    let file: any;
    try {
      file = await this.openFileWithRfs(path);
    } catch (e) {
      if (e instanceof FileNotFoundError) return; // silently skip archives not in the install
      throw e;
    }
    if (file) this.addArchive(factory(file), path);
  }

  /** 先 RFS 再 VFS 打开；两者都找不到抛 FileNotFoundError。 */
  async openFileWithRfs(path: string): Promise<any> {
    let file: any;
    try {
      file = await this.rfs.openFile(path);
    } catch (e) {
      if (!(e instanceof FileNotFoundError)) throw e;
    }
    if (!file) {
      if (!this.fileExists(path)) throw new FileNotFoundError(`File "${path}" not found`);
      file = this.openFile(path);
    }
    return file;
  }

  /**
   * 挂载 YR 隐式 MIX 集合（*md.mix + 基础 .mix + audio.bag + 地图包）。
   * engineType 参数仅保留签名兼容，当前恒为 YurisRevenge。
   */
  async loadImplicitMixFiles(engineType?: any): Promise<void> {
    this.logger.info("Initializing implicit mix files...");
    await this.addMixFile("langmd.mix");
    await this.addMixFile("language.mix");
    await this.addMixFile("ra2md.mix");
    await this.addMixFile("ra2.mix");
    await this.addMixFile("cachemd.mix");
    await this.addMixFile("cache.mix");
    await this.addMixFile("loadmd.mix");
    await this.addMixFile("load.mix");
    await this.addMixFile("localmd.mix");
    await this.addMixFile("local.mix");
    await this.addMixFile("ntrlmd.mix");
    await this.addMixFile("neutral.mix");
    await this.addMixFile("audiomd.mix");
    await this.addMixFile("audio.mix");
    await this.addBagFile("audio.bag");
    await this.addMixFile("conqmd.mix");
    await this.addMixFile("conquer.mix");
    await this.addMixFile("genermd.mix");
    await this.addMixFile("generic.mix");
    await this.addMixFile("isogenmd.mix");
    await this.addMixFile("isogen.mix");
    await this.addMixFile("cameomd.mix");
    await this.addMixFile("cameo.mix");
    await this.addMixFile("multimd.mix");
    await this.addMixFile("multi.mix");
    // Map packs (skirmish/campaign maps live inside these archives).
    await this.addMixFile("maps01.mix");
    await this.addMixFile("maps02.mix");
    await this.addMixFile("mapsmd03.mix");
  }

  /**
   * 扫描真实 FS 挂载 expand/ecache/elocal 00..99 系列与 .mmx/.yro。
   * _opts 仅为签名兼容（未使用）。
   */
  async loadExtraMixFiles(_opts?: unknown): Promise<void> {
    const names = new Set<string>();
    for await (const e of this.rfs.getEntries()) names.add(e.toLowerCase());
    for (const base of ["ecache", "expand", "elocal"]) {
      for (let t = 99; t >= 0; t--) {
        const candidates = ["" + base + pad(t, "00") + ".mix", `${base}md${pad(t, "00")}.mix`];
        for (const c of candidates) if (names.has(c)) await this.addMixFile(c);
      }
    }
    const exts = [".mmx", ".yro"];
    for (const ext of exts) {
      for (const n of names) {
        if (n.endsWith(ext)) this.addArchive(new MixFile((await this.rfs.openFile(n)).stream), n);
      }
    }
  }

  /** 把散落 .ini/.csf（可 exclude）收进 mem.archive 挂载。 */
  async loadStandaloneFiles(opts?: StandaloneOptions): Promise<void> {
    const exts = ["ini", "csf"];
    const exclude = new Set((opts?.exclude ?? []).map((x) => x.toLowerCase()));
    const files: any[] = [];
    for await (const entry of this.rfs.getEntries()) {
      const lower = entry.toLowerCase();
      if (exts.some((e) => lower.endsWith("." + e)) && !exclude.has(lower)) {
        files.push(await this.rfs.openFile(entry, true));
      }
    }
    if (files.length) {
      const mem = new MemArchive();
      for (const f of files) mem.addFile(f);
      this.addArchive(mem as any, "mem.archive");
    }
  }
}
