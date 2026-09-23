/**
 * LadderScreen — 天梯主屏（赛季/分组/分页/搜索）。
 *
 * PLAYERS_PER_PAGE=20；runTaskAsync 期间 UI disabled；
 * 404 的 rungSearch 视为空列表。
 *
 * 由 gui/screen/mainMenu/ladder/LadderScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 已转换
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { jsx } from "gui/jsx/jsx"; // 孪生
import { LadderType } from "network/ladder/wladderConfig"; // 已转换
import { WLadderService } from "network/ladder/WLadderService"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { Ladder } from "gui/screen/mainMenu/ladder/component/Ladder"; // 孪生（本组内一并转换）
import { DownloadError } from "network/HttpRequest"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class LadderScreen extends MainMenuScreen {
  /** 每页人数（静态）。 */
  static PLAYERS_PER_PAGE = 20;

  /** 天梯服务。 */
  wladderService: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 错误处理。 */
  errorHandler: any;
  /** 消息框。 */
  messageBoxApi: any;
  /** 区域服务。 */
  serverRegions: any;
  /** i18n 字典。 */
  strings: any;
  /** 客户端 locale。 */
  clientLocale: any;
  /** 清理器。 */
  disposables = new CompositeDisposable();
  /** 当前赛季号。 */
  season?: any;
  /** 赛季详情。 */
  seasonDetails?: any;
  /** 分组类型。 */
  selectedLadderType?: any;
  /** 当前分组。 */
  selectedLadder?: any;
  /** 高亮玩家。 */
  selectedPlayer?: any;
  /** 页起始。 */
  startIndex?: number;
  /** 总人数。 */
  totalCount?: number;
  /** 是否忙碌。 */
  isBusy?: boolean;
  /** 视图 ref。 */
  ladder?: any;
  /** 异步任务。 */
  asyncTask?: any;

  constructor(
    wladderService: any,
    jsxRenderer: any,
    errorHandler: any,
    messageBoxApi: any,
    serverRegions: any,
    strings: any,
    clientLocale: any,
  ) {
    super();
    this.wladderService = wladderService;
    this.jsxRenderer = jsxRenderer;
    this.errorHandler = errorHandler;
    this.messageBoxApi = messageBoxApi;
    this.serverRegions = serverRegions;
    this.strings = strings;
    this.clientLocale = clientLocale;
    this.title = this.strings.get("GUI:Ladder");
    this.disposables = new CompositeDisposable();
  }

  async onEnter(params: any): Promise<void> {
    this.ladder = void 0;
    this.isBusy = false;
    this.season = WLadderService.CURRENT_SEASON;
    this.selectedLadderType = params.ladderType;
    this.selectedLadder = params.highlightPlayer?.ladder;
    this.selectedPlayer = params.highlightPlayer;
    this.startIndex = this.computePageStartIndex(
      params.highlightPlayer?.rank,
    );
    this.initSidebar();
    this.initView();
    try {
      await this.fetchInitial(
        this.selectedLadderType,
        this.season,
        this.selectedLadder,
        params.highlightPlayer,
        this.startIndex,
      );
    } catch (e) {
      if (!(e instanceof OperationCanceledError))
        this.handleError(e, this.strings.get("TS:DownloadFailed"), {
          fatal: true,
        });
    }
  }

  /** 按排名算页起始（1-based）。 */
  computePageStartIndex(rank?: number): number {
    let start = 1;
    if (void 0 !== rank)
      start +=
        Math.floor((rank - 1) / LadderScreen.PLAYERS_PER_PAGE) *
        LadderScreen.PLAYERS_PER_PAGE;
    return start;
  }

  initSidebar(): void {
    this.controller?.setSidebarButtons([
      {
        label: this.strings.get("GUI:Back"),
        isBottom: true,
        onClick: () => {
          this.controller?.popScreen();
        },
      },
    ]);
    this.controller?.showSidebarButtons();
  }

  /** 首次加载：赛季列表 + 详情 + 首页。 */
  async fetchInitial(
    ladderType: any,
    season: any,
    ladder: any,
    highlight: any,
    start: number,
  ): Promise<void> {
    await this.runTaskAsync(async (cancel) => {
      let seasons = await this.wladderService.getSeasons(cancel);
      let details = await this.wladderService.getSeason(
        season,
        this.clientLocale,
        cancel,
      );
      this.seasonDetails = details;
      if (
        this.selectedLadderType &&
        !details.ladders.some((l: any) => l.type === this.selectedLadderType)
      )
        this.selectedLadderType = details.ladders[0]?.type;
      let list = this.buildLadderList(ladderType, details, ladder);
      if ((ladder = this.selectedLadder = ladder ? list.find((l) => l.id === ladder.id) : void 0)) {
        try {
          var page = await this.wladderService.rungSearch(
            start,
            LadderScreen.PLAYERS_PER_PAGE + 1,
            ladderType,
            season,
            ladder.id,
            cancel,
          );
          this.updateView(
            { head: ladder, players: page, start },
            highlight,
            details,
            list,
          );
        } catch (e) {
          if (!(e instanceof DownloadError && 404 === e.statusCode)) throw e;
          this.updateView(void 0, highlight, details, list);
        }
      } else this.updateView(void 0, highlight, details, list);
      if (1 < seasons.length)
        this.ladder?.applyOptions((opts: any) => {
          opts.seasons = seasons;
        });
    });
  }

  /** 合并当前类型 + 特选/高亮分组。 */
  buildLadderList(
    ladderType: any,
    details: any,
    preferred?: any,
    highlightLadder?: any,
  ) {
    let list = details.ladders.filter((l: any) => l.type === ladderType);
    if (preferred && !list.some((l) => l.id === preferred.id))
      list.push(preferred);
    let fromHighlight = highlightLadder?.ladder;
    if (
      fromHighlight &&
      fromHighlight !== preferred &&
      !list.some((l) => l.id === fromHighlight.id)
    )
      list.push(fromHighlight);
    return list;
  }

  /** 赛季/分组/搜索切换入口。 */
  fetchSeasonLadder(
    season: any,
    ladder: any,
    search: any,
    reason: "season" | "ladder" | "search" | "type",
  ): void {
    this.runTaskAsync(async (cancel) => {
      let details = this.seasonDetails;
      if ("season" === reason) {
        details = await this.wladderService.getSeason(
          season,
          this.clientLocale,
          cancel,
        );
        this.seasonDetails = details;
        if (
          this.selectedLadderType &&
          !details.ladders.some((l: any) => l.type === this.selectedLadderType)
        )
          this.selectedLadderType = details.ladders[0]?.type;
      }
      let found: any;
      if ("ladder" !== reason && search) {
        var name = "string" == typeof search ? search : search.name;
        if (
          this.selectedLadderType ||
          details?.ladders.some((l: any) => l.type === LadderType.Solo1v1)
        )
          [found] = await this.wladderService.listSearch(
            [name],
            cancel,
            this.selectedLadderType,
            season,
            this.clientLocale,
          );
        if ("search" === reason) {
          if (!found || !found.rank)
            return void this.messageBoxApi.show(
              this.strings.get("TXT_NOT_IN_LADDER"),
              this.strings.get("GUI:OK"),
            );
          this.selectedPlayer = found;
        } else if (found) this.selectedPlayer = found;
        ladder = found?.ladder;
      }
      let list: any;
      if (details) {
        list = this.buildLadderList(
          this.selectedLadderType,
          details,
          ladder,
          found ??
            ("ladder" === reason ? this.selectedPlayer : void 0),
        );
        ladder = this.selectedLadder = ladder
          ? list.find((l: any) => l.id === ladder.id)
          : list[0];
      }
      if (ladder) {
        let start = 1;
        if (found) start = this.computePageStartIndex(found.rank);
        var page = await this.wladderService.rungSearch(
          start,
          LadderScreen.PLAYERS_PER_PAGE + 1,
          this.selectedLadderType,
          season,
          ladder.id,
          cancel,
        );
        this.updateView(
          { head: ladder, players: page, start },
          found ?? this.selectedPlayer,
          this.seasonDetails,
          list,
        );
      } else
        this.updateView(
          void 0,
          found ?? this.selectedPlayer,
          this.seasonDetails,
          list,
        );
    }).catch((e) => {
      if (!(e instanceof OperationCanceledError))
        this.handleError(e, this.strings.get("TS:DownloadFailed"));
    });
  }

  /** 翻页。 */
  fetchLadderPage(start: number): void {
    this.runTaskAsync(async (cancel) => {
      var page;
      if (void 0 !== this.selectedLadder) {
        page = await this.wladderService.rungSearch(
          start,
          LadderScreen.PLAYERS_PER_PAGE + 1,
          this.selectedLadderType,
          this.season,
          this.selectedLadder.id,
          cancel,
        );
        this.updateView(
          { head: this.selectedLadder, players: page, start },
          this.selectedPlayer,
        );
      }
    }).catch((e) => {
      if (!(e instanceof OperationCanceledError))
        this.handleError(e, this.strings.get("TS:DownloadFailed"));
    });
  }

  /** 串行任务 + UI 禁用。 */
  async runTaskAsync(fn: (cancel: any) => Promise<any>): Promise<any> {
    this.asyncTask?.cancel();
    let task = (this.asyncTask = new Task(fn));
    try {
      this.isBusy = true;
      this.ladder?.applyOptions((opts: any) => (opts.disabled = true));
      await task.start();
    } finally {
      this.isBusy = false;
      this.ladder?.applyOptions((opts: any) => (opts.disabled = false));
    }
    return task;
  }

  initView(): void {
    var [el] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        component: Ladder,
        innerRef: (e: any) => (this.ladder = e),
        props: {
          players: void 0,
          highlightPlayer: this.selectedPlayer?.name,
          hasPrevPage: false,
          hasNextPage: false,
          seasons: void 0,
          selectedSeason: this.season,
          seasonDetails: this.seasonDetails,
          ladders: void 0,
          selectedLadder: this.selectedLadder,
          strings: this.strings,
          serverRegion: this.serverRegions.getSelectedRegion(),
          disabled: this.isBusy,
          onFirstPageClick: () => {
            if (this.ladder) this.fetchLadderPage(1);
          },
          onPrevPageClick: () => {
            if (this.ladder)
              this.fetchLadderPage(
                Math.max(1, this.startIndex! - LadderScreen.PLAYERS_PER_PAGE),
              );
          },
          onNextPageClick: () => {
            if (this.ladder)
              this.fetchLadderPage(
                this.startIndex! + LadderScreen.PLAYERS_PER_PAGE,
              );
          },
          onLastPageClick: () => {
            if (this.ladder && void 0 !== this.totalCount)
              this.fetchLadderPage(
                this.computePageStartIndex(this.totalCount),
              );
          },
          onPlayerSearch: (name: string) => {
            if (this.ladder)
              this.fetchSeasonLadder(
                this.season,
                this.selectedLadder,
                name,
                "search",
              );
          },
          onSeasonSelect: (season: any) => {
            this.season = season;
            if (this.ladder)
              this.fetchSeasonLadder(
                season,
                this.selectedLadder,
                this.selectedPlayer,
                "season",
              );
          },
          onLadderSelect: (ladder: any) => {
            this.selectedLadder = ladder;
            if (this.ladder)
              this.fetchSeasonLadder(
                this.season,
                ladder,
                this.selectedPlayer,
                "ladder",
              );
          },
          onLadderTypeSelect: (type: any) => {
            this.selectedLadderType = type;
            this.selectedLadder = void 0;
            if (this.ladder)
              this.fetchSeasonLadder(
                this.season,
                this.selectedLadder,
                this.selectedPlayer,
                "type",
              );
          },
        },
      }),
    );
    this.controller?.setMainComponent(el);
  }

  /** 把数据推到 Ladder 视图。 */
  updateView(
    page: any,
    highlight?: any,
    details?: any,
    ladders?: any[],
  ): void {
    this.startIndex = page?.start ?? 0;
    this.totalCount = page?.players.totalCount ?? 0;
    this.ladder?.applyOptions((opts: any) => {
      if (details) {
        opts.seasonDetails = details;
        opts.selectedSeason = this.season;
      }
      if (ladders) opts.ladders = ladders;
      opts.selectedLadder = page?.head;
      opts.highlightPlayer = highlight?.name;
      opts.players =
        page?.players.records.slice(0, LadderScreen.PLAYERS_PER_PAGE) ?? [];
      opts.hasPrevPage = 1 < this.startIndex!;
      opts.hasNextPage =
        (page?.players.records.length ?? 0) > LadderScreen.PLAYERS_PER_PAGE;
    });
  }

  handleError(
    error: any,
    message: string,
    { fatal }: { fatal?: boolean } = {},
  ): void {
    this.errorHandler.handle(error, message, () => {
      if (fatal) this.controller?.popScreen();
    });
  }

  async onLeave(): Promise<void> {
    this.disposables.dispose();
    this.ladder = void 0;
    if (this.asyncTask) {
      this.asyncTask.cancel();
      this.asyncTask = void 0;
    }
    await this.controller?.hideSidebarButtons();
  }
}
