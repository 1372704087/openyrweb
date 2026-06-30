// === Reconstructed SystemJS module: gui/jsx/HtmlView ===
// deps: ["gui/jsx/UiComponent","gui/UiObject","gui/HtmlReactElement"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/jsx/HtmlView", ["gui/jsx/UiComponent", "gui/UiObject", "gui/HtmlReactElement"], function (e, t) {
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
      ((a = class extends i.UiComponent {
        createUiObject(e) {
          let t = s.HtmlReactElement.factory(this.props.component, this.props.props);
          t.setSize(e.width || 0, e.height || 0);
          let i = new r.UiObject(new THREE.Object3D(), t);
          return (i.setPosition(e.x || 0, e.y || 0), e.hidden && i.setVisible(!1), this.props.innerRef?.(t), i);
        }
        getElement() {
          return this.getUiObject().getHtmlContainer();
        }
      }),
        e("HtmlView", a));
    },
  };
});
