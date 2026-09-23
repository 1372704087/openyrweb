/**
 * MagnetronBeamPlugin — 磁电炮持续牵引光束（MagBeamFx，拖拽或对地攻击）。
 *
 * 从 IsMagBeam 武器 rules 构建波纹参数；拖拽车辆/攻击目标时创建持续光束，
 * 车辆目标从目标向炮口生长，建筑/地面反向；目标消失时 startDying 收束。
 *
 * 由 engine/renderable/entity/plugin/MagnetronBeamPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as MagBeamFxModule from "engine/renderable/fx/MagBeamFx"; // 孪生
import { Coords } from "game/Coords"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const MagBeamFx: any = (MagBeamFxModule as any).MagBeamFx;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** MagBeamFx 参数。 */
type MagBeamParams = {
  waveColor: any;
  waveIntensity: any;
  waveIsHouseColor: boolean;
  waveReverse: boolean;
  growFromTarget: boolean;
  growthSpeed: number;
  width: number;
  waveFrequency: number;
  waveSpeed: number;
  pulseStrength: number;
  pulseRate: number;
  alpha: number;
  durationSeconds: any;
  color: any;
};

/** 磁电光束插件。 */
export class MagnetronBeamPlugin {
  /** 源磁电炮。 */
  source: any;
  /** 当前光束。 */
  beam?: any;
  /** 渲染管理器。 */
  renderableManager?: any;
  /** 对车辆是否反转波纹方向。 */
  private _waveReverseAgainstVehicles = false;
  /** 光束参数。 */
  private _params: MagBeamParams | null;

  /** @param source - 磁电炮单位 */
  constructor(source: any) {
    this.source = source;
    this.beam = void 0;
    this.renderableManager = void 0;
    this._waveReverseAgainstVehicles = false;
    this._params = this._resolveParams();
  }

  /** Find the IsMagBeam weapon on this unit and build MagBeamFx params from it. */
  private _resolveParams(): MagBeamParams | null {
    const src = this.source;
    let wr: any = null;
    // Search primary then secondary for IsMagBeam weapon.
    if (src.primaryWeapon && src.primaryWeapon.rules && src.primaryWeapon.rules.isMagBeam) {
      wr = src.primaryWeapon.rules;
    } else if (src.secondaryWeapon && src.secondaryWeapon.rules && src.secondaryWeapon.rules.isMagBeam) {
      wr = src.secondaryWeapon.rules;
    }
    if (!wr) return null;
    // Store wave reversal flag for per-frame direction control in update().
    this._waveReverseAgainstVehicles = wr.waveReverseAgainstVehicles;
    // Build params for shader-based MagBeamFx (vanilla YR Wave blending).
    // Formula: result = c + color*x + c*intensity*x  (Ares reverse-engineered)
    const houseColor = wr.waveIsHouseColor
      ? new (THREE as any).Color(src.owner ? src.owner.color.asHex() : 0xb000d0)
      : null;
    return {
      waveColor: wr.waveColor,
      waveIntensity: wr.waveIntensity,
      waveIsHouseColor: wr.waveIsHouseColor,
      waveReverse: false, // set per-frame via setWaveReverse()
      growFromTarget: false, // set per-frame via update()
      growthSpeed: 3.0, // 光束生长/收缩速度（每秒）
      width: wr.magnaBeamWidth,
      waveFrequency: wr.magnaBeamWaveFrequency,
      waveSpeed: wr.magnaBeamWaveSpeed,
      pulseStrength: wr.magnaBeamPulse,
      pulseRate: wr.magnaBeamPulseRate,
      alpha: wr.magnaBeamAlpha,
      durationSeconds: null, // continuous beam, no timeout
      color: houseColor,
    };
  }

  /** 注入渲染管理器。 */
  onCreate(rm: any): void {
    this.renderableManager = rm;
  }

