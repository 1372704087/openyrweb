/**
 * UnitSelectionHandler — 单位选择（框选/分组/按类型/兵种/血量循环）。
 *
 * 由 gui/screen/game/worldInteraction/UnitSelectionHandler.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { pointEquals } from "util/geometry"; // 已转换
import { clamp } from "util/math"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import { equals as arrayEquals } from "util/array"; // 已转换
import { HealthLevel } from "game/gameobject/unit/HealthLevel"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 选择查询类型。 */
export enum QueryType {
  /** 无 */
  None = 0,
  /** 屏幕内 */
  OnScreen = 1,
  /** 全图 */
  OnMap = 2,
  /** 按老兵等级 */
  Veteran = 3,
  /** 按血量档 */
  Health = 4,
}

/** 单位选择处理器。 */
export class UnitSelectionHandler {
  /** 世界场景。 */
  worldScene: any;
  /** UI 场景。 */
  uiScene: any;
  /** 玩家。 */
  player: any;
  /** 单位选择核心。 */
  unitSelection: any;
  /** 实体相交。 */
  entityIntersectHelper: any;
  /** 老兵等级上限。 */
  veteranCap: any;
  /** 是否已扩到全图选类型。 */
  shouldSelectByTypeOnMap = false;
  /** 是否已扩到全图选战斗单位。 */
  shouldSelectCombatantsOnMap = false;
  /** 选择变化事件源。 */
  private _onUserSelectionChange = new EventDispatcher();
  /** 选择更新事件源。 */
  private _onUserSelectionUpdate = new EventDispatcher();
  /** 框选起点。 */
  boxSelectOrigin: any;
  /** 框选线。 */
  selectBox: any;
  /** 老兵导航缓存集。 */
  vetNavSelectionSet: any[];
  /** 血量导航缓存集。 */
  healthNavSelectionSet: any[];
  /** 当前老兵档。 */
  selectVeteranState: number | undefined;
  /** 当前血量档。 */
  selectHealthState: number | undefined;

  /** 选择变化（内容变）。 */
  get onUserSelectionChange() {
    return this._onUserSelectionChange.asEvent();
  }

  /** 选择更新（含重复）。 */
  get onUserSelectionUpdate() {
    return this._onUserSelectionUpdate.asEvent();
  }

  /**
   * @param worldScene 世界场景
   * @param uiScene UI 场景
   * @param player 玩家
   * @param unitSelection 选择核心
   * @param entityIntersectHelper 实体相交
   * @param veteranCap 老兵上限
   */
  constructor(
    worldScene: any,
    uiScene: any,
    player: any,
    unitSelection: any,
    entityIntersectHelper: any,
    veteranCap: any,
  ) {
    this.worldScene = worldScene;
    this.uiScene = uiScene;
    this.player = player;
    this.unitSelection = unitSelection;
    this.entityIntersectHelper = entityIntersectHelper;
    this.veteranCap = veteranCap;
    this.shouldSelectByTypeOnMap = false;
    this.shouldSelectCombatantsOnMap = false;
    this._onUserSelectionChange = new EventDispatcher();
    this._onUserSelectionUpdate = new EventDispatcher();
    this._onUserSelectionChange.subscribe(() => {
      this.shouldSelectByTypeOnMap = false;
      this.shouldSelectCombatantsOnMap = false;
    });
    this._onUserSelectionUpdate.subscribe(() => {
      this.selectVeteranState = void 0;
      this.selectHealthState = void 0;
    });
  }

  /**
   * 追加选择（跨阵营则清空）。
   * @param unit 单位
   */
  addToSelection(unit: any): void {
    // `slaved` slaves (SLAV) are unselectable, EXCEPT freed/liberated
    // slaves (SlaveMinerTrait._liberateSlaves sets `liberated=true` on the instance,
    // not the shared rules) which become selectable infantry under their liberator.
    if (!unit.rules.selectable || (unit.rules.slaved && !unit.liberated)) return;
    const selected = this.unitSelection.getSelectedUnits();
    if (
      selected.length &&
      !(
        unit.owner === this.player &&
        !selected.find((u: any) => u.owner !== unit.owner)
      )
    ) {
      this.unitSelection.deselectAll();
    }
    this.unitSelection.addToSelection(unit);
  }

