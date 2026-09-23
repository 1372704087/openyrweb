/**
 * ZipUtils — ZIP 字节组装与 DOS 时间/日期字段编码工具。
 *
 * createByteArray：把 {data,size} 条目列表拼成 Uint8Array；
 *   - data 为可迭代（含 length）→ 直接拷贝
 *   - 否则按 size 写入小端 int8/int16/int32/bigint64
 *   - 未知 size 抛错
 * getTimeStruct/getDateStruct：DOS 时间（(时<<6|分)<<5|秒/2）与
 * 日期（((年-1980)<<4|月)<<5|日）的标准位域。
 *
 * 由 data/zip/ZipUtils.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 字节数组装条目：定长整型或可拷贝序列。 */
export interface ByteArrayPart {
  /** 整型值（配合 size）或字节序列（无 size 或有 length）。 */
  data: number | ArrayLike<number> | bigint;
  /** 定长写入宽度（1/2/4/8）；data 为序列时可省略。 */
  size?: number;
}

export class ZipUtils {
  /** 按条目顺序拼接为单段 Uint8Array（小端）。 */
  static createByteArray(parts: ByteArrayPart[]): Uint8Array {
    const total = parts.reduce((n, p) => n + (p.size || (p.data as ArrayLike<number>).length), 0);
    const out = new Uint8Array(total);
    const view = new DataView(out.buffer);
    let offset = 0;

    parts.forEach((part) => {
      if ((part.data as ArrayLike<number>).length !== undefined) {
        out.set(part.data as ArrayLike<number>, offset);
        offset += (part.data as ArrayLike<number>).length;
      } else {
        switch (part.size) {
          case 1:
            view.setInt8(offset, parseInt(String(part.data)));
            break;
          case 2:
            view.setInt16(offset, parseInt(String(part.data)), true);
            break;
          case 4:
            view.setInt32(offset, parseInt(String(part.data)), true);
            break;
          case 8:
            view.setBigInt64(offset, BigInt(part.data as bigint | number | string), true);
            break;
          default:
            throw new Error(
              'createByteArray: No handler defined for data size ' +
                part.size +
                ' of entry data ' +
                JSON.stringify(part.data),
            );
        }
        offset += part.size!;
      }
    });
    return out;
  }

  /** Date → DOS 时间字段。 */
  static getTimeStruct(date: Date): number {
    return ((date.getHours() << 6) | date.getMinutes()) << 5 | date.getSeconds() / 2;
  }

  /** Date → DOS 日期字段（1980 起）。 */
  static getDateStruct(date: Date): number {
    return ((date.getFullYear() - 1980) << 4 | date.getMonth() + 1) << 5 | date.getDate();
  }
}
