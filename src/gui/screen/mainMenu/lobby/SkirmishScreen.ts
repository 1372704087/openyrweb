/**
 * SkirmishScreen — 遭遇战（单人建局）屏。
 *
 * 出生点钳制 countMapStartLocations；观战/AI 槽切换；bot 设置清理。
 *
 * 由 gui/screen/mainMenu/lobby/SkirmishScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { AiDifficulty } from "game/gameopts/GameOpts"; // 已转换
import { SlotType } from "network/gameopt/SlotInfo"; // 孪生（slotsInfo）
import { LobbyType, SlotOccupation, SlotType as FormSlotType, PlayerStatus } from "gui/screen/mainMenu/lobby/component/viewmodel/lobby"; // 孪生（本组内一并转换）
import { OBS_COUNTRY_ID, OBS_COUNTRY_NAME, RANDOM_COLOR_ID, RANDOM_COLOR_NAME, RANDOM_COUNTRY_ID, RANDOM_COUNTRY_NAME, RANDOM_START_POS, NO_TEAM_ID, aiUiNames } from "game/gameopts/constants"; // 已转换
import * as gameOptsConstants from "game/gameopts/constants"; // 孪生（constants 别名）
import { LobbyForm } from "gui/screen/mainMenu/lobby/component/LobbyForm"; // 孪生（本组内一并转换）
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { DownloadError } from "engine/ResourceLoader"; // 已转换
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 已转换
import { MapPreviewRenderer } from "gui/screen/mainMenu/lobby/MapPreviewRenderer"; // 孪生（本组内一并转换）
import { findIndexReverse } from "util/array"; // 已转换
import { StorageKey } from "LocalPrefs"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { PreferredHostOpts } from "gui/screen/mainMenu/lobby/PreferredHostOpts"; // 孪生（本组内一并转换）
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { MapFile } from "data/MapFile"; // 已转换
import { MapDigest } from "engine/MapDigest"; // 已转换
import { MainMenuRoute } from "gui/screen/mainMenu/MainMenuRoute"; // 孪生（本组内一并转换）
import { MusicType } from "engine/sound/Music"; // 已转换
import { Parser } from "network/gameopt/Parser"; // 已转换
import { Serializer } from "network/gameopt/Serializer"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 统计 [Waypoints] 编号 <8 的出生点数量。 */
function countMapStartLocations(mapFile: any): number {
  try {
    var text = mapFile.readAsString();
    var secStart = text.search(/\[Waypoints\]/i);
    if (secStart === -1) return 0;
    var secEnd = text.indexOf("\n[", secStart + 12);
    var section =
      secEnd === -1
        ? text.slice(secStart + 12)
        : text.slice(secStart + 12, secEnd);
    var count = 0;
    var lines = section.split(/\r?\n/);
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li].trim();
      if (!line || line.charAt(0) === ";" || line.charAt(0) === "[") continue;
      var eq = line.indexOf("=");
      if (eq === -1) continue;
      var key = line.slice(0, eq).trim();
      if (/^\d+$/.test(key) && Number(key) < 8) count++;
    }
    return count;
  } catch {
    return 0;
  }
}

export class SkirmishScreen extends MainMenuScreen {
  rootController: any;
  errorHandler: any;
  messageBoxApi: any;
  strings: any;
  rules: any;
  jsxRenderer: any;
  mapFileLoader: any;
  mapList: any;
  gameModes: any;
  localPrefs: any;
  musicType?: any;
  playerName = "Player 1";
  hostObserver = false;
  savedHostCountryId?: any;
  disposables = new CompositeDisposable();
  lobbyForm?: any;
  gameOpts?: any;
  slotsInfo?: any[];
  currentMapFile?: any;
  formModel?: any;
  mapTask?: any;

  constructor(
    rootController: any,
    errorHandler: any,
    messageBoxApi: any,
    strings: any,
    rules: any,
    jsxRenderer: any,
    mapFileLoader: any,
    mapList: any,
    gameModes: any,
    localPrefs: any,
  ) {
    super();
    this.rootController = rootController;
    this.errorHandler = errorHandler;
    this.messageBoxApi = messageBoxApi;
    this.strings = strings;
    this.rules = rules;
    this.jsxRenderer = jsxRenderer;
    this.mapFileLoader = mapFileLoader;
    this.mapList = mapList;
    this.gameModes = gameModes;
    this.localPrefs = localPrefs;
    this.title = this.strings.get("GUI:SkirmishGame");
    this.musicType = MusicType.Intro;
  }

  get backgroundImageName() {
    return "mnscrnlcoopgamesetup.shp";
  }

  onEnter(): void {
    this.controller.toggleMainVideo(false);
    this.lobbyForm = void 0;
    this.initFormModel();
    void this.createGame();
  }

  async createGame(): Promise<void> {
    try {
      await this.initOptions();
    } catch (e) {
      this.handleError(
        e,
        e instanceof DownloadError
          ? this.strings.get("TXT_DOWNLOAD_FAILED")
          : this.strings.get("WOL:MatchErrorCreatingGame"),
      );
      return;
    }
    this.updateMapPreview();
    this.updateFormModel();
    this.controller.toggleSidebarPreview(true);
    this.initView();
  }

