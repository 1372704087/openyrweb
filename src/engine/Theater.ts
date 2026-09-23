/**
 * Theater — 战区实例（调色板 + TileSets + 类型/设置）。
 *
 * 由 engine/Theater.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as TileSetsModule from "game/theater/TileSets"; // 孪生
import { PaletteType } from "engine/type/PaletteType"; // 已转换
import { TheaterType } from "engine/TheaterType"; // 已转换

const TileSets = (TileSetsModule as any).TileSets as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 调色板集合：名称 → 调色板对象。 */
export type PaletteMapLike = Map<string, any>;

/** 战区设置（类型、INI、MIX、扩展名、调色板名等）。 */
export interface TheaterSettingsLike {
  type: TheaterType;
  theaterIni: string;
  mixes: string[];
  extension: string;
  newTheaterChar: string;
  isoPaletteName: string;
  unitPaletteName: string;
  overlayPaletteName: string;
  libPaletteName: string;
}

/**
 * 战区实例。
 * 由 Theater.factory 从剧场设置 + 调色板集合 + TileSets 数据组装。
 */
export class Theater {
  /** 战区类型 */
  type: TheaterType;
  /** 战区设置 */
  settings: TheaterSettingsLike;
  /** 全部调色板（按文件名索引） */
  palettes: PaletteMapLike;
  /** 等距/地块调色板 */
  isoPalette: any;
  /** 覆盖物调色板 */
  ovlPalette: any;
  /** 单位调色板 */
  unitPalette: any;
  /** 动画调色板 */
  animPalette: any;
  /** 库（lib）调色板 */
  libPalette: any;
  /** 地块集数据 */
  tileSets: any;

  /**
   * 工厂：校验各调色板存在后加载 TileSets 并构造实例。
   * @param e - 战区类型
   * @param t - TileSets 构造用的 INI/数据源（由调用方传入）
   * @param i - 战区设置
   * @param r - tile 数据源（loadTileData 第一参）
   * @param s - 调色板集合
   */
  static factory(
    e: TheaterType,
    t: any,
    i: TheaterSettingsLike,
    r: any,
    s: PaletteMapLike,
  ): Theater {
    const a = s.get(i.isoPaletteName);
    if (!a) {
      throw new Error(`Missing palette "${i.isoPaletteName}"`);
    }
    const n = s.get(i.overlayPaletteName);
    if (!n) {
      throw new Error(`Missing palette "${i.overlayPaletteName}"`);
    }
    const o = s.get(i.unitPaletteName);
    if (!o) {
      throw new Error(`Missing palette "${i.unitPaletteName}"`);
    }
    const l = s.get("anim.pal");
    if (!l) {
      throw new Error("Missing anim palette");
    }
    const c = s.get(i.libPaletteName);
    if (!c) {
      throw new Error("Missing lib palette " + i.libPaletteName);
    }
    const h = new TileSets(t);
    h.loadTileData(r, i.extension);
    return new this(e, i, s, a, n, o, l, c, h);
  }

  constructor(
    type: TheaterType,
    settings: TheaterSettingsLike,
    palettes: PaletteMapLike,
    isoPalette: any,
    ovlPalette: any,
    unitPalette: any,
    animPalette: any,
    libPalette: any,
    tileSets: any,
  ) {
    this.type = type;
    this.settings = settings;
    this.palettes = palettes;
    this.isoPalette = isoPalette;
    this.ovlPalette = ovlPalette;
    this.unitPalette = unitPalette;
    this.animPalette = animPalette;
    this.libPalette = libPalette;
    this.tileSets = tileSets;
  }

  /**
   * 按 PaletteType 取调色板；Custom 时用名称查（"lib" 走 libPalette）。
   * default 分支（含 None/Default）返回 isoPalette——与孪生一致。
   * @param e - 调色板类型
   * @param t - Custom 时的名称
   */
  getPalette(e: PaletteType, t?: string): any {
    switch (e) {
      case PaletteType.Anim:
        return this.animPalette;
      case PaletteType.Overlay:
        return this.ovlPalette;
      case PaletteType.Unit:
        return this.unitPalette;
      case PaletteType.Custom: {
        if (t === "lib") {
          return this.libPalette;
        }
        const i = this.palettes.get(t + ".pal");
        if (!i) {
          throw new Error(`Custom palette "${t}" not found`);
        }
        return i;
      }
      default: {
        // 孪生: case Iso 等落到 default 前仅表达式引用 PaletteType.Iso（无 break 语义差异）
        PaletteType.Iso;
        return this.isoPalette;
      }
    }
  }
}
