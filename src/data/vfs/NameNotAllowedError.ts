/**
 * NameNotAllowedError — 文件名非法（含路径分隔符/保留字符）时抛出。
 *
 * 继承 IOError，构造后将 name 固定为 "NameNotAllowedError"，
 * 与孪生 super(...arguments) + 覆盖 name 的行为一致。
 *
 * 由 data/vfs/NameNotAllowedError.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { IOError } from './IOError';

export class NameNotAllowedError extends IOError {
  constructor(message?: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'NameNotAllowedError';
  }
}
