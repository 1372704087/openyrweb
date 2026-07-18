// === Reconstructed SystemJS module: LocalPrefs ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("LocalPrefs", [], function (t, e) {
  "use strict";
  var i, r;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("StorageKey", (i = {}))).GameRes = "_r_gameRes"),
        (e.Options = "_r_opts_v3"),
        (e.Mixer = "_r_mixer_v3"),
        (e.MusicOpts = "_r_opts_music"),
        (e.LastGpuTier = "_r_last_gpu"),
        (e.LastSeenPatch = "_r_last_patch"),
        (e.LastMap = "_r_lastMap"),
        (e.LastMode = "_r_lastMode"),
        (e.LastSortMap = "_r_lastSortMap"),
        (e.LastPlayerCountry = "_r_lastCountry"),
        (e.LastPlayerColor = "_r_lastColor"),
        (e.LastPlayerStartPos = "_r_lastStartPos"),
        (e.LastPlayerTeam = "_r_lastTeam"),
        (e.LastQueueRanked = "_r_lastRanked"),
        (e.LastQueueType = "_r_lastQueueType"),
        (e.LastBots = "_r_lastBots"),
        (e.LastHostObserver = "_r_lastHostObserver"),
        (e.PreferredGameOpts = "_r_hostOpts"),
        (e.LastConnection = "_r_lastCon"),
        (e.PreferredServerRegion = "_r_region"),
        (e.TauntsEnabled = "_r_taunts"),
        (e.DonateBoxState = "_r_donateBoxState"),
        (e.PartyNoInvites = "_r_partyNoInvites"),
        t(
          "LocalPrefs",
          (r = class {
            constructor(e) {
              this.storage = e;
            }
            getItem(t) {
              try {
                return this.storage?.getItem(t) ?? void 0;
              } catch (e) {
                return void console.warn(`Unable to read key ${t} from localStorage.`, e);
              }
            }
            setItem(t, e) {
              try {
                return (this.storage?.setItem(t, e), !0);
              } catch (e) {
                return (console.warn(`Unable to write key ${t} to localStorage.`, e), !1);
              }
            }
            removeItem(t) {
              try {
                this.storage?.removeItem(t);
              } catch (e) {
                console.warn(`Unable to remove key ${t} from localStorage.`, e);
              }
            }
            listItems() {
              return this.storage ? Object.keys(this.storage) : [];
            }
          }),
        ));
    },
  };
});
