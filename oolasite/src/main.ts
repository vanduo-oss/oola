import { ViteSSG } from "vite-ssg";
import { createPinia } from "pinia";
import { VanduoVue } from "@vanduo-oss/vd3";
import App from "./App.vue";
import { buildRoutes } from "./router";
import "@vanduo-oss/vd3/css";
import "./styles/app.css";

const routes = buildRoutes();

export const createApp = ViteSSG(
  App,
  {
    base: import.meta.env.BASE_URL,
    routes,
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) return savedPosition;
      if (to.hash) return { el: to.hash, top: 24, behavior: "instant" };
      return { top: 0, behavior: "instant" };
    },
  },
  async ({ app, initialState }) => {
    app.use(createPinia());
    app.use(VanduoVue, {
      themeDefaults: {
        PRIMARY_LIGHT: "black",
        PRIMARY_DARK: "black",
        NEUTRAL: "gray",
        FONT: "system",
      },
      storagePrefix: "oola-bw-",
    });

    if (import.meta.env.SSR && initialState) {
      initialState.pinia = {};
    }
  },
);
