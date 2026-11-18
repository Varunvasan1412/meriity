// Meriity hero: a real 3D night city (three.js).
// A seeded grid city (instanced towers with shader-drawn windows), a sodium-lit street grid,
// moving headlight / tail-light traffic, aviation beacons, haze and bloom, seen from a slow
// drifting aerial camera. Everything is procedural: no textures, no downloads.
//
// The module is framework-free. NightCity3D.tsx owns the React side (stinger, scroll, pointer).

import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export type NightCityOptions = {
  /** Fewer cars, smaller render size. */
  lite?: boolean;
  /** Draw one finished, fully lit frame and never animate. */
  still?: boolean;
};

export type NightCity = {
  /** Begin the light-up and the camera drift (call when the stinger lifts). */
  start: () => void;
  /** Pause or resume the render loop (offscreen, hidden tab). */
  setActive: (on: boolean) => void;
  /** 0 = hero at the top, 1 = hero scrolled away. */
  setScroll: (p: number) => void;
  /** Pointer position, -1..1 on both axes. */
  setPointer: (x: number, y: number) => void;
  resize: () => void;
  /** Deterministic frame for tests: seconds since the lift. */
  renderAt: (t: number) => void;
  dispose: () => void;
};

// ---------------------------------------------------------------------------------------------
// City layout
// ---------------------------------------------------------------------------------------------
const PITCH = 16; // block + road
const ROAD = 4.6; // road width
const X0 = -320, X1 = 360, Z0 = -820, Z1 = 140; // city extent (camera looks down -z)
const CBD = { x: 70, z: -320 }; // the tall cluster sits right of the headline
const SOUTHBANK = { x: -70, z: -250 };
const BLVD = 7.5; // half-width of the central avenue (x = 0)

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gauss = (dx: number, dz: number, s: number) => Math.exp(-(dx * dx + dz * dz) / (s * s));

type Tower = { x: number; z: number; w: number; d: number; h: number; tint: number; hero: number };

function buildCity(): Tower[] {
  const r = rng(1408);
  const out: Tower[] = [];
  const heightAt = (x: number, z: number) => {
    const cbd = gauss(x - CBD.x, z - CBD.z, 125);
    const sb = gauss(x - SOUTHBANK.x, z - SOUTHBANK.z, 75);
    const far = Math.min(1, Math.max(0, (-z - 380) / 380)); // a ragged horizon beyond the CBD
    const a = r(), b = r(), c = r();
    let h = 4 + a * 9 + cbd * (26 + b * b * 150) + sb * (8 + c * 70) + far * c * c * 38;
    if (z > -60) h = Math.min(h, 5 + a * 11); // keep the ground below the camera low
    return h;
  };

  for (let ix = Math.floor(X0 / PITCH); ix < Math.ceil(X1 / PITCH); ix++) {
    for (let iz = Math.floor(Z0 / PITCH); iz < Math.ceil(Z1 / PITCH); iz++) {
      const bx = ix * PITCH + ROAD / 2;
      const bz = iz * PITCH + ROAD / 2;
      const size = PITCH - ROAD;
      if (r() < 0.06) continue; // a park or plaza
      const split = r();
      const lots: [number, number, number, number][] = []; // x, z, w, d (lot rectangle)
      if (split < 0.3) lots.push([bx, bz, size, size]);
      else if (split < 0.65) {
        if (r() < 0.5) {
          lots.push([bx, bz, size / 2, size], [bx + size / 2, bz, size / 2, size]);
        } else {
          lots.push([bx, bz, size, size / 2], [bx, bz + size / 2, size, size / 2]);
        }
      } else {
        const hs = size / 2;
        lots.push([bx, bz, hs, hs], [bx + hs, bz, hs, hs], [bx, bz + hs, hs, hs], [bx + hs, bz + hs, hs, hs]);
      }
      for (const [lx, lz, lw, ld] of lots) {
        const w = lw * (0.72 + r() * 0.24);
        const d = ld * (0.72 + r() * 0.24);
        const x = lx + lw / 2 + (r() - 0.5) * (lw - w);
        const z = lz + ld / 2 + (r() - 0.5) * (ld - d);
        // The boulevard: a wide, busy avenue leading the eye from the camera to the CBD.
        if (Math.abs(x) - w / 2 < BLVD) continue;
        out.push({ x, z, w, d, h: heightAt(x, z), tint: r(), hero: 0 });
      }
    }
  }

  // The landmark: one slender tower at the heart of the CBD with a coral crown.
  let best = 0, bestD = Infinity;
  out.forEach((t, i) => {
    const dd = Math.hypot(t.x - CBD.x, t.z - CBD.z);
    if (dd < bestD) { bestD = dd; best = i; }
  });
  Object.assign(out[best], { w: 8.5, d: 8.5, h: 182, hero: 1, tint: 0 });
  // A few supporting tall, slim towers around it.
  const r2 = rng(77);
  for (let k = 0; k < 7; k++) {
    let i = 0, tries = 0;
    do {
      i = Math.floor(r2() * out.length);
      tries++;
    } while (tries < 400 && (Math.hypot(out[i].x - CBD.x, out[i].z - CBD.z) > 110 || out[i].hero));
    out[i].h = 120 + r2() * 60;
    out[i].w = Math.min(out[i].w, 9);
    out[i].d = Math.min(out[i].d, 9);
  }
  // Stepped crowns: many towers get a slimmer upper tier, so the skyline isn't all flat boxes.
  const r3 = rng(311);
  const tiers: Tower[] = [];
  for (const t of out) {
    if (t.h > 40 && !t.hero && r3() < 0.55) {
      const k = 0.55 + r3() * 0.25;
      const top = t.h;
      t.h = top * k;
      tiers.push({ ...t, w: t.w * (0.55 + r3() * 0.2), d: t.d * (0.55 + r3() * 0.2), h: top });
    }
  }
  return out.concat(tiers);
}

