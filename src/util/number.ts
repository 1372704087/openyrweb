/**
 * 数值位级重解释工具。
 *
 * 由 util/number.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/**
 * 将 32 位有符号整数的二进制位模式按 IEEE-754 float32 重解释读出。
 *
 * 先以 setInt32 写入同一块 4 字节缓冲，再以 getFloat32 读出——
 * 等价于 C 中的 `*(float*)&n` 类型双关；读写同缓冲同偏移，主机端序不影响结果。
 */
export function int32ToFloat32(value: number): number {
  const view = new DataView(new ArrayBuffer(4));
  view.setInt32(0, value);
  return view.getFloat32(0);
}