  onViewportChange(): void {}

  onUnstack(params?: any): void {
    if (params) {
      let modeChanged = params.gameMode.id !== this.gameOpts.gameMode;
      this.gameOpts.gameMode = params.gameMode.id;
      let mapMeta = this.mapList.getByName(params.mapName);
      let mapFile = params.changedMapFile ?? this.currentMapFile;
      this.currentMapFile = mapFile;
      // 换图后用实际出生点数钳制槽位
      var maxSlots = Math.min(
        mapMeta.maxSlots,
        countMapStartLocations(mapFile) || mapMeta.maxSlots,
      );
      var lastUsed = findIndexReverse(
        this.slotsInfo,
        (s: any) =>
          s.type === SlotType.Ai ||
          s.type === SlotType.Player ||
          s.type === SlotType.Open,
      );
      var closeCount = Math.max(0, lastUsed + 1 - maxSlots);
      for (let i = 0; i < closeCount; i++) {
        this.slotsInfo[lastUsed - i].type = SlotType.Closed;
        this.gameOpts.aiPlayers[lastUsed - i] = void 0;
      }
      let mp = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
      ([...this.gameOpts.humanPlayers, ...this.gameOpts.aiPlayers] as any[]).forEach(
        (p) => {
          if (!p) return;
          if (p.startPos > maxSlots - 1) p.startPos = RANDOM_START_POS;
          if (modeChanged)
            p.teamId = mp.alliesAllowed && mp.mustAlly ? 0 : NO_TEAM_ID;
        },
      );
      this.applyGameOption((opts: any) => {
        opts.mapName = mapMeta.fileName;
        opts.mapDigest = MapDigest.compute(mapFile);
        opts.mapSizeBytes = mapFile.getSize();
        opts.mapTitle = mapMeta.getFullMapTitle(this.strings);
        opts.maxSlots = maxSlots;
        opts.mapOfficial = mapMeta.official;
      });
      this.localPrefs.setItem(StorageKey.LastMap, mapMeta.fileName);
      this.localPrefs.setItem(
        StorageKey.LastMode,
        String(params.gameMode.id),
      );
      this.saveBotSettings();
    }
    this.updateMapPreview();
    this.initView();
  }

  async onStack(): Promise<void> {
    await this.unrender();
  }

  initView(): void {
    this.initLobbyForm();
    this.refreshSidebarButtons();
    this.refreshSidebarMpText();
    this.controller.showSidebarButtons();
  }

