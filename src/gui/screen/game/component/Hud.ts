/**
 * Hud — 对局 HUD 根（侧栏/雷达/命令栏/消息/菜单内容区）。
 *
 * 由 gui/screen/game/component/Hud.ts.js 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as ShpFileModule from "data/ShpFile"; // 孪生
import { SideType } from "game/SideType"; // 已转换
import { SidebarCard } from "gui/screen/game/component/hud/SidebarCard"; // 已转换
import { SidebarTabs } from "gui/screen/game/component/hud/SidebarTabs"; // 已转换
import { SidebarIconButton } from "gui/screen/game/component/hud/SidebarIconButton"; // 已转换
import { SidebarMenu } from "gui/screen/game/component/hud/SidebarMenu"; // 已转换
import { UiObject } from "gui/UiObject"; // 已转换
import { HtmlContainer } from "gui/HtmlContainer"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import { GameMenuContentArea } from "gui/screen/game/component/hud/GameMenuContentArea"; // 已转换
import { SidebarPower } from "gui/screen/game/component/hud/SidebarPower"; // 已转换
import { SidebarCredits } from "gui/screen/game/component/hud/SidebarCredits"; // 已转换
import { SidebarRadar } from "gui/screen/game/component/hud/SidebarRadar"; // 已转换
import { CombatantSidebarModel } from "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel"; // 已转换
import { SidebarGameTime } from "gui/screen/game/component/hud/SidebarGameTime"; // 已转换
import { Messages } from "gui/screen/game/component/hud/Messages"; // 已转换
import { SuperWeaponTimers } from "gui/screen/game/component/hud/SuperWeaponTimers"; // 已转换
import { ShpAggregator } from "engine/renderable/builder/ShpAggregator"; // 孪生
import { CommandBarButtonType } from "gui/screen/game/component/hud/commandBar/CommandBarButtonType"; // 已转换
import { commandButtonConfigs } from "gui/screen/game/component/hud/commandBar/commandButtonConfigs"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { DebugText } from "gui/screen/game/component/hud/DebugText"; // 已转换
import * as EngineModule from "engine/Engine"; // 孪生
import * as EngineTypeModule from "engine/EngineType"; // 孪生
import * as HtmlViewModule from "gui/jsx/HtmlView"; // 孪生
import { PhobosVersionWarning } from "gui/screen/game/component/hud/PhobosVersionWarning"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const ShpFile: any = (ShpFileModule as any).ShpFile;
const HtmlView: any = (HtmlViewModule as any).HtmlView;
const Engine: any = EngineModule as any;
const EngineType: any = EngineTypeModule as any;
const ShpAggregatorCtor: any = (ShpAggregator as any) ?? ShpAggregator;

/** 对局 HUD。 */
export class Hud extends UiObject {
  /** 阵营。 */
  sideType: any;
  /** 视口。 */
  viewport: any;
  /** 图片表。 */
  images: any;
  /** 调色板表。 */
  palettes: any;
  /** cameo 文件名。 */
  cameoFilenames: any;
  /** 侧栏模型。 */
  sidebarModel: any;
  /** 消息列表。 */
  messageList: any;
  /** 聊天历史。 */
  chatHistory: any;
  /** 调试文本值。 */
  debugTextValue: any;
  /** 调试开关。 */
  debugTextEnabled: any;
  /** 本地玩家。 */
  localPlayer: any;
  /** 玩家列表。 */
  players: any;
  /** 僵局 trait。 */
  stalemateDetectTrait: any;
  /** 倒计时。 */
  countdownTimer: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 字符串。 */
  strings: any;
  /** 命令栏按钮类型。 */
  commandBarButtonTypes: any;
  /** 侧栏宽。 */
  sidebarWidth = 0;
  /** 重复行数。 */
  repeaterCount = 0;
  /** 重复行高。 */
  repeaterHeight = 0;
  /** 底部命令栏高。 */
  actionBarHeight = 0;
  /** 侧栏按钮容器。 */
  sidebarButtonsContainer: any;
  /** 侧栏菜单容器。 */
  sidebarMenuContainer: any;
  /** 侧栏顶。 */
  sidebarTop: any;
  /** 侧栏雷达。 */
  sidebarRadar: any;
  /** 侧栏卡。 */
  sidebarCard: any;
  /** 侧栏电力。 */
  sidebarPower: any;
  /** came 重复。 */
  sideCameoRepeaters: any;
  /** 消息。 */
  messages: any;
  /** 调试文本。 */
  debugText: any;
  /** 超武计时。 */
  superWeaponTimers: any;
  /** Phobos 警告。 */
  phobosVersionWarning: any;
  /** 菜单内容容器。 */
  menuContentContainer: any;
  /** 菜单内容内层。 */
  menuContentContainerInner: any;
  /** 当前菜单内容。 */
  menuContent: any;
  /** 当前侧栏菜单。 */
  sidebarMenu: any;
  /** 修按钮。 */
  repairButton: any;
  /** 卖按钮。 */
  sellButton: any;
  /** 翻页下。 */
  pgDnButton: any;
  /** 翻页上。 */
  pgUpButton: any;
  /** 命令栏按钮实例。 */
  commandBarButtons: any[] = [];
  /** 外交事件。 */
  private _onDiploButtonClick = new EventDispatcher();
  /** 选项事件。 */
  private _onOptButtonClick = new EventDispatcher();
  /** 修理事件。 */
  private _onRepairButtonClick = new EventDispatcher();
  /** 出售事件。 */
  private _onSellButtonClick = new EventDispatcher();
  /** 槽点击事件。 */
  private _onSidebarSlotClick = new EventDispatcher();
  /** 页签事件。 */
  private _onSidebarTabClick = new EventDispatcher();
  /** 资金 tick。 */
  private _onCreditsTick = new EventDispatcher();
  /** 消息 tick。 */
  private _onMessagesTick = new EventDispatcher();
  /** 消息提交。 */
  private _onMessageSubmit = new EventDispatcher();
  /** 消息取消。 */
  private _onMessageCancel = new EventDispatcher();
  /** 翻页点击。 */
  private _onScrollButtonClick = new EventDispatcher();
  /** 命令栏点击。 */
  private _onCommandBarButtonClick = new EventDispatcher();

