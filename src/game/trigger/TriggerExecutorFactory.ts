/**
 * TriggerExecutorFactory — 按 TriggerActionType 创建对应动作执行器的大工厂。
 *
 * create(action, trigger) 对 action.type 做 switch，返回具体
 * XxxExecutor 实例（均继承 TriggerExecutor）。要点：
 *  - 部分枚举共享实现并带第三参（如 WinLose 的 isWin、GlobalVariable
 *    的 value、ApplyDamage 的 damage、ShroudFx/SuperWeaponFx 的 mode）；
 *  - CreateTeam/DestroyTeam/PlayMovie 在 RA2/YR 枚举中重复定义，同名
 *    取后者，故 case 中用数字字面量 4/5/10 同时覆盖两种编号；
 *  - 未实现但已入枚举的动作走 TriggerSupport.placeholderActionTypes
 *    以 NoActionExecutor 占位；仍未命中则 throw。
 *
 * 由 game/trigger/TriggerExecutorFactory.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerActionType } from "data/map/trigger/TriggerActionType"; // 孪生
import { TriggerSupport } from "data/map/trigger/TriggerSupport"; // 孪生
import { AddSuperWeaponExecutor } from "game/trigger/executor/AddSuperWeaponExecutor"; // 已转换
import { ApplyDamageExecutor } from "game/trigger/executor/ApplyDamageExecutor"; // 已转换
import { ChangeHouseAllExecutor } from "game/trigger/executor/ChangeHouseAllExecutor"; // 孪生
import { ChangeHouseExecutor } from "game/trigger/executor/ChangeHouseExecutor"; // 已转换
import { ChangeAllianceExecutor } from "game/trigger/executor/ChangeAllianceExecutor"; // 孪生
import { CheerExecutor } from "game/trigger/executor/CheerExecutor"; // 孪生
import { CreateCrateExecutor } from "game/trigger/executor/CreateCrateExecutor"; // 孪生
import { CreateRadarEventExecutor } from "game/trigger/executor/CreateRadarEventExecutor"; // 已转换
import { DestroyObjectExecutor } from "game/trigger/executor/DestroyObjectExecutor"; // 已转换
import { DestroyTagExecutor } from "game/trigger/executor/DestroyTagExecutor"; // 孪生
import { DestroyTriggerExecutor } from "game/trigger/executor/DestroyTriggerExecutor"; // 孪生
import { DetonateWarheadExecutor } from "game/trigger/executor/DetonateWarheadExecutor"; // 已转换
import { DisarmTriggerExecutor } from "game/trigger/executor/DisarmTriggerExecutor"; // 孪生
import { DoShroudExecutor } from "game/trigger/executor/DoShroudExecutor"; // 已转换
import { DoUnshroudExecutor } from "game/trigger/executor/DoUnshroudExecutor"; // 孪生
import { EvictOccupiersExecutor } from "game/trigger/executor/EvictOccupiersExecutor"; // 已转换
import { FireSaleExecutor } from "game/trigger/executor/FireSaleExecutor"; // 孪生
import { ForceEndExecutor } from "game/trigger/executor/ForceEndExecutor"; // 已转换
import { ForceShieldAtExecutor } from "game/trigger/executor/ForceShieldAtExecutor"; // 已转换
import { ForceTriggerExecutor } from "game/trigger/executor/ForceTriggerExecutor"; // 已转换
import { GlobalVariableExecutor } from "game/trigger/executor/GlobalVariableExecutor"; // 孪生
import { IronCurtainExecutor } from "game/trigger/executor/IronCurtainExecutor"; // 孪生
import { LightningStrikeExecutor } from "game/trigger/executor/LightningStrikeExecutor"; // 孪生
import { LocalVariableExecutor } from "game/trigger/executor/LocalVariableExecutor"; // 已转换
import { NoActionExecutor } from "game/trigger/executor/NoActionExecutor"; // 已转换
import { NukeStrikeExecutor } from "game/trigger/executor/NukeStrikeExecutor"; // 已转换
import { PlayAnimAtExecutor } from "game/trigger/executor/PlayAnimAtExecutor"; // 孪生
import { PlaySoundEffectExecutor } from "game/trigger/executor/PlaySoundEffectExecutor"; // 孪生
import { PlaySoundFxAtExecutor } from "game/trigger/executor/PlaySoundFxAtExecutor"; // 孪生
import { PlaySoundFxExecutor } from "game/trigger/executor/PlaySoundFxExecutor"; // 孪生
import { PlaySoundFxRandomExecutor } from "game/trigger/executor/PlaySoundFxRandomExecutor"; // 孪生
import { PlaySpeechExecutor } from "game/trigger/executor/PlaySpeechExecutor"; // 孪生
import { ReshroudMapExecutor } from "game/trigger/executor/ReshroudMapExecutor"; // 孪生
import { ResizePlayerViewExecutor } from "game/trigger/executor/ResizePlayerViewExecutor"; // 孪生
import { RevealAroundWaypointExecutor } from "game/trigger/executor/RevealAroundWaypointExecutor"; // 已转换
import { RevealMapExecutor } from "game/trigger/executor/RevealMapExecutor"; // 孪生
import { SellBuildingExecutor } from "game/trigger/executor/SellBuildingExecutor"; // 已转换
import { SetAmbientLightExecutor } from "game/trigger/executor/SetAmbientLightExecutor"; // 孪生
import { SetAmbientRateExecutor } from "game/trigger/executor/SetAmbientRateExecutor"; // 孪生
import { SetAmbientStepExecutor } from "game/trigger/executor/SetAmbientStepExecutor"; // 已转换
import { StopSoundFxAtExecutor } from "game/trigger/executor/StopSoundFxAtExecutor"; // 孪生
import { TextNotificationExecutor } from "game/trigger/executor/TextNotificationExecutor"; // 已转换
import { TextTriggerExecutor } from "game/trigger/executor/TextTriggerExecutor"; // 孪生
import { TimerExtendExecutor } from "game/trigger/executor/TimerExtendExecutor"; // 已转换
import { TimerPauseExecutor } from "game/trigger/executor/TimerPauseExecutor"; // 孪生
import { TimerResumeExecutor } from "game/trigger/executor/TimerResumeExecutor"; // 已转换
import { TimerSetExecutor } from "game/trigger/executor/TimerSetExecutor"; // 孪生
import { TimerShortenExecutor } from "game/trigger/executor/TimerShortenExecutor"; // 孪生
import { TimerStartExecutor } from "game/trigger/executor/TimerStartExecutor"; // 已转换
import { TimerStopExecutor } from "game/trigger/executor/TimerStopExecutor"; // 孪生
import { TimerTextExecutor } from "game/trigger/executor/TimerTextExecutor"; // 孪生
import { ToggleTriggerExecutor } from "game/trigger/executor/ToggleTriggerExecutor"; // 已转换
import { TurnOnOffBuildingExecutor } from "game/trigger/executor/TurnOnOffBuildingExecutor"; // 孪生
import { UnrevealAroundWaypointExecutor } from "game/trigger/executor/UnrevealAroundWaypointExecutor"; // 孪生
import { WinLoseExecutor } from "game/trigger/executor/WinLoseExecutor"; // 孪生
import { AllianceExecutor } from "game/trigger/executor/AllianceExecutor"; // 孪生
import { EnemyExecutor } from "game/trigger/executor/EnemyExecutor"; // 已转换
import { SuperWeaponFxExecutor } from "game/trigger/executor/SuperWeaponFxExecutor"; // 已转换
import { ShroudFxExecutor } from "game/trigger/executor/ShroudFxExecutor"; // 孪生
import { UnloadAllExecutor } from "game/trigger/executor/UnloadAllExecutor"; // 孪生
import { SabotageUnitExecutor } from "game/trigger/executor/SabotageUnitExecutor"; // 孪生
import { ChangeLightingExecutor } from "game/trigger/executor/ChangeLightingExecutor"; // 已转换
import { MiscActionExecutor } from "game/trigger/executor/MiscActionExecutor"; // 已转换
import { CreateTeamExecutor } from "game/trigger/executor/CreateTeamExecutor"; // 孪生
import { CreateReinforcementExecutor } from "game/trigger/executor/CreateReinforcementExecutor"; // 孪生
import { DestroyTeamExecutor } from "game/trigger/executor/DestroyTeamExecutor"; // 孪生
import { AllToHuntExecutor } from "game/trigger/executor/AllToHuntExecutor"; // 孪生
import { DestroyAllExecutor } from "game/trigger/executor/DestroyAllExecutor"; // 孪生
import { CreateBuildingExecutor } from "game/trigger/executor/CreateBuildingExecutor"; // 孪生
import { TeleportAllExecutor } from "game/trigger/executor/TeleportAllExecutor"; // 已转换
import { GenericFacingExecutor } from "game/trigger/executor/GenericFacingExecutor"; // 孪生
import { BlackoutRadarExecutor } from "game/trigger/executor/BlackoutRadarExecutor"; // 孪生
import { FlashBuildingsOfTypeExecutor } from "game/trigger/executor/FlashBuildingsOfTypeExecutor"; // 孪生
import { UserInputExecutor } from "game/trigger/executor/UserInputExecutor"; // 已转换
import { MoveCameraExecutor } from "game/trigger/executor/MoveCameraExecutor"; // 孪生
import { FlashUnitExecutor } from "game/trigger/executor/FlashUnitExecutor"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TriggerExecutorFactory {
  /**
   * 按 action.type 创建执行器。
   * @param action 触发器动作（type + params + triggerId + index）
   * @param trigger 所属触发器实例
   * @throws 未处理且不在占位集合中的动作类型
   */
  create(action: any, trigger: any): any {
    switch (action.type) {
      case TriggerActionType.NoAction:
        return new NoActionExecutor(action, trigger);
      case TriggerActionType.Win:
      case TriggerActionType.DeclareWinning:
        return new WinLoseExecutor(action, trigger, true);
      case TriggerActionType.Lose:
      case TriggerActionType.DeclareLosing:
        return new WinLoseExecutor(action, trigger, false);
      case TriggerActionType.FireSale:
        return new FireSaleExecutor(action, trigger);
      case TriggerActionType.TextTrigger:
        return new TextTriggerExecutor(action, trigger);
      case TriggerActionType.DestroyTrigger:
        return new DestroyTriggerExecutor(action, trigger);
      case TriggerActionType.ChangeHouse:
        return new ChangeHouseExecutor(action, trigger);
      case TriggerActionType.RevealMap:
        return new RevealMapExecutor(action, trigger);
      case TriggerActionType.RevealAroundWaypoint:
        return new RevealAroundWaypointExecutor(action, trigger);
      case TriggerActionType.PlaySoundFx:
        return new PlaySoundFxExecutor(action, trigger);
      case TriggerActionType.PlaySpeech:
        return new PlaySpeechExecutor(action, trigger);
      case TriggerActionType.ForceTrigger:
        return new ForceTriggerExecutor(action, trigger);
      case TriggerActionType.TimerStart:
        return new TimerStartExecutor(action, trigger);
      case TriggerActionType.TimerStop:
        return new TimerStopExecutor(action, trigger);
      case TriggerActionType.TimerExtend:
        return new TimerExtendExecutor(action, trigger);
      case TriggerActionType.TimerShorten:
        return new TimerShortenExecutor(action, trigger);
      case TriggerActionType.TimerSet:
        return new TimerSetExecutor(action, trigger);
      case TriggerActionType.GlobalSet:
        return new GlobalVariableExecutor(action, trigger, true);
      case TriggerActionType.GlobalClear:
        return new GlobalVariableExecutor(action, trigger, false);
      case TriggerActionType.DestroyObject:
        return new DestroyObjectExecutor(action, trigger);
      case TriggerActionType.AddOneTimeSuperWeapon:
        return new AddSuperWeaponExecutor(action, trigger, true);
      case TriggerActionType.AddRepeatingSuperWeapon:
        return new AddSuperWeaponExecutor(action, trigger, false);
      case TriggerActionType.AllChangeHouse:
        return new ChangeHouseAllExecutor(action, trigger);
      case TriggerActionType.ResizePlayerView:
        return new ResizePlayerViewExecutor(action, trigger);
      case TriggerActionType.PlayAnimAt:
        return new PlayAnimAtExecutor(action, trigger);
      case TriggerActionType.DetonateWarhead:
        return new DetonateWarheadExecutor(action, trigger);
      case TriggerActionType.ReshroudMap:
        return new ReshroudMapExecutor(action, trigger);
      case TriggerActionType.EnableTrigger:
        return new ToggleTriggerExecutor(action, trigger, true);
      case TriggerActionType.DisableTrigger:
        return new ToggleTriggerExecutor(action, trigger, false);
      case TriggerActionType.CreateRadarEvent:
        return new CreateRadarEventExecutor(action, trigger);
      case TriggerActionType.LocalSet:
        return new LocalVariableExecutor(action, trigger, true);
      case TriggerActionType.LocalClear:
        return new LocalVariableExecutor(action, trigger, false);
      case TriggerActionType.SellBuilding:
        return new SellBuildingExecutor(action, trigger);
      case TriggerActionType.TurnOffBuilding:
        return new TurnOnOffBuildingExecutor(action, trigger, false);
      case TriggerActionType.TurnOnBuilding:
        return new TurnOnOffBuildingExecutor(action, trigger, true);
      case TriggerActionType.ApplyOneHundredDamage:
        return new ApplyDamageExecutor(action, trigger, 100);
      case TriggerActionType.ForceEnd:
        return new ForceEndExecutor(action, trigger);
      case TriggerActionType.DestroyTag:
        return new DestroyTagExecutor(action, trigger);
      case TriggerActionType.SetAmbientStep:
        return new SetAmbientStepExecutor(action, trigger);
      case TriggerActionType.SetAmbientRate:
        return new SetAmbientRateExecutor(action, trigger);
      case TriggerActionType.SetAmbientLight:
        return new SetAmbientLightExecutor(action, trigger);
      case TriggerActionType.NukeStrike:
        return new NukeStrikeExecutor(action, trigger);
      case TriggerActionType.PlaySoundFxAt:
        return new PlaySoundFxAtExecutor(action, trigger);
      case TriggerActionType.UnrevealAroundWaypoint:
        return new UnrevealAroundWaypointExecutor(action, trigger);
      case TriggerActionType.LightningStrike:
        return new LightningStrikeExecutor(action, trigger);
      case TriggerActionType.TimerText:
        return new TimerTextExecutor(action, trigger);
      case TriggerActionType.CreateCrate:
        return new CreateCrateExecutor(action, trigger);
      case TriggerActionType.IronCurtainAt:
        return new IronCurtainExecutor(action, trigger);
      case TriggerActionType.EvictOccupiers:
        return new EvictOccupiersExecutor(action, trigger);
      case TriggerActionType.Cheer:
        return new CheerExecutor(action, trigger);
      case TriggerActionType.StopSoundsAt:
        return new StopSoundFxAtExecutor(action, trigger);
      // ========== YR 新增动作类型 ==========
      case TriggerActionType.DoShroud:
        return new DoShroudExecutor(action, trigger);
      case TriggerActionType.DoUnshroud:
        return new DoUnshroudExecutor(action, trigger);
      case TriggerActionType.TextNotification:
        return new TextNotificationExecutor(action, trigger);
      case TriggerActionType.PlaySoundEffect:
        return new PlaySoundEffectExecutor(action, trigger);
      case TriggerActionType.ChangeAlliance:
        return new ChangeAllianceExecutor(action, trigger);
      case TriggerActionType.Alliance:
        return new AllianceExecutor(action, trigger);
      case TriggerActionType.Enemy:
        return new EnemyExecutor(action, trigger);
      case TriggerActionType.DisarmTrigger:
        return new DisarmTriggerExecutor(action, trigger);
      case TriggerActionType.PlaySoundFxRandom:
        return new PlaySoundFxRandomExecutor(action, trigger);
      case TriggerActionType.TimerPause:
        return new TimerPauseExecutor(action, trigger);
      case TriggerActionType.TimerResume:
        return new TimerResumeExecutor(action, trigger);
      case TriggerActionType.ForceShieldAt:
        return new ForceShieldAtExecutor(action, trigger);
      // ==========  补充实现 ==========
      case TriggerActionType.RevealAllUnits:
        return new ShroudFxExecutor(action, trigger, "reveal-all-units");
      case TriggerActionType.ExtendShroud:
        return new ShroudFxExecutor(action, trigger, "extend-shroud");
      case TriggerActionType.ChangeLighting:
        return new ChangeLightingExecutor(action, trigger);
      case TriggerActionType.MeteorStrike:
        return new SuperWeaponFxExecutor(action, trigger, "meteor");
      case TriggerActionType.ChronoWarp:
        return new SuperWeaponFxExecutor(action, trigger, "chronowarp");
      case TriggerActionType.ChronoshiftAt:
        return new SuperWeaponFxExecutor(action, trigger, "chronoshift");
      case TriggerActionType.ChronoWarpAt:
        return new SuperWeaponFxExecutor(action, trigger, "chronowarpat");
      case TriggerActionType.PsychicRevealAt:
        return new SuperWeaponFxExecutor(action, trigger, "psychic");
      case TriggerActionType.GeneticMutatorAt:
        return new SuperWeaponFxExecutor(action, trigger, "genetic");
      case TriggerActionType.UnloadAll:
        return new UnloadAllExecutor(action, trigger);
      case TriggerActionType.SabotageUnit:
        return new SabotageUnitExecutor(action, trigger);
      // 受限于本构建缺失的子系统的动作：明确记录但不执行
      // 注意: CreateTeam/DestroyTeam/PlayMovie 在枚举中重复定义（RA2=4/5/10,
      // YR=76/77/82），同名枚举值取后者，故此处用数字字面量同时覆盖两种编号。
      case TriggerActionType.ProductionBegins:
        return new MiscActionExecutor(action, trigger, "ProductionBegins");
      case 4:
      case TriggerActionType.CreateTeam:
        return new CreateTeamExecutor(action, trigger);
      case 5:
      case TriggerActionType.DestroyTeam:
        return new DestroyTeamExecutor(action, trigger);
      case TriggerActionType.AllToHunt:
        return new AllToHuntExecutor(action, trigger);
      case TriggerActionType.CreateReinforcement:
        return new CreateReinforcementExecutor(action, trigger);
      case TriggerActionType.DropLZFlash:
        return new MiscActionExecutor(action, trigger, "DropLZFlash");
      case 10:
      case TriggerActionType.PlayMovie:
        return new MiscActionExecutor(action, trigger, "PlayMovie");
      case TriggerActionType.AutoCreate:
        return new MiscActionExecutor(action, trigger, "AutoCreate");
      case TriggerActionType.AllowWin:
        return new MiscActionExecutor(action, trigger, "AllowWin");
      case TriggerActionType.PlayMusic:
        return new MiscActionExecutor(action, trigger, "PlayMusic");
      case TriggerActionType.BuildBase:
        return new MiscActionExecutor(action, trigger, "BuildBase");
      case TriggerActionType.ChangeViewLevel:
        return new MiscActionExecutor(action, trigger, "ChangeViewLevel");
      case TriggerActionType.DisableUserInput:
        return new UserInputExecutor(action, trigger, true);
      case TriggerActionType.EnableUserInput:
        return new UserInputExecutor(action, trigger, false);
      case TriggerActionType.MoveAndCenterView:
        return new MoveCameraExecutor(action, trigger);
      case TriggerActionType.ZoomIn:
        return new MiscActionExecutor(action, trigger, "ZoomIn");
      case TriggerActionType.ZoomOut:
        return new MiscActionExecutor(action, trigger, "ZoomOut");
      case TriggerActionType.FlashSmall:
      case TriggerActionType.FlashMedium:
      case TriggerActionType.FlashLarge:
      case TriggerActionType.FlashTeam:
        return new FlashUnitExecutor(action, trigger);
      case TriggerActionType.ReinforceTeam:
        return new CreateReinforcementExecutor(action, trigger);
      case TriggerActionType.DestroyAll:
        return new DestroyAllExecutor(action, trigger, "all");
      case TriggerActionType.DestroyAllBuildings:
        return new DestroyAllExecutor(action, trigger, "buildings");
      case TriggerActionType.DestroyAllLandUnits:
        return new DestroyAllExecutor(action, trigger, "land-units");
      case TriggerActionType.DestroyAllNavalUnits:
        return new DestroyAllExecutor(action, trigger, "naval-units");
      case TriggerActionType.MindControlBase:
        return new MiscActionExecutor(action, trigger, "MindControlBase");
      case TriggerActionType.RestoreMindControlledBase:
        return new MiscActionExecutor(action, trigger, "RestoreMindControlledBase");
      case TriggerActionType.CreateBuilding:
        return new CreateBuildingExecutor(action, trigger);
      case TriggerActionType.RestoreStartingUnits:
        return new MiscActionExecutor(action, trigger, "RestoreStartingUnits");
      case TriggerActionType.StartChronoScreenEffect:
        return new MiscActionExecutor(action, trigger, "StartChronoScreenEffect");
      case TriggerActionType.TeleportAll:
        return new TeleportAllExecutor(action, trigger);
      case TriggerActionType.SetSuperWeaponCharge:
        return new MiscActionExecutor(action, trigger, "SetSuperWeaponCharge");
      case TriggerActionType.RestoreStartingBuildings:
        return new MiscActionExecutor(action, trigger, "RestoreStartingBuildings");
      case TriggerActionType.FlashBuildingsOfType:
        return new FlashBuildingsOfTypeExecutor(action, trigger);
      case TriggerActionType.SuperWeaponSetRechargeTime:
        return new MiscActionExecutor(action, trigger, "SuperWeaponSetRechargeTime");
      case TriggerActionType.SuperWeaponResetRechargeTime:
        return new MiscActionExecutor(action, trigger, "SuperWeaponResetRechargeTime");
      case TriggerActionType.SuperWeaponReset:
        return new MiscActionExecutor(action, trigger, "SuperWeaponReset");
      case TriggerActionType.SetPreferredTargetCell:
        return new MiscActionExecutor(action, trigger, "SetPreferredTargetCell");
      case TriggerActionType.ClearPreferredTargetCell:
        return new MiscActionExecutor(action, trigger, "ClearPreferredTargetCell");
      case TriggerActionType.SetBaseCenterCell:
        return new MiscActionExecutor(action, trigger, "SetBaseCenterCell");
      case TriggerActionType.ClearBaseCenterCell:
        return new MiscActionExecutor(action, trigger, "ClearBaseCenterCell");
      case TriggerActionType.BlackoutRadar:
        return new BlackoutRadarExecutor(action, trigger);
      case TriggerActionType.SetDefensiveTargetCell:
        return new MiscActionExecutor(action, trigger, "SetDefensiveTargetCell");
      case TriggerActionType.ClearDefensiveTargetCell:
        return new MiscActionExecutor(action, trigger, "ClearDefensiveTargetCell");
      case TriggerActionType.RetintRed:
        return new MiscActionExecutor(action, trigger, "RetintRed");
      case TriggerActionType.RetintGreen:
        return new MiscActionExecutor(action, trigger, "RetintGreen");
      case TriggerActionType.RetintBlue:
        return new MiscActionExecutor(action, trigger, "RetintBlue");
      case TriggerActionType.JumpCameraHome:
        return new MiscActionExecutor(action, trigger, "JumpCameraHome");
      case TriggerActionType.GenericFacing:
        return new GenericFacingExecutor(action, trigger);
      case TriggerActionType.GenericTimer:
        return new MiscActionExecutor(action, trigger, "GenericTimer");
      case TriggerActionType.ChangeDifficulty:
        return new MiscActionExecutor(action, trigger, "ChangeDifficulty");
      case TriggerActionType.PlayBink:
        return new MiscActionExecutor(action, trigger, "PlayBink");
      case TriggerActionType.ShowTutorial:
        return new MiscActionExecutor(action, trigger, "ShowTutorial");
      case TriggerActionType.ResetTutorial:
        return new MiscActionExecutor(action, trigger, "ResetTutorial");
      case TriggerActionType.EndTutorial:
        return new MiscActionExecutor(action, trigger, "EndTutorial");
      case TriggerActionType.PreferredTarget:
        return new MiscActionExecutor(action, trigger, "PreferredTarget");
      case TriggerActionType.TimerShow:
        return new MiscActionExecutor(action, trigger, "TimerShow");
      case TriggerActionType.TimerHide:
        return new MiscActionExecutor(action, trigger, "TimerHide");
      default:
        // 已加入枚举但未实现的动作类型: 以 NoActionExecutor 占位(无操作),
        // 避免触发器触发时抛错崩溃。具体清单见 data/map/trigger/TriggerSupport。
        if (TriggerSupport.placeholderActionTypes.has(action.type)) return new NoActionExecutor(action, trigger);
        throw new Error(`Unhandled action type "${TriggerActionType[action.type]}"`);
    }
  }
}
