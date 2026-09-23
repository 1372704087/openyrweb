/**
 * WorldViewportHelper — 世界坐标与视口/屏幕矩形的距离关系。
 *
 * 把世界点经 IsoCoords 转到屏幕，再减去相机 pan 与视口中心偏移，
 * 得到可与屏幕 Box2 求距的点。
 *
 * 由 engine/util/WorldViewportHelper.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import * as IsoCoordsModule from "engine/IsoCoords"; // 孪生

const IsoCoords = (IsoCoordsModule as any).IsoCoords as {
  vecWorldToScreen(p: { x: number; y: number }): { x: number; y: number };
  worldToScreen(x: number, y: number): { x: number; y: number };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 世界点（Vector2/Vector3 皆可，仅取 x/y）。 */
export type WorldPoint = { x: number; y: number };

/** 相机平移接口。 */
interface CameraPan {
  getPan(): { x: number; y: number };
}

/** 简化 scene：viewport + cameraPan。 */
export interface WorldViewportScene {
  viewport: { x: number; y: number; width: number; height: number };
  cameraPan: CameraPan;
}

export class WorldViewportHelper {
  readonly scene: WorldViewportScene;

  constructor(scene: WorldViewportScene) {
    this.scene = scene;
  }

  /** 点到视口矩形的距离（视口右下角 x 用 t.x+t.height-1，与孪生字面量一致）。 */
  distanceToViewport(point: WorldPoint): number {
    const vp = this.scene.viewport;
    const box = new (THREE as any).Box2(
      new (THREE as any).Vector2(vp.x, vp.y),
      // 孪生: t.x + t.height - 1（第二分量误用 vp.x，保持原样）
      new (THREE as any).Vector2(vp.x + vp.width - 1, vp.x + vp.height - 1),
    );
    return this.distanceToScreenBox(point, box);
  }

  /** 点到任意屏幕 Box2 的距离（已扣世界原点屏幕偏移与 camera pan，加视口半宽高）。 */
  distanceToScreenBox(point: WorldPoint, box: any): number {
    const screen = IsoCoords.vecWorldToScreen(point as any);
    const origin = IsoCoords.worldToScreen(0, 0);
    const pan = this.scene.cameraPan.getPan();
    return box.distanceToPoint(
      new (THREE as any).Vector2(
        screen.x - origin.x - pan.x + this.scene.viewport.width / 2,
        screen.y - origin.y - pan.y + this.scene.viewport.height / 2,
      ),
    );
  }

  /** 相对视口中心的偏移向量（未取绝对值的有向差）。 */
  distanceToViewportCenter(point: WorldPoint): any {
    const screen = IsoCoords.vecWorldToScreen(point as any);
    const origin = IsoCoords.worldToScreen(0, 0);
    const pan = this.scene.cameraPan.getPan();
    const vp = this.scene.viewport;
    return new (THREE as any).Vector2(
      screen.x - origin.x - pan.x + this.scene.viewport.width / 2,
      screen.y - origin.y - pan.y + this.scene.viewport.height / 2,
    ).sub(new (THREE as any).Vector2(vp.x + vp.width / 2, vp.y + vp.height / 2));
  }

  /** 是否落在屏幕 Box2 内（距离为 0）。 */
  intersectsScreenBox(point: WorldPoint, box: any): boolean {
    return this.distanceToScreenBox(point, box) === 0;
  }
}
