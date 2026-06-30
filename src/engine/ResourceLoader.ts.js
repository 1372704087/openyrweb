// === Reconstructed SystemJS module: engine/ResourceLoader ===
// deps: ["@puzzl/core/lib/async/cancellation","network/HttpRequest","engine/resourceConfigs"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/ResourceLoader",
  ["@puzzl/core/lib/async/cancellation", "network/HttpRequest", "engine/resourceConfigs"],
  function (t, e) {
    "use strict";
    var a, i, r, s, u;
    e && e.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          t({ DownloadError: (i = e).DownloadError });
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        (t(
          "ResourceLoader",
          (s = class {
            constructor(e) {
              ((this.resourceBaseUrl = e), (this.httpRequest = new i.HttpRequest()));
            }
            async prefetchResource(e, i) {
              let r = this.getResourceUrl(e);
              const s = document.createElement("link");
              ((s.rel = "prefetch"),
                (s.as = "fetch"),
                (s.href = r),
                (s.crossOrigin = "anonymous"),
                await new Promise((e, t) => {
                  (i?.register(() => {
                    s.parentNode && (document.head.removeChild(s), t(new a.OperationCanceledError(i)));
                  }),
                    "onload" in s &&
                      (s.onload = () => {
                        (document.head.removeChild(s), e());
                      }),
                    "onerror" in s &&
                      (s.onerror = () => {
                        (document.head.removeChild(s), t(new Error(`Couldn't prefetch URL "${r}"`)));
                      }),
                    document.head.appendChild(s),
                    "onload" in s || (document.head.removeChild(s), e()));
                }));
            }
            getResourceUrl(e) {
              var t = "object" == typeof e ? e : r.resourceConfigs.get(e);
              if (!t) throw new Error("Missing resourceConfig for resType " + r.ResourceType[e]);
              return this.resourceBaseUrl + t.src;
            }
            getResourceFileName(e) {
              let t = this.getResourceUrl(e);
              return t.split("?")[0].split("/").pop();
            }
            buildResourceManifest(e) {
              return e
                .map((e) => {
                  if ("object" == typeof e) return e;
                  if (!r.resourceConfigs.has(e))
                    throw new Error("Missing resourceConfig for resType " + r.ResourceType[e]);
                  return r.resourceConfigs.get(e);
                })
                .map((e) => ({
                  id: e.id,
                  src: e.src.match(/^https?:\/\//) ? e.src : this.resourceBaseUrl + e.src,
                  type: e.type,
                  sizeHint: e.sizeHint,
                }));
            }
            async loadText(e, t, i) {
              return await this.loadResource({ src: e, type: "text" }, t, i);
            }
            async loadBinary(e, t, i) {
              return await this.loadResource({ src: e, type: "binary" }, t, i);
            }
            async loadJson(e, t, i) {
              return await this.loadResource({ src: e, type: "json" }, t, i);
            }
            async loadResource(e, t, i) {
              var r = await this.fetchResource(this.resourceBaseUrl + e.src, t, i);
              return this.httpRequest.parseResult(e.type, r);
            }
            async loadResources(e, t, i) {
              let r = this.buildResourceManifest(e),
                s = new Map();
              var a,
                n = r.length;
              let o = 0,
                l = r.reduce((e, { sizeHint: t }) => e + (t ?? 0), 0),
                c = 0;
              for (a of r) {
                var h = await this.fetchResource(a.src, t, {
                  onProgress: (e) => {
                    ((c += e), l && i?.(Math.floor(100 * Math.min(1, c / l))));
                  },
                });
                (s.set(a.id, h), o++, l || i?.(Math.floor((o / n) * 100)));
              }
              return new u(s);
            }
            async fetchResource(e, t, i) {
              return await this.httpRequest.fetchRaw(e, t, i);
            }
          }),
        ),
          t(
            "LoaderResult",
            (u = class {
              constructor(e) {
                this.items = e;
              }
              pop(e) {
                let t;
                if ("string" == typeof e) t = e;
                else {
                  if (!r.resourceConfigs.has(e))
                    throw new Error(`Missing resourceConfig for resource type "${r.ResourceType[e]}"`);
                  if (((t = r.resourceConfigs.get(e).id), !t))
                    throw new Error("Undefined resourceId for resourceType " + e);
                }
                var i = this.items.get(t);
                if (!i) throw new Error(`Resource type "${e}" not found in result.`);
                return (this.items.delete(t), i);
              }
            }),
          ));
      },
    };
  },
);
