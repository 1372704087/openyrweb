/**
 * LoginScreen — 登录屏（区域列表/ping/连接 WOL）。
 *
 * 探针禁止真实登录：仅测构造字段与 onEnter 无凭据路径。
 *
 * 由 gui/screen/mainMenu/login/LoginScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { WolError } from "network/WolError"; // 已转换
import { LoginBox } from "gui/screen/mainMenu/login/LoginBox"; // 孪生（本组内一并转换）
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { sleep } from "@puzzl/core/lib/async/sleep"; // 已转换
import { StorageKey } from "LocalPrefs"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { ServerPings } from "gui/screen/mainMenu/login/ServerPings"; // 孪生（本组内一并转换）
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 已转换
import { MainMenuRoute } from "gui/screen/mainMenu/MainMenuRoute"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 模块级凭据缓存（孪生闭包 p）。 */
let credentials: any = void 0;

export class LoginScreen extends MainMenuScreen {
  wolService: any;
  wladderService: any;
  wgameresService: any;
  mapTransferService: any;
  strings: any;
  jsxRenderer: any;
  messageBoxApi: any;
  serverRegions: any;
  serversUrl: any;
  breakingNewsUrl: any;
  wolLogger: any;
  errorHandler: any;
  localPrefs: any;
  rootController: any;
  devMode: any;
  params?: any;
  isBusy?: boolean;
  formRendered?: boolean;
  selectedRegion?: any;
  serverPings?: any;
  needsServerListRefresh = false;
  loginBoxApi?: any;
  loginBox?: any;
  serversUpdateTask?: any;
  handleLoginSubmit: (user: string, pass: string) => Promise<void>;

  constructor(
    wolService: any,
    wladderService: any,
    wgameresService: any,
    mapTransferService: any,
    strings: any,
    jsxRenderer: any,
    messageBoxApi: any,
    serverRegions: any,
    serversUrl: any,
    breakingNewsUrl: any,
    wolLogger: any,
    errorHandler: any,
    localPrefs: any,
    rootController: any,
    devMode: any,
  ) {
    super();
    this.wolService = wolService;
    this.wladderService = wladderService;
    this.wgameresService = wgameresService;
    this.mapTransferService = mapTransferService;
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.messageBoxApi = messageBoxApi;
    this.serverRegions = serverRegions;
    this.serversUrl = serversUrl;
    this.breakingNewsUrl = breakingNewsUrl;
    this.wolLogger = wolLogger;
    this.errorHandler = errorHandler;
    this.localPrefs = localPrefs;
    this.rootController = rootController;
    this.devMode = devMode;
    this.title = this.strings.get("GUI:Login");
    this.handleLoginSubmit = async (user, pass) => {
      if (
        !this.isBusy &&
        this.loginBoxApi &&
        this.controller &&
        ((this.isBusy = true), this.selectedRegion)
      ) {
        await this.controller.hideSidebarButtons();
        await this.login(user, pass, this.selectedRegion.id);
      }
    };
  }

  async onEnter(params: any): Promise<void> {
    this.params = params;
    this.formRendered = false;
    this.controller.toggleMainVideo(false);
    if (params.clearCredentials) credentials = void 0;
    else if (params.useCredentials) credentials = params.useCredentials;
    try {
      await this.loadServerList();
    } catch (e) {
      return void this.handleWolError(e, this.strings.get("TXT_NO_SERV_LIST"), {
        fatal: true,
      });
    }
    this.needsServerListRefresh = false;
    this.serverPings = new ServerPings(this.serverRegions, this.wolLogger);
    if (credentials && this.serverRegions.isAvailable(credentials.regionId)) {
      this.isBusy = true;
      this.login(credentials.user, credentials.pass, credentials.regionId);
    } else {
      this.isBusy = false;
      this.initView(true);
    }
  }

  async loadServerList(cancel?: any): Promise<void> {
    let showed = false;
    var timer = setTimeout(async () => {
      this.messageBoxApi.show(this.strings.get("TXT_CONNECTING"));
      showed = true;
    }, 1000);
    try {
      var list = await this.wolService.loadServerList(this.serversUrl, cancel);
      if (cancel?.isCancelled()) return;
      this.serverRegions.load(list);
      if (this.selectedRegion)
        this.selectedRegion = this.serverRegions
          .getAll()
          .find((r: any) => r.id === this.selectedRegion.id);
    } finally {
      clearTimeout(timer);
      if (showed) this.messageBoxApi.destroy();
    }
  }

