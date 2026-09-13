/**
 * Traits — 游戏对象特性的有序容器（带按类型查询缓存）。
 *
 * filter() 接受两种形式：构造函数（instanceof 匹配）或原型对象（按其自有
 * 属性名做"鸭子实现"匹配）。由 game/Traits.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Traits {
  allTraits: any[] = [];
  traitsByTypeCache = new Map<any, any[]>();

  add(trait: any): void {
    this.allTraits.push(trait);
    this.traitsByTypeCache.clear();
  }

  addToFront(trait: any): void {
    this.allTraits.unshift(trait);
    this.traitsByTypeCache.clear();
  }

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

  /** 取第一个匹配 trait，无匹配则抛错。 */
  get(typeOrPrototype: Function | object): any {
    const trait = this.find(typeOrPrototype);
    if (!trait) throw new Error("No matching trait found");
    return trait;
  }

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

  /** 依次调用各 trait 的 dispose()（如有），随后清空。 */
  dispose(): void {
    this.getAll().forEach((trait) => trait.dispose?.());
    this.clear();
  }
}
