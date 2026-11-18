// Meriity hero, take two: the skyline across the river (three.js).
// A low camera glides sideways over the Yarra, looking across a tree-lined promenade and a
// riverside road at a mixed skyline: rectangular, octagonal, round and tapered towers, glass
// curtain walls with light fins, a gold-crowned tower and a coral landmark. The river mirrors
// it all. Everything is procedural: no textures, no downloads.
//
// Framework-free. NightSkyline.tsx owns the React side (stinger, scroll, pointer).

import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  IcosahedronGeometry,
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
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

export type NightSkylineOptions = { lite?: boolean; still?: boolean };
export type NightSkyline = {
  start: () => void;
  setActive: (on: boolean) => void;
  setScroll: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  resize: () => void;
  renderAt: (t: number) => void;
  dispose: () => void;
};

// ---------------------------------------------------------------------------------------------
// Layout (camera over the water near z = 40, looking towards -z)
// ---------------------------------------------------------------------------------------------
const BANK_Z = -42; // far bank edge
const PROM_Z = -48; // promenade (trees, lamps)
const ROAD_Z = -58; // riverside road
const CITY_Z0 = -66, CITY_Z1 = -900;
const X0 = -720, X1 = 720;
const CBD = { x: 40, z: -230 };
const BRIDGE_X = 150;
const WATER_Y = 0;

// Shape families. Each gets its own instanced mesh; the shader is shared.
const S_BOX = 0, S_OCT = 1, S_ROUND = 2, S_TAPER = 3;
// Facade styles.
const F_RES = 0, F_OFFICE = 1, F_GLASS = 2, F_GOLD = 3, F_LANDMARK = 4, F_SPIRE = 5, F_MAST = 6;

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

type Tower = { shape: number; style: number; x: number; z: number; w: number; d: number; h: number; y0: number; rot: number; tint: number };

function buildSkyline() {
  const r = rng(2026);
  const towers: Tower[] = [];
  const pitch = 18;
  for (let x = X0; x < X1; x += pitch) {
    for (let z = CITY_Z0; z > CITY_Z1; z -= pitch) {
      if (r() < 0.12) continue;
      const cx = x + pitch / 2 + (r() - 0.5) * 4;
      const cz = z - pitch / 2 + (r() - 0.5) * 4;
      if (Math.abs(cx - BRIDGE_X) < 12 && cz > -120) continue; // bridge approach
      const cbd = gauss(cx - CBD.x, cz - CBD.z, 150);
      const side = gauss(cx + 230, cz + 300, 110) * 0.55 + gauss(cx - 330, cz + 260, 90) * 0.4;
      const a = r(), b = r();
      let h = 8 + a * 16 + cbd * (30 + b * b * 170) + side * (10 + b * 90) + Math.min(1, (-cz - 300) / 500) * a * a * 40;
      // The front row stays lower so the promenade and road read, with a few exceptions.
      if (cz > -90 && r() < 0.75) h = Math.min(h, 10 + a * 18);
      const big = h > 60;
      const roll = r();
      let shape = S_BOX;
      if (big) shape = roll < 0.42 ? S_BOX : roll < 0.62 ? S_OCT : roll < 0.8 ? S_ROUND : S_TAPER;
      else shape = roll < 0.85 ? S_BOX : S_OCT;
      const sroll = r();
      const style = big ? (sroll < 0.45 ? F_OFFICE : sroll < 0.85 ? F_GLASS : F_RES) : sroll < 0.65 ? F_RES : F_OFFICE;
      const fp = big ? 7 + r() * 7 : 6 + r() * 8;
      const w = shape === S_BOX ? fp * (0.75 + r() * 0.5) : fp;
      const d = shape === S_BOX ? fp * (0.75 + r() * 0.5) : fp;
      towers.push({ shape, style, x: cx, z: cz, w, d, h, y0: 0, rot: shape === S_BOX ? 0 : r() * Math.PI, tint: r() });
    }
  }

  // Stepped tops on some boxes.
  const r3 = rng(9);
  const extra: Tower[] = [];
  for (const t of towers) {
    if (t.shape === S_BOX && t.h > 50 && r3() < 0.45) {
      const top = t.h;
      t.h = top * (0.6 + r3() * 0.2);
      extra.push({ ...t, w: t.w * 0.7, d: t.d * 0.7, h: top - t.h, y0: t.h });
    }
  }
  towers.push(...extra);

  // Landmarks.
  const nearest = (x: number, z: number) => {
    let best = 0, bd = Infinity;
    towers.forEach((t, i) => {
      if (t.y0 > 0) return;
      const dd = Math.hypot(t.x - x, t.z - z);
      if (dd < bd) { bd = dd; best = i; }
    });
    return towers[best];
  };
  const coral = nearest(CBD.x + 20, CBD.z + 20);
  Object.assign(coral, { shape: S_OCT, style: F_LANDMARK, w: 11, d: 11, h: 205, rot: 0.2 });
  const gold = nearest(CBD.x - 95, CBD.z + 60);
  Object.assign(gold, { shape: S_BOX, style: F_GOLD, w: 10, d: 10, h: 172 });
  const round = nearest(CBD.x + 130, CBD.z + 10);
  Object.assign(round, { shape: S_ROUND, style: F_GLASS, w: 13, d: 13, h: 150 });
  // Clear stepped tops sitting on the landmarks.
  for (let i = towers.length - 1; i >= 0; i--) {
    const t = towers[i];
    if (t.y0 > 0 && [coral, gold, round].some((l) => l.x === t.x && l.z === t.z)) towers.splice(i, 1);
  }

  const beacons: [number, number, number][] = [];
  const tops = towers.filter((t) => t.y0 + t.h > 110 && t.style !== F_LANDMARK).sort((a, b) => b.y0 + b.h - (a.y0 + a.h));
  tops.slice(0, 14).forEach((t, i) => {
    const top = t.y0 + t.h;
    if (i % 2 === 0) {
      const len = 8 + r3() * 10;
      towers.push({ shape: S_BOX, style: F_MAST, x: t.x, z: t.z, w: 0.4, d: 0.4, h: len, y0: top, rot: 0, tint: 0 });
      beacons.push([t.x, top + len + 0.4, t.z]);
    } else beacons.push([t.x, top + 0.8, t.z]);
  });
  towers.push({ shape: S_TAPER, style: F_SPIRE, x: coral.x, z: coral.z, w: 2.4, d: 2.4, h: 26, y0: coral.h, rot: 0, tint: 0 });
  beacons.push([coral.x, coral.h + 26.5, coral.z]);
  return { towers, beacons };
}

