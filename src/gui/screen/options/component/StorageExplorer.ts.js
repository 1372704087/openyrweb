// === Reconstructed SystemJS module: gui/screen/options/component/StorageExplorer ===
// deps: ["@puzzl/core/lib/regexp","file-system-access","data/vfs/RealFileSystemDir","data/zip/Zip","engine/Engine","gui/replay/ReplayStorageFileSystem","gui/screen/mainMenu/modSel/ModManager","network/gamestate/Replay","react","util/CssLoader","util/ScriptLoader","util/time"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/component/StorageExplorer",
  [
    "@puzzl/core/lib/regexp",
    "file-system-access",
    "data/vfs/RealFileSystemDir",
    "data/zip/Zip",
    "engine/Engine",
    "gui/replay/ReplayStorageFileSystem",
    "gui/screen/mainMenu/modSel/ModManager",
    "network/gamestate/Replay",
    "react",
    "util/CssLoader",
    "util/ScriptLoader",
    "util/time",
  ],
  function (t, e) {
    "use strict";
    var i, S, w, E, r, s, C, a, n, x, O, A, M, R, P, I, k, B, o, N, j;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          A = e;
        },
      ],
      execute: function () {
        var e;
        ((M = (t) => o.some((e) => ("string" == typeof e ? t.toLowerCase() === e.toLowerCase() : e.test(t)))),
          (R = async (e, t) => {
            let i = [];
            for await (var [r, s] of e.entries())
              i.push({
                id: r,
                name: r,
                type: "directory" === s.kind ? "folder" : "file",
                hash: r,
                attrs: "directory" !== s.kind || M(("/" !== t ? t : "") + "/" + r) ? void 0 : { canmodify: !1 },
                ...("file" === s.kind ? { size: (await s.getFile()).size } : {}),
              });
            return i;
          }),
          (P = async (e, t, i = !1) => {
            let r = t;
            for (var s of e.slice(1)) r = await r.getDirectoryHandle(s, { create: i });
            return r;
          }),
          (I = [
            "/keyboard.ini",
            /^\/(language|multi|ra2)\.mix$/i,
            "/" + r.Engine.rfsSettings.menuVideoFileName,
            "/" + r.Engine.rfsSettings.splashImgFileName,
            new RegExp(`^/${r.Engine.rfsSettings.musicDir}/([^/]+)\\.mp3$`, "i"),
            new RegExp(
              `^/${r.Engine.rfsSettings.replayDir}/` +
                `(([^/]+)${i.escape(a.Replay.extension)})|(${i.escape(s.ReplayStorageFileSystem.manifestFileName)})$`,
              "i",
            ),
            new RegExp(`^/${r.Engine.rfsSettings.tauntsDir}/tau([^/]+)\\.wav$`, "i"),
            new RegExp(`^/${r.Engine.rfsSettings.modDir}/[^/]+/`, "i"),
            new RegExp(
              `^/${r.Engine.rfsSettings.mapDir}/` +
                `[^/]+\\.(${[...new Set([...r.Engine.supportedMapTypes.values()].flat())].join("|")})$`,
              "i",
            ),
          ]),
          (k = [
            "/keyboard.ini",
            /^\/[^/]+\.mix$/i,
            new RegExp(`^/${r.Engine.rfsSettings.musicDir}/`, "i"),
            new RegExp(`^/${r.Engine.rfsSettings.tauntsDir}/`, "i"),
          ]),
          (B = [
            /^\/([^/]+)\.mix$/i,
            "/" + r.Engine.rfsSettings.menuVideoFileName,
            "/" + r.Engine.rfsSettings.splashImgFileName,
            "/" + r.Engine.rfsSettings.musicDir,
            "/" + r.Engine.rfsSettings.tauntsDir,
            "/" + r.Engine.rfsSettings.replayDir + "/" + s.ReplayStorageFileSystem.manifestFileName,
          ]),
          (o = [
            "/",
            "/" + r.Engine.rfsSettings.replayDir,
            new RegExp(`^/${r.Engine.rfsSettings.modDir}(/.*)?`),
            new RegExp(`^/${r.Engine.rfsSettings.mapDir}(/.*)?`),
          ]),
          (N = [r.Engine.rfsSettings.modDir]),
          ((e = j = j || {})[(e.None = 0)] = "None"),
          (e[(e.OverwriteAll = 1)] = "OverwriteAll"),
          (e[(e.SkipAll = 2)] = "SkipAll"),
          t(
            "StorageExplorer",
            ({ messageBoxApi: f, storageDirHandle: y, startIn: c, strings: T, onFileSystemChange: v }) => {
              const b = n.useRef(null);
              return (
                n.useEffect(() => {
                  let u,
                    e = !1,
                    h,
                    d = j.None,
                    g = 0,
                    p = !1;
                  const m = async () => {
                      var e, t, i;
                      u &&
                        navigator.storage?.estimate &&
                        (({ usage: e, quota: t } = await navigator.storage.estimate()),
                        e &&
                          t &&
                          ((i = T.get("GUI:StorageUsed", u.GetDisplayFilesize(e), u.GetDisplayFilesize(t))),
                          u.SetNamedStatusBarText("quota", t <= e ? "<font color='red'>" + i + "</font>" : i)));
                    },
                    r = async (i, r) => {
                      if (N.includes(r.GetPathIDs().pop())) {
                        let t = prompt(T.get("GUI:NewFolderPrompt"));
                        if (t?.match(C.ModManager.modIdRegex)) {
                          try {
                            let e = await P(r.GetPathIDs(), y);
                            if (await new w.RealFileSystemDir(e).containsEntry(t))
                              return void i(T.get("GUI:NewFolderExists"));
                            var s = await e.getDirectoryHandle(t, { create: !0 });
                            t = s.name;
                          } catch (e) {
                            return (console.error(e), void i(!1));
                          }
                          i({ type: "folder", name: t, id: t, hash: t });
                        } else i(T.get("GUI:NewFolderInvalidName"));
                      } else i(T.get("GUI:NewFolderNotAllowed"));
                    },
                    s = async (e, i, t) => {
                      let r = [],
                        s = [];
                      var a,
                        n = t.length;
                      for (a of t) {
                        let t = [...i.GetPathIDs(), a].join("/");
                        (B.some((e) => ("string" == typeof e ? t.toLowerCase() === e.toLowerCase() : e.test(t)))
                          ? r
                          : s
                        ).push(t);
                      }
                      if (
                        !s.length ||
                        (await f.confirm(
                          1 === n ? T.get("GUI:ConfirmDeleteFile") : T.get("GUI:ConfirmDeleteFiles", n),
                          T.get("GUI:Yes"),
                          T.get("GUI:No"),
                        ))
                      ) {
                        if (r.length)
                          for (var o of r)
                            (await f.confirm(
                              T.get("GUI:ConfirmDeleteSystemFile", o),
                              T.get("GUI:Yes"),
                              T.get("GUI:No"),
                            )) && s.push(o);
                        if (s.length) {
                          let t;
                          try {
                            for (var l of s) {
                              console.log(`Deleting "${l}"...`);
                              var c = l.substring(0, l.lastIndexOf("/")).split("/");
                              let e = await P(c, y);
                              (await e.removeEntry(l.split("/").pop(), { recursive: !0 }),
                                console.log(`Deleted "${l}".`));
                            }
                          } catch (e) {
                            (console.error(e), (t = e));
                          }
                          (e(!!t && t.message), u?.RefreshFolders(!0), p || ((p = !0), v()));
                        } else e(!1);
                      } else e(!1);
                    },
                    a = async (e, t) => {
                      let i = t.folder.GetPathIDs().join("/") + t.fullPath,
                        r = i.substring(0, i.lastIndexOf("/")).split("/"),
                        s = !1;
                      (h && (clearTimeout(h), (h = void 0)), g++);
                      let a = !1,
                        n;
                      try {
                        if (I.some((e) => ("string" == typeof e ? i.toLowerCase() === e.toLowerCase() : e.test(i)))) {
                          n = await P(r, y, !0);
                          for await (var o of n.keys())
                            if (o.toLowerCase() === t.file.name.toLowerCase()) {
                              var l;
                              d === j.None
                                ? (2 ===
                                  (l = await new Promise((e) => {
                                    f.show(T.get("GUI:ConfirmOverwriteFile", r.join("/") || "/", t.file.name), [
                                      { label: T.get("GUI:Yes"), onClick: () => e(1) },
                                      { label: T.get("GUI:YesToAll"), onClick: () => e(2) },
                                      { label: T.get("GUI:No"), onClick: () => e(0) },
                                      { label: T.get("GUI:Cancel"), onClick: () => e(-1) },
                                    ]);
                                  }))
                                    ? (d = j.OverwriteAll)
                                    : -1 === l && (d = j.SkipAll),
                                  l <= 0 && (a = !0))
                                : d === j.SkipAll && (a = !0);
                              break;
                            }
                        } else a = !0;
                        if (a) console.log("File skipped: " + i);
                        else {
                          (console.log("Uploading file: " + i),
                            u?.SetNamedStatusBarText("message", T.get("GUI:Uploading", i)));
                          let e = t.file.name;
                          (k.some((e) => ("string" == typeof e ? i.toLowerCase() === e.toLowerCase() : e.test(i))) &&
                            (e = e.toLowerCase()),
                            await new w.RealFileSystemDir(n).writeFile(t.file, e),
                            (s = !0),
                            console.log("File uploaded: " + i));
                        }
                      } catch (e) {
                        console.error(e);
                        var c =
                          "QuotaExceededError" === e.name ? T.get("GUI:UploadFailedQuota") : T.get("GUI:UploadFailed");
                        u?.SetNamedStatusBarText("message", "<font color='red'>" + c + "</font>", 1e4);
                      }
                      (g--,
                        g ||
                          (h = setTimeout(() => {
                            ((d = j.None), u?.SetNamedStatusBarText("message", T.get("GUI:UploadFinished"), 2e3));
                          }, 1e3)),
                        e(!1),
                        u && s && (u.RefreshFolders(!0), await m(), p || ((p = !0), v())));
                    },
                    n = (e, c, t, h) => {
                      1 !== h.length || "file" !== h[0].type
                        ? (async () => {
                            let t = await S.showSaveFilePicker({ suggestedName: "cdexport.zip" }),
                              r = await P(c.GetPathIDs(), y),
                              a = new E.Zip();
                            const s = async (e, t, i) => {
                              for await (var r of e.values())
                                "directory" === r.kind
                                  ? await s(r, t + "/" + r.name, i)
                                  : await i(await r.getFile(), t + "/" + r.name);
                            };
                            let i = new AbortController(),
                              n = u.CreateProgressTracker(() => {
                                try {
                                  i.abort();
                                } catch (e) {}
                              });
                            ((n.queueditems = h.length), (n.showbyterate = !0));
                            const o = async (e, t) => {
                              a.startFile(t, e.lastModified);
                              const i = e.stream().getReader();
                              for (;;) {
                                var { done: r, value: s } = await i.read();
                                if (r) break;
                                (a.appendData(s), await A.sleep(0));
                              }
                              (a.endFile(), (n.totalbytes += e.size));
                            };
                            var l = setTimeout(() => {
                              f.show(T.get("GUI:CreatingArchive"), T.get("GUI:Cancel"), () => {
                                try {
                                  n.cancelcallback();
                                } catch (e) {
                                  console.error(e);
                                }
                              });
                            }, 1e3);
                            try {
                              (await Promise.all([
                                (async () => {
                                  for (var { id: t, type: e } of h) {
                                    if ("folder" === e) {
                                      var i = await r.getDirectoryHandle(t);
                                      await s(i, t, async (e, t) => {
                                        await o(e, t);
                                      });
                                    } else {
                                      let e = await r.getFileHandle(t);
                                      i = await e.getFile();
                                      await o(i, t);
                                    }
                                    n.itemsdone++;
                                  }
                                  a.finish();
                                })(),
                                (async () => {
                                  var e = await t.createWritable();
                                  await a.outputStream.pipeTo(e, { signal: i.signal });
                                })(),
                              ]),
                                console.log("ZIP file saved successfully."),
                                u?.RemoveProgressTracker(n, T.get("GUI:DownloadFinished")));
                            } catch (e) {
                              (clearTimeout(l),
                                "AbortError" !== e.name
                                  ? (console.error(e),
                                    u?.RemoveProgressTracker(n, T.get("GUI:DownloadFailed")),
                                    await f.alert(T.get("GUI:DownloadFailed"), T.get("GUI:OK")))
                                  : u?.RemoveProgressTracker(n, T.get("GUI:DownloadAborted")));
                            } finally {
                              (clearTimeout(l), f.destroy());
                            }
                          })().catch((e) => {
                            "AbortError" !== e.name && console.error(e);
                          })
                        : u.OpenSelectedItems();
                    },
                    o = (a, n) => {
                      (async () => {
                        let e = await P(a.GetPathIDs(), y),
                          t = await e.getFileHandle(n.id);
                        var i = await t.getFile();
                        let r = await S.showSaveFilePicker({ suggestedName: i.name }),
                          s = await r.createWritable();
                        try {
                          (await s.write(i), await s.close());
                        } catch (e) {
                          throw (await s.abort(), e);
                        }
                      })().catch((e) => {
                        "AbortError" !== e.name && console.error(e);
                      });
                    },
                    l = (t, e) => {
                      (async () => {
                        var e = await P(t.GetPathIDs(), y),
                          e = await R(e, t.GetPathIDs().join("/"));
                        u?.IsDestroyed() || t.SetEntries(e);
                      })().catch((e) => {
                        console.error(e);
                      });
                    };
                  return (
                    (async () => {
                      f.show(T.get("GUI:LoadingEx"));
                      try {
                        if (
                          (await Promise.all([
                            new O.ScriptLoader(document).load("lib/file-explorer/file-explorer.js"),
                            new x.CssLoader(document).load("lib/file-explorer/file-explorer.css"),
                          ]),
                          e)
                        )
                          return;
                        let t = [["", "/", { canmodify: M("/") }]];
                        if (c) {
                          let e = "";
                          for (var i of c.split("/")) ((e += "/" + i), t.push([i, i, { canmodify: M(e) }]));
                        }
                        ((u = new window.FileExplorer(b.current, {
                          initpath: t,
                          onrefresh: l,
                          onopenfile: o,
                          concurrentuploads: 1,
                          oninitupload: a,
                          oninitdownload: n,
                          onnewfolder: r,
                          ondelete: s,
                        })),
                          await m());
                      } finally {
                        f.destroy();
                      }
                    })().catch((e) => console.error(e)),
                    () => {
                      ((e = !0), u?.Destroy(), (u = void 0), h && clearTimeout(h));
                    }
                  );
                }, []),
                n.default.createElement("div", { ref: b, className: "storage-explorer" })
              );
            },
          ));
      },
    };
  },
);
