/**
 * Traits — 游戏对象特性的有序容器（带按类型查询缓存）。
 *
 * 本引擎用"组合优于继承"组织单位能力：一个 GameObject 挂一组 trait
 * （MoveTrait 移动、TurretTrait 炮塔、HarvesterTrait 采矿……），trait
 * 通过 Symbol 通知接口（见 game/gameobject/trait/interface/*）接收
 * GameObject 广播的生命周期事件。本容器即 GameObject 持有的 trait
 * 注册表：保持插入顺序（影响 tick 执行顺序）、支持查询缓存。
 *
 * filter() 的两种匹配模式：
 *  - 传构造函数 → instanceof 精确类匹配；
 *  - 传普通对象 → traitImplements"鸭子实现"匹配（见方法注释）。
 * 缓存以查询键为索引，任何增删（add/addToFront/remove/clear）都会整体
 * 失效——容量小、改动少，全量重建比增量维护更划算。
 *
 * 由 game/Traits.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Traits {
  /** 按插入序存放的全部 trait（顺序即 tick 通知顺序）。 */
  allTraits: any[] = [];
  /** 查询结果缓存：键为构造函数或原型对象，值为匹配的 trait 数组。 */
  traitsByTypeCache = new Map<any, any[]>();

  /** 追加到尾部并使查询缓存失效。 */
  add(trait: any): void {
    this.allTraits.push(trait);
    this.traitsByTypeCache.clear();
  }

  /** 插入到头部（保证最先 tick）并使查询缓存失效。 */
  addToFront(trait: any): void {
    this.allTraits.unshift(trait);
    this.traitsByTypeCache.clear();
  }

  /** 移除指定 trait（存在才动缓存）。 */
  remove(trait: any): void {
    const index = this.allTraits.indexOf(trait);
    if (index !== -1) {
      this.allTraits.splice(index, 1);
      this.traitsByTypeCache.clear();
    }
  }

  /** 按构造函数（instanceof）或原型对象（方法名集合）过滤，结果走缓存。 */
  filter(typeOrPrototype: Function | object): any[] {
    let cached = this.traitsByTypeCache.get(typeOrPrototype);
    if (!cached) {
      cached =
        typeof typeOrPrototype === "function"
          ? this.allTraits.filter((trait) => trait instanceof typeOrPrototype)
          : this.allTraits.filter((trait) => this.traitImplements(trait, typeOrPrototype));
      this.traitsByTypeCache.set(typeOrPrototype, cached);
    }
    return cached;
  }

  /** 取第一个匹配 trait，无匹配则抛错（"该对象应当有此能力"的断言式取用）。 */
  get(typeOrPrototype: Function | object): any {
    const trait = this.find(typeOrPrototype);
    if (!trait) throw new Error("No matching trait found");
    return trait;
  }

  /** 取第一个匹配 trait，可缺省（"有就用"的取用）。 */
  find(typeOrPrototype: Function | object): any {
    return this.filter(typeOrPrototype)[0];
  }

  getAll(): any[] {
    return this.allTraits;
  }

  /**
   * 实现检查：遍历 typeOrPrototype 的自有属性名 i，要求 trait 在键
   * typeOrPrototype[i] 上有定义（值为成员名）。任一缺失则不匹配。
   */
  traitImplements(trait: any, typeOrPrototype: object): boolean {
    for (const key of Object.getOwnPropertyNames(typeOrPrototype))
      if (trait[typeOrPrototype[key]] === undefined) return false;
    return true;
  }

  clear(): void {
    this.allTraits.length = 0;
    this.traitsByTypeCache.clear();
  }

  /** 依次调用各 trait 的 dispose()（如有），随后清空——对象销毁时调用。 */
  dispose(): void {
    this.getAll().forEach((trait) => trait.dispose?.());
    this.clear();
  }
}
