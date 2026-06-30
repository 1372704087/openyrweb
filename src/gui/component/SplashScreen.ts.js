// === Reconstructed SystemJS module: gui/component/SplashScreen ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/component/SplashScreen", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "SplashScreen",
        (i = class {
          constructor(e, t) {
            ((this.width = e), (this.height = t), (this.rendered = !1));
          }
          render(r) {
            if (!this.rendered) {
              let e = (this.el = document.createElement("div"));
              ((e.style.backgroundColor = "black"),
                (e.style.color = "white"),
                (e.style.padding = "10px"),
                (e.style.boxSizing = "border-box"),
                (e.style.backgroundRepeat = "no-repeat"),
                (e.style.backgroundPosition = "50% 50%"),
                (e.style.textShadow = "1px 1px black"),
                this.updateSize());
              var s = (this.loadingEl = document.createElement("div"));
              e.appendChild(s);
              let t = (this.copyrightEl = document.createElement("div"));
              ((t.style.position = "absolute"),
                (t.style.bottom = "10px"),
                (t.style.right = "10px"),
                (t.style.textAlign = "right"),
                e.appendChild(t));
              let i = (this.disclaimerEl = document.createElement("div"));
              ((i.style.position = "absolute"),
                (i.style.bottom = "10px"),
                (i.style.left = "10px"),
                e.appendChild(i),
                r.appendChild(e),
                (this.rendered = !0));
            }
          }
          setBackgroundImage(e) {
            this.el.style.backgroundImage = `url(${e})`;
          }
          setLoadingText(e) {
            this.loadingEl.innerHTML = e;
          }
          setCopyrightText(e) {
            this.copyrightEl.innerHTML = e.replace(/\n/g, "<br />");
          }
          setDisclaimerText(e) {
            this.disclaimerEl.innerHTML = e.replace(/\n/g, "<br />");
          }
          setSize(e, t) {
            ((this.width = e), (this.height = t), this.updateSize());
          }
          updateSize() {
            this.el && ((this.el.style.width = this.width + "px"), (this.el.style.height = this.height + "px"));
          }
          destroy() {
            this.rendered && (this.el.remove(), (this.rendered = !1));
          }
        }),
      );
    },
  };
});
