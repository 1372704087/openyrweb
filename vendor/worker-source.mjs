// vendor/worker-source.mjs — the engine's Web Worker endpoint.
//
// The engine spawns this with `threads.spawn(new Worker("dist/worker.js"))` and
// expects three job functions exposed via threads.js `expose()`:
//   - decodeWav(buffer)
//   - generateVxlGeometry(vxlPlain, options)
//   - compressFile(name, data)
//
// This file now implements all three functions fully in the worker,
// parallelizing the previously main-thread-only heavy operations.

import { expose } from "threads/worker";
import { WaveFile } from "wavefile";

// =============================================================================
// Vec3 — lightweight polyfill for THREE.Vector3 (no DOM dependency)
// =============================================================================
class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }
}

// =============================================================================
// VoxelField — 3D grid for voxel lookup (ported from data/vxl/VoxelField)
// =============================================================================
class VoxelField {
  constructor(sizeX, sizeY, sizeZ) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
    this.arr = new Array(sizeX * sizeY * sizeZ);
  }
  add(voxel) {
    this.arr[voxel.x + voxel.y * this.sizeX + voxel.z * this.sizeX * this.sizeY] = voxel;
  }
  get(x, y, z) {
    if (x < 0 || y < 0 || z < 0 || x >= this.sizeX || y >= this.sizeY || z >= this.sizeZ) return undefined;
    return this.arr[x + y * this.sizeX + z * this.sizeX * this.sizeY];
  }
}

// =============================================================================
// Normals data (ported from data/vxl/normals — plain arrays of Vec3)
// =============================================================================
const normals1 = [
  new Vec3(0.54946297, -183e-6, -0.835518),
  new Vec3(0.00014400001, 0.54940403, -0.83555698),
  new Vec3(-0.54940403, -68000001e-12, -0.83555698),
  new Vec3(106e-6, -0.54946297, -0.835518),
  new Vec3(0.94900799, 0.00031599999, -0.31525001),
  new Vec3(-186e-6, 0.94899702, -0.31528401),
  new Vec3(-0.94899702, 0.00031800001, -0.31528401),
  new Vec3(-447e-6, -0.94900799, -0.31525001),
  new Vec3(0.95084399, -279e-6, 0.30967101),
  new Vec3(202e-6, 0.95084798, 0.30965701),
  new Vec3(-0.95084798, -70000002e-12, 0.30965701),
  new Vec3(147e-6, -0.95084399, 0.30967101),
  new Vec3(0.55237001, -11e-6, 0.83359897),
  new Vec3(19999999e-12, 0.55238003, 0.833592),
  new Vec3(-0.55238003, 57000001e-12, 0.83359301),
  new Vec3(-66000001e-12, -0.55237001, 0.83359897),
];

const normals2 = [
  new Vec3(0.67121398, 0.19849201, -0.714194),
  new Vec3(0.26964301, 0.58439398, -0.76536),
  new Vec3(-0.040546, 0.096988, -0.99445897),
  new Vec3(-0.57242799, -0.091913998, -0.81478697),
  new Vec3(-0.17140099, -0.57270998, -0.80163902),
  new Vec3(0.36255699, -0.30299899, -0.88133103),
  new Vec3(0.81034702, -0.34897199, -0.470698),
  new Vec3(0.103962, 0.93867201, -0.328767),
  new Vec3(-0.324047, 0.58766901, -0.74137598),
  new Vec3(-0.80086499, 0.34046099, -0.49264699),
  new Vec3(-0.66549802, -0.59014702, -0.45698899),
  new Vec3(0.314767, -0.803002, -0.506073),
  new Vec3(0.97262901, 0.151076, -0.17655),
  new Vec3(0.680291, 0.68423599, -0.26272699),
  new Vec3(-0.52007902, 0.82777703, -0.210483),
  new Vec3(-0.96164399, -0.179001, -0.207847),
  new Vec3(-0.262714, -0.937451, -0.22840101),
  new Vec3(0.219707, -0.97130102, 0.091124997),
  new Vec3(0.92380798, -0.229975, 0.30608699),
  new Vec3(-0.082488999, 0.97065997, 0.225866),
  new Vec3(-0.59179801, 0.69678998, 0.40528899),
  new Vec3(-0.92529601, 0.36660099, 0.097111002),
  new Vec3(-0.705051, -0.68777502, 0.172828),
  new Vec3(0.7324, -0.68036699, -0.026304999),
  new Vec3(0.85516202, 0.37458199, 0.358311),
  new Vec3(0.47300601, 0.83648002, 0.276705),
  new Vec3(-0.097617, 0.65411198, 0.750072),
  new Vec3(-0.90412402, -0.153725, 0.39865801),
  new Vec3(-0.211916, -0.85808998, 0.46773201),
  new Vec3(0.50022697, -0.67440802, 0.543091),
  new Vec3(0.584539, -0.110249, 0.80384099),
  new Vec3(0.43737301, 0.45464399, 0.77588898),
  new Vec3(-0.042440999, 0.083318003, 0.995619),
  new Vec3(-0.59625101, 0.22013199, 0.77202803),
  new Vec3(-0.506455, -0.39697701, 0.76544899),
  new Vec3(0.070569001, -0.47847399, 0.87526202),
];

