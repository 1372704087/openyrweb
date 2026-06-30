// === Reconstructed SystemJS module: game/World ===
// deps: ["util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/World", ["util/event"], function (e, t) {
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
        "World",
        (r = class {
          constructor() {
            ((this.allObjects = new Map()),
              (this._onObjectSpawned = new i.EventDispatcher()),
              (this._onObjectRemoved = new i.EventDispatcher()));
          }
          get onObjectSpawned() {
            return this._onObjectSpawned.asEvent();
          }
          get onObjectRemoved() {
            return this._onObjectRemoved.asEvent();
          }
          spawnObject(e) {
            if (this.allObjects.has(e.id)) throw new Error("Trying to add an already existing object");
            (this.allObjects.set(e.id, e), this._onObjectSpawned.dispatch(this, e));
          }
          removeObject(e) {
            if (!this.allObjects.has(e.id)) throw new Error("Trying to remove non-existent object");
            (this.allObjects.delete(e.id), this._onObjectRemoved.dispatch(this, e));
          }
          hasObjectId(e) {
            return this.allObjects.has(e);
          }
          getObjectById(e) {
            if (!this.allObjects.has(e)) throw new Error(`Object with id ${e} doesn't exist`);
            return this.allObjects.get(e);
          }
          getAllObjects() {
            return [...this.allObjects.values()];
          }
        }),
      );
    },
  };
});