// ---------------------------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------------------------
const COMMON = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  vec3 applyFog(vec3 col, float depth, float y){
    float f = 1.0 - exp(-pow(depth*uFogDensity, 2.0));
    f *= 1.0 - 0.5*smoothstep(10.0, 190.0, y);   // haze hugs the ground; crowns stay crisp
    return mix(col, uFogColor, f);
  }
`;

const towerVert = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aInfo;          // height, tint roll, hero
  varying vec3 vWorld;
  varying vec3 vN;
  varying float vSeed;
  varying vec3 vInfo;
  varying float vDepth;
  void main(){
    vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = w.xyz; vN = normal; vSeed = aSeed; vInfo = aInfo;
    vec4 mv = viewMatrix * w;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const towerFrag = /* glsl */ `
  uniform float uTime;
  uniform float uLight;   // 0..1 light-up after the stinger
  uniform float uCoral;   // share of towers with coral-lit floors (grows with scroll)
  ${COMMON}
  varying vec3 vWorld;
  varying vec3 vN;
  varying float vSeed;
  varying vec3 vInfo;
  varying float vDepth;

  void main(){
    vec3 n = normalize(vN);
    float H = vInfo.x;
    float y = vWorld.y;
    float hero = vInfo.z;
    float isCoral = max(step(vInfo.y, uCoral), hero);

    // Facade: blue-black glass, slightly lifted towards the top where it catches the sky glow.
    vec3 col = vec3(0.0016, 0.0022, 0.0042) + vec3(0.004, 0.0042, 0.008) * smoothstep(0.0, 1.0, y / max(H, 1.0));
    // Street light washing up the base.
    col += vec3(1.0, 0.55, 0.25) * 0.035 * exp(-y * 0.5);

    if (n.y > 0.5) {
      col = vec3(0.0012, 0.0016, 0.003);           // roof
    } else {
      float face = n.x > 0.5 ? 1.0 : (n.x < -0.5 ? 2.0 : (n.z > 0.5 ? 3.0 : 4.0));
      float u = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
      vec2 cs = vec2(1.55, 1.3) * (1.0 + 0.25 * fract(vSeed * 3.7)); // per-tower window module
      vec2 g = vec2(u, y) / cs;
      vec2 cell = floor(g);
      vec2 f = fract(g);
      float win = smoothstep(0.16, 0.22, f.x) * smoothstep(0.84, 0.78, f.x)
                * smoothstep(0.24, 0.32, f.y) * smoothstep(0.80, 0.72, f.y);

      float h  = hash21(cell + vSeed * 91.7 + face * 13.1);
      float h2 = hash21(cell * 1.7 + vSeed * 17.3 + face);
      float density = 0.05 + 0.26 * pow(fract(vSeed * 7.13), 1.6);
      density = mix(density, 0.45, hero);
      float on = step(h, density) * step(h2, uLight);
      // Life: now and then a window goes dark or comes on.
      float epoch = floor(uTime * 0.08 + h * 17.0);
      on *= step(0.035, hash21(cell + epoch * 1.37));

      vec3 warm = mix(vec3(1.0, 0.70, 0.40), vec3(0.80, 0.88, 1.0), step(0.72, hash21(cell + 3.3)));
      vec3 coral = vec3(1.0, 0.24, 0.27);
      vec3 wc = mix(warm, coral, isCoral * step(0.25, hash21(cell + 9.1)));
      float bright = 0.35 + 0.9 * pow(hash21(cell + 7.7), 2.0);
      vec3 lit = wc * bright * 0.62;
      vec3 dark = vec3(0.0035, 0.0048, 0.0085);   // unlit glass

      vec3 detail = col + win * mix(dark, lit, on);
      // Far away the window grid shrinks below a pixel: blend to its average to avoid shimmer.
      float px = max(fwidth(g.x), fwidth(g.y));
      vec3 avg = col + 0.3 * mix(dark, wc * 0.45, density * uLight);
      col = mix(detail, avg, smoothstep(0.2, 0.6, px));

      // Crown lights on the tall towers; the landmark wears coral.
      float crown = step(70.0, H) * max(step(0.66, fract(vSeed * 5.3)), hero) * smoothstep(H - 2.6, H - 2.4, y) * (1.0 - smoothstep(H - 1.9, H - 1.7, y));
      vec3 crownCol = mix(vec3(0.85, 0.9, 1.0) * 0.28, coral * 2.2, max(hero, isCoral));
      col += crown * crownCol * uLight;
      // The landmark: thin coral fins running up its corners.
      if (hero > 0.5) {
        float edge = abs(n.x) > 0.5 ? abs(fract((vWorld.z + 4.25) / 8.5) - 0.5) : abs(fract((vWorld.x + 4.25) / 8.5) - 0.5);
        float fin = smoothstep(0.47, 0.495, edge);
        col += coral * 1.4 * fin * uLight * smoothstep(0.0, 60.0, y);
      }
    }

    col = applyFog(col, vDepth, y);
    col += (hash21(gl_FragCoord.xy) - 0.5) / 400.0;   // dither
    gl_FragColor = vec4(col, 1.0);
  }
