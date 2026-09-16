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
 * Snapshots are recorded from the .ts.js twin (the behavior baseline). A missing
 * entry is captured automatically on first run, from the twin. `--update-snapshots`
 * instead re-baselines every entry from the CURRENT TS output — an explicit
 * acceptance of behavior change (the twin track still guards accidental drift
 * for as long as the twins exist).
 *
 * A probe result of `undefined` is legitimate and is stored explicitly as
 * `{__undefined__: true}`; a bare `undefined` would be dropped by JSON.stringify
 * and could not be told apart from a missing entry.
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
    name: "game/gameobject/unit/VeteranLevel",
    tsjs: "src/game/gameobject/unit/VeteranLevel.ts.js",
    probes: [(ns) => ns.VeteranLevel.None, (ns) => ns.VeteranLevel.Elite, (ns) => Object.keys(ns.VeteranLevel).length],
  },
  {
    name: "game/gameobject/infantry/StanceType",
    tsjs: "src/game/gameobject/infantry/StanceType.ts.js",
    probes: [
      (ns) => ns.StanceType.None,
      (ns) => ns.StanceType.Prone,
      (ns) => ns.StanceType.Cheer,
      (ns) => Object.keys(ns.StanceType).length,
    ],
  },
  {
    name: "game/gameobject/unit/ZoneType",
    tsjs: "src/game/gameobject/unit/ZoneType.ts.js",
    probes: [
      (ns) => ns.ZoneType.Ground,
      (ns) => ns.ZoneType.Water,
      (ns) => Object.keys(ns.ZoneType).length,
      (ns) => ns.getZoneType(2), // LandType.Water（惰性加载孪生后取到真值）
      (ns) => ns.getZoneType(3), // LandType.Beach
      (ns) => ns.getZoneType(0), // LandType.Clear
    ],
  },
  {
    name: "game/gameobject/infantry/InfDeathType",
    tsjs: "src/game/gameobject/infantry/InfDeathType.ts.js",
    probes: [
      (ns) => ns.InfDeathType.Gunfire,
      (ns) => ns.InfDeathType.Virus,
      (ns) => ns.InfDeathType.YuriDeath,
      (ns) => ns.InfDeathType[ns.InfDeathType.Mutate],
      (ns) => Object.keys(ns.InfDeathType).length,
    ],
  },
  {
    name: "game/gameobject/unit/CrateBonuses",
    tsjs: "src/game/gameobject/unit/CrateBonuses.ts.js",
    probes: [
      (ns) => {
        const bonuses = new ns.CrateBonuses();
        return { firepower: bonuses.firepower, armor: bonuses.armor, speed: bonuses.speed };
      },
    ],
  },
  {
    name: "game/gameobject/Techno",
    tsjs: "src/game/gameobject/Techno.ts.js",
    probes: [
      // 规则标志快照 + 便捷读取器降级
      (ns) => {
        const rules = {
          explodes: true,
          radarInvisible: true,
          c4: true,
          crusher: true,
          omniCrusher: true,
          defaultToGuardArea: true,
          cost: 500,
          sight: 8,
        };
        const techno = new ns.Techno(ns.ObjectType.Vehicle, "HTK", rules, {});
        return {
          explodes: techno.explodes,
          crusher: techno.crusher,
          omniCrusher: techno.omniCrusher,
          purchaseValue: techno.purchaseValue,
          guardMode: techno.guardMode,
          primary: techno.primaryWeapon === undefined ? "none" : "set",
          veteranLevel: techno.veteranLevel,
          sight: techno.sight,
          isTechno: techno.isTechno(),
          isBuilding: techno.isBuilding(),
        };
      },
      // 碾压判定矩阵
      (ns) => {
        const rules = { crusher: true, omniCrusher: true, cost: 1, sight: 1 };
        const tank = new ns.Techno(ns.ObjectType.Vehicle, "HTK", rules, {});
        const mkTarget = (props) => ({ rules: {}, ...props });
        const crushableInf = mkTarget({ rules: { crushable: true } });
        const wallBuilding = mkTarget({ rules: { crushable: true, wall: true }, isBuilding: () => true });
        const building = mkTarget({ rules: { crushable: true }, isBuilding: () => true });
        const vehicle = mkTarget({ rules: { crushable: false } });
        const omniResistant = mkTarget({ rules: { crushable: false, omniCrushResistant: true } });
        const invulnerable = mkTarget({ rules: { crushable: true }, invulnerableTrait: { isActive: () => true } });
        return [
          tank.canCrushObject(crushableInf),
          tank.canCrushObject(wallBuilding),
          tank.canCrushObject(building),
          tank.canCrushObject(vehicle),
          tank.canCrushObject(omniResistant),
          tank.canCrushObject(invulnerable),
        ];
      },
      // 非碾压车；警戒复位
      (ns) => {
        const rules = { crusher: false, omniCrusher: false, cost: 1, sight: 1, defaultToGuardArea: false };
        const car = new ns.Techno(ns.ObjectType.Vehicle, "CAR", rules, {});
        const crushResult = car.canCrushObject({ rules: { crushable: true } });
        car.guardMode = true;
        car.guardArea = { x: 1 };
        car.resetGuardModeToIdle();
        return { crushResult, guardMode: car.guardMode, guardArea: car.guardArea === undefined ? "undef" : "set" };
      },
      // 超时空离场 tick 分流：仅 ticksWhenWarpedOut 的 trait 被驱动
      (ns) => {
        const rules = { crusher: false, omniCrusher: false, cost: 1, sight: 1 };
        const techno = new ns.Techno(ns.ObjectType.Vehicle, "HTK", rules, {});
        const calls = [];
        techno.warpedOutTrait = { isActive: () => true };
        techno.addTrait({ [ns.NotifyTick.onTick]: () => calls.push("always") });
        techno.addTrait({ ticksWhenWarpedOut: true, [ns.NotifyTick.onTick]: () => calls.push("warped") });
        techno.update("W");
        techno.warpedOutTrait = { isActive: () => false };
        techno.update("W");
        return calls;
      },
    ],
  },
  {
    name: "game/gameobject/Infantry",
    tsjs: "src/game/gameobject/Infantry.ts.js",
    probes: [
      // 最简出厂：恒挂 move/idle，fearless 无压制 trait
      (ns) => {
        const rules = { crashable: false, fearless: true, agent: false, engineer: false, storage: 0, slaved: false };
        const gi = ns.Infantry.factory("GI", rules, {}, {});
        return {
          name: gi.name,
          isUnit: gi.isUnit(),
          isInfantry: gi.isInfantry(),
          isTechno: gi.isTechno(),
          traitCount: gi.traits.getAll().length,
          hasMove: !!gi.moveTrait,
          hasSuppression: !!gi.suppressionTrait,
          hasIdle: !!gi.idleActionTrait,
          zone: gi.zone,
          infDeath: gi.infDeathType,
          subCells: ns.Infantry.SUB_CELLS,
        };
      },
      // 条件 trait：压制/特工/工程师/载货
      (ns) => {
        const rules = { crashable: true, fearless: false, agent: true, engineer: true, storage: 5, slaved: false };
        const tanya = ns.Infantry.factory("TANYA", rules, {}, {});
        return {
          hasCrashable: !!tanya.crashableTrait,
          hasSuppression: !!tanya.suppressionTrait,
          hasAgent: !!tanya.agentTrait,
          hasCast: !!tanya.castProgressTrait,
          hasCargo: !!tanya.harvesterTrait,
          traitCount: tanya.traits.getAll().length,
        };
      },
      // 矿奴：slaved 强制存储 ≥3 → 载货 trait 挂载
      (ns) => {
        const rules = { crashable: false, fearless: true, agent: false, engineer: false, slaved: true };
        const slave = ns.Infantry.factory("SLAV", rules, {}, {});
        return { storage: rules.storage, hasCargo: !!slave.harvesterTrait };
      },
      // 姿态读写与压制覆盖（压制 trait 为真实旧实现）
      (ns) => {
        const rules = { crashable: false, fearless: false, agent: false, engineer: false, storage: 0, slaved: false };
        const gi = ns.Infantry.factory("GI", rules, {}, {});
        const initial = gi.stance;
        gi.stance = ns.StanceType.Deployed;
        const deployed = gi.stance;
        gi.stance = ns.StanceType.None;
        return [initial, deployed, gi.stance];
      },
    ],
  },
  {
    name: "game/gameobject/Vehicle",
    tsjs: "src/game/gameobject/Vehicle.ts.js",
    probes: [
      // 最简出厂（地面坦克）：沉没判定（非海军 → 沉）、Ground 区
      (ns) => {
        const rules = {
          naval: false,
          underwater: false,
          weight: 100,
          crashable: false,
          crewed: false,
          harvester: false,
          passengers: 0,
          turret: false,
          consideredAircraft: false,
          landable: false,
          parasiteable: false,
          locomotor: ns.LocomotorType.Vehicle,
          powered: false,
          poweredUnit: false,
          prerequisite: [],
        };
        const tank = ns.Vehicle.factory("HTK", rules, { isVoxel: false }, { general: { shipSinkingWeight: 200 } }, {});
        return {
          isSinker: tank.isSinker,
          zone: tank.zone,
          isVehicle: tank.isVehicle(),
          isUnit: tank.isUnit(),
          traitCount: tank.traits.getAll().length,
          rockingTicksConst: ns.ROCKING_TICKS,
        };
      },
      // 潜艇：水下 → SubmergibleTrait + Water 区 + 不沉（海军且未超重）
      (ns) => {
        const rules = {
          naval: true,
          underwater: true,
          weight: 100,
          crashable: false,
          crewed: false,
          harvester: false,
          passengers: 0,
          turret: false,
          consideredAircraft: false,
          landable: false,
          parasiteable: false,
          locomotor: ns.LocomotorType.Ship,
          powered: false,
          poweredUnit: false,
          prerequisite: [],
        };
        const sub = ns.Vehicle.factory("SMSUB", rules, { isVoxel: false }, { general: { shipSinkingWeight: 200 } }, {});
        return { isSinker: sub.isSinker, zone: sub.zone, traitCount: sub.traits.getAll().length };
      },
      // IFV：运兵 + gunner → GunnerTrait；UI 名带模式前缀
      (ns) => {
        const rules = {
          naval: false,
          underwater: false,
          weight: 100,
          crashable: false,
          crewed: false,
          harvester: false,
          passengers: 2,
          turret: false,
          consideredAircraft: false,
          landable: false,
          parasiteable: false,
          locomotor: ns.LocomotorType.Vehicle,
          powered: false,
          poweredUnit: false,
          prerequisite: [],
          gunner: true,
        };
        const ifv = ns.Vehicle.factory("IFV", rules, { isVoxel: false }, { general: { shipSinkingWeight: 200 } }, {});
        ifv.armedTrait = { getSpecialWeaponIndex: () => 0 };
        ifv.transportTrait.units = [{ name: "GI" }];
        const uiName = ifv.getUiName();
        return { hasGunner: !!ifv.gunnerTrait, hasTransport: !!ifv.transportTrait, uiName };
      },
      // 机器人坦克：poweredUnit + 前置 → RobotControlTrait；悬浮移动器
      (ns) => {
        const rules = {
          naval: false,
          underwater: false,
          weight: 100,
          crashable: false,
          crewed: false,
          harvester: false,
          passengers: 0,
          turret: true,
          consideredAircraft: false,
          landable: false,
          parasiteable: false,
          locomotor: ns.LocomotorType.Hover,
          powered: false,
          poweredUnit: true,
          prerequisite: ["GACSPH"],
        };
        const robot = ns.Vehicle.factory("ROBOT", rules, { isVoxel: false }, { general: { shipSinkingWeight: 200 } }, {});
        return { hasRobotControl: !!robot.robotControlTrait, traitCount: robot.traits.getAll().length };
      },
      // 体素倾斜 + 摇晃：Vehicle/Chrono + voxel → TilterTrait；命中摇晃 34 tick
      (ns) => {
        const base = {
          naval: false,
          underwater: false,
          weight: 100,
          crashable: false,
          crewed: false,
          harvester: false,
          passengers: 0,
          turret: false,
          consideredAircraft: false,
          landable: false,
          parasiteable: false,
          locomotor: ns.LocomotorType.Vehicle,
          powered: false,
          poweredUnit: false,
          prerequisite: [],
        };
        const voxel = ns.Vehicle.factory("HTK", { ...base }, { isVoxel: true }, { general: { shipSinkingWeight: 200 } }, {});
        const shp = ns.Vehicle.factory("HTK2", { ...base }, { isVoxel: false }, { general: { shipSinkingWeight: 200 } }, {});
        const hasTilt = [!!voxel.tilterTrait, !!shp.tilterTrait];
        voxel.warpedOutTrait = { isActive: () => false };
        voxel.applyRocking(90, 0.5);
        const rocking = { ticksLeft: voxel.rocking.ticksLeft, factor: voxel.rocking.factor };
        for (let i = 0; i < ns.ROCKING_TICKS; i++) voxel.update("W");
        return { hasTilt, rocking, cleared: voxel.rocking === undefined };
      },
      // 采矿车：harvester → HarvesterTrait + 乘员 + 寄生 + 体素倾斜
      (ns) => {
        const rules = {
          naval: false,
          underwater: false,
          weight: 300,
          crashable: false,
          crewed: true,
          harvester: true,
          passengers: 0,
          turret: false,
          consideredAircraft: false,
          landable: false,
          parasiteable: true,
          locomotor: ns.LocomotorType.Vehicle,
          powered: false,
          poweredUnit: false,
          prerequisite: [],
          storage: 20,
        };
        const warMiner = ns.Vehicle.factory("WARMINER", rules, { isVoxel: true }, { general: { shipSinkingWeight: 200 } }, {});
        return {
          hasHarvester: !!warMiner.harvesterTrait,
          hasCrewed: !!warMiner.crewedTrait,
          hasParasiteable: !!warMiner.parasiteableTrait,
          hasTilter: !!warMiner.tilterTrait,
        };
      },
    ],
  },
  {
    name: "game/gameobject/trait/interface/NotifyBuildStatus",
    tsjs: "src/game/gameobject/trait/interface/NotifyBuildStatus.ts.js",
    probes: [
      (ns) => typeof ns.NotifyBuildStatus.onStatusChange,
      (ns) => Object.keys(ns.NotifyBuildStatus).length,
    ],
  },
  {
    name: "game/event/BuildStatusChangeEvent",
    tsjs: "src/game/event/BuildStatusChangeEvent.ts.js",
    probes: [
      (ns) => {
        const target = { tag: "GAPOWR" };
        const event = new ns.BuildStatusChangeEvent(target, 1);
        return {
          sameTarget: event.target === target,
          status: event.status,
          type: event.type,
          typeName: ns.EventType ? ns.EventType[event.type] : "n/a",
        };
      },
    ],
  },
  {
    name: "game/gameobject/Aircraft",
    tsjs: "src/game/gameobject/Aircraft.ts.js",
    probes: [
      // 基础出厂：机场绑定 + 可坠毁 + 子机链接 + 可停靠
      (ns) => {
        const rules = {
          airportBound: true,
          dock: ["GAAIRP"],
          missileSpawn: false,
          spawned: true,
          landable: false,
          parasiteable: true,
        };
        const general = { general: { paradrop: { paradropPlane: "PDPLANE" } } };
        const harrier = ns.Aircraft.factory("HARRIER", rules, {}, general, {});
        return {
          name: harrier.name,
          isAircraft: harrier.isAircraft(),
          isUnit: harrier.isUnit(),
          isTechno: harrier.isTechno(),
          hasAirportBound: !!harrier.airportBoundTrait,
          hasCrashable: !!harrier.crashableTrait,
          hasSpawnLink: !!harrier.spawnLinkTrait,
          hasMissileSpawn: !!harrier.missileSpawnTrait,
          hasMove: !!harrier.moveTrait,
          hasParasiteable: !!harrier.parasiteableTrait,
          traitCount: harrier.traits.getAll().length,
          zone: harrier.zone,
          direction: (harrier.direction = 42), // direction 读写即 yaw
          yaw: harrier.yaw,
        };
      },
      // 导弹出生体：无坠毁 trait、挂 MissileSpawn；空降机 landable → 无 Unlandable
      (ns) => {
        const general = { general: { paradrop: { paradropPlane: "PDPLANE" } } };
        const missileRules = {
          airportBound: false,
          dock: [],
          missileSpawn: true,
          spawned: true,
          landable: false,
          parasiteable: false,
        };
        const missile = ns.Aircraft.factory("DMISSILE", missileRules, {}, general, {});
        const paradropRules = {
          airportBound: false,
          dock: [],
          missileSpawn: false,
          spawned: false,
          landable: true,
          parasiteable: false,
        };
        const paradrop = ns.Aircraft.factory("PDPLANE", paradropRules, {}, general, {});
        const fighterRules = {
          airportBound: false,
          dock: [],
          missileSpawn: false,
          spawned: false,
          landable: true,
          parasiteable: false,
        };
        const fighter = ns.Aircraft.factory("FIGHTER", fighterRules, {}, general, {});
        return {
          missile: {
            crashable: !!missile.crashableTrait,
            missileSpawn: !!missile.missileSpawnTrait,
            spawnLink: !!missile.spawnLinkTrait,
          },
          paradropTraitCount: paradrop.traits.getAll().length, // 可降落空降机：无 Unlandable
          fighterTraitCount: fighter.traits.getAll().length, // 普通战机：多一个 Unlandable
        };
      },
    ],
  },
  {
    name: "game/gameobject/Building",
    tsjs: "src/game/gameobject/Building.ts.js",
    probes: [
      // 内部枚举 + 静态缺省
      (ns) => [ns.BuildStatus.BuildUp, ns.BuildStatus.Ready, ns.BuildStatus.BuildDown],
      // 最简建筑：无附加 trait；占位中心偏移；状态机初始 BuildUp
      (ns) => {
        const world = { audioVisual: { conditionRed: "red" }, general: { engineerTechSecureTime: 45 } };
        const building = ns.Building.factory("GACNST", {}, world, { foundation: { width: 3, height: 3 } }, null, null);
        const offset = building.getFoundationCenterOffset();
        return {
          isBuilding: building.isBuilding(),
          status: building.buildStatus,
          traitCount: building.traits.getAll().length,
          foundation: building.getFoundation(),
          offset: [offset.x, offset.y],
          isTechno: building.isTechno(),
        };
      },
      // 出厂组装矩阵（桩类 $args 记录构造参数，可断言传入值）
      (ns) => {
        const world = { audioVisual: { conditionRed: "red" }, general: { engineerTechSecureTime: 45 } };
        const art = { foundation: { width: 2, height: 2 }, dockingOffsets: [1, 2] };
        const rules = {
          canBeOccupied: true,
          infantryAbsorb: true,
          maxNumberOccupants: 5,
          capturable: true,
          needsEngineer: true,
          produceCashStartup: 10,
          produceCashAmount: 20,
          canC4: true,
          wall: false,
          eligibleForDelayKill: true,
          crewed: true,
          turret: true,
          overpowerable: true,
          powered: true,
          power: -100,
          factory: ns.FactoryType.BuildingType,
          cloning: false,
          superWeapon: "ChronoStorm",
          numberOfDocks: 1,
          helipad: true,
          unitRepair: true,
          unitReload: true,
          bunker: false,
          hospital: false,
          infantryGainSelfHeal: 0.5,
          unitsGainSelfHeal: 0,
          gapGenerator: true,
          gapRadiusInCells: 12,
          psychicDetectionRadius: 10,
          freeUnit: "E1",
        };
        const building = ns.Building.factory("GAWAPHUT", rules, world, art, "dockCtx", "bridgeCtx");
        return {
          hasGarrison: !!building.garrisonTrait,
          transportIsGarrison: building.transportTrait === building.garrisonTrait, // 吸收式驻扎兼任运输
          hasSecure: !!building.secureProgressTrait,
          hasC4: !!building.c4ChargeTrait,
          hasDelayedKill: !!building.delayedKillTrait,
          hasCrewed: !!building.crewedTrait,
          hasTurret: !!building.turretTrait,
          hasOverpowered: !!building.overpoweredTrait,
          hasPowered: !!building.poweredTrait,
          factoryArgs: building.factoryTrait.$args,
          hasSuperWeapon: !!building.superWeaponTrait,
          hasDock: !!building.dockTrait,
          dockArgs: building.dockTrait.$args.slice(2),
          hasHelipad: !!building.helipadTrait,
          hasUnitRepair: !!building.unitRepairTrait,
          hasUnitReload: !!building.unitReloadTrait,
          hasHospitalHeal: building.traits.getAll().some((t) => t.$stub === "game/gameobject/trait/TechHospitalHealTrait"),
          hasRally: !!building.rallyTrait,
          hasFreeUnit: building.traits.getAll().some((t) => t.$stub === "game/gameobject/trait/FreeUnitTrait"),
          hasGap: building.gapGeneratorTrait.$args,
          hasPsychicDetector: !!building.psychicDetectorTrait,
          traitCount: building.traits.getAll().length,
        };
      },
      // 油井（produceCashStartup）、墙（wall 抑制 C4）、坦克碉堡 NATBNK 特例
      (ns) => {
        const world = { audioVisual: { conditionRed: "red" }, general: { engineerTechSecureTime: 45 } };
        const art = { foundation: { width: 1, height: 1 }, dockingOffsets: [] };
        const derrick = ns.Building.factory("GAOILB", { produceCashStartup: 1 }, world, art, null, null);
        const wallWithC4 = ns.Building.factory(
          "GAWALL",
          { canC4: true, wall: true },
          world,
          art,
          null,
          null,
        );
        const natbnk = ns.Building.factory("NATBNK", {}, world, art, null, null);
        const namedBunker = ns.Building.factory("MYBNK", { bunker: true }, world, art, null, null);
        return {
          hasOilDerrick: derrick.traits.getAll().some((t) => t.$stub === "game/gameobject/trait/OilDerrickTrait"),
          wallC4: !!wallWithC4.c4ChargeTrait, // 墙不可被安放 C4
          wallTrait: !!wallWithC4.wallTrait,
          natbnkBunker: !!natbnk.tankBunkerTrait, // 按名字特判
          namedBunker: !!namedBunker.tankBunkerTrait,
        };
      },
      // 建造状态机：BuildUp 阻塞任务、断电禁用攻击、状态变化广播与事件
      (ns) => {
        const world = { audioVisual: { conditionRed: "red" }, general: { engineerTechSecureTime: 45 } };
        const building = ns.Building.factory("GACNST", {}, world, { foundation: { width: 1, height: 1 } }, null, null);
        const addedTasks = [];
        const disabledLog = [];
        const dispatched = [];
        building.unitOrderTrait = {
          hasTasks: () => addedTasks.length > 0,
          addTask: (task) => addedTasks.push(task),
        };
        building.attackTrait = { setDisabled: (v) => disabledLog.push(v) };
        building.poweredTrait = { isPoweredOn: () => false };
        building.warpedOutTrait = { isActive: () => false };
        const events = [];
        const simWorld = { rules: { general: { buildupTime: 5 } }, events: { dispatch: (event) => dispatched.push(event) } };
        building.update(simWorld); // BuildUp → 挂等待任务 + 攻击禁用
        building.update(simWorld); // 已有任务 → 不重复挂
        building.setBuildStatus(ns.BuildStatus.Ready, simWorld); // 就绪 → 广播 + 事件
        building.setBuildStatus(ns.BuildStatus.Ready, simWorld); // 状态未变 → 不重复广播
        building.update(simWorld); // 就绪且断电 → 仍禁用
        return {
          tasksAdded: addedTasks.length,
          disabledLog,
          dispatched: dispatched.map((event) => [event.constructor.name === "BuildStatusChangeEvent" ? "evt" : "?", event.status]),
          status: building.buildStatus,
        };
      },
      // 秘密实验室奖励的优先级：规则覆盖键 > 地图分配
      (ns) => {
        const world = { audioVisual: { conditionRed: "red" }, general: { engineerTechSecureTime: 45 } };
        const building = ns.Building.factory("CASLAB", { secretLab: true, secretUnit: "APOC" }, world, { foundation: { width: 2, height: 2 } }, null, null);
        building.secretProduction = "SNIPE";
        const withUnit = building.getSecretProduction();
        building.rules.secretUnit = undefined;
        const fallback = building.getSecretProduction();
        return { withUnit, fallback };
      },
      // 碾磨/倒矿动画计数衰减
      (ns) => {
        const world = { audioVisual: { conditionRed: "red" }, general: { engineerTechSecureTime: 45 } };
        const refinery = ns.Building.factory("GAREFN", {}, world, { foundation: { width: 3, height: 3 } }, null, null);
        refinery.warpedOutTrait = { isActive: () => false };
        refinery.unitOrderTrait = { hasTasks: () => true };
        refinery._grindingAnimTicks = 2;
        refinery._refineryOrePile = 1;
        refinery.update({ rules: { general: { buildupTime: 5 } } });
        return { grinding: refinery._grindingAnimTicks, orePile: refinery._refineryOrePile };
      },
    ],
  },
  {
    name: "game/WeaponInfo",
    tsjs: "src/game/WeaponInfo.ts.js",
    probes: [(ns) => Object.keys(ns).length, (ns) => typeof ns],
  },
  {
    name: "game/WeaponTargeting",
    tsjs: "src/game/WeaponTargeting.ts.js",
    probes: [
      // 普通武器：打敌方可瞄准、友方拒绝、隐形拒绝
      (ns) => {
        const self = {
          name: "GTANK",
          owner: { name: "P1" },
          rules: { attackCursorOnFriendlies: false, navalTargeting: 5, landTargeting: 0 },
        };
        const warheadRules = {};
        const weaponRules = { damage: 50 };
        const projectileRules = { isAntiGround: true, isAntiAir: false };
        const game = {
          areFriendly: (a, b) => a.owner === b.owner,
          alliances: { haveSharedIntel: () => false },
        };
        const targeting = new ns.WeaponTargeting(ns.WeaponType.Primary, projectileRules, weaponRules, warheadRules, self, { prism: { type: "PRISM" } });
        const enemy = { isTechno: () => true, isUnit: () => true, owner: { name: "P2" }, zone: 0, tileElevation: 0 };
        const friend = { isTechno: () => true, isUnit: () => true, owner: { name: "P1" }, zone: 0, tileElevation: 0 };
        const cloaked = { isTechno: () => true, isUnit: () => true, owner: { name: "P2" }, zone: 0, tileElevation: 0, cloakableTrait: { isCloaked: () => true } };
        const tile = { landType: 0 }; // LandType.Clear
        return [
          targeting.canTarget(enemy, game, false, false, false),
          targeting.canTarget(friend, game, false, false, false),
          targeting.canTarget(cloaked, game, false, false, false),
        ];
      },
      // 区域策略：对空弹体打空中目标、副武器专属对空不打地面
      (ns) => {
        const self = {
          name: "AATANK",
          owner: { name: "P1" },
          rules: { attackCursorOnFriendlies: false, navalTargeting: 5, landTargeting: 0 },
        };
        const projectileRules = { isAntiGround: false, isAntiAir: true };
        const targeting = new ns.WeaponTargeting(ns.WeaponType.Primary, projectileRules, { damage: 10 }, {}, self, { prism: { type: "PRISM" } });
        const airUnit = { isUnit: () => true, isTechno: () => true, owner: { name: "P2" }, zone: 1 };
        const groundUnit = { isUnit: () => true, isTechno: () => true, owner: { name: "P2" }, zone: 0 };
        return [
          targeting.canTarget(airUnit, { areFriendly: () => false, alliances: { haveSharedIntel: () => false } }, false, false, false),
          targeting.canTargetZone(airUnit, null),
          targeting.canTargetZone(groundUnit, { landType: 0 }),
        ];
      },
      // 海军策略枚举逐值
      (ns) => {
        const targeting = new ns.WeaponTargeting(ns.WeaponType.Primary, {}, {}, {}, { rules: {} }, { prism: { type: "PRISM" } });
        const submergedSub = { isVehicle: () => true, submergibleTrait: { isSubmerged: () => true } };
        const surfacedShip = { isVehicle: () => true, submergibleTrait: { isSubmerged: () => false } };
        const organic = { isTechno: () => true, rules: { organic: true, naval: true } };
        return [
          targeting.canTargetNaval(ns.NavalTargeting.UnderwaterNever, null, submergedSub, 0),
          targeting.canTargetNaval(ns.NavalTargeting.UnderwaterOnly, null, submergedSub, 0),
          targeting.canTargetNaval(ns.NavalTargeting.UnderwaterOnly, null, surfacedShip, 0),
          targeting.canTargetNaval(ns.NavalTargeting.OrganicSecondary, null, organic, 1),
          targeting.canTargetNaval(ns.NavalTargeting.SealSpecial, null, organic, 1),
          targeting.canTargetNaval(ns.NavalTargeting.NavalAllEquivalent, null, null, 0),
          targeting.canTargetNaval(ns.NavalTargeting.NavalNone, null, null, 0),
        ];
      },
      // 治疗武器（负伤害）：只指向受损友军
      (ns) => {
        const self = { name: "MEDIC", owner: { name: "P1" }, rules: { attackCursorOnFriendlies: false } };
        const targeting = new ns.WeaponTargeting(ns.WeaponType.Primary, { isAntiGround: true }, { damage: -20 }, {}, self, { prism: { type: "PRISM" } });
        const game = { areFriendly: () => true, alliances: { haveSharedIntel: () => true } };
        const hurtFriend = { isTechno: () => true, isUnit: () => true, owner: { name: "P1" }, healthTrait: { health: 40 }, zone: 0 };
        const fullFriend = { isTechno: () => true, isUnit: () => true, owner: { name: "P1" }, healthTrait: { health: 100 }, zone: 0 };
        return [
          targeting.canTarget(hurtFriend, game, false, false, false),
          targeting.canTarget(fullFriend, game, false, false, false),
        ];
      },
    ],
  },
  {
    name: "game/Weapon",
    tsjs: "src/game/Weapon.ts.js",
    probes: [
      // computeSpeed：弧线/即时命中/常规
      (ns) => [
        ns.Weapon.computeSpeed({ speed: 60 }, { arcing: true }),
        ns.Weapon.computeSpeed({ speed: 60 }, { arcing: false, rot: 0 }),
        ns.Weapon.computeSpeed({ speed: 60, isLaser: true }, { arcing: false, rot: 1 }),
        ns.Weapon.computeSpeed({ speed: 60 }, { arcing: false, rot: 1, inviso: false }),
      ],
      // 静态缺省值
      (ns) => [
        ns.Weapon.NUKE_PAYLOAD_NAME,
        ns.Weapon.berserkROFMultiplier,
        ns.Weapon.bunkerWeaponRangeBonus,
        ns.Weapon.openToppedRangeBonus,
        ns.Weapon.openToppedDamageMultiplier,
        ns.Weapon.occupyWeaponRange,
        ns.Weapon.occupyROFMultiplier,
      ],
      // 冷却与连发计数
      (ns) => {
        const weaponRules = { rof: 50, burst: 3, burstDelay: [7, 8], name: "Test", spawner: false, limboLaunch: false, decloakToFire: false, revealOnFire: false, iniSpeed: 30 };
        const gameObject = {
          name: "GTANK",
          rules: { distributedFire: false, radialFireSegments: 0, burstDelay: [7, 8] },
          isAircraft: () => false,
          isUnit: () => true,
          crateBonuses: { firepower: 1.5 },
          ammoTrait: { ammo: 10 },
        };
        const weapon = new ns.Weapon(ns.WeaponType.Primary, gameObject, weaponRules, { rules: {} }, { name: "Shell" }, null, null);
        weapon.resetCooldown();
        const cooldown = weapon.getCooldownTicks();
        weapon.tick();
        const afterTick = weapon.getCooldownTicks();
        weapon.expireCooldown();
        // 模拟一次 fire：createProjectile 记录弹丸
        const created = [];
        const game = {
          generateRandomInt: (a, b) => 4,
          createProjectile: (name, owner, weapon2, target, flag) => {
            const proj = {
              isAircraft: () => false,
              position: {
                moveToLeptons: () => {},
                get tileElevation() { return 0; },
                set tileElevation(v) {},
                moveByLeptons: () => {},
                moveByLeptons3: () => {},
                worldPosition: { x: 0, y: 0, z: 0, clone: () => ({ add: () => ({ x: 0 }) }) },
              },
              baseDamageMultiplier: 0,
              direction: 0,
              owner,
            };
            created.push(proj);
            return proj;
          },
          map: { isWithinHardBounds: () => true },
          limboObject: () => {},
          getUnitSelection: () => ({ isSelected: () => false, getOrCreateSelectionModel: () => ({ getControlGroupNumber: () => 0 }) }),
          events: { dispatch: (e) => dispatched.push(e) },
          unlimboObject: () => {},
          spawnObject: () => {},
          mapShroudTrait: { getPlayerShroud: () => null },
        };
        const dispatched = [];
        const target = { obj: { isTechno: () => true, owner: { name: "P2" } } };
        gameObject.position = {
          getMapPosition: () => ({ x: 0, y: 0, clone: () => ({ sub: () => ({}) }) }),
          tileElevation: 0,
          tile: {},
          worldPosition: { x: 0, y: 0, z: 0, clone: () => ({ add: () => ({ x: 0 }) }) },
        };
        gameObject.art = { turretOffset: 0, getAlternateFlhCount: () => 0, getAlternateFlh: () => ({ forward: 0, lateral: 0, vertical: 0, clone: () => ({ forward: 0, lateral: 0, vertical: 0 }) }) };
        weapon.flh = { clone: () => ({ forward: 10, lateral: 5, vertical: 1, clone: () => ({ forward: 10, lateral: 5, vertical: 1 }) }) };
        weapon.fire(target, game, 2);
        const firedOnce = {
          burstsLeft: weapon.burstsLeft,
          burstIndex: weapon.burstIndex,
          useBurstDelay: weapon.useBurstDelay,
          cooldown: weapon.getCooldownTicks(),
          baseDamage: created[0].baseDamageMultiplier,
          spawned: created.length,
        };
        weapon.fire(target, game, 2); // 第二发：连发递减
        return { cooldown, afterTick, expireZero: weapon.getCooldownTicks(), firedOnce, secondBurstLeft: weapon.burstsLeft, secondIndex: weapon.burstIndex, dispatched: dispatched.length };
      },
      // 工厂参数表机器验证：(name, weaponType, gameObject, gameRules, flh?)
      (ns) => {
        const weaponRules = {
          name: "Maverick3",
          warhead: "WH",
          projectile: "Shell",
          spawner: false,
          burst: 1,
          rof: 30,
          iniSpeed: 20,
          isLaser: false,
          damage: 100,
          limboLaunch: false,
          drainWeapon: false,
        };
        const warheadIni = { rulesTag: "WH" };
        const projectileRules = { name: "Shell", arcing: false, rot: 1, inviso: false };
        const gameRules = {
          getWeapon: (n) => (n === "Maverick3" ? weaponRules : null),
          getWarhead: (n) => (n === "WH" ? warheadIni : null),
          getProjectile: (n) => (n === "Shell" ? projectileRules : null),
          general: { prism: { type: "PRISM" } },
        };
        const gameObject = {
          name: "A10",
          owner: { name: "P1" },
          rules: { attackCursorOnFriendlies: false, navalTargeting: 5, landTargeting: 0 },
        };
        const flh = { forward: 1, lateral: 2, vertical: 3 };
        const weapon = ns.Weapon.factory("Maverick3", ns.WeaponType.Primary, gameObject, gameRules, flh);
        return {
          type: weapon.type,
          gameObjectIsSame: weapon.gameObject === gameObject,
          rulesIsSame: weapon.rules === weaponRules,
          warheadRulesIsSame: weapon.warhead.rules === warheadIni,
          projectileIsSame: weapon.projectileRules === projectileRules,
          flhIsSame: weapon.flh === flh,
          targetingWired:
            weapon.targeting.gameObject === gameObject &&
            weapon.targeting.weaponType === ns.WeaponType.Primary &&
            weapon.targeting.warheadRules === warheadIni,
          defaultFlhWhenAbsent: !!ns.Weapon.factory("Maverick3", ns.WeaponType.Primary, gameObject, gameRules).flh,
        };
      },
      // fire 的两层越界语义：三维越界仍入场/派发；空射 guard 失败全跳过
      (ns) => {
        const boundsResults = [true, false]; // 第一次（平面位置）通过，第二次（三维合成）越界
        const created = [];
        const spawned = [];
        const moved3 = [];
        const dispatched = [];
        const weaponRules = {
          name: "T", rof: 30, burst: 1, burstDelay: [], spawner: false,
          limboLaunch: false, decloakToFire: false, revealOnFire: false,
          iniSpeed: 30, isLaser: false, damage: 10,
        };
        const gameObject = {
          name: "GTANK",
          rules: { distributedFire: false, radialFireSegments: 0, burstDelay: [] },
          isAircraft: () => false,
          isUnit: () => true,
          crateBonuses: { firepower: 1 },
          position: {
            getMapPosition: () => ({ x: 0, y: 0, clone: () => ({ sub: () => ({}) }) }),
            tileElevation: 0,
            tile: {},
            worldPosition: { x: 0, y: 0, z: 0, clone: () => ({ add: () => ({ x: 0 }) }) },
          },
          art: { turretOffset: 0 },
        };
        const weapon = new ns.Weapon(ns.WeaponType.Primary, gameObject, weaponRules, { rules: {} }, { name: "Shell" }, { clone: () => ({ forward: 10, lateral: 0, vertical: 2 }) }, null);
        const game = {
          createProjectile: () => {
            const proj = {
              isAircraft: () => false,
              position: {
                moveToLeptons: () => {},
                tileElevation: 0,
                moveByLeptons: () => {},
                moveByLeptons3: (v) => moved3.push(v),
                worldPosition: { x: 0, y: 0, z: 0, clone: () => ({ add: () => ({ x: 0 }) }) },
              },
              baseDamageMultiplier: 0,
              direction: 0,
              owner: gameObject,
            };
            created.push(proj);
            return proj;
          },
          map: { isWithinHardBounds: () => boundsResults.shift() ?? true },
          getUnitSelection: () => ({ isSelected: () => false, getOrCreateSelectionModel: () => ({ getControlGroupNumber: () => 0 }) }),
          limboObject: () => {},
          unlimboObject: () => {},
          spawnObject: (obj) => spawned.push(obj),
          mapShroudTrait: { getPlayerShroud: () => null },
          events: { dispatch: (e) => dispatched.push(e) },
          generateRandomInt: () => 4,
        };
        weapon.fire({ obj: null }, game, 1);
        return {
          spawnedDespiteWorldOob: spawned.length === 1,
          moveByLeptons3Skipped: moved3.length === 0,
          eventDispatched: dispatched.length === 1,
        };
      },
      // 空射 guard 失败：prepareLaunch 返回空 → 完全不发射
      (ns) => {
        const created = [];
        let burstsTouched = false;
        const weaponRules = {
          name: "AirBomb", rof: 30, burst: 2, burstDelay: [], spawner: true,
          limboLaunch: false, decloakToFire: false, revealOnFire: false, iniSpeed: 30, damage: 10,
        };
        const gameObject = {
          name: "AIRCRAFT",
          rules: { distributedFire: false, radialFireSegments: 0, burstDelay: [] },
          isAircraft: () => true,
          isUnit: () => true,
          crateBonuses: { firepower: 1 },
          airSpawnTrait: { prepareLaunch: () => null, availableSpawns: 0 },
          ammoTrait: { ammo: 5 },
          position: {
            getMapPosition: () => ({ x: 0, y: 0, clone: () => ({ sub: () => ({}) }) }),
            tileElevation: 0,
            tile: {},
            worldPosition: { x: 0, y: 0, z: 0, clone: () => ({ add: () => ({ x: 0 }) }) },
          },
          art: { turretOffset: 0 },
        };
        const weapon = new ns.Weapon(ns.WeaponType.Primary, gameObject, weaponRules, { rules: {} }, { name: "Bomb" }, { clone: () => ({ forward: 0, lateral: 0, vertical: 0 }) }, null);
        weapon.fire({ obj: null }, {
          createProjectile: () => created.push(1),
          map: { isWithinHardBounds: () => true },
          generateRandomInt: () => 4,
        }, 1);
        return { nothingFired: created.length === 0, burstsUntouched: weapon.burstsLeft === 0 && weapon.burstIndex === 0 };
      },
    ],
  },
  {
    name: "game/Warhead",
    tsjs: "src/game/Warhead.ts.js",
    probes: [
      // 静态常量
      (ns) => [ns.Warhead.SPECIAL_WARHEAD_NAME, ns.Warhead.HE_WARHEAD_NAME],
      // canDamage 判定矩阵
      (ns) => {
        const warhead = new ns.Warhead({ temporal: false, radiation: false, psychicDamage: false });
        const mk = (props) => ({
          isSpawned: true, isDisposed: false, isDestroyed: false, isCrashing: false,
          isTechno: () => false, isUnit: () => false, isBuilding: () => false, isOverlay: () => false, isTerrain: () => false,
          moveTrait: { reservedPathNodes: [] },
          healthTrait: {},
          zone: 0,
          rules: {},
          warpedOutTrait: { isInvulnerable: () => false },
          ...props,
        });
        const normal = mk({});
        const destroyed = mk({ isDestroyed: true });
        const immune = mk({ isTechno: () => true, rules: { immune: true }, warpedOutTrait: { isInvulnerable: () => false } });
        const temporalImmune = mk({ isTechno: () => true, rules: { warpable: false } });
        const temporalWarhead = new ns.Warhead({ temporal: true, radiation: false, psychicDamage: false });
        return [
          warhead.canDamage(normal, {}, 0),
          warhead.canDamage(destroyed, {}, 0),
          warhead.canDamage(immune, {}, 0),
          temporalWarhead.canDamage(immune, {}, 0),
          temporalWarhead.canDamage(temporalImmune, {}, 0),
          warhead.canDamage(temporalImmune, {}, 0),
        ];
      },
      // computeDamage：装甲衰减 / 墙免疫 / 取整方向
      (ns) => {
        const mk = (props) => ({
          isTechno: () => false, isOverlay: () => false, isTerrain: () => false,
          isBuilding: () => false, isUnit: () => false, isInfantry: () => false, isAircraft: () => false,
          stance: 0,
          ...props,
        });
        const verses = new Map([[ns.ArmorType.Heavy, 0.5], [ns.ArmorType.Wood, 2]]);
        const warhead = new ns.Warhead({ proneDamage: 0.5, verses, wallAbsoluteDestroyer: false, wall: false, wood: false });
        const techno = mk({ isTechno: () => true, rules: { armor: ns.ArmorType.Heavy }, veteranTrait: null, crateBonuses: { armor: 1 } });
        const halfVerses = warhead.computeDamage(100, techno, { gameOpts: {} });
        const wall = mk({ isBuilding: () => true, rules: { wall: true, armor: ns.ArmorType.Wood } });
        const wallZero = warhead.computeDamage(100, wall, { gameOpts: {} });
        const woodWarhead = new ns.Warhead({ proneDamage: 0.5, verses, wallAbsoluteDestroyer: false, wall: false, wood: true });
        const wallWood = woodWarhead.computeDamage(100, wall, { gameOpts: {} });
        const absDestroyer = new ns.Warhead({ proneDamage: 0.5, verses, wallAbsoluteDestroyer: true, wall: false, wood: false });
        const wallAbs = absDestroyer.computeDamage(100, wall, { gameOpts: {} });
        const negative = warhead.computeDamage(-30, mk({}), { gameOpts: {} });
        return { halfVerses, wallZero, wallWood, wallAbs, negative };
      },
      // pickExplodeAnim：C4 固定末帧 / emEffect 档位外随机 / 水花
      (ns) => {
        const game = {
          generateRandomInt: (a, b) => a, // emEffect 分支固定取下界（两侧一致即可）
          rules: {
            audioVisual: { weatherConBoltExplosion: "BOLT", weaponNullifyAnim: "NULL" },
            combatDamage: { splashList: ["splash0", "splash1", "splash2"], c4Warhead: "C4WH" },
          },
        };
        const anims = { animList: ["a0", "a1", "a2", "a3"] };
        const c4 = new ns.Warhead({ animList: ["a0", "a1", "a2", "a3"], conventional: false, emEffect: false });
        const c4Anim = c4.pickExplodeAnim(100, null, 0, game, false); // C4 弹头名匹配 → 末帧
        c4.rules.name = "C4WH";
        const c4AnimMatched = c4.pickExplodeAnim(100, null, 0, game, false);
        const normal = new ns.Warhead({ animList: ["a0", "a1", "a2", "a3"], conventional: false, emEffect: false });
        const lowDamage = normal.pickExplodeAnim(10, null, 0, game, false); // floor(10/25)=0
        const lightning = normal.pickExplodeAnim(10, null, 0, game, true);
        const splash = new ns.Warhead({ animList: [], conventional: true, emEffect: false });
        const splashAnim = splash.pickExplodeAnim(120, null, 2, game, false); // floor(120/50)=2 → splash2
        const empty = new ns.Warhead({ animList: [], conventional: false }).pickExplodeAnim(10, null, 0, game, false);
        return { c4Anim, c4AnimMatched, lowDamage, lightning, splashAnim, empty };
      },
      // detonate 空场 scaffolding：无目标时仍派发事件、不建辐射
      (ns) => {
        const warhead = new ns.Warhead({ cellSpread: 0, percentAtMax: 0.5, radLevel: 0, animList: ["boom"], conventional: false, emEffect: false, wall: false, wood: false, psychicDamage: false, isLocomotor: false, rocker: false, causesDelayKill: false, affectsAllies: false, wallAbsoluteDestroyer: false, infDeath: 1, penetratesBunker: false, proneDamage: 1, verses: new Map() });
        const dispatched = [];
        let radCreated = 0;
        const game = {
          map: {
            tileOccupation: {},
            tiles: {},
            mapBounds: {},
            getObjectsOnTile: () => [],
          },
          events: { dispatch: (e) => dispatched.push(e) },
          mapRadiationTrait: { createRadSite: () => radCreated++ },
          alliances: { areAllied: () => false },
          rules: { audioVisual: { weaponNullifyAnim: "NULL" }, combatDamage: { splashList: [] } },
          generateRandomInt: () => 0,
        };
        warhead.detonate(game, 100, { rx: 5, ry: 5, z: 0, rampType: 0 }, 0, { x: 0, y: 0 }, 0, 0, { obj: null, getBridge: () => null }, { weapon: null, obj: null, player: null }, undefined, undefined, undefined, false);
        return { dispatched: dispatched.length, radCreated, anim: dispatched[0]?.animList ?? dispatched[0]?.anim ?? (dispatched[0] ? "dispatched" : "none") };
      },
      // supressOrScatterTarget：胆小单位惊慌逃散
      (ns) => {
        const warhead = new ns.Warhead({});
        const tasks = [];
        const fraidycat = {
          rules: { fraidycat: true, insignificant: false },
          isVehicle: () => false,
          isInfantry: () => true,
          isPanicked: false,
          unitOrderTrait: { hasTasks: () => false, addTask: (t) => tasks.push(t) },
          moveTrait: { isIdle: () => false },
          suppressionTrait: null,
        };
        warhead.supressOrScatterTarget(fraidycat, {});
        return { tasks: tasks.length, panicked: fraidycat.isPanicked };
      },
      // createDummyWeaponInfo
      (ns) => {
        const warhead = new ns.Warhead({});
        const info = warhead.createDummyWeaponInfo();
        return {
          type: info.type,
          speed: info.speed === Infinity ? "Inf" : info.speed,
          isThisWarhead: info.warhead === warhead,
          range: info.range,
        };
      },
      // inflictDamage 死亡三分支的返回值（机器验证"突变也返回 true"：
      // 整个逗号表达式末尾是 !0，三元分支里的 !1 被丢弃）。
      (ns) => {
        const mkWarhead = (rules) => new ns.Warhead({ temporal: false, radiation: false, psychicDamage: false, penetratesBunker: false, ...rules });
        const mkTarget = (props) => ({
          isVehicle: undefined, // 无碉堡转嫁
          healthTrait: {
            health: 5,
            getHitPoints: function () { return 5; },
            inflictDamage: function (d) { this.health = Math.max(0, this.health - d); },
            healBy: () => {},
          },
          onAttack: () => {},
          isTechno: () => false,
          isInfantry: () => true,
          isUnit: () => true,
          zone: 0,
          crashableTrait: null,
          rules: { infDeath: undefined, isHuman: false, immuneToPsionics: false },
          tile: "T",
          position: { worldPosition: null },
          ...props,
        });
        const mkGame = (hasBrute) => ({
          traits: { filter: () => [] },
          events: { dispatch: () => {} },
          destroyObject: (target, attacker, a, b) => destroyedCalls.push([target, a === undefined ? "undef" : a, b]),
          createUnitForPlayer: (rules, owner) => ({ brute: true, owner }),
          spawnObject: (unit, tile) => spawnedBrutes.push([unit, tile]),
          rules: { hasObject: () => hasBrute, getObject: () => ({ name: "BRUTE" }) },
          virusCloudTrait: undefined,
        });
        let destroyedCalls = [];
        let spawnedBrutes = [];
        const attacker = { player: { name: "P1" } };
        // ① 常规死亡（InfDeath=1，无 BRUTE 规则）→ destroy + true
        const normalWarhead = mkWarhead({ infDeath: 1 });
        const victim1 = mkTarget({});
        const normalResult = normalWarhead.inflictDamage(10, victim1, attacker, mkGame(false), false);
        const normalDestroy = destroyedCalls.length;
        destroyedCalls = [];
        spawnedBrutes = [];
        // ② 突变死亡（InfDeath=9，规则有 BRUTE）→ 生成狂兽人 + 静默销毁 + 返回 true
        const mutateWarhead = mkWarhead({ infDeath: 9 });
        const victim2 = mkTarget({ name: "E1" });
        const mutateResult = mutateWarhead.inflictDamage(10, victim2, attacker, mkGame(true), false);
        const mutateDestroy = destroyedCalls.length;
        const bruteSpawned = spawnedBrutes.length;
        const mutateInfDeath = victim2.infDeathType;
        destroyedCalls = [];
        // ③ 幸存 → false
        const survivor = mkTarget({});
        survivor.healthTrait.health = 50;
        survivor.healthTrait.inflictDamage = function (d) { this.health = Math.max(0, this.health - Math.min(d, 5)); };
        const aliveResult = mkWarhead({ infDeath: 1 }).inflictDamage(10, survivor, attacker, mkGame(false), false);
        return {
          normalResult, normalDestroy,
          mutateResult, mutateDestroy, bruteSpawned, mutateInfDeath,
          aliveResult,
        };
      },
    ],
  },
  {
    name: "game/rules/general/RepairRules",
    tsjs: "src/game/rules/general/RepairRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.RepairRules().readIni(makeMockIni("G", { RepairPercent: "30", RepairRate: "17" }));
        return {
          repairPercent: rules.repairPercent,
          repairRate: rules.repairRate,
          uRepairRate: rules.uRepairRate,
          iRepairStep: rules.iRepairStep,
        };
      },
    ],
  },
  {
    name: "game/rules/general/CrewRules",
    tsjs: "src/game/rules/general/CrewRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.CrewRules().readIni(
          makeMockIni("G", { AlliedCrew: "GI", SovietCrew: "CONSCRIPT", CrewEscape: "0.5", SurvivorRate: "30" }),
        );
        return {
          alliedCrew: rules.alliedCrew,
          sovietCrew: rules.sovietCrew,
          crewEscape: rules.crewEscape,
          survivorRate: rules.survivorRate,
          thirdCrew: rules.thirdCrew === undefined ? "none" : rules.thirdCrew,
        };
      },
    ],
  },
  {
    name: "game/rules/general/PrismRules",
    tsjs: "src/game/rules/general/PrismRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.PrismRules().readIni(
          makeMockIni("G", { PrismType: "GAPRIS", PrismSupportMax: "3", PrismSupportModifier: "1.5" }),
        );
        return { type: rules.type, supportMax: rules.supportMax, modifier: rules.supportModifier };
      },
    ],
  },
  {
    name: "game/rules/general/ThreatRules",
    tsjs: "src/game/rules/general/ThreatRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.ThreatRules().readIni(makeMockIni("G", { MyEffectivenessCoefficientDefault: "5" }));
        return [rules.myEffectivenessCoefficientDefault, rules.targetStrengthCoefficientDefault];
      },
    ],
  },
  {
    name: "game/rules/general/HoverRules",
    tsjs: "src/game/rules/general/HoverRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.HoverRules().readIni(
          makeMockIni("G", { HoverHeight: "60", HoverBob: "3", HoverBoost: "20" }),
        );
        return [rules.height, rules.bob, rules.boost, rules.brake];
      },
    ],
  },
  {
    name: "game/rules/general/LightningStormRules",
    tsjs: "src/game/rules/general/LightningStormRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.LightningStormRules().readIni(
          makeMockIni("G", { LightningDamage: "250", LightningWarhead: "LBOLT", LightningStormDuration: "180" }),
        );
        return [rules.damage, rules.warhead, rules.duration, rules.cellSpread];
      },
    ],
  },
  {
    name: "game/rules/general/MissileRules",
    tsjs: "src/game/rules/general/MissileRules.ts.js",
    probes: [(ns) => Object.keys(new ns.MissileRules()).length],
  },
  {
    name: "game/rules/general/V3RocketRules",
    tsjs: "src/game/rules/general/V3RocketRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.V3RocketRules().readIni(
          makeMockIni("G", { V3RocketType: "V3", V3RocketDamage: "200", V3RocketLazyCurve: "yes" }),
        );
        return {
          isMissile: rules instanceof ns.MissileRules,
          type: rules.type,
          damage: rules.damage,
          lazyCurve: rules.lazyCurve,
          eliteDamage: rules.eliteDamage,
        };
      },
    ],
  },
  {
    name: "game/rules/general/DMislRules",
    tsjs: "src/game/rules/general/DMislRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.DMislRules().readIni(makeMockIni("G", { DMislType: "DM", DMislPauseFrames: "5" }));
        return { type: rules.type, pauseFrames: rules.pauseFrames, isMissile: rules instanceof ns.MissileRules };
      },
    ],
  },
  {
    name: "game/rules/general/VeteranRules",
    tsjs: "src/game/rules/general/VeteranRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.VeteranRules().readIni(
          makeMockIni("G", { VeteranSight: "0.5", InitialVeteran: "yes" }),
        );
        return {
          sightFloored: rules.veteranSight, // max(1, 0.5) = 1
          ratio: rules.veteranRatio,
          cap: rules.veteranCap,
          initialVeteran: rules.initialVeteran,
        };
      },
    ],
  },
  {
    name: "game/rules/general/CMislRules",
    tsjs: "src/game/rules/general/CMislRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.CMislRules().readIni(
          makeMockIni("G", { CMislType: "CM", CMislRaiseRate: "12", CMislAltitude: "3000" }),
        );
        return { type: rules.type, raiseRate: rules.raiseRate, altitude: rules.altitude };
      },
    ],
  },
  {
    name: "game/rules/general/RadarRules",
    tsjs: "src/game/rules/general/RadarRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.RadarRules().readIni(
          makeMockIni("G", {
            RadarEventSuppressionDistances: "10,20,30,40,50,60",
            RadarEventVisibilityDurations: "1,2,3,4,5,6",
            RadarEventDurations: "10,20,30,40,50,60",
            FlashFrameTime: "3",
          }),
        );
        const out = [
          rules.eventSuppressionDistances.length,
          rules.getEventSuppresionDistance(ns.RadarEventType.BaseUnderAttack),
          rules.getEventVisibilityDuration(ns.RadarEventType.DropZone),
          rules.getEventDuration(ns.RadarEventType.EnemyObjectSensed),
          rules.flashFrameTime,
        ];
        try {
          rules.getEventDuration(99);
          out.push("no-throw");
        } catch (e) {
          out.push(e.constructor.name + ": " + e.message);
        }
        return out;
      },
    ],
  },
  {
    name: "game/rules/general/ParadropRules",
    tsjs: "src/game/rules/general/ParadropRules.ts.js",
    probes: [
      // 编队过滤（数量>0）+ 阵营映射 + 必填运载机
      (ns) => {
        const rules = new ns.ParadropRules().readIni(
          makeMockIni("G", {
            AllyParaDropInf: "GI,GGI,SPY",
            AllyParaDropNum: "6,3,0",
            AmerParaDropInf: "AMER",
            AmerParaDropNum: "8",
            SovParaDropInf: "SHK",
            SovParaDropNum: "5",
            YuriParaDropInf: "INIT",
            YuriParaDropNum: "4",
            ParadropPlane: "PDPLANE",
            ParadropRadius: "6",
          }),
        );
        return {
          ally: rules.allyParaDrop,
          amer: rules.amerParaDrop.length,
          byGdi: rules.getParadropSquads(ns.SideType.GDI)[0].inf,
          byNod: rules.getParadropSquads(ns.SideType.Nod)[0].inf,
          byThird: rules.getParadropSquads(ns.SideType.ThirdSide)[0].inf,
          plane: rules.paradropPlane,
          radius: rules.paradropRadius,
        };
      },
      (ns) => {
        const out = [];
        try {
          new ns.ParadropRules().readIni(
            makeMockIni("G", { AllyParaDropInf: "GI", AllyParaDropNum: "1,2", ParadropPlane: "P" }),
          );
          out.push("no-throw");
        } catch (e) {
          out.push(e.constructor.name);
        }
        try {
          new ns.ParadropRules().readIni(makeMockIni("G", {}));
          out.push("no-throw");
        } catch (e) {
          out.push(e.message);
        }
        try {
          const rules = new ns.ParadropRules().readIni(
            makeMockIni("G", {
              AllyParaDropInf: "GI",
              AllyParaDropNum: "1",
              AmerParaDropInf: "AM",
              AmerParaDropNum: "1",
              SovParaDropInf: "SH",
              SovParaDropNum: "1",
              YuriParaDropInf: "IN",
              YuriParaDropNum: "1",
              ParadropPlane: "P",
            }),
          );
          rules.getParadropSquads(99);
          out.push("no-throw");
        } catch (e) {
          out.push(e.message);
        }
        return out;
      },
    ],
  },
  {
    name: "game/rules/GeneralRules",
    tsjs: "src/game/rules/GeneralRules.ts.js",
    probes: [
      // 完整 [General] 段：缺省值、clamp、min、子规则接线、导弹分发
      //（注意原实现 readIni 无返回值：先实例化再单独调用）
      (ns) => {
        const rules = new ns.GeneralRules();
        rules.readIni(
          makeMockIni("G", {
            RefundPercent: "150", // clamp → 1
            RevealTriggerRadius: "99", // min(10, 99) → 10
            SelfHealInfantryFrames: "80",
            ParadropPlane: "PDPLANE",
            AllyParaDropInf: "E1,E2",
            AllyParaDropNum: "3,0",
            PrismType: "GAPRIS",
            RadarEventDurations: "10,20,30,40,50,60",
            V3RocketType: "V3",
            DMislType: "DM",
            CMislType: "CM",
            PrerequisitePower: "GAPOWR",
            PrerequisiteFactory: "GACNST",
            PrerequisiteBarracks: "GAPILE",
            PrerequisiteRadar: "GARADR",
            PrerequisiteTech: "GATECH",
            PrerequisiteProc: "GAREFN",
          }),
        );
        return {
          refundClamped: rules.refundPercent,
          revealClamped: rules.revealTriggerRadius,
          selfHealDefault: rules.selfHealInfantryFrames,
          allySquad: rules.paradrop.allyParaDrop,
          radarDurations: rules.radar.eventDurations.length,
          veteranRatio: rules.veteran.veteranRatio,
          missileV3: rules.getMissileRules("V3") === rules.v3Rocket,
          missileUnknown: (() => {
            try {
              rules.getMissileRules("X");
              return "no-throw";
            } catch (e) {
              return e.message;
            }
          })(),
          prereqPower: rules.prereqCategories.get(ns.PrereqCategory ? 0 : 0),
          chronoTrigger: rules.chronoTrigger,
        };
      },
      // 缺前置表 → 报错（逐字消息）
      (ns) => {
        try {
          new ns.GeneralRules().readIni(
            makeMockIni("G", {
              PrerequisitePower: "A",
              PrerequisiteFactory: "B",
              PrerequisiteBarracks: "C",
              PrerequisiteRadar: "D",
              PrerequisiteProc: "F",
            }),
          );
          return "no-throw";
        } catch (e) {
          return e.message;
        }
      },
    ],
  },
  {
    name: "game/type/SuperWeaponType",
    tsjs: "src/game/type/SuperWeaponType.ts.js",
    probes: [
      (ns) => ns.SuperWeaponType.IronCurtain,
      (ns) => ns.SuperWeaponType.LightningStorm,
      (ns) => ns.SuperWeaponType.GeneticMutator, // =9
      (ns) => ns.SuperWeaponType.GeneticConverter, // =9（别名）
      (ns) => Object.keys(ns.SuperWeaponType).length,
    ],
  },
  {
    name: "game/rules/CountryRules",
    tsjs: "src/game/rules/CountryRules.ts.js",
    probes: [
      // 正常解析 + 默认 Tooltip 回落
      (ns) => {
        const ini = {
          name: "Americans",
          getString: (k) => ({ Side: "GDI", UIName: "NAME" }[k] ?? ""),
          getBool: (k) => k === "Multiplay",
          getArray: () => [],
        };
        const country = new ns.CountryRules(0);
        country.readIni(ini);
        return {
          id: country.id,
          name: country.name,
          side: country.side,
          uiName: country.uiName,
          uiTooltip: country.uiTooltip,
          playable: country.multiplay,
        };
      },
      // Side 缺失 / 未登记阵营 → 报错（消息逐字）
      (ns) => {
        const mk = (side) => ({
          name: "X",
          getString: (k) => (k === "Side" ? side : ""),
          getBool: () => false,
          getArray: () => [],
        });
        const out = [];
        try {
          new ns.CountryRules(0).readIni(mk(""));
          out.push("no-throw");
        } catch (e) {
          out.push(e.message);
        }
        try {
          new ns.CountryRules(0).readIni(mk("Mars"));
          out.push("no-throw");
        } catch (e) {
          out.push(e.message);
        }
        return out;
      },
    ],
  },
  {
    name: "game/rules/MpDialogSettings",
    tsjs: "src/game/rules/MpDialogSettings.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.MpDialogSettings().readIni(
          makeMockIni("G", { MinMoney: "10", Money: "5000", Crates: "yes", MCVRedeploys: "yes", ShortGame: "yes" }),
        );
        return {
          minMoney: rules.minMoney,
          money: rules.money,
          crates: rules.crates,
          mcvRedeploys: rules.mcvRedeploys,
          shortGame: rules.shortGame,
          alliesAllowed: rules.alliesAllowed, // 缺省 true
        };
      },
    ],
  },
  {
    name: "game/rules/mpAllowedColors",
    tsjs: "src/game/rules/mpAllowedColors.ts.js",
    probes: [(ns) => ns.mpAllowedColors.length, (ns) => ns.mpAllowedColors[0], (ns) => ns.mpAllowedColors.includes("Purple")],
  },
  {
    name: "util/typeGuard",
    tsjs: "src/util/typeGuard.ts.js",
    probes: [
      (ns) => ns.isNotNullOrUndefined(null),
      (ns) => ns.isNotNullOrUndefined(undefined),
      (ns) => ns.isNotNullOrUndefined(0),
      (ns) => [1, null, 2].filter(ns.isNotNullOrUndefined),
    ],
  },
  {
    name: "game/rules/TiberiumRules",
    tsjs: "src/game/rules/TiberiumRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.TiberiumRules().readIni(makeMockIni("G", { Value: "50" }));
        return { value: rules.value };
      },
    ],
  },
  {
    name: "game/rules/AiRules",
    tsjs: "src/game/rules/AiRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.AiRules().readIni(
          makeMockIni("G", { BuildPower: "GAPOWR", BuildRefinery: "GAREFN", BuildTech: "GATECH", TiberiumNearScan: "9" }),
        );
        return {
          buildPower: rules.buildPower,
          buildRefinery: rules.buildRefinery,
          farScan: rules.tiberiumFarScan, // 缺省 50
          nearScan: rules.tiberiumNearScan,
          slaveMiner: rules.aislaveMinerNumber,
        };
      },
    ],
  },
  {
    name: "game/rules/LandRules",
    tsjs: "src/game/rules/LandRules.ts.js",
    probes: [
      // 段内凡 SpeedType 名的键都登记为通行系数；Foot 在 Track=0 时禁行
      (ns) => {
        const rules = new ns.LandRules();
        rules.readIni({
          getBool: () => false,
          getNumber: (k) => Number(k) || 0,
          entries: new Map([
            ["Buildable", "yes"],
            ["Foot", "100"],
            ["Track", "0"],
            ["Wheel", "80"],
            ["Water", "120"],
            ["NotASpeedType", "999"],
          ]),
        });
        return {
          footBlockedByTrackZero: rules.getSpeedModifier(ns.SpeedType.Foot),
          wheel: rules.getSpeedModifier(ns.SpeedType.Wheel),
          water: rules.getSpeedModifier(ns.SpeedType.Float), // 未登记 → 1
          trackNonZeroCase: (() => {
            rules.speedModifiers.set(ns.SpeedType.Track, 50);
            return rules.getSpeedModifier(ns.SpeedType.Foot);
          })(),
        };
      },
    ],
  },
  {
    name: "game/rules/RadiationRules",
    tsjs: "src/game/rules/RadiationRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.RadiationRules().readIni(
          makeMockIni("G", { RadDurationMultiple: "100", RadLevelMax: "2", RadColor: "0,255,0" }),
        );
        return {
          duration: rules.radDurationMultiple,
          levelMax: rules.radLevelMax,
          color: rules.radColor,
          warhead: rules.radSiteWarhead === undefined ? "none" : rules.radSiteWarhead,
        };
      },
    ],
  },
  {
    name: "game/rules/ElevationModelRules",
    tsjs: "src/game/rules/ElevationModelRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.ElevationModelRules().readIni(
          makeMockIni("G", { ElevationIncrement: "3", ElevationIncrementBonus: "2", ElevationBonusCap: "4" }),
        );
        // 加成 = min(cap, floor((攻高-守高)/increment)) × bonus；低于等于 0
        return [
          rules.getBonus(6, 3), // (6-3)/3=1 → 2
          rules.getBonus(12, 3), // 3 层 → 6
          rules.getBonus(30, 3), // 9 层 → 18 但 cap=4
          rules.getBonus(3, 3), // 平地 → 0
          rules.getBonus(1, 3),
        ];
      },
    ],
  },
  {
    name: "game/rules/CrateRules",
    tsjs: "src/game/rules/CrateRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.CrateRules().readIni(
          makeMockIni("G", {
            CrateMaximum: "20",
            CrateMinimum: "2",
            UnitCrateType: "HARV",
            WaterCrateImg: "WCRATE",
            FreeMCV: "yes",
          }),
        );
        return {
          crateMaximum: rules.crateMaximum,
          unitCrateType: rules.unitCrateType,
          unitCrateNoneCase: (() => {
            const r2 = new ns.CrateRules().readIni(makeMockIni("G", { UnitCrateType: "none" }));
            return r2.unitCrateType === undefined ? "none" : "set";
          })(),
          freeMCV: rules.freeMCV,
        };
      },
    ],
  },
  {
    name: "game/rules/SuperWeaponRules",
    tsjs: "src/game/rules/SuperWeaponRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.SuperWeaponRules().readIni(
          makeMockIni("G", {
            Type: "LightningStorm",
            RechargeTime: "420",
            SidebarImage: "SWIPW",
            WeaponType: "LBOLT",
            IsPowered: "no",
          }),
        );
        return {
          type: rules.type,
          rechargeTime: rules.rechargeTime,
          sidebarImage: rules.sidebarImage,
          weaponType: rules.weaponType,
          isPowered: rules.isPowered,
        };
      },
    ],
  },
  {
    name: "game/rules/PowerupsRules",
    tsjs: "src/game/rules/PowerupsRules.ts.js",
    probes: [
      (ns) => {
        const warnings = [];
        const ini = {
          entries: new Map([
            ["Armor", "40,CRATEANIM,yes"],
            ["Money", "25,CRATEANIM,no"],
            ["IonStorm", "10,X,yes"], // 未支持类型 → 告警跳过
            ["UnknownPower", "1,X,no"], // 未登记 → 告警跳过
          ]),
        };
        const origWarn = console.warn;
        console.warn = (msg) => warnings.push(msg);
        const rules = new ns.PowerupsRules().readIni(ini);
        console.warn = origWarn;
        return {
          count: rules.powerups.length,
          armor: rules.powerups[0],
          moneyWaterAllowed: rules.powerups[1].waterAllowed,
          warnings,
        };
      },
    ],
  },
  {
    name: "game/rules/ProjectileRules",
    tsjs: "src/game/rules/ProjectileRules.ts.js",
    probes: [
      // 继承 ObjectRules 通用键 + 弹体专属键 + ROT/Acceleration 换算
      (ns) => {
        const ini = {
          name: "Shell",
          getString: (k) => ({ ShrapnelWeapon: "SHRAP" }[k] ?? ""),
          getBool: (k, d) => ({ Arcing: true, Inviso: true, AA: true, AG: false, Vertical: false }[k] ?? d ?? false),
          getNumber: (k, d) => ({ ROT: "128", Acceleration: "0", Inaccurate: 5 }[k] ?? d ?? 0),
        };
        const rules = new ns.ProjectileRules(ns.ObjectType.Projectile, ini, -1);
        return {
          name: rules.name,
          arcing: rules.arcing,
          isAntiAir: rules.isAntiAir,
          isAntiGround: rules.isAntiGround, // 缺省 true
          rotDegs: rules.rot, // 128/256*360 = 180
          imageName: rules.imageName, // 基类回落段落名
        };
      },
    ],
  },
  {
    name: "game/rules/WarheadRules",
    tsjs: "src/game/rules/WarheadRules.ts.js",
    probes: [
      // verses 表按序填充 + 布尔标志 + 死亡方式枚举
      (ns) => {
        const ini = {
          name: "HE",
          getBool: (k, d) => ({ AffectsAllies: "yes", Temporal: true }[k] ?? d ?? false),
          getNumber: (k, d) => ({ CellSpread: "5", PercentAtMax: "0.7", ProneDamage: "0.4" }[k] ?? d ?? 0),
          getFixed: (k, d) => ({ ProneDamage: "0.4" }[k] ?? d ?? 0),
          getEnumNumeric: (k, enumObj, d) => (k === "InfDeath" ? 5 : d),
          getFixedArray: (k) => (k === "Verses" ? [1, 0.8, 0.6] : []),
          getArray: () => [],
        };
        const warheadRules = new ns.WarheadRules(ini);
        return {
          name: warheadRules.name,
          affectsAllies: warheadRules.affectsAllies,
          temporal: warheadRules.temporal,
          cellSpread: warheadRules.cellSpread,
          percentAtMax: warheadRules.percentAtMax,
          infDeath: warheadRules.infDeath,
          verses: [warheadRules.verses.get(0), warheadRules.verses.get(1), warheadRules.verses.get(2)],
        };
      },
    ],
  },
  {
    name: "game/rules/ObjectRulesFactory",
    tsjs: "src/game/rules/ObjectRulesFactory.ts.js",
    probes: [
      (ns) => {
        const mkIni = (name) => ({ name, getString: () => "", getBool: (k, d) => d, getNumber: () => 0 });
        const general = { unitsUnsellable: false, returnStructures: false };
        const factory = ns.ObjectRulesFactory;
        const techno = factory.create(ns.ObjectType.Infantry, mkIni("E1"), null, general);
        const overlay = factory.create(ns.ObjectType.Overlay, mkIni("GASMOKE"), null);
        const fallback = factory.create(ns.ObjectType.VoxelAnim, mkIni("X"), null);
        return {
          techno: techno.constructor.name,
          technoType: techno.type,
          overlay: overlay.constructor.name,
          fallback: fallback.constructor.name,
        };
      },
    ],
  },
  {
    name: "game/rules/MpDialogSettings",
    tsjs: "src/game/rules/MpDialogSettings.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.MpDialogSettings().readIni(
          makeMockIni("G", { MinMoney: "10", Money: "5000", Crates: "yes", MCVRedeploys: "yes", ShortGame: "yes" }),
        );
        return {
          minMoney: rules.minMoney,
          money: rules.money,
          crates: rules.crates,
          mcvRedeploys: rules.mcvRedeploys,
          shortGame: rules.shortGame,
          alliesAllowed: rules.alliesAllowed, // 缺省 true
        };
      },
    ],
  },
  {
    name: "game/rules/WeaponRules",
    tsjs: "src/game/rules/WeaponRules.ts.js",
    probes: [
      // 机械生成的键包：抽验普通键 / 数组带正则拆分与缺省 / ROT 换算 / 弹头引用
      (ns) => {
        const rules = new ns.WeaponRules(makeMockIni("M1", {
          Burst: "2",
          Damage: "110",
          DecloakToFire: "no",
          FireWhileMoving: "no",
          "Wave.Color": "10,20,30",
          MagnaBeamWidth: "12.5",
          IsLaser: "yes",
          RadLevel: "3",
          Range: "200",
          ROF: "50",
          Speed: "100",
          Projectile: "Shell",
          Warhead: "HE",
          Report: "one,two",
        }));
        return {
          name: rules.name,
          burst: rules.burst,
          damage: rules.damage,
          decloakToFire: rules.decloakToFire, // 缺省 true，显式 no → false
          fireWhileMoving: rules.fireWhileMoving, // 显式 no → false
          waveColor: rules.waveColor,
          magnaBeamWidth: rules.magnaBeamWidth, // 缺省 10，显式 12.5
          isLaser: rules.isLaser,
          radLevel: rules.radLevel,
          range: rules.range,
          rof: rules.rof,
          iniSpeed: rules.iniSpeed,
          speed: rules.speed, // iniSpeedToLeptonsPerTick(100, 100) = 256
          projectile: rules.projectile,
          warhead: rules.warhead,
          report: rules.report,
        };
      },
    ],
  },
  {
    name: "game/rules/AudioVisualRules",
    tsjs: "src/game/rules/AudioVisualRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.AudioVisualRules(makeMockIni("AV", {
          AmbientChangeRate: "5",
          ConditionRed: "75",
          ConditionYellow: "50",
          IdleActionFrequency: "2", // ×60 → 120
          Gravity: "0.3",
          FireNames: "A.B,C", // 按点/逗号拆分，过滤空段
        }));
        return {
          ambientChangeRate: rules.ambientChangeRate,
          conditionRed: rules.conditionRed,
          conditionYellow: rules.conditionYellow,
          idleActionFrequency: rules.idleActionFrequency,
          gravity: rules.gravity,
          fireNames: rules.fireNames,
        };
      },
    ],
  },
  {
    name: "game/rules/CombatDamageRules",
    tsjs: "src/game/rules/CombatDamageRules.ts.js",
    probes: [
      (ns) => {
        const rules = new ns.CombatDamageRules(
          makeMockIni("G", {
            BallisticScatter: "20",
            C4Warhead: "C4WH",
            CrushWarhead: "CRUSH2", // 缺省 "Crush"，显式覆盖
            BerserkROFMultiplier: "0.4",
            SplashList: "s1,s2",
          }),
        );
        return {
          ballisticScatter: rules.ballisticScatter,
          crushWarhead: rules.crushWarhead,
          c4Warhead: rules.c4Warhead,
          berserkROF: rules.berserkROFMultiplier,
          bunkerROF: rules.bunkerROFMultiplier, // 缺省 1
          splashList: rules.splashList,
        };
      },
    ],
  },
  {
    name: "game/rules/Rules",
    tsjs: "src/game/rules/Rules.ts.js",
    probes: [
      // 全链路 init：最小 rulesmd.ini → 类型表/规则表/武器清单/全局参数
      (ns) => {
        const sections = {
          AudioVisual: { ConditionRed: "75" },
          CombatDamage: { SplashList: "s1", BerserkROFMultiplier: "0.4", ForceShieldRadius: "8" },
          General: {
            ForceShieldRadius: "9", // 从 [General] 搬到 [CombatDamage]
            PrerequisitePower: "GAPOWR",
            PrerequisiteFactory: "GACNST",
            PrerequisiteBarracks: "GAPILE",
            PrerequisiteRadar: "GARADR",
            PrerequisiteTech: "GATECH",
            PrerequisiteProc: "GAREFN",
            ParadropPlane: "PDPLANE",
            DropPodWeapon: "PODWH",
            AllyParaDropInf: "GI",
            AllyParaDropNum: "6",
            AmerParaDropInf: "AMER",
            AmerParaDropNum: "8",
            SovParaDropInf: "SHK",
            SovParaDropNum: "5",
            YuriParaDropInf: "INIT",
            YuriParaDropNum: "4",
            V3RocketType: "V3",
            DMislType: "DM",
            CMislType: "CM",
            PrismType: "GAPRIS",
          },
          AI: {},
          CrateRules: {},
          ElevationModel: { ElevationIncrement: "3" },
          MultiplayerDialogSettings: { Money: "5000" },
          BuildingTypes: { "0": "GACNST" },
          InfantryTypes: { "0": "E1" },
          VehicleTypes: { "0": "HTK" },
          AircraftTypes: {},
          TerrainTypes: {},
          SmudgeTypes: {},
          Animations: {},
          VoxelAnims: {},
          OverlayTypes: { "0": "GAWALL" },
          Colors: { Gold: "30,255,255" },
          Countries: { "0": "Americans" },
          Warheads: { "0": "HE" },
          Tiberiums: { "0": "RIPPARIUS" },
          SuperWeaponTypes: { "0": "WSCHRPS" },
          Powerups: { Armor: "40,CRATEANIM,yes" },
          Particles: { "0": "VirusCloud1" },
          // 对象段
          GACNST: { Strength: "1000", Image: "GACNST" },
          E1: { Strength: "125", Primary: "M1Carbine", ElitePrimary: "M1CarbineE", Warhead: "WH" },
          HTK: { Strength: "400", Primary: "TANKSHELL" },
          GAWALL: { Strength: "300", Wall: "yes" },
          Americans: { Side: "GDI", UIName: "NAME:Americans" },
          HE: { CellSpread: "2" },
          RIPPARIUS: { Value: "50" },
          WSCHRPS: { Type: "0", RechargeTime: "7", WeaponType: "PODWH" },
          VirusCloud1: { Damage: "60" },
          Rock: { Foot: "100" },
        };
        const ini = makeRulesIni(sections);
        const rules = new ns.Rules(ini);
        return {
          buildings: rules.buildingTypes.size,
          infantry: rules.infantryTypes.size,
          hasWall: rules.hasObject("GAWALL", ns.ObjectType.Overlay),
          wallId: rules.getOverlayId("GAWALL"),
          countrySide: rules.getCountry("Americans").side,
          mpCountries: rules.getMultiplayerCountries().length,
          weaponList: rules.weaponTypes.size,
          nukeInList: [...rules.weaponTypes.values()].includes(ns.Weapon.NUKE_PAYLOAD_NAME),
          dropPodInList: [...rules.weaponTypes.values()].includes("PODWH"),
          missileV3: rules.general.getMissileRules("V3") === rules.general.v3Rocket,
          bunkerPropagated: ns.Weapon.berserkROFMultiplier, // CombatDamage 写入 Weapon 静态字段
          fsRadiusFromGeneral: rules.combatDamage.forceShieldRadius, // [General] 搬运 → 9
          particles: rules.particleTypes.size,
          goldColor: rules.colors.get("Gold") !== undefined,
          landRock: rules.getLandRules(ns.LandType ? 6 : 6).buildable === false, // Cliff → Rock 段
          superWeapon: rules.getSuperWeapon("WSCHRPS").rechargeTime,
        };
      },
      // 缓存语义：getWeapon/getWarhead/getProjectile 同名返回同一实例
      (ns) => {
        const sections = {
          AudioVisual: {},
          CombatDamage: {},
          General: {
            PrerequisitePower: "A", PrerequisiteFactory: "B", PrerequisiteBarracks: "C",
            PrerequisiteRadar: "D", PrerequisiteTech: "E", PrerequisiteProc: "F",
            ParadropPlane: "P", V3RocketType: "V3", DMislType: "DM", CMislType: "CM", PrismType: "GAPRIS",
          },
          AI: {}, CrateRules: {}, ElevationModel: {}, MultiplayerDialogSettings: {},
          BuildingTypes: {}, InfantryTypes: {}, VehicleTypes: {}, AircraftTypes: {},
          TerrainTypes: {}, SmudgeTypes: {}, Animations: {}, VoxelAnims: {}, OverlayTypes: {},
          Colors: {}, Countries: {}, Warheads: {}, Tiberiums: {}, SuperWeaponTypes: {},
          M1: { Damage: "10" },
          he: { CellSpread: "1" }, // 小写段 → 大写查询也能命中（ordered 回退）
          Shell: { Level: "yes" },
        };
        const rules = new ns.Rules(makeRulesIni(sections));
        const w1 = rules.getWeapon("M1");
        const w2 = rules.getWeapon("M1");
        const wh1 = rules.getWarhead("HE");
        const wh2 = rules.getWarhead("he"); // 大小写回退
        const p1 = rules.getProjectile("Shell");
        const p2 = rules.getProjectile("shell");
        return {
          weaponCached: w1 === w2,
          warheadCachedLower: wh1 === wh2,
          projectileCached: p1 === p2,
        };
      },
      // 缺段报错：Missing [AudioVisual]
      (ns) => {
        try {
          new ns.Rules(makeRulesIni({ General: {} }));
          return "no-throw";
        } catch (e) {
          return e.message;
        }
      },
    ],
  },
  {
    name: "game/trait/interface/NotifyPower",
    tsjs: "src/game/trait/interface/NotifyPower.ts.js",
    probes: [
      (ns) => typeof ns.NotifyPower.onPowerLow,
      (ns) => typeof ns.NotifyPower.onPowerRestore,
      (ns) => typeof ns.NotifyPower.onPowerChange,
      (ns) => Object.keys(ns.NotifyPower).length,
    ],
  },
  {
    name: "game/event/InsufficientFundsEvent",
    tsjs: "src/game/event/InsufficientFundsEvent.ts.js",
    probes: [
      (ns) => {
        const player = { tag: "P1" };
        const event = new ns.InsufficientFundsEvent(player);
        return { sameTarget: event.target === player, type: event.type };
      },
    ],
  },
  {
    name: "game/event/PowerLowEvent",
    tsjs: "src/game/event/PowerLowEvent.ts.js",
    probes: [
      (ns) => {
        const player = { tag: "P1" };
        const event = new ns.PowerLowEvent(player);
        return { sameTarget: event.target === player, type: event.type };
      },
    ],
  },
  {
    name: "game/event/PowerRestoreEvent",
    tsjs: "src/game/event/PowerRestoreEvent.ts.js",
    probes: [
      (ns) => {
        const player = { tag: "P1" };
        const event = new ns.PowerRestoreEvent(player);
        return { sameTarget: event.target === player, type: event.type };
      },
    ],
  },
  {
    name: "game/event/PowerChangeEvent",
    tsjs: "src/game/event/PowerChangeEvent.ts.js",
    probes: [
      (ns) => {
        const player = { tag: "P1" };
        const event = new ns.PowerChangeEvent(player, 200, 300);
        return { sameTarget: event.target === player, power: event.power, drain: event.drain, type: event.type };
      },
    ],
  },
  {
    name: "game/player/trait/PowerTrait",
    tsjs: "src/game/player/trait/PowerTrait.ts.js",
    probes: [
      // 发电/耗电 + 低电力判定 + 事件
      (ns) => {
        const player = { name: "P1" };
        const power = new ns.PowerTrait(player);
        const powerPlant = {
          rules: { power: 100 },
          healthTrait: { health: 100 },
          drainedBy: null,
        };
        const warFactory = { rules: { power: -50 }, healthTrait: { health: 100 }, drainedBy: null };
        const dispatched = [];
        const world = {
          traits: { filter: () => [] },
          events: { dispatch: (e) => dispatched.push(e.constructor.name + ":" + (e.power ?? e.type ?? "")) },
        };
        power.updateFrom(powerPlant, "add", world);
        power.updateFrom(warFactory, "add", world);
        const afterAdd = { power: power.power, drain: power.drain, level: power.level };
        power.powerPlant = powerPlant;
        powerPlant.healthTrait.health = 50;
        power.updateFrom(powerPlant, "update", world);
        const afterDamage = { power: power.power, level: power.level };
        return { afterAdd, afterDamage, dispatched };
      },
      // 黑屏：setBlackoutFor + updateBlackout 倒计时
      (ns) => {
        const player = { name: "P1" };
        const power = new ns.PowerTrait(player);
        const world = { traits: { filter: () => [] }, events: { dispatch: () => {} } };
        power.setBlackoutFor(3, world);
        const initial = power.getBlackoutDuration();
        power.updateBlackout(world);
        power.updateBlackout(world);
        power.updateBlackout(world);
        return { initial, afterTicks: power.blackoutFrames, override: power.drainPowerOverride };
      },
      // 被圆盘吸取（drainedBy）→ 贡献归零
      (ns) => {
        const player = { name: "P1" };
        const power = new ns.PowerTrait(player);
        const plant = { rules: { power: 100 }, healthTrait: { health: 100 }, drainedBy: { thief: true } };
        const world = { traits: { filter: () => [] }, events: { dispatch: () => {} } };
        power.updateFrom(plant, "add", world);
        return { power: power.power, isLow: power.isLowPower() };
      },
    ],
  },
  {
    name: "game/player/production/ProductionQueue",
    tsjs: "src/game/player/production/ProductionQueue.ts.js",
    probes: [
      // push/pop/shift/insertAfterFirst + maxSize 收缩 + 状态机
      (ns) => {
        const rulesA = { name: "A" };
        const rulesB = { name: "B" };
        const queue = new ns.ProductionQueue(3, 10, 20);
        queue.push(rulesA, 3, 100);
        queue.push(rulesB, 2, 50);
        const afterPush = { size: queue.size, status: queue.status, items: queue.items.map((i) => [i.rules.name, i.quantity]) };
        queue.insertAfterFirst(rulesB, 1, 50);
        const afterInsert = { items: queue.items.map((i) => [i.rules.name, i.quantity]) };
        queue.pop(rulesB, 1);
        const afterPop = { items: queue.items.map((i) => [i.rules.name, i.quantity]) };
        queue.shift(rulesA, 3);
        const afterShift = { items: queue.items.map((i) => [i.rules.name, i.quantity]), status: queue.status };
        queue.maxSize = 1;
        const afterShrink = { items: queue.items.map((i) => [i.rules.name, i.quantity]), status: queue.status };
        return { afterPush, afterInsert, afterPop, afterShift, afterShrink };
      },
      // 空队列 pop 报错
      (ns) => {
        const queue = new ns.ProductionQueue(0, 5, 5);
        try {
          queue.pop({ name: "X" }, 1);
          return "no-throw";
        } catch (e) {
          return e.message.slice(0, 30);
        }
      },
    ],
  },
  {
    name: "game/player/production/Production",
    tsjs: "src/game/player/production/Production.ts.js",
    probes: [
      // factory + 队列类型映射 + 前置校验 + Secret Lab 授予
      (ns) => {
        const player = {
          name: "P1",
          isAi: false,
          buildings: new Set(),
          country: { name: "Americans" },
        };
        // 模拟 buildings 为可迭代 Set
        player.buildings = {
          _items: [],
          [Symbol.iterator]: function () { return this._items[Symbol.iterator](); },
          get size() { return this._items.length; },
          add(b) { this._items.push(b); },
          delete(b) { this._items = this._items.filter((x) => x !== b); },
          forEach(fn) { this._items.forEach(fn); },
          map(fn) { return this._items.map(fn); },
        };
        const rules = {
          mpDialogSettings: { techLevel: 10 },
          general: {
            maximumQueuedObjects: 30,
            prereqCategories: new ns.Map ? new Map() : null,
          },
          getSuperWeapon: () => ({ disableableFromShell: false, type: 0 }),
        };
        rules.general.prereqCategories = new Map();
        const gameOpts = { superWeapons: true };
        const production = ns.Production.factory(player, rules, gameOpts, []);
        const queueTypes = production.getAllQueues().map((q) => q.type);
        return {
          queueTypes,
          structuresSize: production.getQueue(ns.QueueType ? ns.QueueType.Structures : 0).maxSize,
          infantrySize: production.getQueue(ns.QueueType ? ns.QueueType.Infantry : 2).maxSize,
          aircraftSize: production.getQueue(ns.QueueType ? ns.QueueType.Aircrafts : 4).maxSize,
        };
      },
      // 队列类型映射
      (ns) => {
        const production = ns.Production ? new ns.Production(null, 10, {}, null, []) : null;
        return [
          production.getQueueTypeForObject({ type: ns.ObjectType.Infantry }),
          production.getQueueTypeForObject({ type: ns.ObjectType.Vehicle, naval: true }),
          production.getQueueTypeForObject({ type: ns.ObjectType.Building, buildCat: ns.BuildCat ? ns.BuildCat.Combat : 0 }),
          production.getFactoryTypeForQueueType(ns.QueueType ? ns.QueueType.Infantry : 2),
        ];
      },
    ],
  },
  {
    name: "game/trait/ProductionTrait",
    tsjs: "src/game/trait/ProductionTrait.ts.js",
    probes: [
      // 构造：availableObjectRules 仅收集有 Owner 的规则
      (ns) => {
        const rules = {
          general: { buildSpeed: 0.5, multipleFactory: 1, wallBuildSpeedCoefficient: 2, lowPowerPenaltyModifier: 1, minLowPowerProductionSpeed: 0.5, maxLowPowerProductionSpeed: 1 },
          buildingRules: new Map([["GACNST", { owner: ["Americans"], name: "GACNST" }]]),
          infantryRules: new Map([["E1", { owner: ["Americans"], name: "E1" }]]),
          vehicleRules: new Map([["NOOWNER", { owner: [], name: "NOOWNER" }]]),
          aircraftRules: new Map(),
        };
        const trait = new ns.ProductionTrait(rules, { value: false });
        return { available: trait.availableObjectRules.size, baseBuildSpeed: trait.baseBuildSpeed > 0 };
      },
      // 低电力建造速度公式
      (ns) => {
        const rules = {
          general: { buildSpeed: 0.5, multipleFactory: 1, wallBuildSpeedCoefficient: 2, lowPowerPenaltyModifier: 1, minLowPowerProductionSpeed: 0.5, maxLowPowerProductionSpeed: 1 },
          buildingRules: new Map(), infantryRules: new Map(), vehicleRules: new Map(), aircraftRules: new Map(),
        };
        const trait = new ns.ProductionTrait(rules, { value: false });
        return [
          trait.computeLowPowerBuildSpeedModifier(100, 100), // 满电力 → 1
          trait.computeLowPowerBuildSpeedModifier(25, 100), // 25% → 大幅减速
          trait.computeLowPowerBuildSpeedModifier(0, 100), // 零电力 → min
        ];
      },
    ],
  },
  {
    name: "game/gameobject/task/system/TaskStatus",
    tsjs: "src/game/gameobject/task/system/TaskStatus.ts.js",
    probes: [
      (ns) => [ns.TaskStatus.NotStarted, ns.TaskStatus.Finished, ns.TaskStatus.Cancelled],
      (ns) => Object.keys(ns.TaskStatus).length,
    ],
  },
  {
    name: "game/gameobject/task/system/Task",
    tsjs: "src/game/gameobject/task/system/Task.ts.js",
    probes: [
      (ns) => {
        const task = new ns.Task();
        const initial = { status: task.status, cancellable: task.cancellable, blocking: task.blocking };
        const chained = task.setCancellable(false).setBlocking(false);
        const afterSet = { cancellable: chained.cancellable, blocking: chained.blocking };
        chained.onStart = undefined;
        task.cancel(); // NotStarted → Cancelled
        return { initial, afterSet, statusAfterCancel: task.status, isRunning: task.isRunning() };
      },
    ],
  },
  {
    name: "game/gameobject/task/system/CallbackTask",
    tsjs: "src/game/gameobject/task/system/CallbackTask.ts.js",
    probes: [
      (ns) => {
        let called = 0;
        const task = new ns.CallbackTask(() => called++);
        const firstTick = task.onTick({}); // 回调 + 返回 true（完成）
        return { called, firstTick };
      },
    ],
  },
  {
    name: "game/gameobject/task/system/WaitTicksTask",
    tsjs: "src/game/gameobject/task/system/WaitTicksTask.ts.js",
    probes: [
      (ns) => {
        const task = new ns.WaitTicksTask(3);
        const ticks = [task.onTick({}), task.onTick({}), task.onTick({}), task.onTick({})];
        return ticks; // [false, false, false, true]
      },
    ],
  },
  {
    name: "game/gameobject/task/system/WaitMinutesTask",
    tsjs: "src/game/gameobject/task/system/WaitMinutesTask.ts.js",
    probes: [
      (ns) => {
        const task = new ns.WaitMinutesTask(1);
        return { ticks: task.ticks }; // 15×60 = 900
      },
    ],
  },
  {
    name: "util/geometry",
    tsjs: "src/util/geometry.ts.js",
    probes: [
      (ns) => [
        ns.pointEquals({ x: 1, y: 2 }, { x: 1, y: 2 }),
        ns.pointEquals(null, null),
        ns.rectIntersect({ x: 0, y: 0, width: 5, height: 5 }, { x: 3, y: 3, width: 5, height: 5 }),
        ns.rectIntersect({ x: 0, y: 0, width: 5, height: 5 }, { x: 6, y: 6, width: 5, height: 5 }),
        ns.rectEquals({ x: 1, y: 2, width: 3, height: 4 }, { x: 1, y: 2, width: 3, height: 4 }),
        ns.circleContainsPoint({ center: { x: 0, y: 0 }, radius: 5 }, { x: 3, y: 4 }),
        ns.circleContainsPoint({ center: { x: 0, y: 0 }, radius: 5 }, { x: 5, y: 5 }),
        ns.octileDistance({ x: 0, y: 0 }, { x: 3, y: 4 }),
      ],
    ],
  },
  {
    name: "util/disposable/CompositeDisposable",
    tsjs: "src/util/disposable/CompositeDisposable.ts.js",
    probes: [
      (ns) => {
        const disposed = [];
        const container = new ns.CompositeDisposable();
        container.add(() => disposed.push("fn"));
        container.add({ dispose: () => disposed.push("obj") });
        container.add({ destroy: () => disposed.push("destroy") });
        container.dispose();
        return { disposed, empty: container.disposables.size };
      },
    ],
  },
  {
    name: "game/gameobject/task/morph/PackBuildingTask",
    tsjs: "src/game/gameobject/task/morph/PackBuildingTask.ts.js",
    probes: [
      (ns) => {
        const statuses = [];
        const building = {
          buildStatus: ns.BuildStatus ? ns.BuildStatus.Ready : 1,
          rules: { wall: false },
          setBuildStatus(s) {
            statuses.push(s);
            this.buildStatus = s;
          },
        };
        const game = { rules: { general: { buildupTime: 5 } } };
        const task = new ns.PackBuildingTask(game);
        const tick1 = task.onTick(building); // 设 BuildDown + 挂 WaitMinutes
        const tick2 = task.onTick(building); // 已 BuildDown → true
        return { statuses, waitTaskPushed: task.children.length, tick1, tick2 };
      },
      // 墙类建筑：设 BuildDown 后立即完成（不挂等待任务）
      (ns) => {
        const statuses = [];
        const building = {
          buildStatus: ns.BuildStatus ? ns.BuildStatus.Ready : 1,
          rules: { wall: true },
          setBuildStatus(s) {
            statuses.push(s);
            this.buildStatus = s;
          },
        };
        const task = new ns.PackBuildingTask({ rules: { general: { buildupTime: 5 } } });
        const tick1 = task.onTick(building);
        return { statuses, tick1, children: task.children.length };
      },
    ],
  },
  {
    name: "game/ConstructionWorker",
    tsjs: "src/game/ConstructionWorker.ts.js",
    probes: [
      // getAdjacentRect + meetsAdjacency + isTileBuildable
      (ns, THREE) => {
        const buildings = new Set();
        buildings.add({
          tile: { rx: 5, ry: 5 },
          art: { foundation: { width: 2, height: 2 } },
          rules: { baseNormal: true, eligibleForAllyBuilding: false },
        });
        const player = { name: "P1", buildings };
        const rules = { getBuilding: () => ({ adjacent: 1 }), getLandRules: () => ({ buildable: true, getSpeedModifier: () => 1 }) };
        const map = {
          tiles: { getByMapCoords: (x, y) => ({ rx: x, ry: y, z: 0, rampType: 0, landType: 0 }) },
          tileOccupation: { onChange: { subscribe: () => {}, unsubscribe: () => {} }, calculateTilesForGameObject: () => [] },
          getObjectsOnTile: () => [],
          getGroundObjectsOnTile: () => [],
          isWithinBounds: () => true,
        };
        const game = {
          gameOpts: { buildOffAlly: false },
          alliances: { getAllies: () => [] },
          events: { subscribe: () => {} },
          mapShroudTrait: { getPlayerShroud: () => null },
          createObject: () => ({ name: "test" }),
          changeObjectOwner: () => {},
          spawnObject: () => {},
          unspawnObject: () => {},
          sellTrait: { computePurchaseValue: () => 0 },
        };
        const worker = new ns.ConstructionWorker(player, rules, {}, map, game);
        const rect = worker.getAdjacentRect({ rx: 5, ry: 5 }, { width: 2, height: 2 }, 1);
        const meets = worker.meetsAdjacency({ x: 5, y: 5, width: 2, height: 2 }, 1);
        const notMeets = worker.meetsAdjacency({ x: 50, y: 50, width: 2, height: 2 }, 1);
        const tileBuildable = worker.isTileBuildable({ landType: 0, rampType: 0 }, { waterBound: false });
        return { rect, meets, notMeets, tileBuildable };
      },
      // placeAt 非 normalize 路径：normalizePlacementTile 必须收到建筑名字符串
      (ns) => {
        const seen = [];
        const buildings = new Set();
        const player = { name: "P1", buildings };
        const buildingRules = { name: "GAPILE", wall: false, adjacent: 1, baseNormal: true };
        const rules = { getBuilding: () => buildingRules, getLandRules: () => ({ buildable: true, getSpeedModifier: () => 1 }) };
        const art = {
          getObject: (nameOrRules) => {
            seen.push(typeof nameOrRules === "string" ? nameOrRules : typeof nameOrRules);
            return { foundation: { width: 2, height: 2 }, foundationCenter: { x: 0, y: 0 } };
          },
        };
        const mapTile = { rx: 0, ry: 0, z: 0, rampType: 0, landType: 0 };
        const map = {
          tiles: { getByMapCoords: () => mapTile },
          tileOccupation: { onChange: { subscribe: () => {}, unsubscribe: () => {} }, calculateTilesForGameObject: () => [] },
          getObjectsOnTile: () => [],
          getGroundObjectsOnTile: () => [],
          isWithinBounds: () => true,
        };
        const game = {
          gameOpts: { buildOffAlly: false },
          alliances: { getAllies: () => [] },
          events: { subscribe: () => {} },
          mapShroudTrait: { getPlayerShroud: () => null },
          createObject: () => ({ name: "GAPILE" }),
          changeObjectOwner: () => {},
          spawnObject: () => {},
          unspawnObject: () => {},
          sellTrait: { computePurchaseValue: () => 0 },
        };
        const worker = new ns.ConstructionWorker(player, rules, art, map, game);
        worker.placeAt("GAPILE", { rx: 10, ry: 10 }, false);
        return { artNameTypes: seen };
      },
    ],
  },
  {
    name: "game/gameobject/task/system/TaskGroup",
    tsjs: "src/game/gameobject/task/system/TaskGroup.ts.js",
    probes: [
      (ns) => {
        const taskA = new (class extends ns.Task {})();
        const taskB = new (class extends ns.Task {})();
        const group = new ns.TaskGroup(taskA, taskB);
        return { children: group.children.length, isTask: group instanceof ns.Task };
      },
    ],
  },
  {
    name: "gui/screen/options/GeneralOptions",
    tsjs: "src/gui/screen/options/GeneralOptions.ts.js",
    probes: [(ns) => typeof ns.GeneralOptions],
  },
  {
    name: "util/BoxedVar",
    tsjs: "src/util/BoxedVar.ts.js",
    probes: [(ns) => typeof ns.BoxedVar],
  },
  {
    name: "game/gameobject/trait/interface/NotifySell",
    tsjs: "src/game/gameobject/trait/interface/NotifySell.ts.js",
    probes: [(ns) => typeof ns.NotifySell.onSell, (ns) => Object.keys(ns.NotifySell).length],
  },
  {
    name: "game/trait/interface/NotifyProduceUnit",
    tsjs: "src/game/trait/interface/NotifyProduceUnit.ts.js",
    probes: [(ns) => typeof ns.NotifyProduceUnit.onProduce, (ns) => Object.keys(ns.NotifyProduceUnit).length],
  },
  {
    name: "game/gameobject/trait/interface/NotifyWarpChange",
    tsjs: "src/game/gameobject/trait/interface/NotifyWarpChange.ts.js",
    probes: [(ns) => typeof ns.NotifyWarpChange.onChange, (ns) => Object.keys(ns.NotifyWarpChange).length],
  },
  {
    name: "game/event/FactoryProduceUnitEvent",
    tsjs: "src/game/event/FactoryProduceUnitEvent.ts.js",
    probes: [
      (ns) => {
        const target = { tag: "unit" };
        const event = new ns.FactoryProduceUnitEvent(target);
        return { sameTarget: event.target === target, type: event.type };
      },
    ],
  },
  {
    name: "game/gameobject/trait/DockTrait",
    tsjs: "src/game/gameobject/trait/DockTrait.ts.js",
    probes: [
      (ns) => {
        const building = { name: "GAPILE", warpedOutTrait: { isActive: () => false }, tankBunkerTrait: null, helipadTrait: null, unitRepairTrait: {}, rules: { naval: false, unitRepair: true, dock: ["GAPILE"] } };
        const tiles = { getByMapCoords: (x, y) => ({ rx: x, ry: y, z: 0, rampType: 0 }) };
        const dock = new ns.DockTrait(building, tiles, 3, [
          { x: 0, y: 0, z: 0 }, { x: 256, y: 0, z: 0 }, { x: 512, y: 0, z: 0 },
        ]);
        dock.dockTiles = [{ rx: 5, ry: 5 }, { rx: 6, ry: 5 }, { rx: 7, ry: 5 }];
        const unit = { name: "HTK", isVehicle: () => true, isDestroyed: false, isDisposed: false, tile: dock.dockTiles[0], traits: { find: () => null, get: () => null } };
        dock.dockUnitAt(unit, 0);
        const docked = dock.isDocked(unit);
        const available = dock.getAvailableDockCount();
        dock.undockUnit(unit);
        return { docked, available, afterUndock: dock.isDocked(unit), dockTiles: dock.dockTiles.length };
      },
      (ns) => {
        // NotifyDestroy 实参顺序：(object, game, attacker, temporal)
        const destroyed = [];
        const building = { name: "GAPILE", warpedOutTrait: { isActive: () => false }, tankBunkerTrait: null, helipadTrait: null, unitRepairTrait: {}, rules: { naval: false, unitRepair: true, dock: [] } };
        const dock = new ns.DockTrait(building, { getByMapCoords: () => ({}) }, 1, [{ x: 0, y: 0, z: 0 }]);
        dock.dockTiles = [{ rx: 0, ry: 0 }];
        const unit = { name: "HTK", isDestroyed: false, isDisposed: false, tile: dock.dockTiles[0], traits: { find: () => null, get: () => null } };
        dock.dockUnitAt(unit, 0);
        const game = { destroyObject: (u, atk, temporal) => destroyed.push({ id: u.name, atk: atk?.id ?? null, temporal }) };
        const attacker = { id: "atk1", weapon: { warhead: { rules: { temporal: false } } } };
        const proto = Object.getPrototypeOf(dock);
        for (const s of Object.getOwnPropertySymbols(proto)) {
          if (typeof proto[s] === "function" && proto[s].length === 4) {
            try {
              proto[s].call(dock, building, game, attacker, false);
            } catch {
              /* 其他 4 参 handler mock 不完整时忽略 */
            }
          }
        }
        return { destroyCalls: destroyed.length, atk: destroyed[0]?.atk ?? null, temporal: destroyed[0]?.temporal ?? null };
      },
    ],
  },
  {
    name: "game/gameobject/trait/FactoryTrait",
    tsjs: "src/game/gameobject/trait/FactoryTrait.ts.js",
    probes: [
      (ns) => {
        const trait = new ns.FactoryTrait(ns.FactoryType ? ns.FactoryType.BuildingType : 1);
        return { status: trait.status, isCloningVats: trait.isCloningVats };
      },
      (ns) => {
        // NotifyWarpChange：BuildingType(1) 应刷新 Structures(0)+Armory(1) 两条队列
        const notified = [];
        const queues = {
          0: { notifyUpdated: () => notified.push(0) },
          1: { notifyUpdated: () => notified.push(1) },
          3: { notifyUpdated: () => notified.push(3) },
        };
        const object = {
          owner: {
            production: {
              getQueueTypeForFactory: () => 3,
              getQueue: (t) => queues[t],
            },
          },
        };
        // BuildingType = 1（TechnoRules.FactoryType）
        const trait = new ns.FactoryTrait(ns.FactoryType ? ns.FactoryType.BuildingType : 1);
        const proto = Object.getPrototypeOf(trait);
        const symbols = Object.getOwnPropertySymbols(proto).filter(
          (s) => typeof proto[s] === "function" && proto[s].length === 3,
        );
        for (const s of symbols) {
          try {
            proto[s].call(trait, object, null, null);
          } catch {
            /* owner-change 等路径 mock 不完整时忽略 */
          }
        }
        return { notified };
      },
      (ns) => {
        // produceGroundUnitAt：飞行器规则的 rallyTile 应等于 spawnTile（MoveTask 目标）
        // 第二参为生产队列项 {rules}，与 onTick 里 queue.getFirst() 一致
        const FactoryType = ns.FactoryType ?? { None: 0, UnitType: 3, AircraftType: 5, BuildingType: 1, InfantryType: 2, NavalUnitType: 4 };
        const rallyTile = { rx: 10, ry: 10, z: 0 };
        const spawnTile = { rx: 12, ry: 11, z: 0 };
        const tasks = [];
        const unitRules = { consideredAircraft: true, trainable: false };
        const queueItem = { rules: unitRules, creditsSpent: 0, progress: 0 };
        const unit = {
          rules: unitRules,
          position: { subCell: 0 },
          isInfantry: () => false,
          isAircraft: () => true,
          veteranTrait: null,
          unitOrderTrait: {
            addTask: (t) => tasks.push({ kind: "add", t }),
            addTaskNext: (t) => tasks.push({ kind: "next", t }),
          },
          direction: 0,
          tile: null,
          zone: 0,
        };
        const building = {
          owner: { canProduceVeteran: () => false, buildings: [] },
          rules: {},
          tile: { rx: 0, ry: 0, z: 0 },
          art: { height: 0 },
          rallyTrait: {
            getRallyPoint: () => null,
            findRallyPointforUnit: () => rallyTile,
            findRallyNodeForUnit: () => ({ tile: rallyTile, onBridge: undefined }),
            changeRallyPoint: () => {},
          },
          getFoundation: () => ({ width: 3, height: 3 }),
          isSpawned: true,
          buildStatus: 1,
        };
        const world = {
          createUnitForPlayer: () => unit,
          spawnObject: (u, tile) => {
            u.tile = tile;
          },
          traits: { filter: () => ({ forEach: () => {} }) },
          events: { dispatch: () => {} },
          rules: { general: { closeEnough: 1 } },
          map: {
            tiles: { getByMapCoords: () => spawnTile },
            tileOccupation: { getObjectsOnTileByLayer: () => [], isTileOccupiedBy: () => false },
            mapBounds: {},
            terrain: {},
          },
          changeObjectOwner: () => {},
          destroyObject: () => {},
        };
        const trait = new ns.FactoryTrait(FactoryType.UnitType ?? 3);
        trait.produceGroundUnitAt(building, queueItem, world);
        const next = tasks.find((x) => x.kind === "next");
        const task = next?.t;
        // 桩 Proxy 对缺失属性返回函数（truthy），故直接读 $args
        const taskTile = task?.$args?.[1] ?? null;
        return { hasTask: !!task, taskTileIsRally: taskTile === rallyTile };
      },
    ],
  },
  {
    name: "game/gameobject/trait/HelipadTrait",
    tsjs: "src/game/gameobject/trait/HelipadTrait.ts.js",
    probes: [(ns) => typeof ns.HelipadTrait],
  },
  {
    name: "game/gameobject/trait/UnitReloadTrait",
    tsjs: "src/game/gameobject/trait/UnitReloadTrait.ts.js",
    probes: [(ns) => typeof ns.UnitReloadTrait],
  },
  {
    name: "game/gameobject/trait/TurretTrait",
    tsjs: "src/game/gameobject/trait/TurretTrait.ts.js",
    probes: [(ns) => typeof ns.TurretTrait],
  },
  {
    name: "game/gameobject/trait/RallyTrait",
    tsjs: "src/game/gameobject/trait/RallyTrait.ts.js",
    probes: [
      (ns) => typeof ns.RallyTrait,
      (ns) => {
        // changeRallyPoint 实参顺序 (point, object, world)：point 作 tile 校验
        const seen = [];
        const point = { rx: 10, ry: 20, terrainType: 0, z: 0 };
        const object = {
          rules: { naval: false },
          factoryTrait: null,
          isBuilding: () => true,
          getFoundation: () => ({ width: 1, height: 1 }),
          tile: { rx: 0, ry: 0 },
        };
        const world = {
          map: {
            tiles: {
              getByMapCoords: (x, y) => {
                seen.push({ x, y });
                return { rx: x, ry: y, terrainType: 0, z: 0 };
              },
            },
            mapBounds: {},
            tileOccupation: {
              isTileOccupiedBy: (tile, obj) => {
                seen.push({ occupiedCheck: tile, sameObject: obj === object });
                return false;
              },
            },
            terrain: { getPassableSpeed: () => 0 },
          },
        };
        // RadialTileFinder 是 stub：getNextTile 返回 undefined → 回落 found
        const trait = new ns.RallyTrait();
        trait.changeRallyPoint(point, object, world);
        // 若顺序正确：isTileOccupiedBy 收到 (point, object)
        const occupied = seen.find((s) => s.occupiedCheck);
        return {
          hasRally: !!trait.rallyPoint,
          pointAsTile: occupied?.occupiedCheck === point,
          objectAsObject: occupied?.sameObject === true,
        };
      },
    ],
  },
  {
    name: "game/gameobject/trait/CrewedTrait",
    tsjs: "src/game/gameobject/trait/CrewedTrait.ts.js",
    probes: [
      (ns) => typeof ns.CrewedTrait,
      (ns) => {
        // NotifyDestroy 实参顺序 (object, game, attacker, temporal)
        const spawned = [];
        const proto = ns.CrewedTrait.prototype;
        const destroySym = Object.getOwnPropertySymbols(proto).find(
          (s) => typeof proto[s] === "function" && proto[s].length === 4,
        );
        const object = { id: "v", isVehicle: () => true, moveTrait: { isMoving: () => false }, crashableTrait: null, rules: {}, owner: { country: { side: 1 } } };
        const game = { rules: { general: {} }, sellTrait: { computeRefundValue: () => 0 } };
        // temporal=true → 不逃出
        if (destroySym) {
          const trait = new ns.CrewedTrait();
          trait.spawnSurvivors = (o, w) => spawned.push({ obj: o === object, worldIsGame: w === game });
          proto[destroySym].call(trait, object, game, null, true);
        }
        const afterTemporal = spawned.length;
        // 正常死亡：spawnSurvivors 应收到 (object, game) 而非 attacker
        if (destroySym) {
          const trait = new ns.CrewedTrait();
          trait.spawnSurvivors = (o, w) => spawned.push({ obj: o === object, worldIsGame: w === game });
          proto[destroySym].call(trait, object, game, { obj: null, weapon: null }, false);
        }
        return {
          afterTemporal,
          afterNormal: spawned.length,
          normalWorldIsGame: spawned[0]?.worldIsGame ?? null,
        };
      },
    ],
  },
  {
    name: "game/gameobject/trait/UnitRepairTrait",
    tsjs: "src/game/gameobject/trait/UnitRepairTrait.ts.js",
    probes: [
      (ns) => typeof ns.UnitRepairTrait,
      (ns) => {
        // tickRepair：repair 规则来自 world.rules；healBy(amount, building, world)
        const healCalls = [];
        const building = {};
        const worldMock = { rules: { general: { repair: { repairStep: 1, repairPercent: 0 } } } };
        const unit = {
          purchaseValue: 1000,
          owner: { credits: 10000 },
          healthTrait: {
            maxHitPoints: 100,
            getHitPoints: () => 50,
            healBy: (amount, source, world) =>
              healCalls.push({ amount, sourceIsBuilding: source === building, worldIsWorld: world === worldMock }),
          },
        };
        const trait = new ns.UnitRepairTrait();
        const ok = trait.tickRepair(unit, worldMock, building);
        return {
          ok,
          healCalls: healCalls.length,
          sourceIsBuilding: healCalls[0]?.sourceIsBuilding ?? null,
          worldIsWorld: healCalls[0]?.worldIsWorld ?? null,
          amount: healCalls[0]?.amount ?? null,
        };
      },
    ],
  },
  {
    name: "game/gameobject/trait/ArmedTrait",
    tsjs: "src/game/gameobject/trait/ArmedTrait.ts.js",
    probes: [
      (ns) => {
        // 无主/副/死亡武器：构造不触发 Weapon.factory
        const gameObject = {
          name: "E1",
          veteranLevel: 0,
          rules: {
            primary: undefined,
            secondary: undefined,
            elitePrimary: undefined,
            eliteSecondary: undefined,
            occupyWeapon: undefined,
            eliteOccupyWeapon: undefined,
            deathWeapon: undefined,
            weaponCount: 0,
            isGattling: false,
            explodes: false,
            crashableTrait: null,
            guardRange: 5,
            deployFire: false,
            deployFireWeapon: 0,
            openTransportWeapon: -1,
            combatDamage: {},
          },
          art: {
            primaryFireFlh: null,
            elitePrimaryFireFlh: null,
            secondaryFireFlh: null,
            eliteSecondaryFireFlh: null,
            getSpecialWeaponFlh: () => null,
          },
          garrisonTrait: null,
          transportTrait: null,
          isBuilding: () => false,
        };
        const armed = new ns.ArmedTrait(gameObject, gameObject.rules);
        const target = { range: 4 };
        return {
          type: typeof ns.ArmedTrait,
          specialIndex: armed.getSpecialWeaponIndex(),
          weapons: armed.getWeapons().length,
          hasPrimary: !!armed.primaryWeapon,
          guard: armed.computeGuardScanRange(target),
          openTopped: armed.getOpenToppedWeapon(),
          deployFire: armed.getDeployFireWeapon(),
        };
      },
      (ns) => {
        // 驻楼乘员武器 / 敞开运输车武器选择（构造不组装武器，手工注入）
        const garrisonWeapon = { name: "UCPara", range: 5, rules: { neverUse: false } };
        const primary = { name: "M1Carbine", range: 4, rules: { neverUse: false } };
        const secondary = { name: "MissileLauncher", range: 6, rules: { neverUse: false } };
        const gameObject = {
          name: "E1",
          veteranLevel: 0,
          rules: {
            primary: undefined,
            secondary: undefined,
            occupyWeapon: undefined,
            weaponCount: 0,
            isGattling: false,
            explodes: false,
            crashableTrait: null,
            guardRange: 5,
            deployFire: true,
            deployFireWeapon: 1,
            openTransportWeapon: 1,
            combatDamage: {},
          },
          art: {},
          garrisonTrait: {
            isOccupied: () => true,
            units: [{ armedTrait: { getGarrisonWeapon: () => garrisonWeapon } }],
          },
          transportTrait: {
            units: [{ armedTrait: { getOpenToppedWeapon: () => secondary } }],
          },
          isBuilding: () => true,
        };
        const armed = new ns.ArmedTrait(gameObject, gameObject.rules);
        armed.primaryWeapon = primary;
        armed.secondaryWeapon = secondary;
        armed.occupyWeapon = garrisonWeapon;
        return {
          garrison: armed.getGarrisonWeapon()?.name,
          openTopped: armed.getOpenToppedWeapon()?.name,
          deployFire: armed.getDeployFireWeapon()?.name,
          equippedPrimary: armed.isEquippedWithWeapon(primary),
          equippedGarrison: armed.isEquippedWithWeapon(garrisonWeapon),
          guardFromOccupants: armed.computeGuardScanRange(null),
        };
      },
      (ns) => {
        // 特殊武器 / 盖特：越界应抛错；getSpecialWeaponIndex 可读
        const makeObj = (weaponCount, isGattling) => ({
          name: "GAT",
          veteranLevel: 0,
          rules: {
            weaponCount,
            isGattling,
            guardRange: 4,
            explodes: false,
            crashableTrait: null,
            combatDamage: {},
          },
          art: { getSpecialWeaponFlh: () => null },
          garrisonTrait: null,
          transportTrait: null,
          isBuilding: () => false,
        });
        const results = {};
        try {
          new ns.ArmedTrait(makeObj(0, false), { combatDamage: {} });
          results.specialNoCount = "no-throw";
        } catch (e) {
          results.specialNoCount = e.constructor.name;
        }
        try {
          new ns.ArmedTrait(makeObj(1, true), { combatDamage: {} });
          results.gattlingTooFew = "no-throw";
        } catch (e) {
          results.gattlingTooFew = e.constructor.name;
        }
        return results;
      },
      (ns) => {
        // NotifyDestroy：死亡武器开火条件（temporal / 正常死亡）
        const fired = [];
        const deathWeapon = {
          name: "DeathWeapon",
          fire: (target, world) => fired.push({ target: target?.id, world: !!world }),
        };
        const proto = ns.ArmedTrait.prototype;
        const destroySym = Object.getOwnPropertySymbols(proto).find(
          (s) => typeof proto[s] === "function" && proto[s].length === 3,
        );
        const makeArmed = () => {
          const armed = Object.create(proto);
          armed.deathWeapon = deathWeapon;
          return armed;
        };
        const object = { id: "victim", tile: { rx: 1, ry: 2 }, crashableTrait: null };
        const world = { createTarget: (obj, tile) => ({ id: obj.id, tile }) };
        if (destroySym) {
          // temporal → 不开火
          proto[destroySym].call(makeArmed(), object, world, {
            weapon: { warhead: { rules: { temporal: true } } },
          });
        }
        const afterTemporal = fired.length;
        if (destroySym) {
          // 正常死亡 → 开火
          proto[destroySym].call(makeArmed(), object, world, null);
        }
        return { afterTemporal, afterNormal: fired.length, firedWorld: fired[0]?.world ?? null };
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
  "game/gameobject/trait/interface/NotifyWarpChange",
  "game/gameobject/trait/interface/NotifySell",
  "game/trait/interface/NotifyProduceUnit",
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
  // 已转换的 task 系统：必须预注册，否则被 trait/task 桩规则吞掉
  "game/gameobject/task/system/TaskStatus",
  "game/gameobject/task/system/Task",
  "game/gameobject/task/system/TaskGroup",
  "game/gameobject/task/system/CallbackTask",
  "game/gameobject/task/system/WaitTicksTask",
  "game/gameobject/task/system/WaitMinutesTask",
  "game/gameobject/task/morph/PackBuildingTask",
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
      // 未转换的 trait/task 模块 → 用 Proxy 魔法桩替代真实实现：可实例化、
      // 任意方法调用返回 undefined。原因：trait 与 task 之间存在循环依赖
      // （如 MoveTrait ↔ MoveTask），真实闭包在迷你运行时里的初始化顺序
      // 无法复刻生产包；而本测试关心的是转换模块的出厂组装决策，桩类
      // 新旧变体共用，依然严格对等。
      if (/^game\/gameobject\/(trait|task)\//.test(name)) {
        defs.set(name, { deps: [], factory: makeStubFactory(name) });
        return get(name);
      }
      // 惰性加载：未预注册的规范名依赖（如 game/type/LandType 等叶子模块）
      // 按需从孪生或编译产物读取，避免手工维护完整的依赖清单。
      const lazyTwin = "src/" + name + ".ts.js";
      const lazyCompiled = "build/ts-modules/" + name + ".js";
      if (existsSync(join(ROOT, lazyTwin))) {
        loadFile(system, lazyTwin);
        return get(name);
      }
      if (existsSync(join(ROOT, lazyCompiled))) {
        loadFile(system, lazyCompiled);
        return get(name);
      }
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
    // 先占位再执行：循环依赖（A 的 setter/execute 期间 B 又请求 A）时
    // 返回半初始化命名空间——与真实 SystemJS 语义一致，否则无限递归。
    instances.set(name, ns);
    const exports = (key, value) => {
      ns[key] = value;
      return value; // 真实 SystemJS 的 exports 会返回 value（EventType 模块依赖此行为）
    };
    const ret = def.factory(exports, { id: name });
    for (let i = 0; i < def.deps.length; i++) {
      ret.setters[i](await get(def.deps[i]));
    }
    ret.execute();
    return ns;
  }
  const system = {
    register: (name, deps, factory) => defs.set(name, { deps, factory }),
    get,
  };
  return system;
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
 * 为未转换的 trait/task 模块生成桩类工厂：
 *  - 类可 new（记录构造参数到 $stub/$args，便于断言）；
 *  - 实例上任意属性读取/方法调用返回 undefined 的函数（可链式调用），
 *    使工厂逻辑（setDisabled/isSuppressed 等）能无异常跑通。
 */
function makeStubFactory(name) {
  const exportName = name.split("/").pop();
  return (exports) => {
    class StubTrait {}
    const proxyClass = new Proxy(StubTrait, {
      construct(_target, args) {
        return new Proxy(
          { $stub: name, $args: args },
          {
            get(target, prop) {
              if (prop in target) return target[prop];
              return () => undefined;
            },
          },
        );
      },
    });
    exports(exportName, proxyClass);
    return { setters: [], execute() {} };
  };
}

/**
 * 测试用 INI 段落包装（模拟 rules 解析层接口，行为与真实 IniSection 对齐）：
 * getString/getBool/getNumber/getFixed/getArray/getEnum/getEnumNumeric/
 * getEnumArray/getNumberArray/has/entries/name。TechnoRules 等规则类的新旧
 * 两个变体在探针内使用同一份 mock 数据，保证解析输入逐字一致。
 */
/**
 * 构造 rulesmd.ini 级别的 mock：{段名: {键: 值}} → 带段落的 IniFile 视图。
 * 提供 Rules 类用到的 getSection/getOrderedSections/getOrCreateSection；
 * 每个段落是 makeMockIni 的实例。段查找带大小写不敏感回退（与原实现一致）。
 */
function makeRulesIni(sections) {
  const byName = new Map();
  const lower = new Map();
  const wrap = (name, obj) => {
    const m = makeMockIni(name, obj);
    m.set = (key, value) => {
      obj[key] = value;
      m.entries.set(key, value);
    };
    return m;
  };
  for (const [name, obj] of Object.entries(sections)) {
    const section = wrap(name, obj);
    byName.set(name, section);
    lower.set(name.toLowerCase(), section);
  }
  return {
    getSection: (name) => byName.get(name) ?? lower.get(name.toLowerCase()) ?? null,
    getOrderedSections: () => [...byName.values()],
    getOrCreateSection: (name) => {
      let section = byName.get(name) ?? lower.get(name.toLowerCase());
      if (!section) {
        section = wrap(name, {});
        byName.set(name, section);
        lower.set(name.toLowerCase(), section);
      }
      return section;
    },
  };
}

function makeMockIni(name, entries) {
  const get = (key) => (key in entries ? entries[key] : undefined);
  return {
    name,
    set: (key, value) => {
      entries[key] = value;
    },
    // entries 为 Map（键 → 值），与真实 IniSection 一致：
    // Map.forEach((value, key))、entries.keys() 均可用。
    entries: new Map(Object.entries(entries)),
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
      else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts") && existsSync(join(dir, entry.name.replace(/.ts$/, ".ts.js")))) {
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

/** Encode a probe outcome for snapshot storage.
 *
 *  Both errors AND a legitimate `undefined` result must be tagged: a bare
 *  `undefined` is dropped by JSON.stringify, so an untagged one would be
 *  indistinguishable from a missing entry — the snapshot would then be
 *  re-created on every run and never actually compared. */
function encodeOutcome(value, error) {
  if (error !== undefined) return { __error__: error };
  if (value === undefined) return { __undefined__: true };
  return value;
}

function decodeSnapshot(stored) {
  if (stored && typeof stored === "object") {
    if ("__error__" in stored) return { error: stored.__error__ };
    if ("__undefined__" in stored) return { value: undefined };
  }
  return { value: stored };
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
      //
      // Entry presence is tested with hasOwnProperty, not `=== undefined`: a probe
      // may legitimately return undefined (stored as {__undefined__: true}), and
      // treating that as "no entry yet" re-captured the snapshot on every run.
      const store = snapshots[mod.name];
      const hasEntry = store !== undefined && Object.prototype.hasOwnProperty.call(store, i);
      const expected = decodeSnapshot(hasEntry ? store[i] : undefined);

      if (!hasEntry) {
        // First capture. Only legal while the twin still exists, as the oracle.
        if (hasTwin) {
          let oldV, oldErr;
          try {
            oldV = probe(oldNs, globalThis.THREE);
          } catch (e) {
            oldErr = String(e);
          }
          (snapshots[mod.name] ??= {})[i] = encodeOutcome(oldV, oldErr);
          snapshotsChanged.add(mod.name);
        } else if (UPDATE_SNAPSHOTS) {
          (snapshots[mod.name] ??= {})[i] = encodeOutcome(newV, newErr);
          snapshotsChanged.add(mod.name);
        } else {
          fail("no snapshot and no twin to baseline from — restore the twin or use --update-snapshots");
        }
      } else if (UPDATE_SNAPSHOTS) {
        // Deliberate re-baseline: accept the current TS output as the new expected
        // value. Track 1 above still guards accidental drift while a twin exists.
        store[i] = encodeOutcome(newV, newErr);
        snapshotsChanged.add(mod.name);
      } else if (expected.error !== undefined) {
        if (newErr !== expected.error)
          fail(`snapshot=${expected.error} new=${newErr ?? JSON.stringify(newV)}`);
      } else if (newErr !== undefined || !deepEqual(newV, expected.value)) {
        fail(`snapshot=${JSON.stringify(expected.value)} new=${newErr ?? JSON.stringify(newV)} (run: npm run test:parity -- --update-snapshots)`);
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
