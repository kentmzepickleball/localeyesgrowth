import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/* ----------------------------------------------------------------------
   The SEO hero, in three.js: a vintage coffee bus in the house colours,
   cream above and caramel gold below, the cream coming down in a V on
   its nose round a gold LE badge, LE again along its flank; parked on a
   round of meadow that fades into the page. As it opens, the bus rolls
   in and settles, its serving hatch swings up into a striped awning,
   the string lights come on, a gold map pin marked one drops in over
   the roof, and at the counter the espresso machine pours, again and
   again, steam rising. A bistro table and two chairs beside it; by the
   nose a chalked menu and a bay tree in a pot; stepping stones through
   the grass to the counter.
   The view turns a little with the pointer. Fetched only by SeoHero,
   after first paint.
   ---------------------------------------------------------------------- */

export type VanOptions = {
  canvas: HTMLCanvasElement;
  still: boolean;
  fonts: { display: string; body: string };
  onReady: () => void;
};

export type VanScene = {
  pointer: (x: number, y: number) => void;
  setActive: (on: boolean) => void;
  resize: () => void;
  dispose: () => void;
};

/* the bus, in metres: half its length and width, the sills, the waist where the two colours meet, the roof */
const BUS = { hl: 1.9, hw: 0.92, y0: 0.36, belt: 1.16, y1: 2.12 };
/* how round it is: the nose's and the tail's corners seen from above, the sills, the roof's edge (over the sides, the windscreen, the tail) */
const ROUND = { nose: 0.58, tail: 0.46, sill: 0.1, roof: 0.38, roofNose: 0.28, roofTail: 0.34 };
/* above the waist the nose leans back this far, to the windscreen */
const LEAN = 0.15;
const WHEEL = { r: 0.375, x: 1.2, z: 0.8, well: 0.47 };
/* the serving hatch, on the near side */
const HATCH = { x: -0.27, w: 1.88, y0: 1.04, y1: 1.66 };
const GRASS_R = 4.2;
/* out of the bus's way as it drives in */
const TABLE = { x: -2.05, z: 1.38 };
/* the menu board by the nose, a potted bay tree behind it */
const BOARD = { x: 2.5, z: -0.35 };
const PLANT = { x: 2.2, z: -1.0 };
/* stepping stones across the grass to the counter: x, z, radius */
const STONES: [number, number, number][] = [
  [-0.32, 1.44, 0.2],
  [-0.06, 1.88, 0.23],
  [0.24, 2.32, 0.21],
  [0.5, 2.78, 0.24],
];
const T = { drive: 2.6, open: [2.8, 3.9], pin: 3.1, lights: [3.6, 4.4], pour: 4.3 };
const POUR_ON = 3.6;
const POUR_OFF = 2.6;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const easeInOut = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/* a number as a GLSL float */
const f = (n: number) => n.toFixed(4);
const canvasTexture = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/* ---- the body: a plan with round corners (the nose rounder than the tail),
   lofted up a profile that rounds into the sills and, more, into the roof;
   then the nose bowed out a little, and above the waist leaned back to the
   windscreen ---- */
