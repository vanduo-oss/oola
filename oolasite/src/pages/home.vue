<script setup lang="ts">
import OolaIcon from "@/components/OolaIcon.vue";
import { MODELS } from "@/lib/catalog";
import { useOolaPanel } from "@/panel";

defineOptions({ name: "OolaHomePanel" });

const activePanel = useOolaPanel();
const modelId = MODELS[0].shortId;
const heroIcons = ["house", "mail", "search", "layout-grid"] as const;
const iconSize = 48;
</script>

<template>
  <section class="oola-hero-page vd-surface vd-surface-noise vd-surface-5">
    <div class="oola-hero-inner">
      <p class="oola-eyebrow">vanduo-oss</p>
      <h1 class="oola-title">
        <span class="oola-title-name">oola</span>
        <span class="oola-title-sep" aria-hidden="true">|</span>
        <span class="oola-title-ula">ūla</span>
      </h1>
      <p class="oola-lede">
        A 24×24 outline set with soft corners and golden-ratio mass, drawn in
        the open at Vanduo OSS.
      </p>
      <div class="oola-hero-actions">
        <button
          type="button"
          class="vd-btn vd-btn-primary vd-btn-lg"
          @click="activePanel = 'icons'"
        >
          Browse icons
        </button>
        <button
          type="button"
          class="vd-btn vd-btn-outline vd-btn-lg"
          @click="activePanel = 'about'"
        >
          About OOLA
        </button>
      </div>
    </div>
    <div class="oola-hero-board" aria-hidden="true">
      <div
        v-for="name in heroIcons"
        :key="name"
        class="oola-hero-board-cell"
      >
        <OolaIcon
          :model-id="modelId"
          :name="name"
          :size="iconSize"
          weight="regular"
        />
      </div>
    </div>
  </section>
</template>
