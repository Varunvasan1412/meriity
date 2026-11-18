"use client";
import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { onStingerLift } from "@/lib/stinger";
import { setHandoff, setHeading } from "@/lib/handoff";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * "Trust Alignment": hundreds of glossy black blocks drift out of line (a brand
 * whose touchpoints don't match). Scrolling locks them, one by one, into
 * Meriity's three-chevron mark; only once every block has locked in does the whole mark warm to coral.
 * `progress` (0..1) is driven by the hero's sticky hold. Past the hold it flips 180deg into the
 * white card, rides with it, then shrinks into the pointer and hands off to MarkCursor.
 * The canvas is fixed to the viewport and transparent; the hero's own background sits below it.
 */
export default function TrustAlignment({
  progress,
  className = "",
}: {
  progress: MutableRefObject<number>;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    const dpr = Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    el.appendChild(renderer.domElement);
    const canvas = renderer.domElement;
    canvas.style.opacity = "0";
    canvas.style.transition = "opacity 2.4s cubic-bezier(0.16,1,0.3,1)";

    // ---- Studio reflections: black room with soft-edged softboxes.
    const soft = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(128, 128, 8, 128, 128, 128);
      grd.addColorStop(0, "#fff");
      grd.addColorStop(0.5, "#aaa");
      grd.addColorStop(1, "#000");
      g.fillStyle = grd;
      g.fillRect(0, 0, 256, 256);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const studio = new THREE.Scene();
    studio.background = new THREE.Color(0x000000);
    const studioDisposables: { dispose: () => void }[] = [];
    const box = (w: number, h: number, k: number, pos: [number, number, number], rot: [number, number, number]) => {
      const m = new THREE.MeshBasicMaterial({ map: soft, color: new THREE.Color(k, k, k), side: THREE.DoubleSide });
      const g = new THREE.PlaneGeometry(w, h);
      studioDisposables.push(m, g);
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(...pos);
      mesh.rotation.set(...rot);
      studio.add(mesh);
    };
    box(24, 10, 2.6, [-8, 9, 12], [0.6, 0.4, 0]);
    box(4, 24, 1.8, [14, 0, 8], [0, -1.0, 0]);
    box(28, 3, 0.7, [0, -10, 10], [-0.7, 0, 0]);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(studio, 0.04);

    const scene = new THREE.Scene();
    scene.environment = envRT.texture;
    scene.fog = new THREE.Fog(0x050505, 17, 36);

    const camera = new THREE.PerspectiveCamera(32, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 14);

    // ---- Target: the Meriity mark, three stacked chevrons, rasterised into a mosaic.
    // Proportions from the logo (half-width = 1): each band rises R to its apex, is T thick,
    // has straight vertical sides; bands nest tightly; the third band is shorter (70% width).
    const U = mobile ? 1.85 : 2.6; // world half-width of the mark
    const R = 0.48 * U, T = 0.48 * U;
    const bands = [
      { oy: 0, w: U },
      { oy: -0.58 * U, w: U },
      { oy: -1.16 * U, w: 0.7 * U }, // 22 columns at desktop cell size
    ];
    const S = mobile ? 0.15 : 0.165; // cell size (world)
    const topOf = (x: number, oy: number) => oy - (R * Math.abs(x)) / U; // band's upper edge at x
    // Rasterise the first chevron once (it lands perfectly on the grid: a centred one-block
    // point with two blocks either side), then reuse that exact pattern for the other two,
    // shifted down by whole blocks, so every chevron has the same centred point.
    // The grid is built outward from the exact centre (a column at x = 0, mirrored columns on
    // either side, rows stepping down from the apex), so every point is one centred block and
    // the two halves are exact mirror images, even when the mark is seen flipped.
    const first: { x: number; y: number }[] = [];
    const COLS = Math.floor(U / S + 1e-6);
    for (let k = -COLS; k <= COLS; k++) {
      const x = k * S;
      const top = topOf(x, 0);
      for (let j = 0; j * S <= T + R + S; j++) {
        const y = -j * S;
        if (y <= top + 1e-6 && y >= top - T - 1e-6) first.push({ x, y });
      }
    }
    const STEP = Math.round((0.58 * U) / S); // chevron spacing in whole blocks (tight nesting)
    const raw: { x: number; y: number; band: number }[] = [];
    bands.forEach((bd, band) => {
      for (const c of first) if (Math.abs(c.x) <= bd.w + 1e-6) raw.push({ x: c.x, y: c.y - band * STEP * S, band });
    });
    const yMax = Math.max(...raw.map((c) => c.y)), yMin = Math.min(...raw.map((c) => c.y));
    const cy = (yMax + yMin) / 2; // centre the mark vertically on the group origin
    const cells = raw.map((c) => ({ x: c.x, y: c.y - cy, edge: false, band: c.band }));
    const count = cells.length;

    const geo = new RoundedBoxGeometry(S * 0.95, S * 0.95, S * 0.9, 3, S * 0.1);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, // tinted per instance
      metalness: 0.75,
      roughness: 0.26,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 3.2,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const HALF_H = 14 * Math.tan(THREE.MathUtils.degToRad(16)); // visible half-height at z=0
    const heroH = () => document.getElementById("top")?.offsetHeight ?? window.innerHeight * 0.7;
    // Where the mark sits in the hero, in full-viewport world units, and its scale.
    const heroPlacement = () => {
      // Placed by the viewport, not the hero's height: right-hand space, vertically between
      // the headline and the buttons, about 46% of the screen tall at most.
      const W = window.innerWidth, H = window.innerHeight, hh = heroH();
      const halfW = (HALF_H * W) / H;
      const px = mobile ? W * 0.5 : W * 0.79;
      // Vertically aligned with the headline's centre.
      const h1 = document.querySelector("#top h1")?.getBoundingClientRect();
      const heroTop = document.getElementById("top")?.getBoundingClientRect().top ?? 0;
      const py = mobile ? hh * 0.72 : h1 ? (h1.top + h1.bottom) / 2 - heroTop : hh * 0.47;
      const markHpx = Math.min(hh * 0.5, H * 0.46, W * 0.3);
      const scale = (markHpx / H) * ((2 * HALF_H) / (2.2 * U));
      return new THREE.Vector3((px / W) * 2 * halfW - halfW, HALF_H - (py / H) * 2 * HALF_H, scale);
    };
    const place0 = heroPlacement();

    // ---- Per-block scatter state and stagger.
    const rand = mulberry(9);
    const black = new THREE.Color(0x2c2c30);
    const graphite = new THREE.Color(0x4a4a50);
    const coral = new THREE.Color(0xfb4b51);
    const coralDeep = new THREE.Color(0xe23a41);
    type B = {
      tgt: THREE.Vector3; from: THREE.Vector3; qFrom: THREE.Quaternion;
      delay: number; phase: number; base: THREE.Color; edge: boolean;
    };
    const blocks: B[] = cells.map((c) => {
      // Scatter across the whole hero (world space, converted to the mark's local space).
      // Blocks on the headline side sit deeper, so fog dims them and the text stays clear.
      const halfW = HALF_H * camera.aspect;
      const heroBottom = HALF_H - (2 * HALF_H * heroH()) / window.innerHeight;
      const wx = (rand() * 2 - 1) * halfW;
      const wy = heroBottom + rand() * (HALF_H - heroBottom);
      const wz = wx < 0 ? -3 - rand() * 6 : -rand() * 5 + 1;
      const from = new THREE.Vector3((wx - place0.x) / place0.z, (wy - place0.y) / place0.z, wz / place0.z);
      const qFrom = new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 6.28, rand() * 6.28, rand() * 6.28));
      // Assemble from the bottom up, like growth: lower blocks lock in first.
      const delay = THREE.MathUtils.clamp((c.y - (yMin - cy)) / (yMax - yMin), 0, 1) * 0.55 + rand() * 0.12;
      return {
        tgt: new THREE.Vector3(c.x, c.y, (rand() - 0.5) * 0.04),
        from, qFrom, delay, phase: rand() * 6.28,
        base: rand() > 0.82 ? graphite : black,
        edge: c.edge,
      };
    });
    blocks.forEach((b, k) => mesh.setColorAt(k, b.base));
    // Progress at which the slowest block has fully locked in; coral only after this.
    const fullAt = Math.min(Math.max(...blocks.map((b) => b.delay)) * 0.7 + 0.45, 0.97);
    const coralTint = blocks.map((_, k) => (k % 5 === 0 ? coralDeep : coral));
    let coralMix = 0;

    const mark = new THREE.Group();
    mark.add(mesh);
    // `steer` turns the whole mark in the screen plane so its tip leads the direction of travel,
    // like a real arrow; the mark's own flip happens inside it, so steering is never mirrored.
    const steer = new THREE.Group();
    steer.add(mark);
    steer.position.set(place0.x, place0.y, 0);
    mark.scale.setScalar(place0.z);
    scene.add(steer);
    let heading = 0; // radians, counter-clockwise, 0 = tip up
    const vel = new THREE.Vector2();
    const lastPos = new THREE.Vector2(place0.x, place0.y);

    // ---- After the hero (scroll-driven, in viewport heights past the hold):
    //   A     flip 180deg while travelling into the right side of the white "Trusted by" card,
    //   REST  rest there, pointing up, so visitors register the logo,
    //   C     shrink and flow tip-first into the mouse pointer; gaps close so it turns solid,
    //         then cross-fade to the vector cursor at the same size and spot.
    const PHASE_A = 0.6, PHASE_B = 0.45, PHASE_C = 0.75; // B = the rest
    const markH = yMax - yMin; // local height of the mark
    const smooth = (t: number) => t * t * (3 - 2 * t);
    const toWorld = (px: number, py: number) => {
      const halfW = HALF_H * camera.aspect;
      return new THREE.Vector2((px / window.innerWidth) * 2 * halfW - halfW, HALF_H - (py / window.innerHeight) * 2 * HALF_H);
    };
    // Anchor: the empty right side of the white card, following it as it scrolls.
    const cardAnchor = (across: number) => {
      const card = document.querySelector<HTMLElement>("[data-trust-card]");
      const r = card?.getBoundingClientRect();
      if (!r) return new THREE.Vector3(0, 0, 0.3);
      // Ride with the card, but never above ~40% of the screen: once the card scrolls past,
      // the mark holds there for the rest of its stay instead of leaving with it.
      // `across` 0..1 glides it from the card's right side (78%) to its left side (22%).
      const w = toWorld(r.left + r.width * (0.78 - 0.56 * across), Math.max(r.top + r.height * 0.44, window.innerHeight * 0.4));
      const sc = ((r.height * 0.66) / window.innerHeight) * ((2 * HALF_H) / markH);
      return new THREE.Vector3(w.x, w.y, sc);
    };
    const cursorScale = () => (30 / window.innerHeight) * ((2 * HALF_H) / (2 * U)); // ~30px wide
    const tipLocalY = yMax - cy; // tip of the mark in local space

    // Cursor-following key light (reflections slide as the mouse moves).
    const cursorLight = new THREE.PointLight(0xffffff, 18, 16, 2);
    cursorLight.position.set(2, 2, 6);
    scene.add(cursorLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const fill = new THREE.DirectionalLight(0xffffff, 0.9);
    fill.position.set(8, -2, 7);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 1.8);
    rim.position.set(-6, 8, 4);
    scene.add(rim);

    const pointer = { x: 0.4, y: -0.2, tx: 0.4, ty: -0.2 };
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const ro = new ResizeObserver(() => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    });
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const dummy = new THREE.Object3D();
    const qId = new THREE.Quaternion();
    const tmpC = new THREE.Color();
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let p = reduced ? 1 : 0; // smoothed progress
    let pastS = 0; // smoothed scroll position past the hold (viewport heights)
    // Same lag as MarkCursor (0.32/frame), so both aim at the identical spot at hand-off.
    const lag = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: window.innerWidth / 2, ty: window.innerHeight / 2 };
    const onLag = (e: PointerEvent) => ((lag.tx = e.clientX), (lag.ty = e.clientY));
    window.addEventListener("pointermove", onLag, { passive: true });
    const clock = new THREE.Clock();

    const frame = (time: number) => {
      // Ambient pull toward 18% on its own, so the scene is alive before any scroll.
      const intro = reduced ? 1 : Math.min(time / 4, 1) * 0.18;
      const target = Math.max(progress.current, intro);
      p += (target - p) * (reduced ? 1 : 0.06);
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      const vh = window.innerHeight;
      const pastRaw = Math.max(0, window.scrollY - vh * 1.1) / vh; // viewport heights past the hold
      pastS += (pastRaw - pastS) * (reduced ? 1 : 0.14);
      const past = Math.abs(pastRaw - pastS) < 0.0005 ? pastRaw : pastS;
      lag.x += (lag.tx - lag.x) * 0.32;
      lag.y += (lag.ty - lag.y) * 0.32;
      const pa = smooth(THREE.MathUtils.clamp(past / PHASE_A, 0, 1));
      const pcRaw = THREE.MathUtils.clamp((past - PHASE_A - PHASE_B) / PHASE_C, 0, 1);
      const pc = smooth(pcRaw);
      // Pixel -> solid: blocks swell to close the gaps late in phase C, then cross-fade.
      const solid = smooth(THREE.MathUtils.clamp((pcRaw - 0.45) / 0.4, 0, 1));
      const fade = mobile ? pc : smooth(THREE.MathUtils.clamp((pcRaw - 0.78) / 0.22, 0, 1));
      setHandoff(mobile ? 0 : fade);
      if (pcRaw >= 1) {
        el.style.opacity = "0"; // the vector cursor (or nothing, on phones) has taken over
        return;
      }
      el.style.opacity = String(1 - fade);

      for (let k = 0; k < count; k++) {
        const b = blocks[k];
        const lt = ease(THREE.MathUtils.clamp((p - b.delay * 0.7) / 0.45, 0, 1));
        // Loose blocks breathe; locked blocks are still.
        const drift = (1 - lt) * 0.35;
        dummy.position.set(
          b.from.x + Math.sin(time * 0.35 + b.phase) * drift,
          b.from.y + Math.cos(time * 0.3 + b.phase) * drift,
          b.from.z,
        ).lerp(b.tgt, lt);
        dummy.quaternion.copy(b.qFrom).slerp(qId, lt);
        dummy.scale.setScalar(1 + 0.16 * solid);
        if (lt < 1) dummy.rotateY((1 - lt) * time * 0.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(k, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      // The whole mark warms to coral over ~1s once complete; cools back if it comes apart.
      const want = p >= fullAt - 0.002 ? 1 : 0;
      const prev = coralMix;
      coralMix += (want - coralMix) * (reduced ? 1 : 0.05);
      if (Math.abs(coralMix - prev) > 0.0005 || time === 0) {
        for (let k = 0; k < count; k++) mesh.setColorAt(k, tmpC.copy(blocks[k].base).lerp(coralTint[k], coralMix));
        mesh.instanceColor!.needsUpdate = true;
      }

      // Hero -> (A) flip into the card -> (B) ride with the card -> (C) shrink into the pointer.
      const home = heroPlacement();
      const anchor = cardAnchor(0); // right side of the card
      const cursorSc = cursorScale();
      const cw = toWorld(lag.x, lag.y);
      // Tip on the hotspot, whichever way the arrow is heading.
      const cursorPos = new THREE.Vector2(cw.x + Math.sin(heading) * tipLocalY * cursorSc, cw.y - Math.cos(heading) * tipLocalY * cursorSc);
      let x: number, y: number, sc: number;
      if (pc > 0) {
        x = THREE.MathUtils.lerp(anchor.x, cursorPos.x, pc);
        y = THREE.MathUtils.lerp(anchor.y, cursorPos.y, pc);
        sc = THREE.MathUtils.lerp(anchor.z, cursorSc, pc);
      } else {
        x = THREE.MathUtils.lerp(home.x, anchor.x, pa);
        y = THREE.MathUtils.lerp(home.y, anchor.y, pa);
        sc = THREE.MathUtils.lerp(home.z, anchor.z, pa);
      }
      // Steer like an arrow: the tip leads the direction of travel. In the hero it stands upright;
      // when it pauses it keeps its last heading; turns are smoothed so it banks into them.
      vel.lerp(new THREE.Vector2(x - lastPos.x, y - lastPos.y), 0.25);
      lastPos.set(x, y);
      let aim = heading;
      // Upright through the hero, the flip and the rest; tip-first steering only once it flows.
      if (pc <= 0.001) aim = 0;
      else if (vel.length() > 0.0025) aim = Math.atan2(vel.y, vel.x) - Math.PI / 2;
      const dh = Math.atan2(Math.sin(aim - heading), Math.cos(aim - heading)); // shortest way round
      heading += dh * (reduced ? 1 : 0.1);
      steer.rotation.z = heading;
      setHeading((-heading * 180) / Math.PI);
      // The flip arcs gently toward the viewer.
      steer.position.set(x, y, Math.sin(Math.PI * pa) * 2.2 * (1 - pc));
      mark.scale.setScalar(sc);
      const idle = (-0.28 + pointer.x * 0.14 + Math.sin(time * 0.2) * 0.04 * (1 - p)) * (1 - pa);
      // A: a 180deg flip (inside the steering group, so it never mirrors the heading).
      mark.rotation.y = idle + Math.PI * pa;
      mark.rotation.x = (0.08 + pointer.y * 0.08) * (1 - pa);
      mark.rotation.z = 0;
      cursorLight.position.set(steer.position.x + pointer.x * 6, steer.position.y - pointer.y * 4, 9);
      // Phones: the mark stays a hero feature and fades out as the hero leaves.
      renderer.render(scene, camera);
    };

    let raf = 0;
    // Hold the scene still under the logo stinger: rendering WebGL at full speed behind the
    // curtain competes with it for the GPU. The clock starts when the curtain lifts.
    let live = false;
    const offLift = onStingerLift(() => {
      live = true;
      clock.start();
    });
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible && live) frame(clock.getElapsedTime());
    };
    frame(0);
    requestAnimationFrame(() => (canvas.style.opacity = "1"));
    if (!reduced) loop();
    else frame(10);

    return () => {
      setHandoff(1);
      offLift();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointermove", onLag);
      ro.disconnect();
      io.disconnect();
      geo.dispose();
      mat.dispose();
      mesh.dispose();
      soft.dispose();
      studioDisposables.forEach((d) => d.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [progress]);

  return <div ref={host} aria-hidden className={className} />;
}

function mulberry(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
