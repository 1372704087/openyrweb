// === Reconstructed SystemJS module: network/gservCodes ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gservCodes", [], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e("RPL_CVERS_OK", 10),
        e("RPL_CVERS_OUTDATED", 11),
        e("RPL_CVERS_MISSING", 12),
        e("RPL_LOGGED_IN", 100),
        e("RPL_ALREADY_LOGGED_IN", 101),
        e("RPL_NOT_LOGGED_IN", 102),
        e("RPL_BAD_LOGIN", 103),
        e("RPL_TOO_MANY_LOGIN_ATTEMPTS", 104),
        e("RPL_INSTANCE_CREATED", 200),
        e("RPL_INSTANCE_EXISTS", 201),
        e("RPL_INSTANCE_TOO_MANY", 202),
        e("RPL_NOT_ENOUGH_PARAMS", 300),
        e("RPL_INVALID_PARAMS", 301),
        e("RPL_RATE_LIMIT_EXCEEDED", 302),
        e("RPL_INSTANCE_CONNECTED", 400),
        e("RPL_INSTANCE_NONEXISTENT", 401),
        e("RPL_INSTANCE_NOT_ALLOWED", 402),
        e("RPL_INSTANCE_ALREADY_STARTED", 403),
        e("RPL_NO_INSTANCE", 404),
        e("RPL_INSTANCE_NOT_RUNNING", 405),
        e("RPL_INSTANCE_VERS_MISMATCH", 406),
        e("RPL_GAME_OPTS", 500),
        e("RPL_LOAD_INFO", 600),
        e("RPL_MAP_TOO_BIG", 602),
        e("RPL_MAP_ALREADY_SENT", 603),
        e("RPL_GAME_START", 700),
        e("RPL_GAME_DESYNC", 801),
        e("RPL_NET_RATE", 802),
        e("RPL_TAUNT", 803),
        e("RPL_PLAYER_DISCONNECT", 804),
        e("RPL_PRIVMSG_NOT_ALLOWED", 805),
        e("RPL_BIN_PREFIX", 2),
        e("RPL_BIN_GAME_ACTIONS", 1),
        e("RPL_BIN_MAP_DATA", 2),
        e("REQ_BIN_PREFIX", 2),
        e("REQ_BIN_GAME_ACTIONS", 1),
        e("REQ_BIN_GAME_STATE_HASH", 2),
        e("REQ_BIN_PUT_MAP", 3),
        e("REQ_BIN_GET_MAP", 4));
    },
  };
});
