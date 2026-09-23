/**
 * SpecialActionMode — 超武目标选择（含 Force Shield 友方限制与两段点击）。
 *
 * 由 gui/screen/game/worldInteraction/SpecialActionMode.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as PointerTypeModule from "engine/type/PointerType"; // 孪生
import { EventDispatcher } from "util/event"; // 已转换
import * as SuperWeaponTypeModule from "game/type/SuperWeaponType"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const PointerType: any = (PointerTypeModule as any).PointerType;
const SuperWeaponType: any = (SuperWeaponTypeModule as any).SuperWeaponType;

/** 超武类型 → 指针。 */
const SW_POINTER = new Map<any, any>()
  .set(SuperWeaponType.MultiMissile, PointerType.Nuke)
  .set(SuperWeaponType.LightningStorm, PointerType.Storm)
  .set(SuperWeaponType.IronCurtain, PointerType.Iron)
  .set(SuperWeaponType.ChronoSphere, PointerType.Chrono)
  .set(SuperWeaponType.ChronoWarp, PointerType.Chrono)
  .set(SuperWeaponType.AmerParaDrop, PointerType.Para)
  .set(SuperWeaponType.ParaDrop, PointerType.Para)
  // YR superweapons. Both are single-click targeted (no tile2 two-click flow).
  .set(SuperWeaponType.PsychicDominator, PointerType.Dominate)
  .set(SuperWeaponType.GeneticMutator, PointerType.Mutate)
  // (2026-07-25): Force Shield — uses the ForceField pointer (dedicated
  // shield/force-field cursor, PointerType.ForceField=450). Single-click targeted.
  .set(SuperWeaponType.ForceShield, PointerType.ForceField)
  // Psychic Reveal — Yuri's map-reveal mini-superweapon, uses the PsychicReveal pointer (496).
  .set(SuperWeaponType.PsychicReveal, PointerType.PsychicReveal)
  // Spy Plane — Soviet Radar Tower support power, uses the SpyPlane pointer (504).
  .set(SuperWeaponType.SpyPlane, PointerType.SpyPlane);

/** 超武目标模式。 */
export class SpecialActionMode {
  /** 全部超武规则表。 */
  allSuperWeaponRules: any;
  /** 当前超武规则。 */
  superWeaponRules: any;
  /** 超武 FX。 */
  superWeaponFxHandler: any;
  /** 指针。 */
  pointer: any;
  /** EVA。 */
  eva: any;
  /** 玩家。 */
  player: any;
  /** 执行事件源。 */
  private _onExecute = new EventDispatcher();
  /** 是否已点第一点。 */
  isPostClick = false;
  /** 两段点击的第一点。 */
  preTile: any;
  /** 当前指针对应的超武类型（可能已切到 PostClick 依赖类型）。 */
  pointerSwType: any;

  /** 执行事件。 */
  get onExecute() {
    return this._onExecute.asEvent();
  }

  /** 超武类型。 */
  get superWeaponType(): any {
    return this.superWeaponRules.type;
  }

  /**
   * 工厂。
   * @param all 全表
   * @param rules 规则
   * @param fx FX
   * @param pointer 指针
   * @param eva EVA
   * @param player 玩家
   */
  static factory(
    all: any,
    rules: any,
    fx: any,
    pointer: any,
    eva: any,
    player: any,
  ): SpecialActionMode {
    return new this(all, rules, fx, pointer, eva, player);
  }

  /**
   * @param allSuperWeaponRules 全表
   * @param superWeaponRules 规则
   * @param superWeaponFxHandler FX
   * @param pointer 指针
   * @param eva EVA
   * @param player 玩家
   */
  constructor(
    allSuperWeaponRules: any,
    superWeaponRules: any,
    superWeaponFxHandler: any,
    pointer: any,
    eva: any,
    player: any,
  ) {
    this.allSuperWeaponRules = allSuperWeaponRules;
    this.superWeaponRules = superWeaponRules;
    this.superWeaponFxHandler = superWeaponFxHandler;
    this.pointer = pointer;
    this.eva = eva;
    this.player = player;
    this._onExecute = new EventDispatcher();
    this.isPostClick = false;
    this.pointerSwType = this.superWeaponRules.type;
  }

  /** 提示选择目标。 */
  enter(): void {
    this.eva.play("EVA_SelectTarget");
  }

  /**
   * 悬停设指针；Force Shield 仅友好建筑。
   * @param hover 悬停
   */
  hover(hover: any): void {
    const tile = hover?.tile;
    const ptr = SW_POINTER.get(this.pointerSwType);
    // Force Shield only targets friendly buildings — show NoForceField on non-building or enemy tiles.
    if (tile && this.superWeaponRules.type === SuperWeaponType.ForceShield) {
      const bld = this.superWeaponFxHandler.game.map
        .getObjectsOnTile(tile)
        .find((o: any) => o.isBuilding());
      const friendly =
        bld &&
        (bld.owner === this.player ||
          this.superWeaponFxHandler.game.alliances.areAllied(bld.owner, this.player));
      this.pointer.setPointerType(
        friendly ? PointerType.ForceField : PointerType.NoForceField,
      );
    } else {
      this.pointer.setPointerType(tile && ptr !== void 0 ? ptr : PointerType.Default);
    }
  }

  /**
   * 执行目标点击；preClick 时进入第二段。
   * @param hover 悬停
   */
  execute(hover: any): boolean | void {
    const tile = hover?.tile;
    if (!tile) return false;
    // Force Shield only targets friendly buildings — prevent deployment on enemy or non-building tiles.
    if (this.superWeaponRules.type === SuperWeaponType.ForceShield) {
      const bld = this.superWeaponFxHandler.game.map
        .getObjectsOnTile(tile)
        .find((o: any) => o.isBuilding());
      if (!bld) return false;
      if (
        bld.owner !== this.player &&
        !this.superWeaponFxHandler.game.alliances.areAllied(bld.owner, this.player)
      ) {
        return false;
      }
    }
    if (
      this.superWeaponRules.type === SuperWeaponType.ChronoSphere &&
      !this.isPostClick
    ) {
      this.superWeaponFxHandler.createChronoSphereAnim(tile);
    }
    if (this.superWeaponRules.preClick && !this.isPostClick) {
      this.isPostClick = true;
      this.preTile = tile;
      const nextType = [...this.allSuperWeaponRules.values()].find(
        (r: any) => r.postClick && r.preDependent === this.superWeaponRules.type,
      )?.type;
      if (nextType === void 0) {
        throw new Error(
          'No super weapon section found with PostClick=yes and PreDependent="' +
            SuperWeaponType[this.superWeaponRules.type],
        );
      }
      this.pointerSwType = nextType;
      return false;
    }
    this._onExecute.dispatch(
      this,
      this.isPostClick
        ? { tile: this.preTile, tile2: tile }
        : { tile, tile2: void 0 },
    );
  }

  /** 取消=结束。 */
  cancel(): void {
    this.end();
  }

  /** ChronoSphere 第二段后清理动画。 */
  end(): void {
    if (this.superWeaponRules.type === SuperWeaponType.ChronoSphere && this.isPostClick) {
      this.superWeaponFxHandler.disposeChronoSphereAnim();
    }
  }

  /** 释放=结束。 */
  dispose(): void {
    this.end();
  }
}
