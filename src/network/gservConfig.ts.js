// === Reconstructed SystemJS module: network/gservConfig ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gservConfig", [], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e("API_VERSION", 2),
        e("RECIPIENT_ALL", "#all"),
        e("RECIPIENT_TEAM", "#team"),
        e("TURN_TIMEOUT_MILLIS", 3e4),
        e("LAG_STATE_THRESH_MILLIS", 1e3),
        e("CON_INFO_THRESH_MILLIS", 2e3),
        e("LAG_CHECK_INTERVAL_MILLIS", 1e3),
        e("MAX_MAP_TRANSFER_BYTES", 2097152));
    },
  };
});
