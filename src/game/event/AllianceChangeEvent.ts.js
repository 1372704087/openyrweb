// === Reconstructed SystemJS module: game/event/AllianceChangeEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/AllianceChangeEvent", ["game/event/EventType"], function (t, e) {
  "use strict";
  var r, i, s;
  e && e.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      var e;
      (((e = i || t("AllianceEventType", (i = {})))[(e.Requested = 0)] = "Requested"),
        (e[(e.Formed = 1)] = "Formed"),
        (e[(e.Broken = 2)] = "Broken"),
        t(
          "AllianceChangeEvent",
          (s = class {
            constructor(e, t, i) {
              ((this.alliance = e), (this.changeType = t), (this.from = i), (this.type = r.EventType.AllianceChange));
            }
          }),
        ));
    },
  };
});
