/** Structured Phi catalog — names loaded from batch sync. */
import iconNames from "@/data/icon-names.json";
import batch100Names from "@/data/batch-100-names.json";

export const MODELS = [
  {
    id: "hand",
    shortId: "recraft-v4.1-pro-vector",
    label: "Hand",
  },
] as const;

export const VARIANT = "oola-structured-phi" as const;

export const KEEPERS = ["oola", "mail", "house", "search", "layout-grid"] as const;

/** Quality-locked batch for human review (first in catalog order). */
export const BATCH_100 = batch100Names as readonly string[];

const BATCH_100_SET = new Set<string>(BATCH_100);

/** Active draft catalog (length grows with batch-250 / batch-1000). */
export const ICONS = iconNames as readonly string[];

export type ModelShortId = (typeof MODELS)[number]["shortId"];
export type IconName = string;

export const SIZES = [24, 32, 48] as const;

export const PAGE_SIZE = 50;

/** Preview-only weight transforms (vd3-style strip). */
export const WEIGHTS = [
  {
    id: "thin",
    label: "Thin",
    token: ".oola-thin",
    strokeWidth: 1,
    fill: false,
    duotone: false,
  },
  {
    id: "light",
    label: "Light",
    token: ".oola-light",
    strokeWidth: 1.25,
    fill: false,
    duotone: false,
  },
  {
    id: "regular",
    label: "Regular",
    token: ".oola",
    strokeWidth: 1.5,
    fill: false,
    duotone: false,
  },
  {
    id: "bold",
    label: "Bold",
    token: ".oola-bold",
    strokeWidth: 2.25,
    fill: false,
    duotone: false,
  },
  {
    id: "duotone",
    label: "Duotone",
    token: ".oola-duotone",
    strokeWidth: 1.5,
    fill: false,
    duotone: true,
  },
  {
    id: "fill",
    label: "Fill",
    token: ".oola-fill",
    strokeWidth: 1.5,
    fill: true,
    duotone: false,
  },
] as const;

export type WeightId = (typeof WEIGHTS)[number]["id"];
export type WeightDef = (typeof WEIGHTS)[number];

export function isKeeper(name: string): boolean {
  return (KEEPERS as readonly string[]).includes(name);
}

export function isBatch100(name: string): boolean {
  return BATCH_100_SET.has(name);
}
