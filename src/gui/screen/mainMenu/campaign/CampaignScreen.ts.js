// === Reconstructed SystemJS module: gui/screen/mainMenu/campaign/CampaignScreen ===
// deps: ["gui/screen/mainMenu/ScreenType","engine/sound/Music","gui/screen/mainMenu/MainMenuScreen","gui/screen/mainMenu/MainMenuRoute","engine/MapDigest","react","gui/jsx/jsx","gui/jsx/HtmlView"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// Campaign screen — side selection, difficulty, mission list, and game startup.

System.register(
  "gui/screen/mainMenu/campaign/CampaignScreen",
  [
    "gui/screen/mainMenu/ScreenType",
    "engine/sound/Music",
    "gui/screen/mainMenu/MainMenuScreen",
    "gui/screen/mainMenu/MainMenuRoute",
    "engine/MapDigest",
    "react",
    "gui/jsx/jsx",
    "gui/jsx/HtmlView",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, u, c, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
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
          u = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        // Campaign side labels (used as button fallback names; mission names come from
        // battlemd.ini Description / the map's Name: csf key).
        var sideLabels = {
          allied: { key: "GUI:AlliedCampaign", label: "盟军战役" },
          soviet: { key: "GUI:SovietCampaign", label: "苏军战役" },
          training: { key: "GUI:TutorialCampaign", label: "新兵训练营" },
          yuri: { key: "GUI:YuriCampaign", label: "尤里战役" },
        };
        var difficultyLabels = {
          easy: { key: "TXT_EASY", label: "简单" },
          medium: { key: "TXT_MEDIUM", label: "中等" },
          hard: { key: "TXT_HARD", label: "困难" },
        };
        var difficultyValues = ["easy", "medium", "hard"];

        // 由 battlemd.ini 的战役 key 推断阵营（ALL*=盟军、SOV*=苏军、TRN/TUT*=训练、YUR*=尤里）。
        // 尤里复仇原版 battlemd.ini 的 [Battles] 只有 ALL1/SOV1/TUT1，没有尤里战役按钮。
        var sideOfKey = function (key) {
          var k = String(key || "").toUpperCase();
          if (k.indexOf("TUT") === 0 || k.indexOf("TRN") === 0) return "training";
          if (k.indexOf("ALL") === 0) return "allied";
          if (k.indexOf("SOV") === 0) return "soviet";
          if (k.indexOf("YUR") === 0) return "yuri";
          return "allied";
        };

        // 把 battlemd.ini 解析出的战役描述转换为关卡对象（按阵营分组、组内编号）。
        var buildMissions = function (campaigns) {
          var bySide = new Map();
          campaigns.forEach(function (c) {
            var side = sideOfKey(c.key);
            bySide.has(side) || bySide.set(side, []);
            bySide.get(side).push(c);
          });
          var out = [];
          bySide.forEach(function (list, side) {
            list.forEach(function (c, idx) {
              var scenario = String(c.scenario || "").trim();
              var mapName = scenario.toLowerCase();
              var prefix = mapName.slice(0, 5).toUpperCase();
              out.push({
                id: side + "-" + String(idx + 1).padStart(2, "0"),
                campaignKey: c.key,
                sourceName: scenario,
                mapName: mapName,
                side: side,
                order: idx + 1,
                description: c.description,
                uiNameKey: "Name:" + prefix,
                briefingKey: "training" === side ? void 0 : "Brief:" + prefix,
                loadMessageKey: "LoadMsg:" + prefix,
                loadBriefingKey: "training" === side ? void 0 : "LoadBrief:" + prefix,
                loadingImage: void 0,
              });
            });
          });
          return out;
        };

        var getFirstMissionBySide = function (side, missions) {
          var m = missions.find(function (m) { return m.side === side; });
          if (!m) throw new Error('Campaign side "' + side + '" has no missions');
          return m;
        };

        var getOrderedSides = function (missions) {
          var seen = [];
          missions.forEach(function (m) { if (seen.indexOf(m.side) < 0) seen.push(m.side); });
          return seen;
        };

        // React wrapper: mounts imperative DOM built by props.build into the HtmlView.
        var CampaignContent = function (props) {
          return o.default.createElement("div", {
            ref: function (el) {
              if (el) {
                el.textContent = "";
                props.build && props.build(el);
              }
            },
            style: { width: "100%", height: "100%" },
          });
        };

        // CampaignScreen class
        ((l = class extends s.MainMenuScreen {
          constructor(e, t, i, h, v, b) {
            (super(),
              (this.rootController = e),
              (this.strings = t),
              (this.jsxRenderer = i),
              (this.mapFileLoader = h),
              (this.errorHandler = v),
              (this.campaignResources = b),
              (this.title = this.strings.get("GUI:Campaign")),
              (this.musicType = r.MusicType.Intro),
              (this.starting = !1),
              (this.campaignDifficulty = "easy"),
              (this.showingMissionList = !1),
              (this.mainView = void 0),
              // 离线资源门状态：checking / prompt / downloading / error
              (this.resourceState = "checking"),
              (this.resourcesReady = !1),
              (this.resourceProgress = 0),
              (this.resourceError = void 0),
              (this.pendingDirectMission = void 0),
              // battlemd.ini 驱动的战役关卡列表
              (this.campaigns = []),
              (this.campaignsLoaded = !1),
              (this.enterGeneration = 0));
          }
          onEnter(e) {
            let gen = ++this.enterGeneration;
            this.starting = !1;
            // URL 直达：?campaignMissionList=1&campaignMission=allied-01&campaignDifficulty=hard
            let q = new URLSearchParams(globalThis.location?.search ?? "");
            this.showingMissionList = q.has("campaignMissionList");
            this.pendingDirectMission = e?.startMissionId || q.get("campaignMission") || void 0;
            if (e?.campaignDifficulty && ["easy", "medium", "hard"].includes(e.campaignDifficulty))
              this.campaignDifficulty = e.campaignDifficulty;
            this.resourceState = "checking";
            this.resourcesReady = !1;
            this.resourceProgress = 0;
            this.resourceError = void 0;
            this.renderResourceGate();
            this.updateSidebarButtons();
            this.controller.toggleMainVideo(!1);
            this.controller.showSidebarButtons();
            this.checkCampaignResources(gen);
            this.loadCampaignList(gen);
          }
          async checkCampaignResources(e = this.enterGeneration) {
            if (!this.campaignResources) {
              this.showReadyCampaign();
              return;
            }
            try {
              var s = await this.campaignResources.inspect();
              if (e !== this.enterGeneration) return;
              if (s.state === "ready") this.showReadyCampaign();
              else {
                this.resourceState = "prompt";
                this.renderResourceGate();
                this.updateSidebarButtons();
              }
            } catch (s) {
              if (e !== this.enterGeneration) return;
              this.showResourceError(s);
            }
          }
          async loadCampaignList(e = this.enterGeneration) {
            // 从 battlemd.ini（与 rulesmd.ini 同位置，经 loadStandaloneFiles 挂入 VFS）读取战役列表。
            var list = this.campaignResources ? this.campaignResources.loadCampaignList() : [];
            this.campaigns = buildMissions(list);
            this.campaignsLoaded = !0;
            if (e !== this.enterGeneration) return;
            this.renderCurrentPage();
            this.updateSidebarButtons();
            this.resolveDirectMission();
          }
          resolveDirectMission() {
            // 直达任务（URL ?campaignMission= 或上一屏传递）需要资源与战役列表都已就绪。
            if (!this.resourcesReady || !this.campaignsLoaded) return;
            var e = this.pendingDirectMission;
            if (!e) return;
            this.pendingDirectMission = void 0;
            var m = this.campaigns.find((m) => m.id === e);
            if (m) this.startMission(m, this.campaignDifficulty);
            else console.warn(`Campaign mission "${e}" not found in mission list.`);
          }
          installCampaignResources() {
            // 离线适配版：没有 CDN 下载，引导用户去“存储”页导入战役 Mix 文件。
            this.controller?.goToScreen(i.ScreenType.OptionsStorage);
          }
          cancelCampaignDownload() {
            this.resourceState = "prompt";
            this.resourceProgress = 0;
            this.renderResourceGate();
            this.updateSidebarButtons();
          }
          showResourceError(e) {
            console.error("Unable to load campaign resources", e);
            this.resourceState = "error";
            this.resourceError = e instanceof Error ? e.message : String(e);
            this.renderResourceGate();
            this.updateSidebarButtons();
          }
          showReadyCampaign() {
            this.resourcesReady = !0;
            this.resourceState = "ready";
            this.renderCurrentPage();
            this.updateSidebarButtons();
            this.resolveDirectMission();
          }
          renderResourceGate() {
            var self = this;
            var build = function (container) {
              container.className = "campaign-resource-gate " + self.resourceState;
              container.setAttribute("data-testid", "campaign-resource-gate");
              container.setAttribute("data-state", self.resourceState);

              var title = document.createElement("h2");
              title.textContent = self.getString("GUI:CampaignResourceTitle", "战役资源");
              container.appendChild(title);

              if ("checking" === self.resourceState) {
                var p = document.createElement("p");
                p.textContent = self.getString("GUI:CampaignResourceChecking", "正在检查战役资源...");
                container.appendChild(p);
              } else if ("prompt" === self.resourceState) {
                var p2 = document.createElement("p");
                p2.textContent = self.getString(
                  "GUI:CampaignResourcePrompt",
                  "未检测到战役地图。请先通过“存储”导入包含战役地图的 Mix 文件（maps01.mix / maps02.mix / mapsmd03.mix）。",
                );
                container.appendChild(p2);
                var actions = document.createElement("div");
                actions.className = "campaign-resource-actions";
                var installBtn = document.createElement("button");
                installBtn.type = "button";
                installBtn.setAttribute("data-testid", "campaign-resource-install");
                installBtn.textContent = self.getString("GUI:CampaignResourceInstall", "导入战役 Mix");
                installBtn.onclick = function () {
                  self.installCampaignResources();
                };
                actions.appendChild(installBtn);
                var backBtn = document.createElement("button");
                backBtn.type = "button";
                backBtn.setAttribute("data-testid", "campaign-resource-back");
                backBtn.textContent = self.getString("GUI:Back", "返回");
                backBtn.onclick = function () {
                  self.controller?.goToScreen(i.ScreenType.SinglePlayer);
                };
                actions.appendChild(backBtn);
                container.appendChild(actions);
              } else if ("error" === self.resourceState) {
                var p3 = document.createElement("p");
                p3.setAttribute("role", "alert");
                p3.textContent = self.resourceError || self.getString("GUI:CampaignResourceError", "战役资源加载失败。");
                container.appendChild(p3);
                var actions2 = document.createElement("div");
                actions2.className = "campaign-resource-actions";
                var retryBtn = document.createElement("button");
                retryBtn.type = "button";
                retryBtn.setAttribute("data-testid", "campaign-resource-retry");
                retryBtn.textContent = self.getString("GUI:CampaignResourceRetry", "重试");
                retryBtn.onclick = function () {
                  self.resourceState = "checking";
                  self.resourceError = void 0;
                  self.renderResourceGate();
                  self.checkCampaignResources(self.enterGeneration);
                };
                actions2.appendChild(retryBtn);
                var backBtn2 = document.createElement("button");
                backBtn2.type = "button";
                backBtn2.setAttribute("data-testid", "campaign-resource-back");
                backBtn2.textContent = self.getString("GUI:Back", "返回");
                backBtn2.onclick = function () {
                  self.controller?.goToScreen(i.ScreenType.SinglePlayer);
                };
                actions2.appendChild(backBtn2);
                container.appendChild(actions2);
              }
            };
            var [view] = this.jsxRenderer.render(
              u.jsx(c.HtmlView, {
                width: "100%",
                height: "100%",
                component: CampaignContent,
                props: { build: build },
              }),
            );
            this.mainView = view;
            this.controller.setMainComponent(view);
          }
          renderCurrentPage() {
            if (!this.resourcesReady) {
              this.renderResourceGate();
            } else if (this.showingMissionList) {
              this.renderMissionList();
            } else {
              this.renderSideSelection();
            }
          }
          renderSideSelection() {
            var self = this;
            var build = function (container) {
              container.className = "campaign-select";
              container.setAttribute("data-testid", "campaign-select");

              var title = document.createElement("h2");
              title.textContent = self.getString("GUI:Campaign", "战役");
              container.appendChild(title);

              var sideList = document.createElement("div");
              sideList.className = "campaign-choice-list";
              sideList.setAttribute("role", "list");

              var sides = getOrderedSides(self.campaigns);
              if (!sides.length) {
                var empty = document.createElement("p");
                empty.className = "campaign-empty";
                empty.textContent = self.getString("GUI:CampaignResourcePrompt", "未读取到 battlemd.ini 战役配置。");
                sideList.appendChild(empty);
              }
              sides.forEach(function (side) {
                var btn = document.createElement("button");
                btn.className = "campaign-choice " + side;
                btn.type = "button";
                btn.setAttribute("data-testid", "campaign-choice-" + side);
                var lbl = sideLabels[side] || sideLabels.allied;
                btn.textContent = self.getString(lbl.key, lbl.label);
                btn.onclick = function () {
                  self.startMission(getFirstMissionBySide(side, self.campaigns), self.campaignDifficulty);
                };
                sideList.appendChild(btn);
              });
              container.appendChild(sideList);

              // Difficulty selector
              var diffContainer = document.createElement("div");
              diffContainer.className = "campaign-difficulty";
              diffContainer.setAttribute("data-testid", "campaign-difficulty");

              var diffLabel = document.createElement("span");
              diffLabel.textContent = self.getString("GUI:Difficulty", "难度");
              diffContainer.appendChild(diffLabel);

              var diffValue = document.createElement("strong");
              diffValue.setAttribute("data-testid", "campaign-difficulty-label");
              diffValue.textContent = self.getString(
                difficultyLabels[self.campaignDifficulty].key,
                difficultyLabels[self.campaignDifficulty].label
              );
              diffContainer.appendChild(diffValue);

              var diffInput = document.createElement("input");
              diffInput.type = "range";
              diffInput.min = 0;
              diffInput.max = 2;
              diffInput.step = 1;
              diffInput.value = difficultyValues.indexOf(self.campaignDifficulty);
              diffInput.setAttribute("aria-label", self.getString("GUI:Difficulty", "难度"));
              diffInput.setAttribute("data-testid", "campaign-difficulty-input");
              diffInput.onchange = function (e) {
                self.campaignDifficulty = difficultyValues[Number(e.currentTarget.value)] || "easy";
                diffValue.textContent = self.getString(
                  difficultyLabels[self.campaignDifficulty].key,
                  difficultyLabels[self.campaignDifficulty].label
                );
              };
              diffContainer.appendChild(diffInput);
              container.appendChild(diffContainer);
            };
            var [view] = this.jsxRenderer.render(
              u.jsx(c.HtmlView, {
                width: "100%",
                height: "100%",
                component: CampaignContent,
                props: { build: build },
              }),
            );
            this.mainView = view;
            this.controller.setMainComponent(view);
          }
          renderMissionList() {
            var self = this;
            var build = function (container) {
              container.className = "campaign-mission-index";
              container.setAttribute("data-testid", "campaign-mission-index");

              var header = document.createElement("header");
              var title = document.createElement("strong");
              title.textContent = self.getString("GUI:CampaignMissionList", "全部战役关卡");
              header.appendChild(title);

              var diffSelect = document.createElement("label");
              diffSelect.textContent = self.getString("GUI:Difficulty", "难度");
              var select = document.createElement("select");
              select.setAttribute("data-testid", "campaign-mission-index-difficulty");
              select.onchange = function (e) {
                self.campaignDifficulty = e.currentTarget.value;
              };
              difficultyValues.forEach(function (d) {
                var opt = document.createElement("option");
                opt.value = d;
                opt.textContent = self.getString(difficultyLabels[d].key, difficultyLabels[d].label);
                if (d === self.campaignDifficulty) opt.selected = true;
                select.appendChild(opt);
              });
              diffSelect.appendChild(select);
              header.appendChild(diffSelect);
              container.appendChild(header);

              var columns = document.createElement("div");
              columns.className = "campaign-mission-index-columns";

              var sides = getOrderedSides(self.campaigns);
              if (!sides.length) {
                var empty = document.createElement("p");
                empty.className = "campaign-empty";
                empty.textContent = self.getString("GUI:CampaignResourcePrompt", "未读取到 battlemd.ini 战役配置。");
                columns.appendChild(empty);
              }
              sides.forEach(function (side) {
                var section = document.createElement("section");
                section.className = side;
                var h2 = document.createElement("h2");
                var lbl = sideLabels[side] || sideLabels.allied;
                h2.textContent = self.getString(lbl.key, lbl.label);
                section.appendChild(h2);

                self.campaigns
                  .filter(function (m) { return m.side === side; })
                  .forEach(function (mission) {
                    var btn = document.createElement("button");
                    btn.type = "button";
                    btn.setAttribute("data-testid", "campaign-mission-" + mission.id);
                    btn.disabled = self.starting;
                    var orderSpan = document.createElement("span");
                    orderSpan.textContent = String(mission.order).padStart(2, "0");
                    btn.appendChild(orderSpan);
                    var nameSpan = document.createElement("strong");
                    nameSpan.textContent = self.resolveMissionName(mission);
                    btn.appendChild(nameSpan);
                    btn.onclick = function () {
                      self.startMission(mission, self.campaignDifficulty);
                    };
                    section.appendChild(btn);
                  });

                columns.appendChild(section);
              });
              container.appendChild(columns);
            };
            var [view] = this.jsxRenderer.render(
              u.jsx(c.HtmlView, {
                width: "100%",
                height: "100%",
                component: CampaignContent,
                props: { build: build },
              }),
            );
            this.mainView = view;
            this.controller.setMainComponent(view);
          }
          // 解析关卡显示名：优先 battlemd.ini 的 Description（多为 csf 键，如 NAME:ALL01MDSAV），
          // 其次地图的 Name: 键（如 Name:ALL01），最后兜底地图文件名。
          resolveMissionName(e) {
            var d = e.description;
            if (d) {
              var v = this.strings.get(d);
              if (v && v !== d) return v;
            }
            var n = this.getString(e.uiNameKey, "");
            return n || e.sourceName;
          }
          updateSidebarButtons() {
            var buttons = [];
            if (this.resourcesReady)
              buttons.push({
                label: this.getString(
                  this.showingMissionList ? "GUI:CampaignSelector" : "GUI:CampaignMissionList",
                  this.showingMissionList ? "战役选择" : "全部关卡"
                ),
                onClick: function () {
                  this.showingMissionList = !this.showingMissionList;
                  this.renderCurrentPage();
                  this.updateSidebarButtons();
                }.bind(this),
              });
            buttons.push({
              label: this.strings.get("GUI:Back"),
              isBottom: !0,
              onClick: function () {
                this.controller?.goToScreen(i.ScreenType.SinglePlayer);
              }.bind(this),
            });
            this.controller.setSidebarButtons(buttons);
          }
          async startMission(e, t) {
            if (this.starting) return;
            if (!this.resourcesReady) {
              console.warn("Campaign resources are not ready — cannot start mission " + e.id);
              return;
            }
            this.starting = true;
            this.campaignDifficulty = t;
            try {
              var mapFile = await this.mapFileLoader.load(e.mapName);
              var playerName = "Player 1";
              var gameOpts = {
                campaignId: e.id,
                campaignDifficulty: t,
                gameSpeed: 6,
                credits: 0,
                unitCount: 0,
                shortGame: false,
                superWeapons: true,
                buildOffAlly: true,
                mcvRepacks: false,
                cratesAppear: false,
                gameMode: 1,
                hostTeams: false,
                mapTitle: this.getString(e.uiNameKey, e.sourceName),
                maxSlots: 1,
                mapOfficial: true,
                mapSizeBytes: mapFile.getSize(),
                mapName: e.mapName,
                mapDigest: n.MapDigest.compute(mapFile),
                destroyableBridges: true,
                multiEngineer: false,
                noDogEngiKills: false,
                instantCapture: true,
                delayedOils: false,
                humanPlayers: [{ name: playerName, countryId: 0, colorId: 0, startPos: 0, teamId: -1 }],
                aiPlayers: [],
              };
              this.rootController.createGame(
                "campaign-" + e.id,
                Date.now(),
                void 0,
                playerName,
                gameOpts,
                true,
                false,
                false,
                false,
                new a.MainMenuRoute(i.ScreenType.Campaign)
              );
            } catch (e) {
              this.starting = false;
              this.errorHandler.handle(e, this.strings.get("TXT_DOWNLOAD_FAILED"));
            }
          }
          getString(e, t) {
            var s = this.strings.get(e);
            return s === e ? t : s;
          }
          async onLeave() {
            this.enterGeneration++;
            this.starting = false;
            this.mainView = void 0;
            await this.controller.hideSidebarButtons();
          }
          async onStack() {
            await this.onLeave();
          }
          onUnstack() {
            this.onEnter();
          }
        }),
          e("CampaignScreen", l));
      },
    };
  },
);