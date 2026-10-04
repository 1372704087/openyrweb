/**
 * original/Util — 原版 AI 执行层的通用工具。
 *
 * findPlacement 从旧自研 IraqBot 的 iraq/Util.ts 迁入（IraqBot 已移除）：
 * 贴己方建筑外扩矩形收集候选 tile，按到 anchor 距离升序试 canPlaceBuilding。
 * 候选带宽度随目标建筑底盘增大（pad=2 放不下战工/基地级大底盘）；
 * 中心只认真建筑（BaseNormal 缺省 true 会把 MCV/车辆也当中心）。
 *
 * ⚠ 2026-10-04 接入出厂通道避让（实测事故，见下）：
 * 原实现只按 `canPlaceBuilding` 过滤，**从不查 `getFactoryExitCorridors`**，
 * 而那个 API 在 `GameApi.ts:248` 有定义却全仓零调用点 ⇒ AI 会把新建筑盖到
 * **既有**兵营/战车工厂的集结格上。`ExitFactoryTask` 以集结格为**精确**目标
 * （`strictCloseEnough` / `closeEnoughTiles: 0`，卡满 135 tick 才放宽到 2 格内），
 * 一旦被占，该厂此后每台单位都白等满 150 tick 抗卡死释放阈值。
 * 实测 build 20261004-005627：`FactoryStall` 打出
 * `NAHAND … rally=83,136 occ[B:NACNST]`，同时三家 AI 的 `credits` 全程归零
 * （钱全进基建）、`recruit diag` 的 `stall` 阶梯涨到 1500。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ApiIndexModule from "game/api/index"; // 孪生

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间整体
const A: any = ApiIndexModule as any;

function dist(ax: any, ay: any, bx: any, by: any): any {
  return Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
}

/**
 * 出厂通道格集合（`rx,ry` 字符串键）。
 *
 * 口径与 `GameApi.getFactoryExitCorridors` / `SlaveMinerVehicleTrait._exitCorridorCells`
 * 三处一致：出生格 = `computeExitCoords`、集结格按工厂类型分派；
 * 建筑工厂（建造厂）调 `computeExitCoords` 会抛错，正好过滤掉"不吐单位的厂"。
 *
 * 容错：任何一步取不到都返回空集 —— 此时退化成"不避让"（= 修复前的行为），
 * 绝不会因为通道查询本身抛错而让 AI 完全放不下建筑。
 */
function collectExitCorridorKeys(game: any, playerName: any): any {
  var keys: any = {};
  var cells: any[] = [];
  try {
    if (game && typeof game.getFactoryExitCorridors === "function") {
      cells = game.getFactoryExitCorridors(playerName) || [];
    }
  } catch (_) {
    return keys;
  }
  if (!cells || cells.length === 0) return keys;
  for (var i = 0; i < cells.length; i++) {
    var c = cells[i];
    if (!c) continue;
    var x = typeof c.rx === "number" ? Math.floor(c.rx) : NaN;
    var y = typeof c.ry === "number" ? Math.floor(c.ry) : NaN;
    if (isNaN(x) || isNaN(y)) continue;
    keys[x + "," + y] = 1;
  }
  return keys;
}

/**
 * 候选矩形是否压住任何出厂通道格。
 *
 * ⚠ 判据用**矩形原型覆盖**（候选占位矩形 ∩ 通道格），**不要用格心距离**：
 * 距离判定既会漏（3x3 占位能覆盖到格心外 2 格）又会多杀（隔着 1 格的紧邻建筑
 * 其实是安全的，却会被距离判据误杀，把候选砍光导致放不下建筑）。
 * 关键格只有"出生格 + 集结格"两个，矩形覆盖是精确且最省的口径。
 */
function rectHitsCorridor(
  tx: number,
  ty: number,
  tw: number,
  th: number,
  keys: any,
): boolean {
  if (!keys) return false;
  for (var k in keys) {
    var parts = k.split(",");
    var cx = parseInt(parts[0], 10);
    var cy = parseInt(parts[1], 10);
    if (isNaN(cx) || isNaN(cy)) continue;
    if (cx >= tx && cx < tx + tw && cy >= ty && cy < ty + th) return true;
  }
  return false;
}

export function findPlacement(game: any, playerName: any, name: any, anchor: any): any {
  var pd = game.getBuildingPlacementData(name);
  if (!pd || !pd.foundation) return null;
  var fw = (pd.foundation && pd.foundation.width) || 1;
  var fh = (pd.foundation && pd.foundation.height) || 1;
  var basePad = Math.max(2, Math.max(fw, fh));
  // 出厂通道格（己方既有工厂的出生格 + 集结格）。查询失败时为空集 = 不避让。
  var corridorKeys = collectExitCorridorKeys(game, playerName);
  var avoidCorridor = Object.keys(corridorKeys).length > 0;
  var myBIds = game.getVisibleUnits(playerName, "self", function (r: any) {
    return r.baseNormal && r.type === A.ObjectType.Building;
  });
  var ax2 = anchor ? anchor.x : 0,
    ay2 = anchor ? anchor.y : 0;

  // 收集候选（pad 可变）：贴己方建筑外扩矩形，按到 anchor 距离升序。
  var collect = function (pad: number): any[] {
    var cand: any[] = [];
    var seen: any = {};
    for (var i = 0; i < myBIds.length; i++) {
      var b = game.getUnitData(myBIds[i]);
      if (!b || !b.tile) continue;
      var bw = (b.foundation && b.foundation.width) || 1;
      var bh = (b.foundation && b.foundation.height) || 1;
      var rect = {
        x: b.tile.rx - pad,
        y: b.tile.ry - pad,
        width: bw + 2 * pad,
        height: bh + 2 * pad,
      };
      var tiles = game.mapApi.getTilesInRect(rect);
      if (!tiles) continue;
      for (var k = 0; k < tiles.length; k++) {
        var tt = tiles[k];
        var key = tt.rx + "," + tt.ry;
        if (seen[key]) continue;
        seen[key] = 1;
        cand.push(tt);
      }
    }
    cand.sort(function (p, q) {
      return dist(p.rx, p.ry, ax2, ay2) - dist(q.rx, q.ry, ax2, ay2);
    });
    return cand;
  };

  var tryPlace = function (cand: any[]): any {
    for (var j = 0; j < cand.length; j++) {
      var ct = cand[j];
      // 先剔除压住出厂通道的矩形（覆盖口径，见 rectHitsCorridor 注释）。
      // 放在 canPlaceBuilding 之前：通道格是"永久阻塞"，而 canPlaceBuilding
      // 只看当前占用状态，对"将来会挡路"完全无感。
      if (avoidCorridor && rectHitsCorridor(ct.rx, ct.ry, fw, fh, corridorKeys)) {
        continue;
      }
      if (game.canPlaceBuilding(playerName, name, ct)) return ct;
    }
    return null;
  };

  var first = tryPlace(collect(basePad));
  if (first) return first;
  // 近邻全被通道格压住时**加宽搜索**而不是放弃避让：基地周边 2/4/8 格外扩。
  // ⚠ 绝不能"过滤完没位置就退回不避让"——那等于把刚修的 bug 原样放回去，
  // 且只在基地已经很挤时发作，极难复现（教训同"守必经格"那条）。
  for (var extra = 2; extra <= 8; extra *= 2) {
    var retry = tryPlace(collect(basePad + extra));
    if (retry) return retry;
  }
  return null;
}
