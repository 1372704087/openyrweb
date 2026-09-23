/**
 * Variable — 地图脚本变量（名称 → 字符串值）的不可变记录。
 *
 * clone 返回新实例；name/value 语义上应视为只读。
 *
 * 由 data/map/Variable.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
export class Variable {
  constructor(
    /** 变量名。 */
    public name: string,
    /** 变量值。 */
    public value: string,
  ) {}

  /** 浅拷贝为新 Variable。 */
  clone(): Variable {
    return new Variable(this.name, this.value);
  }
}
