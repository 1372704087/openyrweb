/**
 * ActionFactoryReg — 将各 Action 工厂登记进 ActionFactory 的注册器。
 *
 * register(actionFactory, game, localPlayerName)：创建共享 OrderActionContext，
 * 按 ActionType 注册 NoAction / PlaceBuilding / SellObject / ToggleRepair /
 * SelectUnits / OrderUnits / UpdateQueue / ToggleAlliance / ActivateSuperWeapon /
 * PingLocation / DropPlayer / ObserveGame / ResignGame / DebugCommand 工厂。
 * 第三参为本地玩家名（DropPlayer/ResignGame 用其跳过本地玩家），与孪生参数位一致。
 *
 * 由 game/action/ActionFactoryReg.ts.js 重写为 TS。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import type { ActionFactory as ActionFactoryInstance } from "game/action/ActionFactory"; // 已转换
import { OrderActionContext } from "game/action/OrderActionContext"; // 已转换
import { ActionType } from "game/action/ActionType"; // 已转换
import * as NoActionFactoryModule from "game/action/factories/NoActionFactory"; // 已转换
import * as PlaceBuildingActionFactoryModule from "game/action/factories/PlaceBuildingActionFactory"; // 已转换
import * as SellObjectActionFactoryModule from "game/action/factories/SellObjectActionFactory"; // 已转换
import * as SelectUnitsActionFactoryModule from "game/action/factories/SelectUnitsActionFactory"; // 已转换
import * as OrderUnitsActionFactoryModule from "game/action/factories/OrderUnitsActionFactory"; // 已转换
import * as UpdateQueueActionFactoryModule from "game/action/factories/UpdateQueueActionFactory"; // 已转换
import * as DropPlayerActionFactoryModule from "game/action/factories/DropPlayerActionFactory"; // 已转换
import * as ToggleRepairActionFactoryModule from "game/action/factories/ToggleRepairActionFactory"; // 已转换
import * as ToggleAllianceFactoryModule from "game/action/factories/ToggleAllianceFactory"; // 已转换
import * as ActivateSuperWeaponActionFactoryModule from "game/action/factories/ActivateSuperWeaponActionFactory"; // 已转换
import * as PingLocationActionFactoryModule from "game/action/factories/PingLocationActionFactory"; // 已转换
import * as ObserveGameActionFactoryModule from "game/action/factories/ObserveGameActionFactory"; // 已转换
import * as ResignGameActionFactoryModule from "game/action/factories/ResignGameActionFactory"; // 已转换
import * as DebugActionFactoryModule from "game/action/factories/DebugActionFactory"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ActionFactoryReg {
  /** 把全部动作工厂登记到给定 ActionFactory。 */
  register(
    actionFactory: ActionFactoryInstance,
    game: any,
    localPlayerName: any,
  ): void {
    const orderActionContext = new OrderActionContext();
    actionFactory.registerFactory(
      ActionType.NoAction,
      new NoActionFactoryModule.NoActionFactory(),
    );
    actionFactory.registerFactory(
      ActionType.PlaceBuilding,
      new PlaceBuildingActionFactoryModule.PlaceBuildingActionFactory(game),
    );
    actionFactory.registerFactory(
      ActionType.SellObject,
      new SellObjectActionFactoryModule.SellObjectActionFactory(game),
    );
    actionFactory.registerFactory(
      ActionType.ToggleRepair,
      new ToggleRepairActionFactoryModule.ToggleRepairActionFactory(game),
    );
    actionFactory.registerFactory(
      ActionType.SelectUnits,
      new SelectUnitsActionFactoryModule.SelectUnitsActionFactory(
        game,
        orderActionContext,
      ),
    );
    actionFactory.registerFactory(
      ActionType.OrderUnits,
      new OrderUnitsActionFactoryModule.OrderUnitsActionFactory(
        game,
        game.map,
        orderActionContext,
      ),
    );
    actionFactory.registerFactory(
      ActionType.UpdateQueue,
      new UpdateQueueActionFactoryModule.UpdateQueueActionFactory(game),
    );
    actionFactory.registerFactory(
      ActionType.ToggleAlliance,
      new ToggleAllianceFactoryModule.ToggleAllianceActionFactory(game),
    );
    actionFactory.registerFactory(
      ActionType.ActivateSuperWeapon,
      new ActivateSuperWeaponActionFactoryModule.ActivateSuperWeaponActionFactory(
        game,
      ),
    );
    actionFactory.registerFactory(
      ActionType.PingLocation,
      new PingLocationActionFactoryModule.PingLocationActionFactory(game),
    );
    actionFactory.registerFactory(
      ActionType.DropPlayer,
      new DropPlayerActionFactoryModule.DropPlayerActionFactory(
        game,
        localPlayerName,
      ),
    );
    actionFactory.registerFactory(
      ActionType.ObserveGame,
      new ObserveGameActionFactoryModule.ObserveGameActionFactory(game),
    );
    actionFactory.registerFactory(
      ActionType.ResignGame,
      new ResignGameActionFactoryModule.ResignGameActionFactory(
        game,
        localPlayerName,
      ),
    );
    actionFactory.registerFactory(
      ActionType.DebugCommand,
      new DebugActionFactoryModule.DebugActionFactory(game),
    );
  }
}
