// === Reconstructed SystemJS module: game/trigger/TriggerExecutorFactory ===
// deps: ["data/map/trigger/TriggerActionType","game/trigger/executor/AddSuperWeaponExecutor","game/trigger/executor/ApplyDamageExecutor","game/trigger/executor/ChangeHouseAllExecutor","game/trigger/executor/ChangeHouseExecutor","game/trigger/executor/CheerExecutor","game/trigger/executor/CreateCrateExecutor","game/trigger/executor/CreateRadarEventExecutor","game/trigger/executor/DestroyObjectExecutor","game/trigger/executor/DestroyTagExecutor","game/trigger/executor/DestroyTriggerExecutor","game/trigger/executor/DetonateWarheadExecutor","game/trigger/executor/EvictOccupiersExecutor","game/trigger/executor/FireSaleExecutor","game/trigger/executor/ForceEndExecutor","game/trigger/executor/ForceTriggerExecutor","game/trigger/executor/GlobalVariableExecutor","game/trigger/executor/IronCurtainExecutor","game/trigger/executor/LightningStrikeExecutor","game/trigger/executor/LocalVariableExecutor","game/trigger/executor/NoActionExecutor","game/trigger/executor/NukeStrikeExecutor","game/trigger/executor/PlayAnimAtExecutor","game/trigger/executor/PlaySoundFxAtExecutor","game/trigger/executor/PlaySoundFxExecutor","game/trigger/executor/PlaySpeechExecutor","game/trigger/executor/ReshroudMapExecutor","game/trigger/executor/ResizePlayerViewExecutor","game/trigger/executor/RevealAroundWaypointExecutor","game/trigger/executor/RevealMapExecutor","game/trigger/executor/SellBuildingExecutor","game/trigger/executor/SetAmbientLightExecutor","game/trigger/executor/SetAmbientRateExecutor","game/trigger/executor/SetAmbientStepExecutor","game/trigger/executor/StopSoundFxAtExecutor","game/trigger/executor/TextTriggerExecutor","game/trigger/executor/TimerExtendExecutor","game/trigger/executor/TimerSetExecutor","game/trigger/executor/TimerShortenExecutor","game/trigger/executor/TimerStartExecutor","game/trigger/executor/TimerStopExecutor","game/trigger/executor/TimerTextExecutor","game/trigger/executor/ToggleTriggerExecutor","game/trigger/executor/TurnOnOffBuildingExecutor","game/trigger/executor/UnrevealAroundWaypointExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/TriggerExecutorFactory",
  [
    "data/map/trigger/TriggerActionType",
    "game/trigger/executor/AddSuperWeaponExecutor",
    "game/trigger/executor/ApplyDamageExecutor",
    "game/trigger/executor/ChangeHouseAllExecutor",
    "game/trigger/executor/ChangeHouseExecutor",
    "game/trigger/executor/CheerExecutor",
    "game/trigger/executor/CreateCrateExecutor",
    "game/trigger/executor/CreateRadarEventExecutor",
    "game/trigger/executor/DestroyObjectExecutor",
    "game/trigger/executor/DestroyTagExecutor",
    "game/trigger/executor/DestroyTriggerExecutor",
    "game/trigger/executor/DetonateWarheadExecutor",
    "game/trigger/executor/EvictOccupiersExecutor",
    "game/trigger/executor/FireSaleExecutor",
    "game/trigger/executor/ForceEndExecutor",
    "game/trigger/executor/ForceTriggerExecutor",
    "game/trigger/executor/GlobalVariableExecutor",
    "game/trigger/executor/IronCurtainExecutor",
    "game/trigger/executor/LightningStrikeExecutor",
    "game/trigger/executor/LocalVariableExecutor",
    "game/trigger/executor/NoActionExecutor",
    "game/trigger/executor/NukeStrikeExecutor",
    "game/trigger/executor/PlayAnimAtExecutor",
    "game/trigger/executor/PlaySoundFxAtExecutor",
    "game/trigger/executor/PlaySoundFxExecutor",
    "game/trigger/executor/PlaySpeechExecutor",
    "game/trigger/executor/ReshroudMapExecutor",
    "game/trigger/executor/ResizePlayerViewExecutor",
    "game/trigger/executor/RevealAroundWaypointExecutor",
    "game/trigger/executor/RevealMapExecutor",
    "game/trigger/executor/SellBuildingExecutor",
    "game/trigger/executor/SetAmbientLightExecutor",
    "game/trigger/executor/SetAmbientRateExecutor",
    "game/trigger/executor/SetAmbientStepExecutor",
    "game/trigger/executor/StopSoundFxAtExecutor",
    "game/trigger/executor/TextTriggerExecutor",
    "game/trigger/executor/TimerExtendExecutor",
    "game/trigger/executor/TimerSetExecutor",
    "game/trigger/executor/TimerShortenExecutor",
    "game/trigger/executor/TimerStartExecutor",
    "game/trigger/executor/TimerStopExecutor",
    "game/trigger/executor/TimerTextExecutor",
    "game/trigger/executor/ToggleTriggerExecutor",
    "game/trigger/executor/TurnOnOffBuildingExecutor",
    "game/trigger/executor/UnrevealAroundWaypointExecutor",
  ],
  function (e, t) {
    "use strict";
    var i,
      r,
      s,
      a,
      n,
      o,
      l,
      c,
      h,
      u,
      d,
      g,
      p,
      m,
      f,
      y,
      T,
      v,
      b,
      S,
      w,
      E,
      C,
      x,
      O,
      A,
      M,
      R,
      P,
      I,
      k,
      B,
      N,
      j,
      L,
      D,
      F,
      _,
      U,
      H,
      G,
      V,
      W,
      z,
      K,
      q;
    t && t.id;
    return {
      setters: [
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
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
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
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          P = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          j = e;
        },
        function (e) {
          L = e;
        },
        function (e) {
          D = e;
        },
        function (e) {
          F = e;
        },
        function (e) {
          _ = e;
        },
        function (e) {
          U = e;
        },
        function (e) {
          H = e;
        },
        function (e) {
          G = e;
        },
        function (e) {
          V = e;
        },
        function (e) {
          W = e;
        },
        function (e) {
          z = e;
        },
        function (e) {
          K = e;
        },
      ],
      execute: function () {
        e(
          "TriggerExecutorFactory",
          (q = class {
            create(e, t) {
              switch (e.type) {
                case i.TriggerActionType.NoAction:
                  return new w.NoActionExecutor(e, t);
                case i.TriggerActionType.FireSale:
                  return new m.FireSaleExecutor(e, t);
                case i.TriggerActionType.TextTrigger:
                  return new D.TextTriggerExecutor(e, t);
                case i.TriggerActionType.DestroyTrigger:
                  return new d.DestroyTriggerExecutor(e, t);
                case i.TriggerActionType.ChangeHouse:
                  return new n.ChangeHouseExecutor(e, t);
                case i.TriggerActionType.RevealMap:
                  return new I.RevealMapExecutor(e, t);
                case i.TriggerActionType.RevealAroundWaypoint:
                  return new P.RevealAroundWaypointExecutor(e, t);
                case i.TriggerActionType.PlaySoundFx:
                  return new O.PlaySoundFxExecutor(e, t);
                case i.TriggerActionType.PlaySpeech:
                  return new A.PlaySpeechExecutor(e, t);
                case i.TriggerActionType.ForceTrigger:
                  return new y.ForceTriggerExecutor(e, t);
                case i.TriggerActionType.TimerStart:
                  return new H.TimerStartExecutor(e, t);
                case i.TriggerActionType.TimerStop:
                  return new G.TimerStopExecutor(e, t);
                case i.TriggerActionType.TimerExtend:
                  return new F.TimerExtendExecutor(e, t);
                case i.TriggerActionType.TimerShorten:
                  return new U.TimerShortenExecutor(e, t);
                case i.TriggerActionType.TimerSet:
                  return new _.TimerSetExecutor(e, t);
                case i.TriggerActionType.GlobalSet:
                  return new T.GlobalVariableExecutor(e, t, !0);
                case i.TriggerActionType.GlobalClear:
                  return new T.GlobalVariableExecutor(e, t, !1);
                case i.TriggerActionType.DestroyObject:
                  return new h.DestroyObjectExecutor(e, t);
                case i.TriggerActionType.AddOneTimeSuperWeapon:
                  return new r.AddSuperWeaponExecutor(e, t, !0);
                case i.TriggerActionType.AddRepeatingSuperWeapon:
                  return new r.AddSuperWeaponExecutor(e, t, !1);
                case i.TriggerActionType.AllChangeHouse:
                  return new a.ChangeHouseAllExecutor(e, t);
                case i.TriggerActionType.ResizePlayerView:
                  return new R.ResizePlayerViewExecutor(e, t);
                case i.TriggerActionType.PlayAnimAt:
                  return new C.PlayAnimAtExecutor(e, t);
                case i.TriggerActionType.DetonateWarhead:
                  return new g.DetonateWarheadExecutor(e, t);
                case i.TriggerActionType.ReshroudMap:
                  return new M.ReshroudMapExecutor(e, t);
                case i.TriggerActionType.EnableTrigger:
                  return new W.ToggleTriggerExecutor(e, t, !0);
                case i.TriggerActionType.DisableTrigger:
                  return new W.ToggleTriggerExecutor(e, t, !1);
                case i.TriggerActionType.CreateRadarEvent:
                  return new c.CreateRadarEventExecutor(e, t);
                case i.TriggerActionType.LocalSet:
                  return new S.LocalVariableExecutor(e, t, !0);
                case i.TriggerActionType.LocalClear:
                  return new S.LocalVariableExecutor(e, t, !1);
                case i.TriggerActionType.SellBuilding:
                  return new k.SellBuildingExecutor(e, t);
                case i.TriggerActionType.TurnOffBuilding:
                  return new z.TurnOnOffBuildingExecutor(e, t, !1);
                case i.TriggerActionType.TurnOnBuilding:
                  return new z.TurnOnOffBuildingExecutor(e, t, !0);
                case i.TriggerActionType.ApplyOneHundredDamage:
                  return new s.ApplyDamageExecutor(e, t, 100);
                case i.TriggerActionType.ForceEnd:
                  return new f.ForceEndExecutor(e, t);
                case i.TriggerActionType.DestroyTag:
                  return new u.DestroyTagExecutor(e, t);
                case i.TriggerActionType.SetAmbientStep:
                  return new j.SetAmbientStepExecutor(e, t);
                case i.TriggerActionType.SetAmbientRate:
                  return new N.SetAmbientRateExecutor(e, t);
                case i.TriggerActionType.SetAmbientLight:
                  return new B.SetAmbientLightExecutor(e, t);
                case i.TriggerActionType.NukeStrike:
                  return new E.NukeStrikeExecutor(e, t);
                case i.TriggerActionType.PlaySoundFxAt:
                  return new x.PlaySoundFxAtExecutor(e, t);
                case i.TriggerActionType.UnrevealAroundWaypoint:
                  return new K.UnrevealAroundWaypointExecutor(e, t);
                case i.TriggerActionType.LightningStrike:
                  return new b.LightningStrikeExecutor(e, t);
                case i.TriggerActionType.TimerText:
                  return new V.TimerTextExecutor(e, t);
                case i.TriggerActionType.CreateCrate:
                  return new l.CreateCrateExecutor(e, t);
                case i.TriggerActionType.IronCurtainAt:
                  return new v.IronCurtainExecutor(e, t);
                case i.TriggerActionType.EvictOccupiers:
                  return new p.EvictOccupiersExecutor(e, t);
                case i.TriggerActionType.Cheer:
                  return new o.CheerExecutor(e, t);
                case i.TriggerActionType.StopSoundsAt:
                  return new L.StopSoundFxAtExecutor(e, t);
                default:
                  throw new Error(`Unhandled action type "${i.TriggerActionType[e.type]}"`);
              }
            }
          }),
        );
      },
    };
  },
);
