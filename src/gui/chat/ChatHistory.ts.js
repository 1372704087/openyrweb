// === Reconstructed SystemJS module: gui/chat/ChatHistory ===
// deps: ["network/chat/ChatMessage","network/gservConfig","util/BoxedVar","util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/chat/ChatHistory",
  ["network/chat/ChatMessage", "network/gservConfig", "util/BoxedVar", "util/event"],
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
          "ChatHistory",
          (n = class {
            constructor() {
              ((this.lastWhisperFrom = new s.BoxedVar(void 0)),
                (this.lastWhisperTo = new s.BoxedVar(void 0)),
                (this.lastComposeTarget = new s.BoxedVar({ type: i.ChatRecipientType.Channel, name: r.RECIPIENT_ALL })),
                (this.messages = []),
                (this._onNewMessage = new a.EventDispatcher()));
            }
            get onNewMessage() {
              return this._onNewMessage.asEvent();
            }
            addChatMessage(e) {
              (this.messages.push(e), this._onNewMessage.dispatch(this, e));
            }
            getAll() {
              return this.messages;
            }
          }),
        );
      },
    };
  },
);
