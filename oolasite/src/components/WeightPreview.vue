<script setup lang="ts">
import { computed, ref, watch } from "vue";
import OolaIcon from "./OolaIcon.vue";
import { ICONS, MODELS, WEIGHTS, type IconName } from "@/lib/catalog";

const model = MODELS[0];
const activeIcon = ref<IconName>("oola");
const filter = ref("");
const previewSize = 40;

const filteredIcons = computed(() => {
  const q = filter.value.trim().toLowerCase();
  if (!q) return ICONS.slice(0, 120);
  return ICONS.filter((n) => n.includes(q)).slice(0, 200);
});

watch(filteredIcons, (list) => {
  if (!list.includes(activeIcon.value) && list.length) {
    activeIcon.value = list[0];
  }
});
</script>

<template>
  <section id="weights" class="oola-section">
    <header class="oola-section-head">
      <h2>Icon weights</h2>
      <p>
        Six distinct weights — same glyph, preview-only transforms. Filter or
        pick a glyph.
      </p>
    </header>

    <div class="oola-weight-toolbar">
      <label class="oola-weight-label" for="oola-weight-filter">Filter</label>
      <input
        id="oola-weight-filter"
        v-model="filter"
        class="oola-weight-select"
        type="search"
        placeholder="Filter by name…"
        autocomplete="off"
      />
      <label class="oola-weight-label" for="oola-weight-icon">Glyph</label>
      <select
        id="oola-weight-icon"
        v-model="activeIcon"
        class="oola-weight-select"
        :disabled="!filteredIcons.length"
      >
        <option v-for="icon in filteredIcons" :key="icon" :value="icon">
          {{ icon }}
        </option>
      </select>
    </div>

    <p
      v-if="filter.trim() && !filteredIcons.length"
      class="oola-weight-empty"
      role="status"
    >
      No glyphs match.
    </p>

    <div v-if="filteredIcons.length" class="oola-weights-wrap">
      <div class="oola-weights" role="list">
        <div
          v-for="w in WEIGHTS"
          :key="w.id"
          class="oola-weight-item"
          role="listitem"
        >
          <OolaIcon
            :model-id="model.shortId"
            :name="activeIcon"
            :size="previewSize"
            :weight="w.id"
          />
          <p class="oola-weight-caption">
            <span class="oola-weight-name">{{ w.label }}</span>
            <code class="oola-weight-token">{{ w.token }}</code>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