const normals3 = [
  new Vec3(0.45651099, -0.073968001, -0.88663799),
  new Vec3(0.50769401, 0.38511699, -0.77067),
  new Vec3(0.095431998, 0.22666401, -0.96928602),
  new Vec3(-0.35876599, 0.54318798, -0.75910097),
  new Vec3(-0.361276, 0.13299499, -0.92292601),
  new Vec3(-0.48311701, -0.32406601, -0.813375),
  new Vec3(-0.018073, -0.197559, -0.980124),
  new Vec3(0.3211, -0.501477, -0.80337799),
  new Vec3(0.79949099, 0.069615997, -0.59662998),
  new Vec3(0.390971, 0.77130598, -0.50222403),
  new Vec3(0.080782004, 0.61448997, -0.784778),
  new Vec3(-0.73275, 0.41143101, -0.54203498),
  new Vec3(-0.73525399, 0.0091019999, -0.67773098),
  new Vec3(-0.80249399, -0.39490801, -0.44727099),
  new Vec3(-0.13413, -0.58915502, -0.79680902),
  new Vec3(0.71955299, -0.37622699, -0.58369303),
  new Vec3(0.96687502, 0.173593, -0.187132),
  new Vec3(0.760831, 0.51910597, -0.38944301),
  new Vec3(-0.114642, 0.87551898, -0.46938601),
  new Vec3(-0.53236699, 0.76885903, -0.354177),
  new Vec3(-0.96226698, 0.024977, -0.27095801),
  new Vec3(-0.46738699, -0.721986, -0.51018202),
  new Vec3(0.058449998, -0.85235399, -0.51968902),
  new Vec3(0.49823299, -0.74374002, -0.44566301),
  new Vec3(0.93915099, -0.27024499, -0.212044),
  new Vec3(0.58393198, 0.80944198, -0.061857),
  new Vec3(0.183797, 0.97322798, -0.138007),
  new Vec3(-0.88435501, 0.45221901, -0.115822),
  new Vec3(-0.943178, -0.33206701, 0.012138),
  new Vec3(-0.69844002, -0.70656699, -0.113772),
  new Vec3(-0.228411, -0.95470601, -0.190694),
  new Vec3(0.73156399, -0.675861, -0.089588001),
  new Vec3(0.96925098, 0.046804, 0.24158201),
  new Vec3(0.85564703, 0.50347698, 0.119916),
  new Vec3(-0.25115299, 0.96794701, -80999998e-12),
  new Vec3(-0.64779502, 0.75674897, 0.087711997),
  new Vec3(-0.96916401, 0.14519399, 0.1991),
  new Vec3(-0.41479301, -0.88896698, 0.194126),
  new Vec3(0.25077501, -0.961178, -0.115109),
  new Vec3(0.47862899, -0.84259301, 0.246883),
  new Vec3(0.89004397, -0.39614201, 0.225595),
  new Vec3(0.52405101, 0.76235998, 0.37970701),
  new Vec3(0.11962, 0.94548202, 0.30291),
  new Vec3(-0.76085001, 0.49007499, 0.42536199),
  new Vec3(-0.86978501, -0.20215, 0.450122),
  new Vec3(-0.70946699, -0.60242403, 0.36570701),
  new Vec3(0.019308999, -0.95887101, 0.28318599),
  new Vec3(0.626113, -0.564677, 0.53770101),
  new Vec3(0.769943, -0.126663, 0.62541503),
  new Vec3(0.76419097, 0.35070199, 0.54131401),
  new Vec3(-0.001878, 0.74136698, 0.67109799),
  new Vec3(-0.37088001, 0.81836802, 0.43900099),
  new Vec3(-0.71390897, 0.12865201, 0.68831801),
  new Vec3(-0.295165, -0.73866397, 0.60601401),
  new Vec3(0.186195, -0.73836899, 0.648184),
  new Vec3(0.387523, -0.35878301, 0.84917599),
  new Vec3(0.481022, 0.124846, 0.86777401),
  new Vec3(0.391808, 0.54505599, 0.741216),
  new Vec3(-0.0035359999, 0.36559799, 0.93076599),
  new Vec3(-0.42049801, 0.484961, 0.76680797),
  new Vec3(-0.35490301, 0.019470001, 0.93470001),
  new Vec3(-0.54783702, -0.35920799, 0.75554299),
  new Vec3(-0.106662, -0.445115, 0.88909799),
  new Vec3(0.086796001, -0.059307002, 0.99445897),
];

