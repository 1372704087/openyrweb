// === Reconstructed SystemJS module: engine/gfx/RenderableContainer ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/RenderableContainer", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "RenderableContainer",
        (i = class {
          constructor(e) {
            ((this.children = new Set()), (this.renderQueue = []), e && this.set3DObject(e));
          }
          set3DObject(e) {
            this.container = e;
          }
          get3DObject() {
            return this.container;
          }
          getChildren() {
            return [...this.children];
          }
          add(...e) {
            for (var t of e) this.children.has(t) || (this.children.add(t), this.renderQueue.push(t));
          }
          remove(...e) {
            for (var t of e) {
              var i;
              this.children.has(t) &&
                (this.children.delete(t),
                -1 === (i = this.renderQueue.indexOf(t))
                  ? (t = t.get3DObject()) && t.parent && this.get3DObject().remove(t)
                  : this.renderQueue.splice(i, 1));
            }
          }
          removeAll() {
            this.remove(...this.children);
          }
          processRenderQueue() {
            if (!this.get3DObject())
              throw new Error("A THREE.Object3D must be passed in the constructor or using the setter.");
            let e;
            for (; (e = this.renderQueue.shift());) {
              e.create3DObject();
              var t = e.get3DObject();
              t && this.get3DObject().add(t);
            }
          }
          create3DObject() {
            this.processRenderQueue();
          }
          update(e, t) {
            this.renderQueue.length && this.processRenderQueue();
            for (var i of this.children) (this.renderQueue.length && this.processRenderQueue(), i.update(e, t));
          }
        }),
      );
    },
  };
});
