/**
 * MenuVideo — 主菜单背景视频组件。
 *
 * 字符串 URL 按扩展名推 MIME；File 走 objectURL + MediaSource 回退循环。
 * File 源每秒 appendBuffer 直到缓冲接近 currentTime。
 *
 * 由 gui/screen/mainMenu/component/MenuVideo.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换

const MIME_BY_EXT = new Map<string, string>([
  ["mp4", "video/mp4"],
  ["webm", "video/webm"],
]);

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 背景视频组件。 */
export class MenuVideo extends React.Component<any> {
  /** JSX props。 */
  props: any;
  /** 根元素。 */
  el: HTMLElement | null = null;
  /** 清理器。 */
  disposables = new CompositeDisposable();
  /** 是否已销毁。 */
  disposed = false;
  /** MediaSource 分片定时器。 */
  timeoutId?: any;

  render() {
    const src: any = this.props["src"];
    let url: string;
    let mime: string;
    if ("string" == typeof src) {
      url = src;
      mime =
        MIME_BY_EXT.get(src.split("?")[0].split(".").pop() as string) ??
        "video/webm";
    } else {
      url = URL.createObjectURL(src);
      mime = src.type;
      this.disposables.add(() => {
        URL.revokeObjectURL(url);
      });
    }
    return React.createElement("div", {
      className: "video-wrapper",
      ref: (el: any) => (this.el = el),
      dangerouslySetInnerHTML: {
        __html: `
            <video style="outline: none;" loop playsinline muted autoplay>
                <source src="${url}" type="${mime}" />
            </video>
            <div class="logo" style="opacity: 0;" />
        `,
      },
    });
  }

  componentDidMount(): void {
    const src = this.props["src"];
    let video: HTMLVideoElement = this.el!.querySelector("video");
    let logo: HTMLElement = this.el!.querySelector("div");
    if (src instanceof File && window.MediaSource) {
      let onError = async () => {
        this.applyMediaSourceFallback(video, await src.arrayBuffer());
      };
      video.querySelector("source")!.addEventListener("error", onError, {
        once: true,
      });
      video.addEventListener("loadeddata", () => {
        video.querySelector("source")!.removeEventListener("error", onError);
      });
    }
    video.addEventListener("loadeddata", () => {
      logo.style.opacity = "";
    });
  }

  /** MediaSource 播放 File 源（vp8 序列）。 */
  async applyMediaSourceFallback(video: HTMLVideoElement, data: ArrayBuffer) {
    if (!this.disposed) {
      let ms = new MediaSource();
      ms.addEventListener("sourceopen", () => {
        try {
          let sb = ms.addSourceBuffer('video/webm; codecs="vp8"');
          sb.mode = "sequence";
          sb.appendBuffer(data);
          this.timeoutId = setTimeout(
            () => this.processNextSegment(sb as any, video, data),
            1000,
          );
          this.disposables.add(() => clearTimeout(this.timeoutId));
        } catch (e: any) {
          if ("NotSupportedError" !== e.name) console.error(e);
        }
      });
      let objectUrl = (video.src = URL.createObjectURL(ms));
      this.disposables.add(() => {
        URL.revokeObjectURL(objectUrl);
        objectUrl = void 0 as any;
      });
    }
  }

  /** 循环 append 直到缓冲逼近播放位置。 */
  processNextSegment(sb: any, video: HTMLVideoElement, data: ArrayBuffer) {
    try {
      // 孪生为逗号表达式：缓冲 <10s 才 appendBuffer；play() 在缓冲条件外，
      // 只要 SourceBuffer 空闲且有缓冲、视频暂停就续播。
      !sb.updating &&
        0 < sb.buffered.length &&
        (sb.buffered.end(sb.buffered.length - 1) - video.currentTime < 10 && sb.appendBuffer(data),
        video.paused && video.play()?.catch((e) => console.error(e)));
    } catch (e) {
      console.error(e);
      return;
    }
    this.timeoutId = setTimeout(
      () => this.processNextSegment(sb, video, data),
      1000,
    );
  }

  componentWillUnmount(): void {
    this.disposables.dispose();
    this.disposed = true;
  }
}
