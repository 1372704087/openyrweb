// === Reconstructed SystemJS module: gui/UiObjectSprite ===
// deps: ["engine/renderable/builder/ShpBuilder","gui/UiObject"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/UiObjectSprite", ["engine/renderable/builder/ShpBuilder", "gui/UiObject"], function (e, t) {
  "use strict";
  var s, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends i.UiObject {
        static fromShpFile(e, t, i) {
          let r = new s.ShpBuilder(e, t, i);
          return (
            r.setBatched(!0),
            r.setBatchPalettes([t]),
            r.setOffset({ x: Math.floor(e.width / 2), y: Math.floor(e.height / 2) }),
            new this(r)
          );
        }
        constructor(e) {
          (super(), (this.builder = e));
        }
        setAnimationRunner(e) {
          this.animationRunner = e;
        }
        getAnimationRunner() {
          return this.animationRunner;
        }
        update(e) {
          (super.update(e),
            this.animationRunner &&
              (this.animationRunner.tick(e),
              this.animationRunner.shouldUpdate() && this.setFrame(this.animationRunner.getCurrentFrame())));
        }
        getSize() {
          return this.builder.getSize();
        }
        setFrame(e) {
          this.builder.setFrame(e);
        }
        getFrame() {
          return this.builder.getFrame();
        }
        getFrameCount() {
          return this.builder.frameCount;
        }
        setTransparent(e) {
          this.get3DObject() ? this.builder.setForceTransparent(e) : (this.initialTransparency = e);
        }
        setOpacity(e) {
          this.get3DObject() ? this.builder.setOpacity(e) : (this.initialOpacity = e);
        }
        setLightMult(e) {
          this.get3DObject()
            ? this.builder.setExtraLight(new THREE.Vector3().addScalar(-1 + e))
            : (this.initialLightMult = e);
        }
        create3DObject() {
          (this.set3DObject(this.builder.build()),
            super.create3DObject(),
            void 0 !== this.initialTransparency && this.builder.setForceTransparent(this.initialTransparency),
            void 0 !== this.initialOpacity && this.builder.setOpacity(this.initialOpacity),
            void 0 !== this.initialLightMult &&
              this.builder.setExtraLight(new THREE.Vector3().addScalar(this.initialLightMult)));
        }
        destroy() {
          (super.destroy(), this.builder.dispose());
        }
      }),
        e("UiObjectSprite", r));
    },
  };
});
