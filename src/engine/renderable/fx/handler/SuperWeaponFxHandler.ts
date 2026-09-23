/**
 * SuperWeaponFxHandler — 超级武器特效处理器。
 *
 * 订阅三类事件：
 * - LightningStormCloud：随机云动画，lightingFx?.waitForCloudAnim 挂接；
 * - LightningStormManifest：创建 LightningStormFx 并加入 lightingDirector；
 * - SuperWeaponActivate：按类型分别播铁幕/力场/心灵主宰/超时空球动画，
 *   心灵主宰先加 DominatorLightingFx 红屏，再在 flightLevel=750 处播 FirstAnim。
 *
 * 由 engine/renderable/fx/handler/SuperWeaponFxHandler.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { getRandomInt } from "util/math"; // 已转换
import * as LightningStormFxModule from "engine/gfx/lighting/LightningStormFx"; // 孪生
import * as DominatorLightingFxModule from "engine/gfx/lighting/DominatorLightingFx"; // 孪生
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { SuperWeaponType } from "game/type/SuperWeaponType"; // 已转换
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const LightningStormFx: any = (LightningStormFxModule as any).LightningStormFx;
const DominatorLightingFx: any = (DominatorLightingFxModule as any).DominatorLightingFx;

/**
 * 超级武器特效处理器。
 */
export class SuperWeaponFxHandler {
  /** 游戏。 */
  game: any;
  /** 渲染管理器。 */
  renderableManager: any;
  /** 光照导演。 */
  lightingDirector: any;
  /** 复合可释放。 */
  disposables: any;
  /** 当前闪电风暴特效实例（Manifest 时创建）。 */
  lightingFx: any;
  /** 超时空球放置动画（createChronoSphereAnim 创建）。 */
  chronoSphereAnim: any | undefined;

  /**
   * @param game - 游戏
   * @param renderableManager - 渲染管理器
   * @param lightingDirector - 光照导演
   */
  constructor(game: any, renderableManager: any, lightingDirector: any) {
    this.game = game;
    this.renderableManager = renderableManager;
    this.lightingDirector = lightingDirector;
    this.disposables = new CompositeDisposable();
  }

  /** 订阅云/显形/激活事件。 */
  init(): void {
    this.disposables.add(
      // 风暴云：随机云动画并挂到当前 lightingFx
      this.game.events.subscribe(EventType.LightningStormCloud, (ev: any) => {
        const clouds = this.game.rules.audioVisual.weatherConClouds;
        const cloudName = clouds[getRandomInt(0, clouds.length - 1)];
        const anim = this.renderableManager.createTransientAnim(cloudName, (a: any) => {
          a.setPosition(ev.position);
        });
        this.lightingFx?.waitForCloudAnim(anim);
      }),
      // 风暴显形：创建 LightningStormFx
      this.game.events.subscribe(EventType.LightningStormManifest, () => {
        const fx = (this.lightingFx = new LightningStormFx(
          this.game.rules.general.lightningStorm.duration / GameSpeed.BASE_TICKS_PER_SECOND,
          this.game.map.getIonLighting(),
        ));
        this.lightingDirector.addEffect(fx);
      }),
      // 超武激活：按类型分支
      this.game.events.subscribe(EventType.SuperWeaponActivate, (ev: any) => {
        const type = ev.target;
        if (type === SuperWeaponType.IronCurtain) {
          this.renderableManager.createTransientAnim(
            this.game.rules.audioVisual.ironCurtainInvokeAnim,
            (a: any) => {
              const t = Coords.tile3dToWorld(ev.atTile.rx + 0.5, ev.atTile.ry + 0.5, ev.atTile.z);
              a.setPosition(t);
            },
          );
        } else if (type === SuperWeaponType.ForceShield) {
          this.renderableManager.createTransientAnim(
            this.game.rules.audioVisual.forceShieldInvokeAnim,
            (a: any) => {
              const t = Coords.tile3dToWorld(ev.atTile.rx + 0.5, ev.atTile.ry + 0.5, ev.atTile.z);
              a.setPosition(t);
            },
          );
        } else if (type === SuperWeaponType.PsychicDominator) {
          // 先红屏光照，再在 750 leptons 高度播尤里头像 FirstAnim
          this.lightingDirector.addEffect(new DominatorLightingFx());
          const av = this.game.rules.audioVisual;
          if (av.dominatorFirstAnim) {
            this.renderableManager.createTransientAnim(av.dominatorFirstAnim, (a: any) => {
              const t = Coords.tile3dToWorld(ev.atTile.rx + 0.5, ev.atTile.ry + 0.5, ev.atTile.z);
              t.y += 750;
              a.setPosition(t);
            });
          }
        } else if (type === SuperWeaponType.ChronoSphere) {
          this.disposeChronoSphereAnim();
          const elev1 = this.game.map.tileOccupation.getBridgeOnTile(ev.atTile)?.tileElevation ?? 0;
          const from = Coords.tile3dToWorld(ev.atTile.rx + 0.5, ev.atTile.ry + 0.5, ev.atTile.z + elev1);
          const destTile = ev.atTile2;
          const elev2 = this.game.map.tileOccupation.getBridgeOnTile(destTile)?.tileElevation ?? 0;
          const to = Coords.tile3dToWorld(destTile.rx + 0.5, destTile.ry + 0.5, destTile.z + elev2);
          this.renderableManager.createTransientAnim(this.game.rules.audioVisual.chronoBlast, (a: any) => {
            a.setPosition(from);
          });
          this.renderableManager.createTransientAnim(this.game.rules.audioVisual.chronoBlastDest, (a: any) => {
            a.setPosition(to);
          });
        }
      }),
    );
  }

  /**
   * 创建超时空球放置动画（外部调用，用于规划阶段预览）。
   * @param tile - 放置地块
   */
  createChronoSphereAnim(tile: any): void {
    this.chronoSphereAnim = this.renderableManager.createAnim(
      this.game.rules.audioVisual.chronoPlacement,
      (a: any) => {
        const elev = this.game.map.tileOccupation.getBridgeOnTile(tile)?.tileElevation ?? 0;
        const pos = Coords.tile3dToWorld(tile.rx + 0.5, tile.ry + 0.5, tile.z + elev);
        a.setPosition(pos);
      },
    );
  }

  /** 销毁超时空球放置动画。 */
  disposeChronoSphereAnim(): void {
    const anim = this.chronoSphereAnim;
    if (anim) {
      this.renderableManager.getRenderableContainer()?.remove(anim);
      anim.dispose();
    }
  }

  /** 清理特效与订阅。 */
  dispose(): void {
    this.lightingFx = void 0;
    this.disposeChronoSphereAnim();
    this.disposables.dispose();
  }
}
