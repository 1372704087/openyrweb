/**
 * Projectile — 弹道渲染件（SHP/VXL/声波 + 多种武器特效挂载）。
 *
 * update 按 velocity 推进、朝向四元数/帧号、Impact 隐藏并播 impactAnim；
 * onCreate 按 weapon 规则挂 LaserFx/TeslaFx/RadBeamFx/DiskLaserFx/
 * LineTrailFx/SparkFx；声波用类级共享几何材质。firersPalette 时从
 * 射手 art 取盘并可能 remap。
 *
 * 由 engine/renderable/entity/Projectile.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import * as ShpRenderableModule from "engine/renderable/ShpRenderable"; // 孪生
import { ProjectileState } from "game/gameobject/Projectile"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { LaserFx } from "engine/renderable/fx/LaserFx"; // 已转换
import { WeaponType } from "game/WeaponType"; // 已转换
import { TeslaFx } from "engine/renderable/fx/TeslaFx"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { LineTrailFx } from "engine/renderable/fx/LineTrailFx"; // 已转换
import { SparkFx } from "engine/renderable/fx/SparkFx"; // 已转换
import { RadBeamFx } from "engine/renderable/fx/RadBeamFx"; // 已转换
import { DiskLaserFx } from "engine/renderable/fx/DiskLaserFx"; // 已转换
import * as BlobShadowModule from "engine/renderable/entity/unit/BlobShadow"; // 孪生
import * as NukeLightingFxModule from "engine/gfx/lighting/NukeLightingFx"; // 孪生
import * as BatchedMeshModule from "engine/gfx/batch/BatchedMesh"; // 孪生
import * as ObjectRulesModule from "game/rules/ObjectRules"; // 孪生
import * as geometry from "game/math/geometry"; // 已转换
import { PaletteType } from "engine/type/PaletteType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ShpRenderable: any = (ShpRenderableModule as any).ShpRenderable;
const BlobShadow: any = (BlobShadowModule as any).BlobShadow;
const NukeLightingFx: any = (NukeLightingFxModule as any).NukeLightingFx;
const BatchedMesh: any = (BatchedMeshModule as any).BatchedMesh;
const IMAGE_NONE: string = (ObjectRulesModule as any).ObjectRules?.IMAGE_NONE ??
  (ObjectRulesModule as any).IMAGE_NONE;
const quaternionFromVec3: (v: any) => any = (geometry as any).quaternionFromVec3;

/**
 * 弹道渲染件。
 * 类级共享声波几何/材质。
 */
export class Projectile {
  /** 宿主对象。 */
  gameObject: any;
  /** 规则。 */
  rules: any;
  /** 图片查找器。 */
  imageFinder: any;
  /** VXL 集。 */
  voxels: any;
  /** HVA 集。 */
  voxelAnims: any;
  /** 剧场。 */
  theater: any;
  /** 主调色板。 */
  palette: any;
  /** 特殊调色板。 */
  specialPalette: any;
  /** 相机。 */
  camera: any;
  /** 游戏速度。 */
  gameSpeed: any;
  /** 光照。 */
  lighting: any;
  /** 光照导演。 */
  lightingDirector: any;
  /** VXL 工厂。 */
  vxlBuilderFactory: any;
  /** 是否精灵批处理。 */
  useSpriteBatching: any;
  /** 是否 mesh instancing。 */
  useMeshInstancing: any;
  /** 世界音效。 */
  worldSound: any;
  /** 插件。 */
  plugins: any[] = [];
  /** art 规则。 */
  objectArt: any;
  /** 调试名。 */
  label: string;
  /** 调色板组。 */
  paletteRemaps: any[] = [];

  /** 位置组件。 */
  withPosition: any;
  /** 额外光。 */
  extraLight: any;
  /** 外层 Object3D。 */
  target: any;
  /** SHP 渲染件。 */
  shpRenderable: any;
  /** VXL builder。 */
  vxlBuilder: any;
  /** VXL 旋转容器。 */
  vxlRotWrapper: any;
  /** 声波网格。 */
  sonicWaveMesh: any;
  /** 抛物线 blob 影子。 */
  blobShadow: any;
  /** 线拖尾特效。 */
  lineTrailFx: any;
  /** 渲染管理器。 */
  renderableManager: any;
  /** 上次方向角。 */
  lastDirection: any;
  /** 上次状态。 */
  lastState: any;
  /** 圆盘激光射手跟踪。 */
  _diskFirer: any;
  /** 圆盘 FLH 偏移。 */
  _diskFlhOffset: any;

