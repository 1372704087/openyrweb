// === Reconstructed SystemJS module: gui/component/ChatInput ===
// deps: ["react","network/chat/ChatMessage","network/gservConfig"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/ChatInput",
  ["react", "network/chat/ChatMessage", "network/gservConfig"],
  function (e, t) {
    "use strict";
    var k, B, N, j, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          k = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          N = e;
        },
      ],
      execute: function () {
        (e("IMPLICIT_CHANNEL_NAME", (j = "")),
          (i = (
            {
              chatHistory: s,
              channels: r,
              strings: t,
              className: e,
              tooltip: i,
              forceColor: a,
              noCycleHint: n,
              submitEmpty: o,
              onKeyDown: l,
              onKeyUp: c,
              onBlur: h,
              onCancel: u,
              onSubmit: d,
            },
            g,
          ) => {
            const p = k.useRef(null),
              [m, f] = k.useState(() => A()),
              [y, T] = k.useState(() => {
                var e = s?.lastComposeTarget.value;
                return M(e) ? e : { type: B.ChatRecipientType.Channel, name: r[0] ?? j };
              }),
              [v, b] = k.useState(),
              [S, w] = k.useState(),
              [E, C] = k.useState(!1),
              [x, O] = k.useState(!1);
            function A() {
              const e = (r.length ? r : [j]).map((e) => ({ type: B.ChatRecipientType.Channel, name: e }));
              var t, i;
              return (
                s &&
                  ((t = s.lastWhisperFrom.value),
                  (i = s.lastWhisperTo.value),
                  t && e.push({ type: B.ChatRecipientType.Whisper, name: t }),
                  i && i !== t && e.push({ type: B.ChatRecipientType.Whisper, name: i })),
                e
              );
            }
            function M(e) {
              return e && (e.type !== B.ChatRecipientType.Channel || r.includes(e.name));
            }
            function R(e) {
              (s && (s.lastComposeTarget.value = e), T(e));
            }
            (k.useEffect(() => {
              p.current?.focus();
            }, []),
              k.useEffect(() => {
                M(y) || T({ type: B.ChatRecipientType.Channel, name: r[0] ?? j });
              }, [r]),
              k.useEffect(() => {
                if (s) {
                  let e = (e) => {
                      y !== e && M(e) && (T(e), p.current?.focus());
                    },
                    t = () => {
                      f(A());
                    };
                  return (
                    s.lastComposeTarget.onChange.subscribe(e),
                    s.lastWhisperFrom.onChange.subscribe(t),
                    s.lastWhisperTo.onChange.subscribe(t),
                    () => {
                      (s.lastComposeTarget.onChange.unsubscribe(e),
                        s.lastWhisperFrom.onChange.unsubscribe(t),
                        s.lastWhisperTo.onChange.unsubscribe(t));
                    }
                  );
                }
              }, [y, s, r]),
              k.useImperativeHandle(
                g,
                () => ({
                  send() {
                    let e = p.current;
                    var t;
                    !e || ((t = e.value).length && (d({ recipient: y, value: t }), (e.value = ""), e.focus(), w(t)));
                  },
                }),
                [y],
              ));
            var P = (function (e) {
              if (e.type === B.ChatRecipientType.Channel)
                return e.name === N.RECIPIENT_TEAM
                  ? t.get("TS:ToAllies")
                  : e.name === N.RECIPIENT_ALL
                    ? t.get("TS:ToAll")
                    : "";
              if (e.type === B.ChatRecipientType.Whisper) return t.get("TS:To", e.name);
              throw new Error(`Recipient type ${e.type} not implemented`);
            })(y);
            let I =
              !n && E && !x && (1 < m.length || y.type === B.ChatRecipientType.Whisper)
                ? t.get("TS:ChatCycleHint", "Tab")
                : void 0;
            return k.default.createElement(
              "div",
              { className: e },
              P && k.default.createElement("label", { style: { color: a } }, P),
              k.default.createElement("input", {
                type: "text",
                autoComplete: "off",
                spellCheck: !1,
                ref: p,
                maxLength: 128,
                "data-r-tooltip": i,
                placeholder: I,
                style: { color: a },
                onKeyDown: (e) => {
                  ("Tab" === e.key && e.preventDefault(), e.repeat || b(e.key), l?.(e));
                },
                onKeyUp: (e) => {
                  let t = e.target;
                  var i;
                  ("Enter" === e.key
                    ? "Enter" === v &&
                      (((i = t.value).length || o) && d({ recipient: y, value: i }), i.length && ((t.value = ""), w(i)))
                    : "Tab" === e.key
                      ? "Tab" === v &&
                        (function (t) {
                          if (1 !== m.length || m[0].name !== t.name) {
                            let e = m.findIndex((e) => e.type === t.type && e.name === t.name);
                            e = -1 === e ? 0 : (e + 1) % m.length;
                            var i = m[e];
                            (O(!0), R(i));
                          }
                        })(y)
                      : "ArrowUp" === e.key && S
                        ? (t.value = S)
                        : "Escape" === e.key && "Process" !== v && (u?.(0 === t.value.length), (t.value = "")),
                    c?.(e));
                },
                onChange: (e) => {
                  let t = e.target.value;
                  var i = t.match(/^\/(?:page|whisper|w|msg|m) ([A-Za-z0-9-_']+) /i);
                  i && (R({ type: B.ChatRecipientType.Whisper, name: i[1] }), (e.target.value = ""));
                  var r = t.match(/^\/r(eply)? /i);
                  (r &&
                    (void 0 !== s?.lastWhisperFrom.value &&
                      R({ type: B.ChatRecipientType.Whisper, name: s.lastWhisperFrom.value }),
                    (e.target.value = "")),
                    i || r || void 0 === I || O(!0));
                },
                onFocus: () => {
                  C(!0);
                },
                onBlur: () => {
                  (C(!1), h?.());
                },
              }),
            );
          }),
          e("ChatInput", k.forwardRef(i)));
      },
    };
  },
);
