// === Reconstructed SystemJS module: gui/HtmlContainer ===
// deps: ["gui/LazyHtmlElement"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/HtmlContainer", ["gui/LazyHtmlElement"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends i.LazyHtmlElement {
        constructor() {
          (super(...arguments),
            (this.visible = !0),
            (this.left = 0),
            (this.top = 0),
            (this.width = 0),
            (this.height = 0),
            (this.relativeMode = !1),
            (this.translateMode = !1));
        }
        render() {
          var e;
          (this.isRendered() ||
            ((e = this.getElement()) || ((e = document.createElement("div")), this.setElement(e)),
            this.updateMode(),
            this.updatePosition(),
            this.updateVisibility(),
            this.updateSize()),
            super.render());
        }
        setRelativeMode(e) {
          ((this.relativeMode = e), this.updateMode());
        }
        setTranslateMode(e) {
          ((this.translateMode = e), this.updatePosition());
        }
        setPosition(e, t) {
          ((this.left = e), (this.top = t), this.updatePosition());
        }
        setSize(e, t) {
          ((this.width = e), (this.height = t), this.updateSize());
        }
        getSize() {
          return { width: this.width, height: this.height };
        }
        setVisible(e) {
          e !== this.visible && ((this.visible = e), this.updateVisibility());
        }
        updateMode() {
          let e = this.getElement();
          e &&
            (this.relativeMode
              ? (e.style.position = "relative")
              : ((e.style.overflow = "visible"), (e.style.position = "absolute")));
        }
        updatePosition() {
          let e = this.getElement();
          e &&
            (this.translateMode
              ? ((e.style.top = e.style.left = "0"), (e.style.transform = `translate(${this.left}px, ${this.top}px)`))
              : ((e.style.left = this.left + "px"), (e.style.top = this.top + "px"), (e.style.transform = "")));
        }
        updateSize() {
          let e = this.getElement();
          e &&
            ((e.style.width = "number" == typeof this.width ? this.width + "px" : this.width),
            (e.style.height = "number" == typeof this.height ? this.height + "px" : this.height));
        }
        hide() {
          this.setVisible(!1);
        }
        show() {
          this.setVisible(!0);
        }
        updateVisibility() {
          let e = this.getElement();
          e && (e.style.display = this.visible ? "block" : "none");
        }
      }),
        e("HtmlContainer", r));
    },
  };
});
