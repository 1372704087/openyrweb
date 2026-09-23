/**
 * tools/VxlTester — VXL 体素模型点看调试页。
 *
 * main：800×600 Renderer + WorldScene（背景 0xe0e0e0、far+1000）+
 * CanvasMetrics/PointerEvents/CameraZoomControls + 阴影地板 + 文件列表；
 * selectVxl 解析计时日志后包装 LocalVxl 加入场景；destroy 全量释放。
 * 模块级 VXL_FILENAMES 列表与孪生 r 数组逐项一致。
 *
 * 由 tools/VxlTester.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as PaletteNs from "data/Palette"; // 孪生
import * as VxlFileNs from "data/VxlFile"; // 孪生
import * as RendererNs from "engine/gfx/Renderer"; // 孪生
import * as WorldSceneNs from "engine/renderable/WorldScene"; // 孪生
import * as VxlNonBatchedBuilderNs from "engine/renderable/builder/VxlNonBatchedBuilder"; // 孪生
import * as UiAnimationLoopNs from "engine/UiAnimationLoop"; // 孪生
import * as PointerEventsNs from "gui/PointerEvents"; // 孪生
import * as CompositeDisposableNs from "util/disposable/CompositeDisposable"; // 已转换
import * as CameraZoomControlsNs from "tools/CameraZoomControls"; // 已转换
import * as BoxedVarNs from "util/BoxedVar"; // 已转换
import * as VxlGeometryPoolNs from "engine/renderable/builder/vxlGeometry/VxlGeometryPool"; // 孪生
import * as VxlGeometryCacheNs from "engine/gfx/geometry/VxlGeometryCache"; // 孪生
import * as ShadowQualityNs from "engine/renderable/entity/unit/ShadowQuality"; // 孪生
import * as CanvasMetricsNs from "gui/CanvasMetrics"; // 孪生

const Palette: any = (PaletteNs as any).Palette;
const VxlFile: any = (VxlFileNs as any).VxlFile;
const Renderer: any = (RendererNs as any).Renderer;
const WorldScene: any = (WorldSceneNs as any).WorldScene;
const VxlNonBatchedBuilder: any = (VxlNonBatchedBuilderNs as any).VxlNonBatchedBuilder;
const UiAnimationLoop: any = (UiAnimationLoopNs as any).UiAnimationLoop;
const PointerEvents: any = (PointerEventsNs as any).PointerEvents;
const CompositeDisposable: any = (CompositeDisposableNs as any).CompositeDisposable;
const CameraZoomControls: any = (CameraZoomControlsNs as any).CameraZoomControls;
const BoxedVar: any = (BoxedVarNs as any).BoxedVar;
const VxlGeometryPool: any = (VxlGeometryPoolNs as any).VxlGeometryPool;
const VxlGeometryCache: any = (VxlGeometryCacheNs as any).VxlGeometryCache;
const ShadowQuality: any = (ShadowQualityNs as any).ShadowQuality;
const CanvasMetrics: any = (CanvasMetricsNs as any).CanvasMetrics;

declare const THREE: any;

/** 可点看的 VXL 文件名列表（与孪生 r 数组逐项一致）。 */
const VXL_FILENAMES = [
  "1tnk.vxl",
  "1tnkbarl.vxl",
  "1tnktur.vxl",
  "2tnk.vxl",
  "2tnkbarl.vxl",
  "2tnktur.vxl",
  "3tnk.vxl",
  "3tnkbarl.vxl",
  "3tnktur.vxl",
  "4tnk.vxl",
  "4tnkbarl.vxl",
  "4tnktur.vxl",
  "aegis.vxl",
  "apache.vxl",
  "apc.vxl",
  "apcw.vxl",
  "art2.vxl",
  "art2barl.vxl",
  "art2tur.vxl",
  "arty.vxl",
  "artybarl.vxl",
  "asw.vxl",
  "axle.vxl",
  "bana.vxl",
  "beag.vxl",
  "bggy.vxl",
  "bike.vxl",
  "bus.vxl",
  "car.vxl",
  "cargocar.vxl",
  "carrier.vxl",
  "cdest.vxl",
  "cdestwo.vxl",
  "cmin.vxl",
  "cmon.vxl",
  "cona.vxl",
  "cop.vxl",
  "cplane.vxl",
  "cruise.vxl",
  "dest.vxl",
  "destwo.vxl",
  "dmisl.vxl",
  "dpod.vxl",
  "dred.vxl",
  "dredwo.vxl",
  "dshp.vxl",
  "euroc.vxl",
  "falc.vxl",
  "flak.vxl",
  "flaktur.vxl",
  "flata.vxl",
  "fortress.vxl",
  "ftnk.vxl",
  "fv.vxl",
  "fvtur.vxl",
  "fvtur1.vxl",
  "fvtur10.vxl",
  "fvtur11.vxl",
  "fvtur12.vxl",
  "fvtur13.vxl",
  "fvtur14.vxl",
  "fvtur2.vxl",
  "fvtur3.vxl",
  "fvtur4.vxl",
  "fvtur5.vxl",
  "fvtur6.vxl",
  "fvtur7.vxl",
  "fvtur8.vxl",
  "fvtur9.vxl",
  "gastank.vxl",
  "gtgcanbarl.vxl",
  "gtgcantur.vxl",
  "gtnk.vxl",
  "gtnkbarl.vxl",
  "gtnktur.vxl",
  "harv.vxl",
  "harvtur.vxl",
  "heli.vxl",
  "hind.vxl",
  "hmec.vxl",
  "hornet.vxl",
  "horv.vxl",
  "htk.vxl",
  "htkbarl.vxl",
  "htktur.vxl",
  "htnk.vxl",
  "htnkbarl.vxl",
  "htnktur.vxl",
  "hvr.vxl",
  "hvrtur.vxl",
  "hwtz.vxl",
  "hyd.vxl",
  "icbm.vxl",
  "jeep.vxl",
  "jeeptur.vxl",
  "laser.vxl",
  "lcrf.vxl",
  "limo.vxl",
  "lpst.vxl",
  "ltnk.vxl",
  "ltnkbarl.vxl",
  "ltnktur.vxl",
  "m113.vxl",
  "m113tur.vxl",
  "mcv.vxl",
  "misl.vxl",
  "mislchem.vxl",
  "mislmlti.vxl",
  "mislorca.vxl",
  "mislsam.vxl",
  "mlrs.vxl",
  "mlrstur.vxl",
  "mmchbarl.vxl",
  "mnly.vxl",
  "monocar.vxl",
  "monoeng.vxl",
  "mrj.vxl",
  "mrjtur.vxl",
  "mtnk.vxl",
  "mtnkbarl.vxl",
  "mtnktur.vxl",
  "mtrb.vxl",
  "mtrs.vxl",
  "mtrt.vxl",
  "orca.vxl",
  "orcab.vxl",
  "orcatran.vxl",
  "outp.vxl",
  "pdplane.vxl",
  "phal.vxl",
  "pick.vxl",
  "piece.vxl",
  "probe.vxl",
  "propa.vxl",
  "ptruck.vxl",
  "pulscan.vxl",
  "repair.vxl",
  "rtnk.vxl",
  "rtnkbarl.vxl",
  "rtnktur.vxl",
  "sam.vxl",
  "sapc.vxl",
  "scrin.vxl",
  "shad.vxl",
  "smcv.vxl",
  "sonic.vxl",
  "sonictur.vxl",
  "sref.vxl",
  "sreftur.vxl",
  "sreftur1.vxl",
  "sreftur2.vxl",
  "sreftur3.vxl",
  "stang.vxl",
  "stnk.vxl",
  "sub.vxl",
  "subt.vxl",
  "subtank.vxl",
  "suvb.vxl",
  "suvw.vxl",
  "taxi.vxl",
  "tire.vxl",
  "tnkd.vxl",
  "tractor.vxl",
  "tran.vxl",
  "trnsport.vxl",
  "trs.vxl",
  "truck2.vxl",
  "trucka.vxl",
  "truckb.vxl",
  "truk.vxl",
  "ttnk.vxl",
  "ttnktur.vxl",
  "tug.vxl",
  "utnk.vxl",
  "v3.vxl",
  "v3rocket.vxl",
  "v3wo.vxl",
  "vlad.vxl",
  "vladwo.vxl",
  "weed.vxl",
  "wini.vxl",
  "wrmn.vxl",
  "zbomb.vxl",
  "zep.vxl",
];

