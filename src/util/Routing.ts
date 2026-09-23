/**
 * Routing — 基于 location.hash 的简易前端路由。
 *
 * 通过 addRoute 注册 controller，init 监听 hashchange 并立刻首跳；
 * router 解析 "#/name/..." 为段数组，先调 "*" 通配再调 "/name" 精确路由。
 * 由 util/Routing.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 路由控制器：接收路径段数组（已去掉首段名称）。 */
type Controller = (segments: string[]) => unknown | Promise<unknown>;

/** 单条路由记录。 */
interface RouteEntry {
  controller?: Controller;
}

export class Routing {
  /** 已注册路由表，键为传入的 name 或 "*"。 */
  routes: Record<string, RouteEntry> = {};

  /** 注册路径 name 对应的 controller（与孪生一致，键为 name 本身）。 */
  addRoute(name: string, controller: Controller): void {
    this.routes[name] = { controller };
  }

  /** 绑定 hashchange 并立即执行一次 router。 */
  init(): void {
    window.addEventListener("hashchange", () => this.router());
    this.router();
  }

  /** 解析 location.hash，依次调用通配与精确路由的 controller。 */
  async router(): Promise<void> {
    const path = location.hash.slice(1) || "/";
    if (path.match(/^\//)) {
      const [, head, ...rest] = path.split("/");
      if (this.routes["*"]) await this.routes["*"].controller!(rest);
      const entry = this.routes["/" + head];
      if (entry.controller) await entry.controller(rest);
    }
  }
}
