// === Reconstructed SystemJS module: gui/screen/Controller ===
// deps: ["util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/Controller", ["util/event"], function (e, t) {
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
        "Controller",
        (r = class {
          constructor() {
            ((this.screens = new Map()), (this.screenStack = []), (this._onScreenChange = new i.EventDispatcher()));
          }
          get onScreenChange() {
            return this._onScreenChange.asEvent();
          }
          addScreen(e, t) {
            (this.screens.set(e, t), t.setController(this));
          }
          hasScreen(e) {
            return this.screens.has(e);
          }
          async leaveCurrentScreen() {
            await this.popScreen();
          }
          async goToScreenBlocking(e, t) {
            for (; this.screenStack.length;) await this.leaveCurrentScreen();
            await this.pushScreen(e, t);
          }
          goToScreen(e, t) {
            this.goToScreenBlocking(e, t);
          }
          async pushScreen(e, t) {
            let i = this.screens.get(e);
            if (!i) throw new Error("Invalid screen type " + e);
            (this.screenStack.length && (await this.screenStack[this.screenStack.length - 1].onStack?.()),
              this.screenStack.push(i),
              this._onScreenChange.dispatch(this, e),
              i.onEnter(t));
          }
          async popScreen(e) {
            (this.screenStack.length &&
              (await this.screenStack.pop().onLeave(), this._onScreenChange.dispatch(this, void 0)),
              this.screenStack.length && this.screenStack[this.screenStack.length - 1].onUnstack?.(e));
          }
          rerenderCurrentScreen() {
            this.screenStack.length && this.screenStack[this.screenStack.length - 1].onViewportChange?.();
          }
          getCurrentScreen() {
            return this.screenStack.length ? this.screenStack[this.screenStack.length - 1] : void 0;
          }
          destroy() {
            for (var e of this.screens.values()) e.setController(void 0);
            (this.screens.clear(), (this.screenStack.length = 0));
          }
        }),
      );
    },
  };
});
