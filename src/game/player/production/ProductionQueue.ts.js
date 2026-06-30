// === Reconstructed SystemJS module: game/player/production/ProductionQueue ===
// deps: ["util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/player/production/ProductionQueue", ["util/event"], function (t, e) {
  "use strict";
  var r, n, o, i;
  e && e.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      var e;
      (((e = n || t("QueueType", (n = {})))[(e.Structures = 0)] = "Structures"),
        (e[(e.Armory = 1)] = "Armory"),
        (e[(e.Infantry = 2)] = "Infantry"),
        (e[(e.Vehicles = 3)] = "Vehicles"),
        (e[(e.Aircrafts = 4)] = "Aircrafts"),
        (e[(e.Ships = 5)] = "Ships"),
        ((e = o || t("QueueStatus", (o = {})))[(e.Idle = 0)] = "Idle"),
        (e[(e.Active = 1)] = "Active"),
        (e[(e.OnHold = 2)] = "OnHold"),
        (e[(e.Ready = 3)] = "Ready"),
        t(
          "ProductionQueue",
          (i = class {
            get onUpdate() {
              return this._onUpdate.asEvent();
            }
            constructor(e, t, i) {
              ((this.type = e),
                (this._maxSize = t),
                (this.maxItemQuantity = i),
                (this.items = []),
                (this.size = 0),
                (this._status = o.Idle),
                (this._onUpdate = new r.EventDispatcher()));
            }
            get status() {
              return this._status;
            }
            set status(e) {
              var t = this._status;
              (this._status = e) !== t && this._onUpdate.dispatch(this);
            }
            get maxSize() {
              return this._maxSize;
            }
            set maxSize(e) {
              var t = this.size;
              this.size = Math.min(e, this.size);
              let i = 0,
                r = 0;
              for (; i <= this.size && r < this.items.length;) {
                let e = this.items[r];
                ((i += e.quantity), i > this.size && (e.quantity -= i - this.size), 0 < e.quantity && r++);
              }
              ((this._maxSize = e),
                this.items[r] && this.items.splice(r),
                t !== this.size && (this.size || (this._status = o.Idle), this._onUpdate.dispatch(this)));
            }
            get currentSize() {
              return this.size;
            }
            find(t) {
              return this.items.filter((e) => e.rules === t);
            }
            getFirst() {
              return this.items[0];
            }
            getAll() {
              return [...this.items];
            }
            push(e, t, i) {
              t = Math.min(this.maxSize - this.size, t);
              var r = this.find(e).reduce((e, t) => e + t.quantity, 0);
              (t = Math.min(this.maxItemQuantity - r, t)) &&
                (this.items[this.items.length - 1]?.rules === e
                  ? (this.items[this.items.length - 1].quantity += t)
                  : this.items.push({
                      rules: e,
                      quantity: t,
                      creditsEach: i,
                      creditsSpent: 0,
                      creditsSpentLeftover: 0,
                      progress: 0,
                    }),
                (this.size += t),
                this._status === o.Idle && (this._status = o.Active),
                this._onUpdate.dispatch(this));
            }
            insertAfterFirst(t, i, r) {
              i = Math.min(this.maxSize - this.size, i);
              var s = this.find(t).reduce((e, t) => e + t.quantity, 0);
              if ((i = Math.min(this.maxItemQuantity - s, i)))
                if (this.items.length) {
                  let e = this.items[0];
                  var a = e.quantity,
                    s = Math.max(0, a - 1);
                  e.quantity = 1;
                  const n = [e];
                  a = this.items.slice(1);
                  (n.push({
                    rules: t,
                    quantity: i,
                    creditsEach: r,
                    creditsSpent: 0,
                    creditsSpentLeftover: 0,
                    progress: 0,
                  }),
                    0 < s &&
                      n.push({
                        rules: e.rules,
                        quantity: s,
                        creditsEach: e.creditsEach,
                        creditsSpent: 0,
                        creditsSpentLeftover: 0,
                        progress: 0,
                      }),
                    n.push(...a),
                    (this.items = n),
                    (this.size += i),
                    this._status === o.Idle && (this._status = o.Active),
                    this._onUpdate.dispatch(this));
                } else this.push(t, i, r);
            }
            pop(e, t) {
              this.remove(e, t, !1);
            }
            shift(e, t) {
              this.remove(e, t, !0);
            }
            remove(e, t, i) {
              let r = this.find(e);
              if (!r.length) throw new Error(`Can't remove non-existent item ${e.name} from queue ` + n[this.type]);
              var s;
              if (r.reduce((e, t) => e + t.quantity, 0) < t)
                throw new Error(`Attempted to remove a quantity larger than the one in queue (${e.name})`);
              let a = t;
              for (; 0 < a;) {
                let e = i ? r.shift() : r.pop();
                e.quantity <= a
                  ? ((s = this.getFirst() === e),
                    this.items.splice(this.items.indexOf(e), 1),
                    s && (this._status = o.Active),
                    (a -= e.quantity))
                  : ((e.quantity -= a), (a = 0));
              }
              ((this.size -= t), t && (this.size || (this._status = o.Idle), this._onUpdate.dispatch(this)));
            }
            notifyUpdated() {
              this._onUpdate.dispatch(this);
            }
          }),
        ));
    },
  };
});
