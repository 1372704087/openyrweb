/**
 * EventType — 游戏事件类型枚举（事件总线载荷的判别字段）。
 *
 * 由 game/event/EventType.ts.js 重写为 TS（行为完全一致），枚举项脚本提取自
 * 原文件。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 *
 * 配套约定
 * - 每个成员对应一个事件类 game/event/<Name>Event（唯一例外是
 *   RobotPowerStateChange，它由 game/gameobject/trait/RobotControlTrait 直接派发）。
 * - 载荷类型的映射见 game/event/EventMap —— 那是纯类型模块，编译后为空，
 *   只用于给事件总线提供类型推导。
 * - 主要消费方：gui/screen/game/SoundHandler（音效与 EVA 播报）、
 *   engine/renderable/fx/handler/*FxHandler（视觉特效）、
 *   game/trigger/condition/*Condition（地图触发器条件）。
 *
 * 数值稳定性
 * - 这些数值只是内部序号，**不参与**网络与回放序列化 —— 回放走的是
 *   network/gamestate/replay/ReplayEventType，是另一套独立枚举。
 * - 但仍请勿重排或重编号：tsc 的 enum 反向映射按成员顺序生成，本枚举需与其
 *   .ts.js 孪生逐值一致（tests/ts-parity.mjs 会校验代表值与键数量）。
 */
