/**
 * StorageExplorer — 存储文件浏览器（FileExplorer 封装）。
 *
 * 上传白名单/系统文件保护/新建 mod 目录/导出 zip；中文 langmap。
 *
 * 由 gui/screen/options/component/StorageExplorer.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { escape } from "@puzzl/core/lib/regexp"; // 已转换
import * as showSaveFilePickerNs from "file-system-access"; // 孪生
import { RealFileSystemDir } from "data/vfs/RealFileSystemDir"; // 已转换
import { Zip } from "data/zip/Zip"; // 已转换
import { Engine } from "engine/Engine"; // 已转换
import { ReplayStorageFileSystem } from "gui/replay/ReplayStorageFileSystem"; // 已转换
import { ModManager } from "gui/screen/mainMenu/modSel/ModManager"; // 孪生（本组内一并转换）
import { Replay } from "network/gamestate/Replay"; // 已转换
import React, { useEffect, useRef } from "react"; // 孪生（react 外部依赖）
import { CssLoader } from "util/CssLoader"; // 已转换
import { ScriptLoader } from "util/ScriptLoader"; // 已转换
import { sleep } from "util/time"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const showSaveFilePicker: any = (showSaveFilePickerNs as any).showSaveFilePicker;

declare const window: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 是否命中不可改路径规则。 */
const matchesRule = (path: string, rules: any[]) =>
  rules.some((rule) =>
    "string" == typeof rule
      ? path.toLowerCase() === rule.toLowerCase()
      : rule.test(path),
  );

/** 枚举目录条目。 */
const listDirEntries = async (dir: any, basePath: string) => {
  let out: any[] = [];
  for await (const [name, entry] of dir.entries())
    out.push({
      id: name,
      name,
      type: "directory" === entry.kind ? "folder" : "file",
      hash: name,
      attrs:
        "directory" !== entry.kind ||
        matchesRule(("/" !== basePath ? basePath : "") + "/" + name, PROTECTED_DIRS)
          ? void 0
          : { canmodify: false },
      ...("file" === entry.kind
        ? { size: (await entry.getFile()).size }
        : {}),
    });
  return out;
};

/** 按路径段打开目录句柄。 */
const openPath = async (segments: string[], root: any, create = false) => {
  let handle = root;
  for (const seg of segments.slice(1))
    handle = await handle.getDirectoryHandle(seg, { create });
  return handle;
};

/** 可上传白名单。 */
const UPLOAD_ALLOW: any[] = [
  "/keyboard.ini",
  /^\/(language|multi|ra2)\.mix$/i,
  "/" + Engine.rfsSettings.menuVideoFileName,
  "/" + Engine.rfsSettings.splashImgFileName,
  new RegExp(`^/${Engine.rfsSettings.musicDir}/([^/]+)\\.mp3$`, "i"),
  new RegExp(
    `^/${Engine.rfsSettings.replayDir}/` +
      `(([^/]+)${escape(Replay.extension)})|(${escape(
        ReplayStorageFileSystem.manifestFileName,
      )})$`,
    "i",
  ),
  new RegExp(`^/${Engine.rfsSettings.tauntsDir}/tau([^/]+)\\.wav$`, "i"),
  new RegExp(`^/${Engine.rfsSettings.modDir}/[^/]+/`, "i"),
  new RegExp(
    `^/${Engine.rfsSettings.mapDir}/` +
      `[^/]+\\.(${[...new Set([...Engine.supportedMapTypes.values()].flat())].join("|")})$`,
    "i",
  ),
];

/** 上传时强制小写文件名。 */
const LOWERCASE_ON_UPLOAD: any[] = [
  "/keyboard.ini",
  /^\/[^/]+\.mix$/i,
  new RegExp(`^/${Engine.rfsSettings.musicDir}/`, "i"),
  new RegExp(`^/${Engine.rfsSettings.tauntsDir}/`, "i"),
];

