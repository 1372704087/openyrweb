/**
 * ShpSpriteBatch — 多 SHP 精灵按调色板分组合批（BatchShpBuilder）。
 *
 * createAggregatedShpFile 合并去重帧；createObjects 按 palette.hash 分组
 * 各建一个 BatchShpBuilder；destroy 释放 builder 与纹理缓存。
 *
 * 由 gui/ShpSpriteBatch.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { UiObject } from "gui/UiObject"; // 孪生（本批内一并转换）
import { HtmlContainer } from "gui/HtmlContainer"; // 孪生（本批内一并转换）
import { ShpFile } from "data/ShpFile"; // 已转换
import { BatchShpBuilder } from "engine/renderable/builder/BatchShpBuilder"; // 已转换

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** SHP 精灵组合批。 */
export class ShpSpriteBatch extends UiObject {
  /** 精灵配置列表。 */
  spriteProps: any[];
  /** 按名取 SHP。 */
  getShpFile: (name: string) => any;
  /** 按名取调色板。 */
  getPalette: (name: string) => any;
  /** 相机。 */
  camera: any;
  /** 纹理缓存。 */
  textureCache = new Map<string, any>();
  /** 已建 builder。 */
  batchShpBuilders: any[] = [];

  /**
   * @param spriteProps - 精灵配置
   * @param getShpFile - SHP 解析
   * @param getPalette - 调色板解析
   * @param camera - 相机
   */
  constructor(spriteProps: any[], getShpFile: any, getPalette: any, camera: any) {
    super(new THREE.Object3D(), new HtmlContainer());
    this.spriteProps = spriteProps;
    this.getShpFile = getShpFile;
    this.getPalette = getPalette;
    this.camera = camera;
    this.textureCache = new Map();
    this.batchShpBuilders = [];
  }

  /** 建 3D 对象并聚合构建。 */
  create3DObject(): void {
    super.create3DObject();
    const agg = this.createAggregatedShpFile();
    this.createObjects(this.get3DObject(), agg);
  }

  /** 合并全部用到的帧到单个 ShpFile，返回 image→index 映射。 */
  createAggregatedShpFile(): { file: any; imageIndexes: Map<any, number> } {
    const file = new ShpFile();
    file.filename = "agg_unnamed_spritebatch.shp";
    const imageIndexes = new Map<any, number>();
    let count = 0;
    for (const prop of this.spriteProps) {
      const shp = typeof prop.image === "string" ? this.getShpFile(prop.image) : prop.image;
      const image = shp.getImage(prop.frame ?? 0);
      if (!imageIndexes.has(image)) {
        file.addImage(image);
        imageIndexes.set(image, count);
        count++;
      }
    }
    return { file, imageIndexes };
  }

  /**
   * 按调色板分组构建 BatchShpBuilder。
   * @param parent - 父 Object3D
   * @param agg - 聚合结果
   */
  createObjects(parent: any, agg: { file: any; imageIndexes: Map<any, number> }): void {
    const byPalette = new Map<string, any[]>();
    for (const prop of this.spriteProps) {
      const palette = typeof prop.palette === "string" ? this.getPalette(prop.palette) : prop.palette;
      const key = palette.hash;
      byPalette.set(key, (byPalette.get(key) ?? []).concat(prop));
    }
    for (const group of byPalette.values()) {
      const palette = typeof group[0].palette === "string" ? this.getPalette(group[0].palette) : group[0].palette;
      const entries: any[] = [];
      for (const prop of group) {
        const shp = typeof prop.image === "string" ? this.getShpFile(prop.image) : prop.image;
        let frameNo = agg.imageIndexes.get(shp.getImage(prop.frame ?? 0));
        if (frameNo === undefined) throw new Error("Missing frame in aggregated sprite shp file");
        const entry = {
          position: new THREE.Vector3(prop.x ?? 0, prop.y ?? 0, UiObject.zIndexToWorld(prop.zIndex ?? 0)),
          shpFile: shp,
          depth: false,
          flat: false,
          frameNo,
          offset: { x: shp.width / 2, y: shp.height / 2 },
        };
        entries.push(entry);
      }
      if (entries.length) {
        const builder = new BatchShpBuilder(agg.file, palette, this.camera, this.textureCache, undefined, undefined, entries.length);
        entries.forEach((e) => builder.add(e));
        this.batchShpBuilders.push(builder);
        parent.add(builder.build());
      }
    }
  }

  /** 释放 builder 与纹理缓存。 */
  destroy(): void {
    super.destroy();
    this.batchShpBuilders.forEach((b) => b.dispose());
    [...this.textureCache.values()].forEach((t) => t.dispose());
    this.textureCache.clear();
  }
}
