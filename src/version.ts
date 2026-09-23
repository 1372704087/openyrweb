/**
 * 应用版本号常量。
 *
 * 由 version.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 * 孪生导出名为 "version" 的字符串字面量。
 */
const version = "0.1.0";
export default version;
// 具名导出与命名空间导入 * as version 均可命中（孪生 e("version", ...)）。
export { version };
