/**
 * 0..1 cross-fade from the hero's 3D mark to the vector mouse-pointer mark.
 * Written by TrustAlignment each frame, read by MarkCursor each frame.
 */
let value = 1;
export const setHandoff = (v: number) => {
  value = v;
};
export const getHandoff = () => value;

/** The travelling arrow's heading in CSS degrees (clockwise, 0 = pointing up). */
let heading = 0;
export const setHeading = (deg: number) => {
  heading = deg;
};
export const getHeading = () => heading;
