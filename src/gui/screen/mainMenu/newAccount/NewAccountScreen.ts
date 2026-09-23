/**
 * NewAccountScreen — 创建账号屏（校验 + 注册 API + 登录跳转）。
 *
 * 注册走 apiRegUrl POST；成功后带 useCredentials 跳 Login。
 *
 * 由 gui/screen/mainMenu/newAccount/NewAccountScreen.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { NewAccountBox } from "gui/screen/mainMenu/newAccount/NewAccountBox"; // 孪生（本组内一并转换）
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { sleep } from "util/time"; // 已转换
import { StorageKey } from "LocalPrefs"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { HttpRequest } from "network/HttpRequest"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class NewAccountScreen extends MainMenuScreen {
  /** 应用 locale。 */
  appLocale: any;
  /** i18n 字典。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 消息框。 */
  messageBoxApi: any;
  /** 区域服务。 */
  serverRegions: any;
  /** 错误处理。 */
  errorHandler: any;
  /** 本地偏好。 */
  localPrefs: any;
  /** 表单 ref API。 */
  newAccountBox?: { submit(): void };
  /** 是否忙碌。 */
  isBusy?: boolean;

  constructor(
    appLocale: any,
    strings: any,
    jsxRenderer: any,
    messageBoxApi: any,
    serverRegions: any,
    errorHandler: any,
    localPrefs: any,
  ) {
    super();
    this.appLocale = appLocale;
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.messageBoxApi = messageBoxApi;
    this.serverRegions = serverRegions;
    this.errorHandler = errorHandler;
    this.localPrefs = localPrefs;
    this.title = this.strings.get("GUI:NewAccount");
    this.handleSubmit = async (payload: any, afterLogin: any) => {
      if (!this.isBusy && this.controller) {
        this.isBusy = true;
        await this.controller.hideSidebarButtons();
        const { user, pass, passMatch, regionId } = payload;
        if (!passMatch)
          this.handleValidationError(this.strings.get("TXT_PASSWORD_VERIFY"));
        else if (user.match(/^[A-Za-z0-9-_]+$/))
          await this.createAccount(user, pass, regionId, afterLogin);
        else this.handleValidationError(this.strings.get("TS:BadNickname"));
      }
    };
  }

  /** 表单提交入口。 */
  handleSubmit: (payload: any, afterLogin: any) => Promise<void>;

  async onEnter(params: any): Promise<void> {
    this.controller.toggleMainVideo(false);
    this.isBusy = false;
    var regionId =
      params.regionId ??
      this.localPrefs.getItem(StorageKey.PreferredServerRegion);
    var region =
      regionId && this.serverRegions.isAvailable(regionId)
        ? this.serverRegions.get(regionId)
        : this.serverRegions.getFirstAvailable();
    if (region) {
      this.controller.setSidebarButtons([
        { label: this.strings.get("GUI:Ok"), onClick: () => this.submitForm() },
        {
          label: this.strings.get("GUI:Back"),
          isBottom: true,
          onClick: () => {
            this.controller?.goToScreen(ScreenType.Login, {
              afterLogin: params.afterLogin,
            });
          },
        },
      ]);
      this.controller.showSidebarButtons();
      var [el] = this.jsxRenderer.render(
        jsx(HtmlView as any, {
          width: "100%",
          height: "100%",
          component: NewAccountBox,
          props: {
            ref: (e: any) => (this.newAccountBox = e),
            strings: this.strings,
            regions: this.serverRegions.getAll(),
            initialRegion: region,
            onRegionChange: (id: string) => {
              this.localPrefs.setItem(
                StorageKey.PreferredServerRegion,
                id,
              );
            },
            onSubmit: (payload: any) =>
              this.handleSubmit(payload, params.afterLogin),
          },
        }),
      );
      this.controller.setMainComponent(el);
    } else
      this.handleWolError(
        "No servers available",
        this.strings.get("gui:noserversavailable"),
        { fatal: true },
      );
  }

  /** 侧栏 OK 触发表单提交。 */
  submitForm(): void {
    if (!this.isBusy && this.controller) this.newAccountBox?.submit();
  }

  /** 调注册 API，成功跳 Login。 */
  async createAccount(
    user: string,
    pass: string,
    regionId: string,
    afterLogin: any,
  ): Promise<void> {
    var region = this.serverRegions.get(regionId);
    this.serverRegions.setSelectedRegion(regionId);
    let connecting = new Task(async (cancel) => {
      await sleep(1000);
      if (!cancel.isCancelled())
        this.messageBoxApi.show(this.strings.get("TXT_CONNECTING"));
    });
    connecting.start();
    try {
      var body = { locale: this.appLocale, user, pass };
      var res = await new HttpRequest().fetchJson(region.apiRegUrl, void 0, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const resAny = res as any;
      if ((connecting.cancel(), this.messageBoxApi.destroy(), resAny.error))
        return void this.handleValidationError(resAny.error);
      this.controller?.goToScreen(ScreenType.Login, {
        useCredentials: { regionId: region.id, user, pass },
        afterLogin,
      });
    } catch (e) {
      connecting.cancel();
      this.messageBoxApi.destroy();
      this.handleWolError(e, this.strings.get("TS:ConnectFailed"), {
        fatal: false,
      });
    }
  }

  /** 校验失败提示（恢复侧栏）。 */
  handleValidationError(message: string): void {
    this.messageBoxApi.show(message, this.strings.get("GUI:Ok"), () => {
      this.isBusy = false;
      this.controller?.showSidebarButtons();
    });
  }

  /** WOL 错误统一处理。 */
  handleWolError(
    error: any,
    message: string,
    { fatal }: { fatal: boolean },
  ): void {
    this.errorHandler.handle(error, message, () => {
      this.isBusy = false;
      if (this.controller)
        fatal
          ? this.controller.goToScreen(ScreenType.Home)
          : this.controller.showSidebarButtons();
    });
  }

  async onLeave(): Promise<void> {
    this.newAccountBox = void 0;
    if (!this.isBusy && this.controller)
      await this.controller.hideSidebarButtons();
    this.isBusy = false;
  }
}
