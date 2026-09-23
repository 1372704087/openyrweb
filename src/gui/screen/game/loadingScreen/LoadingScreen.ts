/**
 * LoadingScreen — 加载画面 React 组件（战役/多人进度与简报）。
 *
 * 由 gui/screen/game/loadingScreen/LoadingScreen.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生
import * as PlayerConnectionStatusModule from "network/gamestate/PlayerConnectionStatus"; // 孪生
import * as CountryIconModule from "gui/component/CountryIcon"; // 孪生
import * as constantsModule from "game/gameopts/constants"; // 孪生
import * as TeamSelectModule from "gui/component/TeamSelect"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const React: any = (ReactModule as any).default ?? ReactModule;
const PlayerConnectionStatus: any = (PlayerConnectionStatusModule as any).PlayerConnectionStatus;
const CountryIcon: any = (CountryIconModule as any).CountryIcon;
const TeamSelect: any = (TeamSelectModule as any).TeamSelect;
const NO_TEAM_ID: any = (constantsModule as any).NO_TEAM_ID;
const OBS_COUNTRY_NAME: any = (constantsModule as any).OBS_COUNTRY_NAME;

/** 各国特殊单位名 key。 */
const SPECIAL_UNIT = new Map<string, string>()
  .set("Americans", "Name:Para")
  .set("French", "Name:GTGCAN")
  .set("Germans", "Name:TNKD")
  .set("British", "Name:SNIPE")
  .set("Russians", "Name:TTNK")
  .set("Confederation", "Name:TERROR")
  .set("Africans", "Name:DTRUCK")
  .set("Arabs", "Name:DESO")
  .set("Alliance", "Name:BEAGLE");

/** 各国简报 key。 */
const COUNTRY_BRIEF = new Map<string, string>()
  .set("Americans", "LoadBrief:USA")
  .set("French", "LoadBrief:French")
  .set("Germans", "LoadBrief:Germans")
  .set("British", "LoadBrief:British")
  .set("Russians", "LoadBrief:Russia")
  .set("Confederation", "LoadBrief:Cuba")
  .set("Africans", "LoadBrief:Lybia")
  .set("Arabs", "LoadBrief:Iraq")
  .set("Alliance", "LoadBrief:Korea");

/** 加载画面组件。 */
export class LoadingScreen extends React.Component {
  /** 渲染主视图。 */
  render(): any {
    const playerInfos = this.props.playerInfos;
    const countryName = this.props.countryName;
    const color = this.props.color;
    // 战役加载画面（参考临时源码 UKe）
    if (this.props.campaignInfo) {
      const ci = this.props.campaignInfo;
      const strings = this.props.strings;
      const loadMsg = strings.get(ci.loadMessageKey);
      const brief = ci.loadBriefingKey ? strings.get(ci.loadBriefingKey) : "";
      return React.createElement(
        "div",
        {
          className: "campaign-loading-screen " + (ci.side || "training"),
          "data-testid": "campaign-loading-screen",
          style: this.getStyle(this.props.bgImageSrc),
        },
        ci.loadingImage
          ? React.createElement("img", {
              className: "campaign-loading-art",
              src: ci.loadingImage,
              alt: "",
            })
          : null,
        React.createElement("div", { className: "campaign-loading-title" }, strings.get(ci.uiNameKey)),
        loadMsg !== ci.loadMessageKey
          ? React.createElement("p", { className: "campaign-loading-message" }, loadMsg)
          : null,
        brief ? React.createElement("p", { className: "campaign-loading-briefing" }, brief) : null,
        React.createElement("progress", {
          className: "campaign-loading-progress",
          value: "" + (playerInfos?.[0]?.loadPercent ?? 0),
          max: 100,
        }),
      );
    }
    const showTeams =
      playerInfos.length > 1 &&
      playerInfos.every((p) => !p.country || p.team !== NO_TEAM_ID);
    const briefKey = COUNTRY_BRIEF.get(countryName);
    const specialKey = SPECIAL_UNIT.get(countryName);
    const strings = this.props.strings;
    return React.createElement(
      "div",
      { className: "loading-screen", style: this.getStyle(this.props.bgImageSrc) },
      specialKey
        ? React.createElement("div", { className: "special-unit-name" }, strings.get(specialKey))
        : null,
      briefKey
        ? React.createElement(
            "div",
            { className: "briefing-text", style: { color } },
            strings.get(briefKey),
          )
        : null,
      React.createElement(
        "div",
        { className: "loading-text", style: { color } },
        strings.get("GUI:LoadingEx"),
      ),
      React.createElement(
        "div",
        { className: "player-status-container" },
        playerInfos ? playerInfos.map((info: any) => this.renderStatus(info, showTeams)) : null,
      ),
      React.createElement(
        "div",
        { style: { color }, className: "country-name" },
        this.props.strings.get(this.props.countryUiNames.get(countryName) || countryName),
      ),
      React.createElement(
        "div",
        { style: { color }, className: "map-name" },
        this.props.mapName,
      ),
      this.props.mapPreviewUrl
        ? React.createElement(
            "div",
            { className: "map-preview", style: this.getMapPreviewStyle() },
            React.createElement("img", {
              src: this.props.mapPreviewUrl,
              style: { width: "100%", height: "100%", objectFit: "contain" },
            }),
          )
        : null,
    );
  }

  /**
   * 单个玩家状态行。
   * @param info 玩家信息
   * @param showTeam 是否显示队伍
   */
  renderStatus(info: any, showTeam: boolean): any {
    const opacity = info.status === PlayerConnectionStatus.Connected ? 1 : 0.5;
    return React.createElement(
      "div",
      { key: info.name, className: "player-status", style: { opacity, color: info.color } },
      showTeam &&
        React.createElement(
          "span",
          { className: "player-team" },
          info.country !== void 0 &&
            this.props.strings.get("GUI:TeamNo", TeamSelect.formatTeamId(info.team)),
        ),
      React.createElement("progress", { value: "" + info.loadPercent, max: 100 }),
      React.createElement(CountryIcon, {
        country: info.country ? info.country.name : OBS_COUNTRY_NAME,
      }),
      React.createElement("span", { className: "player-name" }, info.name),
    );
  }

  /**
   * 根样式（背景图 + viewport 定位）。
   * @param bgImageSrc 背景图
   */
  getStyle(bgImageSrc?: string): any {
    const viewport = this.props.viewport;
    return {
      backgroundImage: bgImageSrc ? `url(${bgImageSrc})` : void 0,
      backgroundSize: "cover",
      width: viewport.width + "px",
      height: viewport.height + "px",
      position: "absolute",
      left: viewport.x,
      top: viewport.y,
    };
  }

  /** 地图预览定位。 */
  getMapPreviewStyle(): any {
    const viewport = this.props.viewport;
    return {
      position: "absolute",
      left: Math.round(viewport.width * 0.625) + "px",
      top: Math.round(viewport.height * 0.632) + "px",
      width: Math.round(viewport.width * 0.27) + "px",
      height: Math.round(viewport.height * 0.27) + "px",
      overflow: "hidden",
    };
  }
}
