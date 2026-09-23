/**
 * SoundHandler — 对局事件 EVA/音效分发（武器、建筑、联盟、箱子等）。
 *
 * 由 gui/screen/game/SoundHandler.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { OrderType } from "game/order/OrderType"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { EventType } from "game/event/EventType"; // 已转换
import { getRandomInt } from "util/math"; // 已转换
import * as UnitSelectionHandlerModule from "gui/screen/game/worldInteraction/UnitSelectionHandler"; // 孪生
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import * as BuildingModule from "game/gameobject/Building"; // 孪生
import * as TechnoRulesModule from "game/rules/TechnoRules"; // 孪生
import { equals as arrayEquals } from "util/array"; // 已转换
import * as RadarRulesModule from "game/rules/general/RadarRules"; // 孪生
import * as ProductionQueueModule from "game/player/production/ProductionQueue"; // 孪生
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import * as AllianceChangeEventModule from "game/event/AllianceChangeEvent"; // 孪生
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 已转换
import { OrderFeedbackType } from "game/order/OrderFeedbackType"; // 已转换
import * as constantsModule from "game/gameopts/constants"; // 孪生
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import { WeaponType } from "game/WeaponType"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import * as SuperWeaponTypeModule from "game/type/SuperWeaponType"; // 孪生
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import { PowerupType } from "game/type/PowerupType"; // 已转换
import { HealthLevel } from "game/gameobject/unit/HealthLevel"; // 已转换
import { StalemateDetectTrait } from "game/trait/StalemateDetectTrait"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const QueryType: any = (UnitSelectionHandlerModule as any).QueryType;
const BuildStatus: any = (BuildingModule as any).BuildStatus;
const FactoryType: any = (TechnoRulesModule as any).FactoryType;
const RadarEventType: any = (RadarRulesModule as any).RadarEventType;
const QueueStatus: any = (ProductionQueueModule as any).QueueStatus;
const AllianceEventType: any = (AllianceChangeEventModule as any).AllianceEventType;
const SuperWeaponType: any = (SuperWeaponTypeModule as any).SuperWeaponType;
const aiUiNames: any = (constantsModule as any).aiUiNames;

/** 探测到敌方超武 EVA。 */
const SW_DETECT_EVA = new Map<any, string>()
  .set(SuperWeaponType.MultiMissile, "EVA_NuclearSiloDetected")
  .set(SuperWeaponType.IronCurtain, "EVA_IronCurtainDetected")
  .set(SuperWeaponType.ChronoSphere, "EVA_ChronosphereDetected")
  .set(SuperWeaponType.LightningStorm, "EVA_WeatherDeviceReady")
  // YR superweapon EVA — Psychic Dominator detection.
  .set(SuperWeaponType.PsychicDominator, "EVA_PsychicDominatorDetected");

/** 超武就绪 EVA。 */
const SW_READY_EVA = new Map<any, string>()
  .set(SuperWeaponType.MultiMissile, "EVA_NuclearMissileReady")
  .set(SuperWeaponType.IronCurtain, "EVA_IronCurtainReady")
  .set(SuperWeaponType.ChronoSphere, "EVA_ChronosphereReady")
  .set(SuperWeaponType.LightningStorm, "EVA_LightningStormReady")
  .set(SuperWeaponType.ParaDrop, "EVA_ReinforcementsReady")
  .set(SuperWeaponType.AmerParaDrop, "EVA_ReinforcementsReady")
  // YR superweapon EVA — Psychic Dominator + Force Shield ready.
  .set(SuperWeaponType.PsychicDominator, "EVA_PsychicDominatorReady")
  .set(SuperWeaponType.ForceShield, "EVA_ForceShieldReady")
  // Psychic Reveal EVA ready sound.
  .set(SuperWeaponType.PsychicReveal, "EVA_PsychicRevealReady")
  // Spy Plane ready EVA (Soviet Radar Tower support power).
  .set(SuperWeaponType.SpyPlane, "EVA_SpyPlaneReady");

/** 超武激活 EVA。 */
const SW_ACTIVATE_EVA = new Map<any, string>()
  .set(SuperWeaponType.MultiMissile, "EVA_NuclearMissileLaunched")
  .set(SuperWeaponType.IronCurtain, "EVA_IronCurtainActivated")
  .set(SuperWeaponType.ChronoSphere, "EVA_ChronosphereActivated")
  .set(SuperWeaponType.LightningStorm, "EVA_LightningStormCreated")
  // YR superweapon EVA — Psychic Dominator + Force Shield activated.
  .set(SuperWeaponType.PsychicDominator, "EVA_PsychicDominatorActivated")
  .set(SuperWeaponType.ForceShield, "EVA_ForceShieldActivated")
  // Psychic Reveal — vanilla YR has no separate "activated" EVA (the event was
  // added too late), so the Ready sfx (spsyread) is reused at activation, per evamd.ini.
  .set(SuperWeaponType.PsychicReveal, "EVA_PsychicRevealReady")
  // Spy Plane activated EVA — "Spy plane en route" (evamd.ini EVA_SpyPlaneEnRoute).
  .set(SuperWeaponType.SpyPlane, "EVA_SpyPlaneEnRoute");

/** 超武附带音效。 */
const SW_ACTIVATE_SFX = new Map<any, any>().set(
  SuperWeaponType.MultiMissile,
  SoundKey.DigSound,
);

/** 超武警报文案 key。 */
const SW_WARN_TEXT = new Map<any, string>().set(
  SuperWeaponType.LightningStorm,
  "TXT_LIGHTNING_STORM_APPROACHING",
);

