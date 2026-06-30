// === Reconstructed SystemJS module: engine/sound/Music ===
// deps: ["util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/sound/Music", ["util/math"], function (t, e) {
  "use strict";
  var i, r, s;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      var e;
      (((e = r || t("MusicType", (r = {})))[(e.Normal = 0)] = "Normal"),
        (e[(e.NormalShuffle = 1)] = "NormalShuffle"),
        (e.Intro = "INTRO"),
        (e.Score = "SCORE"),
        (e.Loading = "LOADING"),
        (e.Credits = "CREDITS"),
        (e.Options = "RA2Options"),
        t(
          "Music",
          (s = class {
            constructor(e, t, i) {
              ((this.audioSystem = e),
                (this.audioFiles = t),
                (this.musicSpecs = i),
                (this.playlist = []),
                (this.currentPlaylistIdx = -1),
                (this.shuffle = !1),
                (this.repeat = !1));
            }
            unserializeOptions(e) {
              var [t, i, r] = e.split(",");
              ((this.shuffle = Boolean(Number(t))), (this.repeat = Boolean(Number(i))), (this.initialRepeatName = r));
            }
            serializeOptions() {
              return [
                Number(this.shuffle),
                Number(this.repeat),
                this.repeat && -1 !== this.currentPlaylistIdx ? this.playlist[this.currentPlaylistIdx].name : void 0,
              ].join(",");
            }
            getShuffleMode() {
              return this.shuffle;
            }
            getRepeatMode() {
              return this.repeat;
            }
            getPlaylist() {
              return this.buildPlaylist(!1);
            }
            getCurrentPlaylistItem() {
              if (-1 !== this.currentPlaylistIdx) return this.playlist[this.currentPlaylistIdx];
            }
            dispose() {
              this.stopPlaying();
            }
            getMusicSpec(e) {
              var t = this.musicSpecs.getSpec(e);
              if (t) return t;
              console.warn(`Music "${e}" is not defined`);
            }
            async play(e) {
              var t, i;
              this.currentMusicType !== e &&
                (e === r.Normal || e === r.NormalShuffle
                  ? ((t = this.shuffle || e === r.NormalShuffle),
                    (this.playlist = this.buildPlaylist(t)),
                    (this.currentPlaylistIdx = 0),
                    !this.initialRepeatName ||
                      (-1 !== (i = this.playlist.findIndex((e) => e.name === this.initialRepeatName)) &&
                        (this.currentPlaylistIdx = i)),
                    (await this.playSpec(this.playlist[this.currentPlaylistIdx], () => this.advancePlaylist())) &&
                      (this.currentMusicType = e))
                  : (i = this.getMusicSpec(e))
                    ? (await this.playSpec(i)) && (this.currentMusicType = e)
                    : console.warn(`No music spec found for type "${e}"`));
            }
            stopPlaying() {
              (this.audioSystem.stopMusic(), (this.currentMusicType = void 0));
            }
            setShuffleMode(e) {
              if (e !== this.shuffle) {
                this.shuffle = e;
                let t = -1 !== this.currentPlaylistIdx ? this.playlist[this.currentPlaylistIdx] : void 0;
                ((this.playlist = this.buildPlaylist(this.shuffle)),
                  (this.currentPlaylistIdx = t ? this.playlist.findIndex((e) => e === t) : -1));
              }
            }
            setRepeatMode(e) {
              this.repeat = e;
            }
            async playSpec(e, t) {
              var i = await this.getMp3File(e.sound);
              return !!i && (await this.audioSystem.playMusicFile(i, e.repeat, t), !0);
            }
            async getMp3File(e) {
              var t = e.toLowerCase() + ".mp3";
              let i;
              try {
                i = await this.audioFiles.get(t);
              } catch (e) {
                return void console.error("Failed to fetch audio file", e);
              }
              if (i) return i;
              console.warn(`Audio file "${t}" not found.`);
            }
            buildPlaylist(e) {
              let t = this.musicSpecs.getAll().filter((e) => e.normal);
              return (e && (t = this.shufflePlaylist(t)), t);
            }
            shufflePlaylist(e) {
              let t = [];
              for (e = [...e]; e.length;) t.push(...e.splice(i.getRandomInt(0, e.length - 1), 1));
              return t;
            }
            async advancePlaylist() {
              ((this.currentPlaylistIdx = this.repeat
                ? this.currentPlaylistIdx
                : (this.currentPlaylistIdx + 1) % this.playlist.length),
                await this.playSpec(this.playlist[this.currentPlaylistIdx], () => this.advancePlaylist()));
            }
            async selectPlaylistItem(t) {
              var e = this.playlist?.findIndex((e) => e === t);
              -1 !== e &&
                ((this.currentPlaylistIdx = e),
                this.stopPlaying(),
                await this.playSpec(this.playlist[this.currentPlaylistIdx], () => this.advancePlaylist()));
            }
          }),
        ));
    },
  };
});
