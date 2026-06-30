// === Reconstructed SystemJS module: gui/component/Chat ===
// deps: ["react","classnames","network/chat/ChatMessage","gui/chat/ChatMessageFormat","gui/component/ChatInput"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/Chat",
  ["react", "classnames", "network/chat/ChatMessage", "gui/chat/ChatMessageFormat", "gui/component/ChatInput"],
  function (e, t) {
    "use strict";
    var n, o, l, c, a, h, i;
    t && t.id;
    return {
      setters: [
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
          a = e;
        },
      ],
      execute: function () {
        ((h = new Map()
          .set(l.ChatRecipientType.Channel, "type-channel")
          .set(l.ChatRecipientType.Page, "type-page")
          .set(l.ChatRecipientType.Whisper, "type-whisper")),
          (i = class extends n.default.Component {
            constructor() {
              (super(...arguments), (this.prevMessageCount = 0));
            }
            render() {
              let { messages: e, tooltips: t, strings: i, chatHistory: r, channels: s } = this.props;
              return n.default.createElement(
                "div",
                { className: "chat-wrapper" },
                n.default.createElement(
                  "div",
                  { className: "messages", ref: (e) => (this.messageList = e), "data-r-tooltip": t?.output },
                  e.map((e, t) => this.renderMessage(e, t)),
                ),
                n.default.createElement(
                  "div",
                  { className: "new-message-wrapper" },
                  n.default.createElement(a.ChatInput, {
                    ref: (e) => (this.textBox = e),
                    chatHistory: r,
                    channels: s,
                    className: "new-message",
                    tooltip: t?.input,
                    strings: i,
                    onSubmit: this.props.onSendMessage,
                    onCancel: this.props.onCancelMessage,
                  }),
                  n.default.createElement("button", {
                    className: "icon-button send-message-button",
                    "data-r-tooltip": t?.button,
                    onClick: () => this.textBox.send(),
                  }),
                ),
              );
            }
            componentDidUpdate(e, t) {
              var i, r;
              (this.props.messages[0] === this.prevOldestMessage &&
                this.props.messages.length === this.prevMessageCount) ||
                ((this.prevMessageCount = this.props.messages.length),
                (this.prevOldestMessage = this.props.messages[0]),
                (i = this.messageList.scrollHeight),
                (r = this.messageList.clientHeight),
                i !== this.prevScrollHeight &&
                  (!this.prevScrollHeight || Math.abs(this.messageList.scrollTop - (this.prevScrollHeight - r)) <= 1) &&
                  (this.messageList.scrollTop = i - r),
                (this.prevScrollHeight = i));
            }
            renderMessage(t, e) {
              let i = new c.ChatMessageFormat(this.props.strings, this.props.localUsername, this.props.userColors),
                r = ["message"],
                s;
              void 0 !== t.from &&
                ((s = i.formatPrefixHtml(t, (e) => {
                  this.props.chatHistory &&
                    t.to &&
                    t.to.type !== l.ChatRecipientType.Page &&
                    (this.props.chatHistory.lastComposeTarget.value = { type: l.ChatRecipientType.Whisper, name: e });
                })),
                r.push(h.get(t.to.type), { "operator-message": t.operator }));
              var a = void 0 === t.from && !t.untrustedContent,
                a = i.formatTextHtml(t.text, a);
              return n.default.createElement(
                "div",
                { key: e, className: o.default(r) },
                s
                  ? n.default.createElement(n.default.Fragment, null, n.default.createElement("span", null, s), " ", a)
                  : a,
              );
            }
          }),
          e("Chat", i));
      },
    };
  },
);
