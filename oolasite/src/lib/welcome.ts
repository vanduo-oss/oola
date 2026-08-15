/**
 * First-visit welcome modal. Persists under the same oola-bw- prefix
 * as theme + dock orientation.
 */
import { onMounted, onUnmounted, ref, watch, type Ref } from "vue";

export const WELCOME_STORAGE_KEY = "oola-bw-welcome";

const SEEN_VALUES = new Set(["1", "seen"]);

export const welcomeOpen = ref(false);

function readSeen(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    const v = localStorage.getItem(WELCOME_STORAGE_KEY);
    return v != null && SEEN_VALUES.has(v);
  } catch {
    /* private mode / missing storage */
  }
  return false;
}

function writeSeen(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(WELCOME_STORAGE_KEY, "seen");
  } catch {
    /* private mode */
  }
}

function lockBody(lock: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("body-modal-open", lock);
}

export function persistWelcomeSeen(): void {
  writeSeen();
}

export function dismissWelcome(): void {
  welcomeOpen.value = false;
  writeSeen();
}

export function reopenWelcome(): void {
  welcomeOpen.value = true;
}

export function useWelcomeModal(): {
  welcomeOpen: Ref<boolean>;
  dismissWelcome: () => void;
  reopenWelcome: () => void;
} {
  function onKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape" && welcomeOpen.value) {
      e.preventDefault();
      dismissWelcome();
    }
  }

  onMounted(() => {
    if (!readSeen()) welcomeOpen.value = true;
    window.addEventListener("keydown", onKeydown);
  });

  watch(welcomeOpen, (open) => {
    lockBody(open);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", onKeydown);
    lockBody(false);
  });

  return { welcomeOpen, dismissWelcome, reopenWelcome };
}
