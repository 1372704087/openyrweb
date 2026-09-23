/**
 * VxlGeometryMonotoneBuilder — 单调多边形切片体素几何（默认质量路径）。
 *
 * 由 engine/renderable/builder/vxlGeometry/VxlGeometryMonotoneBuilder.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 核心：沿主轴切片，用扫描线维护左右 run 的单调多边形，
 * 再扇形三角化；可选 flat 模式（只按 colorIndex，不算 normal）。
 */
import * as BufferGeometryUtilsModule from "engine/gfx/BufferGeometryUtils"; // 孪生

const BufferGeometryUtils = (BufferGeometryUtilsModule as any)
  .BufferGeometryUtils as any;

declare const THREE: any;

/** 体素几何源最小形状。 */
export interface VoxelSourceLike {
  getAllVoxels(): { voxelField: any };
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  minBounds: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  getNormals(): any[];
}

/** 切片算法输出的顶点。 */
interface MonoVertex {
  position: number[];
  value: number;
}

/** 单调 run（左右链上的 [a, n] 点序列）。 */
class MonotoneRun {
  color: number;
  left: number[][];
  right: number[][];

  constructor(color: number, n: number, left: number, right: number) {
    this.color = color;
    this.left = [[left, n]];
    this.right = [[right, n]];
  }

  /**
   * 在 n 处闭合 run（沿切片方向推进端点）。
   * @param n - 新端点坐标
   */
  close_off(n: number): void {
    this.left.push([this.left[this.left.length - 1][0], n]);
    this.right.push([this.right[this.right.length - 1][0], n]);
  }

  /**
   * 合并相邻 run 段（端点不一致时补点）。
   * @param n - 切片坐标
   * @param t - 期望左端
   * @param i - 期望右端
   */
  merge_run(n: number, t: number, i: number): void {
    const r = this.left[this.left.length - 1][0];
    const s = this.right[this.right.length - 1][0];
    if (r !== t) {
      this.left.push([r, n]), this.left.push([t, n]);
    }
    if (s !== i) {
      this.right.push([s, n]), this.right.push([i, n]);
    }
  }
}

/**
 * 内部扫描：对三轴各做一轮，生成 vertices + faces。
 * 与孪生 IIFE 算法逐行对齐（含 odd/even 扇形三角化）。
 */
function buildMonotoneMesh(
  sample: (x: number, y: number, z: number) => number,
  dims: number[],
): { vertices: MonoVertex[]; faces: number[][] } {
  const i: MonoVertex[] = [];
  const r: number[][] = [];
  for (let s = 0; s < 3; ++s) {
    const a = (s + 1) % 3;
    const n = (s + 2) % 3;
    const o = new Int32Array(3);
    const l = new Int32Array(3);
    let c = new Int32Array(2 * (dims[a] + 1));
    let h = new Int32Array(dims[a]);
    let u = new Int32Array(dims[a]);
    const d = new Int32Array(2 * dims[n]);
    const g = new Int32Array(2 * dims[n]);
    const p = new Int32Array(24 * dims[n]);
    const m: number[][] = [
      [0, 0],
      [0, 0],
    ];
    // C 与孪生 var 同域：跨 o[n] 循环后仍用于 close_off 扫描
    let C = 0;
    for (l[s] = 1, o[s] = -1; o[s] < dims[s]; ) {
      let f: MonotoneRun[] = [];
      let y = 0;
      for (o[n] = 0; o[n] < dims[n]; ++o[n]) {
        let T = 0;
        let v = 0;
        let b = 0;
        for (o[a] = 0; o[a] < dims[a]; ++o[a], v = b) {
          const S = o[s] >= 0 ? sample(o[0], o[1], o[2]) : 0;
          const w = o[s] < dims[s] - 1
            ? sample(o[0] + l[0], o[1] + l[1], o[2] + l[2])
            : 0;
          // 孪生：!(b = S) == !w ? (b = 0) : S || (b = -w)
          b = S;
          if (!b === !w) {
            b = 0;
          } else if (!S) {
            b = -w;
          }
          if (v !== b) {
            c[T++] = o[a];
            c[T++] = b;
          }
        }
        c[T++] = dims[a];
        const E = (c[T++] = 0);
        let x = 0;
        let Eidx = E;
        C = 0;
        for (; C < y && x < T - 2; ) {
          const run = f[h[C]];
          const O = run.left[run.left.length - 1][0];
          const A = run.right[run.right.length - 1][0];
          const M = run.color;
          const R = c[x];
          const P = c[x + 2];
          const I = c[x + 1];
          if (O < P && R < A && I === M) {
            run.merge_run(o[n], R, P);
            (u[Eidx++] = h[C]), ++C, (x += 2);
          } else {
            if (P <= A) {
              if (I) {
                const k = new MonotoneRun(I, o[n], R, P);
                (u[Eidx++] = f.length), f.push(k);
              }
              x += 2;
            }
            if (A <= P) {
              run.close_off(o[n]);
              ++C;
            }
          }
        }
        for (; C < y; ++C) f[h[C]].close_off(o[n]);
        for (; x < T - 2; x += 2) {
          const R = c[x];
          const P = c[x + 2];
          const I = c[x + 1];
          if (I) {
            const k = new MonotoneRun(I, o[n], R, P);
            (u[Eidx++] = f.length), f.push(k);
          }
        }
        // 交换双缓冲
        const B = u;
        u = h;
        h = B;
        y = Eidx;
      }
      for (C = 0; C < y; ++C) {
        f[h[C]].close_off(dims[n]);
      }
      o[s]++;
      for (let C = 0; C < f.length; ++C) {
        const N = f[C];
        let j = false;
        let b: number = N.color;
        if (b < 0) {
          j = true;
          b = -b;
        }
        for (let x = 0; x < N.left.length; ++x) {
          d[x] = i.length;
          const L = [0, 0, 0];
          const D = N.left[x];
          (L[s] = o[s]), (L[a] = D[0]), (L[n] = D[1]);
          i.push({ position: L, value: b });
        }
        for (let x = 0; x < N.right.length; ++x) {
          g[x] = i.length;
          const L = [0, 0, 0];
          const D = N.right[x];
          (L[s] = o[s]), (L[a] = D[0]), (L[n] = D[1]);
          i.push({ position: L, value: b });
        }
        let F = 0;
        let _ = 0;
        let U = 1;
        let H = 1;
        let G = true;
        (p[_++] = d[0]),
          (p[_++] = N.left[0][0]),
          (p[_++] = N.left[0][1]),
          (p[_++] = g[0]),
          (p[_++] = N.right[0][0]),
          (p[_++] = N.right[0][1]);
        while (U < N.left.length || H < N.right.length) {
          let z = false;
          if (U === N.left.length) {
            z = true;
          } else if (H !== N.right.length) {
            const V = N.left[U];
            const W = N.right[H];
            z = V[1] > W[1];
          }
          const K = z ? g[H] : d[U];
          const q = z ? N.right[H] : N.left[U];
          if (z !== G) {
            while (F + 3 < _) {
              if (j === z) r.push([p[F], p[F + 3], K]);
              else r.push([p[F + 3], p[F], K]);
              F += 3;
            }
          } else {
            while (F + 3 < _) {
              for (let x = 0; x < 2; ++x)
                for (let $ = 0; $ < 2; ++$)
                  m[x][$] = p[_ - 3 * (x + 1) + $ + 1] - q[$];
              const Q = m[0][0] * m[1][1] - m[1][0] * m[0][1];
              if (z === Q > 0) break;
              if (Q !== 0) {
                if (j === z) r.push([p[_ - 3], p[_ - 6], K]);
                else r.push([p[_ - 6], p[_ - 3], K]);
              }
              _ -= 3;
            }
          }
          (p[_++] = K),
            (p[_++] = q[0]),
            (p[_++] = q[1]),
            z ? ++H : ++U,
            (G = z);
        }
      }
    }
  }
  return { vertices: i, faces: r };
}

