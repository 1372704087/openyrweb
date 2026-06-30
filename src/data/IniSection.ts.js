// === Reconstructed SystemJS module: data/IniSection ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/IniSection", [], function (e, t) {
  "use strict";
  var r;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "IniSection",
        (r = class r {
          constructor(e) {
            ((this.entries = new Map()), (this.sections = new Map()), (this.name = e));
          }
          fromJson(e) {
            for (var t in e) {
              var i;
              e.hasOwnProperty(t) &&
                ((i = e[t]),
                Array.isArray(i) || "object" != typeof i ? this.set(t, i) : this.sections.set(t, new r(t).fromJson(i)));
            }
            return this;
          }
          clone() {
            let i = new r(this.name);
            return (
              this.entries.forEach((e, t) => {
                i.set(t, e);
              }),
              this.sections.forEach((e, t) => {
                i.sections.set(t, e.clone());
              }),
              i
            );
          }
          set(e, t) {
            this.entries.set(e, t);
          }
          get(e) {
            return this.entries.get(e);
          }
          has(e) {
            return this.entries.has(e);
          }
          getString(e, t = "") {
            var i = this.get(e);
            return i && "string" == typeof i ? i : t;
          }
          getNumber(e, t = 0) {
            var i = this.get(e);
            if (!i || "string" != typeof i) return t;
            var r = this.parseNumber(i);
            return void 0 === r
              ? (console.warn(`Invalid value for key ${e}. "${i}" is not a valid number or percentage string.`), t)
              : r;
          }
          parseNumber(e) {
            let t;
            if (((t = e.match(/%$/) ? Number(e.replace("%", "")) / 100 : Number(e)), !isNaN(t))) return t;
          }
          getFixed(e, t = 0) {
            return this.toFixedPointPrecision(this.getNumber(e, t));
          }
          toFixedPointPrecision(e) {
            return ((65536 * e) | 0) / 65536;
          }
          getBool(e, t = !1) {
            let i = this.getString(e).trim();
            return (
              (i = i && i.toLowerCase()),
              !(!i || -1 === ["yes", "1", "true", "on"].indexOf(i)) ||
                ((!i || -1 === ["no", "0", "false", "off"].indexOf(i)) && t)
            );
          }
          getKeyArray(e, t = []) {
            var i = this.get(e);
            return i && Array.isArray(i) ? i : t;
          }
          getArray(e, t = /,\s*/, i = []) {
            let r = this.getString(e).trim();
            return ((r = r.replace(/,$/, "").replace(/,+/g, ",")), r ? r.split(t) : i);
          }
          getNumberArray(e, t = /,\s*/, i = []) {
            let r = this.getString(e).trim();
            if (!r) return i;
            let s = [];
            for (var a of r.split(t)) {
              if (!a) return i;
              var n = this.parseNumber(a);
              if (void 0 === n)
                return (
                  console.warn(`Invalid value for key ${e}. "${a}" is not a valid number or percentage string.`),
                  i
                );
              s.push(n);
            }
            return s;
          }
          getFixedArray(e, t = /,\s*/, i = []) {
            return this.getNumberArray(e, t, i).map((e) => this.toFixedPointPrecision(e));
          }
          getEnum(e, t, i, r = !1) {
            let s = this.getString(e).trim();
            if (!s) return i;
            let a;
            if (r) {
              let e = Object.getOwnPropertyNames(t);
              var n = e.find((e) => e.toLowerCase() === s.toLowerCase());
              n && (a = t[n]);
            } else t.hasOwnProperty(s) && (a = t[s]);
            return void 0 === a
              ? (console.warn(`Invalid value for key "${e}". "${s}" is not an accepted enum value.`), i)
              : a;
          }
          getEnumNumeric(e, t, i) {
            var r = this.getString(e).trim();
            if (!r) return i;
            let s;
            return (
              Number.isInteger(parseInt(r, 10)) && t.hasOwnProperty(r) && (s = parseInt(r, 10)),
              void 0 === s
                ? (console.warn(`Invalid value for key "${e}". "${r}" is not an accepted enum value.`), i)
                : s
            );
          }
          getEnumArray(e, i, t = /,\s*/, r = [], s = !1) {
            let a = this.getString(e).trim();
            if (!a) return r;
            let n = [];
            for (let l of a.split(t)) {
              if (!l) return r;
              let t = !1;
              if (s) {
                let e = Object.getOwnPropertyNames(i);
                var o = e.find((e) => e.toLowerCase() === l.toLowerCase());
                o && (n.push(i[o]), (t = !0));
              } else i.hasOwnProperty(l) && (n.push(i[l]), (t = !0));
              if (!t) return (console.warn(`Invalid value "${l}" for key "${e}".`), r);
            }
            return n;
          }
          getHighestNumericIndex() {
            let i = 0,
              r;
            return (
              this.entries.forEach((e, t) => {
                ((r = parseInt(t, 10)), r > i && (i = r));
              }),
              i
            );
          }
          isNumericIndexArray() {
            return 0 < this.getHighestNumericIndex() || this.has("0");
          }
          getConcatenatedValues() {
            let e = "";
            for (var t of this.entries.values()) "string" == typeof t && (e += t);
            return e;
          }
          toString(e) {
            let t = [],
              i = (e ? e + "." : "") + this.name;
            t.push(`[${i}]`);
            for (var [r, s] of this.entries)
              if (Array.isArray(s)) for (var a of s) t.push(r + "[]=" + a);
              else t.push(r + "=" + s);
            return (t.push(""), t.join("\r\n") + [...this.sections.values()].map((e) => e.toString(i)).join("\r\n"));
          }
          mergeWith(e) {
            if (this.isNumericIndexArray()) {
              let i = this.getHighestNumericIndex() + 1;
              e.entries.forEach((e, t) => {
                Number.isNaN(Number(t)) || Array.isArray(e) || this.set((i++).toString(), e);
              });
            } else
              e.entries.forEach((e, t) => {
                this.set(t, Array.isArray(e) ? [...e] : e);
              });
            e.sections.forEach((e, t) => {
              let i = this.getOrCreateSection(t);
              i.mergeWith(e);
            });
          }
          getOrCreateSection(e) {
            let t = this.sections.get(e);
            return (t || ((t = new r(e)), this.sections.set(e, t)), t);
          }
          getSection(e) {
            return this.sections.get(e);
          }
          getOrderedSections() {
            return [...this.sections.values()];
          }
        }),
      );
    },
  };
});