function bodyGeometry() {
  const { hl, hw, y0, y1 } = BUS;
  const RN = ROUND.nose;
  const RT = ROUND.tail;
  type PlanPoint = { x: number; z: number; nx: number; nz: number };
  const plan: PlanPoint[] = [];
  const line = (x0: number, z0: number, x1: number, z1: number, nx: number, nz: number) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 0.07));
    for (let i = 0; i < n; i++) plan.push({ x: x0 + ((x1 - x0) * i) / n, z: z0 + ((z1 - z0) * i) / n, nx, nz });
  };
  const arc = (cx: number, cz: number, r: number, a0: number) => {
    for (let i = 0; i < 16; i++) {
      const a = a0 + (i / 16) * (Math.PI / 2);
      plan.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r, nx: Math.cos(a), nz: Math.sin(a) });
    }
  };
  line(hl, 0, hl, hw - RN, 1, 0);
  arc(hl - RN, hw - RN, RN, 0);
  line(hl - RN, hw, -hl + RT, hw, 0, 1);
  arc(-hl + RT, hw - RT, RT, Math.PI / 2);
  line(-hl, hw - RT, -hl, -hw + RT, -1, 0);
  arc(-hl + RT, -hw + RT, RT, Math.PI);
  line(-hl + RT, -hw, hl - RN, -hw, 0, -1);
  arc(hl - RN, -hw + RN, RN, Math.PI * 1.5);
  line(hl, -hw + RN, hl, 0, 1, 0);

  const SILL = 6;
  const WALL = 34;
  const ROOF = 18;
  const rows = SILL + WALL + ROOF + 1;
  const cols = plan.length;
  const pos = new Float32Array((cols * rows + 2) * 3);
  plan.forEach((p, j) => {
    const rr = ROUND.roof + (ROUND.roofNose - ROUND.roof) * smooth(hl - RN, hl, p.x) + (ROUND.roofTail - ROUND.roof) * smooth(-hl + RT, -hl, p.x);
    const rs = ROUND.sill;
    let k = 0;
    const put = (o: number, y: number) => {
      const i = (j * rows + k++) * 3;
      pos[i] = p.x + p.nx * o;
      pos[i + 1] = y;
      pos[i + 2] = p.z + p.nz * o;
    };
    for (let i = 0; i < SILL; i++) {
      const a = -Math.PI / 2 + (i / SILL) * (Math.PI / 2);
      put(-rs + Math.cos(a) * rs, y0 + rs + Math.sin(a) * rs);
    }
    for (let i = 0; i < WALL; i++) put(0, y0 + rs + ((y1 - rr - y0 - rs) * i) / WALL);
    for (let i = 0; i <= ROOF; i++) {
      const a = (i / ROOF) * (Math.PI / 2);
      put(-rr + Math.cos(a) * rr, y1 - rr + Math.sin(a) * rr);
    }
  });
  const bottom = cols * rows;
  const top = bottom + 1;
  pos.set([0, y0, 0, 0, y1, 0], bottom * 3);

  for (let i = 0; i < cols * rows + 2; i++) {
    let x = pos[i * 3];
    const y = pos[i * 3 + 1];
    const z = pos[i * 3 + 2];
    x += 0.05 * Math.max(0, 1 - (z / hw) ** 2) * smooth(hl - 0.5, hl, x);
    x -= LEAN * smooth(BUS.belt + 0.04, y1 - 0.12, y) * smooth(hl - 1.0, hl - 0.2, x);
    pos[i * 3] = x;
  }

  const index: number[] = [];
  const v = (j: number, k: number) => (j % cols) * rows + k;
  for (let j = 0; j < cols; j++) {
    for (let k = 0; k < rows - 1; k++) {
      const a = v(j, k);
      const b = v(j, k + 1);
      const c = v(j + 1, k);
      const d = v(j + 1, k + 1);
      index.push(a, b, c, c, b, d);
    }
    index.push(bottom, v(j, 0), v(j + 1, 0));
    index.push(top, v(j + 1, rows - 1), v(j, rows - 1));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/* ---- the paint, drawn on the body in its own coordinates: the two
   colours and the V, a chrome line where they meet, the glass and its
   rubber, the wipers, the cab door's seams and handle, a little shade
   round the wheel arches; the hatch and the near arches are cut out ---- */
const PAINT_PARS = /* glsl */ `
varying vec3 vObj;
varying vec3 vObjN;
uniform vec3 uUpper;
uniform vec3 uLower;
float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
float paintIn(float d) { float a = max(fwidth(d), 1e-4); return 1.0 - smoothstep(-a, a, d); }
float paintBand(float d, float w) { float a = max(fwidth(d), 1e-4); return 1.0 - smoothstep(w - a, w + a, abs(d)); }
`;
const PAINT_MAIN = /* glsl */ `
vec3 nO = normalize(vObjN);
float onSide = smoothstep(0.6, 0.75, nO.z);
float onNose = smoothstep(0.5, 0.65, nO.x);
float hatchD = sdRound(vec2(vObj.x - ${f(HATCH.x)}, vObj.y - ${f((HATCH.y0 + HATCH.y1) / 2)}), vec2(${f(HATCH.w / 2)}, ${f((HATCH.y1 - HATCH.y0) / 2)}), 0.05);
if (vObj.z > 0.4 && hatchD < 0.0) discard;
float archD = length(vec2(abs(vObj.x) - ${f(WHEEL.x)}, vObj.y - ${f(WHEEL.r)})) - ${f(WHEEL.well)};
if (vObj.z > ${f(BUS.hw - 0.16)} && archD < 0.0) discard;

float noseW = smoothstep(${f(BUS.hl - 0.42)}, ${f(BUS.hl - 0.14)}, vObj.x);
float splitY = mix(${f(BUS.belt)}, ${f(BUS.belt)} - 0.4 * clamp(1.0 - abs(vObj.z) / 0.66, 0.0, 1.0), noseW);
float dS = vObj.y - splitY;
float aS = max(fwidth(dS), 1e-4);
vec3 paintCol = mix(uLower, uUpper, smoothstep(-aS, aS, dS));
float pTrim = paintBand(dS, 0.006);

float pGlass = 0.0;
float pSeal = 0.0;
float dW = sdRound(vec2(abs(vObj.z) - 0.335, vObj.y - 1.535), vec2(0.272, 0.222), 0.085);
pGlass = max(pGlass, onNose * paintIn(dW));
pSeal = max(pSeal, onNose * paintBand(dW - 0.013, 0.013));
float dC = sdRound(vec2(vObj.x - 1.1, vObj.y - 1.46), vec2(0.2, 0.18), 0.07);
pGlass = max(pGlass, onSide * paintIn(dC));
pSeal = max(pSeal, onSide * paintBand(dC - 0.013, 0.013));
pSeal = max(pSeal, step(0.4, vObj.z) * paintBand(hatchD - 0.016, 0.016));
float pWiper = onNose * paintBand(sdSeg(vec2(abs(vObj.z), vObj.y), vec2(0.13, 1.355), vec2(0.5, 1.405)), 0.0055);
float gutter = step(0.62, abs(vObj.z)) * paintBand(vObj.y - ${f(BUS.y1 - ROUND.roof + 0.03)}, 0.0035);
float pGaps = gutter + onSide * paintBand(sdRound(vec2(vObj.x - 1.1, vObj.y - 1.3), vec2(0.31, 0.4), 0.06), 0.0028);
pTrim = max(pTrim, onSide * paintIn(sdRound(vec2(vObj.x - 0.86, vObj.y - 1.22), vec2(0.045, 0.012), 0.012)));
float onRoof = smoothstep(0.9, 0.97, nO.y);
float dR = sdRound(vec2(vObj.x + 0.2, vObj.z), vec2(1.02, 0.5), 0.12);
float pCanvas = onRoof * paintIn(dR);
float pleat = pCanvas * paintBand(mod(vObj.x + 0.2, 0.26) - 0.13, 0.006);
pSeal = max(pSeal, onRoof * paintBand(dR - 0.012, 0.012));
float archShade = step(0.0, vObj.z) * (1.0 - smoothstep(0.0, 0.12, archD));

paintCol *= 1.0 - 0.32 * archShade;
paintCol = mix(paintCol, vec3(0.93, 0.92, 0.89), pTrim);
float glassSky = smoothstep(1.28, 1.78, vObj.y);
float glassStreak = 1.0 - smoothstep(0.0, 0.05, abs(vObj.y * 0.85 + (onNose > 0.5 ? abs(vObj.z) : vObj.x) * 0.75 - 1.72));
vec3 glassCol = vec3(0.04, 0.045, 0.043) + vec3(0.1, 0.1, 0.092) * glassSky + vec3(0.11, 0.11, 0.1) * glassStreak;
paintCol = mix(paintCol, glassCol, pGlass);
paintCol = mix(paintCol, vec3(0.84, 0.8, 0.72), pSeal);
paintCol = mix(paintCol, vec3(0.06), pWiper);
paintCol = mix(paintCol, vec3(0.5, 0.42, 0.29), pCanvas);
paintCol *= 1.0 - 0.28 * pleat;
paintCol *= 1.0 - 0.55 * pGaps;
diffuseColor.rgb *= paintCol;
`;

/* the hatch's inside: a lit back wall, shelves of cups and jars */
function interiorTexture() {
  const W = 1024;
  const H = 384;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#5a4129");
  bg.addColorStop(1, "#2a1e13");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  /* boards */
  g.fillStyle = "rgba(0,0,0,0.12)";
  for (let x = 0; x < W; x += 64) g.fillRect(x, 0, 2, H);
  for (const x of [W * 0.27, W * 0.73]) {
    const r = g.createRadialGradient(x, 20, 4, x, 70, 300);
    r.addColorStop(0, "rgba(255,214,150,0.9)");
    r.addColorStop(0.35, "rgba(255,190,120,0.28)");
    r.addColorStop(1, "rgba(255,190,120,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, W, H);
  }
  const rand = mulberry32(5);
  for (const y of [170, 290]) {
    g.fillStyle = "#8a6440";
    g.fillRect(30, y, W - 60, 9);
    for (let x = 50; x < W - 70; ) {
      const kind = rand();
      const w = kind < 0.4 ? 30 : kind < 0.75 ? 42 : 24;
      const h = kind < 0.4 ? 36 : kind < 0.75 ? 58 : 48;
      g.fillStyle = kind < 0.4 ? "#f1e9d6" : kind < 0.75 ? "rgba(214,176,112,0.9)" : "#cdb88f";
      g.beginPath();
      g.roundRect(x, y - h, w, h, 6);
      g.fill();
      x += w + 8 + rand() * 18;
    }
  }
  return canvasTexture(c);
}

/* stripes for the awning, gold and cream */
function stripesTexture(count: number) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 64;
  const g = c.getContext("2d")!;
  for (let i = 0; i < count; i++) {
    g.fillStyle = i % 2 ? "#f1e8d2" : "#c99d56";
    g.fillRect((512 / count) * i, 0, 512 / count + 1, 64);
  }
  return canvasTexture(c);
}

/* the badge on the nose: LE on gold */
function badgeTexture(fonts: VanOptions["fonts"]) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(190, 170, 10, 256, 256, 260);
  r.addColorStop(0, "#f0d8a2");
  r.addColorStop(0.55, "#cba15c");
  r.addColorStop(1, "#9c7234");
  g.fillStyle = r;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#f7f0dd";
  g.lineWidth = 12;
  g.beginPath();
  g.arc(256, 256, 222, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#f7f0dd";
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.font = `300 250px ${fonts.display}`;
  g.lineWidth = 16;
  g.lineJoin = "round";
  g.strokeText("LE", 256, 345);
  g.fillText("LE", 256, 345);
  return canvasTexture(c);
}

/* LE, sign-written along the flank */
function monogramTexture(fonts: VanOptions["fonts"]) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 384;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f6efdc";
  g.strokeStyle = "#f6efdc";
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.font = `300 330px ${fonts.display}`;
  g.lineWidth = 8;
  g.lineJoin = "round";
  g.strokeText("LE", 256, 312);
  g.fillText("LE", 256, 312);
  return canvasTexture(c);
}