  /** 外交按钮。 */
  get onDiploButtonClick() {
    return this._onDiploButtonClick.asEvent();
  }

  /** 选项按钮。 */
  get onOptButtonClick() {
    return this._onOptButtonClick.asEvent();
  }

  /** 修理按钮。 */
  get onRepairButtonClick() {
    return this._onRepairButtonClick.asEvent();
  }

  /** 出售按钮。 */
  get onSellButtonClick() {
    return this._onSellButtonClick.asEvent();
  }

  /** 槽点击。 */
  get onSidebarSlotClick() {
    return this._onSidebarSlotClick.asEvent();
  }

  /** 页签点击。 */
  get onSidebarTabClick() {
    return this._onSidebarTabClick.asEvent();
  }

  /** 资金 tick。 */
  get onCreditsTick() {
    return this._onCreditsTick.asEvent();
  }

  /** 消息 tick。 */
  get onMessagesTick() {
    return this._onMessagesTick.asEvent();
  }

  /** 消息提交。 */
  get onMessageSubmit() {
    return this._onMessageSubmit.asEvent();
  }

  /** 消息取消。 */
  get onMessageCancel() {
    return this._onMessageCancel.asEvent();
  }

  /** 翻页点击。 */
  get onScrollButtonClick() {
    return this._onScrollButtonClick.asEvent();
  }

  /** 命令栏点击。 */
  get onCommandBarButtonClick() {
    return this._onCommandBarButtonClick.asEvent();
  }

