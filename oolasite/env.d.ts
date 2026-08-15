/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown
  >;
  export default component;
}

declare module "@vanduo-oss/vd3/css";

declare module "*?raw" {
  const src: string;
  export default src;
}
