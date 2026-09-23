/**
 * BuildingAnimData — 建筑动画数据占位类（字段由 read 侧写入）。
 *
 * 孪生导出的是空 class，运行时字段（name/type/art/image 等）在
 * BuildingAnimArtProps.read 中动态赋值，此处仅提供类型壳。
 *
 * 由 engine/renderable/entity/building/BuildingAnimData.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/** 建筑动画数据条目（孪生为空 class，字段为运行时挂载）。 */
export class BuildingAnimData {
  /** 动画对象名（INI 中引用名）。 */
  name?: string;
  /** 所属 AnimationType。 */
  type?: number;
  /** art 段（IniSection / 克隆）。 */
  art?: any;
  /** 受损变体 art 段。 */
  damagedArt?: any;
  /** 主图 Image 名。 */
  image?: string;
  /** 受损变体 Image 名。 */
  damagedImage?: string;
  /** 无电时是否暂停（*Powered）。 */
  pauseWhenUnpowered?: boolean;
  /** 无电时是否仍显示（反 *PoweredLight）。 */
  showWhenUnpowered?: boolean;
  /** 相对地面 X/Y 偏移。 */
  offset?: { x: number; y: number };
  /** 等轴测深度偏移（*YSort）。 */
  ySort?: number;
  /** 是否贴地（UnderDoor* 或 Flat=yes）。 */
  flat?: boolean;
  /** 半透明标记。 */
  translucent?: boolean;
  /** 半透明级别。 */
  translucency?: number;
}
