/**
 * DefaultActionHandler — 默认点击/移动/攻击指令选择与派发。
 *
 * 由 gui/screen/game/worldInteraction/DefaultActionHandler.ts.js
 * 重写为 TS（行为完全一致）。
 */
import { PointerType } from "engine/type/PointerType"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import { MoveOrder } from "game/order/MoveOrder"; // 孪生
import { orderPriorities } from "game/order/orderPriorities"; // 已转换
import { OrderFactory } from "game/order/OrderFactory"; // 孪生
import { AttackOrder } from "game/order/AttackOrder"; // 孪生
import { Target } from "game/Target"; // 已转换
import { AttackMoveOrder } from "game/order/AttackMoveOrder"; // 孪生
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换
import { GuardAreaOrder } from "game/order/GuardAreaOrder"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const MoveOrderCtor: any = (MoveOrder as any) ?? MoveOrder;
const OrderFactoryCtor: any = (OrderFactory as any) ?? OrderFactory;
const AttackOrderCtor: any = (AttackOrder as any) ?? AttackOrder;
const AttackMoveOrderCtor: any = (AttackMoveOrder as any) ?? AttackMoveOrder;
const GuardAreaOrderCtor: any = (GuardAreaOrder as any) ?? GuardAreaOrder;

/** 动作过滤器。 */
export enum ActionFilter {
  /** 全部动作 */
  All = 0,
  /** 仅选择 */
  SelectOnly = 1,
  /** 不可选择 */
  NoSelect = 2,
}

/** 选择动作。 */
class SelectAction {
  /** 游戏。 */
  game: any;
  /** 选择处理器。 */
  unitSelectionHandler: any;
  /** 当前玩家。 */
  currentPlayer: any;
  /** 是否 toggle 选择。 */
  toggleSelect: boolean;
  /** 是否强制选择。 */
  force = false;
  /** 是否允许类型选择。 */
  allowTypeSelect = false;
  /** 指针类型。 */
  getPointerType = () => PointerType.Select;
  /** 是否允许。 */
  isAllowed = () => true;

  /**
   * @param game 游戏
   * @param unitSelectionHandler 选择处理
   * @param currentPlayer 玩家
   * @param toggleSelect 是否 toggle
   */
  constructor(game: any, unitSelectionHandler: any, currentPlayer: any, toggleSelect = false) {
    this.game = game;
    this.unitSelectionHandler = unitSelectionHandler;
    this.currentPlayer = currentPlayer;
    this.toggleSelect = toggleSelect;
    this.force = false;
    this.allowTypeSelect = false;
    this.getPointerType = () => PointerType.Select;
    this.isAllowed = () => true;
  }

  /**
   * 设强制。
   * @param force 值
   */
  setForce(force: boolean): this {
    this.force = force;
    return this;
  }

  /**
   * 设类型选择。
   * @param allow 值
   */
  setTypeSelect(allow: boolean): this {
    this.allowTypeSelect = allow;
    return this;
  }

  /**
   * 是否可选中目标。
   * @param obj 对象
   */
  isValidTarget(obj: any): boolean {
    if (!obj?.isTechno()) return false;
    if (
      this.currentPlayer &&
      (obj.isInfantry() || obj.isVehicle()) &&
      obj.disguiseTrait?.hasTerrainDisguise() &&
      !this.game.alliances.haveSharedIntel(this.currentPlayer, obj.owner)
    ) {
      return false;
    }
    const selected = this.unitSelectionHandler.getSelectedUnits();
    const badOwn =
      !this.toggleSelect &&
      selected.some((u: any) => u.isUnit()) &&
      this.currentPlayer &&
      !this.currentPlayer.isObserver &&
      obj.isTechno() &&
      !this.game.areFriendly(obj, selected[0]) &&
      selected[0].owner === this.currentPlayer;
    if (badOwn) return false;
    if (!obj.rules.selectable) return false;
    return (
      this.toggleSelect ||
      this.force ||
      (this.allowTypeSelect && selected.length === 1 && selected[0] === obj) ||
      !selected.includes(obj)
    );
  }

