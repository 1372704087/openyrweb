/**
 * GameResBoxApi — 游戏资源定位对话框（拖放/文件夹/压缩包/一键下载）。
 *
 * 由 gui/component/GameResBoxApi.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as FileSystemAccessModule from "file-system-access"; // 孪生（第三方）
import * as ReactModule from "react"; // 孪生（第三方）
import * as ClassnamesModule from "classnames"; // 孪生（第三方）
import { HtmlReactElement } from "gui/HtmlReactElement"; // 孪生（本批内一并转换）
import { Dialog } from "gui/component/Dialog"; // 孪生（本批内一并转换）
import { GameResForm } from "gui/component/GameResForm"; // 孪生（本批内一并转换")
import * as FileSystemUtilModule from "engine/gameRes/FileSystemUtil"; // 已转换

// 孪生 any-shim：第三方 CJS 取 default / 命名空间
const polyfillDataTransferItem: any = (FileSystemAccessModule as any).polyfillDataTransferItem;
const showDirectoryPicker: any = (FileSystemAccessModule as any).showDirectoryPicker;
const React: any = (ReactModule as any).default;
const classnames: any = (ClassnamesModule as any).default ?? ClassnamesModule;
const FileSystemUtil: any = (FileSystemUtilModule as any).FileSystemUtil;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 游戏资源导入对话框 API。 */
export class GameResBoxApi {
  /** 视口。 */
  viewport: any;
  /** i18n。 */
  strings: any;
  /** 挂载根。 */
  rootEl: any;

  /**
   * @param viewport - 视口
   * @param strings - i18n
   * @param rootEl - 根 DOM
   */
  constructor(viewport: any, strings: any, rootEl: any) {
    this.viewport = viewport;
    this.strings = strings;
    this.rootEl = rootEl;
  }

  /**
   * 弹出资源定位框，resolve 所选句柄 / {oneClick} / undefined（取消）。
   * @param defaultArchiveUrl - 默认压缩包 URL
   * @param closable - 是否可关闭
   * @param ra2Url - 一键下载 RA2 URL
   * @param yrUrl - 一键下载 YR URL
   */
  async promptForGameRes(defaultArchiveUrl: any, closable: boolean, ra2Url: any, yrUrl: any): Promise<any> {
    await polyfillDataTransferItem();
    return await new Promise((resolve) => {
      let box: any = HtmlReactElement.factory(Dialog, {
        className: classnames("game-res-box"),
        buttons: [],
        children: React.createElement(GameResForm, {
          defaultArchiveUrl,
          oneClickRa2Url: ra2Url,
          oneClickYrUrl: yrUrl,
          closable,
          strings: this.strings,
          onDrop: async (dataTransfer: any) => {
            if (dataTransfer.items.length) {
              try {
                const handle = await dataTransfer.items[0].getAsFileSystemHandle();
                if (!handle) return;
                close();
                resolve(handle);
              } catch (err) {
                console.error(err);
              }
            }
          },
          onBrowseFolder: async () => {
            try {
              // 自动化测试可注入 window.__yrwebSyntheticDirHandle；未设置时用原生选择器
              const synthetic = (window as any).__yrwebSyntheticDirHandle;
              const handle = synthetic ? synthetic : await showDirectoryPicker({ _preferPolyfill: true });
              close();
              resolve(handle);
            } catch (err) {
              console.error(err);
            }
          },
          onBrowseArchive: async () => {
            try {
              const handle = await FileSystemUtil.showArchivePicker();
              close();
              resolve(handle);
            } catch (err) {
              console.error(err);
            }
          },
          onDownloadArchive: async (url: any) => {
            close();
            resolve(url);
          },
          // 一键下载两个 exe 并自动解出 6 个 mix
          onOneClickDownload: async () => {
            close();
            resolve({ oneClick: true });
          },
          onClose: () => {
            close();
            resolve(undefined);
          },
        }),
        viewport: this.viewport.value,
      });
      let onViewport = (vp: any) => {
        box.setSize(vp.width, vp.height);
        box.applyOptions((opts: any) => (opts.viewport = vp));
      };
      this.viewport.onChange.subscribe(onViewport);
      const close = () => {
        this.viewport.onChange.unsubscribe(onViewport);
        onViewport = undefined as any;
        const el = box.getElement();
        if (el) this.rootEl.removeChild(el);
        box.unrender();
        box = undefined;
      };
      box.setSize(this.viewport.value.width, this.viewport.value.height);
      box.render();
      this.rootEl.appendChild(box.getElement());
    });
  }
}
