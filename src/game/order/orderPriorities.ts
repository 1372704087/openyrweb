/**
 * orderPriorities — 右键指令优先级列表（列表顺序即判定优先级）。
 *
 * 玩家点同一格时，按此顺序先匹配到的 OrderType 优先落地：
 * 占领 > 进坞 > 攻击 > 占领工程师 > 修理 > 进运输车 > 安放炸弹 >
 * 部署 > 采集。不在列表中的类型走默认（通常是 Move）。
 *
 * 由 game/order/orderPriorities.ts.js 重写为 TS（行为完全一致，列表内容
 * 与顺序脚本提取自原文件）。两个文件并存期间，本文件才是修改目标。
 */
import { OrderType } from "game/order/OrderType"; // 已转换

export const orderPriorities = [
  OrderType.Occupy,
  OrderType.Dock,
  OrderType.Attack,
  OrderType.Capture,
  OrderType.Repair,
  OrderType.EnterTransport,
  OrderType.PlaceBomb,
  OrderType.Deploy,
  OrderType.Gather,
];
