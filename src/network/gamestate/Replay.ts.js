// === Reconstructed SystemJS module: network/gamestate/Replay ===
// deps: ["network/gameopt/Serializer","network/gameopt/Parser","util/Base64","network/gamestate/replay/ReplayEventFactory","util/stream","util/string"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gamestate/Replay",
  [
    "network/gameopt/Serializer",
    "network/gameopt/Parser",
    "util/Base64",
    "network/gamestate/replay/ReplayEventFactory",
    "util/stream",
    "util/string",
  ],
  function (e, t) {
    "use strict";
    var T, v, b, S, d, w, i, E, C;
    t && t.id;
    return {
      setters: [
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          w = e;
        },
      ],
      execute: function () {
        ((E = [5, (i = 6)]),
          e(
            "Replay",
            (C = class C {
              constructor() {
                ((this.name = ""), (this.events = []));
              }
              static sanitizeFileName(e, t = "_") {
                return e
                  .replace(/[/?<>\\:*|"]/g, t)
                  .replace(/[\x00-\x1f\x7f\x80-\x9f]/g, t)
                  .slice(0, this.maxNameLength);
              }
              init(e, t, i, r, s) {
                ((this.gameId = e),
                  (this.gameTimestamp = t),
                  (this.gameOpts = i),
                  (this.engineVersion = r),
                  (this.modHash = s),
                  (this.name = C.sanitizeFileName(
                    this.gameOpts.mapTitle + " " + new Date().toISOString().replace(/(\.|,)\d+Z$/, "Z"),
                  )),
                  (this.timestamp = Date.now()));
              }
              writeEvent(...e) {
                this.events.push(...e);
              }
              finish(e) {
                this.endTick = e;
              }
              getEvents() {
                return this.events;
              }
              *flush() {
                if (!this.gameOpts) throw new Error("Game options must be set first");
                if (!this.engineVersion) throw new Error("Engine version is not set");
                if (void 0 === this.modHash) throw new Error("Mod hash is not set");
                let e = new T.Serializer(),
                  t = this.getHeaderTag() + "\n";
                for (
                  t += `ENGINE ${this.engineVersion} ${this.modHash}
`,
                    t += [this.gameId, this.gameTimestamp, e.serializeOptions(this.gameOpts)].join(" ") + "\n",
                    yield t,
                    t = "";
                  void 0 === this.endTick || this.events.length;
                ) {
                  for (var i of this.events) t += i.tickNo + "=" + i.type + "|" + i.serialize() + "\n";
                  ((this.events.length = 0), yield t, (t = ""));
                }
                ((t += this.getEndTag() + " " + this.endTick + "\n"),
                  this.debugInfo && (t += b.Base64.encode(w.utf16ToBinaryString(this.debugInfo)) + "\n"),
                  yield t);
              }
              serialize() {
                if (void 0 === this.endTick) throw new Error("Replay is not finished");
                let e = "";
                var t,
                  i = this.events.slice();
                for (t of this.flush()) e += t;
                return ((this.events = i), e);
              }
              async parseHeader(e) {
                let t = 0,
                  i,
                  r,
                  s,
                  a,
                  n,
                  o;
                var l;
                for await (l of "string" == typeof e ? e.split("\n") : d.makeTextFileLineIterator(e)) {
                  if (0 === t) i = this.readReplayVersion(l);
                  else if (1 === t) {
                    if (!l.match(C.engineLineRegex)) throw new Error("Missing or invalid game engine version line");
                    var c = l.split(" ");
                    ((r = c[1]), (s = Number(i < 4 ? "0" : c[2])));
                  } else {
                    if (2 !== t) break;
                    if (!l.match(/^([a-zA-Z0-9-]+) \d+ .*$/))
                      throw new Error("Missing or invalid game id/time/opts line");
                    var [h, u, c] = l.split(" ");
                    ((a = h), (n = Number(u)), (o = i < 6 ? b.Base64.decode(c) : c));
                  }
                  t++;
                }
                if (t < 3) throw new Error("Bad replay header");
                return {
                  replayVersion: i,
                  engineVersion: r,
                  modHash: s,
                  gameId: a,
                  gameTimestamp: n,
                  gameOptsSerialized: o,
                };
              }
              unserialize(e, t) {
                let i = e.split("\n");
                var r = this.readReplayVersion(i.shift() || "");
                if (!E.includes(r)) throw new Error("Unsupported replay version " + r);
                let s = new v.Parser(),
                  a = i.shift();
                if (!a || !a.match(C.engineLineRegex)) throw new Error("Missing or invalid game engine version line");
                var [, n, o] = a.split(" ");
                let l = i.shift();
                if (!l) throw new Error("Missing game id/time/opts line");
                var c = l.match(/^([a-zA-Z0-9-]+) (\d+) (.*)$/);
                if (!c) throw new Error("Invalid game id/time/opts line");
                let [, h, u, d] = c;
                r < 6 && (d = b.Base64.decode(d));
                r = s.parseOptions(d);
                (this.init(h, Number(u), r, n, Number(o)), (this.name = t.name), (this.timestamp = t.timestamp));
                let g,
                  p = !1;
                for (; (g = i.shift());) {
                  if (g.startsWith(this.getEndTag())) {
                    p = !0;
                    break;
                  }
                  var m = g.match(/^(\d+)=(\d+)\|(.+)$/);
                  if (!m) throw new Error(`Invalid event line "${g}"`);
                  var [, f, y, m] = m,
                    f = Number(f),
                    y = Number(y);
                  let e = new S.ReplayEventFactory(s, new T.Serializer()).create(y, f);
                  (e.unserialize(m), this.writeEvent(e));
                }
                if (!p) throw new Error("Incomplete replay data");
                o = g.match(new RegExp(`^${this.getEndTag()} (\\d+)$`));
                if (!o) throw new Error("Invalid end tag");
                ((this.endTick = Number(o[1])),
                  1 <= i.length && (this.debugInfo = w.binaryStringToUtf16(b.Base64.decode(i[0]))));
              }
              getHeaderTag() {
                return "RA2TSREPL_v" + i;
              }
              readReplayVersion(e) {
                var t = e.match(/^RA2TSREPL_v(\d+)$/);
                if (!t || t.length < 2) throw new Error("Unknown replay format");
                return Number(t[1]);
              }
              getEndTag() {
                return "END";
              }
            }),
          ),
          (C.extension = ".rpl"),
          (C.maxNameLength = 128),
          (C.engineLineRegex = /^ENGINE \d+\.\d+( \d+)?$/));
      },
    };
  },
);
