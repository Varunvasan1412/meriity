"use client";
import { useRef } from "react";
import { touchpoints, CTA } from "@/content/home";
import { gsap, ScrollTrigger, useGSAP, REDUCED } from "@/lib/gsap";

// The customer journey as a pinned, horizontal film strip.
// Desktop: the section holds (CSS sticky inside a tall wrapper) while scrolling slides five
// dark panels sideways, one per step, ending on a coral "Chosen." panel. Each panel has a big
// word, its question and a small animated vignette of that moment; the vignette plays when the
// panel reaches the middle. A counter and progress bar track the journey.
// Below lg, or with reduced motion: the panels stack and play as each one scrolls into view.
// Styles live in this file so they apply even when the global CSS pipeline is stale.

const CSS = `
.jy { position: relative; }
.jy-stage { position: relative; }
.jy-head { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.jy-kicker { font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: rgba(16,16,16,.55); }
.jy-count { font-size: 13px; font-weight: 700; letter-spacing: .06em; font-variant-numeric: tabular-nums; color: #101010; display: flex; align-items: center; gap: 14px; }
.jy-bar { width: 140px; height: 2px; background: rgba(16,16,16,.12); position: relative; overflow: hidden; border-radius: 2px; }
.jy-bar i { position: absolute; inset: 0; background: #FB4B51; transform-origin: 0 50%; transform: scaleX(0); }
.jy-track { display: flex; flex-direction: column; gap: 16px; padding: 0 16px; }
.jy-check { display: none; }
.jy-panel { position: relative; border-radius: 22px; background: #101010; color: #fff; overflow: hidden;
  display: grid; grid-template-columns: 1fr; gap: 28px; padding: 28px; }
.jy-panel::after { content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
  background: radial-gradient(120% 90% at 85% 10%, rgba(251,75,81,.10), transparent 55%); }
.jy-step { font-size: 13px; font-weight: 700; letter-spacing: .08em; color: rgba(255,255,255,.45); font-variant-numeric: tabular-nums; }
.jy-word { font-size: clamp(3rem, 7.2vw, 7.5rem); line-height: .9; letter-spacing: -.045em; margin-top: 14px;
  transform: translateY(18px); opacity: .25; transition: transform 1s cubic-bezier(.16,1,.3,1), opacity 1s; }
.jy-word span { color: #FB4B51; }
.jy-q { margin-top: 18px; max-width: 26ch; font-size: clamp(1rem, 1.3vw, 1.25rem); line-height: 1.35; color: rgba(255,255,255,.7);
  transform: translateY(14px); opacity: 0; transition: transform 1s .1s cubic-bezier(.16,1,.3,1), opacity 1s .1s; }
.jy-panel.is-on .jy-word, .jy-panel.is-on .jy-q { transform: none; opacity: 1; }
.jy-copy { position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: space-between; }
.jy-vis { position: relative; z-index: 1; display: grid; place-items: center; min-height: 300px; }

/* vignette shell */
.jv { width: min(100%, 440px); border-radius: 16px; background: #1b1b1b; border: 1px solid rgba(255,255,255,.08);
  box-shadow: 0 30px 80px -30px rgba(0,0,0,.8); padding: 18px; font-size: 14px; color: rgba(255,255,255,.88);
  transform: translateY(26px) scale(.97); opacity: 0; transition: transform 1.1s cubic-bezier(.16,1,.3,1), opacity .9s; }
.is-on .jv { transform: none; opacity: 1; }
.jv-line { height: 8px; border-radius: 4px; background: rgba(255,255,255,.09); }
.jv-mark { width: 30px; height: 30px; border-radius: 8px; background: #FB4B51; color: #101010; font-weight: 800; display: grid; place-items: center; font-size: 15px; flex: none; }
.jv-muted { color: rgba(255,255,255,.45); font-size: 12px; }
.jv-row { display: flex; align-items: center; gap: 12px; }

/* 1 search */
.jv-bar { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 999px; background: #262626; }
.jv-typed { display: inline-block; overflow: hidden; white-space: nowrap; width: 0; vertical-align: bottom; transition: width 1.4s steps(28) .4s; }
.is-on .jv-typed { width: 28ch; }
.jv-caret { width: 1.5px; height: 16px; background: #FB4B51; animation: jvblink 1s steps(1) infinite; }
@keyframes jvblink { 50% { opacity: 0; } }
.jv-ai { margin-top: 14px; padding: 12px 14px; border-radius: 12px; background: rgba(251,75,81,.08); border: 1px solid rgba(251,75,81,.22);
  opacity: 0; transform: translateY(8px); transition: opacity .7s 1.9s, transform .7s 1.9s; }
.is-on .jv-ai { opacity: 1; transform: none; }
.jv-chip { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #FB4B51; }
.jv-hit { margin-top: 12px; padding: 12px; border-radius: 12px; border: 1px solid transparent; transition: border-color .6s 2.4s, background .6s 2.4s; }
.is-on .jv-hit { border-color: rgba(251,75,81,.6); background: rgba(255,255,255,.03); }
.jv-stars { color: #FB4B51; letter-spacing: 2px; font-size: 12px; }

/* 2 reviews */
.jv-score { font-size: 52px; font-weight: 800; letter-spacing: -.04em; line-height: 1; }
.jv-starrow { display: flex; gap: 4px; margin-top: 8px; }
.jv-starrow b { width: 18px; height: 18px; clip-path: polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
  background: rgba(255,255,255,.14); position: relative; overflow: hidden; }
.jv-starrow b::after { content: ""; position: absolute; inset: 0; background: #FB4B51; transform: scaleX(0); transform-origin: 0 50%; transition: transform .45s; }
.is-on .jv-starrow b::after { transform: scaleX(1); }
.jv-starrow b:nth-child(2)::after { transition-delay: .15s } .jv-starrow b:nth-child(3)::after { transition-delay: .3s }
.jv-starrow b:nth-child(4)::after { transition-delay: .45s } .jv-starrow b:nth-child(5)::after { transition-delay: .6s }
.jv-review { margin-top: 12px; padding: 12px 14px; border-radius: 12px; background: #242424; opacity: 0; transform: translateY(12px);
  transition: opacity .7s, transform .9s cubic-bezier(.16,1,.3,1); }
.is-on .jv-review { opacity: 1; transform: none; }
.is-on .jv-review:nth-of-type(1) { transition-delay: .9s } .is-on .jv-review:nth-of-type(2) { transition-delay: 1.2s }
.jv-ava { width: 26px; height: 26px; border-radius: 999px; background: linear-gradient(135deg,#3a3a3a,#555); flex: none; }

/* 3 social */
.jv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 14px; }
.jv-grid i { aspect-ratio: 1; border-radius: 8px; background: #2a2a2a; }
.jv-grid i:nth-child(1) { background: linear-gradient(135deg,#FB4B51,#8a1f24); transform: scale(.6); opacity: 0;
  transition: transform .8s cubic-bezier(.16,1,.3,1) .6s, opacity .5s .6s; position: relative; }
.is-on .jv-grid i:nth-child(1) { transform: none; opacity: 1; }
.jv-grid i:nth-child(2) { background: linear-gradient(135deg,#093160,#0d4a8f); }
.jv-grid i:nth-child(4) { background: linear-gradient(135deg,#333,#4a4a4a); }
.jv-grid i:nth-child(6) { background: linear-gradient(135deg,#093160,#1b2b40); }
.jv-heart { position: absolute; left: 50%; top: 50%; width: 22px; height: 22px; margin: -11px; color: #fff;
  transform: scale(0); transition: transform .6s cubic-bezier(.34,1.56,.64,1) 1.5s; }
.is-on .jv-heart { transform: scale(1); }
.jv-stat { text-align: center; } .jv-stat b { display: block; font-size: 15px; }
.jv-badge { margin-left: auto; font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 999px; background: rgba(251,75,81,.15); color: #FB4B51; }

/* 4 website */
.jv-browser { padding: 0; overflow: hidden; }
.jv-chrome { display: flex; gap: 6px; padding: 12px 14px; background: #232323; }
.jv-chrome i { width: 9px; height: 9px; border-radius: 999px; background: rgba(255,255,255,.18); }
.jv-site { position: relative; padding: 22px 20px 26px; }
.jv-h { height: 14px; border-radius: 4px; background: rgba(255,255,255,.75); }
.jv-btn { display: inline-flex; margin-top: 18px; padding: 10px 16px; border-radius: 10px; background: #FB4B51; color: #101010; font-weight: 700; font-size: 13px;
  transition: transform .2s 2.25s, box-shadow .6s 2.25s; }
.is-on .jv-btn { transform: scale(.95); box-shadow: 0 0 0 10px rgba(251,75,81,.18); }
.jv-cursor { position: absolute; width: 18px; height: 18px; left: 78%; top: 92%; transition: left 1.3s cubic-bezier(.65,0,.35,1) .8s, top 1.3s cubic-bezier(.65,0,.35,1) .8s; }
.is-on .jv-cursor { left: 26%; top: 74%; }
.jv-sent { margin-top: 14px; font-size: 12px; color: #FB4B51; opacity: 0; transition: opacity .6s 2.6s; }
.is-on .jv-sent { opacity: 1; }

/* 5 recognised */
.jv-brand { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.jv-tile { border-radius: 12px; background: #242424; padding: 14px; min-height: 92px; display: flex; flex-direction: column; justify-content: space-between;
  opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--r)); transition: transform 1.1s cubic-bezier(.16,1,.3,1), opacity .7s; }
.is-on .jv-tile { opacity: 1; transform: none; }
.jv-tile:nth-child(1) { --dx: -18px; --dy: -14px; --r: -6deg; transition-delay: .3s }
.jv-tile:nth-child(2) { --dx: 18px; --dy: -10px; --r: 5deg; transition-delay: .45s }
.jv-tile:nth-child(3) { --dx: -14px; --dy: 16px; --r: 4deg; transition-delay: .6s }
.jv-tile:nth-child(4) { --dx: 16px; --dy: 14px; --r: -5deg; transition-delay: .75s }
.jv-match { margin-top: 12px; font-size: 12px; color: #FB4B51; font-weight: 700; opacity: 0; transition: opacity .6s 1.6s; }
.is-on .jv-match { opacity: 1; }

/* finale */
.jy-end { background: #FB4B51; color: #101010; }
.jy-end::after { background: radial-gradient(120% 90% at 85% 10%, rgba(255,255,255,.18), transparent 55%); }
.jy-end .jy-step { color: rgba(16,16,16,.55); }
.jy-end .jy-word span { color: #fff; }
.jy-end .jy-q { color: rgba(16,16,16,.75); }
.jy-cta { display: inline-flex; align-items: center; gap: 10px; margin-top: 28px; padding: 16px 22px; border-radius: 12px; background: #101010; color: #fff;
  font-weight: 700; width: max-content; transition: transform .3s; }
.jy-cta:hover { transform: translateY(-2px); }

@media (min-width: 1024px) {
  .jy.is-pinned .jy-stage { position: sticky; top: 0; height: 100svh; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
  .jy.is-pinned .jy-track { flex-direction: row; gap: 22px; width: max-content; will-change: transform; }
  .jy.is-pinned .jy-panel { width: min(72vw, 1080px); height: min(70svh, 640px); grid-template-columns: 1fr 1fr; padding: 44px; flex: none; }
  .jy.is-pinned .jy-vis { min-height: 0; }
  .jy-check { display: block; }
}
`;

