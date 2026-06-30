// === Reconstructed SystemJS module: gui/screen/mainMenu/login/ServerPings ===
// deps: ["@puzzl/core/lib/async/cancellation","network/WolConnection"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/login/ServerPings",
  ["@puzzl/core/lib/async/cancellation", "network/WolConnection"],
  function (e, t) {
    "use strict";
    var a, n, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        (e(
          "ServerPings",
          (o = class o {
            constructor(e, t) {
              ((this.regions = e), (this.wolLogger = t), (this.pings = new Map()));
            }
            async update(r, s) {
              await Promise.all(
                this.regions
                  .getAll()
                  .filter((e) => e.available)
                  .map(async (t) => {
                    let i = n.WolConnection.factory(this.wolLogger);
                    try {
                      await i.connect(t.wolUrl, { timeoutSeconds: o.CONNECT_TIMEOUT, cancelToken: s });
                    } catch (e) {
                      return (
                        e instanceof a.OperationCanceledError ||
                          (console.error(e), i.close(), this.pings.set(t, void 0)),
                        void r?.()
                      );
                    }
                    let e;
                    try {
                      e = await i.ping(5);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      i.close();
                    }
                    s?.isCancelled() || (this.pings.set(t, e), r?.());
                  }),
              );
            }
          }),
        ),
          (o.CONNECT_TIMEOUT = 5));
      },
    };
  },
);
