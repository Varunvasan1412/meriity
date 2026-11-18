// Meriity hero: a real night photo with 3D depth (raw WebGL2, one full-screen pass).
//
// Inputs: the photo, and a depth map (R = depth, 0 far .. 1 near; G = water mask).
// What it does with them:
//   - a camera move, not a layer slide: translation gives parallax (found with a steep-parallax
//     depth search, so near things occlude far ones), rotation pans, rolls and tilts the frame
//   - the shot itself is a slow slider move with a push-in; the pointer turns the camera
//     through a damped spring, with a whisper of handheld float
//   - the city "lights up" after the stinger: lit windows switch on in a random order
//   - the water ripples and its reflections shimmer; city lights twinkle faintly
//   - a cinematic grade: deep shadows, warm highlights, glow on the lights, grain, vignette
//   - scroll pushes further in and lets coral bleed into the warm lights

export type PhotoDepthOptions = {
  src: string;
  depth: string;
  /** Point of the photo kept in frame when the screen crops it (0..1). Default: centre. */
  focal?: [number, number];
  /** Parallax strength as a fraction of the frame. Default 0.018. */
  strength?: number;
  still?: boolean;
  lite?: boolean;
};

export type PhotoDepth = {
  start: () => void;
  setActive: (on: boolean) => void;
  setScroll: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  resize: () => void;
  renderAt: (t: number) => void;
  dispose: () => void;
};

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uPhoto;
uniform sampler2D uDepth;
uniform vec2 uRes;        // canvas pixels
uniform vec2 uImg;        // photo pixels
uniform vec2 uFocal;
uniform vec2 uTrans;      // camera translation: parallax shift per unit of depth (frame fractions)
uniform float uPush;      // dolly: radial parallax per unit of depth
uniform float uFocus;     // depth that stays put (the camera is aimed at it)
uniform vec2 uPan;        // camera rotation: a uniform shift (no parallax)
uniform float uRoll;      // camera roll (radians)
uniform float uKey;       // perspective from tilting (keystone)
uniform float uLight;     // 0..1 light-up
uniform float uTime;
uniform float uScroll;
uniform float uSeed;
uniform float uLite;
in vec2 vUv;
out vec4 outColor;

float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}

// object-fit: cover, around the focal point, with a little overscan for the parallax.
vec2 cover(vec2 uv){
  float sa = uRes.x / uRes.y, ia = uImg.x / uImg.y;
  vec2 scale = sa > ia ? vec2(1.0, ia / sa) : vec2(sa / ia, 1.0);
  float overscan = uLite > 0.5 ? 0.99 : 0.95;
  scale *= overscan;
  vec2 room = 1.0 - scale;
  return uv * scale + room * uFocal;
}

