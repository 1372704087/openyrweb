/**
 * ExtensionHost — 源码扩展的注册表、依赖解析与钩子派发中枢。
 *
 * 用法：
 *  1. Application 启动时 ExtensionConfig.fromJson + bindConfig()；
 *  2. Rules.init() 开头 applyToRules(ini)，按总开关/依赖/优先级改写 INI；
 *  3. 对局开始后 attachToGame(game)，运行时钩子按序派发；
 *  4. 扩展页 ExtensionsScreen 读写同一 ExtensionConfig 实例并写入 LocalPrefs。
 *
 * 依赖与优先级（YRpp 对齐）：
 *  - dependsOn 声明硬依赖；依赖缺失或未启用的扩展整体跳过；
 *  - 拓扑排序保证依赖方先于被依赖方执行（Ares → Phobos）；
 *  - 同拓扑层内按 priority 升序（数值小的先执行）。
 *
 * 钩子派发：
 *  - applyToRules：init 期一次，改写 rules INI；
 *  - onMatchStart / onTick / onObjectSpawn / …：对局期间由 attachToGame
 *    订阅 Game 生命周期与事件后自动派发；
 *  - onTick 是热路径——仅当至少一个扩展声明了 onTick 才遍历。
 */
import { ExtensionDefinition } from "extensions/ExtensionDefinition";
import { ExtensionConfig } from "extensions/ExtensionConfig";
import { aresExtension } from "extensions/ares/AresExtension";
import { phobosExtension } from "extensions/phobos/PhobosExtension";
import { npextExtension } from "extensions/npext/NPextExtension";
import { placeExExtension } from "extensions/placeex/PlaceExExtension";
import { autoLoadExtension } from "extensions/autoload/AutoLoadExtension";
import {
  createHookContext,
  ExtensionHookContext,
} from "extensions/ExtensionContext";
import { ExtensionEventBus } from "extensions/ExtensionEventBus";
import {
  ExtensionRuntimeHooks,
  RuntimeHookName,
} from "extensions/ExtensionHooks";
// 扩展声明的键位命令要出现在「键盘设置」界面，就得写进这张表。
// 该模块只依赖 KeyCommandType（叶子模块），因此不会形成循环依赖。
// 该模块尚未转 TS（只有孪生 .ts.js），走 gui/* 通配 shim（export = any）：
// 具名导入会被 tsc 拒绝（TS2305），故用命名空间导入后取成员属性。
import * as configurableCmdsModule from "gui/screen/options/component/configurableCmds";

/* eslint-disable @typescript-eslint/no-explicit-any */

const DEFAULT_PRIORITY = 100;

export class ExtensionHost {
  private static readonly registry = new Map<string, ExtensionDefinition>();
  private static config: ExtensionConfig | null = null;
  private static registered = false;

  /** 按依赖+优先级排序后的启用扩展列表（缓存，注册/配置变更时失效）。 */
  private static sortedCache: ExtensionDefinition[] | null = null;

  /** 扩展级事件总线（跨对局存活）。 */
  static readonly events = new ExtensionEventBus();

  /** 当前附着的对局；null 表示不在对局中。 */
  private static currentGame: any = null;
  private static detachGameFn: (() => void) | null = null;

  /**
   * 扩展键位命令的处理函数表（命令 id → handler）。
   * 以 globalThis.__openyrweb_keyCommandHandlers 暴露给 GUI：每局的 KeyboardHandler 在
   * 构造时拉取一次并注册进自己（见 registerKeyCommand 的说明）。
   * 局内有效：attachToGame 会先清空，由 onMatchStart 用**本局**的 game 闭包重新登记。
   */
  private static readonly keyCommandHandlers = new Map<string, () => void>();

  // ------------------------------------------------------------------
  // 注册
  // ------------------------------------------------------------------

  static registerBuiltins(): void {
    if (ExtensionHost.registered) return;
    ExtensionHost.register(aresExtension);
    ExtensionHost.register(phobosExtension);
    ExtensionHost.register(npextExtension);
    ExtensionHost.register(placeExExtension);
    ExtensionHost.register(autoLoadExtension);
    ExtensionHost.registered = true;
  }

  static register(ext: ExtensionDefinition): void {
    ExtensionHost.registry.set(ext.id, ext);
    ExtensionHost.sortedCache = null;
  }

  static getRegistered(): ExtensionDefinition[] {
    ExtensionHost.registerBuiltins();
    return [...ExtensionHost.registry.values()];
  }

