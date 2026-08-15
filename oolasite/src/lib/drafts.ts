import type { IconName, ModelShortId } from "./catalog";
import { VARIANT } from "./catalog";
import oolaMarkSvg from "../../../drafts/oola-structured-phi/recraft-v4.1-pro-vector/oola.svg?raw";
import infoSvg from "../../../drafts/oola-structured-phi/recraft-v4.1-pro-vector/info.svg?raw";

const modules = import.meta.glob<string>(
  "../../../drafts/oola-structured-phi/*/*.svg",
  {
    query: "?raw",
    import: "default",
  },
);

/** Explicit so Vite does not miss a newly added glob file. */
const MARK_OVERRIDES: Record<string, string> = {
  "../../../drafts/oola-structured-phi/recraft-v4.1-pro-vector/oola.svg":
    oolaMarkSvg,
  "../../../drafts/oola-structured-phi/recraft-v4.1-pro-vector/info.svg":
    infoSvg,
};

const cache = new Map<string, string | null>();

function key(model: ModelShortId, icon: IconName): string {
  return `../../../drafts/${VARIANT}/${model}/${icon}.svg`;
}

/** Lazy-load draft SVG text (cached). */
export async function loadDraftSvgAsync(
  model: ModelShortId,
  icon: IconName,
): Promise<string | null> {
  const k = key(model, icon);
  if (cache.has(k)) return cache.get(k) ?? null;
  const override = MARK_OVERRIDES[k];
  if (override) {
    cache.set(k, override);
    return override;
  }
  const loader = modules[k];
  if (!loader) {
    cache.set(k, null);
    return null;
  }
  try {
    const svg = await loader();
    cache.set(k, svg);
    return svg;
  } catch {
    cache.set(k, null);
    return null;
  }
}

/** Sync helper for callers that already awaited load — prefer async API. */
export function loadDraftSvg(
  model: ModelShortId,
  icon: IconName,
): string | null {
  return cache.get(key(model, icon)) ?? null;
}

export function draftModuleCount(): number {
  return Object.keys(modules).length;
}