const normals4 = [
  new Vec3(0.52657801, -0.35962099, -0.77031702),
  new Vec3(0.150482, 0.43598399, 0.88728398),
  new Vec3(0.414195, 0.73825502, -0.53237402),
  new Vec3(0.075152002, 0.91624898, -0.393498),
  new Vec3(-0.316149, 0.93073601, -0.18379299),
  new Vec3(-0.77381903, 0.62333399, -0.11251),
  new Vec3(-0.90084201, 0.42853701, -0.069568001),
  new Vec3(-0.99894202, -0.010971, 0.044665001),
  new Vec3(-0.979761, -0.15767001, -0.123324),
  new Vec3(-0.91127402, -0.362371, -0.19562),
  new Vec3(-0.62406898, -0.72094101, -0.301301),
  new Vec3(-0.310173, -0.80934501, -0.498752),
  new Vec3(0.146613, -0.81581903, -0.55941403),
  new Vec3(-0.71651602, -0.69435602, -0.066887997),
  new Vec3(0.50397199, -0.114202, -0.85613698),
  new Vec3(0.45549101, 0.87262702, -0.176211),
  new Vec3(-0.00501, -0.114373, -0.99342501),
  new Vec3(-0.104675, -0.327701, -0.93896502),
  new Vec3(0.56041199, 0.75258899, -0.34575599),
  new Vec3(-0.060575999, 0.82162797, -0.566796),
  new Vec3(-0.30234101, 0.79700702, -0.522847),
  new Vec3(-0.671543, 0.67074001, -0.314863),
  new Vec3(-0.77840102, -0.12835699, 0.61450499),
  new Vec3(-0.92404997, 0.278382, -0.261985),
  new Vec3(-0.69977301, -0.55049098, -0.45527801),
  new Vec3(-0.56824797, -0.51718903, -0.64000797),
  new Vec3(0.054097999, -0.93286401, -0.356143),
  new Vec3(0.75838202, 0.57289302, -0.31088799),
  new Vec3(0.0036200001, 0.30502599, -0.95233703),
  new Vec3(-0.060849998, -0.98688602, -0.14951099),
  new Vec3(0.63523, 0.045478001, -0.77098298),
  new Vec3(0.52170497, 0.241309, -0.81828701),
  new Vec3(0.26940399, 0.63542497, -0.72364098),
  new Vec3(0.045676, 0.67275399, -0.738455),
  new Vec3(-0.180511, 0.67465699, -0.71571898),
  new Vec3(-0.397131, 0.63664001, -0.66104198),
  new Vec3(-0.55200398, 0.47251499, -0.687038),
  new Vec3(-0.77217001, 0.08309, -0.62996),
  new Vec3(-0.669819, -0.119533, -0.73284),
  new Vec3(-0.54045498, -0.31844401, -0.77878201),
  new Vec3(-0.38613501, -0.522789, -0.75999397),
  new Vec3(-0.261466, -0.68856698, -0.676395),
  new Vec3(-0.019412, -0.69610298, -0.71767998),
  new Vec3(0.30356899, -0.48184401, -0.82199299),
  new Vec3(0.68193901, -0.19512901, -0.70490003),
  new Vec3(-0.24488901, -0.116562, -0.96251899),
  new Vec3(0.80075902, -0.022979001, -0.59854603),
  new Vec3(-0.37027499, 0.095583998, -0.92399102),
  new Vec3(-0.33067101, -0.32657799, -0.88543999),
  new Vec3(-0.16322, -0.52757901, -0.83367902),
  new Vec3(0.12639, -0.313146, -0.941257),
  new Vec3(0.34954801, -0.27222601, -0.89649802),
  new Vec3(0.23991799, -0.085825004, -0.96699202),
  new Vec3(0.390845, 0.081537001, -0.91683799),
  new Vec3(0.25526699, 0.26869699, -0.92878503),
  new Vec3(0.146245, 0.48043799, -0.86474901),
  new Vec3(-0.32601601, 0.47845599, -0.81534898),
  new Vec3(-0.46968201, -0.112519, -0.87563598),
  new Vec3(0.81844002, -0.25852001, -0.51315099),
  new Vec3(-0.474318, 0.292238, -0.83043301),
  new Vec3(0.778943, 0.39584199, -0.48637101),
  new Vec3(0.62409401, 0.39377299, -0.67487001),
  new Vec3(0.74088597, 0.203834, -0.63995302),
  new Vec3(0.48021701, 0.565768, -0.67029703),
  new Vec3(0.38093001, 0.42453501, -0.82137799),
  new Vec3(-0.093422003, 0.50112402, -0.86031801),
  new Vec3(-0.236485, 0.29619801, -0.92538702),
  new Vec3(-0.131531, 0.093959004, -0.98684901),
  new Vec3(-0.82356203, 0.29577699, -0.48400599),
  new Vec3(0.61106598, -0.624304, -0.486664),
  new Vec3(0.069495998, -0.52033001, -0.85113299),
  new Vec3(0.226522, -0.66487902, -0.711775),
  new Vec3(0.47130799, -0.56890398, -0.67395699),
  new Vec3(0.38842499, -0.74262398, -0.54556),
  new Vec3(0.78367501, -0.48072901, -0.39338499),
  new Vec3(0.962394, 0.135676, -0.235349),
  new Vec3(0.876607, 0.172034, -0.449406),
  new Vec3(0.63340503, 0.58979303, -0.50094098),
  new Vec3(0.182276, 0.80065799, -0.57072097),
  new Vec3(0.177003, 0.76413399, 0.62029701),
  new Vec3(-0.544016, 0.675515, -0.49772099),
  new Vec3(-0.67929697, 0.28646699, -0.67564201),
  new Vec3(-0.59039098, 0.091369003, -0.801929),
  new Vec3(-0.82436001, -0.13312399, -0.55018902),
  new Vec3(-0.71579403, -0.33454201, -0.61296099),
  new Vec3(0.17428599, -0.89248401, 0.416049),
  new Vec3(-0.082528003, -0.83712298, -0.54075301),
  new Vec3(0.28333101, -0.88087398, -0.37918901),
  new Vec3(0.675134, -0.42662701, -0.60181701),
  new Vec3(0.84372002, -0.512335, -0.160156),
  new Vec3(0.97730398, -0.098555997, -0.18752),
  new Vec3(0.846295, 0.522672, -0.102947),
  new Vec3(0.67714101, 0.72132498, -0.145501),
  new Vec3(0.32096499, 0.87089199, -0.37219399),
  new Vec3(-0.178978, 0.911533, -0.37023601),
  new Vec3(-0.44716901, 0.82670099, -0.341474),
  new Vec3(-0.70320302, 0.496328, -0.50908101),
  new Vec3(-0.97718102, 0.063562997, -0.202674),
  new Vec3(-0.87817001, -0.412938, 0.241455),
  new Vec3(-0.83583099, -0.35855001, -0.415728),
  new Vec3(-0.499174, -0.69343299, -0.51959199),
  new Vec3(-0.188789, -0.92375302, -0.33322501),
  new Vec3(0.19225401, -0.96936101, -0.152896),
  new Vec3(0.51594001, -0.783907, -0.34539199),
  new Vec3(0.90592498, -0.30095199, -0.29787099),
  new Vec3(0.99111199, -0.127746, 0.037106998),
  new Vec3(0.99513501, 0.098424003, -0.0043830001),
  new Vec3(0.76012301, 0.64627701, 0.067367002),
  new Vec3(0.205221, 0.95958, -0.192591),
  new Vec3(-0.042750001, 0.97951299, -0.19679099),
  new Vec3(-0.43801701, 0.89892697, 0.0084920004),
  new Vec3(-0.82199401, 0.48078501, -0.30523899),
  new Vec3(-0.89991701, 0.081710003, -0.42833701),
  new Vec3(-0.92661202, -0.144618, -0.347096),
  new Vec3(-0.79365999, -0.55779201, -0.24283899),
  new Vec3(-0.43134999, -0.84777898, -0.30855799),
  new Vec3(-0.0054919999, -0.96499997, 0.26219299),
  new Vec3(0.58790499, -0.80402601, -0.088940002),
  new Vec3(0.69949299, -0.66768599, -0.254765),
  new Vec3(0.88930303, 0.359795, -0.282291),
  new Vec3(0.780972, 0.197037, 0.59267199),
  new Vec3(0.52012098, 0.50669599, 0.68755698),
  new Vec3(0.40389499, 0.69396102, 0.59605998),
  new Vec3(-0.154983, 0.89923602, 0.40909001),
  new Vec3(-0.65733802, 0.53716803, 0.528543),
  new Vec3(-0.74619502, 0.33409101, 0.575827),
  new Vec3(-0.62495202, -0.049144, 0.77911502),
  new Vec3(0.31814101, -0.254715, 0.913185),
  new Vec3(-0.555897, 0.405294, 0.725752),
  new Vec3(-0.79443401, 0.099405997, 0.59916002),
  new Vec3(-0.64036101, -0.68946302, 0.33849499),
  new Vec3(-0.12671299, -0.73409498, 0.66711998),
  new Vec3(0.105457, -0.78081697, 0.61579502),
  new Vec3(0.40799299, -0.48091599, 0.77605498),
  new Vec3(0.69513601, -0.54512, 0.468647),
  new Vec3(0.97319102, -0.0064889998, 0.229908),
  new Vec3(0.94689399, 0.317509, -0.050799001),
  new Vec3(0.56358302, 0.82561201, 0.027183),
  new Vec3(0.325773, 0.94542301, 0.0069490001),
  new Vec3(-0.171821, 0.98509699, -0.0078149997),
  new Vec3(-0.67044097, 0.73993897, 0.054768998),
  new Vec3(-0.822981, 0.55496198, 0.121322),
  new Vec3(-0.96619302, 0.117857, 0.229307),
  new Vec3(-0.95376903, -0.29470399, 0.058945),
  new Vec3(-0.86438698, -0.50272799, -0.010015),
  new Vec3(-0.53060901, -0.84200603, -0.097365998),
  new Vec3(-0.162618, -0.98407501, 0.071772002),
  new Vec3(0.081446998, -0.99601102, 0.036439002),
  new Vec3(0.74598402, -0.66596299, 0.00076199998),
  new Vec3(0.94205701, -0.32926899, -0.064106002),
  new Vec3(0.93970197, -0.28108999, 0.194803),
  new Vec3(0.77121401, 0.55067003, 0.319363),
  new Vec3(0.641348, 0.73069, 0.23402099),
  new Vec3(0.080682002, 0.99669099, 0.0098789996),
  new Vec3(-0.046725001, 0.97664303, 0.20972501),
  new Vec3(-0.53107601, 0.82100099, 0.209562),
  new Vec3(-0.69581503, 0.65599, 0.29243499),
  new Vec3(-0.97612202, 0.216709, -0.014913),
  new Vec3(-0.96166098, -0.14412899, 0.23331399),
  new Vec3(-0.772084, -0.61364698, 0.165299),
  new Vec3(-0.44960001, -0.83605999, 0.314426),
  new Vec3(-0.39269999, -0.91461599, 0.096247002),
  new Vec3(0.390589, -0.91947001, 0.044890001),
  new Vec3(0.58252901, -0.79919797, 0.148127),
  new Vec3(0.866431, -0.48981199, 0.096864),
  new Vec3(0.90458697, 0.111498, 0.41145),
  new Vec3(0.95353699, 0.23232999, 0.191806),
  new Vec3(0.497311, 0.77080297, 0.398177),
  new Vec3(0.194066, 0.95631999, 0.218611),
  new Vec3(0.422876, 0.882276, 0.206797),
  new Vec3(-0.373797, 0.84956598, 0.37217399),
  new Vec3(-0.53449702, 0.71402299, 0.4522),
  new Vec3(-0.881827, 0.23716, 0.40759799),
  new Vec3(-0.904948, -0.014069, 0.42528901),
  new Vec3(-0.751827, -0.51281703, 0.41445801),
  new Vec3(-0.50101501, -0.69791698, 0.51175803),
  new Vec3(-0.23519, -0.92592299, 0.295555),
  new Vec3(0.228983, -0.95393997, 0.193819),
  new Vec3(0.734025, -0.63489801, 0.241062),
  new Vec3(0.91375297, -0.063253, -0.40131599),
  new Vec3(0.90573502, -0.161487, 0.391875),
  new Vec3(0.85892999, 0.342446, 0.38074899),
  new Vec3(0.62448603, 0.60758102, 0.49077699),
  new Vec3(0.28926399, 0.85747898, 0.42550799),
  new Vec3(0.069968, 0.90216899, 0.42567101),
  new Vec3(-0.28617999, 0.94069999, 0.182165),
  new Vec3(-0.57401299, 0.80511898, -0.14930899),
  new Vec3(0.111258, 0.099717997, -0.98877603),
  new Vec3(-0.30539301, -0.94422799, -0.12316),
  new Vec3(-0.60116601, -0.78957599, 0.123163),
  new Vec3(-0.290645, -0.81213999, 0.50591898),
  new Vec3(-0.064920001, -0.87716299, 0.47578499),
  new Vec3(0.408301, -0.862216, 0.29978901),
  new Vec3(0.56609702, -0.72556603, 0.39126399),
  new Vec3(0.83936399, -0.427387, 0.33586901),
  new Vec3(0.81889999, -0.041305002, 0.57244802),
  new Vec3(0.71978402, 0.41499701, 0.55649698),
  new Vec3(0.88174403, 0.45027, 0.140659),
  new Vec3(0.40182301, -0.89822, -0.17815199),
  new Vec3(-0.054019999, 0.79134399, 0.60898),
  new Vec3(-0.29377401, 0.76399398, 0.57446498),
  new Vec3(-0.450798, 0.61034697, 0.65135098),
  new Vec3(-0.63822103, 0.186694, 0.74687302),
  new Vec3(-0.87287003, -0.25712699, 0.41470799),
  new Vec3(-0.58725703, -0.52170998, 0.618828),
  new Vec3(-0.35365799, -0.64197397, 0.680291),
  new Vec3(0.041648999, -0.61127299, 0.79032302),
  new Vec3(0.348342, -0.77918297, 0.52108699),
  new Vec3(0.499167, -0.62244099, 0.602826),
  new Vec3(0.79001898, -0.30383101, 0.53250003),
  new Vec3(0.66011798, 0.060733002, 0.74870199),
  new Vec3(0.60492098, 0.29416099, 0.73996001),
  new Vec3(0.38569701, 0.37934601, 0.84103203),
  new Vec3(0.239693, 0.207876, 0.94833201),
  new Vec3(0.012623, 0.25853199, 0.96591997),
  new Vec3(-0.100557, 0.457147, 0.88368797),
  new Vec3(0.046967, 0.62858802, 0.77631903),
  new Vec3(-0.43039101, -0.44540501, 0.785097),
  new Vec3(-0.43429101, -0.196228, 0.87913901),
  new Vec3(-0.25663701, -0.336867, 0.90590203),
  new Vec3(-0.131372, -0.15891001, 0.97851402),
  new Vec3(0.102379, -0.208767, 0.972592),
  new Vec3(0.195687, -0.450129, 0.87125802),
  new Vec3(0.62731898, -0.42314801, 0.65377098),
  new Vec3(0.68743902, -0.171583, 0.70568198),
  new Vec3(0.27592, -0.021255, 0.96094602),
  new Vec3(0.45936701, 0.15746599, 0.87417799),
  new Vec3(0.285395, 0.583184, 0.76055598),
  new Vec3(-0.81217402, 0.46030301, 0.35846099),
  new Vec3(-0.189068, 0.64122301, 0.743698),
  new Vec3(-0.338875, 0.47648001, 0.811252),
  new Vec3(-0.92099398, 0.347186, 0.176727),
  new Vec3(0.040638998, 0.024465, 0.99887401),
  new Vec3(-0.73913199, -0.35374701, 0.57318997),
  new Vec3(-0.60351199, -0.28661501, 0.74405998),
  new Vec3(-0.188676, -0.547059, 0.81555402),
  new Vec3(-0.026045, -0.39782, 0.91709399),
  new Vec3(0.26789701, -0.649041, 0.71202302),
  new Vec3(0.518246, -0.28489101, 0.80638599),
  new Vec3(0.493451, -0.066532999, 0.86722499),
  new Vec3(-0.328188, 0.140251, 0.93414301),
  new Vec3(0.328188, 0.140251, 0.93414301),
  new Vec3(-0.328188, 0.140251, 0.93414301),
  new Vec3(-0.328188, 0.140251, 0.93414301),
];