  async initOptions(): Promise<void> {
    var preferred = this.localPrefs.getItem(StorageKey.PreferredGameOpts);
    var countryPref = this.localPrefs.getItem(StorageKey.LastPlayerCountry);
    var colorPref = this.localPrefs.getItem(StorageKey.LastPlayerColor);
    var startPosPref = this.localPrefs.getItem(StorageKey.LastPlayerStartPos);
    var teamPref = this.localPrefs.getItem(StorageKey.LastPlayerTeam);
    var lastMap = this.localPrefs.getItem(StorageKey.LastMap);
    var lastMode = this.localPrefs.getItem(StorageKey.LastMode);
    var lastBots = this.localPrefs.getItem(StorageKey.LastBots);
    var hostObsPref = this.localPrefs.getItem(StorageKey.LastHostObserver);
    let mapMeta = lastMap ? this.mapList.getByName(lastMap) : void 0;
    let gameModeId =
      mapMeta && lastMode && this.gameModes.hasId(Number(lastMode))
        ? Number(lastMode)
        : 1;
    let mode = this.gameModes.getById(gameModeId);
    let chosen: any;
    chosen = mapMeta?.gameModes.find((m: any) => m.mapFilter === mode.mapFilter)
      ? mapMeta
      : ((gameModeId = 1),
        (mode = this.gameModes.getById(gameModeId)),
        this.mapList
          .getAll()
          .find((m: any) =>
            m.gameModes.find((x: any) => mode.mapFilter === x.mapFilter),
          ));
    let mapFile = (this.currentMapFile = await this.mapFileLoader.load(
      chosen.fileName,
    ));
    let hostOpts = new PreferredHostOpts();
    if (preferred) hostOpts.unserialize(preferred);
    else hostOpts.applyMpDialogSettings(this.rules.mpDialogSettings);
    // 以地图实际出生点数钳制槽位
    var effectiveMaxSlots = Math.min(
      chosen.maxSlots,
      countMapStartLocations(mapFile) || chosen.maxSlots,
    );
    let mp = mode.mpDialogSettings;
    let defaultDiff = AiDifficulty.Medium;
    let bots = lastBots ? new Parser().parseAiOpts(lastBots) : void 0;
    if (bots)
      this.sanitizeLastBotSettings(
        bots,
        colorPref,
        startPosPref,
        effectiveMaxSlots,
        mp,
      );
    this.gameOpts = {
      gameMode: gameModeId,
      shortGame: hostOpts.shortGame,
      mcvRepacks: hostOpts.mcvRepacks,
      cratesAppear: hostOpts.cratesAppear,
      superWeapons: hostOpts.superWeapons,
      gameSpeed: hostOpts.gameSpeed,
      credits: hostOpts.credits,
      unitCount: hostOpts.unitCount,
      buildOffAlly: hostOpts.buildOffAlly,
      destroyableBridges: hostOpts.destroyableBridges,
      multiEngineer: hostOpts.multiEngineer,
      noDogEngiKills: hostOpts.noDogEngiKills,
      instantCapture: hostOpts.instantCapture,
      delayedOils: hostOpts.delayedOils,
      humanPlayers: [
        {
          name: this.playerName,
          countryId:
            void 0 !== countryPref &&
            Number(countryPref) < this.getAvailablePlayerCountries().length
              ? Number(countryPref)
              : RANDOM_COUNTRY_ID,
          colorId:
            void 0 !== colorPref &&
            Number(colorPref) < this.getAvailablePlayerColors().length
              ? Number(colorPref)
              : RANDOM_COLOR_ID,
          startPos:
            void 0 !== startPosPref &&
            Number(startPosPref) <
              this.getAvailableStartPositions(effectiveMaxSlots).length
              ? Number(startPosPref)
              : RANDOM_START_POS,
          teamId:
            void 0 !== teamPref && mp.alliesAllowed && Number(teamPref) < 4
              ? Number(teamPref)
              : mp.mustAlly
                ? 0
                : NO_TEAM_ID,
        },
      ],
      aiPlayers: [
        ...new Array(8).fill(void 0).map((_v, idx) => {
          if (!(idx > effectiveMaxSlots - 1)) {
            var diff =
              idx === 1
                ? bots
                  ? bots[1]?.difficulty
                  : defaultDiff
                : bots?.[idx]?.difficulty;
            if (void 0 !== diff)
              return {
                countryId: bots?.[idx]?.countryId ?? RANDOM_COUNTRY_ID,
                colorId: bots?.[idx]?.colorId ?? RANDOM_COLOR_ID,
                startPos: bots?.[idx]?.startPos ?? RANDOM_START_POS,
                teamId: bots?.[idx]?.teamId ?? (mp.mustAlly ? 3 : NO_TEAM_ID),
                difficulty: diff,
              };
          }
        }),
      ],
      mapName: chosen.fileName,
      mapDigest: MapDigest.compute(mapFile),
      mapSizeBytes: mapFile.getSize(),
      mapTitle: chosen.getFullMapTitle(this.strings),
      maxSlots: effectiveMaxSlots,
      mapOfficial: chosen.official,
    };
    this.slotsInfo = [
      { type: SlotType.Player, name: this.playerName },
      ...this.gameOpts.aiPlayers
        .slice(1)
        .map((ai) =>
          ai
            ? { type: SlotType.Ai, difficulty: ai.difficulty }
            : { type: SlotType.Closed },
        ),
    ];
    this.savedHostCountryId = this.gameOpts.humanPlayers[0].countryId;
    if (
      (hostObsPref === "ai" || this.gameOpts.aiPlayers[0]) &&
      hostObsPref !== "player"
    ) {
      this.hostObserver = true;
      if (!this.gameOpts.aiPlayers[0])
        this.gameOpts.aiPlayers[0] = {
          difficulty: AiDifficulty.Medium,
          countryId: RANDOM_COUNTRY_ID,
          colorId: RANDOM_COLOR_ID,
          startPos: RANDOM_START_POS,
          teamId: mp.mustAlly ? 3 : NO_TEAM_ID,
        };
      this.savedHostCountryId =
        this.gameOpts.humanPlayers[0].countryId !== OBS_COUNTRY_ID
          ? this.gameOpts.humanPlayers[0].countryId
          : this.savedHostCountryId !== OBS_COUNTRY_ID
            ? this.savedHostCountryId
            : RANDOM_COUNTRY_ID;
      this.gameOpts.humanPlayers[0].countryId = OBS_COUNTRY_ID;
      // 观战者不占出生点槽位
      this.gameOpts.humanPlayers[0].startPos = RANDOM_START_POS;
      this.slotsInfo[0] = {
        type: SlotType.Ai,
        difficulty: this.gameOpts.aiPlayers[0].difficulty,
      };
    } else if (hostObsPref === "observer") {
      this.hostObserver = true;
      this.gameOpts.aiPlayers[0] = void 0;
      this.savedHostCountryId =
        this.gameOpts.humanPlayers[0].countryId !== OBS_COUNTRY_ID
          ? this.gameOpts.humanPlayers[0].countryId
          : this.savedHostCountryId !== OBS_COUNTRY_ID
            ? this.savedHostCountryId
            : RANDOM_COUNTRY_ID;
      this.gameOpts.humanPlayers[0].countryId = OBS_COUNTRY_ID;
      this.gameOpts.humanPlayers[0].startPos = RANDOM_START_POS;
      (this.slotsInfo[0] as any).observer = true;
    } else {
      this.hostObserver = false;
      this.gameOpts.aiPlayers[0] = void 0;
    }
  }

