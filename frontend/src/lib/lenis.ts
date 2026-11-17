import type Lenis from "lenis";

/** The page's single Lenis instance, so the menu can pause scrolling and links can glide. */
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const getLenis = () => instance;
