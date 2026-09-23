/**
 * MinimapRenderer — 小地图 Canvas 全量/增量渲染与坐标换算。
 *
 * 按 localSize 宽高比与容器尺寸算 canvasSize；renderFull 清底后画全部 tile，
 * renderIncremental 只重画变更 tile 及其邻接；dxy/local/canvas 坐标互相转换。
 *
 * 由 engine/renderable/entity/map/MinimapRenderer.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 小地图渲染器。 */
export class MinimapRenderer {
  /** 地图。 */
  map: any;
  /** 颜色模型。 */
  minimapModel: any;
  /** 边框颜色 CSS。 */
  borderColor: string;
  /** 像素缩放。 */
  canvasRenderScale: number;
  /** dxy 局部尺寸。 */
  dxySize: { x: number; y: number; width: number; height: number };
  /** canvas 逻辑尺寸。 */
  canvasSize: { width: number; height: number };
  /** 画布。 */
  canvas?: HTMLCanvasElement;
  /** 2D 上下文。 */
  ctx?: CanvasRenderingContext2D;

  /**
   * @param map - 需 mapBounds/tiles
   * @param minimapModel - MinimapModel
   * @param container - 容器矩形（width/height）
   * @param borderColor - 边框色
   * @param canvasRenderScale - 像素缩放
   */
  constructor(map: any, minimapModel: any, container: { width: number; height: number }, borderColor: string, canvasRenderScale: number) {
    this.map = map;
    this.minimapModel = minimapModel;
    this.borderColor = borderColor;
    this.canvasRenderScale = canvasRenderScale;
    const raw = this.map.mapBounds.getRawLocalSize();
    this.dxySize = {
      x: 2 * raw.x,
      y: 2 * raw.y + 4,
      width: 2 * raw.width,
      height: 2 * raw.height + 8,
    };
    const aspect = this.dxySize.height / this.dxySize.width;
    this.canvasSize = this.computeCanvasSize(container, aspect);
  }

  /**
   * 在容器内按 aspect 求最大内接尺寸。
   * @param container - 容器 width/height
   * @param aspect - 高/宽比
   */
  computeCanvasSize(container: { width: number; height: number }, aspect: number): { width: number; height: number } {
    const w = container.width;
    const h = container.height;
    return h / w <= aspect ? { width: Math.floor(h / aspect), height: h } : { width: w, height: Math.floor(w * aspect) };
  }

  /** 全量清底并画全部 tile。 */
  renderFull(): HTMLCanvasElement | undefined {
    if (this.canvas) {
      this.ctx!.fillStyle = "black";
      this.ctx!.fillRect(
        0,
        0,
        this.canvasRenderScale * this.canvasSize.width,
        this.canvasRenderScale * this.canvasSize.height,
      );
    } else {
      const canvas = (this.canvas = document.createElement("canvas"));
      canvas.width = this.canvasRenderScale * this.canvasSize.width;
      canvas.height = this.canvasRenderScale * this.canvasSize.height;
      const ctx = (this.ctx = canvas.getContext("2d", { alpha: false })!);
      ctx.translate(0.5, 0.5);
    }
    this.renderTiles(this.map.tiles.getAll(), true);
    return this.canvas;
  }

  /**
   * 增量重画变更 tile 及其邻域。
   * @param changed - 变更 tile 列表
   */
  renderIncremental(changed: any[]): void {
    const set = new Set(changed);
    for (const tile of changed) {
      const neighbors = this.map.tiles.getAllNeighbourTiles(tile);
      neighbors.forEach((n: any) => set.add(n));
    }
    this.renderTiles(set as any);
  }

  /**
   * 在旋转/缩放后的 ctx 上填色 tile。
   * @param tiles - tile 集合
   * @param full - 全量模式时跳过纯黑
   */
  renderTiles(tiles: Iterable<any>, full = false): void {
    const scale =
      (this.canvasSize.width / this.dxySize.width) / Coords.COS_ISO_CAMERA_BETA;
    const ctx = this.ctx;
    if (!ctx) throw new Error("Must do a full render before re-rendering any individual tiles.");
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.rotate(Coords.ISO_CAMERA_BETA);
    ctx.scale(scale, scale);
    for (const tile of tiles) {
      const color = this.minimapModel.getTileColor(tile);
      if (!color || (full && color === "#000000")) continue;
      ctx.fillStyle = color;
      const { x, y } = this.tileToLocalRxyOrigin(tile);
      ctx.fillRect(
        this.canvasRenderScale * x,
        this.canvasRenderScale * y,
        this.canvasRenderScale + 0.5,
        this.canvasRenderScale + 0.5,
      );
    }
    ctx.restore();
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.canvasRenderScale;
    ctx.strokeRect(0, 0, ctx.canvas.width - this.canvasRenderScale, ctx.canvas.height - this.canvasRenderScale);
  }

  /**
   * tile → 局部 rxy 原点。
   * @param tile - 含 rx/ry
   */
  tileToLocalRxyOrigin(tile: { rx: number; ry: number }): { x: number; y: number } {
    const origin = this.dxyToLocalRxy(this.dxySize.x, this.dxySize.y);
    return {
      x: tile.rx - origin.x,
      y: tile.ry - this.map.mapBounds.getFullSize().width / 2 - origin.y,
    };
  }

  /**
   * dxy → local rxy。
   * @param x - dxy x
   * @param y - dxy y
   */
  dxyToLocalRxy(x: number, y: number): { x: number; y: number } {
    return { x: (x + y) / 2, y: (y - x) / 2 };
  }

  /**
   * dxy → canvas。
   * @param x - dxy x
   * @param y - dxy y
   */
  dxyToCanvas(x: number, y: number): { x: number; y: number } {
    const s = this.canvasSize.width / this.dxySize.width;
    return { x: (x - this.dxySize.x) * s, y: (y - this.dxySize.y) * s };
  }

  /**
   * canvas → dxy。
   * @param x - canvas x
   * @param y - canvas y
   */
  canvasToDxy(x: number, y: number): { x: number; y: number } {
    const s = this.canvasSize.width / this.dxySize.width;
    return { x: x / s + this.dxySize.x, y: y / s + this.dxySize.y };
  }
}