  /** 类级共享声波几何。 */
  static sonicWaveGeometry: any;
  /** 类级共享声波材质。 */
  static sonicWaveMaterial: any;

  /**
   * @param gameObject - 宿主
   * @param rules - 规则
   * @param imageFinder - 图片查找器
   * @param voxels - VXL
   * @param voxelAnims - HVA
   * @param theater - 剧场
   * @param palette - 主盘
   * @param specialPalette - 特殊盘
   * @param camera - 相机
   * @param gameSpeed - 游戏速度
   * @param lighting - 光照
   * @param lightingDirector - 光照导演
   * @param vxlBuilderFactory - VXL 工厂
   * @param useSpriteBatching - 批处理
   * @param useMeshInstancing - instancing
   * @param worldSound - 世界音效
   */
  constructor(
    gameObject: any,
    rules: any,
    imageFinder: any,
    voxels: any,
    voxelAnims: any,
    theater: any,
    palette: any,
    specialPalette: any,
    camera: any,
    gameSpeed: any,
    lighting: any,
    lightingDirector: any,
    vxlBuilderFactory: any,
    useSpriteBatching: any,
    useMeshInstancing: any,
    worldSound: any,
  ) {
    this.gameObject = gameObject;
    this.rules = rules;
    this.imageFinder = imageFinder;
    this.voxels = voxels;
    this.voxelAnims = voxelAnims;
    this.theater = theater;
    this.palette = palette;
    this.specialPalette = specialPalette;
    this.camera = camera;
    this.gameSpeed = gameSpeed;
    this.lighting = lighting;
    this.lightingDirector = lightingDirector;
    this.vxlBuilderFactory = vxlBuilderFactory;
    this.useSpriteBatching = useSpriteBatching;
    this.useMeshInstancing = useMeshInstancing;
    this.worldSound = worldSound;
    this.plugins = [];
    this.objectArt = gameObject.art;
    this.label = "projectile_" + gameObject.rules.name;
    this.withPosition = new WithPosition();
    this.extraLight = new THREE.Vector3();
    this.updateLighting();

    // firersPalette：改用射手 art 的调色板并可能 remap
    if (this.gameObject.rules.firersPalette) {
      const paletteType = this.gameObject.fromObject?.art.paletteType ?? PaletteType.Unit;
      const customName = this.gameObject.fromObject?.art.customPaletteName;
      this.palette = this.theater.getPalette(paletteType, customName);
      if (this.gameObject.art.remapable) {
        this.palette = this.palette.clone();
        this.palette.remap(this.gameObject.fromPlayer.color);
      }
    }
    this.paletteRemaps =
      this.gameObject.rules.firersPalette && this.objectArt.remapable
        ? [...this.rules.colors.values()].map((c) => this.palette.clone().remap(c))
        : [this.palette];
  }

  /**
   * 注册插件。
   * @param plugin - 插件
   */
  registerPlugin(plugin: any): void {
    this.plugins.push(plugin);
  }

  /** 按 isVoxel 切换无环境光/含环境光计算。 */
  updateLighting(): void {
    this.plugins.forEach((p) => p.updateLighting?.());
    if (this.objectArt.isVoxel) {
      this.extraLight.setScalar(
        this.lighting.computeNoAmbient(
          this.objectArt.lightingType,
          this.gameObject.tile,
          this.gameObject.tileElevation,
        ),
      );
    } else {
      this.extraLight
        .copy(
          this.lighting.compute(
            this.objectArt.lightingType,
            this.gameObject.tile,
            this.gameObject.tileElevation,
          ),
        )
        .addScalar(-1);
    }
  }

