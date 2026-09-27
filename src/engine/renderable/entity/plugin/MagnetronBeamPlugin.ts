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

  /** 从本单位的武器中查找 IsMagBeam 武器，并据此构建 MagBeamFx 参数。 */
  private _resolveParams(): MagBeamParams | null {
    const src = this.source;
    let wr: any = null;
    // 先查主武器、再查副武器上的 IsMagBeam。
    if (src.primaryWeapon && src.primaryWeapon.rules && src.primaryWeapon.rules.isMagBeam) {
      wr = src.primaryWeapon.rules;
    } else if (src.secondaryWeapon && src.secondaryWeapon.rules && src.secondaryWeapon.rules.isMagBeam) {
      wr = src.secondaryWeapon.rules;
    }
    if (!wr) return null;
    // 记录波纹反转开关，供 update() 每帧控制方向。
    this._waveReverseAgainstVehicles = wr.waveReverseAgainstVehicles;
    // 构建 shader 版 MagBeamFx 的参数（原版 YR Wave 混合）。
    // 混合公式：result = c + color*x + c*intensity*x（Ares 逆向）。
    const houseColor = wr.waveIsHouseColor
      ? new (THREE as any).Color(src.owner ? src.owner.color.asHex() : 0xb000d0)
      : null;
    return {
      waveColor: wr.waveColor,
      waveIntensity: wr.waveIntensity,
      waveIsHouseColor: wr.waveIsHouseColor,
      waveReverse: false, // 每帧经 setWaveReverse() 设置
      growFromTarget: false, // 每帧经 update() 设置
      growthSpeed: 3.0, // 光束生长/收缩速度（每秒）
      width: wr.magnaBeamWidth,
      waveFrequency: wr.magnaBeamWaveFrequency,
      waveSpeed: wr.magnaBeamWaveSpeed,
      pulseStrength: wr.magnaBeamPulse,
      pulseRate: wr.magnaBeamPulseRate,
      alpha: wr.magnaBeamAlpha,
      durationSeconds: null, // 持续光束，无时限
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

    // 情形一：正在拖拽载具（既有行为）。
    if (victim && !victim.isDestroyed && !victim.isDisposed) {
      beamTarget = victim;
    } else {
      // 情形二：用 IsMagBeam 武器攻击建筑/其他目标（非拖拽）。
      // 磁电持续开火时渲染连续光束。
      beamTarget = this._getAttackBeamTarget(src);
    }

    if (!beamTarget) {
      if (this.beam) {
        if (!this.beam.isDying()) this.beam.startDying();
        if (this.beam.isFinished()) {
          this.beam = void 0;
          // 光束收缩动画播完：消费 MagnetronDragTask 的断束挂起标志，
          // 受害者自此才开始坠落（原版"先播断束动画、播完再坠"时序）。
          src.magnetronBeamBreakPending = false;
        }
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
        const rx = lx * cos - fy * sin; // 旋转后的横向分量
        const ry = lx * sin + fy * cos; // 旋转后的前向分量
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
    // 兼容两类目标：带 position 的游戏对象与带 rx/ry/z 的 tile 对象
    if (beamTarget.position) {
      b = beamTarget.position.worldPosition.clone();
    } else if (typeof beamTarget.getWorldCoords === "function") {
      b = beamTarget.getWorldCoords().clone();
    } else if (beamTarget.rx !== undefined && beamTarget.ry !== undefined) {
      // tile 对象：{ dx, dy, rx, ry, z, ... }——rx/ry 为 tile 索引
      // 取 tile 中心（rx+0.5, ry+0.5）换算正确的世界坐标
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
      // 旧光束已缩完，清理后下帧创建新光束；同样消费断束挂起标志
      //（该收缩动画播完，等待中的受害者即可坠落）。
      this.beam = void 0;
      src.magnetronBeamBreakPending = false;
    }
    // 波纹方向：车辆目标从目标流向炮口，建筑/地面从炮口流向目标
    if (this.beam) {
      this.beam.setWaveReverse(this._waveReverseAgainstVehicles && isVehicleTarget);
    }
  }

  /**
   * 判定源单位是否正用 IsMagBeam 武器攻击目标（如 MagneShake 打建筑、
   * 或对地攻击），返回用于光束渲染的攻击目标。
   * @param src - 源单位
   */
  private _getAttackBeamTarget(src: any): any {
    try {
      const at = src.attackTrait;
      if (!at || !at.currentTarget) return null;
      // 必须处于开火状态（不能是 Idle/CheckRange）。
      // AttackState：Idle=0、CheckRange=1、PrepareToFire=2、FireUp=3、Firing=4、JustFired=5
      // PrepareToFire/FireUp/Firing/JustFired 期间都放行光束，避免连射间隙闪烁。
      if (at.attackState == null || at.attackState <= 1) return null;
      // 同时支持对象目标与地面（tile）目标
      const target = at.currentTarget.obj || at.currentTarget.tile;
      if (!target) return null;
      // 对象目标需检查是否已销毁/移除
      if (target.isDestroyed || target.isDisposed) return null;
      // 校验源单位确有 IsMagBeam 武器（主武器或副武器）。
      // MagnetronBeamPlugin 本就只为带 IsMagBeam 武器的单位创建，
      // 这里再核一道以防万一。
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
