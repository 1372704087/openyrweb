// === Reconstructed SystemJS module: gui/component/CountrySelect ===
// deps: ["react","gui/component/CountryIcon","gui/component/Select","gui/component/Option"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/CountrySelect",
  ["react", "gui/component/CountryIcon", "gui/component/Select", "gui/component/Option"],
  function (e, t) {
    "use strict";
    var h, u, d, g;
    t && t.id;
    return {
      setters: [
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        e(
          "CountrySelect",
          ({
            country: e,
            availableCountries: t,
            onlyIcon: i,
            disabled: r,
            strings: s,
            countryUiNames: a,
            countryUiTooltips: n,
            onSelect: o,
          }) => {
            let [l, c] = h.useState(() => e);
            h.useEffect(() => {
              l !== e && c(e);
            }, [e]);
            return h.default.createElement(
              "div",
              { className: "country-select" },
              h.default.createElement(
                "div",
                { className: "player-country-icon", "data-r-tooltip": s.get("STT:HostPictureFlag") },
                h.default.createElement(u.CountryIcon, { country: l }),
              ),
              i
                ? null
                : h.default.createElement(
                    d.Select,
                    {
                      className: "player-country-select",
                      tooltip: s.get("STT:HostComboCountry"),
                      initialValue: l,
                      disabled: r,
                      onSelect: (e) => {
                        (c(e), o(e));
                      },
                    },
                    (r ? [l] : t).map((e) => {
                      var t = s.get(a.get(e) || e),
                        i = n.has(e) ? s.get(n.get(e)) : void 0;
                      return h.default.createElement(g.Option, { key: e, value: e, label: t, tooltip: i });
                    }),
                  ),
            );
          },
        );
      },
    };
  },
);