  /**
   * @param sideType 阵营
   * @param viewport 视口
   * @param images 图片
   * @param palettes 调色板
   * @param cameoFilenames cameo 列表
   * @param sidebarModel 侧栏模型
   * @param messageList 消息
   * @param chatHistory 聊天
   * @param debugTextValue 调试文本
   * @param debugTextEnabled 调试开关
   * @param localPlayer 本地玩家
   * @param players 玩家
   * @param stalemateDetectTrait 僵局
   * @param countdownTimer 倒计时
   * @param jsxRenderer JSX
   * @param strings 字符串
   * @param commandBarButtonTypes 命令栏按钮
   */
  constructor(
    sideType: any,
    viewport: any,
    images: any,
    palettes: any,
    cameoFilenames: any,
    sidebarModel: any,
    messageList: any,
    chatHistory: any,
    debugTextValue: any,
    debugTextEnabled: any,
    localPlayer: any,
    players: any,
    stalemateDetectTrait: any,
    countdownTimer: any,
    jsxRenderer: any,
    strings: any,
    commandBarButtonTypes: any,
  ) {
    super(new THREE.Object3D(), new HtmlContainer());
    this.sideType = sideType;
    this.viewport = viewport;
    this.images = images;
    this.palettes = palettes;
    this.cameoFilenames = cameoFilenames;
    this.sidebarModel = sidebarModel;
    this.messageList = messageList;
    this.chatHistory = chatHistory;
    this.debugTextValue = debugTextValue;
    this.debugTextEnabled = debugTextEnabled;
    this.localPlayer = localPlayer;
    this.players = players;
    this.stalemateDetectTrait = stalemateDetectTrait;
    this.countdownTimer = countdownTimer;
    this.jsxRenderer = jsxRenderer;
    this.strings = strings;
    this.commandBarButtonTypes = commandBarButtonTypes;
    this._onDiploButtonClick = new EventDispatcher();
    this._onOptButtonClick = new EventDispatcher();
    this._onRepairButtonClick = new EventDispatcher();
    this._onSellButtonClick = new EventDispatcher();
    this._onSidebarSlotClick = new EventDispatcher();
    this._onSidebarTabClick = new EventDispatcher();
    this._onCreditsTick = new EventDispatcher();
    this._onMessagesTick = new EventDispatcher();
    this._onMessageSubmit = new EventDispatcher();
    this._onMessageCancel = new EventDispatcher();
    this._onScrollButtonClick = new EventDispatcher();
    this._onCommandBarButtonClick = new EventDispatcher();
    this.commandBarButtons = [];
    this.init();
  }

  /**
   * 取图（缺失抛错）。
   * @param name 文件名
   */
  getImage(name: string): any {
    const img = this.images.get(name);
    if (!img) throw new Error(`Missing image "${name}"`);
    return img;
  }

