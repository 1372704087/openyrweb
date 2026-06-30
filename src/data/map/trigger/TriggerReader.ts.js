// === Reconstructed SystemJS module: data/map/trigger/TriggerReader ===
// deps: ["data/map/trigger/TriggerEventType","data/map/trigger/TriggerActionType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "data/map/trigger/TriggerReader",
  ["data/map/trigger/TriggerEventType", "data/map/trigger/TriggerActionType"],
  function (e, t) {
    "use strict";
    var h, c, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          h = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        e(
          "TriggerReader",
          (i = class {
            read(e, t, i, r) {
              let s = this.readTriggers(e),
                { events: a, unknownEventTypes: n } = this.readEvents(t),
                { actions: o, unknownActionTypes: l } = this.readActions(i),
                c = [...r.values()],
                h = new Set(s);
              for (let p of s.values()) {
                var u = a.get(p.id);
                u && p.events.push(...u);
                u = o.get(p.id);
                (u && p.actions.push(...u),
                  !p.attachedTriggerId ||
                    ((u = s.find((e) => e.id === p.attachedTriggerId)) && ((p.attachedTrigger = u), h.delete(u))));
              }
              for (let m of h) {
                var d = c.find((e) => e.triggerId === m.id);
                if (d) {
                  let e = m;
                  for (; e;) ((e.tag = d), (e = e.attachedTrigger));
                } else {
                  let e = m;
                  for (; e;) {
                    console.warn(`Trigger ${e.id} has no associated tag or valid root trigger. Skipping.`);
                    var g = s.indexOf(e);
                    (-1 !== g && s.splice(g, 1), (e = e.attachedTrigger));
                  }
                }
              }
              return { triggers: s, unknownEventTypes: n, unknownActionTypes: l };
            }
            readTriggers(e) {
              let t = [];
              for (var [i, r] of e.entries) {
                var s = r.split(",");
                s.length < 8
                  ? console.warn(`Invalid trigger ${i}=${r}. Skipping.`)
                  : ((s = {
                      id: i,
                      houseName: s[0],
                      attachedTriggerId: "<none>" !== s[1] ? s[1] : void 0,
                      attachedTrigger: void 0,
                      name: s[2],
                      disabled: Boolean(Number(s[3])),
                      difficulties: {
                        easy: Boolean(Number(s[4])),
                        medium: Boolean(Number(s[5])),
                        hard: Boolean(Number(s[6])),
                      },
                      events: [],
                      actions: [],
                      tag: void 0,
                    }),
                    t.push(s));
              }
              return t;
            }
            readEvents(e) {
              let s = new Map(),
                a = new Set();
              for (var [n, t] of e.entries) {
                let r = t.split(",");
                if (r.length < 4) console.warn(`Invalid event ${n}=${t}. Skipping.`);
                else {
                  var o = Number(r.shift());
                  let t = [];
                  for (let i = 0; i < o; i++) {
                    var l = Number(r.shift()),
                      c = Number(r.shift());
                    let e = r.splice(0, 2 === c ? 2 : 1);
                    void 0 !== h.TriggerEventType[l]
                      ? ((c = { triggerId: n, eventIndex: i, type: l, params: [c, ...e.map((e) => e || "0")] }),
                        t.push(c))
                      : (a.add(l), console.warn(`Unknown event type ${l} for trigger id ${n}. Skipping.`));
                  }
                  s.set(n, t);
                }
              }
              return { events: s, unknownEventTypes: a };
            }
            readActions(e) {
              let r = new Map(),
                s = new Set();
              for (var [a, t] of e.entries) {
                let i = t.split(",");
                if (i.length < 9) console.warn(`Invalid action ${a}=${t}. Skipping.`);
                else {
                  var n = Number(i.shift());
                  if (i.length < 8 * n) console.warn(`Invalid action ${a}=${t}. Skipping.`);
                  else {
                    let e = [];
                    for (let t = 0; t < n; t++) {
                      var o = Number(i.shift()),
                        l = i.splice(0, 7);
                      void 0 !== c.TriggerActionType[o]
                        ? ((l = {
                            triggerId: a,
                            index: t,
                            type: o,
                            params: [
                              Number(l[0] || "0"),
                              l[1] || "0",
                              l[2] || "0",
                              l[3] || "0",
                              l[4] || "0",
                              l[5] || "0",
                              l[6] ? this.readAZActionParam(l[6]) : 0,
                            ],
                          }),
                          e.push(l))
                        : (s.add(o), console.warn(`Unknown action type ${o} for trigger id "${a}". Skipping.`));
                    }
                    r.set(a, e);
                  }
                }
              }
              return { actions: r, unknownActionTypes: s };
            }
            readAZActionParam(e) {
              var t = "Z".charCodeAt(0),
                i = "A".charCodeAt(0),
                t = t - i + 1;
              return 1 < e.length ? e.charCodeAt(1) - i + (e.charCodeAt(0) - i + 1) * t : e.charCodeAt(0) - i;
            }
          }),
        );
      },
    };
  },
);