  sanitizeLastBotSettings(
    bots: any[],
    colorPref: any,
    startPosPref: any,
    maxSlots: number,
    mp: any,
  ): void {
    let filled = 0;
    for (let i = 0; i < bots.length; ++i)
      if (bots[i]) {
        filled++;
        if (filled > (bots[0] ? maxSlots : maxSlots - 1)) bots[i] = void 0;
      }
    let usedColors = void 0 !== colorPref ? [Number(colorPref)] : [];
    let usedStarts = void 0 !== startPosPref ? [Number(startPosPref)] : [];
    for (const bot of bots)
      if (bot) {
        if (
          void 0 === bot.difficulty ||
          !(AiDifficulty as any)[bot.difficulty]
        )
          bot.difficulty = AiDifficulty.Easy;
        if (
          void 0 !== bot.countryId &&
          bot.countryId >= this.getAvailablePlayerCountries().length
        )
          bot.countryId = RANDOM_COUNTRY_ID;
        if (
          void 0 !== bot.colorId &&
          bot.colorId !== RANDOM_COLOR_ID
        ) {
          if (
            bot.colorId >= this.getAvailablePlayerColors().length ||
            usedColors.includes(bot.colorId)
          )
            bot.colorId = RANDOM_COLOR_ID;
          else usedColors.push(bot.colorId);
        }
        if (
          void 0 !== bot.startPos &&
          bot.startPos !== RANDOM_START_POS
        ) {
          if (
            bot.startPos >= this.getAvailableStartPositions(maxSlots).length ||
            usedStarts.includes(bot.startPos)
          )
            bot.startPos = RANDOM_START_POS;
          else usedStarts.push(bot.startPos);
        }
        if (bot.teamId !== NO_TEAM_ID) {
          if (4 <= bot.teamId || !mp.alliesAllowed)
            bot.teamId = mp.mustAlly ? 3 : NO_TEAM_ID;
        } else if (mp.mustAlly) bot.teamId = 3;
      }
  }

  handleError(e: any, message: string): void {
    this.errorHandler.handle(e, message, () => {
      this.controller?.goToScreen(ScreenType.Home);
    });
  }

  getAvailablePlayerCountryRules() {
    return this.rules.getMultiplayerCountries();
  }

  getAvailablePlayerCountries() {
    return this.getAvailablePlayerCountryRules().map((c: any) => c.name);
  }

  getAvailablePlayerColors() {
    return [...this.rules.getMultiplayerColors().values()].map((c: any) =>
      c.asHexString(),
    );
  }

  getAvailableStartPositions(count: number) {
    return new Array(count).fill(0).map((_v, i) => i);
  }

  getSelectablePlayerColors(slots: any[]) {
    let used: string[] = [];
    slots.forEach((s) => {
      if (s) used.push(s.color);
    });
    let all = this.getAvailablePlayerColors();
    return [RANDOM_COLOR_NAME].concat(
      all.filter((c) => c && -1 === used.indexOf(c)),
    );
  }

  getSelectableStartPositions(slots: any[], maxSlots: number) {
    let used: any[] = [];
    slots.forEach((s) => {
      if (s) used.push(s.startPos);
    });
    let all = this.getAvailableStartPositions(maxSlots);
    return [RANDOM_START_POS].concat(all.filter((s) => !used.includes(s)));
  }

