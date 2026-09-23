/**
 * SelectNextUnitCmd — 在己方单位间循环选中并居中。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/SelectNextUnitCmd.ts.js
 * 重写为 TS（行为完全一致）。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 循环选择己方单位。 */
export class SelectNextUnitCmd {
  /** 单位选择处理器。 */
  unitSelectionHandler: any;
  /** 地图平移辅助。 */
  mapPanningHelper: any;
  /** 镜头平移。 */
  cameraPan: any;
  /** 单位所属玩家。 */
  player: any;
  /** 世界。 */
  world: any;
  /** 是否反向循环。 */
  reverse = false;
  /** 己方单位列表（spawn 时缓存追加）。 */
  unitList: any[] = [];
  /** 订阅释放容器。 */
  disposables = new CompositeDisposable();
  /** 生成器（懒创建）。 */
  generator: Generator<any, void, unknown> | undefined;
  /** 上次选中哈希（变更时打断生成器循环）。 */
  lastSelectionHash: number | undefined;

  /**
   * @param unitSelectionHandler 选择处理器
   * @param mapPanningHelper 平移辅助
   * @param cameraPan 镜头平移
   * @param player 玩家
   * @param world 世界
   */
  constructor(
    unitSelectionHandler: any,
    mapPanningHelper: any,
    cameraPan: any,
    player: any,
    world: any,
  ) {
    this.unitSelectionHandler = unitSelectionHandler;
    this.mapPanningHelper = mapPanningHelper;
    this.cameraPan = cameraPan;
    this.player = player;
    this.world = world;
    this.reverse = false;
    this.unitList = [];
    this.disposables = new CompositeDisposable();
    const onSpawned = (obj: any) => {
      if (obj.isTechno() && obj.owner === player) this.unitList.push(obj);
    };
    this.world.onObjectSpawned.subscribe(onSpawned);
    this.disposables.add(() => this.world.onObjectSpawned.unsubscribe(onSpawned));
  }

  /** 取下一个单位（惰性创建生成器）。 */
  getNextUnit(): any {
    if (!this.generator) this.generator = this.generate();
    return this.generator.next().value;
  }

  /**
   * 无限循环扫描己方单位；选中哈希变化时 break 重开一轮。
   */
  *generate(): Generator<any, void, unknown> {
    for (;;) {
      let list = (this.unitList = this.player
        .getOwnedObjects()
        .filter((o: any) => o.isUnit())
        .sort(
          (a: any, b: any) =>
            a.tile.dx +
            1e3 * a.tile.dy -
            (b.tile.dx + 1e3 * b.tile.dy) +
            0.1 * (b.position.subCell - a.position.subCell),
        ));
      if (list.length) {
        let idx = this.reverse ? list.length : -1;
        const selected = this.unitSelectionHandler.getSelectedUnits();
        let found: number;
        if (selected.length > 1 && selected[0].isUnit() && (found = list.indexOf(selected[0])) !== -1) {
          idx = found;
        }
        while (this.reverse ? --idx >= 0 : ++idx < list.length) {
          if (this.unitSelectionHandler.getHash() !== this.lastSelectionHash) {
            this.lastSelectionHash = this.unitSelectionHandler.getHash();
            break;
          }
          const unit = list[idx];
          if (unit.owner === this.player && unit.isSpawned) {
            yield unit;
          }
        }
      } else {
        yield void 0;
      }
    }
  }

  /**
   * 设置循环方向。
   * @param reverse true=反向
   */
  setReverse(reverse: boolean): void {
    this.reverse = reverse;
  }

  /** 选中下一个并居中。 */
  execute(): void {
    let unit = this.getNextUnit();
    if (unit) {
      this.unitSelectionHandler.selectSingleUnit(unit);
      this.lastSelectionHash = this.unitSelectionHandler.getHash();
      const tile = unit.tile;
      const pan = this.mapPanningHelper.computeCameraPanFromTile(tile.rx, tile.ry);
      this.cameraPan.setPan(pan);
    }
  }

  /** 释放 spawn 订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