/** 需二次确认的系统文件。 */
const SYSTEM_DELETE_CONFIRM: any[] = [
  /^\/([^/]+)\.mix$/i,
  "/" + Engine.rfsSettings.menuVideoFileName,
  "/" + Engine.rfsSettings.splashImgFileName,
  "/" + Engine.rfsSettings.musicDir,
  "/" + Engine.rfsSettings.tauntsDir,
  "/" +
    Engine.rfsSettings.replayDir +
    "/" +
    ReplayStorageFileSystem.manifestFileName,
];

/** 不可删除根路径。 */
const PROTECTED_DIRS: any[] = [
  "/",
  "/" + Engine.rfsSettings.replayDir,
  new RegExp(`^/${Engine.rfsSettings.modDir}(/.*)?`),
  new RegExp(`^/${Engine.rfsSettings.mapDir}(/.*)?`),
];

/** 允许新建文件夹的父目录 id。 */
const FOLDER_CREATE_PARENTS = [Engine.rfsSettings.modDir];

/** 覆盖确认策略。 */
enum OverwriteChoice {
  None = 0,
  OverwriteAll = 1,
  SkipAll = 2,
}

/** 中文 langmap（浏览器 zh 时启用）。 */
function buildZhLangMap(): Record<string, string> {
  var lang =
    (typeof navigator !== "undefined" && navigator.language) || "";
  if (!/^zh/i.test(lang)) return {};
  return {
    "Back (Alt + Left Arrow)": "后退 (Alt + 左箭头)",
    "Forward (Alt + Right Arrow)": "前进 (Alt + 右箭头)",
    "Recent locations": "最近位置",
    "Up (Alt + Up Arrow)": "上级目录 (Alt + 上箭头)",
    "Paste here": "粘贴到此",
    "Cancel all": "全部取消",
    "Loading...": "加载中...",
    "Long-press + paste": "长按 + 粘贴",
    "Ctrl + V  \u00A0/\u00A0  Right-click + Paste":
      "Ctrl + V  \u00A0/\u00A0  右键 + 粘贴",
    "This folder is empty.": "此文件夹为空。",
    "1 item selected": "已选择 1 项",
    "1 item selected {0}": "已选择 1 项，{0}",
    "{0} items selected": "已选择 {0} 项",
    "{0} items selected {1}": "已选择 {0} 项，{1}",
    "{0} items": "{0} 项",
    'Back to "{0}" (Alt + Left Arrow)': '返回到 "{0}" (Alt + 左箭头)',
    'Forward to "{0}" (Alt + Right Arrow)': '前进到 "{0}" (Alt + 右箭头)',
    'Up to "{0}" (Alt + Up Arrow)': '回到 "{0}" (Alt + 上箭头)',
    "New Folder (Ctrl + Ins)": "新建文件夹 (Ctrl + Ins)",
    "New File (Ins)": "新建文件 (Ins)",
    "Creating a new folder...": "正在创建文件夹...",
    "Creating a new folder failed.": "创建文件夹失败。",
    "Creating a new file...": "正在创建文件...",
    "Creating a new file failed.": "创建文件失败。",
    "Deleting 1 item...": "正在删除 1 项...",
    "Deleting {0} items...": "正在删除 {0} 项...",
    "Deleting items failed.": "删除失败。",
    'Renaming "{0}" to "{1}"...': '正在将 "{0}" 重命名为 "{1}"...',
    'Renaming "{0}" to "{1}" failed.': '重命名 "{0}" 失败。',
    'Uploading "{0}"...': '正在上传 "{0}"...',
    'Starting "{0}" failed.': '启动 "{0}" 失败。',
    'Error uploading "{0}" ({1})': '上传 "{0}" 出错 ({1})',
    'Finalizing "{0}" failed.': '完成 "{0}" 失败。',
    "Stopping...": "停止中...",
    "Paste operation failed": "粘贴操作失败",
    "Paste operation failed due to mismatched group name":
      "粘贴失败：组名不匹配",
    "{0} uploading": "{0} 正在上传",
    "{2} done": "{2} 已完成",
    "{3} failed": "{3} 失败",
    "{0}/s": "{0}/秒",
  };
}

