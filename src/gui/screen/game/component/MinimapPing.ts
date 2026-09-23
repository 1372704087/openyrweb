/**
 * MinimapPing — 小地图雷达事件脉冲方框（缩放/旋转/颜色插值）。
 *
 * 由 gui/screen/game/component/MinimapPing.ts.js
 * 重写为 TS（行为完全一致）。
 */
import { UiObject } from "gui/UiObject"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 小地图 ping 脉冲。 */
export class MinimapPing extends UiObject {
  /** 雷达规则。 */
  radarRules: any;
  /** 颜色 lerp 因子。 */
  colorLerpFactor = 0;
  /** 高亮色。 */
  hiColor: THREE.Color;
  /** 低亮色。 */
  lowColor: THREE.Color;
  /** 材质用高亮色副本。 */
  matHiColor: THREE.Color;
  /** 材质用低亮色副本。 */
  matLowColor: THREE.Color;
  /** 上次更新时间。 */
  lastUpdate: number | undefined;

  /**
   * @param radarRules 雷达规则
   * @param hiColor 高亮色
   * @param lowColor 低亮色
   */
  constructor(radarRules: any, hiColor: any, lowColor: any) {
    super();
    this.radarRules = radarRules;
    this.colorLerpFactor = 0;
    this.hiColor = new THREE.Color(hiColor);
    this.lowColor = new THREE.Color(lowColor);
    this.matHiColor = this.hiColor.clone();
    this.matLowColor = this.lowColor.clone();
    const r = radarRules.eventMinRadius;
    const line = this.createPingRectLine(r, r, this.matHiColor, this.matLowColor);
    line.name = "minimap_ping";
    line.scale.x = 15;
    line.scale.y = 15;
    this.set3DObject(line);
    this.get3DObject().matrixAutoUpdate = true;
  }

  /**
   * 交替颜色的矩形线段。
   * @param w 宽
   * @param h 高
   * @param colorA 角色 A
   * @param colorB 角色 B
   */
  createPingRectLine(w: number, h: number, colorA: THREE.Color, colorB: THREE.Color): any {
    const geometry = new THREE.Geometry();
    const verts = [
      new THREE.Vector3(-0.5 * w, -0.5 * h, 0),
      new THREE.Vector3(-0.5 * w, 0.5 * h, 0),
      new THREE.Vector3(0.5 * w, 0.5 * h, 0),
      new THREE.Vector3(0.5 * w, -0.5 * h, 0),
    ];
    const colors = [colorA, colorB];
    verts.forEach((v, i) => {
      geometry.vertices.push(v, verts[(i + 1) % verts.length]);
      geometry.colors.push(colors[i % 2], colors[(i + 1) % 2]);
    });
    const material = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors,
      side: THREE.DoubleSide,
    });
    return new THREE.LineSegments(geometry, material);
  }

  /** 类型收窄。 */
  get3DObject(): any {
    return super.get3DObject();
  }

  /**
   * 按帧时间缩放/旋转/颜色。
   * @param now 帧时间 ms
   */
  update(now: number): void {
    super.update(now);
    this.lastUpdate ||= now;
    const frameScale = ((now - this.lastUpdate) / 1e3) * 60;
    this.lastUpdate = now;
    const obj = this.get3DObject();
    const shrink = this.radarRules.eventSpeed / this.radarRules.eventMinRadius;
    obj.scale.x = Math.max(1, obj.scale.x - shrink * frameScale);
    obj.scale.y = Math.max(1, obj.scale.y - shrink * frameScale);
    obj.rotation.z = obj.rotation.z + this.radarRules.eventRotationSpeed * frameScale;
    if (obj.scale.x === 1) {
      obj.rotation.z = Math.min(
        obj.rotation.z,
        (Math.floor(obj.rotation.z / (Math.PI / 2)) * Math.PI) / 2,
      );
    }
    this.colorLerpFactor =
      (this.colorLerpFactor + this.radarRules.eventColorSpeed * frameScale) % 2;
    const t =
      Math.min(1, this.colorLerpFactor) - Math.max(0, this.colorLerpFactor - 1);
    this.matHiColor.copy(this.hiColor).lerp(this.lowColor, t);
    this.matLowColor.copy(this.lowColor).lerp(this.hiColor, t);
    obj.geometry.colorsNeedUpdate = true;
  }

  /** 释放材质与几何。 */
  destroy(): void {
    super.destroy();
    this.get3DObject().material.dispose();
    this.get3DObject().geometry.dispose();
  }
}
