// === Reconstructed SystemJS module: gui/component/CountryIcon ===
// deps: ["react","game/gameopts/constants","gui/component/Image"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/CountryIcon",
  ["react", "game/gameopts/constants", "gui/component/Image"],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = new Map()
          .set("Americans", "usai.pcx")
          .set("French", "frai.pcx")
          .set("Germans", "geri.pcx")
          .set("British", "gbri.pcx")
          .set("Russians", "rusi.pcx")
          .set("Confederation", "lati.pcx")
          .set("Africans", "djbi.pcx")
          .set("Arabs", "arbi.pcx")
          .set("Alliance", "japi.pcx")
          .set("YuriCountry", "yrii.pcx")
          .set(r.RANDOM_COUNTRY_NAME, "rani.pcx")
          .set(r.OBS_COUNTRY_NAME, "obsi.pcx")),
          (n = class extends i.default.Component {
            render() {
              var e = a.get(this.props.country);
              return i.default.createElement(
                "div",
                { className: "player-country-icon" },
                e && i.default.createElement(s.Image, { src: e }),
              );
            }
          }),
          e("CountryIcon", n));
      },
    };
  },
);
