<script setup lang="ts">
import WeightPreview from "@/components/WeightPreview.vue";
import IconGrid from "@/components/IconGrid.vue";

defineOptions({ name: "OolaIconsPanel" });
</script>

<template>
  <div class="oola-page">
    <header class="oola-page-head">
      <p class="oola-eyebrow">catalog</p>
      <h1 class="oola-page-title">Icons</h1>
      <p class="oola-lede">
        Structured Phi draft catalog — six preview weights, keepers marked,
        paginated grid. Icons follow theme primary after you customize it.
      </p>
    </header>

    <WeightPreview />
    <IconGrid />
  </div>
</template>
