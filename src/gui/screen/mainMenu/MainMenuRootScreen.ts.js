// === Reconstructed SystemJS module: gui/screen/mainMenu/MainMenuRootScreen ===
// deps: ["gui/jsx/jsx","gui/screen/mainMenu/component/MainMenu","gui/screen/mainMenu/MainMenuController","gui/screen/mainMenu/ScreenType","engine/resourceConfigs","util/disposable/CompositeDisposable","@puzzl/core/lib/async/Task","@puzzl/core/lib/async/cancellation","gui/jsx/HtmlView","gui/screen/mainMenu/component/PrefetchProgress","@puzzl/core/lib/async/sleep","gui/screen/RootScreen"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/MainMenuRootScreen",
  [
    "gui/jsx/jsx",
    "gui/screen/mainMenu/component/MainMenu",
    "gui/screen/mainMenu/MainMenuController",
    "gui/screen/mainMenu/ScreenType",
    "engine/resourceConfigs",
    "util/disposable/CompositeDisposable",
    "@puzzl/core/lib/async/Task",
    "@puzzl/core/lib/async/cancellation",
    "gui/jsx/HtmlView",
    "gui/screen/mainMenu/component/PrefetchProgress",
    "@puzzl/core/lib/async/sleep",
    "gui/screen/RootScreen",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, u, o, l, c, h, d, g, p;
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
          u = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        ((p = class extends g.RootScreen {
          constructor(e, t, i, r, s, a, n, o, l, c, h) {
            (super(),
              (this.subScreens = e),
              (this.uiScene = t),
              (this.gameResConfig = i),
              (this.strings = r),
              (this.images = s),
              (this.jsxRenderer = a),
              (this.videoSrc = n),
              (this.cdnResourceLoader = o),
              (this.sound = l),
              (this.music = c),
              (this.sentry = h),
              (this.prefetched = !1),
              (this.disposables = new u.CompositeDisposable()));
          }
          createView() {
            var e;
            ((this.mainMenu = new r.MainMenu(this.uiScene.menuViewport, this.images, this.jsxRenderer, this.videoSrc)),
              !this.prefetched &&
                this.gameResConfig.isCdn() &&
                (([e] = this.jsxRenderer.render(
                  i.jsx(c.HtmlView, {
                    component: h.PrefetchProgress,
                    ref: (e) => (this.prefetchProgressView = e),
                    props: { progress: 0, statusText: this.strings.get("TS:Preloading") },
                  }),
                )),
                (this.prefetchProgressEl = e),
                (this.prefetched = !0),
                this.updatePrefetchProgressViewport()));
          }
          createViewAndController() {
            return (
              this.createView(),
              (this.mainMenuCtrl = new s.MainMenuController(this.mainMenu, this.sound, this.music)),
              this.mainMenuCtrl.onScreenChange.subscribe((e) =>
                this.sentry?.addBreadcrumb({
                  category: "ui",
                  message: void 0 !== e ? "Navigated to screen " + a.ScreenType[e] : "Navigated to previous screen",
                  level: "info",
                }),
              ),
              this.mainMenuCtrl
            );
          }
          onViewportChange() {
            (this.mainMenu.setViewport(this.uiScene.menuViewport),
              this.mainMenuCtrl?.rerenderCurrentScreen(),
              this.updatePrefetchProgressViewport());
          }
          onEnter(e) {
            let t = this.createViewAndController();
            for (var [i, r] of this.subScreens) t.addScreen(i, r);
            if (
              (this.uiScene.add(this.mainMenu),
              setTimeout(() => {
                e?.route ? t.goToScreen(e.route.screenType, e.route.params) : t.goToScreen(a.ScreenType.Home);
              }),
              this.prefetchProgressEl)
            ) {
              let t = !1,
                e = new o.Task(async (e) => {
                  (await d.sleep(5e3, e),
                    d
                      .sleep(15e3, e)
                      .then(() => {
                        t || this.uiScene.add(this.prefetchProgressEl);
                      })
                      .catch((e) => {
                        if (!(e instanceof l.OperationCanceledError)) throw e;
                      }),
                    await this.cdnResourceLoader.loadResources(n.resourcesForPrefetch, e, (t) => {
                      this.prefetchProgressView.getElement().applyOptions((e) => (e.progress = t));
                    }),
                    (t = !0),
                    this.uiScene.remove(this.prefetchProgressEl));
                });
              (e
                .start()
                .catch((e) => {
                  (this.prefetchProgressEl && this.uiScene.remove(this.prefetchProgressEl),
                    (t = !0),
                    e instanceof l.OperationCanceledError || console.error(e));
                })
                .then(() => (e = void 0)),
                this.disposables.add(() => {
                  (e?.cancel(),
                    this.prefetchProgressEl.destroy(),
                    (this.prefetchProgressEl = void 0),
                    (this.prefetchProgressView = void 0));
                }));
            }
          }
          updatePrefetchProgressViewport() {
            this.prefetchProgressEl?.getHtmlContainer()?.setSize(this.uiScene.viewport.width, 0);
          }
          async onLeave() {
            (this.mainMenuCtrl &&
              (this.mainMenuCtrl.toggleMainVideo(!1),
              await this.mainMenuCtrl.leaveCurrentScreen(),
              this.mainMenuCtrl.destroy(),
              (this.mainMenuCtrl = void 0)),
              this.uiScene.remove(this.mainMenu),
              this.mainMenu.destroy(),
              (this.mainMenu = void 0),
              this.disposables.dispose());
          }
        }),
          e("MainMenuRootScreen", p));
      },
    };
  },
);
