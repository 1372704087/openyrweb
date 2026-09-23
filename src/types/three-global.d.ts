/**
 * Ambient declarations for the global THREE exposed by vendor/lib/three.min.js
 * (loaded via index.html, registered as the SystemJS "three" module).
 *
 * Minimal on purpose: members that game/math classes and the gfx/fx layer
 * inherit or call. Extend as TS conversion touches more of the gfx layer.
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
    equals(v: THREE.Vector2): boolean;
    setLength(length: number): this;
    sub(v: THREE.Vector2): this;
    length(): number;
    lengthSq(): number;
    distanceToSquared(v: THREE.Vector2): number;
    multiplyScalar(scalar: number): this;
    normalize(): this;
    floor(): this;
    lerp(v: THREE.Vector2, alpha: number): this;
    round(): this;
    angle(): number;
    rotateAround(center: THREE.Vector2, angle: number): this;
    [key: string]: any;
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
    addVectors(a: THREE.Vector3, b: THREE.Vector3): this;
    sub(v: THREE.Vector3): this;
    subVectors(a: THREE.Vector3, b: THREE.Vector3): this;
    multiplyScalar(scalar: number): this;
    crossVectors(a: THREE.Vector3, b: THREE.Vector3): this;
    lerp(v: THREE.Vector3, alpha: number): this;
    lerpVectors(a: THREE.Vector3, b: THREE.Vector3, alpha: number): this;
    applyMatrix4(m: THREE.Matrix4): this;
    applyQuaternion(q: THREE.Quaternion): this;
    toArray(): number[];
    length(): number;
    lengthSq(): number;
    equals(v: THREE.Vector3): boolean;
    distanceToSquared(v: THREE.Vector3): number;
    distanceTo(v: THREE.Vector3): number;
    dot(v: THREE.Vector3): number;
    projectOnVector(v: THREE.Vector3): this;
    normalize(): this;
    setFromMatrixPosition(m: THREE.Matrix4): this;
    [key: string]: any;
  }

  class Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x: number, y: number, z: number, w: number): this;
    copy(v: THREE.Vector4): this;
    clone(): this;
    [key: string]: any;
  }

  class Quaternion {
    _x: number;
    _y: number;
    _z: number;
    _w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    copy(q: THREE.Quaternion): this;
    normalize(): this;
    setFromEuler(e: THREE.Euler): this;
    setFromAxisAngle(axis: THREE.Vector3, angle: number): this;
    onChangeCallback(): void;
    [key: string]: any;
  }

  class Euler {
    x: number;
    y: number;
    z: number;
    order: string;
    isEuler: boolean;
    constructor(x?: number, y?: number, z?: number, order?: string);
    set(x: number, y: number, z: number, order?: string): this;
    copy(e: THREE.Euler): this;
    [key: string]: any;
  }

  class Matrix4 {
    elements: number[];
    constructor(...args: any[]);
    identity(): this;
    copy(m: THREE.Matrix4): this;
    clone(): this;
    getInverse(m: THREE.Matrix4): this;
    makeRotationFromQuaternion(q: THREE.Quaternion): this;
    compose(position: THREE.Vector3, quaternion: THREE.Quaternion, scale: THREE.Vector3): this;
    multiply(m: THREE.Matrix4): this;
    premultiply(m: THREE.Matrix4): this;
    [key: string]: any;
  }

  class Matrix3 {
    constructor(...args: any[]);
    [key: string]: any;
  }

  class ShadowMaterial extends Material {
    constructor(parameters?: any);
  }

  const Math: any;
  const MathUtils: any;
  const Frustum: any;
  const Plane: any;
  const Cylindrical: any;
  const Spherical: any;
  const CatmullRomCurve3: any;
  const QuadraticBezierCurve3: any;
  const CubicBezierCurve3: any;
  const Path: any;
  const Shape: any;
  const CurvePath: any;
  const Font: any;
  const FontLoader: any;
  const Cache: any;
  const Loader: any;
  const FileLoader: any;
  const Audio: any;
  const AudioListener: any;
  const AudioLoader: any;
  const PositionalAudio: any;
  const LOD: any;
  const Bone: any;
  const Skeleton: any;
  const SkinnedMesh: any;
  const InstancedMesh: any;
  const BufferGeometryUtils: any;
  const Triangle: any;
  const Line3: any;
  const MathUtils2: any;

  class Object3D {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    quaternion: THREE.Quaternion;
    scale: THREE.Vector3;
    matrix: THREE.Matrix4;
    matrixWorld: THREE.Matrix4;
    parent: THREE.Object3D | null;
    children: THREE.Object3D[];
    visible: boolean;
    name: string;
    userData: any;
    constructor();
    add(...objects: THREE.Object3D[]): this;
    remove(...objects: THREE.Object3D[]): this;
    lookAt(v: THREE.Vector3 | number): void;
    updateMatrixWorld(force?: boolean): void;
    traverse(callback: (object: THREE.Object3D) => void): void;
    getObjectById?(id: number): THREE.Object3D | undefined;
    raycast?(raycaster: any, intersects: any[]): void;
    dispose?(): void;
    [key: string]: any;
  }

  class Group extends Object3D {
    constructor();
  }

  class Mesh extends Object3D {
    geometry: any;
    material: any;
    constructor(geometry?: any, material?: any);
    [key: string]: any;
  }

  class Line extends Object3D {
    geometry: any;
    material: any;
    constructor(geometry?: any, material?: any);
    [key: string]: any;
  }

  class Geometry {
    vertices: THREE.Vector3[];
    colors: THREE.Color[];
    faces: any[];
    faceVertexUvs: any[][];
    constructor();
    dispose?(): void;
    computeFaceNormals?(): void;
    computeVertexNormals?(): void;
    [key: string]: any;
  }

  class BufferGeometry {
    attributes: Record<string, any>;
    constructor();
    setAttribute?(name: string, attribute: THREE.BufferAttribute): this;
    addAttribute?(name: string, attribute: THREE.BufferAttribute): this;
    setIndex?(index: any): this;
    dispose?(): void;
    computeBoundingSphere?(): void;
    [key: string]: any;
  }

  class BufferAttribute {
    array: any;
    itemSize: number;
    count: number;
    constructor(array: any, itemSize: number, normalized?: boolean);
    setXYZ?(index: number, x: number, y: number, z: number): this;
    setXYZW?(index: number, x: number, y: number, z: number, w: number): this;
    needsUpdate: boolean;
    [key: string]: any;
  }

  class PlaneGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, widthSegments?: number, heightSegments?: number);
  }

  class Color {
    r: number;
    g: number;
    b: number;
    constructor(color?: number | string | THREE.Color);
    constructor(r?: number, g?: number, b?: number);
    set(color: number | string | THREE.Color): this;
    setRGB(r: number, g: number, b: number): this;
    copy(c: THREE.Color): this;
    clone(): this;
    lerp(c: THREE.Color, alpha: number): this;
    getHex?(): number;
    getStyle?(): string;
    [key: string]: any;
  }

  class Material {
    color: THREE.Color;
    opacity: number;
    transparent: boolean;
    side: number;
    needsUpdate: boolean;
    dispose?(): void;
    [key: string]: any;
  }

  class MeshBasicMaterial extends Material {
    constructor(parameters?: any);
  }

  class MeshLambertMaterial extends Material {
    constructor(parameters?: any);
  }

  class MeshPhongMaterial extends Material {
    constructor(parameters?: any);
  }

  class LineBasicMaterial extends Material {
    constructor(parameters?: any);
  }

  class Texture {
    image: any;
    needsUpdate: boolean;
    flipY: boolean;
    constructor(image?: any);
    dispose?(): void;
    [key: string]: any;
  }

  class DataTexture extends Texture {
    constructor(data?: any, width?: number, height?: number, format?: any, type?: any);
  }

  class Ray {
    origin: THREE.Vector3;
    direction: THREE.Vector3;
    constructor(origin?: THREE.Vector3, direction?: THREE.Vector3);
    copy(ray: THREE.Ray): this;
    applyMatrix4(m: THREE.Matrix4): this;
    intersectsBox(box: THREE.Box3): boolean;
    intersectBox?(box: THREE.Box3, target?: THREE.Vector3): THREE.Vector3 | null;
    [key: string]: any;
  }

  class Box3 {
    min: THREE.Vector3;
    max: THREE.Vector3;
    constructor();
    setFromCenterAndSize(center: THREE.Vector3, size: THREE.Vector3): this;
    setFromObject?(object: THREE.Object3D): this;
    getCenter?(target: THREE.Vector3): THREE.Vector3;
    intersectsBox?(box: THREE.Box3): boolean;
    expandByObject?(object: THREE.Object3D): this;
    [key: string]: any;
  }

  class Sphere {
    constructor(center?: THREE.Vector3, radius?: number);
    [key: string]: any;
  }

  class Plane {
    constructor(normal?: THREE.Vector3, constant?: number);
    [key: string]: any;
  }

  // --- constants (numeric) ---
  const NoToneMapping: number;
  const LinearToneMapping: number;
  const ReinhardToneMapping: number;
  const CineonToneMapping: number;
  const ACESFilmicToneMapping: number;

  const AdditiveBlending: number;
  const NormalBlending: number;
  const SubtractiveBlending: number;
  const MultiplyBlending: number;
  const CustomBlending: number;

  const NoBlending: number;

  const AddEquation: number;
  const SubtractEquation: number;
  const ReverseSubtractEquation: number;
  const MinEquation: number;
  const MaxEquation: number;

  const ZeroFactor: number;
  const OneFactor: number;
  const SrcColorFactor: number;
  const OneMinusSrcColorFactor: number;
  const SrcAlphaFactor: number;
  const OneMinusSrcAlphaFactor: number;
  const DstAlphaFactor: number;
  const OneMinusDstAlphaFactor: number;
  const DstColorFactor: number;
  const OneMinusDstColorFactor: number;

  class Box2 {
    constructor(min?: THREE.Vector2, max?: THREE.Vector2);
    min: THREE.Vector2;
    max: THREE.Vector2;
    setFromPoints?(points: THREE.Vector2[]): this;
    expandByPoint?(point: THREE.Vector2): this;
    containsPoint?(point: THREE.Vector2): boolean;
    [key: string]: any;
  }

  const FrontSide: number;
  const BackSide: number;
  const DoubleSide: number;

  const FlatShading: number;
  const SmoothShading: number;

  const ZeroStencilFunc: number;
  const NeverStencilFunc: number;
  const LessStencilFunc: number;
  const EqualStencilFunc: number;
  const LessEqualStencilFunc: number;
  const GreaterStencilFunc: number;
  const NotEqualStencilFunc: number;
  const GreaterEqualStencilFunc: number;
  const AlwaysStencilFunc: number;

  const NearestFilter: number;
  const NearestMipMapNearestFilter: number;
  const NearestMipMapLinearFilter: number;
  const LinearFilter: number;
  const LinearMipMapNearestFilter: number;
  const LinearMipMapLinearFilter: number;

  const RepeatWrapping: number;
  const ClampToEdgeWrapping: number;
  const MirroredRepeatWrapping: number;

  const AlphaFormat: number;
  const RGBFormat: number;
  const RGBAFormat: number;
  const LuminanceFormat: number;
  const LuminanceAlphaFormat: number;
  const RGBEFormat: number;
  const DepthFormat: number;
  const DepthStencilFormat: number;

  const UnsignedByteType: number;
  const UnsignedShortType: number;
  const UnsignedIntType: number;
  const ByteType: number;
  const ShortType: number;
  const IntType: number;
  const FloatType: number;
  const HalfFloatType: number;

  const RGB_S3TC_DXT1_Format: number;
  const RGBA_S3TC_DXT1_Format: number;
  const RGBA_S3TC_DXT3_Format: number;
  const RGBA_S3TC_DXT5_Format: number;

  const VertexColors: number;

  const TriangleStripDrawMode: number;
  const TriangleFanDrawMode: number;

  const DynamicDrawUsage: number;
  const StaticDrawUsage: number;

  const Points: any;
  const PointsMaterial: any;
  const Sprite: any;
  const SpriteMaterial: any;
  const ShaderMaterial: any;
  const RawShaderMaterial: any;
  const MeshStandardMaterial: any;
  const MeshNormalMaterial: any;
  const LineSegments: any;
  const LineLoop: any;
  const PerspectiveCamera: any;
  const OrthographicCamera: any;
  const Scene: any;
  const WebGLRenderer: any;
  const Raycaster: any;
  const Clock: any;
  const HemisphereLight: any;
  const DirectionalLight: any;
  const AmbientLight: any;
  const PointLight: any;
  const SpotLight: any;
  const CanvasTexture: any;
  const TextureLoader: any;
  const ImageLoader: any;
  const BoxGeometry: any;
  const CircleGeometry: any;
  const CylinderGeometry: any;
  const SphereGeometry: any;
  const TorusGeometry: any;
  const RingGeometry: any;
  const PlaneBufferGeometry: any;
  const LatheGeometry: any;
  const ExtrudeGeometry: any;
  const ShapeGeometry: any;
  const EdgesGeometry: any;
  const WireframeGeometry: any;
  const GridHelper: any;
  const AxesHelper: any;
  const ArrowHelper: any;
  const PlaneBufferGeometry: any;
}
