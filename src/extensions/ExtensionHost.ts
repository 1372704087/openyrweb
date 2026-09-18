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
import {
  createHookContext,
  ExtensionHookContext,
} from "extensions/ExtensionContext";
import { ExtensionEventBus } from "extensions/ExtensionEventBus";
import {
  ExtensionRuntimeHooks,
  RuntimeHookName,
} from "extensions/ExtensionHooks";

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

  // ------------------------------------------------------------------
  // 注册
  // ------------------------------------------------------------------

  static registerBuiltins(): void {
    if (ExtensionHost.registered) return;
    ExtensionHost.register(aresExtension);
    ExtensionHost.register(phobosExtension);
    ExtensionHost.register(npextExtension);
    ExtensionHost.register(placeExExtension);
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
        const ctx = createHookContext(ext.id, config, ini, game);
        // payload 展开在前，ctx 字段覆盖同名键（ctx 的 isFeatureEnabled 等优先）
        const arg = { ...payload, ...ctx };
        (fn as (a: unknown) => void).call(ext.hooks, arg);
      } catch (err) {
        console.warn(`Extension "${ext.id}" ${name} failed`, err);
      }
    }
  }
}
