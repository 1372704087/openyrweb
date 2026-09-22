/**
 * DeployerTrait — 展开/收起武器部署 trait（机枪碉堡、坦克碉堡等）。
 *
 * setDeployed 切换展开态：步兵同步 stance；展开进入 PreparingToFire
 * 状态机（准备→抬枪→开火），按 areaFire/radLevel 计算辐射冷却；
 * 收起在 FiringUp 时清 isFiring。undeployDelay 到期自动收起。
 * getHash/debugGetState 供同步与调试。
 *
 * 由 game/gameobject/trait/DeployerTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { StanceType } from "game/gameobject/infantry/StanceType"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/** 部署开火状态机（孪生不导出，仅模块内使用）。 */
enum DeployFireState {
  None = 0,
  PreparingToFire = 1,
  FiringUp = 2,
  Firing = 3,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DeployerTrait {
  /** 宿主对象。 */
  gameObject: any;
  /** 当前是否已展开。 */
  deployed: boolean;
  /** 展开后到可开火的准备延迟剩余 tick。 */
  deployFireDelay: number;
  /** 开火状态机当前状态。 */
  deployFireState: DeployFireState;
  /** 抬枪动画延迟剩余 tick。 */
  fireUpDelay: number;
  /** 本次展开累计开火次数（辐射首发放大扣减用）。 */
  deployFireCount: number;
  /** 当前用于区域开火的武器（仅 areaFire 有效）。 */
  deployWeapon: any;
  /** 自动收起剩余延迟；undefined 表示无自动收起。 */
  undeployDelay: number | undefined;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.deployed = !1;
    this.deployFireDelay = 0;
    this.deployFireState = DeployFireState.None;
    this.fireUpDelay = 0;
    this.deployFireCount = 0;
  }

  /** 是否已展开。 */
  isDeployed(): boolean {
    return this.deployed;
  }

  /** 切换展开态并同步 stance / 开火状态机。 */
  setDeployed(deployed: boolean): void {
    const prev = this.deployed;
    if ((this.deployed = deployed) === prev) return;
    const obj = this.gameObject;
    if (obj.isInfantry()) obj.stance = deployed ? StanceType.Deployed : StanceType.None;
    if (deployed) {
      this.deployFireState = DeployFireState.PreparingToFire;
      const weapon = this.gameObject.armedTrait?.getDeployFireWeapon();
      this.deployWeapon = weapon?.rules.areaFire ? weapon : void 0;
      this.deployFireDelay =
        15 + ((weapon === obj.primaryWeapon ? obj.secondaryWeapon : obj.primaryWeapon)?.getCooldownTicks() ?? 0);
      this.deployFireCount = 0;
      this.undeployDelay = this.gameObject.rules.undeployDelay || void 0;
    } else {
      if (this.deployFireState === DeployFireState.FiringUp) obj.isFiring = !1;
      this.deployFireState = DeployFireState.None;
      this.deployWeapon = void 0;
    }
  }

  /** 翻转展开态。 */
  toggleDeployed(): void {
    this.setDeployed(!this.isDeployed());
  }

  /** 每 tick：自动收起倒计时 + 展开开火状态机推进。 */
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any): void {
    if (
      void 0 !== this.undeployDelay &&
      (0 < this.undeployDelay && this.undeployDelay--,
      this.undeployDelay <= 0 &&
        [DeployFireState.None, DeployFireState.PreparingToFire].includes(this.deployFireState))
    ) {
      this.undeployDelay = void 0;
      this.setDeployed(!1);
      return;
    }
    if (this.deployWeapon && this.deployFireState !== DeployFireState.None) {
      if (this.deployFireState === DeployFireState.PreparingToFire) {
        if (0 < this.deployFireDelay-- || 0 === obj.ammo) return;
        if (0 < this.computeDeployFireCooldown(this.deployWeapon, world)) return;
        this.fireUpDelay = Math.max(1, obj.art.fireUp);
        this.deployFireState = DeployFireState.FiringUp;
      }
      if (this.deployFireState === DeployFireState.FiringUp) {
        obj.isFiring = !0;
        if (0 < this.fireUpDelay--) return;
        this.deployFireState = DeployFireState.Firing;
      }
      if (this.deployFireState === DeployFireState.Firing) {
        obj.isFiring = !1;
        const bridge = obj.onBridge ? world.map.tileOccupation.getBridgeOnTile(obj.tile) : void 0;
        this.deployWeapon.fire(world.createTarget(bridge, obj.tile), world);
        this.deployFireCount++;
        (this.deployWeapon === obj.primaryWeapon ? obj.secondaryWeapon : obj.primaryWeapon)?.resetCooldown();
        if (this.deployWeapon.rules.fireOnce) {
          this.deployFireState = DeployFireState.None;
          this.deployWeapon = void 0;
        } else {
          this.deployFireState = DeployFireState.PreparingToFire;
        }
      }
    }
  }

  /** 部展开武器冷却：辐射区域武器按 radDuration 扣减，否则武器固有冷却。 */
  computeDeployFireCooldown(weapon: any, world: any): number {
    if (weapon.rules.radLevel && weapon.rules.areaFire) {
      const tile = this.gameObject.tile;
      const site = world.mapRadiationTrait.getRadSiteLevel(tile);
      if (!site) return 0;
      const rad = world.rules.radiation;
      let delay = Math.max(0, site * rad.radDurationMultiple - rad.radLevelDelay);
      if (1 === this.deployFireCount) {
        const total = rad.radDurationMultiple * weapon.rules.radLevel;
        delay = Math.max(0, delay - Math.floor(0.25 * total));
      }
      return delay;
    }
    return weapon.getCooldownTicks();
  }

  /** 同步哈希：展开态 1 位。 */
  getHash(): number {
    return this.deployed ? 1 : 0;
  }

  /** 调试状态。 */
  debugGetState(): Record<string, unknown> {
    return { deployed: this.deployed };
  }

  /** 释放宿主引用。 */
  dispose(): void {
    this.gameObject = void 0;
  }
}