`;

const groundVert = /* glsl */ `
  varying vec3 vWorld; varying float vDepth;
  void main(){
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vec4 mv = viewMatrix * w; vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const groundFrag = /* glsl */ `
  uniform float uLight;
  uniform float uPitch;
  ${COMMON}
  varying vec3 vWorld; varying float vDepth;
  void main(){
    vec2 p = vWorld.xz;
    vec2 d = abs(mod(p + uPitch * 0.5, uPitch) - uPitch * 0.5);   // distance to the road centrelines
    float road = min(d.x, d.y);
    vec3 col = vec3(0.003, 0.004, 0.007);
    vec3 sodium = vec3(1.0, 0.52, 0.22);
    float glow = exp(-road * road * 0.22) * 0.16 + exp(-dot(d, d) * 0.12) * 0.22; // streets + junctions
    float px = fwidth(p.x) / uPitch;
    glow = mix(glow, 0.05, smoothstep(0.08, 0.35, px));
    // The boulevard's wider glow.
    glow += exp(-vWorld.x * vWorld.x * 0.03) * 0.12;
    col += sodium * glow * (0.25 + 0.75 * uLight);
    col = applyFog(col, vDepth, 0.0);
    col += (hash21(gl_FragCoord.xy) - 0.5) / 400.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const carVert = /* glsl */ `
  attribute vec4 aCar;      // road coordinate, axis (0 = runs along z, 1 = along x), direction, phase
  attribute float aSpeed;
  uniform float uTime;
  uniform vec2 uSpanX;
  uniform vec2 uSpanZ;
  varying float vDir; varying float vAlong; varying float vDepth;
  void main(){
    float axis = aCar.y, dir = aCar.z;
    vec2 span = axis < 0.5 ? uSpanZ : uSpanX;
    float L = span.y - span.x;
    float s = span.x + mod(aCar.w * L + uTime * aSpeed * dir, L);
    vec3 p = position;
    vec3 w;
    float lane = dir * 1.05;
    if (axis < 0.5) w = vec3(aCar.x + lane + p.x * 0.42, 0.55 + p.y * 0.26, s + p.z * 3.6);
    else            w = vec3(s + p.x * 3.6, 0.55 + p.y * 0.26, aCar.x - lane + p.z * 0.42);
    vAlong = (axis < 0.5 ? p.z : p.x) * dir;
    vDir = dir;
    vec4 mv = viewMatrix * vec4(w, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const carFrag = /* glsl */ `
  uniform float uTraffic;
  ${COMMON}
  varying float vDir; varying float vAlong; varying float vDepth;
  void main(){
    vec3 head = vec3(2.6, 2.2, 1.7);
    vec3 tail = vec3(3.4, 0.14, 0.10);
    // Heading towards the camera (+z / +x) shows headlights; heading away shows tail lights.
    vec3 c = vDir > 0.0 ? head : tail;
    float streak = 0.25 + 0.75 * smoothstep(-0.5, 0.5, vAlong);  // bright nose, fading trail
    vec3 col = c * streak * uTraffic;
    float f = 1.0 - exp(-pow(vDepth * uFogDensity * 1.15, 2.0));
    gl_FragColor = vec4(col * (1.0 - f), 1.0);
  }
`;

const beaconVert = /* glsl */ `
  attribute float aSeed;
  uniform float uTime; uniform float uPx;
  varying float vBlink; varying float vDepth;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    float f = fract(uTime * 0.45 + aSeed);
    vBlink = smoothstep(0.0, 0.06, f) * (1.0 - smoothstep(0.12, 0.42, f));
    gl_PointSize = uPx * 900.0 / vDepth;
    gl_Position = projectionMatrix * mv;
  }
`;

const beaconFrag = /* glsl */ `
  uniform float uLight;
  ${COMMON}
  varying float vBlink; varying float vDepth;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float a = exp(-dot(c, c) * 30.0);
    float f = 1.0 - exp(-pow(vDepth * uFogDensity * 0.9, 2.0));
    gl_FragColor = vec4(vec3(3.2, 0.25, 0.18) * a * (0.15 + vBlink) * uLight * (1.0 - f), 1.0);
  }
`;

const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main(){
    vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz - cameraPosition);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

const skyFrag = /* glsl */ `
  uniform vec3 uHorizon; uniform vec3 uZenith; uniform vec3 uGlow;
  float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  varying vec3 vDir;
  void main(){
    float e = vDir.y;
    vec3 col = mix(uHorizon, uZenith, smoothstep(-0.02, 0.38, e));
    col += uGlow * exp(-max(e, 0.0) * 9.0);          // city light pollution on the horizon
    col += uGlow * 0.6 * exp(-pow((vDir.x - 0.25) * 2.2, 2.0)) * exp(-max(e, 0.0) * 14.0); // brightest behind the CBD
    col += (hash21(gl_FragCoord.xy) - 0.5) / 300.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---------------------------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------------------------
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeInOut = (x: number) => x * x * (3 - 2 * x);

export function createNightCity(canvas: HTMLCanvasElement, opts: NightCityOptions = {}): NightCity {
  const lite = !!opts.lite;
  const renderer = new WebGLRenderer({ canvas, antialias: !lite, powerPreference: "high-performance", alpha: false });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x050507, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 1, 2600);

  const fog = { uFogColor: { value: new Color(0.03, 0.022, 0.03) }, uFogDensity: { value: 0.00185 } };
  const time = { value: 0 };
  const light = { value: 0 };
  const coralShare = { value: 0.035 };

  // Sky dome
  const sky = new Mesh(
    new SphereGeometry(2000, 32, 16),
    new ShaderMaterial({
      vertexShader: skyVert,
      fragmentShader: skyFrag,
      side: BackSide,
      depthWrite: false,
      uniforms: {
        uHorizon: { value: new Color(0.024, 0.017, 0.024) },
        uZenith: { value: new Color(0.0015, 0.002, 0.0045) },
        uGlow: { value: new Color(0.075, 0.03, 0.024) },
      },
    }),
  );
  sky.renderOrder = -1;
  scene.add(sky);

  // Ground and streets
  const ground = new Mesh(
    new PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2),
    new ShaderMaterial({
      vertexShader: groundVert,
      fragmentShader: groundFrag,
      uniforms: { ...fog, uLight: light, uPitch: { value: PITCH } },
    }),
  );
  scene.add(ground);

  // Towers
  const towers = buildCity();
  const box = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  // Drop the bottom face: never seen.
  const seeds = new Float32Array(towers.length);
  const info = new Float32Array(towers.length * 3);
  towers.forEach((t, i) => {
    seeds[i] = (i * 0.61803) % 1;
    info.set([t.h, t.tint, t.hero], i * 3);
  });
  box.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
  box.setAttribute("aInfo", new InstancedBufferAttribute(info, 3));
  const towerMat = new ShaderMaterial({
    vertexShader: towerVert,
    fragmentShader: towerFrag,
    uniforms: { ...fog, uTime: time, uLight: light, uCoral: coralShare },
  });
  const city = new InstancedMesh(box, towerMat, towers.length);
  const m = new Matrix4();
  towers.forEach((t, i) => {
    m.makeScale(t.w, t.h, t.d).setPosition(t.x, 0, t.z);
    city.setMatrixAt(i, m);
  });
  city.frustumCulled = false;
  scene.add(city);

  // Traffic
  const carCount = lite ? 700 : 1600;
  const carGeo = new InstancedBufferGeometry();
  const unit = new BoxGeometry(1, 1, 1);
  carGeo.setIndex(unit.getIndex());
  carGeo.setAttribute("position", unit.getAttribute("position"));
  const cars = new Float32Array(carCount * 4);
  const speeds = new Float32Array(carCount);
  const rc = rng(5);
  const zRoads: number[] = [], xRoads: number[] = [];
  for (let k = Math.ceil(X0 / PITCH); k <= Math.floor(X1 / PITCH); k++) zRoads.push(k * PITCH);
  for (let k = Math.ceil(Z0 / PITCH); k <= Math.floor(Z1 / PITCH); k++) xRoads.push(k * PITCH);
  // A few arterials carry most of the traffic.
  const busyZ = zRoads.filter((_, i) => i % 5 === 2);
  const busyX = xRoads.filter((_, i) => i % 6 === 3);
  for (let i = 0; i < carCount; i++) {
    const dir = rc() < 0.5 ? 1 : -1;
    if (rc() < 0.22) {
      // The boulevard: several lanes each way.
      cars.set([dir * rc() * 4.6, 0, dir, rc()], i * 4);
      speeds[i] = 12 + rc() * 10;
      continue;
    }
    const axis = rc() < 0.55 ? 0 : 1;
    const pool = axis === 0 ? (rc() < 0.6 ? busyZ : zRoads) : rc() < 0.6 ? busyX : xRoads;
    const road = pool[Math.floor(rc() * pool.length)];
    cars.set([road, axis, dir, rc()], i * 4);
    speeds[i] = 9 + rc() * 11;
  }
  carGeo.setAttribute("aCar", new InstancedBufferAttribute(cars, 4));
  carGeo.setAttribute("aSpeed", new InstancedBufferAttribute(speeds, 1));
  carGeo.instanceCount = carCount;
  const traffic = { value: 0 };
  const carMesh = new Mesh(
    carGeo,
    new ShaderMaterial({
      vertexShader: carVert,
      fragmentShader: carFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        ...fog,
        uTime: time,
        uTraffic: traffic,
        uSpanX: { value: new Vector2(X0, X1) },
        uSpanZ: { value: new Vector2(Z0, Z1) },
      },
    }),
  );
  carMesh.frustumCulled = false;
  scene.add(carMesh);

  // Aviation beacons on the tall towers
  const tall = towers.filter((t) => t.h > 85);
  const bPos = new Float32Array(tall.length * 3);
  const bSeed = new Float32Array(tall.length);
  tall.forEach((t, i) => {
    bPos.set([t.x, t.h + 1.2, t.z], i * 3);
    bSeed[i] = (i * 0.37) % 1;
  });
  const bGeo = new BufferGeometry();
  bGeo.setAttribute("position", new BufferAttribute(bPos, 3));
  bGeo.setAttribute("aSeed", new BufferAttribute(bSeed, 1));
  const pxRatio = { value: 1 };
  const beacons = new Points(
    bGeo,
    new ShaderMaterial({
      vertexShader: beaconVert,
      fragmentShader: beaconFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { ...fog, uTime: time, uLight: light, uPx: pxRatio },
    }),
  );
  beacons.frustumCulled = false;
  scene.add(beacons);

  // Post: bloom makes every light source glow like a lens would see it.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(256, 256), 0.7, 0.45, 0.55);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- camera rig ----
  const pos = new Vector3();
  const target = new Vector3();
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let scroll = 0, scrollS = 0;

  function place(t: number) {
    // t: seconds since the lift.
    const enter = easeOutExpo(Math.min(1, Math.max(0, t) / 4.2));
    const k = easeInOut(0.5 - 0.5 * Math.cos((Math.max(t, 0) * Math.PI * 2) / 80)); // slow push in and back
    pos.set(-14 + Math.sin(t * 0.045) * 9, 31 + Math.sin(t * 0.07) * 1.6, 100 - 48 * k);
    target.set(6, 50, -330);
    // Entrance: the camera settles down from higher and further back.
    pos.y += (1 - enter) * 34;
    pos.z += (1 - enter) * 70;
    target.y -= (1 - enter) * 18;
    // Pointer parallax.
    target.x += pointer.sx * 14;
    target.y -= pointer.sy * 6;
    pos.x += pointer.sx * 3;
    // Scroll: rise and tip down over the city as the hero leaves.
    pos.y += scrollS * 34;
    target.y -= scrollS * 60;
    camera.position.copy(pos);
    camera.lookAt(target);
    sky.position.copy(pos);
  }

  function frame(t: number, dt: number) {
    const a = 1 - Math.exp(-dt * 3.2);
    pointer.sx += (pointer.x - pointer.sx) * a;
    pointer.sy += (pointer.y - pointer.sy) * a;
    scrollS += (scroll - scrollS) * (1 - Math.exp(-dt * 6));
    time.value = t + 30; // offset so the window "life" isn't synchronised at start
    light.value = Math.min(1, Math.max(0, (t - 0.15) / 3.6));
    light.value = 1 - Math.pow(1 - light.value, 2.2);
    traffic.value = Math.min(1, Math.max(0, (t - 1.2) / 2.5));
    coralShare.value = 0.035 + scrollS * 0.2;
    place(t);
    composer.render();
  }

  function resize() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    pxRatio.value = dpr;
    camera.aspect = w / h;
    // Portrait screens: widen the lens so the skyline still fits.
    camera.fov = w / h < 1 ? 58 : 42;
    camera.updateProjectionMatrix();
  }

  // ---- loop ----
  let raf = 0, active = true, started = false;
  let t0 = 0, last = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    frame((now - t0) / 1000, dt);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    if (!started || !active || opts.still) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };

  resize();
  // Draw the dark, unlit city once behind the stinger (also compiles the shaders early).
  frame(opts.still ? 60 : 0, 0.016);

  return {
    start() {
      if (started) return;
      started = true;
      if (opts.still) {
        frame(60, 1);
        return;
      }
      t0 = performance.now();
      run();
    },
    setActive(on) {
      if (on === active) return;
      // Keep the clock continuous across pauses.
      if (!on) last = performance.now();
      else t0 += performance.now() - last;
      active = on;
      run();
    },
    setScroll(p) {
      scroll = Math.min(1, Math.max(0, p));
      if (opts.still) { scrollS = scroll; frame(60, 1); }
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    resize() {
      resize();
      if (opts.still || !started) frame(opts.still ? 60 : 0, 0.016);
    },
    renderAt(t) {
      pointer.sx = pointer.x;
      pointer.sy = pointer.y;
      scrollS = scroll;
      frame(t, 0.016);
    },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const mesh = o as Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as unknown as ShaderMaterial | undefined;
        mat?.dispose?.();
      });
      unit.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
