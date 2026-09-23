/**
 * ScreenType — 主菜单内部屏幕类型枚举。
 *
 * Home=0 … Extensions=22，共 23 项；数值与反向映射与孪生一致。
 *
 * 由 gui/screen/mainMenu/ScreenType.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum ScreenType {
  /** 主页。 */
  Home = 0,
  /** 遭遇战。 */
  Skirmish = 1,
  /** 快速游戏。 */
  QuickGame = 2,
  /** 自定义游戏浏览。 */
  CustomGame = 3,
  /** 登录。 */
  Login = 4,
  /** 创建账号。 */
  NewAccount = 5,
  /** 大厅。 */
  Lobby = 6,
  /** 地图选择。 */
  MapSelection = 7,
  /** 天梯。 */
  Ladder = 8,
  /** 天梯规则。 */
  LadderRules = 9,
  /** 回放选择。 */
  ReplaySelection = 10,
  /** 模组选择。 */
  ModSelection = 11,
  /** 战绩/得分。 */
  Score = 12,
  /** 信息与制作人员。 */
  InfoAndCredits = 13,
  /** 更新日志。 */
  PatchNotes = 14,
  /** 制作人员滚动屏。 */
  Credits = 15,
  /** 选项（图形）。 */
  Options = 16,
  /** 选项-声音。 */
  OptionsSound = 17,
  /** 选项-键盘。 */
  OptionsKeyboard = 18,
  /** 选项-存储。 */
  OptionsStorage = 19,
  /** 单人入口。 */
  SinglePlayer = 20,
  /** 战役。 */
  Campaign = 21,
  /** 扩展/模组管理入口。 */
  Extensions = 22,
}
