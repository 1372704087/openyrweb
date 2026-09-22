/**
 * TriggerConditionFactory — 按 TriggerEventType 创建对应条件实例的工厂。
 *
 * 由 game/trigger/TriggerConditionFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 工作方式：switch(event.type) 分发到各条件类构造器；Build / Global / Local /
 * Health / Ambient 等事件带固定第三参；未实现但登记在
 * TriggerSupport.placeholderEventTypes 的事件以 NoEventCondition 占位
 * （永不触发），其余未知类型抛错。名称解析与孪生 deps 顺序一致。
 */
import { TriggerEventType } from "data/map/trigger/TriggerEventType"; // 孪生
import * as TriggerSupportModule from "data/map/trigger/TriggerSupport"; // 未转换（any-shim）
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import * as AmbientLightConditionModule from "game/trigger/condition/AmbientLightCondition"; // 未转换（any-shim）
import { AnyEventCondition } from "game/trigger/condition/AnyEventCondition"; // 孪生
import * as AttackedByAnyConditionModule from "game/trigger/condition/AttackedByAnyCondition"; // 未转换（any-shim）
import { AttackedByHouseCondition } from "game/trigger/condition/AttackedByHouseCondition"; // 孪生
import * as BuildingExistsConditionModule from "game/trigger/condition/BuildingExistsCondition"; // 未转换（any-shim）
import { BuildObjectTypeCondition } from "game/trigger/condition/BuildObjectTypeCondition"; // 孪生
import * as ComesNearWaypointConditionModule from "game/trigger/condition/ComesNearWaypointCondition"; // 未转换（any-shim）
import { CreditsBelowCondition } from "game/trigger/condition/CreditsBelowCondition"; // 孪生
import * as CreditsExceedConditionModule from "game/trigger/condition/CreditsExceedCondition"; // 未转换（any-shim）
import { CrossHorizLineCondition } from "game/trigger/condition/CrossHorizLineCondition"; // 孪生
import * as CrossVertLineConditionModule from "game/trigger/condition/CrossVertLineCondition"; // 未转换（any-shim）
import * as DestroyedAllBuildingsConditionModule from "game/trigger/condition/DestroyedAllBuildingsCondition"; // 未转换（any-shim）
import * as DestroyedAllConditionModule from "game/trigger/condition/DestroyedAllCondition"; // 未转换（any-shim）
import { DestroyedAllUnitsCondition } from "game/trigger/condition/DestroyedAllUnitsCondition"; // 孪生
import * as DestroyedAllUnitsLandConditionModule from "game/trigger/condition/DestroyedAllUnitsLandCondition"; // 未转换（any-shim）
import * as DestroyedAllUnitsNavalConditionModule from "game/trigger/condition/DestroyedAllUnitsNavalCondition"; // 未转换（any-shim）
import * as DestroyedBridgeConditionModule from "game/trigger/condition/DestroyedBridgeCondition"; // 未转换（any-shim）
import * as DestroyedBuildingsConditionModule from "game/trigger/condition/DestroyedBuildingsCondition"; // 未转换（any-shim）
import * as DestroyedByAnyConditionModule from "game/trigger/condition/DestroyedByAnyCondition"; // 未转换（any-shim）
import * as DestroyedOrCapturedConditionModule from "game/trigger/condition/DestroyedOrCapturedCondition"; // 未转换（any-shim）
import * as DestroyedOrCapturedOrInfiltratedConditionModule from "game/trigger/condition/DestroyedOrCapturedOrInfiltratedCondition"; // 未转换（any-shim）
import { DestroyedUnitsCondition } from "game/trigger/condition/DestroyedUnitsCondition"; // 孪生
import * as ElapsedScenarioTimeConditionModule from "game/trigger/condition/ElapsedScenarioTimeCondition"; // 未转换（any-shim）
import * as ElapsedTimeConditionModule from "game/trigger/condition/ElapsedTimeCondition"; // 未转换（any-shim）
import * as EnemyInZoneConditionModule from "game/trigger/condition/EnemyInZoneCondition"; // 未转换（any-shim）
import { EnteredByCondition } from "game/trigger/condition/EnteredByCondition"; // 孪生
import * as GlobalVariableConditionModule from "game/trigger/condition/GlobalVariableCondition"; // 未转换（any-shim）
import { HealthBelowAnyCondition } from "game/trigger/condition/HealthBelowAnyCondition"; // 孪生
import * as HealthBelowCombatConditionModule from "game/trigger/condition/HealthBelowCombatCondition"; // 未转换（any-shim）
import { LocalVariableCondition } from "game/trigger/condition/LocalVariableCondition"; // 孪生
import { LowPowerCondition } from "game/trigger/condition/LowPowerCondition"; // 孪生
import * as NoEventConditionModule from "game/trigger/condition/NoEventCondition"; // 未转换（any-shim）
import { NoFactoriesLeftCondition } from "game/trigger/condition/NoFactoriesLeftCondition"; // 孪生
import { PickupCrateAnyCondition } from "game/trigger/condition/PickupCrateAnyCondition"; // 孪生
import { PickupCrateCondition } from "game/trigger/condition/PickupCrateCondition"; // 孪生
import * as RandomDelayConditionModule from "game/trigger/condition/RandomDelayCondition"; // 未转换（any-shim）
import * as SpiedByConditionModule from "game/trigger/condition/SpiedByCondition"; // 未转换（any-shim）
import * as SpyEnteringAsHouseConditionModule from "game/trigger/condition/SpyEnteringAsHouseCondition"; // 未转换（any-shim）
import { SpyEnteringAsInfantryCondition } from "game/trigger/condition/SpyEnteringAsInfantryCondition"; // 孪生
import * as TechBuildingCapturedConditionModule from "game/trigger/condition/TechBuildingCapturedCondition"; // 未转换（any-shim）
import * as TimerExpiredConditionModule from "game/trigger/condition/TimerExpiredCondition"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 触发器条件工厂。 */
export class TriggerConditionFactory {
  /**
   * 按事件类型创建条件实例。
   *
   * @param event 触发器事件（含 type 与 params）。
   * @param trigger 所属触发器实例。
   * @returns 对应条件类实例；未知且非占位类型时抛 Error。
   */
  create(event: any, trigger: any): any {
    switch (event.type) {
      case TriggerEventType.NoEvent:
        return new (NoEventConditionModule as any).NoEventCondition(event, trigger);
      case TriggerEventType.EnteredBy:
        return new EnteredByCondition(event, trigger);
      case TriggerEventType.SpiedBy:
        return new (SpiedByConditionModule as any).SpiedByCondition(event, trigger);
      case TriggerEventType.AttackedByAny:
        return new (AttackedByAnyConditionModule as any).AttackedByAnyCondition(event, trigger);
      case TriggerEventType.DestroyedByAny:
        return new (DestroyedByAnyConditionModule as any).DestroyedByAnyCondition(event, trigger);
      case TriggerEventType.AnyEvent:
        return new AnyEventCondition(event, trigger);
      case TriggerEventType.DestroyedAllUnits:
        return new DestroyedAllUnitsCondition(event, trigger);
      case TriggerEventType.DestroyedAllBuildings:
        return new (DestroyedAllBuildingsConditionModule as any).DestroyedAllBuildingsCondition(event, trigger);
      case TriggerEventType.DestroyedAll:
        return new (DestroyedAllConditionModule as any).DestroyedAllCondition(event, trigger);
      case TriggerEventType.CreditsExceed:
        return new (CreditsExceedConditionModule as any).CreditsExceedCondition(event, trigger);
      case TriggerEventType.ElapsedTime:
        return new (ElapsedTimeConditionModule as any).ElapsedTimeCondition(event, trigger);
      case TriggerEventType.MissionTimerExpired:
        return new (TimerExpiredConditionModule as any).TimerExpiredCondition(event, trigger);
      case TriggerEventType.DestroyedBuildings:
        return new (DestroyedBuildingsConditionModule as any).DestroyedBuildingsCondition(event, trigger);
      case TriggerEventType.DestroyedUnits:
        return new DestroyedUnitsCondition(event, trigger);
      case TriggerEventType.NoFactoriesLeft:
        return new NoFactoriesLeftCondition(event, trigger);
      case TriggerEventType.BuildBuilding:
        return new BuildObjectTypeCondition(event, trigger, ObjectType.Building);
      case TriggerEventType.BuildUnit:
        return new BuildObjectTypeCondition(event, trigger, ObjectType.Vehicle);
      case TriggerEventType.BuildInfantry:
        return new BuildObjectTypeCondition(event, trigger, ObjectType.Infantry);
      case TriggerEventType.BuildAircraft:
        return new BuildObjectTypeCondition(event, trigger, ObjectType.Aircraft);
      case TriggerEventType.CrossesHorizontalLine:
        return new CrossHorizLineCondition(event, trigger);
      case TriggerEventType.CrossesVerticalLine:
        return new (CrossVertLineConditionModule as any).CrossVertLineCondition(event, trigger);
      case TriggerEventType.GlobalIsSet:
        return new (GlobalVariableConditionModule as any).GlobalVariableCondition(event, trigger, !0);
      case TriggerEventType.GlobalIsCleared:
        return new (GlobalVariableConditionModule as any).GlobalVariableCondition(event, trigger, !1);
      case TriggerEventType.DestroyedOrCaptured:
        return new (DestroyedOrCapturedConditionModule as any).DestroyedOrCapturedCondition(event, trigger);
      case TriggerEventType.LowPower:
        return new LowPowerCondition(event, trigger);
      case TriggerEventType.DestroyedBridge:
        return new (DestroyedBridgeConditionModule as any).DestroyedBridgeCondition(event, trigger);
      case TriggerEventType.BuildingExists:
        return new (BuildingExistsConditionModule as any).BuildingExistsCondition(event, trigger);
      case TriggerEventType.ComesNearWaypoint:
        return new (ComesNearWaypointConditionModule as any).ComesNearWaypointCondition(event, trigger);
      case TriggerEventType.LocalIsSet:
        return new LocalVariableCondition(event, trigger, !0);
      case TriggerEventType.LocalIsCleared:
        return new LocalVariableCondition(event, trigger, !1);
      case TriggerEventType.FirstDamagedCombat:
        return new (HealthBelowCombatConditionModule as any).HealthBelowCombatCondition(event, trigger, 100);
      case TriggerEventType.HalfHealthCombat:
        return new (HealthBelowCombatConditionModule as any).HealthBelowCombatCondition(event, trigger, 50);
      case TriggerEventType.QuarterHealthCombat:
        return new (HealthBelowCombatConditionModule as any).HealthBelowCombatCondition(event, trigger, 25);
      case TriggerEventType.FirstDamagedAny:
        return new HealthBelowAnyCondition(event, trigger, 100);
      case TriggerEventType.HalfHealthAny:
        return new HealthBelowAnyCondition(event, trigger, 50);
      case TriggerEventType.QuarterHealthAny:
        return new HealthBelowAnyCondition(event, trigger, 25);
      case TriggerEventType.AttackedByHouse:
        return new AttackedByHouseCondition(event, trigger);
      case TriggerEventType.AmbientLightBelow:
        return new (AmbientLightConditionModule as any).AmbientLightCondition(event, trigger, "below");
      case TriggerEventType.AmbientLightAbove:
        return new (AmbientLightConditionModule as any).AmbientLightCondition(event, trigger, "above");
      case TriggerEventType.ElapsedScenarioTime:
        return new (ElapsedScenarioTimeConditionModule as any).ElapsedScenarioTimeCondition(event, trigger);
      case TriggerEventType.DestroyedOrCapturedOrInfiltrated:
        return new (DestroyedOrCapturedOrInfiltratedConditionModule as any).DestroyedOrCapturedOrInfiltratedCondition(
          event,
          trigger,
        );
      case TriggerEventType.PickupCrate:
        return new PickupCrateCondition(event, trigger);
      case TriggerEventType.PickupCrateAny:
        return new PickupCrateAnyCondition(event, trigger);
      case TriggerEventType.RandomDelay:
        return new (RandomDelayConditionModule as any).RandomDelayCondition(event, trigger);
      case TriggerEventType.CreditsBelow:
        return new CreditsBelowCondition(event, trigger);
      case TriggerEventType.SpyEnteringAsHouse:
        return new (SpyEnteringAsHouseConditionModule as any).SpyEnteringAsHouseCondition(event, trigger);
      case TriggerEventType.SpyEnteringAsInfantry:
        return new SpyEnteringAsInfantryCondition(event, trigger);
      case TriggerEventType.DestroyedAllUnitsNaval:
        return new (DestroyedAllUnitsNavalConditionModule as any).DestroyedAllUnitsNavalCondition(event, trigger);
      case TriggerEventType.DestroyedAllUnitsLand:
        return new (DestroyedAllUnitsLandConditionModule as any).DestroyedAllUnitsLandCondition(event, trigger);
      case TriggerEventType.BuildingNotExists:
        return new (BuildingExistsConditionModule as any).BuildingExistsCondition(event, trigger, !0);
      // ========== YR 新增事件类型 ==========
      case TriggerEventType.EnemyInZone:
        return new (EnemyInZoneConditionModule as any).EnemyInZoneCondition(event, trigger);
      case TriggerEventType.TechBuildingCaptured:
        return new (TechBuildingCapturedConditionModule as any).TechBuildingCapturedCondition(event, trigger);
      default:
        // 已加入枚举但未实现的事件类型: 以 NoEventCondition 占位(永不触发,
        // 安全默认, 避免触发器开局误触发)。具体清单见 data/map/trigger/TriggerSupport。
        if ((TriggerSupportModule as any).TriggerSupport.placeholderEventTypes.has(event.type)) {
          return new (NoEventConditionModule as any).NoEventCondition(event, trigger);
        }
        throw new Error(`Unhandled trigger event type "${TriggerEventType[event.type]}"`);
    }
  }
}
