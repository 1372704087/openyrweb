/**
 * IdxEntry — WAVE 索引（.idx）单条目录项。
 *
 * 由 data/IdxEntry.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 孪生中该类为空壳（仅占位导出），字段由 IdxFile.parse 挂载；
 * 此处保持一致：不声明任何自有成员，避免行为差异。
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class IdxEntry {}