  /** 弹道不参与拾取。 */
  getIntersectTarget(): void {}

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建外层。 */
  create3DObject(): void {
    let obj = this.get3DObject();
    if (!obj) {
      obj = new THREE.Object3D();
      obj.name = this.label;
      this.target = obj;
      obj.matrixAutoUpdate = false;
      this.withPosition.matrixUpdate = true;
      this.withPosition.applyTo(this);
      this.createObjects(obj);
    }
  }

  /**
   * 设置位置。
   * @param pos - 位置
   */
  setPosition(pos: any): void {
    this.withPosition.setPosition(pos.x, pos.y, pos.z);
  }

  /** 当前位置。 */
  getPosition(): any {
    return this.withPosition.getPosition();
  }

  /**
   * 插件 + 位移 + 朝向 + Impact 处理。
   * @param now - 当前时间戳（ms）
   * @param dt - 位移步长
   */
  update(now: number, dt: number): void {
    this.plugins.forEach((p) => p.update(now));

    if (dt > 0 && !this.gameObject.isDestroyed) {
      const step = this.gameObject.velocity.clone().multiplyScalar(dt);
      const next = step.add(this.gameObject.position.worldPosition);
      this.setPosition(next);
    }
    this.blobShadow?.update(now, dt);

    const direction = this.gameObject.direction;
    if (!this.vxlRotWrapper && this.lastDirection !== void 0 && this.lastDirection === direction) {
      // 方向未变且非 VXL：跳过
    } else if (this.shpRenderable && this.shpRenderable.frameCount > 2) {
      this.lastDirection = direction;
      this.updateShapeFrame(direction);
    } else if (this.vxlRotWrapper) {
      const quat = quaternionFromVec3(this.gameObject.velocity.clone().negate());
      this.vxlRotWrapper.rotation.setFromQuaternion(quat, "YXZ");
      if (this.gameObject.rules.vertical) {
        this.vxlRotWrapper.rotation.y = THREE.Math.degToRad(180 + direction);
      }
      this.vxlRotWrapper.updateMatrix();
    } else if (this.sonicWaveMesh) {
      this.sonicWaveMesh.rotation.y = THREE.Math.degToRad(direction);
      this.sonicWaveMesh.updateMatrix();
    }

    if (this.gameObject.state !== this.lastState) {
      this.lastState = this.gameObject.state;
      if (
        this.gameObject.state === ProjectileState.Impact &&
        !this.gameObject.fromWeapon.rules.isDiskLaser
      ) {
        this.target.visible = false;
        this.renderableManager.createTransientAnim(this.gameObject.impactAnim, (a: any) => {
          a.setPosition(this.withPosition.getPosition());
        });
        if (this.gameObject.isNuke) {
          this.lightingDirector.addEffect(new NukeLightingFx());
        }
      }
    }
  }

  /**
   * 按 direction 映射 32 向帧。
   * @param direction - 朝向角（度）
   */
  updateShapeFrame(direction: number): void {
    let frame = 0;
    if (this.objectArt.rotates) {
      frame = Math.round((((direction - 45 + 360) % 360) / 360) * 32) % 32;
    }
    this.shpRenderable.setFrame(frame);
  }

