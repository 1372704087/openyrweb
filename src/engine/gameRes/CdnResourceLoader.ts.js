// === Reconstructed SystemJS module: engine/gameRes/CdnResourceLoader ===
// deps: ["data/DataStream","data/Crc32","data/vfs/VirtualFile","engine/ResourceLoader"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/gameRes/CdnResourceLoader",
  ["data/DataStream", "data/Crc32", "data/vfs/VirtualFile", "engine/ResourceLoader"],
  function (e, t) {
    "use strict";
    var o, l, c, h, u;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        ((u = class u extends h.ResourceLoader {
          static async clearCache(e) {
            for await (var t of e.getEntries()) t.startsWith(u.cachePrefix) && (await e.deleteFile(t));
          }
          constructor(e, t, i) {
            (super(e), (this.cdnManifest = t), (this.cacheDir = i));
          }
          getFileNameFromUrl(e) {
            return e.split("?")[0].split("/").pop();
          }
          async fetchResource(e, t, i) {
            let r = this.getFileNameFromUrl(e);
            var s = u.cachePrefix + r,
              a = this.cdnManifest.checksums[r];
            try {
              if (r.endsWith(".mix") && void 0 !== a && this.cacheDir && (await this.cacheDir.containsEntry(s))) {
                let e = await this.cacheDir.getRawFile(s);
                var n = new Uint8Array(await e.arrayBuffer());
                if (l.Crc32.calculateCrc(n) === a) return (i?.onProgress?.(n.length), n);
                try {
                  await this.cacheDir.deleteFile(s);
                } catch (e) {
                  console.error("Couldn't delete file from local CDN cache", e);
                }
              }
            } catch (e) {
              console.error(`Couldn't read file "${s}" from local CDN cache`, e);
            }
            void 0 !== a && (e += (e.includes("?") ? "&" : "?") + "h=" + a);
            n = await super.fetchResource(e, t, i);
            if (l.Crc32.calculateCrc(n) !== a) throw new h.DownloadError(`Checksum mismatch for URL "${e}"`);
            try {
              await this.cacheDir?.writeFile(c.VirtualFile.factory(new o.DataStream(n), s));
            } catch (e) {
              console.error("Couldn't write file to local CDN cache", e);
            }
            return n;
          }
        }),
          e("CdnResourceLoader", u),
          (u.cachePrefix = "cdncache_"));
      },
    };
  },
);
