// === Reconstructed SystemJS module: gui/screen/options/GeneralOptions ===
// deps: ["engine/renderable/entity/unit/FlyerHelperMode","util/Base64","util/BoxedVar","gui/screen/options/GraphicsOptions"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/GeneralOptions",
  [
    "engine/renderable/entity/unit/FlyerHelperMode",
    "util/Base64",
    "util/BoxedVar",
    "gui/screen/options/GraphicsOptions",
  ],
  function (e, t) {
    "use strict";
    var i, c, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        (e("SCROLL_BASE_FACTOR", 3),
          e(
            "GeneralOptions",
            (a = class {
              constructor() {
                ((this.scrollRate = new r.BoxedVar(12)),
                  (this.flyerHelper = new r.BoxedVar(i.FlyerHelperMode.Selected)),
                  (this.hiddenObjects = new r.BoxedVar(!0)),
                  (this.targetLines = new r.BoxedVar(!0)),
                  (this.rightClickMove = new r.BoxedVar(!1)),
                  (this.rightClickScroll = new r.BoxedVar(!0)),
                  (this.mouseAcceleration = new r.BoxedVar(!0)),
                  (this.graphics = new s.GraphicsOptions()));
              }
              unserialize(e) {
                var [t, i, r, s, a, n, o, l] = e.split(",");
                return (
                  (this.scrollRate.value = Number(t)),
                  void 0 !== i && (this.flyerHelper.value = Number(i)),
                  void 0 !== r && this.graphics.unserialize(c.Base64.decode(r)),
                  void 0 !== s && (this.hiddenObjects.value = Boolean(Number(s))),
                  void 0 !== a && (this.rightClickMove.value = Boolean(Number(a))),
                  void 0 !== n && (this.rightClickScroll.value = Boolean(Number(n))),
                  void 0 !== o && (this.targetLines.value = Boolean(Number(o))),
                  void 0 !== l && (this.mouseAcceleration.value = Boolean(Number(l))),
                  this
                );
              }
              serialize() {
                return [
                  this.scrollRate.value,
                  this.flyerHelper.value,
                  c.Base64.encode(this.graphics.serialize()),
                  Number(this.hiddenObjects.value),
                  Number(this.rightClickMove.value),
                  Number(this.rightClickScroll.value),
                  Number(this.targetLines.value),
                  Number(this.mouseAcceleration.value),
                ].join(",");
              }
            }),
          ));
      },
    };
  },
);