  /** 构建整棵 HUD 子树。 */
  init(): void {
    const sidebarPal = this.palettes.get("sidebar.pal");
    if (!sidebarPal) throw new Error('Missing palette "sidebar.pal"');
    // YR-only — the engine check is always true; keep the Yuri-side
    // (ThirdSide) styling branch for Yuri faction UI.
    const isYuri = this.sideType === SideType.ThirdSide;
    const credits = this.getImage("credits.shp");
    const top = this.getImage("top.shp");
    const radar = isYuri ? this.getImage("radary.shp") : this.getImage("radar.shp");
    const radarPal = isYuri ? this.palettes.get("radaryuri.pal") : sidebarPal;
    if (!radarPal) throw new Error('Missing palette "radaryuri.pal"');
    const side1 = this.getImage("side1.shp");
    const side2 = this.getImage("side2.shp");
    const side2b = this.getImage("side2b.shp");
    const side3 = this.getImage("side3.shp");
    const addon = this.getImage("addon.shp");
    const tab00 = this.getImage("tab00.shp");
    const tab01 = this.getImage("tab01.shp");
    const tab02 = this.getImage("tab02.shp");
    const tab03 = this.getImage("tab03.shp");
    const diploBtn = this.getImage("diplobtn.shp");
    const optBtn = this.getImage("optbtn.shp");
    const repairBtn = this.getImage("repair.shp");
    const sellBtn = this.getImage("sell.shp");
    const rUp = this.getImage("r-up.shp");
    const rDn = this.getImage("r-dn.shp");
    let commandIcons = [
      ...new Set(
        this.commandBarButtonTypes.map(
          (t: any) => commandButtonConfigs.find((c) => c.type === t)?.icon,
        ),
      ),
    ]
      .map((icon) => (icon ? this.images.get(icon) : void 0))
      .filter(isNotNullOrUndefined);
    const aggregator = new ShpAggregatorCtor();
    const agg = aggregator.aggregate(
      [diploBtn, optBtn, repairBtn, sellBtn, tab00, tab01, tab02, tab03, rDn, rUp, ...commandIcons].map(
        (s) => ShpAggregatorCtor.getShpFrameInfo(s, false),
      ),
      "agg_hud.shp",
    );
    const sidebarWidth = (this.sidebarWidth = credits.width);
    const panel = {
      x: this.viewport.width - sidebarWidth,
      y: 0,
      width: sidebarWidth,
      height: this.viewport.height,
    };
    const afterCredits = credits.height + top.height;
    const afterRadar = afterCredits + radar.height;
    const afterSide1 = afterCredits + radar.height + side1.height;
    const repeaterCount = (this.repeaterCount = Math.floor(
      (panel.height - afterSide1 - side3.height) / side2.height,
    ));
    const repeaterHeight = (this.repeaterHeight = side2.height);
    const afterRepeaters = afterCredits + radar.height + side1.height + repeaterHeight * repeaterCount;
    const lendCap = this.getImage("lendcap.shp");
    const actionBarHeight = (this.actionBarHeight = lendCap.height);
    const bottomBarY = this.viewport.y + this.viewport.height - actionBarHeight;
    const btnBkgd = this.getImage("bttnbkgd.shp");
    const rendCap = this.getImage("rendcap.shp");
    const freeWidth = panel.x - lendCap.width - rendCap.width;
    const fullTiles = Math.floor(freeWidth / btnBkgd.width);
    const remainder = freeWidth % btnBkgd.width;
    let partialBtn: any;
    if (remainder) partialBtn = btnBkgd.clip(remainder, btnBkgd.height);
    let diploOffset = { x: 12, y: 4 };
    if (this.sideType !== SideType.GDI) diploOffset = { x: 14, y: 5 };
    let repairOffset = { x: 20, y: 8 };
    if (this.sideType !== SideType.GDI) repairOffset = { x: 34, y: 7 };
    let tabSpacing = 1;
    let tabPos = { x: 26, y: -3 };
    if (this.sideType !== SideType.GDI) {
      tabSpacing = 0;
      tabPos = { x: 20, y: -2 };
    }
    let cameoPal = this.palettes.get("cameo.pal");
    if (!cameoPal) throw new Error('Missing palette "cameo.pal"');
    commandIcons = this.buildCameoFile();
    const cameoNameToId = this.createCameoNameToIdMap();
    const cardPadX = 22;
    const cardPadY = 1;
    let powerPad = this.sideType === SideType.GDI ? { x: 5, y: 2 } : { x: 0, y: 0 };
    const pgDnX = 38;
    const pgY = 7;
    const powerImg = this.getImage("powerp.shp");
    const textColor = this.getTextColor();
    this.add(
      ...this.jsxRenderer.render(
        jsx(
          "fragment",
          null,
          // Phobos 版本警告：贴屏幕顶边，右缘贴紧建造栏左缘（x.x）
          jsx(HtmlView, {
            component: PhobosVersionWarning,
            props: {},
            x: Math.max(0, panel.x - 420),
            y: 0,
            width: 420,
            height: 32,
            zIndex: 50,
            ref: (e: any) => (this.phobosVersionWarning = e),
          }),
          jsx(
            "container",
            { x: panel.x, y: panel.y },
            jsx(
              "sprite-batch",
              null,
              jsx("sprite", { static: true, image: credits, palette: sidebarPal }),
              jsx(
                "container",
                { ref: (e: any) => (this.sidebarTop = e), zIndex: 1 },
                this.sidebarModel instanceof CombatantSidebarModel
                  ? jsx(SidebarCredits, {
                      sidebarModel: this.sidebarModel,
                      height: credits.height,
                      width: credits.width,
                      textColor,
                      onTick: (dir: string) => this._onCreditsTick.dispatch(this, dir),
                    })
                  : jsx(SidebarGameTime, {
                      sidebarModel: this.sidebarModel,
                      height: credits.height,
                      width: credits.width,
                      textColor,
                    }),
              ),
              jsx("sprite", { static: true, image: top, palette: sidebarPal, y: credits.height }),
              jsx("sprite", { static: true, image: radar, palette: radarPal, y: afterCredits }),
              jsx(SidebarRadar, {
                image: radar,
                palette: radarPal,
                y: afterCredits,
                sidebarModel:
                  this.sidebarModel instanceof CombatantSidebarModel
                    ? this.sidebarModel
                    : void 0,
                zIndex: 1,
                ref: (e: any) => (this.sidebarRadar = e),
              }),
              jsx("sprite", { static: true, image: side1, palette: sidebarPal, y: afterRadar }),
              new Array(repeaterCount)
                .fill(0)
                .map((_, i) =>
                  jsx("sprite", {
                    static: true,
                    image: side2b,
                    palette: sidebarPal,
                    y: afterSide1 + repeaterHeight * i,
                  }),
                ),
              jsx(
                "sprite-batch",
                { ref: (e: any) => (this.sideCameoRepeaters = e) },
                new Array(repeaterCount)
                  .fill(0)
                  .map((_, i) =>
                    jsx("sprite", {
                      static: true,
                      image: side2,
                      palette: sidebarPal,
                      y: afterSide1 + repeaterHeight * i,
                      zIndex: 1,
                    }),
                  ),
              ),
              jsx(SidebarPower, {
                sidebarModel: this.sidebarModel,
                powerImg,
                palette: sidebarPal,
                x: powerPad.x,
                y: afterSide1,
                height: repeaterHeight * repeaterCount + powerPad.y,
                ref: (e: any) => (this.sidebarPower = e),
                zIndex: 2,
                strings: this.strings,
              }),
              jsx(SidebarCard, {
                cameoImages: commandIcons as any,
                cameoPalette: cameoPal,
                cameoNameToIdMap: cameoNameToId,
                sidebarModel: this.sidebarModel,
                slots: 2 * repeaterCount,
                onSlotClick: (e: any) => this._onSidebarSlotClick.dispatch(this, e),
                x: cardPadX,
                y: afterSide1 + cardPadY,
                strings: this.strings,
                textColor,
                ref: (e: any) => (this.sidebarCard = e),
                zIndex: 2,
              }),
              jsx("container", {
                ref: (e: any) => (this.sidebarMenuContainer = e),
                x: cardPadX - 1,
                y: afterSide1 + cardPadY,
                zIndex: 2,
              }),
              jsx("sprite", { static: true, image: side3, palette: sidebarPal, y: afterRepeaters }),
              jsx("sprite", {
                static: true,
                image: addon,
                palette: sidebarPal,
                y: afterRepeaters + side3.height,
              }),
            ),
          ),
          jsx(
            "container",
            {
              x: panel.x,
              y: panel.y,
              ref: (e: any) => (this.sidebarButtonsContainer = e),
              zIndex: 2,
            },
            jsx(SidebarIconButton, {
              image: agg.file,
              palette: sidebarPal,
              imageFrameOffset: agg.imageIndexes.get(diploBtn),
              x: diploOffset.x,
              y: credits.height + diploOffset.y,
              onClick: () => this._onDiploButtonClick.dispatch(this, void 0),
              tooltip: this.strings.get("Tip:DiplomacyButton"),
            }),
            jsx(SidebarIconButton, {
              image: agg.file,
              palette: sidebarPal,
              imageFrameOffset: agg.imageIndexes.get(optBtn),
              x: diploOffset.x + diploBtn.width,
              y: credits.height + diploOffset.y,
              onClick: () => this._onOptButtonClick.dispatch(this, void 0),
              tooltip: this.strings.get("Tip:OptionsButton"),
            }),
            jsx(SidebarIconButton, {
              image: agg.file,
              palette: sidebarPal,
              imageFrameOffset: agg.imageIndexes.get(repairBtn),
              x: repairOffset.x,
              y: afterRadar + repairOffset.y,
              toggle: this.sidebarModel.repairMode,
              ref: (e: any) => (this.repairButton = e),
              onClick: () => this._onRepairButtonClick.dispatch(this, void 0),
              tooltip: this.strings.get("TXT_REPAIR_MODE"),
            }),
            jsx(SidebarIconButton, {
              image: agg.file,
              palette: sidebarPal,
              imageFrameOffset: agg.imageIndexes.get(sellBtn),
              x: repairOffset.x + repairBtn.width,
              y: afterRadar + repairOffset.y,
              toggle: this.sidebarModel.sellMode,
              ref: (e: any) => (this.sellButton = e),
              onClick: () => this._onSellButtonClick.dispatch(this, void 0),
              tooltip: this.strings.get("TXT_SELL_MODE"),
            }),
            jsx(SidebarTabs, {
              aggregatedImageData: agg,
              images: [tab00, tab01, tab02, tab03],
              palette: sidebarPal,
              sidebarModel: this.sidebarModel,
              tabSpacing,
              onTabClick: (tab: any) => {
                this.sidebarModel.selectTab(tab.id);
                this._onSidebarTabClick.dispatch(this, tab.id);
              },
              strings: this.strings,
              x: tabPos.x,
              y: afterSide1 - tab00.height + tabPos.y,
            }),
            jsx(SidebarIconButton, {
              image: agg.file,
              palette: sidebarPal,
              disabled: true,
              imageFrameOffset: agg.imageIndexes.get(rDn),
              x: pgDnX,
              y: afterRepeaters + pgY,
              ref: (e: any) => (this.pgDnButton = e),
              onClick: () =>
                this._onScrollButtonClick.dispatch(this, this.sidebarCard.pageDown()),
            }),
            jsx(SidebarIconButton, {
              image: agg.file,
              palette: sidebarPal,
              disabled: true,
              imageFrameOffset: agg.imageIndexes.get(rUp),
              x: pgDnX + rDn.width,
              y: afterRepeaters + pgY,
              ref: (e: any) => (this.pgUpButton = e),
              onClick: () =>
                this._onScrollButtonClick.dispatch(this, this.sidebarCard.pageUp()),
            }),
          ),
          jsx(
            "container",
            { x: this.viewport.x, y: bottomBarY },
            jsx(
              "container",
              { x: lendCap.width, zIndex: 1 },
              this.renderCommandBarButtons(
                agg,
                this.commandBarButtonTypes,
                btnBkgd.width,
                fullTiles,
              ),
            ),
            jsx(
              "sprite-batch",
              null,
              jsx("sprite", { static: true, image: lendCap, palette: sidebarPal }),
              new Array(fullTiles)
                .fill(0)
                .map((_, i) =>
                  jsx("sprite", {
                    static: true,
                    image: btnBkgd,
                    palette: sidebarPal,
                    x: lendCap.width + btnBkgd.width * i,
                  }),
                ),
              partialBtn
                ? jsx("sprite", {
                    static: true,
                    image: partialBtn,
                    palette: sidebarPal,
                    x: lendCap.width + fullTiles * btnBkgd.width,
                  })
                : [],
              jsx("sprite", {
                static: true,
                image: rendCap,
                palette: sidebarPal,
                x: panel.x - rendCap.width,
              }),
            ),
          ),
          jsx(Messages, {
            messages: this.messageList,
            chatHistory: this.chatHistory,
            width: panel.x - 10,
            height: 200,
            ref: (e: any) => (this.messages = e),
            strings: this.strings,
            onMessageTick: () => this._onMessagesTick.dispatch(this),
            onMessageSubmit: (e: any) => this._onMessageSubmit.dispatch(this, e),
            onMessageCancel: () => this._onMessageCancel.dispatch(this),
          }),
          jsx(DebugText, {
            text: this.debugTextValue,
            visible: this.debugTextEnabled,
            color: new THREE.Color(16777215),
            x: 20,
            y: 200,
            width: Math.floor(panel.x / 2),
            height: 200,
            ref: (e: any) => (this.debugText = e),
          }),
          jsx(SuperWeaponTimers, {
            localPlayer: this.localPlayer,
            players: this.players,
            stalemateDetectTrait: this.stalemateDetectTrait,
            countdownTimer: this.countdownTimer,
            strings: this.strings,
            width: 200,
            height: 500,
            x: panel.x - 200,
            y: bottomBarY - 500,
            ref: (e: any) => (this.superWeaponTimers = e),
          }),
          jsx(GameMenuContentArea, {
            hidden: true,
            screenSize: this.viewport,
            viewport: {
              x: this.viewport.x,
              y: this.viewport.y,
              width: panel.x,
              height: bottomBarY,
            },
            sideType: this.sideType,
            images: this.images,
            ref: (e: any) => (this.menuContentContainer = e.getUiObject()),
            innerRef: (e: any) => (this.menuContentContainerInner = e),
          }),
        ),
      ),
    );
  }

