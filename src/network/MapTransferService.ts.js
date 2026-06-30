// === Reconstructed SystemJS module: network/MapTransferService ===
// deps: ["network/HttpRequest","util/Base64","@puzzl/core/lib/async/sleep","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/MapTransferService",
  ["network/HttpRequest", "util/Base64", "@puzzl/core/lib/async/sleep", "util/math"],
  function (e, t) {
    "use strict";
    var n, i, o, l, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        (0,
          e(
            "MapTransferService",
            (r = class {
              constructor(e) {
                this.wolService = e;
              }
              setUrl(e) {
                this.url = e;
              }
              getUrl() {
                return this.url;
              }
              async putMap(e, t, i) {
                if (!this.url) throw new Error("No MapTransfer URL is set");
                var r = this.makeAuthorizationHeader();
                let s,
                  a = 3;
                for (; a--;)
                  try {
                    return (
                      console.log("Uploading map...", a + " retries left"),
                      i?.throwIfCancelled(),
                      await new n.HttpRequest().fetchRaw(this.url + "/" + t, i, {
                        method: "PUT",
                        body: e,
                        headers: { authorization: r, "Content-Type": "application/octet-stream" },
                      }),
                      void console.log(`Map upload finished. (size=${e.byteLength})`)
                    );
                  } catch (e) {
                    if (!(e instanceof n.DownloadError) || (e.statusCode && l.isBetween(e.statusCode, 400, 499)))
                      throw e;
                    ((s = e), await o.sleep(1e3, i));
                  }
                throw s;
              }
              async getMap(e, t) {
                if (!this.url) throw new Error("No MapTransfer URL is set");
                var i = this.makeAuthorizationHeader();
                let r,
                  s = 6;
                for (; s--;)
                  try {
                    (console.log("Transferring map...", s + " retries left"), t?.throwIfCancelled());
                    var a = await new n.HttpRequest().fetchBinary(this.url + "/" + e, t, {
                      headers: { authorization: i },
                    });
                    return (console.log(`Map download finished. (size=${a.byteLength})`), a);
                  } catch (e) {
                    if (!(e instanceof n.DownloadError && 404 === e.statusCode)) throw e;
                    ((r = e), await o.sleep(3e3, t));
                  }
                throw r;
              }
              makeAuthorizationHeader() {
                var e = this.wolService.getCredentials();
                if (!e) throw new Error("Missing WOL credentials");
                return i.Base64.encode(JSON.stringify({ nick: e.user, pass: e.pass }));
              }
            }),
          ));
      },
    };
  },
);
