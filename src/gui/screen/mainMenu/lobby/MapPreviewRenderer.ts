/**
 * MapPreviewRenderer — 地图预览 canvas + 出生点标注。
 *
 * decodePreviewImage → RGB canvas，按目标尺寸放大 2/4 倍；
 * startbut.shp 叠出生点图标与编号。
 *
 * 由 gui/screen/mainMenu/lobby/MapPreviewRenderer.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { CanvasUtils } from "engine/gfx/CanvasUtils"; // 已转换
import { HtmlContainer } from "gui/HtmlContainer"; // 孪生
import { UiObject } from "gui/UiObject"; // 孪生
import { LobbyType } from "gui/screen/mainMenu/lobby/component/viewmodel/lobby"; // 孪生（本组内一并转换）
import { Coords } from "game/Coords"; // 已转换
import { IsoCoords } from "engine/IsoCoords"; // 已转换
import { ShpFile } from "data/ShpFile"; // 已转换
import { Palette } from "data/Palette"; // 已转换
import { ImageUtils } from "engine/gfx/ImageUtils"; // 已转换
import { Engine } from "engine/Engine"; // 已转换

/** 大厅类型 → 预览 tooltip key。 */
const TOOLTIP_BY_LOBBY = new Map<any, string>([
  [LobbyType.Singleplayer, "STT:SkirmishMapThumbnail"],
  [LobbyType.MultiplayerHost, "STT:HostMapThumbnail"],
  [LobbyType.MultiplayerGuest, "STT:GuestMapThumbnail"],
]);

export class MapPreviewRenderer {
  /** i18n 字典。 */
  strings: any;
  /** 出生点按钮 canvas。 */
  private _startButCanvas: HTMLCanvasElement | null = null;
  /** 帧宽。 */
  private _startButFrameWidth = 0;
  /** 帧高。 */
  private _startButFrameHeight = 0;
  /** 帧数。 */
  private _startButNumFrames = 0;

  constructor(strings: any) {
    this.strings = strings;
  }

  /** 渲染地图预览为 UiObject（失败返回 undefined）。 */
  render(mapFile: any, lobbyType: any, target: { width: number; height: number }) {
    let decoded: any;
    try {
      decoded = mapFile.decodePreviewImage();
    } catch (e) {
      console.error("Failed to decode map preview data", e);
    }
    if (!decoded) return;
    var { data, width, height } = decoded;
    let canvas: HTMLCanvasElement = CanvasUtils.canvasFromRgbImageData(
      data,
      width,
      height,
    );
    let scale = 1;
    height =
      canvas.width < target.width / 2 || canvas.height < target.height / 2
        ? 4
        : 2;
    let scaled = document.createElement("canvas");
    scaled.width = height * canvas.width;
    scaled.height = height * canvas.height;
    let ctx = scaled.getContext("2d");
    if (ctx) {
      scale = height;
      ctx.scale(scale, scale);
      ctx.drawImage(canvas, 0, 0);
      canvas = scaled;
    }
    this.drawStartLocations(canvas, mapFile, target, scale);
    let container = new HtmlContainer();
    height = height as number;
    const obj = new UiObject(new THREE.Object3D(), container);
    container.setSize("100%", "100%");
    container.render();
    canvas.style.objectFit = "contain";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.setAttribute(
      "data-r-tooltip",
      this.strings.get(TOOLTIP_BY_LOBBY.get(lobbyType)),
    );
    container.getElement().appendChild(canvas);
    return obj;
  }

  /** 在预览 canvas 上绘制出生点编号与图标。 */
  drawStartLocations(
    canvas: HTMLCanvasElement,
    mapFile: any,
    target: { width: number; height: number },
    scale: number,
  ): void {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    this._loadStartBut();
    IsoCoords.init({
      x: 0,
      y: (mapFile.fullSize.width * Coords.getWorldTileSize()) / 2,
    });
    var idx: any;
    var loc: any;
    var origin = IsoCoords.worldToScreen(0, 0);
    let baseTile = IsoCoords.screenToScreenTile(origin.x, origin.y);
    var fit =
      canvas.width > canvas.height
        ? canvas.width / target.width / scale
        : canvas.height / target.height / scale;
    var mark = 13 * fit;
    var font = 13 * fit;
    var pad = 2 * fit;
    for ([idx, loc] of mapFile.startingLocations.entries()) {
      var world = loc;
      world = IsoCoords.tileToScreen(world.x, world.y);
      let tile = IsoCoords.screenToScreenTile(world.x, world.y);
      tile.x += baseTile.x;
      tile.y += baseTile.y;
      let pt = this.dxyToCanvas(tile.x, tile.y, canvas, mapFile.localSize);
      pt.x /= scale;
      pt.y /= scale;
      if (this._startButCanvas) {
        var box = Math.max(font * 1.5, 14);
        ctx.drawImage(
          this._startButCanvas,
          0,
          0,
          this._startButFrameWidth,
          this._startButFrameHeight,
          pt.x - box / 2,
          pt.y - box / 2,
          box,
          box,
        );
      }
      CanvasUtils.drawText(ctx, String(idx + 1), pt.x - font / 4, pt.y - font / 2, {
        fontSize: font,
        color: "#FFEF63",
        fontWeight: "bold",
      });
    }
  }

  /** 懒加载 startbut.shp。 */
  private _loadStartBut(): void {
    if (this._startButCanvas) return;
    try {
      var vfs = Engine.vfs;
      if (!vfs) return;
      var shp = new ShpFile(vfs.openFile("startbut.shp"));
      var palName = "shell.pal";
      var pal = new Palette(vfs.openFile(palName));
      this._startButCanvas = ImageUtils.convertShpToCanvas(shp, pal);
      this._startButFrameWidth = shp.width;
      this._startButFrameHeight = shp.height;
      this._startButNumFrames = shp.numImages;
    } catch (e) {
      console.warn("Failed to load startbut.shp", e);
      this._startButCanvas = null;
    }
  }

  /** 世界 dxy → canvas 像素。 */
  dxyToCanvas(
    d: number,
    x: number,
    canvas: HTMLCanvasElement,
    localSize: any,
  ) {
    var sx = canvas.width / (2 * localSize.width);
    var sy = canvas.height / localSize.height / 2;
    return { x: (d - 2 * localSize.x) * sx, y: (x - 2 * localSize.y) * sy };
  }
}
