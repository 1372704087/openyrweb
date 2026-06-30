// === Reconstructed SystemJS module: engine/gameRes/VideoConverter ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gameRes/VideoConverter", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "VideoConverter",
        (i = class {
          async convertBinkVideo(e, t, i = "webm") {
            var r = t.filename,
              s = t.filename.replace(/\.\w+$/, "") + "." + i;
            (e.FS("writeFile", r, new Uint8Array(t.stream.buffer, t.stream.byteOffset, t.stream.byteLength)),
              "webm" === i
                ? await e.run(
                    "-i",
                    r,
                    "-vcodec",
                    "libvpx",
                    "-crf",
                    "10",
                    "-b:v",
                    "2M",
                    "-deadline",
                    "realtime",
                    "-speed",
                    "2",
                    "-an",
                    s,
                  )
                : await e.run(...["-i", r, "-vcodec", "libx264", "-crf", "25", "-b:v", "2M", "-an"], s));
            var a = e.FS("readFile", s);
            return (e.FS("unlink", r), e.FS("unlink", s), a);
          }
        }),
      );
    },
  };
});