  initFormModel(): void {
    var mp = this.rules.mpDialogSettings;
    this.formModel = {
      strings: this.strings,
      countryUiNames: new Map<any, any>(
        (
          [
            [RANDOM_COUNTRY_NAME, (gameOptsConstants as any).RANDOM_COUNTRY_UI_NAME],
            [OBS_COUNTRY_NAME, (gameOptsConstants as any).OBS_COUNTRY_UI_NAME],
          ] as any[]
        ).concat(
          this.getAvailablePlayerCountryRules().map((c: any) => [c.name, c.uiName]),
        ),
      ),
      countryUiTooltips: new Map<any, any>(
        (
          [
            [RANDOM_COUNTRY_NAME, (gameOptsConstants as any).RANDOM_COUNTRY_UI_TOOLTIP],
            [OBS_COUNTRY_NAME, (gameOptsConstants as any).OBS_COUNTRY_UI_TOOLTIP],
          ] as any[]
        ).concat(
          this.getAvailablePlayerCountryRules()
            .filter((c: any) => c.uiTooltip)
            .map((c: any) => [c.name, c.uiTooltip]),
        ),
      ),
      availablePlayerCountries: [RANDOM_COUNTRY_NAME].concat(
        this.getAvailablePlayerCountries(),
      ),
      availablePlayerColors: [],
      availableStartPositions: [],
      maxTeams: 4,
      availableAiNames: aiUiNames,
      lobbyType: LobbyType.Singleplayer,
      mpDialogSettings: mp,
      onCountrySelect: (name: string, idx: number) => {
        this.updatePlayerInfo(
          this.getCountryIdByName(name),
          this.getColorIdByName(this.formModel.playerSlots[idx].color),
          this.formModel.playerSlots[idx].startPos,
          this.formModel.playerSlots[idx].team,
          idx,
        );
        this.updateFormModel();
      },
      onColorSelect: (name: string, idx: number) => {
        this.updatePlayerInfo(
          this.getCountryIdByName(this.formModel.playerSlots[idx].country),
          this.getColorIdByName(name),
          this.formModel.playerSlots[idx].startPos,
          this.formModel.playerSlots[idx].team,
          idx,
        );
        this.updateFormModel();
      },
      onStartPosSelect: (pos: any, idx: number) => {
        this.updatePlayerInfo(
          this.getCountryIdByName(this.formModel.playerSlots[idx].country),
          this.getColorIdByName(this.formModel.playerSlots[idx].color),
          pos,
          this.formModel.playerSlots[idx].team,
          idx,
        );
      },
      onTeamSelect: (team: any, idx: number) => {
        this.updatePlayerInfo(
          this.getCountryIdByName(this.formModel.playerSlots[idx].country),
          this.getColorIdByName(this.formModel.playerSlots[idx].color),
          this.formModel.playerSlots[idx].startPos,
          team,
          idx,
        );
      },
      onSlotChange: (occ: any, idx: number, diff?: any) => {
        this.changeSlotType(occ, idx, diff);
        this.saveBotSettings();
      },
      onToggleShortGame: (v: boolean) => this.applyGameOption((o) => (o.shortGame = v)),
      onToggleMcvRepacks: (v: boolean) => this.applyGameOption((o) => (o.mcvRepacks = v)),
      onToggleCratesAppear: (v: boolean) => this.applyGameOption((o) => (o.cratesAppear = v)),
      onToggleSuperWeapons: (v: boolean) => this.applyGameOption((o) => (o.superWeapons = v)),
      onToggleBuildOffAlly: (v: boolean) => this.applyGameOption((o) => (o.buildOffAlly = v)),
      onToggleDestroyableBridges: (v: boolean) =>
        this.applyGameOption((o) => (o.destroyableBridges = v)),
      onToggleMultiEngineer: (v: boolean) =>
        this.applyGameOption((o) => {
          o.multiEngineer = v;
          if (v) o.instantCapture = true;
        }),
      onToggleNoDogEngiKills: (v: boolean) =>
        this.applyGameOption((o) => (o.noDogEngiKills = v)),
      onToggleInstantCapture: (v: boolean) =>
        this.applyGameOption((o) => (o.instantCapture = v)),
      onToggleDelayedOils: (v: boolean) =>
        this.applyGameOption((o) => (o.delayedOils = v)),
      onChangeGameSpeed: (v: number) => this.applyGameOption((o) => (o.gameSpeed = v)),
      onChangeCredits: (v: number) => this.applyGameOption((o) => (o.credits = v)),
      onChangeUnitCount: (v: number) => this.applyGameOption((o) => (o.unitCount = v)),
      onPlayerNameChange: (name: string) => {
        this.playerName = name;
        if (this.gameOpts.humanPlayers[0]) this.gameOpts.humanPlayers[0].name = name;
        if (this.slotsInfo[0]) this.slotsInfo[0].name = name;
        this.updateFormModel();
      },
      activeSlotIndex: 0,
      teamsAllowed: true,
      teamsRequired: false,
      playerSlots: [],
      shortGame: true,
      mcvRepacks: true,
      cratesAppear: true,
      superWeapons: true,
      buildOffAlly: true,
      destroyableBridges: true,
      multiEngineer: false,
      multiEngineerCount:
        Math.ceil(
          (1 - this.rules.general.engineerCaptureLevel) /
            this.rules.general.engineerDamage,
        ) + 1,
      noDogEngiKills: false,
      instantCapture: true,
      delayedOils: false,
      gameSpeed: 6,
      credits: mp.money,
      unitCount: mp.unitCount,
    };
  }

  applyGameOption(fn: (opts: any) => void): void {
    fn(this.gameOpts);
    this.updateFormModel();
    this.localPrefs.setItem(
      StorageKey.PreferredGameOpts,
      new PreferredHostOpts().applyGameOpts(this.gameOpts).serialize(),
    );
  }

