import fs from "node:fs";
const p = "tests/ts-parity.mjs";
let s = fs.readFileSync(p, "utf8");
const missing = [
  "game/gameobject/locomotor/DriveLocomotor",
  "game/gameobject/locomotor/HoverLocomotor",
  "game/gameobject/locomotor/JumpjetLocomotor",
  "game/gameobject/locomotor/MissileLocomotor",
  "game/gameobject/locomotor/WingedLocomotor",
];
const anchor = '  {\n    name: "game/type/SpeedType",';
const entries = missing
  .map(
    (name) =>
      `  {\n    name: "${name}",\n    tsjs: "src/${name}.ts.js",\n    probes: [(ns) => typeof Object.values(ns)[0]],\n  },`
  )
  .join("\n");
s = s.replace(anchor, entries + "\n" + anchor);
fs.writeFileSync(p, s);
console.log("inserted", missing.length, "CONVERTED entries");
