// === Reconstructed SystemJS module: game/api/LoggerApi ===
// deps: ["util/format","util/Logger"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/api/LoggerApi", ["util/format", "util/Logger"], function (e, t) {
  "use strict";
  var i, r, s, a, n, o, l;
  t && t.id;
  return {
    setters: [
      function (e) {
        n = e;
      },
      function (e) {
        o = e;
      },
    ],
    execute: function () {
      (e(
        "LoggerApi",
        (l = class {
          constructor(e, t) {
            (i.add(this),
              r.set(this, void 0),
              s.set(this, void 0),
              __classPrivateFieldSet(this, r, e, "f"),
              __classPrivateFieldSet(this, s, t, "f"));
          }
          setDebugLevel(e) {
            __classPrivateFieldGet(this, r, "f").setLevel(e ? o.AppLogger.DEBUG : o.AppLogger.WARN);
          }
          debug(...e) {
            __classPrivateFieldGet(this, r, "f").debug(__classPrivateFieldGet(this, i, "m", a).call(this), ...e);
          }
          info(...e) {
            __classPrivateFieldGet(this, r, "f").info(__classPrivateFieldGet(this, i, "m", a).call(this), ...e);
          }
          log(...e) {
            __classPrivateFieldGet(this, r, "f").log(__classPrivateFieldGet(this, i, "m", a).call(this), ...e);
          }
          warn(...e) {
            __classPrivateFieldGet(this, r, "f").warn(__classPrivateFieldGet(this, i, "m", a).call(this), ...e);
          }
          error(...e) {
            __classPrivateFieldGet(this, r, "f").error(__classPrivateFieldGet(this, i, "m", a).call(this), ...e);
          }
          time(e) {
            __classPrivateFieldGet(this, r, "f").time(e);
          }
          timeEnd(e) {
            __classPrivateFieldGet(this, r, "f").timeEnd(e);
          }
        }),
      ),
        (r = new WeakMap()),
        (s = new WeakMap()),
        (i = new WeakSet()),
        (a = function () {
          return "[" + n.formatTimeDuration(Math.floor(__classPrivateFieldGet(this, s, "f").getCurrentTime())) + "]";
        }));
    },
  };
});
