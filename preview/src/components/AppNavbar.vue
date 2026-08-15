<script setup lang="ts">
import { ref } from "vue";
import {
  useNavbarGlassScroll,
  VdThemeCustomizer,
  VdThemeSwitcher,
} from "@vanduo-oss/vd3";

const navRef = ref<HTMLElement | null>(null);
const isScrolled = useNavbarGlassScroll(navRef);
const menuOpen = ref(false);

const links = [
  { label: "Drafts", href: "#drafts" },
  { label: "Sizes", href: "#sizes" },
  { label: "About", href: "#about" },
];

const toggleMenu = (): void => {
  menuOpen.value = !menuOpen.value;
};
const closeMenu = (): void => {
  menuOpen.value = false;
};
</script>

<template>
  <nav
    ref="navRef"
    class="vd-navbar vd-navbar-fixed vd-navbar-glass vd-glass-contrast oola-navbar"
    :class="{ 'vd-navbar-scrolled': isScrolled }"
  >
    <div class="vd-navbar-container">
      <div class="vd-navbar-brand">
        <a href="#top" class="vd-navbar-brand-link" @click="closeMenu">
          <span class="oola-brand-mark" aria-hidden="true">○</span>
          <span class="oola-brand-text">
            <span class="oola-brand-name">OOLA</span>
            <span class="oola-brand-sub">icon drafts</span>
          </span>
        </a>
      </div>

      <div class="navbar-actions-always">
        <VdThemeCustomizer :show-palette="false" />
        <VdThemeSwitcher align="end" />
      </div>

      <button
        type="button"
        class="vd-navbar-toggle"
        aria-label="Toggle navigation"
        :aria-expanded="menuOpen"
        @click="toggleMenu"
      >
        <span></span><span></span><span></span>
      </button>

      <div class="vd-navbar-menu" :class="{ 'is-open': menuOpen }">
        <ul class="vd-navbar-nav">
          <li v-for="link in links" :key="link.href">
            <a
              :href="link.href"
              class="vd-nav-link"
              @click="closeMenu"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
