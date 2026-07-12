// === Reconstructed SystemJS module: engine/gameRes/GameResImporter ===
// deps: ["data/MixFile","engine/Engine","engine/EngineType","util/time","engine/gameRes/importError/ChecksumError","engine/gameRes/importError/FileNotFoundError","engine/gameRes/importError/ArchiveExtractionError","data/vfs/VirtualFile","engine/mixDatabase","data/Palette","data/ShpFile","engine/gfx/ImageUtils","util/string","engine/gameRes/VideoConverter","engine/gameRes/importError/InvalidArchiveError","data/vfs/FileNotFoundError","data/vfs/IOError","data/vfs/RealFileSystemDir","engine/gameRes/importError/NoWebAssemblyError","network/HttpRequest","engine/gameRes/importError/ArchiveDownloadError"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/gameRes/GameResImporter",
  [
    "data/MixFile",
    "engine/Engine",
    "engine/EngineType",
    "util/time",
    "engine/gameRes/importError/ChecksumError",
    "engine/gameRes/importError/FileNotFoundError",
    "engine/gameRes/importError/ArchiveExtractionError",
    "data/vfs/VirtualFile",
    "engine/mixDatabase",
    "data/Palette",
    "data/ShpFile",
    "engine/gfx/ImageUtils",
    "util/string",
    "engine/gameRes/VideoConverter",
    "engine/gameRes/importError/InvalidArchiveError",
    "data/vfs/FileNotFoundError",
    "data/vfs/IOError",
    "data/vfs/RealFileSystemDir",
    "engine/gameRes/importError/NoWebAssemblyError",
    "network/HttpRequest",
    "engine/gameRes/importError/ArchiveDownloadError",
  ],
  function (e, t) {
    "use strict";
    var c, v, b, S, l, w, E, s, h, a, n, o, C, u, x, O, A, M, R, P, I, d, i;
    t && t.id;
    function k(e) {
      return e / 1024 / 1024;
    }
    function B(l) {
      return function (e, t, i, r, s) {
        let a = l(e, t, i, r, s);
        var o,
          n = d.get(a.node.name);
        return (
          n &&
            ((a.node.contents = new Uint8Array(n)),
            (n = a.stream_ops.write),
            (a.stream_ops = { ...a.stream_ops }),
            (a.stream_ops.write =
              ((o = n),
              function (e, t, i, r, s, a) {
                s || (e.node.usedBytes = e.node.contents.byteLength);
                var n = o(e, t, i, r, s, a);
                return (s || (e.node.usedBytes = n), n);
              }))),
          a
        );
      };
    }
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          u = e;
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
        function (e) {
          M = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          P = e;
        },
        function (e) {
          I = e;
        },
      ],
      execute: function () {
        ((d = new Map()
          .set("ra2.mix", 281895456)
          .set("ra2md.mix", 204527696)
          .set("language.mix", 53116040)
          .set("langmd.mix", 84883510)
          .set("multi.mix", 25856283)
          .set("multimd.mix", 31264268)
          .set("theme.mix", 76862662)
          .set("thememd.mix", 46859102)
          .set("expandmd01.mix", 4813968)),
          e(
            "GameResImporter",
            (i = class {
              constructor(e, t, i) {
                ((this.appConfig = e), (this.strings = t), (this.sentry = i));
              }
              async import(l, c, e, h) {
                // OpenYRWeb: YR-only engine. No engine-type probing — `e` is always
                // YurisRevenge (set by Application at boot). The import copy list is the fixed
                // YR set: the RA2 base archives (which YR depends on) plus the YR expansion
                // archives.
                let u = [
                  "ra2.mix",
                  "language.mix",
                  "multi.mix",
                  "ra2md.mix",
                  "langmd.mix",
                  "expandmd01.mix",
                  "multimd.mix",
                ];
                var r = v.Engine.getFileNameVariant("theme.mix");
                u.push(r);
                let d = new Set([r]),
                  g = v.Engine.rfsSettings.tauntsDir,
                  p = this.strings;
                if ((h(p.get("ts:import_preparing_for_import")), l instanceof URL || "file" === l.kind)) {
                  if (!window.WebAssembly) throw new R.NoWebAssemblyError("WebAssembly is not available");
                  let i, s, a;
                  try {
                    let e = await SystemJS.import("7z-wasm");
                    a = await e({
                      quit: (e, t) => {
                        ((i = e), (s = t));
                      },
                    });
                  } catch (e) {
                    if (e.message.match(/Load failed|Failed to fetch/))
                      throw new P.DownloadError("Failed to load 7z-wasm", { cause: e });
                    if (e instanceof WebAssembly.RuntimeError)
                      throw new A.IOError("Couldn't load 7z-wasm", { cause: e });
                    throw e;
                  }
                  let n;
                  {
                    let t;
                    if (l instanceof URL) {
                      let i = 0;
                      var m = l.toString(),
                        r = this.appConfig.getCorsProxy(l.hostname);
                      let e = m;
                      r && (e = "" + r + encodeURIComponent(m));
                      try {
                        ((t = await new P.HttpRequest().fetchBinary(e, void 0, {
                          onProgress(e, t) {
                            ((i += e),
                              h(
                                t
                                  ? p.get("ts:downloadingpgsize", k(i), k(t), (i / t) * 100)
                                  : p.get("ts:downloadingpgunkn", k(i)),
                              ));
                          },
                        })),
                          (n = "archive"));
                      } catch (e) {
                        if (!i && e instanceof P.DownloadError)
                          throw new I.ArchiveDownloadError(m, "Archive download failed", { cause: e });
                        throw e;
                      }
                    } else {
                      let e = await l.getFile();
                      ((t = new Uint8Array(await e.arrayBuffer())), (n = e.name));
                    }
                    (h(p.get("ts:import_loading_archive")), a.FS.chdir("/tmp"));
                    try {
                      var f = a.FS.open(n, "w+");
                      (a.FS.write(f, t, 0, t.byteLength, 0, !0), a.FS.close(f));
                    } catch (e) {
                      if (e instanceof DOMException)
                        throw new A.IOError(`File "${n}" could not be read (${e.name})`, { cause: e });
                      throw e;
                    }
                  }
                  a.FS.open = B(a.FS.open);
                  for (let o of [...u, g]) {
                    if (
                      (h(p.get("ts:import_extracting", o)),
                      await S.sleep(100),
                      a.callMain(["x", "-ssc-", "-r", n, o]),
                      i)
                    ) {
                      if (1 !== i) throw new x.InvalidArchiveError("7-Zip exited with code " + i, { cause: s });
                      if (s?.message?.match(/out of memory|allocation/i))
                        throw new RangeError("Out of memory", { cause: s });
                      throw new E.ArchiveExtractionError("Archive extraction failed with code " + i, { cause: s });
                    }
                    let r;
                    for (;;) {
                      var t = a.FS.lookupPath(a.FS.cwd())["node"];
                      r = Object.keys(t.contents);
                      t = r.filter((e) => !C.equalsIgnoreCase(e, o) && e !== n);
                      if (1 !== t.length || !a.FS.lookupPath(t[0]).node.isFolder) break;
                      a.FS.chdir(t[0]);
                    }
                    if (o !== g) {
                      let t = o;
                      var y = r.find((e) => C.equalsIgnoreCase(e, t)) ?? t;
                      h(p.get("ts:import_importing", t));
                      let e;
                      try {
                        ((e = this.readFileFromEmFs(a.FS, y)), a.FS.unlink(y));
                      } catch (e) {
                        if (44 !== e.errno) throw e;
                        if (d.has(t)) {
                          // OpenYRWeb: optional mix missing. For thememd.mix (YR expansion BGM)
                          // this means the Yuri's Revenge soundtrack won't play — worth telling
                          // the user, but not a warning (the base game still works). info-level
                          // keeps it visible without crying wolf on every launch.
                          console.info(`Optional mix "${t}" not found - skipping.` + (t.toLowerCase() === "thememd.mix" ? " (Yuris Revenge expansion music will be unavailable; base RA2 music still plays.)" : ""));
                          continue;
                        }
                        throw new w.FileNotFoundError(t);
                      }
                      await this.importMixArchive(e, c, h, p);
                    } else {
                      let i = r.find((e) => C.equalsIgnoreCase(e, g));
                      if (i) {
                        var y = a.FS.lookupPath(i)["node"],
                          y = Object.keys(y.contents).map((e) => i + "/" + e);
                        try {
                          let t = await c.getOrCreateDirectory(g);
                          for (var T of y) {
                            h(p.get("ts:import_importing", T));
                            let e = this.readFileFromEmFs(a.FS, T);
                            (a.FS.unlink(T), await t.writeFile(e, e.filename.toLowerCase()));
                          }
                          a.FS.rmdir(i);
                        } catch (e) {
                          if (!(e instanceof DOMException || e instanceof A.IOError || 44 === e.errno)) throw e;
                          console.warn("Failed to copy taunts folder. Skipping.", [e]);
                        }
                      } else console.warn("Taunts folder not found in archive. Skipping.");
                    }
                    a.FS.chdir("/tmp");
                  }
                  a.FS.unlink(n);
                  try {
                    await c.openFile("ra2.mix");
                  } catch (e) {
                    e instanceof A.IOError &&
                      (h(this.strings.get("GUI:LoadingEx")), location.reload(), await new Promise(() => {}));
                  }
                } else {
                  let t = new M.RealFileSystemDir(l, !0),
                    i = await t.listEntries();
                  for (let s of u) {
                    h(p.get("ts:import_importing", s));
                    var a = i.find((e) => C.equalsIgnoreCase(e, s)) ?? s;
                    let e;
                    try {
                      e = await t.openFile(a);
                    } catch (e) {
                      if (e instanceof O.FileNotFoundError) {
                        if (d.has(s)) {
                          // OpenYRWeb: see the archive-path branch above — optional mix skip.
                          console.info(`Optional mix "${s}" not found - skipping.` + (s.toLowerCase() === "thememd.mix" ? " (Yuris Revenge expansion music will be unavailable; base RA2 music still plays.)" : ""));
                          continue;
                        }
                        throw new w.FileNotFoundError(s);
                      }
                      throw e;
                    }
                    await this.importMixArchive(e, c, h, p);
                  }
                  f = i.find((e) => C.equalsIgnoreCase(e, g)) ?? g;
                  let r;
                  try {
                    r = await t.getDirectory(f);
                  } catch (e) {
                    if (!(e instanceof O.FileNotFoundError || e instanceof A.IOError)) throw e;
                    console.warn(`Directory "${f}" not found (${e.name}). Skipping.`, e);
                  }
                  if (r)
                    try {
                      let e = await c.getOrCreateDirectory(g, !0);
                      for await (var n of r.getRawFiles())
                        (h(p.get("ts:import_importing", e.name + "/" + n.name)),
                          await e.writeFile(n, n.name.toLowerCase()));
                    } catch (e) {
                      if (!(e instanceof A.IOError)) throw e;
                      console.warn("Failed to copy taunts folder. Skipping.", [e]);
                    }
                }
              }
              readFileFromEmFs(e, t) {
                e.chmod(t, 448);
                let i = e.lookupPath(t)["node"];
                var r = i.contents.subarray(0, i.usedBytes);
                return s.VirtualFile.fromBytes(r, t.slice(t.lastIndexOf("/") + 1));
              }
              async importMixArchive(t, i, r, s) {
                let a = t.filename.toLowerCase();
                var e = a.match(/^theme[^.]*\.mix$/);
                if (!t.getSize()) {
                  if (e) return void console.warn(`Mix file ${t.filename} is empty. Skipping.`);
                  throw new l.ChecksumError(`Mix file "${a}" is empty`, a);
                }
                if ((e || (await i.writeFile(t, a)), e)) {
                  var n = v.Engine.rfsSettings.musicDir,
                    n = await i.getOrCreateDirectory(n, !0);
                  await this.importMusic(t, n, (e) => r(s.get("ts:import_importing_pg", a, e)));
                } else if (
                  // OpenYRWeb: YR-only — the language archive is always langmd.mix.
                  a === "langmd.mix"
                ) {
                  r(s.get("ts:import_importing_long", a));
                  var o = new c.MixFile(t.stream);
                  // OpenYRWeb: YR-only — splash image + video import always run.
                  ((n = await this.importSplashImage(o, i)), r(void 0, n)),
                    await this.importVideo(o, i);
                }
              }
              async importMusic(e, i, t) {
                let r;
                try {
                  r = new c.MixFile(e.stream);
                } catch (e) {
                  return (console.warn("Failed to read music mix archive. Skipping."), void console.error(e));
                }
                var s = h.mixDatabase.get(e.filename.toLowerCase());
                if (s) {
                  var a,
                    n = s.length;
                  let e = n;
                  for (a of s) {
                    if ((t(Math.floor(((n - e) / n) * 100)), e--, !a.match(/\.wav$/)))
                      throw new Error(`Music file "${a}" is not a WAV file`);
                    var o = a.replace(".wav", ".mp3");
                    if (r.containsFile(a)) {
                      var l = r.openFile(a);
                      if (l.stream.byteLength) {
                        let t;
                        try {
                          let e = await this.createFFMpeg();
                          (e.FS(
                            "writeFile",
                            a,
                            new Uint8Array(l.stream.buffer, l.stream.byteOffset, l.stream.byteLength),
                          ),
                            await e.run("-i", a, "-vn", "-ar", "22050", "-b:a", "96k", o),
                            (t = e.FS("readFile", o)),
                            e.FS("unlink", a),
                            e.FS("unlink", o));
                        } catch (e) {
                          (console.warn(`Failed to convert music file "${a}". Skipping.`), console.error(e));
                          continue;
                        }
                        l = new Blob([t], { type: "application/octet-stream" });
                        try {
                          await i.writeFile(new File([l], o));
                        } catch (e) {
                          (console.warn(`Failed to write music file "${o}". Skipping.`), console.error(e));
                          continue;
                        }
                      } else console.warn(`Music file "${a}" is empty in the mix archive. Skipping.`);
                    } else console.warn(`Music file "${a} was not found in mix archive. Skipping.`);
                  }
                } else console.warn(`File "${e.filename} not found in mix database. Skipping music import.`);
              }
              async importVideo(e, t) {
                var i = await this.createFFMpeg().catch((e) => {
                    if (e.message.match(/Load failed|Failed to fetch/))
                      throw new P.DownloadError("Failed to load FFMpeg", { cause: e });
                    throw e;
                  }),
                  r = "ra2ts_l.bik",
                  s = v.Engine.rfsSettings.menuVideoFileName;
                if (!e.containsFile(r)) throw new w.FileNotFoundError(r);
                ((r = e.openFile(r)),
                  (r = await new u.VideoConverter().convertBinkVideo(i, r)),
                  (r = new Blob([r], { type: "video/webm" })));
                await t.writeFile(new File([r], s, { type: "video/webm" }));
              }
              async createFFMpeg() {
                const e = (await SystemJS.import("@ffmpeg/ffmpeg"))["createFFmpeg"];
                let t = e({ corePath: "lib/ffmpeg-core.js?v=1", log: !0 });
                var i = window.define;
                return ((window.define = void 0), await t.load(), (window.define = i), t);
              }
              async importSplashImage(e, t) {
                var i = v.Engine.getFileNameVariant("glsl.shp"),
                  r = v.Engine.getFileNameVariant("gls.pal");
                if (!e.containsFile(i)) throw new w.FileNotFoundError(i);
                i = new n.ShpFile(e.openFile(i));
                if (!e.containsFile(r)) throw new w.FileNotFoundError(r);
                ((r = new a.Palette(e.openFile(r))),
                  (i = await o.ImageUtils.convertShpToPng(i, r)),
                  (r = v.Engine.rfsSettings.splashImgFileName));
                let s;
                try {
                  s = new File([i], r, { type: i.type });
                } catch (e) {
                  (console.error("Failed to convert splash image. Skipping.", e),
                    this.sentry?.captureException(
                      new Error(`Failed to convert splash image (type=${i.type})`, { cause: e }),
                    ));
                }
                return (s && (await t.writeFile(s)), i);
              }
            }),
          ));
      },
    };
  },
);
