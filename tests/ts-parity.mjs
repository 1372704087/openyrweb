/**
 * tests/ts-parity.mjs — Behavior-parity regression test for TS-converted modules.
 *
 * Two verification tracks per converted module:
 *   1. Twin track (while src/<name>.ts.js still exists): evaluate BOTH the twin
 *      and the compiled TS output (build/ts-modules/<name>.js) in a minimal
 *      SystemJS runtime and compare probe results — plus a three-way check
 *      against the committed snapshot when one exists.
 *   2. Snapshot track (twin deleted — the migration end state): compare the
 *      compiled TS output against tests/parity-snapshots.json only.
 *
 * Snapshots are recorded from the .ts.js twin (the behavior baseline). New
 * snapshots are created automatically on first run; use
 * `npm run test:parity -- --update-snapshots` to re-baseline deliberately.
 *
 * Run: node tests/ts-parity.mjs   (requires `npm run build:ts` first)
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import vm from "node:vm";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const SNAPSHOT_FILE = join(ROOT, "tests", "parity-snapshots.json");
const UPDATE_SNAPSHOTS = process.argv.includes("--update-snapshots");

// Converted modules: canonical name -> { tsjs, probes }.
// probes: called as f(ns, THREE) on each variant's namespace; results deep-compared.
const CONVERTED = [
  {
    name: "util/math",
    tsjs: "src/util/math.ts.js",
    probes: [
      (ns) => ns.getRandomInt(2, 2), // min===max 时与随机数无关，结果必为 2
      (ns) => ns.clamp(5, 0, 3),
      (ns) => ns.clamp(-1, 0, 3),
      (ns) => ns.clamp(1.5, 0, 3),
      (ns) => ns.isBetween(2, 1, 3),
      (ns) => ns.isBetween(0, 1, 3),
      (ns) => ns.lerp(0, 10, 0.25),
      (ns) => ns.lerp(-4, 4, 0.5),
      (ns) => ns.truncToDecimals(3.14159, 3),
      (ns) => ns.truncToDecimals(-3.14159, 3),
      (ns) => ns.truncToDecimals(0, 3),
      (ns) => ns.roundToDecimals(3.14159, 3),
      (ns) => ns.roundToDecimals(-2.71828, 2),
      (ns) => ns.floorTo(7, 3),
      (ns) => ns.floorTo(-7, 3),
      (ns) => ns.fnv32a([1, 2, 3]),
      (ns) => ns.fnv32a(new Uint8Array([72, 105])),
      (ns) => ns.fnv32a([]),
    ],
  },
  {
    name: "game/math/GameMath",
    tsjs: "src/game/math/GameMath.ts.js",
    probes: [
      (ns) => ns.GameMath.PRECISION,
      (ns) => ns.GameMath.EXP_10_PRECISION,
      (ns) => ns.GameMath.SIN_TABLE.length,
      (ns) => ns.GameMath.SIN_TABLE[0],
      (ns) => ns.GameMath.SIN_TABLE[324],
      (ns) => ns.GameMath.SIN_TABLE[1295],
      (ns) => ns.GameMath.sqrt(0),
      (ns) => ns.GameMath.sqrt(2),
      (ns) => ns.GameMath.sqrt(9),
      (ns) => ns.GameMath.sqrt(0.0001),
      (ns) => ns.GameMath.sin(0),
      (ns) => ns.GameMath.sin(Math.PI),
      (ns) => ns.GameMath.sin(Math.PI / 2),
      (ns) => ns.GameMath.sin(0.77),
      (ns) => ns.GameMath.sin(-3.5),
      (ns) => ns.GameMath.sin(100.25),
      (ns) => ns.GameMath.sin(NaN),
      (ns) => ns.GameMath.sin(Infinity),
      (ns) => ns.GameMath.cos(0),
      (ns) => ns.GameMath.cos(1.234),
      (ns) => ns.GameMath.cos(-2.5),
      (ns) => ns.GameMath.asin(0),
      (ns) => ns.GameMath.asin(0.5),
      (ns) => ns.GameMath.asin(1),
      (ns) => ns.GameMath.asin(-0.25),
      (ns) => ns.GameMath.asin(2),
      (ns) => ns.GameMath.acos(0),
      (ns) => ns.GameMath.acos(0.5),
      (ns) => ns.GameMath.acos(-1),
      (ns) => ns.GameMath.atan2(1, 1),
      (ns) => ns.GameMath.atan2(0, 0),
      (ns) => ns.GameMath.atan2(1, -1),
      (ns) => ns.GameMath.atan2(-1, 1),
      (ns) => ns.GameMath.atan2(-1, -1),
      (ns) => ns.GameMath.atan2(0, 5),
      (ns) => ns.GameMath.atan2(5, 0),
      (ns) => ns.GameMath.atan2(0, -5),
      (ns) => ns.GameMath.atan2(Infinity, 1),
      (ns) => ns.GameMath.atan2(1, Infinity),
      (ns) => ns.GameMath.atan2(Infinity, Infinity),
      (ns) => ns.GameMath.atan2(NaN, 1),
      (ns) => ns.GameMath.pow(2, 10),
      (ns) => ns.GameMath.pow(2.5, 3),
      (ns) => ns.GameMath.pow(2, 0.5), // 非安全整数指数 → 两边应抛同样的错
      (ns) => ns.GameMath.pow(1e20, 3),
      (ns) => ns.GameMath.pow(3, 0),
      (ns) => ns.GameMath.reverseSinTableLookup(0.5, 0, 324, false),
      (ns) => ns.GameMath.reverseSinTableLookup(0.5, 648, 972, true),
    ],
  },
  {
    name: "game/math/Quaternion",
    tsjs: "src/game/math/Quaternion.ts.js",
    probes: [
      (ns, THREE) => {
        const q = new ns.Quaternion(1, 2, 3, 4);
        return { x: q._x, y: q._y, z: q._z, w: q._w, len: q.length() };
      },
      (ns, THREE) => {
        const q = new ns.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          0.75,
        );
        return { x: q._x, y: q._y, z: q._z, w: q._w };
      },
      (ns, THREE) => {
        const q = new ns.Quaternion().setFromEuler(
          new THREE.Euler(0.5, 0.7, 0.9, "XYZ"),
        );
        return { x: q._x, y: q._y, z: q._z, w: q._w };
      },
      (ns, THREE) => {
        const q = new ns.Quaternion().setFromEuler(
          new THREE.Euler(0.5, 0.7, 0.9, "ZYX"),
          false,
        );
        return { x: q._x, y: q._y, z: q._z, w: q._w };
      },
      (ns, THREE) => {
        const m = new THREE.Matrix4().makeRotationFromEuler(
          new THREE.Euler(0.3, 1.1, 0.6, "YXZ"),
        );
        const q = new ns.Quaternion().setFromRotationMatrix(m);
        return { x: q._x, y: q._y, z: q._z, w: q._w };
      },
      (ns, THREE) => {
        const a = new ns.Quaternion(0, 0, 0, 1).setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          0.4,
        );
        const b = new ns.Quaternion(0, 0, 0, 1).setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          0.9,
        );
        const q = a.slerp(b, 0.3);
        return { x: q._x, y: q._y, z: q._z, w: q._w };
      },
      (ns, THREE) => {
        const a = new ns.Quaternion(0, 0, 0, 1);
        const q = a.slerp(new ns.Quaternion(0, 0, 0, 1), 0.5); // cosHalfTheta >= 1 分支
        return { x: q._x, y: q._y, z: q._z, w: q._w };
      },
      (ns, THREE) => {
        const a = new ns.Quaternion(0, 0, 0, 1);
        const q = a.slerp(new ns.Quaternion(0, 0, 0, 1), 0); // t===0 → this
        return { x: q._x, y: q._y, z: q._z, w: q._w };
      },
    ],
  },
  {
    name: "game/math/Vector2",
    tsjs: "src/game/math/Vector2.ts.js",
    probes: [
      (ns, THREE) => {
        const v = new ns.Vector2(3, 4);
        return { x: v.x, y: v.y, len: v.length() };
      },
      (ns, THREE) => new ns.Vector2(1, 1).angle(),
      (ns, THREE) => new ns.Vector2(-1, 0).angle(),
      (ns, THREE) => new ns.Vector2(-1, -0.001).angle(),
      (ns, THREE) => new ns.Vector2(3, 4).distanceTo(new THREE.Vector2(0, 0)),
      (ns, THREE) => {
        const v = new ns.Vector2(5, 2).rotateAround(new THREE.Vector2(1, 1), 0.7);
        return { x: v.x, y: v.y };
      },
    ],
  },
  {
    name: "game/math/Vector3",
    tsjs: "src/game/math/Vector3.ts.js",
    probes: [
      (ns, THREE) => {
        const v = new ns.Vector3(1, 2, 2);
        return { x: v.x, y: v.y, z: v.z, len: v.length() };
      },
      (ns, THREE) => {
        const v = new ns.Vector3(1, 0, 0).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          Math.PI / 3,
        );
        return { x: v.x, y: v.y, z: v.z };
      },
      (ns, THREE) => {
        const v = new ns.Vector3(1, 0, 0).applyEuler(
          new THREE.Euler(0.2, 0.5, 0.8, "XYZ"),
        );
        return { x: v.x, y: v.y, z: v.z };
      },
      (ns, THREE) => new ns.Vector3(1, 2, 2).distanceTo(new THREE.Vector3(5, 5, 5)),
      (ns, THREE) => new ns.Vector3(1, 2, 2).angleTo(new THREE.Vector3(2, 1, 2)),
      (ns, THREE) => {
        const v = new ns.Vector3(1, 2, 3).projectOnPlane(new THREE.Vector3(0, 1, 0));
        return { x: v.x, y: v.y, z: v.z };
      },
      (ns, THREE) => {
        const v = new ns.Vector3(1, 2, 3).reflect(new THREE.Vector3(0, 1, 0));
        return { x: v.x, y: v.y, z: v.z };
      },
      (ns, THREE) => {
        const v = new ns.Vector3().setFromSpherical({
          radius: 5,
          phi: 0.8,
          theta: 1.9,
        });
        return { x: v.x, y: v.y, z: v.z };
      },
      (ns, THREE) => {
        const v = new ns.Vector3().setFromCylindrical({
          radius: 5,
          y: 2,
          theta: 1.9,
        });
        return { x: v.x, y: v.y, z: v.z };
      },
    ],
  },
  {
    name: "game/GameSpeed",
    tsjs: "src/game/GameSpeed.ts.js",
    probes: [
      (ns) => ns.GameSpeed.BASE_TICKS_PER_SECOND,
      (ns) => ns.GameSpeed.computeGameSpeed(0),
      (ns) => ns.GameSpeed.computeGameSpeed(1),
      (ns) => ns.GameSpeed.computeGameSpeed(3),
      (ns) => ns.GameSpeed.computeGameSpeed(4),
      (ns) => ns.GameSpeed.computeGameSpeed(5),
      (ns) => ns.GameSpeed.computeGameSpeed(6),
    ],
  },
  {
    name: "game/event/EventType",
    tsjs: "src/game/event/EventType.ts.js",
    probes: [
      (ns) => ns.EventType.Cheer,
      (ns) => ns.EventType.TimerExpire,
      (ns) => ns.EventType.VirusCloud,
      (ns) => ns.EventType[0],
      (ns) => ns.EventType[66],
      (ns) => ns.EventType[ns.EventType.WarheadDetonate],
      (ns) => Object.keys(ns.EventType).length,
    ],
  },
  {
    name: "game/event/TimerExpireEvent",
    tsjs: "src/game/event/TimerExpireEvent.ts.js",
    probes: [
      (ns) => {
        const target = { tag: "timer" };
        const event = new ns.TimerExpireEvent(target);
        return { type: event.type, sameTarget: event.target === target };
      },
    ],
  },
  {
    name: "game/CountdownTimer",
    tsjs: "src/game/CountdownTimer.ts.js",
    probes: [
      (ns) => {
        const timer = new ns.CountdownTimer();
        const initial = { ticks: timer.ticks, running: timer.running };
        timer.setSeconds(2.7);
        const afterSet = { ticks: timer.ticks, seconds: timer.getSeconds() };
        timer.addSeconds(-3);
        const afterAdd = { ticks: timer.ticks };
        timer.setSeconds(1);
        timer.start();
        const events = [];
        const bus = { dispatch: (event) => events.push({ type: event.type, isTarget: event.target === timer }) };
        const world = { events: bus }; // 原 update 参数是携带 .events 的世界对象
        for (let i = 0; i < 16; i++) timer.update(world);
        timer.update(bus);
        return {
          initial,
          afterSet,
          afterAdd,
          finalTicks: timer.ticks,
          finalRunning: timer.running,
          events,
          isRunning: timer.isRunning(),
        };
      },
      (ns) => {
        const timer = new ns.CountdownTimer();
        timer.setSeconds(1);
        const stopped = { running: timer.isRunning() };
        timer.stop();
        const bus = { dispatch: () => { throw new Error("must not dispatch when stopped"); } };
        timer.update({ events: bus });
        return { stopped, ticksAfterStoppedUpdate: timer.ticks };
      },
    ],
  },
  {
    name: "game/Prng",
    tsjs: "src/game/Prng.ts.js",
    probes: [
      (ns) => {
        const p = ns.Prng.factory(42, 7);
        const seq = [];
        for (let i = 0; i < 8; i++) seq.push(p.generateRandomInt(1, 10));
        return { seq, last: p.getLastRandom() };
      },
      (ns) => {
        const p = ns.Prng.factory("abc", 1); // 字符串种子 → CRC32 分支
        const seq = [];
        for (let i = 0; i < 5; i++) seq.push(p.generateRandomInt(0, 99));
        return { seq };
      },
      (ns) => {
        const p = ns.Prng.factory("42", 7); // 数字字符串 → 数值拼接分支
        const seq = [];
        for (let i = 0; i < 5; i++) seq.push(p.generateRandom());
        return { seq };
      },
      (ns) => {
        const p = ns.Prng.factory(123, 0);
        const seq = [];
        for (let i = 0; i < 6; i++) seq.push(p.generateRandomInt(5, 5)); // min===max 恒为 5
        return { seq };
      },
      (ns) => {
        // 相同种子两次实例化 → 序列完全一致（MT 确定性）
        const p1 = ns.Prng.factory(987654, 3);
        const p2 = ns.Prng.factory(987654, 3);
        for (let i = 0; i < 3; i++) p1.generateRandom();
        for (let i = 0; i < 3; i++) p2.generateRandom();
        return { p1: p1.getLastRandom(), p2: p2.getLastRandom() };
      },
    ],
  },
  {
    name: "util/Base64",
    tsjs: "src/util/Base64.ts.js",
    probes: [
      (ns) => ns.Base64.encode("Hello, RA2!"),
      (ns) => ns.Base64.decode("SGVsbG8sIFJBMiE="),
      (ns) => ns.Base64.decode(ns.Base64.encode("roundtrip-binary\u00ff\u00fe")),
      (ns) => ns.Base64.isBase64("SGVsbG8="),
      (ns) => ns.Base64.isBase64("SGVsbG8"),
      (ns) => ns.Base64.isBase64("not base64!!"),
      (ns) => ns.Base64.isBase64(""),
    ],
  },
  {
    name: "util/string",
    tsjs: "src/util/string.ts.js",
    probes: [
      (ns) => ns.pad(7),
      (ns) => ns.pad(42, "000000"),
      (ns) => ns.pad(123, "00"), // 前缀比数字短 → 原样返回
      (ns) => ns.equalsIgnoreCase("HeLLo", "hello"),
      (ns) => ns.equalsIgnoreCase("HeLLo", "world"),
      (ns) => Array.from(ns.binaryStringToUint8Array("Hi")),
      (ns) => Array.from(ns.base64StringToUint8Array("SGk=")),
      (ns) => ns.uint8ArrayToBase64String(new Uint8Array([72, 105])),
      (ns) => ns.uint8ArrayToBinaryString(new Uint8Array([72, 105])),
      (ns) => ns.binaryStringToUtf16(ns.utf16ToBinaryString("\u4f60\u597dRA2")),
      (ns) => {
        const bytes = ns.utf16ToBinaryString("\u4f60");
        return [bytes.charCodeAt(0), bytes.charCodeAt(1)];
      },
      (ns) => {
        const bytes = new Uint8Array(8);
        for (let i = 0; i < 8; i++) bytes[i] = 0x10 + i;
        return ns.bufferToHexString(bytes.buffer);
      },
      (ns) => ns.bufferToHexString(new ArrayBuffer(0)),
    ],
  },
  {
    name: "data/Crc32",
    tsjs: "src/data/Crc32.ts.js",
    probes: [
      (ns) => ns.Crc32.lookUp.length,
      (ns) => ns.Crc32.lookUp[1],
      (ns) => ns.Crc32.lookUp[255],
      (ns) => ns.Crc32.calculateCrc([72, 105]),
      (ns) => {
        // 标准 CRC-32 校验值：CRC32("123456789") = 0xCBF43926
        const bytes = [];
        for (const ch of "123456789") bytes.push(ch.charCodeAt(0));
        return ns.Crc32.calculateCrc(bytes);
      },
      (ns) => ns.Crc32.calculateCrc([], 0),
      (ns) => ns.Crc32.calculateCrc([1, 2, 3], 0x12345678),
      (ns) => {
        const crc = new ns.Crc32();
        crc.append([1, 2, 3]);
        crc.append([4, 5, 6]);
        return { got: crc.get(), polynomal: crc.polynomal };
      },
      (ns) => {
        const crc = new ns.Crc32(0x12345678);
        crc.append([9, 9, 9]);
        return crc.get();
      },
      (ns) => {
        // 流式 append 与一次性 calculateCrc 结果一致
        const bytes = new Uint8Array(256);
        for (let i = 0; i < 256; i++) bytes[i] = i;
        const oneShot = ns.Crc32.calculateCrc(bytes);
        const streamed = new ns.Crc32();
        for (const b of bytes) streamed.append([b]);
        return { oneShot, matches: streamed.get() === oneShot };
      },
    ],
  },
  {
    name: "engine/type/ObjectType",
    tsjs: "src/engine/type/ObjectType.ts.js",
    probes: [
      (ns) => ns.ObjectType.None,
      (ns) => ns.ObjectType.Vehicle,
      (ns) => ns.ObjectType.Building,
      (ns) => ns.ObjectType.Debris,
      (ns) => ns.ObjectType[2],
      (ns) => ns.ObjectType[11],
      (ns) => Object.keys(ns.ObjectType).length,
    ],
  },
  {
    name: "game/SideType",
    tsjs: "src/game/SideType.ts.js",
    probes: [
      (ns) => ns.SideType.GDI,
      (ns) => ns.SideType.Civilian,
      (ns) => ns.SideType.Mutant,
      (ns) => ns.SideType[1],
      (ns) => ns.SideType[4],
      (ns) => Object.keys(ns.SideType).length,
    ],
  },
  {
    name: "util/Color",
    tsjs: "src/util/Color.ts.js",
    probes: [
      (ns) => new ns.Color(255, 128, 0).asHex(),
      (ns) => new ns.Color(255, 128, 0).asHexString(),
      (ns) => new ns.Color(16, 255, 3).clone().asHexString(),
      (ns) => new ns.Color(255, 128, 0).r + "," + new ns.Color(255, 128, 0).g,
      (ns) => ns.Color.fromHsv(255, 255, 255).asHex(), // hue 360° → 红
      (ns) => ns.Color.fromHsv(0, 0, 255).asHex(), // 饱和度 0 → 灰
      (ns) => ns.Color.fromHsv(170, 255, 255).asHex(), // hue 240° → 蓝
      (ns) => ns.Color.fromHsv(32, 128, 200).asHexString(),
      (ns) => ns.Color.fromHsv(106, 255, 128).asHexString(),
      (ns) => new ns.Color(300, -5, 0).asHex(), // 越界输入同样按位运算处理
    ],
  },
  {
    name: "game/Traits",
    tsjs: "src/game/Traits.ts.js",
    probes: [
      (ns) => {
        class HashTrait {
          getHash() {
            return 42;
          }
        }
        class EchoTrait {
          debugGetState() {
            return 1;
          }
          dispose() {
            this.disposed = true;
          }
        }
        const traits = new ns.Traits();
        const hashTrait = new HashTrait();
        const echoTrait = new EchoTrait();
        traits.add(hashTrait);
        traits.add(echoTrait);
        const orderAfterAdd = traits.getAll().map((t) => t.constructor.name);
        traits.addToFront(new EchoTrait());
        const orderAfterFront = traits.getAll().map((t) => t.constructor.name);
        const byClass = traits.filter(HashTrait).length;
        const byProto = traits.filter(EchoTrait.prototype); // 非函数分支（鸭子匹配）
        traits.remove(hashTrait);
        const afterRemove = traits.getAll().length;
        const noMatch = traits.filter(HashTrait).length;
        const first = traits.getAll()[0];
        first.dispose();
        return { orderAfterAdd, orderAfterFront, byClass, byProto, afterRemove, noMatch, disposed: first.disposed };
      },
      (ns) => {
        class Z {}
        const traits = new ns.Traits();
        try {
          traits.get(Z);
          return "no-throw";
        } catch (e) {
          return e.message;
        }
      },
      (ns) => {
        class F {}
        const traits = new ns.Traits();
        const empty = traits.filter(F).length;
        traits.add(new F());
        const cached = traits.filter(F).length; // 二次查询命中缓存也应包含新 trait（add 已清缓存）
        traits.clear();
        const cleared = traits.filter(F).length;
        return [empty, cached, cleared];
      },
      (ns) => new ns.Traits().traitImplements({ foo: 1, bar: 2 }, { a: "foo", b: "bar" }),
      (ns) => new ns.Traits().traitImplements({ foo: 1 }, { a: "foo", b: "bar" }),
      (ns) => {
        const traits = new ns.Traits();
        const trait = { tag: "x" };
        traits.add(trait);
        return traits.find({ a: "tag" }) === trait;
      },
    ],
  },
  {
    name: "game/Country",
    tsjs: "src/game/Country.ts.js",
    probes: [
      (ns) => {
        const country = new ns.Country({
          id: 0,
          side: 3,
          name: "Americans",
          multiplay: true,
          multiplayPassive: false,
          veteranAircraft: ["A-10"],
          veteranInfantry: [],
          veteranUnits: ["Grizzly"],
        });
        return { id: country.id, side: country.side, name: country.name, playable: country.isPlayable() };
      },
      (ns) =>
        new ns.Country({ multiplay: true, multiplayPassive: true }).isPlayable(),
      (ns) => new ns.Country({ multiplay: false, multiplayPassive: false }).isPlayable(),
      (ns) => {
        const country = new ns.Country({
          veteranAircraft: ["A-10"],
          veteranInfantry: [],
          veteranUnits: ["Grizzly"],
        });
        return [
          country.hasVeteranUnit(ns.ObjectType.Vehicle, "Grizzly"),
          country.hasVeteranUnit(ns.ObjectType.Aircraft, "A-10"),
          country.hasVeteranUnit(ns.ObjectType.Infantry, "GI"),
          country.hasVeteranUnit(ns.ObjectType.Vehicle, "Rhino"),
        ];
      },
      (ns) => {
        const country = new ns.Country({ veteranAircraft: [], veteranInfantry: [], veteranUnits: [] });
        try {
          country.hasVeteranUnit(ns.ObjectType.Overlay, "X");
          return "no-throw";
        } catch (e) {
          return e.message;
        }
      },
      (ns) => {
        const rules = { name: "Soviets" };
        return ns.Country.factory("Soviets", { getCountry: (n) => (n === "Soviets" ? rules : null) }).name;
      },
    ],
  },
  {
    name: "game/PlayerList",
    tsjs: "src/game/PlayerList.ts.js",
    probes: [
      (ns) => {
        const mk = (name, opts = {}) => ({
          name,
          isObserver: !!opts.observer,
          isNeutral: !!opts.neutral,
          defeated: false,
          country: opts.side !== undefined ? { side: opts.side } : undefined,
          isCombatant() {
            return !this.isNeutral && !this.isObserver && !this.defeated;
          },
        });
        const list = new ns.PlayerList();
        const bob = mk("Bob", { neutral: true, side: ns.SideType.Civilian });
        const alice = mk("Alice");
        const carl = mk("Carl", { observer: true });
        list.addPlayer(bob);
        list.addPlayer(alice);
        list.addPlayer(carl);
        return {
          at: list.getPlayerAt(1).name,
          byName: list.getPlayerByName("Alice").name,
          number: list.getPlayerNumber(carl),
          combatants: list.getCombatants().map((p) => p.name),
          nonNeutral: list.getNonNeutral().map((p) => p.name),
          civilian: list.getCivilian()?.name ?? null,
          all: list.getAll().length,
        };
      },
      (ns) => {
        const list = new ns.PlayerList();
        try {
          list.getPlayerAt(0);
          return "no-throw";
        } catch (e) {
          return e.constructor.name + ": " + e.message;
        }
      },
      (ns) => {
        const list = new ns.PlayerList();
        list.addPlayer({ name: "Solo", isCombatant: () => true, isNeutral: false });
        try {
          list.getPlayerByName("Nobody");
          return "no-throw";
        } catch (e) {
          return e.message;
        }
      },
      (ns) => {
        const list = new ns.PlayerList();
        const p = { name: "X", isCombatant: () => true, isNeutral: false };
        list.addPlayer(p);
        try {
          list.getPlayerNumber({ name: "X" });
          return "no-throw";
        } catch (e) {
          return e.message;
        }
      },
    ],
  },
  {
    name: "game/Alliances",
    tsjs: "src/game/Alliances.ts.js",
    probes: [
      (ns) => ns.AllianceStatus.Requested + "/" + ns.AllianceStatus.Formed,
      (ns) => {
        // 完整请求→接受→结盟流程（3 个战斗方）
        const mk = (name) => ({ name, isAi: false, isObserver: false, isCombatant: () => true });
        const players = [mk("A"), mk("B"), mk("C")];
        const alliances = new ns.Alliances({
          getCombatants: () => players,
          getPlayerNumber: (p) => players.indexOf(p),
        });
        const requested = alliances.request(players[1], players[0]); // A 请求与 B 结盟
        const afterRequest = {
          status: requested?.status,
          found: !!alliances.findByPlayers(players[0], players[1]),
          allied: alliances.areAllied(players[0], players[1]),
        };
        alliances.acceptRequest(players[1], players[0]); // B 接受
        return {
          afterRequest,
          formed: alliances.areAllied(players[0], players[1]),
          alliesOfA: alliances.getAllies(players[0]).map((p) => p.name),
          hash: alliances.getHash(),
          state: alliances.debugGetState().map((e) => [e.first.name, e.second.name, e.status]),
          sharedIntelAB: alliances.haveSharedIntel(players[0], players[1]),
          sharedIntelAC: alliances.haveSharedIntel(players[0], players[2]),
        };
      },
      (ns) => {
        // 对 AI 请求 → 报错；无请求时接受/撤回/破裂 → 报错（消息逐字比对）
        const mk = (name, isAi = false) => ({ name, isAi, isObserver: false, isCombatant: () => true });
        const players = [mk("A"), mk("B"), mk("Bot", true)];
        const alliances = new ns.Alliances({
          getCombatants: () => players,
          getPlayerNumber: (p) => players.indexOf(p),
        });
        const out = [];
        try {
          alliances.request(players[0], players[2]);
          out.push("no-throw");
        } catch (e) {
          out.push(e.message);
        }
        try {
          alliances.acceptRequest(players[0], players[1]);
        } catch (e) {}
        try {
          alliances.cancelRequest(players[0], players[1]);
          out.push("cancel no-throw");
        } catch (e) {
          out.push(e.message);
        }
        try {
          alliances.breakAlliance(players[0], players[1]);
          out.push("break no-throw");
        } catch (e) {
          out.push(e.message);
        }
        return out;
      },
      (ns) => {
        // 撤回：非发起方被拒；发起方本人成功撤回
        const mk = (name) => ({ name, isAi: false, isObserver: false, isCombatant: () => true });
        const players = [mk("A"), mk("B")];
        const alliances = new ns.Alliances({
          getCombatants: () => players,
          getPlayerNumber: (p) => players.indexOf(p),
        });
        alliances.request(players[1], players[0]); // A 请求与 B 结盟 → 盟约 first = B
        const out = [];
        try {
          alliances.cancelRequest(players[0], players[0]); // 以 A 的身份撤回（first 是 B）→ 拒绝
          out.push("no-throw");
        } catch (e) {
          out.push(e.message);
        }
        alliances.cancelRequest(players[1], players[0]); // B 撤回 → 成功
        out.push(alliances.alliances.length);
        return out;
      },
      (ns) => {
        // canFormAlliance：三方全互敌时可结盟；已有结盟使双方无共同敌人时不可
        const mk = (name) => ({ name, isAi: false, isObserver: false, isCombatant: () => true });
        const players = [mk("A"), mk("B"), mk("C")];
        const alliances = new ns.Alliances({
          getCombatants: () => players,
          getPlayerNumber: (p) => players.indexOf(p),
        });
        const before = alliances.canFormAlliance(players[0], players[1]);
        alliances.request(players[1], players[0]);
        alliances.acceptRequest(players[1], players[0]);
        const afterFormed = alliances.canFormAlliance(players[0], players[1]);
        const hostileCount = alliances.getHostilePlayers().length;
        try {
          alliances.request(players[2], players[0]); // A-B 已结盟后再请求 → 已存在报错
          return [before, afterFormed, hostileCount, "no-throw"];
        } catch (e) {
          return [before, afterFormed, hostileCount, e.message];
        }
      },
      (ns) => {
        // 观察者/自身共享情报；空盟约散列
        const mk = (name, observer = false) => ({ name, isAi: false, isObserver: observer, isCombatant: () => true });
        const players = [mk("A"), mk("B", true)];
        const alliances = new ns.Alliances({
          getCombatants: () => players,
          getPlayerNumber: (p) => players.indexOf(p),
        });
        return {
          observer: alliances.haveSharedIntel(players[1], players[0]),
          self: alliances.haveSharedIntel(players[0], players[0]),
          emptyHash: alliances.getHash(),
        };
      },
    ],
  },
  {
    name: "game/Player",
    tsjs: "src/game/Player.ts.js",
    probes: [
      (ns) => {
        const player = new ns.Player("Bob");
        return {
          name: player.name,
          credits: player.credits,
          score: player.score,
          isObserver: player.isObserver,
          isNeutral: player.isNeutral,
          combatant: player.isCombatant(),
          color: player.color.asHexString(),
        };
      },
      (ns) => {
        const neutralCountry = {
          isPlayable: () => false,
          side: ns.SideType.Civilian,
          hasVeteranUnit: () => false,
        };
        const player = new ns.Player("Civ", neutralCountry);
        const combatant = new ns.Player("War", { isPlayable: () => true, hasVeteranUnit: () => false });
        return {
          neutral: player.isNeutral,
          neutralObserver: player.isObserver,
          combatantNeutral: combatant.isNeutral,
          combatantIs: combatant.isCombatant(),
        };
      },
      (ns) => {
        const player = new ns.Player("Bob");
        const out = [];
        try {
          player.credits = -1;
          out.push("no-throw");
        } catch (e) {
          out.push(e.constructor.name + ": " + e.message);
        }
        player.credits = 12345;
        out.push(player.credits);
        return out;
      },
      (ns) => {
        const player = new ns.Player("Bob");
        const building = { id: 7, type: ns.ObjectType.Building, name: "GAPOWR" };
        player.addOwnedObject(building);
        const afterAdd = {
          buildings: player.buildings.size,
          byId: player.getOwnedObjectById(7)?.name,
          byType: player.getOwnedObjectsByType(ns.ObjectType.Building).length,
          owner: building.owner === player,
        };
        const infantry = { id: 8, type: ns.ObjectType.Infantry, name: "GI" };
        player.addOwnedObject(infantry);
        const limboed = { id: 9, type: ns.ObjectType.Infantry, name: "LIMBO", limboData: {} };
        player.addOwnedObject(limboed);
        const withLimbo = {
          typeNoLimbo: player.getOwnedObjectsByType(ns.ObjectType.Infantry).length,
          typeWithLimbo: player.getOwnedObjectsByType(ns.ObjectType.Infantry, true).length,
          allNoLimbo: player.getOwnedObjects().length,
          allWithLimbo: player.getOwnedObjects(true).length,
        };
        player.removeOwnedObject(building);
        let removeError = "no-throw";
        try {
          player.removeOwnedObject(building);
        } catch (e) {
          removeError = e.message;
        }
        player.removeAllOwnedObjects();
        return {
          afterAdd,
          withLimbo,
          removeError,
          afterClear: player.getOwnedObjects(true).length + player.objectsById.size,
        };
      },
      (ns) => {
        const player = new ns.Player("Bob");
        player.addUnitsBuilt({ type: ns.ObjectType.Vehicle, name: "Heavy Tank", buildLimit: -1 }, 3);
        player.addUnitsBuilt({ type: ns.ObjectType.Vehicle, name: "Rhino", buildLimit: 5 }, 2);
        player.addUnitsBuilt({ type: ns.ObjectType.Infantry, name: "GI", buildLimit: 10 }, 4);
        return {
          vehicleBuilt: player.getUnitsBuilt(ns.ObjectType.Vehicle),
          totalBuilt: player.getUnitsBuilt(),
          limitedHeavy: player.getLimitedUnitsBuilt("Heavy Tank"),
          limitedRhino: player.getLimitedUnitsBuilt("Rhino"),
          missing: player.getLimitedUnitsBuilt("Nothing"),
        };
      },
      (ns) => {
        const player = new ns.Player("Bob");
        player.addUnitsKilled(ns.ObjectType.Infantry, 5);
        player.addUnitsKilled(ns.ObjectType.Infantry, 2);
        player.addUnitsKilled(ns.ObjectType.Vehicle, 1);
        player.addUnitsLost(ns.ObjectType.Infantry, 3);
        return {
          killedInf: player.getUnitsKilled(ns.ObjectType.Infantry),
          killedTotal: player.getUnitsKilled(),
          lostInf: player.getUnitsLost(ns.ObjectType.Infantry),
          lostTotal: player.getUnitsLost(),
        };
      },
      (ns) => {
        const player = new ns.Player("Bob");
        const emptyHash = player.getHash();
        player.traits.add({ getHash: () => 7 });
        const traitHash = player.getHash();
        const traitNoHash = new ns.Player("X");
        traitNoHash.traits.add({});
        return { emptyHash, traitHash, noHashTrait: traitNoHash.getHash() };
      },
      (ns) => {
        const player = new ns.Player("Bob");
        player.traits.add({ debugGetState: () => ({ hp: 1 }) });
        return player.debugGetState();
      },
      (ns) => {
        const player = new ns.Player("Bob");
        try {
          player.canProduceVeteran({ type: ns.ObjectType.Vehicle, name: "Rhino" });
          return "no-throw";
        } catch (e) {
          return e.message;
        }
      },
      (ns) => {
        const country = {
          isPlayable: () => true,
          hasVeteranUnit: (type, name) => type === ns.ObjectType.Vehicle && name === "Rhino",
        };
        const player = new ns.Player("Bob", country);
        player.production = {
          getQueueTypeForObject: () => 1,
          getFactoryTypeForQueueType: () => 2,
          hasVeteranType: (q) => q === 9,
        };
        const rules = { type: ns.ObjectType.Vehicle, name: "Rhino" };
        const rulesOther = { type: ns.ObjectType.Vehicle, name: "Apoc" };
        return {
          viaCountry: player.canProduceVeteran(rules),
          viaProduction: player.canProduceVeteran(rulesOther),
        };
      },
      (ns) => {
        const player = new ns.Player("Bob");
        let disposed = 0;
        player.traits.add({ dispose: () => disposed++ });
        player.production = { dispose: () => (disposed += 10) };
        player.dispose();
        return { disposed, disposeAgain: (player.production = undefined), ok: disposed === 11 };
      },
    ],
  },
  {
    name: "util/event",
    tsjs: "src/util/event.ts.js",
    probes: [
      (ns) => {
        const dispatcher = new ns.EventDispatcher();
        const received = [];
        dispatcher.subscribe((data, type) => received.push([type, data, "always"]));
        dispatcher.subscribeOnce((data, type) => received.push([type, data, "once"]));
        dispatcher.dispatch("evt", 1); // 两个监听器都触发
        dispatcher.dispatch("evt", 2); // 仅常驻监听器触发
        return received;
      },
      (ns) => {
        const dispatcher = new ns.EventDispatcher();
        dispatcher.subscribe((data) => received.push(data));
        const received = [];
        dispatcher.unsubscribe(dispatcher.listeners.values().next().value);
        dispatcher.dispatch("evt", 1);
        return { afterUnsubscribe: received.length, asEvent: dispatcher.asEvent() === dispatcher };
      },
      // 参数反转约定：dispatch(type, data) → listener(data, type)
      (ns) => {
        const dispatcher = new ns.EventDispatcher();
        let got;
        dispatcher.subscribe((data, type) => (got = [data, type]));
        dispatcher.dispatch("the-type", "the-data");
        return got;
      },
    ],
  },
  {
    name: "game/theater/rampHeights",
    tsjs: "src/game/theater/rampHeights.ts.js",
    probes: [
      (ns) => ns.rampHeights.length,
      (ns) => ns.rampHeights[0],
      (ns) => ns.rampHeights[13],
      (ns) => ns.rampHeights[20],
      (ns) => ns.rampHeights.map((row) => row.reduce((a, b) => a + b, 0)),
    ],
  },
  {
    name: "game/gameobject/trait/interface/NotifyTick",
    tsjs: "src/game/gameobject/trait/interface/NotifyTick.ts.js",
    probes: [
      (ns) => typeof ns.NotifyTick.onTick, // 必须是 symbol
      (ns) => String(ns.NotifyTick.onTick).startsWith("Symbol()"),
      (ns) => ns.NotifyTick.onTick === ns.NotifyTick.onTick,
    ],
  },
  {
    name: "game/gameobject/trait/interface/NotifyDestroy",
    tsjs: "src/game/gameobject/trait/interface/NotifyDestroy.ts.js",
    probes: [(ns) => typeof ns.NotifyDestroy.onDestroy, (ns) => Object.keys(ns.NotifyDestroy).length],
  },
  {
    name: "game/gameobject/trait/interface/NotifyOwnerChange",
    tsjs: "src/game/gameobject/trait/interface/NotifyOwnerChange.ts.js",
    probes: [(ns) => typeof ns.NotifyOwnerChange.onChange, (ns) => Object.keys(ns.NotifyOwnerChange).length],
  },
  {
    name: "game/gameobject/trait/interface/NotifySpawn",
    tsjs: "src/game/gameobject/trait/interface/NotifySpawn.ts.js",
    probes: [(ns) => typeof ns.NotifySpawn.onSpawn, (ns) => Object.keys(ns.NotifySpawn).length],
  },
  {
    name: "game/gameobject/trait/interface/NotifyUnspawn",
    tsjs: "src/game/gameobject/trait/interface/NotifyUnspawn.ts.js",
    probes: [(ns) => typeof ns.NotifyUnspawn.onUnspawn, (ns) => Object.keys(ns.NotifyUnspawn).length],
  },
  {
    name: "game/gameobject/trait/interface/NotifyAttack",
    tsjs: "src/game/gameobject/trait/interface/NotifyAttack.ts.js",
    probes: [(ns) => typeof ns.NotifyAttack.onAttack, (ns) => Object.keys(ns.NotifyAttack).length],
  },
  {
    name: "game/gameobject/common/DeathType",
    tsjs: "src/game/gameobject/common/DeathType.ts.js",
    probes: [
      (ns) => ns.DeathType.None,
      (ns) => ns.DeathType.Normal,
      (ns) => ns.DeathType.Temporal,
      (ns) => ns.DeathType.Sink,
      (ns) => ns.DeathType[ns.DeathType.Crush],
      (ns) => Object.keys(ns.DeathType).length,
    ],
  },
  {
    name: "game/gameobject/Unit",
    tsjs: "src/game/gameobject/Unit.ts.js",
    probes: [(ns) => Object.keys(ns).length, (ns) => typeof ns],
  },
  {
    name: "game/gameobject/Terrain",
    tsjs: "src/game/gameobject/Terrain.ts.js",
    probes: [
      (ns) => {
        const terrain = ns.Terrain.factory("T01", { radarInvisible: true, width: 1, height: 1 }, {});
        return {
          name: terrain.name,
          type: terrain.type,
          isTerrain: terrain.isTerrain(),
          isSmudge: terrain.isSmudge(),
          radarInvisible: terrain.radarInvisible,
        };
      },
    ],
  },
  {
    name: "game/gameobject/Smudge",
    tsjs: "src/game/gameobject/Smudge.ts.js",
    probes: [
      (ns) => {
        const smudge = ns.Smudge.factory("SCRTSTB", { width: 2, height: 2, radarInvisible: false }, {});
        return {
          type: smudge.type,
          isSmudge: smudge.isSmudge(),
          foundation: smudge.getFoundation(),
        };
      },
    ],
  },
  {
    name: "game/gameobject/GameObject",
    tsjs: "src/game/gameobject/GameObject.ts.js",
    probes: [
      (ns) => {
        const object = new ns.GameObject(ns.ObjectType.Terrain, "T01", { uiName: "Tree" }, {});
        return {
          type: object.type,
          name: object.name,
          isTerrain: object.isTerrain(),
          isOverlay: object.isOverlay(),
          isBuilding: object.isBuilding(),
          isUnit: object.isUnit(),
          isTechno: object.isTechno(),
          foundation: object.getFoundation(),
          uiName: object.getUiName(),
          spawned: object.isSpawned,
          deathType: object.deathType,
        };
      },
      (ns) => {
        // 生命周期广播：挂载带 Symbol 钩子的 trait 并逐一触发
        const object = new ns.GameObject(ns.ObjectType.Vehicle, "HTK", {}, {});
        const calls = [];
        const trait = {
          owner: null,
          [ns.NotifyTick.onTick](self, world) {
            calls.push(["tick", world, self === object]);
          },
          [ns.NotifySpawn.onSpawn](self, world) {
            calls.push(["spawn", world]);
          },
          [ns.NotifyUnspawn.onUnspawn](self, world) {
            calls.push(["unspawn", world]);
          },
          [ns.NotifyDestroy.onDestroy](self, damage, warhead, attacker) {
            calls.push(["destroy", damage, warhead, attacker]);
          },
          [ns.NotifyOwnerChange.onChange](self, oldOwner, newOwner) {
            calls.push(["owner", oldOwner, newOwner]);
          },
          [ns.NotifyAttack.onAttack](self, a, b) {
            calls.push(["attack", a, b]);
          },
        };
        object.addTrait(trait);
        object.update("W1");
        object.onSpawn("W");
        object.onAttack("src", "tgt"); // 分发时对调：trait 收到 (self, "tgt", "src")
        object.onOwnerChange("old", "new");
        object.onDestroy("dmg", "wh", "atk");
        object.onUnspawn("W");
        return {
          calls,
          spawnedAfterUnspawn: object.isSpawned,
          cachedTick: object.cachedTraits.tick.length,
        };
      },
      (ns) => {
        // addTrait 的 tick 缓存只登记实现了 NotifyTick 的 trait
        const object = new ns.GameObject(ns.ObjectType.Building, "GAPILE", {}, {});
        object.addTrait({});
        object.addTrait({ [ns.NotifyTick.onTick]: () => {} });
        const hashWithTrait = (() => {
          object.id = 5;
          object.position = {
            worldPosition: { x: 1.5, y: 0, z: -2.25, toArray: () => [1.5, 0, -2.25] },
          };
          return object.getHash();
        })();
        const state = object.debugGetState();
        object.dispose();
        return { cachedTick: object.cachedTraits.tick.length, hashWithTrait, stateId: state.id, disposed: object.isDisposed };
      },
    ],
  },
  {
    name: "game/gameobject/ObjectPosition",
    tsjs: "src/game/gameobject/ObjectPosition.ts.js",
    probes: [
      (ns, THREE) => {
        // moveToTileCoords：tile 切换 + 小数偏移 + 世界坐标合成
        const tiles = {
          getByMapCoords: (rx, ry) => ({ rx, ry, z: 0, rampType: 0 }),
          getPlaceholderTile: (rx, ry) => ({ rx, ry, z: 0, rampType: 0, placeholder: true }),
        };
        const position = new ns.ObjectPosition(tiles, { getBridgeOnTile: () => "bridge" });
        position.moveToTileCoords(2.25, 3.5);
        const world = position.worldPosition;
        return {
          tile: [position.tile.rx, position.tile.ry],
          offset: [position._tileOffset.x, position._tileOffset.y],
          world: [world.x, world.y, world.z],
          subCell: position.subCell,
          mapPosition: position.getMapPosition(),
        };
      },
      (ns, THREE) => {
        // 不存在的 tile：默认抛错 / allowPlaceholder 走占位
        const tiles = {
          getByMapCoords: () => null,
          getPlaceholderTile: (rx, ry) => ({ rx, ry, z: 0, rampType: 0, placeholder: true }),
        };
        const position = new ns.ObjectPosition(tiles, {});
        let error;
        try {
          position.moveToTileCoords(9, 9);
        } catch (e) {
          error = e.constructor.name;
        }
        position.moveToTileCoords(9, 9, true);
        return { error, placeholder: position.tile.placeholder };
      },
      (ns, THREE) => {
        // subCell 九宫格：0 居中，1-8 四角四边
        const tiles = { getByMapCoords: (rx, ry) => ({ rx, ry, z: 0, rampType: 0 }) };
        const position = new ns.ObjectPosition(tiles, {});
        const out = [];
        for (let cell = 0; cell <= 8; cell++) {
          position.subCell = cell;
          out.push([cell, position.subCell, position._tileOffset.x, position._tileOffset.y]);
        }
        return out;
      },
      (ns, THREE) => {
        // 斜坡高度插值 + tileElevation 往返
        const tiles = { getByMapCoords: (rx, ry) => ({ rx, ry, z: 2, rampType: 4 }) };
        const position = new ns.ObjectPosition(tiles, {});
        position.moveToTileCoords(1, 1);
        const interpolated = position.interpolateRampHeight(0.25, 0.75, 4);
        position.tileElevation = 2;
        const worldY = position.worldPosition.y;
        position.tileElevation = undefined === position.tileElevation ? 0 : position.tileElevation;
        return { interpolated, worldY, elevation: position.tileElevation };
      },
      (ns, THREE) => {
        // 事件派发 + tileChanged 标记 + 桥面查询 + clone
        const tiles = { getByMapCoords: (rx, ry) => ({ rx, ry, z: 0, rampType: 0 }) };
        const occupation = { getBridgeOnTile: (tile) => "bridge@" + tile.rx };
        const position = new ns.ObjectPosition(tiles, occupation);
        const events = [];
        position.onPositionChange.subscribe((self, payload) =>
          events.push([payload.tileChanged, self === position]),
        );
        position.moveToTileCoords(0, 0);
        position.moveToTileCoords(0.5, 0); // 同 tile → tileChanged=false
        position.tile = tiles.getByMapCoords(1, 1); // 直接换 tile → true
        const bridge = position.getBridgeBelow();
        const cloned = position.clone();
        return {
          events,
          bridge,
          clonedTile: [cloned.tile.rx, cloned.tile.ry],
          clonedWorld: cloned.worldPosition.toArray(),
          sameInstance: cloned === position,
        };
      },
      (ns, THREE) => {
        // 绝对高度模式：setAbsoluteElevationWorld 后 elevation 走反推
        const tiles = { getByMapCoords: (rx, ry) => ({ rx, ry, z: 0, rampType: 0 }) };
        const position = new ns.ObjectPosition(tiles, {});
        position.moveToTileCoords(3, 3);
        position.setAbsoluteElevationWorld(512);
        const elevationAfterSet = position.tileElevation;
        position.moveByLeptons3({ x: 256, y: 64, z: 0 });
        return { elevationAfterSet, world: position.worldPosition.toArray() };
      },
    ],
  },
  {
    name: "game/type/SpeedType",
    tsjs: "src/game/type/SpeedType.ts.js",
    probes: [
      (ns) => ns.SpeedType.Foot,
      (ns) => ns.SpeedType.Winged,
      (ns) => ns.SpeedType[ns.SpeedType.Hover],
      (ns) => Object.keys(ns.SpeedType).length,
    ],
  },
  {
    name: "game/type/PipColor",
    tsjs: "src/game/type/PipColor.ts.js",
    probes: [(ns) => ns.PipColor.Green, (ns) => ns.PipColor.Blue, (ns) => Object.keys(ns.PipColor).length],
  },
  {
    name: "game/type/PipScale",
    tsjs: "src/game/type/PipScale.ts.js",
    probes: [
      (ns) => ns.PipScale.None,
      (ns) => ns.PipScale.Tiberium,
      (ns) => ns.PipScale.MindControl, // 自定义扩展值 5
      (ns) => Object.keys(ns.PipScale).length,
    ],
  },
  {
    name: "game/type/LocomotorType",
    tsjs: "src/game/type/LocomotorType.ts.js",
    probes: [
      (ns) => ns.LocomotorType.Statue,
      (ns) => ns.LocomotorType.Vehicle,
      (ns) => ns.locomotorTypesByClsId.get("{4A582741-9839-11d1-B709-00A024DDAFD1}"),
      (ns) => ns.locomotorTypesByClsId.get("{92612C46-F71F-11d1-AC9F-006008055BB5}"),
      (ns) => ns.locomotorTypesByClsId.size,
      (ns) => ns.defaultSpeedsByLocomotor.get(ns.LocomotorType.Infantry),
      (ns) => ns.defaultSpeedsByLocomotor.get(ns.LocomotorType.Ship),
      (ns) => ns.defaultSpeedsByLocomotor.get(ns.LocomotorType.Chrono),
    ],
  },
  {
    name: "game/type/MovementZone",
    tsjs: "src/game/type/MovementZone.ts.js",
    probes: [(ns) => ns.MovementZone.Fly, (ns) => ns.MovementZone.Normal, (ns) => Object.keys(ns.MovementZone).length],
  },
  {
    name: "game/type/ArmorType",
    tsjs: "src/game/type/ArmorType.ts.js",
    probes: [(ns) => ns.ArmorType.None, (ns) => ns.ArmorType.Concrete, (ns) => ns.ArmorType.Special_2, (ns) => Object.keys(ns.ArmorType).length],
  },
  {
    name: "game/type/LandTargeting",
    tsjs: "src/game/type/LandTargeting.ts.js",
    probes: [(ns) => ns.LandTargeting.LandOk, (ns) => ns.LandTargeting.LandSecondary, (ns) => Object.keys(ns.LandTargeting).length],
  },
  {
    name: "game/type/NavalTargeting",
    tsjs: "src/game/type/NavalTargeting.ts.js",
    probes: [
      (ns) => ns.NavalTargeting.UnderwaterNever,
      (ns) => ns.NavalTargeting.NavalAll,
      (ns) => ns.NavalTargeting.NavalAllEquivalent, // 自定义登记的原版 YR 值 7
      (ns) => Object.keys(ns.NavalTargeting).length,
    ],
  },
  {
    name: "game/type/VhpScan",
    tsjs: "src/game/type/VhpScan.ts.js",
    probes: [(ns) => ns.VhpScan.None, (ns) => ns.VhpScan.Strong, (ns) => Object.keys(ns.VhpScan).length],
  },
  {
    name: "game/gameobject/unit/VeteranAbility",
    tsjs: "src/game/gameobject/unit/VeteranAbility.ts.js",
    probes: [
      (ns) => ns.VeteranAbility.FASTER,
      (ns) => ns.VeteranAbility.CRUSHER,
      (ns) => ns.VeteranAbility[ns.VeteranAbility.SELF_HEAL],
      (ns) => Object.keys(ns.VeteranAbility).length,
    ],
  },
  {
    name: "game/WeaponType",
    tsjs: "src/game/WeaponType.ts.js",
    probes: [(ns) => ns.WeaponType.Primary, (ns) => ns.WeaponType.DeathWeapon, (ns) => Object.keys(ns.WeaponType).length],
  },
  {
    name: "game/rules/ObjectRules",
    tsjs: "src/game/rules/ObjectRules.ts.js",
    probes: [
      (ns) => ns.ObjectRules.iniSpeedToLeptonsPerTick(255, 65),
      (ns) => ns.ObjectRules.iniSpeedToLeptonsPerTick(100, 100),
      (ns) => ns.ObjectRules.iniRotToDegsPerTick(256),
      (ns) => ns.ObjectRules.iniRotToDegsPerTick(64),
      (ns) => ns.ObjectRules.IMAGE_NONE,
      (ns) => {
        const ini = {
          name: "E1",
          getString: (k) => ({ UIName: "STSNAME|E1", Image: "null" }[k]),
          getBool: (k, d) => d,
        };
        const rules = new ns.ObjectRules(ns.ObjectType.Infantry, ini);
        return {
          name: rules.name,
          imageName: rules.imageName, // Image="null" → 回落段落名
          crushable: rules.crushable, // 步兵默认可碾压
          legalTarget: rules.legalTarget,
          uiName: rules.uiName,
          index: rules.index,
        };
      },
    ],
  },
  {
    name: "game/rules/TechnoRules",
    tsjs: "src/game/rules/TechnoRules.ts.js",
    probes: [
      (ns) => ns.TechnoRules.MAX_SIGHT + "/" + ns.BuildCat.Power + "/" + ns.FactoryType.AircraftType,
      // 步兵最小段落：一串缺省值（可碾压、Chrono 移动器、Foot 速度类型等）
      (ns) => {
        const rules = new ns.TechnoRules(
          ns.ObjectType.Infantry,
          makeMockIni("E1", { Strength: 100, Cost: 200 }),
          -1,
          { unitsUnsellable: false, returnStructures: false },
        );
        return {
          crushable: rules.crushable,
          locomotor: rules.locomotor,
          speedType: rules.speedType,
          speed: rules.speed,
          movementZone: rules.movementZone,
          pip: rules.pip,
          pipScale: rules.pipScale,
          sight: rules.sight,
          trainable: rules.trainable,
          isHuman: rules.organic,
          factory: rules.factory,
          buildLimit: rules.buildLimit === Infinity ? "Inf" : rules.buildLimit,
          eliteAbilities: rules.eliteAbilities.size,
          unsellable: rules.unsellable,
          returnable: rules.returnable,
        };
      },
      // 建筑最小段落：Statue 移动器、无速度类型、建筑缺省（可修复、不可训练等）
      (ns) => {
        const rules = new ns.TechnoRules(
          ns.ObjectType.Building,
          makeMockIni("GAPILE", { Strength: 400, Power: -50 }),
          -1,
          { unitsUnsellable: false, returnStructures: true },
        );
        return {
          locomotor: rules.locomotor,
          speedType: rules.speedType === undefined ? "none" : rules.speedType,
          repairable: rules.repairable,
          clickRepairable: rules.clickRepairable,
          tooBig: rules.tooBigToFitUnderBridge,
          trainable: rules.trainable,
          crushable: rules.crushable,
          returnable: rules.returnable,
          power: rules.power,
        };
      },
      // 载具：缺省移动器 Chrono 下按是否碾压给 Track/Wheel；速度封顶 256
      (ns) => {
        const crusher = new ns.TechnoRules(ns.ObjectType.Vehicle, makeMockIni("HTK", { Crusher: "yes", Speed: 110 }), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        const normal = new ns.TechnoRules(ns.ObjectType.Vehicle, makeMockIni("RHINO", { Speed: 110 }), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        return {
          crusherSpeedType: crusher.speedType,
          normalSpeedType: normal.speedType,
          speedCapped: crusher.speed,
        };
      },
      // 武器槽：none 归一化为 undefined；精英槽缺失回落普通槽
      (ns) => {
        const rules = new ns.TechnoRules(
          ns.ObjectType.Infantry,
          makeMockIni("GGI", {
            Primary: "M1Carbine",
            Secondary: "none",
            ElitePrimary: "MissileLauncher",
            Weapon1: "Flak",
            EliteWeapon1: "none",
            Weapon2: "MG",
          }),
          -1,
          { unitsUnsellable: false, returnStructures: false },
        );
        return {
          primary: rules.primary,
          secondary: rules.secondary === undefined ? "none" : rules.secondary,
          elitePrimary: rules.elitePrimary,
          weapon1: rules.getWeaponAtIndex(0),
          eliteWeapon1Fallback: rules.getEliteWeaponAtIndex(0),
          weapon2: rules.getWeaponAtIndex(1),
          eliteWeapon2: rules.getEliteWeaponAtIndex(1) === undefined ? "none" : "set",
        };
      },
      // 老兵/精英能力集合：精英 = 老兵 ∪ EliteAbilities
      (ns) => {
        const rules = new ns.TechnoRules(
          ns.ObjectType.Vehicle,
          makeMockIni("HTK", { VeteranAbilities: "FASTER,STRONGER", EliteAbilities: "C4" }),
          -1,
          { unitsUnsellable: false, returnStructures: false },
        );
        return {
          veteran: rules.veteranAbilities.size,
          elite: rules.eliteAbilities.size,
          hasC4: rules.eliteAbilities.has(ns.VeteranAbility.C4),
        };
      },
      // 盖特阶段阈值：未声明的阶段为 +∞
      (ns) => {
        const rules = new ns.TechnoRules(
          ns.ObjectType.Building,
          makeMockIni("GTGCTRK", { IsGattling: "yes", WeaponStages: 3, Stage1: 40, Stage2: 80, EliteStage1: 30 }),
          -1,
          { unitsUnsellable: false, returnStructures: false },
        );
        const fmt = (arr) => arr.map((v) => (v === Infinity ? "Inf" : v));
        return { stages: fmt(rules.stageThresholds), eliteStages: fmt(rules.eliteStageThresholds) };
      },
      // IFV 炮塔映射：*TurretWeapon 的值作为键、*TurretIndex 作为值
      (ns) => {
        const rules = new ns.TechnoRules(
          ns.ObjectType.Vehicle,
          makeMockIni("IFV", {
            Gunner: "yes",
            StingerTurretWeapon: "55",
            StingerTurretIndex: "2",
            OtherTurretWeapon: "66",
          }),
          -1,
          { unitsUnsellable: false, returnStructures: false },
        );
        return Array.from(rules.turretIndexesByIfvMode.entries());
      },
      // Factory=UnitType + Naval=yes → 归入海军船坞
      (ns) => {
        const naval = new ns.TechnoRules(ns.ObjectType.Vehicle, makeMockIni("SUB", { Factory: "UnitType", Naval: "yes" }), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        const land = new ns.TechnoRules(ns.ObjectType.Vehicle, makeMockIni("TNK", { Factory: "UnitType" }), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        return [naval.factory, land.factory];
      },
      // AIBasePlanningSide：合法序号保留，越界/未填为 undefined
      (ns) => {
        const valid = new ns.TechnoRules(ns.ObjectType.Building, makeMockIni("A", { AIBasePlanningSide: 2 }), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        const invalid = new ns.TechnoRules(ns.ObjectType.Building, makeMockIni("B", { AIBasePlanningSide: 99 }), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        const absent = new ns.TechnoRules(ns.ObjectType.Building, makeMockIni("C", {}), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        return [
          valid.aiBasePlanningSide,
          invalid.aiBasePlanningSide === undefined ? "undef" : invalid.aiBasePlanningSide,
          absent.aiBasePlanningSide === undefined ? "undef" : absent.aiBasePlanningSide,
        ];
      },
      // 视野截断：Sight 上限 11、工程师建筑强制 6
      (ns) => {
        const big = new ns.TechnoRules(ns.ObjectType.Vehicle, makeMockIni("A", { Sight: 99 }), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        const engineer = new ns.TechnoRules(ns.ObjectType.Building, makeMockIni("B", { NeedsEngineer: "yes", Sight: 99 }), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        return [big.sight, engineer.sight];
      },
      // 矿奴字段：SlavesNumber/Slaves 双拼写 + 数量兜底
      (ns) => {
        const declared = new ns.TechnoRules(ns.ObjectType.Building, makeMockIni("YAREFN", { SlavesNumber: "3" }), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        const named = new ns.TechnoRules(ns.ObjectType.Vehicle, makeMockIni("YASLMN", { Slaves: "YSLAV" }), -1, {
          unitsUnsellable: false,
          returnStructures: false,
        });
        return {
          declared: [declared.slaveMiner, declared.initialSlaves, declared.slaves],
          named: [named.slaveMiner, named.initialSlaves, named.slaves],
        };
      },
      // 受伤冒烟挂点：y/z 对调 + z/√2 坐标换算
      (ns) => {
        const rules = new ns.TechnoRules(
          ns.ObjectType.Building,
          makeMockIni("GACNST", { DamageSmokeOffset: "10,20,30" }),
          -1,
          { unitsUnsellable: false, returnStructures: false },
        );
        const s = rules.damageSmokeOffset;
        return [s.x, Math.round(s.y * 100) / 100, s.z];
      },
    ],
  },
  {
    name: "game/Coords",
    tsjs: "src/game/Coords.ts.js",
    probes: [
      (ns) => ns.Coords.ISO_TILE_SIZE,
      (ns) => ns.Coords.LEPTONS_PER_TILE,
      (ns) => ns.Coords.ISO_WORLD_SCALE,
      (ns) => ns.Coords.ISO_CAMERA_ALPHA,
      (ns) => ns.Coords.ISO_CAMERA_BETA,
      (ns) => ns.Coords.COS_ISO_CAMERA_BETA,
      (ns) => ns.Coords.zScale,
      (ns) => ns.Coords.tileToWorld(2, 3),
      (ns) => ns.Coords.tileHeightToWorld(3),
      (ns) => ns.Coords.worldToTileHeight(ns.Coords.tileHeightToWorld(7.5)),
      (ns) => ns.Coords.screenDistanceToWorld(100, 200),
      (ns) => ns.Coords.getWorldTileSize(),
      (ns, THREE) => {
        const v = ns.Coords.tile3dToWorld(4, 7, 2);
        return { x: v.x, y: v.y, z: v.z };
      },
      (ns, THREE) => {
        const v = ns.Coords.vecWorldToGround(new THREE.Vector3(1, 2, 3));
        return { x: v.x, y: v.y };
      },
      (ns, THREE) => {
        const v = ns.Coords.vecGroundToWorld(new THREE.Vector2(5, 6));
        return { x: v.x, y: v.y, z: v.z };
      },
    ],
  },
];

/** Modules registered from the reconstructed sources to satisfy imports. */
const RECON_DEPS = [
  "util/math",
  "util/string",
  "util/Base64",
  "util/Color",
  "data/Crc32",
  "engine/type/ObjectType",
  "game/Traits",
  "game/math/GameMath",
  "game/math/Quaternion",
  "game/math/Vector2",
  "game/math/Vector3",
  "game/GameSpeed",
  "game/event/EventType",
  "game/event/TimerExpireEvent",
  "game/SideType",
  "game/Country",
  "game/Player",
  "game/theater/rampHeights",
  "game/gameobject/trait/interface/NotifyTick",
  "game/gameobject/trait/interface/NotifyDestroy",
  "game/gameobject/trait/interface/NotifyOwnerChange",
  "game/gameobject/trait/interface/NotifySpawn",
  "game/gameobject/trait/interface/NotifyUnspawn",
  "game/gameobject/trait/interface/NotifyAttack",
  "game/gameobject/common/DeathType",
  "game/gameobject/GameObject",
  "game/Coords",
  "util/event",
  "game/type/SpeedType",
  "game/type/PipColor",
  "game/type/PipScale",
  "game/type/LocomotorType",
  "game/type/MovementZone",
  "game/type/ArmorType",
  "game/type/LandTargeting",
  "game/type/NavalTargeting",
  "game/type/VhpScan",
  "game/rules/ObjectRules",
  "game/WeaponType",
  "game/gameobject/unit/VeteranAbility",
];