  /**
   * 构建声波 / VXL / SHP 子对象。
   * @param parent - 父 Object3D
   */
  createObjects(parent: any): void {
    // 声波武器：共享几何材质平面
    if (this.gameObject.fromWeapon.rules.isSonic) {
      Projectile.sonicWaveGeometry ??= this.createSonicWaveGeometry();
      Projectile.sonicWaveMaterial ??= new THREE.MeshBasicMaterial({
        color: 48340,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.DstColorFactor,
        blendDst: THREE.OneFactor,
        transparent: true,
        opacity: 0.25,
        alphaTest: 0.01,
        depthTest: false,
        depthWrite: false,
      });
      const mesh = new (this.useMeshInstancing ? BatchedMesh : THREE.Mesh)(
        Projectile.sonicWaveGeometry,
        Projectile.sonicWaveMaterial,
      );
      mesh.rotation.order = "YXZ";
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.y = THREE.Math.degToRad(this.gameObject.direction);
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      parent.add(mesh);
      this.sonicWaveMesh = mesh;
      return;
    }

    if (
      !this.gameObject.rules.inviso &&
      this.gameObject.rules.imageName !== IMAGE_NONE
    ) {
      if (this.gameObject.art.isVoxel) {
        const baseName = this.objectArt.imageName.toLowerCase();
        const vxlName = baseName + ".vxl";
        const vxl = this.voxels.get(vxlName);
        if (!vxl) {
          throw new Error(
            `VXL missing for projectile ${this.gameObject.rules.name}. Vxl file ${vxlName} not found. `,
          );
        }
        const hva = this.objectArt.noHva ? void 0 : this.voxelAnims.get(baseName + ".hva");
        const builder = this.vxlBuilderFactory.create(vxl, hva, this.paletteRemaps, this.palette);
        builder.setExtraLight(this.extraLight);
        const mesh = builder.build();
        this.vxlBuilder = builder;
        const wrapper = (this.vxlRotWrapper = new THREE.Object3D());
        wrapper.rotation.order = "YXZ";
        wrapper.matrixAutoUpdate = false;
        wrapper.add(mesh);
        parent.add(wrapper);
      } else {
        const shp = this.imageFinder.findByObjectArt(this.objectArt);
        const drawOffset = this.objectArt.getDrawOffset();
        const arcing = this.gameObject.rules.arcing;
        const hasShadow =
          this.gameObject.rules.shadow && !arcing && shp.numImages > 1;
        const renderable = ShpRenderable.factory(
          shp,
          this.palette,
          this.camera,
          drawOffset,
          hasShadow,
        );
        renderable.setBatched(this.useSpriteBatching);
        if (this.useSpriteBatching) renderable.setBatchPalettes(this.paletteRemaps);
        renderable.setExtraLight(this.extraLight);
        renderable.create3DObject();
        this.shpRenderable = renderable;
        parent.add(renderable.get3DObject());

        if (arcing) {
          this.blobShadow = new BlobShadow(this.gameObject, 1.5, this.useMeshInstancing);
          this.blobShadow.create3DObject();
          parent.add(this.blobShadow.get3DObject());
        }
      }
      if (this.gameObject.fromWeapon.type === WeaponType.DeathWeapon) {
        parent.visible = false;
      }
    }
  }

