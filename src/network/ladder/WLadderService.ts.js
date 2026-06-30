// === Reconstructed SystemJS module: network/ladder/WLadderService ===
// deps: ["network/ladder/wladderConfig","network/HttpRequest"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/ladder/WLadderService",
  ["network/ladder/wladderConfig", "network/HttpRequest"],
  function (e, t) {
    "use strict";
    var i, n, o, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = i = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        (e(
          "WLadderService",
          (l = class l {
            constructor(e) {
              this.wolConfig = e;
            }
            setUrl(e) {
              this.url = e;
            }
            getUrl() {
              return this.url;
            }
            async getSeasons(e) {
              if (!this.url) throw new Error("No ladder URL is set");
              var t = this.wolConfig.getClientSku();
              return await new o.HttpRequest().fetchJson(this.url + "/" + t, e);
            }
            async getSeason(e, t, i) {
              if (!this.url) throw new Error("No ladder URL is set");
              var r = this.wolConfig.getClientSku();
              return await new o.HttpRequest().fetchJson(this.url + `/${r}/${e}?locale=` + t, i);
            }
            async listSearch(e, t, i = n.LadderType.Solo1v1, r = l.CURRENT_SEASON, s) {
              if (!this.url) throw new Error("No ladder URL is set");
              var a = this.wolConfig.getClientSku();
              return await new o.HttpRequest().fetchJson(this.url + `/${a}/${i}/${r}/listsearch`, t, {
                method: "POST",
                body: JSON.stringify({ players: e, locale: s }),
              });
            }
            async rungSearch(e, t, i, r, s, a) {
              if (!this.url) throw new Error("No ladder URL is set");
              var n = this.wolConfig.getClientSku();
              return await new o.HttpRequest().fetchJson(this.url + `/${n}/${i}/${r}/rungsearch`, a, {
                method: "POST",
                body: JSON.stringify({ ladderId: s, start: e, count: t }),
              });
            }
          }),
        ),
          (l.CURRENT_SEASON = i.CURRENT_SEASON),
          (l.PREV_SEASON = i.PREV_SEASON));
      },
    };
  },
);
