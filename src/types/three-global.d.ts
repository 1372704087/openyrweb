/**
 * Ambient declarations for the global THREE exposed by vendor/lib/three.min.js
 * (loaded via index.html, registered as the SystemJS "three" module).
 *
 * Minimal on purpose: only the members that game/math classes inherit or call
 * need declarations. Extend as TS conversion touches more of the gfx layer.
 */

declare namespace THREE {
  class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): this;
    copy(v: THREE.Vector2): this;
    clone(): this;
    add(v: THREE.Vector2): this;
    addScalar(s: number): this;
    sub(v: THREE.Vector2): this;
    length(): number;
    lengthSq(): number;
    distanceToSquared(v: THREE.Vector2): number;
    round(): this;
    angle(): number;
    rotateAround(center: THREE.Vector2, angle: number): this;
  }

  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: THREE.Vector3): this;
    clone(): this;
    add(v: THREE.Vector3): this;
    toArray(): number[];
    length(): number;
    lengthSq(): number;
    distanceToSquared(v: THREE.Vector3): number;
    dot(v: THREE.Vector3): number;
    sub(v: THREE.Vector3): this;
    multiplyScalar(scalar: number): this;
    projectOnVector(v: THREE.Vector3): this;
    applyQuaternion(q: THREE.Quaternion): this;
  }

  class Quaternion {
    _x: number;
    _y: number;
    _z: number;
    _w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    copy(q: THREE.Quaternion): this;
    normalize(): this;
    onChangeCallback(): void;
  }

  class Euler {
    x: number;
    y: number;
    z: number;
    order: string;
    isEuler: boolean;
    constructor(x?: number, y?: number, z?: number, order?: string);
  }

  class Matrix4 {
    elements: number[];
  }
}
