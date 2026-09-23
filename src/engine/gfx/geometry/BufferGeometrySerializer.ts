/**
 * BufferGeometrySerializer — BufferGeometry ↔ 二进制（DataStream）序列化。
 * 不支持 morphAttributes；groups 仅允许 0 或 1 组（孪生只检查 >1 抛错）。
 *
 * 由 engine/gfx/geometry/BufferGeometrySerializer.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { DataStream } from "data/DataStream"; // 孪生

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** BufferGeometry 最小形状。 */
export interface GeometryLike {
  morphAttributes: Record<string, any>;
  groups: unknown[];
  attributes: Record<string, any>;
  index?: any;
  getAttribute(name: string): any;
  addAttribute(name: string, attr: any): any;
  setIndex(index: any): any;
}

/** BufferGeometrySerializer：自定义紧凑二进制格式。 */
export class BufferGeometrySerializer {
  /** 序列化为 ArrayBuffer（属性计数 + 每属性 20 字节 C 字符串头 + 数组 + index 标志）。 */
  serialize(geometry: GeometryLike): ArrayBuffer {
    if (Object.keys(geometry.morphAttributes).length) {
      throw new Error("Morph attributes are not supported");
    }
    if (geometry.groups.length > 1) throw new Error("Groups are not supported");

    const names = Object.keys(geometry.attributes);
    const index = geometry.index;
    const byteLength =
      1 +
      22 * names.length +
      Object.values(geometry.attributes)
        .map((a: any) => this.getTypedArrayByteSize(a.array))
        .reduce((sum: number, n: number) => sum + n, 0) +
      1 +
      (index ? this.getTypedArrayByteSize(index.array) : 0);

    const stream = new DataStream(new ArrayBuffer(byteLength));
    stream.writeUint8(names.length);
    for (const name of names) {
      const attr = geometry.getAttribute(name);
      stream.writeCString(name, 20);
      stream.writeUint8(attr.itemSize);
      stream.writeUint8(Number(attr.normalized));
      this.writeTypedArray(stream, attr.array);
    }
    stream.writeUint8(Number(Boolean(index)));
    if (index) this.writeTypedArray(stream, index.array);
    stream.seek(0);
    (stream as any).dynamicSize = false;
    return stream.buffer as ArrayBuffer;
  }

  /** 从 DataStream 还原 BufferGeometry。 */
  unserialize(stream: DataStream): any {
    const geometry = new THREE.BufferGeometry();
    const count = stream.readUint8();
    for (let i = 0; i < count; i++) {
      const name = stream.readCString(20);
      const itemSize = stream.readUint8();
      const normalized = Boolean(stream.readUint8());
      const array = this.readTypedArray(stream);
      const attr = new THREE.BufferAttribute(array, itemSize, normalized);
      geometry.addAttribute(name, attr);
    }
    if (Boolean(stream.readUint8())) {
      const indexArray = this.readTypedArray(stream);
      geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));
    }
    return geometry;
  }

  /** 写类型标签（0=f32,1=u32,2=u16）+ 长度 + 数组。 */
  writeTypedArray(stream: DataStream, array: any): void {
    stream.writeUint32(array.length);
    if (array instanceof Float32Array) {
      stream.writeUint8(0);
      stream.writeFloat32Array(array);
    } else if (array instanceof Uint32Array) {
      stream.writeUint8(1);
      stream.writeUint32Array(array);
    } else {
      if (!(array instanceof Uint16Array)) {
        throw new Error(`Unsupported array type "${array.constructor.name}"`);
      }
      stream.writeUint8(2);
      stream.writeUint16Array(array);
    }
  }

  /** 读长度 + 类型标签并返回对应 TypedArray。 */
  readTypedArray(stream: DataStream): any {
    const length = stream.readUint32();
    const type = stream.readUint8();
    switch (type) {
      case 0:
        return stream.readFloat32Array(length);
      case 1:
        return stream.readUint32Array(length);
      case 2:
        return stream.readUint16Array(length);
      default:
        throw new Error(`Unsupported array type "${type}"`);
    }
  }

  /** 序列化后数组占用：4 字节长度前缀 + 1 字节类型标签 + 元素。 */
  getTypedArrayByteSize(array: { BYTES_PER_ELEMENT: number; length: number }): number {
    return 5 + array.BYTES_PER_ELEMENT * array.length;
  }
}