  /**
   * 单选。
   * @param unit 单位
   */
  selectSingleUnit(unit: any): void {
    if (!unit.rules.selectable || (unit.rules.slaved && !unit.liberated)) return;
    const prev = this.unitSelection.getSelectedUnits();
    if (prev.length) this.unitSelection.deselectAll();
    this.unitSelection.addToSelection(unit);
    const next = this.unitSelection.getSelectedUnits();
    const payload = { selection: next };
    if (next.length !== prev.length || next[0] !== prev[0]) {
      this._onUserSelectionChange.dispatch(this, payload);
    }
    this._onUserSelectionUpdate.dispatch(this, payload);
  }

  /**
   * 切换选择。
   * @param unit 单位
   */
  toggleSelection(unit: any): void {
    if (!unit.rules.selectable || (unit.rules.slaved && !unit.liberated)) return;
    if (this.unitSelection.isSelected(unit)) {
      this.unitSelection.removeFromSelection([unit]);
    } else {
      this.addToSelection(unit);
    }
    const payload = { selection: this.unitSelection.getSelectedUnits() };
    this._onUserSelectionChange.dispatch(this, payload);
    this._onUserSelectionUpdate.dispatch(this, payload);
  }

  /** 清空选择。 */
  deselectAll(): void {
    const payload = { selection: [] };
    if (this.unitSelection.getSelectedUnits().length) {
      this.unitSelection.deselectAll();
      this._onUserSelectionChange.dispatch(this, payload);
    }
    this._onUserSelectionUpdate.dispatch(this, payload);
  }

  /**
   * 多选并广播查询元数据。
   * @param units 单位
   * @param query 查询
   * @param clearFirst 是否先清空
   */
  selectMultipleUnits(
    units: any[],
    query: { queryType: QueryType; veteranLevel?: any; healthLevel?: any },
    clearFirst = true,
  ): void {
    const prev = this.unitSelection.getSelectedUnits();
    if (clearFirst) this.unitSelection.deselectAll();
    units.forEach((u) => this.addToSelection(u));
    const next = this.unitSelection.getSelectedUnits();
    const payload = {
      selection: next,
      queryType: query.queryType,
      veteranLevel: query.veteranLevel,
      healthLevel: query.healthLevel,
    };
    if (!arrayEquals(prev, next)) {
      this._onUserSelectionChange.dispatch(this, payload);
    }
    this._onUserSelectionUpdate.dispatch(this, payload);
  }

  /** 当前选中。 */
  getSelectedUnits(): any[] {
    return this.unitSelection.getSelectedUnits();
  }

  /**
   * 开始框选。
   * @param origin 起点
   */
  startBoxSelect(origin: any): void {
    this.boxSelectOrigin = origin;
    this.disposeBoxSelect();
    this.selectBox = this.createSelectBox(new THREE.Box2());
    this.uiScene.get3DObject().add(this.selectBox);
  }

  /**
   * 更新框选矩形。
   * @param pos 当前指针
   */
  updateBoxSelect(pos: any): void {
    if (!this.boxSelectOrigin) return;
    const p = this.clampPointerToWorldViewport(pos);
    const box = new THREE.Box2().setFromPoints([
      new THREE.Vector2(this.boxSelectOrigin.x, this.boxSelectOrigin.y),
      new THREE.Vector2(p.x, p.y),
    ]);
    this.selectBox.geometry.dispose();
    this.selectBox.geometry = this.createBoxGeometry(box);
  }

  /**
   * 结束框选；点选（零位移）返回 false。
   * @param end 终点
   * @param additive 是否累加选择
   */
  finishBoxSelect(end: any, additive: boolean): boolean {
    if (!this.boxSelectOrigin) return false;
    const origin = this.boxSelectOrigin;
    this.boxSelectOrigin = void 0;
    this.disposeBoxSelect();
    if (pointEquals(end, origin)) return false;
    const p = this.clampPointerToWorldViewport(end);
    const box = new THREE.Box2().setFromPoints([
      new THREE.Vector2(origin.x, origin.y),
      new THREE.Vector2(p.x, p.y),
    ]);
    const found =
      this.entityIntersectHelper
        .getEntitiesAtScreenBox(box)
        ?.map((e: any) => e.gameObject)
        .filter(
          (o: any) =>
            o.isTechno() &&
            o.rules.selectable &&
            !(o.rules.slaved && !o.liberated) &&
            o.owner === this.player,
        ) ?? [];
    if (!found.length) return false;
    const chosen = found.length === 1 ? [found[0]] : found.filter((o: any) => !o.isBuilding());
    if (!chosen.length) return false;
    this.selectMultipleUnits(chosen, { queryType: QueryType.None }, additive);
    return true;
  }

