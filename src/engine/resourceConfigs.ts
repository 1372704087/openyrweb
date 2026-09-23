/**
 * resourceConfigs — 资源类型枚举与预取/剧场资源配置表。
 *
 * 由 engine/resourceConfigs.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { TheaterType } from "engine/TheaterType"; // 已转换

/** 可预加载的资源类型编号。 */
export enum ResourceType {
  /** 等距雪地贴图包 */
  IsoSnow = 0,
  /** 等距温带贴图包 */
  IsoTemp = 1,
  /** 等距都市贴图包 */
  IsoUrb = 2,
  /** 通用建筑动画包 */
  BuildGen = 3,
  /** 雪地剧场包 */
  TheaterSnow = 4,
  /** 温带剧场包 */
  TheaterTemp = 5,
  /** 都市剧场包 */
  TheaterUrb = 6,
  /** 雪地剧场扩展 */
  TheaterSnow2 = 7,
  /** 温带剧场扩展 */
  TheaterTemp2 = 8,
  /** 都市剧场扩展 */
  TheaterUrb2 = 9,
  /** UI 主包 */
  Ui = 10,
  /** 盟军侧边栏 */
  UiAlly = 11,
  /** 苏军侧边栏 */
  UiSov = 12,
  /** 动画包 */
  Anims = 13,
  /** VXL 体素包 */
  Vxl = 14,
  /** 小图标（cameo）包 */
  Cameo = 15,
  /** 规则 INI 包 */
  Ini = 16,
  /** 多语言字符串包 */
  Strings = 17,
  /** 盟军 EVA */
  EvaAlly = 18,
  /** 苏军 EVA */
  EvaSov = 19,
  /** 音效包 */
  Sounds = 20,
  /** 万圣节扩展 */
  HalloweenMix = 21,
  /** 圣诞扩展 */
  XmasMix = 22,
}

/** 单条资源加载配置。 */
export interface ResourceConfig {
  /** 稳定 id（LoaderResult.pop 键） */
  id: string;
  /** 相对（或绝对）资源路径 */
  src: string;
  /** 响应解析类型 */
  type: "binary" | "text" | "json";
  /** 体积提示（字节，用于进度条） */
  sizeHint: number;
}

/**
 * ResourceType → 加载配置。
 * 注意：孪生未注册 ResourceType.Ui 对应以外又缺失的条目时按原样；
 * Ui 在表中（ui.mix）。
 */
export const resourceConfigs: Map<ResourceType, ResourceConfig> = new Map<
  ResourceType,
  ResourceConfig
>()
  .set(ResourceType.IsoSnow, {
    id: "isoSnow",
    src: "isosnow.mix",
    type: "binary",
    sizeHint: 28758698,
  })
  .set(ResourceType.IsoTemp, {
    id: "isoTemp",
    src: "isotemp.mix",
    type: "binary",
    sizeHint: 29171410,
  })
  .set(ResourceType.IsoUrb, {
    id: "isoUrb",
    src: "isourb.mix",
    type: "binary",
    sizeHint: 31811402,
  })
  .set(ResourceType.BuildGen, {
    id: "buildGen",
    src: "build-gen.mix",
    type: "binary",
    sizeHint: 27801690,
  })
  .set(ResourceType.TheaterSnow, {
    id: "theater.snow",
    src: "snow.mix",
    type: "binary",
    sizeHint: 18421274,
  })
  .set(ResourceType.TheaterTemp, {
    id: "theater.temp",
    src: "temperat.mix",
    type: "binary",
    sizeHint: 2728266,
  })
  .set(ResourceType.TheaterUrb, {
    id: "theater.urb",
    src: "urban.mix",
    type: "binary",
    sizeHint: 2726218,
  })
  .set(ResourceType.TheaterSnow2, {
    id: "theater.snow2",
    src: "sno.mix",
    type: "binary",
    sizeHint: 10898,
  })
  .set(ResourceType.TheaterTemp2, {
    id: "theater.temp2",
    src: "tem.mix",
    type: "binary",
    sizeHint: 10850,
  })
  .set(ResourceType.TheaterUrb2, {
    id: "theater.urb2",
    src: "urb.mix",
    type: "binary",
    sizeHint: 10850,
  })
  .set(ResourceType.UiAlly, {
    id: "uially",
    src: "sidec01.mix",
    type: "binary",
    sizeHint: 2099412,
  })
  .set(ResourceType.UiSov, {
    id: "uisov",
    src: "sidec02.mix",
    type: "binary",
    sizeHint: 2102564,
  })
  .set(ResourceType.Anims, {
    id: "anims",
    src: "anims.mix",
    type: "binary",
    sizeHint: 15867898,
  })
  .set(ResourceType.Vxl, {
    id: "vxl",
    src: "vxl.mix",
    type: "binary",
    sizeHint: 5271701,
  })
  .set(ResourceType.Cameo, {
    id: "cameo",
    src: "cameo.mix",
    type: "binary",
    sizeHint: 608120,
  })
  .set(ResourceType.Ini, {
    id: "ini",
    src: "ini.mix",
    type: "binary",
    sizeHint: 1000842,
  })
  .set(ResourceType.Ui, {
    id: "ui",
    src: "ui.mix",
    type: "binary",
    sizeHint: 4424093,
  })
  .set(ResourceType.Strings, {
    id: "strings",
    src: "strings.mix",
    type: "binary",
    sizeHint: 485818,
  })
  .set(ResourceType.EvaAlly, {
    id: "evaally",
    src: "eva-ally.mix",
    type: "binary",
    sizeHint: 1835436,
  })
  .set(ResourceType.EvaSov, {
    id: "evasov",
    src: "eva-sov.mix",
    type: "binary",
    sizeHint: 2021760,
  })
  .set(ResourceType.Sounds, {
    id: "sounds",
    src: "sounds.mix",
    type: "binary",
    sizeHint: 17684750,
  })
  .set(ResourceType.HalloweenMix, {
    id: "halloweenmix",
    src: "expandspawn09.mix",
    type: "binary",
    sizeHint: 20312,
  })
  .set(ResourceType.XmasMix, {
    id: "xmasmix",
    src: "expandspawn10.mix",
    type: "binary",
    sizeHint: 10318,
  });

/** 启动阶段建议预取的资源顺序。 */
export const resourcesForPrefetch: ResourceType[] = [
  ResourceType.BuildGen,
  ResourceType.Sounds,
  ResourceType.Anims,
  ResourceType.Vxl,
  ResourceType.IsoUrb,
  ResourceType.TheaterUrb,
  ResourceType.TheaterUrb2,
  ResourceType.IsoTemp,
  ResourceType.TheaterTemp,
  ResourceType.TheaterTemp2,
  ResourceType.IsoSnow,
  ResourceType.TheaterSnow,
  ResourceType.TheaterSnow2,
];

/** 按剧场类型需要加载的资源列表。 */
export const theaterSpecificResources: Map<TheaterType, ResourceType[]> = new Map([
  [TheaterType.Snow, [ResourceType.TheaterSnow, ResourceType.TheaterSnow2, ResourceType.IsoSnow]],
  [
    TheaterType.Temperate,
    [ResourceType.TheaterTemp, ResourceType.TheaterTemp2, ResourceType.IsoTemp],
  ],
  [TheaterType.Urban, [ResourceType.TheaterUrb, ResourceType.TheaterUrb2, ResourceType.IsoUrb]],
]);
