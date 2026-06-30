// === Reconstructed SystemJS module: network/HttpRequest ===
// deps: ["@puzzl/core/lib/async/cancellation"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/HttpRequest", ["@puzzl/core/lib/async/cancellation"], function (e, t) {
  "use strict";
  var p, i, m;
  t && t.id;
  return {
    setters: [
      function (e) {
        p = e;
      },
    ],
    execute: function () {
      (e(
        "HttpRequest",
        (i = class {
          async fetchText(e, t, i) {
            return await this.fetchAndParse({ url: e, type: "text" }, t, i);
          }
          async fetchBinary(e, t, i) {
            return await this.fetchAndParse({ url: e, type: "binary" }, t, i);
          }
          async fetchJson(e, t, i) {
            return await this.fetchAndParse({ url: e, type: "json" }, t, i);
          }
          async fetchHtml(e, t, i) {
            return await this.fetchAndParse({ url: e, type: "text" }, t, { ...i, allowHtmlMimeType: !0 });
          }
          async fetchAndParse(e, t, i) {
            var r = await this.fetchRaw(e.url, t, i);
            return this.parseResult(e.type, r);
          }
          async fetchRaw(e, t, i) {
            let r = new AbortController();
            t?.register(() => {
              try {
                r.abort();
              } catch (e) {}
            });
            let s;
            try {
              s = await fetch(e, { signal: r.signal, body: i?.body, method: i?.method, headers: i?.headers });
            } catch (e) {
              if (
                r.signal.aborted ||
                "AbortError" === e.name ||
                (e instanceof DOMException && e.code === DOMException.ABORT_ERR)
              )
                throw new p.OperationCanceledError(t);
              throw (console.error(e), new m(`Fetch failed with error: ${e.name}:` + e.message));
            }
            if (!s.ok) throw new m(`Fetch failed with status ${s.status}:` + s.statusText, void 0, s.status);
            if ("text/html" === s.headers.get("Content-Type") && !i?.allowHtmlMimeType)
              throw new m(`Fetch failed with invalid mime type "text/html" (HTTP status ${s.status})`);
            let a = s.body.getReader(),
              n = 0,
              o = [];
            for (
              var l, c = s.headers.get("Content-Encoding") ? void 0 : Number(s.headers.get("Content-Length") || 0);
              ;
            )
              try {
                var { done: h, value: u } = await a.read();
                if (h) break;
                (o.push(u), (n += u.length), i?.onProgress?.(u.length, c));
              } catch (e) {
                if ("AbortError" === e.name) throw new p.OperationCanceledError(t);
                throw (console.error(e), new m(e.message));
              }
            let d = new Uint8Array(n),
              g = 0;
            for (l of o) (d.set(l, g), (g += l.length));
            return d;
          }
          parseResult(e, t) {
            if ("binary" === e) return t;
            var i = new TextDecoder("utf-8").decode(t);
            return "json" === e ? JSON.parse(i) : i;
          }
        }),
      ),
        (m = class extends Error {
          constructor(e, t, i) {
            (super(e, t), (this.statusCode = i));
          }
        }),
        e("DownloadError", m));
    },
  };
});