  /** 文本色：盟军淡蓝 / 其余黄。 */
  getTextColor(): string {
    return this.sideType === SideType.GDI ? "rgb(165,211,255)" : "yellow";
  }

  /**
   * 创建侧栏菜单。
   * @param buttons 按钮配置
   */
  createSidebarMenu(buttons: any): any {
    return this.jsxRenderer.render(
      jsx(SidebarMenu, {
        buttonImg: this.getImage("sidebttn.shp"),
        buttonPal: "sidebar.pal",
        menuHeight: this.repeaterHeight * this.repeaterCount - 2,
        buttons,
      }),
    )[0];
  }

  /**
   * 显示侧栏菜单并隐藏常规 HUD 部件。
   * @param buttons 按钮配置
   */
  showSidebarMenu(buttons: any): void {
    this.destroySidebarMenu();
    this.sidebarMenu = this.createSidebarMenu(buttons);
    this.sidebarMenuContainer.add(this.sidebarMenu);
    this.sideCameoRepeaters.setVisible(false);
    this.remove(this.sidebarButtonsContainer);
    this.sidebarCard.hide();
    this.sidebarPower.hide();
    this.sidebarTop?.setVisible(false);
    this.sidebarRadar?.hide();
    this.commandBarButtons?.forEach((b) => b.getUiObject().setVisible(false));
    this.messages.getUiObject().setVisible(false);
    this.debugText.getUiObject().setVisible(false);
    this.superWeaponTimers.getUiObject().setVisible(false);
    this.phobosVersionWarning?.getUiObject().setVisible(false);
  }

