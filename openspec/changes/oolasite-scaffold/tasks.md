## 1. Toolchain

- [x] 1.1 Create `oolasite/` with hardened `.npmrc` (`minimum-release-age-exclude[]=@vanduo-oss/*`)
- [x] 1.2 Add `pnpm-workspace.yaml` + `patches/vite-ssg@28.3.0.patch`
- [x] 1.3 Install `@vanduo-oss/vd3@1.4.0` and app deps with `--safe-chain-skip-minimum-package-age`

## 2. Site shell

- [x] 2.1 ViteSSG bootstrap (`main.ts`, `App.vue`, `router.ts`, `nav.ts`, `index.html`, `vite.config.ts`, `tsconfig.json`)
- [x] 2.2 Pages: home, icons, about, not-found
- [x] 2.3 `storagePrefix: "oola-"` and black/nunito theme defaults

## 3. Icon catalog

- [x] 3.1 Port preview components/lib/data into `oolasite/src/`
- [x] 3.2 Wire `/icons` to WeightPreview + IconGrid with drafts glob + fs.allow

## 4. Bottom dock

- [x] 4.1 Implement `OolaDock.vue` (fat, round, bottom, OOLA icons)
- [x] 4.2 Cycle `VdThemeSwitcher` + upward `VdThemeCustomizer` fork
- [x] 4.3 Dock + catalog styles in `src/styles/app.css`

## 5. Repo glue

- [x] 5.1 Root scripts `site:dev` / `site:build` / `site:preview`
- [x] 5.2 `.gitignore` for `oolasite/dist` and `node_modules`
- [x] 5.3 Update `openspec/config.yaml` stack line
- [x] 5.4 Verify `pnpm run typecheck` and `pnpm run build` in `oolasite/`
