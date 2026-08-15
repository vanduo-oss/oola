## Context

OOLA drafts previously compared three freeform styles. Structured Phi replaces that with one outline system; preview compares Recraft Vector vs Pro Vector quality.

## Goals / Non-Goals

**Goals**
- Spec-driven Structured Phi language
- 20 smoke SVGs (10 icons × 2 models)
- VD3 preview with model columns and theme-aware color

**Non-Goals**
- Filled variant, full catalog generation, production packaging

## Decisions

1. **Single style, dual models** — Style columns caused metaphor drift; model columns answer “which Recraft tier is good enough?”
2. **Output path** — `drafts/oola-structured-phi/{short-model-id}/{name}.svg` where short ids are `recraft-v4.1-vector` and `recraft-v4.1-pro-vector`.
3. **Identical prompts** — Same Structured Phi prompt for both models so differences are model capability, not prompt drift.
4. **Native SVG only** — OpenRouter currently exposes Recraft `*-vector` as the SVG-capable family; skip raster models.

## Risks / Trade-offs

- Recraft may still warp geometry; mitigate with tight prompts + per-icon retries.
- Pro Vector is ~3.75× cost; acceptable for a 10-icon A/B.

## Migration

Delete old `drafts/{outline_default,outline_bold,filled}/` and multi-style preview catalog entries before regen.
