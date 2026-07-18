// === Custom AI module: game/bot/custom-ai/logic/map/sector ===
System.register("game/bot/custom-ai/logic/map/sector", ["game/api/index", "game/bot/custom-ai/logic/map/map"], function (e, t) {
  "use strict";
  t && t.id;
  var MapApi, PlayerData, Size, Tile, Vector2;
  var calculateAreaVisibility;
  return {
    setters: [
      function (x) { MapApi = x.MapApi; PlayerData = x.PlayerData; Size = x.Size; Tile = x.Tile; Vector2 = x.Vector2; },
      function (x) { calculateAreaVisibility = x.calculateAreaVisibility; }
    ],
    execute: function () {
      var SECTOR_SIZE = 8;
      e("SECTOR_SIZE", SECTOR_SIZE);

      var Sector = (function () {
        function Sector(sectorStartPoint, sectorStartTile, sectorVisibilityPct, sectorVisibilityLastCheckTick) {
          this.sectorStartPoint = sectorStartPoint;
          this.sectorStartTile = sectorStartTile;
          this.sectorVisibilityPct = sectorVisibilityPct;
          this.sectorVisibilityLastCheckTick = sectorVisibilityLastCheckTick;
          this.sectorExploreAttempts = 0;
        }

        Sector.prototype.onExploreAttempted = function (currentTick) {
          this.sectorExploreAttempts++;
          this.sectorLastExploredAt = currentTick;
        };

        Sector.prototype.shouldAttemptExploration = function (currentTick, cooldown, limit) {
          if (limit >= this.sectorExploreAttempts) {
            return false;
          }
          if (this.sectorLastExploredAt && currentTick < this.sectorLastExploredAt + cooldown) {
            return false;
          }
          return true;
        };

        return Sector;
      })();
      e("Sector", Sector);

      var SectorCache = (function () {
        function SectorCache(mapApi, mapBounds) {
          this.mapBounds = mapBounds;
          this.sectorsX = Math.ceil(mapBounds.width / SECTOR_SIZE);
          this.sectorsY = Math.ceil(mapBounds.height / SECTOR_SIZE);
          this.sectors = new Array(this.sectorsX);
          for (var xx = 0; xx < this.sectorsX; ++xx) {
            this.sectors[xx] = new Array(this.sectorsY);
            for (var yy = 0; yy < this.sectorsY; ++yy) {
              var tileX = xx * SECTOR_SIZE;
              var tileY = yy * SECTOR_SIZE;
              this.sectors[xx][yy] = new Sector(
                new Vector2(tileX, tileY),
                mapApi.getTile(tileX, tileY),
                undefined,
                undefined
              );
            }
          }
        }

        SectorCache.prototype.getMapBounds = function () {
          return this.mapBounds;
        };

        SectorCache.prototype.updateSectors = function (currentGameTick, maxSectorsToUpdate, mapApi, playerData) {
          var nextSectorX = this.lastUpdatedSectorX ? this.lastUpdatedSectorX + 1 : 0;
          var nextSectorY = this.lastUpdatedSectorY ? this.lastUpdatedSectorY : 0;
          var updatedThisCycle = 0;

          while (updatedThisCycle < maxSectorsToUpdate) {
            if (nextSectorX >= this.sectorsX) {
              nextSectorX = 0;
              ++nextSectorY;
            }
            if (nextSectorY >= this.sectorsY) {
              nextSectorY = 0;
              nextSectorX = 0;
            }
            var sector = this.getSector(nextSectorX, nextSectorY);
            if (sector) {
              sector.sectorVisibilityLastCheckTick = currentGameTick;
              var sp = sector.sectorStartPoint;
              var ep = new Vector2(sp.x + SECTOR_SIZE, sp.y + SECTOR_SIZE);
              var visibility = calculateAreaVisibility(mapApi, playerData, sp, ep);
              if (visibility.validTiles > 0) {
                sector.sectorVisibilityPct = visibility.visibleTiles / visibility.validTiles;
              } else {
                sector.sectorVisibilityPct = undefined;
              }
            }
            this.lastUpdatedSectorX = nextSectorX;
            this.lastUpdatedSectorY = nextSectorY;
            ++nextSectorX;
            ++updatedThisCycle;
          }
        };

        SectorCache.prototype.getSectorUpdateRatio = function (sectorsUpdatedSinceGameTick) {
          var updated = 0, total = 0;
          for (var xx = 0; xx < this.sectorsX; ++xx) {
            for (var yy = 0; yy < this.sectorsY; ++yy) {
              var sector = this.sectors[xx][yy];
              if (
                sector &&
                sector.sectorVisibilityLastCheckTick &&
                sector.sectorVisibilityLastCheckTick >= sectorsUpdatedSinceGameTick
              ) {
                ++updated;
              }
              ++total;
            }
          }
          return updated / total;
        };

        SectorCache.prototype.getOverallVisibility = function () {
          var visible = 0, total = 0;
          for (var xx = 0; xx < this.sectorsX; ++xx) {
            for (var yy = 0; yy < this.sectorsY; ++yy) {
              var sector = this.sectors[xx][yy];
              if (sector.sectorVisibilityPct != undefined) {
                visible += sector.sectorVisibilityPct;
                total += 1.0;
              }
            }
          }
          return visible / total;
        };

        SectorCache.prototype.getSector = function (sectorX, sectorY) {
          if (sectorX < 0 || sectorX >= this.sectorsX || sectorY < 0 || sectorY >= this.sectorsY) {
            return undefined;
          }
          return this.sectors[sectorX][sectorY];
        };

        SectorCache.prototype.getSectorBounds = function () {
          return { width: this.sectorsX, height: this.sectorsY };
        };

        SectorCache.prototype.getSectorCoordinatesForWorldPosition = function (x, y) {
          if (x < 0 || x >= this.mapBounds.width || y < 0 || y >= this.mapBounds.height) {
            return undefined;
          }
          return {
            sectorX: Math.floor(x / SECTOR_SIZE),
            sectorY: Math.floor(y / SECTOR_SIZE),
          };
        };

        SectorCache.prototype.getSectorForWorldPosition = function (x, y) {
          var sectorCoordinates = this.getSectorCoordinatesForWorldPosition(x, y);
          if (!sectorCoordinates) {
            return undefined;
          }
          return this.sectors[Math.floor(x / SECTOR_SIZE)][Math.floor(y / SECTOR_SIZE)];
        };

        return SectorCache;
      })();
      e("SectorCache", SectorCache);
    },
  };
});
