// === Reconstructed SystemJS module: data/map/tag/TagsReader ===
// deps: ["data/map/tag/TagRepeatType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/map/tag/TagsReader", ["data/map/tag/TagRepeatType"], function (e, t) {
  "use strict";
  var a, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e(
        "TagsReader",
        (i = class {
          read(e) {
            let t = [];
            for (var [i, r] of e.entries) {
              var s = r.split(",");
              s.length < 3
                ? console.warn(`Invalid tag ${i}=${r}. Skipping.`)
                : ((r = Number(s[0])),
                  void 0 !== a.TagRepeatType[r]
                    ? ((s = { id: i, repeatType: r, name: s[1], triggerId: s[2] }), t.push(s))
                    : console.warn(`Invalid repeat value ${r} for tag id ${i}. Skipping.`));
            }
            return t;
          }
        }),
      );
    },
  };
});
