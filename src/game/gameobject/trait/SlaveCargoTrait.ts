/**
 * SlaveCargoTrait — 矿奴载货（被动计 ore/gems，SlaveGatherTask 写入，isFull 判断回矿）。
 *
 * SlaveMiner 奴隶（SLAV 步兵）的轻量载货 trait。完整 HarvesterTrait
 * 会在 spawn/tick/teleport 上自动压入 GatherOreTask/ReturnOreTask，与 SlaveGatherTask
 * （奴隶经济循环）冲突。本 trait 只统计 ore/gems 载货（PipOverlay 读取以画矿仓点），
 * 并暴露 SlaveGatherTask 所需的最小 API（addBails/empty/getBails/isFull）。
 * 没有 NotifySpawn / NotifyTick / NotifyOrder / NotifyTeleport —— 纯被动计数器。
 * 以 `harvesterTrait` 挂到 SLAV（见 Infantry.factory），使 PipOverlay 能画出矿仓点。
 *
 * `status` 字段用于驱动采矿动画。原版 yrmd.exe（FUN_0073ced6）在 Techno 处于矿石格
 * 且其 per-slot "is harvesting" 标志（+0xe0e）与 "actively digging" 布尔（+0x6d2）
 * 置位时播放 OREGATH.SHP 瞬时动画 —— 与载具 HarvesterPlugin 相同机制。本引擎中
 * HarvesterPlugin 监视 `harvesterTrait.status === HarvesterStatus.Harvesting`（=3）。
 * SlaveGatherTask 在采矿时设 status=3，否则 0（Idle）；RenderableFactory 给被奴役
 * 步兵挂 HarvesterPlugin，使奴隶在其（矿石）格上显示 OREGATH 挖掘粒子。字面量对齐
 * HarvesterStatus（Idle=0/Harvesting=3），但不 import HarvesterTrait（避免把
 * GatherOreTask/ReturnOreTask 拉进本 trait 依赖图）。见 re/NOTES.md §6。
 *
 * 由 game/gameobject/trait/SlaveCargoTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as TiberiumTypeModule from "engine/type/TiberiumType"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SlaveCargoTrait {
  storage: any;
  _ore: any;
  _gems: any;
  bails: any;
  status: any;

  get ore() {
    return this._ore;
  }
  get gems() {
    return this._gems;
  }
  constructor(storage: any) {
    this.storage = storage;
    this._ore = 0;
    this._gems = 0;
    this.bails = new Map();
    // 采矿动画驱动：对齐 HarvesterStatus（Idle=0，Harvesting=3）。
    // HarvesterPlugin 读取（挂在被奴役步兵上，见 RenderableFactory）。
    // SlaveGatherTask 在 HARVESTING 状态置为 Harvesting。
    this.status = 0;
  }
  addBails(tiberium: any, amount: any) {
    this.bails.set(tiberium, (this.bails.get(tiberium) ?? 0) + amount);
    if (tiberium === TiberiumTypeModule.TiberiumType.Gems) this._gems += amount;
    else this._ore += amount;
  }
  getBails() {
    return [...this.bails.entries()];
  }
  isFull() {
    return this.ore + this.gems >= this.storage;
  }
  isEmpty() {
    return !this.ore && !this.gems;
  }
  empty() {
    this.bails.clear();
    this._ore = this._gems = 0;
  }
  getHash() {
    return 100 * this.ore + this.gems;
  }
}
