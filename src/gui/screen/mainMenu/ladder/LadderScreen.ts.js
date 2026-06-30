// === Reconstructed SystemJS module: gui/screen/mainMenu/ladder/LadderScreen ===
// deps: ["@puzzl/core/lib/async/cancellation","@puzzl/core/lib/async/Task","gui/jsx/HtmlView","gui/jsx/jsx","network/ladder/wladderConfig","network/ladder/WLadderService","util/disposable/CompositeDisposable","gui/screen/mainMenu/MainMenuScreen","gui/screen/mainMenu/ladder/component/Ladder","network/HttpRequest"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/ladder/LadderScreen",
  [
    "@puzzl/core/lib/async/cancellation",
    "@puzzl/core/lib/async/Task",
    "gui/jsx/HtmlView",
    "gui/jsx/jsx",
    "network/ladder/wladderConfig",
    "network/ladder/WLadderService",
    "util/disposable/CompositeDisposable",
    "gui/screen/mainMenu/MainMenuScreen",
    "gui/screen/mainMenu/ladder/component/Ladder",
    "network/HttpRequest",
  ],
  function (e, t) {
    "use strict";
    var r, i, s, a, c, n, o, l, h, u, d;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
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
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        ((d = class d extends l.MainMenuScreen {
          constructor(e, t, i, r, s, a, n) {
            (super(),
              (this.wladderService = e),
              (this.jsxRenderer = t),
              (this.errorHandler = i),
              (this.messageBoxApi = r),
              (this.serverRegions = s),
              (this.strings = a),
              (this.clientLocale = n),
              (this.title = this.strings.get("GUI:Ladder")),
              (this.disposables = new o.CompositeDisposable()));
          }
          async onEnter(e) {
            ((this.ladder = void 0),
              (this.isBusy = !1),
              (this.season = n.WLadderService.CURRENT_SEASON),
              (this.selectedLadderType = e.ladderType),
              (this.selectedLadder = e.highlightPlayer?.ladder),
              (this.selectedPlayer = e.highlightPlayer),
              (this.startIndex = this.computePageStartIndex(e.highlightPlayer?.rank)),
              this.initSidebar(),
              this.initView());
            try {
              await this.fetchInitial(
                this.selectedLadderType,
                this.season,
                this.selectedLadder,
                e.highlightPlayer,
                this.startIndex,
              );
            } catch (e) {
              e instanceof r.OperationCanceledError ||
                this.handleError(e, this.strings.get("TS:DownloadFailed"), { fatal: !0 });
            }
          }
          computePageStartIndex(e) {
            let t = 1;
            return (void 0 !== e && (t += Math.floor((e - 1) / d.PLAYERS_PER_PAGE) * d.PLAYERS_PER_PAGE), t);
          }
          initSidebar() {
            (this.controller?.setSidebarButtons([
              {
                label: this.strings.get("GUI:Back"),
                isBottom: !0,
                onClick: () => {
                  this.controller?.popScreen();
                },
              },
            ]),
              this.controller?.showSidebarButtons());
          }
          async fetchInitial(a, n, o, l, c) {
            await this.runTaskAsync(async (e) => {
              let t = await this.wladderService.getSeasons(e),
                i = await this.wladderService.getSeason(n, this.clientLocale, e);
              ((this.seasonDetails = i),
                this.selectedLadderType &&
                  !i.ladders.some((e) => e.type === this.selectedLadderType) &&
                  (this.selectedLadderType = i.ladders[0]?.type));
              let r = this.buildLadderList(a, i, o);
              if ((o = this.selectedLadder = o ? r.find((e) => e.id === o.id) : void 0))
                try {
                  var s = await this.wladderService.rungSearch(c, d.PLAYERS_PER_PAGE + 1, a, n, o.id, e);
                  this.updateView({ head: o, players: s, start: c }, l, i, r);
                } catch (e) {
                  if (!(e instanceof u.DownloadError && 404 === e.statusCode)) throw e;
                  this.updateView(void 0, l, i, r);
                }
              else this.updateView(void 0, l, i, r);
              1 < t.length &&
                this.ladder?.applyOptions((e) => {
                  e.seasons = t;
                });
            });
          }
          buildLadderList(t, e, i, r) {
            let s = e.ladders.filter((e) => e.type === t);
            i && !s.some((e) => e.id === i.id) && s.push(i);
            let a = r?.ladder;
            return (a && a !== i && !s.some((e) => e.id === a.id) && s.push(a), s);
          }
          fetchSeasonLadder(a, n, o, l) {
            this.runTaskAsync(async (t) => {
              let e = this.seasonDetails;
              "season" === l &&
                ((e = await this.wladderService.getSeason(a, this.clientLocale, t)),
                (this.seasonDetails = e),
                this.selectedLadderType &&
                  !e.ladders.some((e) => e.type === this.selectedLadderType) &&
                  (this.selectedLadderType = e.ladders[0]?.type));
              let i;
              if ("ladder" !== l && o) {
                var r = "string" == typeof o ? o : o.name;
                if (
                  ((this.selectedLadderType || e?.ladders.some((e) => e.type === c.LadderType.Solo1v1)) &&
                    ([i] = await this.wladderService.listSearch([r], t, this.selectedLadderType, a, this.clientLocale)),
                  "search" === l)
                ) {
                  if (!i || !i.rank)
                    return void this.messageBoxApi.show(
                      this.strings.get("TXT_NOT_IN_LADDER"),
                      this.strings.get("GUI:OK"),
                    );
                  this.selectedPlayer = i;
                } else i && (this.selectedPlayer = i);
                n = i?.ladder;
              }
              let s;
              if (
                (e &&
                  ((s = this.buildLadderList(
                    this.selectedLadderType,
                    e,
                    n,
                    i ?? ("ladder" === l ? this.selectedPlayer : void 0),
                  )),
                  (n = this.selectedLadder = n ? s.find((e) => e.id === n.id) : s[0])),
                n)
              ) {
                let e = 1;
                i && (e = this.computePageStartIndex(i.rank));
                r = await this.wladderService.rungSearch(
                  e,
                  d.PLAYERS_PER_PAGE + 1,
                  this.selectedLadderType,
                  a,
                  n.id,
                  t,
                );
                this.updateView({ head: n, players: r, start: e }, i ?? this.selectedPlayer, this.seasonDetails, s);
              } else this.updateView(void 0, i ?? this.selectedPlayer, this.seasonDetails, s);
            }).catch((e) => {
              e instanceof r.OperationCanceledError || this.handleError(e, this.strings.get("TS:DownloadFailed"));
            });
          }
          fetchLadderPage(i) {
            this.runTaskAsync(async (e) => {
              var t;
              void 0 !== this.selectedLadder &&
                ((t = await this.wladderService.rungSearch(
                  i,
                  d.PLAYERS_PER_PAGE + 1,
                  this.selectedLadderType,
                  this.season,
                  this.selectedLadder.id,
                  e,
                )),
                this.updateView({ head: this.selectedLadder, players: t, start: i }, this.selectedPlayer));
            }).catch((e) => {
              e instanceof r.OperationCanceledError || this.handleError(e, this.strings.get("TS:DownloadFailed"));
            });
          }
          async runTaskAsync(e) {
            this.asyncTask?.cancel();
            let t = (this.asyncTask = new i.Task(e));
            try {
              ((this.isBusy = !0), this.ladder?.applyOptions((e) => (e.disabled = !0)), await t.start());
            } finally {
              ((this.isBusy = !1), this.ladder?.applyOptions((e) => (e.disabled = !1)));
            }
            return t;
          }
          initView() {
            var [e] = this.jsxRenderer.render(
              a.jsx(s.HtmlView, {
                component: h.Ladder,
                innerRef: (e) => (this.ladder = e),
                props: {
                  players: void 0,
                  highlightPlayer: this.selectedPlayer?.name,
                  hasPrevPage: !1,
                  hasNextPage: !1,
                  seasons: void 0,
                  selectedSeason: this.season,
                  seasonDetails: this.seasonDetails,
                  ladders: void 0,
                  selectedLadder: this.selectedLadder,
                  strings: this.strings,
                  serverRegion: this.serverRegions.getSelectedRegion(),
                  disabled: this.isBusy,
                  onFirstPageClick: () => {
                    this.ladder && this.fetchLadderPage(1);
                  },
                  onPrevPageClick: () => {
                    this.ladder && this.fetchLadderPage(Math.max(1, this.startIndex - d.PLAYERS_PER_PAGE));
                  },
                  onNextPageClick: () => {
                    this.ladder && this.fetchLadderPage(this.startIndex + d.PLAYERS_PER_PAGE);
                  },
                  onLastPageClick: () => {
                    this.ladder &&
                      void 0 !== this.totalCount &&
                      this.fetchLadderPage(this.computePageStartIndex(this.totalCount));
                  },
                  onPlayerSearch: (e) => {
                    this.ladder && this.fetchSeasonLadder(this.season, this.selectedLadder, e, "search");
                  },
                  onSeasonSelect: (e) => {
                    ((this.season = e),
                      this.ladder && this.fetchSeasonLadder(e, this.selectedLadder, this.selectedPlayer, "season"));
                  },
                  onLadderSelect: (e) => {
                    ((this.selectedLadder = e),
                      this.ladder && this.fetchSeasonLadder(this.season, e, this.selectedPlayer, "ladder"));
                  },
                  onLadderTypeSelect: (e) => {
                    ((this.selectedLadderType = e),
                      (this.selectedLadder = void 0),
                      this.ladder &&
                        this.fetchSeasonLadder(this.season, this.selectedLadder, this.selectedPlayer, "type"));
                  },
                },
              }),
            );
            this.controller?.setMainComponent(e);
          }
          updateView(t, i, r, s) {
            ((this.startIndex = t?.start ?? 0),
              (this.totalCount = t?.players.totalCount ?? 0),
              this.ladder?.applyOptions((e) => {
                (r && ((e.seasonDetails = r), (e.selectedSeason = this.season)),
                  s && (e.ladders = s),
                  (e.selectedLadder = t?.head),
                  (e.highlightPlayer = i?.name),
                  (e.players = t?.players.records.slice(0, d.PLAYERS_PER_PAGE) ?? []),
                  (e.hasPrevPage = 1 < this.startIndex),
                  (e.hasNextPage = (t?.players.records.length ?? 0) > d.PLAYERS_PER_PAGE));
              }));
          }
          handleError(e, t, { fatal: i } = {}) {
            this.errorHandler.handle(e, t, () => {
              i && this.controller?.popScreen();
            });
          }
          async onLeave() {
            (this.disposables.dispose(),
              (this.ladder = void 0),
              this.asyncTask && (this.asyncTask.cancel(), (this.asyncTask = void 0)),
              await this.controller?.hideSidebarButtons());
          }
        }),
          e("LadderScreen", d),
          (d.PLAYERS_PER_PAGE = 20));
      },
    };
  },
);