  /** 隐藏侧栏菜单并恢复常规 HUD。 */
  hideSidebarMenu(): void {
    this.sideCameoRepeaters.setVisible(true);
    this.destroySidebarMenu();
    this.add(this.sidebarButtonsContainer);
    this.sidebarCard.show();
    this.sidebarPower.show();
    this.sidebarTop?.setVisible(true);
    this.sidebarRadar?.show();
    this.commandBarButtons?.forEach((b) => b.getUiObject().setVisible(true));
    this.messages.getUiObject().setVisible(true);
    this.debugText.getUiObject().setVisible(true);
    this.superWeaponTimers.getUiObject().setVisible(true);
    this.phobosVersionWarning?.getUiObject().setVisible(true);
  }

  /**
   * 切换菜单内容组件。
   * @param component 组件（可空）
   */
  setMenuContentComponent(component?: any): void {
    const host = this.menuContentContainerInner;
    if (this.menuContent) {
      host.remove(this.menuContent);
      this.menuContent.destroy();
      this.menuContent = void 0;
    }
    if (component) {
      host.add(component);
      this.menuContent = component;
    }
  }

  /**
   * 挂小地图。
   * @param minimap 小地图
   */
  setMinimap(minimap: any): void {
    this.sidebarRadar.setMinimap(minimap);
  }

