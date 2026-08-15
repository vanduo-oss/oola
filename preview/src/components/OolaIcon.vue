<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { isDefaultPrimary, useThemePreference } from "@vanduo-oss/vd3";
import {
  applyWeightSvg,
  hasClosedFillRegion,
  toCurrentColorSvg,
} from "@/lib/svg";
import { loadDraftSvgAsync } from "@/lib/drafts";
import { WEIGHTS, type IconName, type ModelShortId, type WeightId } from "@/lib/catalog";

const props = withDefaults(
  defineProps<{
    modelId: ModelShortId;
    name: IconName;
    size?: number;
    weight?: WeightId;
  }>(),
  { size: 32, weight: "regular" },
);

const theme = useThemePreference();
const rawSvg = ref<string | null>(null);
const loading = ref(true);

watchEffect((onCleanup) => {
  let cancelled = false;
  loading.value = true;
  loadDraftSvgAsync(props.modelId, props.name).then((svg) => {
    if (cancelled) return;
    rawSvg.value = svg;
    loading.value = false;
  });
  onCleanup(() => {
    cancelled = true;
  });
});

/** Black while primary is the theme default; otherwise follow --vd-color-primary. */
const color = computed(() =>
  isDefaultPrimary(theme.state.primary)
    ? "#000000"
    : "var(--vd-color-primary)",
);

const weightDef = computed(
  () => WEIGHTS.find((w) => w.id === props.weight) ?? WEIGHTS[0],
);

const fillOpenFallback = computed(() => {
  if (props.weight !== "fill" || !rawSvg.value) return false;
  return !hasClosedFillRegion(rawSvg.value);
});

const markup = computed(() => {
  const raw = rawSvg.value;
  if (!raw) return null;
  const w = weightDef.value;
  if (w.id === "regular") return toCurrentColorSvg(raw);
  return applyWeightSvg(raw, {
    strokeWidth: w.strokeWidth,
    fill: w.fill,
    duotone: w.duotone,
  });
});
</script>

<template>
  <span
    class="oola-icon"
    :class="{ 'oola-icon--fill-open': fillOpenFallback }"
    :style="{
      color,
      width: `${size}px`,
      height: `${size}px`,
    }"
    :aria-label="
      fillOpenFallback
        ? `${name} (fill: open-path fallback)`
        : `${name} (${weight})`
    "
    :title="fillOpenFallback ? 'Fill: open path — showing Regular outline' : undefined"
    role="img"
  >
    <span v-if="markup" class="oola-icon-svg" v-html="markup" />
    <span v-else-if="loading" class="oola-icon-missing">…</span>
    <span v-else class="oola-icon-missing">?</span>
  </span>
</template>