// ---------------------------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------------------------
const COMMON = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  vec3 applyFog(vec3 col, float depth, float y){
    float f = 1.0 - exp(-pow(depth*uFogDensity, 2.0));
    f *= 1.0 - 0.5*smoothstep(10.0, 200.0, y);
    return mix(col, uFogColor, f);
  }
`;

const towerVert = /* glsl */ `
  attribute vec4 aInfo;     // top (world y), height of this piece, style, seed
  attribute float aTint;
  varying vec3 vWorld; varying vec3 vN; varying vec3 vLocal; varying vec4 vInfo; varying float vTint; varying float vDepth;
  varying vec3 vScale;
  void main(){
    vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    vLocal = position * vScale;
    vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vN = normalize(mat3(instanceMatrix) * normal);
    vInfo = aInfo; vTint = aTint;
    vec4 mv = viewMatrix * w;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const towerFrag = /* glsl */ `
  uniform float uTime;
  uniform float uLight;
  uniform float uCoral;
  uniform vec3 uGlow;
  uniform float uSmooth;    // 1 = round towers: windows wrap by angle
  ${COMMON}
  varying vec3 vWorld; varying vec3 vN; varying vec3 vLocal; varying vec4 vInfo; varying float vTint; varying float vDepth;
  varying vec3 vScale;

  void main(){
    vec3 n = normalize(vN);
    float top = vInfo.x, H = vInfo.y, style = vInfo.z, seed = vInfo.w;
    float y = vWorld.y;
    float rel = clamp((y - (top - H)) / max(H, 1.0), 0.0, 1.0);   // 0 at the base of this piece, 1 at its top
    vec3 coral = vec3(1.0, 0.24, 0.27);
    vec3 gold = vec3(1.0, 0.62, 0.22);
    vec3 V = normalize(cameraPosition - vWorld);
    vec3 col;

    if (style > 5.5) {                       // mast
      col = vec3(0.004, 0.0045, 0.006);
    } else if (style > 4.5) {                // landmark spire
      col = coral * mix(2.2, 0.2, rel) * uLight;
    } else {
      float isLandmark = step(3.5, style) * step(style, 4.5);
      float isGold = step(2.5, style) * step(style, 3.5);
      float isGlass = step(1.5, style) * step(style, 2.5);
      float isOffice = step(0.5, style) * step(style, 1.5) + isLandmark + isGold;
      float isCoral = max(step(vTint, uCoral), isLandmark);

      col = vec3(0.0016, 0.0022, 0.0042) + vec3(0.0035, 0.004, 0.0075) * rel;
      col += vec3(1.0, 0.55, 0.25) * 0.03 * exp(-y * 0.35);                 // street light at the foot

      if (n.y > 0.6) {
        col = vec3(0.0012, 0.0016, 0.003);
      } else {
        // Horizontal facade coordinate: by angle on round towers, along the face on flat ones.
        float u;
        if (uSmooth > 0.5) {
          u = atan(vLocal.z, vLocal.x) * vScale.x * 0.5;
        } else {
          vec2 nh = normalize(n.xz + 1e-5);
          u = dot(vWorld.xz, vec2(-nh.y, nh.x));
        }
        vec2 cs = mix(vec2(1.6, 1.35), vec2(1.2, 1.12), isOffice);
        cs = mix(cs, vec2(2.4, 1.1), isGlass);
        cs *= 1.0 + 0.2 * fract(seed * 3.7);
        vec2 g = vec2(u, y) / cs;
        vec2 cell = floor(g);
        vec2 f = fract(g);
        float faceId = floor((atan(n.z, n.x) + 3.1416) * 1.27);
        float wx = mix(0.17, 0.06, isOffice); wx = mix(wx, 0.03, isGlass);
        float wy0 = mix(0.26, 0.16, isOffice), wy1 = mix(0.76, 0.86, isOffice);
        wy0 = mix(wy0, 0.08, isGlass); wy1 = mix(wy1, 0.94, isGlass);
        float win = smoothstep(wx, wx + 0.06, f.x) * smoothstep(1.0 - wx, 1.0 - wx - 0.06, f.x)
                  * smoothstep(wy0, wy0 + 0.06, f.y) * smoothstep(wy1, wy1 - 0.06, f.y);

        float h = hash21(cell + seed * 91.7 + faceId * 13.1);
        float h2 = hash21(cell * 1.7 + seed * 17.3 + faceId);
        float density = 0.05 + 0.26 * pow(fract(seed * 7.13), 1.6);
        density = mix(density, 0.5, isLandmark);
        float onRes = step(h, density);
        float floorRoll = hash21(vec2(cell.y, seed * 31.0 + faceId * 0.37));
        float onOff = step(floorRoll, density * 1.3) * step(0.1, h);
        float onGlass = step(floorRoll, density * 0.7) * step(0.35, h);     // glass: sparse lit floors
        float on = mix(mix(onRes, onOff, isOffice), onGlass, isGlass) * step(h2, uLight);
        on *= step(0.035, hash21(cell + floor(uTime * 0.08 + h * 17.0) * 1.37));

        vec3 warm = mix(vec3(1.0, 0.70, 0.40), vec3(0.80, 0.88, 1.0), step(0.72, hash21(cell + 3.3)));
        vec3 cool = mix(vec3(0.78, 0.86, 1.0), vec3(1.0, 0.86, 0.66), step(0.8, fract(floorRoll * 7.0)));
        vec3 wc = mix(warm, cool, max(isOffice, isGlass));
        wc = mix(wc, coral, isCoral * step(0.25, hash21(cell + 9.1)));
        wc = mix(wc, gold, isGold * 0.6);
        float bright = mix(0.35 + 0.9 * pow(hash21(cell + 7.7), 2.0), 0.55 + 0.25 * hash21(cell + 7.7), isOffice);
        vec3 lit = wc * bright * 0.62;
        vec3 dark = mix(vec3(0.0035, 0.0048, 0.0085), vec3(0.002, 0.003, 0.006), isGlass);

        vec3 detail = col + win * mix(dark, lit, on);
        // Glass: mullions, and vertical light fins on some towers.
        float mull = 1.0 - smoothstep(0.0, 0.06, min(f.x, 1.0 - f.x));
        detail += vec3(0.007, 0.007, 0.011) * mull * max(isGlass, isOffice);
        float px = max(fwidth(g.x), fwidth(g.y));
        vec3 avg = col + mix(0.3, 0.4, isOffice) * mix(dark, wc * 0.45, density * uLight);
        col = mix(detail, avg, smoothstep(0.2, 0.6, px));

        float finned = isGlass * step(0.55, fract(seed * 5.9));
        float fin = smoothstep(0.462, 0.49, abs(fract(u / 3.6) - 0.5)) * finned;
        vec3 finCol = mix(vec3(0.55, 0.75, 1.0), coral, step(0.8, fract(seed * 2.3)));
        col += finCol * fin * 0.55 * uLight * smoothstep(0.0, 0.25, rel);

        // Glass sheen from the city glow.
        float fres = pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 4.0);
        col += uGlow * fres * mix(0.08, 0.35, isGlass);

        // Crowns.
        float crownBand = smoothstep(0.93, 0.935, rel) * (1.0 - smoothstep(0.955, 0.96, rel));
        float crowned = step(80.0, top) * step(0.6, fract(seed * 5.3)) * (1.0 - isGold);
        col += crownBand * crowned * vec3(0.85, 0.9, 1.0) * 0.35 * uLight;
        // Gold tower: its top sixth glows gold.
        col += isGold * gold * 0.55 * smoothstep(0.82, 0.86, rel) * (0.6 + 0.4 * win) * uLight;
        // Coral landmark: lit edges up its faces and a glowing crown.
        float edge = smoothstep(0.455, 0.49, abs(fract(u / 2.1) - 0.5));
        col += isLandmark * coral * (edge * 1.3 * smoothstep(0.0, 0.3, rel) + 1.6 * smoothstep(0.94, 0.97, rel)) * uLight;
      }
    }
    col = applyFog(col, vDepth, y);
    col += (hash21(gl_FragCoord.xy) - 0.5) / 400.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const flatVert = /* glsl */ `
  varying vec3 vWorld; varying float vDepth; varying vec3 vN;
  void main(){
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
    vec4 mv = viewMatrix * w; vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const groundFrag = /* glsl */ `
  uniform float uLight;
  ${COMMON}
  varying vec3 vWorld; varying float vDepth; varying vec3 vN;
  void main(){
    vec3 col = vec3(0.003, 0.004, 0.007);
    vec3 sodium = vec3(1.0, 0.52, 0.22);
    // The riverside road and the promenade glow.
    float road = exp(-pow(vWorld.z - ${ROAD_Z.toFixed(1)}, 2.0) * 0.08);
    float prom = exp(-pow(vWorld.z - ${PROM_Z.toFixed(1)}, 2.0) * 0.15);
    // City streets running away from the river.
    float sx = abs(mod(vWorld.x + 9.0, 18.0) - 9.0);
    float street = exp(-sx * sx * 0.25) * step(vWorld.z, ${ROAD_Z.toFixed(1)});
    float px = fwidth(vWorld.x) / 18.0;
    street = mix(street, 0.08, smoothstep(0.1, 0.4, px));
    col += sodium * (road * 0.22 + prom * 0.12 + street * 0.14) * (0.25 + 0.75 * uLight);
    col = applyFog(col, vDepth, 0.0);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const treeFrag = /* glsl */ `
  uniform float uLight;
  ${COMMON}
  varying vec3 vWorld; varying float vDepth; varying vec3 vN;
  void main(){
    // Dark canopies, uplit amber by the promenade lamps.
    vec3 col = vec3(0.0025, 0.003, 0.0025);
    col += vec3(1.0, 0.55, 0.22) * 0.06 * max(-vN.y, 0.0) * uLight;
    col += vec3(1.0, 0.55, 0.22) * 0.02 * exp(-(vWorld.y - 1.0) * 0.4) * uLight;
    col = applyFog(col, vDepth, vWorld.y);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const treeVert = /* glsl */ `
  varying vec3 vWorld; varying float vDepth; varying vec3 vN;
  void main(){
    vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = w.xyz; vN = normalize(mat3(instanceMatrix) * normal);
    vec4 mv = viewMatrix * w; vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const darkFrag = /* glsl */ `
  ${COMMON}
  varying vec3 vWorld; varying float vDepth; varying vec3 vN;
  void main(){ gl_FragColor = vec4(applyFog(vec3(0.004, 0.0045, 0.006), vDepth, vWorld.y), 1.0); }
`;

const waterVert = /* glsl */ `
  uniform mat4 textureMatrix;
  varying vec4 vUv; varying vec3 vWorld; varying float vDepth;
  void main(){
    vUv = textureMatrix * vec4(position, 1.0);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vec4 mv = viewMatrix * w; vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const waterFrag = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform vec3 color;
  uniform float uTime;
  ${COMMON}
  varying vec4 vUv; varying vec3 vWorld; varying float vDepth;
  void main(){
    vec2 w = vWorld.xz;
    float t = uTime;
    // Ripples: stronger close to the camera, calmer far away.
    vec2 q0 = vec2(w.x * 0.12 + t * 0.25, w.y * 0.55 - t * 0.15);
    float n = vnoise(q0) * 0.6 + vnoise(q0 * 2.7 + 4.1 + vec2(-t * 0.4, t * 0.25)) * 0.4 - 0.5;
    float near = clamp(1.0 - vDepth / 300.0, 0.25, 1.0);
    vec4 uv = vUv;
    uv.x += n * 0.005 * near * uv.w;
    vec3 refl = vec3(0.0);
    for (int i = 0; i < 6; i++) {
      vec4 q = uv;
      q.y += (float(i) * 0.005 + n * 0.006 * near) * uv.w;
      refl += texture2DProj(tDiffuse, q).rgb;
    }
    refl /= 6.0;
    vec3 V = normalize(cameraPosition - vWorld);
    float fres = 0.3 + 0.7 * pow(1.0 - max(V.y, 0.0), 4.0);
    vec3 col = vec3(0.0012, 0.0018, 0.0035) + refl * 1.05 * fres;
    col = applyFog(col, vDepth, 0.0);
    col += (hash21(gl_FragCoord.xy) - 0.5) / 400.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const carVert = /* glsl */ `
  attribute vec4 aCar;     // lane coordinate, axis (0 along z, 1 along x), direction, phase
  attribute vec2 aSY;      // speed, height
  uniform float uTime;
  uniform vec2 uSpanX; uniform vec2 uSpanZ; uniform vec2 uBridgeSpan;
  varying float vDir; varying float vAlong; varying float vAcross; varying float vDepth;
  void main(){
    float axis = aCar.y, dir = aCar.z;
    float bridge = step(1.0, aSY.y);
    vec2 span = axis < 0.5 ? mix(uSpanZ, uBridgeSpan, bridge) : uSpanX;
    float L = span.y - span.x;
    float s = span.x + mod(aCar.w * L + uTime * aSY.x * dir, L);
    vec3 p = position;
    float len = 5.0;
    // Bridge traffic ramps down onto the far bank.
    float hgt = mix(0.6, aSY.y * smoothstep(span.x, span.x + 50.0, s) + 0.6 * (1.0 - smoothstep(span.x, span.x + 50.0, s)), bridge);
    vec3 w = axis < 0.5
      ? vec3(aCar.x + p.x * 0.42, hgt + 0.55 + p.y * 0.26, s + p.z * len)
      : vec3(s + p.x * len, hgt + 0.55 + p.y * 0.26, aCar.x + p.z * 0.42);
    vAlong = (axis < 0.5 ? p.z : p.x) * dir;
    vAcross = axis < 0.5 ? p.x : p.z;
    vDir = dir;
    vec4 mv = viewMatrix * vec4(w, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const carFrag = /* glsl */ `
  uniform float uTraffic;
  ${COMMON}
  varying float vDir; varying float vAlong; varying float vAcross; varying float vDepth;
  void main(){
    vec3 head = vec3(2.6, 2.2, 1.7);
    vec3 tail = vec3(3.4, 0.14, 0.10);
    vec3 c = vDir > 0.0 ? head : tail;
    float streak = pow(smoothstep(-0.5, 0.5, vAlong), 1.8) + 0.8 * smoothstep(0.38, 0.5, vAlong);
    float soft = 1.0 - smoothstep(0.25, 0.5, abs(vAcross));
    vec3 col = c * streak * mix(0.55, 1.0, soft) * uTraffic;
    float f = 1.0 - exp(-pow(vDepth * uFogDensity * 1.15, 2.0));
    gl_FragColor = vec4(col * (1.0 - f), 1.0);
  }
`;

const lampVert = /* glsl */ `
  attribute float aSeed; attribute float aKind;
  uniform float uTime; uniform float uPx;
  varying float vBlink; varying float vKind; varying float vDepth;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    float f = fract(uTime * 0.45 + aSeed);
    vBlink = mix(1.0, 0.15 + smoothstep(0.0, 0.06, f) * (1.0 - smoothstep(0.12, 0.42, f)), aKind);
    vKind = aKind;
    gl_PointSize = uPx * mix(700.0, 900.0, aKind) / vDepth;
    gl_Position = projectionMatrix * mv;
  }
`;

const lampFrag = /* glsl */ `
  uniform float uLight;
  ${COMMON}
  varying float vBlink; varying float vKind; varying float vDepth;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float a = exp(-dot(c, c) * 30.0);
    float f = 1.0 - exp(-pow(vDepth * uFogDensity * 0.9, 2.0));
    vec3 col = mix(vec3(2.4, 1.3, 0.55), vec3(3.2, 0.25, 0.18), vKind);
    gl_FragColor = vec4(col * a * vBlink * uLight * (1.0 - f), 1.0);
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
  uniform float uTime;
  varying vec3 vDir;
  float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
  void main(){
    float e = vDir.y;
    vec3 col = mix(uHorizon, uZenith, smoothstep(-0.02, 0.4, abs(e)));
    float behindCbd = exp(-pow((vDir.x - 0.1) * 1.8, 2.0));
    col += uGlow * exp(-abs(e) * 9.0);
    col += uGlow * 0.6 * behindCbd * exp(-abs(e) * 14.0);
    if (e > 0.0) {
      vec2 uv = vDir.xz / (e + 0.06) * 1.8 + vec2(uTime * 0.02, uTime * 0.006);
      float c = smoothstep(0.46, 0.8, fbm(uv));
      float under = exp(-e * 5.5) * (0.55 + 0.45 * behindCbd);
      vec3 cloud = uGlow * 2.6 * under + uZenith * 0.4;
      col = mix(col * (1.0 - 0.35 * under), cloud, c * smoothstep(0.0, 0.04, e) * 0.9);
      vec2 sp = floor(vDir.xz / (e + 0.2) * 260.0);
      col += vec3(0.05, 0.05, 0.06) * step(0.9975, hash21(sp)) * smoothstep(0.25, 0.6, e) * (1.0 - c);
    }
    col += (hash21(gl_FragCoord.xy) - 0.5) / 300.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---------------------------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------------------------
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeInOut = (x: number) => x * x * (3 - 2 * x);

function shapeGeometry(shape: number): BufferGeometry {
  // Unit footprint (-0.5..0.5), base at y = 0, height 1.
  let g: BufferGeometry;
  if (shape === S_OCT) g = new CylinderGeometry(0.5, 0.5, 1, 8, 1).toNonIndexed();
  else if (shape === S_ROUND) g = new CylinderGeometry(0.5, 0.5, 1, 28, 1);
  else if (shape === S_TAPER) g = new CylinderGeometry(0.3, 0.62, 1, 4, 1).rotateY(Math.PI / 4).toNonIndexed();
  else g = new BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0);
  if (shape === S_OCT || shape === S_TAPER) g.computeVertexNormals(); // flat facets
  return g;
}

export function createNightSkyline(canvas: HTMLCanvasElement, opts: NightSkylineOptions = {}): NightSkyline {
  const lite = !!opts.lite;
  const renderer = new WebGLRenderer({ canvas, antialias: !lite, powerPreference: "high-performance", alpha: false });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x050507, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.5, 2600);

  const fog = { uFogColor: { value: new Color(0.03, 0.022, 0.03) }, uFogDensity: { value: 0.0017 } };
  const time = { value: 0 };
  const light = { value: 0 };
  const coralShare = { value: 0.03 };
  const glow = { value: new Color(0.075, 0.03, 0.024) };

  const sky = new Mesh(
    new SphereGeometry(2000, 48, 24),
    new ShaderMaterial({
      vertexShader: skyVert,
      fragmentShader: skyFrag,
      side: BackSide,
      depthWrite: false,
      uniforms: {
        uHorizon: { value: new Color(0.024, 0.017, 0.024) },
        uZenith: { value: new Color(0.0015, 0.002, 0.0045) },
        uGlow: glow,
        uTime: time,
      },
    }),
  );
  sky.renderOrder = -1;
  scene.add(sky);

  // Land on the far side of the river (the near side is out of shot).
  const land = new Mesh(
    new PlaneGeometry(4000, 2000).rotateX(-Math.PI / 2).translate(0, 0.6, BANK_Z - 1000),
    new ShaderMaterial({ vertexShader: flatVert, fragmentShader: groundFrag, uniforms: { ...fog, uLight: light } }),
  );
  scene.add(land);
  // The embankment wall facing the camera.
  const wall = new Mesh(
    new BoxGeometry(4000, 2.4, 1).translate(0, -0.6, BANK_Z),
    new ShaderMaterial({ vertexShader: flatVert, fragmentShader: darkFrag, uniforms: { ...fog } }),
  );
  scene.add(wall);

  // Towers, one instanced mesh per shape.
  const { towers, beacons } = buildSkyline();
  const meshes: InstancedMesh[] = [];
  const m = new Matrix4();
  const rotM = new Matrix4();
  [S_BOX, S_OCT, S_ROUND, S_TAPER].forEach((shape) => {
    const list = towers.filter((t) => t.shape === shape);
    if (!list.length) return;
    const geo = shapeGeometry(shape);
    const info = new Float32Array(list.length * 4);
    const tint = new Float32Array(list.length);
    list.forEach((t, i) => {
      info.set([t.y0 + t.h, t.h, t.style, ((i * 0.61803 + shape * 0.13) % 1)], i * 4);
      tint[i] = t.tint;
    });
    geo.setAttribute("aInfo", new InstancedBufferAttribute(info, 4));
    geo.setAttribute("aTint", new InstancedBufferAttribute(tint, 1));
    const mat = new ShaderMaterial({
      vertexShader: towerVert,
      fragmentShader: towerFrag,
      uniforms: { ...fog, uTime: time, uLight: light, uCoral: coralShare, uGlow: glow, uSmooth: { value: shape === S_ROUND ? 1 : 0 } },
    });
    const mesh = new InstancedMesh(geo, mat, list.length);
    list.forEach((t, i) => {
      m.makeScale(t.w, t.h, t.d);
      rotM.makeRotationY(t.rot);
      m.premultiply(rotM).setPosition(t.x, t.y0 + 0.6, t.z);
      mesh.setMatrixAt(i, m);
    });
    mesh.frustumCulled = false;
    scene.add(mesh);
    meshes.push(mesh);
  });

  // Promenade trees: dark canopies on the far bank.
  const rt = rng(31);
  const treeList: [number, number, number][] = [];
  for (let x = X0; x < X1; x += 4 + rt() * 9) {
    if (Math.abs(x - BRIDGE_X) < 14) continue;
    treeList.push([x, PROM_Z + (rt() - 0.5) * 4, 1.8 + rt() * 1.6]);
  }
  const treeGeo = new IcosahedronGeometry(1, 1);
  const trees = new InstancedMesh(
    treeGeo,
    new ShaderMaterial({ vertexShader: treeVert, fragmentShader: treeFrag, uniforms: { ...fog, uLight: light } }),
    treeList.length,
  );
  treeList.forEach(([x, z, s], i) => {
    m.makeScale(s * (1.0 + rt() * 0.5), s * (0.9 + rt() * 0.4), s * 1.1).setPosition(x, 0.6 + s * 1.5, z);
    trees.setMatrixAt(i, m);
  });
  trees.frustumCulled = false;
  scene.add(trees);

  // The bridge: a long deck from the far bank towards the camera side, with a shallow arch.
  const darkMat = new ShaderMaterial({ vertexShader: flatVert, fragmentShader: darkFrag, uniforms: { ...fog } });
  const deck = new Mesh(new BoxGeometry(14, 1.2, 260).translate(BRIDGE_X, 4.2, BANK_Z + 130), darkMat);
  scene.add(deck);
  for (let z = BANK_Z + 30; z < BANK_Z + 260; z += 48) {
    const pier = new Mesh(new BoxGeometry(4, 5, 4).translate(BRIDGE_X, 1.5, z), darkMat);
    scene.add(pier);
  }

  // The river: a planar reflection, rippled and stretched.
  const ratio = () => Math.min(window.devicePixelRatio || 1, 1.5) * (lite ? 0.35 : 0.5);
  const water = new Reflector(new PlaneGeometry(4000, 800), {
    textureWidth: Math.max(2, Math.round(canvas.clientWidth * ratio())),
    textureHeight: Math.max(2, Math.round(canvas.clientHeight * ratio())),
    clipBias: 0.003,
    multisample: lite ? 0 : 4,
    shader: {
      name: "MeriityRiver",
      uniforms: {
        color: { value: null },
        tDiffuse: { value: null },
        textureMatrix: { value: null },
        uTime: { value: 0 },
        uFogColor: { value: null },
        uFogDensity: { value: 0 },
      },
      vertexShader: waterVert,
      fragmentShader: waterFrag,
    },
  });
  Object.assign((water.material as unknown as ShaderMaterial).uniforms, { uTime: time, ...fog });
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, WATER_Y, BANK_Z + 400);
  scene.add(water);

  // Traffic: the riverside road (both ways), the bridge, and streets into the city.
  const carCount = lite ? 500 : 1100;
  const carGeo = new InstancedBufferGeometry();
  const unit = new BoxGeometry(1, 1, 1);
  carGeo.setIndex(unit.getIndex());
  carGeo.setAttribute("position", unit.getAttribute("position"));
  const cars = new Float32Array(carCount * 4);
  const sy = new Float32Array(carCount * 2);
  const rc = rng(5);
  for (let i = 0; i < carCount; i++) {
    const dir = rc() < 0.5 ? 1 : -1;
    const roll = rc();
    if (roll < 0.45) {
      // Riverside road: two lanes each way, running across the view.
      cars.set([ROAD_Z + dir * (1.2 + Math.floor(rc() * 2) * 2.2), 1, dir, rc()], i * 4);
      sy.set([10 + rc() * 10, 0.0], i * 2);
    } else if (roll < 0.62) {
      cars.set([BRIDGE_X + dir * (1.4 + rc() * 3.6), 0, dir, rc()], i * 4);
      sy.set([10 + rc() * 8, 4.8], i * 2);
    } else {
      const street = Math.round((X0 + rc() * (X1 - X0)) / 18) * 18;
      cars.set([street + dir * 1.05, 0, dir, rc()], i * 4);
      sy.set([8 + rc() * 10, 0.0], i * 2);
    }
  }
  carGeo.setAttribute("aCar", new InstancedBufferAttribute(cars, 4));
  carGeo.setAttribute("aSY", new InstancedBufferAttribute(sy, 2));
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
        uSpanZ: { value: new Vector2(-700, BANK_Z + 250) },
        uBridgeSpan: { value: new Vector2(BANK_Z - 60, BANK_Z + 250) },
      },
    }),
  );
  carMesh.frustumCulled = false;
  scene.add(carMesh);

  // Lamps: promenade (steady amber), bridge lamps, and red beacons on the summits.
  const lamps: [number, number, number, number][] = [];
  for (let x = X0; x <= X1; x += 9) lamps.push([x, 3.4, PROM_Z + 3, 0]);
  for (let z = BANK_Z; z < BANK_Z + 260; z += 10) lamps.push([BRIDGE_X - 7, 7.5, z, 0], [BRIDGE_X + 7, 7.5, z, 0]);
  beacons.forEach(([x, y, z]) => lamps.push([x, y + 0.6, z, 1]));
  const lPos = new Float32Array(lamps.length * 3);
  const lSeed = new Float32Array(lamps.length);
  const lKind = new Float32Array(lamps.length);
  lamps.forEach(([x, y, z, k], i) => {
    lPos.set([x, y, z], i * 3);
    lSeed[i] = (i * 0.37) % 1;
    lKind[i] = k;
  });
  const lGeo = new BufferGeometry();
  lGeo.setAttribute("position", new BufferAttribute(lPos, 3));
  lGeo.setAttribute("aSeed", new BufferAttribute(lSeed, 1));
  lGeo.setAttribute("aKind", new BufferAttribute(lKind, 1));
  const pxRatio = { value: 1 };
  const lampPoints = new Points(
    lGeo,
    new ShaderMaterial({
      vertexShader: lampVert,
      fragmentShader: lampFrag,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { ...fog, uTime: time, uLight: light, uPx: pxRatio },
    }),
  );
  lampPoints.frustumCulled = false;
  scene.add(lampPoints);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new Vector2(256, 256), 0.75, 0.5, 0.55));
  composer.addPass(new OutputPass());

  // ---- camera: low over the water, gliding sideways along the river ----
  const pos = new Vector3();
  const target = new Vector3();
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let scroll = 0, scrollS = 0;

  function place(t: number) {
    const enter = easeOutExpo(Math.min(1, Math.max(0, t) / 4.5));
    const k = easeInOut(0.5 - 0.5 * Math.cos((Math.max(t, 0) * Math.PI * 2) / 110)); // slow truck and back
    const x = -30 + 90 * k;
    pos.set(x, 10 + Math.sin(t * 0.08) * 0.5, 330);
    pos.y += Math.sin(t * 0.9) * 0.05;
    target.set(x * 0.6 + 34, 44, -260);
    // Entrance: rise from just above the water.
    pos.y -= (1 - enter) * 5;
    pos.z += (1 - enter) * 40;
    target.y -= (1 - enter) * 22;
    // Pointer parallax.
    target.x += pointer.sx * 16;
    target.y -= pointer.sy * 6;
    pos.x += pointer.sx * 3;
    // Scroll: lift up and look down onto the city.
    pos.y += scrollS * 40;
    target.y -= scrollS * 50;
    camera.position.copy(pos);
    camera.lookAt(target);
    sky.position.copy(pos);
  }

  function frame(t: number, dt: number) {
    const a = 1 - Math.exp(-dt * 3.2);
    pointer.sx += (pointer.x - pointer.sx) * a;
    pointer.sy += (pointer.y - pointer.sy) * a;
    scrollS += (scroll - scrollS) * (1 - Math.exp(-dt * 6));
    time.value = t + 30;
    light.value = Math.min(1, Math.max(0, (t - 0.15) / 3.6));
    light.value = 1 - Math.pow(1 - light.value, 2.2);
    traffic.value = Math.min(1, Math.max(0, (t - 1.2) / 2.5));
    coralShare.value = 0.03 + scrollS * 0.2;
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
    water.getRenderTarget().setSize(Math.max(2, Math.round(w * ratio())), Math.max(2, Math.round(h * ratio())));
    pxRatio.value = dpr;
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 60 : 40;
    camera.updateProjectionMatrix();
  }

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
  frame(opts.still ? 60 : 0, 0.016);

  return {
    start() {
      if (started) return;
      started = true;
      if (opts.still) { frame(60, 1); return; }
      t0 = performance.now();
      run();
    },
    setActive(on) {
      if (on === active) return;
      if (!on) last = performance.now();
      else t0 += performance.now() - last;
      active = on;
      run();
    },
    setScroll(p) {
      scroll = Math.min(1, Math.max(0, p));
      if (opts.still) { scrollS = scroll; frame(60, 1); }
    },
    setPointer(x, y) { pointer.x = x; pointer.y = y; },
    resize() {
      resize();
      if (opts.still || !started) frame(opts.still ? 60 : 0, 0.016);
    },
    renderAt(t) {
      pointer.sx = pointer.x; pointer.sy = pointer.y; scrollS = scroll;
      frame(t, 0.016);
    },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const mesh = o as Mesh;
        mesh.geometry?.dispose();
        (mesh.material as unknown as ShaderMaterial | undefined)?.dispose?.();
      });
      water.dispose();
      unit.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
