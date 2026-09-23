/**
 * PreferredHostOpts — 大厅房主偏好选项（序列化/反序列化）。
 *
 * 分号分隔 15 段；unserialize 对后 4 段有默认值（destroyableBridges="1"、
 * instantCapture="1"、delayedOils="0"，multiEngineer 无默认）。
 * applyMpDialogSettings 中 gameSpeed = 6 - settings.gameSpeed。
 *
 * 由 gui/screen/mainMenu/lobby/PreferredHostOpts.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
export class PreferredHostOpts {
  /** 游戏速度。 */
  gameSpeed = 6;
  /** 初始资金。 */
  credits = 1e4;
  /** 单位数。 */
  unitCount = 10;
  /** 快速游戏。 */
  shortGame = true;
  /** 超级武器。 */
  superWeapons = false;
  /** 盟友建造。 */
  buildOffAlly = true;
  /** MCV 重组。 */
  mcvRepacks = true;
  /** 出现宝箱。 */
  cratesAppear = false;
  /** 主机分队。 */
  hostTeams = false;
  /** 可摧毁桥梁。 */
  destroyableBridges = true;
  /** 多工程师。 */
  multiEngineer = false;
  /** 禁狗杀工程师。 */
  noDogEngiKills = false;
  /** 立即占领。 */
  instantCapture = true;
  /** 延迟油井。 */
  delayedOils = false;
  /** 关闭的槽位索引。 */
  slotsClosed = new Set<number>();

  /** 序列化为分号串。 */
  serialize(): string {
    return [
      this.gameSpeed,
      this.credits,
      this.unitCount,
      Number(this.shortGame),
      Number(this.superWeapons),
      Number(this.buildOffAlly),
      Number(this.mcvRepacks),
      Number(this.cratesAppear),
      [...this.slotsClosed].join(","),
      Number(this.hostTeams),
      Number(this.destroyableBridges),
      Number(this.multiEngineer),
      Number(this.noDogEngiKills),
      Number(this.instantCapture),
      Number(this.delayedOils),
    ].join(";");
  }

  /** 从分号串恢复（含默认段）。 */
  unserialize(str: string): this {
    let [
      gameSpeed,
      credits,
      unitCount,
      shortGame,
      superWeapons,
      buildOffAlly,
      mcvRepacks,
      cratesAppear,
      slotsClosed,
      hostTeams,
      destroyableBridges = "1",
      multiEngineer,
      noDogEngiKills,
      instantCapture = "1",
      delayedOils = "0",
    ] = str.split(";");
    this.gameSpeed = Number(gameSpeed);
    this.credits = Number(credits);
    this.unitCount = Number(unitCount);
    this.shortGame = Boolean(Number(shortGame));
    this.superWeapons = Boolean(Number(superWeapons));
    this.buildOffAlly = Boolean(Number(buildOffAlly));
    this.mcvRepacks = Boolean(Number(mcvRepacks));
    this.cratesAppear = Boolean(Number(cratesAppear));
    this.hostTeams = Boolean(Number(hostTeams));
    this.destroyableBridges = Boolean(Number(destroyableBridges));
    this.multiEngineer = Boolean(Number(multiEngineer));
    this.noDogEngiKills = Boolean(Number(noDogEngiKills));
    this.instantCapture = Boolean(Number(instantCapture));
    this.delayedOils = Boolean(Number(delayedOils));
    this.slotsClosed = new Set(
      slotsClosed ? slotsClosed.split(",").map((n) => Number(n)) : [],
    );
    return this;
  }

  /** 从 GameOpts 字段拷贝。 */
  applyGameOpts(opts: any): this {
    this.gameSpeed = opts.gameSpeed;
    this.credits = opts.credits;
    this.unitCount = opts.unitCount;
    this.shortGame = opts.shortGame;
    this.superWeapons = opts.superWeapons;
    this.buildOffAlly = opts.buildOffAlly;
    this.mcvRepacks = opts.mcvRepacks;
    this.cratesAppear = opts.cratesAppear;
    this.hostTeams = !!opts.hostTeams;
    this.destroyableBridges = opts.destroyableBridges;
    this.multiEngineer = opts.multiEngineer;
    this.noDogEngiKills = opts.noDogEngiKills;
    this.instantCapture = opts.instantCapture;
    this.delayedOils = opts.delayedOils;
    return this;
  }

  /** 从 MP 对话框设置拷贝（gameSpeed 反转）。 */
  applyMpDialogSettings(settings: any): this {
    this.gameSpeed = 6 - settings.gameSpeed;
    this.credits = settings.money;
    this.unitCount = settings.unitCount;
    this.shortGame = settings.shortGame;
    this.mcvRepacks = settings.mcvRedeploys;
    this.cratesAppear = settings.crates;
    this.superWeapons = settings.superWeapons;
    this.destroyableBridges = settings.bridgeDestruction;
    this.multiEngineer = settings.multiEngineer;
    return this;
  }
}