  /** 取消框选。 */
  cancelBoxSelect(): void {
    this.boxSelectOrigin = void 0;
    this.disposeBoxSelect();
  }

  /**
   * 创建编组（单个非己方单位除外）。
   * @param group 组号
   */
  createGroup(group: number): void {
    const selected = this.unitSelection.getSelectedUnits();
    if (selected.length === 1 && selected[0].owner !== this.player) return;
    this.unitSelection.createGroup(group);
  }

  /**
   * 取编组单位。
   * @param group 组号
   */
  getGroupUnits(group: number): any[] {
    return this.unitSelection.getGroupUnits(group);
  }

  /**
   * 把编组并入选择。
   * @param group 组号
   */
  addGroupToSelection(group: number): void {
    const prev = this.getSelectedUnits();
    this.unitSelection.addGroupToSelection(group);
    const next = this.getSelectedUnits();
    const payload = { selection: next };
    if (!arrayEquals(next, prev)) {
      this._onUserSelectionChange.dispatch(this, payload);
    }
    this._onUserSelectionUpdate.dispatch(this, payload);
  }

  /**
   * 选中编组。
   * @param group 组号
   */
  selectGroup(group: number): void {
    const prev = this.getSelectedUnits();
    this.unitSelection.selectGroup(group);
    const next = this.getSelectedUnits();
    const payload = { selection: next };
    if (!arrayEquals(next, prev)) {
      this._onUserSelectionChange.dispatch(this, payload);
    }
    this._onUserSelectionUpdate.dispatch(this, payload);
  }

  /** 按类型选择（屏内→全图）。 */
  selectByType(): void {
    const owner = this.player ?? this.getSelectedUnits()[0]?.owner;
    if (!owner) return;
    const names = this.getSelectedUnits().reduce((set: Set<string>, u: any) => {
      set.add(u.name);
      return set;
    }, new Set<string>());
    let pool: any[] = [];
    let matched: any[] = [];
    if (!this.shouldSelectByTypeOnMap) {
      pool = this.getOwnedObjectsOnScreen(owner);
      matched = pool.filter((o) => names.has(o.name));
      if (matched.every((o) => this.unitSelection.isSelected(o))) {
        this.shouldSelectByTypeOnMap = true;
      }
    }
    if (this.shouldSelectByTypeOnMap) {
      pool = owner.getOwnedObjects();
      matched = pool.filter((o) => names.has(o.name));
    }
    const queryType = this.shouldSelectByTypeOnMap ? QueryType.OnMap : QueryType.OnScreen;
    if (matched.length) {
      this.selectMultipleUnits(matched, { queryType }, false);
    } else if (names.size) {
      this.selectMultipleUnits([], { queryType }, false);
    } else {
      this.selectMultipleUnits([], { queryType });
    }
    this.shouldSelectByTypeOnMap = true;
  }

  /** 选择可战斗单位（屏内→全图）。 */
  selectCombatants(): void {
    const owner = this.player ?? this.getSelectedUnits()[0]?.owner;
    if (!owner) return;
    const pool = this.shouldSelectCombatantsOnMap
      ? owner.getOwnedObjects()
      : this.getOwnedObjectsOnScreen(owner);
    const matched = pool.filter(
      (o: any) =>
        o.isUnit() &&
        o.rules.selectable &&
        o.rules.isSelectableCombatant &&
        o.attackTrait &&
        !o.rules.harvester,
    );
    if (matched.length) {
      const queryType = this.shouldSelectCombatantsOnMap ? QueryType.OnMap : QueryType.OnScreen;
      this.selectMultipleUnits(matched, { queryType });
    } else if (this.shouldSelectCombatantsOnMap) {
      this.selectMultipleUnits([], { queryType: QueryType.OnMap });
    } else {
      this.shouldSelectCombatantsOnMap = true;
      this.selectCombatants();
    }
    this.shouldSelectCombatantsOnMap = true;
  }

