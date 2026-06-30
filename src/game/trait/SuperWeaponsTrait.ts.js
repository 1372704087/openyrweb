// === Reconstructed SystemJS module: game/trait/SuperWeaponsTrait ===
// deps: ["game/trait/interface/NotifyWarpChange","game/SuperWeapon","game/superweapon/SuperWeaponEffect","game/trait/interface/NotifyPower","game/trait/interface/NotifyTick","game/type/SuperWeaponType","game/trait/interface/NotifySuperWeaponActivate","game/event/SuperWeaponActivateEvent","game/superweapon/ParadropEffect","game/superweapon/NukeEffect","game/superweapon/LightningStormEffect","game/superweapon/IronCurtainEffect","game/superweapon/ChronoSphereEffect","game/superweapon/DominatorEffect","game/superweapon/GeneticMutatorEffect","game/superweapon/ForceShieldEffect","game/superweapon/PsychicRevealEffect","game/trait/interface/NotifySuperWeaponDeactivate","engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/SuperWeaponsTrait",
  [
    "game/trait/interface/NotifyWarpChange",
    "game/SuperWeapon",
    "game/superweapon/SuperWeaponEffect",
    "game/trait/interface/NotifyPower",
    "game/trait/interface/NotifyTick",
    "game/type/SuperWeaponType",
    "game/trait/interface/NotifySuperWeaponActivate",
    "game/event/SuperWeaponActivateEvent",
    "game/superweapon/ParadropEffect",
    "game/superweapon/NukeEffect",
    "game/superweapon/LightningStormEffect",
    "game/superweapon/IronCurtainEffect",
    "game/superweapon/ChronoSphereEffect",
    "game/superweapon/DominatorEffect",
    "game/superweapon/GeneticMutatorEffect",
    "game/superweapon/ForceShieldEffect",
    "game/superweapon/PsychicRevealEffect",
    "game/trait/interface/NotifySuperWeaponDeactivate",
    "engine/type/ObjectType",
  ],
  function (e, t) {
    "use strict";
    var i, o, s, r, a, g, p, m, f, y, T, v, b, Dm, Gm, Fs, Pr, n, S, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
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
          Dm = e;
        },
        function (e) {
          Gm = e;
        },
        function (e) {
          Fs = e;
        },
        function (e) {
          Pr = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          S = e;
        },
      ],
      execute: function () {
        ((l = class {
          constructor() {
            this.effects = [];
          }
          [a.NotifyTick.onTick](t) {
            for (var e of t.getCombatants()) {
              var i;
              for (i of e.superWeaponsTrait.getAll()) i.update(t);
            }
            for (let r of this.effects)
              (r.status === s.EffectStatus.NotStarted && (r.onStart(t), (r.status = s.EffectStatus.Running)),
                r.onTick(t) &&
                  ((r.status = s.EffectStatus.Finished),
                  t.traits.filter(n.NotifySuperWeaponDeactivate).forEach((e) => {
                    e[n.NotifySuperWeaponDeactivate.onDeactivate](r.type, r.owner, t);
                  })));
            this.effects = this.effects.filter((e) => e.status !== s.EffectStatus.Finished);
          }
          [r.NotifyPower.onPowerLow](e, t) {
            e.superWeaponsTrait
              ?.getAll()
              ?.filter((e) => e.rules.isPowered)
              .forEach((e) => {
                this.updateTimer(e, !1);
              });
          }
          [r.NotifyPower.onPowerRestore](e, t) {
            e.superWeaponsTrait
              ?.getAll()
              ?.filter((e) => e.rules.isPowered)
              .forEach((e) => {
                this.updateTimer(e, !0);
              });
          }
          [r.NotifyPower.onPowerChange](e, t) {}
          [i.NotifyWarpChange.onChange](e, t) {
            var i;
            e.owner.powerTrait &&
              e.isBuilding() &&
              e.superWeaponTrait &&
              (i = e.superWeaponTrait.getSuperWeapon(e)) &&
              this.updateTimer(i, !e.owner.powerTrait.isLowPower());
          }
          updateTimer(e, t) {
            var i = this.superWeaponHasValidBuilding(e);
            t && i ? e.resumeTimer() : e.pauseTimer();
          }
          superWeaponHasValidBuilding(t) {
            return [...t.owner.buildings].find(
              (e) =>
                !(e.superWeaponTrait?.getSuperWeapon(e) !== t || (e.warpedOutTrait.isActive() && t.rules.isPowered)),
            );
          }
          addEffect(e) {
            this.effects.push(e);
          }
          activateSuperWeapon(t, e, i, r, s) {
            let a = e.superWeaponsTrait?.getAll().find((e) => e.rules.type === t);
            if (a && a.status === o.SuperWeaponStatus.Ready) {
              if (a.oneTimeOnly) {
                e.superWeaponsTrait.remove(a.name);
                for (var n of e.buildings)
                  n.rules.superWeapon === a.name &&
                    n.superWeaponTrait &&
                    n.superWeaponTrait.addSuperWeaponToPlayerIfNeeded(e, i);
              } else a.resetTimer();
              this.activateEffect(a.rules, e, i, r, s);
            }
          }
          activateEffect(e, i, r, s, a, n = !1) {
            const o = e.type;
            if (void 0 !== o) {
              let t = [];
              switch (o) {
                case g.SuperWeaponType.AmerParaDrop:
                  for (var [l, c] of r.rules.general.paradrop.amerParaDrop.entries())
                    r.rules.hasObject(c.inf, S.ObjectType.Infantry)
                      ? t.push(new f.ParadropEffect(o, i, s, c, l))
                      : console.warn(`Can't paradrop unknown infantry type "${c.inf}"`);
                  break;
                case g.SuperWeaponType.ParaDrop: {
                  let e = r.rules.general.paradrop.getParadropSquads(i.country.side);
                  for (var [h, u] of e.entries())
                    r.rules.hasObject(u.inf, S.ObjectType.Infantry)
                      ? t.push(new f.ParadropEffect(o, i, s, u, h))
                      : console.warn(`Can't paradrop unknown infantry type "${u.inf}"`);
                  break;
                }
                case g.SuperWeaponType.MultiMissile:
                  if (!e.weaponType) throw new Error("Missing WeaponType in super weapon rules");
                  t.push(new y.NukeEffect(o, i, s, e.weaponType));
                  break;
                case g.SuperWeaponType.LightningStorm:
                  t.push(new T.LightningStormEffect(o, i, s));
                  break;
                case g.SuperWeaponType.IronCurtain:
                  t.push(new v.IronCurtainEffect(o, i, s));
                  break;
                case g.SuperWeaponType.ChronoSphere:
                  if (!a) throw new Error("Missing tile2 action param");
                  t.push(new b.ChronoSphereEffect(o, i, s, a));
                  break;
                // OpenYRWeb: YR superweapons. Both are single-click targeted (no tile2).
                case g.SuperWeaponType.PsychicDominator:
                  t.push(new Dm.DominatorEffect(o, i, s));
                  break;
                case g.SuperWeaponType.GeneticMutator:
                  // OpenYRWeb: pass the SuperWeapon's WeaponType (carries the Mutate warhead with
                  // InfDeath=9) so the effect can detonate it over the target area and let the
                  // normal damage+MakeInfantry path transform infantry, matching vanilla YR.
                  t.push(new Gm.GeneticMutatorEffect(o, i, s, e.weaponType));
                  break;
                // OpenYRWeb (2026-06-30, REVERSED): Force Shield — shields buildings within
                // ForceShieldRadius for ForceShieldDuration frames (invulnerability, same mechanism
                // as Iron Curtain), at the cost of blacking out the owner's power for
                // ForceShieldBlackoutDuration frames. Single-click targeted (no tile2).
                case g.SuperWeaponType.ForceShield:
                  t.push(new Fs.ForceShieldEffect(o, i, s));
                  break;
                // OpenYRWeb (2026-06-30): Psychic Reveal — permanently reveals a circular area
                // of shroud (PsychicRevealRadius) around the activation tile for the activating
                // player. Single-click targeted (no tile2). Unlocked by the Psychic Sensor (YAGGNT).
                case g.SuperWeaponType.PsychicReveal:
                  t.push(new Pr.PsychicRevealEffect(o, i, s));
                  break;
              }
              for (var d of t) this.addEffect(d);
              (r.traits.filter(p.NotifySuperWeaponActivate).forEach((e) => {
                e[p.NotifySuperWeaponActivate.onActivate](o, i, r, s, a);
              }),
                r.events.dispatch(new m.SuperWeaponActivateEvent(o, i, s, a, n)));
            }
          }
        }),
          e("SuperWeaponsTrait", l));
      },
    };
  },
);
