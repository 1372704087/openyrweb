/**
 * MapLighting — 地图光照参数（INI [Lighting]/[General] 派生字段）。
 *
 * read() 从 IniSection 按前缀读取 Level/Ambient/Red/Green/Blue/Ground；
 * forceTint 不参与 read（仅运行时覆盖）。copy() 深拷贝全部字段。
 *
 * 由 data/map/MapLighting.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
import type { IniSection } from '../IniSection';

export class MapLighting {
  /** 日照/高度相关等级。 */
  level = 0;
  /** 环境光强度。 */
  ambient = 1;
  /** 三通道颜色乘数。 */
  red = 1;
  green = 1;
  blue = 1;
  /** 地面光照。 */
  ground = 0;
  /** 运行时强制着色（不写入 INI）。 */
  forceTint = false;

  /** 从带可选键前缀的节读取（prefix 如 "" 或 "Day"）。 */
  read(section: IniSection, prefix = ''): this {
    this.level = section.getNumber(prefix + 'Level', 0.032);
    this.ambient = section.getNumber(prefix + 'Ambient', 1);
    this.red = section.getNumber(prefix + 'Red', 1);
    this.green = section.getNumber(prefix + 'Green', 1);
    this.blue = section.getNumber(prefix + 'Blue', 1);
    this.ground = section.getNumber(prefix + 'Ground', 0);
    return this;
  }

  /** 从另一 MapLighting 拷贝全部字段（含 forceTint）。 */
  copy(other: MapLighting): this {
    this.level = other.level;
    this.ambient = other.ambient;
    this.red = other.red;
    this.green = other.green;
    this.blue = other.blue;
    this.ground = other.ground;
    this.forceTint = other.forceTint;
    return this;
  }
}
