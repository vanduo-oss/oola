<script setup lang="ts">
import { useOolaPanel } from "@/panel";
import { reopenWelcome } from "@/lib/welcome";

defineOptions({ name: "OolaAboutPanel" });

const activePanel = useOolaPanel();
</script>

<template>
  <section class="oola-page oola-about-page">
    <header class="oola-page-head">
      <p class="oola-eyebrow">vanduo-oss</p>
      <h1 class="oola-page-title">About OOLA</h1>
      <p class="oola-lede">
        Lithuanian <em>ūla</em> — a gust of wind or rain. Vanduo means water.
        OOLA is the icon set for the Vanduo OSS family. The logotype is the
        Macron U — a soft U-bowl with a short bar.
      </p>
    </header>

    <div class="oola-prose">
      <h2>Structured Phi</h2>
      <p>
        True <code>24×24</code> outlines:
        <code>stroke-width="1.5"</code>, round caps and joins,
        <code>currentColor</code>, soft ~2–3px corners. Primary / secondary /
        tertiary sizes follow the golden ratio (~12.4 / ~7.6 / ~4.7).
      </p>
      <p>
        The style is industry-conventional geometry, φ proportions, and
        original path data.
      </p>

      <h2>Keepers</h2>
      <p>
        <code>mail</code>, <code>house</code>, and <code>search</code> are the
        frozen style anchors. New drafts must match their language to join the
        catalog.
      </p>

      <h2>This site</h2>
      <p>
        An experiment shell for
        <a href="https://oola.vanduo.dev/">oola.vanduo.dev</a>, built on
        <a href="https://vd3.vanduo.dev/" rel="noopener">@vanduo-oss/vd3</a>
        with a bottom dock instead of a top glass navbar. The older
        local preview under <code>preview/</code> is still around for quick
        draft checks.
      </p>
      <p>
        <button type="button" class="oola-welcome-reopen" @click="reopenWelcome">
          Show the welcome note again
        </button>
      </p>

      <p>
        <button
          type="button"
          class="vd-btn vd-btn-primary"
          @click="activePanel = 'icons'"
        >
          Open the icon catalog
        </button>
      </p>
    </div>
  </section>
</template>