export enum EventType {
  /** 欢呼：单位/建筑被下达欢呼指令时，用于播放欢呼动画与音效。 */
  Cheer = 0,
  /** 展开/收起：如基地车展开为建筑、坦克架设、气垫船登陆态切换。 */
  UnitDeployUndeploy = 1,
  /** 武器开火：一次射击已发生（弹丸生成、枪口特效与开火音效的触发点）。 */
  WeaponFire = 2,
  /** 对象被摧毁：对象退出世界且视为死亡（ChronoFxHandler 等据此播放残留特效）。 */
  ObjectDestroy = 3,
  /** 对象生成：新对象加入世界（开局部署、空投、生产完成出场）。 */
  ObjectSpawn = 4,
  /** 对象退场：离开世界但不计为"被摧毁"（回收、超时空消失等）。 */
  ObjectUnspawn = 5,
  /** 对象变形：如恐怖机器人被寄生后变形、单位升级换模型。 */
  ObjectMorph = 6,
  /** 飞行器起飞。 */
  ObjectLiftOff = 7,
  /** 飞行器着陆。 */
  ObjectLand = 8,
  /** 飞行器坠毁。 */
  ObjectCrashing = 9,
  /** 伪装变更：间谍/幻影坦克伪装成敌方对象，或伪装被解除（Minimap 据此刷新显示）。 */
  ObjectDisguiseChange = 10,
  /** 隐形状态变更：进入或解除隐形（含探测与雷达表现）。 */
  ObjectCloakChange = 11,
  /** 对象遭到攻击（区别于受伤害：供"被攻击"类触发器与警报使用）。 */
  ObjectAttacked = 12,
  /** 潜艇下潜/上浮状态变更。 */
  ShipSubmergeChange = 13,
  /** 桥梁被修复（与桥梁被摧毁相对）。 */
  BridgeRepair = 14,
  /** 建造状态变化：生产队列推进、暂停、完成等，驱动侧边栏进度条。 */
  BuildStatusChange = 15,
  /** 建筑放置成功。 */
  BuildingPlace = 16,
  /** 建筑放置失败：位置非法或被阻挡（PendingPlacementHandler 据此提示玩家）。 */
  BuildingFailedPlace = 17,
  /** 对象被出售（卖出建筑返还资金）。 */
  ObjectSell = 18,
  /** 建筑被修复至满血。 */
  BuildingRepairFull = 19,
  /** 建筑被占领（工程师进驻等）。 */
  BuildingCapture = 20,
  /** 建筑被渗透（间谍进入窃取情报、断电、偷科技等）。 */
  BuildingInfiltration = 21,
  /** 建筑被进驻（步兵入驻民用建筑）。 */
  BuildingGarrison = 22,
  /** 建筑被撤离（驻军撤出）。 */
  BuildingEvacuate = 23,
  /** 建筑开始修复（进入修复状态）。 */
  BuildingRepairStart = 24,
  /** 单位开始修复（进入维修厂或工程车开始修理）。 */
  UnitRepairStart = 25,
  /** 单位修复完成。 */
  UnitRepairFinish = 26,
  /** 单位被回收（在工厂中回收并返还部分资金）。 */
  UnitRecycle = 27,
  /** 施加伤害：一次伤害结算发生（ParasiteSparkFxHandler 据此播放寄生电火花）。 */
  InflictDamage = 28,
  /** 生命值变化（HealthBelowAnyCondition 据此判定触发器）。 */
  HealthChange = 29,
  /** 弹头引爆：爆炸特效与音效的触发点（WarheadDetonateFxHandler 消费）。 */
  WarheadDetonate = 30,
  /** 玩家被击败（资产全损或被判定出局）。 */
  PlayerDefeated = 31,
  /** 玩家主动投降。 */
  PlayerResigned = 32,
  /** 玩家掉线/断开连接。 */
  PlayerDropped = 33,
  /** 展开被拒绝：单位当前条件不允许展开。 */
  DeployNotAllowed = 34,
  /** 电力产量或消耗发生变化（CombatantUi、ObserverUi 据此更新电力条）。 */
  PowerChange = 35,
  /** 电力不足：进入低电力状态，影响建造速度与部分功能。 */
  PowerLow = 36,
  /** 电力恢复（脱离低电力状态）。 */
  PowerRestore = 37,
  /** 雷达开关：本玩家雷达上线或离线。 */
  RadarOnOff = 38,
  /** 对象归属变更（EventsApi 对外暴露，需同步给观战者）。 */
  ObjectOwnerChange = 39,
  /** 雷达事件：小地图上的脉冲提示（遭攻击、建筑被摧毁等）。 */
  RadarEvent = 40,
  /** 资金不足：下达了买不起的订单。 */
  InsufficientFunds = 41,
  /** 集结点变更。 */
  RallyPointChange = 42,
  /** 主工厂变更：决定新生产的单位从哪个工厂出场。 */
  PrimaryFactoryChange = 43,
  /** 工厂产出一个单位（LastRadarEventCmd 据此定位最近的生产事件）。 */
  FactoryProduceUnit = 44,
  /** 对象被超时空传送（ChronoFxHandler 消费，负责传送前后特效）。 */
  ObjectTeleport = 45,
  /** 同盟关系变更。 */
  AllianceChange = 46,
  /** 单位升级（老兵 → 精英）。 */
  UnitPromote = 47,
  /** 单位进入运输载具。 */
  EnterTransport = 48,
  /** 单位离开运输载具。 */
  LeaveTransport = 49,
  /** 单位进入另一个对象（进驻建筑、进维修厂等；EnteredByCondition 消费）。 */
  EnterObject = 50,
  /** 对象进入某地块（ComesNearWaypoint / CrossHorizLine / CrossVertLine / EnteredByCondition 等触发器条件消费）。 */
  EnterTile = 51,
  /** 超级武器充能完毕，可以使用。 */
  SuperWeaponReady = 52,
  /** 超级武器发动（SuperWeaponFxHandler 消费）。 */
  SuperWeaponActivate = 53,
  /** 闪电风暴显形（预警阶段）。 */
  LightningStormManifest = 54,
  /** 闪电风暴云（落雷阶段，SuperWeaponFxHandler 消费）。 */
  LightningStormCloud = 55,
  /** 拾取补给箱（CrateFxHandler 消费，负责拾取特效）。 */
  CratePickup = 56,
  /** 地图标记/示警（BeaconFxHandler 绘制信标，LastRadarEventCmd 可回溯）。 */
  PingLocation = 57,
  /** 检测到僵局：多人长时间无交战时触发判定。 */
  StalemateDetect = 58,
  /** 触发器动作：播放音效。 */
  TriggerSoundFx = 59,
  /** 触发器动作：停止指定音效。 */
  TriggerStopSoundFx = 60,
  /** 触发器动作：播放 EVA 语音播报。 */
  TriggerEva = 61,
  /** 触发器动作：播放动画（TriggerActionFxHandler 消费）。 */
  TriggerAnim = 62,
  /** 触发器动作：显示文本。 */
  TriggerText = 63,
  /** 倒计时到期（TimerExpiredCondition 与 TimerExpireEvent 消费）。 */
  TimerExpire = 64,
  /** 遥控坦克（Robot Tank）的电力/连接状态变化；由 RobotControlTrait 直接派发，无独立事件类。 */
  RobotPowerStateChange = 65,
  /** OpenYRWeb: 病毒狙击手毒雾生命周期事件，引擎侧 VirusCloudFxHandler 消费并渲染绿色毒雾。 */
  VirusCloud = 66,
}
