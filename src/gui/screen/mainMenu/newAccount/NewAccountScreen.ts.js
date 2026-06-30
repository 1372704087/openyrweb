// === Reconstructed SystemJS module: gui/screen/mainMenu/newAccount/NewAccountScreen ===
// deps: ["gui/jsx/jsx","gui/screen/mainMenu/newAccount/NewAccountBox","gui/screen/mainMenu/ScreenType","gui/jsx/HtmlView","@puzzl/core/lib/async/Task","util/time","LocalPrefs","gui/screen/mainMenu/MainMenuScreen","network/HttpRequest"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/newAccount/NewAccountScreen",
  [
    "gui/jsx/jsx",
    "gui/screen/mainMenu/newAccount/NewAccountBox",
    "gui/screen/mainMenu/ScreenType",
    "gui/jsx/HtmlView",
    "@puzzl/core/lib/async/Task",
    "util/time",
    "LocalPrefs",
    "gui/screen/mainMenu/MainMenuScreen",
    "network/HttpRequest",
  ],
  function (e, t) {
    "use strict";
    var i, r, l, s, c, h, a, n, u, o;
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
          l = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        ((o = class extends n.MainMenuScreen {
          constructor(e, t, i, r, s, a, n) {
            (super(),
              (this.appLocale = e),
              (this.strings = t),
              (this.jsxRenderer = i),
              (this.messageBoxApi = r),
              (this.serverRegions = s),
              (this.errorHandler = a),
              (this.localPrefs = n),
              (this.title = this.strings.get("GUI:NewAccount")),
              (this.handleSubmit = async (s, a) => {
                if (!this.isBusy && this.controller) {
                  ((this.isBusy = !0), await this.controller.hideSidebarButtons());
                  let { user: e, pass: t, passMatch: i, regionId: r } = s;
                  i
                    ? e.match(/^[A-Za-z0-9-_]+$/)
                      ? await this.createAccount(e, t, r, a)
                      : this.handleValidationError(this.strings.get("TS:BadNickname"))
                    : this.handleValidationError(this.strings.get("TXT_PASSWORD_VERIFY"));
                }
              }));
          }
          async onEnter(t) {
            (this.controller.toggleMainVideo(!1), (this.isBusy = !1));
            var e = t.regionId ?? this.localPrefs.getItem(a.StorageKey.PreferredServerRegion),
              e =
                e && this.serverRegions.isAvailable(e)
                  ? this.serverRegions.get(e)
                  : this.serverRegions.getFirstAvailable();
            e
              ? (this.controller.setSidebarButtons([
                  { label: this.strings.get("GUI:Ok"), onClick: () => this.submitForm() },
                  {
                    label: this.strings.get("GUI:Back"),
                    isBottom: !0,
                    onClick: () => {
                      this.controller?.goToScreen(l.ScreenType.Login, { afterLogin: t.afterLogin });
                    },
                  },
                ]),
                this.controller.showSidebarButtons(),
                ([e] = this.jsxRenderer.render(
                  i.jsx(s.HtmlView, {
                    width: "100%",
                    height: "100%",
                    component: r.NewAccountBox,
                    props: {
                      ref: (e) => (this.newAccountBox = e),
                      strings: this.strings,
                      regions: this.serverRegions.getAll(),
                      initialRegion: e,
                      onRegionChange: (e) => {
                        this.localPrefs.setItem(a.StorageKey.PreferredServerRegion, e);
                      },
                      onSubmit: (e) => this.handleSubmit(e, t.afterLogin),
                    },
                  }),
                )),
                this.controller.setMainComponent(e))
              : this.handleWolError("No servers available", this.strings.get("gui:noserversavailable"), { fatal: !0 });
          }
          submitForm() {
            !this.isBusy && this.controller && this.newAccountBox?.submit();
          }
          async createAccount(e, t, i, r) {
            var s = this.serverRegions.get(i);
            this.serverRegions.setSelectedRegion(i);
            let a = new c.Task(async (e) => {
              (await h.sleep(1e3), e.isCancelled() || this.messageBoxApi.show(this.strings.get("TXT_CONNECTING")));
            });
            a.start();
            try {
              var n = { locale: this.appLocale, user: e, pass: t },
                o = await new u.HttpRequest().fetchJson(s.apiRegUrl, void 0, {
                  method: "POST",
                  body: JSON.stringify(n),
                });
              if ((a.cancel(), this.messageBoxApi.destroy(), o.error)) return void this.handleValidationError(o.error);
              this.controller?.goToScreen(l.ScreenType.Login, {
                useCredentials: { regionId: s.id, user: e, pass: t },
                afterLogin: r,
              });
            } catch (e) {
              (a.cancel(),
                this.messageBoxApi.destroy(),
                this.handleWolError(e, this.strings.get("TS:ConnectFailed"), { fatal: !1 }));
            }
          }
          handleValidationError(e) {
            this.messageBoxApi.show(e, this.strings.get("GUI:Ok"), () => {
              ((this.isBusy = !1), this.controller?.showSidebarButtons());
            });
          }
          handleWolError(e, t, { fatal: i }) {
            this.errorHandler.handle(e, t, () => {
              ((this.isBusy = !1),
                this.controller &&
                  (i ? this.controller.goToScreen(l.ScreenType.Home) : this.controller.showSidebarButtons()));
            });
          }
          async onLeave() {
            ((this.newAccountBox = void 0),
              !this.isBusy && this.controller && (await this.controller.hideSidebarButtons()),
              (this.isBusy = !1));
          }
        }),
          e("NewAccountScreen", o));
      },
    };
  },
);
