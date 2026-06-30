// === Reconstructed SystemJS module: gui/screen/mainMenu/login/LoginScreen ===
// deps: ["gui/jsx/jsx","network/WolError","gui/screen/mainMenu/login/LoginBox","gui/screen/mainMenu/ScreenType","gui/jsx/HtmlView","@puzzl/core/lib/async/Task","@puzzl/core/lib/async/sleep","LocalPrefs","gui/screen/mainMenu/MainMenuScreen","gui/screen/mainMenu/login/ServerPings","@puzzl/core/lib/async/cancellation","gui/screen/mainMenu/MainMenuRoute"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/login/LoginScreen",
  [
    "gui/jsx/jsx",
    "network/WolError",
    "gui/screen/mainMenu/login/LoginBox",
    "gui/screen/mainMenu/ScreenType",
    "gui/jsx/HtmlView",
    "@puzzl/core/lib/async/Task",
    "@puzzl/core/lib/async/sleep",
    "LocalPrefs",
    "gui/screen/mainMenu/MainMenuScreen",
    "gui/screen/mainMenu/login/ServerPings",
    "@puzzl/core/lib/async/cancellation",
    "gui/screen/mainMenu/MainMenuRoute",
  ],
  function (e, t) {
    "use strict";
    var i, l, r, s, a, c, h, u, n, o, d, g, p, m;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          l = e;
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
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        ((p = void 0),
          (m = class extends n.MainMenuScreen {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p) {
              (super(),
                (this.wolService = e),
                (this.wladderService = t),
                (this.wgameresService = i),
                (this.mapTransferService = r),
                (this.strings = s),
                (this.jsxRenderer = a),
                (this.messageBoxApi = n),
                (this.serverRegions = o),
                (this.serversUrl = l),
                (this.breakingNewsUrl = c),
                (this.wolLogger = h),
                (this.errorHandler = u),
                (this.localPrefs = d),
                (this.rootController = g),
                (this.devMode = p),
                (this.title = this.strings.get("GUI:Login")),
                (this.needsServerListRefresh = !1),
                (this.handleLoginSubmit = async (e, t) => {
                  var i;
                  !this.isBusy &&
                    this.loginBoxApi &&
                    this.controller &&
                    ((this.isBusy = !0),
                    (i = this.selectedRegion) &&
                      (await this.controller.hideSidebarButtons(), await this.login(e, t, i.id)));
                }));
            }
            async onEnter(e) {
              ((this.params = e),
                (this.formRendered = !1),
                this.controller.toggleMainVideo(!1),
                e.clearCredentials ? (p = void 0) : e.useCredentials && (p = e.useCredentials));
              try {
                await this.loadServerList();
              } catch (e) {
                return void this.handleWolError(e, this.strings.get("TXT_NO_SERV_LIST"), { fatal: !0 });
              }
              ((this.needsServerListRefresh = !1),
                (this.serverPings = new o.ServerPings(this.serverRegions, this.wolLogger)),
                p && this.serverRegions.isAvailable(p.regionId)
                  ? ((this.isBusy = !0), this.login(p.user, p.pass, p.regionId))
                  : ((this.isBusy = !1), this.initView(!0)));
            }
            async loadServerList(e) {
              let t = !1;
              var i = setTimeout(async () => {
                (this.messageBoxApi.show(this.strings.get("TXT_CONNECTING")), (t = !0));
              }, 1e3);
              try {
                var r = await this.wolService.loadServerList(this.serversUrl, e);
                if (e?.isCancelled()) return;
                (this.serverRegions.load(r),
                  this.selectedRegion &&
                    (this.selectedRegion = this.serverRegions.getAll().find((e) => e.id === this.selectedRegion.id)));
              } finally {
                (clearTimeout(i), t && this.messageBoxApi.destroy());
              }
            }
            initView(e = !1) {
              if (this.controller) {
                if (
                  (this.updateSidebarButtons(),
                  this.isBusy || this.controller.showSidebarButtons(),
                  !this.selectedRegion)
                ) {
                  var t = this.localPrefs.getItem(u.StorageKey.PreferredServerRegion),
                    t =
                      t && this.serverRegions.isAvailable(t)
                        ? this.serverRegions.get(t)
                        : this.serverRegions.getFirstAvailable();
                  let e = this.serverPings.pings;
                  !t || (e.has(t) && void 0 === e.get(t)) ? (this.selectedRegion = void 0) : (this.selectedRegion = t);
                }
                e && !this.params.forceUser && this.selectedRegion && this.updateServers();
                var [t] = this.jsxRenderer.render(
                  i.jsx(a.HtmlView, {
                    width: "100%",
                    height: "100%",
                    component: r.LoginBox,
                    props: {
                      ref: (e) => (this.loginBoxApi = e),
                      regions: this.serverRegions.getAll(),
                      selectedRegion: this.selectedRegion,
                      selectedUser: this.params.forceUser,
                      pings: this.serverPings.pings,
                      breakingNewsUrl: this.breakingNewsUrl,
                      strings: this.strings,
                      onRegionChange: (e) => {
                        ((this.selectedRegion = this.serverRegions.get(e)),
                          this.loginBox?.applyOptions((e) => (e.selectedRegion = this.selectedRegion)),
                          this.updateSidebarButtons());
                      },
                      onRequestRegionRefresh: () => {
                        ((this.needsServerListRefresh = !0), this.updateServers());
                      },
                      onSubmit: this.handleLoginSubmit,
                      devMode: this.devMode,
                    },
                    innerRef: (e) => (this.loginBox = e),
                  }),
                );
                (this.controller.setMainComponent(t), this.updateSidebarButtons(), (this.formRendered = !0));
              }
            }
            updateSidebarButtons() {
              this.controller &&
                this.controller.setSidebarButtons([
                  {
                    label: this.strings.get("GUI:Login"),
                    disabled: !this.selectedRegion,
                    onClick: () => {
                      this.submitLoginForm();
                    },
                  },
                  {
                    label: this.strings.get("GUI:NewAccount"),
                    disabled: !!this.params.forceUser,
                    onClick: () => {
                      this.controller?.goToScreen(s.ScreenType.NewAccount, {
                        regionId: this.selectedRegion?.id,
                        afterLogin: this.params.afterLogin,
                      });
                    },
                  },
                  {
                    label: this.strings.get("GUI:Back"),
                    isBottom: !0,
                    onClick: () => {
                      this.controller?.goToScreen(s.ScreenType.Home);
                    },
                  },
                ]);
            }
            updateServers() {
              this.isBusy ||
                this.serversUpdateTask ||
                (this.serverPings.pings.clear(),
                this.handleServerPingsUpdate(),
                (this.serversUpdateTask = new c.Task(async (e) => {
                  if ((this.formRendered || (await h.sleep(500, e)), this.needsServerListRefresh)) {
                    this.needsServerListRefresh = !1;
                    try {
                      await this.loadServerList(e);
                    } catch (e) {
                      return (
                        this.handleWolError(e, this.strings.get("TXT_NO_SERV_LIST"), { fatal: !0 }),
                        void (this.serversUpdateTask = void 0)
                      );
                    }
                  }
                  (this.loginBox?.applyOptions((e) => {
                    ((e.selectedRegion = this.selectedRegion), (e.regions = this.serverRegions.getAll()));
                  }),
                    this.updateSidebarButtons());
                  try {
                    await this.serverPings.update(() => this.handleServerPingsUpdate(), e);
                  } finally {
                    this.serversUpdateTask = void 0;
                  }
                  this.handleServerPingsUpdate();
                })),
                this.serversUpdateTask.start().catch((e) => {
                  e instanceof d.OperationCanceledError || console.error(e);
                }));
            }
            handleServerPingsUpdate() {
              if (this.loginBoxApi) {
                var t = this.selectedRegion;
                let e = this.serverPings.pings;
                (t &&
                  e.has(t) &&
                  void 0 === e.get(t) &&
                  ((this.selectedRegion = void 0),
                  this.loginBox?.applyOptions((e) => (e.selectedRegion = void 0)),
                  this.updateSidebarButtons()),
                  this.loginBox?.refresh());
              }
            }
            submitLoginForm() {
              !this.isBusy && this.loginBoxApi && this.controller && this.selectedRegion && this.loginBoxApi.submit();
            }
            async login(t, s, a) {
              if (t.match(/^[A-Za-z0-9-_]+$/)) {
                (this.serversUpdateTask?.cancel(), (this.serversUpdateTask = void 0));
                let i = new c.Task(async (e) => {
                  (await h.sleep(1e3, e),
                    e.isCancelled() || this.messageBoxApi.show(this.strings.get("TXT_CONNECTING")));
                });
                i.start().catch((e) => {
                  e instanceof d.OperationCanceledError || console.error(e);
                });
                var n = this.serverRegions.get(a);
                this.serverRegions.setSelectedRegion(a);
                try {
                  await this.wolService.validateGameVersion(n);
                } catch (e) {
                  (i.cancel(), this.messageBoxApi.destroy());
                  let t;
                  return (
                    (t =
                      e instanceof l.WolError && e.code === l.WolError.Code.OutdatedClient
                        ? this.strings.get("TS:OutdatedClient")
                        : this.strings.get("TXT_NO_SERV_LIST")),
                    void this.handleWolError(e, t, { fatal: !1 })
                  );
                }
                let r = !1;
                try {
                  let e = [];
                  ((this.wolService.isConnected() && this.wolService.getConnection().getCurrentUser()) ||
                    ((e = await this.wolService.connectAndLogin(
                      { url: n.wolUrl, user: t, pass: s },
                      ({ position: e, avgWaitSeconds: t }) => {
                        (i.cancel(),
                          this.messageBoxApi.show(
                            this.strings.get("TS:ServerFull") +
                              "\n\n\n" +
                              this.strings.get("TS:LoginPositionInQueue", e) +
                              "\n" +
                              this.strings.get("TS:LoginAvgWaitTime") +
                              (0 < t && t < 3600
                                ? this.strings.get(
                                    "TS:LoginAvgWaitTimeMinutes",
                                    t < 60 ? "<1" : "~" + Math.ceil(t / 60),
                                  )
                                : this.strings.get("TS:LoginAvgWaitTimeUnavail")),
                            this.strings.get("GUI:Cancel"),
                            () => {
                              ((r = !0), this.wolService.closeWolConnection());
                            },
                          ));
                      },
                    )),
                    this.wladderService.setUrl(n.wladderUrl),
                    this.wgameresService.setUrl(n.wgameresUrl),
                    this.mapTransferService.setUrl(n.mapTransferUrl),
                    (p = { user: t, pass: s, regionId: a })),
                    i.cancel(),
                    this.messageBoxApi.destroy(),
                    this.localPrefs.setItem(u.StorageKey.PreferredServerRegion, a));
                  var o = this.params.afterLogin(e);
                  o instanceof g.MainMenuRoute
                    ? this.controller?.goToScreen(o.screenType, o.params)
                    : this.rootController.goToScreen(o.screenType, o.params);
                } catch (e) {
                  if ((i.cancel(), this.messageBoxApi.destroy(), r))
                    return (
                      (this.isBusy = !1),
                      void (this.formRendered
                        ? (this.updateSidebarButtons(), this.controller?.showSidebarButtons())
                        : this.initView())
                    );
                  if (e instanceof l.WolError && e.code === l.WolError.Code.OutdatedClient)
                    return void this.handleWolError(e, this.strings.get("TS:OutdatedClient"), { fatal: !1 });
                  e instanceof l.WolError && e.code === l.WolError.Code.BadLogin
                    ? (this.wolService.closeWolConnection(), this.handleBadPass())
                    : e instanceof l.WolError && e.code === l.WolError.Code.BannedFromServer
                      ? (this.wolService.closeWolConnection(),
                        this.handleLoginError(e.reason ?? "This account is banned"))
                      : e instanceof l.WolError && e.code === l.WolError.Code.ServerFull
                        ? this.handleLoginError(this.strings.get("TS:ServerFull"))
                        : this.handleWolError(e, this.strings.get("TS:ConnectFailed"), { fatal: !1, netError: !0 });
                }
              } else this.handleBadPass();
            }
            handleBadPass() {
              this.handleLoginError(this.strings.get("TXT_BADPASS"));
            }
            handleLoginError(e) {
              this.messageBoxApi.show(e, this.strings.get("GUI:Ok"), () => {
                ((this.isBusy = !1),
                  this.formRendered
                    ? (this.updateSidebarButtons(), this.controller.showSidebarButtons())
                    : this.initView());
              });
            }
            handleWolError(e, t, { fatal: i, netError: r }) {
              this.errorHandler.handle(e, t, () => {
                ((this.isBusy = !1),
                  this.serversUpdateTask?.cancel(),
                  (this.serversUpdateTask = void 0),
                  this.wolService.closeWolConnection(),
                  i
                    ? this.controller?.goToScreen(s.ScreenType.Home)
                    : this.formRendered
                      ? (this.updateSidebarButtons(), this.controller?.showSidebarButtons())
                      : (r && (this.needsServerListRefresh = !0), this.initView(r)));
              });
            }
            async onLeave() {
              ((this.loginBoxApi = null),
                (this.loginBox = void 0),
                (this.formRendered = !1),
                this.serversUpdateTask?.cancel(),
                (this.serversUpdateTask = void 0),
                this.isBusy || (await this.controller.hideSidebarButtons()),
                (this.isBusy = !1));
            }
          }),
          e("LoginScreen", m));
      },
    };
  },
);