/** 场景内旋转包装（模块局部，不导出，与孪生 class n 一致）。 */
class LocalVxl {
  readonly builder: any;
  readonly wrapper: any;

  constructor(palette: any, pool: any, camera: any, ...rest: any[]) {
    ((this.builder = new VxlNonBatchedBuilder(palette, pool, camera, ...rest)), (this.wrapper = new THREE.Object3D()));
  }

  get3DObject(): any {
    return this.wrapper;
  }

  create3DObject(): void {
    const mesh = this.builder.build();
    this.wrapper.add(mesh);
  }

  update(): void {
    this.wrapper.rotation.y -= 0.01;
  }

  dispose(): void {
    this.builder.dispose();
  }
}

export class VxlTester {
  /** 渲染器。 */
  static renderer: any;
  /** VFS 引用。 */
  static vfs: any;
  /** VXL 几何缓存池。 */
  static vxlGeometryPool: any;
  /** 单位调色板。 */
  static palette: any;
  /** 世界场景。 */
  static worldScene: any;
  /** 当前展示的 VXL 包装。 */
  static currentVxl: any;
  /** 右侧列表 DOM。 */
  static listEl?: HTMLElement;
  /** 动画循环。 */
  static uiAnimationLoop: any;
  /** 生命周期可释放集合。 */
  static disposables = new CompositeDisposable();