  /**
   * 切换内容区可见。
   * @param visible 是否可见
   */
  toggleMenuContentVisibility(visible: boolean): void {
    this.menuContentContainer.setVisible(visible);
    this.phobosVersionWarning?.getUiObject().setVisible(!visible);
  }

  /**
   * 渲染底部命令栏按钮。
   * @param agg 聚合图
   * @param types 按钮类型
   * @param separatorWidth 分隔宽
   * @param maxCount 最大数量
   */
  renderCommandBarButtons(agg: any, types: any, separatorWidth: number, maxCount: number): any[] {
    let x = 0;
    const nodes: any[] = [];
    for (const type of types.slice(0, maxCount)) {
      if (type === CommandBarButtonType.Separator) {
        x += separatorWidth;
        continue;
      }
      const config = commandButtonConfigs.find((c) => c.type === type);
      if (!config) {
        console.warn(`Unknown command bar button type "${type}"`);
        continue;
      }
      const img = this.images.get(config.icon);
      if (!img) {
        console.warn(
          `Missing image for command bar button "${CommandBarButtonType[type]}"`,
        );
        continue;
      }
      const frame = agg.imageIndexes.get(img);
      nodes.push(
        jsx(SidebarIconButton, {
          image: frame !== void 0 ? agg.file : img,
          imageFrameOffset: frame,
          palette: "sidebar.pal",
          tooltip: config.tooltip(this.strings),
          x,
          onClick: () => {
            this._onCommandBarButtonClick.dispatch(this, type);
          },
          ref: (e: any) => this.commandBarButtons.push(e),
        }),
      );
      x += img.width;
    }
    return nodes;
  }

