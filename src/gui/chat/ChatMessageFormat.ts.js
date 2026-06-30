// === Reconstructed SystemJS module: gui/chat/ChatMessageFormat ===
// deps: ["react","network/chat/ChatMessage","network/gservConfig","gui/ReactFormat"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/chat/ChatMessageFormat",
  ["react", "network/chat/ChatMessage", "network/gservConfig", "gui/ReactFormat"],
  function (e, t) {
    "use strict";
    var c, h, u, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        e(
          "ChatMessageFormat",
          (r = class {
            constructor(e, t, i) {
              ((this.strings = e), (this.localUsername = t), (this.userColors = i));
            }
            formatPrefixPlain(e) {
              let t;
              if (e.to.type === h.ChatRecipientType.Channel)
                t =
                  e.to.name === u.RECIPIENT_TEAM
                    ? this.strings.get("TS:ChatFromAllies", e.from)
                    : this.strings.get("TS:ChatFrom", e.from);
              else if (e.to.type === h.ChatRecipientType.Page) t = this.strings.get("TS:PageFrom", e.from);
              else {
                if (e.to.type !== h.ChatRecipientType.Whisper) throw new Error("Unknown message type " + e.to.type);
                t =
                  e.from === this.localUsername
                    ? this.strings.get("TS:To", e.to.name)
                    : this.strings.get("TXT_FROM", e.from);
              }
              return t;
            }
            formatPrefixHtml(e, t) {
              let i = e.to.type === h.ChatRecipientType.Whisper && e.from === this.localUsername ? e.to.name : e.from,
                r = i,
                s;
              var a,
                n = "{user}";
              e.to.type !== h.ChatRecipientType.Page &&
                (void 0 !== (a = this.userColors?.get(e.from)) &&
                  (r = c.default.createElement("span", { style: { color: a } }, r)),
                t &&
                  ((l = this.strings.get("TS:ChatUserLink", n).split(n)),
                  (r = c.default.createElement(
                    "span",
                    { className: "user-link", onClick: () => t(i) },
                    l[0],
                    r,
                    l[1],
                  ))),
                (s =
                  this.strings.get("TS:ChatTimestamp", e.time.toLocaleTimeString(void 0, { timeStyle: "short" })) +
                  " "));
              let o;
              if (e.to.type === h.ChatRecipientType.Channel)
                o =
                  e.to.name === u.RECIPIENT_TEAM
                    ? this.strings.get("TS:ChatFromAllies", n)
                    : this.strings.get("TS:ChatFrom", n);
              else if (e.to.type === h.ChatRecipientType.Page) o = this.strings.get("TS:PageFrom", n);
              else {
                if (e.to.type !== h.ChatRecipientType.Whisper) throw new Error("Unknown message type " + e.to.type);
                o = e.from === this.localUsername ? this.strings.get("TS:To", n) : this.strings.get("TXT_FROM", n);
              }
              var [l, n] = o.split(n);
              return c.default.createElement(c.default.Fragment, null, s, l, r, n);
            }
            formatTextHtml(e, t) {
              return t ? i.ReactFormat.formatUrls(e) : e;
            }
          }),
        );
      },
    };
  },
);
