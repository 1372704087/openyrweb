// === Reconstructed SystemJS module: engine/gfx/Renderer ===
// deps: ["stats.js","util/event","engine/gfx/RendererError"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/Renderer", ["stats.js", "util/event", "engine/gfx/RendererError"], function (e, t) {
  "use strict";
  var i, r, s, a;
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
      e(
        "Renderer",
        (a = class {
          get onFrame() {
            return this._onFrame.asEvent();
          }
          constructor(e, t) {
            ((this.isContextLost = !1),
              (this._onFrame = new r.EventDispatcher()),
              (this.handleContextLost = (e) => {
                (e.preventDefault(), (this.isContextLost = !0));
              }),
              (this.handleContextRestored = () => {
                var e = this.renderer.domElement;
                (this.renderer.dispose(), (this.renderer = this.createGlRenderer(e)), (this.isContextLost = !1));
              }),
              (this.width = e),
              (this.height = t),
              (this.scenes = new Set()));
          }
          getCanvas() {
            return this.renderer.domElement;
          }
          getStats() {
            return this.stats;
          }
          supportsInstancing() {
            if (!this.renderer) throw new Error("Renderer not yet initialized");
            return !!this.renderer.extensions.get("ANGLE_instanced_arrays");
          }
          initStats(e) {
            this.stats ||
              ((this.stats = new i.default()),
              this.stats.showPanel(0),
              (this.stats.dom.style.top = "auto"),
              (this.stats.dom.style.bottom = "0px"),
              this.stats.dom.classList.add("stats-layer"),
              e.appendChild(this.stats.dom));
          }
          destroyStats() {
            this.stats && (this.stats.dom.parentNode.removeChild(this.stats.dom), (this.stats = void 0));
          }
          init(e) {
            let t = this.createGlRenderer();
            (e.appendChild(t.domElement),
              t.domElement.addEventListener("contextmenu", (e) => {
                e.preventDefault();
              }),
              t.domElement.addEventListener("mousedown", (e) => {
                e.preventDefault();
              }),
              t.domElement.addEventListener(
                "wheel",
                (e) => {
                  e.stopPropagation();
                },
                { passive: !0 },
              ),
              t.domElement.addEventListener("webglcontextlost", this.handleContextLost),
              t.domElement.addEventListener("webglcontextrestored", this.handleContextRestored),
              (this.renderer = t));
          }
          createGlRenderer(e) {
            let t;
            try {
              t = new THREE.WebGLRenderer({
                canvas: e,
                preserveDrawingBuffer: !0,
                powerPreference: "high-performance",
              });
            } catch (e) {
              throw new s.RendererError("Failed to initialize WebGL renderer", { cause: e });
            }
            return (
              t.setSize(this.width, this.height),
              (t.autoClear = !1),
              (t.autoClearDepth = !1),
              (t.shadowMap.enabled = !0),
              (t.localClippingEnabled = !0),
              (t.toneMapping = THREE.NoToneMapping),
              t
            );
          }
          setViewportSize(e, t) {
            ((this.width = e), (this.height = t), this.renderer && this.renderer.setSize(e, t));
          }
          addScene(e) {
            (this.scenes.add(e), e.create3DObject());
          }
          removeScene(e) {
            this.scenes.delete(e);
          }
          getScenes() {
            return [...this.scenes];
          }
          update(t, i) {
            (this.scenes.forEach((e) => {
              e.update(t, i);
            }),
              this._onFrame.dispatch(this, t));
          }
          render() {
            this.isContextLost ||
              (this.renderer.clear(),
              this.scenes.forEach((e) => {
                (this.renderer.clearDepth(),
                  this.renderer.setViewport(e.viewport.x, e.viewport.y, e.viewport.width, e.viewport.height),
                  this.renderer.render(e.scene, e.camera));
              }));
          }
          flush() {
            this.renderer.renderLists.dispose();
          }
          destroy() {
            (this.renderer.domElement.remove(),
              this.renderer.domElement.removeEventListener("webglcontextlost", this.handleContextLost),
              this.renderer.domElement.removeEventListener("webglcontextrestored", this.handleContextRestored),
              this.renderer.dispose(),
              this.destroyStats());
          }
        }),
      );
    },
  };
});
