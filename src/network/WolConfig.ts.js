// === Reconstructed SystemJS module: network/WolConfig ===
// deps: ["network/ladder/wladderConfig"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/WolConfig", ["network/ladder/wladderConfig"], function (t, e) {
  "use strict";
  var i, r, s, a, n;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      var e;
      ((r = "zotclot9"),
        t("MATCH_BOT_NAME", (s = "matchbot")),
        t("MIN_USERNAME_LEN", 2),
        t("MAX_USERNAME_LEN", 15),
        t("MIN_PASS_LEN", 8),
        t("MAX_PASS_LEN", 128),
        t("MAX_MAP_TRANSFER_BYTES", 2097152),
        ((e = a || t("ClientType", (a = {})))[(e.Cdral2 = 0)] = "Cdral2"),
        t(
          "WolConfig",
          (n = class n {
            static skuToClientType(t) {
              return [...n.allClientSettings.entries()].find(([, e]) => e.sku === t)?.[0];
            }
            static factory(e) {
              var t = n.allClientSettings.get(e);
              if (!t) throw new Error(`Unhandled client type "${a[e]}"`);
              return new this(e, t);
            }
            constructor(e, t) {
              ((this.clientType = e), (this.clientSettings = t));
            }
            getClientSku() {
              return this.clientSettings.sku;
            }
            getClientChannelType() {
              return this.clientSettings.channelType;
            }
            getGlobalChannelPass() {
              return r;
            }
            getQuickMatchBotName() {
              return s;
            }
            getAllQuickMatchChannelIds() {
              return [...this.clientSettings.qmChanIds.values()];
            }
            getQuickMatchChannelId(e) {
              var t = this.clientSettings.qmChanIds.get(e);
              if (void 0 === t)
                throw new Error(`Client type ${this.clientType} doesn't have a configured channel for ladder=` + e);
              return t;
            }
          }),
        ),
        (n.allClientSettings = new Map().set(a.Cdral2, {
          sku: 16640,
          channelType: 45,
          qmChanIds: new Map().set(i.LadderQueueType.Solo1v1, 50).set(i.LadderQueueType.Team2v2, 51),
        })));
    },
  };
});