/** 箱子音效。 */
const CRATE_SFX = new Map<any, any>([
  [PowerupType.Veteran, SoundKey.CratePromoteSound],
  [PowerupType.Money, SoundKey.CrateMoneySound],
  [PowerupType.Reveal, SoundKey.CrateRevealSound],
  [PowerupType.Firepower, SoundKey.CrateFireSound],
  [PowerupType.Armor, SoundKey.CrateArmourSound],
  [PowerupType.Speed, SoundKey.CrateSpeedSound],
  [PowerupType.Unit, SoundKey.CrateUnitSound],
]);

/** 箱子 EVA。 */
const CRATE_EVA = new Map<any, string>([
  [PowerupType.Armor, "EVA_UnitArmorUpgraded"],
  [PowerupType.Firepower, "EVA_UnitFirePowerUpgraded"],
  [PowerupType.Speed, "EVA_UnitSpeedUpgraded"],
]);

/** 对局音效处理器。 */
export class SoundHandler {
  /** 游戏。 */
  game: any;
  /** 世界音效。 */
  worldSound: any;
  /** EVA。 */
  eva: any;
  /** 音效系统。 */
  sound: any;
  /** 游戏事件。 */
  gameEvents: any;
  /** 消息列表。 */
  messageList: any;
  /** 字符串。 */
  strings: any;
  /** 本地玩家。 */
  player: any;
  /** 上次可用对象名列表。 */
  lastAvailableObjectNames: any[] = [];
  /** 队列状态缓存。 */
  lastQueueStatuses = new Map<any, any>();
  /** 触发音句柄。 */
  triggerSoundHandles = new Map<any, any[]>();
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 上次反馈时间。 */
  lastFeedbackTime: number | undefined;

  /**
   * @param game 游戏
   * @param worldSound 世界音效
   * @param eva EVA
   * @param sound 音效
   * @param gameEvents 事件
   * @param messageList 消息
   * @param strings 字符串
   * @param player 玩家
   */
  constructor(
    game: any,
    worldSound: any,
    eva: any,
    sound: any,
    gameEvents: any,
    messageList: any,
    strings: any,
    player: any,
  ) {
    this.game = game;
    this.worldSound = worldSound;
    this.eva = eva;
    this.sound = sound;
    this.gameEvents = gameEvents;
    this.messageList = messageList;
    this.strings = strings;
    this.player = player;
    this.lastAvailableObjectNames = [];
    this.lastQueueStatuses = new Map();
    this.triggerSoundHandles = new Map();
    this.disposables = new CompositeDisposable();
  }

  /** 订阅全部游戏事件。 */
  init(): void {
    this.disposables.add(this.gameEvents.subscribe((e: any) => this.handleGameEvent(e)));
  }

  /** 释放。 */
  dispose(): void {
    this.disposables.dispose();
  }

