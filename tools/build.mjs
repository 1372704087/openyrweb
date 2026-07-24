#!/usr/bin/env node
/**
 * tools/build.mjs — Build the client (build/) entirely from committed sources.
 *
 * This build is 100% self-contained: it reads ONLY committed directories
 * (src/, vendor/, res/, server/config/) and writes build/. No external product
 * is fetched. Every third-party asset lives in vendor/ with attribution in
 * vendor/THIRD_PARTY_LICENSES.md; the npm deps are bundled into
 * vendor/dist/vendor.bundle.js + worker.js by tools/build-vendor.mjs.
 *
 * Input (all committed):
 *   src/                         our reconstructed, repackable engine source
 *   vendor/                      vendored FOSS libs + npm bundles + templates
 *   res/cd-overrides/            engine-required INI overrides
 *   server/config/config.ini     offline config (no telemetry, no CDN)
 * Output (gitignored, regenerated):
 *   build/                       the deployable client
 *
 * Run: `npm run build`  (precede with `npm run build:vendor` to refresh bundles).
 */

import { spawnSync } from "node:child_process";
import {
  readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync, statSync, rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = join(ROOT, "src");
const VENDOR = join(ROOT, "vendor");
const BUILD = join(ROOT, "build");
const SERVER_CFG = join(ROOT, "server", "config", "config.ini");
const VERSION = process.env.VERSION || "0.1.0";

const log = (m) => console.log(m);
const logv = (m) => console.log("  " + m);

// ---- helpers -----------------------------------------------------------------
function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}
function writeOut(relPath, content) {
  const full = join(BUILD, relPath);
  ensureDir(dirname(full));
  writeFileSync(full, content);
  return full;
}
// Copy vendor/<relSrc> -> build/<relDst>. Reads ONLY from vendor/.
function copyVendor(relSrc, relDst) {
  const dst = join(BUILD, relDst || relSrc);
  ensureDir(dirname(dst));
  copyFileSync(join(VENDOR, relSrc), dst);
  return dst;
}
function copyTree(rootDir, relDir, dstDir) {
  // Recursively copy <rootDir>/<relDir> -> <dstDir>
  const src = join(rootDir, relDir);
  if (!existsSync(src)) return 0;
  let n = 0;
  const walk = (d, rel) => {
    for (const e of readdirSync(d)) {
      const fp = join(d, e);
      const rp = rel ? rel + "/" + e : e;
      if (statSync(fp).isDirectory()) walk(fp, rp);
      else {
        const out = join(dstDir, rp);
        ensureDir(dirname(out));
        copyFileSync(fp, out);
        n++;
      }
    }
  };
  walk(src, "");
  return n;
}

// ---- 1. Repack our bundle (dist/ra2web.js) -----------------------------------
function stepRepack() {
  log("[1/6] Repacking bundle: src/ -> build/dist/ra2web.js");
  const r = spawnSync("node", [join(__dirname, "repack.mjs")], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) throw new Error("repack failed");
}