// three r94 UMD: expose it globally the same way index.html does for the
// browser bundle. (require() would misfire: package.json "type":"module" makes
// Node treat the vendored UMD as ESM, breaking its exports/module detection.)
vm.runInThisContext(readFileSync(join(ROOT, "vendor/lib/three.min.js"), "utf8"), {
  filename: "vendor/lib/three.min.js",
});

function makeSystem() {
  const defs = new Map();
  const instances = new Map();
  async function get(name) {
    if (instances.has(name)) return instances.get(name);
    const def = defs.get(name);
    if (!def) {
      // Bare npm specifier (e.g. "mersenne-twister"): resolve via node and wrap
      // CJS exports the way the vendor bundle does ({ default: Class }).
      // Canonical bundle names (game/...、util/... 等) never fall through here.
      if (!/^(util|game|data|gui|engine|network|tools|worker)\//.test(name)) {
        const mod = require(name);
        const ns = mod && typeof mod === "object" ? { ...mod } : {};
        ns.default = mod;
        instances.set(name, ns);
        return ns;
      }
      throw new Error("module not registered: " + name);
    }
    const ns = {};
    const exports = (key, value) => {
      ns[key] = value;
      return value; // 真实 SystemJS 的 exports 会返回 value（EventType 模块依赖此行为）
    };
    const ret = def.factory(exports, { id: name });
    for (let i = 0; i < def.deps.length; i++) {
      ret.setters[i](await get(def.deps[i]));
    }
    ret.execute();
    instances.set(name, ns);
    return ns;
  }
  return {
    register: (name, deps, factory) => defs.set(name, { deps, factory }),
    get,
  };
}

