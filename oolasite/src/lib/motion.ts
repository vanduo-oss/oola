/** Preview-only motion families for the Light-weight animated column. */

export const MOTION_FAMILIES = [
  "draw",
  "spin",
  "beat",
  "swing",
  "bounce",
  "pulse",
  "wiggle",
] as const;

export type MotionFamily = (typeof MOTION_FAMILIES)[number];

/** Explicit page-1 / high-signal mappings; everything else falls back to draw. */
const BY_NAME: Record<string, MotionFamily> = {
  // spin
  cog: "spin",
  sun: "spin",
  // beat
  heart: "beat",
  star: "beat",
  // swing
  bell: "swing",
  phone: "swing",
  // bounce
  "map-pin": "bounce",
  "chevron-down": "bounce",
  download: "bounce",
  "arrow-down": "bounce",
  // draw
  check: "draw",
  plus: "draw",
  minus: "draw",
  x: "draw",
  menu: "draw",
  "arrow-left": "draw",
  "arrow-right": "draw",
  "arrow-up-right": "draw",
  "arrow-down-left": "draw",
  // pulse
  search: "pulse",
  eye: "pulse",
  lock: "pulse",
  // wiggle
  mail: "wiggle",
  "at-sign": "wiggle",
  flame: "wiggle",
};

export function motionFamilyFor(name: string): MotionFamily {
  return BY_NAME[name] ?? "draw";
}
