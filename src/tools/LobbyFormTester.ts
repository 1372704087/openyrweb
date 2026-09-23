/**
 * tools/LobbyFormTester — 大厅表单（LobbyForm）独立调试页。
 *
 * main：800×600 Renderer + UiScene + MainMenu 壳 + JsxRenderer 渲染
 * LobbyForm（假玩家槽位/游戏选项/callbacks 全 console.log）；
 * destroy 释放 disposables。static disposables 与孪生 r.disposables 对齐。
 *
 * 由 tools/LobbyFormTester.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as RendererNs from "engine/gfx/Renderer"; // 孪生
import * as EngineNs from "engine/Engine"; // 孪生
import * as UiSceneNs from "gui/UiScene"; // 孪生
import * as lobbyVmNs from "gui/screen/mainMenu/lobby/component/viewmodel/lobby"; // 孪生
import * as MainMenuNs from "gui/screen/mainMenu/component/MainMenu"; // 孪生
import * as RulesNs from "game/rules/Rules"; // 孪生
import * as LobbyFormNs from "gui/screen/mainMenu/lobby/component/LobbyForm"; // 孪生
import * as UiAnimationLoopNs from "engine/UiAnimationLoop"; // 孪生
import * as JsxRendererNs from "gui/jsx/JsxRenderer"; // 孪生
import * as CompositeDisposableNs from "util/disposable/CompositeDisposable"; // 已转换
import * as jsxNs from "gui/jsx/jsx"; // 孪生
import * as HtmlViewNs from "gui/jsx/HtmlView"; // 孪生
import * as gameoptsConstantsNs from "game/gameopts/constants"; // 孪生
import * as PlayerRankTypeNs from "network/ladder/PlayerRankType"; // 孪生
import * as wladderConfigNs from "network/ladder/wladderConfig"; // 孪生

const Renderer: any = (RendererNs as any).Renderer;
const Engine: any = (EngineNs as any).Engine;
const UiScene: any = (UiSceneNs as any).UiScene;
const lobbyVm: any = lobbyVmNs;
const MainMenu: any = (MainMenuNs as any).MainMenu;
const Rules: any = (RulesNs as any).Rules;
const LobbyForm: any = (LobbyFormNs as any).LobbyForm;
const UiAnimationLoop: any = (UiAnimationLoopNs as any).UiAnimationLoop;
const JsxRenderer: any = (JsxRendererNs as any).JsxRenderer;
const CompositeDisposable: any = (CompositeDisposableNs as any).CompositeDisposable;
const jsx: any = jsxNs.jsx ?? (jsxNs as any).default;
const HtmlView: any = (HtmlViewNs as any).HtmlView;
const gameoptsConstants: any = gameoptsConstantsNs;
const PlayerRankType: any = (PlayerRankTypeNs as any).PlayerRankType;
const wladderConfig: any = wladderConfigNs;

export class LobbyFormTester {
  /** 生命周期可释放集合（静态，与孪生 r.disposables 对齐）。 */
  static disposables = new CompositeDisposable();

  /**
   * 入口：搭建渲染器/场景并渲染 LobbyForm 调试实例。
   * @param rootEl - 容器（挂 HtmlContainer）
   * @param strings - 本地化字符串表
   */
  static main(rootEl: HTMLElement, strings: any): void {
    const renderer = new Renderer(800, 600);
    (renderer.init(rootEl), renderer.initStats(document.body), this.disposables.add(renderer));
    const uiScene = UiScene.factory({ x: 0, y: 0, width: 800, height: 600 });
    this.disposables.add(uiScene);
    const designW = 800,
      designH = 600;
    const layout = {
      x: Math.max(0, (uiScene.viewport.width - designW) / 2),
      y: Math.max(0, (uiScene.viewport.height - designH) / 2),
      width: designW,
      height: designH,
    };
    const jsxRenderer = new JsxRenderer(Engine.getImages(), Engine.getPalettes(), uiScene.camera, void 0);
    const mainMenu = new MainMenu(layout, Engine.getImages(), jsxRenderer, "dummy.webm");
    uiScene.add(mainMenu);
    const rules = new Rules(Engine.getRules());
    // 孪生用 var [n] = o.render(...) 解构首元素，n 被 layout 对象遮蔽后传入 HtmlView x/y。
    const [formEl] = jsxRenderer.render(
      (jsx as any)(HtmlView, {
        x: layout.x,
        y: layout.y,
        component: LobbyForm,
        props: {
          strings,
          countryUiNames: new Map<string, string>(
            (
              [
                ["Random", "GUI:RandomEx"],
                ["Observer", "GUI:Observer"],
              ] as [string, string][]
            ).concat(rules.getMultiplayerCountries().map((c: any) => [c.name, c.uiName] as [string, string])),
          ),
          countryUiTooltips: new Map(),
          availablePlayerCountries: ["Random"].concat(rules.getMultiplayerCountries().map((c: any) => c.name)),
          availablePlayerColors: [""].concat(
            [...rules.getMultiplayerColors().values()].map((col: any) => col.asHexString()),
          ),
          maxTeams: 4,
          availableAiNames: gameoptsConstants.aiUiNames,
          availableStartPositions: new Array(8).fill(0).map((_, i) => i),
          activeSlotIndex: 0,
          teamsAllowed: true,
          teamsRequired: false,
          lobbyType: lobbyVm.LobbyType.MultiplayerHost,
          playerSlots: [
            {
              name: "Player 1",
              type: lobbyVm.SlotType.Player,
              occupation: lobbyVm.SlotOccupation.Occupied,
              country: "French",
              color: "#2269d4",
              startPos: gameoptsConstants.RANDOM_START_POS,
              team: gameoptsConstants.NO_TEAM_ID,
              status: lobbyVm.PlayerStatus.Host,
              ping: 50,
              playerProfile: {
                name: "Player 1",
                rank: 2,
                rankType: PlayerRankType.Private,
                points: 100,
                ladder: { id: 0, name: "1v1", divisionName: "Test ladder", type: wladderConfig.LadderType.Solo1v1 },
                wins: 0,
                losses: 0,
              },
            },
            {
              name: "Player 2",
              type: lobbyVm.SlotType.Player,
              occupation: lobbyVm.SlotOccupation.Occupied,
              country: "Russians",
              color: "#ff1818",
              startPos: 1,
              team: 0,
              status: lobbyVm.PlayerStatus.Ready,
              ping: 300,
            },
            {
              name: "Open",
              type: lobbyVm.SlotType.Player,
              occupation: lobbyVm.SlotOccupation.Open,
              country: "Random",
              color: "",
              startPos: gameoptsConstants.RANDOM_START_POS,
              team: gameoptsConstants.NO_TEAM_ID,
              status: lobbyVm.PlayerStatus.NotReady,
            },
            {
              type: lobbyVm.SlotType.Observer,
              occupation: lobbyVm.SlotOccupation.Open,
              country: "Observer",
              color: "",
              startPos: gameoptsConstants.RANDOM_START_POS,
              team: gameoptsConstants.NO_TEAM_ID,
              status: lobbyVm.PlayerStatus.NotReady,
            },
          ],
          shortGame: true,
          mcvRepacks: true,
          cratesAppear: true,
          superWeapons: true,
          buildOffAlly: true,
          destroyableBridges: true,
          multiEngineer: false,
          multiEngineerCount: 3,
          noDogEngiKills: false,
          instantCapture: true,
          delayedOils: false,
          gameSpeed: 6,
          credits: 1e4,
          unitCount: 10,
          messages: [],
          mpDialogSettings: rules.mpDialogSettings,
          onSendMessage: () => {},
          onCountrySelect: (c: any) => {
            console.log("selected country", c);
          },
          onColorSelect: (c: any) => {
            console.log("selected color", c);
          },
          onStartPosSelect: (p: any) => {
            console.log("selected start pos", p);
          },
          onTeamSelect: (t: any) => {
            console.log("selected team", t);
          },
          onSlotChange: (a: any, b: any) => {
            console.log("changed slot", a, b);
          },
          onToggleShortGame: (v: any) => console.log(v),
          onToggleMcvRepacks: (v: any) => console.log(v),
          onToggleCratesAppear: (v: any) => console.log(v),
          onToggleSuperWeapons: (v: any) => console.log(v),
          onToggleBuildOffAlly: (v: any) => console.log(v),
          onToggleDestroyableBridges: (v: any) => console.log(v),
          onToggleMultiEngineer: (v: any) => console.log(v),
          onToggleNoDogEngiKills: (v: any) => console.log(v),
          onToggleInstantCapture: (v: any) => console.log(v),
          onToggleDelayedOils: (v: any) => console.log(v),
          onChangeGameSpeed: (v: any) => console.log(v),
          onChangeCredits: (v: any) => console.log(v),
          onChangeUnitCount: (v: any) => console.log(v),
        },
      }),
    );
    (mainMenu.add(formEl), renderer.addScene(uiScene));
    const loop = new UiAnimationLoop(renderer);
    (loop.start(),
      this.disposables.add(loop),
      rootEl.appendChild(uiScene.getHtmlContainer().getElement()),
      this.disposables.add(() => rootEl.removeChild(uiScene.getHtmlContainer().getElement())));
  }

  /** 释放全部 disposable。 */
  static destroy(): void {
    this.disposables.dispose();
  }
}