const words = ["Searched", "Reviewed", "Followed", "Visited", "Recognised"];

function Vignette({ i }: { i: number }) {
  if (i === 0)
    return (
      <div className="jv">
        <div className="jv-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="jv-typed">best growth partner melbourne</span>
          <span className="jv-caret" />
        </div>
        <div className="jv-ai">
          <span className="jv-chip">AI answer</span>
          <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.4, color: "rgba(255,255,255,.8)" }}>
            A well-reviewed local option is <b style={{ color: "#fff" }}>Your Business</b>, known for clear pricing and fast replies.
          </p>
        </div>
        <div className="jv-hit">
          <div className="jv-row">
            <span className="jv-mark">Y</span>
            <div>
              <b>Your Business</b>
              <div className="jv-muted">yourbusiness.com.au</div>
            </div>
            <span className="jv-stars" style={{ marginLeft: "auto" }}>★★★★★</span>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "grid", gap: 8, padding: "0 12px" }}>
          <div className="jv-line" style={{ width: "70%" }} />
          <div className="jv-line" style={{ width: "45%" }} />
        </div>
      </div>
    );
  if (i === 1)
    return (
      <div className="jv">
        <div className="jv-row">
          <div>
            <div className="jv-score">4.9</div>
            <div className="jv-starrow" aria-hidden>
              <b /><b /><b /><b /><b />
            </div>
          </div>
          <div className="jv-muted" style={{ marginLeft: "auto", textAlign: "right" }}>
            128 reviews
            <br />
            Your Business
          </div>
        </div>
        <div className="jv-review">
          <div className="jv-row">
            <span className="jv-ava" />
            <b style={{ fontSize: 13 }}>A recent customer</b>
            <span className="jv-stars" style={{ marginLeft: "auto" }}>★★★★★</span>
          </div>
          <p style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,.75)" }}>Clear, quick and genuinely helpful. Would recommend.</p>
        </div>
        <div className="jv-review">
          <div className="jv-row">
            <span className="jv-ava" />
            <b style={{ fontSize: 13 }}>A local client</b>
            <span className="jv-stars" style={{ marginLeft: "auto" }}>★★★★★</span>
          </div>
          <p style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,.75)" }}>They replied the same day and delivered what they promised.</p>
        </div>
      </div>
    );
  if (i === 2)
    return (
      <div className="jv">
        <div className="jv-row">
          <span className="jv-mark">Y</span>
          <div>
            <b>yourbusiness</b>
            <div className="jv-muted">Posted 2 hours ago</div>
          </div>
          <span className="jv-badge">Active</span>
        </div>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          <div className="jv-stat"><b>412</b><span className="jv-muted">posts</span></div>
          <div className="jv-stat"><b>8.6k</b><span className="jv-muted">followers</span></div>
          <div className="jv-stat"><b>96%</b><span className="jv-muted">reply rate</span></div>
        </div>
        <div className="jv-grid">
          <i>
            <svg className="jv-heart" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 4.4 2.5.8-1.3 2.3-2.5 4.4-2.5 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
            </svg>
          </i>
          <i /><i /><i /><i /><i />
        </div>
      </div>
    );
  if (i === 3)
    return (
      <div className="jv jv-browser">
        <div className="jv-chrome"><i /><i /><i /></div>
        <div className="jv-site">
          <div className="jv-row">
            <span className="jv-mark">Y</span>
            <div className="jv-line" style={{ marginLeft: "auto", width: 64 }} />
            <div className="jv-line" style={{ width: 48 }} />
          </div>
          <div className="jv-h" style={{ marginTop: 28, width: "80%" }} />
          <div className="jv-h" style={{ marginTop: 10, width: "55%" }} />
          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            <div className="jv-line" style={{ width: "75%" }} />
            <div className="jv-line" style={{ width: "60%" }} />
          </div>
          <span className="jv-btn">Book a call</span>
          <div className="jv-sent">Enquiry sent. We&apos;ll reply today.</div>
          <svg className="jv-cursor" viewBox="0 0 24 24" aria-hidden>
            <path d="M4 2l15 9-7 1.5L8.5 20z" fill="#fff" stroke="#101010" strokeWidth="1.2" />
          </svg>
        </div>
      </div>
    );
  return (
    <div className="jv">
      <div className="jv-brand">
        <div className="jv-tile">
          <span className="jv-mark">Y</span>
          <span className="jv-muted">Business card</span>
        </div>
        <div className="jv-tile">
          <span className="jv-mark" style={{ borderRadius: 10 }}>Y</span>
          <span className="jv-muted">App &amp; socials</span>
        </div>
        <div className="jv-tile">
          <div className="jv-row"><span className="jv-mark">Y</span><div className="jv-line" style={{ width: 64 }} /></div>
          <span className="jv-muted">Shopfront</span>
        </div>
        <div className="jv-tile">
          <div className="jv-row"><span className="jv-mark">Y</span><div className="jv-line" style={{ width: 80 }} /></div>
          <span className="jv-muted">Email signature</span>
        </div>
      </div>
      <div className="jv-match">Same look. Same voice. Everywhere.</div>
    </div>
  );
}

