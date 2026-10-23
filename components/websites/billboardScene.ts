import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* ----------------------------------------------------------------------
   The websites hero, in three.js: a roadside billboard in an empty field,
   the way they stand by the highway in old American films. Seen from the
   shoulder of a two-lane road at eye height: dry grass to the horizon,
   telephone poles walking off with their wires, a tree line lost in the
   haze, a low warm sun. The billboard is an old steel one on posts, a
   catwalk with floodlights, the poster pasted up in sheets; on it, the
   site of a client we built. Every so often the poster is changed for
   the next client's. The grass barely stirs. The view follows the
   pointer a very little.
   Fetched only by WebsitesHero, after first paint.
   ---------------------------------------------------------------------- */

export type BillboardSite = { name: string; domain: string; image: string };

export type BillboardOptions = {
  canvas: HTMLCanvasElement;
  sites: BillboardSite[];
  still: boolean;
  fonts: { display: string; body: string };
  /** how far right the billboard should sit, 0 = centre, 1 = right edge */
  onShow: (index: number) => void;
  onReady: () => void;
};

export type Billboard = {
  go: (index: number) => void;
  hitBoard: (x: number, y: number) => boolean;
  pointer: (x: number, y: number) => void;
  setActive: (on: boolean) => void;
  resize: () => void;
  dispose: () => void;
};

/* the board, in metres */
const PANEL = { w: 9.2, h: 4.2, bottom: 4.9 };
const BOARD_AT = new THREE.Vector3(4.2, 0, -2);
const BOARD_TURN = -0.32;
const CHANGE_EVERY = 9; // s
/* the road: a point near the viewer, and the way it runs off */
const ROAD_A = { x: -9, z: 30 };
const ROAD_D = (() => {
  const l = Math.hypot(-0.12, -1);
  return { x: -0.12 / l, z: -1 / l };
})();
/* how far a point on the ground is from the middle of the road */
const fromRoad = (x: number, z: number) => Math.abs((x - ROAD_A.x) * ROAD_D.z - (z - ROAD_A.z) * ROAD_D.x);
const CHANGE_S = 1.6; // s

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* the poster: the top of the site, printed, pasted up in sheets */
function drawPoster(img: HTMLImageElement) {
  const W = 2048;
  const H = Math.round(W / (PANEL.w / PANEL.h));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const srcH = img.width * (H / W);
  g.drawImage(img, 0, 0, img.width, Math.min(img.height, srcH), 0, 0, W, Math.min(H, (img.height / srcH) * H));
  /* printed and left out in the weather: warmer, a little faded */
  g.globalCompositeOperation = "multiply";
  g.fillStyle = "rgba(244,228,196,0.3)";
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = "screen";
  g.fillStyle = "rgba(60,48,30,0.08)";
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = "source-over";
  /* the seams between the sheets */
  const rand = mulberry32(5);
  const cols = 6;
  const rows = 2;
  g.lineWidth = 2;
  for (let i = 1; i < cols; i++) {
    const x = (W / cols) * i + (rand() - 0.5) * 6;
    g.strokeStyle = "rgba(60,44,28,0.22)";
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + (rand() - 0.5) * 4, H);
    g.stroke();
    g.strokeStyle = "rgba(255,248,232,0.25)";
    g.beginPath();
    g.moveTo(x + 2, 0);
    g.lineTo(x + 2, H);
    g.stroke();
  }
  for (let j = 1; j < rows; j++) {
    const y = (H / rows) * j + (rand() - 0.5) * 4;
    g.strokeStyle = "rgba(60,44,28,0.2)";
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y + (rand() - 0.5) * 3);
    g.stroke();
  }
  /* weather at the edges */
  const v = g.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.62);
  v.addColorStop(0, "rgba(70,52,30,0)");
  v.addColorStop(1, "rgba(70,52,30,0.2)");
  g.fillStyle = v;
  g.fillRect(0, 0, W, H);
  return c;
}

function plateTexture(fonts: BillboardOptions["fonts"]) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e9e1cc";
  g.fillRect(0, 0, 512, 96);
  g.fillStyle = "#2a2a26";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `700 46px ${fonts.body}`;
  g.letterSpacing = "10px";
  g.fillText("LOCALEYES", 256, 50);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* a field of dry grass, as seen from the ground: noise in straw and olive */
