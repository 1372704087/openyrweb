/**
 * GameResForm — 游戏资源导入表单（一键下载 + 拖放/浏览）。
 *
 * 由 gui/component/GameResForm.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import * as ClassnamesModule from "classnames"; // 孪生（第三方）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = ReactModule as any;
const useState: any = (ReactModule as any).useState ?? (ReactModule as any).default?.useState;
const useEffect: any = (ReactModule as any).useEffect ?? (ReactModule as any).default?.useEffect;
const useCallback: any = (ReactModule as any).useCallback ?? (ReactModule as any).default?.useCallback;
const createElement: any = (ReactModule as any).createElement;
const classnames: any = (ClassnamesModule as any).default ?? ClassnamesModule;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 资源导入表单。
 * @param props - {closable,strings,defaultArchiveUrl,oneClickRa2Url,oneClickYrUrl,onDownloadArchive,onOneClickDownload,onBrowseFolder,onBrowseArchive,onDrop,onClose}
 */
export const GameResForm = (props: any): any => {
  const {
    closable,
    strings,
    defaultArchiveUrl,
    // 一键：两个 URL 都配置时显示下载两个 exe 并自动解出 6 个 mix 的按钮
    oneClickRa2Url: ra2Url,
    oneClickYrUrl: yrUrl,
    onDownloadArchive,
    onOneClickDownload: onOneClick,
    onBrowseFolder,
    onBrowseArchive,
    onDrop,
    onClose,
  } = props;
  const [dropTarget, setDropTarget] = useState();

  const onDragLeave = useCallback(
    (ev: any) => {
      if (ev.target === dropTarget) setDropTarget(undefined);
    },
    [dropTarget],
  );

  useEffect(() => {
    const prevent = (ev: any) => ev.preventDefault();
    globalThis.addEventListener("drop", prevent);
    globalThis.addEventListener("dragover", prevent);
    return () => {
      globalThis.removeEventListener("drop", prevent);
      globalThis.removeEventListener("dragover", prevent);
    };
  }, []);

  return createElement(
    "div",
    null,
    closable && createElement("div", { className: "close-button", onClick: onClose }),
    createElement("div", { className: "title" }, strings.get("ts:gameres_locate_title")),
    // 一键下载+解压按钮（仅当两个 URL 均配置）
    ra2Url &&
      yrUrl &&
      createElement(
        "div",
        { className: "one-click-container" },
        createElement("p", { className: "desc" }, strings.get("ts:gameres_oneclick_desc")),
        createElement(
          "p",
          { className: "browse-buttons" },
          createElement(
            "button",
            { className: "dialog-button primary", onClick: onOneClick },
            strings.get("ts:gameres_oneclick_button"),
          ),
        ),
      ),
    // 精简手动导入区：仍支持拖放，示例图与 URL 表单已移除
    createElement(
      "div",
      {
        className: classnames("browse-container", { "dropzone-active": !!dropTarget }),
        onDragOver: (ev: any) => ev.preventDefault(),
        onDragLeave,
        onDragEnter: (ev: any) => {
          if ([...ev.dataTransfer.items].every((item: any) => item.kind === "file")) {
            setDropTarget(ev.target);
          }
        },
        onDrop: (ev: any) => {
          ev.preventDefault();
          if ([...ev.dataTransfer.items].every((item: any) => item.kind === "file")) {
            onDrop(ev.dataTransfer);
          }
        },
      },
      createElement("p", { className: "desc" }, strings.get("ts:gameres_import_desc")),
      createElement(
        "p",
        { className: "browse-buttons" },
        createElement(
          "button",
          { className: "dialog-button", onClick: onBrowseFolder },
          strings.get("ts:gameres_browse_folder"),
        ),
        createElement(
          "button",
          { className: "dialog-button", onClick: onBrowseArchive },
          strings.get("ts:gameres_browse_archive"),
        ),
      ),
      createElement(
        "p",
        { className: "archive-formats" },
        createElement("em", null, strings.get("ts:gameres_supported_archive_formats")),
      ),
    ),
  );
};