function getNormals(mode) {
  switch (mode) {
    case 1: return normals1;
    case 2: return normals2;
    case 3: return normals3;
    case 4: return normals4;
    default: throw new Error("Invalid normals mode " + mode);
  }
}

// =============================================================================
// BufferGeometry serialization — matches BufferGeometrySerializer format
// =============================================================================
class BinaryWriter {
  constructor(capacity) {
    this.buffer = new ArrayBuffer(capacity);
    this.view = new DataView(this.buffer);
    this.offset = 0;
  }
  writeUint8(v) { this.view.setUint8(this.offset, v); this.offset += 1; }
  writeUint32(v) { this.view.setUint32(this.offset, v, true); this.offset += 4; }
  writeCString(str, maxLen) {
    for (let i = 0; i < maxLen; i++) {
      this.view.setUint8(this.offset + i, i < str.length ? str.charCodeAt(i) : 0);
    }
    this.offset += maxLen;
  }
  writeFloat32Array(arr) {
    const src = new Float32Array(arr);
    new Uint8Array(this.buffer, this.offset, src.byteLength).set(new Uint8Array(src.buffer));
    this.offset += src.byteLength;
  }
  writeUint32Array(arr) {
    const src = new Uint32Array(arr);
    new Uint8Array(this.buffer, this.offset, src.byteLength).set(new Uint8Array(src.buffer));
    this.offset += src.byteLength;
  }
  writeUint16Array(arr) {
    const src = new Uint16Array(arr);
    new Uint8Array(this.buffer, this.offset, src.byteLength).set(new Uint8Array(src.buffer));
    this.offset += src.byteLength;
  }
  get bytes() { return new Uint8Array(this.buffer, 0, this.offset); }
}