  /**
   * 执行选择。
   * @param obj 对象
   */
  execute(obj: any): void {
    if (this.allowTypeSelect) {
      const selected = this.unitSelectionHandler.getSelectedUnits();
      if (selected.length === 1 && selected[0] === obj) {
        this.unitSelectionHandler.selectByType();
        return;
      }
    }
    if (this.toggleSelect) {
      this.unitSelectionHandler.toggleSelection(obj);
    } else {
      this.unitSelectionHandler.selectSingleUnit(obj);
    }
  }
}

/** 默认动作处理器。 */
export class DefaultActionHandler {
  /** 渲染件管理。 */
  renderableManager: any;
  /** 当前玩家。 */
  currentPlayer: any;
  /** 音画规则。 */
  audioVisualRules: any;
  /** tile 占用。 */
  tileOccupation: any;
  /** 下单事件源。 */
  private _onOrder = new EventDispatcher();
  /** 默认动作列表。 */
  defaultActions: any[];
  /** 特殊动作列表。 */
  specialActions: any[];
  /** 选择动作。 */
  selectAction: SelectAction;
  /** toggle 选择。 */
  selectToggleAction: SelectAction | undefined;
  /** 强制移动。 */
  forceMoveAction: any;
  /** 强制攻击。 */
  forceAttackAction: any;
  /** 攻击移动。 */
  attackMoveAction: any;
  /** 警戒区域。 */
  guardAreaAction: any;
  /** 当前目标。 */
  currentTarget: any;
  /** 当前选中。 */
  currentSelected: any[];
  /** 最显著动作。 */
  mostSignificantAction: any;

  /** 下单事件。 */
  get onOrder() {
    return this._onOrder.asEvent();
  }

  /**
   * 工厂：按玩家是否观察者装配动作栈。
   * @param renderableManager 渲染件
   * @param unitSelection 选择
   * @param unitSelectionHandler 选择处理
   * @param currentPlayer 玩家
   * @param map 地图
   * @param game 游戏
   * @param audioVisualRules 音画
   */
  static factory(
    renderableManager: any,
    unitSelection: any,
    unitSelectionHandler: any,
    currentPlayer: any,
    map: any,
    game: any,
    audioVisualRules: any,
  ): DefaultActionHandler {
    const handler = new this(renderableManager, currentPlayer, audioVisualRules, map.tileOccupation);
    const select = new SelectAction(game, unitSelectionHandler, currentPlayer);
    handler.selectAction = select;
    if (currentPlayer && !currentPlayer.isObserver) {
      handler.defaultActions = [
        ...orderPriorities.map((p: any) =>
          new OrderFactoryCtor(game, map).create(p, unitSelection),
        ),
        select,
        new MoveOrderCtor(game, map, unitSelection),
      ];
      handler.selectToggleAction = new SelectAction(game, unitSelectionHandler, currentPlayer, true);
      handler.forceMoveAction = new MoveOrderCtor(game, map, unitSelection, true);
      handler.forceAttackAction = new AttackOrderCtor(game, { forceAttack: true });
      handler.attackMoveAction = new AttackMoveOrderCtor(game, map);
      handler.guardAreaAction = new GuardAreaOrderCtor(game, true);
      handler.specialActions = [
        handler.selectToggleAction,
        handler.forceMoveAction,
        handler.forceAttackAction,
        handler.attackMoveAction,
        handler.guardAreaAction,
      ];
    } else {
      handler.defaultActions = [select];
      handler.specialActions = [];
    }
    return handler;
  }

  /**
   * @param renderableManager 渲染件
   * @param currentPlayer 玩家
   * @param audioVisualRules 音画
   * @param tileOccupation 占用
   */
  constructor(renderableManager: any, currentPlayer: any, audioVisualRules: any, tileOccupation: any) {
    this.renderableManager = renderableManager;
    this.currentPlayer = currentPlayer;
    this.audioVisualRules = audioVisualRules;
    this.tileOccupation = tileOccupation;
    this._onOrder = new EventDispatcher();
    this.defaultActions = [];
    this.specialActions = [];
  }

  /**
   * 悬停 → Target。
   * @param hover 悬停
   */
  createOrderTarget(hover: any): any {
    return new Target(hover.gameObject, hover.tile, this.tileOccupation);
  }

