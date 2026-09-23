/**
 * CampaignScreen — 战役屏（阵营选择/难度/关卡列表/启动）。
 *
 * 离线资源门 checking/prompt/error；battlemd 驱动关卡；
 * startMission 构造固定 gameOpts 并 createGame。
 *
 * 由 gui/screen/mainMenu/campaign/CampaignScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { MusicType } from "engine/sound/Music"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { MainMenuRoute } from "gui/screen/mainMenu/MainMenuRoute"; // 孪生（本组内一并转换）
import { MapDigest } from "engine/MapDigest"; // 已转换
import React from "react"; // 孪生（react 外部依赖）
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生

/** 阵营按钮标签。 */
const sideLabels: Record<string, { key: string; label: string }> = {
  allied: { key: "GUI:AlliedCampaign", label: "盟军战役" },
  soviet: { key: "GUI:SovietCampaign", label: "苏军战役" },
  training: { key: "GUI:TutorialCampaign", label: "新兵训练营" },
  yuri: { key: "GUI:YuriCampaign", label: "尤里战役" },
};

/** 难度标签。 */
const difficultyLabels: Record<string, { key: string; label: string }> = {
  easy: { key: "TXT_EASY", label: "简单" },
  medium: { key: "TXT_MEDIUM", label: "中等" },
  hard: { key: "TXT_HARD", label: "困难" },
};

/** 难度枚举顺序。 */
const difficultyValues = ["easy", "medium", "hard"];

/** 由 battlemd key 推断阵营。 */
function sideOfKey(key: string): string {
  var k = String(key || "").toUpperCase();
  if (k.indexOf("TUT") === 0 || k.indexOf("TRN") === 0) return "training";
  if (k.indexOf("ALL") === 0) return "allied";
  if (k.indexOf("SOV") === 0) return "soviet";
  if (k.indexOf("YUR") === 0) return "yuri";
  return "allied";
}

/** 战役列表 → 关卡对象（按阵营分组编号）。 */
function buildMissions(campaigns: any[]) {
  var bySide = new Map<string, any[]>();
  campaigns.forEach(function (c) {
    var side = sideOfKey(c.key);
    if (!bySide.has(side)) bySide.set(side, []);
    bySide.get(side)!.push(c);
  });
  var out: any[] = [];
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
}

/** 取该阵营首关。 */
function getFirstMissionBySide(side: string, missions: any[]) {
  var m = missions.find(function (x) {
    return x.side === side;
  });
  if (!m) throw new Error('Campaign side "' + side + '" has no missions');
  return m;
}

/** 阵营出现顺序。 */
function getOrderedSides(missions: any[]) {
  var seen: string[] = [];
  missions.forEach(function (m) {
    if (seen.indexOf(m.side) < 0) seen.push(m.side);
  });
  return seen;
}

/** 命令式 DOM 挂载包装。 */
const CampaignContent = (props: { build?: (el: HTMLElement) => void }) =>
  React.createElement("div", {
    ref: (el: HTMLElement | null) => {
      if (el) {
        el.textContent = "";
        props.build && props.build(el);
      }
    },
    style: { width: "100%", height: "100%" },
  });

export class CampaignScreen extends MainMenuScreen {
  rootController: any;
  strings: any;
  jsxRenderer: any;
  mapFileLoader: any;
  errorHandler: any;
  campaignResources?: any;
  musicType?: any;
  starting = false;
  campaignDifficulty = "easy";
  showingMissionList = false;
  mainView?: any;
  /** 离线资源门状态。 */
  resourceState: "checking" | "prompt" | "downloading" | "error" | "ready" =
    "checking";
  resourcesReady = false;
  resourceProgress = 0;
  resourceError?: string;
  pendingDirectMission?: string | null;
  campaigns: any[] = [];
  campaignsLoaded = false;
  enterGeneration = 0;

