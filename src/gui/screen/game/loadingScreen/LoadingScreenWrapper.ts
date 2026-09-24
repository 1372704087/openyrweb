/**
 * LoadingScreenWrapper — 加载画面 3D 背景 + HTML LoadingScreen 包装。
 *
 * 由 gui/screen/game/loadingScreen/LoadingScreenWrapper.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as HtmlViewModule from "gui/jsx/HtmlView"; // 孪生
import * as LoadingScreenModule from "gui/screen/game/loadingScreen/LoadingScreen"; // 孪生
import * as constantsModule from "game/gameopts/constants"; // 孪生
import { SideType } from "game/SideType"; // 已转换
import * as EngineModule from "engine/Engine"; // 孪生
import * as EngineTypeModule from "engine/EngineType"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const UiObject: any = (UiObjectModule as any).UiObject;
const HtmlView: any = (HtmlViewModule as any).HtmlView;
const LoadingScreen: any = (LoadingScreenModule as any).LoadingScreen;
const OBS_COUNTRY_NAME: any = (constantsModule as any).OBS_COUNTRY_NAME;
const OBS_COUNTRY_UI_NAME: any = (constantsModule as any).OBS_COUNTRY_UI_NAME;
const Engine: any = (EngineModule as any).Engine;
const EngineType: any = (EngineTypeModule as any).EngineType;

/** 国家 → 背景 SHP。 */
const COUNTRY_IMAGE = new Map<string, string>()
  .set("Americans", "ls800ustates.shp")
  .set("French", "ls800france.shp")
  .set("Germans", "ls800germany.shp")
  .set("British", "ls800ukingdom.shp")
  .set("Russians", "ls800russia.shp")
  .set("Confederation", "ls800cuba.shp")
  .set("Africans", "ls800libya.shp")
  .set("Arabs", "ls800iraq.shp")
  .set("Alliance", "ls800korea.shp")
  .set("YuriCountry", "ls800yuri.shp")
  .set(OBS_COUNTRY_NAME, "ls800obs.shp");

/** 国家 → 调色板。 */
const COUNTRY_PAL = new Map<string, string>()
  .set("Americans", "mplsu.pal")
  .set("French", "mplsf.pal")
  .set("Germans", "mplsg.pal")
  .set("British", "mplsuk.pal")
  .set("Russians", "mplsr.pal")
  .set("Confederation", "mplsc.pal")
  .set("Africans", "mplsl.pal")
  .set("Arabs", "mplsi.pal")
  .set("Alliance", "mplsk.pal")
  .set("YuriCountry", "mpyls.pal")
  .set(OBS_COUNTRY_NAME, "mplsobs.pal");

/** 加载屏包装。 */
export class LoadingScreenWrapper extends UiComponent {
  /** 当前国家名。 */
  countryName: string;
  /** 文本色。 */
  color: string;
  /** CDN HTML 背景 URL。 */
  bgHtmlImg: string | undefined;
  /** 本地 sprite 背景图。 */
  bgSpriteImg: string | undefined;
  /** 本地 sprite 调色板。 */
  bgSpritePal: string | undefined;
  /** 背景精灵。 */
  sprite: any;
  /** HTML 视图。 */
  htmlEl: any;

  /**
   * 解析本地玩家国家背景并建根对象。
   * @param props playerName/gameResConfig
   */
  createUiObject({ playerName, gameResConfig }: { playerName?: string; gameResConfig: any }): any {
    const root = new UiObject(new THREE.Object3D(), new HtmlContainer());
    const info = playerName
      ? this.props.playerInfos.find((p: any) => p.name === playerName)
      : void 0;
    const country = info?.country ? info.country.name : OBS_COUNTRY_NAME;
    this.countryName = country;
    let color = info?.color ?? "#fff";
    if (info?.country) {
      const sideKey = info.country.side === SideType.GDI ? "AlliedLoad" : "SovietLoad";
      color = this.props.rules.colors.get(sideKey)?.asHexString() ?? "#fff";
    }
    this.color = color;
    let image = COUNTRY_IMAGE.get(country);
    // graceful fallback if the country-specific loading screen art is absent
    // (e.g. Yuri's ls800yuri.shp may be missing from some user YR installs). Fall back to
    // the US loading screen (always present in RA2 data) so the game still loads instead
    // of throwing "Missing image" and aborting onEnter. Non-fatal: cosmetic only.
    if (
      image &&
      !gameResConfig.isCdn() &&
      Engine.vfs &&
      !Engine.vfs.fileExists(image)
    ) {
      console.warn('Loading screen art "' + image + '" not in VFS — falling back to standard screen.');
      image = COUNTRY_IMAGE.get("Americans");
    }
    if (image) {
      if (gameResConfig.isCdn()) {
        this.bgHtmlImg = gameResConfig.getCdnBaseUrl() + "ls/" + image.replace(".shp", ".png");
      } else {
        this.bgSpriteImg = image;
        // YR-only — loading-screen palette always sourced from m.get(a).
        this.bgSpritePal = COUNTRY_PAL.get(country);
        // graceful fallback if the country-specific palette is absent
        // (e.g. Confederation's mplsc.apl may be missing from some user YR installs).
        if (
          this.bgSpritePal &&
          !gameResConfig.isCdn() &&
          Engine.vfs &&
          !Engine.vfs.fileExists(this.bgSpritePal)
        ) {
          console.warn(
            'Loading screen palette "' + this.bgSpritePal + '" not in VFS — falling back to US palette.',
          );
          this.bgSpritePal = COUNTRY_PAL.get("Americans");
        }
      }
    } else {
      console.warn("Missing loading image for country " + country);
    }
    return root;
  }

  /** 背景 sprite（非 CDN）+ HTML LoadingScreen。 */
  defineChildren(): any {
    const countries = this.props.rules.getMultiplayerCountries();
    const viewport = this.props.viewport;
    return jsx(
      "fragment",
      null,
      this.props.gameResConfig.isCdn()
        ? []
        : jsx("sprite", {
            image: this.bgSpriteImg,
            palette: this.bgSpritePal,
            x: viewport.x,
            y: viewport.y,
            ref: (e: any) => (this.sprite = e),
          }),
      jsx(HtmlView, {
        innerRef: (e: any) => (this.htmlEl = e),
        component: LoadingScreen,
        props: {
          viewport: this.props.viewport,
          countryUiNames: new Map(
            ([[OBS_COUNTRY_NAME, OBS_COUNTRY_UI_NAME]] as any[]).concat(
              countries.map((c: any) => [c.name, c.uiName] as [string, string]),
            ) as [string, string][],
          ),
          strings: this.props.strings,
          countryName: this.countryName,
          mapName: this.props.mapName,
          color: this.color,
          playerInfos: this.props.playerInfos,
          bgImageSrc: this.bgHtmlImg,
          mapPreviewUrl: this.props.mapPreviewUrl,
          campaignInfo: this.props.campaignInfo,
        },
      }),
    );
  }

  /**
   * 更新视口。
   * @param viewport 新视口
   */
  updateViewport(viewport: any): void {
    this.htmlEl?.applyOptions((opts: any) => (opts.viewport = viewport));
    this.sprite?.setPosition(viewport.x, viewport.y);
  }

  /**
   * 转发 HTML options。
   * @param fn 更新函数
   */
  applyOptions(fn: (opts: any) => void): void {
    this.htmlEl?.applyOptions(fn);
  }
}