  changeSlotType(occupation: any, index: number, difficulty?: any): void {
    var r;
    if (occupation === "player" && 0 === index) {
      this.hostObserver = false;
      // 槽位从 AI/观战者切回玩家时恢复名字
      this.slotsInfo[0].name = this.playerName;
      this.slotsInfo[0].type = SlotType.Player;
      delete this.slotsInfo[0].difficulty;
      delete this.slotsInfo[0].observer;
      this.gameOpts.aiPlayers[0] = void 0;
      this.gameOpts.humanPlayers[0].countryId =
        this.savedHostCountryId ?? RANDOM_COUNTRY_ID;
      this.localPrefs.setItem(StorageKey.LastHostObserver, "player");
      this.localPrefs.setItem(
        StorageKey.LastPlayerCountry,
        String(this.gameOpts.humanPlayers[0].countryId),
      );
      this.updateFormModel();
      this.refreshSidebarButtons();
      return;
    }
    if (occupation === SlotOccupation.Observer) {
      if (0 === index) {
        this.hostObserver = true;
        this.savedHostCountryId = this.gameOpts.humanPlayers[0].countryId;
        this.gameOpts.humanPlayers[0].countryId = OBS_COUNTRY_ID;
        this.gameOpts.humanPlayers[0].startPos = RANDOM_START_POS;
        this.slotsInfo[0].type = SlotType.Player;
        delete this.slotsInfo[0].difficulty;
        delete this.slotsInfo[0].observer;
        this.slotsInfo[0].name = this.playerName;
        this.gameOpts.aiPlayers[0] = void 0;
        this.localPrefs.setItem(StorageKey.LastHostObserver, "observer");
        this.localPrefs.setItem(
          StorageKey.LastPlayerCountry,
          String(this.savedHostCountryId),
        );
        this.updateFormModel();
        this.refreshSidebarButtons();
        return;
      }
      this.slotsInfo[index].type = SlotType.Closed;
      (this.slotsInfo[index] as any).observer = true;
      this.gameOpts.aiPlayers[index] = void 0;
      this.updateFormModel();
      return;
    }
    if (
      0 === index &&
      !(occupation === SlotOccupation.Occupied && void 0 !== difficulty)
    )
      throw new Error(
        "Cannot change slot type of host to non-player/observer",
      );
    if (occupation === SlotOccupation.Occupied && void 0 !== difficulty) {
      var mp = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
      let slot = this.slotsInfo[index];
      if (0 === index) {
        if (!this.hostObserver)
          this.savedHostCountryId = this.gameOpts.humanPlayers[0].countryId;
        this.hostObserver = true;
        this.gameOpts.humanPlayers[0].countryId = OBS_COUNTRY_ID;
        // 观战者不占出生点槽位
        this.gameOpts.humanPlayers[0].startPos = RANDOM_START_POS;
        delete (slot as any).observer;
      }
      slot.type = SlotType.Ai;
      (slot as any).difficulty = difficulty;
      (this.gameOpts.aiPlayers[index] as any) ??= {
        difficulty,
        countryId: RANDOM_COUNTRY_ID,
        colorId: RANDOM_COLOR_ID,
        startPos: RANDOM_START_POS,
        teamId: mp.mustAlly ? 3 : NO_TEAM_ID,
      };
      this.gameOpts.aiPlayers[index].difficulty = difficulty;
      if (0 === index) {
        this.localPrefs.setItem(StorageKey.LastHostObserver, "ai");
        this.localPrefs.setItem(
          StorageKey.LastPlayerCountry,
          String(this.savedHostCountryId),
        );
        this.updateFormModel();
        this.refreshSidebarButtons();
        return;
      }
    }
    if (occupation === SlotOccupation.Closed) {
      this.slotsInfo[index].type = SlotType.Closed;
      delete (this.slotsInfo[index] as any).observer;
      this.gameOpts.aiPlayers[index] = void 0;
    }
    this.updateFormModel();
  }

  saveBotSettings(): void {
    this.localPrefs.setItem(
      StorageKey.LastBots,
      new Serializer().serializeAiOpts(this.gameOpts.aiPlayers),
    );
  }

  getCountryNameById(id: any): string {
    let name;
    if (id === RANDOM_COUNTRY_ID) name = RANDOM_COUNTRY_NAME;
    else if (id === OBS_COUNTRY_ID) name = OBS_COUNTRY_NAME;
    else name = this.getAvailablePlayerCountries()[id];
    return name;
  }

  getCountryIdByName(name: string): any {
    let id;
    if (name === RANDOM_COUNTRY_NAME) id = RANDOM_COUNTRY_ID;
    else if (name === OBS_COUNTRY_NAME) id = OBS_COUNTRY_ID;
    else {
      let list = this.getAvailablePlayerCountries();
      id = list.indexOf(name);
    }
    return id;
  }

  getColorNameById(id: any): string {
    let name;
    if (id === RANDOM_COLOR_ID) name = RANDOM_COLOR_NAME;
    else name = this.getAvailablePlayerColors()[id];
    return name;
  }

  getColorIdByName(name: string): any {
    let id;
    if (name === RANDOM_COLOR_NAME) id = RANDOM_COLOR_ID;
    else {
      let list = this.getAvailablePlayerColors();
      id = list.indexOf(name);
      if (-1 === id)
        throw new Error(`Color ${name} not found in available player colors`);
    }
    return id;
  }

