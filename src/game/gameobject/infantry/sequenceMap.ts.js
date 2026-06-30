// === Reconstructed SystemJS module: game/gameobject/infantry/sequenceMap ===
// deps: ["game/gameobject/unit/ZoneType","game/art/SequenceType","game/gameobject/infantry/StanceType","game/gameobject/infantry/InfDeathType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/infantry/sequenceMap",
  [
    "game/gameobject/unit/ZoneType",
    "game/art/SequenceType",
    "game/gameobject/infantry/StanceType",
    "game/gameobject/infantry/InfDeathType",
  ],
  function (e, t) {
    "use strict";
    var l, n, c, o, h, u, d;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        (e(
          "getFireSequenceBy",
          (h = (e, t = c.StanceType.None) =>
            t === c.StanceType.Deployed
              ? n.SequenceType.DeployedFire
              : e === l.ZoneType.Water
                ? n.SequenceType.WetAttack
                : e === l.ZoneType.Air
                  ? n.SequenceType.FireFly
                  : t === c.StanceType.Prone
                    ? n.SequenceType.FireProne
                    : n.SequenceType.FireUp),
        ),
          e(
            "getMoveSequenceBy",
            (u = (e, t, i) =>
              e === l.ZoneType.Air
                ? n.SequenceType.Fly
                : e === l.ZoneType.Water
                  ? n.SequenceType.Swim
                  : t === c.StanceType.Prone
                    ? n.SequenceType.Crawl
                    : i
                      ? n.SequenceType.Panic
                      : n.SequenceType.Walk),
          ),
          e("getIdleSequenceBy", (e, t = c.StanceType.None) =>
            t === c.StanceType.Deployed
              ? [n.SequenceType.DeployedIdle]
              : e === l.ZoneType.Water
                ? [n.SequenceType.WetIdle1, n.SequenceType.WetIdle2]
                : e !== l.ZoneType.Air
                  ? [n.SequenceType.Idle1, n.SequenceType.Idle2]
                  : void 0,
          ),
          e(
            "getStillSequenceBy",
            (d = (e, t = c.StanceType.None) =>
              t === c.StanceType.Deployed
                ? n.SequenceType.Deployed
                : e === l.ZoneType.Water
                  ? n.SequenceType.Tread
                  : e === l.ZoneType.Air
                    ? n.SequenceType.Hover
                    : t === c.StanceType.Prone
                      ? n.SequenceType.Prone
                      : t === c.StanceType.Guard
                        ? n.SequenceType.Guard
                        : t === c.StanceType.Paradrop
                          ? n.SequenceType.Paradrop
                          : n.SequenceType.Ready),
          ),
          e("getStanceTransitionSequenceBy", (e, t) =>
            e === c.StanceType.Prone
              ? n.SequenceType.Up
              : t === c.StanceType.Prone
                ? n.SequenceType.Down
                : e === c.StanceType.Deployed
                  ? n.SequenceType.Undeploy
                  : t === c.StanceType.Deployed
                    ? n.SequenceType.Deploy
                    : t === c.StanceType.Cheer
                      ? n.SequenceType.Cheer
                      : void 0,
          ),
          e("getCrashingSequences", (e) => {
            let t = [...e.art.sequences.keys()];
            var i = [n.SequenceType.AirDeathStart, n.SequenceType.AirDeathFalling].filter((e) => t.includes(e));
            if (i.length) return i;
          }),
          e("getDeathSequence", (e, t) => {
            var i = e.zone,
              r = e.rules.isHuman;
            let s = [...e.art.sequences.keys()],
              a;
            return (
              e.isCrashing
                ? (a = [n.SequenceType.AirDeathFinish])
                : i === l.ZoneType.Air
                  ? (a = [n.SequenceType.Tumble])
                  : i === l.ZoneType.Water
                    ? (![o.InfDeathType.Gunfire, o.InfDeathType.Explode].includes(t) && r) ||
                      (a = [n.SequenceType.WetDie1, n.SequenceType.WetDie2])
                    : t !== o.InfDeathType.Gunfire && r
                      ? t === o.InfDeathType.Explode && (a = [n.SequenceType.Die2])
                      : (a = [n.SequenceType.Die1]),
              a && ((a = a.filter((e) => s.includes(e))), a.length || (a = void 0)),
              a
            );
          }),
          e("getDeathAnim", (e, t) =>
            t === o.InfDeathType.ExplodeAlt
              ? e.audioVisual.infantryExplode
              : t === o.InfDeathType.Fire
                ? e.audioVisual.flamingInfantry
                : t === o.InfDeathType.Electro
                  ? [...e.animationNames][1]
                  : t === o.InfDeathType.HeadExplode
                    ? e.audioVisual.infantryHeadPop
                    : t === o.InfDeathType.Nuke
                      ? e.audioVisual.infantryNuked
                      : t === o.InfDeathType.Virus
                        ? e.audioVisual.infantryVirus
                        : t === o.InfDeathType.Mutate
                          ? e.audioVisual.infantryMutate
                          : void 0,
          ),
          e("findSequence", (e, t, i, r, s, a) => {
            var n = (e) => -1 !== a.indexOf(e);
            let o;
            return (
              r && ((o = h(e, t)), n(o) || ((o = h(e)), n(o) || (o = void 0))),
              void 0 === o && i && ((o = u(e, t, s)), n(o) || ((o = u(e, c.StanceType.None, s)), n(o) || (o = void 0))),
              void 0 === o && ((o = d(e, t)), n(o) || ((o = d(e)), n(o) || (o = d(l.ZoneType.Ground)))),
              o
            );
          }));
      },
    };
  },
);
