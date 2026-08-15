<script setup lang="ts">
import { nextTick, watch } from "vue";
import { useWelcomeModal } from "@/lib/welcome";

defineOptions({ name: "OolaWelcomeModal" });

const GITHUB_URL = "https://github.com/vanduo-oss/oola";
const BMC_URL = "https://www.buymeacoffee.com/nostromo618";
const qrSrc = `${import.meta.env.BASE_URL}bmc-qr.png`;

const HEADLINE = "ūla is still being drawn";
const LEDE =
  "OOLA is unfinished — a Structured Phi icon set from Vanduo OSS. The marks and this site are still being drawn in the open. You're welcome to look around.";
const SUPPORT =
  "If you'd like to support the work, a GitHub star or a coffee is plenty.";

const { welcomeOpen, dismissWelcome } = useWelcomeModal();

watch(welcomeOpen, async (open) => {
  if (!open || typeof document === "undefined") return;
  await nextTick();
  const panel = document.querySelector<HTMLElement>(".oola-welcome-dialog");
  panel?.focus();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="welcomeOpen"
      class="oola-welcome-backdrop"
      @click="dismissWelcome"
    />
  </Teleport>
  <Teleport to="body">
    <div
      v-if="welcomeOpen"
      class="oola-welcome-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oola-welcome-title"
      tabindex="-1"
    >
      <header class="oola-welcome-header">
        <h2 id="oola-welcome-title" class="oola-welcome-title">
          {{ HEADLINE }}
        </h2>
        <button
          type="button"
          class="oola-welcome-close"
          aria-label="Close"
          @click="dismissWelcome"
        >
          ×
        </button>
      </header>

      <div class="oola-welcome-body">
        <div class="oola-welcome-layout">
          <div class="oola-welcome-copy">
            <p class="oola-lede oola-welcome-lede">{{ LEDE }}</p>
            <p class="oola-welcome-support">{{ SUPPORT }}</p>
            <div class="oola-welcome-actions">
              <a
                class="vd-btn vd-btn-outline vd-btn-lg"
                :href="GITHUB_URL"
                target="_blank"
                rel="noopener noreferrer"
              >
                Star on GitHub
              </a>
              <a
                class="vd-btn vd-btn-lg oola-bmc-btn"
                :href="BMC_URL"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy me a coffee
              </a>
            </div>
          </div>
          <a
            class="oola-welcome-qr"
            :href="BMC_URL"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="qrSrc"
              width="220"
              height="220"
              alt="QR code for Buy Me a Coffee — support OOLA"
            />
          </a>
        </div>
      </div>

      <footer class="oola-welcome-footer">
        <button
          type="button"
          class="vd-btn vd-btn-primary vd-btn-lg"
          @click="dismissWelcome"
        >
          I'll look around
        </button>
      </footer>
    </div>
  </Teleport>
</template>
