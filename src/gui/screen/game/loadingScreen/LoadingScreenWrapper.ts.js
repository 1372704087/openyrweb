// === Reconstructed SystemJS module: gui/screen/game/loadingScreen/LoadingScreenWrapper ===
// deps: ["gui/jsx/jsx","gui/HtmlContainer","gui/jsx/UiComponent","gui/UiObject","gui/jsx/HtmlView","gui/screen/game/loadingScreen/LoadingScreen","game/gameopts/constants","game/SideType","engine/Engine","engine/EngineType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/loadingScreen/LoadingScreenWrapper",
  [
    "gui/jsx/jsx",
    "gui/HtmlContainer",
    "gui/jsx/UiComponent",
    "gui/UiObject",
    "gui/jsx/HtmlView",
    "gui/screen/game/loadingScreen/LoadingScreen",
    "game/gameopts/constants",
    "game/SideType",
    "engine/Engine",
    "engine/EngineType",
  ],
  function (e, t) {
    "use strict";
    var i, l, r, c, s, a, h, u, d, g, p, m, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
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
        ((p = new Map()
          .set("Americans", "ls800ustates.shp")
          .set("French", "ls800france.shp")
          .set("Germans", "ls800germany.shp")
          .set("British", "ls800ukingdom.shp")
          .set("Russians", "ls800russia.shp")
          .set("Confederation", "ls800cuba.shp")
          .set("Africans", "ls800libya.shp")
          .set("Arabs", "ls800iraq.shp")
          .set("Alliance", "ls800korea.shp")
          .set("YuriCountry", "ls800yuri.shp")
          .set(h.OBS_COUNTRY_NAME, "ls800obs.shp")),
          (m = new Map()
            .set("Americans", "mplsu.pal")
            .set("French", "mplsf.pal")
            .set("Germans", "mplsg.pal")
            .set("British", "mplsuk.pal")
            .set("Russians", "mplsr.pal")
            .set("Confederation", "mplsc.pal")
            .set("Africans", "mplsl.pal")
            .set("Arabs", "mplsi.pal")
            .set("Alliance", "mplsk.pal")
            .set("YuriCountry", "mpyls.pal")
            .set(h.OBS_COUNTRY_NAME, "mplsobs.pal")),
          (n = class extends r.UiComponent {
            createUiObject({ playerName: t, gameResConfig: e }) {
              var i,
                r = new c.UiObject(new THREE.Object3D(), new l.HtmlContainer()),
                s = t ? this.props.playerInfos.find((e) => e.name === t) : void 0,
                a = s?.country ? s.country.name : h.OBS_COUNTRY_NAME;
              this.countryName = a;
              let n = s?.color ?? "#fff";
              (s?.country &&
                ((i = s.country.side === u.SideType.GDI ? "AlliedLoad" : "SovietLoad"),
                (n = this.props.rules.colors.get(i)?.asHexString() ?? "#fff")),
                (this.color = n));
              let o = p.get(a);
              // OpenYRWeb: graceful fallback if the country-specific loading screen art is absent
              // (e.g. Yuri's ls800yuri.shp may be missing from some user YR installs). Fall back to
              // the US loading screen (always present in RA2 data) so the game still loads instead
              // of throwing "Missing image" and aborting onEnter. Non-fatal: cosmetic only.
              if (o && !e.isCdn() && d.Engine.vfs && !d.Engine.vfs.fileExists(o)) {
                console.warn('Loading screen art "' + o + '" not in VFS — falling back to standard screen.');
                o = p.get("Americans");
              }
              return (
                o
                  ? e.isCdn()
                    ? (this.bgHtmlImg = e.getCdnBaseUrl() + "ls/" + o.replace(".shp", ".png"))
                    : ((this.bgSpriteImg = o),
                      // OpenYRWeb: YR-only — loading-screen palette always sourced from m.get(a).
                      (this.bgSpritePal = m.get(a)),
                      // OpenYRWeb: graceful fallback if the country-specific palette is absent
                      // (e.g. Confederation's mplsc.apl may be missing from some user YR installs).
                      this.bgSpritePal &&
                        !e.isCdn() &&
                        d.Engine.vfs &&
                        !d.Engine.vfs.fileExists(this.bgSpritePal) &&
                        (console.warn('Loading screen palette "' + this.bgSpritePal + '" not in VFS — falling back to US palette.'),
                        (this.bgSpritePal = m.get("Americans"))))
                  : console.warn("Missing loading image for country " + a),
                r
              );
            }
            defineChildren() {
              let e = this.props.rules.getMultiplayerCountries();
              var t = this.props.viewport;
              return i.jsx(
                "fragment",
                null,
                this.props.gameResConfig.isCdn()
                  ? []
                  : i.jsx("sprite", {
                      image: this.bgSpriteImg,
                      palette: this.bgSpritePal,
                      x: t.x,
                      y: t.y,
                      ref: (e) => (this.sprite = e),
                    }),
                i.jsx(s.HtmlView, {
                  innerRef: (e) => (this.htmlEl = e),
                  component: a.LoadingScreen,
                  props: {
                    viewport: this.props.viewport,
                    countryUiNames: new Map(
                      [[h.OBS_COUNTRY_NAME, h.OBS_COUNTRY_UI_NAME]].concat(e.map((e) => [e.name, e.uiName])),
                    ),
                    strings: this.props.strings,
                    countryName: this.countryName,
                    mapName: this.props.mapName,
                    color: this.color,
                    playerInfos: this.props.playerInfos,
                    bgImageSrc: this.bgHtmlImg,
                    mapPreviewUrl: this.props.mapPreviewUrl,
                  },
                }),
              );
            }
            updateViewport(t) {
              (this.htmlEl?.applyOptions((e) => (e.viewport = t)), this.sprite?.setPosition(t.x, t.y));
            }
            applyOptions(e) {
              this.htmlEl?.applyOptions(e);
            }
          }),
          e("LoadingScreenWrapper", n));
      },
    };
  },
);
