/**
 * MusicSpecs — music/themes 相关 INI 的 Themes 列表解析。
 *
 * 构造时 parse()：读 [Themes] 得到主题名列表，再逐条读各主题 section
 * 的 Name/Sound/Normal/Repeat。缺 section 时警告并跳过。
 *
 * 由 engine/sound/MusicSpecs.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 单条主题（theme）定义。 */
export interface MusicSpec {
  /** 显示名。 */
  name: string;
  /** 音频资源键（Sound 字段）。 */
  sound: string;
  /** 是否进入 Normal 播放列表。 */
  normal: boolean;
  /** 播完后是否循环本曲（而非切下一首）。 */
  repeat: boolean;
}

export class MusicSpecs {
  /** INI 文件句柄。 */
  ini: any;
  /** 主题键 → MusicSpec。 */
  specs = new Map<string, MusicSpec>();

  constructor(ini: any) {
    this.ini = ini;
    this.specs = new Map();
    this.parse();
  }

  /** 解析 [Themes] 及各主题 section；缺 [Themes] 时整表为空。 */
  parse(): void {
    const themes = this.ini.getSection("Themes");
    if (themes) {
      for (const key of themes.entries.values()) {
        if (key) {
          const section = this.ini.getSection(key);
          if (section) {
            const spec: MusicSpec = {
              name: section.getString("Name"),
              sound: section.getString("Sound"),
              normal: section.getBool("Normal", true),
              repeat: section.getBool("Repeat"),
            };
            this.specs.set(key, spec);
          } else {
            console.warn(`Music section [${key}] not found. Skipping.`);
          }
        }
      }
    } else {
      console.warn("[Themes] section missing. Music will not be played.");
    }
  }

  /** 按主题键查询。 */
  getSpec(key: string): MusicSpec | undefined {
    return this.specs.get(key);
  }

  /** 返回全部主题的数组快照。 */
  getAll(): MusicSpec[] {
    return [...this.specs.values()];
  }
}