  initView(updateServers = false): void {
    if (!this.controller) return;
    this.updateSidebarButtons();
    if (!this.isBusy) this.controller.showSidebarButtons();
    if (!this.selectedRegion) {
      var pref = this.localPrefs.getItem(StorageKey.PreferredServerRegion);
      var region =
        pref && this.serverRegions.isAvailable(pref)
          ? this.serverRegions.get(pref)
          : this.serverRegions.getFirstAvailable();
      let pings = this.serverPings!.pings;
      if (!region || (pings.has(region) && void 0 === pings.get(region)))
        this.selectedRegion = void 0;
      else this.selectedRegion = region;
    }
    if (updateServers && !this.params.forceUser && this.selectedRegion)
      this.updateServers();
    var [el] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        width: "100%",
        height: "100%",
        component: LoginBox,
        props: {
          ref: (e: any) => (this.loginBoxApi = e),
          regions: this.serverRegions.getAll(),
          selectedRegion: this.selectedRegion,
          selectedUser: this.params.forceUser,
          pings: this.serverPings!.pings,
          breakingNewsUrl: this.breakingNewsUrl,
          strings: this.strings,
          onRegionChange: (id: string) => {
            this.selectedRegion = this.serverRegions.get(id);
            this.loginBox?.applyOptions((o: any) => {
              o.selectedRegion = this.selectedRegion;
            });
            this.updateSidebarButtons();
          },
          onRequestRegionRefresh: () => {
            this.needsServerListRefresh = true;
            this.updateServers();
          },
          onSubmit: this.handleLoginSubmit,
          devMode: this.devMode,
        },
        innerRef: (e: any) => (this.loginBox = e),
      }),
    );
    this.controller.setMainComponent(el);
    this.updateSidebarButtons();
    this.formRendered = true;
  }

  updateSidebarButtons(): void {
    if (!this.controller) return;
    this.controller.setSidebarButtons([
      {
        label: this.strings.get("GUI:Login"),
        disabled: !this.selectedRegion,
        onClick: () => this.submitLoginForm(),
      },
      {
        label: this.strings.get("GUI:NewAccount"),
        disabled: !!this.params.forceUser,
        onClick: () => {
          this.controller?.goToScreen(ScreenType.NewAccount, {
            regionId: this.selectedRegion?.id,
            afterLogin: this.params.afterLogin,
          });
        },
      },
      {
        label: this.strings.get("GUI:Back"),
        isBottom: true,
        onClick: () => {
          this.controller?.goToScreen(ScreenType.Home);
        },
      },
    ]);
  }

  updateServers(): void {
    if (this.isBusy || this.serversUpdateTask) return;
    this.serverPings!.pings.clear();
    this.handleServerPingsUpdate();
    this.serversUpdateTask = new Task(async (cancel) => {
      if (!this.formRendered) await sleep(500, cancel);
      if (this.needsServerListRefresh) {
        this.needsServerListRefresh = false;
        try {
          await this.loadServerList(cancel);
        } catch (e) {
          this.handleWolError(e, this.strings.get("TXT_NO_SERV_LIST"), {
            fatal: true,
          });
          this.serversUpdateTask = void 0;
          return;
        }
      }
      this.loginBox?.applyOptions((o: any) => {
        o.selectedRegion = this.selectedRegion;
        o.regions = this.serverRegions.getAll();
      });
      this.updateSidebarButtons();
      try {
        await this.serverPings!.update(
          () => this.handleServerPingsUpdate(),
          cancel,
        );
      } finally {
        this.serversUpdateTask = void 0;
      }
      this.handleServerPingsUpdate();
    });
    this.serversUpdateTask.start().catch((e) => {
      if (!(e instanceof OperationCanceledError)) console.error(e);
    });
  }

  handleServerPingsUpdate(): void {
    if (!this.loginBoxApi) return;
    var region = this.selectedRegion;
    let pings = this.serverPings!.pings;
    if (region && pings.has(region) && void 0 === pings.get(region)) {
      this.selectedRegion = void 0;
      this.loginBox?.applyOptions((o: any) => {
        o.selectedRegion = void 0;
      });
      this.updateSidebarButtons();
    }
    this.loginBox?.refresh();
  }

  submitLoginForm(): void {
    if (
      !this.isBusy &&
      this.loginBoxApi &&
      this.controller &&
      this.selectedRegion
    )
      this.loginBoxApi.submit();
  }

  async login(user: string, pass: string, regionId: string): Promise<void> {
    if (!user.match(/^[A-Za-z0-9-_]+$/)) {
      this.handleBadPass();
      return;
    }
    this.serversUpdateTask?.cancel();
    this.serversUpdateTask = void 0;
    let connecting = new Task(async (cancel) => {
      await sleep(1000, cancel);
      if (!cancel.isCancelled())
        this.messageBoxApi.show(this.strings.get("TXT_CONNECTING"));
    });
    connecting.start().catch((e) => {
      if (!(e instanceof OperationCanceledError)) console.error(e);
    });
    var region = this.serverRegions.get(regionId);
    this.serverRegions.setSelectedRegion(regionId);
    try {
      await this.wolService.validateGameVersion(region);
    } catch (e) {
      connecting.cancel();
      this.messageBoxApi.destroy();
      let message =
        e instanceof WolError &&
        e.code === (WolError as any).Code.OutdatedClient
          ? this.strings.get("TS:OutdatedClient")
          : this.strings.get("TXT_NO_SERV_LIST");
      return void this.handleWolError(e, message, { fatal: false });
    }
    let userCancelled = false;
    try {
      let msgs: any[] = [];
      if (
        !(
          this.wolService.isConnected() &&
          this.wolService.getConnection().getCurrentUser()
        )
      )
        msgs = await this.wolService.connectAndLogin(
          { url: region.wolUrl, user, pass },
          ({ position, avgWaitSeconds }: any) => {
            connecting.cancel();
            this.messageBoxApi.show(
              this.strings.get("TS:ServerFull") +
                "\n\n\n" +
                this.strings.get("TS:LoginPositionInQueue", position) +
                "\n" +
                this.strings.get("TS:LoginAvgWaitTime") +
                (0 < avgWaitSeconds && avgWaitSeconds < 3600
                  ? this.strings.get(
                      "TS:LoginAvgWaitTimeMinutes",
                      avgWaitSeconds < 60 ? "<1" : "~" + Math.ceil(avgWaitSeconds / 60),
                    )
                  : this.strings.get("TS:LoginAvgWaitTimeUnavail")),
              this.strings.get("GUI:Cancel"),
              () => {
                userCancelled = true;
                this.wolService.closeWolConnection();
              },
            );
          },
        );
      this.wladderService.setUrl(region.wladderUrl);
      this.wgameresService.setUrl(region.wgameresUrl);
      this.mapTransferService.setUrl(region.mapTransferUrl);
      credentials = { user, pass, regionId };
      connecting.cancel();
      this.messageBoxApi.destroy();
      this.localPrefs.setItem(StorageKey.PreferredServerRegion, regionId);
      var route = this.params.afterLogin(msgs);
      if (route instanceof MainMenuRoute)
        this.controller?.goToScreen(route.screenType, route.params);
      else this.rootController.goToScreen(route.screenType, route.params);
    } catch (e: any) {
      connecting.cancel();
      this.messageBoxApi.destroy();
      if (userCancelled) {
        this.isBusy = false;
        if (this.formRendered) {
          this.updateSidebarButtons();
          this.controller?.showSidebarButtons();
        } else this.initView();
        return;
      }
      if (
        e instanceof WolError &&
        e.code === (WolError as any).Code.OutdatedClient
      )
        return void this.handleWolError(e, this.strings.get("TS:OutdatedClient"), {
          fatal: false,
        });
      if (e instanceof WolError && e.code === (WolError as any).Code.BadLogin) {
        this.wolService.closeWolConnection();
        this.handleBadPass();
      } else if (
        e instanceof WolError &&
        e.code === (WolError as any).Code.BannedFromServer
      ) {
        this.wolService.closeWolConnection();
        this.handleLoginError(e.reason ?? "This account is banned");
      } else if (
        e instanceof WolError &&
        e.code === (WolError as any).Code.ServerFull
      )
        this.handleLoginError(this.strings.get("TS:ServerFull"));
      else
        this.handleWolError(e, this.strings.get("TS:ConnectFailed"), {
          fatal: false,
          netError: true,
        });
    }
  }

  handleBadPass(): void {
    this.handleLoginError(this.strings.get("TXT_BADPASS"));
  }

  handleLoginError(message: string): void {
    this.messageBoxApi.show(message, this.strings.get("GUI:Ok"), () => {
      this.isBusy = false;
      if (this.formRendered) {
        this.updateSidebarButtons();
        this.controller.showSidebarButtons();
      } else this.initView();
    });
  }

  handleWolError(
    e: any,
    message: string,
    { fatal, netError }: { fatal: boolean; netError?: boolean },
  ): void {
    this.errorHandler.handle(e, message, () => {
      this.isBusy = false;
      this.serversUpdateTask?.cancel();
      this.serversUpdateTask = void 0;
      this.wolService.closeWolConnection();
      if (fatal) this.controller?.goToScreen(ScreenType.Home);
      else if (this.formRendered) {
        this.updateSidebarButtons();
        this.controller?.showSidebarButtons();
      } else {
        if (netError) this.needsServerListRefresh = true;
        this.initView(!!netError);
      }
    });
  }

  async onLeave(): Promise<void> {
    this.loginBoxApi = null;
    this.loginBox = void 0;
    this.formRendered = false;
    this.serversUpdateTask?.cancel();
    this.serversUpdateTask = void 0;
    if (!this.isBusy) await this.controller.hideSidebarButtons();
    this.isBusy = false;
  }
}
