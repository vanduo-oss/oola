import { createApp } from "vue";
import { VanduoVue } from "@vanduo-oss/vd3";
import "@vanduo-oss/vd3/css";
import App from "./App.vue";
import "./styles/preview.css";

createApp(App)
  .use(VanduoVue, {
    // Keep default primary black in both schemes so the customizer baseline
    // matches icon draft review (icons also force #000 while primary is default).
    themeDefaults: { PRIMARY_DARK: "black" },
  })
  .mount("#app");
