// === Reconstructed SystemJS module: gui/UiScene ===
// deps: ["gui/UiObject","gui/HtmlContainer","engine/gfx/batch/MeshBatchManager"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/UiScene",
  ["gui/UiObject", "gui/HtmlContainer", "engine/gfx/batch/MeshBatchManager"],
  function (e, t) {
    "use strict";
    var i, s, r, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((a = class a extends i.UiObject {
          static factory(e) {
            let t = new THREE.Scene();
            t.matrixAutoUpdate = !1;
            var i = a.createCamera(e),
              r = new s.HtmlContainer();
            return new a(t, i, e, r);
          }
          static createCamera(e) {
            var t = e.height / 2,
              i = e.width / e.height;
            let r = new THREE.OrthographicCamera(-t * i, t * i, t, -t, -1e3, 1e3);
            return (
              (r.rotation.x = Math.PI),
              (r.position.x = -e.x + e.width / 2),
              (r.position.y = -e.y + e.height / 2),
              (r.position.z = -1e3),
              r
            );
          }
          constructor(e, t, i, r) {
            (super(e, r), (this.scene = e), (this.camera = t), (this.viewport = i));
          }
          setCamera(e) {
            this.camera = e;
          }
          setViewport(e) {
            this.viewport = e;
          }
          create3DObject() {
            var e;
            (super.create3DObject(),
              this.meshBatchManager ||
                ((e = this.meshBatchManager = new r.MeshBatchManager(this.getRenderableContainer())),
                this.getRenderableContainer().add(e),
                (this.scene.autoUpdate = !1)));
          }
          update(e) {
            (super.update(e),
              this.meshBatchManager && (this.scene.updateMatrixWorld(!1), this.meshBatchManager.updateMeshes()));
          }
          get menuViewport() {
            let e = 800,
              t = 600;
            return {
              x: Math.max(0, (this.viewport.width - e) / 2),
              y: Math.max(0, (this.viewport.height - t) / 2),
              width: e,
              height: t,
            };
          }
          destroy() {
            (super.destroy(), this.meshBatchManager?.dispose());
          }
        }),
          e("UiScene", a));
      },
    };
  },
);
