/**
 * BufferGeometryUtils — 顶点合并与多几何体拼接（three 旧版 BufferGeometryUtils 子集）。
 *
 * 由 engine/gfx/BufferGeometryUtils.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 读取器：按分量取属性值。 */
type ComponentGetter = (attr: any, index: number) => number;

/** BufferGeometryUtils 静态工具。 */
export class BufferGeometryUtils {
  /**
   * 按 tolerance 量化坐标键合并重复顶点，返回去重后的克隆几何体。
   * @param tolerance 默认 1e-4；内部提升到 max(tol, Number.EPSILON) 后取 10^log10(1/tol)。
   */
  static mergeVertices(geometry: any, tolerance: number = 1e-4): any {
    tolerance = Math.max(tolerance, Number.EPSILON);
    const hash: Record<string, number> = {};
    const index = geometry.getIndex();
    const position = geometry.getAttribute("position");
    const vertexCount = (index || position).count;
    let uniqueCount = 0;

    const names = Object.keys(geometry.attributes);
    const unique: Record<string, any[]> = {};
    const morphUnique: Record<string, any[][]> = {};
    const cache: number[] = [];
    const getters: ComponentGetter[] = [
      (attr, i) => attr.getX(i),
      (attr, i) => attr.getY(i),
      (attr, i) => attr.getZ(i),
      (attr, i) => attr.getW(i),
    ];

    for (let a = 0, m = names.length; a < m; a++) {
      const name = names[a];
      unique[name] = [];
      const morphs = geometry.morphAttributes[name];
      if (morphs) morphUnique[name] = new Array(morphs.length).fill(undefined).map(() => []);
    }

    const exp = Math.log10(1 / tolerance);
    const multiplier = Math.pow(10, exp);

    for (let v = 0; v < vertexCount; v++) {
      const src = index ? index.getX(v) : v;
      let key = "";
      for (let n = 0, nameLen = names.length; n < nameLen; n++) {
        const name = names[n];
        const attr = geometry.getAttribute(name);
        const itemSize = attr.itemSize;
        for (let c = 0; c < itemSize; c++) key += ~~(getters[c](attr, src) * multiplier) + ",";
      }
      if (key in hash) {
        cache.push(hash[key]);
      } else {
        for (let n = 0, nameLen = names.length; n < nameLen; n++) {
          const name = names[n];
          const attr = geometry.getAttribute(name);
          const morphs = geometry.morphAttributes[name];
          const itemSize = attr.itemSize;
          const out = unique[name];
          const morphOut = morphUnique[name];
          for (let c = 0; c < itemSize; c++) {
            const get = getters[c];
            out.push(get(attr, src));
            if (morphs) {
              for (let mi = 0, morphLen = morphs.length; mi < morphLen; mi++) {
                morphOut[mi].push(get(morphs[mi], src));
              }
            }
          }
        }
        hash[key] = uniqueCount;
        cache.push(uniqueCount);
        uniqueCount++;
      }
    }

    const result = geometry.clone();
    for (let b = 0, nameLen = names.length; b < nameLen; b++) {
      const name = names[b];
      const orig = geometry.getAttribute(name);
      const arr = new orig.array.constructor(unique[name]);
      const attr = new THREE.BufferAttribute(arr, orig.itemSize, orig.normalized);
      result.addAttribute(name, attr);
      if (name in morphUnique) {
        for (let mi = 0; mi < morphUnique[name].length; mi++) {
          const origMorph = geometry.morphAttributes[name][mi];
          const mArr = new origMorph.array.constructor(morphUnique[name][mi]);
          const mAttr = new THREE.BufferAttribute(mArr, origMorph.itemSize, origMorph.normalized);
          result.morphAttributes[name][mi] = mAttr;
        }
      }
    }
    result.setIndex(new THREE.BufferAttribute(new Uint32Array(cache), 1));
    return result;
  }