  /** 每帧：创建/更新/收束光束并同步波纹方向。 */
  update(): void {
    const src = this.source;
    if (!src || src.isDestroyed || src.isCrashing || src.isDisposed) {
      this.disposeBeam();
      return;
    }
    const victim = src.magnetronDragging;
    let beamTarget: any = null;

    // Case 1: dragging a vehicle (existing behaviour).
    if (victim && !victim.isDestroyed && !victim.isDisposed) {
      beamTarget = victim;
    } else {
      // Case 2: attacking a building/target with IsMagBeam weapon (no drag).
      // Render a continuous beam while the Magnetron is actively firing at a target.
      beamTarget = this._getAttackBeamTarget(src);
    }

    if (!beamTarget) {
      if (this.beam) {
        if (!this.beam.isDying()) this.beam.startDying();
        if (this.beam.isFinished()) this.beam = void 0;
      }
      return;
    }

    // 炮口位置 = 单位位置 + PrimaryFireFLH 偏移（含炮塔旋转）
    const a = src.position.worldPosition.clone();
    try {
      const flh = src.art && src.art.primaryFireFlh;
      if (flh && (flh.forward || flh.lateral || flh.vertical)) {
        const muzzleFacing = src.turretTrait ? src.turretTrait.facing : src.direction;
        const rad = (muzzleFacing * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const lx = flh.lateral;
        const fy = flh.forward;
        const rx = lx * cos - fy * sin; // rotated lateral
        const ry = lx * sin + fy * cos; // rotated forward
        // 炮塔偏移（TurretOffset 沿车身中心线）
        const turretOff = (src.art && src.art.turretOffset) || 0;
        if (turretOff) {
          const dirRad = (src.direction * Math.PI) / 180;
          a.x += -turretOff * Math.sin(dirRad);
          a.z += -turretOff * Math.cos(dirRad);
        }
        // FLH 偏移：leptons → world（X/Z 1:1，Y 同 world 单位）
        a.x += rx;
        a.z += -ry;
        a.y += flh.vertical;
      }
    } catch (_err) {}
    let b: any;
    // Handle both game objects (with position) and tile objects (with rx, ry, z)
    if (beamTarget.position) {
      b = beamTarget.position.worldPosition.clone();
    } else if (typeof beamTarget.getWorldCoords === "function") {
      b = beamTarget.getWorldCoords().clone();
    } else if (beamTarget.rx !== undefined && beamTarget.ry !== undefined) {
      // Tile object: { dx, dy, rx, ry, z, ... } - rx/ry are tile indices
      // Use tile center (rx+0.5, ry+0.5) for proper world position
      b = Coords.tile3dToWorld(beamTarget.rx + 0.5, beamTarget.ry + 0.5, beamTarget.z || 0);
    }
    if (!b) {
      this.disposeBeam();
      return;
    }

    // 目标是车辆/坦克（包括已举起的拖拽目标和正在攻击的车辆）：光束从目标向炮口生长
    // 目标是建筑/地面：光束从炮口向目标生长
    const isVehicleTarget =
      !!(victim && !victim.isDestroyed && !victim.isDisposed) ||
      !!(beamTarget && typeof beamTarget.isVehicle === "function" && beamTarget.isVehicle());

    if (!this.beam) {
      if (!this._params) {
        this._params = {
          waveColor: [0, 0, 0],
          waveIntensity: [128, 0, 1024],
          waveIsHouseColor: false,
          waveReverse: false,
          growFromTarget: false,
          growthSpeed: 3.0,
          width: 10.0,
          waveFrequency: 6.0,
          waveSpeed: 2.2,
          pulseStrength: 0.3,
          pulseRate: 3.5,
          alpha: 0.85,
          durationSeconds: null,
          color: null,
        };
      }
      this._params.growFromTarget = isVehicleTarget;
      const cam = this.renderableManager && this.renderableManager.camera;
      this.beam = new MagBeamFx(a, b, cam, this._params);
      this.renderableManager && this.renderableManager.addEffect(this.beam);
    } else if (!this.beam.isDying()) {
      this.beam.updateEndpoints(a, b);
    } else if (this.beam.isFinished()) {
      // 旧光束已缩完，清理后下帧创建新光束
      this.beam = void 0;
    }
    // 波纹方向：车辆目标从目标流向炮口，建筑/地面从炮口流向目标
    if (this.beam) {
      this.beam.setWaveReverse(this._waveReverseAgainstVehicles && isVehicleTarget);
    }
  }

  /**
   * Check if the source is attacking a target with an IsMagBeam weapon
   * (e.g. MagneShake vs buildings, or ground attack) and return the attack target for beam rendering.
   * @param src - 源单位
   */
  private _getAttackBeamTarget(src: any): any {
    try {
      const at = src.attackTrait;
      if (!at || !at.currentTarget) return null;
      // Must be actively firing (not in Idle/CheckRange).
      // AttackState: Idle=0, CheckRange=1, PrepareToFire=2, FireUp=3, Firing=4, JustFired=5
      // Allow beam through PrepareToFire/FireUp/Firing/JustFired to avoid gaps between shots.
      if (at.attackState == null || at.attackState <= 1) return null;
      // Support both object targets and ground (tile) targets
      const target = at.currentTarget.obj || at.currentTarget.tile;
      if (!target) return null;
      // For object targets, check if destroyed/disposed
      if (target.isDestroyed || target.isDisposed) return null;
      // Verify the source has an IsMagBeam weapon (primary or secondary).
      // The MagnetronBeamPlugin is only created for units with IsMagBeam weapons,
      // but double-check to be safe.
      const hasMagBeam =
        (src.primaryWeapon && src.primaryWeapon.rules && src.primaryWeapon.rules.isMagBeam) ||
        (src.secondaryWeapon && src.secondaryWeapon.rules && src.secondaryWeapon.rules.isMagBeam);
      if (!hasMagBeam) return null;
      return target;
    } catch (_err) {
      return null;
    }
  }

  /** 移除时清理。 */
  onRemove(): void {
    this.renderableManager = void 0;
    this.disposeBeam();
  }

  /** dispose 光束。 */
  dispose(): void {
    this.disposeBeam();
  }

  /** 移除并 dispose 光束。 */
  disposeBeam(): void {
    if (this.beam) {
      this.beam.removeAndDispose();
      this.beam = void 0;
    }
  }
}
