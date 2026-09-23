/**
 * MiniLzo — LZO1x 解压包装（全局 lzo1x 实现）。
 *
 * 调用全局 lzo1x.decompress；返回码非 0 视为失败并抛 Error。
 * 成功时返回 outputBuffer（由解压库填充的 Uint8Array）。
 *
 * 由 data/encoding/MiniLzo.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const lzo1x: any;

export class MiniLzo {
  /**
   * 解压 LZO1x 数据到期望长度 outputSize。
   * @param input 压缩输入缓冲
   * @param outputSize 期望输出字节数
   */
  static decompress(input: Uint8Array, outputSize: number): Uint8Array {
    const state = { inputBuffer: input, outputBuffer: null as Uint8Array | null };
    const code = lzo1x.decompress(state, { outputSize });
    if (code !== 0) throw new Error("MiniLzo decode failed with code " + code);
    return state.outputBuffer;
  }
}