  static getDefinition(id: string): ExtensionDefinition | undefined {
    ExtensionHost.registerBuiltins();
    return ExtensionHost.registry.get(id);
  }

  // ------------------------------------------------------------------
  // 配置
  // ------------------------------------------------------------------

  /** 绑定运行时配置（同一实例，界面改动立即对后续新开局生效）。 */
  static bindConfig(config: ExtensionConfig | null): void {
    ExtensionHost.config = config;
    ExtensionHost.sortedCache = null;
  }

  static getConfig(): ExtensionConfig {
    ExtensionHost.registerBuiltins();
    if (!ExtensionHost.config) {
      ExtensionHost.config = ExtensionConfig.createDefault(ExtensionHost.getRegistered());
    }
    return ExtensionHost.config;
  }

  /** 按当前配置创建默认实例（Application 启动时用）。 */
  static createConfigFromStorage(json: string | undefined | null): ExtensionConfig {
    ExtensionHost.registerBuiltins();
    const config = ExtensionConfig.fromJson(json, ExtensionHost.getRegistered());
    ExtensionHost.config = config;
    ExtensionHost.sortedCache = null;
    // 把扩展声明的键位命令注入游戏（「键盘设置」界面条目 + 默认键位）。
    ExtensionHost.applyExtensionKeyCommands();
    return config;
  }

  static isEnabled(id: string): boolean {
    return !!ExtensionHost.getConfig()?.getMaster(id);
  }

  static isFeatureEnabled(extId: string, featureId: string): boolean {
    return !!ExtensionHost.getConfig()?.isFeatureEnabled(extId, featureId);
  }

  // ------------------------------------------------------------------
  // 依赖解析与排序
  // ------------------------------------------------------------------

  /**
   * 返回按「依赖拓扑 + priority」排序后的启用扩展列表。
   * 依赖缺失/未启用的扩展被剔除（不执行任何钩子）。
   */
  static getActiveSorted(): ExtensionDefinition[] {
    ExtensionHost.registerBuiltins();
    if (ExtensionHost.sortedCache) return ExtensionHost.sortedCache;

    const config = ExtensionHost.getConfig();
    const all = ExtensionHost.getRegistered();
    const byId = new Map(all.map((e) => [e.id, e]));

    // 1. 过滤：总开关开启 + 依赖全部存在且开启
    const enabled: ExtensionDefinition[] = [];
    for (const ext of all) {
      if (!config.getMaster(ext.id)) continue;
      const deps = ext.dependsOn || [];
      const depsOk = deps.every((depId) => {
        const dep = byId.get(depId);
        return !!dep && config.getMaster(depId);
      });
      if (!depsOk) {
        console.warn(
          `[ExtensionHost] Skip "${ext.id}": missing or disabled dependency (${deps.join(", ") || "none"})`,
        );
        continue;
      }
      enabled.push(ext);
    }

    // 2. 拓扑排序（Kahn）：被依赖方（dependsOn 目标）先出队
    const enabledIds = new Set(enabled.map((e) => e.id));
    const indegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();
    for (const ext of enabled) {
      indegree.set(ext.id, 0);
      dependents.set(ext.id, []);
    }
    for (const ext of enabled) {
      for (const depId of ext.dependsOn || []) {
        if (!enabledIds.has(depId)) continue;
        indegree.set(ext.id, (indegree.get(ext.id) || 0) + 1);
        dependents.get(depId)!.push(ext.id);
      }
    }

    const priorityOf = (id: string) => byId.get(id)?.priority ?? DEFAULT_PRIORITY;
    const ready: string[] = enabled
      .filter((e) => (indegree.get(e.id) || 0) === 0)
      .map((e) => e.id);
    const sorted: ExtensionDefinition[] = [];
    while (ready.length > 0) {
      ready.sort((a, b) => priorityOf(a) - priorityOf(b) || a.localeCompare(b));
      const id = ready.shift()!;
      const ext = byId.get(id);
      if (ext) sorted.push(ext);
      for (const dep of dependents.get(id) || []) {
        const d = (indegree.get(dep) || 0) - 1;
        indegree.set(dep, d);
        if (d === 0) ready.push(dep);
      }
    }

    // 3. 环检测（理论上不该出现；出现则按 priority 追加剩余）
    if (sorted.length < enabled.length) {
      const remaining = enabled.filter((e) => !sorted.includes(e));
      console.warn(
        `[ExtensionHost] Dependency cycle detected among: ${remaining.map((e) => e.id).join(", ")}`,
      );
      remaining.sort(
        (a, b) => (a.priority ?? DEFAULT_PRIORITY) - (b.priority ?? DEFAULT_PRIORITY),
      );
      sorted.push(...remaining);
    }

    ExtensionHost.sortedCache = sorted;
    return sorted;
  }

