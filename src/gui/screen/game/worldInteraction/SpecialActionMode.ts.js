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
          // OpenYRWeb: YR superweapons. Both are single-click targeted (no tile2 two-click flow).
          .set(s.SuperWeaponType.PsychicDominator, r.PointerType.Dominate)
          .set(s.SuperWeaponType.GeneticMutator, r.PointerType.Mutate)
          // OpenYRWeb (2026-07-25): Force Shield — uses the ForceField pointer (dedicated
          // shield/force-field cursor, PointerType.ForceField=450). Single-click targeted.
          .set(s.SuperWeaponType.ForceShield, r.PointerType.ForceField)
          // OpenYRWeb: Psychic Reveal — Yuri's map-reveal mini-superweapon, uses the PsychicReveal pointer (496).
          .set(s.SuperWeaponType.PsychicReveal, r.PointerType.PsychicReveal)
          // OpenYRWeb: Spy Plane — Soviet Radar Tower support power, uses the SpyPlane pointer (504).
          .set(s.SuperWeaponType.SpyPlane, r.PointerType.SpyPlane)),
          e(
            "SpecialActionMode",
            (i = class {
              get onExecute() {
                return this._onExecute.asEvent();
              }
              get superWeaponType() {
                return this.superWeaponRules.type;
              }
              static factory(e, t, i, r, s, n) {
                return new this(e, t, i, r, s, n);
              }
              constructor(e, t, i, r, s, n) {
                ((this.allSuperWeaponRules = e),
                  (this.superWeaponRules = t),
                  (this.superWeaponFxHandler = i),
                  (this.pointer = r),
                  (this.eva = s),
                  (this.player = n),
                  (this._onExecute = new a.EventDispatcher()),
                  (this.isPostClick = !1),
                  (this.pointerSwType = this.superWeaponRules.type));
              }
              enter() {
                this.eva.play("EVA_SelectTarget");
              }
              hover(e) {
                var tile = e?.tile,
                  ptr = n.get(this.pointerSwType);
                // OpenYRWeb: Force Shield only targets friendly buildings — show NoForceField on non-building or enemy tiles.
                if (tile && this.superWeaponRules.type === s.SuperWeaponType.ForceShield) {
                  var bld = this.superWeaponFxHandler.game.map
                    .getObjectsOnTile(tile)
                    .find(function (o) { return o.isBuilding(); });
                  var friendly = bld && (bld.owner === this.player || this.superWeaponFxHandler.game.alliances.areAllied(bld.owner, this.player));
                  this.pointer.setPointerType(friendly ? r.PointerType.ForceField : r.PointerType.NoForceField);
                } else {
                  this.pointer.setPointerType(tile && void 0 !== ptr ? ptr : r.PointerType.Default);
                }
              }
              execute(e) {
                var t = e?.tile;
                if (!t) return !1;
                // OpenYRWeb: Force Shield only targets friendly buildings — prevent deployment on enemy or non-building tiles.
                if (this.superWeaponRules.type === s.SuperWeaponType.ForceShield) {
                  var bld = this.superWeaponFxHandler.game.map
                    .getObjectsOnTile(t)
                    .find(function (o) { return o.isBuilding(); });
                  if (!bld) return !1;
                  if (bld.owner !== this.player && !this.superWeaponFxHandler.game.alliances.areAllied(bld.owner, this.player)) return !1;
                }
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