function serializeTypedArray(writer, arr) {
  writer.writeUint32(arr.length);
  if (arr instanceof Float32Array) {
    writer.writeUint8(0);
    writer.writeFloat32Array(arr);
  } else if (arr instanceof Uint32Array) {
    writer.writeUint8(1);
    writer.writeUint32Array(arr);
  } else if (arr instanceof Uint16Array) {
    writer.writeUint8(2);
    writer.writeUint16Array(arr);
  } else {
    // Convert to Float32 as fallback
    writer.writeUint8(0);
    writer.writeFloat32Array(Float32Array.from(arr));
  }
}

function sizeofTypedArray(arr) {
  return 5 + arr.BYTES_PER_ELEMENT * arr.length;
}

function serializeGeometry(positions, normals, colors, indices) {
  // positions: Float32Array(3 * N)
  // normals: Float32Array(3 * N) or null (useColorOnly mode)
  // colors: Float32Array(3 * N)
  // indices: Uint32Array(3 * T) or Uint16Array(3 * T)
  const numAttrs = normals ? 3 : 2;
  const totalSize =
    1 +                                   // numAttributes
    numAttrs * 22 +                       // per-attr header (20 name + 1 itemSize + 1 normalized)
    sizeofTypedArray(positions) +
    sizeofTypedArray(colors) +
    (normals ? sizeofTypedArray(normals) : 0) +
    1 +                                   // hasIndex flag
    sizeofTypedArray(indices);

  const writer = new BinaryWriter(totalSize);

  // Write attributes
  writer.writeUint8(numAttrs);

  // position attribute
  writer.writeCString("position", 20);
  writer.writeUint8(3); // itemSize
  writer.writeUint8(0); // normalized
  serializeTypedArray(writer, positions);

  // normal attribute (if present)
  if (normals) {
    writer.writeCString("normal", 20);
    writer.writeUint8(3);
    writer.writeUint8(0);
    serializeTypedArray(writer, normals);
  }

  // color attribute
  writer.writeCString("color", 20);
  writer.writeUint8(3);
  writer.writeUint8(0);
  serializeTypedArray(writer, colors);

  // Index
  writer.writeUint8(1); // hasIndex
  serializeTypedArray(writer, indices);

  return writer.bytes;
}

