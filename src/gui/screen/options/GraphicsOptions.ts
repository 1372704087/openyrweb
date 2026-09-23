/**
 * GraphicsOptions — 图形质量选项（模型/阴影/分辨率）。
 *
 * 逗号序列化：models,shadows[,WxH]；resolution 段为空表示 undefined。
 * applyLowPreset / applyHighPreset 切换 ModelQuality + ShadowQuality。
 *
 * 由 gui/screen/options/GraphicsOptions.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { ModelQuality } from "engine/renderable/entity/unit/ModelQuality"; // 已转换
import { ShadowQuality } from "engine/renderable/entity/unit/ShadowQuality"; // 已转换
import { BoxedVar } from "util/BoxedVar"; // 已转换

export class GraphicsOptions {
  /** 分辨率（undefined = 跟随系统/未设置）。 */
  resolution = new BoxedVar<any>(void 0);
  /** 模型质量。 */
  models = new BoxedVar(ModelQuality.High);
  /** 阴影质量。 */
  shadows = new BoxedVar(ShadowQuality.High);

  /** 解析 `models,shadows[,WxH]`。 */
  unserialize(str: string): this {
    let [models, shadows, resolution] = str.split(",");
    let pair: number[] | undefined;
    this.models.value = Number(models);
    this.shadows.value = Number(shadows);
    if (void 0 !== resolution) {
      pair = resolution.length
        ? resolution.split("x").map((n) => Number(n))
        : void 0;
      this.resolution.value = pair
        ? { width: pair[0], height: pair[1] }
        : void 0;
    }
    return this;
  }

  /** 序列化为逗号串。 */
  serialize(): string {
    return [
      this.models.value,
      this.shadows.value,
      this.resolution.value
        ? [this.resolution.value.width, this.resolution.value.height].join(
            "x",
          )
        : "",
    ].join(",");
  }

  /** 低画质预设。 */
  applyLowPreset(): void {
    this.models.value = ModelQuality.Low;
    this.shadows.value = ShadowQuality.Low;
  }

  /** 高画质预设。 */
  applyHighPreset(): void {
    this.models.value = ModelQuality.High;
    this.shadows.value = ShadowQuality.High;
  }
}
