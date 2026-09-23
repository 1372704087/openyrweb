/**
 * ImageFinder — 按 artName / 剧场扩展名查找图像文件名。
 *
 * 由 engine/ImageFinder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/** 图像集合最小形状。 */
export interface ImageMapLike {
  get(name: string): unknown;
  has(name: string): boolean;
}

/** 剧场设置最小形状。 */
export interface TheaterSettingsLike {
  extension: string;
  newTheaterChar: string;
}

/** 剧场最小形状。 */
export interface TheaterLike {
  settings: TheaterSettingsLike;
}

/** 对象艺术段中与图像相关的字段。 */
export interface ObjectArtImageLike {
  imageName: string;
  useTheaterExtension?: boolean;
}

/**
 * 按名称查找图像的工具类。
 * 处理剧场扩展名后缀与 newTheater 字符替换（G/N/C/Y + A/T/U/D/L/N 前缀）。
 */
export class ImageFinder {
  /** 已加载图像集合 */
  images: ImageMapLike;
  /** 当前剧场（提供 extension / newTheaterChar） */
  theater: TheaterLike;

  constructor(images: ImageMapLike, theater: TheaterLike) {
    this.images = images;
    this.theater = theater;
  }

  /**
   * 按对象艺术段查找图像。
   * @param e - 含 imageName / useTheaterExtension 的艺术字段
   */
  findByObjectArt(e: ObjectArtImageLike): unknown {
    return this.find(e.imageName, e.useTheaterExtension);
  }

  /**
   * 按艺术名查找图像；找不到抛 MissingImageError。
   * @param e - 艺术名
   * @param t - 是否使用剧场扩展名
   */
  find(e: string, t?: boolean): unknown {
    const i = this.getFilename(e, t);
    const r = this.images.get(i);
    if (!r) {
      throw new ImageFinder.MissingImageError(
        `No image file found for artName="${e}" (file=${i})`,
      );
    }
    return r;
  }

  /**
   * 尝试查找；仅吞掉 MissingImageError，其余错误继续抛出。
   * @param e - 艺术名
   * @param t - 是否使用剧场扩展名
   */
  tryFind(e: string, t?: boolean): unknown {
    let i: unknown;
    try {
      i = this.find(e, t);
    } catch (e) {
      if (!(e instanceof ImageFinder.MissingImageError)) {
        throw e;
      }
    }
    return i;
  }

  /**
   * 计算完整文件名（小写 + 扩展名 + 可能的 newTheater 替换）。
   * @param e - 艺术名
   * @param t - 是否使用剧场扩展名（否则 .shp）
   */
  getFilename(e: string, t?: boolean): string {
    let i = e.toLowerCase();
    i += t ? this.theater.settings.extension : ".shp";
    i = this.applyNewTheaterIfNeeded(e, i);
    return i;
  }

  /**
   * 若原名首字符 ∈ {G,N,C,Y} 且次字符 ∈ {A,T,U,D,L,N} 则应用 newTheater。
   * @param e - 原始艺术名（保留大小写用于取首字符）
   * @param t - 已拼好的小写文件名
   */
  applyNewTheaterIfNeeded(e: string, t: string): string {
    if (["G", "N", "C", "Y"].indexOf(e[0]) === -1 || ["A", "T", "U", "D", "L", "N"].indexOf(e[1]) === -1) {
      return t;
    }
    return this.applyNewTheater(t);
  }

  /**
   * 把文件名第 2 位替换为剧场 newTheaterChar；不存在时回退 "g"，再回退原名。
   * @param e - 小写文件名
   */
  applyNewTheater(e: string): string {
    let t: string;
    const i = e[0];
    const r = e.substr(2);
    const s = this.theater.settings.newTheaterChar.toLowerCase();
    t = i + s + r;
    if (!this.images.has(t)) {
      t = i + "g" + r;
      if (!this.images.has(t)) {
        t = e;
      }
    }
    return t;
  }
}

export namespace ImageFinder {
  /** 找不到图像时抛出的错误。 */
  export class MissingImageError extends Error {}
}