// ---- 2. Vendor third-party FOSS libs from vendor/ ---------------------------
// vendor/dist already contains: vendor.bundle.js, worker.js (npm-built),
// 7zz.{js,wasm}, ffmpeg.min.js, web-audio-polyfill.min.js.
// vendor/lib contains the single-file FOSS libs (three, systemjs, lzo, ...) and
// the ffmpeg-core.{js,wasm,worker.js} trio (engine corePath = "lib/ffmpeg-core.js").
function stepVendor() {
  log("[2/6] Copying vendored FOSS libraries (vendor/dist, vendor/lib)");
  // dist/ — npm-built bundles + wasm tools + polyfills, verbatim.
  ensureDir(join(BUILD, "dist"));
  for (const f of readdirSync(join(VENDOR, "dist"))) {
    const srcPath = join(VENDOR, "dist", f);
    if (statSync(srcPath).isDirectory()) continue;
    const dstPath = join(BUILD, "dist", f);
    if (f.endsWith(".js")) {
      // Normalize any lingering internal cache-bust query strings.
      let txt = readFileSync(srcPath, "utf8");
      txt = txt.replace(/\?v=0\.82\.0(-\d+)?/g, "?v=" + VERSION);
      writeFileSync(dstPath, txt);
    } else {
      copyFileSync(srcPath, dstPath);
    }
    logv("dist/" + f);
  }
  // The engine spawns `new Worker("./dist/worker.min.js?v=0.1.0")` (hardcoded path).
  // Our vendor build emits worker.js; mirror it to the engine-expected name.
  if (existsSync(join(VENDOR, "dist", "worker.js"))) {
    copyFileSync(join(VENDOR, "dist", "worker.js"), join(BUILD, "dist", "worker.min.js"));
    logv("dist/worker.min.js (mirrored from worker.js — engine spawns worker.min.js)");
  }
  // lib/ — FOSS single-file libs, verbatim.
  const libCount = copyTree(VENDOR, "lib", join(BUILD, "lib"));
  logv("lib/ (" + libCount + " files)");

  // Guard against path drift: the engine hardcodes corePath "lib/ffmpeg-core.js"
  // and ffmpeg.min.js derives the .wasm/.worker.js paths from it, so all three
  // must land in build/lib/. A silent miss here 404s at runtime (regression that
  // once shipped to Pages undetected).
  for (const f of ["ffmpeg-core.js", "ffmpeg-core.wasm", "ffmpeg-core.worker.js"]) {
    if (!existsSync(join(BUILD, "lib", f))) {
      throw new Error(
        "build/lib/" + f + " missing — ffmpeg core must be in vendor/lib/ " +
        "(engine corePath is \"lib/ffmpeg-core.js\"). Check tools/vendor-setup.sh."
      );
    }
  }
  logv("lib/ffmpeg-core.{js,wasm,worker.js} present (corePath target verified)");
}

