// === Reconstructed SystemJS module: gui/HtmlReactElement ===
// deps: ["react","react-dom","gui/HtmlContainer"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/HtmlReactElement", ["react", "react-dom", "gui/HtmlContainer"], function (e, t) {
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
      ((a = class extends s.HtmlContainer {
        static factory(e, t) {
          return new this(t, e);
        }
        constructor(e, t) {
          (super(), (this.options = e), (this.Component = t));
        }
        render() {
          var e;
          (this.isRendered() || ((e = document.createElement("div")), this.setElement(e), this.renderReactElement()),
            super.render());
        }
        renderReactElement() {
          r.default.render(i.default.createElement(this.Component, this.options), this.getElement());
        }
        applyOptions(e) {
          (e(this.options), this.refresh());
        }
        refresh() {
          this.isRendered() && this.renderReactElement();
        }
        unrender() {
          var e = this.getElement();
          (e && this.isRendered() && r.default.unmountComponentAtNode(e), super.unrender());
        }
      }),
        e("HtmlReactElement", a));
    },
  };
});