void main(){
  // Camera rotation first: roll and a hint of keystone around the frame centre, then pan.
  vec2 p = vUv - 0.5;
  float aspect = uRes.x / uRes.y;
  p.x *= aspect;
  p = mat2(cos(uRoll), -sin(uRoll), sin(uRoll), cos(uRoll)) * p;
  p.x /= aspect;
  p.x *= 1.0 + uKey * p.y;
  vec2 base = cover(p + 0.5 + uPan);
  vec2 centre = cover(vec2(0.5));

  // Camera translation: find the nearest surface along this pixel's parallax ray.
  vec2 dir = uTrans + (base - centre) * uPush;
  vec2 uv;
  if (uLite > 0.5) {
    // Mobile / tablet portrait mode:
    // Direct sampling eliminates depth-map edge-tearing and serration on narrow crops,
    // delivering 100% tack-sharp 4K architectural lines, windows, and reflections.
    uv = base + dir * (0.5 - uFocus);
  } else {
    const int STEPS = __STEPS__;
    float prevS = 1.0;
    float prevDiff = texture(uDepth, base + dir * (1.0 - uFocus)).r - 1.0;
    float hitS = 0.0;
    bool found = false;
    for (int i = 1; i <= STEPS; i++) {
      float s = 1.0 - float(i) / float(STEPS);
      float d = texture(uDepth, base + dir * (s - uFocus)).r;
      float diff = d - s;
      if (!found && diff >= 0.0) {
        float k = prevDiff / (prevDiff - diff);           // linear refine between the two steps
        hitS = mix(prevS, s, clamp(k, 0.0, 1.0));
        found = true;
      }
      prevS = s; prevDiff = diff;
    }
    uv = base + dir * (hitS - uFocus);
  }
  vec4 dm = texture(uDepth, uv);
  float depth = dm.r, water = dm.g;

  // Water: ripples drift across the reflections.
  float t = uTime;
  vec2 wq = vec2(uv.x * 60.0 + t * 0.35, uv.y * 260.0 - t * 0.6);
  float rip = vnoise(wq) * 0.6 + vnoise(wq * 2.3 + 3.1) * 0.4 - 0.5;
  uv.x += rip * 0.0035 * water;
  uv.y += rip * 0.0012 * water;

  // Compute smooth screen-space derivatives from the undistorted camera base UV.
  // This prevents the parallax depth jumps from spiking mipmap calculations (which causes blur)
  // while still providing hardware anti-aliasing and mipmapping (which eliminates jagged aliasing).
  vec2 ddx = dFdx(base);
  vec2 ddy = dFdy(base);
  vec3 col = textureGrad(uPhoto, uv, ddx, ddy).rgb;

  // Linear working space.
  col = pow(col, vec3(2.2));
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));

  // Lights: preserve the native 4K sharpness of the architectural windows and streetlights
  // instead of pixelating them into 3x3 blocks.
  float isLight = smoothstep(0.08, 0.35, lum);
  float shimmer = mix(1.0, 0.88 + 0.24 * vnoise(vec2(uv.x * 250.0, t * 1.8 + uv.y * 35.0)), water);
  vec3 lights = col * isLight * uLight * shimmer;
  vec3 rest = col * (1.0 - isLight) * mix(0.35, 1.0, smoothstep(0.0, 0.7, uLight));
  col = rest + lights;

  // Grade: a touch deeper blacks, the photo's own contrast kept; coral creeps into the warm
  // lights as you scroll.
  col = max(col - 0.0015, 0.0) * 1.03;
  vec3 warmCol = vec3(1.0, 0.24, 0.27);
  float warmth = smoothstep(0.1, 0.5, col.r - col.b);
  col = mix(col, col * warmCol * 1.6, warmth * isLight * uScroll * 0.8);

  // Back to display space. (Vignette and grain come from the hero's own overlays.)
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  outColor = vec4(col, 1.0);
}
`;

const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("image failed: " + src));
    img.src = src;
  });
}

export async function createPhotoDepth(canvas: HTMLCanvasElement, opts: PhotoDepthOptions): Promise<PhotoDepth> {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" });
  if (!gl) throw new Error("no webgl2");
  const [photo, depthImg] = await Promise.all([loadImage(opts.src), loadImage(opts.depth)]);

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG.replace("__STEPS__", opts.lite ? "32" : "48")));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // images are top-down; GL textures bottom-up
  const tex = (img: HTMLImageElement, unit: number, mips: boolean) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (mips) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      const ext = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
      if (ext) {
        const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, max));
      }
    } else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return t;
  };
  const tPhoto = tex(photo, 0, true);
  const tDepth = tex(depthImg, 1, false);

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = {
    photo: U("uPhoto"), depth: U("uDepth"), res: U("uRes"), img: U("uImg"), focal: U("uFocal"),
    trans: U("uTrans"), push: U("uPush"), focus: U("uFocus"), pan: U("uPan"), roll: U("uRoll"), key: U("uKey"),
    light: U("uLight"), time: U("uTime"),
    scroll: U("uScroll"), seed: U("uSeed"), lite: U("uLite"),
  };
  gl.uniform1i(u.photo, 0);
  gl.uniform1i(u.depth, 1);
  gl.uniform2f(u.img, photo.naturalWidth, photo.naturalHeight);
  const focal = opts.focal ?? [0.5, 0.5];
  gl.uniform2f(u.focal, focal[0], 1 - focal[1]); // callers give y from the top
  gl.uniform1f(u.focus, 0.4);
  gl.uniform1f(u.seed, 17.0);
  gl.uniform1f(u.lite, opts.lite ? 1.0 : 0.0);

  const isNarrow = typeof window !== "undefined" && window.innerWidth < 768;
  const strength = (opts.strength ?? 0.016) * (isNarrow ? 0.45 : 1.0);
  // Pointer with inertia: a critically damped spring, like a camera head with some weight.
  const spring = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  let scroll = 0, scrollS = 0;
  const sstep = (e: number, a: number, x: number) => Math.min(1, Math.max(0, (x - e) / (a - e)));
  const smooth = (x: number) => x * x * (3 - 2 * x);
  // Slow, smooth "handheld" noise: a few low frequencies, very small.
  const hand = (t: number, s: number) =>
    (Math.sin(t * 0.31 + s) * 0.5 + Math.sin(t * 0.53 + s * 2.1) * 0.3 + Math.sin(t * 0.97 + s * 3.7) * 0.2) * 0.0007;

  function draw(t: number, dt: number) {
    // Spring towards the pointer (omega ~ 2.2 rad/s: settles in about a second, no overshoot).
    const w = 2.2;
    for (const [k, vk, tk] of [["x", "vx", "tx"], ["y", "vy", "ty"]] as const) {
      const acc = w * w * (spring[tk] - spring[k]) - 2 * w * spring[vk];
      spring[vk] += acc * dt;
      spring[k] += spring[vk] * dt;
    }
    scrollS += (scroll - scrollS) * (1 - Math.exp(-dt * 6));

    // The move: a slider shot. A slow truck from one side to the other and back (eased at
    // both ends, 40 s each way) with a gentle push-in, like a camera on rails.
    const leg = (t % 80) / 40;
    const truck = leg < 1 ? smooth(leg) : 1 - smooth(leg - 1);
    const enter = smooth(sstep(0, 5.5, t));
    const tx = (truck - 0.5) * 2 * strength;                       // left .. right
    const ty = -0.15 * strength + (1 - enter) * 0.5 * strength;    // settles down onto the shot
    const push = 0.02 + 0.05 * smooth(sstep(0, 60, t % 120 < 60 ? t % 120 : 120 - (t % 120))) + scrollS * 0.2 - (1 - enter) * 0.05;

    // Pointer turns the camera (pan + a little roll and keystone), with a touch of parallax.
    const px = spring.x, py = spring.y;
    gl!.uniform2f(u.trans, tx + px * strength * 0.35 + hand(t, 1), ty - py * strength * 0.25 + hand(t, 7));
    gl!.uniform1f(u.push, push);
    gl!.uniform2f(u.pan, px * 0.008 + hand(t, 3) * 1.5, -py * 0.006 + hand(t, 5) * 1.5);
    gl!.uniform1f(u.roll, -px * 0.0045 + (truck - 0.5) * 0.004);
    gl!.uniform1f(u.key, py * 0.025);

    const light = Math.min(1, Math.max(0, (t - 0.1) / 3.2));
    gl!.uniform1f(u.light, 1 - Math.pow(1 - light, 2));
    gl!.uniform1f(u.time, t + 10);
    gl!.uniform1f(u.scroll, scrollS);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function resize() {
    // Render at the screen's real density (up to 2.5x): phones, tablets and retina laptops
    // have dense screens; this ensures razor-sharp sampling.
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const cw = canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth;
    const ch = canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight;
    const w = Math.max(1, Math.round(cw * dpr));
    const h = Math.max(1, Math.round(ch * dpr));
    canvas.width = w;
    canvas.height = h;
    gl!.viewport(0, 0, w, h);
    gl!.uniform2f(u.res, w, h);
  }

  let raf = 0, active = true, started = false, t0 = 0, last = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    draw((now - t0) / 1000, dt);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    if (!started || !active || opts.still) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };

  resize();
  draw(opts.still ? 30 : 0, 0.016);

  return {
    start() {
      if (started) return;
      started = true;
      if (opts.still) { draw(30, 1); return; }
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
      if (opts.still) { scrollS = scroll; draw(30, 1); }
    },
    setPointer(x, y) { spring.tx = x; spring.ty = y; },
    resize() {
      resize();
      if (opts.still || !started) draw(opts.still ? 30 : 0, 0.016);
    },
    renderAt(t) {
      spring.x = spring.tx; spring.y = spring.ty; spring.vx = spring.vy = 0; scrollS = scroll;
      draw(t, 0.016);
    },
    dispose() {
      cancelAnimationFrame(raf);
      gl!.deleteTexture(tPhoto);
      gl!.deleteTexture(tDepth);
      gl!.deleteBuffer(buf);
      gl!.deleteProgram(prog);
    },
  };
}
