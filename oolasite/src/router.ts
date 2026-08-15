import { defineComponent } from "vue";
import type { RouteRecordRaw } from "vue-router";

/** ViteSSG still needs a route tree; the shell in App.vue owns all panels. */
const ShellOutlet = defineComponent({
  name: "OolaShellOutlet",
  setup() {
    return () => null;
  },
});

export const buildRoutes = (): RouteRecordRaw[] => [
  {
    path: "/",
    name: "shell",
    component: ShellOutlet,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "shell-fallback",
    component: ShellOutlet,
  },
];