// =============================================================================
// VXL Face-culled Voxel Mesher
// =============================================================================

// 6 face definitions for a unit cube [0, 1]^3
// Corner offsets are [dx, dy, dz] offsets from voxel minimum corner
const FACE_DEFS = [
  { // -X
    corners: [[0,0,0],[0,0,1],[0,1,1],[0,1,0]],
    neighborCheck: (x,y,z) => [x-1,y,z],
  },
  { // +X
    corners: [[1,0,0],[1,1,0],[1,1,1],[1,0,1]],
    neighborCheck: (x,y,z) => [x+1,y,z],
  },
  { // -Y
    corners: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]],
    neighborCheck: (x,y,z) => [x,y-1,z],
  },
  { // +Y
    corners: [[0,1,0],[0,1,1],[1,1,1],[1,1,0]],
    neighborCheck: (x,y,z) => [x,y+1,z],
  },
  { // -Z
    corners: [[0,0,0],[0,1,0],[1,1,0],[1,0,0]],
    neighborCheck: (x,y,z) => [x,y,z-1],
  },
  { // +Z
    corners: [[0,0,1],[1,0,1],[1,1,1],[0,1,1]],
    neighborCheck: (x,y,z) => [x,y,z+1],
  },
];

/**
 * Build voxel geometry using face-culled cube-per-voxel approach.
 *
 * Returns serialized buffer geometry bytes matching BufferGeometrySerializer format.
 */
