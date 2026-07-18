// === Custom AI module: game/bot/custom-ai/logic/mission/actionBatcher ===
System.register("game/bot/custom-ai/logic/mission/actionBatcher", ["game/api/index", "game/bot/custom-ai/logic/common/utils"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, MapApi, OrderType, Vector2, groupBy;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        MapApi = A.MapApi;
        OrderType = A.OrderType;
        Vector2 = A.Vector2;
      },
      function (B) {
        groupBy = B.groupBy;
      },
    ],
    execute: function () {

      // Used to group related actions together to minimise actionApi calls. For example, if multiple units
      // are ordered to move to the same location, all of them will be ordered to move in a single action.
      var BatchableAction = /** @class */ (function () {
        function BatchableAction(_unitId, _orderType, _point, _targetId, _nonce) {
          if (_nonce === void 0) { _nonce = 0; }
          this._unitId = _unitId;
          this._orderType = _orderType;
          this._point = _point;
          this._targetId = _targetId;
          this._nonce = _nonce;
        }
        BatchableAction.noTarget = function (unitId, orderType, nonce) {
          if (nonce === void 0) { nonce = 0; }
          return new BatchableAction(unitId, orderType, undefined, undefined, nonce);
        };
        BatchableAction.toPoint = function (unitId, orderType, point, nonce) {
          if (nonce === void 0) { nonce = 0; }
          return new BatchableAction(unitId, orderType, point, undefined);
        };
        BatchableAction.toTargetId = function (unitId, orderType, targetId, nonce) {
          if (nonce === void 0) { nonce = 0; }
          return new BatchableAction(unitId, orderType, undefined, targetId, nonce);
        };
        Object.defineProperty(BatchableAction.prototype, "unitId", {
          get: function () { return this._unitId; },
          enumerable: false,
          configurable: true,
        });
        Object.defineProperty(BatchableAction.prototype, "orderType", {
          get: function () { return this._orderType; },
          enumerable: false,
          configurable: true,
        });
        Object.defineProperty(BatchableAction.prototype, "point", {
          get: function () { return this._point; },
          enumerable: false,
          configurable: true,
        });
        Object.defineProperty(BatchableAction.prototype, "targetId", {
          get: function () { return this._targetId; },
          enumerable: false,
          configurable: true,
        });
        BatchableAction.prototype.isSameAs = function (other) {
          if (this._unitId !== other._unitId) return false;
          if (this._orderType !== other._orderType) return false;
          if (this._point !== other._point) return false;
          if (this._targetId !== other._targetId) return false;
          if (this._nonce !== other._nonce) return false;
          return true;
        };
        return BatchableAction;
      }());
      e("BatchableAction", BatchableAction);

      var ActionBatcher = /** @class */ (function () {
        function ActionBatcher() {
          this.actions = [];
        }
        ActionBatcher.prototype.push = function (action) {
          this.actions.push(action);
        };
        ActionBatcher.prototype.resolve = function (actionsApi, gameApi) {
          var groupedCommands = groupBy(this.actions, function (action) { return action.orderType.valueOf().toString(); });
          var vectorToStr = function (v) { return v.x + "," + v.y; };
          var strToVector = function (str) {
            var parts = str.split(",");
            return new Vector2(parseInt(parts[0]), parseInt(parts[1]));
          };
          Object.entries(groupedCommands).forEach(function (_a) {
            var commandValue = _a[0], commands = _a[1];
            var commandType = parseInt(commandValue);
            var byTarget = groupBy(
              commands.filter(function (command) { return !!command.targetId; }),
              function (command) { return command.targetId.toString(); },
            );
            Object.entries(byTarget).forEach(function (_b) {
              var targetId = _b[0], unitCommands = _b[1];
              actionsApi.orderUnits(
                unitCommands.map(function (command) { return command.unitId; }),
                commandType,
                parseInt(targetId),
              );
            });
            var validByPosition = groupBy(
              commands.filter(function (command) {
                return !!command.point && gameApi && gameApi.mapApi.getTile(command.point.x, command.point.y);
              }),
              function (command) { return vectorToStr(command.point); },
            );
            Object.entries(validByPosition).forEach(function (_c) {
              var point = _c[0], unitCommands = _c[1];
              var vector = strToVector(point);
              actionsApi.orderUnits(
                unitCommands.map(function (command) { return command.unitId; }),
                commandType,
                vector.x,
                vector.y,
              );
            });
            var noTargets = commands.filter(function (command) { return !command.targetId && !command.point; });
            if (noTargets.length > 0) {
              actionsApi.orderUnits(
                noTargets.map(function (action) { return action.unitId; }),
                commandType,
              );
            }
          });
        };
        return ActionBatcher;
      }());
      e("ActionBatcher", ActionBatcher);
    },
  };
});
