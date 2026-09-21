// === Reconstructed SystemJS module: game/trigger/TriggerExecutorFactory ===
// deps: ["data/map/trigger/TriggerActionType","data/map/trigger/TriggerSupport","game/trigger/executor/AddSuperWeaponExecutor","game/trigger/executor/ApplyDamageExecutor","game/trigger/executor/ChangeHouseAllExecutor","game/trigger/executor/ChangeHouseExecutor","game/trigger/executor/ChangeAllianceExecutor","game/trigger/executor/CheerExecutor","game/trigger/executor/CreateCrateExecutor","game/trigger/executor/CreateRadarEventExecutor","game/trigger/executor/DestroyObjectExecutor","game/trigger/executor/DestroyTagExecutor","game/trigger/executor/DestroyTriggerExecutor","game/trigger/executor/DetonateWarheadExecutor","game/trigger/executor/DisarmTriggerExecutor","game/trigger/executor/DoShroudExecutor","game/trigger/executor/DoUnshroudExecutor","game/trigger/executor/EvictOccupiersExecutor","game/trigger/executor/FireSaleExecutor","game/trigger/executor/ForceEndExecutor","game/trigger/executor/ForceShieldAtExecutor","game/trigger/executor/ForceTriggerExecutor","game/trigger/executor/GlobalVariableExecutor","game/trigger/executor/IronCurtainExecutor","game/trigger/executor/LightningStrikeExecutor","game/trigger/executor/LocalVariableExecutor","game/trigger/executor/NoActionExecutor","game/trigger/executor/NukeStrikeExecutor","game/trigger/executor/PlayAnimAtExecutor","game/trigger/executor/PlaySoundEffectExecutor","game/trigger/executor/PlaySoundFxAtExecutor","game/trigger/executor/PlaySoundFxExecutor","game/trigger/executor/PlaySoundFxRandomExecutor","game/trigger/executor/PlaySpeechExecutor","game/trigger/executor/ReshroudMapExecutor","game/trigger/executor/ResizePlayerViewExecutor","game/trigger/executor/RevealAroundWaypointExecutor","game/trigger/executor/RevealMapExecutor","game/trigger/executor/SellBuildingExecutor","game/trigger/executor/SetAmbientLightExecutor","game/trigger/executor/SetAmbientRateExecutor","game/trigger/executor/SetAmbientStepExecutor","game/trigger/executor/StopSoundFxAtExecutor","game/trigger/executor/TextNotificationExecutor","game/trigger/executor/TextTriggerExecutor","game/trigger/executor/TimerExtendExecutor","game/trigger/executor/TimerPauseExecutor","game/trigger/executor/TimerResumeExecutor","game/trigger/executor/TimerSetExecutor","game/trigger/executor/TimerShortenExecutor","game/trigger/executor/TimerStartExecutor","game/trigger/executor/TimerStopExecutor","game/trigger/executor/TimerTextExecutor","game/trigger/executor/ToggleTriggerExecutor","game/trigger/executor/TurnOnOffBuildingExecutor","game/trigger/executor/UnrevealAroundWaypointExecutor","game/trigger/executor/WinLoseExecutor","game/trigger/executor/AllianceExecutor","game/trigger/executor/EnemyExecutor","game/trigger/executor/SuperWeaponFxExecutor","game/trigger/executor/ShroudFxExecutor","game/trigger/executor/UnloadAllExecutor","game/trigger/executor/SabotageUnitExecutor","game/trigger/executor/ChangeLightingExecutor","game/trigger/executor/MiscActionExecutor","game/trigger/executor/CreateTeamExecutor","game/trigger/executor/UserInputExecutor","game/trigger/executor/MoveCameraExecutor","game/trigger/executor/FlashUnitExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/TriggerExecutorFactory",
  [
    "data/map/trigger/TriggerActionType",
    "data/map/trigger/TriggerSupport",
    "game/trigger/executor/AddSuperWeaponExecutor",
    "game/trigger/executor/ApplyDamageExecutor",
    "game/trigger/executor/ChangeHouseAllExecutor",
    "game/trigger/executor/ChangeHouseExecutor",
    "game/trigger/executor/ChangeAllianceExecutor",
    "game/trigger/executor/CheerExecutor",
    "game/trigger/executor/CreateCrateExecutor",
    "game/trigger/executor/CreateRadarEventExecutor",
    "game/trigger/executor/DestroyObjectExecutor",
    "game/trigger/executor/DestroyTagExecutor",
    "game/trigger/executor/DestroyTriggerExecutor",
    "game/trigger/executor/DetonateWarheadExecutor",
    "game/trigger/executor/DisarmTriggerExecutor",
    "game/trigger/executor/DoShroudExecutor",
    "game/trigger/executor/DoUnshroudExecutor",
    "game/trigger/executor/EvictOccupiersExecutor",
    "game/trigger/executor/FireSaleExecutor",
    "game/trigger/executor/ForceEndExecutor",
    "game/trigger/executor/ForceShieldAtExecutor",
    "game/trigger/executor/ForceTriggerExecutor",
    "game/trigger/executor/GlobalVariableExecutor",
    "game/trigger/executor/IronCurtainExecutor",
    "game/trigger/executor/LightningStrikeExecutor",
    "game/trigger/executor/LocalVariableExecutor",
    "game/trigger/executor/NoActionExecutor",
    "game/trigger/executor/NukeStrikeExecutor",
    "game/trigger/executor/PlayAnimAtExecutor",
    "game/trigger/executor/PlaySoundEffectExecutor",
    "game/trigger/executor/PlaySoundFxAtExecutor",
    "game/trigger/executor/PlaySoundFxExecutor",
    "game/trigger/executor/PlaySoundFxRandomExecutor",
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
    "game/trigger/executor/TextNotificationExecutor",
    "game/trigger/executor/TextTriggerExecutor",
    "game/trigger/executor/TimerExtendExecutor",
    "game/trigger/executor/TimerPauseExecutor",
    "game/trigger/executor/TimerResumeExecutor",
    "game/trigger/executor/TimerSetExecutor",
    "game/trigger/executor/TimerShortenExecutor",
    "game/trigger/executor/TimerStartExecutor",
    "game/trigger/executor/TimerStopExecutor",
    "game/trigger/executor/TimerTextExecutor",
    "game/trigger/executor/ToggleTriggerExecutor",
    "game/trigger/executor/TurnOnOffBuildingExecutor",
    "game/trigger/executor/UnrevealAroundWaypointExecutor",
    "game/trigger/executor/WinLoseExecutor",
    "game/trigger/executor/AllianceExecutor",
    "game/trigger/executor/EnemyExecutor",
    "game/trigger/executor/SuperWeaponFxExecutor",
    "game/trigger/executor/ShroudFxExecutor",
    "game/trigger/executor/UnloadAllExecutor",
    "game/trigger/executor/SabotageUnitExecutor",
    "game/trigger/executor/ChangeLightingExecutor",
    "game/trigger/executor/MiscActionExecutor",
    "game/trigger/executor/CreateTeamExecutor",
    "game/trigger/executor/CreateReinforcementExecutor",
    "game/trigger/executor/DestroyTeamExecutor",
    "game/trigger/executor/AllToHuntExecutor",
    "game/trigger/executor/DestroyAllExecutor",
    "game/trigger/executor/CreateBuildingExecutor",
    "game/trigger/executor/TeleportAllExecutor",
    "game/trigger/executor/GenericFacingExecutor",
    "game/trigger/executor/BlackoutRadarExecutor",
    "game/trigger/executor/FlashBuildingsOfTypeExecutor",
    "game/trigger/executor/UserInputExecutor",
    "game/trigger/executor/MoveCameraExecutor",
    "game/trigger/executor/FlashUnitExecutor",
  ],
  function (e, t) {
    "use strict";
    var i,
      af,
      r,
      s,
      a,
      n,
      Z,
      o,
      l,
      c,
      h,
      u,
      d,
      g,
      ae,
      J,
      aa,
      p,
      m,
      f,
      ab,
      y,
      T,
      v,
      b,
      S,
      w,
      E,
      C,
      X,
      x,
      O,
      Q,
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
      Y,
      D,
      F,
      ac,
      ad,
      _,
      U,
      H,
      G,
      V,
      W,
      z,
      K,
      q,
      Wl,
      Ua,
      Va,
      Wa,
      Xa,
      Ya,
      Za,
      $a,
      bb,
      cb,
      db,
      eb,
      fb,
      gb,
      hb,
      ib,
      jb,
      kb,
      lb,
      mb,
      nb,
      ob;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          af = e;
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
          Z = e;
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
          ae = e;
        },
        function (e) {
          J = e;
        },
        function (e) {
          aa = e;
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
          ab = e;
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
          X = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          Q = e;
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
          Y = e;
        },
        function (e) {
          D = e;
        },
        function (e) {
          F = e;
        },
        function (e) {
          ac = e;
        },
        function (e) {
          ad = e;
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
        function (e) {
          Wl = e;
        },
        function (e) {
          Ua = e;
        },
        function (e) {
          Va = e;
        },
        function (e) {
          Wa = e;
        },
        function (e) {
          Xa = e;
        },
        function (e) {
          Ya = e;
        },
        function (e) {
          Za = e;
        },
        function (e) {
          $a = e;
        },
        function (e) {
          bb = e;
        },
        function (e) {
          cb = e;
        },
        function (e) {
          gb = e;
        },
        function (e) {
          hb = e;
        },
        function (e) {
          ib = e;
        },
        function (e) {
          jb = e;
        },
        function (e) {
          kb = e;
        },
        function (e) {
          lb = e;
        },
        function (e) {
          mb = e;
        },
        function (e) {
          nb = e;
        },
        function (e) {
          ob = e;
        },
        function (e) {
          db = e;
        },
        function (e) {
          eb = e;
        },
        function (e) {
          fb = e;
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
                case i.TriggerActionType.Win:
                case i.TriggerActionType.DeclareWinning:
                  return new Wl.WinLoseExecutor(e, t, !0);
                case i.TriggerActionType.Lose:
                case i.TriggerActionType.DeclareLosing:
                  return new Wl.WinLoseExecutor(e, t, !1);
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
                // ========== YR 新增动作类型 ==========
                case i.TriggerActionType.DoShroud:
                  return new J.DoShroudExecutor(e, t);
                case i.TriggerActionType.DoUnshroud:
                  return new aa.DoUnshroudExecutor(e, t);
                case i.TriggerActionType.TextNotification:
                  return new Y.TextNotificationExecutor(e, t);
                case i.TriggerActionType.PlaySoundEffect:
                  return new X.PlaySoundEffectExecutor(e, t);
                case i.TriggerActionType.ChangeAlliance:
                  return new Z.ChangeAllianceExecutor(e, t);
                case i.TriggerActionType.Alliance:
                  return new Ua.AllianceExecutor(e, t);
                case i.TriggerActionType.Enemy:
                  return new Va.EnemyExecutor(e, t);
                case i.TriggerActionType.DisarmTrigger:
                  return new ae.DisarmTriggerExecutor(e, t);
                case i.TriggerActionType.PlaySoundFxRandom:
                  return new Q.PlaySoundFxRandomExecutor(e, t);
                case i.TriggerActionType.TimerPause:
                  return new ac.TimerPauseExecutor(e, t);
                case i.TriggerActionType.TimerResume:
                  return new ad.TimerResumeExecutor(e, t);
                case i.TriggerActionType.ForceShieldAt:
                  return new ab.ForceShieldAtExecutor(e, t);
                // ==========  补充实现 ==========
                case i.TriggerActionType.RevealAllUnits:
                  return new Xa.ShroudFxExecutor(e, t, "reveal-all-units");
                case i.TriggerActionType.ExtendShroud:
                  return new Xa.ShroudFxExecutor(e, t, "extend-shroud");
                case i.TriggerActionType.ChangeLighting:
                  return new $a.ChangeLightingExecutor(e, t);
                case i.TriggerActionType.MeteorStrike:
                  return new Wa.SuperWeaponFxExecutor(e, t, "meteor");
                case i.TriggerActionType.ChronoWarp:
                  return new Wa.SuperWeaponFxExecutor(e, t, "chronowarp");
                case i.TriggerActionType.ChronoshiftAt:
                  return new Wa.SuperWeaponFxExecutor(e, t, "chronoshift");
                case i.TriggerActionType.ChronoWarpAt:
                  return new Wa.SuperWeaponFxExecutor(e, t, "chronowarpat");
                case i.TriggerActionType.PsychicRevealAt:
                  return new Wa.SuperWeaponFxExecutor(e, t, "psychic");
                case i.TriggerActionType.GeneticMutatorAt:
                  return new Wa.SuperWeaponFxExecutor(e, t, "genetic");
                case i.TriggerActionType.UnloadAll:
                  return new Ya.UnloadAllExecutor(e, t);
                case i.TriggerActionType.SabotageUnit:
                  return new Za.SabotageUnitExecutor(e, t);
                // 受限于本构建缺失的子系统的动作：明确记录但不执行
                // 注意: CreateTeam/DestroyTeam/PlayMovie 在枚举中重复定义（RA2=4/5/10,
                // YR=76/77/82），同名枚举值取后者，故此处用数字字面量同时覆盖两种编号。
                case i.TriggerActionType.ProductionBegins:
                  return new bb.MiscActionExecutor(e, t, "ProductionBegins");
                case 4:
                case i.TriggerActionType.CreateTeam:
                  return new cb.CreateTeamExecutor(e, t);
                case 5:
                case i.TriggerActionType.DestroyTeam:
                  return new hb.DestroyTeamExecutor(e, t);
                case i.TriggerActionType.AllToHunt:
                  return new ib.AllToHuntExecutor(e, t);
                case i.TriggerActionType.CreateReinforcement:
                  return new gb.CreateReinforcementExecutor(e, t);
                case i.TriggerActionType.DropLZFlash:
                  return new bb.MiscActionExecutor(e, t, "DropLZFlash");
                case 10:
                case i.TriggerActionType.PlayMovie:
                  return new bb.MiscActionExecutor(e, t, "PlayMovie");
                case i.TriggerActionType.AutoCreate:
                  return new bb.MiscActionExecutor(e, t, "AutoCreate");
                case i.TriggerActionType.AllowWin:
                  return new bb.MiscActionExecutor(e, t, "AllowWin");
                case i.TriggerActionType.PlayMusic:
                  return new bb.MiscActionExecutor(e, t, "PlayMusic");
                case i.TriggerActionType.BuildBase:
                  return new bb.MiscActionExecutor(e, t, "BuildBase");
                case i.TriggerActionType.ChangeViewLevel:
                  return new bb.MiscActionExecutor(e, t, "ChangeViewLevel");
                case i.TriggerActionType.DisableUserInput:
                  return new db.UserInputExecutor(e, t, !0);
                case i.TriggerActionType.EnableUserInput:
                  return new db.UserInputExecutor(e, t, !1);
                case i.TriggerActionType.MoveAndCenterView:
                  return new eb.MoveCameraExecutor(e, t);
                case i.TriggerActionType.ZoomIn:
                  return new bb.MiscActionExecutor(e, t, "ZoomIn");
                case i.TriggerActionType.ZoomOut:
                  return new bb.MiscActionExecutor(e, t, "ZoomOut");
                case i.TriggerActionType.FlashSmall:
                case i.TriggerActionType.FlashMedium:
                case i.TriggerActionType.FlashLarge:
                case i.TriggerActionType.FlashTeam:
                  return new fb.FlashUnitExecutor(e, t);
                case i.TriggerActionType.ReinforceTeam:
                  return new gb.CreateReinforcementExecutor(e, t);
                case i.TriggerActionType.DestroyAll:
                  return new jb.DestroyAllExecutor(e, t, "all");
                case i.TriggerActionType.DestroyAllBuildings:
                  return new jb.DestroyAllExecutor(e, t, "buildings");
                case i.TriggerActionType.DestroyAllLandUnits:
                  return new jb.DestroyAllExecutor(e, t, "land-units");
                case i.TriggerActionType.DestroyAllNavalUnits:
                  return new jb.DestroyAllExecutor(e, t, "naval-units");
                case i.TriggerActionType.MindControlBase:
                  return new bb.MiscActionExecutor(e, t, "MindControlBase");
                case i.TriggerActionType.RestoreMindControlledBase:
                  return new bb.MiscActionExecutor(e, t, "RestoreMindControlledBase");
                case i.TriggerActionType.CreateBuilding:
                  return new kb.CreateBuildingExecutor(e, t);
                case i.TriggerActionType.RestoreStartingUnits:
                  return new bb.MiscActionExecutor(e, t, "RestoreStartingUnits");
                case i.TriggerActionType.StartChronoScreenEffect:
                  return new bb.MiscActionExecutor(e, t, "StartChronoScreenEffect");
                case i.TriggerActionType.TeleportAll:
                  return new lb.TeleportAllExecutor(e, t);
                case i.TriggerActionType.SetSuperWeaponCharge:
                  return new bb.MiscActionExecutor(e, t, "SetSuperWeaponCharge");
                case i.TriggerActionType.RestoreStartingBuildings:
                  return new bb.MiscActionExecutor(e, t, "RestoreStartingBuildings");
                case i.TriggerActionType.FlashBuildingsOfType:
                  return new ob.FlashBuildingsOfTypeExecutor(e, t);
                case i.TriggerActionType.SuperWeaponSetRechargeTime:
                  return new bb.MiscActionExecutor(e, t, "SuperWeaponSetRechargeTime");
                case i.TriggerActionType.SuperWeaponResetRechargeTime:
                  return new bb.MiscActionExecutor(e, t, "SuperWeaponResetRechargeTime");
                case i.TriggerActionType.SuperWeaponReset:
                  return new bb.MiscActionExecutor(e, t, "SuperWeaponReset");
                case i.TriggerActionType.SetPreferredTargetCell:
                  return new bb.MiscActionExecutor(e, t, "SetPreferredTargetCell");
                case i.TriggerActionType.ClearPreferredTargetCell:
                  return new bb.MiscActionExecutor(e, t, "ClearPreferredTargetCell");
                case i.TriggerActionType.SetBaseCenterCell:
                  return new bb.MiscActionExecutor(e, t, "SetBaseCenterCell");
                case i.TriggerActionType.ClearBaseCenterCell:
                  return new bb.MiscActionExecutor(e, t, "ClearBaseCenterCell");
                case i.TriggerActionType.BlackoutRadar:
                  return new nb.BlackoutRadarExecutor(e, t);
                case i.TriggerActionType.SetDefensiveTargetCell:
                  return new bb.MiscActionExecutor(e, t, "SetDefensiveTargetCell");
                case i.TriggerActionType.ClearDefensiveTargetCell:
                  return new bb.MiscActionExecutor(e, t, "ClearDefensiveTargetCell");
                case i.TriggerActionType.RetintRed:
                  return new bb.MiscActionExecutor(e, t, "RetintRed");
                case i.TriggerActionType.RetintGreen:
                  return new bb.MiscActionExecutor(e, t, "RetintGreen");
                case i.TriggerActionType.RetintBlue:
                  return new bb.MiscActionExecutor(e, t, "RetintBlue");
                case i.TriggerActionType.JumpCameraHome:
                  return new bb.MiscActionExecutor(e, t, "JumpCameraHome");
                case i.TriggerActionType.GenericFacing:
                  return new mb.GenericFacingExecutor(e, t);
                case i.TriggerActionType.GenericTimer:
                  return new bb.MiscActionExecutor(e, t, "GenericTimer");
                case i.TriggerActionType.ChangeDifficulty:
                  return new bb.MiscActionExecutor(e, t, "ChangeDifficulty");
                case i.TriggerActionType.PlayBink:
                  return new bb.MiscActionExecutor(e, t, "PlayBink");
                case i.TriggerActionType.ShowTutorial:
                  return new bb.MiscActionExecutor(e, t, "ShowTutorial");
                case i.TriggerActionType.ResetTutorial:
                  return new bb.MiscActionExecutor(e, t, "ResetTutorial");
                case i.TriggerActionType.EndTutorial:
                  return new bb.MiscActionExecutor(e, t, "EndTutorial");
                case i.TriggerActionType.PreferredTarget:
                  return new bb.MiscActionExecutor(e, t, "PreferredTarget");
                case i.TriggerActionType.TimerShow:
                  return new bb.MiscActionExecutor(e, t, "TimerShow");
                case i.TriggerActionType.TimerHide:
                  return new bb.MiscActionExecutor(e, t, "TimerHide");
                default:
                  // 已加入枚举但未实现的动作类型: 以 NoActionExecutor 占位(无操作),
                  // 避免触发器触发时抛错崩溃。具体清单见 data/map/trigger/TriggerSupport。
                  if (af.TriggerSupport.placeholderActionTypes.has(e.type)) return new w.NoActionExecutor(e, t);
                  throw new Error(`Unhandled action type "${i.TriggerActionType[e.type]}"`);
              }
            }
          }),
        );
      },
    };
  },
);
