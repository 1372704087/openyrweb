// === Reconstructed SystemJS module: network/WolError ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/WolError", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      ((i = class extends Error {
        constructor(e, t, i) {
          (super(e), (this.code = t), (this.reason = i));
        }
      }),
        t("WolError", i),
        ((e = (e = i || t("WolError", (i = {}))).Code || (e.Code = {}))[(e.OutdatedClient = 0)] = "OutdatedClient"),
        (e[(e.BadLogin = 1)] = "BadLogin"),
        (e[(e.BadChannelPass = 2)] = "BadChannelPass"),
        (e[(e.GameHasClosed = 3)] = "GameHasClosed"),
        (e[(e.ChannelFull = 4)] = "ChannelFull"),
        (e[(e.BannedFromChannel = 5)] = "BannedFromChannel"),
        (e[(e.BannedFromServer = 6)] = "BannedFromServer"),
        (e[(e.NoSuchChannel = 7)] = "NoSuchChannel"),
        (e[(e.ServerFull = 8)] = "ServerFull"));
    },
  };
});