  // ------------------------------------------------------------------
  // 数据钩子：applyToRules
  // ------------------------------------------------------------------

  /**
   * 对 rules INI 应用所有「总开关开启且依赖满足」的扩展。
   * Rules.init 在读取任何段之前调用。
   */
  static applyToRules(ini: any): void {
    const active = ExtensionHost.getActiveSorted();
    const config = ExtensionHost.getConfig();
    for (const ext of active) {
      const hook = ext.hooks?.applyToRules;
      if (!hook) continue;
      try {
        // rules 阶段 GUI 尚未就绪，键位命令注册器为 undefined。
        const ctx = createHookContext(ext.id, config, ini, null);
        hook(ctx);
      } catch (err) {
        console.warn(`Extension "${ext.id}" applyToRules failed`, err);
      }
    }
    // 内置扩展功能开关 → 引擎规则键注入：开关「开」= 读取(注入)该拓展
    // 自身对应的键；「关」= 不读取键，不写任何键，走默认引擎逻辑。
    // 总开关关闭的拓展同样不写键：
    //  - ares「AI克隆生产」开 → [GlobalControls] AllowParallelAIQueues=yes
    //  - npext「AI克隆生产」开 → [General] DisableParallelAIQueues=no
    //  - npext「AI超越上限生产」开 → EnableAIBuildLimitation=no
    // 引擎侧统一归一读取(FactoryTrait/Production)：注入的键生效时,
    // AI 多工厂并行生产逻辑被显式启用;未注入时即为默认引擎行为。
    if (ini?.getOrCreateSection) {
      const section = ini.getOrCreateSection("General");
      const globalControls = ini.getOrCreateSection("GlobalControls");
      if (config.getMaster("ares") && config.getFeatureRaw("ares", "aiCloneProduction"))
        globalControls.set("AllowParallelAIQueues", "yes");
      if (config.getMaster("npext")) {
        if (config.getFeatureRaw("npext", "aiCloneProduction"))
          section.set("DisableParallelAIQueues", "no");
        if (config.getFeatureRaw("npext", "aiOverLimitProduction"))
          section.set("EnableAIBuildLimitation", "no");
      }
    }
  }

  // ------------------------------------------------------------------
  // 运行时钩子：attach / detach / dispatch
  // ------------------------------------------------------------------

  /**
   * 附着到一局游戏：派发 onMatchStart，并订阅 Game 事件转发为运行时钩子。
   * 幂等：已在同一局上附着时无操作；不同局先 detach 旧局。
   */
  static attachToGame(game: any): void {
    if (ExtensionHost.currentGame === game) return;
    if (ExtensionHost.currentGame) ExtensionHost.detachFromGame();

    ExtensionHost.currentGame = game;
    // 清空上一局的键位命令登记：onMatchStart 会用**本局**的 game 重新登记
    // （否则上一局的 handler 闭包会跨局残留，且新旧 handler 会互相错位）。
    ExtensionHost.keyCommandHandlers.clear();
    const active = ExtensionHost.getActiveSorted();

    // onMatchStart
    ExtensionHost.safeCallHook("onMatchStart", active, {
      game,
      rulesIni: game?.rules?.getIni?.() ?? game?.rules?.ini ?? null,
    });

    // 订阅 Game 事件 → 运行时钩子
    const unsubs: Array<() => void> = [];
    const events = game?.events;
    if (events?.subscribe) {
      unsubs.push(
        events.subscribe((evt: any) => {
          if (!evt || typeof evt.type !== "number") return;
          // EventType 枚举值（与 game/event/EventType.ts 一致）
          switch (evt.type) {
            case 4: // ObjectSpawn
              ExtensionHost.safeCallHook("onObjectSpawn", active, {
                game,
                object: evt.target,
              });
              break;
            case 5: // ObjectUnspawn
            case 3: // ObjectDestroy
              ExtensionHost.safeCallHook("onObjectRemove", active, {
                game,
                object: evt.target,
              });
              break;
            case 44: // FactoryProduceUnit
              ExtensionHost.safeCallHook("onUnitProduce", active, {
                game,
                unit: evt.target,
              });
              break;
            case 30: // WarheadDetonate
              ExtensionHost.safeCallHook("onWarheadDetonate", active, {
                game,
                warhead: evt.warhead,
                target: evt.target,
                techno: evt.techno,
              });
              break;
          }
        }),
      );
    }

    // onEnd → onMatchEnd + detach
    if (game?.onEnd?.subscribe) {
      unsubs.push(
        game.onEnd.subscribe(() => {
          ExtensionHost.safeCallHook("onMatchEnd", active, { game });
          ExtensionHost.detachFromGame();
        }),
      );
    }

    // onTick：挂在 afterTick（每帧末尾），避免与对象 update 交错
    if (active.some((e) => e.hooks?.onTick) && typeof game?.afterTick === "function") {
      const rearm = () => {
        if (ExtensionHost.currentGame !== game) return;
        game.afterTick(() => {
          if (ExtensionHost.currentGame !== game) return;
          ExtensionHost.safeCallHook("onTick", active, {
            game,
            tick: game.currentTick ?? 0,
          });
          rearm();
        });
      };
      rearm();
    }

    ExtensionHost.detachGameFn = () => {
      for (const off of unsubs) {
        try {
          off();
        } catch {
          /* ignore */
        }
      }
    };
  }

