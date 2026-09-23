/**
 * WarheadDetonateFxHandler — 弹头爆炸特效处理器。
 *
 * 订阅 WarheadDetonate：若 explodeAnim 存在则在 position 处播；子弹目标
 * 会在 ±worldTile/8 内随机平移；闪电打击再随机播 weatherConBolts 之一。
 *
 * 由 engine/renderable/fx/handler/WarheadDetonateFxHandler.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { getRandomInt } from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 弹头爆炸特效处理器。
 */
export class WarheadDetonateFxHandler {
  /** 游戏。 */
  game: any;
  /** 渲染管理器。 */
  renderableManager: any;
  /** 复合可释放。 */
  disposables: any;
  /** 爆炸回调。 */
  handleWarheadDetonation: (ev: any) => void;

  /**
   * @param game - 游戏
   * @param renderableManager - 渲染管理器
   */
  constructor(game: any, renderableManager: any) {
    this.game = game;
    this.renderableManager = renderableManager;
    this.disposables = new CompositeDisposable();

    this.handleWarheadDetonation = (ev: any) => {
      const explodeAnim = ev.explodeAnim;
      if (explodeAnim) {
        this.renderableManager.createTransientAnim(explodeAnim, (anim: any) => {
          let pos = ev.position.clone();
          // 子弹类目标：在地块 1/8 尺寸半径内随机散布
          if (ev.target.rules.bullets) {
            const jitter = Coords.getWorldTileSize() / 8;
            pos = new THREE.Vector3(getRandomInt(-jitter, jitter), 0, getRandomInt(-jitter, jitter)).add(pos);
          }
          anim.setPosition(pos);
        });
      }
      // 闪电打击：随机选一道 bolts 动画
      if (ev.isLightningStrike) {
        const boltsList = this.game.rules.audioVisual.weatherConBolts;
        const boltAnim = boltsList[getRandomInt(0, boltsList.length - 1)];
        this.renderableManager.createTransientAnim(boltAnim, (anim: any) => {
          anim.setPosition(ev.position);
        });
      }
    };
  }

  /** 订阅 WarheadDetonate。 */
  init(): void {
    this.disposables.add(
      this.game.events.subscribe(EventType.WarheadDetonate, this.handleWarheadDetonation),
    );
  }

  /** 释放订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
