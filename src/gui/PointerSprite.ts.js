// === Reconstructed SystemJS module: gui/PointerSprite ===
// deps: ["gui/UiObject","engine/gfx/ImageUtils","gui/HtmlContainer"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/PointerSprite", ["gui/UiObject", "engine/gfx/ImageUtils", "gui/HtmlContainer"], function (e, t) {
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
      ((a = class a extends i.UiObject {
        static fromShpFile(e, t) {
          return new this(r.ImageUtils.convertShpToCanvas(e, t), { width: e.width, height: e.height }, e.numImages);
        }
        constructor(e, t, i) {
          (super(new THREE.Object3D(), new s.HtmlContainer()),
            (this.images = e),
            (this.size = t),
            (this.frameCount = i),
            (this.currentFrame = 0));
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
          return this.size;
        }
        setFrame(e) {
          if (e !== this.currentFrame) {
            if (e < 0 || this.frameCount <= e)
              throw new RangeError(`Pointer frame index out of bounds (index=${e}, length=${this.frameCount})`);
            ((this.currentFrame = e), this.drawFrame(e));
          }
        }
        drawFrame(e) {
          this.targetContext &&
            (this.targetContext.clearRect(0, 0, this.size.width, this.size.height),
            this.targetContext.drawImage(
              this.images,
              e * this.size.width,
              0,
              this.size.width,
              this.size.height,
              0,
              0,
              this.size.width,
              this.size.height,
            ));
        }
        getFrame() {
          return this.currentFrame;
        }
        getFrameCount() {
          return this.frameCount;
        }
        create3DObject() {
          if ((super.create3DObject(), !this.targetContext)) {
            let e = document.createElement("canvas"),
              t = this.getHtmlContainer();
            t.setTranslateMode(!0);
            let i = t.getElement();
            (i.appendChild(e), (i.style.zIndex = "" + a.HTML_ZINDEX));
            var r = e.getContext("2d", { alpha: !0 });
            if (!r) throw new Error("Couldn't create pointer canvas context");
            ((this.targetContext = r), this.drawFrame(this.currentFrame));
          }
        }
        destroy() {
          super.destroy();
        }
      }),
        e("PointerSprite", a),
        (a.HTML_ZINDEX = 100));
    },
  };
});
