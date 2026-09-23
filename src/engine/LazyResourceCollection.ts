/**
 * LazyResourceCollection — 同步惰性资源集合（内存缓存 + VFS 按需工厂）。
 *
 * 由 engine/LazyResourceCollection.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/** 虚拟文件系统最小形状（孪生 vfs 调用面）。 */
export interface VfsLike {
  fileExists(name: string): boolean;
  openFile(name: string): unknown;
}

/** 资源工厂：由文件句柄构造资源对象。 */
export type ResourceFactory<T> = (file: unknown) => T;

/**
 * 同步惰性资源集合。
 * 已 set 的项直接命中；否则若 vfs 存在该文件则工厂构造并缓存。
 */
export class LazyResourceCollection<T = any> {
  /** 资源构造工厂 */
  resourceFactory: ResourceFactory<T>;
  /** 已缓存资源 */
  resources: Map<string, T>;
  /** 可选虚拟文件系统（setVfs 注入） */
  vfs?: VfsLike;

  constructor(resourceFactory: ResourceFactory<T>) {
    this.resourceFactory = resourceFactory;
    this.resources = new Map();
  }

  /** 注入虚拟文件系统。 */
  setVfs(vfs: VfsLike): void {
    this.vfs = vfs;
  }

  /** 直接写入一项缓存。 */
  set(key: string, value: T): void {
    this.resources.set(key, value);
  }

  /**
   * 是否存在（缓存或 vfs）。
   * @param key - 资源名
   */
  has(key: string): boolean {
    return !!this.resources.has(key) || (this.vfs?.fileExists(key) ?? false);
  }

  /**
   * 取资源：优先缓存，否则 vfs 打开并工厂构造后写入缓存。
   * @param key - 资源名
   */
  get(key: string): T | undefined {
    let t = this.resources.get(key);
    if (!t && this.vfs?.fileExists(key)) {
      t = this.resourceFactory(this.vfs.openFile(key));
      this.resources.set(key, t);
    }
    return t;
  }

  /**
   * 清理缓存。
   * @param key - 指定键则只删该键；省略则清空
   */
  clear(key?: string): void {
    if (key) {
      this.resources.delete(key);
    } else {
      this.resources.clear();
    }
  }
}