function groundTexture() {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#a99a63";
  g.fillRect(0, 0, S, S);
  const rand = mulberry32(17);
  const tones = ["#b8a66d", "#9b8f5a", "#8f8a56", "#c2ae78", "#a4955f", "#857f4f"];
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = tones[Math.floor(rand() * tones.length)];
    g.globalAlpha = 0.25 + rand() * 0.35;
    const x = rand() * S;
    const y = rand() * S;
    g.fillRect(x, y, 1 + rand() * 2.5, 3 + rand() * 9);
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(60, 60);
  t.anisotropy = 8;
  return t;
}

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SKY_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vDir;
  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    /* faded film: warm haze at the horizon, a dusty blue overhead */
    vec3 horizon = vec3(0.955, 0.86, 0.72);
    vec3 mid = vec3(0.9, 0.87, 0.8);
    vec3 top = vec3(0.68, 0.74, 0.77);
    vec3 col = mix(horizon, mid, smoothstep(0.0, 0.12, h));
    col = mix(col, top, smoothstep(0.1, 0.6, h));
    /* thin high cloud, drifting */
    vec2 p = vDir.xz / max(vDir.y, 0.06) * 0.9 + vec2(uTime * 0.004, 0.0);
    float cl = smoothstep(0.52, 0.85, fbm(p * 1.4)) * smoothstep(0.03, 0.25, h);
    col = mix(col, vec3(0.98, 0.95, 0.89), cl * 0.55);
    /* the sun's glow, low on the left */
    vec3 sunDir = normalize(vec3(-0.75, 0.12, 0.55));
    float s = max(dot(normalize(vDir), sunDir), 0.0);
    col += vec3(1.0, 0.82, 0.55) * pow(s, 18.0) * 0.35;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function createBillboard(opts: BillboardOptions): Billboard {
  const { canvas, sites, still, fonts } = opts;
  const N = sites.length;
  const small = window.innerWidth < 760;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const fogColor = new THREE.Color(0.93, 0.85, 0.72);
  scene.fog = new THREE.Fog(fogColor, 45, 340);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(34, 1.6, 0.1, 900);

  /* the sky */
  const skyUniforms = { uTime: { value: 0 } };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(600, 48, 24),
    new THREE.ShaderMaterial({ uniforms: skyUniforms, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false }),
  );
  scene.add(sky);

  /* a low warm sun from the front left, the sky to fill the shade */
  scene.add(new THREE.HemisphereLight(0xe6e4dc, 0x8a7a52, 1.15));
  const sun = new THREE.DirectionalLight(0xffd7a0, 3.1);
  sun.position.set(-30, 16, 26);
  sun.target.position.copy(BOARD_AT);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -14;
  sun.shadow.camera.near = 5;
  sun.shadow.camera.far = 90;
  sun.shadow.bias = -0.0005;
  sun.shadow.radius = 5;
  sun.shadow.blurSamples = 12;
  scene.add(sun, sun.target);

  /* the field */
  const groundTex = groundTexture();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* the road: a strip of old asphalt off to the horizon, its centre line worn */
  const roadTex = (() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 1024;
    const g = c.getContext("2d")!;
    g.fillStyle = "#56524b";
    g.fillRect(0, 0, 256, 1024);
    const rand = mulberry32(3);
    for (let i = 0; i < 6000; i++) {
      g.fillStyle = rand() > 0.5 ? "rgba(30,28,24,0.18)" : "rgba(150,140,120,0.14)";
      g.fillRect(rand() * 256, rand() * 1024, 1 + rand() * 2, 1 + rand() * 2);
    }
    g.fillStyle = "rgba(214,182,96,0.75)";
    for (let y = 0; y < 1024; y += 128) g.fillRect(124, y, 8, 72);
    g.fillStyle = "rgba(226,220,204,0.6)";
    g.fillRect(10, 0, 5, 1024);
    g.fillRect(241, 0, 5, 1024);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 40);
    t.anisotropy = 16;
    return t;
  })();
  const roadWay = new THREE.Group();
  roadWay.position.set(ROAD_A.x, 0.01, ROAD_A.z);
  roadWay.rotation.y = Math.atan2(-ROAD_D.x, -ROAD_D.z);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 900), new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.95 }));
  road.rotation.x = -Math.PI / 2;
  road.position.z = -440;
  road.receiveShadow = true;
  roadWay.add(road);
  scene.add(roadWay);

  /* ---- the billboard ---- */
  const board = new THREE.Group();
  board.position.copy(BOARD_AT);
  board.rotation.y = BOARD_TURN;
  scene.add(board);

  const steel = new THREE.MeshStandardMaterial({ color: 0x4c5548, metalness: 0.55, roughness: 0.62 });
  const steelDark = new THREE.MeshStandardMaterial({ color: 0x343a32, metalness: 0.5, roughness: 0.7 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xe4dcc6, roughness: 0.55, metalness: 0.1 });
  const grating = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "#3a3f36";
    g.fillRect(0, 0, 64, 64);
    g.strokeStyle = "#596052";
    g.lineWidth = 3;
    for (let i = 0; i <= 64; i += 16) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i, 64);
      g.stroke();
      g.beginPath();
      g.moveTo(0, i);
      g.lineTo(64, i);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(40, 3);
    return t;
  })();
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, cast = true) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = true;
    board.add(m);
    return m;
  };
  /* I-beam posts */
  const postH = PANEL.bottom + PANEL.h * 0.85;
  for (const px of [-3.2, 0, 3.2]) {
    add(new THREE.BoxGeometry(0.34, postH, 0.04), steel, px, postH / 2, -0.55);
    add(new THREE.BoxGeometry(0.04, postH, 0.36), steel, px, postH / 2, -0.55);
    add(new THREE.BoxGeometry(0.34, postH, 0.04), steel, px, postH / 2, -0.87);
  }
  /* bracing behind */
  for (const [x0, x1] of [
    [-3.2, 0],
    [0, 3.2],
  ]) {
    const len = Math.hypot(x1 - x0, PANEL.bottom - 0.8);
    const brace = add(new THREE.BoxGeometry(0.08, len, 0.08), steelDark, (x0 + x1) / 2, 0.8 + (PANEL.bottom - 0.8) / 2, -0.9);
    brace.rotation.z = Math.atan2(x1 - x0, PANEL.bottom - 0.8);
  }
  /* the panel's backing, the face, the trim */
  add(new THREE.BoxGeometry(PANEL.w + 0.3, PANEL.h + 0.3, 0.2), steelDark, 0, PANEL.bottom + PANEL.h / 2, -0.35);
  const posterMat = new THREE.MeshStandardMaterial({ roughness: 0.85, color: 0xffffff });
  const posterNext = new THREE.MeshStandardMaterial({ roughness: 0.85, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
  const face = add(new THREE.PlaneGeometry(PANEL.w, PANEL.h), posterMat, 0, PANEL.bottom + PANEL.h / 2, -0.24, false);
  const faceNext = add(new THREE.PlaneGeometry(PANEL.w, PANEL.h), posterNext, 0, PANEL.bottom + PANEL.h / 2, -0.235, false);
  const trimT = 0.16;
  add(new THREE.BoxGeometry(PANEL.w + trimT * 2, trimT, 0.12), trimMat, 0, PANEL.bottom + PANEL.h + trimT / 2, -0.24);
  add(new THREE.BoxGeometry(PANEL.w + trimT * 2, trimT, 0.12), trimMat, 0, PANEL.bottom - trimT / 2, -0.24);
  add(new THREE.BoxGeometry(trimT, PANEL.h, 0.12), trimMat, -PANEL.w / 2 - trimT / 2, PANEL.bottom + PANEL.h / 2, -0.24);
  add(new THREE.BoxGeometry(trimT, PANEL.h, 0.12), trimMat, PANEL.w / 2 + trimT / 2, PANEL.bottom + PANEL.h / 2, -0.24);
  /* the company plate, centred under the poster */
  const plateTex = plateTexture(fonts);
  const plate = add(new THREE.PlaneGeometry(1.3, 0.24), new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.6 }), 0, PANEL.bottom - 0.3, -0.17, false);
  void plate;
  /* the catwalk, its rail, and the floodlights */
  const catY = PANEL.bottom - 0.55;
  const walk = add(new THREE.BoxGeometry(PANEL.w + 0.4, 0.06, 0.9), new THREE.MeshStandardMaterial({ map: grating, roughness: 0.8, metalness: 0.4 }), 0, catY, 0.15);
  void walk;
  for (const z of [0.58]) {
    add(new THREE.CylinderGeometry(0.025, 0.025, PANEL.w + 0.4, 8), steel, 0, catY + 0.95, z).rotation.z = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.02, 0.02, PANEL.w + 0.4, 8), steel, 0, catY + 0.5, z).rotation.z = Math.PI / 2;
  }
  for (let i = 0; i <= 8; i++) add(new THREE.CylinderGeometry(0.02, 0.02, 0.95, 6), steel, -PANEL.w / 2 - 0.2 + ((PANEL.w + 0.4) * i) / 8, catY + 0.48, 0.58);
  for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.05, 0.05, 0.95), steelDark, -PANEL.w / 2 + 0.6 + ((PANEL.w - 1.2) * i) / 3, catY - 0.06, 0.12);
  /* floodlights on brackets out from the catwalk, aimed up at the poster */
  const lampHousing = new THREE.MeshStandardMaterial({ color: 0x30342d, metalness: 0.55, roughness: 0.5 });
  const lampGlass = new THREE.MeshStandardMaterial({ color: 0xfff3da, emissive: 0xffd68a, emissiveIntensity: 0.35, roughness: 0.15 });
  for (let i = 0; i < 4; i++) {
    const x = -PANEL.w / 2 + 1.0 + ((PANEL.w - 2.0) * i) / 3;
    add(new THREE.BoxGeometry(0.05, 0.05, 0.62), steelDark, x, catY + 0.02, 0.88);
    const lamp = new THREE.Group();
    lamp.position.set(x, catY + 0.14, 1.2);
    lamp.rotation.x = 1.06;
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.24, 0.3), lampHousing);
    housing.castShadow = true;
    lamp.add(housing);
    const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.18), lampGlass);
    lens.position.z = -0.151;
    lens.rotation.y = Math.PI;
    lamp.add(lens);
    board.add(lamp);
  }
  /* a ladder up the middle post */
  for (const sx of [-0.25, 0.25]) add(new THREE.CylinderGeometry(0.02, 0.02, catY, 6), steel, sx, catY / 2, 0.05);
  for (let y = 0.4; y < catY; y += 0.35) add(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), steel, 0, y, 0.05).rotation.z = Math.PI / 2;

  /* ---- telephone poles walking off with their wires ---- */
  const wood = new THREE.MeshStandardMaterial({ color: 0x5c4a38, roughness: 0.9 });
  const poleTops: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const along = 6 + i * 40;
    const x = ROAD_A.x + ROAD_D.x * along + ROAD_D.z * 6.5;
    const z = ROAD_A.z + ROAD_D.z * along - ROAD_D.x * 6.5;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 9, 8), wood);
    pole.position.set(x, 4.5, z);
    pole.castShadow = true;
    scene.add(pole);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.12), wood);
    bar.position.set(x, 8.4, z);
    scene.add(bar);
    poleTops.push(new THREE.Vector3(x, 8.5, z));
  }
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x2b2924 });
  for (let i = 0; i < poleTops.length - 1; i++) {
    for (const off of [-0.85, 0, 0.85]) {
      const a = poleTops[i].clone().add(new THREE.Vector3(off, 0, 0));
      const b = poleTops[i + 1].clone().add(new THREE.Vector3(off, 0, 0));
      const mid = a.clone().lerp(b, 0.5);
      mid.y -= 0.9;
      const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, 0.012 + i * 0.004, 4, false), wireMat);
      scene.add(wire);
    }
  }

  /* ---- a tree line lost in the haze ---- */
  {
    const rand = mulberry32(23);
    const count = 160;
    const trees = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x5f6343, roughness: 1 }), count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < count; i++) {
      const x = -260 + rand() * 520;
      const z = -190 - rand() * 50;
      const s = 4 + rand() * 7;
      m.compose(new THREE.Vector3(x, s * 0.55, z), q, new THREE.Vector3(s * (0.8 + rand() * 0.6), s, s * 0.8));
      trees.setMatrixAt(i, m);
    }
    scene.add(trees);
  }

  /* ---- tall dry grass, near the board and the road ---- */
  const wind = { value: 0 };
  {
    const rand = mulberry32(31);
    const blade = new THREE.PlaneGeometry(0.06, 1, 1, 4);
    blade.translate(0, 0.5, 0);
    /* a gentle curve in each blade */
    const p = blade.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      p.setZ(i, y * y * 0.25);
      p.setX(i, p.getX(i) * (1 - y * 0.85));
    }
    blade.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.9 });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uWind = wind;
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float uWind;").replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float bend = position.y * position.y;
        vec3 root = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
        transformed.x += sin(uWind * 0.9 + root.x * 0.35 + root.z * 0.21) * 0.07 * bend;`,
      );
    };
    const count = small ? 9000 : 22000;
    const grass = new THREE.InstancedMesh(blade, mat, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const c = new THREE.Color();
    const tones = [0xc9b47c, 0xb5a46c, 0xa69b63, 0xd3c08a, 0x9a945e, 0xbfae76];
    let placed = 0;
    while (placed < count) {
      /* most of it round the board and in the near field */
      const near = rand() < 0.55;
      const x = near ? BOARD_AT.x + (rand() - 0.5) * 34 : -30 + rand() * 60;
      const z = near ? BOARD_AT.z + (rand() - 0.5) * 22 : -40 + rand() * 62;
      /* not on the road */
      if (fromRoad(x, z) < 4.4) continue;
      e.set((rand() - 0.5) * 0.35, rand() * Math.PI * 2, (rand() - 0.5) * 0.35);
      q.setFromEuler(e);
      const h = 0.45 + rand() * 0.9;
      m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(1, h, 1));
      grass.setMatrixAt(placed, m);
      grass.setColorAt(placed, c.setHex(tones[Math.floor(rand() * tones.length)]));
      placed++;
    }
    grass.receiveShadow = true;
    scene.add(grass);
  }

  /* ---- the posters ---- */
  const cache = new Map<number, Promise<THREE.Texture>>();
  const posterFor = (i: number) => {
    let p = cache.get(i);
    if (!p) {
      p = loadImage(sites[i].image).then((img) => {
        const t = new THREE.CanvasTexture(drawPoster(img));
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = aniso;
        return t;
      });
      cache.set(i, p);
    }
    return p;
  };

  /* ---- framing: the board on the right of the picture, room for words on the left ---- */
  const look = new THREE.Vector3();
  let px = 0;
  let py = 0;
  let cx = 0;
  let cy = 0;
  const place = () => {
    const portrait = camera.aspect < 1;
    /* landscape: the board well over to the right, the sky on the left
       left open for the words */
    const base = portrait ? new THREE.Vector3(0.5, 1.55, 24) : new THREE.Vector3(-4.5, 1.55, 22);
    camera.position.set(base.x + cx * 0.5, base.y + cy * 0.2, base.z);
    look.set(portrait ? 3.6 : -0.2, portrait ? 4.6 : 5.0, -2);
    camera.lookAt(look);
    camera.fov = portrait ? 46 : 34;
    camera.updateProjectionMatrix();
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    place();
    if (!active) renderer.render(scene, camera);
  };

  /* ---- state and loop ---- */
  let current = 0;
  let changing: { to: number; t: number } | null = null;
  let queued: number | null = null;
  let idle = 0;
  let ready = false;
  let raf = 0;
  let last = 0;
  let clock = 0;
  let active = false;
  let disposed = false;

  const go = (i: number) => {
    if (!ready || changing) {
      queued = i;
      return;
    }
    if (i === current) return;
    posterFor(i)
      .then((tex) => {
        if (disposed || changing) {
          queued = i;
          return;
        }
        posterNext.map = tex;
        posterNext.needsUpdate = true;
        posterNext.opacity = 0;
        changing = { to: i, t: 0 };
        opts.onShow(i);
        if (still) {
          changing.t = 1;
        }
      })
      .catch(() => {});
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    clock += dt;
    if (!still) {
      wind.value = clock;
      skyUniforms.uTime.value = clock;
    }
    if (changing) {
      changing.t = Math.min(1, changing.t + dt / CHANGE_S);
      posterNext.opacity = changing.t * changing.t * (3 - 2 * changing.t);
      if (changing.t >= 1) {
        posterMat.map = posterNext.map;
        posterMat.needsUpdate = true;
        posterNext.opacity = 0;
        current = changing.to;
        changing = null;
        idle = 0;
        void posterFor((current + 1) % N);
        if (queued !== null && queued !== current) {
          const q = queued;
          queued = null;
          go(q);
        } else queued = null;
      }
    } else if (!still && ready) {
      idle += dt;
      if (idle > CHANGE_EVERY) {
        idle = 0;
        go((current + 1) % N);
      }
    }
    cx += (px - cx) * Math.min(1, dt * 1.6);
    cy += (py - cy) * Math.min(1, dt * 1.6);
    place();
    renderer.render(scene, camera);
  };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hitBoard = (x: number, y: number) => {
    ndc.set((x / canvas.clientWidth) * 2 - 1, -(y / canvas.clientHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects([face, faceNext], false).length > 0;
  };
  const pointer = (x: number, y: number) => {
    if (still) return;
    px = (x / canvas.clientWidth) * 2 - 1;
    py = -((y / canvas.clientHeight) * 2 - 1);
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
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => m.dispose());
      }
    });
    for (const p of cache.values()) p.then((t) => t.dispose()).catch(() => {});
    for (const t of [groundTex, roadTex, grating, plateTex, envMap]) t.dispose();
    pmrem.dispose();
    renderer.dispose();
  };

  resize();
  posterFor(0)
    .then((tex) => {
      if (disposed) return;
      posterMat.map = tex;
      posterMat.needsUpdate = true;
      ready = true;
      opts.onShow(0);
      opts.onReady();
      renderer.render(scene, camera);
      void posterFor(1 % N);
    })
    .catch(() => {});

  return { go, hitBoard, pointer, setActive, resize, dispose };
}
