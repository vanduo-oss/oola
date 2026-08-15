<script setup lang="ts">
import { computed, provide, ref, watch } from "vue";
import { useHead } from "@unhead/vue";
import { VdToastContainer } from "@vanduo-oss/vd3";
import OolaDock from "@/layout/OolaDock.vue";
import WelcomeModal from "@/components/WelcomeModal.vue";
import HomePage from "@/pages/home.vue";
import IconsPage from "@/pages/icons.vue";
import AboutPage from "@/pages/about.vue";
import { navPages } from "@/nav";
import { oolaPanelKey, type OolaPanelId } from "@/panel";
import {
  maybeAutoVerticalOnIcons,
  useDockOrientation,
} from "@/lib/dock-orientation";

const BASE_URL = "https://oola.vanduo.dev";
const BRAND_TITLE = "OOLA — Structured Phi icons";
const DEFAULT_DESCRIPTION =
  "OOLA — the Structured Phi icon set for the Vanduo OSS family. Industry-conventional geometry, golden-ratio proportions.";

const panels = {
  home: HomePage,
  icons: IconsPage,
  about: AboutPage,
} as const;

const activePanel = ref<OolaPanelId>("home");
provide(oolaPanelKey, activePanel);

const { appOrientClass } = useDockOrientation();

const pageTitle = computed(() => {
  if (activePanel.value === "home") return BRAND_TITLE;
  const page = navPages.find((p) => p.id === activePanel.value);
  return page ? `${page.title} — OOLA` : BRAND_TITLE;
});

useHead({
  title: pageTitle,
  link: [{ rel: "canonical", href: BASE_URL }],
  meta: [
    { name: "description", content: DEFAULT_DESCRIPTION },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: DEFAULT_DESCRIPTION },
    { property: "og:url", content: BASE_URL },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: DEFAULT_DESCRIPTION },
  ],
});

watch(activePanel, (panel) => {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  if (panel === "icons") {
    maybeAutoVerticalOnIcons();
  }
});
</script>

<template>
  <div class="oola-app" :class="appOrientClass">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <main id="main-content" class="oola-main">
      <div class="oola-stage">
        <Transition name="oola-panel" mode="out-in">
          <component :is="panels[activePanel]" :key="activePanel" />
        </Transition>
      </div>
    </main>

    <OolaDock />
    <WelcomeModal />
    <VdToastContainer />
  </div>
</template>