  /** 从当前对局 detach（不派发 onMatchEnd——那是 end 事件的事）。 */
  static detachFromGame(): void {
    if (ExtensionHost.detachGameFn) {
      ExtensionHost.detachGameFn();
      ExtensionHost.detachGameFn = null;
    }
    ExtensionHost.currentGame = null;
  }

  /** 当前是否附着在对局上。 */
  static isAttached(): boolean {
    return ExtensionHost.currentGame != null;
  }

  /** 当前对局引用（未附着时 null）。 */
  static getGame(): any {
    return ExtensionHost.currentGame;
  }

  /**
   * 向所有启用扩展派发指定运行时钩子。
   * 扩展钩子抛错不影响其他扩展（隔离）。
   */
  static dispatchHook(name: RuntimeHookName, payload: Record<string, any>): void {
    const active = ExtensionHost.getActiveSorted();
    ExtensionHost.safeCallHook(name, active, payload);
  }

  // ------------------------------------------------------------------
  // 键盘命令注册（把扩展的自定义热键接入游戏的键位系统）
  // ------------------------------------------------------------------

  /**
   * 注册一个游戏键位命令（命令处理函数）。
   *
   * 桥接方式：GUI 层的 KeyboardHandler 把自己的注册器挂到
   * `globalThis.__openyrweb_keyCmdRegistrar`，同时把「命令处理函数表」以纯数据形式
   * 从 `globalThis.__openyrweb_keyCommandHandlers` **主动拉取** ——
   * **扩展宿主不反向依赖 GUI**，避免给这个已知存在循环依赖的代码库再加一条模块边。
   *
   * ⚠️ **每局必须重新登记**，且**以「拉」为准、不以「推」为准**：
   * registrar 是全局句柄，某个 KeyboardHandler 被 dispose 后它**不会被清理**；若只靠
   * 「推」并轮询，第二局开局时会把命令注册到上一局那个已废弃的 handler 上，
   * 本局的新 handler 反而是空的 ⇒ 不刷新页面就用不了扩展热键（实测复现）。
   * 所以这里只做两件事：登记进表 + 若 registrar 已就绪则顺手推一次（覆盖
   * 「GUI 早于 onMatchStart」的顺序），权威路径是 KeyboardHandler 构造时拉表。
   */
  static registerKeyCommand(command: any, handler: () => void): void {
    const cmd = String(command);
    ExtensionHost.keyCommandHandlers.set(cmd, handler);
    (globalThis as any).__openyrweb_keyCommandHandlers = ExtensionHost.keyCommandHandlers;

    const reg = (globalThis as any).__openyrweb_keyCmdRegistrar;
    if (typeof reg === "function") {
      try {
        reg(cmd, handler);
      } catch (err) {
        // 重复注册由 GUI 侧忽略；其余异常只记录，不影响本局其它命令。
        console.warn(`[ExtensionHost] registerKeyCommand("${cmd}") failed`, err);
      }
    }
  }

