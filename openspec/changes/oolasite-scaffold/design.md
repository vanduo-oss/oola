## Context

See proposal.md — Why. `preview/` already dogfoods vd3 with a top glass navbar.
vd3 1.4.0 adds Seemore Glass / float navbar, but float is top-only; bottom dock
needs custom chrome. Local sibling `perspective/vd3-docs` is the architectural
template (ViteSSG + router + unhead), not a page dump.

## Goals / Non-Goals

**Goals:**

- Standalone `oolasite/` app ready for future `oola.vanduo.dev` (base `/`)
- Published `@vanduo-oss/vd3@1.4.0` with Safe-Chain / age-gate exceptions
- Fat bottom dock as the unique visual experiment
- Port icon catalog without changing Structured Phi assets

**Non-Goals:**

- Deploy / DNS
- Full docs catalog or cbun demos
- Replacing `preview/`

## Decisions

1. **Published tarball, not `link:`** — mirrors ts-school; avoids coupling to a
   local vd3 working tree. Install with
   `--safe-chain-skip-minimum-package-age` plus
   `minimum-release-age-exclude[]=@vanduo-oss/*` in `.npmrc`.

2. **Custom `OolaDock` instead of `VdNavbar` fixed-bottom** — package float
   insets only apply to top fixed/sticky; fixed-bottom is full-bleed. Hand
   glass classes + CSS for a content-hugging pill.

3. **Theme switcher `:menu="false"`** — package menu opens below the trigger
   and would clip under the dock. Cycle button is enough. No customizer:
   greyscale only (black / grey / white).

4. **Kodchasan global type** — Google Fonts, CSS override of
   `--vd-font-family-sans` so vd3 `data-font` cannot replace it.

5. **`storagePrefix: "oola-bw-"`** — isolate from vd3-docs / preview and from
   earlier colorful `oola-` customizer keys.

6. **vite-ssg@28.3.0 patch** — drop deprecated `next()` in router guard
   (vue-router v5), same as vd3-docs / ts-school.

## Risks / Trade-offs

- [Dock covers content] → Large `padding-bottom` on main.
- [Fresh vd3 publish age-gated] → Safe-Chain skip + npmrc exclude for
  `@vanduo-oss/*`.
- [Dark primary is still `black` in vd3] → CSS override to near-white in dark.
