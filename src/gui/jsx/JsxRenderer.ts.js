// === Reconstructed SystemJS module: gui/jsx/JsxRenderer ===
// deps: ["gui/jsx/jsx","gui/UiObjectSprite","gui/UiObject","gui/HtmlContainer","engine/renderable/builder/CanvasSpriteBuilder","gui/ShpSpriteBatch"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/jsx/JsxRenderer",
  [
    "gui/jsx/jsx",
    "gui/UiObjectSprite",
    "gui/UiObject",
    "gui/HtmlContainer",
    "engine/renderable/builder/CanvasSpriteBuilder",
    "gui/ShpSpriteBatch",
  ],
  function (e, t) {
    "use strict";
    var i, a, r, n, o, l, c, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        ((c = (e) => !!e.images),
          e(
            "JsxRenderer",
            (s = class {
              constructor(e, t, i, s) {
                ((this.images = e),
                  (this.palettes = t),
                  (this.camera = i),
                  (this.jsxIntrinsicRenderers = {
                    sprite: (t) => {
                      let i;
                      if (c(t)) {
                        let e = new o.CanvasSpriteBuilder(t.images, this.camera);
                        (e.setAlign(t.alignX ?? 0, t.alignY ?? 0), (i = new a.UiObjectSprite(e)));
                      } else {
                        var e = "string" == typeof t.image ? this.getImage(t.image) : t.image,
                          r = "string" == typeof t.palette ? this.getPalette(t.palette) : t.palette;
                        i = a.UiObjectSprite.fromShpFile(e, r, this.camera);
                      }
                      return (
                        s && i.setPointerEvents(s),
                        this.setupListeners(i, t),
                        t.onFrame && i.onFrame.subscribe(t.onFrame),
                        i.setPosition(t.x || 0, t.y || 0),
                        void 0 !== t.frame && i.setFrame(t.frame),
                        t.animationRunner && i.setAnimationRunner(t.animationRunner),
                        t.hidden && i.setVisible(!1),
                        t.zIndex && i.setZIndex(t.zIndex),
                        void 0 !== t.opacity && i.setOpacity(t.opacity),
                        void 0 !== t.transparent && i.setTransparent(t.transparent),
                        void 0 !== t.tooltip && i.setTooltip(t.tooltip),
                        { obj: i }
                      );
                    },
                    "sprite-batch": (e) => {
                      let t = [];
                      t = e.children ? (Array.isArray(e.children) ? e.children.flat() : [e.children]) : [];
                      let i = [],
                        r = [];
                      for (var s of t)
                        "sprite" === s.type && s.props.static && !c(s.props) ? r.push(s.props) : i.push(s);
                      return {
                        obj: new l.ShpSpriteBatch(
                          r,
                          (e) => this.getImage(e),
                          (e) => this.getPalette(e),
                          this.camera,
                        ),
                        children: [...i],
                      };
                    },
                    container: (e) => {
                      let t = new r.UiObject(new THREE.Object3D(), new n.HtmlContainer());
                      return (
                        s && t.setPointerEvents(s),
                        this.setupListeners(t, e),
                        e.onFrame && t.onFrame.subscribe(e.onFrame),
                        e.hidden && t.setVisible(!1),
                        e.zIndex && t.setZIndex(e.zIndex),
                        t.setPosition(e.x || 0, e.y || 0),
                        t.getHtmlContainer()?.setSize(e.width || 0, e.height || 0),
                        { obj: t }
                      );
                    },
                    mesh: (e) => {
                      let t = new r.UiObject(e.children);
                      return (
                        s && t.setPointerEvents(s),
                        this.setupListeners(t, e),
                        t.setPosition(e.x || 0, e.y || 0),
                        e.zIndex && t.setZIndex(e.zIndex),
                        e.hidden && t.setVisible(!1),
                        { obj: t }
                      );
                    },
                  }));
              }
              setupListeners(i, r) {
                const s = {
                  click: "onClick",
                  dblclick: "onDoubleClick",
                  mousedown: "onMouseDown",
                  mouseenter: "onMouseEnter",
                  mouseleave: "onMouseLeave",
                  mouseout: "onMouseOut",
                  mouseover: "onMouseOver",
                  mouseup: "onMouseUp",
                  mousemove: "onMouseMove",
                  wheel: "onWheel",
                };
                Object.keys(s).forEach((e) => {
                  var t = r[s[e]];
                  t && i.addEventListener(e, t);
                });
              }
              setCamera(e) {
                this.camera = e;
              }
              getImage(e) {
                var t = this.images.get(e);
                if (!t) throw new Error(`Missing image "${e}"`);
                return t;
              }
              getPalette(e) {
                var t = this.palettes.get(e);
                if (!t) throw new Error(`Missing palette "${e}"`);
                return t;
              }
              render(e) {
                return i.renderJsx(e, this.jsxIntrinsicRenderers);
              }
            }),
          ));
      },
    };
  },
);