  // 查找AI玩家的昵称（来自BotManager设置的 aiPlayerNicknames 映射）
  /**
   * @param playerName 玩家名
   */
  _lookupNickname(playerName: string): string | null {
    try {
      if (this.game.aiPlayerNicknames && this.game.aiPlayerNicknames[playerName]) {
        return this.game.aiPlayerNicknames[playerName];
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * 主事件分发。
   * @param event 游戏事件
   */
  handleGameEvent(event: any): void {
    // 显示AI聊天消息（单机模式，使用玩家颜色）
    if (this.game.aiChatMessages && this.game.aiChatMessages.length > 0) {
      const aiMsgs = this.game.aiChatMessages;
      this.game.aiChatMessages = [];
      for (const msg of aiMsgs) {
        const displayName = msg.nickname || msg.playerName;
        let color = "orange";
        try {
          const player = this.game.getPlayerByName(msg.playerName);
          if (player) {
            // 优先用 player.color（网络模式有），其次用 colorId + rules 查（单机模式）
            if (player.color && player.color.asHexString) {
              color = player.color.asHexString();
            } else if (player.colorId >= 0) {
              const colorArr = this.game.rules.getMultiplayerColors();
              if (colorArr) {
                const colorList = [...colorArr.values()];
                if (colorList[player.colorId]) {
                  color = colorList[player.colorId].asHexString();
                }
              }
            }
          }
        } catch {
          // ignore
        }
        this.messageList.addSystemMessage(displayName + ": " + msg.text, color);
      }
    }
    switch (event.type) {
      case EventType.Cheer:
        this.sound.play(SoundKey.CheerSound, ChannelType.Effect);
        break;
      case EventType.UnitDeployUndeploy: {
        const unit = event.unit;
        const isUndeploy = event.deployType === "undeploy";
        let snd: any;
        // slave miners use the unit/building's own
        // DeploySound=/PackupSound= directly.
        if (unit.rules.slaveMiner) {
          snd = isUndeploy
            ? unit.rules.packupSound || unit.rules.undeploySound || unit.rules.deploySound
            : unit.rules.deploySound || unit.rules.undeploySound;
        } else {
          snd = isUndeploy ? unit.rules.undeploySound : unit.rules.deploySound;
        }
        if (snd) this.worldSound.playEffect(snd, unit, unit.owner);
        break;
      }
      case EventType.ObjectTeleport: {
        const e = event;
        if (e.isChronoshift) {
          if (e.target.rules.chronoInSound) {
            this.worldSound.playEffect(
              e.target.rules.chronoInSound,
              e.target,
              e.target.owner,
            );
          }
          if (e.target.rules.chronoOutSound) {
            const pos = Coords.tile3dToWorld(
              e.prevTile.rx + 0.5,
              e.prevTile.ry + 0.5,
              e.prevTile.z,
            );
            this.worldSound.playEffect(
              e.target.rules.chronoOutSound,
              pos,
              e.target.owner,
            );
          }
        }
        break;
      }
      case EventType.WeaponFire: {
        const weapon = event.weapon;
        const obj = event.gameObject;
        if (weapon.type === WeaponType.DeathWeapon && obj.isCrashing) break;
        // Magnetron tractor beam: suppress repeated Report sounds while already dragging.
        // The continuous beam visual is handled by MagnetronBeamPlugin; pulsing fire sounds
        // every ROF feel wrong.
        if (obj.magnetronDragging) break;
        // Spawner weapons (CruiseLauncher, V3Launcher, DredLauncher) don't
        // play Report at fire time. The spawned missile (CMISL, V3Rocket, DMISL) plays
        // AuxSound1 via ObjectLiftOffEvent when it actually lifts off, keeping the
        // sound synced with the visual and avoiding Sound.ts.js limit collisions.
        if (weapon.rules.spawner) break;
        // DiskLaser weapons fire their Report sound when the beam phase
        // begins (after ring charging), not at WeaponFire time.
        if (weapon.rules.isDiskLaser) break;
        // DrainWeapon (e.g. DiskDrain) suppresses Report to avoid
        // overlapping with the DISKRAY animation's StartSound=FloatingDiscStealLoop.
        if (weapon.rules.drainWeapon) break;
        const reports = weapon.rules.report;
        if (!reports.length) break;
        // 原版不会在这里打断前一个武器音效，
        // 让每个 Report 音效完整播放；否则磁电光束这类按 ROF 触发的效果会听起来断断续续。
        // s.__weaponFireSound && s.__weaponFireSound.isPlaying() && s.__weaponFireSound.stop();
        const vol = event.weapon.warhead.rules.electricAssault ? 0.25 : 1;
        const handle = this.worldSound.playEffect(
          reports[getRandomInt(0, reports.length - 1)],
          obj.position.worldPosition,
          obj.owner,
          vol,
        );
        // Gattling weapons can fire fast enough that multiple Report instances overlap.
        // Track them in an array so GattlingTrait can stop ALL previous stage sounds
        // when the stage changes, instead of only the latest handle.
        // Filter out naturally-finished handles first to keep the array small.
        if (handle) {
          if (obj.gattlingTrait) {
            obj.__weaponFireSounds || (obj.__weaponFireSounds = []);
            obj.__weaponFireSounds.push(handle);
            obj.__weaponFireSounds = obj.__weaponFireSounds.filter((s: any) => s.isPlaying());
          }
          obj.__weaponFireSound = handle;
        }
        break;
      }
      case EventType.InflictDamage: {
        const e = event;
        const hp = e.target.healthTrait.health;
        if (hp && e.target.isTechno()) {
          if (e.target.isBuilding()) {
            if (e.target.wallTrait) break;
            const delta =
              (e.damageHitPoints / e.target.healthTrait.maxHitPoints) * 100;
            const av = this.game.rules.audioVisual;
            const red = 100 * av.conditionRed;
            const yellow = 100 * av.conditionYellow;
            if (
              (hp <= yellow && yellow < hp + delta) ||
              (hp <= red && red < hp + delta)
            ) {
              this.worldSound.playEffect(
                SoundKey.BuildingDamageSound,
                e.target,
                e.target.owner,
              );
            }
          } else {
            const voice = e.target.rules.voiceFeedback;
            if (
              e.target.owner === this.player &&
              voice &&
              Math.random() > 0.9
            ) {
              this.worldSound.playEffect(voice, e.target, e.target.owner);
            }
          }
        }
        break;
      }
      case EventType.RadarEvent: {
        const e = event;
        if (e.radarEventType === RadarEventType.BaseUnderAttack) {
          if (e.target === this.player) {
            this.eva.play("EVA_OurBaseIsUnderAttack");
            this.sound.play(SoundKey.BaseUnderAttackSound, ChannelType.Effect);
          } else if (
            this.player &&
            this.game.alliances.areAllied(this.player, e.target)
          ) {
            this.eva.play("EVA_OurAllyIsUnderAttack");
            this.sound.play(SoundKey.BaseUnderAttackSound, ChannelType.Effect);
          }
        } else if (e.radarEventType === RadarEventType.HarvesterUnderAttack) {
          if (e.target === this.player) this.eva.play("EVA_OreMinerUnderAttack");
        } else if (
          e.radarEventType === RadarEventType.EnemyObjectSensed &&
          e.target === this.player
        ) {
          const building = this.game.map
            .getGroundObjectsOnTile(e.tile)
            .find((o: any) => o.isBuilding() && o.superWeaponTrait);
          if (building) {
            const type = building.superWeaponTrait?.getSuperWeapon(building)?.rules.type;
            if (type !== void 0) {
              const key = SW_DETECT_EVA.get(type);
              if (key) this.eva.play(key);
            }
          }
        }
        break;
      }
      case EventType.SuperWeaponReady: {
        const sw = event.target;
        if (sw.owner !== this.player) break;
        const key = sw.rules.type !== void 0 ? SW_READY_EVA.get(sw.rules.type) : void 0;
        if (key) this.eva.play(key);
        break;
      }
      case EventType.SuperWeaponActivate: {
        const type = event.target;
        const atTile = event.owner;
        if (!event.noSfxWarning) {
          const eva = SW_ACTIVATE_EVA.get(type);
          if (eva) this.eva.play(eva, true);
          const sfx = SW_ACTIVATE_SFX.get(type);
          if (sfx) {
            const tile = event.atTile;
            this.worldSound.playEffect(
              sfx,
              Coords.tile3dToWorld(tile.rx, tile.ry, tile.z),
              atTile,
            );
          }
        }
        // Play StartSound from the super weapon's rules (e.g. ForceShieldStarting).
        if (type !== void 0) {
          const rules = [...this.game.rules.superWeaponRules.values()].find(
            (r: any) => r.type === type,
          );
          if (rules && rules.startSound) {
            const tile = event.atTile;
            this.worldSound.playEffect(
              rules.startSound,
              Coords.tile3dToWorld(tile.rx, tile.ry, tile.z),
              atTile,
            );
          }
        }
        // Play Psychic Dominator activation sound directly from AudioVisual
        // config (PsychicDominatorActivateSound=).
        if (type === SuperWeaponType.PsychicDominator) {
          const dom = this.game.rules.audioVisual.dominatorActivateSound;
          if (dom) {
            const tile = event.atTile;
            this.worldSound.playEffect(
              dom,
              Coords.tile3dToWorld(tile.rx, tile.ry, tile.z),
              atTile,
            );
          }
        }
        const warn = SW_WARN_TEXT.get(type);
        if (warn) {
          this.messageList.addSystemMessage(
            this.strings.get(warn),
            this.player ?? "grey",
          );
        }
        break;
      }
      case EventType.LightningStormManifest:
        this.messageList.addSystemMessage(
          this.strings.get("TXT_LIGHTNING_STORM"),
          this.player ?? "grey",
        );
        {
          const tile = event.target;
          this.worldSound.playEffect(
            SoundKey.StormSound,
            Coords.tile3dToWorld(tile.rx, tile.ry, tile.z),
          );
        }
        break;
      case EventType.WarheadDetonate:
        if (event.isLightningStrike) {
          this.worldSound.playEffect(SoundKey.LightningSounds, event.position);
        }
        break;
      case EventType.ObjectLiftOff: {
        const obj = event.gameObject;
        const snd = obj.rules.auxSound1;
        if (snd) this.worldSound.playEffect(snd, obj, obj.owner);
        break;
      }
      case EventType.ObjectLand: {
        const obj = event.gameObject;
        const snd = obj.rules.auxSound2;
        if (snd) this.worldSound.playEffect(snd, obj, obj.owner);
        break;
      }
      case EventType.ObjectCrashing: {
        const obj = event.gameObject;
        const crashSnd = obj.rules.crashingSound;
        if (crashSnd) {
          this.worldSound.playEffect(crashSnd, obj.position.worldPosition, obj.owner);
        }
        if (obj.owner === this.player && obj.rules.voiceCrashing) {
          this.worldSound.playEffect(
            obj.rules.voiceCrashing,
            obj.position.worldPosition,
            obj.owner,
          );
        }
        break;
      }
      case EventType.ObjectDestroy: {
        const obj = event.target;
        let snd: any;
        if (obj.isUnit() && !obj.isInfantry() && obj.isCrashing) {
          snd =
            obj.zone === ZoneType.Water
              ? this.game.rules.audioVisual.impactWaterSound
              : obj.rules.impactLandSound ?? this.game.rules.audioVisual.impactLandSound;
        } else if (
          obj.deathType === DeathType.Temporal ||
          obj.deathType === DeathType.None
        ) {
          snd = void 0;
        } else if (obj.deathType === DeathType.Crush) {
          snd = obj.rules.crushSound;
        } else if (obj.isVehicle() && obj.zone === ZoneType.Water && obj.isSinker) {
          snd = SoundKey.SinkingSound;
        } else if (obj.isTechno()) {
          snd = obj.rules.dieSound;
          if (!snd && obj.isBuilding()) snd = SoundKey.BuildingDieSound;
        } else if (obj.isProjectile()) {
          if (obj.fromWeapon.warhead.rules.ivanBomb) {
            snd = SoundKey.BombAttachSound;
          } else if (obj.fromWeapon.warhead.rules.mindControl) {
            snd = SoundKey.YuriMindControlSound;
          }
        }
        // Mastermind that died from brain overload uses its special sound.
        if (obj._mindOverloadDeath) {
          snd = this.game.rules.audioVisual.masterMindOverloadDeathSound || snd;
        }
        if (snd) {
          const owner = obj.isTechno()
            ? obj.owner
            : obj.isProjectile()
              ? obj.fromPlayer
              : void 0;
          this.worldSound.playEffect(snd, obj.position.worldPosition, owner);
        }
        if (obj.isUnit() && !obj.rules.spawned && obj.owner === this.player) {
          this.eva.play("EVA_UnitLost");
        }
        break;
      }
      case EventType.ObjectSpawn: {
        const obj = event.gameObject;
        if (obj.isTechno() && obj.rules.createSound) {
          this.worldSound.playEffect(obj.rules.createSound, obj, obj.owner);
        }
        if (obj.isInfantry() && obj.stance === StanceType.Paradrop) {
          this.worldSound.playEffect(SoundKey.ChuteSound, obj, obj.owner);
        }
        break;
      }
      case EventType.ObjectUnspawn: {
        const obj = event.gameObject;
        if (obj.isBuilding() && obj.rules.spySat) {
          this.worldSound.playEffect(SoundKey.SpySatDeactivationSound, obj, obj.owner);
        }
        // play SlavesFreeSound when a Slave Miner is destroyed (liberation)
        if (obj._slavesLiberated) {
          const freeSound = this.game.rules.general.slavesFreeSound;
          if (freeSound) this.worldSound.playEffect(freeSound, obj, obj.owner);
        }
        break;
      }
      case EventType.ObjectOwnerChange: {
        const obj = event.target;
        // play MindClearedSound when a mind-controlled unit is released.
        if (obj._mindCleared) {
          obj._mindCleared = false;
          const clearedSound = this.game.rules.audioVisual.mindClearedSound;
          if (clearedSound) {
            this.worldSound.playEffect(clearedSound, obj, obj.owner);
          }
        }
        break;
      }
      case EventType.ObjectMorph: {
        const to = event.to;
        if (to.isBuilding()) this.worldSound.playEffect(SoundKey.BuildingDrop, to, to.owner);
        break;
      }
      case EventType.ShipSubmergeChange:
        this.worldSound.playEffect(
          SoundKey.CloakSound,
          event.target,
          event.target.owner,
        );
        break;
      case EventType.BridgeRepair:
        if (event.source === this.player) this.eva.play("EVA_BridgeRepaired");
        break;
      case EventType.BuildStatusChange: {
        const building = event.target;
        if (event.status === BuildStatus.BuildDown) {
          this.worldSound.playEffect(
            SoundKey.SellSound,
            building.position.worldPosition,
            building.owner,
          );
          if (building.poweredTrait) {
            const notWorking = building.rules.notWorkingSound;
            if (notWorking) this.worldSound.playEffect(notWorking, building, building.owner);
          }
        }
        break;
      }
      case EventType.BuildingPlace: {
        const b = event.target;
        this.worldSound.playEffect(SoundKey.BuildingSlam, b, b.owner);
        if (b.rules.spySat) {
          this.worldSound.playEffect(SoundKey.SpySatActivationSound, b, b.owner);
        }
        break;
      }
      case EventType.BuildingFailedPlace:
        if (this.player === event.player) this.eva.play("EVA_CannotDeployHere");
        break;
      case EventType.ObjectSell: {
        const obj = event.target;
        if (obj.rules.wall) {
          this.worldSound.playEffect(
            SoundKey.SellSound,
            obj.position.worldPosition,
            obj.owner,
          );
        }
        if (this.player === obj.owner) {
          this.eva.play(
            obj.isBuilding() ? "EVA_StructureSold" : "EVA_UnitSold",
            true,
          );
        }
        break;
      }
      case EventType.BuildingRepairFull: {
        const b = event.target;
        const src = event.source;
        if (src === this.player) {
          this.worldSound.playEffect(SoundKey.BuildingRepairedSound, b, src);
        }
        break;
      }
      case EventType.BuildingCapture: {
        const b = event.target;
        if (b.owner === this.player) {
          this.eva.play(
            // Secret Lab (CASLAB) grants a random unit — vanilla YR
            // announces it with the "New Technology Acquired" EVA message.
            b.rules.secretLab
              ? "EVA_NewTechnologyAcquired"
              : b.rules.needsEngineer
                ? "EVA_TechBuildingCaptured"
                : "EVA_BuildingCaptured",
          );
        }
        break;
      }
      case EventType.BuildingInfiltration: {
        const src = event.source;
        const target = event.target;
        if (
          !this.player ||
          this.player.isObserver ||
          target.owner === this.player ||
          src.owner === this.player
        ) {
          const isOwn = target.owner === this.player;
          if (!target.rules.radar && !isOwn) this.eva.play("EVA_BuildingInfiltrated");
          let key: any;
          if (target.rules.radar) {
            key = isOwn ? "EVA_RadarSabotaged" : "EVA_BuildingInfRadarSabotaged";
          }
          if (target.rules.power > 0) {
            key = isOwn ? "EVA_PowerSabotaged" : "EVA_EnemyBasePoweredDown";
          }
          if (target.rules.storage) {
            key = isOwn ? "EVA_CashStolen" : "EVA_BuildingInfCashStolen";
          }
          if (
            this.game.rules.ai.buildTech.includes(target.name) ||
            [FactoryType.InfantryType, FactoryType.UnitType].includes(
              target.factoryTrait?.type,
            )
          ) {
            key = isOwn ? "EVA_TechnologyStolen" : "EVA_NewTechnologyAcquired";
          }
          if (key) this.eva.play(key);
        }
        break;
      }
      case EventType.BuildingGarrison: {
        const b = event.target;
        if (b.bioReactorPowerTrait) {
          this.worldSound.playEffect(SoundKey.EnterBioReactorSound, b, b.owner);
        } else {
          this.worldSound.playEffect(SoundKey.BuildingGarrisonedSound, b, b.owner);
          if (b.owner === this.player) this.eva.play("EVA_StructureGarrisoned");
        }
        break;
      }
      case EventType.BuildingEvacuate: {
        const b = event.target;
        if (b.bioReactorPowerTrait) {
          this.worldSound.playEffect(SoundKey.LeaveBioReactorSound, b, b.owner);
        } else if (event.player === this.player) {
          this.eva.play("EVA_StructureAbandoned");
        }
        break;
      }
      case EventType.BuildingRepairStart:
      case EventType.UnitRepairStart:
        if (event.target.owner === this.player) this.eva.play("EVA_Repairing");
        break;
      case EventType.UnitRepairFinish: {
        const unit = event.target;
        if (unit.owner === this.player) {
          this.eva.play("EVA_UnitRepaired");
          if (event.from.rules.hospital) {
            this.worldSound.playEffect(
              this.game.rules.crateRules.healCrateSound,
              unit,
              unit.owner,
            );
          }
        }
        break;
      }
      case EventType.PlayerDefeated: {
        const target = event.target;
        // 原版战役不播报“XX被击败”，只处理本地玩家失败
        if (this.game?.gameOpts?.campaignId && target !== this.player) break;
        if (
          (target === this.player && !this.player.isObserver) ||
          target.resigned
        ) {
          break;
        }
        let name =
          target.displayName ||
          (target.isAi
            ? this.strings.get(aiUiNames.get(target.aiDifficulty) || "NOSTR:AI")
            : target.name);
        // 替换为昵称
        name = this._lookupNickname(target.name) || name;
        this.eva.play(
          target !== this.player ? "EVA_PlayerDefeated" : "EVA_YouHaveLost",
        );
        this.messageList.addSystemMessage(
          this.strings.get("TXT_PLAYER_DEFEATED", name),
          target,
        );
        break;
      }
      case EventType.PlayerResigned: {
        this.eva.play("EVA_PlayerResigned");
        const p = event.target;
        let name =
          p.displayName ||
          (p.isAi ? this.strings.get(aiUiNames.get(p.aiDifficulty) || "NOSTR:AI") : p.name);
        name = this._lookupNickname(p.name) || name;
        this.messageList.addSystemMessage(
          p.isObserver
            ? this.strings.get("TXT_PLAYER_DEFEATED", name)
            : this.strings.get("TXT_LEFT_GAME", name),
          p,
        );
        if (event.assetsRedistributed) {
          this.messageList.addSystemMessage(
            this.strings.get("TS:PlayerAssetsSplit", p.name),
            p,
          );
        }
        break;
      }
      case EventType.PlayerDropped: {
        const p = event.target;
        this.messageList.addSystemMessage(
          this.strings.get("TXT_CONNECTION_LOST", p.name),
          "grey",
        );
        if (event.assetsRedistributed) {
          this.messageList.addSystemMessage(
            this.strings.get("TS:PlayerAssetsSplit", p.name),
            p,
          );
        }
        break;
      }
      case EventType.DeployNotAllowed:
        if (event.target.owner === this.player) this.eva.play("EVA_CannotDeployHere");
        break;
      case EventType.PowerLow:
        if (event.target === this.player) {
          this.eva.play("EVA_LowPower");
          this.messageList.addSystemMessage(
            this.strings.get("TXT_LOW_POWER"),
            this.player,
          );
        }
        break;
      case EventType.RadarOnOff:
        if (event.target === this.player) {
          this.sound.play(
            event.radarEnabled ? SoundKey.RadarOn : SoundKey.RadarOff,
            ChannelType.Effect,
          );
        }
        break;
      case EventType.InsufficientFunds:
        if (event.target === this.player) this.eva.play("EVA_InsufficientFunds");
        break;
      case EventType.RallyPointChange:
        if (event.target.owner === this.player) {
          this.eva.play("EVA_NewRallyPointEstablished");
        }
        break;
      case EventType.PrimaryFactoryChange:
        if (event.target.owner === this.player) {
          this.eva.play("EVA_PrimaryBuildingSelected");
        }
        break;
      case EventType.AllianceChange: {
        const alliance = event.alliance;
        const changeType = event.changeType;
        const from = event.from;
        if (changeType === AllianceEventType.Formed) {
          if (
            !this.player ||
            this.player.isObserver ||
            alliance.players.has(this.player) ||
            (this.game.alliances.areAllied(this.player, alliance.players.first) &&
              this.game.alliances.areAllied(this.player, alliance.players.second))
          ) {
            this.eva.play("EVA_AllianceFormed");
          } else {
            this.eva.play("EVA_EnemyAllianceFormed");
          }
          this.messageList.addSystemMessage(
            this.strings.get(
              "TXT_HAS_ALLIED",
              alliance.players.second.name,
              alliance.players.first.name,
            ),
            "white",
          );
        } else if (changeType === AllianceEventType.Requested) {
          if (this.player === alliance.players.first) {
            this.eva.play("EVA_RequestingAlliance");
          } else if (this.player === alliance.players.second) {
            this.eva.play("EVA_AllianceRequested");
          }
          this.messageList.addSystemMessage(
            this.strings.get(
              "TXT_HAS_ALLIED",
              alliance.players.first.name,
              alliance.players.second.name,
            ),
            "lightgrey",
          );
        } else if (changeType === AllianceEventType.Broken) {
          this.eva.play("EVA_AllianceBroken");
          this.messageList.addSystemMessage(
            this.strings.get(
              "TXT_AT_WAR",
              from.name,
              (from === alliance.players.first
                ? alliance.players.second
                : alliance.players.first
              ).name,
            ),
            "white",
          );
        }
        break;
      }
      case EventType.UnitPromote:
        if (event.target.owner === this.player) {
          this.sound.play(
            event.target.veteranLevel === VeteranLevel.Elite
              ? SoundKey.UpgradeEliteSound
              : SoundKey.UpgradeVeteranSound,
            ChannelType.Effect,
          );
          this.eva.play("EVA_UnitPromoted", true);
        }
        break;
      case EventType.EnterTransport: {
        const t = event.target;
        const snd = t.rules.enterTransportSound;
        if (snd) this.worldSound.playEffect(snd, t, t.owner);
        break;
      }
      case EventType.LeaveTransport: {
        const t = event.target;
        const snd = t.rules.leaveTransportSound;
        if (snd) this.worldSound.playEffect(snd, t, t.owner);
        break;
      }
      case EventType.UnitRecycle: {
        const t = event.target;
        const snd = t.rules.dieSound;
        if (snd) this.worldSound.playEffect(snd, t.position.worldPosition, t.owner);
        break;
      }
      case EventType.CratePickup: {
        const e = event;
        let sfx = CRATE_SFX.get(e.target.type);
        if (!sfx && e.target.type === PowerupType.HealBase) {
          sfx = this.game.rules.crateRules.healCrateSound;
        }
        const eva = CRATE_EVA.get(e.target.type);
        const friendly =
          !this.player ||
          this.player.isObserver ||
          e.player === this.player ||
          this.game.alliances.areAllied(e.player, this.player);
        if (!friendly) break;
        if (sfx) {
          const pos = Coords.tile3dToWorld(e.tile.rx, e.tile.ry, e.tile.z);
          this.worldSound.playEffect(sfx, pos, e.player);
        }
        if (eva) this.eva.play(eva);
        break;
      }
      case EventType.StalemateDetect: {
        const minutes = Math.floor(StalemateDetectTrait.graceMinutes);
        this.messageList.addSystemMessage(
          this.strings.get("TS:StalemateWarning", minutes),
          "white",
          20,
        );
        this.eva.play(
          minutes > 1 ? `EVA_${minutes}MinutesRemaining` : "EVA_1MinuteRemaining",
        );
        break;
      }
      case EventType.TriggerSoundFx: {
        const e = event;
        const tile = e.tile;
        if (tile) {
          const handle = this.worldSound.playEffect(
            e.soundId,
            Coords.tile3dToWorld(tile.rx, tile.ry, tile.z),
          );
          if (handle) {
            let list = this.triggerSoundHandles.get(tile);
            if (!list) {
              list = [];
              this.triggerSoundHandles.set(tile, list);
            }
            list.push(handle);
          }
        } else {
          this.sound.play(e.soundId, ChannelType.Effect);
        }
        break;
      }
      case EventType.TriggerStopSoundFx: {
        const tile = event.tile;
        const list = this.triggerSoundHandles.get(tile);
        if (list) {
          for (const handle of list) {
            if (handle.isPlaying()) handle.stop();
          }
          this.triggerSoundHandles.delete(tile);
        }
        break;
      }
      case EventType.TriggerEva:
        this.eva.play(event.soundId);
        break;
      case EventType.TriggerText:
        this.messageList.addSystemMessage(
          this.strings.get(event.label),
          this.player ?? "grey",
        );
        break;
      // Robot Tank (ROBOT) power state change — play ActivateSound/DeactivateSound + EVA announcement.
      case EventType.RobotPowerStateChange: {
        const robo = event.gameObject;
        if (robo && !robo.isDestroyed) {
          // Per-unit sound (ActivateSound / DeactivateSound).
          const roboSound = event.activated
            ? robo.rules.activateSound
            : robo.rules.deactivateSound;
          if (roboSound) this.worldSound.playEffect(roboSound, robo, robo.owner);
          // EVA global announcement: only on FIRST offline / LAST back online.
          const owner = robo.owner;
          if (owner) {
            const objects = owner.getOwnedObjects();
            if (event.activated) {
              // Just restored — check if any other unit is still paralyzed.
              const anyStillOffline = objects.some(
                (u: any) =>
                  u.robotControlTrait &&
                  u.robotControlTrait.isParalyzed() &&
                  !u.isDestroyed,
              );
              if (!anyStillOffline) this.eva.play("EVA_RobotTanksBackOnline");
            } else {
              // Just paralyzed — check if this is the first one.
              const anyOtherOffline = objects.some(
                (u: any) =>
                  u !== robo &&
                  !u.isDestroyed &&
                  u.robotControlTrait &&
                  u.robotControlTrait.isParalyzed(),
              );
              if (!anyOtherOffline) this.eva.play("EVA_RobotTanksOffline");
            }
          }
        }
        break;
      }
    }
  }

  /**
   * 下令语音反馈（250ms 节流）。
   * @param unit 反馈单位
   * @param orderType 指令
   * @param feedbackType 反馈类型
   */
  handleOrderPushed(unit: any, orderType: any, feedbackType: any): void {
    const now = Date.now();
    if (this.lastFeedbackTime && now - this.lastFeedbackTime < 250) return;
    let snd: any;
    if (orderType === OrderType.Stop) snd = SoundKey.StopSound;
    else if (orderType === OrderType.Guard) snd = SoundKey.GuardSound;
    else if (orderType === OrderType.Scatter) snd = SoundKey.ScatterSound;
    else {
      switch (feedbackType) {
        case OrderFeedbackType.Attack:
          snd = unit.rules.voiceAttack;
          break;
        case OrderFeedbackType.Move:
          snd = unit.rules.voiceMove;
          break;
        case OrderFeedbackType.Capture:
          snd = unit.rules.voiceCapture || unit.rules.voiceSpecialAttack;
          break;
        case OrderFeedbackType.SpecialAttack:
          snd = unit.rules.voiceSpecialAttack;
          break;
        case OrderFeedbackType.SecondaryWeaponAttack:
          snd = unit.rules.voiceSecondaryWeaponAttack || unit.rules.voiceAttack;
          break;
        case OrderFeedbackType.Enter:
          snd = unit.rules.voiceEnter ?? unit.rules.voiceMove;
          break;
        case OrderFeedbackType.None:
          break;
      }
    }
    if (snd) {
      this.sound.play(snd, ChannelType.Effect);
      this.lastFeedbackTime = now;
    }
  }

  /**
   * 选择变化语音与提示文案。
   * @param payload 选择元数据
   */
  handleSelectionChangeEvent(payload: any): void {
    const { selection, queryType, veteranLevel, healthLevel } = payload;
    if (selection.length && selection[0].owner !== this.player) return;
    const now = Date.now();
    const throttleOk =
      !this.lastFeedbackTime || now - this.lastFeedbackTime >= 250;
    if (throttleOk) this.lastFeedbackTime = now;
    if (queryType) {
      if (throttleOk) {
        // Support VoiceSelectDeactivated for paralyzed units.
        const voices = selection
          .map((u: any) => {
            const paralyzed = u.robotControlTrait?.isParalyzed();
            return paralyzed && u.rules.voiceSelectDeactivated
              ? u.rules.voiceSelectDeactivated
              : u.rules.voiceSelect;
          })
          .filter(isNotNullOrUndefined);
        const counts = new Map<string, number>();
        voices.forEach((v: string) => counts.set(v, (counts.get(v) ?? 0) + 1));
        counts.forEach((count, key) => {
          const spec = this.sound.getSoundSpec(key);
          if (spec) {
            const times = Math.min(spec.limit, count);
            for (let i = 0; i < times; i++) {
              this.sound.play(key, ChannelType.Effect);
            }
          }
        });
      }
      if (
        selection.length ||
        [QueryType.Veteran, QueryType.Health].includes(queryType)
      ) {
        let text: any;
        switch (queryType) {
          case QueryType.OnScreen:
            text = this.strings.get("Msg:SelAcrossScreen");
            break;
          case QueryType.OnMap:
            text = this.strings.get("Msg:SelAcrossMap");
            break;
          case QueryType.Veteran:
          case QueryType.Health: {
            if (
              !selection.length &&
              ((queryType === QueryType.Veteran && veteranLevel === void 0) ||
                (queryType === QueryType.Health && healthLevel === void 0))
            ) {
              text = this.strings.get("Msg:NavEmpty");
              break;
            }
            let label: any;
            if (queryType === QueryType.Veteran) {
              switch (veteranLevel) {
                case VeteranLevel.Elite:
                  label = this.strings.get("Msg:Elite");
                  break;
                case VeteranLevel.Veteran:
                  label = this.strings.get("Msg:Veteran");
                  break;
                case VeteranLevel.None:
                  label = this.strings.get("Msg:LittleExperience");
              }
            } else if (queryType === QueryType.Health) {
              switch (healthLevel) {
                case HealthLevel.Green:
                  label = this.strings.get("Msg:Healthy");
                  break;
                case HealthLevel.Yellow:
                  label = this.strings.get("Msg:HeavilyDamaged");
                  break;
                case HealthLevel.Red:
                  label = this.strings.get("Msg:Critical");
              }
            }
            if (label !== void 0) {
              label = label.toUpperCase();
              if (selection.length) {
                const cost = selection.reduce(
                  (sum: number, u: any) => sum + u.rules.cost,
                  0,
                );
                text = this.strings.get(
                  "Msg:UnitsWorth",
                  selection.length,
                  label,
                  cost,
                );
              } else {
                text = this.strings.get("Msg:NoUnitsSel", label);
              }
            }
            break;
          }
        }
        if (text) this.messageList.addUiFeedbackMessage(text);
      } else {
        this.messageList.addUiFeedbackMessage(this.strings.get("Msg:NothingSelected"));
      }
    } else if (throttleOk) {
      // also respect VoiceSelectDeactivated for single-click selection.
      const unit = selection.find((u: any) => {
        const paralyzed = u.robotControlTrait?.isParalyzed();
        return paralyzed
          ? !!u.rules.voiceSelectDeactivated
          : !!u.rules.voiceSelect;
      });
      if (unit) {
        const voice = unit.robotControlTrait?.isParalyzed()
          ? unit.rules.voiceSelectDeactivated
          : unit.rules.voiceSelect;
        if (voice) this.sound.play(voice, ChannelType.Effect);
      }
    }
  }

  /**
   * 新建筑选项 EVA。
   * @param available 可用对象
   */
  handleAvailableObjectsUpdate(available: any[]): void {
    const names = available.map((r) => r.name);
    if (
      !arrayEquals(this.lastAvailableObjectNames, names) &&
      names.length > this.lastAvailableObjectNames.length
    ) {
      this.lastAvailableObjectNames = names;
      this.eva.play("EVA_NewConstructionOptions");
    }
  }

  /**
   * 生产队列状态变化 EVA。
   * @param queue 队列
   */
  handleProductionQueueUpdate(queue: any): void {
    const prev = this.lastQueueStatuses.get(queue.type);
    if (prev === void 0 || queue.status === prev) return;
    this.lastQueueStatuses.set(queue.type, queue.status);
    switch (queue.status) {
      case QueueStatus.Ready:
        if (queue.getFirst().rules.type === ObjectType.Building) {
          this.eva.play("EVA_ConstructionComplete");
        } else {
          this.eva.play("EVA_UnitReady");
        }
        break;
      case QueueStatus.Active:
        if (queue.getFirst().rules.type === ObjectType.Building) {
          this.eva.play("EVA_Building");
        } else if (prev === QueueStatus.Idle) {
          this.eva.play("EVA_Training");
        }
        break;
      case QueueStatus.OnHold:
        this.eva.play("EVA_OnHold");
        break;
    }
  }
}
