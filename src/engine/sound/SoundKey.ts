/**
 * SoundKey — 全局音效键枚举（sound.ini / rules 中的命名标识）。
 *
 * 数值为内部序号；Sound.getSoundKey 会用「键名字符串」去 audioVisualRules
 * 的 INI 里查真实文件名。请勿重排或重编号 —— 与 .ts.js 孪生逐值一致。
 *
 * 由 engine/sound/SoundKey.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum SoundKey {
  /** 训练步兵完成音。 */
  CreateInfantrySound = 0,
  /** 建造载具完成音。 */
  CreateUnitSound = 1,
  /** 建造飞行器完成音。 */
  CreateAircraftSound = 2,
  /** 间谍卫星激活音。 */
  SpySatActivationSound = 3,
  /** 间谍卫星关闭音。 */
  SpySatDeactivationSound = 4,
  /** 单位晋升为老兵音。 */
  UpgradeVeteranSound = 5,
  /** 单位晋升为精英音。 */
  UpgradeEliteSound = 6,
  /** 基地遭受攻击警报音。 */
  BaseUnderAttackSound = 7,
  /** 建筑驻军音。 */
  BuildingGarrisonedSound = 8,
  /** 建筑修复完成音。 */
  BuildingRepairedSound = 9,
  /** 欢呼声。 */
  CheerSound = 10,
  /** 放置信标音。 */
  PlaceBeaconSound = 11,
  /** 进入规划模式音。 */
  StartPlanningModeSound = 12,
  /** 退出规划模式音。 */
  EndPlanningModeSound = 13,
  /** 规划模式追加指令音。 */
  AddPlanningModeCommandSound = 14,
  /** 执行计划音。 */
  ExecutePlanSound = 15,
  /** 箱子：晋升音。 */
  CratePromoteSound = 16,
  /** 箱子：金钱音。 */
  CrateMoneySound = 17,
  /** 箱子：开图音。 */
  CrateRevealSound = 18,
  /** 箱子：火焰音。 */
  CrateFireSound = 19,
  /** 箱子：装甲音。 */
  CrateArmourSound = 20,
  /** 箱子：速度音。 */
  CrateSpeedSound = 21,
  /** 箱子：送单位音。 */
  CrateUnitSound = 22,
  /** GUI 主按钮点击音。 */
  GUIMainButtonSound = 23,
  /** GUI 建造音。 */
  GUIBuildSound = 24,
  /** GUI 标签切换音。 */
  GUITabSound = 25,
  /** GUI 打开音。 */
  GUIOpenSound = 26,
  /** GUI 关闭音。 */
  GUICloseSound = 27,
  /** GUI 滑出音。 */
  GUIMoveOutSound = 28,
  /** GUI 滑入音。 */
  GUIMoveInSound = 29,
  /** GUI 下拉展开音。 */
  GUIComboOpenSound = 30,
  /** GUI 下拉收起音。 */
  GUIComboCloseSound = 31,
  /** GUI 复选框音。 */
  GUICheckboxSound = 32,
  /** 结算画面动画音。 */
  ScoreAnimSound = 33,
  /** 舰船沉没音。 */
  SinkingSound = 34,
  /** 落水音。 */
  ImpactWaterSound = 35,
  /** 落地音。 */
  ImpactLandSound = 36,
  /** 炸弹滴答音。 */
  BombTickingSound = 37,
  /** 超时空传送进入音。 */
  ChronoInSound = 38,
  /** 超时空传送离开音。 */
  ChronoOutSound = 39,
  /** 炸弹附着音。 */
  BombAttachSound = 40,
  /** 尤里心灵控制音。 */
  YuriMindControlSound = 41,
  /** 挖掘音。 */
  DigSound = 42,
  /** 隐形激活音。 */
  CloakSound = 43,
  /** 出售建筑音。 */
  SellSound = 44,
  /** 对局结束音。 */
  GameClosed = 45,
  /** 收到消息音。 */
  IncomingMessage = 46,
  /** 消息逐字输入音。 */
  MessageCharTyped = 47,
  /** 系统错误音。 */
  SystemError = 48,
  /** 选项变更音。 */
  OptionsChanged = 49,
  /** 对局创建中音。 */
  GameForming = 50,
  /** 玩家离开音。 */
  PlayerLeft = 51,
  /** 玩家加入音。 */
  PlayerJoined = 52,
  /** 建造进行中音。 */
  Construction = 53,
  /** 建筑被摧毁音。 */
  BuildingDieSound = 54,
  /** 建筑落地重击音。 */
  BuildingSlam = 55,
  /** 雷达开启音。 */
  RadarOn = 56,
  /** 雷达关闭音。 */
  RadarOff = 57,
  /** 过场电影开启音。 */
  MovieOn = 58,
  /** 过场电影关闭音。 */
  MovieOff = 59,
  /** 警告/呵斥音。 */
  ScoldSound = 60,
  /** 磁暴线圈充能音。 */
  TeslaCharge = 61,
  /** 磁暴电击音。 */
  TeslaZap = 62,
  /** 建筑受损音。 */
  BuildingDamageSound = 63,
  /** 降落伞音。 */
  ChuteSound = 64,
  /** 通用点击音。 */
  GenericClick = 65,
  /** 通用哔声。 */
  GenericBeep = 66,
  /** 建筑坠落音。 */
  BuildingDrop = 67,
  /** 停止指令音。 */
  StopSound = 68,
  /** 警戒指令音。 */
  GuardSound = 69,
  /** 散开指令音。 */
  ScatterSound = 70,
  /** 展开/部署音。 */
  DeploySound = 71,
  /** 风暴音。 */
  StormSound = 72,
  /** 闪电音组。 */
  LightningSounds = 73,
  /** 面板按钮滑动音。 */
  ShellButtonSlideSound = 74,
  /** 快速匹配倒计时音。 */
  QuickMatchTimer = 75,
  /** 组队邀请音。 */
  PartyInvite = 76,
  /** 组队成立音。 */
  PartyFormed = 77,
  /** 进入生化反应炉音。 */
  EnterBioReactorSound = 78,
  /** 离开生化反应炉音。 */
  LeaveBioReactorSound = 79,
}