  /** 循环选中老兵等级。 */
  selectByVeterancy(): void {
    const owner = this.player ?? this.getSelectedUnits()[0]?.owner;
    if (!owner) return;
    let level: number;
    if (this.selectVeteranState === void 0) {
      level = this.veteranCap;
      this.vetNavSelectionSet = this.unitSelection.getSelectedUnits();
      if (!this.vetNavSelectionSet.length) {
        this.vetNavSelectionSet = this.getOwnedObjectsOnScreen(owner).filter((o: any) =>
          o.isUnit(),
        );
      }
    } else {
      const span = this.veteranCap + 1;
      level = ((this.selectVeteranState - 1 + span) % span) | 0;
      // 与孪生一致：(state-1+cap+1)%(cap+1)
      level = (this.selectVeteranState - 1 + (this.veteranCap + 1)) % (this.veteranCap + 1);
    }
    const pool = this.vetNavSelectionSet.filter(
      (u: any) =>
        u.rules.selectable &&
        !(u.rules.slaved && !u.liberated) &&
        !u.isDestroyed &&
        !u.isCrashing &&
        !u.limboData &&
        u.owner === owner,
    );
    const matched = pool.filter((u: any) => u.veteranLevel === level);
    this.selectMultipleUnits(matched, {
      queryType: QueryType.Veteran,
      veteranLevel: pool.length ? level : void 0,
    });
    this.selectVeteranState = level;
  }

  /** 循环选中血量档。 */
  selectByHealth(): void {
    const owner = this.player ?? this.getSelectedUnits()[0]?.owner;
    if (!owner) return;
    let level: number;
    const levelCount = Object.keys(HealthLevel).filter((k) => !isNaN(Number(k))).length;
    if (this.selectHealthState === void 0) {
      level = levelCount - 1;
      this.healthNavSelectionSet = this.unitSelection.getSelectedUnits();
      if (!this.healthNavSelectionSet.length) {
        this.healthNavSelectionSet = this.getOwnedObjectsOnScreen(owner).filter((o: any) =>
          o.isUnit(),
        );
      }
    } else {
      level = (this.selectHealthState - 1 + levelCount) % levelCount;
    }
    const pool = this.healthNavSelectionSet.filter(
      (u: any) =>
        u.rules.selectable &&
        !(u.rules.slaved && !u.liberated) &&
        !u.isDestroyed &&
        !u.isCrashing &&
        !u.limboData &&
        u.owner === owner,
    );
    const matched = pool.filter((u: any) => u.healthTrait.level === level);
    this.selectMultipleUnits(matched, {
      queryType: QueryType.Health,
      healthLevel: pool.length ? level : void 0,
    });
    this.selectHealthState = level;
  }

  /**
   * 屏幕框内己方 Techno。
   * @param owner 属主
   */
  getOwnedObjectsOnScreen(owner: any): any[] {
    const vp = this.worldScene.viewport;
    const box = new THREE.Box2(
      new THREE.Vector2(vp.x, vp.y),
      new THREE.Vector2(vp.x + vp.width - 1, vp.x + vp.height - 1),
    );
    return (
      this.entityIntersectHelper
        .getEntitiesAtScreenBox(box)
        ?.map((e: any) => e.gameObject)
        .filter((o: any) => o.isTechno() && o.owner === owner) ?? []
    );
  }

  /** 释放框选节点。 */
  disposeBoxSelect(): void {
    if (!this.selectBox) return;
    this.uiScene.get3DObject().remove(this.selectBox);
    this.selectBox.geometry.dispose();
    this.selectBox.material.dispose();
    this.selectBox = void 0;
  }

  /**
   * 夹到世界视口。
   * @param pos 指针
   */
  clampPointerToWorldViewport(pos: any): any {
    const vp = this.worldScene.viewport;
    return {
      x: clamp(pos.x, vp.x, vp.x + vp.width - 1),
      y: clamp(pos.y, vp.y, vp.y + vp.height - 1),
    };
  }

  /** 选择哈希。 */
  getHash(): any {
    return this.unitSelection.getHash();
  }

  /** 释放事件。 */
  dispose(): void {
    this.cancelBoxSelect();
    this._onUserSelectionChange = new EventDispatcher();
    this._onUserSelectionUpdate = new EventDispatcher();
  }

  /**
   * 白框线。
   * @param box 包围盒
   */
  createSelectBox(box: any): any {
    const material = new THREE.LineBasicMaterial({
      color: 16777215,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = this.createBoxGeometry(box);
    return new THREE.Line(geometry, material);
  }

  /**
   * 矩形折线几何。
   * @param box 包围盒
   */
  createBoxGeometry(box: any): any {
    const a = { x: box.min.x, y: box.min.y };
    const b = { x: box.max.x, y: box.max.y };
    const c = { x: box.max.x, y: box.min.y };
    const d = { x: box.min.x, y: box.max.y };
    const geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(d.x, d.y, 0),
      new THREE.Vector3(b.x, b.y, 0),
      new THREE.Vector3(c.x, c.y, 0),
      new THREE.Vector3(a.x, a.y, 0),
    );
    return geometry;
  }
}