function buildVxlGeometry(section, useColorOnly) {
  const { sizeX, sizeY, sizeZ, minBounds: mb, maxBounds: xb, spans, normalsMode } = section;

  // Build voxel field (size+1 for boundary checks)
  const field = new VoxelField(sizeX + 1, sizeY + 1, sizeZ + 1);
  for (const span of spans) {
    for (const voxel of span.voxels) {
      field.add(voxel);
    }
  }

  const spanX = xb[0] - mb[0];
  const spanY = xb[1] - mb[1];
  const spanZ = xb[2] - mb[2];
  const scaleX = spanX / sizeX;
  const scaleY = spanY / sizeY;
  const scaleZ = spanZ / sizeZ;

  const norms = getNormals(normalsMode);
  const minX = mb[0], minY = mb[1], minZ = mb[2];

  const posBuf = [];
  const normBuf = useColorOnly ? null : [];
  const colBuf = [];
  const idxBuf = [];

  let vertexCount = 0;

  for (const span of spans) {
    for (const voxel of span.voxels) {
      const vx = voxel.x, vy = voxel.y, vz = voxel.z;
      const colorIdx = voxel.colorIndex / 255;

      for (const face of FACE_DEFS) {
        const [nx, ny, nz] = face.neighborCheck(vx, vy, vz);
        const neighbor = field.get(nx, ny, nz);
        if (neighbor) continue;

        // Use voxel's actual normal from normals table (like the original builder)
        let fn = null;
        if (!useColorOnly) {
          const ni = Math.min(voxel.normalIndex, norms.length - 1);
          fn = norms[ni];
        }

        for (const corner of face.corners) {
          posBuf.push(
            minX + (vx + corner[0]) * scaleX,
            minY + (vy + corner[1]) * scaleY,
            minZ + (vz + corner[2]) * scaleZ,
          );
          colBuf.push(colorIdx, 0, 0);
          if (fn) normBuf.push(fn.x, fn.y, fn.z);
        }

        idxBuf.push(
          vertexCount, vertexCount + 1, vertexCount + 2,
          vertexCount, vertexCount + 2, vertexCount + 3,
        );
        vertexCount += 4;
      }
    }
  }

  if (vertexCount === 0) {
    const emptyWriter = new BinaryWriter(29);
    emptyWriter.writeUint8(1);
    emptyWriter.writeCString("position", 20);
    emptyWriter.writeUint8(3);
    emptyWriter.writeUint8(0);
    emptyWriter.writeUint32(0);
    emptyWriter.writeUint8(0);
    emptyWriter.writeUint8(0);
    return emptyWriter.bytes;
  }

  return serializeGeometry(
    new Float32Array(posBuf),
    normBuf ? new Float32Array(normBuf) : null,
    new Float32Array(colBuf),
    new Uint32Array(idxBuf),
  );
}

