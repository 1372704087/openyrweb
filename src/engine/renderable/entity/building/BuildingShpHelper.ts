/**
 * BuildingShpHelper — 汇总建筑主图/动画图的 SHP 帧信息与可选缺失图降级。
 *
 * getShpFrameInfos 收集主/受损 SHP 及各动画层的帧信息；collectAnimShpFiles
 * 预取动画 SHP，MissingImageError 降级为 console.debug（数据不全非引擎错误）。
 *
 * 由 engine/renderable/entity/building/BuildingShpHelper.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { AnimProps } from "engine/AnimProps"; // 已转换
import { ImageFinder } from "engine/ImageFinder"; // 已转换
import * as ShpAggregatorModule from "engine/renderable/builder/ShpAggregator"; // 孪生

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ShpAggregator: any = (ShpAggregatorModule as any).ShpAggregator;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 建筑 SHP 帧收集辅助。 */
export class BuildingShpHelper {
  /** 图像查找器。 */
  imageFinder: ImageFinder;

  /** @param imageFinder - ImageFinder 实例 */
  constructor(imageFinder: ImageFinder) {
    this.imageFinder = imageFinder;
  }

  /**
   * 收集主图/受损图与各动画层的 SHP 帧信息。
   * @param art - 建筑 art 段（含 hasShadow）
   * @param mainShp - 主 SHP 文件（可空）
   * @param damagedShp - 受损/bib SHP 文件（可空）
   * @param animPropsByImage - image 名 → SHP 文件（collectAnimShpFiles 结果）
   * @param animData - BuildingAnimArtProps（getAll 遍历）
   * @returns SHP 文件 → frameInfo
   */
  getShpFrameInfos(
    art: any,
    mainShp: any,
    damagedShp: any,
    animPropsByImage: Map<string, any>,
    animData: { getAll(): Map<number, any[]> },
  ): Map<any, any> {
    const result = new Map<any, any>();
    if (mainShp) result.set(mainShp, ShpAggregator.getShpFrameInfo(mainShp, art.hasShadow));
    if (damagedShp) result.set(damagedShp, ShpAggregator.getShpFrameInfo(damagedShp, art.hasShadow));
    animData.getAll().forEach((list) => {
      list.forEach((entry) => {
        const addFrameInfo = (animArt: any, image: string | undefined) => {
          if (!image) return;
          const shpFile = animPropsByImage.get(image);
          if (shpFile) {
            const ap = new AnimProps(animArt, shpFile);
            result.set(shpFile, ShpAggregator.getShpFrameInfo(shpFile, ap.shadow));
          }
        };
        addFrameInfo(entry.art, entry.image);
        if (entry.damagedArt) addFrameInfo(entry.damagedArt, entry.damagedImage);
      });
    });
    return result;
  }

  /**
   * 预取动画列表中全部 image/damagedImage 对应的 SHP 文件。
   * MissingImageError 降级为 debug 并跳过（可选动画缺失常见于数据不全）。
   * @param animData - BuildingAnimArtProps
   * @param artOpts - 含 useTheaterExtension
   * @returns image 名 → SHP 文件
   */
  collectAnimShpFiles(
    animData: { getAll(): Map<number, any[]> },
    artOpts: { useTheaterExtension?: boolean },
  ): Map<string, any> {
    const files = new Map<string, any>();
    animData.getAll().forEach((list) => {
      for (const entry of list) {
        for (const image of [entry.image, entry.damagedImage]) {
          if (!image || files.has(image)) continue;
          let found: any;
          try {
            found = this.imageFinder.find(image, artOpts.useTheaterExtension);
          } catch (err) {
            if (err instanceof ImageFinder.MissingImageError) {
              // an optional animation SHP is missing from the user's game
              // data (e.g. a production/activation frame, a snow-theater variant).
              // The building still renders (main image + other anim layers); this is
              // a common data-completeness issue, not an engine error. Demote to debug
              // to keep the console clean while leaving a diagnostic breadcrumb.
              console.debug((err as Error).message);
              continue;
            }
            throw err;
          }
          files.set(image, found);
        }
      }
    });
    return files;
  }
}
