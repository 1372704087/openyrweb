// === Reconstructed SystemJS module: gui/LazyHtmlElement ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/LazyHtmlElement", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "LazyHtmlElement",
        (i = class {
          constructor(e) {
            ((this.children = new Set()), (this.rendered = !1), e && this.setElement(e));
          }
          setElement(e) {
            this.element = e;
          }
          getElement() {
            return this.element;
          }
          getChildren() {
            return [...this.children];
          }
          isRendered() {
            return this.rendered;
          }
          add(...e) {
            for (var t of e) this.children.has(t) || (this.children.add(t), this.rendered && this.renderChild(t));
          }
          remove(...e) {
            for (var t of e) this.children.has(t) && (this.children.delete(t), this.rendered && this.unrenderChild(t));
          }
          removeAll() {
            this.remove(...this.children);
          }
          render() {
            if (!this.element)
              throw new Error("An HTML element must be passed in the constructor or using the setter.");
            (this.children.forEach((e) => this.renderChild(e)), (this.rendered = !0));
          }
          renderChild(e) {
            e.render();
            var t = e.getElement();
            t && this.getElement().appendChild(t);
          }
          unrenderChild(e) {
            var t = e.getElement();
            t && (e.unrender(), t.parentElement === this.getElement() && this.getElement().removeChild(t));
          }
          unrender() {
            this.isRendered() && (this.children.forEach((e) => this.unrenderChild(e)), (this.rendered = !1));
          }
        }),
      );
    },
  };
});