/** 组件 props。 */
export interface StorageExplorerProps {
  /** 消息框。 */
  messageBoxApi: any;
  /** 存储根句柄。 */
  storageDirHandle: any;
  /** 起始路径。 */
  startIn?: string;
  /** i18n 字典。 */
  strings: any;
  /** 文件系统变更回调。 */
  onFileSystemChange?: () => void;
}

/** 存储浏览器组件。 */
export const StorageExplorer = ({
  messageBoxApi: box,
  storageDirHandle: root,
  startIn,
  strings: strings,
  onFileSystemChange,
}: StorageExplorerProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let explorer: any;
    let disposed = false;
    let resetTimer: any;
    let overwrite = OverwriteChoice.None;
    let activeUploads = 0;
    let notifiedChange = false;
    const refreshQuota = async () => {
      if (explorer && navigator.storage?.estimate) {
        const { usage, quota } = await navigator.storage.estimate();
        if (usage && quota) {
          const text = strings.get(
            "GUI:StorageUsed",
            explorer.GetDisplayFilesize(usage),
            explorer.GetDisplayFilesize(quota),
          );
          explorer.SetNamedStatusBarText(
            "quota",
            quota <= usage
              ? "<font color='red'>" + text + "</font>"
              : text,
          );
        }
      }
    };
    const onNewFolder = async (cb: any, folderApi: any) => {
      if (!FOLDER_CREATE_PARENTS.includes(folderApi.GetPathIDs().pop())) {
        cb(strings.get("GUI:NewFolderNotAllowed"));
        return;
      }
      let name: string | null = prompt(strings.get("GUI:NewFolderPrompt"));
      if (name?.match(ModManager.modIdRegex)) {
        try {
          let dir = await openPath(folderApi.GetPathIDs(), root);
          if (await new RealFileSystemDir(dir).containsEntry(name)) {
            cb(strings.get("GUI:NewFolderExists"));
            return;
          }
          var handle = await dir.getDirectoryHandle(name, { create: true });
          name = handle.name;
        } catch (e) {
          console.error(e);
          cb(false);
          return;
        }
        cb({ type: "folder", name, id: name, hash: name });
      } else cb(strings.get("GUI:NewFolderInvalidName"));
    };
    const onDelete = async (ok: any, folderApi: any, names: string[]) => {
      let system: string[] = [];
      let doomed: string[] = [];
      var count = names.length;
      for (const n of names) {
        let path = [...folderApi.GetPathIDs(), n].join("/");
        if (matchesRule(path, SYSTEM_DELETE_CONFIRM)) system.push(path);
        else doomed.push(path);
      }
      const confirmed =
        !doomed.length ||
        (await box.confirm(
          1 === count
            ? strings.get("GUI:ConfirmDeleteFile")
            : strings.get("GUI:ConfirmDeleteFiles", count),
          strings.get("GUI:Yes"),
          strings.get("GUI:No"),
        ));
      if (!confirmed) {
        ok(false);
        return;
      }
      if (system.length)
        for (const path of system) {
          const sysOk = await box.confirm(
            strings.get("GUI:ConfirmDeleteSystemFile", path),
            strings.get("GUI:Yes"),
            strings.get("GUI:No"),
          );
          if (sysOk) doomed.push(path);
        }
      if (doomed.length) {
        let error: any;
        try {
          for (const path of doomed) {
            console.log(`Deleting "${path}"...`);
            var parent = path.substring(0, path.lastIndexOf("/")).split("/");
            let dir = await openPath(parent, root);
            await dir.removeEntry(path.split("/").pop()!, { recursive: true });
            console.log(`Deleted "${path}".`);
          }
        } catch (e) {
          console.error(e);
          error = e;
        }
        ok(!!error && (error as any).message);
        explorer?.RefreshFolders(true);
        if (!notifiedChange) {
          notifiedChange = true;
          onFileSystemChange?.();
        }
      } else ok(false);
    };
    const onInitUpload = async (done: any, ctx: any) => {
      let path = ctx.folder.GetPathIDs().join("/") + ctx.fullPath;
      let parent = path.substring(0, path.lastIndexOf("/")).split("/");
      let skip = false;
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = void 0;
      }
      activeUploads++;
      let uploaded = false;
      let dir: any;
      try {
        if (matchesRule(path, UPLOAD_ALLOW)) {
          dir = await openPath(parent, root, true);
          for await (const existing of dir.keys())
            if (existing.toLowerCase() === ctx.file.name.toLowerCase()) {
              let choice: number;
              if (overwrite === OverwriteChoice.None) {
                choice = await new Promise((resolve) => {
                  box.show(
                    strings.get(
                      "GUI:ConfirmOverwriteFile",
                      parent.join("/") || "/",
                      ctx.file.name,
                    ),
                    [
                      { label: strings.get("GUI:Yes"), onClick: () => resolve(1) },
                      {
                        label: strings.get("GUI:YesToAll"),
                        onClick: () => resolve(2),
                      },
                      { label: strings.get("GUI:No"), onClick: () => resolve(0) },
                      {
                        label: strings.get("GUI:Cancel"),
                        onClick: () => resolve(-1),
                      },
                    ],
                  );
                });
                if (2 === choice) overwrite = OverwriteChoice.OverwriteAll;
                else if (-1 === choice) overwrite = OverwriteChoice.SkipAll;
                if (choice <= 0) skip = true;
              } else if (overwrite === OverwriteChoice.SkipAll) skip = true;
              break;
            }
        } else skip = true;
        if (skip) console.log("File skipped: " + path);
        else {
          console.log("Uploading file: " + path);
          explorer?.SetNamedStatusBarText(
            "message",
            strings.get("GUI:Uploading", path),
          );
          let fileName = ctx.file.name;
          if (matchesRule(path, LOWERCASE_ON_UPLOAD))
            fileName = fileName.toLowerCase();
          await new RealFileSystemDir(dir).writeFile(ctx.file, fileName);
          uploaded = true;
          console.log("File uploaded: " + path);
        }
      } catch (e: any) {
        console.error(e);
        const msg =
          "QuotaExceededError" === e.name
            ? strings.get("GUI:UploadFailedQuota")
            : strings.get("GUI:UploadFailed");
        explorer?.SetNamedStatusBarText(
          "message",
          "<font color='red'>" + msg + "</font>",
          10000,
        );
      }
      activeUploads--;
      if (!activeUploads)
        resetTimer = setTimeout(() => {
          overwrite = OverwriteChoice.None;
          explorer?.SetNamedStatusBarText(
            "message",
            strings.get("GUI:UploadFinished"),
            2000,
          );
        }, 1000);
      done(false);
      if (explorer && uploaded) {
        explorer.RefreshFolders(true);
        await refreshQuota();
        if (!notifiedChange) {
          notifiedChange = true;
          onFileSystemChange?.();
        }
      }
    };
    const onInitDownload = (_ok: any, folderApi: any, _unused: any, selection: any) => {
      if (!(1 !== selection.length || "file" !== selection[0].type)) {
        explorer.OpenSelectedItems();
        return;
      }
      void (async () => {
        let saveHandle = await showSaveFilePicker({
          suggestedName: "cdexport.zip",
        });
        let dir = await openPath(folderApi.GetPathIDs(), root);
        let zip = new Zip();
        const walk = async (node: any, prefix: string, emit: any) => {
          for await (const child of node.values())
            if ("directory" === child.kind)
              await walk(child, prefix + "/" + child.name, emit);
            else await emit(await child.getFile(), prefix + "/" + child.name);
        };
        let abort = new AbortController();
        let tracker = explorer.CreateProgressTracker(() => {
          try {
            abort.abort();
          } catch {
            /* ignore */
          }
        });
        tracker.queueditems = selection.length;
        tracker.showbyterate = true;
        const appendFile = async (file: File, entryPath: string) => {
          zip.startFile(entryPath, file.lastModified);
          const reader = file.stream().getReader();
          for (;;) {
            var { done, value } = await reader.read();
            if (done) break;
            zip.appendData(value);
            await sleep(0);
          }
          zip.endFile();
          tracker.totalbytes += file.size;
        };
        var loadingTimer = setTimeout(() => {
          box.show(strings.get("GUI:CreatingArchive"), strings.get("GUI:Cancel"), () => {
            try {
              tracker.cancelcallback();
            } catch (e) {
              console.error(e);
            }
          });
        }, 1000);
        try {
          await Promise.all([
            (async () => {
              for (const { id, type } of selection) {
                if ("folder" === type) {
                  var folder = await dir.getDirectoryHandle(id);
                  await walk(folder, id, async (file: File, path: string) => {
                    await appendFile(file, path);
                  });
                } else {
                  let handle = await dir.getFileHandle(id);
                  let file = await handle.getFile();
                  await appendFile(file, id);
                }
                tracker.itemsdone++;
              }
              zip.finish();
            })(),
            (async () => {
              var writable = await saveHandle.createWritable();
              await zip.outputStream.pipeTo(writable, {
                signal: abort.signal,
              });
            })(),
          ]);
          console.log("ZIP file saved successfully.");
          explorer?.RemoveProgressTracker(tracker, strings.get("GUI:DownloadFinished"));
        } catch (e: any) {
          clearTimeout(loadingTimer);
          if ("AbortError" !== e.name) {
            console.error(e);
            explorer?.RemoveProgressTracker(tracker, strings.get("GUI:DownloadFailed"));
            await box.alert(
              strings.get("GUI:DownloadFailed"),
              strings.get("GUI:OK"),
            );
          } else
            explorer?.RemoveProgressTracker(
              tracker,
              strings.get("GUI:DownloadAborted"),
            );
        } finally {
          clearTimeout(loadingTimer);
          box.destroy();
        }
      })().catch((e) => {
        if ("AbortError" !== e.name) console.error(e);
      });
    };
    const onOpenFile = (folderApi: any, entry: any) => {
      void (async () => {
        let dir = await openPath(folderApi.GetPathIDs(), root);
        let handle = await dir.getFileHandle(entry.id);
        var file = await handle.getFile();
        let saveHandle = await showSaveFilePicker({ suggestedName: file.name });
        let writable = await saveHandle.createWritable();
        try {
          await writable.write(file);
          await writable.close();
        } catch (e) {
          await writable.abort();
          throw e;
        }
      })().catch((e) => {
        if ("AbortError" !== e.name) console.error(e);
      });
    };
    const onRefresh = (table: any) => {
      void (async () => {
        var dir = await openPath(table.GetPathIDs(), root);
        var entries = await listDirEntries(
          dir,
          table.GetPathIDs().join("/"),
        );
        if (!explorer?.IsDestroyed()) table.SetEntries(entries);
      })().catch((e) => {
        console.error(e);
      });
    };
    void (async () => {
      box.show(strings.get("GUI:LoadingEx"));
      try {
        await Promise.all([
          new ScriptLoader(document).load(
            "lib/file-explorer/file-explorer.js",
          ),
          new CssLoader(document).load(
            "lib/file-explorer/file-explorer.css",
          ),
        ]);
        if (disposed) return;
        let initPath: any[] = [
          ["", "/", { canmodify: matchesRule("/", PROTECTED_DIRS) }],
        ];
        if (startIn) {
          let acc = "";
          for (const seg of startIn.split("/")) {
            acc += "/" + seg;
            initPath.push([seg, seg, { canmodify: matchesRule(acc, PROTECTED_DIRS) }]);
          }
        }
        const langmap = buildZhLangMap();
        explorer = new window.FileExplorer(hostRef.current, {
          initpath: initPath,
          langmap,
          onrefresh: onRefresh,
          onopenfile: onOpenFile,
          concurrentuploads: 1,
          oninitupload: onInitUpload,
          oninitdownload: onInitDownload,
          onnewfolder: onNewFolder,
          ondelete: onDelete,
        });
        await refreshQuota();
      } finally {
        box.destroy();
      }
    })().catch((e) => console.error(e));
    return () => {
      disposed = true;
      if (explorer) explorer.Destroy();
      explorer = void 0;
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);
  return React.createElement("div", {
    ref: hostRef,
    className: "storage-explorer",
  });
};
