// === Reconstructed SystemJS module: engine/sound/AudioSystem ===
// deps: ["engine/sound/ChannelType","util/disposable/CompositeDisposable","engine/sound/InternalPlaybackHandle","engine/sound/AudioLoop","engine/sound/AudioSequence"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/sound/AudioSystem",
  [
    "engine/sound/ChannelType",
    "util/disposable/CompositeDisposable",
    "engine/sound/InternalPlaybackHandle",
    "engine/sound/AudioLoop",
    "engine/sound/AudioSequence",
  ],
  function (e, t) {
    "use strict";
    var a, i, d, u, l, n, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        ((n =
          "data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"),
          e(
            "AudioSystem",
            (r = class {
              constructor(e) {
                ((this.mixer = e),
                  (this.channels = new Map()),
                  (this.audioBufferCache = new Map()),
                  (this.disposables = new i.CompositeDisposable()),
                  (this.soundsPlaying = new Set()),
                  (this.handleVolumeChange = (e, t) => {
                    this.getChannel(e).gain.value = t.isMuted(e) ? 0 : t.getVolume(e);
                  }));
              }
              isInitialized() {
                return !!this.audioContext;
              }
              isSuspended() {
                return "running" !== this.audioContext?.state;
              }
              initialize() {
                this.isInitialized() ||
                  ((this.audioContext = new AudioContext()),
                  this.mixer.onVolumeChange.subscribe(this.handleVolumeChange),
                  this.disposables.add(() => this.mixer.onVolumeChange.unsubscribe(this.handleVolumeChange)),
                  this.createChannels(this.audioContext, this.mixer));
              }
              dispose() {
                (this.disposables.dispose(),
                  this.audioContext && (this.audioContext.close(), this.soundsPlaying.clear()));
              }
              createChannels(r, i) {
                let e = Object.keys(a.ChannelType)
                  .map(Number)
                  .filter((e) => !Number.isNaN(e));
                e.forEach((e) => {
                  let t = r.createGain();
                  ((t.gain.value = i.getVolume(e)), this.channels.set(e, t));
                });
                let s = this.getChannel(a.ChannelType.Master);
                e.forEach((e) => {
                  let t = this.getChannel(e);
                  var i;
                  e === a.ChannelType.Master
                    ? t.connect(r.destination)
                    : e === a.ChannelType.Effect
                      ? ((i = r.createDynamicsCompressor()), t.connect(i).connect(s))
                      : t.connect(s);
                });
              }
              getChannel(e) {
                if (!this.channels.has(e)) throw new Error(`Sound channel "${e}" doesn't exist`);
                return this.channels.get(e);
              }
              setMuted(e) {
                this.mixer.setMuted(a.ChannelType.Master, e);
              }
              playWavFile(e, t, i = 1, r = 0, s = 0, a = 1, n = !1) {
                if (!this.isInitialized())
                  throw new Error("Can't play audio file because audio system is not initialized");
                var o = this.audioContext.currentTime + s / 1e3;
                return (this.removeSuspendedSounds(), this.playWavFileAtTime(e, t, o, i, r, a, n));
              }
              removeSuspendedSounds() {
                this.isSuspended() &&
                  this.soundsPlaying.forEach((e) => {
                    try {
                      e.stop();
                    } catch (e) {
                      console.error(e);
                    }
                  });
              }
              playWavLoop(e, n, t = 1, i = 0, r, s = 1, a = !1, o = !1, l = Number.POSITIVE_INFINITY) {
                if (!this.isInitialized())
                  throw new Error("Can't play audio sequence because audio system is not initialized");
                let c = this.audioContext;
                this.removeSuspendedSounds();
                let h = new u.AudioLoop(c, t, i, s, r, a, o, l, (e, t, i, r, s) => {
                  var a = new d.InternalPlaybackHandle();
                  return { handle: a, source: this.playAudioBuffer(a, e, n, i, r, t, s, !1) };
                });
                return (
                  Promise.all(e.map((e) => this.decodeFile(e, c)))
                    .then((e) => {
                      h.setBuffers(e);
                    })
                    .catch((e) => console.error(e)),
                  h.start(c.currentTime),
                  h
                );
              }
              playWavSequence(e, n, t = 1, i = 0, r = 0, s = 1) {
                if (!this.isInitialized())
                  throw new Error("Can't play audio sequence because audio system is not initialized");
                let a = this.audioContext;
                this.removeSuspendedSounds();
                let o = new l.AudioSequence(a, t, i, s, r, (e, t, i, r, s) => {
                  var a = new d.InternalPlaybackHandle();
                  return { handle: a, source: this.playAudioBuffer(a, e, n, i, r, t, s, !1) };
                });
                return (
                  Promise.all(e.map((e) => this.decodeFile(e, a)))
                    .then((e) => {
                      o.setBuffers(e);
                    })
                    .catch((e) => console.error(e)),
                  o.start(a.currentTime),
                  o
                );
              }
              async decodeFile(e, t) {
                let i = this.audioBufferCache.get(e);
                var r;
                return (
                  i ||
                    ((r = new Uint8Array(e.getData()).buffer),
                    (i = await t.decodeAudioData(r)),
                    100 <= this.audioBufferCache.size &&
                      this.audioBufferCache.delete(this.audioBufferCache.keys().next().value),
                    this.audioBufferCache.set(e, i)),
                  i
                );
              }
              playWavFileAtTime(i, r, s, a = 1, n = 0, o = 1, l = !1) {
                if (!this.isInitialized())
                  throw new Error("Can't play audio file because audio system is not initialized");
                let c = this.audioContext,
                  h = new d.InternalPlaybackHandle();
                var e = this.audioBufferCache.get(i);
                if (e) this.playAudioBuffer(h, e, r, a, n, s, o, l);
                else {
                  let t;
                  try {
                    var u = i.getData();
                    t = new Uint8Array(u).buffer;
                  } catch (e) {
                    return (console.error("Failed to decode wav file", e), h);
                  }
                  (async () => {
                    var e = await c.decodeAudioData(t);
                    (100 <= this.audioBufferCache.size &&
                      this.audioBufferCache.delete(this.audioBufferCache.keys().next().value),
                      this.audioBufferCache.set(i, e),
                      h.stopRequested || this.playAudioBuffer(h, e, r, a, n, s, o, l));
                  })().catch((e) => console.error(e));
                }
                return h;
              }
              playAudioBuffer(e, t, i, r, s, a, n, o) {
                let l = this.audioContext,
                  c = l.createGain();
                c.gain.value = r;
                let h = l.createStereoPanner();
                h.pan.value = s;
                let u = l.createBufferSource();
                return (
                  (u.buffer = t),
                  (u.playbackRate.value = n),
                  (u.loop = o),
                  u.connect(h).connect(c).connect(this.getChannel(i)),
                  e.setNodes(u, c, h),
                  u.addEventListener("ended", () => {
                    (this.soundsPlaying.delete(u), (e.playing = !1));
                  }),
                  this.soundsPlaying.add(u),
                  u.start(a),
                  u
                );
              }
              async initMusicLoop() {
                if (!this.isInitialized())
                  throw new Error("Can't initialize music loop because audio system is not initialized");
                this.musicState || this.initMusicNode();
              }
              async playMusicFile(e, t, i) {
                if (!this.isInitialized())
                  throw new Error("Can't play audio file because audio system is not initialized");
                (this.removeSuspendedSounds(), this.stopMusic());
                let r = this.musicState ?? this.initMusicNode(),
                  s = r.source.mediaElement;
                s.loop = t;
                let a = (s.src = URL.createObjectURL(e.asFile()));
                ((s.onended = s.onpause =
                  () => {
                    (URL.revokeObjectURL(a), (s = void 0));
                  }),
                  i && ((r.onEnd = i), s.addEventListener("ended", r.onEnd, { once: !0 })),
                  await this.playOrResumeMusic());
              }
              initMusicNode() {
                let e = this.audioContext,
                  t = e.createGain();
                t.gain.value = 1;
                let i = e.createStereoPanner();
                i.pan.value = 0;
                let r = document.createElement("audio");
                ((r.src = n), (r.loop = !0));
                let s = e.createMediaElementSource(r);
                return (
                  (this.musicState = { source: s, playing: !1 }),
                  s.addEventListener("ended", () => {
                    this.musicState.playing = !1;
                  }),
                  s.connect(i).connect(t).connect(this.getChannel(a.ChannelType.Music)),
                  this.musicState
                );
              }
              async playOrResumeMusic() {
                if (this.musicState && !this.musicState.playing) {
                  this.musicState.playing = !0;
                  try {
                    await this.musicState.source.mediaElement.play()?.catch((e) => console.error(e));
                  } catch (e) {
                    (console.error(e), (this.musicState.playing = !1));
                  }
                }
              }
              stopMusic() {
                if (this.musicState?.playing)
                  try {
                    (this.musicState.onEnd &&
                      this.musicState.source.mediaElement.removeEventListener("ended", this.musicState.onEnd),
                      this.musicState.source.mediaElement.pause(),
                      (this.musicState.source.mediaElement.src = n),
                      (this.musicState.playing = !1),
                      (this.musicState.onEnd = void 0));
                  } catch (e) {
                    console.error(e);
                  }
              }
            }),
          ));
      },
    };
  },
);
