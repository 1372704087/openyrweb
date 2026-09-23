/**
 * CanvasUtils — Canvas 2D 位图构造、blob 转换与文本绘制。
 *
 * 由 engine/gfx/CanvasUtils.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** drawText 可选项。 */
export interface DrawTextOptions {
  color?: string;
  backgroundColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  borderColor?: string;
  borderWidth?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  textAlign?: string;
  width?: number;
  height?: number;
  autoEnlargeCanvas?: boolean;
}

/** drawText 返回的文本布局矩形。 */
export interface TextLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** CanvasUtils 静态工具。 */
export class CanvasUtils {
  /** RGB 紧凑数组（每像素 3 字节）→ canvas。 */
  static canvasFromRgbImageData(data: Uint8Array | ArrayLike<number>, width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't acquire canvas 2d context");
    const imageData = ctx.createImageData(width, height);
    canvas.width = width;
    canvas.height = height;
    let n = 0;
    for (let o = 0, len = data.length; o < len; o += 3) {
      imageData.data[n] = data[o];
      imageData.data[n + 1] = data[o + 1];
      imageData.data[n + 2] = data[o + 2];
      imageData.data[n + 3] = 255;
      n += 4;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /** RGBA 数组（每像素 4 字节）→ canvas。 */
  static canvasFromRgbaImageData(data: Uint8Array | ArrayLike<number>, width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't acquire canvas 2d context");
    const imageData = ctx.createImageData(width, height);
    canvas.width = width;
    canvas.height = height;
    let n = 0;
    for (let o = 0, len = data.length; o < len; o += 4) {
      imageData.data[n] = data[o];
      imageData.data[n + 1] = data[o + 1];
      imageData.data[n + 2] = data[o + 2];
      imageData.data[n + 3] = data[o + 3];
      n += 4;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * 索引像素 + palette 颜色表 → canvas。
   * 索引 0 的 alpha=0，其余 255。
   */
  static canvasFromIndexedImageData(
    pixels: ArrayLike<number>,
    width: number,
    height: number,
    palette: { getColor(index: number): { r: number; g: number; b: number } },
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't acquire canvas 2d context");
    const imageData = ctx.createImageData(width, height);
    canvas.width = width;
    canvas.height = height;
    let n = 0;
    for (let i = 0; i < pixels.length; i++) {
      const pixel = pixels[i];
      const color = palette.getColor(pixel);
      imageData.data[n++] = color.r;
      imageData.data[n++] = color.g;
      imageData.data[n++] = color.b;
      imageData.data[n++] = pixel ? 255 : 0;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /** canvas → Blob；toBlob 失败时回退 dataURL。 */
  static async canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    let blob = await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob((b) => {
          resolve(b);
        });
      } catch (e) {
        console.error(e);
        resolve(null);
      }
    });
    if (!blob) {
      console.warn("Failed to convert canvas to blob. Falling back to dataURL generation.");
      try {
        blob = this.dataUrlToBlob(canvas.toDataURL());
      } catch (e) {
        const err = new Error("Failed to generate image from canvas using fallback");
        (err as any).cause = e;
        throw err;
      }
    }
    return blob;
  }

  /** data: URL → Blob。 */
  static dataUrlToBlob(dataUrl: string): Blob {
    const parts = dataUrl.match(/^data:((.*?)(;charset=.*?)?)(;base64)?,/);
    if (!parts) throw new Error("invalid dataURI");
    const mime = parts[2] ? parts[1] : "text/plain" + (parts[3] || ";charset=utf-8");
    const isBase64 = Boolean(parts[4]);
    const payload = dataUrl.slice(parts[0].length);
    const binary = (isBase64 ? atob : decodeURIComponent)(payload);
    const bytes: number[] = [];
    for (let i = 0; i < binary.length; i++) bytes.push(binary.charCodeAt(i));
    return new Blob([new Uint8Array(bytes)], { type: mime });
  }

  /**
   * 在 ctx 上绘制文本（背景/边框/描边/填充），并按需扩大画布。
   * 返回文本所在布局矩形 {x,y,width,height}。
   */
  static drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x0: number = 0,
    y0: number = 0,
    {
      color = "white",
      backgroundColor,
      outlineColor,
      outlineWidth,
      fontSize,
      fontFamily = "Arial, sans-serif",
      fontWeight = "normal",
      borderColor,
      borderWidth = 0,
      paddingTop = 0,
      paddingBottom = 0,
      paddingLeft = 0,
      paddingRight = 0,
      textAlign = "left",
      width: fixedWidth,
      height: fixedHeight,
      autoEnlargeCanvas = false,
    }: DrawTextOptions = {},
  ): TextLayout {
    const font = fontWeight + ` ${fontSize}px ` + fontFamily;
    ctx.font = font;
    let metrics = ctx.measureText(text);
    const sample = ctx.measureText("A");
    const sampleHeight = sample.actualBoundingBoxAscent + sample.actualBoundingBoxDescent;
    const textWidth = Math.ceil(
      Math.max(metrics.width, Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight)),
    );
    const contentWidth = textWidth + 2 * borderWidth + paddingLeft + paddingRight;
    const layout: TextLayout = {
      x: textAlign === "right" && fixedWidth === undefined ? ctx.canvas.width - contentWidth : x0,
      y: y0,
      width: fixedWidth ?? contentWidth,
      height: fixedHeight ?? sampleHeight + 2 * borderWidth + paddingTop + paddingBottom,
    };
    if (
      autoEnlargeCanvas &&
      (layout.x + layout.width > ctx.canvas.width || layout.y + layout.height > ctx.canvas.height)
    ) {
      const prev =
        ctx.canvas.width + ctx.canvas.height > 0
          ? ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
          : undefined;
      if (layout.x + layout.width > ctx.canvas.width) ctx.canvas.width = layout.x + layout.width;
      if (layout.y + layout.height > ctx.canvas.height) ctx.canvas.height = layout.y + layout.height;
      if (prev) ctx.putImageData(prev, 0, 0);
    }
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(layout.x, layout.y, layout.width, layout.height);
    }
    if (borderColor) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5 + layout.x, 0.5 + layout.y, layout.width - 1, layout.height - 1);
    }
    ctx.fillStyle = color;
    ctx.font = font;
    let textX = borderWidth + paddingLeft;
    if (textAlign === "right") {
      textX = layout.width - borderWidth - paddingRight - textWidth;
    } else if (textAlign === "center") {
      textX += Math.floor((layout.width - 2 * borderWidth - paddingLeft - paddingRight - textWidth) / 2);
    }
    const baseline =
      metrics.actualBoundingBoxAscent + paddingTop + (sample.actualBoundingBoxAscent - metrics.actualBoundingBoxAscent);
    if (outlineColor) {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2 * (outlineWidth ?? 1);
      ctx.strokeText(text, layout.x + textX + 0.5, layout.y + baseline, layout.width);
    }
    ctx.fillText(text, layout.x + textX + 0.5, layout.y + baseline, layout.width);
    return layout;
  }
}
