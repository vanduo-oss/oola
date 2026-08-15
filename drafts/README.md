# OOLA Structured Phi drafts

Smoke batch: **10 hand-authored** `24×24` outline icons (Structured Phi). No OpenRouter calls for this set.

| Role | Icons |
|---|---|
| Style anchors (historical Recraft refs in [`references/`](references/)) | `mail`, `house`, `search` |
| Full set (hand) | search, house, user, cog, heart, star, plus, trash, mail, bell |

Output folder (legacy name): `oola-structured-phi/recraft-v4.1-pro-vector/` — content is hand SVG, not Recraft.

## Spec

- `viewBox="0 0 24 24"`
- `stroke-width="1.5"`, round caps/joins, `currentColor`
- `fill="none"`

## Preview

```bash
npm run preview:dev
```

## Optional later API regen

OpenRouter Pro Vector remains available via `npm run generate:drafts` for experimentation, but the smoke set source of truth is hand-authored until QA passes.
