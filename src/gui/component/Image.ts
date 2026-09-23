/**
 * Image — 从 VFS/CDN 解析并渲染 <img>（SHP/PCX/PNG）。
 *
 * imageUrlCache 命中直接用；SHP 需 palette、PCX 转 dataURL、PNG 建 objectURL
 * （卸载时 revoke）；缺失时可选图静默，否则 warn；CDN 兜底改 .png。
 *
 * 由 gui/component/Image.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Palette } from "data/Palette"; // 已转换
import { PcxFile } from "data/PcxFile"; // 已转换
import { ShpFile } from "data/ShpFile"; // 已转换
import { ImageUtils } from "engine/gfx/ImageUtils"; // 已转换
import * as ReactModule from "react"; // 孪生（第三方）
import { ImageContext } from "gui/component/ImageContext"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 上游引擎 UI 图标（原 ra2cd.mix），本仓库不发行；缺失属预期，静默处理。
 */
const OPTIONAL_IMAGES = new Set(["info.png"]);

/**
 * 图像组件。
 * @param props - {src,palette?}
 */
export const Image = (props: any): any => {
  const ctx = ImageContext;
  const [url, setUrl] = hooks.useState("");

  hooks.useEffect(() => {
    let revoke: (() => void) | undefined;
    let next: string;
    if (ctx.imageUrlCache.has(props.src)) {
      next = ctx.imageUrlCache.get(props.src)!;
    } else if (ctx.vfs?.fileExists(props.src)) {
      const ext = props.src.split(".").pop();
      if (ext === "shp") {
        const palettePath = props.palette;
        if (ctx.vfs.fileExists(palettePath)) {
          const shp = new ShpFile(ctx.vfs.openFile(props.src));
          const palette = new Palette(ctx.vfs.openFile(palettePath));
          next = ImageUtils.convertShpToCanvas(shp, palette).toDataURL();
        } else {
          console.warn(`Palette "${palettePath}" not found in VFS"`);
          next = "";
        }
      } else if (ext === "pcx") {
        const pcx = new PcxFile(ctx.vfs.openFile(props.src));
        next = pcx.toDataUrl();
      } else if (ext === "png") {
        const bytes = ctx.vfs.openFile(props.src).stream;
        const blob = new Blob([new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)], {
          type: "image/png",
        });
        next = URL.createObjectURL(blob);
        revoke = () => {
          URL.revokeObjectURL(next);
          ctx.imageUrlCache.delete(props.src);
        };
      } else {
        console.warn(`Unknown image format "${ext}"`);
        next = "";
      }
      ctx.imageUrlCache.set(props.src, next);
    } else {
      // 缺失条目：可选图标静默，其余 warn 后给空串
      next = ctx.cdnBaseUrl
        ? ctx.cdnBaseUrl + props.src.substring(0, props.src.lastIndexOf(".")) + ".png"
        : (OPTIONAL_IMAGES.has(props.src) || console.warn(`Image "${props.src}" not found in VFS`), "");
    }
    setUrl(next);
    return revoke;
  }, [props.src]);

  return url ? React.createElement("img", { src: url }) : null;
};
