## Why

OOLA needs an experimental public site shell (future `oola.vanduo.dev`) with a
distinct look from vd3-docs — bottom dock chrome — while reusing the
existing Structured Phi icon catalog. The local `preview/` app remains for
quick draft checks; this change adds a parallel `oolasite/` experiment.

## What Changes

- Add `oolasite/` Vue 3 + vite-ssg app consuming published `@vanduo-oss/vd3@1.4.0`
- Hardened `.npmrc` with `@vanduo-oss/*` minimum-release-age exclude + Safe-Chain
  install exception for freshly published first-party packages
- Minimal routes: Home, Icons (ported catalog), About, 404
- Bottom fat glass dock with OOLA icons + theme switcher/customizer
- Root scripts `site:dev` / `site:build` / `site:preview`

Icons/models: no new glyphs or model changes — reuses existing
`drafts/oola-structured-phi/recraft-v4.1-pro-vector/` catalog.

## Non-goals

- GitHub Pages / CNAME / DNS for `oola.vanduo.dev`
- Deleting or replacing `preview/`
- Full vd3-docs page catalog, sidebar, search, or `@vanduo-oss/vd3-cbun`
- Publishing `@vanduo-oss/oola` as an npm package

## Capabilities

### New Capabilities

- `oolasite`: experimental site shell — routes, bottom dock chrome, vd3 theming
- `oolasite-icons`: icon catalog page ported from preview (weights, pagination, keepers)

### Modified Capabilities

- `icon-preview`: vd3-shell requirement may be satisfied by either the existing
  top glass navbar (`preview/`) or the new bottom dock (`oolasite/`) — theme
  switcher and customizer MUST remain available

## Impact

- New directory `oolasite/` with its own pnpm lockfile and node_modules
- Root `package.json` scripts and `.gitignore` entries
- Dependency on published `@vanduo-oss/vd3@1.4.0` (not a local `link:`)