  constructor(
    rootController: any,
    strings: any,
    jsxRenderer: any,
    mapFileLoader: any,
    errorHandler: any,
    campaignResources: any,
  ) {
    super();
    this.rootController = rootController;
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.mapFileLoader = mapFileLoader;
    this.errorHandler = errorHandler;
    this.campaignResources = campaignResources;
    this.title = this.strings.get("GUI:Campaign");
    this.musicType = MusicType.Intro;
  }

  onEnter(params?: any): void {
    let gen = ++this.enterGeneration;
    this.starting = false;
    // URL 直达：?campaignMissionList=1&campaignMission=allied-01&campaignDifficulty=hard
    let q = new URLSearchParams(globalThis.location?.search ?? "");
    this.showingMissionList = q.has("campaignMissionList");
    this.pendingDirectMission =
      params?.startMissionId || q.get("campaignMission") || void 0;
    if (
      params?.campaignDifficulty &&
      ["easy", "medium", "hard"].includes(params.campaignDifficulty)
    )
      this.campaignDifficulty = params.campaignDifficulty;
    this.resourceState = "checking";
    this.resourcesReady = false;
    this.resourceProgress = 0;
    this.resourceError = void 0;
    this.renderResourceGate();
    this.updateSidebarButtons();
    this.controller.toggleMainVideo(false);
    this.controller.showSidebarButtons();
    this.checkCampaignResources(gen);
    this.loadCampaignList(gen);
  }

  async checkCampaignResources(gen = this.enterGeneration): Promise<void> {
    if (!this.campaignResources) {
      this.showReadyCampaign();
      return;
    }
    try {
      var state = await this.campaignResources.inspect();
      if (gen !== this.enterGeneration) return;
      if (state.state === "ready") this.showReadyCampaign();
      else {
        this.resourceState = "prompt";
        this.renderResourceGate();
        this.updateSidebarButtons();
      }
    } catch (e) {
      if (gen !== this.enterGeneration) return;
      this.showResourceError(e);
    }
  }

  async loadCampaignList(gen = this.enterGeneration): Promise<void> {
    // 从 battlemd.ini（与 rulesmd.ini 同位置，经 loadStandaloneFiles 挂入 VFS）读取战役列表。
    var list = this.campaignResources
      ? this.campaignResources.loadCampaignList()
      : [];
    this.campaigns = buildMissions(list);
    this.campaignsLoaded = true;
    if (gen !== this.enterGeneration) return;
    this.renderCurrentPage();
    this.updateSidebarButtons();
    this.resolveDirectMission();
  }

  resolveDirectMission(): void {
    // 直达任务需要资源与战役列表都已就绪。
    if (!this.resourcesReady || !this.campaignsLoaded) return;
    var id = this.pendingDirectMission;
    if (!id) return;
    this.pendingDirectMission = void 0;
    var m = this.campaigns.find((x) => x.id === id);
    if (m) this.startMission(m, this.campaignDifficulty);
    else console.warn(`Campaign mission "${id}" not found in mission list.`);
  }

  installCampaignResources(): void {
    // 离线适配版：引导用户去「存储」页导入战役 Mix。
    this.controller?.goToScreen(ScreenType.OptionsStorage);
  }

  cancelCampaignDownload(): void {
    this.resourceState = "prompt";
    this.resourceProgress = 0;
    this.renderResourceGate();
    this.updateSidebarButtons();
  }

  showResourceError(e: any): void {
    console.error("Unable to load campaign resources", e);
    this.resourceState = "error";
    this.resourceError = e instanceof Error ? e.message : String(e);
    this.renderResourceGate();
    this.updateSidebarButtons();
  }

  showReadyCampaign(): void {
    this.resourcesReady = true;
    this.resourceState = "ready";
    this.renderCurrentPage();
    this.updateSidebarButtons();
    this.resolveDirectMission();
  }

