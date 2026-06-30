// === Reconstructed SystemJS module: gui/screen/game/gameMenu/GameMenuController ===
// deps: ["gui/screen/Controller"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/gameMenu/GameMenuController", ["gui/screen/Controller"], function (e, t) {
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
      ((r = class extends i.Controller {
        constructor(e) {
          (super(), (this.hud = e), (this.contentAreaVisible = !1));
        }
        async goToScreenBlocking(...e) {
          var [t, i] = e;
          return super.goToScreenBlocking(t, i);
        }
        goToScreen(...e) {
          var [t, i] = e;
          return super.goToScreen(t, i);
        }
        async pushScreen(...e) {
          var [t, i] = e;
          (this.setMainComponent(), await super.pushScreen(t, i));
        }
        async popScreen(e) {
          (this.setMainComponent(), await super.popScreen(e));
        }
        async close() {
          for (; this.screenStack.length;) await this.popScreen();
        }
        setHud(e) {
          this.hud = e;
        }
        setSidebarButtons(e) {
          this.sidebarButtons = e;
        }
        showSidebarButtons() {
          if (void 0 === this.sidebarButtons) throw new Error("Sidebar buttons should be set first");
          this.hud.showSidebarMenu(this.sidebarButtons);
        }
        hideSidebarButtons() {
          ((this.sidebarButtons = void 0), this.hud.hideSidebarMenu());
        }
        setMainComponent(e) {
          ((this.mainContentComponent = e), this.hud.setMenuContentComponent(this.mainContentComponent));
        }
        toggleContentAreaVisibility(e) {
          ((this.contentAreaVisible = e), this.hud.toggleMenuContentVisibility(e));
        }
        rerenderCurrentScreen() {
          (super.rerenderCurrentScreen(),
            this.sidebarButtons && this.hud.showSidebarMenu(this.sidebarButtons),
            this.hud.setMenuContentComponent(this.mainContentComponent),
            this.hud.toggleMenuContentVisibility(this.contentAreaVisible));
        }
        destroy() {
          (super.destroy(), this.setMainComponent(void 0));
        }
      }),
        e("GameMenuController", r));
    },
  };
});