export default function Journey() {
  const scope = useRef<HTMLDivElement>(null);
  const total = touchpoints.length;

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const track = root.querySelector<HTMLElement>(".jy-track")!;
      const panels = Array.from(root.querySelectorAll<HTMLElement>(".jy-panel"));
      const bar = root.querySelector<HTMLElement>(".jy-bar i")!;
      const count = root.querySelector<HTMLElement>(".jy-now")!;

      const setActive = (idx: number) => {
        panels.forEach((p, i) => p.classList.toggle("is-on", i <= idx));
        const step = Math.min(idx + 1, total);
        count.textContent = String(step).padStart(2, "0");
        bar.style.transform = `scaleX(${Math.min(1, (idx + 1) / (panels.length))})`;
      };

      const mm = gsap.matchMedia();

      // Desktop: pinned horizontal strip.
      mm.add(`(min-width: 1024px) and (not ${REDUCED})`, () => {
        root.classList.add("is-pinned");
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const size = () => {
          // Line the first panel up with the page's content column; let the last one end centred.
          const col = Math.max(16, (window.innerWidth - 1340) / 2 + 16);
          track.style.paddingLeft = `${col}px`;
          track.style.paddingRight = `${Math.max(col, (window.innerWidth - panels[0].offsetWidth) / 2)}px`;
          // The tall wrapper gives the sticky stage its scroll length.
          root.style.height = `${window.innerHeight + distance()}px`;
        };
        size();

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.9,
            invalidateOnRefresh: true,
            onRefreshInit: size,
            onUpdate: (self) => {
              // The panel nearest the middle of the screen is "now".
              const x = -distance() * self.progress;
              const mid = window.innerWidth / 2;
              let idx = 0;
              panels.forEach((p, i) => {
                if (p.offsetLeft + x < mid + p.offsetWidth * 0.1) idx = i;
              });
              setActive(idx);
            },
          },
        });
        setActive(0);
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          root.classList.remove("is-pinned");
          root.style.height = "";
          Object.assign(track.style, { paddingLeft: "", paddingRight: "", transform: "" });
        };
      });

      // Mobile / tablet: stacked panels that play as they arrive.
      mm.add(`(max-width: 1023px) and (not ${REDUCED})`, () => {
        const sts = panels.map((p, i) =>
          ScrollTrigger.create({
            trigger: p,
            start: "top 70%",
            onEnter: () => setActive(Math.max(i, currentIdx())),
          }),
        );
        const currentIdx = () => panels.filter((p) => p.classList.contains("is-on")).length - 1;
        setActive(-1);
        return () => sts.forEach((s) => s.kill());
      });

      mm.add(REDUCED, () => setActive(panels.length - 1));
    },
    { scope },
  );

  return (
    <div ref={scope} className="jy" style={{ marginTop: "clamp(96px, 10vw, 128px)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="jy-stage">
        <div style={{ maxWidth: 1340, margin: "0 auto", width: "100%", padding: "0 16px" }}>
          <div className="jy-head">
            <span className="jy-kicker">How a customer checks you out</span>
            <span className="jy-count" aria-hidden>
              <span>
                <span className="jy-now">01</span> / {String(total).padStart(2, "0")}
              </span>
              <span className="jy-bar"><i /></span>
            </span>
          </div>
        </div>

        <ol className="jy-track" aria-label="How customers check a business, in order">
          {touchpoints.map((t, i) => (
            <li key={t.name} className="jy-panel">
              <div className="jy-copy">
                <div>
                  <span className="jy-step">
                    {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                  <h3 className="jy-word display">
                    {words[i] ?? t.name}
                    <span>.</span>
                  </h3>
                  <p className="jy-q">{t.question}</p>
                </div>
                <span className="jy-step jy-check">{t.check}</span>
              </div>
              <div className="jy-vis" aria-hidden>
                <Vignette i={i} />
              </div>
            </li>
          ))}
          <li className="jy-panel jy-end">
            <div className="jy-copy">
              <div>
                <span className="jy-step">The result</span>
                <h3 className="jy-word display">
                  Chosen<span>.</span>
                </h3>
                <p className="jy-q">When every touchpoint tells the same trusted story, they pick you, and you never lose them quietly again.</p>
                <a href={CTA.trustCheck.href} className="jy-cta">
                  {CTA.trustCheck.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
