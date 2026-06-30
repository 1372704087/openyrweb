// === Reconstructed SystemJS module: network/WGameResService ===
// deps: ["network/HttpRequest","util/Base64","util/string"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/WGameResService", ["network/HttpRequest", "util/Base64", "util/string"], function (e, t) {
  "use strict";
  var s, a, n, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        a = e;
      },
      function (e) {
        n = e;
      },
    ],
    execute: function () {
      e(
        "WGameResService",
        (i = class {
          constructor(e, t) {
            ((this.wolService = e), (this.wolConfig = t));
          }
          setUrl(e) {
            this.url = e;
          }
          getUrl() {
            return this.url;
          }
          async sendGameResPacket(e, t) {
            if (!this.url) throw new Error("No WGameRes URL is set");
            var i = this.wolConfig.getClientSku(),
              r = this.wolService.getCredentials();
            if (!r) throw new Error("Missing WOL credentials");
            await new s.HttpRequest().fetchRaw(this.url + "/" + i, t, {
              method: "POST",
              body: n.uint8ArrayToBase64String(e),
              headers: { authorization: a.Base64.encode(JSON.stringify({ nick: r.user, pass: r.pass })) },
            });
          }
        }),
      );
    },
  };
});