  /** 声波网格：正弦调制的平面。 */
  createSonicWaveGeometry(): any {
    const geometry = new THREE.PlaneBufferGeometry(
      Coords.LEPTONS_PER_TILE,
      Coords.LEPTONS_PER_TILE / 3,
      10,
      10,
    );
    const pos = geometry.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      pos.setY(
        i,
        pos.getY(i) +
          Math.cos((pos.getX(i) * Math.PI) / Coords.LEPTONS_PER_TILE) * Coords.ISO_WORLD_SCALE,
      );
    }
    return geometry;
  }

  /**
   * 创建回调：按武器规则挂各类特效。
   * @param manager - 渲染管理器
   */
  onCreate(manager: any): void {
    this.renderableManager = manager;
    this.plugins.forEach((p) => p.onCreate(manager));

    // 棱镜副炮（support beam）识别
    const isPrismSupport =
      this.gameObject.fromObject?.name === this.rules.general.prism.type &&
      this.gameObject.fromWeapon.type === WeaponType.Secondary;

    // 像素偏移（建筑开火点已在 Weapon.fire 应用）
    let pixelOffset: number[] = [];
    if (this.gameObject.fromObject) {
      if (
        this.gameObject.fromWeapon.type === WeaponType.Primary ||
        this.gameObject.fromWeapon.type === WeaponType.DeathWeapon ||
        isPrismSupport
      ) {
        pixelOffset = this.gameObject.fromObject.art.primaryFirePixelOffset;
      } else {
        pixelOffset = this.gameObject.fromObject.art.secondaryFirePixelOffset;
      }
    } else {
      pixelOffset = [];
    }

    const weapon = this.gameObject.fromWeapon;
    const weaponRules = weapon.rules;

    // 起飞/开火动画
    if (weapon.type !== WeaponType.DeathWeapon && !weaponRules.limboLaunch) {
      const animNames = weaponRules.anim;
      let launchAnim: string | undefined;
      if (animNames.length) {
        if (animNames.length === 1) {
          launchAnim = animNames[0];
        } else {
          const dir = this.gameObject.direction;
          launchAnim = animNames[Math.round((((45 - dir + 360) % 360) / 360) * 8) % 8];
        }
      } else if (weapon.warhead.rules.nukeMaker) {
        launchAnim = this.rules.audioVisual.nukeTakeOff;
      }
      if (launchAnim) {
        manager.createTransientAnim(launchAnim, (a: any) => {
          a.setPosition(this.gameObject.position.worldPosition);
          if (pixelOffset.length) {
            a.extraOffset = { x: pixelOffset[0], y: -pixelOffset[1] / 2 };
          }
        });
      }
    }

    // 激光线
    if (weaponRules.isLaser) {
      const source = this.gameObject.position.worldPosition.clone();
      const extra = new THREE.Vector3();
      // a building's PrimaryFirePixelOffset/SecondaryFirePixelOffset is
      // applied in Weapon.fire, so the projectile already spawns at the building's
      // firing point and the laser source needs no pixel-offset correction here.
      // Only the Prism network support beam (secondary) still raises BOTH endpoints
      // to the tower's primary FLH height so the beams connect at the firing height.
      const dest = this.gameObject.target.getWorldCoords().clone();
      if (
        this.gameObject.fromObject?.name === this.rules.general.prism.type &&
        this.gameObject.fromWeapon.type === WeaponType.Secondary
      ) {
        extra.y = this.gameObject.fromObject.art.primaryFireFlh.vertical;
        dest.add(extra);
      }
      source.add(extra);
      const color = new THREE.Color(
        weaponRules.isHouseColor ? this.gameObject.fromPlayer.color.asHex() : 16711680,
      );
      const duration =
        weaponRules.laserDuration / GameSpeed.BASE_TICKS_PER_SECOND / this.gameSpeed.value;
      const width = 2 * (this.gameObject.baseDamageMultiplier > 1 ? 2 : 1);
      const fx = new LaserFx(this.camera, source, dest, color, duration, width);
      manager.addEffect(fx);
    }

    // 特斯拉电弧
    if (weaponRules.isElectricBolt) {
      let source = this.gameObject.position.worldPosition.clone();
      if (this.gameObject.fromObject?.isBuilding()) {
        source.y += Coords.tileHeightToWorld(1);
      }
      const dest = this.gameObject.target.getWorldCoords();
      const pal = this.specialPalette;
      const primary = new THREE.Color(pal.getColorAsHex(weaponRules.isAlternateColor ? 5 : 10));
      const secondary = new THREE.Color(pal.getColorAsHex(15));
      const duration = 1 / this.gameSpeed.value;
      const fx = new TeslaFx(source, dest, primary, secondary, duration);
      manager.addEffect(fx);
    }

    // 辐射光束
    if (weaponRules.isRadBeam) {
      const source = this.gameObject.position.worldPosition.clone();
      const dest = this.gameObject.target.getWorldCoords().clone();
      const color = this.gameObject.fromWeapon.warhead.rules.temporal
        ? new THREE.Color(...this.rules.audioVisual.chronoBeamColor.map((v: number) => v / 255))
        : new THREE.Color(...this.rules.radiation.radColor.map((v: number) => v / 255));
      const duration = 1 / this.gameSpeed.value;
      const fx = new RadBeamFx(this.camera, source, dest, color, duration, 1);
      manager.addEffect(fx);
    }

    // DiskLaser ring-laser charge + beam effect (Floating Disc primary weapon).
    // Vanilla YR disk laser draws a circle of LaserInnerColor/LaserOuterColor or
    // IsHouseColor around the firing point, charges CW+CCW arcs, then fires beam.
    if (weaponRules.isDiskLaser) {
      const source = this.gameObject.position.worldPosition.clone();
      // Apply FLH offset: use FlhCoords.vertical directly (world units),
      // not PixelOffset which may be empty for units like DISK.
      const flhOffset = new THREE.Vector3();
      (() => {
        const flh =
          this.gameObject.fromWeapon.type === WeaponType.Primary
            ? this.gameObject.fromObject?.art?.primaryFireFlh
            : this.gameObject.fromObject?.art?.secondaryFireFlh;
        if (flh && flh.vertical) flhOffset.y = flh.vertical;
      })();
      source.add(flhOffset);
      const dest = this.gameObject.target.getWorldCoords().clone();
      const duration =
        weaponRules.laserDuration / GameSpeed.BASE_TICKS_PER_SECOND / this.gameSpeed.value;
      // track the firer so the ring follows the moving disc during charge.
      this._diskFirer = this.gameObject.fromObject;
      this._diskFlhOffset = flhOffset.clone();
      const params = {
        innerColor: weaponRules.laserInnerColor,
        outerColor: weaponRules.laserOuterColor,
        outerSpread: weaponRules.laserOuterSpread,
        radius: weaponRules.diskLaserRadius,
        durationSeconds: Math.max(0.1, duration),
        isHouseColor: weaponRules.isHouseColor,
        houseColor: weaponRules.isHouseColor
          ? new THREE.Color(this.gameObject.fromPlayer.color.asHex())
          : void 0,
        getSourcePos: this._diskFirer
          ? () => {
              const firer = this._diskFirer;
              return firer && !firer.isDestroyed
                ? firer.position.worldPosition.clone().add(this._diskFlhOffset)
                : null;
            }
          : null,
        getTargetPos: this._diskFirer
          ? () => {
              const tgt = this.gameObject.target;
              return tgt && !tgt.isDestroyed ? tgt.getWorldCoords().clone() : null;
            }
          : null,
        // Sound callbacks: charge sound at ring start, Report at beam start
        onChargeStart: this.worldSound
          ? () => {
              this.worldSound.playEffect(
                "FloatingDiscChargeUp",
                this.gameObject.position.worldPosition,
                this.gameObject.fromPlayer,
              );
            }
          : null,
        onBeamStart: this.worldSound
          ? () => {
              const report = weaponRules.report;
              if (report && report.length) {
                const idx = Math.floor(Math.random() * report.length);
                this.worldSound.playEffect(
                  report[idx],
                  this.gameObject.position.worldPosition,
                  this.gameObject.fromPlayer,
                );
              }
            }
          : null,
      };
      const fx = new DiskLaserFx(source, dest, this.camera, params as any);
      manager.addEffect(fx);
    }

    // Magnetron beam rendering is handled by MagnetronBeamPlugin,
    // which provides a continuous beam for both vehicle dragging and building attacks.
    if (this.objectArt.useLineTrail) {
      const color = new THREE.Color().fromArray(
        this.objectArt.lineTrailColor.map((v: number) => v / 255),
      );
      const decrement = this.objectArt.lineTrailColorDecrement;
      const fx = new LineTrailFx(() => this.target, color, decrement, this.gameSpeed, this.camera);
      manager.addEffect(fx);
      this.lineTrailFx = fx;
    }
    if (weaponRules.useSparkParticles) {
      const pos = this.gameObject.position.worldPosition.clone();
      const duration = 20 / GameSpeed.BASE_TICKS_PER_SECOND;
      const fx = new SparkFx(pos, new THREE.Color(1, 1, 1), duration, this.gameSpeed);
      manager.addEffect(fx);
    }
  }

  /**
   * 移除：停拖尾跟踪并收尾。
   * @param manager - 渲染管理器
   */
  onRemove(manager: any): void {
    this.renderableManager = void 0;
    this.plugins.forEach((p) => p.onRemove(manager));
    if (this.gameObject.overshootTiles) {
      this.lineTrailFx?.stopTracking();
    }
    this.lineTrailFx?.requestFinishAndDispose();
  }

  /** 释放插件与资源。 */
  dispose(): void {
    this.plugins.forEach((p) => p.dispose());
    this.shpRenderable?.dispose();
    this.vxlBuilder?.dispose();
    this.blobShadow?.dispose();
  }
}
