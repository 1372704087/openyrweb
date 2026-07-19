// === Reconstructed SystemJS module: gui/screen/game/loadingScreen/LoadingScreen ===
// deps: ["react","network/gamestate/PlayerConnectionStatus","gui/component/CountryIcon","game/gameopts/constants","gui/component/TeamSelect"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/loadingScreen/LoadingScreen",
  [
    "react",
    "network/gamestate/PlayerConnectionStatus",
    "gui/component/CountryIcon",
    "game/gameopts/constants",
    "gui/component/TeamSelect",
  ],
  function (e, t) {
    "use strict";
    var o, r, s, l, a, c, h, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((c = new Map()
          .set("Americans", "Name:Para")
          .set("French", "Name:GTGCAN")
          .set("Germans", "Name:TNKD")
          .set("British", "Name:SNIPE")
          .set("Russians", "Name:TTNK")
          .set("Confederation", "Name:TERROR")
          .set("Africans", "Name:DTRUCK")
          .set("Arabs", "Name:DESO")
          .set("Alliance", "Name:BEAGLE")),
          (h = new Map()
            .set("Americans", "LoadBrief:USA")
            .set("French", "LoadBrief:French")
            .set("Germans", "LoadBrief:Germans")
            .set("British", "LoadBrief:British")
            .set("Russians", "LoadBrief:Russia")
            .set("Confederation", "LoadBrief:Cuba")
            .set("Africans", "LoadBrief:Lybia")
            .set("Arabs", "LoadBrief:Iraq")
            .set("Alliance", "LoadBrief:Korea")),
          (i = class extends o.default.Component {
            render() {
              let e = this.props.playerInfos;
              var t = this.props.countryName,
                i = this.props.color;
              let r = 1 < e.length && e.every((e) => !e.country || e.team !== l.NO_TEAM_ID);
              var s = h.get(t),
                a = c.get(t);
              let n = this.props.strings;
              return o.default.createElement(
                "div",
                { className: "loading-screen", style: this.getStyle(this.props.bgImageSrc) },
                a ? o.default.createElement("div", { className: "special-unit-name" }, n.get(a)) : null,
                s
                  ? o.default.createElement("div", { className: "briefing-text", style: { color: i } }, n.get(s))
                  : null,
                o.default.createElement(
                  "div",
                  { className: "loading-text", style: { color: i } },
                  n.get("GUI:LoadingEx"),
                ),
                o.default.createElement(
                  "div",
                  { className: "player-status-container" },
                  e ? e.map((e) => this.renderStatus(e, r)) : null,
                ),
                o.default.createElement(
                  "div",
                  { style: { color: i }, className: "country-name" },
                  this.props.strings.get(this.props.countryUiNames.get(t) || t),
                ),
                o.default.createElement("div", { style: { color: i }, className: "map-name" }, this.props.mapName),
                this.props.mapPreviewUrl
                  ? o.default.createElement("div", {
                      className: "map-preview",
                      style: this.getMapPreviewStyle(),
                    },
                    o.default.createElement("img", {
                      src: this.props.mapPreviewUrl,
                      style: { width: "100%", height: "100%", objectFit: "contain" },
                    }),
                  )
                  : null,
              );
            }
            renderStatus(e, t) {
              var i = e.status === r.PlayerConnectionStatus.Connected ? 1 : 0.5;
              return o.default.createElement(
                "div",
                { key: e.name, className: "player-status", style: { opacity: i, color: e.color } },
                t &&
                  o.default.createElement(
                    "span",
                    { className: "player-team" },
                    void 0 !== e.country && this.props.strings.get("GUI:TeamNo", a.formatTeamId(e.team)),
                  ),
                o.default.createElement("progress", { value: "" + e.loadPercent, max: 100 }),
                o.default.createElement(s.CountryIcon, { country: e.country ? e.country.name : l.OBS_COUNTRY_NAME }),
                o.default.createElement("span", { className: "player-name" }, e.name),
              );
            }
            getStyle(e) {
              var t = this.props.viewport;
              return {
                backgroundImage: e ? `url(${e})` : void 0,
                backgroundSize: "cover",
                width: t.width + "px",
                height: t.height + "px",
                position: "absolute",
                left: t.x,
                top: t.y,
              };
            }
            getMapPreviewStyle() {
              var t = this.props.viewport;
              return {
                position: "absolute",
                left: Math.round(t.width * 0.625) + "px",
                top: Math.round(t.height * 0.632) + "px",
                width: Math.round(t.width * 0.27) + "px",
                height: Math.round(t.height * 0.27) + "px",
                overflow: "hidden",
              };
            }
          }),
          e("LoadingScreen", i));
      },
    };
  },
);
