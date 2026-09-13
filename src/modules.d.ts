/**
 * Ambient shims for the not-yet-converted SystemJS modules (the .ts.js files
 * under src/).
 *
 * TS sources import dependencies by their canonical bundle names (e.g.
 * "game/math/Vector2"). A name resolves to a real typed module once its .ts
 * rewrite exists under src/; until then these wildcards type it as `any`, so
 * conversion can proceed module-by-module without blocking on dependencies.
 */

declare module "engine/*" {
  const module_: any;
  export = module_;
}
declare module "game/*" {
  const module_: any;
  export = module_;
}
declare module "util/*" {
  const module_: any;
  export = module_;
}
declare module "data/*" {
  const module_: any;
  export = module_;
}
declare module "gui/*" {
  const module_: any;
  export = module_;
}
declare module "network/*" {
  const module_: any;
  export = module_;
}
declare module "tools/*" {
  const module_: any;
  export = module_;
}
declare module "worker/*" {
  const module_: any;
  export = module_;
}
