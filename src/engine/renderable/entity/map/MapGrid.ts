/**
 * MapGrid — 地图世界网格线框（PlaneGeometry wireframe，调试用）。
 *
 * 构造时按 size 与 IsoCoords 角点算世界宽高并 build；get3DObject 取根。
 *
 * 由 engine/renderable/entity/map/MapGrid.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { IsoCoords } from "engine/IsoCoords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 地图网格线框。 */
export class MapGrid {
  /** 网格尺寸（width/height tile 数）。 */
  size: { width: number; height: number };
  /** 根节点。 */
  target?: any;

  /** @param size - { width, height } */
  constructor(size: { width: number; height: number }) {
    this.size = size;
    this.build();
  }

  /** 按四角 screen→world 构建网格。 */
  build(): void {
    const size = this.size;
    const tileWorld = Coords.getWorldTileSize();
    const a = IsoCoords.screenTileToWorld(0, 0);
    const b = IsoCoords.screenTileToWorld(size.width, size.height);
    const c = IsoCoords.screenTileToWorld(0, size.height);
    const d = IsoCoords.screenTileToWorld(size.width, 0);
    const w = b.x - a.x;
    const h = c.y - d.y;
    const geometry = new (THREE as any).PlaneGeometry(w, h, w / tileWorld, h / tileWorld);
    const material = new (THREE as any).MeshBasicMaterial({
      color: 9474192,
      wireframe: true,
      side: (THREE as any).DoubleSide,
    });
    const mesh = new (THREE as any).Mesh(geometry, material);
    mesh.matrixAutoUpdate = false;
    mesh.rotation.x = Math.PI / 2;
    mesh.updateMatrix();
    const root = new (THREE as any).Object3D();
    root.matrixAutoUpdate = false;
    root.add(mesh);
    root.position.x = w / 2;
    root.position.z = h / 2;
    root.position.y = -1 * Coords.ISO_WORLD_SCALE;
    root.updateMatrix();
    this.target = root;
  }

  /** 取 3D 对象。 */
  get3DObject(): any {
    return this.target;
  }

  /** 构造已完成，无额外创建。 */
  create3DObject(): void {}

  /** 无逐帧逻辑。 */
  update(): void {}
}
