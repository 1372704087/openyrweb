// === Reconstructed SystemJS module: network/GservError ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/GservError", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      ((i = class extends Error {
        constructor(e, t) {
          (super(e), (this.code = t));
        }
      }),
        t("GservError", i),
        ((e = (e = i || t("GservError", (i = {}))).Code || (e.Code = {}))[(e.Unknown = 0)] = "Unknown"),
        (e[(e.OutdatedClient = 1)] = "OutdatedClient"),
        (e[(e.BadLogin = 2)] = "BadLogin"),
        (e[(e.TooManyLoginAttempts = 3)] = "TooManyLoginAttempts"),
        (e[(e.AlreadyLoggedIn = 4)] = "AlreadyLoggedIn"),
        (e[(e.InstanceNonExistent = 5)] = "InstanceNonExistent"),
        (e[(e.InstanceAlreadyExists = 6)] = "InstanceAlreadyExists"),
        (e[(e.InstanceNotAllowed = 7)] = "InstanceNotAllowed"),
        (e[(e.InstanceAlreadyStarted = 8)] = "InstanceAlreadyStarted"),
        (e[(e.InstanceVersMismatch = 9)] = "InstanceVersMismatch"),
        (e[(e.CreatedTooManyInstances = 10)] = "CreatedTooManyInstances"));
    },
  };
});
