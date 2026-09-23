/**
 * CountryIcon — 国家旗帜图标（固定 PCX 映射表）。
 *
 * 由 gui/component/CountryIcon.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import * as GameOptsConstantsModule from "game/gameopts/constants"; // 已转换
import { Image } from "gui/component/Image"; // 孪生（本批内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

const React: any = (ReactModule as any).default;
const RANDOM_COUNTRY_NAME: any = (GameOptsConstantsModule as any).RANDOM_COUNTRY_NAME;
const OBS_COUNTRY_NAME: any = (GameOptsConstantsModule as any).OBS_COUNTRY_NAME;

/** 国家名 → PCX 路径。 */
const COUNTRY_ICONS = new Map<string, string>()
  .set("Americans", "usai.pcx")
  .set("French", "frai.pcx")
  .set("Germans", "geri.pcx")
  .set("British", "gbri.pcx")
  .set("Russians", "rusi.pcx")
  .set("Confederation", "lati.pcx")
  .set("Africans", "djbi.pcx")
  .set("Arabs", "arbi.pcx")
  .set("Alliance", "japi.pcx")
  .set("YuriCountry", "yrii.pcx")
  .set(RANDOM_COUNTRY_NAME, "rani.pcx")
  .set(OBS_COUNTRY_NAME, "obsi.pcx");

/** 国家图标组件。 */
export class CountryIcon extends (React.Component as any) {
  /** 渲染图标 div。 */
  render(): any {
    const src = COUNTRY_ICONS.get(this.props.country);
    return React.createElement(
      "div",
      { className: "player-country-icon" },
      src ? React.createElement(Image, { src }) : null,
    );
  }
}