  /**
   * 求默认动作。
   * @param playerOwner 悬停对象属主
   * @param selected 选中
   * @param hover 悬停
   * @param filter 过滤器
   * @param rightClickMove 右键移动
   * @param force 强制
   * @param mods 修饰键
   * @param allowTypeSelect 允许类型选择
   * @param isMinimap 是否小地图
   */
  getDefaultAction(
    playerOwner: any,
    selected: any[],
    hover: any,
    filter: ActionFilter,
    rightClickMove: boolean,
    force: boolean,
    mods: any,
    allowTypeSelect: boolean,
    isMinimap: boolean,
  ): any {
    const obj = hover.gameObject;
    const select = this.selectAction;
    select.setForce(force).setTypeSelect(false);
    if (!playerOwner || playerOwner.owner !== this.currentPlayer || playerOwner.rules.spawned) {
      if (!isMinimap && filter !== ActionFilter.NoSelect && select.isValidTarget(obj)) {
        return select;
      }
      return void 0;
    }
    if (
      filter !== ActionFilter.NoSelect &&
      !isMinimap &&
      mods?.shiftKey &&
      !mods?.ctrlKey &&
      this.selectToggleAction?.isValidTarget(obj)
    ) {
      return this.selectToggleAction;
    }
    if (filter === ActionFilter.SelectOnly) {
      if (!isMinimap && select.setTypeSelect(allowTypeSelect).isValidTarget(obj)) return select;
      return void 0;
    }
    const allWarped = selected.every((u: any) => u.warpedOutTrait.isActive());
    if (mods?.ctrlKey && !allWarped) {
      if (mods.shiftKey) {
        if (this.attackMoveAction?.set(playerOwner, hover).isValid()) return this.attackMoveAction;
      } else if (mods.altKey) {
        if (this.guardAreaAction?.set(playerOwner, hover).isValid()) return this.guardAreaAction;
      } else if (this.forceAttackAction?.set(playerOwner, hover).isValid()) {
        return this.forceAttackAction;
      }
    }
    if (mods?.altKey && !allWarped && this.forceMoveAction?.set(playerOwner, hover).isValid()) {
      return this.forceMoveAction;
    }
    for (const action of this.defaultActions.values()) {
      if (action instanceof SelectAction) {
        if (
          filter !== ActionFilter.NoSelect &&
          !isMinimap &&
          action.setForce(force).setTypeSelect(false).isValidTarget(obj)
        ) {
          return action;
        }
      } else if (
        !allWarped &&
        (!isMinimap || action.minimapAllowed) &&
        !(action.singleSelectionRequired && selected.length > 1) &&
        action.set(playerOwner, hover).isValid()
      ) {
        return action;
      }
    }
    if (isMinimap && !allWarped && this.forceMoveAction?.set(playerOwner, hover).isValid()) {
      return this.forceMoveAction;
    }
    return void 0;
  }

  /**
   * 多单位取最显著动作。
   * @param selected 选中
   * @param hover 悬停
   * @param target 目标
   * @param filter 过滤
   * @param rightClickMove 右键移动
   * @param force 强制
   * @param mods 修饰键
   * @param isMinimap 小地图
   */
  updateMostSignificantAction(
    selected: any[],
    hover: any,
    target: any,
    filter: ActionFilter,
    rightClickMove: boolean,
    force: boolean,
    mods: any,
    isMinimap: boolean,
  ): any {
    if (!selected.length) {
      return this.getDefaultAction(
        void 0,
        selected,
        hover,
        filter,
        rightClickMove,
        force,
        mods,
        void 0,
        isMinimap,
      );
    }
    const candidates = selected
      .map((unit) => {
        const action = this.getDefaultAction(
          unit,
          selected,
          hover,
          filter,
          rightClickMove,
          force,
          mods,
          void 0,
          isMinimap,
        );
        if (action) return { unit, action };
        return void 0;
      })
      .filter(isNotNullOrUndefined);
    const specials = [...this.specialActions.values()];
    if (!candidates.length) return void 0;
    return candidates.reduce(
      (best, cur) => {
        if (
          !best ||
          specials.includes(cur.action) ||
          this.defaultActions.indexOf(cur.action) < this.defaultActions.indexOf(best) ||
          (!(best instanceof SelectAction) &&
            (best as any).sourceObject.rules.leadershipRating <
              cur.unit.rules.leadershipRating &&
            this.defaultActions.indexOf(cur.action) === this.defaultActions.indexOf(best))
        ) {
          if (cur.action instanceof SelectAction) return cur.action;
          return cur.action.set(cur.unit, target);
        }
        return best;
      },
      void 0,
    );
  }

