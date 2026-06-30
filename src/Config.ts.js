// === Reconstructed SystemJS module: Config ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("Config", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "Config",
        (i = class {
          constructor() {
            this.corsProxies = [];
          }
          load(e) {
            let t = e.getSection("General");
            if (!t) throw new Error("Missing [General] section in application config");
            ((this.generalData = t),
              (this.viewport = { width: t.getNumber("viewport.width"), height: t.getNumber("viewport.height") }));
            let i = e.getSection("Sentry");
            i &&
              (this.sentry = {
                dsn: i.getString("dsn"),
                tunnel: i.getString("tunnel") || void 0,
                env: i.getString("env"),
                defaultIntegrations: i.getBool("defaultIntegrations"),
                autoSessionTracking: i.getBool("autoSessionTracking"),
              });
            var r = e.getSection("CorsProxy");
            if (r) for (var [s, a] of r.entries) this.corsProxies.push([s, a]);
          }
          get defaultLocale() {
            return this.generalData.getString("defaultLanguage", "en-US");
          }
          get serversUrl() {
            return this.generalData.getString("serversUrl", "servers.ini");
          }
          get gameresBaseUrl() {
            return this.generalData.getString("gameresBaseUrl") || void 0;
          }
          get gameResArchiveUrl() {
            return this.generalData.getString("gameResArchiveUrl");
          }
          // OpenYRWeb: the YR expansion archive URL (paired with gameResArchiveUrl for the
          // one-click "download both exes + extract the 6 mix files" flow).
          get gameResExpansionArchiveUrl() {
            return this.generalData.getString("gameResExpansionArchiveUrl");
          }
          get mapsBaseUrl() {
            return this.generalData.getString("mapsBaseUrl");
          }
          get modsBaseUrl() {
            return this.generalData.getString("modsBaseUrl");
          }
          get devMode() {
            return this.generalData.getBool("dev");
          }
          get discordUrl() {
            var e = this.generalData.getString("discordUrl");
            if (e.length) return e;
          }
          get patchNotesUrl() {
            var e = this.generalData.getString("patchNotesUrl");
            if (e.length) return e;
          }
          get ladderRulesUrl() {
            var e = this.generalData.getString("ladderRulesUrl");
            if (e.length) return e;
          }
          get modSdkUrl() {
            var e = this.generalData.getString("modSdkUrl");
            if (e.length) return e;
          }
          get donateUrl() {
            var e = this.generalData.getString("donateUrl");
            if (e.length) return e;
          }
          get replaysUrlWhitelist() {
            return this.generalData.getArray("replaysUrlWhitelist");
          }
          get breakingNewsUrl() {
            var e = this.generalData.getString("breakingNewsUrl");
            if (e.length) return e;
          }
          get quickMatchEnabled() {
            return this.generalData.getBool("quickMatchEnabled");
          }
          get unrankedQueueEnabled() {
            return this.generalData.getBool("unrankedQueueEnabled", !0);
          }
          get botsEnabled() {
            return this.generalData.getBool("botsEnabled");
          }
          get oldClientsBaseUrl() {
            var e = this.generalData.getString("oldClientsBaseUrl");
            if (e.length) return e;
          }
          get debugGameState() {
            return this.generalData.getBool("debugGameState");
          }
          get debugLogging() {
            var e = this.generalData.getString("debugLogging") || void 0;
            return e ? this.generalData.getBool("debugLogging") || e : void 0;
          }
          getCorsProxy(e) {
            let t;
            for (var [i, r] of this.corsProxies) {
              if (i.startsWith(".") ? e.endsWith(i) : e === i) return r;
              "*" === i && (t = r);
            }
            return t;
          }
        }),
      );
    },
  };
});
