// === Reconstructed SystemJS module: gui/screen/game/ChatTypingHandler ===
// deps: ["network/chat/ChatMessage","network/gservConfig"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/ChatTypingHandler",
  ["network/chat/ChatMessage", "network/gservConfig"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e(
          "ChatTypingHandler",
          (s = class {
            constructor(e, t, i, r) {
              ((this.keyboardHandler = e),
                (this.arrowScrollHandler = t),
                (this.messageList = i),
                (this.chatHistory = r),
                (this.isTyping = !1));
            }
            startTyping() {
              this.isTyping ||
                (this.keyboardHandler.pause(),
                this.arrowScrollHandler.pause(),
                (this.messageList.isComposing = !0),
                (this.isTyping = !0));
            }
            endTyping() {
              this.isTyping &&
                (this.keyboardHandler.unpause(),
                this.arrowScrollHandler.unpause(),
                (this.messageList.isComposing = !1),
                (this.isTyping = !1));
            }
            handleKeyDown(e) {
              this.isTyping ||
                ("Enter" === e.key
                  ? this.startTyping()
                  : "Backspace" === e.key &&
                    ((this.chatHistory.lastComposeTarget.value = {
                      type: i.ChatRecipientType.Channel,
                      name: r.RECIPIENT_TEAM,
                    }),
                    this.startTyping()));
            }
            handleKeyUp(e) {}
            dispose() {
              (this.keyboardHandler.unpause(), this.arrowScrollHandler.unpause(), (this.messageList.isComposing = !1));
            }
          }),
        );
      },
    };
  },
);