// ---- 3. Generate index.html -------------------------------------------------
function stepIndex() {
  log("[3/6] Generating index.html");
  let html = readFileSync(join(VENDOR, "templates", "index.html"), "utf8");

  // Strip the upstream's analytics / third-party injectors entirely.
  html = html.replace(/<!-- Global site tag[\s\S]*?<\/script>/i, "");
  html = html.replace(/<script async src="https:\/\/www\.googletagmanager\.com[^"]*"><\/script>/i, "");
  html = html.replace(/<script[^>]*nonce=[^>]*>[\s\S]*?zaraz[\s\S]*?<\/script>/i, "");
  html = html.replace(/<script data-cfasync="false"[\s\S]*?<\/script>(?=\s*<\/head>)/i, "");
  html = html.replace(/<script>\(function\(\)\{function c\(\)\{var b=a\.contentDocument[\s\S]*?<\/script>\s*<\/body>/i, "</body>");
  // poll.js is an upstream-only popup widget (initPoll with empty id is a no-op);
  // drop the <script> tag to avoid a 404.
  html = html.replace(/\s*<script type="text\/javascript" src="lib\/poll\.js[^"]*"[^>]*><\/script>/gi, "");

  // Title + description.
  html = html.replace(/<title>[^<]*<\/title>/i, "<title>OpenYRWeb — Red Alert 2: Yuri's Revenge</title>");
  html = html.replace(
    /<meta name="description"[^>]*>/i,
    '<meta name="description" content="OpenYRWeb: a self-hostable, open-source web port of Red Alert 2: Yuri\'s Revenge.">'
  );

  // Point at OUR bundle filenames (no upstream .min naming, no cache-bust query).
  html = html.replace(/src="dist\/ra2web\.min\.js\?v=[^"]*"/i, 'src="dist/ra2web.js?v=' + VERSION + '"');
  html = html.replace(/src="dist\/vendor\.bundle\.min\.js\?v=[^"]*"/i, 'src="dist/vendor.bundle.js"');

  // SystemJS path aliases: keep the engine's internal alias namespace, drop the
  // external sp-bots script entirely (the AI ships inside ra2web.js).
  html = html.replace(/@chronodivide\/game-api/g, "@openyrweb/game-api");
  html = html.replace(/\s*<script[^>]*src="[^"]*spbots\.min\.js[^"]*"[^>]*><\/script>/gi, "");
  html = html.replace(/\s*"dist\/spbots\.min\.js":\s*\{[\s\S]*?\},?/gi, "");
  html = html.replace(/\s*"@openyrweb\/sp-bots":\s*"dist\/spbots\.min\.js[^"]*",?/gi, "");
  html = html.replace(/\s*"@chronodivide\/sp-bots":\s*"dist\/spbots\.min\.js[^"]*",?/gi, "");

  // Drop any lingering internal cache-bust query strings.
  html = html.replace(/\?v=0\.82\.0(-\d+)?/g, "?v=" + VERSION);

  // Inject favicon + build-marker meta.
  const headInject =
    '  <meta name="openyrweb" content="built">\n' +
    '  <link rel="icon" type="image/svg+xml" href="res/favicon.svg">\n';
  html = html.replace(/<head>/i, "<head>\n" + headInject);

  writeOut("index.html", html);
  logv("index.html (title/favicon/aliases set, third-party injectors stripped)");
}

// ---- 5. Generate assets ------------------------------------------------------
function stepAssets() {
  log("[5/6] Generating assets");

  // Engine-required INI overrides (YR bug-fixes, MP modes) as standalone files.
  const CD_OVERRIDES_SRC = join(ROOT, "res", "cd-overrides");
  if (!existsSync(CD_OVERRIDES_SRC)) {
    throw new Error("res/cd-overrides/ missing — engine-required INI overrides not found");
  }
  ensureDir(join(BUILD, "res", "cd-overrides"));
  for (const f of readdirSync(CD_OVERRIDES_SRC)) {
    copyFileSync(join(CD_OVERRIDES_SRC, f), join(BUILD, "res", "cd-overrides", f));
    logv("res/cd-overrides/" + f);
  }

  // Neutral favicon.
  writeOut("res/favicon.svg", defaultFavicon());
  logv("res/favicon.svg");

  // Changelog (local HTML file, served at /res/changelog.html).
  copyFileSync(join(ROOT, "res", "changelog.html"), join(BUILD, "res", "changelog.html"));
  logv("res/changelog.html");

  // Locales: localized en-US/zh-CN/zh-TW; copy the other stubs verbatim.
  localizeStrings("en-US.json", EN_LOCALE);
  localizeStrings("zh-CN.json", ZH_CN_LOCALE);
  localizeStrings("zh-TW.json", ZH_TW_LOCALE);
  for (const f of readdirSync(join(VENDOR, "res", "locale"))) {
    if (!["en-US.json", "zh-CN.json", "zh-TW.json"].includes(f)) {
      copyVendor("res/locale/" + f);
      logv("res/locale/" + f + " (stub, copied)");
    }
  }

  // style.css: neutralize the loader logo/colors, append import-page styles.
  let css = readFileSync(join(VENDOR, "templates", "style.css"), "utf8");
  css = css.replace(/(#loader-logo\s*\{[^}]*?)background:[^;]+;/s, "$1background: none;");
  css = css.replace(/#3498db/gi, "#888888").replace(/#e74c3c/gi, "#888888").replace(/#f9c922/gi, "#aaaaaa");
  css += IMPORT_PAGE_CSS;
  css += FILE_EXPLORER_RA2_CSS;
  writeOut("style.css", css);
  logv("style.css (loader logo/colors neutralized)");

  // config.ini: our offline config (no telemetry, no CDN, archive URLs blank).
  // (server/config/config.ini already leaves gameResArchiveUrl empty -> one-click
  // button stays hidden; users import their own game data.)
  copyFileSync(SERVER_CFG, join(BUILD, "config.ini"));
  logv("config.ini (offline)");

  // Empty breaking-news.html.
  writeOut("breaking-news.html", "<!doctype html><html><body></body></html>\n");
  logv("breaking-news.html (empty)");

  // Fonts (Fira Sans OFL) and UI icons from vendor/res.
  const fontCount = copyTree(VENDOR, "res/fonts", join(BUILD, "res/fonts"));
  logv("res/fonts (" + fontCount + " files)");
  const imgCount = copyTree(VENDOR, "res/img", join(BUILD, "res/img"));
  logv("res/img (" + imgCount + " files)");
}

// ---- 6. Self-check -----------------------------------------------------------
function stepVerify() {
  log("[6/6] Verifying build");
  const checks = [
    ["chronodivide", /chronodivide/i],
    ["chrono divide", /chrono divide/i],
    ["0.82.0", /0\.82\.0/],
  ];
  let bad = 0;
  const walk = (d, rel) => {
    for (const e of readdirSync(d)) {
      const fp = join(d, e);
      const rp = (rel ? rel + "/" : "") + e;
      if (statSync(fp).isDirectory()) {
        walk(fp, rp);
        continue;
      }
      if (/\.(wasm|woff2?|mix|png|ico|csf|exe|gbf|prp|dat|bak)$/i.test(e)) continue;
      if (/\.map$/i.test(e)) continue;
      const content = readFileSync(fp, "utf8");
      for (const [label, re] of checks) {
        if (content.match(re)) {
          console.log("  TRACE '" + label + "' in " + rp);
          bad++;
        }
      }
    }
  };
  walk(BUILD, "");
  if (bad > 0) {
    console.log("\n  FAILED: " + bad + " trace(s) found in build/");
    process.exit(1);
  }
  log("  OK: build/ is clean.");
  const size = dirSize(BUILD);
  log("\nBuild complete: build/  (" + (size / 1024 / 1024).toFixed(1) + " MB)");
}

function dirSize(d) {
  let s = 0;
  const walk = (dd) => {
    for (const e of readdirSync(dd)) {
      const fp = join(dd, e);
      if (statSync(fp).isDirectory()) walk(fp);
      else s += statSync(fp).size;
    }
  };
  walk(d);
  return s;
}

// ---- locale string tables -------------------------------------------------
// Empty archive URLs in config.ini hide the one-click download button, so the
// import page shows only the folder/archive pickers. These strings make that page
// honest and clear about why game data must be supplied by the user.
const EN_LOCALE = {
  "ts:disclaimer":
    "DISCLAIMER:\nOpenYRWeb is a non-profit fan project and is in no way affiliated with Electronic Arts Inc.\nNo copyright infringement is intended. All rights are held by their respective owners.",
  "ts:gameres_locate_title": "Locate your Red Alert 2 game files",
  "ts:gameres_import_desc":
    "This project does not distribute copyrighted game data, so there is no automatic download.\n\nProvide your own copy of the game: click \"Browse for folder\" and select an installed Red Alert 2 / Yuri's Revenge folder, or click \"Browse for archive\" and choose a .zip/.7z/.rar that contains the six .mix files.",
  "ts:gameres_oneclick_desc":
    "Don't have the files handy? Download both Red Alert 2 and Yuri's Revenge installers and the required .mix files will be extracted automatically. (Uses your own legitimately obtained copies.)",
  "ts:gameres_oneclick_button": "One-click download & extract",
  "gui:importmodunsupportedwarn":
    "The mod you are trying to install may not be fully compatible with this engine. You may still install it, but it may not work correctly. Proceed at your own risk!",
  "ts:donateprompt": "",
  "ts:donatenow": "",
  "ts:donatelater": "",
  "ts:donate": "",
  "ts:reportbugtt": "Report any bugs to the project maintainers",
  "ts:reportbugdesc": "You can submit a bug report by following the link below:",
  "gui:demo": "Skirmish",
  "stt:demo": "Play a singleplayer skirmish against computer opponents",
  "gui:custommatch": "Multiplayer Lobby",
  "ts:multilobbytip": "Enter the multiplayer game lobby",
  "ts:multilobbymsg": "The multiplayer lobby is coming soon.\nOnline play is not yet supported.",
  "GUI:ClearGameData": "Clear All Data",
  "TS:ConfirmClearGameData": "Are you sure you want to clear all game data?\n\nThis will delete ALL imported game files and you will need to re-import your RA2 / YR game files to play again.\n\nReplays, mods, maps, and cached data will also be removed.",
  "TS:GameDataCleared": "Game data cleared. Reloading...",
  "TS:ClearGameDataFailed": "Failed to clear game data. Please try again.",
};
const ZH_CN_LOCALE = {
  "ts:disclaimer":
    "免责声明：\nOpenYRWeb 是一个非营利的粉丝项目，与电子艺界公司无任何关联。\n不意图侵犯版权。所有权利归各自所有者所有。",
  "ts:gameres_locate_title": "请定位你的红警2游戏文件",
  "ts:gameres_import_desc":
    "本项目不分发受版权保护的游戏数据，因此无法自动下载。\n\n请提供你自己的正版游戏：点击「浏览文件夹」选择已安装的红警2/尤里的复仇目录；或点击「浏览压缩包」选择包含六个 .mix 文件的 .zip/.7z/.rar 压缩包。",
  "ts:gameres_oneclick_desc":
    "手头没有游戏文件？可一键下载红警2与尤里的复仇安装程序，所需的 .mix 文件将自动解压。（使用你合法获得的正版。）",
  "ts:gameres_oneclick_button": "一键下载并解压",
  "gui:importmodunsupportedwarn": "您尝试安装的 Mod 可能与本引擎不完全兼容。仍可安装，但可能无法正常工作，风险自负！",
  "ts:donateprompt": "",
  "ts:donatenow": "",
  "ts:donatelater": "",
  "ts:donate": "",
  "ts:reportbugtt": "请向项目维护者报告您发现的任何错误",
  "ts:reportbugdesc": "您可以通过以下链接提交错误报告：",
  "gui:demo": "遭遇战",
  "stt:demo": "与电脑对手进行单人遭遇战",
  "gui:custommatch": "多人大厅",
  "ts:multilobbytip": "进入多人连线游戏大厅",
  "ts:multilobbymsg": "多人大厅功能敬请期待。\n目前暂不支援连线对战。",
  "GUI:ClearGameData": "清除所有数据",
  "TS:ConfirmClearGameData": "确定要清除所有游戏数据吗？\n\n这将删除所有已导入的游戏文件，您需要重新导入 RA2 / YR 游戏文件才能继续游玩。\n\n录像、模组、地图和缓存数据也将被删除。",
  "TS:GameDataCleared": "游戏数据已清除，正在重新加载……",
  "TS:ClearGameDataFailed": "清除游戏数据失败，请重试。",
};
const ZH_TW_LOCALE = {
  "ts:disclaimer":
    "免責聲明：\nOpenYRWeb 是一個非營利的粉絲項目，與電子藝界公司無任何關聯。\n不意圖侵犯版權。所有權利歸各自所有者所有。",
  "ts:gameres_locate_title": "請定位您的紅警2遊戲檔案",
  "ts:gameres_import_desc":
    "本專案不分發受版權保護的遊戲資料，因此無法自動下載。\n\n請提供您自己的正版遊戲：點擊「瀏覽資料夾」選擇已安裝的紅警2/尤里的復仇目錄；或點擊「瀏覽壓縮檔」選擇包含六個 .mix 檔案的 .zip/.7z/.rar 壓縮檔。",
  "ts:gameres_oneclick_desc":
    "手邊沒有遊戲檔案？可一鍵下載紅警2與尤里的復仇安裝程式，所需的 .mix 檔案將自動解壓。（使用您合法取得的正版。）",
  "ts:gameres_oneclick_button": "一鍵下載並解壓",
  "gui:importmodunsupportedwarn": "您嘗試安裝的模組可能與本引擎不完全相容。仍可安裝，但可能無法正常運作，風險自負！",
  "ts:donateprompt": "",
  "ts:donatenow": "",
  "ts:donatelater": "",
  "ts:donate": "",
  "ts:reportbugtt": "請向專案維護者回報您發現的任何錯誤",
  "ts:reportbugdesc": "您可以透過以下連結提交錯誤報告：",
  "gui:demo": "遭遇戰",
  "stt:demo": "與電腦對手進行單人遭遇戰",
  "gui:custommatch": "多人大廳",
  "ts:multilobbytip": "進入多人連線遊戲大廳",
  "ts:multilobbymsg": "多人大廳功能敬請期待。\n目前暫不支援連線對戰。",
  "GUI:ClearGameData": "清除所有資料",
  "TS:ConfirmClearGameData": "確定要清除所有遊戲資料嗎？\n\n這將刪除所有已匯入的遊戲檔案，您需要重新匯入 RA2 / YR 遊戲檔案才能繼續遊玩。\n\n錄影、模組、地圖和快取資料也將被刪除。",
  "TS:GameDataCleared": "遊戲資料已清除，正在重新載入……",
  "TS:ClearGameDataFailed": "清除遊戲資料失敗，請重試。",
};
function localizeStrings(file, table) {
  const obj = JSON.parse(readFileSync(join(VENDOR, "res", "locale", file), "utf8"));
  let n = 0;
  for (const k of Object.keys(table)) {
    obj[k] = table[k];
    n++;
  }
  writeOut("res/locale/" + file, JSON.stringify(obj, null, 4));
  logv("res/locale/" + file + " (" + n + " keys set)");
}

// RA2-themed overrides for the file-explorer widget (Storage screen).
// Matches the game's dark military UI: black backgrounds, yellow text, red borders.
const FILE_EXPLORER_RA2_CSS = `
#ra2web-root .fe_fileexplorer_wrap,
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_inner_wrap {
  background: transparent !important;
  border: 1px solid #800 !important;
  color: #ff0 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_inner_wrap.fe_fileexplorer_inner_wrap_focused {
  border-color: #c00 !important;
}
/* Kill white borders in the top toolbar area */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_path_wrap {
  border: 1px solid #800 !important;
}
/* Path segments hover/focus — no blue */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_path_segment_wrap:hover,
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_path_segment_wrap:focus,
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_path_segment_wrap.fe_fileexplorer_path_segment_wrap_focus {
  background: #480000 !important;
  border-color: #800 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_folder_tools_scroll_wrap {
  border-right: 1px solid #800 !important;
}
#ra2web-root .fe_fileexplorer_wrap button,
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_toolbar button {
  color: #ff0 !important;
  border-radius: 0 !important;
  font-family: 'Fira Sans Condensed', Arial, sans-serif !important;
  font-size: 13px !important;
}
/* Sprite nav buttons: keep transparent bg so sprite shows */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_navtools button {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_navtools button:hover,
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_navtools button:focus {
  background: transparent !important;
  border: none !important;
}
/* Folder tools sidebar buttons — dark bg, red border */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_folder_tools button {
  background: #222 !important;
  border: 1px solid #800 !important;
  margin-bottom: 0.3em !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_folder_tools button:hover,
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_folder_tools button:focus {
  background: #480000 !important;
  border-color: #c00 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_toolbar {
  background: transparent !important;
  border-bottom: 1px solid #800 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_view {
  background: transparent !important;
  color: #ff0 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_view .fe_fileexplorer_selected {
  background: #480000 !important;
  color: #ff0 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_view .fe_fileexplorer_hover {
  background: #333 !important;
}
/* Status bar */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_statusbar_wrap {
  color: #aa0 !important;
  font-size: 0.75em !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_statusbar_text_segment_wrap {
  border-right-color: #800 !important;
}
/* Action progress area */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_action_wrap {
  color: #ff0 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_action_progress_cancel_wrap::after {
  color: #c00 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_action_progress_cancel_wrap:hover::after,
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_action_progress_cancel_wrap:focus::after {
  color: #ff0000 !important;
}
#ra2web-root .fe_fileexplorer_wrap input,
#ra2web-root .fe_fileexplorer_wrap select {
  background: rgba(0,0,0,0.5) !important;
  border: 1px solid #800 !important;
  color: #ff0 !important;
  border-radius: 0 !important;
  font-family: 'Fira Sans Condensed', Arial, sans-serif !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_context_menu {
  background: rgba(0,0,0,0.9) !important;
  border: 1px solid #c00 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_context_menu .fe_fileexplorer_context_menu_item:hover {
  background: #480000 !important;
}
/* Dropdown/popup menus */
#ra2web-root .fe_fileexplorer_popup_wrap {
  background: rgba(10,0,0,0.95) !important;
  border: 1px solid #800 !important;
  color: #ff0 !important;
}
#ra2web-root .fe_fileexplorer_popup_wrap .fe_fileexplorer_popup_item_wrap {
  color: #ff0 !important;
}
#ra2web-root .fe_fileexplorer_popup_wrap .fe_fileexplorer_popup_item_wrap:focus {
  background-color: #480000 !important;
}
#ra2web-root .fe_fileexplorer_popup_wrap .fe_fileexplorer_popup_item_split {
  border-top-color: #800 !important;
}
#ra2web-root .fe_fileexplorer_popup_wrap .fe_fileexplorer_popup_item_text {
  color: #ff0 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_popup_item_wrap.fe_fileexplorer_popup_item_disabled .fe_fileexplorer_popup_item_text {
  color: #666 !important;
}
/* File item hover */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_item_wrap_inner:hover {
  background-color: #480000 !important;
  border-color: #800 !important;
}
/* File item selected (not focused) */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_inner_wrap:not(.fe_fileexplorer_inner_wrap_focused) .fe_fileexplorer_item_selected .fe_fileexplorer_item_wrap_inner {
  background-color: #300 !important;
  border-color: #600 !important;
}
/* File item selected (focused) */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_inner_wrap.fe_fileexplorer_inner_wrap_focused .fe_fileexplorer_items_wrap.fe_fileexplorer_items_focus .fe_fileexplorer_item_selected .fe_fileexplorer_item_wrap_inner {
  background-color: #480000 !important;
  border-color: #c00 !important;
}
/* File item selected + hover */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_inner_wrap.fe_fileexplorer_inner_wrap_focused .fe_fileexplorer_items_wrap.fe_fileexplorer_items_focus .fe_fileexplorer_item_selected .fe_fileexplorer_item_wrap_inner:hover {
  border-color: #c00 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_inner_wrap:not(.fe_fileexplorer_inner_wrap_focused) .fe_fileexplorer_item_selected .fe_fileexplorer_item_wrap_inner:hover {
  background-color: #480000 !important;
  border-color: #800 !important;
}
/* Drag hover */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_inner_wrap .fe_fileexplorer_items_wrap .fe_fileexplorer_item_wrap.fe_fileexplorer_drag_hover .fe_fileexplorer_item_wrap_inner {
  background-color: #480000 !important;
  border-color: #c00 !important;
}
/* Item focused */
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_inner_wrap.fe_fileexplorer_inner_wrap_focused .fe_fileexplorer_items_wrap.fe_fileexplorer_items_focus .fe_fileexplorer_item_focused .fe_fileexplorer_item_wrap_inner {
  border-color: #c00 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_breadcrumbs {
  background: transparent !important;
  border-bottom: 1px solid #800 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_breadcrumbs .fe_fileexplorer_breadcrumb_hover {
  background: #480000 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_view .fe_fileexplorer_column_header {
  background: transparent !important;
  border-bottom: 1px solid #c00 !important;
  color: #c00 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_progress_wrap {
  background: rgba(0,0,0,0.7) !important;
  border: 1px solid #800 !important;
}
#ra2web-root .fe_fileexplorer_wrap .fe_fileexplorer_progress_wrap .fe_fileexplorer_progress_bar {
  background: #800 !important;
}
`;

// Polished, readable import-page styles (replaces the old one-click layout).
const IMPORT_PAGE_CSS = `
#ra2web-root .game-res-box .browse-container { margin: 16px 0; padding: 18px 20px; background: rgba(40,60,90,0.35); border: 1px solid rgba(120,160,210,0.35); border-radius: 8px; }
#ra2web-root .game-res-box .browse-container.dropzone-active { border-color: #5a9be0; background: rgba(70,130,200,0.30); }
#ra2web-root .game-res-box .browse-container .desc { margin: 0 0 14px; line-height: 1.55; font-size: 1.0em; color: #d6e2f0; white-space: pre-line; }
#ra2web-root .game-res-box .browse-buttons { margin: 0; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
#ra2web-root .game-res-box .dialog-button { background: #2c4a6e; color: #e8eef6; font-weight: 600; padding: 10px 18px; font-size: 1.0em; border: 1px solid rgba(120,160,210,0.5); border-radius: 5px; cursor: pointer; }
#ra2web-root .game-res-box .dialog-button:hover:not(:disabled) { background: #3a6da0; border-color: #6aa0d8; }
#ra2web-root .game-res-box .archive-formats { margin: 14px 0 0; opacity: 0.65; text-align: center; }
`;

function defaultFavicon() {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#1a1a1a"/><polygon points="16,3 19.5,12.5 29.5,12.5 21.5,18.5 24.5,28 16,22 7.5,28 10.5,18.5 2.5,12.5 12.5,12.5" fill="#c0392b"/></svg>\n';
}

// ---- main --------------------------------------------------------------------
function main() {
  if (!existsSync(join(SRC, "_module-map.json"))) {
    console.error("src/_module-map.json missing.");
    process.exit(1);
  }
  if (!existsSync(VENDOR)) {
    console.error("vendor/ missing. Run `npm install && npm run build:vendor` first.");
    process.exit(1);
  }
  log("Building client -> build/");
  rmSync(BUILD, { recursive: true, force: true });
  ensureDir(BUILD);
  stepRepack();
  stepVendor();
  stepIndex();
  stepAssets();
  stepVerify();
}
main();
