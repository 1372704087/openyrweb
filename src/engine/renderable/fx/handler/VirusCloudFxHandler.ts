/**
 * VirusCloudFxHandler — 病毒狙击毒云视觉处理器。
 *
 * 订阅 VirusCloud 事件三种 action：
 * - spawn：在游戏侧位置 + 随机偏移创建毒云 puff（默认 TXGASG），强制
 *   loopCount=-1 无限循环，rate 由 StateAIAdvance 推导；每帧按 ACCEL 积分
 *   速度/位置（与 VirusCloudTrait 一致），并按 Translucency 设 opacity；
 * - vel：风向变化时先积分到当前状态，再把 target 切到新风速并重置 spawnTick；
 * - remove：remove/dispose 并从表中删除。
 *
 * 由 engine/renderable/fx/handler/VirusCloudFxHandler.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { EventType } from "game/event/EventType"; // 已转换
import { getRandomInt } from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 每游戏 tick 最大速度变化，须与 VirusCloudTrait.ACCEL 一致。 */
const ACCEL = 0.03;

/** puff 上挂在的漂移/速度状态字段。 */
type PuffWithVc = any;

/**
 * 病毒毒云视觉处理器。
 * 每个游戏侧气体粒子映射一个循环 puff。
 */
export class VirusCloudFxHandler {
  /** 游戏。 */
  game: any;
  /** 渲染管理器。 */
  renderableManager: any;
  /** 复合可释放。 */
  disposables: any;
  /** cloudId → puff 动画。 */
  animsByCloud = new Map<any, any>();
  /** 统一事件回调。 */
  handleEvent: (ev: any) => void;

  /**
   * @param game - 游戏
   * @param renderableManager - 渲染管理器
   */
  constructor(game: any, renderableManager: any) {
    this.game = game;
    this.renderableManager = renderableManager;
    this.disposables = new CompositeDisposable();

    this.handleEvent = (ev: any) => {
      if (ev.type !== EventType.VirusCloud) return;
      const c = ev as any;

      if (c.action === "spawn") {
        if (this.animsByCloud.has(c.cloudId)) return;
        const tileSize = Coords.getWorldTileSize();
        let base: any =
          c.position ?? Coords.tile3dToWorld(c.tile.rx + 0.5, c.tile.ry + 0.5, c.tile.z);
        base = new THREE.Vector3(
          getRandomInt(-tileSize / 8, tileSize / 8),
          0,
          getRandomInt(-tileSize / 8, tileSize / 8),
        ).add(base);

        const v = c.visual ?? {};
        const opacity = 1 - (v.translucency ?? 0) / 100;
        // 游戏侧锁定步进 PRNG 给出的确定性漂移速度（lepton/tick）
        const vel = c.vel ?? { x: 0, y: 0, z: 0 };
        const spawnTick = this.game.currentTick ?? 0;
        const puff: PuffWithVc = this.renderableManager.createTransientAnim(
          v.image || "TXGASG",
          (a: any) => {
            a.setPosition(base);
          },
        );
        const origUpdate = puff.update.bind(puff);
        puff._vcBase = base;
        puff._vcVel = new THREE.Vector3(vel.x ?? 0, vel.y ?? 0, vel.z ?? 0);
        // 风目标速度；实际速度以 ACCEL/tick 向其斜坡（同 VirusCloudTrait）
        puff._vcTarget = new THREE.Vector3(vel.tx ?? 0, 0, vel.tz ?? 0);
        puff._vcSpawnTick = spawnTick;

        // 首帧强制 loopCount=-1（不能用 playRemainingLoops(-1)，那会 endLoop 提前停）
        let looped = false;
        puff.update = (now: number) => {
          if (!looped) {
            looped = true;
            if (puff.animation) {
              puff.animation.props.loopCount = -1;
              puff.animation.props.rate = 15 / Math.max(1, v.stateAIAdvance ?? 4);
            }
          }
          origUpdate(now);
          const ticks = Math.max(0, (this.game.currentTick ?? 0) - puff._vcSpawnTick);
          const st = this.stepPuff(puff, ticks);
          const pos = new THREE.Vector3(st.px, puff._vcBase.y + puff._vcVel.y * ticks, st.pz);
          puff.setPosition(pos);
          puff.mainObj?.setOpacity(opacity);
        };
        this.animsByCloud.set(c.cloudId, puff);
      } else if (c.action === "vel") {
        // 周期风向变化：先积分到当前，再切新 target 并重置 spawnTick
        const puff = this.animsByCloud.get(c.cloudId);
        if (puff) {
          const nt = this.game.currentTick ?? 0;
          const dt = Math.max(0, nt - puff._vcSpawnTick);
          const st = this.stepPuff(puff, dt);
          const nv = c.vel ?? { tx: 0, tz: 0 };
          puff._vcVel = new THREE.Vector3(st.vx, puff._vcVel.y, st.vz);
          puff._vcBase = new THREE.Vector3(st.px, puff._vcBase.y + puff._vcVel.y * dt, st.pz);
          puff._vcTarget = new THREE.Vector3(nv.tx ?? 0, 0, nv.tz ?? 0);
          puff._vcSpawnTick = nt;
        }
      } else if (c.action === "remove") {
        const puff = this.animsByCloud.get(c.cloudId);
        if (puff) {
          puff.remove?.();
          puff.dispose?.();
          this.animsByCloud.delete(c.cloudId);
        }
      }
    };
  }

  /**
   * 按 `ticks` 游戏帧推进 puff 的速度与位置。
   * 每 tick 向 _vcTarget 的速度变化不超过 ACCEL（与游戏侧积分一致）。
   * @param puff - 带 _vcVel/_vcTarget/_vcBase 的 puff
   * @param ticks - 推进帧数
   */
  stepPuff(puff: any, ticks: number): { vx: number; vz: number; px: number; pz: number } {
    let vx = puff._vcVel.x;
    let vz = puff._vcVel.z;
    let px = puff._vcBase.x;
    let pz = puff._vcBase.z;
    for (let i = 0; i < ticks; i++) {
      vx += Math.max(-ACCEL, Math.min(ACCEL, puff._vcTarget.x - vx));
      vz += Math.max(-ACCEL, Math.min(ACCEL, puff._vcTarget.z - vz));
      px += vx;
      pz += vz;
    }
    return { vx, vz, px, pz };
  }

  /** 订阅 VirusCloud 事件。 */
  init(): void {
    this.disposables.add(this.game.events.subscribe(this.handleEvent));
  }

  /** 清理全部 puff 与订阅。 */
  dispose(): void {
    this.animsByCloud.forEach((puff) => {
      puff.remove?.();
      puff.dispose?.();
    });
    this.animsByCloud.clear();
    this.disposables.dispose();
  }
}
