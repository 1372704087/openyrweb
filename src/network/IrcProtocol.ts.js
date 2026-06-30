// === Reconstructed SystemJS module: network/IrcProtocol ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/IrcProtocol", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "IrcProtocol",
        (i = class {
          static escapeChannelName(e) {
            return e
              .split("")
              .map((e) => {
                switch (e) {
                  case " ":
                    return "_";
                  case "%":
                    return "%%";
                  case "_":
                    return "%_";
                  case "\b":
                    return "%b";
                  case "\n":
                    return "%n";
                  case "\r":
                    return "%r";
                  case ":":
                    return "%=";
                  case ",":
                    return "%-";
                  default:
                    return e;
                }
              })
              .join("");
          }
          static unescapeChannelName(e) {
            var t = e.split("");
            let i = "",
              r = 0;
            for (; r < t.length;) {
              var s,
                a = t[r++];
              let e;
              ((e =
                "%" === a
                  ? "b" === (s = t[r++])
                    ? "\b"
                    : "n" === s
                      ? "\n"
                      : "r" === s
                        ? "\r"
                        : "=" === s
                          ? ":"
                          : "-" === s
                            ? ","
                            : s
                  : "_" === a
                    ? " "
                    : a),
                (i += e));
            }
            return i;
          }
        }),
      ),
        (i.MAX_CHANNELNAME_LEN = 30));
    },
  };
});
