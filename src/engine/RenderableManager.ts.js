// === Reconstructed SystemJS module: engine/RenderableManager ===
// deps: ["engine/gfx/OctreeContainer"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/RenderableManager", ["engine/gfx/OctreeContainer"], function (e, t) {
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
      e(
        "RenderableManager",
        (r = class {
          constructor(e, t, i, r) {
            ((this.world = e),
              (this.worldScene = t),
              (this.camera = i),
              (this.renderableFactory = r),
              (this.renderablesByGameObject = new Map()),
              (this.renderablesById = new Map()),
              (this.positionListeners = new Map()),
              (this.onCameraUpdate = () => {
                this.container.cullChildren();
              }),
              (this.onWorldObjectSpawned = (t) => {
                var e = t.isTechno() && t.rules.isLightpost;
                let i = this.createRenderable(t, e ? this.worldScene : this.container);
                i.onCreate && i.onCreate(this);
                e = ({ tileChanged: e }) => this.onObjectPositionChanged(t, e);
                (this.positionListeners.set(t, e), t.position.onPositionChange.subscribe(e));
              }),
              (this.onWorldObjectRemoved = (t) => {
                (t.position.onPositionChange.unsubscribe(this.positionListeners.get(t)),
                  this.positionListeners.delete(t));
                let i = this.renderablesByGameObject.get(t);
                if (i.onRemove) {
                  let e = i.onRemove(this);
                  e
                    ? e.then(() => this.removeAndDisposeRenderable(i, t)).catch((e) => console.error(e))
                    : this.removeAndDisposeRenderable(i, t);
                } else this.removeAndDisposeRenderable(i, t);
              }));
          }
          init() {
            let e = (this.container = i.OctreeContainer.factory(this.camera));
            ((e.autoCull = !1),
              this.worldScene.add(e),
              this.worldScene.onCameraUpdate.subscribe(this.onCameraUpdate),
              this.world.getAllObjects().forEach((e) => this.onWorldObjectSpawned(e)),
              this.world.onObjectSpawned.subscribe(this.onWorldObjectSpawned),
              this.world.onObjectRemoved.subscribe(this.onWorldObjectRemoved));
          }
          getRenderableById(e) {
            return this.renderablesById.get(e);
          }
          getRenderableByGameObject(e) {
            return this.renderablesByGameObject.get(e);
          }
          getRenderableContainer() {
            return this.container;
          }
          onObjectPositionChanged(e, t) {
            let i = this.renderablesByGameObject.get(e);
            (i.setPosition(e.position.worldPosition),
              (e.isTechno() && e.rules.isLightpost) || this.container.updateChild(i));
          }
          removeAndDisposeRenderable(e, t) {
            let i = t.isTechno() && t.rules.isLightpost ? this.worldScene : this.container;
            (i.remove(e), e.dispose?.(), this.renderablesByGameObject.delete(t), this.renderablesById.delete(t.id));
          }
          createTransientAnim(e, t) {
            var i = this.renderableFactory.createTransientAnim(e, this.container);
            return (t?.(i), this.container.add(i), i);
          }
          createAnim(e, t, i = !1) {
            var r = this.renderableFactory.createAnim(e);
            return (t?.(r), i || this.container.add(r), r);
          }
          addEffect(e) {
            (e.setContainer(this.worldScene), this.worldScene.add(e));
          }
          dispose() {
            (this.worldScene.remove(this.container),
              (this.container = void 0),
              this.worldScene.onCameraUpdate.unsubscribe(this.onCameraUpdate),
              this.world.onObjectSpawned.unsubscribe(this.onWorldObjectSpawned),
              this.world.onObjectRemoved.unsubscribe(this.onWorldObjectRemoved),
              (this.onWorldObjectRemoved = void 0),
              (this.onWorldObjectSpawned = void 0),
              this.positionListeners.forEach((e, t) => t.position.onPositionChange.unsubscribe(e)),
              this.positionListeners.clear(),
              this.renderablesById.forEach((e) => e.dispose?.()));
          }
          createRenderable(e, t) {
            let i = this.renderableFactory.create(e);
            return (
              i.setPosition(e.position.worldPosition),
              t.add(i),
              this.renderablesByGameObject.set(e, i),
              this.renderablesById.set(e.id, i),
              i
            );
          }
          updateLighting() {
            for (var e of this.renderablesById.values()) e.updateLighting();
          }
        }),
      );
    },
  };
});
