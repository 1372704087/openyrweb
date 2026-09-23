/**
 * StorageScreen — 存储管理屏（清数据/清 VXL/导入 Mix + 文件浏览器）。
 *
 * 文件变更后侧栏换成 ExitAndReload。
 *
 * 由 gui/screen/options/StorageScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { StorageExplorer } from "gui/screen/options/component/StorageExplorer"; // 孪生（本组内一并转换）
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { RealFileSystemDir } from "data/vfs/RealFileSystemDir"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class StorageScreen extends MainMenuScreen {
  /** i18n 字典。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 消息框。 */
  messageBoxApi: any;
  /** 真实文件系统根。 */
  rfs: any;
  /** VXL 几何缓存（可选）。 */
  vxlGeometryPool?: any;

  constructor(strings: any, jsxRenderer: any, messageBoxApi: any, rfs: any) {
    super();
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.messageBoxApi = messageBoxApi;
    this.rfs = rfs;
    this.vxlGeometryPool = void 0;
    this.title = this.strings.get("GUI:Storage");
  }

  setVxlGeometryPool(pool: any): void {
    this.vxlGeometryPool = pool;
  }

  onEnter(params?: any): void {
    var buttons: any[] = [
      {
        label: this.strings.get("GUI:ClearGameData"),
        onClick: async () => {
          if (
            await this.messageBoxApi.confirm(
              this.strings.get("TS:ConfirmClearGameData"),
              this.strings.get("GUI:Ok"),
              this.strings.get("GUI:Cancel"),
            )
          ) {
            try {
              let root = this.rfs.getRootDirectoryHandle();
              for await (const name of root.keys())
                await root.removeEntry(name, { recursive: true });
              this.messageBoxApi.show(this.strings.get("TS:GameDataCleared"));
              setTimeout(() => location.reload(), 1500);
            } catch (e) {
              console.error("Failed to clear game data", e);
              this.messageBoxApi.show(
                this.strings.get("TS:ClearGameDataFailed"),
                this.strings.get("GUI:Ok"),
              );
            }
          }
        },
      },
      {
        label: this.strings.get("GUI:ClearVxlCache"),
        onClick: async () => {
          if (this.vxlGeometryPool) {
            try {
              await this.vxlGeometryPool.clearStorage();
              this.vxlGeometryPool.clear();
              this.messageBoxApi.show(
                this.strings.get("TS:VxlCacheCleared"),
                this.strings.get("GUI:Ok"),
              );
            } catch (e) {
              console.error("Failed to clear VXL cache", e);
              this.messageBoxApi.show(
                this.strings.get("TS:ClearVxlCacheFailed"),
                this.strings.get("GUI:Ok"),
              );
            }
          }
        },
      },
      {
        label: this.strings.get("GUI:ImportMixFiles"),
        onClick: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = ".mix";
          input.onchange = async () => {
            try {
              const root = this.rfs.getRootDirectoryHandle();
              const files = Array.from(input.files || []);
              for (const file of files) {
                // Root-level .mix uploads are stored lowercase (VFS lookup is
                // case-insensitive, and the FileExplorer does the same).
                await new RealFileSystemDir(root).writeFile(
                  file,
                  file.name.toLowerCase(),
                );
              }
              this.messageBoxApi.show(
                this.strings.get("TS:MixFilesImported", files.length),
                this.strings.get("GUI:Ok"),
              );
            } catch (e) {
              console.error("Failed to import mix files", e);
              this.messageBoxApi.show(
                this.strings.get("TS:ImportMixFailed"),
                this.strings.get("GUI:Ok"),
              );
            }
          };
          input.click();
        },
      },
      {
        label: this.strings.get("GUI:Back"),
        isBottom: true,
        onClick: () => {
          this.controller?.leaveCurrentScreen();
        },
      },
    ];
    this.controller.setSidebarButtons(buttons);
    this.controller.showSidebarButtons();
    var [el] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        width: "100%",
        height: "100%",
        component: StorageExplorer,
        props: {
          strings: this.strings,
          messageBoxApi: this.messageBoxApi,
          storageDirHandle: this.rfs.getRootDirectoryHandle(),
          startIn: params?.startIn,
          onFileSystemChange: () => {
            this.controller?.setSidebarButtons([
              {
                label: this.strings.get("GUI:ExitAndReload"),
                isBottom: true,
                onClick: () => {
                  location.reload();
                },
              },
            ]);
          },
        },
      }),
    );
    this.controller.setMainComponent(el);
  }

  async onLeave(): Promise<void> {
    await this.controller.hideSidebarButtons();
  }
}
