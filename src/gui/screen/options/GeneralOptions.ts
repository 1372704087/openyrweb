/**
 * GeneralOptions — 通用设置（玩法 + 图形 + 源码扩展开关）。
 *
 * 由 gui/screen/options/GeneralOptions.ts.js 重写为 TS。
 * serialize 末尾追加 enableAres / enablePhobos；旧存档缺字段时保持默认关闭。
 */
import * as FlyerHelperModeModule from "engine/renderable/entity/unit/FlyerHelperMode";
import { Base64 } from "util/Base64";
import { BoxedVar } from "util/BoxedVar";
import * as GraphicsOptionsModule from "gui/screen/options/GraphicsOptions";

const FlyerHelperMode = FlyerHelperModeModule as any;
const GraphicsOptions = (GraphicsOptionsModule as any).GraphicsOptions;

export const SCROLL_BASE_FACTOR = 3;

export class GeneralOptions {
  scrollRate = new BoxedVar(12);
  flyerHelper = new BoxedVar(FlyerHelperMode.FlyerHelperMode.Selected);
  hiddenObjects = new BoxedVar(true);
  targetLines = new BoxedVar(true);
  rightClickMove = new BoxedVar(false);
  rightClickScroll = new BoxedVar(true);
  mouseAcceleration = new BoxedVar(true);
  graphics = new GraphicsOptions();

  unserialize(str: string): this {
    const parts = str.split(",");
    const [
      scrollRate,
      flyerHelper,
      graphics,
      hiddenObjects,
      rightClickMove,
      rightClickScroll,
      targetLines,
      mouseAcceleration,
    ] = parts;
    this.scrollRate.value = Number(scrollRate);
    if (void 0 !== flyerHelper) this.flyerHelper.value = Number(flyerHelper);
    if (void 0 !== graphics) this.graphics.unserialize(Base64.decode(graphics));
    if (void 0 !== hiddenObjects) this.hiddenObjects.value = Boolean(Number(hiddenObjects));
    if (void 0 !== rightClickMove) this.rightClickMove.value = Boolean(Number(rightClickMove));
    if (void 0 !== rightClickScroll) this.rightClickScroll.value = Boolean(Number(rightClickScroll));
    if (void 0 !== targetLines) this.targetLines.value = Boolean(Number(targetLines));
    if (void 0 !== mouseAcceleration) this.mouseAcceleration.value = Boolean(Number(mouseAcceleration));
    return this;
  }

  serialize(): string {
    return [
      this.scrollRate.value,
      this.flyerHelper.value,
      Base64.encode(this.graphics.serialize()),
      Number(this.hiddenObjects.value),
      Number(this.rightClickMove.value),
      Number(this.rightClickScroll.value),
      Number(this.targetLines.value),
      Number(this.mouseAcceleration.value),
    ].join(",");
  }
}
