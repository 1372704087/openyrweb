// === Reconstructed SystemJS module: game/action/UpdateQueueAction ===
// deps: ["game/action/Action","data/DataStream","game/player/production/ProductionQueue","engine/type/ObjectType","game/action/ActionType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/UpdateQueueAction",
  [
    "game/action/Action",
    "data/DataStream",
    "game/player/production/ProductionQueue",
    "engine/type/ObjectType",
    "game/action/ActionType",
  ],
  function (t, e) {
    "use strict";
    var i, s, l, c, r, h, a;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        var e;
        (((e = h || t("UpdateType", (h = {})))[(e.Add = 0)] = "Add"),
          (e[(e.Cancel = 1)] = "Cancel"),
          (e[(e.Pause = 2)] = "Pause"),
          (e[(e.Resume = 3)] = "Resume"),
          (e[(e.AddNext = 4)] = "AddNext"),
          (a = class extends i.Action {
            constructor(e) {
              (super(r.ActionType.UpdateQueue), (this.game = e));
            }
            unserialize(e) {
              let t = new s.DataStream(e);
              var i, r;
              ((this.queueType = t.readUint8()),
                (this.updateType = t.readUint8()),
                (this.updateType !== h.Add && this.updateType !== h.Cancel && this.updateType !== h.AddNext) ||
                  ((i = t.readUint32()),
                  (r = t.readUint8()),
                  (this.item = this.game.rules.getTechnoByInternalId(i, r)),
                  (this.quantity = t.readUint16())));
            }
            serialize() {
              let e = new s.DataStream(9);
              if (
                ((e.dynamicSize = !1),
                e.writeUint8(this.queueType),
                e.writeUint8(this.updateType),
                this.updateType === h.Add || this.updateType === h.Cancel || this.updateType === h.AddNext)
              ) {
                if (void 0 === this.quantity) throw new Error("Missing quantity");
                if (65535 < this.quantity) throw new Error("Maximum quantity exceeded");
                (e.writeUint32(this.item.index), e.writeUint8(this.item.type), e.writeUint16(this.quantity));
              }
              return new Uint8Array(e.buffer, e.byteOffset, e.position);
            }
            print() {
              return this.updateType === h.Resume
                ? "Resume queue " + l.QueueType[this.queueType]
                : this.updateType === h.Add
                  ? `Add to queue ${this.item.name} x ` + this.quantity
                  : this.updateType === h.AddNext
                    ? `Add next in queue ${this.item.name} x ` + this.quantity
                    : this.updateType === h.Pause
                      ? `Put queue ${l.QueueType[this.queueType]} on hold.`
                      : this.updateType === h.Cancel
                        ? `Cancel ${this.item.name} x ` + this.quantity
                        : "Unhandled queue update type " + this.updateType;
            }
            process() {
              let i = this.player,
                r = this.item,
                s = i.production.getQueue(this.queueType);
              if (this.updateType === h.Resume) s.status === l.QueueStatus.OnHold && (s.status = l.QueueStatus.Active);
              else if (this.updateType === h.Add || this.updateType === h.AddNext) {
                let e = s.find(r);
                if (
                  s.status === l.QueueStatus.Active ||
                  s.status === l.QueueStatus.Idle ||
                  (s.status === l.QueueStatus.OnHold && e[0] !== s.getFirst()) ||
                  (s.status === l.QueueStatus.Ready && r.type !== c.ObjectType.Building)
                ) {
                  let t;
                  var a = e.reduce((e, t) => e + t.quantity, 0);
                  if (Number.isFinite(r.buildLimit)) {
                    let e;
                    ((e =
                      0 <= r.buildLimit
                        ? i.getOwnedObjectsByType(r.type, !0).filter((e) => e.name === r.name).length
                        : i.getLimitedUnitsBuilt(r.name)),
                      (t = Math.max(0, Math.abs(r.buildLimit) - (e + a))));
                  } else t = Number.POSITIVE_INFINITY;
                  t &&
                    i.production.isAvailableForProduction(r) &&
                    ((n = Math.min(s.maxSize - s.currentSize, s.maxItemQuantity - a, t)),
                    0 < (o = Math.min(this.quantity, n)) &&
                      // OpenYRWeb: apply Industrial Plant (NAINDP) cost bonus to the per-item
                      // cost when queueing. getCostBonusMultiplier scans the player's buildings
                      // for UnitsCostBonus/InfantryCostBonus/etc. and returns the cheapest factor
                      // (1 = no discount). Rounded to an integer cost like the vanilla engine.
                      ((u = Math.round(r.cost * i.production.getCostBonusMultiplier(r.type))),
                      (this.updateType === h.AddNext ? s.insertAfterFirst(r, o, u) : s.push(r, o, u))));
                }
              } else if (this.updateType === h.Cancel) {
                if ([l.QueueStatus.Ready, l.QueueStatus.OnHold, l.QueueStatus.Active].includes(s.status)) {
                  let e = s.find(r);
                  var n, o, u;
                  e.length &&
                    ((n = e.reduce((e, t) => e + t.quantity, 0)),
                    0 < (o = Math.min(n, this.quantity)) && (s.pop(r, o), o === n && (i.credits += e[0].creditsSpent)));
                }
              } else
                this.updateType === h.Pause && s.status === l.QueueStatus.Active && (s.status = l.QueueStatus.OnHold);
            }
          }),
          t("UpdateQueueAction", a));
      },
    };
  },
);