  // ------------------------------------------------------------------
  // 键位命令注入（扩展 keyCommands → 「键盘设置」界面 + 默认键位）
  // ------------------------------------------------------------------

  /**
   * 把各扩展 `keyCommands` 声明的命令注入游戏：
   *  1) 写入 `configurableCmds`，让「键盘设置」界面列出该命令（用户可改键）；
   *  2) 若该命令尚无任何键位，按声明的 `default` 补一个默认键。
   * 默认键位依赖 GUI 层挂到 globalThis 的 keyBinds —— GUI 未就绪时轮询等待。
   *
   * 调用时机有两处：Application 启动路径（早于主菜单设置页渲染），以及
   * `ExtensionsModel.setMaster()`（用户在扩展页开关扩展后立即生效）。
   * ⇒ 本方法必须**幂等**，且要处理「上一轮注册过、这一轮不再生效」的撤销。
   */
  static applyExtensionKeyCommands(): void {
    // 配置可能刚被改动（扩展开关），先失效排序缓存再取 getActiveSorted()。
    ExtensionHost.sortedCache = null;

    const collect = (exts: ExtensionDefinition[]) => {
      const out: Array<{ id: string; label: string; desc: string; def?: string }> = [];
      for (const ext of exts) {
        for (const c of ext.keyCommands || []) {
          out.push({ id: c.id, label: c.label, desc: c.desc, def: c.default });
        }
      }
      return out;
    };
    // 已启用（总开关 + 依赖均满足）→ 进「键盘设置」界面、补默认键；
    // 已注册但被关掉 → 不进界面、不补默认键。
    const activeCmds = collect(ExtensionHost.getActiveSorted());
    const allCmds = collect(ExtensionHost.getRegistered());

    // 让 KeyBinds.loadHotKeys() 的白名单认识这些命令 —— 它的白名单原本硬编码为
    // KeyCommandType 枚举成员，导致每加一个热键都得往那个枚举塞一行。现在改成
    // 「枚举 ∪ 本集合」，新扩展就不必再动核心枚举了。挂 globalThis 同样是为了
    // 不引入 ExtensionHost -> GUI 的反向模块依赖。
    // 注意这里用「全部已注册」而非「已启用」：被关掉的扩展，其**用户已改过的键位**
    // 仍留在 ini 的 [Hotkey] 段里，白名单放行才能保住那条绑定（关掉期间不派发，
    // 因为没有注册命令处理函数；重新打开即恢复用户原来的键）。
    (globalThis as any).__openyrweb_knownKeyCommands = new Set(allCmds.map((c) => c.id));

    // 撤销：上一轮注入过、这一轮不在「已启用」里的条目必须从界面移除。
    // 只删本机制注入过的 id（记在 __openyrweb_extKeyCommands），绝不碰内置命令。
    const activeIds = new Set(activeCmds.map((c) => c.id));
    const injected: Set<string> = (globalThis as any).__openyrweb_extKeyCommands || new Set();
    for (const id of injected) {
      if (activeIds.has(id)) continue;
      try {
        (configurableCmdsModule as any).configurableCmds.delete(id);
      } catch (err) {
        console.warn(`[ExtensionHost] 移除键位命令条目失败 "${id}"`, err);
      }
    }
    (globalThis as any).__openyrweb_extKeyCommands = activeIds;

    for (const c of activeCmds) {
      try {
        (configurableCmdsModule as any).configurableCmds.set(c.id, { label: c.label, desc: c.desc });
      } catch (err) {
        console.warn(`[ExtensionHost] 注入键位命令条目失败 "${c.id}"`, err);
      }
    }

    // 默认键位以**纯数据**形式发布：[[命令 id, 位编码], ...]。KeyBinds.load() 会在末尾
    // 读取它并补入未绑定的命令 —— 之所以不只在本类里补一次，是因为「键盘设置」里的
    // 「恢复默认」会重新 load()（KeyboardScreen.resetAndReload），那时必须重新补，
    // 否则扩展的默认键会跟着一起丢。
    const defaults: Array<[string, number]> = [];
    for (const c of activeCmds) {
      if (!c.def) continue;
      const code = ExtensionHost.parseHotkeyCode(c.def);
      if (code === undefined) {
        console.warn(`[ExtensionHost] 无法解析默认键位 "${c.def}"（命令 ${c.id}）`);
        continue;
      }
      defaults.push([c.id, code]);
    }
    (globalThis as any).__openyrweb_extKeyDefaults = defaults;

    ExtensionHost.ensureDefaultKeyBinds(0);
  }