  /** 渲染离线资源门 DOM。 */
  renderResourceGate(): void {
    var self = this;
    var build = function (container: HTMLElement) {
      container.className = "campaign-resource-gate " + self.resourceState;
      container.setAttribute("data-testid", "campaign-resource-gate");
      container.setAttribute("data-state", self.resourceState);

      var title = document.createElement("h2");
      title.textContent = self.getString(
        "GUI:CampaignResourceTitle",
        "战役资源",
      );
      container.appendChild(title);

      if ("checking" === self.resourceState) {
        var p = document.createElement("p");
        p.textContent = self.getString(
          "GUI:CampaignResourceChecking",
          "正在检查战役资源...",
        );
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
        installBtn.textContent = self.getString(
          "GUI:CampaignResourceInstall",
          "导入战役 Mix",
        );
        installBtn.onclick = function () {
          self.installCampaignResources();
        };
        actions.appendChild(installBtn);
        var backBtn = document.createElement("button");
        backBtn.type = "button";
        backBtn.setAttribute("data-testid", "campaign-resource-back");
        backBtn.textContent = self.getString("GUI:Back", "返回");
        backBtn.onclick = function () {
          self.controller?.goToScreen(ScreenType.SinglePlayer);
        };
        actions.appendChild(backBtn);
        container.appendChild(actions);
      } else if ("error" === self.resourceState) {
        var p3 = document.createElement("p");
        p3.setAttribute("role", "alert");
        p3.textContent =
          self.resourceError ||
          self.getString("GUI:CampaignResourceError", "战役资源加载失败。");
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
          self.controller?.goToScreen(ScreenType.SinglePlayer);
        };
        actions2.appendChild(backBtn2);
        container.appendChild(actions2);
      }
    };
    var [view] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        width: "100%",
        height: "100%",
        component: CampaignContent,
        props: { build },
      }),
    );
    this.mainView = view;
    this.controller.setMainComponent(view);
  }

  renderCurrentPage(): void {
    if (!this.resourcesReady) this.renderResourceGate();
    else if (this.showingMissionList) this.renderMissionList();
    else this.renderSideSelection();
  }

  renderSideSelection(): void {
    var self = this;
    var build = function (container: HTMLElement) {
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
        empty.textContent = self.getString(
          "GUI:CampaignResourcePrompt",
          "未读取到 battlemd.ini 战役配置。",
        );
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
          self.startMission(
            getFirstMissionBySide(side, self.campaigns),
            self.campaignDifficulty,
          );
        };
        sideList.appendChild(btn);
      });
      container.appendChild(sideList);

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
        difficultyLabels[self.campaignDifficulty].label,
      );
      diffContainer.appendChild(diffValue);

      var diffInput = document.createElement("input");
      diffInput.type = "range";
      diffInput.min = "0";
      diffInput.max = "2";
      diffInput.step = "1";
      diffInput.value = String(
        difficultyValues.indexOf(self.campaignDifficulty),
      );
      diffInput.setAttribute(
        "aria-label",
        self.getString("GUI:Difficulty", "难度"),
      );
      diffInput.setAttribute("data-testid", "campaign-difficulty-input");
      diffInput.onchange = function (ev: any) {
        self.campaignDifficulty =
          difficultyValues[Number(ev.currentTarget.value)] || "easy";
        diffValue.textContent = self.getString(
          difficultyLabels[self.campaignDifficulty].key,
          difficultyLabels[self.campaignDifficulty].label,
        );
      };
      diffContainer.appendChild(diffInput);
      container.appendChild(diffContainer);
    };
    var [view] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        width: "100%",
        height: "100%",
        component: CampaignContent,
        props: { build },
      }),
    );
    this.mainView = view;
    this.controller.setMainComponent(view);
  }

  renderMissionList(): void {
    var self = this;
    var build = function (container: HTMLElement) {
      container.className = "campaign-mission-index";
      container.setAttribute("data-testid", "campaign-mission-index");

      var header = document.createElement("header");
      var title = document.createElement("strong");
      title.textContent = self.getString(
        "GUI:CampaignMissionList",
        "全部战役关卡",
      );
      header.appendChild(title);

      var diffSelect = document.createElement("label");
      diffSelect.textContent = self.getString("GUI:Difficulty", "难度");
      var select = document.createElement("select");
      select.setAttribute(
        "data-testid",
        "campaign-mission-index-difficulty",
      );
      select.onchange = function (ev: any) {
        self.campaignDifficulty = ev.currentTarget.value;
      };
      difficultyValues.forEach(function (d) {
        var opt = document.createElement("option");
        opt.value = d;
        opt.textContent = self.getString(
          difficultyLabels[d].key,
          difficultyLabels[d].label,
        );
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
        empty.textContent = self.getString(
          "GUI:CampaignResourcePrompt",
          "未读取到 battlemd.ini 战役配置。",
        );
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
          .filter(function (m) {
            return m.side === side;
          })
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
      jsx(HtmlView as any, {
        width: "100%",
        height: "100%",
        component: CampaignContent,
        props: { build },
      }),
    );
    this.mainView = view;
    this.controller.setMainComponent(view);
  }

  /** 优先 Description CSF → Name: 键 → 地图文件名。 */
  resolveMissionName(mission: any): string {
    var desc = mission.description;
    if (desc) {
      var v = this.strings.get(desc);
      if (v && v !== desc) return v;
    }
    var n = this.getString(mission.uiNameKey, "");
    return n || mission.sourceName;
  }

  updateSidebarButtons(): void {
    var buttons: any[] = [];
    if (this.resourcesReady)
      buttons.push({
        label: this.getString(
          this.showingMissionList
            ? "GUI:CampaignSelector"
            : "GUI:CampaignMissionList",
          this.showingMissionList ? "战役选择" : "全部关卡",
        ),
        onClick: function (this: CampaignScreen) {
          this.showingMissionList = !this.showingMissionList;
          this.renderCurrentPage();
          this.updateSidebarButtons();
        }.bind(this),
      });
    buttons.push({
      label: this.strings.get("GUI:Back"),
      isBottom: true,
      onClick: function (this: CampaignScreen) {
        this.controller?.goToScreen(ScreenType.SinglePlayer);
      }.bind(this),
    });
    this.controller.setSidebarButtons(buttons);
  }

  async startMission(mission: any, difficulty: string): Promise<void> {
    if (this.starting) return;
    if (!this.resourcesReady) {
      console.warn(
        "Campaign resources are not ready — cannot start mission " + mission.id,
      );
      return;
    }
    this.starting = true;
    this.campaignDifficulty = difficulty;
    try {
      var mapFile = await this.mapFileLoader.load(mission.mapName);
      var playerName = "Player 1";
      var gameOpts = {
        campaignId: mission.id,
        campaignDifficulty: difficulty,
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
        mapTitle: this.getString(mission.uiNameKey, mission.sourceName),
        maxSlots: 1,
        mapOfficial: true,
        mapSizeBytes: mapFile.getSize(),
        mapName: mission.mapName,
        mapDigest: MapDigest.compute(mapFile),
        destroyableBridges: true,
        multiEngineer: false,
        noDogEngiKills: false,
        instantCapture: true,
        delayedOils: false,
        humanPlayers: [
          { name: playerName, countryId: 0, colorId: 0, startPos: 0, teamId: -1 },
        ],
        aiPlayers: [],
      };
      this.rootController.createGame(
        "campaign-" + mission.id,
        Date.now(),
        void 0,
        playerName,
        gameOpts,
        true,
        false,
        false,
        false,
        new MainMenuRoute(ScreenType.Campaign),
      );
    } catch (e) {
      this.starting = false;
      this.errorHandler.handle(e, this.strings.get("TXT_DOWNLOAD_FAILED"));
    }
  }

  /** i18n 且缺 key 回退 fallback。 */
  getString(key: string, fallback: string): string {
    var s = this.strings.get(key);
    return s === key ? fallback : s;
  }

  async onLeave(): Promise<void> {
    this.enterGeneration++;
    this.starting = false;
    this.mainView = void 0;
    await this.controller.hideSidebarButtons();
  }

  async onStack(): Promise<void> {
    await this.onLeave();
  }

  onUnstack(): void {
    this.onEnter();
  }
}