  /**
   * 当前指针类型。
   * @param isMinimap 小地图
   */
  getPointerType(isMinimap: boolean): any {
    if (this.mostSignificantAction instanceof SelectAction) {
      return this.mostSignificantAction.getPointerType();
    }
    if (!this.currentSelected || !this.mostSignificantAction) {
      return isMinimap ? PointerType.Mini : PointerType.Default;
    }
    if (!this.mostSignificantAction.isAllowed()) {
      const source = this.mostSignificantAction.sourceObject;
      for (const unit of this.currentSelected) {
        this.mostSignificantAction.set(unit, this.currentTarget);
        if (this.mostSignificantAction.isValid() && this.mostSignificantAction.isAllowed()) {
          return this.mostSignificantAction.getPointerType(isMinimap, this.currentSelected);
        }
      }
      this.mostSignificantAction.set(source, this.currentTarget);
    }
    return this.mostSignificantAction.getPointerType(isMinimap, this.currentSelected);
  }

  /**
   * 悬停更新（不执行）。
   * @param hover 悬停
   * @param selected 选中
   * @param rightClickMove 右键移动
   * @param mods 修饰键
   * @param isMinimap 小地图
   */
  update(hover: any, selected: any[], rightClickMove: boolean, mods: any, isMinimap = false): void {
    this.currentTarget = this.createOrderTarget(hover);
    this.currentSelected = selected;
    this.mostSignificantAction = this.updateMostSignificantAction(
      selected,
      hover,
      this.currentTarget,
      ActionFilter.All,
      rightClickMove,
      false,
      mods,
      isMinimap,
    );
  }

  /**
   * 执行动作并可能广播 order。
   * @param hover 悬停
   * @param selected 选中
   * @param filter 过滤
   * @param rightClickMove 右键移动
   * @param force 强制
   * @param mods 修饰键
   * @param isMinimap 小地图
   */
  execute(
    hover: any,
    selected: any[],
    filter: ActionFilter,
    rightClickMove: boolean,
    force: boolean,
    mods: any,
    isMinimap = false,
  ): boolean {
    this.currentTarget = this.createOrderTarget(hover);
    this.currentSelected = selected;
    this.mostSignificantAction = this.updateMostSignificantAction(
      selected,
      hover,
      this.currentTarget,
      filter,
      rightClickMove,
      force,
      mods,
      isMinimap,
    );
    if (!this.mostSignificantAction) return false;
    const allowed = this.mostSignificantAction.isAllowed();
    if (allowed) {
      if (
        this.mostSignificantAction instanceof MoveOrderCtor ||
        (this.mostSignificantAction instanceof AttackMoveOrderCtor &&
          !this.currentTarget.obj?.isTechno()) ||
        this.mostSignificantAction instanceof GuardAreaOrderCtor
      ) {
        this.renderableManager.createTransientAnim(this.audioVisualRules.moveFlash, (anim: any) => {
          anim.setPosition(
            Coords.tile3dToWorld(
              this.currentTarget.tile.rx + 0.5,
              this.currentTarget.tile.ry + 0.5,
              this.currentTarget.tile.z + (this.currentTarget.getBridge()?.tileElevation ?? 0),
            ),
          );
        });
      } else if (
        !(this.mostSignificantAction instanceof SelectAction) &&
        selected.includes(hover.gameObject)
      ) {
        hover.entity?.highlight?.();
      }
    }
    if (this.mostSignificantAction instanceof SelectAction) {
      this.mostSignificantAction.execute(hover.gameObject);
    } else {
      this._onOrder.dispatch(this, {
        orderType: this.mostSignificantAction.orderType,
        terminal: this.mostSignificantAction.terminal,
        feedbackType: allowed
          ? this.mostSignificantAction.feedbackType
          : OrderFeedbackType.None,
        feedbackUnit: allowed ? this.mostSignificantAction.sourceObject : void 0,
        target: this.currentTarget,
      });
    }
    return true;
  }
}
