/**
 * EventMap — EventType → 事件载荷类型的纯类型映射。
 *
 * 由 game/event/EventMap.ts.js 重写为 TS：孪生的 execute 为空（编译后无任何
 * 运行时导出），本文件只导出类型（interface），避免产生意外运行时对象破坏
 * tests/ts-parity.mjs 的键集合比对。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 用途：给事件总线提供 EventMap[EventType.X] 形式的载荷类型推导。
 * 已核对构造字段的事件给出精确结构；尚未逐字节核对孪生的条目暂标 any，
 * 待对应事件类迁入 .ts 后再收紧，避免编造错误字段名。
 *
 * 注：类型-only，建议探针为 ns 键集合（应为空）。
 */
import { EventType } from "game/event/EventType"; // 孪生

export interface EventMap {
  [EventType.Cheer]: any;
  [EventType.UnitDeployUndeploy]: {
    unit: any;
    deployType: any;
    type: number;
  };
  [EventType.WeaponFire]: { weapon: any; gameObject: any; type: number };
  [EventType.ObjectDestroy]: any;
  [EventType.ObjectSpawn]: { gameObject: any; type: number };
  [EventType.ObjectUnspawn]: any;
  [EventType.ObjectMorph]: { from: any; to: any; type: number };
  [EventType.ObjectLiftOff]: any;
  [EventType.ObjectLand]: any;
  [EventType.ObjectCrashing]: { gameObject: any; type: number };
  [EventType.ObjectDisguiseChange]: { target: any; type: number };
  [EventType.ObjectCloakChange]: { target: any; type: number };
  [EventType.ObjectAttacked]: any;
  [EventType.ShipSubmergeChange]: any;
  [EventType.BridgeRepair]: any;
  [EventType.BuildStatusChange]: { target: any; status: number; type: number };
  [EventType.BuildingPlace]: any;
  [EventType.BuildingFailedPlace]: any;
  [EventType.ObjectSell]: any;
  [EventType.BuildingRepairFull]: { target: any; source: any; type: number };
  [EventType.BuildingCapture]: { target: any; type: number };
  [EventType.BuildingInfiltration]: { target: any; source: any; type: number };
  [EventType.BuildingGarrison]: { target: any; type: number };
  [EventType.BuildingEvacuate]: { target: any; player: any; type: number };
  [EventType.BuildingRepairStart]: { target: any; type: number };
  [EventType.UnitRepairStart]: any;
  [EventType.UnitRepairFinish]: { target: any; from: any; type: number };
  [EventType.UnitRecycle]: any;
  [EventType.InflictDamage]: any;
  [EventType.HealthChange]: {
    target: any;
    currentHealth: number;
    prevHealth: number;
    type: number;
  };
  [EventType.WarheadDetonate]: {
    target: any;
    position: any;
    explodeAnim: any;
    isLightningStrike: boolean;
    type: number;
  };
  [EventType.PlayerDefeated]: { target: any; type: number };
  [EventType.PlayerResigned]: any;
  [EventType.PlayerDropped]: any;
  [EventType.DeployNotAllowed]: any;
  [EventType.PowerChange]: {
    target: any;
    power: number;
    drain: number;
    type: number;
  };
  [EventType.PowerLow]: any;
  [EventType.PowerRestore]: { target: any; type: number };
  [EventType.RadarOnOff]: any;
  [EventType.ObjectOwnerChange]: any;
  [EventType.RadarEvent]: any;
  [EventType.InsufficientFunds]: any;
  [EventType.RallyPointChange]: { target: any; type: number };
  [EventType.PrimaryFactoryChange]: { target: any; type: number };
  [EventType.FactoryProduceUnit]: { target: any; type: number };
  [EventType.ObjectTeleport]: {
    target: any;
    isChronoshift: boolean;
    prevTile: any;
    type: number;
  };
  [EventType.AllianceChange]: any;
  [EventType.UnitPromote]: any;
  [EventType.EnterTransport]: any;
  [EventType.LeaveTransport]: { target: any; type: number };
  [EventType.EnterObject]: { target: any; source: any; type: number };
  [EventType.EnterTile]: any;
  [EventType.SuperWeaponReady]: { target: any; type: number };
  [EventType.SuperWeaponActivate]: any;
  [EventType.LightningStormManifest]: any;
  [EventType.LightningStormCloud]: { position: any; type: number };
  [EventType.CratePickup]: any;
  [EventType.PingLocation]: any;
  [EventType.StalemateDetect]: { type: number };
  [EventType.TriggerSoundFx]: { soundId: any; tile: any; type: number };
  [EventType.TriggerStopSoundFx]: any;
  [EventType.TriggerEva]: any;
  [EventType.TriggerAnim]: any;
  [EventType.TriggerText]: any;
  [EventType.TimerExpire]: { target: any; type: number };
  /** 无独立事件类：由 RobotControlTrait 直接派发。 */
  [EventType.RobotPowerStateChange]: any;
  [EventType.VirusCloud]: {
    action: any;
    cloudId: any;
    tile: any;
    lifetimeTicks: number;
    position: any;
    visual: any;
    vel: any;
    type: number;
  };
}