  /**
   * 拼接一组同构几何体（要求 index 有无一致、属性集合一致、无 morph）。
   * @param useGroups 为 true 时为每个输入几何体 addGroup。
   */
  static mergeBufferGeometries(geometries: any[], useGroups: boolean = false): any {
    // 空列表（迷雾 0×0、无 tile 等）直接返回空几何，避免 geometries[0].index 抛错
    if (!geometries || geometries.length === 0) {
      return new THREE.BufferGeometry();
    }
    const isIndexed = geometries[0].index !== null;
    const attributes = new Set(Object.keys(geometries[0].attributes));
    const collected: Record<string, any[]> = {};
    const merged = new THREE.BufferGeometry();
    let offset = 0;

    for (let g = 0; g < geometries.length; ++g) {
      const geometry = geometries[g];
      let count = 0;
      if (isIndexed !== (geometry.index !== null)) {
        throw new Error(
          "mergeBufferGeometries() failed with geometry at index " +
            g +
            ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.",
        );
      }
      if (Object.keys(geometry.morphAttributes).length) {
        throw new Error(
          "mergeBufferGeometries() failed with geometry at index " + g + ". Morph attributes are not supported",
        );
      }
      for (const name in geometry.attributes) {
        if (!attributes.has(name)) {
          throw new Error(
            "mergeBufferGeometries() failed with geometry at index " +
              g +
              '. All geometries must have compatible attributes; make sure "' +
              name +
              '" attribute exists among all geometries, or in none of them.',
          );
        }
        if (collected[name] === undefined) collected[name] = [];
        collected[name].push(geometry.attributes[name]);
        count++;
      }
      if (count !== attributes.size) {
        throw new Error(
          "mergeBufferGeometries() failed with geometry at index " +
            g +
            ". Make sure all geometries have the same number of attributes.",
        );
      }
      if (useGroups) {
        let groupCount: number;
        if (isIndexed) {
          groupCount = geometry.index.count;
        } else {
          if (geometry.attributes.position === undefined) {
            throw new Error(
              "mergeBufferGeometries() failed with geometry at index " +
                g +
                ". The geometry must have either an index or a position attribute",
            );
          }
          groupCount = geometry.attributes.position.count;
        }
        merged.addGroup(offset, groupCount, g);
        offset += groupCount;
      }
    }

    if (isIndexed) {
      let total = 0;
      const mergedIndex: number[] = [];
      for (let i = 0; i < geometries.length; ++i) {
        const idx = geometries[i].index;
        for (let j = 0; j < idx.count; ++j) mergedIndex.push(idx.getX(j) + total);
        total += geometries[i].attributes.position.count;
      }
      const Ctor = mergedIndex.length > 65535 ? Uint32Array : Uint16Array;
      merged.setIndex(new THREE.BufferAttribute(new Ctor(mergedIndex), 1));
    }

    for (const name in collected) {
      const attr = this.mergeBufferAttributes(collected[name]);
      if (!attr) {
        throw new Error("mergeBufferGeometries() failed while trying to merge the " + name + " attribute.");
      }
      merged.addAttribute(name, attr);
    }
    return merged;
  }

  /** 拼接同构 BufferAttribute 列表（类型/itemSize/normalized 必须一致）。 */
  static mergeBufferAttributes(attributes: any[]): any {
    let arrayType: any;
    let itemSize: number | undefined;
    let normalized: boolean | undefined;
    let total = 0;
    for (let i = 0; i < attributes.length; ++i) {
      const attr = attributes[i];
      if (attr.isInterleavedBufferAttribute) {
        throw new Error("mergeBufferAttributes() failed. InterleavedBufferAttributes are not supported.");
      }
      if (arrayType === undefined) arrayType = attr.array.constructor;
      if (arrayType !== attr.array.constructor) {
        throw new Error(
          "mergeBufferAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.",
        );
      }
      if (itemSize === undefined) itemSize = attr.itemSize;
      if (itemSize !== attr.itemSize) {
        throw new Error(
          "mergeBufferAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.",
        );
      }
      if (normalized === undefined) normalized = attr.normalized;
      if (normalized !== attr.normalized) {
        throw new Error(
          "mergeBufferAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.",
        );
      }
      total += attr.array.length;
    }
    const array = new arrayType(total);
    let offset = 0;
    for (let i = 0; i < attributes.length; ++i) {
      array.set(attributes[i].array, offset);
      offset += attributes[i].array.length;
    }
    return new THREE.BufferAttribute(array, itemSize, normalized);
  }
}
