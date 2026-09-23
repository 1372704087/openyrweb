/**
 * WolLocale — WOL 区域/语言枚举与 BCP-47 代码映射。
 *
 * 由 network/WolLocale.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 关键语义（勿改）：数值与反向映射名称字符串、localeCodeMap 的键值对
 * 与孪生逐项一致。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** WOL 区域/语言。 */
export enum WolLocale {
  /** 未知。 */
  Unknown = 0,
  /** 其他。 */
  Other = 1,
  /** 美国。 */
  Usa = 2,
  /** 加拿大。 */
  Canada = 3,
  /** 英国。 */
  Uk = 4,
  /** 德国。 */
  Germany = 5,
  /** 法国。 */
  France = 6,
  /** 西班牙。 */
  Spain = 7,
  /** 荷兰。 */
  Netherlands = 8,
  /** 比利时。 */
  Belgium = 9,
  /** 奥地利。 */
  Austria = 10,
  /** 瑞士。 */
  Switzerland = 11,
  /** 意大利。 */
  Italy = 12,
  /** 丹麦。 */
  Denmark = 13,
  /** 瑞典。 */
  Sweden = 14,
  /** 挪威。 */
  Norway = 15,
  /** 芬兰。 */
  Finland = 16,
  /** 以色列。 */
  Israel = 17,
  /** 南非。 */
  SouthAfrica = 18,
  /** 日本。 */
  Japan = 19,
  /** 韩国。 */
  SouthKorea = 20,
  /** 中国。 */
  China = 21,
  /** 新加坡。 */
  Singapore = 22,
  /** 台湾。 */
  Taiwan = 23,
  /** 马来西亚。 */
  Malaysia = 24,
  /** 澳大利亚。 */
  Australia = 25,
  /** 新西兰。 */
  NewZealand = 26,
  /** 巴西。 */
  Brazil = 27,
  /** 泰国。 */
  Thailand = 28,
  /** 阿根廷。 */
  Argentina = 29,
  /** 菲律宾。 */
  Philippines = 30,
  /** 希腊。 */
  Greece = 31,
  /** 爱尔兰。 */
  Ireland = 32,
  /** 波兰。 */
  Poland = 33,
  /** 葡萄牙。 */
  Portugal = 34,
  /** 墨西哥。 */
  Mexico = 35,
  /** 俄罗斯。 */
  Russia = 36,
  /** 土耳其。 */
  Turkey = 37,
}

/**
 * BCP-47 / WOL 区域代码 → WolLocale 映射。
 * 仅收录孪生显式 set 的条目（勿增删）。
 */
export const localeCodeMap: Map<string, WolLocale> = new Map()
  .set("en-US", WolLocale.Usa)
  .set("en-GB", WolLocale.Uk)
  .set("de-DE", WolLocale.Germany)
  .set("es-ES", WolLocale.Spain)
  .set("fr-FR", WolLocale.France)
  .set("it-IT", WolLocale.Italy)
  .set("ja-JP", WolLocale.Japan)
  .set("ko-KR", WolLocale.SouthKorea)
  .set("nl-NL", WolLocale.Netherlands)
  .set("pl-PL", WolLocale.Poland)
  .set("pt-BR", WolLocale.Brazil)
  .set("pt-PT", WolLocale.Portugal)
  .set("ru-RU", WolLocale.Russia)
  .set("zh-CN", WolLocale.China)
  .set("zh-TW", WolLocale.Taiwan);