  updatePlayerInfo(
    countryId: any,
    colorId: any,
    startPos: any,
    teamId: any,
    index: number,
  ): void {
    const slot = this.slotsInfo[index];
    if (slot.type === SlotType.Ai) {
      let ai = this.gameOpts.aiPlayers[index];
      if (!ai) throw new Error("No AI found on slot " + index);
      ai.countryId = countryId;
      ai.colorId = colorId;
      ai.startPos = startPos;
      ai.teamId = teamId;
      this.saveBotSettings();
    } else {
      if (slot.type !== SlotType.Player)
        throw new Error("Unexpected slot type " + slot.type);
      let player = this.gameOpts.humanPlayers.find(
        (p: any) => p.name === slot.name,
      );
      if (!player)
        throw new Error("No player found on slot " + index);
      player.countryId = countryId;
      player.colorId = colorId;
      player.startPos = startPos;
      player.teamId = teamId;
      if (countryId !== RANDOM_COUNTRY_ID)
        this.localPrefs.setItem(
          StorageKey.LastPlayerCountry,
          String(countryId),
        );
      else this.localPrefs.removeItem(StorageKey.LastPlayerCountry);
      if (colorId !== RANDOM_COLOR_ID)
        this.localPrefs.setItem(StorageKey.LastPlayerColor, String(colorId));
      else this.localPrefs.removeItem(StorageKey.LastPlayerColor);
      if (startPos !== RANDOM_START_POS)
        this.localPrefs.setItem(
          StorageKey.LastPlayerStartPos,
          String(startPos),
        );
      else this.localPrefs.removeItem(StorageKey.LastPlayerStartPos);
      if (teamId !== NO_TEAM_ID)
        this.localPrefs.setItem(StorageKey.LastPlayerTeam, String(teamId));
      else this.localPrefs.removeItem(StorageKey.LastPlayerTeam);
    }
    this.updateFormModel();
  }

  updateFormModel(): void {
    var opts = this.gameOpts;
    this.formModel.gameSpeed = opts.gameSpeed;
    this.formModel.credits = opts.credits;
    this.formModel.unitCount = opts.unitCount;
    this.formModel.shortGame = opts.shortGame;
    this.formModel.superWeapons = opts.superWeapons;
    this.formModel.buildOffAlly = opts.buildOffAlly;
    this.formModel.mcvRepacks = opts.mcvRepacks;
    this.formModel.cratesAppear = opts.cratesAppear;
    this.formModel.destroyableBridges = opts.destroyableBridges;
    this.formModel.multiEngineer = opts.multiEngineer;
    this.formModel.noDogEngiKills = opts.noDogEngiKills;
    this.formModel.instantCapture = opts.instantCapture;
    this.formModel.delayedOils = opts.delayedOils;
    let budget = opts.maxSlots;
    this.slotsInfo.forEach((slot, idx) => {
      if (budget) {
        budget--;
        this.formModel.playerSlots[idx] = {
          country: RANDOM_COUNTRY_NAME,
          color: RANDOM_COLOR_NAME,
          startPos: RANDOM_START_POS,
          team: NO_TEAM_ID,
        };
      } else this.formModel.playerSlots[idx] = void 0;
    });
    this.slotsInfo.forEach((slot, idx) => {
      if (!this.formModel.playerSlots[idx]) return;
      let s = this.formModel.playerSlots[idx];
      if ((slot as any).observer)
        s.occupation = SlotOccupation.Observer;
      else if (slot.type === SlotType.Closed)
        s.occupation = SlotOccupation.Closed;
      else if (slot.type === SlotType.Open || (slot as any).type === (SlotType as any).OpenObserver)
        s.occupation = SlotOccupation.Open;
      else s.occupation = SlotOccupation.Occupied;
      if (slot.type === SlotType.Ai) {
        s.aiDifficulty = (slot as any).difficulty;
        // 孪生无 :847 死语句（其写入恒被下一行覆盖）
        s.type = (FormSlotType as any).Ai;
      } else if (slot.type === SlotType.Player) {
        s.name = slot.name;
        s.type = (FormSlotType as any).Player;
      }
      s.status = PlayerStatus.NotReady;
    });
    let humans = this.gameOpts ? this.gameOpts.humanPlayers : [];
    let ais = this.gameOpts ? this.gameOpts.aiPlayers : [];
    let mp = this.gameModes.getById(this.gameOpts.gameMode).mpDialogSettings;
    this.formModel.playerSlots.forEach((s: any, idx: number) => {
      if (!s || !humans.length) return;
      if (s.occupation === SlotOccupation.Occupied) {
        const h = humans.find((p: any) => p.name === s.name);
        if (h) {
          s.country = this.getCountryNameById(h.countryId);
          s.color = this.getColorNameById(h.colorId);
          s.startPos = h.startPos;
          s.team = h.teamId;
        } else if (ais[idx]) {
          s.country = this.getCountryNameById(ais[idx].countryId);
          s.color = this.getColorNameById(ais[idx].colorId);
          s.startPos = ais[idx].startPos;
          s.team = ais[idx].teamId;
        }
      } else {
        s.country = RANDOM_COUNTRY_NAME;
        s.team = mp.mustAlly ? 3 : NO_TEAM_ID;
      }
    });
    this.formModel.availablePlayerColors = this.getSelectablePlayerColors(
      this.formModel.playerSlots,
    );
    this.formModel.availableStartPositions = this.getSelectableStartPositions(
      this.formModel.playerSlots,
      opts.maxSlots,
    );
    this.formModel.teamsAllowed =
      this.gameModes.getById(opts.gameMode).mpDialogSettings.alliesAllowed;
    this.formModel.teamsRequired =
      this.gameModes.getById(opts.gameMode).mpDialogSettings.mustAlly;
    if (this.lobbyForm && humans.length) this.lobbyForm.refresh();
  }

