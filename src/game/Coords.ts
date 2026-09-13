/**
 * Coords — RA2 等轴测坐标换算（地块 / lepton / 世界坐标 / 屏幕坐标）。
 *
 * 由 game/Coords.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物，继续改
 * .ts.js 孪生文件会被静默忽略。
 */
import { GameMath } from "game/math/GameMath";
import { Vector2 } from "game/math/Vector2";
import { Vector3 } from "game/math/Vector3";

export class Coords {
  static readonly ISO_TILE_SIZE = 30;
  static readonly LEPTONS_PER_TILE = 256;
  static readonly ISO_WORLD_SCALE =
    Coords.LEPTONS_PER_TILE / Coords.ISO_TILE_SIZE;
  static readonly ISO_CAMERA_ALPHA = Math.PI / 6;
  static readonly ISO_CAMERA_BETA = Math.PI / 4;
  static readonly COS_ISO_CAMERA_BETA = GameMath.cos(Coords.ISO_CAMERA_BETA);
  /** 等轴测投影的垂直压扁系数。 */
  static readonly zScale =
    Coords.COS_ISO_CAMERA_BETA / GameMath.cos(Coords.ISO_CAMERA_ALPHA);

  /** 地块坐标（格）→ 世界坐标（lepton）。 */
  static tileToWorld(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: tileX * Coords.LEPTONS_PER_TILE,
      y: tileY * Coords.LEPTONS_PER_TILE,
    };
  }

  /** 世界坐标 (x, z) → 地面平面二维向量 (x, y)。 */
  static vecWorldToGround(v: THREE.Vector3): THREE.Vector2 {
    return new Vector2(v.x, v.z);
  }

  /** 地面平面二维向量 (x, y) → 世界坐标 (x, 0, y)。 */
  static vecGroundToWorld(v: THREE.Vector2): THREE.Vector3 {
    return new Vector3(v.x, 0, v.y);
  }

  /** 地块高度（高度单位）→ 世界 Y 坐标。 */
  static tileHeightToWorld(tileZ: number): number {
    return tileZ * (Coords.LEPTONS_PER_TILE / 2) * Coords.zScale;
  }

  /** 世界 Y 坐标 → 地块高度（高度单位）。 */
  static worldToTileHeight(worldY: number): number {
    return worldY / ((Coords.LEPTONS_PER_TILE / 2) * Coords.zScale);
  }

  /** 三维地块坐标（格）→ 世界坐标（lepton），含高度。 */
  static tile3dToWorld(
    tileX: number,
    tileY: number,
    tileZ: number,
  ): THREE.Vector3 {
    const ground = Coords.tileToWorld(tileX, tileY);
    const height = Coords.tileHeightToWorld(tileZ);
    return new Vector3(ground.x, height, ground.y);
  }

  /** 世界偏移量 → 固定等轴测相机下的屏幕空间偏移量。 */
  static screenDistanceToWorld(
    worldX: number,
    worldY: number,
  ): { x: number; y: number } {
    return {
      x: Math.floor(((worldX + 2 * worldY) / 2) * Coords.ISO_WORLD_SCALE),
      y: Math.floor(((2 * worldY - worldX) / 2) * Coords.ISO_WORLD_SCALE),
    };
  }

  /** 返回一个地块的世界尺寸（lepton）。 */
  static getWorldTileSize(): number {
    return Coords.LEPTONS_PER_TILE;
  }
}