/**
 * 单调切片 VXL 几何构建器（默认质量路径）。
 * flat=true：只采样 colorIndex；否则 normalIndex+256*colorIndex 合成标量。
 */
export class VxlGeometryMonotoneBuilder {
  /**
   * 构建 BufferGeometry。
   * @param e - 体素源
   * @param t - flat 模式（跳过法线属性，后续 computeVertexNormals）
   */
  build(e: VoxelSourceLike, t: boolean = false): any {
    const s = e.getAllVoxels().voxelField;
    const { vertices: i, faces: r } = buildMonotoneMesh(
      t
        ? (x: number, y: number, z: number) => {
            const cell = s.get(x, y, z);
            return cell ? cell.colorIndex : 0;
          }
        : (x: number, y: number, z: number) => {
            const cell = s.get(x, y, z);
            return cell ? cell.normalIndex + 256 * cell.colorIndex : 0;
          },
      [e.sizeX, e.sizeY, e.sizeZ],
    );
    const a = e.minBounds;
    const n = e.scale;
    const o = e.getNormals();
    const l = new Float32Array(3 * i.length);
    const c = new Float32Array(3 * i.length);
    const h = new Float32Array(3 * i.length);
    let u = 0;
    let d = 0;
    let g = 0;
    for (let b = 0, S = i.length; b < S; b++) {
      const p = i[b];
      const m = t ? p.value : (p.value / 256) | 0;
      const q = t ? 0 : p.value % 256;
      (l[u++] = a.x + p.position[0] * n.x),
        (l[u++] = a.y + p.position[1] * n.y),
        (l[u++] = a.z + p.position[2] * n.z),
        (h[g++] = m / 255),
        (h[g++] = 0),
        // color.z = normalIndex/255：VPL 片段着色器据此判断 stale normal（≥253 → ambient 页 16）
        (h[g++] = q / 255);
      if (!t) {
        const normal = o[Math.min(q, o.length - 1)];
        (c[d++] = normal.x), (c[d++] = normal.y), (c[d++] = normal.z);
      }
    }
    const f = new Uint32Array(3 * r.length);
    let y = 0;
    for (let w = 0, E = r.length; w < E; w++) {
      const T = r[w];
      (f[y++] = T[0]), (f[y++] = T[1]), (f[y++] = T[2]);
    }
    let v = new THREE.BufferGeometry();
    v.addAttribute("position", new THREE.BufferAttribute(l, 3));
    if (!t) v.addAttribute("normal", new THREE.BufferAttribute(c, 3));
    v.addAttribute("color", new THREE.BufferAttribute(h, 3));
    v.setIndex(new THREE.BufferAttribute(f, 1));
    v = BufferGeometryUtils.mergeVertices(v);
    v.computeBoundingBox();
    if (t) v.computeVertexNormals();
    return v;
  }
}
