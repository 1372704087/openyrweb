// === Reconstructed SystemJS module: gui/screen/game/component/hud/GameMenuContentArea ===
// deps: ["gui/jsx/jsx","gui/jsx/UiComponent","gui/UiObject","gui/HtmlContainer","engine/gfx/SpriteUtils","game/SideType","engine/Engine","engine/EngineType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/GameMenuContentArea",
  [
    "gui/jsx/jsx",
    "gui/jsx/UiComponent",
    "gui/UiObject",
    "gui/HtmlContainer",
    "engine/gfx/SpriteUtils",
    "game/SideType",
    "engine/Engine",
    "engine/EngineType",
  ],
  function (e, t) {
    "use strict";
    var d, i, r, s, a, g, p, m, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          d = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        ((n = class extends i.UiComponent {
          createUiObject({ viewport: e, hidden: t }) {
            let i = new r.UiObject(new THREE.Object3D(), new s.HtmlContainer());
            return (i.setPosition(e.x, e.y), i.getHtmlContainer().setSize(e.width, e.height), i.setVisible(!t), i);
          }
          defineChildren() {
            let { viewport: e, screenSize: t, sideType: i, images: r, innerRef: s } = this.props,
              a = "lg";
            ((t.width < 1024 || t.height < 768) && (a = "md"), (t.width < 800 || t.height < 600) && (a = "sm"));
            // OpenYRWeb: YR-only — engine check always true; keep Yuri-side (ThirdSide) styling.
            var n = i === g.SideType.ThirdSide,
              o = n ? `bkgd${a}y.shp` : `bkgd${a}.shp`,
              l = n ? "uibkgdy.pal" : "uibkgd.pal",
              c = r.get(o),
              h = c ? (e.width - c.width) / 2 : 0,
              u = c ? (e.height - c.height) / 2 : 0,
              n = (c || e).width,
              o = (c || e).height;
            return d.jsx(
              "fragment",
              null,
              d.jsx("mesh", null, this.createMask(e)),
              d.jsx(
                "container",
                { zIndex: 1, x: h, y: u, width: n, height: o, ref: s },
                c && d.jsx("sprite", { image: c, palette: l }),
              ),
            );
          }
          createMask(e) {
            let t = a.SpriteUtils.createRectGeometry(e.width, e.height);
            t.translate(e.width / 2, e.height / 2, 0);
            var i = new THREE.MeshBasicMaterial({ color: 0, opacity: 0.75, transparent: !0, side: THREE.DoubleSide });
            let r = new THREE.Mesh(t, i);
            return ((r.frustumCulled = !1), r);
          }
        }),
          e("GameMenuContentArea", n));
      },
    };
  },
);
