/**
 * The logo stinger plays on every full page load. Page entrances (hero headlines, fades,
 * background films) wait for the moment its curtain starts to lift, so nothing animates
 * unseen underneath it and nothing heavy starts while the curtain is moving.
 */
const EVENT = "meriity:stinger-lift";
type W = Window & { __meriityStingerLifted?: boolean };

/** Called by the stinger as its curtain begins to lift (or right away when it is skipped). */
export function markStingerLifted() {
  (window as W).__meriityStingerLifted = true;
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Run `cb` when the stinger lifts: immediately if it already has, if there is no stinger on
 * the page, or if it is hidden (reduced motion). Returns an unsubscribe function.
 */
export function onStingerLift(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const el = document.querySelector<HTMLElement>(".stinger");
  if ((window as W).__meriityStingerLifted || !el || getComputedStyle(el).display === "none") {
    cb();
    return () => {};
  }
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    window.removeEventListener(EVENT, run);
    window.clearTimeout(timer);
    cb();
  };
  window.addEventListener(EVENT, run);
  // Safety net: never hold a page's entrance for more than 7s.
  const timer = window.setTimeout(run, 7000);
  return () => {
    done = true;
    window.removeEventListener(EVENT, run);
    window.clearTimeout(timer);
  };
}