  /**
   * 兜底：KeyBinds 实例出现后，把 __openyrweb_extKeyDefaults 里尚未绑定的补上。
   * 正常时序下 KeyBinds.load() 已经自己补过了（那时本函数是幂等的空转）；
   * 这里只覆盖「load() 早于 applyExtensionKeyCommands() 执行」这类非常规入口。
   * GUI/KeyBinds 还没就绪时轮询等待（最多约 10 秒）。
   */
  private static ensureDefaultKeyBinds(attempt: number): void {
    const keyBinds = (globalThis as any).__openyrweb_keyBinds;
    if (typeof keyBinds?.addHotKey !== "function") {
      if (attempt < 40) setTimeout(() => ExtensionHost.ensureDefaultKeyBinds(attempt + 1), 250);
      return;
    }
    const defaults: Array<[string, number]> = (globalThis as any).__openyrweb_extKeyDefaults || [];
    let added = 0;
    for (const [id, code] of defaults) {
      // 已有绑定（用户改过键，或之前已补过）则不覆盖
      if (keyBinds.getHotKey?.(id)) continue;
      keyBinds.addHotKey(id, code);
      added++;
    }
    if (added) console.info(`[ExtensionHost] 已为 ${added} 个扩展命令补入默认键位`);
  }

  /**
   * 把 "Ctrl+D" 这类描述转成 KeyBinds 的位编码（与 KeyBinds.getHotKeyCode 一致）：
   * `(meta<<12) + (alt<<10) + (ctrl<<9) + (shift<<8) + keyCode`，字母/数字取 charCodeAt。
   */
  private static parseHotkeyCode(spec: string): number | undefined {
    let meta = 0;
    let alt = 0;
    let ctrl = 0;
    let shift = 0;
    let keyCode: number | undefined;
    for (const raw of String(spec).split(/[+\s]+/).filter(Boolean)) {
      const t = raw.toLowerCase();
      if (t === "ctrl" || t === "control") ctrl = 1;
      else if (t === "alt" || t === "menu") alt = 1;
      else if (t === "shift") shift = 1;
      else if (t === "win" || t === "windows" || t === "meta") meta = 1;
      else if (raw.length === 1) keyCode = raw.toUpperCase().charCodeAt(0);
      else return undefined; // 暂不支持 F1 / 方向键等具名键
    }
    if (keyCode === undefined) return undefined;
    return (meta << 12) + (alt << 10) + (ctrl << 9) + (shift << 8) + keyCode;
  }

  // ------------------------------------------------------------------
  // 事件总线快捷方式
  // ------------------------------------------------------------------

  /** 订阅扩展事件；返回退订函数。 */
  static onEvent(eventName: string, listener: (data: any, name: string) => void): () => void {
    return ExtensionHost.events.on(eventName, listener);
  }

  /** 发布扩展事件。 */
  static emitEvent(eventName: string, data?: any): void {
    ExtensionHost.events.emit(eventName, data);
  }

  // ------------------------------------------------------------------
  // 内部
  // ------------------------------------------------------------------

  /** 安全调用单个钩子：合并 ExtensionHookContext + payload，异常隔离。 */
  private static safeCallHook(
    name: RuntimeHookName,
    active: ExtensionDefinition[],
    payload: Record<string, any>,
  ): void {
    const config = ExtensionHost.getConfig();
    const game = ExtensionHost.currentGame;
    const ini = game?.rules?.getIni?.() ?? game?.rules?.ini ?? null;
    for (const ext of active) {
      const fn = (ext.hooks as ExtensionRuntimeHooks | undefined)?.[name];
      if (typeof fn !== "function") continue;
      try {
        const ctx = createHookContext(
          ext.id,
          config,
          ini,
          game,
          // 让扩展能在对局期把自己的热键命令接进游戏键位系统（见 ExtensionHost.registerKeyCommand）。
          (cmd: any, fn: () => void) => ExtensionHost.registerKeyCommand(cmd, fn),
        );
        // payload 展开在前，ctx 字段覆盖同名键（ctx 的 isFeatureEnabled 等优先）
        const arg = { ...payload, ...ctx };
        (fn as (a: unknown) => void).call(ext.hooks, arg);
      } catch (err) {
        console.warn(`Extension "${ext.id}" ${name} failed`, err);
      }
    }
  }
}
