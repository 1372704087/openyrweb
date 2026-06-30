# Third-Party Licenses

This project bundles third-party open-source software. Sources, attribution,
and licenses are listed below. Each component is reproduced in this repository
under the terms of its own license.

## npm dependencies (bundled into `vendor/dist/vendor.bundle.js` and `worker.js`)

Bundled at build time from the npm registry by `tools/build-vendor.mjs`.

| Package | Version | License |
|---|---|---|
| react | 16.13.1 | MIT |
| react-dom | 16.13.1 | MIT |
| classnames | 2.5.1 | MIT |
| three.meshline | 1.3.0 | MIT |
| stats.js | 0.17.0 | MIT |
| js-logger | 1.6.1 | MIT |
| wavefile | 11.0.0 | MIT |
| sprintf-js | 1.1.3 | BSD-3-Clause |
| mersenne-twister | 1.1.0 | MIT |
| pcx-js | 1.1.1 | MIT |
| @sentry/browser | 8.x | MIT |
| threads | 1.7.0 | MIT |
| detect-gpu | 5.0.70 | MIT |
| liang-barsky | 1.0.12 | MIT |
| file-system-access | 1.0.4 | MIT |
| fontfaceobserver | 2.3.0 | BSD-2-Clause |
| @puzzl/core | 1.0.0-beta.1 | MIT |

> `react`/`react-dom` are pinned to 16.13.1 and `three.meshline` to 1.3.0 for
> compatibility with the engine (see `tools/build-vendor.mjs`).

## Vendored single-file libraries (`vendor/lib/`)

| Library | Source | License |
|---|---|---|
| three.js | https://threejs.org (r94) | MIT |
| three addons (MeshLine-free: SPE, Octree, TrailRenderer, LightningStrike, SimplexNoise, shader-patch) | threejs.org examples / respective authors | MIT |
| SystemJS | https://github.com/systemjs/systemjs (v0.19.41) | MIT |
| minilzo-js (lzo1x.js) | Alistair Braidwood, port of minilzo | GPL-2.0+ (see header) |
| growingpacker | bin-packing | MIT (see header) |
| fullscreen-api-polyfill | — | MIT |

## Vendored tools (`vendor/dist/`)

| Tool | Source | License |
|---|---|---|
| 7-Zip for WASM (7zz.js / 7zz.wasm) | https://www.7-zip.org (Igor Pavlov) + Emscripten port | LGPL-2.1 (see 7-Zip LICENSE) |
| ffmpeg.wasm (ffmpeg.min.js, ffmpeg-core.{js,wasm}) | https://github.com/ffmpegwasm | MIT |
| web-audio-polyfill | — | MIT |

## Fonts (`vendor/res/fonts/`)

| Font | Source | License |
|---|---|---|
| Fira Sans Condensed (woff2 subset) | https://fonts.google.com/specimen/Fira+Sans+Condensed | SIL Open Font License 1.1 |

## This project

OpenYRWeb itself is licensed under the Apache License, Version 2.0 (see
`../LICENSE`). Red Alert 2™ and Yuri's Revenge™ are trademarks of Electronic
Arts; this project is unaffiliated with EA and distributes none of their
copyrighted game assets.
