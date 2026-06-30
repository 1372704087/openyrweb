// === Reconstructed SystemJS module: game/trigger/TriggerManager ===
// deps: ["data/map/tag/TagRepeatType","game/trigger/TriggerExecutorFactory","game/trigger/TriggerConditionFactory","util/disposable/CompositeDisposable","data/map/Variable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/TriggerManager",
  [
    "data/map/tag/TagRepeatType",
    "game/trigger/TriggerExecutorFactory",
    "game/trigger/TriggerConditionFactory",
    "util/disposable/CompositeDisposable",
    "data/map/Variable",
  ],
  function (e, t) {
    "use strict";
    var c, i, r, s, a, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
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
          "TriggerManager",
          (n = class {
            constructor() {
              ((this.disposables = new s.CompositeDisposable()),
                (this.triggerInstances = new Map()),
                (this.targetsByTag = new Map()),
                (this.conditionFactory = new r.TriggerConditionFactory()),
                (this.executorFactory = new i.TriggerExecutorFactory()),
                (this.pendingGameEvents = []),
                (this.globalVariables = new Map()),
                (this.localVariables = new Map()));
            }
            init(t) {
              var i,
                e,
                r,
                s,
                a = t.map.getInitialMapObjects()["technos"];
              for (let l of a)
                if (l.tag) {
                  let e = this.targetsByTag.get(l.tag);
                  e || ((e = []), this.targetsByTag.set(l.tag, e));
                  var n = t.map.tiles.getByMapCoords(l.rx, l.ry);
                  !n ||
                    ((n = t.map.getObjectsOnTile(n).find((e) => e.name === l.name && e.type === l.type)) && e.push(n));
                }
              for (i of t.map.getCellTags()) {
                var o = t.map.tiles.getByMapCoords(i.coords.x, i.coords.y);
                if (o) {
                  let e = this.targetsByTag.get(i.tagId);
                  (e || ((e = []), this.targetsByTag.set(i.tagId, e)), e.push(o));
                } else console.warn(`CellTag out of bounds at (${i.coords.x}, ${i.coords.y}). Skipping.`);
              }
              for ([e, r] of t.map.getVariables()) this.localVariables.set(e, r.clone());
              for (s of t.map.getTriggers()) this.triggerInstances.set(s.id, this.createTriggerInstance(s, t));
              this.disposables.add(t.events.subscribe((e) => this.pendingGameEvents.push(e)));
            }
            createTriggerInstance(i, r) {
              let s = this.targetsByTag.get(i.tag.id) ?? [];
              return {
                trigger: i,
                conditions: i.events
                  .map((e) => {
                    let t = this.conditionFactory.create(e, i);
                    return (t.setTargets(s), t.init(r), t);
                  })
                  .sort((e, t) => Number(t.blocking) - Number(e.blocking)),
                targets: s,
                remainingTargets: new Set(i.tag.repeatType === c.TagRepeatType.OnceAll ? s : []),
                disabled: i.disabled,
                finished: !1,
              };
            }
            update(i) {
              var r,
                s = this.pendingGameEvents.splice(0, this.pendingGameEvents.length);
              for (r of this.triggerInstances.values())
                if (!r.finished && !r.disabled) {
                  let e = !0,
                    t = [];
                  for (var a of r.conditions) {
                    var n = a.check(i, s);
                    if (("boolean" == typeof n ? n || (e = !1) : n.length ? t.push(...n) : (e = !1), a.blocking && !e))
                      break;
                  }
                  if (e) {
                    var o = r.trigger;
                    r.conditions.forEach((e) => e.reset?.());
                    let e = [];
                    if (o.tag.repeatType === c.TagRepeatType.OnceAll) {
                      for (var l of t) r.remainingTargets.delete(l);
                      if (r.remainingTargets.size) continue;
                      e = t.length ? [t[t.length - 1]] : [];
                    } else e = r.targets;
                    (this.executeActions(o, e, i), o.tag.repeatType !== c.TagRepeatType.Repeat && (r.finished = !0));
                  }
                }
            }
            executeActions(t, i, r) {
              for (var s of t.actions) {
                let e = this.executorFactory.create(s, t);
                e.execute(r, i);
              }
            }
            setTriggerEnabled(e, t) {
              let i = this.triggerInstances.get(e);
              i && (i.disabled = !t);
            }
            forceTrigger(e, t) {
              var i = this.triggerInstances.get(e);
              i && this.executeActions(i.trigger, i.targets, t);
            }
            destroyTrigger(e) {
              this.triggerInstances.delete(e);
            }
            destroyTag(e) {
              let t = [];
              for (var [i, r] of this.triggerInstances) r.trigger.tag.id === e && t.push(i);
              for (var s of t) this.destroyTrigger(s);
            }
            getGlobalVariable(e) {
              return !!this.globalVariables.get(e)?.value;
            }
            toggleGlobalVariable(e, t) {
              let i = this.globalVariables.get(e);
              void 0 === i ? this.globalVariables.set(e, new a.Variable("No name", t)) : (i.value = t);
            }
            getLocalVariable(e) {
              return !!this.localVariables.get(e)?.value;
            }
            toggleLocalVariable(e, t) {
              let i = this.localVariables.get(e);
              void 0 === i ? this.localVariables.set(e, new a.Variable("No name", t)) : (i.value = t);
            }
            dispose() {
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
