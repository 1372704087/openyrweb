// === Reconstructed SystemJS module: gui/screen/game/component/hud/Messages ===
// deps: ["gui/jsx/jsx","gui/UiObject","gui/jsx/UiComponent","gui/HtmlContainer","engine/gfx/SpriteUtils","engine/gfx/CanvasUtils","gui/jsx/HtmlView","gui/screen/game/component/hud/HudChat","network/chat/ChatMessage","network/gservConfig"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/Messages",
  [
    "gui/jsx/jsx",
    "gui/UiObject",
    "gui/jsx/UiComponent",
    "gui/HtmlContainer",
    "engine/gfx/SpriteUtils",
    "engine/gfx/CanvasUtils",
    "gui/jsx/HtmlView",
    "gui/screen/game/component/hud/HudChat",
    "network/chat/ChatMessage",
    "network/gservConfig",
  ],
  function (e, t) {
    "use strict";
    var i, s, r, a, n, o, l, c, h, u, d;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        ((d = class extends r.UiComponent {
          createUiObject() {
            let e = new s.UiObject(new THREE.Object3D(), new a.HtmlContainer());
            e.setPosition(this.props.x || 0, this.props.y || 0);
            var t = this.props.width,
              i = this.props.height;
            let r = document.createElement("canvas");
            return (
              (r.width = t),
              (r.height = i),
              (this.ctx = r.getContext("2d", { alpha: !0 })),
              (this.texture = this.createTexture(r)),
              (this.mesh = this.createMesh(t, i)),
              e
            );
          }
          createTexture(e) {
            let t = new THREE.Texture(e);
            return (
              (t.needsUpdate = !0),
              (t.flipY = !1),
              (t.minFilter = THREE.NearestFilter),
              (t.magFilter = THREE.NearestFilter),
              t
            );
          }
          createMesh(e, t) {
            let i = n.SpriteUtils.createRectGeometry(e, t);
            (n.SpriteUtils.addRectUvs(i, { x: 0, y: 0, width: e, height: t }, { width: e, height: t }),
              i.translate(e / 2, t / 2, 0));
            var r = new THREE.MeshBasicMaterial({ map: this.texture, side: THREE.DoubleSide, transparent: !0 });
            let s = new THREE.Mesh(i, r);
            return ((s.frustumCulled = !1), s);
          }
          defineChildren() {
            return i.jsx(
              "fragment",
              null,
              i.jsx(
                "container",
                { hidden: !0, ref: (e) => (this.inputContainer = e) },
                i.jsx(l.HtmlView, {
                  component: c.HudChat,
                  props: {
                    strings: this.props.strings,
                    messageList: this.props.messages,
                    chatHistory: this.props.chatHistory,
                    onSubmit: this.props.onMessageSubmit,
                    onCancel: this.props.onMessageCancel,
                  },
                  innerRef: (e) => (this.inputComponent = e),
                }),
              ),
              i.jsx("mesh", { zIndex: this.props.zIndex }, this.mesh),
            );
          }
          onFrame(e) {
            var t, i, r, s, a;
            (!this.lastUpdate || e - this.lastUpdate >= 1e3 / 30) &&
              ((this.lastUpdate = e),
              this.props.messages.prune(),
              (t = this.props.messages.getAll()),
              (i = Date.now()),
              (r = t[t.length - 1]?.time),
              (s = t.length),
              (a = this.props.messages.isComposing),
              (this.lastComposing !== a ||
                this.lastMessageTime !== r ||
                s !== this.lastMessageCount ||
                (r && i - r <= 2e3)) &&
                ((this.lastMessageTime = r),
                (this.lastMessageCount = s),
                (this.lastComposing = a),
                this.drawMessages(a, t, i),
                this.inputContainer.setVisible(a),
                this.inputComponent.refresh()));
          }
          drawMessages(e, t, i) {
            this.ctx.clearRect(0, 0, this.props.width, this.props.height);
            var r = Math.floor((110 * this.props.width) / 600);
            let s = !1;
            var a, n;
            let o = 0;
            e &&
              ((o = 20),
              ((a = this.props.chatHistory.lastComposeTarget.value).type === h.ChatRecipientType.Channel &&
                a.name === u.RECIPIENT_ALL) ||
                (t = [
                  {
                    color: "gray",
                    text: this.props.strings.get("TS:ChatCycleHint", "Tab"),
                    animate: !1,
                    time: Date.now(),
                  },
                  ...t,
                ]));
            for (n of t) {
              var l,
                c = Math.min(1e3, 10 * n.text.length),
                c = n.animate ? Math.min(1, (i - n.time) / c) : 1;
              let e = Math.round(c * n.text.length);
              c < 1 && (s = !0);
              for (l of this.wrapText(n.text, r))
                (l.length > e ? ((l = l.slice(0, e)), (e = 0)) : (e -= l.length), (o += this.drawLine(l, n.color, o)));
            }
            ((this.texture.needsUpdate = !0), s && this.props.onMessageTick?.());
          }
          drawLine(e, t, i) {
            return o.CanvasUtils.drawText(this.ctx, e, 0, i, {
              color: t,
              ...{
                fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
                fontSize: 13,
                fontWeight: "500",
                paddingTop: 5,
                height: 20,
                backgroundColor: "rgba(0, 0, 0, .75)",
              },
              paddingLeft: 4,
              paddingRight: 4,
            }).height;
          }
          wrapText(t, i) {
            let r = [];
            for (; t.length > i;) {
              let e = t.slice(0, i).search(/\s[^\s]*$/);
              ((-1 !== e && 0 !== e) || (e = Math.min(t.length, i)), r.push(t.substr(0, e)), (t = t.slice(e)));
            }
            return (t.length && r.push(t), r);
          }
          onDispose() {
            (this.mesh.geometry.dispose(), this.mesh.material.dispose(), this.texture.dispose());
          }
        }),
          e("Messages", d));
      },
    };
  },
);