function loadFile(sys, relPath) {
  const code = readFileSync(join(ROOT, relPath), "utf8");
  vm.runInThisContext(code, { filename: relPath });
  // Files call global System.register(...) synchronously at eval time.
}

async function instantiate(variantSource) {
  const sys = makeSystem();
  globalThis.System = sys;
  for (const dep of RECON_DEPS) {
    const twin = "src/" + dep + ".ts.js";
    // Prefer the .ts.js twin; once a dep's twin is deleted, fall back to its
    // compiled TS output so both variants still share identical dependencies.
    const file = existsSync(join(ROOT, twin))
      ? twin
      : "build/ts-modules/" + dep + ".js";
    if (!existsSync(join(ROOT, file)))
      throw new Error(`missing dep source for ${dep}: run npm run build:ts`);
    const code = readFileSync(join(ROOT, file), "utf8");
    vm.runInThisContext(code, { filename: file });
  }
  loadFile(sys, variantSource);
  return sys;
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * 测试用 INI 段落包装（模拟 rules 解析层接口，行为与真实 IniSection 对齐）：
 * getString/getBool/getNumber/getFixed/getArray/getEnum/getEnumNumeric/
 * getEnumArray/getNumberArray/has/entries/name。TechnoRules 等规则类的新旧
 * 两个变体在探针内使用同一份 mock 数据，保证解析输入逐字一致。
 */
function makeMockIni(name, entries) {
  const get = (key) => (key in entries ? entries[key] : undefined);
  return {
    name,
    // 遍历约定：每项为 [值, 键]（TechnoRules.parseTurretIndexes 依赖此顺序）。
    entries: Object.entries(entries).map(([key, value]) => [value, key]),
    has: (key) => key in entries,
    getString: (key) => {
      const value = get(key);
      return value === undefined ? "" : String(value);
    },
    getBool: (key, defaultValue) => {
      const value = get(key);
      if (value === undefined) return !!defaultValue;
      return value === true || value === "yes" || value === 1 || value === "1";
    },
    getNumber: (key, defaultValue) => {
      const value = get(key);
      if (value === undefined) return defaultValue;
      const n = Number(value);
      return Number.isNaN(n) ? defaultValue : n;
    },
    getFixed: (key, defaultValue) => {
      const value = get(key);
      if (value === undefined) return defaultValue;
      const n = parseFloat(value);
      return Number.isNaN(n) ? defaultValue : n;
    },
    getArray: (key) => {
      const value = get(key);
      return value === undefined ? [] : String(value).split(",");
    },
    getEnum: (key, enumObj, defaultValue) => {
      const value = get(key);
      if (value === undefined) return defaultValue;
      return enumObj[value] !== undefined ? enumObj[value] : defaultValue;
    },
    getEnumNumeric: (key, enumObj, defaultValue) => {
      const value = get(key);
      if (value === undefined) return defaultValue;
      const n = enumObj[value];
      return n !== undefined ? n : defaultValue;
    },
    getEnumArray: (key, enumObj) => {
      const value = get(key);
      return value === undefined ? [] : String(value).split(",").map((name) => enumObj[name]);
    },
    getNumberArray: (key, _default, fallback) => {
      const value = get(key);
      if (value === undefined) return fallback ?? _default ?? [];
      return String(value)
        .split(",")
        .map((part) => Number(part));
    },
  };
}

/**
 * Guard: the CONVERTED registry below must equal the set of non-declaration .ts
 * files actually present under src/. Without this check a newly converted module
 * that nobody registered silently loses parity coverage while the suite goes green
 * — and a registry entry whose .ts was deleted would crash later on a missing file.
 */
function assertRegistryMatchesDisk() {
  const onDisk = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) {
        onDisk.push(relative(SRC, full).replace(/\\/g, "/").replace(/\.ts$/, ""));
      }
    }
  };
  walk(SRC);

  const declared = CONVERTED.map((m) => m.name).sort();
  onDisk.sort();
  const unregistered = onDisk.filter((n) => !declared.includes(n));
  const stale = declared.filter((n) => !onDisk.includes(n));

  if (unregistered.length || stale.length) {
    if (unregistered.length)
      console.error(
        "FAIL parity registry: converted .ts not in CONVERTED: " + unregistered.join(", "),
      );
    if (stale.length)
      console.error(
        "FAIL parity registry: CONVERTED entries with no .ts on disk: " + stale.join(", "),
      );
    process.exit(1);
  }
  console.log(`parity registry OK: ${declared.length} converted module(s), all registered`);
}