  /** 合并 cameo 为一张 SHP。 */
  buildCameoFile(): any {
    const shp = new ShpFile();
    shp.filename = "agg_cameos.shp";
    this.cameoFilenames.forEach((name: string) => {
      const img = this.getImage(name);
      shp.width ||= img.width;
      shp.height ||= img.height;
      shp.addImage(img.getImage(0));
    });
    return shp;
  }

  /** cameo 文件名 → 索引。 */
  createCameoNameToIdMap(): Map<string, number> {
    const map = new Map<string, number>();
    for (let i = 0; i < this.cameoFilenames.length; ++i) {
      map.set(this.cameoFilenames[i], i);
    }
    return map;
  }

  /** 销毁当前侧栏菜单。 */
  destroySidebarMenu(): void {
    if (this.sidebarMenu) {
      this.sidebarMenuContainer.remove(this.sidebarMenu);
      this.sidebarMenu.destroy();
    }
  }

  /**
   * 同步修/卖 toggle 与翻页可用性。
   * @param now 帧时间
   */
  update(now: number): void {
    super.update(now);
    this.repairButton?.setToggleState(this.sidebarModel.repairMode);
    this.sellButton?.setToggleState(this.sidebarModel.sellMode);
    const scrollable =
      this.sidebarModel.activeTab.items.length - 2 * this.repeaterCount > 0;
    this.pgUpButton?.setDisabled(!scrollable);
    this.pgDnButton?.setDisabled(!scrollable);
  }

  /** 释放。 */
  destroy(): void {
    this.sidebarButtonsContainer.destroy();
    this.destroySidebarMenu();
    this.sidebarRadar.setMinimap(void 0);
    super.destroy();
  }
}
