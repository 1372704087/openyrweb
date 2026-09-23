/**
 * game/api/index — 对外聚合 barrel（再导出 Bot 与常用枚举/类）。
 *
 * 孪生仅通过 setters 把依赖模块的指定命名导出转发到本模块 export，
 * execute 为空（无自有运行时逻辑）。本 TS 文件用 re-export 对齐同一
 * 导出面；其中已转换模块可具名导入，仍为孪生的以 any-shim 再导出。
 *
 * 由 game/api/index.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
// —— 孪生 re-export（原 System.register setters 转发面） ——
export { Bot } from "game/bot/Bot"; // 孪生
export { ApiEventType } from "game/api/EventsApi"; // 已转换
export { GameMath } from "game/math/GameMath"; // 孪生
export { Box2 } from "game/math/Box2"; // 孪生
export { Vector2 } from "game/math/Vector2"; // 孪生
export { Vector3 } from "game/math/Vector3"; // 孪生
export { Euler } from "game/math/Euler"; // 孪生
export { Quaternion } from "game/math/Quaternion"; // 孪生
export { Matrix4 } from "game/math/Matrix4"; // 孪生
export { Spherical } from "game/math/Spherical"; // 孪生
export { Cylindrical } from "game/math/Cylindrical"; // 孪生
export { TheaterType } from "engine/TheaterType"; // 孪生
export { ObjectType } from "engine/type/ObjectType"; // 孪生
export { BuildStatus } from "game/gameobject/Building"; // 孪生
export { StanceType } from "game/gameobject/infantry/StanceType"; // 孪生
export { ZoneType } from "game/gameobject/unit/ZoneType"; // 孪生
export { AttackState } from "game/gameobject/trait/AttackTrait"; // 孪生
export { FactoryStatus } from "game/gameobject/trait/FactoryTrait"; // 孪生
export { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 孪生
export { OrderType } from "game/order/OrderType"; // 孪生
export { QueueType, QueueStatus } from "game/player/production/ProductionQueue"; // 孪生
export { PrereqCategory } from "game/rules/GeneralRules"; // 孪生
export { RadarEventType } from "game/rules/general/RadarRules"; // 孪生
export { SpeedType } from "game/type/SpeedType"; // 孪生
export { WeaponType } from "game/WeaponType"; // 孪生
export { FactoryType, BuildCat } from "game/rules/TechnoRules"; // 孪生
export { TagRepeatType } from "data/map/tag/TagRepeatType"; // 孪生
export { TerrainType } from "engine/type/TerrainType"; // 孪生
export { InfDeathType } from "game/gameobject/infantry/InfDeathType"; // 孪生
export { VeteranAbility } from "game/gameobject/unit/VeteranAbility"; // 孪生
export { SideType } from "game/SideType"; // 孪生
export { ArmorType } from "game/type/ArmorType"; // 孪生
export { LandTargeting } from "game/type/LandTargeting"; // 孪生
export { LandType } from "game/type/LandType"; // 孪生
export { LocomotorType } from "game/type/LocomotorType"; // 孪生
export { MovementZone } from "game/type/MovementZone"; // 孪生
export { NavalTargeting } from "game/type/NavalTargeting"; // 孪生
export { PipColor } from "game/type/PipColor"; // 孪生
export { SuperWeaponType } from "game/type/SuperWeaponType"; // 孪生
export { SuperWeaponStatus } from "game/SuperWeapon"; // 孪生
export { VhpScan } from "game/type/VhpScan"; // 孪生