/** Encode a probe outcome for snapshot storage. Errors are tagged explicitly. */
function encodeOutcome(value, error) {
  return error !== undefined ? { __error__: error } : value;
}

function decodeSnapshot(stored) {
  return stored && typeof stored === "object" && "__error__" in stored
    ? { error: stored.__error__ }
    : { value: stored };
}

async function main() {
  assertRegistryMatchesDisk();

  let snapshots = {};
  if (existsSync(SNAPSHOT_FILE))
    snapshots = JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8"));
  const snapshotsChanged = new Set();

  let totalFailures = 0;
  for (const mod of CONVERTED) {
    let moduleFailures = 0;
    const twinPath = "src/" + mod.name + ".ts.js";
    const hasTwin = existsSync(join(ROOT, twinPath));

    const newSys = await instantiate("build/ts-modules/" + mod.name + ".js");
    const newNs = await newSys.get(mod.name);
    const oldNs = hasTwin ? await (await instantiate(twinPath)).get(mod.name) : null;

    if (!hasTwin) console.log(`  ${mod.name}: twin deleted — snapshot track only`);

    mod.probes.forEach((probe, i) => {
      let newV, newErr;
      try {
        newV = probe(newNs, globalThis.THREE);
      } catch (e) {
        newErr = String(e);
      }
      const fail = (msg) => {
        moduleFailures++;
        console.error(`FAIL ${mod.name} probe#${i}: ${msg}`);
      };

      // Track 1: old twin vs new TS output.
      if (hasTwin) {
        let oldV, oldErr;
        try {
          oldV = probe(oldNs, globalThis.THREE);
        } catch (e) {
          oldErr = String(e);
        }
        const twinOk = oldErr === newErr && (oldErr !== undefined || deepEqual(oldV, newV));
        if (!twinOk) fail(`old=${oldErr ?? JSON.stringify(oldV)} new=${newErr ?? JSON.stringify(newV)}`);
      }

      // Track 2: committed snapshot vs new TS output.
      const stored = snapshots[mod.name]?.[i];
      const expected = decodeSnapshot(stored);
      if (stored === undefined) {
        // First capture: only legal while the twin still exists as the baseline.
        if (hasTwin) {
          let oldV, oldErr;
          try {
            oldV = probe(oldNs, globalThis.THREE);
          } catch (e) {
            oldErr = String(e);
          }
          (snapshots[mod.name] ??= {})[i] = encodeOutcome(oldV, oldErr);
          snapshotsChanged.add(mod.name);
        } else {
          fail("no snapshot and no twin to baseline from — restore the twin or use --update-snapshots");
        }
      } else if (expected.error !== undefined) {
        if (newErr !== expected.error)
          fail(`snapshot=${expected.error} new=${newErr ?? JSON.stringify(newV)}`);
      } else if (newErr !== undefined || !deepEqual(newV, expected.value)) {
        fail(`snapshot=${JSON.stringify(expected.value)} new=${newErr ?? JSON.stringify(newV)}${UPDATE_SNAPSHOTS ? "" : " (run: npm run test:parity -- --update-snapshots)"}`);
      }
    });
    totalFailures += moduleFailures;
    console.log(
      `${moduleFailures === 0 ? "PASS" : "FAIL"} ${mod.name}: ${mod.probes.length} probes${hasTwin ? " (twin+snapshot)" : " (snapshot)"}`,
    );
  }

  if (UPDATE_SNAPSHOTS || snapshotsChanged.size > 0) {
    writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshots, null, 2) + "\n");
    console.log(
      `snapshots ${UPDATE_SNAPSHOTS ? "re-baselined" : "created for"}: ${UPDATE_SNAPSHOTS ? "all modules" : [...snapshotsChanged].join(", ")} -> tests/parity-snapshots.json`,
    );
  }
  process.exit(totalFailures === 0 ? 0 : 1);
}

main();
