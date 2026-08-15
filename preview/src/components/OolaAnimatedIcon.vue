<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { isDefaultPrimary, useThemePreference } from "@vanduo-oss/vd3";
import { applyWeightSvg } from "@/lib/svg";
import { loadDraftSvgAsync } from "@/lib/drafts";
import { motionFamilyFor } from "@/lib/motion";
import { WEIGHTS, type IconName, type ModelShortId } from "@/lib/catalog";

const LIGHT = WEIGHTS.find((w) => w.id === "light")!;

const props = withDefaults(
  defineProps<{
    modelId: ModelShortId;
    name: IconName;
    size?: number;
  }>(),
  { size: 32 },
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

/** Same theme paint as static OolaIcon: black on default primary, else --vd-color-primary. */
const color = computed(() =>
  isDefaultPrimary(theme.state.primary)
    ? "#000000"
    : "var(--vd-color-primary)",
);

const family = computed(() => motionFamilyFor(props.name));

/** Always Light weight as the animation source. */
const markup = computed(() => {
  const raw = rawSvg.value;
  if (!raw) return null;
  return applyWeightSvg(raw, {
    strokeWidth: LIGHT.strokeWidth,
    fill: LIGHT.fill,
    duotone: LIGHT.duotone,
  });
});
</script>

<template>
  <span
    class="oola-icon oola-icon--motion"
    :data-motion="family"
    :style="{
      color,
      '--oola-icon-size': `${size}px`,
      width: `${size}px`,
      height: `${size}px`,
    }"
    :aria-label="`${name} (light, motion)`"
    role="img"
  >
    <span v-if="markup" class="oola-icon-svg" v-html="markup" />
    <span v-else-if="loading" class="oola-icon-missing">…</span>
    <span v-else class="oola-icon-missing">?</span>
  </span>
</template>