/* the menu, chalked on the board by the nose */
function chalkTexture(fonts: VanOptions["fonts"]) {
  const c = document.createElement("canvas");
  c.width = 400;
  c.height = 600;
  const g = c.getContext("2d")!;
  g.fillStyle = "#2b2a24";
  g.fillRect(0, 0, 400, 600);
  const rand = mulberry32(13);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(240,232,210,${rand() * 0.05})`;
    g.fillRect(rand() * 400, rand() * 600, 2 + rand() * 6, 1 + rand() * 2);
  }
  g.fillStyle = "#efe6cf";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `300 92px ${fonts.display}`;
  g.fillText("Coffee", 200, 150);
  g.fillStyle = "#d4b06c";
  g.fillRect(120, 220, 160, 3);
  g.fillStyle = "#efe6cf";
  g.font = `700 30px ${fonts.body}`;
  g.letterSpacing = "6px";
  ["ESPRESSO", "LATTE", "COLD BREW"].forEach((t, i) => g.fillText(t, 203, 300 + i * 70));
  return canvasTexture(c);
}

/* the pin's face: a cream disc with a one */
function pinFaceTexture(fonts: VanOptions["fonts"]) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f6efdc";
  g.beginPath();
  g.arc(128, 128, 124, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#261f15";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `800 172px ${fonts.body}`;
  g.fillText("1", 122, 140);
  return canvasTexture(c);
}

/* a soft round shadow */
function blobTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* the shade under the bus: soft, the shape of its footprint */
function footprintTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 9; i++) {
    const x = 120 + i * 34;
    const r = g.createRadialGradient(x, 128, 0, x, 128, 118);
    r.addColorStop(0, "rgba(255,255,255,0.32)");
    r.addColorStop(0.55, "rgba(255,255,255,0.16)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 512, 256);
  }
  return new THREE.CanvasTexture(c);
}

/* the ground: a disc fading out at its edge, so the meadow sits on the paper */
function groundAlpha() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  r.addColorStop(0, "#fff");
  r.addColorStop(0.62, "#fff");
  r.addColorStop(1, "#000");
  g.fillStyle = r;
  g.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(c);
}

/* the sky the paint and the chrome reflect: bright cream overhead, a warm
   horizon, the meadow below, and soft bright panels for the highlights */
function skyEnvironment(renderer: THREE.WebGLRenderer) {
  const s = new THREE.Scene();
  s.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(20, 64, 32),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: /* glsl */ `varying vec3 vDir;
          void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `varying vec3 vDir;
          void main() {
            float y = vDir.y;
            vec3 zenith = vec3(0.74, 0.77, 0.76);
            vec3 horizon = vec3(1.0, 0.95, 0.86);
            vec3 ground = vec3(0.17, 0.19, 0.1);
            vec3 c = y > 0.0 ? mix(horizon, zenith, smoothstep(0.0, 0.75, y)) : mix(horizon * 0.62, ground, smoothstep(0.0, 0.2, -y));
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    ),
  );
  const panel = (w: number, h: number, k: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color("#fff4e0").multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(8, 5, 5, 4, 13, 9);
  panel(16, 1.6, 2.2, -13, 3.5, 3);
  panel(12, 2.2, 1.6, 9, 4, -9);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(s, 0.02).texture;
  pmrem.dispose();
  s.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return env;
}

export function createVanScene(opts: VanOptions): VanScene {
  const { canvas, still, fonts } = opts;
  const small = window.innerWidth < 760;
  const { hl, hw } = BUS;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const envMap = skyEnvironment(renderer);
  scene.environment = envMap;
  scene.environmentIntensity = 0.85;
  const camera = new THREE.PerspectiveCamera(26, 1.2, 0.1, 120);

  /* ---- light: a high soft sun from the front, the sky, a fill on the nose, a rim from behind ---- */
  scene.add(new THREE.HemisphereLight(0xfbf3e3, 0x6d7444, 0.5));
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.6);
  sun.position.set(2.9, 9.5, 6.4);
  sun.target.position.set(0.3, 0, 0.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  sun.shadow.camera.left = -5;
  sun.shadow.camera.right = 5;
  sun.shadow.camera.top = 5;
  sun.shadow.camera.bottom = -5;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 30;
  sun.shadow.radius = 7;
  sun.shadow.blurSamples = 16;
  sun.shadow.bias = -0.0004;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xf4efe6, 0.55);
  fill.position.set(8, 3, -1.5);
  const rim = new THREE.DirectionalLight(0xffffff, 0.45);
  rim.position.set(-6, 5, -5);
  scene.add(fill, rim);

  /* ---- materials ---- */
  const paintU = { uUpper: { value: new THREE.Color("#f1e9d5") }, uLower: { value: new THREE.Color("#c4a165") } };
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
  paint.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, paintU);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObj;\nvarying vec3 vObjN;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;\nvObjN = normal;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\n${PAINT_PARS}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${PAINT_MAIN}`)
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor = mix(mix(mix(mix(roughnessFactor, 0.16, pTrim), 0.04, pGlass), 0.6, pSeal), 0.9, pCanvas);",
      )
      .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 1.0, pTrim);")
      .replace("#include <lights_physical_fragment>", "#include <lights_physical_fragment>\nmaterial.clearcoat *= (1.0 - pSeal) * (1.0 - pCanvas);");
  };
  const cream = new THREE.MeshPhysicalMaterial({ color: "#f1e9d5", roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.1 });
  const chrome = new THREE.MeshStandardMaterial({ color: "#eee9df", metalness: 1, roughness: 0.12 });
  const rubber = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
  const well = new THREE.MeshStandardMaterial({ color: "#15120e", roughness: 1, side: THREE.DoubleSide });
  const wood = new THREE.MeshStandardMaterial({ color: "#c49d6a", roughness: 0.55 });
  const ink = new THREE.MeshStandardMaterial({ color: "#2a241d", metalness: 0.55, roughness: 0.42 });
  const ceramic = new THREE.MeshPhysicalMaterial({ color: "#fbf7ef", roughness: 0.25, clearcoat: 0.6 });
  const coffee = new THREE.MeshStandardMaterial({ color: "#4a2a17", roughness: 0.25 });
  const goldMetal = new THREE.MeshPhysicalMaterial({ color: "#d6a752", metalness: 1, roughness: 0.22, clearcoat: 0.4, clearcoatRoughness: 0.2 });

  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0, parent?: THREE.Object3D) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    (parent ?? scene).add(m);
    return m;
  };

  /* ---- the bus ---- */
  const bus = new THREE.Group();
  scene.add(bus);
  const body = new THREE.Group(); // pitches a little as it stops
  bus.add(body);
  const shell = mesh(bodyGeometry(), paint, 0, 0, 0, body);

  /* where a ray meets the body: for things that sit on its curves */
  const ray = new THREE.Raycaster();
  const onBody = (from: THREE.Vector3, dir: THREE.Vector3) => {
    ray.set(from, dir.clone().normalize());
    const hit = ray.intersectObject(shell, false)[0];
    return hit?.face ? { p: hit.point.clone(), n: hit.face.normal.clone() } : { p: from.clone(), n: dir.clone().negate() };
  };
  const stick = (o: THREE.Object3D, at: { p: THREE.Vector3; n: THREE.Vector3 }) => {
    o.position.copy(at.p);
    o.lookAt(at.p.clone().add(at.n));
    body.add(o);
    return o;
  };

  /* headlamps */
  for (const z of [-0.58, 0.58]) {
    const lamp = stick(new THREE.Group(), onBody(new THREE.Vector3(4, 0.93, z), new THREE.Vector3(-1, 0, 0)));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.021, 14, 48), chrome);
    const lens = new THREE.Mesh(
      new THREE.SphereGeometry(0.096, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.4),
      new THREE.MeshPhysicalMaterial({ color: "#fffaf0", roughness: 0.05, clearcoat: 1, emissive: "#fff2d6", emissiveIntensity: 0.25 }),
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.z = -0.045;
    lamp.add(ring, lens);
  }
  /* the badge on the nose */
  const badgeTex = badgeTexture(fonts);
  {
    const g = stick(new THREE.Group(), onBody(new THREE.Vector3(4, 0.97, 0), new THREE.Vector3(-1, 0, 0)));
    const rimM = mesh(new THREE.CylinderGeometry(0.182, 0.188, 0.036, 64), goldMetal, 0, 0, 0.012, g);
    rimM.rotation.x = Math.PI / 2;
    const face = new THREE.Mesh(
      new THREE.CircleGeometry(0.17, 64),
      new THREE.MeshPhysicalMaterial({ map: badgeTex, metalness: 0.7, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.06 }),
    );
    face.position.z = 0.031;
    g.add(face);
  }
  /* LE along the flank, under the counter */
  const monoTex = monogramTexture(fonts);
  {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.6),
      new THREE.MeshPhysicalMaterial({ map: monoTex, transparent: true, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, polygonOffset: true, polygonOffsetFactor: -2 }),
    );
    m.position.set(0, 0.64, hw + 0.002);
    m.receiveShadow = true;
    body.add(m);
  }
  /* bumpers, bent round the corners, with overriders */
  for (const sx of [1, -1]) {
    const curve = new THREE.CatmullRomCurve3(
      [
        [1.48, -0.98],
        [1.98, -0.66],
        [2.06, 0],
        [1.98, 0.66],
        [1.48, 0.98],
      ].map(([x, z]) => new THREE.Vector3(sx * x, 0, z)),
      false,
      "centripetal",
    );
    const b = mesh(new THREE.TubeGeometry(curve, 72, 0.042, 12, false), chrome, 0, 0.47, 0, body);
    b.scale.y = 1.55;
    for (const z of [-0.42, 0.42]) mesh(new RoundedBoxGeometry(0.06, 0.25, 0.05, 2, 0.022), chrome, sx * 2.05, 0.5, z, body);
  }
  /* the wheel wells, behind the near arches */
  for (const x of [-WHEEL.x, WHEEL.x]) {
    const tube = new THREE.CylinderGeometry(WHEEL.well, WHEEL.well, 0.42, 40, 1, true, Math.PI / 2, Math.PI);
    tube.rotateX(Math.PI / 2);
    const t = mesh(tube, well, x, WHEEL.r, hw - 0.21, body);
    t.castShadow = false;
    const plate = mesh(new THREE.CircleGeometry(WHEEL.well, 40, 0, Math.PI), well, x, WHEEL.r, hw - 0.42, body);
    plate.castShadow = false;
  }
  /* the wheels: a black tyre with a white wall, a cream rim, a chrome cap */
  const wheels: { spin: THREE.Group; s: number }[] = [];
  {
    const tireGeo = new THREE.LatheGeometry(
      [
        [0.25, -0.1],
        [0.3, -0.112],
        [0.345, -0.1],
        [0.368, -0.07],
        [0.375, 0],
        [0.368, 0.07],
        [0.345, 0.1],
        [0.3, 0.112],
        [0.25, 0.1],
      ].map(([r, z]) => new THREE.Vector2(r, z)),
      72,
    );
    tireGeo.rotateX(Math.PI / 2);
    const tp = tireGeo.attributes.position;
    const col = new Float32Array(tp.count * 3);
    for (let i = 0; i < tp.count; i++) {
      const r = Math.hypot(tp.getX(i), tp.getY(i));
      const white = tp.getZ(i) > 0.06 && r > 0.272 && r < 0.318;
      col.set(white ? [0.92, 0.9, 0.84] : [0.085, 0.08, 0.075], i * 3);
    }
    tireGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const rimGeo = new THREE.LatheGeometry(
      [
        [0.256, 0.068],
        [0.24, 0.076],
        [0.205, 0.056],
        [0.16, 0.048],
        [0.14, 0.052],
      ].map(([r, z]) => new THREE.Vector2(r, z)),
      64,
    );
    rimGeo.rotateX(Math.PI / 2);
    const capGeo = new THREE.LatheGeometry(
      [
        [0.142, 0.05],
        [0.136, 0.076],
        [0.115, 0.1],
        [0.075, 0.117],
        [0, 0.123],
      ].map(([r, z]) => new THREE.Vector2(r, z)),
      64,
    );
    capGeo.rotateX(Math.PI / 2);
    for (const x of [-WHEEL.x, WHEEL.x]) {
      for (const s of [-1, 1]) {
        const w = new THREE.Group();
        w.position.set(x, WHEEL.r, s * WHEEL.z);
        if (s < 0) w.rotation.y = Math.PI;
        const spin = new THREE.Group();
        w.add(spin);
        mesh(tireGeo, rubber, 0, 0, 0, spin);
        mesh(rimGeo, cream, 0, 0, 0, spin);
        mesh(capGeo, chrome, 0, 0, 0, spin);
        bus.add(w);
        wheels.push({ spin, s });
      }
    }
  }

  /* ---- the hatch: the inside behind it, the awning it becomes, the counter ---- */
  const interiorTex = interiorTexture();
  const hh = HATCH.y1 - HATCH.y0;
  {
    const x0 = HATCH.x - HATCH.w / 2 - 0.03;
    const x1 = HATCH.x + HATCH.w / 2 + 0.03;
    const y0 = HATCH.y0;
    const y1 = HATCH.y1 + 0.03;
    const zb = 0.2;
    const depth = hw - zb + 0.02;
    const cx = (x0 + x1) / 2;
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(x1 - x0, y1 - y0 + 0.02),
      new THREE.MeshStandardMaterial({ color: "#2b1f15", emissive: "#ffffff", emissiveMap: interiorTex, emissiveIntensity: 0.75, roughness: 0.9 }),
    );
    back.position.set(cx, (y0 + y1) / 2, zb);
    const lining = new THREE.MeshStandardMaterial({ color: "#4a3522", roughness: 0.85, emissive: "#3a2412", emissiveIntensity: 0.6 });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, depth), lining);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(cx, y1, zb + depth / 2);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, depth), wood);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cx, y0 + 0.001, zb + depth / 2);
    const jambL = new THREE.Mesh(new THREE.PlaneGeometry(depth, y1 - y0), lining);
    jambL.rotation.y = Math.PI / 2;
    jambL.position.set(x0, (y0 + y1) / 2, zb + depth / 2);
    const jambR = new THREE.Mesh(new THREE.PlaneGeometry(depth, y1 - y0), lining);
    jambR.rotation.y = -Math.PI / 2;
    jambR.position.set(x1, (y0 + y1) / 2, zb + depth / 2);
    for (const m of [back, ceil, floor, jambL, jambR]) {
      m.receiveShadow = true;
      body.add(m);
    }
    /* two pendants inside */
    for (const dx of [-0.5, 0.5]) {
      mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.12, 6), ink, HATCH.x + dx, y1 - 0.06, hw - 0.32, body);
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 16, 12),
        new THREE.MeshStandardMaterial({ color: "#fff6e2", emissive: "#ffcf87", emissiveIntensity: 2.2 }),
      );
      bulb.position.set(HATCH.x + dx, y1 - 0.14, hw - 0.32);
      body.add(bulb);
    }
  }
  const stripes = stripesTexture(14);
  let valance: THREE.Mesh | null = null;
  const hinge = new THREE.Group();
  hinge.position.set(HATCH.x, HATCH.y1 + 0.03, hw + 0.012);
  body.add(hinge);
  {
    const canvasMat = new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.6 });
    const door = mesh(new THREE.BoxGeometry(HATCH.w + 0.1, hh + 0.06, 0.035), [cream, cream, cream, cream, canvasMat, canvasMat], 0, -(hh + 0.06) / 2, 0.018, hinge);
    /* a scalloped valance hanging from its edge, in the same stripes */
    const scallops = 9;
    const vw = HATCH.w + 0.1;
    const val = new THREE.Shape();
    val.moveTo(-vw / 2, 0);
    val.lineTo(vw / 2, 0);
    val.lineTo(vw / 2, -0.07);
    for (let i = scallops - 1; i >= 0; i--) {
      const x0 = -vw / 2 + (vw / scallops) * i;
      val.quadraticCurveTo(x0 + vw / scallops / 2, -0.17, x0, -0.07);
    }
    val.lineTo(-vw / 2, 0);
    const valGeo = new THREE.ShapeGeometry(val, 10);
    const vp = valGeo.attributes.position;
    const vuv = new Float32Array(vp.count * 2);
    for (let i = 0; i < vp.count; i++) {
      vuv[i * 2] = vp.getX(i) / vw + 0.5;
      vuv[i * 2 + 1] = 0.5;
    }
    valGeo.setAttribute("uv", new THREE.BufferAttribute(vuv, 2));
    valance = new THREE.Mesh(valGeo, new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.65, side: THREE.DoubleSide }));
    valance.position.set(0, -(hh + 0.06) / 2, 0.02);
    valance.castShadow = true;
    door.add(valance);
  }
  /* the struts, from the body to the awning's outer corners */
  const struts = [-(HATCH.w / 2 + 0.045), HATCH.w / 2 + 0.045].map((dx) => ({ m: mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 8), chrome, 0, 0, 0, body), dx }));
  /* the counter slides out from under the hatch once it is up, cups and a
     jar of beans on it; the machine and the grinder stand just inside */
  const top = HATCH.y0;
  const ledge = new THREE.Group();
  body.add(ledge);
  mesh(new RoundedBoxGeometry(HATCH.w + 0.1, 0.045, 0.32, 3, 0.015), wood, HATCH.x, top - 0.0245, hw + 0.15, ledge);
  for (const dx of [-0.86, 0.86]) {
    const b = mesh(new THREE.BoxGeometry(0.03, 0.03, 0.32), ink, HATCH.x + dx, top - 0.13, hw + 0.11, ledge);
    b.rotation.x = -0.62;
  }
  const machine = new THREE.Group();
  machine.position.set(HATCH.x - 0.45, top, hw - 0.27);
  body.add(machine);
  {
    const s = 1.25; // a little larger than life, so the pour reads
    mesh(new RoundedBoxGeometry(0.42 * s, 0.34 * s, 0.28 * s, 4, 0.045), cream, 0, 0.17 * s, -0.02, machine);
    mesh(new RoundedBoxGeometry(0.44 * s, 0.025, 0.3 * s, 2, 0.01), chrome, 0, 0.34 * s + 0.012, -0.02, machine);
    mesh(new RoundedBoxGeometry(0.3 * s, 0.022, 0.12 * s, 2, 0.008), chrome, 0, 0.011, 0.17 * s, machine);
    mesh(new THREE.CylinderGeometry(0.048 * s, 0.05 * s, 0.06 * s, 24), chrome, 0, 0.27 * s, 0.12 * s + 0.01, machine);
    mesh(new THREE.CylinderGeometry(0.052 * s, 0.045 * s, 0.035 * s, 24), chrome, 0, 0.225 * s, 0.13 * s + 0.01, machine);
    const handle = mesh(new THREE.CylinderGeometry(0.012 * s, 0.014 * s, 0.16 * s, 12), ink, 0.07 * s, 0.215 * s, 0.22 * s, machine);
    handle.rotation.set(Math.PI / 2 - 0.25, 0, -0.5);
    for (const dx of [-0.012, 0.012]) mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.025, 8), chrome, dx * s, 0.2 * s, 0.13 * s + 0.01, machine);
    const gauge = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 24), chrome, -0.14 * s, 0.24 * s, 0.12 * s, machine);
    gauge.rotation.x = Math.PI / 2;
    const wand = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16 * s, 8), chrome, 0.19 * s, 0.17 * s, 0.13 * s, machine);
    wand.rotation.z = 0.25;
  }
  /* the cup on the tray, the coffee in it, the stream from the spouts */
  const cupAt = new THREE.Vector3(0, 0.022, 0.17 * 1.25);
  const cup = new THREE.Group();
  cup.position.copy(cupAt);
  machine.add(cup);
  mesh(
    new THREE.LatheGeometry(
      [
        [0.026, 0],
        [0.03, 0.004],
        [0.04, 0.03],
        [0.046, 0.068],
        [0.047, 0.072],
        [0.043, 0.072],
        [0.041, 0.034],
        [0.03, 0.008],
        [0, 0.008],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      40,
    ),
    ceramic,
    0,
    0,
    0,
    cup,
  );
  const level = mesh(new THREE.CircleGeometry(0.042, 32), coffee, 0, 0.01, 0, cup);
  level.rotation.x = -Math.PI / 2;
  const streamTop = 0.2 * 1.25 - 0.012;
  const stream = mesh(
    new THREE.CylinderGeometry(0.0055, 0.0045, 1, 10, 1, true),
    new THREE.MeshPhysicalMaterial({ color: "#5a3218", roughness: 0.15, clearcoat: 1, transparent: true }),
    0,
    0,
    0,
    machine,
  );
  stream.castShadow = false;
  /* on the counter, a cup stack and a jar of beans; inside, a grinder */
  for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.044, 0.034, 0.075, 24, 1, true), ceramic, HATCH.x + 0.2, top + 0.038 + i * 0.03, hw + 0.15, ledge);
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 24), new THREE.MeshPhysicalMaterial({ color: "#d9c39b", roughness: 0.1, clearcoat: 1 }), HATCH.x + 0.5, top + 0.078, hw + 0.12, ledge);
  mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.02, 24), goldMetal, HATCH.x + 0.5, top + 0.168, hw + 0.12, ledge);
  mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.22, 24), ink, HATCH.x - 0.02, top + 0.11, hw - 0.2, body);
  mesh(new THREE.CylinderGeometry(0.09, 0.05, 0.14, 24), new THREE.MeshPhysicalMaterial({ color: "#efe6d2", roughness: 0.15, clearcoat: 1 }), HATCH.x - 0.02, top + 0.29, hw - 0.2, body);
  /* steam */
  const blob = blobTexture();
  const steam = Array.from({ length: 5 }, (_, i) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: blob, color: "#ffffff", transparent: true, opacity: 0, depthWrite: false }));
    sp.scale.setScalar(0.06);
    machine.add(sp);
    return { sp, phase: i / 5 };
  });
  /* the warm light under the awning */
  const counterLight = new THREE.PointLight(0xffc98a, 0, 2.6, 1.6);
  counterLight.position.set(HATCH.x, 1.5, hw + 0.32);
  body.add(counterLight);

  /* ---- the meadow ---- */
  const groundTex = groundAlpha();
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(GRASS_R, 96),
    new THREE.MeshStandardMaterial({ color: "#737a48", roughness: 1, transparent: true, alphaMap: groundTex, depthWrite: false }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  /* the shade under things, soft */
  const footTex = footprintTexture();
  const shade = (w: number, d: number, opacity: number, x: number, z: number, parent: THREE.Object3D, map: THREE.Texture = blob) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({ color: "#1f1a0e", alphaMap: map, transparent: true, opacity, depthWrite: false }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.004, z);
    m.renderOrder = 1;
    parent.add(m);
    return m;
  };
  shade(hl * 2 + 0.9, hw * 2 + 0.9, 0.9, 0, 0, bus, footTex);
  for (const x of [-WHEEL.x, WHEEL.x]) for (const z of [-WHEEL.z, WHEEL.z]) shade(0.7, 0.42, 0.55, x, z, bus);
  shade(1.5, 1.5, 0.45, TABLE.x, TABLE.z, scene);
  shade(0.8, 0.6, 0.4, BOARD.x, BOARD.z, scene);
  shade(0.8, 0.8, 0.5, PLANT.x, PLANT.z, scene);

  const wind = { value: 0 };
  const busAt = { value: new THREE.Vector2(0, 0) };
  {
    const rand = mulberry32(31);
    const blade = new THREE.PlaneGeometry(0.03, 1, 1, 4);
    blade.translate(0, 0.5, 0);
    const p = blade.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      p.setZ(i, y * y * 0.2);
      p.setX(i, p.getX(i) * (1 - y * 0.85));
    }
    const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.9 });
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uWind = wind;
      sh.uniforms.uBus = busAt;
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          /* glsl */ `#include <common>
uniform float uWind;
uniform vec2 uBus;
varying float vTip;
varying float vShade;
float gHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float gNoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(gHash(i), gHash(i + vec2(1.0, 0.0)), f.x), mix(gHash(i + vec2(0.0, 1.0)), gHash(i + vec2(1.0, 1.0)), f.x), f.y); }`,
        )
        .replace("#include <beginnormal_vertex>", "vec3 objectNormal = vec3(0.0, 1.0, 0.0);")
        .replace(
          "#include <begin_vertex>",
          /* glsl */ `#include <begin_vertex>
vec2 root = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
float bend = position.y * position.y;
transformed.x += sin(uWind * 1.3 + root.x * 1.7 + root.y * 1.1) * 0.06 * bend;
transformed.z += sin(uWind * 0.9 + root.x * 0.8 - root.y * 1.4) * 0.03 * bend;
vTip = position.y;
vec2 gq = abs(root - uBus) - vec2(${f(hl + 0.05)}, ${f(hw + 0.02)});
float gAo = smoothstep(-0.3, 0.6, length(max(gq, 0.0)) + min(max(gq.x, gq.y), 0.0));
gAo *= mix(0.55, 1.0, smoothstep(0.1, 0.75, length(root - vec2(${f(TABLE.x)}, ${f(TABLE.z)}))));
gAo *= mix(0.6, 1.0, smoothstep(0.1, 0.45, length(root - vec2(${f(BOARD.x)}, ${f(BOARD.z)}))));
gAo *= mix(0.55, 1.0, smoothstep(0.15, 0.5, length(root - vec2(${f(PLANT.x)}, ${f(PLANT.z)}))));
vShade = mix(0.38, 1.0, gAo) * mix(0.8, 1.14, gNoise(root * 0.8));`,
        );
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vTip;\nvarying float vShade;")
        .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb *= mix(0.42, 1.16, smoothstep(0.0, 1.0, vTip)) * vShade;")
        .replace("#include <normal_fragment_begin>", "#include <normal_fragment_begin>\nnormal = normalize(vNormal);");
    };
    const count = small ? 9000 : 24000;
    const grass = new THREE.InstancedMesh(blade, mat, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const c = new THREE.Color();
    const tones = [0x8d9a58, 0xa3ad66, 0x7a8a48, 0xb2b574, 0x6c7c42, 0x98a35e];
    let placed = 0;
    while (placed < count) {
      const r = GRASS_R * Math.sqrt(rand());
      const a = rand() * Math.PI * 2;
      /* thinner and shorter toward the rim */
      if (rand() < smooth(GRASS_R * 0.58, GRASS_R * 0.98, r)) continue;
      if (STONES.some(([sx, sz, sr]) => Math.hypot(Math.cos(a) * r - sx, Math.sin(a) * r - sz) < sr + 0.015)) continue;
      e.set((rand() - 0.5) * 0.4, rand() * Math.PI * 2, (rand() - 0.5) * 0.4);
      q.setFromEuler(e);
      const h = (0.06 + rand() * 0.11) * (1 - 0.5 * smooth(GRASS_R * 0.5, GRASS_R, r));
      m.compose(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r), q, new THREE.Vector3(1, h, 1));
      grass.setMatrixAt(placed, m);
      grass.setColorAt(placed, c.setHex(tones[Math.floor(rand() * tones.length)]));
      placed++;
    }
    grass.receiveShadow = true;
    scene.add(grass);
    /* wild flowers */
    const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.017, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.7 }), small ? 160 : 340);
    for (let i = 0; i < fl.count; i++) {
      const r = GRASS_R * 0.85 * Math.sqrt(rand());
      const a = rand() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      /* none under the bus */
      const under = Math.abs(x) < hl + 0.15 && Math.abs(z) < hw + 0.15;
      const k = 0.7 + rand() * 0.6;
      m.compose(new THREE.Vector3(x, under ? -1 : 0.09 + rand() * 0.08, z), q.identity(), new THREE.Vector3(k, 0.7 * k, k));
      fl.setMatrixAt(i, m);
      const tone = rand();
      fl.setColorAt(i, c.set(tone < 0.5 ? "#f6efdc" : tone < 0.8 ? "#e1bd6c" : "#fffaf0"));
    }
    scene.add(fl);
  }

  /* ---- a table and two chairs, a chalkboard, string lights ---- */
  const table = new THREE.Group();
  table.position.set(TABLE.x, 0, TABLE.z);
  scene.add(table);
  mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.03, 48), new THREE.MeshPhysicalMaterial({ color: "#f3ede0", roughness: 0.2, clearcoat: 0.8 }), 0, 0.74, 0, table);
  mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.72, 12), ink, 0, 0.37, 0, table);
  mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.025, 32), ink, 0, 0.012, 0, table);
  {
    const served = new THREE.Group();
    served.position.set(0.06, 0.755, 0.05);
    table.add(served);
    mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.012, 32), ceramic, 0, 0.006, 0, served);
    mesh(new THREE.CylinderGeometry(0.046, 0.034, 0.07, 24), ceramic, 0, 0.047, 0, served);
    const crema = mesh(new THREE.CircleGeometry(0.042, 24), new THREE.MeshStandardMaterial({ color: "#b98a5a", roughness: 0.3 }), 0, 0.078, 0, served);
    crema.rotation.x = -Math.PI / 2;
  }
  const chair = (x: number, z: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    /* the seat faces the table */
    g.rotation.y = Math.atan2(TABLE.x - x, TABLE.z - z);
    scene.add(g);
    mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 32), ink, 0, 0.46, 0, g);
    for (const [lx, lz] of [
      [0.14, 0.14],
      [-0.14, 0.14],
      [0.14, -0.14],
      [-0.14, -0.14],
    ]) {
      const leg = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.47, 8), ink, lx * 1.05, 0.23, lz * 1.05, g);
      leg.rotation.set(lz * 0.25, 0, -lx * 0.25);
    }
    const back = mesh(new THREE.TorusGeometry(0.19, 0.012, 8, 40, Math.PI), ink, 0, 0.62, -0.17, g);
    back.rotation.x = -0.12;
    for (const sx of [-0.1, 0, 0.1]) mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), ink, sx, 0.62, -0.18, g);
    for (const sx of [-0.18, 0.18]) mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.2, 8), ink, sx, 0.56, -0.16, g);
  };
  chair(TABLE.x + 0.42, TABLE.z + 0.3);
  chair(TABLE.x - 0.48, TABLE.z - 0.05);
  /* the menu board, facing the way people come */
  const chalkTex = chalkTexture(fonts);
  {
    const g = new THREE.Group();
    g.position.set(BOARD.x, 0, BOARD.z);
    g.rotation.y = 0.74;
    scene.add(g);
    const face = new THREE.MeshStandardMaterial({ map: chalkTex, roughness: 0.9 });
    for (const s of [1, -1]) {
      const b = mesh(new THREE.BoxGeometry(0.5, 0.76, 0.03), [wood, wood, wood, wood, s > 0 ? face : wood, s > 0 ? wood : face], 0, 0.4, s * 0.1, g);
      b.rotation.x = s * -0.16;
    }
  }
  /* a bay tree in a cream pot, clipped round */
  {
    const g = new THREE.Group();
    g.position.set(PLANT.x, 0, PLANT.z);
    scene.add(g);
    mesh(
      new THREE.LatheGeometry(
        [
          [0, 0],
          [0.15, 0],
          [0.19, 0.36],
          [0.215, 0.37],
          [0.215, 0.42],
          [0.19, 0.42],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        36,
      ),
      cream,
      0,
      0,
      0,
      g,
    );
    const band = mesh(new THREE.TorusGeometry(0.205, 0.01, 8, 40), goldMetal, 0, 0.36, 0, g);
    band.rotation.x = Math.PI / 2;
    const soil = mesh(new THREE.CircleGeometry(0.19, 28), new THREE.MeshStandardMaterial({ color: "#3b2d1f", roughness: 1 }), 0, 0.405, 0, g);
    soil.rotation.x = -Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.46, 8), wood, 0, 0.62, 0, g);
    const leaf = new THREE.MeshStandardMaterial({ color: "#6f7b45", roughness: 0.85 });
    for (const [lx, ly, lz, lr] of [
      [0, 1.04, 0, 0.27],
      [0.13, 1.12, 0.06, 0.18],
      [-0.14, 1.09, -0.04, 0.17],
      [0.03, 1.22, -0.08, 0.16],
      [-0.05, 0.95, 0.11, 0.16],
      [0.1, 0.97, -0.12, 0.15],
    ]) mesh(new THREE.SphereGeometry(lr, 22, 16), leaf, lx, ly, lz, g);
  }
  /* stepping stones across the grass to the counter */
  {
    const stone = new THREE.MeshStandardMaterial({ color: "#d8cfb7", roughness: 0.95 });
    STONES.forEach(([sx, sz, sr], i) => {
      const s = mesh(new THREE.CylinderGeometry(sr, sr * 1.04, 0.05, 32), stone, sx, 0.035, sz);
      s.scale.set(1, 1, 0.82 + (i % 2) * 0.1);
      s.rotation.y = i * 0.9;
    });
  }
  /* a string of lights along the awning's edge */
  const bulbs: THREE.Mesh[] = [];
  const halos: THREE.Sprite[] = [];
  const bulbMat = new THREE.MeshStandardMaterial({ color: "#fff6e2", emissive: "#ffcf87", emissiveIntensity: 0 });
  const haloMat = new THREE.SpriteMaterial({ map: blob, color: "#ffcf87", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const wireMat = new THREE.MeshBasicMaterial({ color: "#2a241d" });
  let wire: THREE.Mesh | null = null;
  const hangLights = () => {
    /* where the awning's front edge is now */
    hinge.updateMatrixWorld(true);
    const a = hinge.localToWorld(new THREE.Vector3(-(HATCH.w / 2 + 0.04), -(hh + 0.06), 0.06));
    const b = hinge.localToWorld(new THREE.Vector3(HATCH.w / 2 + 0.04, -(hh + 0.06), 0.06));
    const mid = a.clone().lerp(b, 0.5);
    mid.y -= 0.16;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    if (wire) {
      scene.remove(wire);
      wire.geometry.dispose();
    }
    wire = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.004, 5, false), wireMat);
    scene.add(wire);
    bulbs.forEach((bulb, i) => {
      const p = curve.getPoint((i + 0.5) / bulbs.length);
      bulb.position.set(p.x, p.y - 0.035, p.z);
      halos[i].position.copy(bulb.position);
    });
  };
  for (let i = 0; i < 8; i++) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), bulbMat);
    scene.add(bulb);
    bulbs.push(bulb);
    const h = new THREE.Sprite(haloMat);
    h.scale.setScalar(0.13);
    scene.add(h);
    halos.push(h);
  }

  /* ---- the pin over the roof: first on the map ---- */
  const pinFace = pinFaceTexture(fonts);
  const pin = new THREE.Group();
  scene.add(pin);
  {
    const prof = [
      [0, 0],
      [0.03, 0.06],
      [0.08, 0.16],
      [0.13, 0.27],
      [0.17, 0.37],
      [0.19, 0.45],
      [0.195, 0.5],
      [0.188, 0.56],
      [0.165, 0.62],
      [0.12, 0.665],
      [0.06, 0.69],
      [0, 0.697],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    mesh(new THREE.LatheGeometry(prof, 64), goldMetal, 0, 0, 0, pin);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.122, 48), new THREE.MeshStandardMaterial({ map: pinFace, roughness: 0.45 }));
    face.position.set(0, 0.49, 0.2);
    pin.add(face);
    pin.scale.setScalar(1.35);
  }
  const pinShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.8),
    new THREE.MeshBasicMaterial({ color: "#3a2a18", alphaMap: blob, transparent: true, opacity: 0, depthWrite: false }),
  );
  pinShadow.rotation.x = -Math.PI / 2;
  scene.add(pinShadow);

  /* ---- framing: an orbit round the bus, turned a little by the pointer,
     far enough back that the bus, the pin, the table and the board keep
     some room; the meadow's rim may run into the picture's soft edge ---- */
  const target = new THREE.Vector3(0, 1.0, 0.1);
  const rimPoints: THREE.Vector3[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    rimPoints.push(new THREE.Vector3(Math.cos(a) * GRASS_R * 0.8, 0.1, Math.sin(a) * GRASS_R * 0.8));
  }
  const keyPoints = [
    new THREE.Vector3(-0.1, 3.5, 0),
    new THREE.Vector3(2.08, 0, 1.0),
    new THREE.Vector3(2.08, 0, -1.0),
    new THREE.Vector3(-2.08, 0, 1.0),
    new THREE.Vector3(1.7, BUS.y1, -0.8),
    new THREE.Vector3(-1.7, BUS.y1, 0.8),
    new THREE.Vector3(TABLE.x - 0.7, 0, TABLE.z - 0.5),
    new THREE.Vector3(TABLE.x - 0.4, 0.9, TABLE.z + 0.6),
    new THREE.Vector3(TABLE.x + 0.6, 0, TABLE.z + 0.6),
    new THREE.Vector3(BOARD.x + 0.3, 0.85, BOARD.z),
    new THREE.Vector3(BOARD.x + 0.2, 0, BOARD.z + 0.3),
    new THREE.Vector3(PLANT.x + 0.3, 1.32, PLANT.z),
  ];
  const ndcP = new THREE.Vector3();
  let fitDist = 14;
  let shiftX = 0;
  let shiftY = 0;
  let px = 0;
  let py = 0;
  let cx = 0;
  let cy = 0;
  const orbit = (az: number, el: number, dist: number) => {
    camera.position.set(
      target.x + Math.sin(az) * Math.cos(el) * dist,
      target.y + Math.sin(el) * dist,
      target.z + Math.cos(az) * Math.cos(el) * dist,
    );
    camera.lookAt(target);
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  const AZ = 0.74;
  const EL = 0.18;
  const bounds = (pts: THREE.Vector3[]) => {
    const b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    for (const p of pts) {
      ndcP.copy(p).project(camera);
      b.x0 = Math.min(b.x0, ndcP.x);
      b.x1 = Math.max(b.x1, ndcP.x);
      b.y0 = Math.min(b.y0, ndcP.y);
      b.y1 = Math.max(b.y1, ndcP.y);
    }
    return b;
  };
  const fit = () => {
    camera.fov = camera.aspect < 1 ? 30 : 26;
    /* the nearest distance at which everything fits */
    let lo = 5;
    let hi = 60;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2;
      orbit(AZ, EL, mid);
      const b = bounds(keyPoints);
      let ok = (b.x1 - b.x0) / 2 <= 0.71 && (b.y1 - b.y0) / 2 <= 0.8;
      for (const p of rimPoints) {
        ndcP.copy(p).project(camera);
        if (Math.abs(ndcP.x - (b.x0 + b.x1) / 2) > 1 || Math.abs(ndcP.y - (b.y0 + b.y1) / 2) > 0.98) ok = false;
      }
      if (ok) hi = mid;
      else lo = mid;
    }
    fitDist = hi;
    /* centred, both ways, on what matters */
    orbit(AZ, EL, fitDist);
    const b = bounds(keyPoints);
    shiftX = (b.x0 + b.x1) / 2;
    shiftY = (b.y0 + b.y1) / 2;
  };
  const place = () => {
    orbit(AZ + cx * 0.14, EL + cy * 0.04, fitDist);
    camera.setViewOffset(1, 1, shiftX / 2, -shiftY / 2, 1, 1);
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fit();
    place();
    if (!active) renderer.render(scene, camera);
  };

  /* ---- the story, and the loop ---- */
  let raf = 0;
  let last = 0;
  let clock = still ? 99 : 0;
  let active = false;
  let disposed = false;

  const pose = (t: number) => {
    /* the bus rolls in and settles */
    const k = easeOut(t / T.drive);
    const x = -9 * (1 - k);
    bus.position.x = x;
    busAt.value.set(x, 0);
    for (const w of wheels) w.spin.rotation.z = w.s * (-x / WHEEL.r);
    const after = t - T.drive;
    body.rotation.z = after > 0 ? -0.02 * Math.sin(Math.min(after, 1.2) * Math.PI * 1.6) * Math.exp(-after * 2.6) : 0.006 * (1 - k);
    /* the hatch swings up */
    const open = easeInOut((t - T.open[0]) / (T.open[1] - T.open[0]));
    hinge.rotation.x = -(Math.PI / 2 + 0.16) * open;
    /* then the counter slides out */
    ledge.position.z = -0.36 * (1 - easeInOut((t - T.open[0] - 0.55) / 0.75));
    /* the valance hangs straight down from the awning's edge */
    if (valance) valance.rotation.x = -hinge.rotation.x;
    /* the struts follow it */
    body.updateMatrixWorld(true);
    for (const s of struts) {
      const a = new THREE.Vector3(HATCH.x + s.dx, HATCH.y0 + 0.16, hw + 0.012);
      const b = body.worldToLocal(hinge.localToWorld(new THREE.Vector3(s.dx, -(hh + 0.06) * 0.92, 0.02)));
      s.m.position.copy(a).lerp(b, 0.5);
      const dir = b.clone().sub(a);
      s.m.scale.set(1, dir.length(), 1);
      s.m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      s.m.visible = open > 0.15;
    }
    /* the string lights */
    const lit = smooth(T.lights[0], T.lights[1], t);
    bulbMat.emissiveIntensity = lit * 1.8;
    if (wire) wire.visible = t > T.open[0] + 0.2;
    haloMat.opacity = lit * 0.4;
    counterLight.intensity = lit * 1.6;
    /* the pin drops in */
    const pt = (t - T.pin) / 0.9;
    const drop = pt <= 0 ? 0 : pt >= 1 ? 1 : 1 + 2.70158 * Math.pow(pt - 1, 3) + 1.70158 * Math.pow(pt - 1, 2);
    const bob = Math.sin(t * 1.7) * 0.05 * smooth(T.pin + 0.9, T.pin + 1.6, t);
    pin.visible = pt > 0;
    pin.position.set(bus.position.x - 0.1, BUS.y1 + 0.36 + (1 - drop) * 2.2 + bob, 0);
    /* its face to the camera */
    pin.rotation.y = Math.atan2(camera.position.x - pin.position.x, camera.position.z - pin.position.z);
    (pinShadow.material as THREE.MeshBasicMaterial).opacity = 0.16 * drop * (1 - bob * 2);
    pinShadow.position.set(pin.position.x, BUS.y1 + 0.006, 0);
    /* the pour: on, then off, the cup filling */
    const since = t - T.pour;
    const cyc = since > 0 ? since % (POUR_ON + POUR_OFF) : -1;
    const pouring = still ? true : cyc >= 0 && cyc < POUR_ON;
    const fill = still ? 0.8 : cyc < 0 ? 0 : Math.min(1, cyc / POUR_ON);
    stream.visible = pouring;
    const surface = cupAt.y + 0.012 + fill * 0.05;
    const len = streamTop - surface;
    stream.position.set(cupAt.x, surface + len / 2, cupAt.z);
    stream.scale.set(1, Math.max(0.001, len), 1);
    (stream.material as THREE.MeshPhysicalMaterial).opacity = pouring ? Math.min(1, (cyc + 0.001) / 0.25, (POUR_ON - cyc) / 0.25) : 0;
    level.position.y = 0.012 + fill * 0.05;
    level.scale.setScalar(0.72 + fill * 0.28);
    level.visible = fill > 0.02;
    /* steam off the cup once there is coffee in it */
    const warm = smooth(T.pour + 0.6, T.pour + 2, t);
    for (const s of steam) {
      const f2 = (t * 0.22 + s.phase) % 1;
      s.sp.position.set(cupAt.x + Math.sin(f2 * 6 + s.phase * 9) * 0.02, cupAt.y + 0.1 + f2 * 0.32, cupAt.z + 0.01);
      s.sp.scale.setScalar(0.05 + f2 * 0.14);
      (s.sp.material as THREE.SpriteMaterial).opacity = warm * 0.38 * Math.sin(f2 * Math.PI);
    }
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    if (!still) {
      clock += dt;
      wind.value = clock;
    }
    cx += (px - cx) * Math.min(1, dt * 2);
    cy += (py - cy) * Math.min(1, dt * 2);
    place();
    pose(clock);
    if (clock > T.open[0] && clock < T.open[1] + 0.3) hangLights();
    renderer.render(scene, camera);
  };

  const pointer = (x: number, y: number) => {
    if (still) return;
    px = (x / canvas.clientWidth) * 2 - 1;
    py = (y / canvas.clientHeight) * 2 - 1;
  };
  const setActive = (on: boolean) => {
    if (disposed || on === active) return;
    active = on;
    if (on) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else cancelAnimationFrame(raf);
  };
  const dispose = () => {
    disposed = true;
    cancelAnimationFrame(raf);
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Sprite) {
        o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => m.dispose());
      }
    });
    for (const t of [interiorTex, stripes, badgeTex, monoTex, chalkTex, pinFace, blob, footTex, groundTex, envMap]) t.dispose();
    renderer.dispose();
  };

  resize();
  pose(clock);
  hangLights();
  renderer.render(scene, camera);
  opts.onReady();
  return { pointer, setActive, resize, dispose };
}
