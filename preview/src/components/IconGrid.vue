<script setup lang="ts">
import { computed, ref, watch } from "vue";
import OolaIcon from "./OolaIcon.vue";
import OolaAnimatedIcon from "./OolaAnimatedIcon.vue";
import {
  BATCH_100,
  ICONS,
  MODELS,
  PAGE_SIZE,
  SIZES,
  WEIGHTS,
  isBatch100,
  isKeeper,
} from "@/lib/catalog";

const activeSize = ref<(typeof SIZES)[number]>(24);
const page = ref(1);
const reviewScope = ref<"all" | "batch-100">("batch-100");
const model = MODELS[0];

const scopedIcons = computed(() =>
  reviewScope.value === "batch-100" ? [...BATCH_100] : [...ICONS],
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(scopedIcons.value.length / PAGE_SIZE)),
);

const pageIcons = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return scopedIcons.value.slice(start, start + PAGE_SIZE);
});

watch(reviewScope, () => {
  page.value = 1;
});

function go(delta: number) {
  page.value = Math.min(totalPages.value, Math.max(1, page.value + delta));
}
</script>

<template>
  <section id="drafts" class="oola-section">
    <header class="oola-section-head">
      <h2>Hand-authored drafts</h2>
      <p>
        Structured Phi outline icons — {{ ICONS.length }} true 24×24 SVGs.
        Keepers (<code>mail</code>, <code>house</code>, <code>search</code>,
        <code>layout-grid</code>) mark the style anchors. Default view is the
        quality-locked Batch 100 for review; switch to All for the full catalog.
        Paginated {{ PAGE_SIZE }} / page; six weights plus a Light-based motion
        preview.
      </p>
    </header>

    <div class="oola-size-bar" id="sizes">
      <span class="oola-size-label">Preview size</span>
      <div class="oola-size-group" role="group" aria-label="Icon preview size">
        <button
          v-for="s in SIZES"
          :key="s"
          type="button"
          class="oola-size-btn"
          :class="{ 'is-active': activeSize === s }"
          @click="activeSize = s"
        >
          {{ s }}px
        </button>
      </div>
      <div
        class="oola-size-group"
        role="group"
        aria-label="Catalog review scope"
      >
        <button
          type="button"
          class="oola-size-btn"
          :class="{ 'is-active': reviewScope === 'batch-100' }"
          @click="reviewScope = 'batch-100'"
        >
          Batch 100
        </button>
        <button
          type="button"
          class="oola-size-btn"
          :class="{ 'is-active': reviewScope === 'all' }"
          @click="reviewScope = 'all'"
        >
          All {{ ICONS.length }}
        </button>
      </div>
      <div class="oola-pager" role="navigation" aria-label="Icon page">
        <button
          type="button"
          class="oola-size-btn"
          :disabled="page <= 1"
          @click="go(-1)"
        >
          Prev
        </button>
        <span class="oola-size-label"
          >Page {{ page }} / {{ totalPages }} ({{ pageIcons.length }} shown)</span
        >
        <button
          type="button"
          class="oola-size-btn"
          :disabled="page >= totalPages"
          @click="go(1)"
        >
          Next
        </button>
      </div>
    </div>

    <div class="oola-grid-wrap">
      <table class="oola-grid oola-grid--weights">
        <thead>
          <tr>
            <th scope="col">Icon</th>
            <th v-for="w in WEIGHTS" :key="w.id" scope="col">
              {{ w.label }}
              <div class="oola-model-slug">{{ w.token }}</div>
            </th>
            <th scope="col">
              Motion
              <div class="oola-model-slug">.oola-motion</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="icon in pageIcons" :key="icon">
            <th scope="row">
              <code>{{ icon }}</code>
              <span v-if="isKeeper(icon)" class="oola-keeper-badge">keeper</span>
              <span
                v-else-if="isBatch100(icon)"
                class="oola-batch-badge"
                >batch</span
              >
            </th>
            <td v-for="w in WEIGHTS" :key="`${icon}-${w.id}`">
              <div class="oola-cell">
                <OolaIcon
                  :model-id="model.shortId"
                  :name="icon"
                  :size="activeSize"
                  :weight="w.id"
                />
              </div>
            </td>
            <td>
              <div class="oola-cell oola-cell--motion">
                <OolaAnimatedIcon
                  :model-id="model.shortId"
                  :name="icon"
                  :size="activeSize"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
