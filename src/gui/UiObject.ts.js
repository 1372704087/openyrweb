// === Reconstructed SystemJS module: gui/UiObject ===
// deps: ["engine/renderable/WithPosition","engine/gfx/RenderableContainer","util/event","engine/renderable/WithVisibility"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/UiObject",
  [
    "engine/renderable/WithPosition",
    "engine/gfx/RenderableContainer",
    "util/event",
    "engine/renderable/WithVisibility",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
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
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        e(
          "UiObject",
          (n = class n {
            get onFrame() {
              return this._onFrame.asEvent();
            }
            get onDispose() {
              return this._onDispose.asEvent();
            }
            static zIndexToWorld(e) {
              return -e;
            }
            constructor(e, t) {
              ((this.rendered = !1),
                (this.eventHandlers = []),
                (this._onFrame = new s.EventDispatcher()),
                (this._onDispose = new s.EventDispatcher()),
                e && this.set3DObject(e),
                t && this.setHtmlContainer(t),
                (this.withPosition = new i.WithPosition()),
                (this.withVisibility = new a.WithVisibility()),
                (this.container = new r.RenderableContainer()));
            }
            get3DObject() {
              return this.target;
            }
            set3DObject(e) {
              (this.target = e).matrixAutoUpdate = !1;
            }
            getRenderableContainer() {
              return this.container;
            }
            getHtmlContainer() {
              return this.htmlContainer;
            }
            setHtmlContainer(e) {
              this.htmlContainer = e;
            }
            setPosition(e, t) {
              var i = this.withPosition.getPosition().z || 0;
              (this.withPosition.setPosition(e, t, i), this.htmlContainer?.setPosition(e, t));
            }
            getPosition() {
              var { x: e, y: t } = this.withPosition.getPosition();
              return { x: e, y: t };
            }
            setZIndex(e) {
              var t = this.withPosition.getPosition();
              this.withPosition.setPosition(t.x, t.y, n.zIndexToWorld(e));
            }
            setVisible(e) {
              (this.withVisibility.setVisible(e), this.htmlContainer?.setVisible(e));
            }
            isVisible() {
              return this.withVisibility.isVisible();
            }
            setTooltip(e) {
              ((this.tooltip = e), this.updateTooltip());
            }
            updateTooltip() {
              let e = this.get3DObject();
              e && (e.userData.tooltip = this.tooltip);
            }
            setPointerEvents(e) {
              if (this.pointerEvents) throw new Error("A PointerEvents instance is already set");
              this.pointerEvents = e;
            }
            addEventListener(e, t) {
              return (
                this.eventHandlers.push({ eventName: e, handler: t }),
                this.rendered && this.setupEventListener(e, t),
                () => this.removeEventListener(e, t)
              );
            }
            removeEventListener(t, i) {
              var e = this.eventHandlers.findIndex((e) => t === e.eventName && i === e.handler);
              -1 !== e && (this.eventHandlers[e].disposer?.(), this.eventHandlers.splice(e, 1));
            }
            setupEventListener(t, i) {
              if (!this.pointerEvents)
                throw new Error("A PointerEvents object must be provided prior to setting up an event listener");
              var e = this.pointerEvents.addEventListener(this.get3DObject(), t, i);
              let r = this.eventHandlers.find((e) => t === e.eventName && i === e.handler);
              r && (r.disposer = e);
            }
            create3DObject() {
              if (!this.get3DObject()) throw new Error("Expecting a THREE.Object3D to have been set by now");
              this.rendered ||
                ((this.rendered = !0),
                (this.withPosition.matrixUpdate = !0),
                this.withPosition.applyTo(this),
                this.withVisibility.applyTo(this),
                this.htmlContainer?.render(),
                this.htmlContainer?.setPosition(this.withPosition.getPosition().x, this.withPosition.getPosition().y),
                this.htmlContainer?.setVisible(this.withVisibility.isVisible()),
                this.container.set3DObject(this.get3DObject()),
                this.container.create3DObject(),
                this.updateTooltip(),
                this.eventHandlers.forEach((e) => this.setupEventListener(e.eventName, e.handler)));
            }
            update(e) {
              (this.container.update(e), this._onFrame.dispatch(this, e));
            }
            add(...e) {
              (this.container.add(...e),
                e
                  .map((e) => e.getHtmlContainer())
                  .forEach((e) => {
                    if (e) {
                      if (!this.htmlContainer)
                        throw new Error(
                          "Can't add an UiObject that defines an HTMLContainer to a parent that doesn't provide an HTML container.",
                        );
                      this.htmlContainer.add(e);
                    }
                  }));
            }
            remove(...e) {
              (e.map((e) => e.getHtmlContainer()).forEach((e) => e && this.htmlContainer?.remove(e)),
                this.container.remove(...e));
            }
            removeAll() {
              this.container.removeAll();
            }
            destroy() {
              (this.container.getChildren().forEach((e) => e.destroy?.()),
                this.htmlContainer?.unrender(),
                this.eventHandlers.forEach((e) => e.disposer?.()),
                (this.eventHandlers.length = 0),
                (this._onFrame = new s.EventDispatcher()),
                this._onDispose.dispatch(),
                (this._onDispose = new s.EventDispatcher()));
            }
          }),
        );
      },
    };
  },
);
