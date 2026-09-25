/**
 * prelude — 打包期共享的 TypeScript 运行时辅助函数。
 *
 * 提供 __classPrivateFieldGet/Set、__decorate 等；在 ra2web.min.js 最顶部、
 * 任何 System.register 之前定义一次，供后续编译产物引用。
 *
 * 由 _runtime/prelude.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 注意：原孪生以 `(this && this.x) ||` 实现“已定义则复用”；在 ES 模块顶层
 * this 为 undefined，此处改用 globalThis 判定，语义等价（避免覆盖已注入实例）。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type PrivateKind = "v" | "f" | "a" | "m";

/** 写入私有成员；kind 区分 value/getter-accessor/method，与 tsc 输出约定一致。 */
export const __classPrivateFieldSet: (
  receiver: any,
  map: any,
  value: any,
  kind: PrivateKind,
  setter?: any,
) => any =
  (globalThis as any).__classPrivateFieldSet ||
  function __classPrivateFieldSet(receiver: any, map: any, value: any, kind: PrivateKind, setter?: any): any {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !setter) throw new TypeError("Private accessor was defined without a setter");
    if (typeof map === "function" ? receiver !== map || !setter : !map.has(receiver))
      throw new TypeError("Cannot write private member to an object whose class did not declare it");
    if (kind === "a") setter.call(receiver, value);
    else if (setter) setter.value = value;
    else map.set(receiver, value);
    return value;
  };

/** 读取私有成员；kind 区分 value/getter-accessor/method，与 tsc 输出约定一致。 */
export const __classPrivateFieldGet: (receiver: any, map: any, kind: PrivateKind, getter?: any) => any =
  (globalThis as any).__classPrivateFieldGet ||
  function __classPrivateFieldGet(receiver: any, map: any, kind: PrivateKind, getter?: any): any {
    if (kind === "a" && !getter) throw new TypeError("Private accessor was defined without a getter");
    if (typeof map === "function" ? receiver !== map || !getter : !map.has(receiver))
      throw new TypeError("Cannot read private member from an object whose class did not declare it");
    if (kind === "m") return getter;
    if (kind === "a") return getter.call(receiver);
    return getter ? getter.value : map.get(receiver);
  };

/** 应用装饰器数组（Reflect.decorate 或手动逆序应用），tsc legacy 装饰器辅助。 */
export const __decorate: (decorators: any[], target: any, key?: any, desc?: any) => any =
  (globalThis as any).__decorate ||
  function __decorate(decorators: any[], target: any, key?: any, desc?: any): any {
    var result: any;
    var argc = arguments.length;
    // 与孪生一致：null 描述符先就地取 getter，n 作为“当前描述符”逐轮累积
    var n = argc < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc;
    const reflectAny = Reflect as any;
    if (typeof Reflect === "object" && typeof reflectAny.decorate === "function")
      n = reflectAny.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        // 三实参形式传入的是“当前描述符 n”（不是装饰器函数本身），且 `|| n` 累积：
        // 装饰器返回 undefined 时保留上一轮描述符（孪生 `(… ) || n`）
        if ((result = decorators[i]))
          n = (argc < 3 ? result(target) : argc > 3 ? result(target, key, n) : result(target, key)) || n;
    if (argc > 3 && n && Object.defineProperty) Object.defineProperty(target, key, n);
    return n;
  };

// 回写到 globalThis，保证打包后仍可被当作自由标识符解析（与孪生脚本顶层 var 等价）。
(globalThis as any).__classPrivateFieldSet = __classPrivateFieldSet;
(globalThis as any).__classPrivateFieldGet = __classPrivateFieldGet;
(globalThis as any).__decorate = __decorate;
