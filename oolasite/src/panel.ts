import { inject, type InjectionKey, type Ref } from "vue";

export type OolaPanelId = "home" | "icons" | "about";

export const oolaPanelKey: InjectionKey<Ref<OolaPanelId>> = Symbol("oolaPanel");

export function useOolaPanel(): Ref<OolaPanelId> {
  const panel = inject(oolaPanelKey);
  if (!panel) {
    throw new Error("useOolaPanel() must be used inside the OOLA shell");
  }
  return panel;
}
