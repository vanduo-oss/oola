<script setup lang="ts">
/**
 * Bottom dock — fat glass pill with OOLA icon buttons + theme switcher.
 * Brand toggles horizontal ↔ vertical morph (persisted).
 */
import { VdThemeSwitcher } from "@vanduo-oss/vd3";
import OolaIcon from "@/components/OolaIcon.vue";
import { navPages } from "@/nav";
import { MODELS } from "@/lib/catalog";
import { useOolaPanel } from "@/panel";
import { useDockOrientation } from "@/lib/dock-orientation";

const modelId = MODELS[0].shortId;
const iconSize = 24;
const brandIconSize = 28;
const activePanel = useOolaPanel();

const {
  dockClasses,
  brandLabel,
  brandPressed,
  canToggle,
  toggleDockOrientation,
} = useDockOrientation();

function onBrandClick() {
  if (!canToggle.value) return;
  toggleDockOrientation();
}
</script>

<template>
  <nav
    class="oola-dock vd-navbar-glass vd-glass-34 vd-glass-contrast"
    :class="dockClasses"
    aria-label="Primary"
  >
    <button
      type="button"
      class="oola-dock-brand"
      :aria-label="brandLabel"
      :aria-pressed="brandPressed"
      :disabled="!canToggle"
      @click="onBrandClick"
    >
      <span class="oola-dock-brand-mark" aria-hidden="true">
        <OolaIcon
          :model-id="modelId"
          name="oola"
          :size="brandIconSize"
        />
      </span>
      <span class="oola-dock-brand-name" aria-hidden="true">
        <span class="oola-dock-brand-letter">o</span>
        <span class="oola-dock-brand-letter">o</span>
        <span class="oola-dock-brand-letter">l</span>
        <span class="oola-dock-brand-letter">a</span>
      </span>
    </button>

    <div class="oola-dock-nav">
      <ul class="oola-dock-links">
        <li v-for="page in navPages" :key="page.id">
          <button
            type="button"
            class="oola-dock-item"
            :class="{ 'is-active': activePanel === page.id }"
            :aria-label="page.title"
            :aria-current="activePanel === page.id ? 'page' : undefined"
            @click="activePanel = page.id"
          >
            <OolaIcon
              :model-id="modelId"
              :name="page.icon"
              :size="iconSize"
              :weight="activePanel === page.id ? 'bold' : 'regular'"
            />
            <span class="oola-dock-label">{{ page.title }}</span>
          </button>
        </li>
      </ul>
    </div>

    <div class="oola-dock-actions">
      <!-- Cycle button: package menu opens downward and would clip under the dock. -->
      <VdThemeSwitcher :menu="false" />
    </div>
  </nav>
</template>
