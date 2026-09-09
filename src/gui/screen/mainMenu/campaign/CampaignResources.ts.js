// === OpenYRWeb: 离线战役资源门 (CampaignResources) ===
// 适配临时源码的 CampaignResources 接口，但不做 CDN manifest 下载：
//   - inspect(): 检测本地 VFS 是否已包含战役地图（maps01/maps02/mapsmd03 等 MIX 内的 .map）
//   - install(): 离线模式下无法自动下载，由 CampaignScreen 引导用户去“存储”页导入 Mix
//   - isReady:   本地战役地图是否齐全
//   - loadCampaignList(): 从 battlemd.ini（与 rulesmd.ini 同目录的松散 INI，经 loadStandaloneFiles
//                         挂入 VFS）读取尤里复仇战役列表 [Battles] 及每个战役的 Scenario/Description。
// deps: ["data/IniFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/campaign/CampaignResources", ["data/IniFile"], function (e, t) {
  "use strict";
  var IniFileModule;
  t && t.id;
  return {
    setters: [
      function (e) {
        IniFileModule = e;
      },
    ],
    execute: function () {
      var campaignMapNames = [
        "trn01t.map", "trn02t.map",
        "all01t.map", "all02s.map", "all03u.map", "all04u.map", "all05s.map",
        "all06u.map", "all07t.map", "all08u.map", "all09t.map", "all10s.map",
        "all11t.map", "all12s.map",
        "sov01t.map", "sov02t.map", "sov03u.map", "sov04s.map", "sov05u.map",
        "sov06t.map", "sov07s.map", "sov08u.map", "sov09u.map", "sov10t.map",
        "sov11s.map", "sov12s.map",
      ];
      e(
        "CampaignResources",
        (class {
          constructor(e) {
            this.vfs = e;
            this.objectUrls = new Map();
          }
          get isReady() {
            return !!this.vfs && this.getCampaignMapNames().every((f) => this.vfs.fileExists(f));
          }
          // 需要检查的战役地图 = 内置常见战役图 ∪ battlemd.ini 里引用的 Scenario 图。
          getCampaignMapNames() {
            var names = campaignMapNames.slice();
            try {
              var list = this.loadCampaignList();
              for (var c of list) {
                var m = String(c.scenario).trim().toLowerCase();
                if (m && names.indexOf(m) < 0) names.push(m);
              }
            } catch (e) {}
            return names;
          }
          getMissingFiles() {
            if (!this.vfs) return this.getCampaignMapNames();
            return this.getCampaignMapNames().filter((f) => !this.vfs.fileExists(f));
          }
          async inspect() {
            return {
              state: this.isReady ? "ready" : "download-required",
              releaseId: "offline-local",
              totalBytes: 0,
              modOverride: void 0,
            };
          }
          async install() {
            // 离线适配版不自动下载；UI 会引导用户去存储页导入 Mix 文件。
            throw new Error("OFFLINE_CAMPAIGN_RESOURCES");
          }
          // 读取尤里复仇战役列表（battlemd.ini，与 rulesmd.ini 同位置）。
          // 返回 [{ key, scenario, description, finalMovie }]，按 [Battles] 中顺序排列；
          // battlemd.ini 缺失或未定义任何战役时返回空数组。
          loadCampaignList() {
            if (!this.vfs || !this.vfs.fileExists("battlemd.ini")) return [];
            var ini;
            try {
              ini = new IniFileModule.IniFile(this.vfs.openFile("battlemd.ini"));
            } catch (e) {
              console.warn("[OpenYRWeb] Unable to parse battlemd.ini", e);
              return [];
            }
            var battles = ini.getSection("Battles");
            if (!battles) return [];
            // [Battles] 条目形如 1=ALL1 / 0=ALL1，键是数字，按数字升序收集战役 key。
            var keys = [];
            battles.entries.forEach(function (v, k) {
              var n = parseInt(k, 10);
              keys.push({ n: isNaN(n) ? Number.MAX_SAFE_INTEGER : n, v: String(v).trim(), k: k });
            });
            keys.sort(function (a, b) {
              return a.n - b.n;
            });
            var out = [];
            for (var it of keys) {
              var key = it.v;
              if (!key) continue;
              var sec = ini.getSection(key);
              if (!sec) continue;
              var scenario = sec.getString("Scenario").trim();
              // 原版 battlemd 里被注释掉的入口（Scenario= 为空）跳过。
              if (!scenario) continue;
              out.push({
                key: key,
                scenario: scenario,
                description: sec.getString("Description").trim(),
                finalMovie: sec.getString("FinalMovie").trim(),
              });
            }
            return out;
          }
          dispose() {
            for (var url of this.objectUrls.values()) URL.revokeObjectURL(url);
            this.objectUrls.clear();
          }
        }),
      );
    },
  };
});