  /**
   * 入口：搭建渲染器/场景/地板/列表并启动循环。
   * @param vfs - 虚拟文件系统
   * @param _runtimeVars - 运行时变量（签名占位）
   */
  static async main(vfs: any, _runtimeVars?: any): Promise<void> {
    const renderer = (this.renderer = new Renderer(800, 600));
    (renderer.init(document.body),
      renderer.initStats(document.body),
      (this.vfs = vfs),
      (this.vxlGeometryPool = new VxlGeometryPool(new VxlGeometryCache())),
      (this.palette = new Palette(vfs.openFile("unittem.pal"))));
    const worldScene = (this.worldScene = WorldScene.factory(
      { x: 0, y: 0, width: 800, height: 600 },
      new BoxedVar(true),
      new BoxedVar(ShadowQuality.High),
    ));
    (this.disposables.add(worldScene),
      (worldScene.scene.background = new THREE.Color(14737632)),
      (worldScene.camera.far += 1e3),
      worldScene.camera.updateProjectionMatrix());
    const metrics = new CanvasMetrics(renderer.getCanvas(), window);
    (metrics.init(), this.disposables.add(metrics));
    const pointer = new PointerEvents(renderer, { x: 0, y: 0 }, document, metrics);
    const zoom = new CameraZoomControls(pointer, worldScene.cameraZoom);
    (this.disposables.add(zoom, pointer), zoom.init(), this.createFloor(), this.buildBrowser(), renderer.addScene(worldScene));
    const loop = (this.uiAnimationLoop = new UiAnimationLoop(renderer));
    loop.start();
  }

  /** 阴影接收地板（1e4 平面、y=-100）。 */
  static createFloor(): void {
    const geo = new THREE.PlaneGeometry(1e4, 1e4);
    const mat = new THREE.ShadowMaterial();
    mat.opacity = 0.5;
    const mesh = new THREE.Mesh(geo, mat);
    ((mesh.rotation.x = -Math.PI / 2),
      (mesh.position.y = -100),
      (mesh.receiveShadow = true),
      this.worldScene.scene.add(mesh));
  }

  /** 解析并展示指定 VXL（先移除/释放旧的；计时日志与孪生一致）。 */
  static async selectVxl(name: string): Promise<void> {
    if (VxlTester.currentVxl)
      (VxlTester.worldScene.remove(VxlTester.currentVxl), VxlTester.currentVxl.dispose());
    const file = this.vfs.openFile(name);
    const t0 = new Date().getTime();
    let parsed = new VxlFile(file);
    const t1 = new Date().getTime();
    console.log("Parsing took " + (t1 - t0) + "ms");
    parsed = this.currentVxl = new LocalVxl(parsed, void 0, this.palette, VxlTester.vxlGeometryPool, VxlTester.worldScene.camera);
    VxlTester.worldScene.add(parsed);
  }

  /** 右上角 VXL 文件链接列表；50ms 后自动选中 zep.vxl。 */
  static buildBrowser(): void {
    const list = (this.listEl = document.createElement("div"));
    ((list.style.position = "absolute"),
      (list.style.right = "0"),
      (list.style.top = "0"),
      (list.style.height = "600px"),
      (list.style.width = "200px"),
      (list.style.overflowY = "auto"),
      list.appendChild(document.createTextNode("Vxl files:")),
      VXL_FILENAMES.forEach((name) => {
        const link = document.createElement("a");
        ((link.style.display = "block"),
          (link.textContent = name),
          link.setAttribute("href", "javascript:;"),
          link.addEventListener("click", () => {
            (console.log("Selected vxl", name), VxlTester.selectVxl(name));
          }),
          list.appendChild(link));
      }),
      document.body.appendChild(list),
      setTimeout(() => {
        VxlTester.selectVxl("zep.vxl");
      }, 50));
  }

  /** 销毁渲染器/循环/列表并释放 disposable。 */
  static destroy(): void {
    (this.renderer.destroy(),
      this.uiAnimationLoop.destroy(),
      this.listEl.remove(),
      this.disposables.dispose());
  }
}
