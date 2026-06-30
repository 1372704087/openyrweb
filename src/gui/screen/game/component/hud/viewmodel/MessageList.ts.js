// === Reconstructed SystemJS module: gui/screen/game/component/hud/viewmodel/MessageList ===
// deps: ["util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/component/hud/viewmodel/MessageList", ["util/event"], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "MessageList",
        (i = class {
          get onNewMessage() {
            return this._onNewMessage.asEvent();
          }
          constructor(e, t, i) {
            ((this.messageDurationSeconds = e),
              (this.maxMessages = t),
              (this.localPlayer = i),
              (this.isComposing = !1),
              (this.messages = []),
              (this._onNewMessage = new r.EventDispatcher()));
          }
          addUiFeedbackMessage(e) {
            var t = { text: e, color: this.localPlayer?.color.asHexString() ?? "grey", time: Date.now(), animate: !1 };
            (this.messages.push(t), this._onNewMessage.dispatch(this, t));
          }
          addSystemMessage(e, t, i) {
            var r = {
              text: e,
              color: "string" == typeof t ? t : t.color.asHexString(),
              time: Date.now(),
              animate: !0,
              durationSeconds: i,
            };
            (this.messages.push(r), this._onNewMessage.dispatch(this, r));
          }
          addChatMessage(e, t) {
            var i = { text: e, color: t, time: Date.now(), animate: !0 };
            (this.messages.push(i), this._onNewMessage.dispatch(this, i));
          }
          prune() {
            let t = Date.now();
            ((this.messages = this.messages.filter(
              (e) => e.time >= t - 1e3 * (e.durationSeconds ?? this.messageDurationSeconds),
            )),
              this.messages.splice(0, this.messages.length - this.maxMessages));
          }
          getAll() {
            return this.messages;
          }
        }),
      );
    },
  };
});
