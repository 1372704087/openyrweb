// vendor/worker-source.mjs — the engine's Web Worker endpoint.
//
// The engine spawns this with `threads.spawn(new Worker("dist/worker.js"))` and
// expects three job functions exposed via threads.js `expose()`:
//   - decodeWav(buffer)
//   - generateVxlGeometry(vxlPlain, options)
//   - compressFile(name, data)
//
// The original engine shipped its heavy WAV/VXL/compression worker logic in a
// separate chunk that was never published, so those jobs have always fallen back
// to the main thread (VxlGeometryMonotoneBuilder, inline WAV decode, etc.). We
// keep that behavior here: expose the functions so threads.js init succeeds
// (no "worker did not call expose()" timeout), but each job rejects so the
// engine's existing try/catch paths route to the main-thread implementations.

import { expose } from "threads/worker";

/** Decode a WAV/MP3 buffer into a playable AudioBuffer-shaped object.
 *  Rejected -> the engine decodes on the main thread. */
async function decodeWav(_buffer) {
  throw new Error("WORKER_UNAVAILABLE: worker.decodeWav rejected; using main-thread decoder");
}

/** Build a voxel geometry from a plain VXL description.
 *  Rejected -> the engine builds it on the main thread (VxlGeometryMonotoneBuilder). */
async function generateVxlGeometry(_vxlPlain, _options) {
  throw new Error("WORKER_UNAVAILABLE: worker.generateVxlGeometry rejected; using main-thread builder");
}

/** Compress a file for storage. Rejected -> the engine compresses on the main thread. */
async function compressFile(_name, _data) {
  throw new Error("WORKER_UNAVAILABLE: worker.compressFile rejected; using main-thread compression");
}

expose({ decodeWav, generateVxlGeometry, compressFile });