// =============================================================================
// decodeWav — decode IMA ADPCM WAV to PCM using wavefile
// =============================================================================
async function decodeWav(buffer) {
  const wav = new WaveFile(buffer);
  if (wav.bitDepth === "4") {
    wav.fromIMAADPCM();
  }
  return wav.toBuffer();
}

// =============================================================================
// generateVxlGeometry — build voxel geometry in worker, return serialized bytes
// =============================================================================
async function generateVxlGeometry(vxlPlain, options) {
  // options = ModelQuality (0=Low, 1=High). For High quality, generate normals (useColorOnly=false).
  const useColorOnly = options === 0;  // ModelQuality.Low
  return vxlPlain.sections.map((section) => {
    try {
      return buildVxlGeometry(section, useColorOnly);
    } catch (e) {
      console.error("[worker] Failed to build VXL geometry for section", section.name, e);
      const writer = new BinaryWriter(29);
      writer.writeUint8(1);
      writer.writeCString("position", 20);
      writer.writeUint8(3);
      writer.writeUint8(0);
      writer.writeUint32(0);
      writer.writeUint8(0);
      writer.writeUint8(0);
      return writer.bytes;
    }
  });
}

// =============================================================================
// compressFile — gzip compress using native CompressionStream API
// =============================================================================
async function compressFile(name, data) {
  // Convert string to Uint8Array if needed
  let bytes;
  if (typeof data === "string") {
    bytes = new TextEncoder().encode(data);
  } else if (data instanceof Uint8Array) {
    bytes = data;
  } else if (data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data);
  } else {
    bytes = new TextEncoder().encode(String(data));
  }

  // Use native CompressionStream API
  if (typeof CompressionStream !== "undefined") {
    try {
      const cs = new CompressionStream("gzip");
      const writer = cs.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const reader = cs.readable.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      // Concatenate chunks
      const totalLen = chunks.reduce((s, c) => s + c.byteLength, 0);
      const result = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }
      return result;
    } catch (e) {
      console.warn("[worker] CompressionStream failed, returning uncompressed", e);
    }
  }

  // Fallback: return uncompressed (identity)
  return bytes;
}

expose({ decodeWav, generateVxlGeometry, compressFile });
