// === Reconstructed SystemJS module: util/Sentry ===
// deps: ["@sentry/browser"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/Sentry", ["@sentry/browser"], function (e, t) {
  "use strict";
  var s, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "Sentry",
        (i = class {
          init(e, t) {
            let i = (this.sdk = s),
              r = new Date();
            i.init({
              dsn: e.dsn,
              tunnel: e.tunnel,
              environment: e.env,
              release: t,
              denyUrls: [/^file:/],
              ignoreErrors: [
                /init message from worker/,
                /The object can not be found here/,
                /itemsclipboard/,
                /A requested file or directory could not be found/,
                /The requested file could not be read/,
                /The play\(\) request/,
                /^db$/,
              ],
              initialScope: (e) => e.setTags({ locale: navigator.language }).setExtra("initTime", r),
              ...(e.defaultIntegrations ? {} : { defaultIntegrations: !1 }),
              autoSessionTracking: e.autoSessionTracking,
            });
          }
          captureException(e, t) {
            this.sdk?.captureException(e, t);
          }
          configureScope(e) {
            this.sdk?.configureScope(e);
          }
          addBreadcrumb(e) {
            this.sdk?.addBreadcrumb(e);
          }
        }),
      );
    },
  };
});
