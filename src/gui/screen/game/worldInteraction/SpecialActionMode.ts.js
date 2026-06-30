// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/SpecialActionMode ===
// deps: ["engine/type/PointerType","util/event","game/type/SuperWeaponType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/SpecialActionMode",
  ["engine/type/PointerType", "util/event", "game/type/SuperWeaponType"],
  function (e, t) {
    "use strict";
    var r, a, s, n, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((n = new Map()
          .set(s.SuperWeaponType.MultiMissile, r.PointerType.Nuke)
          .set(s.SuperWeaponType.LightningStorm, r.PointerType.Storm)
          .set(s.SuperWeaponType.IronCurtain, r.PointerType.Iron)
          .set(s.SuperWeaponType.ChronoSphere, r.PointerType.Chrono)
          .set(s.SuperWeaponType.ChronoWarp, r.PointerType.Chrono)
          .set(s.SuperWeaponType.AmerParaDrop, r.PointerType.Para)
          .set(s.SuperWeaponType.ParaDrop, r.PointerType.Para)
          // OpenYRWeb: YR superweapons. No dedicated cursor art shipped; Default keeps targeting
          // functional. Both are single-click targeted (no tile2 two-click flow).
          .set(s.SuperWeaponType.PsychicDominator, r.PointerType.Default)
          .set(s.SuperWeaponType.GeneticMutator, r.PointerType.Default)),
          e(
            "SpecialActionMode",
            (i = class {
              get onExecute() {
                return this._onExecute.asEvent();
              }
              get superWeaponType() {
                return this.superWeaponRules.type;
              }
              static factory(e, t, i, r, s) {
                return new this(e, t, i, r, s);
              }
              constructor(e, t, i, r, s) {
                ((this.allSuperWeaponRules = e),
                  (this.superWeaponRules = t),
                  (this.superWeaponFxHandler = i),
                  (this.pointer = r),
                  (this.eva = s),
                  (this._onExecute = new a.EventDispatcher()),
                  (this.isPostClick = !1),
                  (this.pointerSwType = this.superWeaponRules.type));
              }
              enter() {
                this.eva.play("EVA_SelectTarget");
              }
              hover(e) {
                var t = e?.tile,
                  i = n.get(this.pointerSwType);
                this.pointer.setPointerType(t && void 0 !== i ? i : r.PointerType.Default);
              }
              execute(e) {
                var t = e?.tile;
                if (!t) return !1;
                if (
                  (this.superWeaponRules.type !== s.SuperWeaponType.ChronoSphere ||
                    this.isPostClick ||
                    this.superWeaponFxHandler.createChronoSphereAnim(t),
                  this.superWeaponRules.preClick && !this.isPostClick)
                ) {
                  ((this.isPostClick = !0), (this.preTile = t));
                  var i = [...this.allSuperWeaponRules.values()].find(
                    (e) => e.postClick && e.preDependent === this.superWeaponRules.type,
                  )?.type;
                  if (void 0 === i)
                    throw new Error(
                      'No super weapon section found with PostClick=yes and PreDependent="' +
                        s.SuperWeaponType[this.superWeaponRules.type],
                    );
                  return ((this.pointerSwType = i), !1);
                }
                this._onExecute.dispatch(
                  this,
                  this.isPostClick ? { tile: this.preTile, tile2: t } : { tile: t, tile2: void 0 },
                );
              }
              cancel() {
                this.end();
              }
              end() {
                this.superWeaponRules.type === s.SuperWeaponType.ChronoSphere &&
                  this.isPostClick &&
                  this.superWeaponFxHandler.disposeChronoSphereAnim();
              }
              dispose() {
                this.end();
              }
            }),
          ));
      },
    };
  },
);