  updateMapPreview(): void {
    this.mapTask?.cancel();
    this.mapTask = new Task(async (cancel) => {
      if (!this.controller) return;
      this.controller.setSidebarPreview();
      let mapFile: any;
      try {
        mapFile = new MapFile(
          await this.mapFileLoader.load(this.gameOpts.mapName, cancel),
        );
      } catch (e) {
        if (e instanceof DownloadError)
          return void this.handleError(
            e,
            this.strings.get("TXT_DOWNLOAD_FAILED"),
          );
        throw e;
      }
      const preview = new MapPreviewRenderer(this.strings).render(
        mapFile,
        LobbyType.Singleplayer,
        this.controller.getSidebarPreviewSize(),
      );
      this.controller.setSidebarPreview(preview);
    });
    this.mapTask.start().catch((e) => {
      if (!(e instanceof OperationCanceledError)) {
        console.error("Failed to render map preview");
        console.error(e);
      }
    });
    this.disposables.add(
      () => this.mapTask?.cancel(),
      () => (this.mapTask = void 0),
    );
  }

  initLobbyForm(): void {
    var [el] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        innerRef: (e: any) => (this.lobbyForm = e),
        component: LobbyForm,
        props: this.formModel,
      }),
    );
    this.controller.setMainComponent(el);
  }

  refreshSidebarButtons(): void {
    let s = this.strings;
    var buttons: any[] = [
      {
        label: s.get("GUI:StartGame"),
        tooltip: s.get("STT:SkirmishButtonStartGame"),
        disabled: false,
        onClick: () => {
          if (this.gameOpts.aiPlayers.filter(isNotNullOrUndefined).length < 1)
            this.messageBoxApi.show(
              this.strings.get("TXT_NEED_AT_LEAST_TWO_PLAYERS"),
              this.strings.get("GUI:Ok"),
            );
          else if (this.meetsMinimumTeams())
            this.rootController.createGame(
              "0",
              Date.now(),
              void 0,
              this.playerName,
              this.gameOpts,
              true,
              false,
              false,
              false,
              new MainMenuRoute(ScreenType.Skirmish),
            );
          else
            this.messageBoxApi.show(
              this.strings.get("TXT_CANNOT_ALLY"),
              this.strings.get("GUI:Ok"),
            );
        },
      },
      {
        label: s.get("GUI:ChooseMap"),
        tooltip: s.get("STT:SkirmishButtonChooseMap"),
        onClick: () => {
          this.controller?.pushScreen(ScreenType.MapSelection, {
            lobbyType: LobbyType.Singleplayer,
            gameOpts: this.gameOpts,
            usedSlots: () =>
              1 +
              findIndexReverse(
                this.slotsInfo,
                (slot: any) =>
                  slot.type === SlotType.Ai || slot.type === SlotType.Player,
              ),
          });
        },
      },
      {
        label: s.get("GUI:Back"),
        tooltip: s.get("STT:SkirmishButtonBack"),
        isBottom: true,
        onClick: () => {
          this.controller?.goToScreen(ScreenType.Home);
        },
      },
    ];
    this.controller.setSidebarButtons(buttons, true);
    this.refreshSidebarMpText();
  }

  meetsMinimumTeams(): boolean {
    let players = [...this.gameOpts.humanPlayers, ...this.gameOpts.aiPlayers]
      .filter(isNotNullOrUndefined)
      .filter((p: any) => p.countryId !== OBS_COUNTRY_ID);
    let team = players[0]?.teamId;
    return (
      players.length < 2 ||
      team === NO_TEAM_ID ||
      players.some((p: any) => p.teamId !== team)
    );
  }

  refreshSidebarMpText(): void {
    this.controller?.setSidebarMpContent({
      text: this.gameOpts
        ? this.strings.get(
            this.gameModes.getById(this.gameOpts.gameMode).label,
          ) +
          "\n\n" +
          this.gameOpts.mapTitle
        : "",
    });
  }

  async onLeave(): Promise<void> {
    this.disposables.dispose();
    this.gameOpts = void 0;
    this.slotsInfo = void 0;
    this.currentMapFile = void 0;
    this.controller.toggleSidebarPreview(false);
    await this.unrender();
  }

  async unrender(): Promise<void> {
    await this.controller.hideSidebarButtons();
    if (this.lobbyForm) this.lobbyForm = void 0;
  }
}
