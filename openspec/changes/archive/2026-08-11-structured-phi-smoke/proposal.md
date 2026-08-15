## Why

The first multi-style smoke batch (`outline_default` / `outline_bold` / `filled`) produced inconsistent geometry across columns. OOLA needs a single Structured Phi outline language, with draft comparison across Recraft SVG models — not freeform style variants.

## What Changes

- **BREAKING**: Remove the three freeform style draft folders and comparison UI
- Encode Structured Phi + generation + preview rules in OpenSpec main specs
- Rewrite prompts/generator for `oola-structured-phi` only
- Generate each of 10 smoke icons with both `recraft/recraft-v4.1-vector` and `recraft/recraft-v4.1-pro-vector`
- Preview shows 10×2 model columns (Vector | Pro Vector)

## Capabilities

### New Capabilities

- `structured-phi`: canvas, stroke, phi tokens, modifiers, QA checklist
- `icon-generation`: dual Recraft vector generation, prompt embedding, manifest/auth
- `icon-preview`: VD3 model-comparison grid and theme-aware icon color

### Modified Capabilities

- (none — first OpenSpec adoption in this repo)

## Impact

- `drafts/`, `prompt-templates.json`, `scripts/generate-drafts.mjs`, `preview/`
- OpenRouter spend ≈ 10×($0.08+$0.30) for the smoke batch

## Non-goals

- No `oola-filled` generation
- No full 464-core queue
- No SVGO packaging / npm publish
- No raster→SVG tracing of non-Recraft models
