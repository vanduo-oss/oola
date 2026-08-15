/**
 * Dock orientation morph: horizontal ↔ vertical via a square waypoint.
 * Persists under the same oola-bw- prefix as VanduoVue theme storage.
 */
import { computed, onMounted, onUnmounted, ref, type Ref } from "vue";

export type DockOrientation = "horizontal" | "vertical";
export type DockVisualPhase = "horizontal" | "square" | "vertical";

const STORAGE_KEY = "oola-bw-dock-orient";
/** Keep in sync with `--oola-dock-morph` / phase overrides in app.css */
const SHRINK_MS = 480;
const GROW_MS = 720;
const NARROW_MQ = "(max-width: 520px)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readStored(): DockOrientation | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "horizontal" || v === "vertical") return v;
  } catch {
    /* private mode */
  }
  return null;
}

function writeStored(orient: DockOrientation): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, orient);
  } catch {
    /* private mode */
  }
}

/** True when the user has never saved a dock orientation pref. */
export function isFirstDockVisit(): boolean {
  return readStored() === null;
}

const orientation = ref<DockOrientation>("horizontal");
const visualPhase = ref<DockVisualPhase>("horizontal");
const isMorphing = ref(false);
const isNarrow = ref(false);

let morphTimer: ReturnType<typeof setTimeout> | null = null;
let narrowMql: MediaQueryList | null = null;
let listenersBound = false;

function clearMorphTimer(): void {
  if (morphTimer != null) {
    clearTimeout(morphTimer);
    morphTimer = null;
  }
}

function snapTo(target: DockOrientation): void {
  clearMorphTimer();
  isMorphing.value = false;
  orientation.value = target;
  visualPhase.value = target;
  writeStored(target);
}

/**
 * Two-phase morph: current rest → square → target rest.
 * Ignores calls while morphing. On narrow viewports, forces horizontal.
 */
export function playTo(target: DockOrientation): void {
  if (typeof window === "undefined") return;
  if (isNarrow.value) {
    snapTo("horizontal");
    return;
  }
  if (isMorphing.value) return;
  if (orientation.value === target && visualPhase.value === target) {
    writeStored(target);
    return;
  }

  if (prefersReducedMotion()) {
    snapTo(target);
    return;
  }

  isMorphing.value = true;
  visualPhase.value = "square";

  clearMorphTimer();
  morphTimer = setTimeout(() => {
    visualPhase.value = target;
    orientation.value = target;
    writeStored(target);
    morphTimer = setTimeout(() => {
      isMorphing.value = false;
      morphTimer = null;
    }, GROW_MS);
  }, SHRINK_MS);
}

export function toggleDockOrientation(): void {
  if (isNarrow.value) return;
  if (isMorphing.value) return;
  const next: DockOrientation =
    orientation.value === "horizontal" ? "vertical" : "horizontal";
  playTo(next);
}

/** Restore from localStorage on client boot (no animation). */
export function restoreDockOrientation(): void {
  if (typeof window === "undefined") return;
  isNarrow.value = window.matchMedia(NARROW_MQ).matches;
  if (isNarrow.value) {
    orientation.value = "horizontal";
    visualPhase.value = "horizontal";
    return;
  }
  const stored = readStored();
  const value: DockOrientation = stored ?? "horizontal";
  orientation.value = value;
  visualPhase.value = value;
}

/**
 * First-visit Icons auto-play: only when no stored pref.
 * Stays vertical and persists.
 */
export function maybeAutoVerticalOnIcons(): void {
  if (typeof window === "undefined") return;
  if (!isFirstDockVisit()) return;
  if (isNarrow.value) return;
  playTo("vertical");
}

function onNarrowChange(e: MediaQueryListEvent | MediaQueryList): void {
  const matches = "matches" in e ? e.matches : (e as MediaQueryList).matches;
  isNarrow.value = matches;
  if (matches) {
    clearMorphTimer();
    isMorphing.value = false;
    orientation.value = "horizontal";
    visualPhase.value = "horizontal";
  }
}

function bindNarrowListener(): void {
  if (typeof window === "undefined" || listenersBound) return;
  narrowMql = window.matchMedia(NARROW_MQ);
  isNarrow.value = narrowMql.matches;
  narrowMql.addEventListener("change", onNarrowChange);
  listenersBound = true;
}

function unbindNarrowListener(): void {
  if (!listenersBound || !narrowMql) return;
  narrowMql.removeEventListener("change", onNarrowChange);
  narrowMql = null;
  listenersBound = false;
}

export function useDockOrientation() {
  onMounted(() => {
    restoreDockOrientation();
    bindNarrowListener();
  });

  onUnmounted(() => {
    clearMorphTimer();
    unbindNarrowListener();
  });

  const dockClasses = computed(() => ({
    "is-horizontal": visualPhase.value === "horizontal",
    "is-square": visualPhase.value === "square",
    "is-vertical": visualPhase.value === "vertical",
    "is-morphing": isMorphing.value,
  }));

  /** Rest orientation only — never square / visualPhase. Drive main offset from this. */
  const appOrientClass = computed(() =>
    orientation.value === "vertical"
      ? "oola-dock-orient-vertical"
      : "oola-dock-orient-horizontal",
  );

  const brandLabel = computed(() =>
    orientation.value === "horizontal"
      ? "Use vertical dock"
      : "Use horizontal dock",
  );

  const brandPressed = computed(() => orientation.value === "vertical");

  const canToggle = computed(() => !isNarrow.value);

  return {
    orientation: orientation as Ref<DockOrientation>,
    visualPhase: visualPhase as Ref<DockVisualPhase>,
    isMorphing: isMorphing as Ref<boolean>,
    isNarrow: isNarrow as Ref<boolean>,
    dockClasses,
    appOrientClass,
    brandLabel,
    brandPressed,
    canToggle,
    toggleDockOrientation,
    playTo,
  };
}

export const DOCK_MORPH_MS = { shrink: SHRINK_MS, grow: GROW_MS };
