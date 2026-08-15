<script setup lang="ts">
import AppNavbar from "./components/AppNavbar.vue";
import WeightPreview from "./components/WeightPreview.vue";
import IconGrid from "./components/IconGrid.vue";
</script>

<template>
  <div id="top" class="oola-app">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <AppNavbar />

    <main id="main-content" class="oola-main">
      <header class="oola-hero">
        <p class="oola-eyebrow">vanduo-oss</p>
        <h1 class="oola-title">OOLA</h1>
        <p class="oola-lede">
          Structured Phi draft catalog — hand/agent 24×24 outlines (mail, house,
          search style anchors). Paginated preview; machine QA locked.
        </p>
      </header>

      <WeightPreview />
      <IconGrid />

      <section id="about" class="oola-section oola-about">
        <header class="oola-section-head">
          <h2>About this preview</h2>
          <p>
            Scaffold for the future OOLA site: glass navbar, theme switcher,
            and theme customizer from
            <code>@vanduo-oss/vd3</code>, patterned after vd3-docs.
          </p>
        </header>
        <ul class="oola-about-list">
          <li>
            Drafts:
            <code>drafts/oola-structured-phi/recraft-v4.1-pro-vector/{icon}.svg</code>
            (hand-authored Structured Phi).
          </li>
          <li>
            Historical Recraft refs: <code>drafts/references/</code>.
          </li>
          <li>
            Icons use <code>currentColor</code>: black while primary is the
            theme default; otherwise they track
            <code>--vd-color-primary</code>.
          </li>
        </ul>
      </section>
    </main>

    <footer class="oola-footer">
      <p>
        OOLA · vanduo-oss · powered by
        <a href="https://vd3.vanduo.dev/" rel="noopener">vd3</a>
      </p>
    </footer>
  </div>
</template>
