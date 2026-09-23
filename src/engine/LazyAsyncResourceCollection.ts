/**
 * LazyAsyncResourceCollection — 异步惰性资源集合（内存缓存 + rfs 目录按需工厂）。
 *
 * 由 engine/LazyAsyncResourceCollection.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/** 原始文件目录最小形状（孪生 rfsDir 调用面）。 */
export interface RawFileDirLike {
  containsEntry(name: string): Promise<boolean> | boolean;
  getRawFile(name: string): Promise<unknown> | unknown;
}

/** 异步资源工厂：由原始文件构造资源（可为 Promise）。 */
export type AsyncResourceFactory<T> = (file: unknown) => T | Promise<T>;

/**
 * 异步惰性资源集合。
 * get/has 为 async；cache=false 时不写入内存缓存（如主题流式加载）。
 */
export class LazyAsyncResourceCollection<T = any> {
  /** 资源构造工厂 */
  resourceFactory: AsyncResourceFactory<T>;
  /** 是否写入内存缓存 */
  cache: boolean;
  /** 已缓存资源 */
  resources: Map<string, T>;
  /** 原始文件目录（setDir 注入；可为 undefined） */
  rfsDir?: RawFileDirLike;

  /**
   * @param resourceFactory - 资源工厂
   * @param cache - 是否缓存（默认 true，与孪生 !0 一致）
   */
  constructor(resourceFactory: AsyncResourceFactory<T>, cache: boolean = true) {
    this.resourceFactory = resourceFactory;
    this.cache = cache;
    this.resources = new Map();
  }

  /** 注入原始文件目录。 */
  setDir(rfsDir: RawFileDirLike): void {
    this.rfsDir = rfsDir;
  }

  /** 直接写入一项缓存。 */
  set(key: string, value: T): void {
    this.resources.set(key, value);
  }

  /**
   * 是否存在（缓存或目录条目）。
   * @param key - 资源名
   */
  async has(key: string): Promise<boolean> {
    return !!this.resources.has(key) || ((await this.rfsDir?.containsEntry(key)) ?? false);
  }

  /**
   * 取资源：优先缓存，否则目录打开并工厂构造（按 cache 决定是否缓存）。
   * @param key - 资源名
   */
  async get(key: string): Promise<T | undefined> {
    let t = this.resources.get(key);
    if (!t && (await this.rfsDir?.containsEntry(key))) {
      t = await this.resourceFactory(await this.rfsDir!.getRawFile(key));
      if (this.cache) {
        this.resources.set(key, t);
      }
    }
    return t;
  }

  /** 清空内存缓存。 */
  clear(): void {
    this.resources.clear();
  }
}
