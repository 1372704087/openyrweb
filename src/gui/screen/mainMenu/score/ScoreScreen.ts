/**
 * ScoreScreen — 结算页（单人/多人标题、侧栏继续、轮询战报）。
 *
 * 按阵营选背景 sprite；多人时 Task 每秒拉 WolService.getLastGameReport。
 * onLeave 处理捐赠提示计数（DonateBoxState）。
 *
 * 由 gui/screen/mainMenu/score/ScoreScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { ScoreTable } from "gui/screen/mainMenu/score/ScoreTable"; // 孪生（本组内一并转换）
import { SideType } from "game/SideType"; // 已转换
import { MusicType } from "engine/sound/Music"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { StorageKey } from "LocalPrefs"; // 已转换
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation/OperationCanceledError"; // 已转换
import { sleep } from "@puzzl/core/lib/async/sleep"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 阵营 → 结算背景图。 */
const BG_BY_SIDE = new Map<any, { img: string; pal: string }>([
  [SideType.GDI, { img: "mpascrnl.shp", pal: "mpascrn.pal" }],
  [SideType.Nod, { img: "mpsscrnl.shp", pal: "mpsscrn.pal" }],
  [SideType.ThirdSide, { img: "mpyscrnl.shp", pal: "mpyscrn.pal" }],
]);

export class ScoreScreen extends MainMenuScreen {
  /** i18n 字典。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 消息框。 */
  messageBoxApi: any;
  /** 本地偏好。 */
  localPrefs: any;
  /** 配置。 */
  config: any;
  /** WOL 服务。 */
  wolService: any;
  /** 背景音乐。 */
  musicType?: any;
  /** 结算表视图。 */
  scoreTable?: any;
  /** 战报轮询任务。 */
  reportUpdateTask?: any;

  constructor(
    strings: any,
    jsxRenderer: any,
    messageBoxApi: any,
    localPrefs: any,
    config: any,
    wolService: any,
  ) {
    super();
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.messageBoxApi = messageBoxApi;
    this.localPrefs = localPrefs;
    this.config = config;
    this.wolService = wolService;
    this.musicType = MusicType.Score;
  }

  async onEnter(params: any): Promise<void> {
    this.title = params.singlePlayer
      ? this.strings.get("GUI:SkirmishScore")
      : this.strings.get("GUI:MultiplayerScore");
    this.controller.toggleMainVideo(false);
    this.initView(params);
    if (!params.singlePlayer) this.loadGameReport(params.game);
  }

  /** 侧栏继续 + 阵营背景 + ScoreTable。 */
  initView({
    game,
    localPlayer,
    isQuit,
    singlePlayer,
    tournament,
    returnTo,
  }: any): void {
    this.controller.setSidebarButtons([
      {
        label: this.strings.get("GUI:Continue"),
        tooltip: this.strings.get("STT:MPScoreButtonContinue"),
        isBottom: true,
        onClick: () => {
          this.controller?.goToScreen(returnTo.screenType, returnTo.params);
        },
      },
    ]);
    this.controller.showSidebarButtons();
    var side = localPlayer.country?.side ?? SideType.GDI;
    var bg = BG_BY_SIDE.get(side);
    if (!bg) throw new Error("Unsupported sideType " + side);
    var [el] = this.jsxRenderer.render(
      jsx(
        "container" as any,
        { width: "100%", height: "100%" },
        jsx("sprite" as any, { image: bg.img, palette: bg.pal }),
        jsx(HtmlView as any, {
          width: "100%",
          height: "100%",
          component: ScoreTable,
          innerRef: (e: any) => (this.scoreTable = e),
          props: {
            game,
            singlePlayer,
            isQuit,
            localPlayer,
            tournament,
            strings: this.strings,
          },
        }),
      ),
    );
    this.controller.setMainComponent(el);
  }

  /** 轮询直至拿到匹配 game.id 的战报（入参为 game 对象，与孪生一致）。 */
  loadGameReport(game: any): void {
    this.reportUpdateTask?.cancel();
    let task = (this.reportUpdateTask = new Task(async (cancel) => {
      for (;;) {
        if (cancel.isCancelled()) return;
        let report = this.wolService.getLastGameReport();
        if (report?.gameId === game.id)
          return void this.scoreTable.applyOptions((opts: any) => {
            opts.gameReport = report;
          });
        await sleep(1000, cancel);
      }
    }));
    task.start().catch((e) => {
      if (!(e instanceof OperationCanceledError)) console.error(e);
    });
  }

  async onLeave(): Promise<void> {
    if (this.reportUpdateTask) {
      this.reportUpdateTask.cancel();
      this.reportUpdateTask = void 0;
    }
    await this.controller.hideSidebarButtons();
    var donateUrl: string | undefined;
    var count: number;
    donateUrl = this.config.donateUrl;
    if (donateUrl) {
      count = Number(this.localPrefs.getItem(StorageKey.DonateBoxState) ?? "0");
      if (2 <= count) {
        var open = await this.messageBoxApi.confirm(
          this.strings.get("TS:DonatePrompt"),
          this.strings.get("TS:DonateNow"),
          this.strings.get("TS:DonateLater"),
        );
        if (open) window.open(donateUrl, "_blank");
        this.localPrefs.setItem(StorageKey.DonateBoxState, "-" + Date.now());
        (window as any).gtag?.("event", "donate_dismiss", { donate: open });
      } else if (0 <= count)
        this.localPrefs.setItem(
          StorageKey.DonateBoxState,
          String(count + 1),
        );
      else {
        count = -count;
        if (Date.now() - count > 2592e6)
          this.localPrefs.setItem(StorageKey.DonateBoxState, "0");
      }
    }
  }
}
